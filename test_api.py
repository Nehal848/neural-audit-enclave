import urllib.request
import json

data = json.dumps({'full_name':'Test', 'license_no':'TEST-123', 'password':'test'}).encode('utf-8')
req = urllib.request.Request('http://127.0.0.1:8000/api/doctor/signup', data=data, headers={'Content-Type': 'application/json'})
try:
    with urllib.request.urlopen(req) as response:
        print(response.read().decode('utf-8'))
except urllib.error.HTTPError as e:
    print('HTTPError:', e.code)
    print(e.read().decode('utf-8'))
