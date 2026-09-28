"""FastAPI Application Server for ChatFolio Studio"""

from __future__ import annotations

import json
import os
import time
from pathlib import Path
from typing import Any, Dict, List, Optional

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field
from starlette.background import BackgroundTask

from backend.parser import fetch_share_page, parse_chat_json, parse_share_html
from backend.pdf_engine import (
    THEME_PALETTES,
    build_document_html,
    find_browser_executable,
    render_pdf_from_html,
)
from backend.samples import SAMPLE_CHATS

from contextlib import asynccontextmanager

PROJECT_ROOT = Path(__file__).resolve().parent.parent
DIST_DIR = PROJECT_ROOT / "dist"
FRONTEND_DIR = PROJECT_ROOT / "frontend"
STATIC_DIR = DIST_DIR if DIST_DIR.exists() else FRONTEND_DIR
EXPORTS_DIR = PROJECT_ROOT / "exports"
EXPORTS_DIR.mkdir(parents=True, exist_ok=True)


def cleanup_old_exports(max_age_seconds: int = 3600) -> None:
    """Purge temporary generated PDF exports older than max_age_seconds."""
    try:
        now = time.time()
        for f in EXPORTS_DIR.glob("*.pdf"):
            if f.is_file() and (now - f.stat().st_mtime) > max_age_seconds:
                try:
                    f.unlink()
                except Exception:
                    pass
    except Exception:
        pass


@asynccontextmanager
async def lifespan(app: FastAPI):
    cleanup_old_exports()
    yield


app = FastAPI(
    title="ChatFolio Studio API",
    version="3.0.0",
    description="Transform AI conversations into publication-grade folios with live typography and vector PDF rendering.",
    lifespan=lifespan,
)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)



class FetchRequest(BaseModel):
    url: str = Field(..., description="ChatGPT share URL (e.g. https://chatgpt.com/share/...)")


class ParseRawRequest(BaseModel):
    raw: str = Field(..., description="Raw HTML or JSON string from ChatGPT share or export")


class ExportPdfRequest(BaseModel):
    chat: Dict[str, Any]
    theme: str = "editorial"
    options: Optional[Dict[str, Any]] = None
    selected_ids: Optional[List[str]] = None


@app.get("/api/health")
async def health_check():
    browser_exe = find_browser_executable()
    return {
        "status": "ok",
        "has_chrome": bool(browser_exe),
        "browser_engine": "Microsoft Edge Chromium" if browser_exe else "Not found",
        "browser_path": browser_exe,
        "themes": list(THEME_PALETTES.keys()),
        "time": time.time(),
    }


@app.get("/api/samples")
async def get_samples():
    return {
        "samples": [
            {
                "id": s["share_id"],
                "title": s["title"],
                "category": s.get("category", "General"),
                "model": s["model"],
                "message_count": len(s["messages"]),
            }
            for s in SAMPLE_CHATS
        ]
    }


@app.get("/api/samples/{sample_id}")
async def get_sample_detail(sample_id: str):
    for s in SAMPLE_CHATS:
        if s["share_id"] == sample_id:
            return s
    raise HTTPException(status_code=404, detail="Sample not found")


@app.post("/api/fetch")
async def fetch_conversation(req: FetchRequest):
    url = req.url.strip()
    if not url:
        raise HTTPException(status_code=400, detail="Please provide a valid URL.")
    
    try:
        html = fetch_share_page(url)
        conversation = parse_share_html(html)
        return conversation.to_dict()
    except PermissionError as pe:
        raise HTTPException(
            status_code=403,
            detail="Cloudflare verification challenge encountered. Please switch to the 'Paste Page Source / HTML' tab or use the 1-Click Bookmarklet to import instantly.",
        )
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch conversation: {str(e)}. Try pasting the page source directly in the 'Paste Raw' tab.",
        )


@app.post("/api/parse-raw")
async def parse_raw_conversation(req: ParseRawRequest):
    if len(req.raw) > 25 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="Payload exceeds maximum limit of 25MB.")
    raw_content = req.raw.strip()
    if not raw_content:
        raise HTTPException(status_code=400, detail="Empty content provided.")

    # 1. Try parsing as JSON first
    if (raw_content.startswith("{") and raw_content.endswith("}")) or (
        raw_content.startswith("[") and raw_content.endswith("]")
    ):
        try:
            parsed_json = json.loads(raw_content)
            if isinstance(parsed_json, list) and parsed_json:
                parsed_json = parsed_json[0]
            if isinstance(parsed_json, dict):
                conv = parse_chat_json(parsed_json)
                if conv.messages:
                    return conv.to_dict()
        except Exception:
            pass

    # 2. Try parsing as HTML
    try:
        conv = parse_share_html(raw_content)
        return conv.to_dict()
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Unable to parse conversation data: {str(e)}. Please paste the full HTML page source or a valid conversation JSON.",
        )


@app.post("/api/export-pdf")
async def export_pdf(req: ExportPdfRequest):
    try:
        chat_data = req.chat
        theme = req.theme or "editorial"
        options = dict(req.options or {})
        if req.selected_ids is not None:
            options["selected_ids"] = req.selected_ids

        # Build print-ready HTML
        html_doc = build_document_html(chat_data, theme=theme, options=options)

        # Generate unique sanitized PDF filename
        raw_title = str(chat_data.get("title") or "chat").lower().strip()
        cleaned_slug = "".join(c if (c.isalnum() or c == "-") else "-" for c in raw_title)
        title_slug = "-".join(part for part in cleaned_slug.split("-") if part)[:40] or "chat"
        timestamp = int(time.time())
        pdf_filename = f"{title_slug}-{timestamp}.pdf"
        out_pdf_path = EXPORTS_DIR / pdf_filename

        render_pdf_from_html(html_doc, str(out_pdf_path))

        def _safe_remove(p: str):
            try:
                if os.path.exists(p):
                    os.remove(p)
            except Exception:
                pass

        return FileResponse(
            path=str(out_pdf_path),
            filename=pdf_filename,
            media_type="application/pdf",
            background=BackgroundTask(_safe_remove, str(out_pdf_path)),
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF generation failed: {str(e)}")


@app.post("/api/export-html")
async def export_html(req: ExportPdfRequest):
    try:
        chat_data = req.chat
        theme = req.theme or "editorial"
        options = dict(req.options or {})
        if req.selected_ids is not None:
            options["selected_ids"] = req.selected_ids
        html_doc = build_document_html(chat_data, theme=theme, options=options)
        return HTMLResponse(content=html_doc)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"HTML export failed: {str(e)}")


# Mount frontend static files (modern React bundle from dist, or fallback to frontend)
if STATIC_DIR.exists():
    app.mount("/", StaticFiles(directory=str(STATIC_DIR), html=True), name="frontend")

