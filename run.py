"""GPT-PDF Studio Launcher

Runs the FastAPI backend, serves the frontend application, and verifies
the Microsoft Edge Chromium vector PDF generation engine.
"""

import os
import subprocess
import sys
import threading
import time
import webbrowser
from pathlib import Path


def ensure_venv():
    """Ensure running inside project .venv if present and dependencies are missing."""
    project_root = Path(__file__).resolve().parent
    venv_py = (
        project_root / ".venv" / "Scripts" / "python.exe"
        if os.name == "nt"
        else project_root / ".venv" / "bin" / "python"
    )

    try:
        import uvicorn  # noqa: F401
        import fastapi  # noqa: F401
    except ImportError:
        if venv_py.exists():
            print(f"Switching to project virtual environment: {venv_py}")
            res = subprocess.run([str(venv_py), __file__] + sys.argv[1:])
            sys.exit(res.returncode)
        else:
            print(
                "ERROR: Required dependencies (uvicorn, fastapi) are not installed.\n"
                "Please run: .venv/Scripts/pip install -r requirements.txt\n"
                "or create a virtual environment first."
            )
            sys.exit(1)


ensure_venv()

import uvicorn
from backend.pdf_engine import find_browser_executable


def _open_browser_delayed(url: str, delay_sec: float = 1.2):
    def _worker():
        time.sleep(delay_sec)
        try:
            webbrowser.open(url)
        except Exception:
            pass

    threading.Thread(target=_worker, daemon=True).start()


def main():
    browser = find_browser_executable()
    host_url = "http://localhost:8000"

    print("=" * 64)
    print("           ✨ CHATFOLIO STUDIO — EDITORIAL AI PUBLISHER ✨        ")
    print("=" * 64)
    print("  Status:      Online")
    print(f"  Studio URL:  {host_url}")
    print(f"  PDF Engine:  {browser or 'Not Found (falling back to client print)'}")
    print("  Themes:      Obsidian, Editorial, ChatGPT, Academic, Monochrome, Cyber")
    print("=" * 64)
    print("\nPress Ctrl+C to stop the server.\n")

    _open_browser_delayed(host_url)

    # Start Uvicorn server
    uvicorn.run("backend.app:app", host="127.0.0.1", port=8000, reload=True)


if __name__ == "__main__":
    main()
