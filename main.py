"""
Hospital AI Infrastructure Platform - Master Entrypoint
Launches the high-security Neural Enclave application server.
"""
import uvicorn
from app.main import app

if __name__ == "__main__":
    print("=" * 60)
    print("🏥 Hospital AI Infrastructure Platform v2.1.0 (Enclave Sim)")
    print("🛡️ Security Status: ACTIVE (Isolated Memory Sandbox)")
    print("📍 Server Target  : http://127.0.0.1:8000")
    print("=" * 60)
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
