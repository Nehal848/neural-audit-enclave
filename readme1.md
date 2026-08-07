# Hospital AI Ecosystem — System Spec (v2, DEMO BUILD)
### On-Premise AI Healthcare Platform — Demo Architecture & Build Reference

> **Purpose of this document:** This is the reference spec for building the **demo version** of this platform. It describes the exact workflows to implement, with **mocked/fake data standing in for real hospital systems**. Treat every "STEP" as an implementation checkpoint. Where a real deployment would need something the demo doesn't (live PACS connection, real CDSCO submission, etc.), that's called out explicitly so nothing gets half-built by accident.

---

## 0. Demo Scope — Read This First

This build simulates the **full end-to-end flow** with realistic logic, but:

- **No real hospital integration.** PACS, EHR/HL7-FHIR, and vendor model APIs are all **mocked** — sample DICOM files, sample FHIR/HL7 payloads, and stub vendor endpoints stand in for the real thing.
- **No real patient data anywhere.** All patient records, scans, and lab values are synthetic/fake, generated or seeded by the app itself.
- **No real regulatory submission.** The "governing body approval" step is a UI/workflow action (an approve/reject button by a demo "reviewer" role) — not an actual CDSCO filing.
- **Gemini API is real** (this is the one genuinely external call in the demo), but every payload sent to it is already synthetic, so there's no real PHI exposure risk. We still implement the full de-identification pipeline (Section 4) because **that pipeline itself is part of what the demo needs to show** — it's a core selling point, not a formality.
- Everything in this doc is written so that swapping mocks for real integrations later (real PACS, real CDSCO workflow, real hospital data) is a **configuration change, not a rebuild.** Keep mock/real behind interfaces, not hardcoded.

---

## 1. Phase 1 — Model Marketplace (Approved Vendor Models)

### 1.1 What Phase 1 actually is

Phase 1 offers hospitals pre-built, already-approved AI models from established vendors (e.g., Qure.ai-type providers) for common diagnostic tasks — pneumonia detection, tumor triage, etc. The platform doesn't build or own these models; it integrates and packages them.

**Positioning (use this language in the demo's pitch screens / talking points):**

> The model isn't ours, correct — and we're not hiding that. The hard part is what sits around it: one login instead of five vendor logins, one report format instead of five, comparative doctor-feedback data across every model a hospital uses (which no single point-solution vendor can see), and the compliance packaging (on-prem, CDSCO-classification-aware) that most point solutions don't bother with. Phase 1 is deliberately the low-risk, fast front door — Phase 2 is where our actual IP lives.

For the demo: build 2–3 **mock vendor models** (e.g., "PneumoScan," "TumorTriage") as stub services returning realistic sample outputs, so the marketplace UI, scope gate, and unified report layer all have something real to run against.

### 1.2 Licensing Scope Re-Verification (build the logic, mock the data)

Even in a demo, this is worth building properly — it's a differentiator, and it's simple logic once the data model exists.

A vendor's approval is bounded by three axes:

| Axis | Example | What happens if ignored |
|---|---|---|
| **Indication** | Approved for pneumonia detection only | Using it for "possible lung cancer" = unapproved use |
| **Population** | Validated on adults 18+ | Running on pediatric scans = unapproved use |
| **Input format** | Trained on DICOM chest X-ray, PA view only | Feeding it a CT slice = unapproved use |

**Demo implementation steps:**

1. **STEP 1 — Mock Vendor Scope Records.** For each mock vendor model, seed a scope record: `indication`, `population` (age range), `input_format` (modality/view). This is just a JSON/DB row, not a real vendor integration.
2. **STEP 2 — Runtime Scope Gate.** Before routing a (mocked) case to a vendor model, check the case's mocked metadata (patient age, modality tag) against the scope record. If it fails, block and show: *"This model is not approved for this input type/population — result not generated."* This is a real, working check even though the data behind it is fake.
3. **STEP 3 — Revalidation (stub only).** Include a "last verified" timestamp field and a manual "re-verify" button in the admin UI — no real cron job hitting a real vendor API needed for demo.
4. **STEP 4 — Audit Trail.** Log every inference attempt with model, scope record version, and pass/fail. This is genuinely useful to show live in a demo ("look, it just blocked an out-of-scope request").

### 1.3 Integration Architecture (mocked)

**Positioning (use this language when explaining the architecture):**

> We don't talk to the scanner — no vendor in this space does. Every scanner already exports through DICOM (Digital Imaging and Communications in Medicine) into the hospital's PACS (Picture Archiving and Communication System), the image-management software every radiology department already runs. We integrate with that software layer, plus HL7/FHIR for clinical records. It's a standardized software integration, not a hardware build.

**Demo implementation steps:**

1. **STEP 1 — Mock PACS.** Instead of a live PACS connection, load a small set of sample DICOM files (publicly available anonymized sample DICOMs work fine) from local storage, exposed through a stub service that mimics a DICOMweb (QIDO-RS/WADO-RS) response shape. This keeps the integration code shaped like the real thing.
2. **STEP 2 — Mock EHR.** Same idea — a stub FHIR endpoint serving fake patient/encounter resources, so the app's FHIR client code is real, just pointed at fake data.
3. **STEP 3 — Metadata Extraction.** Pull modality, view, patient age/sex from the mock DICOM headers — same code path that would run against real files.
4. **STEP 4 — Routing.** Scope-gate, then route to the mock vendor model endpoint.

---

## 2. Phase 2 — AutoML with Shadow Mode + RLHF

### 2.1 The flow being demoed

Hospital "trains" a model on (fake) uploaded data → it runs silently in the background (**shadow mode**) → gets refined via a simulated **RLHF** review loop → once it crosses a defined threshold, it goes to a **governing body approval** step (a demo reviewer role clicking approve/reject) → only then does it become visible to doctors.

This is the part of the platform worth demoing in most depth — it's the actual differentiator.

### 2.2 Pipeline Steps 1–7 (mocked data, real logic)

Same as the original design, run against fake data:
1. Data upload (seed with a synthetic sample dataset, e.g., fake tabular records or fake image set for one "disease")
2. Data profiling/validation (real thresholds — e.g., reject if <50 rows, >75% missing — running against the fake dataset)
3. Mandatory manual input — target column selection, "PHI removal" step (can be a no-op confirmation checkbox since data is already synthetic, but show the UI step since it's core to the pitch)
4. Data cleaning/conversion (can genuinely call Gemini here for a "cleaning suggestions" text output, since input is synthetic — no real risk)
5. Human verification / data quality score (compute a real, simple quality score against the fake dataset)
6. Problem detection (real logic — classification vs. regression detection based on target column type)
7. AutoML pipeline (can be a real lightweight AutoML run — e.g., scikit-learn on the synthetic dataset — so the demo shows genuine train/test split + algorithm comparison, not just a canned result)

### 2.3 Shadow Mode + RLHF + Approval Gate (Steps 8–13)

**STEP 8 — Explainability Report.** Real output from the actual (small, synthetic-data) model trained in Step 7: accuracy, F1, feature importance, sample predictions.

**STEP 9 — Shadow Deployment.** The trained candidate model runs against a rolling set of (fake) incoming cases, logging predictions that are **not shown** in the doctor's UI. Build this as a real background job, even on fake data — this is the mechanic worth demoing.

**STEP 10 — RLHF Refinement Loop.** A "review panel" role (can just be a second demo user account with a "reviewer" flag) sees a queue of shadow predictions and scores/labels them. Feed this feedback into a simple retrain step. Log each retrain event (trigger, data used, metric delta) — this log is itself a demo-worthy screen.

**STEP 11 — Threshold Check.** Define a simple numeric threshold (e.g., accuracy ≥ 80% over ≥ 20 reviewed cases — small numbers are fine for demo purposes). Automated check flags the candidate as "eligible for approval" once crossed.

**STEP 12 — Governing Body Approval (demo version).** A reviewer-role user sees the packaged explainability report + shadow performance + RLHF log + threshold result, and clicks **Approve** or **Reject**. This is a real workflow action in the demo — just not a real regulatory filing.

**STEP 13 — Deployment.** Once approved, the model flips to visible/active and appears in "My Model" and to doctor users. This flag flip is the single source of truth for doctor-side visibility (see Section 3).

---

## 3. Doctor-Side Visibility Rule

A model — vendor (Phase 1) or hospital-trained (Phase 2) — only reaches the doctor's UI if it currently has an `active/approved` flag set by the respective gate (scope gate for Phase 1, governing-body approval for Phase 2). Build this as **one shared flag/service** consumed by both pipelines, not two separate mechanisms — this keeps the demo consistent and makes the "real" version later a drop-in.

---

## 4. Gemini API — De-identification, Report Generation & Evidence

This is real in the demo (genuinely calling the Gemini API), because it's a core feature to show. The data going into it is synthetic, but **build the full de-identification pipeline anyway** — it's one of the platform's actual selling points and worth demonstrating live (e.g., show a "before/after" of a payload with identifiers stripped).

### 4.1 What Gemini generates
- Report prose (turns structured model output into a doctor-readable report)
- The "why" (evidence) and "how" (reasoning) narrative sections

### 4.2 What Gemini never receives
- Patient name, MRN, DOB, address, contact info (even fake ones — treat the pipeline exactly as if the data were real, for demo fidelity)
- Raw images/scans
- Any field not explicitly whitelisted

### 4.3 Exact Steps

1. **STEP 1 — Structured Extraction.** Pull only what's needed for report language: finding, confidence score, evidence points, model name/version.
2. **STEP 2 — Identifier Stripping / Re-tokenization.** Replace name/MRN/DOB/etc. with an internal case token (e.g., `CASE-8841X`); run a PHI-detection pass (regex/NER) over any free-text fields as a safety net. Log what was stripped.
3. **STEP 3 — Minimum Necessary Check.** Only send the fields the prompt needs — don't forward the whole case object.
4. **STEP 4 — API Call.** Send the de-identified payload to Gemini with a system prompt constrained to generating report prose + evidence/reasoning narrative from the given structured fields only — no inferred clinical claims beyond the input.
5. **STEP 5 — Response Re-linking.** Map the generated text back to the case using the internal token → (fake) patient mapping.
6. **STEP 6 — Local Fallback (optional for demo).** A toggle to swap Gemini for a canned/template response, useful for offline demo scenarios where internet access isn't guaranteed.

---

## 5. Regulatory Notes (trimmed — production concern, not demo blocker)

The demo does **not** need to satisfy real regulatory requirements, but the architecture is intentionally built so it *could* later:

- Real deployment would require CDSCO SaMD classification (Class A–D) per India's medical device software framework, with vendor scope records (Sec 1.2) tied to actual license numbers.
- Real deployment would require the Phase 2 shadow-mode/RLHF audit log (Sec 2.3) to double as formal change-management documentation.
- Real patient data would require a full DPDP-Act-compliant de-identification and cross-border transfer review before any Gemini-style external call — the pipeline in Section 4 is a head start on that, not a substitute for it.

Keep these as a comment/README note in the codebase, not something the demo build needs to actively satisfy.

---

## 6. `.env` Configuration Reference (Demo)

```env
# ── Core App ──────────────────────────────────────────────
APP_ENV=demo
APP_URL=
SESSION_SECRET=
DEMO_MODE=true                         # gates all mock-vs-real integration switches below

# ── Database ───────────────────────────────────────────────
DB_HOST=
DB_PORT=
DB_NAME=
DB_USER=
DB_PASSWORD=

# ── Auth / OTP ─────────────────────────────────────────────
OTP_PROVIDER=                          # can stub/log OTP to console for demo instead of real SMS/email
OTP_SENDER_EMAIL=
OTP_SMS_API_KEY=
JWT_SECRET=

# ── Mock PACS / DICOM ──────────────────────────────────────
MOCK_PACS_DATA_PATH=./mock-data/dicom  # local sample DICOM files
MOCK_DICOMWEB_ENABLED=true

# ── Mock EHR / FHIR ────────────────────────────────────────
MOCK_FHIR_DATA_PATH=./mock-data/fhir   # local sample FHIR resources
MOCK_FHIR_ENABLED=true

# ── Phase 1: Vendor Model Registry (mocked) ───────────────
MOCK_VENDOR_MODELS_PATH=./mock-data/vendor-models   # scope records + stub inference responses
VENDOR_SCOPE_GATE_MODE=block           # block | warn (recommend: block, even in demo)

# ── Phase 2: AutoML / Shadow Mode / RLHF ──────────────────
AUTOML_SEED_DATASET_PATH=./mock-data/training-set    # synthetic training data
SHADOW_MODE_LOG_RETENTION_DAYS=30
RLHF_REVIEWER_ROLE=demo_reviewer
MODEL_PROMOTION_THRESHOLD_ACCURACY=0.80
MODEL_PROMOTION_MIN_SAMPLE_SIZE=20

# ── Gemini API (real — used for report generation) ────────
GEMINI_API_KEY=
GEMINI_MODEL=
GEMINI_ENABLED=true
GEMINI_MAX_TOKENS=1024
PHI_DETECTION_MODE=block_and_alert     # block_and_alert | block_and_fallback
LOCAL_FALLBACK_ENABLED=false           # set true for offline-demo canned responses

# ── Audit Logging ──────────────────────────────────────────
AUDIT_LOG_STORAGE_PATH=./logs/audit
```

---

## 7. Build Checklist (Demo Scope)

- [ ] Seed synthetic patient/case dataset (fake names, fake MRNs — clearly marked as test data)
- [ ] Build 2–3 stub Phase 1 vendor models with scope records + sample outputs
- [ ] Implement scope gate (Sec 1.2) as real, working logic against mock data
- [ ] Build mock PACS/DICOM and mock FHIR stub services
- [ ] Build Phase 2 pipeline Steps 1–7 against a synthetic training dataset (real lightweight AutoML run is worth it for demo credibility)
- [ ] Build shadow-mode background job + reviewer-role RLHF labeling queue
- [ ] Build threshold check + approve/reject governing-body workflow screen
- [ ] Wire the single shared "active/approved" flag controlling doctor-side visibility
- [ ] Build full de-identification pipeline (Sec 4) even though data is synthetic — this is a demo centerpiece
- [ ] Wire real Gemini API call for report/evidence generation
- [ ] Add "before/after" de-identification view somewhere in the demo UI — strong visual proof point
- [ ] Get a real Gemini API key set in `.env` before demo day