#!/bin/bash
cd /home/nehal07/secure_med_enclosure
source ven/bin/activate

# Start server in background
uvicorn app.main:app --host 0.0.0.0 --port 8002 > /tmp/server_test.log 2>&1 &
SERVER_PID=$!
sleep 5

BASE="http://localhost:8002"

test_get() {
  echo "=== GET $1 ==="
  STATUS=$(curl -s -o /tmp/resp.json -w "%{http_code}" "$BASE$1")
  echo "HTTP $STATUS"
  cat /tmp/resp.json | python3 -c "import sys,json; d=sys.stdin.read(); x=json.loads(d) if d.strip() else {}; print(str(x)[:200])" 2>/dev/null || cat /tmp/resp.json | head -c 200
  echo ""
}

test_post() {
  echo "=== POST $1 ==="
  STATUS=$(curl -s -o /tmp/resp.json -w "%{http_code}" -X POST "$BASE$1" -H "Content-Type: application/json" -d "$2")
  echo "HTTP $STATUS"
  cat /tmp/resp.json | python3 -c "import sys,json; d=sys.stdin.read(); x=json.loads(d) if d.strip() else {}; print(str(x)[:200])" 2>/dev/null || cat /tmp/resp.json | head -c 200
  echo ""
}

# GET endpoints
test_get "/api/patients"
test_get "/api/models/my-models"
test_get "/api/marketplace"
test_get "/api/hospital/version-control"
test_get "/api/hospital/integrations"
test_get "/api/hospital/doctors"
test_get "/api/doctor/lab-imaging"
test_get "/api/models/feedback"
test_get "/api/audit/logs"
test_get "/api/audit/stats"
test_get "/api/hospital/automl/results"
test_get "/api/models/blood-cancer-text/info"

# POST endpoints
test_post "/api/doctor/login" '{"license_no":"MED-98765-IN","password":"doctor"}'
test_post "/api/hospital/login" '{"reg_no":"HOSP-MH-001","password":"admin"}'
test_post "/api/otp/send" '{"identifier":"MED-98765-IN","role":"doctor"}'

# Check server logs
echo "=== SERVER STARTUP WARNINGS ==="
cat /tmp/server_test.log | grep -E "WARNING|ERROR|DeprecationWarning|Exception" | head -20

kill $SERVER_PID 2>/dev/null
wait $SERVER_PID 2>/dev/null
echo "Done."
