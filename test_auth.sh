#!/bin/bash
echo "=== Doctor Login ==="
curl -s -X POST http://localhost:8000/api/doctor/login \
  -H "Content-Type: application/json" \
  --data-raw '{"license_no":"MED-98765-IN","password":"doctor"}'
echo ""
echo ""
echo "=== Hospital Login ==="
curl -s -X POST http://localhost:8000/api/hospital/login \
  -H "Content-Type: application/json" \
  --data-raw '{"reg_no":"HOSP-MH-001","password":"admin"}'
echo ""
