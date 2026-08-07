

Hospital AI Ecosystem

On-Premise AI Healthcare Platform

System Overview & Workflow Document

This document describes the complete design, features, and step-by-step workflow of the platform, covering both the doctor-facing side and the hospital-facing side of the system.



Table of Contents



1. Introduction

The Hospital AI Ecosystem is an on-premise, AI-powered healthcare platform designed mainly for hospitals, laboratories, and doctors. It focuses on disease prediction, report analysis, and integration with various laboratory and medical imaging systems.

The goal of the platform is to reduce the workload of doctors by automatically analyzing patient reports and predicting diseases using AI models.

The entire system runs on the hospital's own server infrastructure. Because the system is fully on-premise, there is no privacy risk or data-sharing concern for the hospital.

There are two main phases (models) in the overall system:

Phase 1 — Licensed pre-trained AI models (provided by the platform).

Phase 2 — Hospital-owned AutoML platform (models that hospitals build themselves using their own data).

2. Platform Access & Landing Dashboard

When a user first opens the site, they land on a general dashboard showing the platform's features, costing, benefits, and other introductory information.

From this landing page, the user can access a Sign In / Sign Up option. This option is available for two categories of users:

Hospital / Admin

Doctor

3. Registration and Sign-In

3.1 New Doctor Registration

If a doctor has never visited the platform before, they must sign up by providing the following information:

Full name

Medical registration / license number

State or country of registration

Hospital email / clinic email

Hospital name

Password and confirm password

Phone number

After submitting these details, an OTP (One-Time Password) is generated and sent to the doctor's email. Once the OTP is entered correctly, the doctor becomes an authorized user.

Note: The system checks whether the submitted license number is valid before authorizing the account.

3.2 New Hospital Registration

If a hospital is registering for the first time, it must provide the following information:

Hospital name

Hospital address

Registration number

Admin details

Other mandatory details required to confirm that the hospital is an authorized entity

Official email address

Phone number

Password

An OTP is then generated for verification. This process validates and authorizes the hospital account.

3.3 Hospitals Adding Doctors

Hospitals can add doctors directly to the platform. However, even after a hospital adds a doctor, that doctor still needs to complete their own sign-in process in order to become a registered user.

3.4 Returning (Pre-Registered) Doctor Sign-In

If a doctor is already a pre-registered user, sign-in is simplified. The doctor only needs to provide:

Password

License number

An OTP is then generated to complete the sign-in.

3.5 Returning (Pre-Registered) Hospital Sign-In

If a hospital is already a pre-registered user, sign-in only requires:

Registration number

Password

An OTP is then generated to complete the sign-in.

4. Doctor Side of the Platform

Once a doctor signs in, they see a set of six side-panel (sidebar) sections:



4.1 Dashboard

The doctor's dashboard displays:

Patient alerts — indicating which patients are at higher risk for a given disease (for example, cancer or pneumonia). If a patient shows a clinically high probability (e.g., 98% chance), this is flagged as a clinically high alert. Patients are shown here even at a 50% chance.

Analysis and reports of patients, displayed as short summary cards.

AI models currently in use and their status — for example, a pneumonia detection model, a cancer detection model, or a blood tumor detection model — showing whether each is active, along with its accuracy and version.

Recent patients that have been added to the system.

New uploads from laboratory and imaging systems — for example, 8 new reports from the MRI system, 9 from the CT scan system, and 10 from EHR, ECG, PACS, and other sources.

A patient search function.

AI performance indicators: confidence score, doctor agreement percentage, and average analysis time.

4.2 Analysis and Reports

This section shows, for each patient:

Patient name.

Data source — which system the data came from (e.g., MRI or CT scan).

Which AI model was run on that data.

Which models were skipped, and the reason why.

Status and time of the analysis.

The report itself includes:

The confidence score of the model regarding the patient's health.

The key finding.

The "why" — supporting evidence behind the finding.

The "how" — i.e., the reasoning/analysis behind the alert.

4.3 Models

This section shows the models currently in use, along with their performance, status, and type. Doctors can also submit feedback on a specific model.

Note: Example given: a doctor may leave feedback on a pneumonia model stating that it is giving 100% accuracy across all their results, confirming the model is performing well.

4.4 Patients

In this section, doctors can:

Search for a patient.

Add a new patient.

View recent patients along with their available data, reports, and analysis.

4.5 Laboratory and Imaging

This section shows new uploads coming in from the following sources: MRI, CT scan, X-ray, blood report, pathology report, ECG, CIS, EMR, and EHR.

For each source, the doctor can see:

Connection status (connected, active, in use).

Any findings or errors.

Anything that could affect how data is coming in from that source.

4.6 Settings

Standard account and platform settings for the doctor.

4.7 Scope of the Doctor Side

The doctor side of the platform is designed to help doctors identify what a patient might currently have, and why — through an AI-generated report. It does not provide treatment recommendations or advice on how to reduce or manage the condition. In this way, AI integration assists the doctor purely with identification and analysis, not treatment guidance.

5. Hospital Side of the Platform

The hospital side is where Phase 1 and Phase 2 of the platform come together. Once signed in as a hospital, there are seven sections in the side panel:



5.1 Dashboard

The hospital dashboard displays:

Active and in-use models, along with their performance and versions.

Recent feedback submitted by doctors.

New models currently undergoing training, including a progress bar showing how much training has been completed and what is currently happening to those models.

The status of integration with laboratory and imaging systems.

5.2 My Model

This section shows every deployed model — whether it belongs to the platform ("ours") or was created by the hospital itself ("theirs") — along with:

Performance.

Feedback from doctors.

Accuracy.

Version.

Type (classification, regression, etc.).

5.3 Model Marketplace (Phase 1)

This is Phase 1 of the system. Here, the platform offers hospitals licensed AI models that they can purchase.

For example, the platform may offer a pneumonia detection model that supports data in tabular form, image form, DICOM form, and other formats. Once purchased by a hospital, the model remains licensed to the platform.

For each model in the marketplace, hospitals can view:

Price.

Accuracy.

Version.

Available formats.

Accepted input types.

Further details — what the model is, what it predicts, its name, its type, and other relevant details.

These are the models made available to doctors on the doctor side, where they are used to analyze patient data and create reports — reducing doctor workload and the need for manual validation.

5.4 Create New Model — AutoML Platform (Phase 2)

This is Phase 2 of the system. Clicking "Create New Model" presents four options:

Create New.

In-Training (models currently being trained).

Pending Approval Requests.

Ready-to-View (newly created models).

Selecting "Create New" walks the hospital through approximately ten steps to build their own AI model, which becomes licensed to the hospital itself. The platform provides an enclosure (secure environment) for this process.

Step 1 — Data Upload

The hospital uploads its data. The data can be in any format — the platform does not require a specific format such as scan or text — but it must relate to one specific disease so that the data is not mixed up.

Example given: approximately 10,000 images of a brain tumor scan.

Data can also be uploaded directly from source systems, such as the MRI machine or CT scan machine.

Step 2 — Data Profiling and Validation

The platform's enclosure automatically checks the quality of the uploaded data. Data is auto-rejected (with a reason provided) under the following conditions:

The dataset is below a required volume threshold — for example, only 50 rows of data, which is not enough to perform a proper train/test split.

The dataset contains more than 75% missing values.

If the data passes this stage, the process continues to the next step.

Step 3 — Mandatory Manual Input from the Hospital

At this stage, the hospital must manually provide:

The target column — i.e., what the model should predict (for example, a "diabetes: yes/no" target column).

Removal of any and all patient-identifying data.

Note: The platform is strictly against providing any patient data to an AI model, and complies with all applicable health regulatory compliance requirements. Both the target column and the removal of patient data are mandatory steps.

Step 4 — Data Cleaning and Conversion

An LLM is integrated into this step. The platform performs:

Data cleaning and conversion.

Standardization of units and medical image formats (for example, converting non-standard values, such as an unusual milligram-per-millilitre value, into the standard value).

Feature engineering — for example, automatically adding a BMI column, calculated from age, weight, and height, if it is not already present in the data.

Step 5 — Human Verification

The hospital is given a human-review dashboard where it can see the details of its data after feature engineering, including a data quality score.

If, even after cleaning and feature engineering, the data quality score remains below a threshold (referenced as roughly 30–50%), the data will not proceed to the training phase — the platform will not waste resources on it. Instead, the hospital is asked to verify, recheck, or re-upload the data.

This stage is effectively a check, verify, and approve step, where the hospital can view the data quality score.

Step 6 — Problem Detection

The platform identifies the type of problem the data represents — for example, classification, regression, time-series forecasting, or natural language processing (NLP).

Step 7 — AutoML Pipeline

Once the problem type is identified, the platform:

Performs a train/test split.

Applies scalarization.

Runs multiple algorithms against the data and checks their accuracy.

Selects whichever algorithm performs best.

Step 8 — Explainability Report

The platform generates an explainability report covering:

Why the chosen algorithm was selected.

The model's accuracy.

The F1 score.

Prediction results and other information needed for the hospital to trust the model it has created using its own data.

This is delivered as an analysis report ahead of final approval.

Step 9 — Final Approval

The hospital reviews the analysis report and either approves or does not approve the model.

Step 10 — Deployment

Once approved, the model is deployed and automatically added to the "My Model" section, marked as a hospital-owned model.

5.5 Version Control

Hospitals can control and check the version of any model — whether platform-licensed ("ours") or hospital-created ("theirs").

5.6 Integrations

This section shows which models are connected to which systems, including:

Which systems a given model is connected to, or if it is connected to all systems.

Which systems remain unconnected.

The health/status of each connection (e.g., active).

5.7 Settings

Standard/default platform settings for the hospital account.

6. Model Ownership Summary

Throughout the platform, deployed models fall into one of two categories:



Both types of models appear together in the "My Model" section on the hospital side, and both are used by doctors on the doctor side to analyze patient data, generate reports, and reduce manual workload and validation effort.