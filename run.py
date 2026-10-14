import sys
import os
import subprocess

# Auto-detect virtualenv if uvicorn or dependencies are missing in current python
try:
    import uvicorn
except ImportError:
    base_dir = os.path.dirname(os.path.abspath(__file__))
    candidates = [
        os.path.join(base_dir, "venv", "Scripts", "python.exe"),
        os.path.join(base_dir, ".venv", "Scripts", "python.exe"),
        os.path.join(base_dir, "venv", "bin", "python"),
        os.path.join(base_dir, ".venv", "bin", "python"),
    ]
    venv_py = next((p for p in candidates if os.path.isfile(p)), None)
    if venv_py and venv_py != sys.executable:
        print(f"[+] Re-launching with virtual environment: {venv_py}")
        sys.exit(subprocess.call([venv_py] + sys.argv))
    else:
        print("[-] uvicorn is not installed. Please install dependencies: pip install -r requirements.txt")
        raise

# Add backend directory to sys.path
backend_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "backend")
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

def main():
    print("=" * 65)
    print("   GROUNDUP — Student Cross-College Collaboration Platform ")
    print("   HackShift Submission • SRS Version 0.2                  ")
    print("=" * 65)
    print("\n[+] Initializing database and cross-college demo data...")
    try:
        from app.database import init_db
        from app.seed_data import seed
        init_db()
        seed()
        print("[✓] Database initialized with realistic seed profiles!")
    except Exception as e:
        print(f"[-] Database initialization note: {e}")

    print("\n[+] Starting FastAPI server...")
    print("    • Web Application (Landing & App): http://localhost:8000")
    print("    • Alternative Direct IP:           http://127.0.0.1:8000")
    print("    • Interactive API Docs:            http://localhost:8000/docs")
    print("    • Alternative ReDoc:               http://localhost:8000/redoc")
    print("\n    [!] NOTE FOR WINDOWS BROWSERS:")
    print("        Open http://localhost:8000 or http://127.0.0.1:8000 in your browser.")
    print("        (Windows browsers will block 0.0.0.0 as an invalid destination address)")
    print("\n[+] Pre-Seeded Student Personas for Testing (1-Click Switcher in Navbar):")
    print("    1. Aarav Sharma (DTU) — Backend (Java/FastAPI), wants PyTorch/ML")
    print("    2. Priya Patel (IIT Delhi) — AI/ML Researcher (PyTorch/CV), needs Backend")
    print("    3. Rohan Mehta (BITS Pilani) — Frontend Architect (React/TypeScript/UI)")
    print("    4. Ananya Sengupta (IIIT Hyderabad) — NLP & Language Models Specialist")
    print("    5. Vikram Joshi (NSUT Delhi) — DevOps & Cloud (Docker/Kubernetes)")
    print("=" * 65 + "\n")

    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=False, app_dir=backend_dir)

if __name__ == "__main__":
    main()
