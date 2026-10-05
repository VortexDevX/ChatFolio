"""High-Fidelity Vector PDF Generation Engine

Renders conversations with full typography, syntax highlighting, KaTeX math formulas,
custom themes, page numbers, and vector-crisp layouts using Microsoft Edge Headless.
"""

import html
import os
import shutil
import subprocess
import tempfile
import time
from pathlib import Path
from typing import Any, Dict, List, Optional
import markdown
import nh3
from pygments.formatters import HtmlFormatter

SAFE_HTML_TAGS = {
    "a", "abbr", "b", "blockquote", "br", "code", "dd", "del", "div", "dl", "dt",
    "em", "h1", "h2", "h3", "h4", "h5", "h6", "hr", "i", "img", "input", "ins",
    "kbd", "li", "ol", "p", "pre", "s", "span", "strong", "sub", "sup", "table",
    "tbody", "td", "tfoot", "th", "thead", "tr", "u", "ul"
}


def sanitize_rendered_html(raw_html: str) -> str:
    """Sanitize HTML output from markdown converter to eliminate stored XSS vectors."""
    return nh3.clean(
        raw_html,
        tags=SAFE_HTML_TAGS,
        attributes={
            "*": {"class", "id", "style", "title", "data-*"},
            "a": {"href", "target"},
            "img": {"src", "alt", "width", "height", "loading"},
        },
        link_rel="noopener noreferrer",
        url_schemes={"http", "https", "data", "mailto"},
    )


def is_safe_asset_url(url: str) -> bool:
    """Validate that an asset URL uses a safe protocol (disallow javascript: etc)."""
    u = (url or "").strip().lower()
    return u.startswith(("https://", "http://", "data:image/"))


EDGE_PATHS = [
    r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
    r"C:\Program Files\Microsoft\Edge\Application\msedge.exe",
    r"C:\Program Files\Google\Chrome\Application\chrome.exe",
    r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
    os.path.expandvars(r"%LOCALAPPDATA%\Microsoft\Edge\Application\msedge.exe"),
    os.path.expandvars(r"%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe"),
    "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/usr/bin/google-chrome",
    "/usr/bin/google-chrome-stable",
    "/usr/bin/microsoft-edge",
    "/usr/bin/chromium-browser",
    "/usr/bin/chromium",
]


def find_browser_executable() -> Optional[str]:
    # Check explicit standard file paths
    for path in EDGE_PATHS:
        if path and os.path.isfile(path) and os.path.exists(path):
            return path

    # Check system PATH
    for binary in (
        "msedge",
        "chrome",
        "google-chrome",
        "google-chrome-stable",
        "chromium",
        "chromium-browser",
    ):
        found = shutil.which(binary)
        if found:
            return found

    return None


THEME_PALETTES: Dict[str, Dict[str, str]] = {
    "obsidian": {
        "name": "Atelier Noir",
        "bg": "#090d16",
        "surface": "#0f172a",
        "border": "#1e293b",
        "text": "#f8fafc",
        "text_muted": "#94a3b8",
        "primary": "#2563eb",
        "primary_bg": "rgba(37, 99, 235, 0.15)",
        "user_bubble": "#161f30",
        "user_border": "#2d3748",
        "ai_bubble": "#0f172a",
        "ai_border": "#1e293b",
        "code_bg": "#060913",
        "accent": "#38bdf8",
    },
    "editorial": {
        "name": "Editorial Paper",
        "bg": "#faf8f5",
        "surface": "#ffffff",
        "border": "#e7e0d3",
        "text": "#1c1917",
        "text_muted": "#78716c",
        "primary": "#b45309",
        "primary_bg": "rgba(180, 83, 9, 0.08)",
        "user_bubble": "#f4ece1",
        "user_border": "#e2d9c8",
        "ai_bubble": "#ffffff",
        "ai_border": "#e7e0d3",
        "code_bg": "#ede4d6",
        "accent": "#059669",
    },
    "chatgpt": {
        "name": "ChatGPT Modern",
        "bg": "#202123",
        "surface": "#2d2f34",
        "border": "#3e4147",
        "text": "#ececf1",
        "text_muted": "#9ca3af",
        "primary": "#10a37f",
        "primary_bg": "rgba(16, 163, 127, 0.15)",
        "user_bubble": "#2d2f34",
        "user_border": "#40434b",
        "ai_bubble": "#212327",
        "ai_border": "#34373c",
        "code_bg": "#17181c",
        "accent": "#19c37d",
    },
    "academic": {
        "name": "Academic Journal",
        "bg": "#ffffff",
        "surface": "#ffffff",
        "border": "#cbd5e1",
        "text": "#111827",
        "text_muted": "#4b5563",
        "primary": "#1e3a8a",
        "primary_bg": "rgba(30, 58, 138, 0.06)",
        "user_bubble": "#f8fafc",
        "user_border": "#e2e8f0",
        "ai_bubble": "#ffffff",
        "ai_border": "#cbd5e1",
        "code_bg": "#f1f5f9",
        "accent": "#2563eb",
    },
    "monochrome": {
        "name": "Monochrome Print",
        "bg": "#ffffff",
        "surface": "#ffffff",
        "border": "#111111",
        "text": "#000000",
        "text_muted": "#333333",
        "primary": "#000000",
        "primary_bg": "transparent",
        "user_bubble": "#f5f5f5",
        "user_border": "#cccccc",
        "ai_bubble": "#ffffff",
        "ai_border": "#111111",
        "code_bg": "#f0f0f0",
        "accent": "#000000",
    },
    "cyberpunk": {
        "name": "Cyberpunk Terminal",
        "bg": "#0a0a12",
        "surface": "#121124",
        "border": "#ff007f",
        "text": "#00f0ff",
        "text_muted": "#a78bfa",
        "primary": "#ffe600",
        "primary_bg": "rgba(255, 230, 0, 0.15)",
        "user_bubble": "#1a1633",
        "user_border": "#ff007f",
        "ai_bubble": "#0d0b1a",
        "ai_border": "#00f0ff",
        "code_bg": "#05040a",
        "accent": "#ff007f",
    }
}

MARGIN_MAP = {
    "narrow": {"a4": "10mm 10mm 10mm 10mm", "letter": "0.4in 0.4in 0.4in 0.4in", "continuous": "6mm", "top": "10mm"},
    "normal": {"a4": "16mm 14mm 16mm 14mm", "letter": "0.65in 0.55in 0.65in 0.55in", "continuous": "12mm", "top": "16mm"},
    "wide": {"a4": "24mm 20mm 24mm 20mm", "letter": "0.95in 0.85in 0.95in 0.85in", "continuous": "18mm", "top": "24mm"},
}


def get_margin_css(margins: str = "normal", paper_size: str = "A4") -> str:
    """Return CSS @page rule with proper page margins.

    Chromium headless prints background colors edge-to-edge across the entire page,
    while @page margins properly position content on every page (including multi-page continuations).
    """
    cur_margin = MARGIN_MAP.get(margins, MARGIN_MAP["normal"])
    if paper_size == "Letter":
        margin_val = cur_margin["letter"]
        size_val = "letter portrait"
    elif paper_size == "Continuous":
        margin_val = cur_margin["continuous"]
        size_val = "auto"
    else:
        margin_val = cur_margin["a4"]
        size_val = "A4 portrait"

    return f"@page {{ size: {size_val}; margin: {margin_val}; }}"


def build_document_html(
    chat_data: Dict[str, Any],
    theme: str = "editorial",
    options: Optional[Dict[str, Any]] = None,
    selected_message_ids: Optional[Any] = None,
) -> str:
    """Generate self-contained, publication-grade HTML for printing or export."""
    opts = options or {}
    theme_key = theme if theme in THEME_PALETTES else "editorial"
    palette = THEME_PALETTES[theme_key]

    paper_size = opts.get("paper_size", "A4")  # A4, Letter, Continuous
    font_size = opts.get("font_size", "medium")  # small, medium, large
    font_family = opts.get("font_family", "system")  # system, serif, mono, elegant
    custom_title = opts.get("custom_title") or chat_data.get("title") or "ChatGPT Conversation"
    safe_title = html.escape(str(custom_title))
    custom_subtitle = opts.get("custom_subtitle") or ""
    safe_subtitle = html.escape(str(custom_subtitle)) if custom_subtitle else ""
    author_tag = opts.get("author_tag") or ""
    safe_author = html.escape(str(author_tag)) if author_tag else ""
    watermark = opts.get("watermark") or ""
    safe_watermark = html.escape(str(watermark)) if watermark else ""
    show_thoughts = opts.get("show_thoughts", False)
    show_user_msgs = opts.get("show_user_msgs", True)
    show_ai_msgs = opts.get("show_ai_msgs", True)
    show_line_numbers = opts.get("show_line_numbers", True)
    show_metadata_banner = opts.get("show_metadata_banner", True)
    page_break_mode = opts.get("page_break_mode", "message")
    
    if selected_message_ids is None:
        selected_ids_opt = opts.get("selected_ids")
        selected_message_ids = set(selected_ids_opt) if selected_ids_opt is not None else None
    else:
        selected_message_ids = set(selected_message_ids)
    margins = opts.get("margins", "normal")

    # Font sizing map
    size_map = {
        "small": {"body": "13px", "h1": "22px", "h2": "18px", "code": "11.5px"},
        "medium": {"body": "14.5px", "h1": "25px", "h2": "20px", "code": "12.5px"},
        "large": {"body": "16px", "h1": "28px", "h2": "22px", "code": "14px"},
    }
    sizes = size_map.get(font_size, size_map["medium"])

    # Font family map
    family_map = {
        "system": "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        "serif": "'Newsreader', 'Georgia', 'Cambria', 'Times New Roman', serif",
        "mono": "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
        "elegant": "'Outfit', 'Plus Jakarta Sans', -apple-system, sans-serif",
    }
    font_stack = family_map.get(font_family, family_map["system"])

    # Filter messages
    raw_messages = chat_data.get("messages", [])
    filtered_messages = []
    total_words = 0

    for msg in raw_messages:
        msg_id = msg.get("id")
        if selected_message_ids is not None and msg_id not in selected_message_ids:
            continue
        role = msg.get("role", "assistant")
        if role == "user" and not show_user_msgs:
            continue
        if role != "user" and not show_ai_msgs:
            continue
        filtered_messages.append(msg)
        content_text = msg.get("content", "")
        total_words += len(str(content_text).split())

    est_reading_time = max(1, round(total_words / 220))
    model_name = chat_data.get("model") or "ChatGPT"
    safe_model = html.escape(str(model_name))
    updated_at_val = chat_data.get("updated_at")
    date_str = ""
    if updated_at_val:
        try:
            date_str = time.strftime("%B %d, %Y", time.localtime(float(updated_at_val)))
        except Exception:
            date_str = time.strftime("%B %d, %Y")
    else:
        date_str = time.strftime("%B %d, %Y")

    # Render Markdown for each message
    md_converter = markdown.Markdown(
        extensions=["fenced_code", "tables", "codehilite", "nl2br", "sane_lists"],
        extension_configs={
            "codehilite": {
                "guess_lang": True,
                "use_pygments": True,
                "css_class": "codehilite",
                "linenums": bool(show_line_numbers),
            }
        },
    )

    rendered_turns = []
    for idx, msg in enumerate(filtered_messages, start=1):
        role = msg.get("role", "assistant")
        is_user = role == "user"
        content_raw = msg.get("content", "")
        thought_raw = msg.get("thought")
        
        # Reset markdown converter state
        md_converter.reset()
        rendered_content = sanitize_rendered_html(md_converter.convert(str(content_raw)))

        rendered_thought = ""
        if show_thoughts and thought_raw:
            md_converter.reset()
            thought_html = sanitize_rendered_html(md_converter.convert(str(thought_raw)))
            rendered_thought = f"""
            <div class="thought-container">
                <div class="thought-badge">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a7 7 0 0 1 7 7c0 2.38-1.19 4.47-3 5.74V17a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 0 1 7-7z"/><path d="M9 21h6"/></svg>
                    Thought Process / Reasoning
                </div>
                <div class="thought-body">{thought_html}</div>
            </div>
            """

        # Render image / file attachments safely
        rendered_assets = ""
        assets_list = msg.get("assets") or []
        if isinstance(assets_list, list) and assets_list:
            asset_items = []
            for a in assets_list:
                if not isinstance(a, dict):
                    continue
                a_url = a.get("url") or ""
                a_type = a.get("asset_type") or a.get("type") or "file"
                a_name = html.escape(str(a.get("filename") or a.get("name") or "Attachment"))
                if not is_safe_asset_url(a_url):
                    continue
                safe_href = html.escape(str(a_url))
                if a_type == "image":
                    asset_items.append(f'<div class="turn-asset-image" style="margin-top:0.75rem;"><img src="{safe_href}" alt="{a_name}" style="max-width:100%; border-radius:8px; border:1px solid var(--border);" /></div>')
                else:
                    asset_items.append(f'<div class="turn-asset-file" style="margin-top:0.5rem;"><a href="{safe_href}" target="_blank" rel="noopener noreferrer" style="color:var(--primary); text-decoration:underline;">📎 {a_name}</a></div>')
            if asset_items:
                rendered_assets = f'<div class="turn-assets">{"".join(asset_items)}</div>'

        author_display = html.escape(str(msg.get("author") or ("User" if is_user else "ChatGPT")))
        bubble_class = "turn-user" if is_user else "turn-ai"
        badge_label = "USER" if is_user else safe_model.upper()

        page_break_class = ""
        should_break = False
        if idx > 1:
            if page_break_mode == "message":
                page_break_class = "page-break-before"
                should_break = True
            elif page_break_mode == "pair" and is_user:
                page_break_class = "page-break-before"
                should_break = True

        spacer_html = '<div class="page-break-spacer" aria-hidden="true"></div>' if should_break else ""
        turn_classes = f"turn {bubble_class} {page_break_class}".strip()

        if is_user:
            avatar_svg = """<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>"""
        else:
            avatar_svg = """<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M12 8V4H8"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>"""

        rendered_turns.append(f"""
        {spacer_html}
        <article class="{turn_classes}" data-turn-id="{msg.get('id')}">
            <header class="turn-header">
                <div class="turn-author">
                    <div class="author-avatar">{avatar_svg}</div>
                    <span class="author-name">{author_display}</span>
                    <span class="role-badge">{badge_label}</span>
                </div>
                <div class="turn-meta">#{idx}</div>
            </header>
            {rendered_thought}
            <div class="turn-body markdown-body">
                {rendered_content}
                {rendered_assets}
            </div>
        </article>
        """)

    turns_html = "\n".join(rendered_turns)

    # Metadata banner HTML
    metadata_banner_html = ""
    if show_metadata_banner:
        metadata_banner_html = f"""
        <aside class="meta-strip">
            <div class="meta-item">
                <span class="meta-label">Model</span>
                <span class="meta-val meta-badge">{safe_model}</span>
            </div>
            <div class="meta-item">
                <span class="meta-label">Date</span>
                <span class="meta-val">{date_str}</span>
            </div>
            <div class="meta-item">
                <span class="meta-label">Messages</span>
                <span class="meta-val">{len(filtered_messages)} turns</span>
            </div>
            <div class="meta-item">
                <span class="meta-label">Word Count</span>
                <span class="meta-val">{total_words:,} words</span>
            </div>
            <div class="meta-item">
                <span class="meta-label">Read Time</span>
                <span class="meta-val">~{est_reading_time} min</span>
            </div>
        </aside>
        """

    watermark_html = f'<div class="watermark-stamp">{safe_watermark}</div>' if safe_watermark else ""
    subtitle_html = f'<p class="doc-subtitle">{safe_subtitle}</p>' if safe_subtitle else ""
    author_html = f'<div class="doc-author">Prepared by: <strong>{safe_author}</strong></div>' if safe_author else ""

    # Page size and margins CSS
    page_css = get_margin_css(margins, paper_size)
    cur_margin = MARGIN_MAP.get(margins, MARGIN_MAP["normal"])
    pad_val = cur_margin["letter"] if paper_size == "Letter" else cur_margin["a4"] if paper_size == "A4" else cur_margin["continuous"]

    PYGMENTS_THEME_MAP = {
        "obsidian": "one-dark",
        "editorial": "friendly",
        "chatgpt": "one-dark",
        "academic": "friendly",
        "monochrome": "bw",
        "cyberpunk": "monokai",
    }
    pygments_style = PYGMENTS_THEME_MAP.get(theme_key, "friendly")
    pygments_css = HtmlFormatter(style=pygments_style).get_style_defs(".codehilite")

    full_html = f"""<!DOCTYPE html>
<html lang="en" data-theme="{theme_key}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{safe_title}</title>
    
    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,600;1,6..72,400&family=Outfit:wght@500;600;700&display=swap" rel="stylesheet">
    
    <!-- KaTeX for LaTeX Math Formulas -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css">
    <script src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/contrib/auto-render.min.js"></script>

    <style>
        :root {{
            --bg: {palette['bg']};
            --surface: {palette['surface']};
            --border: {palette['border']};
            --text: {palette['text']};
            --text-muted: {palette['text_muted']};
            --primary: {palette['primary']};
            --primary-bg: {palette['primary_bg']};
            --user-bubble: {palette['user_bubble']};
            --user-border: {palette['user_border']};
            --ai-bubble: {palette['ai_bubble']};
            --ai-border: {palette['ai_border']};
            --code-bg: {palette['code_bg']};
            --accent: {palette['accent']};
            --page-padding: {pad_val};
            --page-top-margin: {cur_margin.get('top', '18mm')};
            
            --font-family: {font_stack};
            --font-size-body: {sizes['body']};
            --font-size-h1: {sizes['h1']};
            --font-size-h2: {sizes['h2']};
            --font-size-code: {sizes['code']};
        }}

        {page_css}

        {pygments_css}

        * {{
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }}

        html {{
            background-color: var(--bg);
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
        }}

        body {{
            background-color: var(--bg);
            color: var(--text);
            font-family: var(--font-family);
            font-size: var(--font-size-body);
            line-height: 1.65;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            padding: var(--page-padding);
            position: relative;
            min-height: 100vh;
        }}

        /* Fixed background overlay that repeats on every printed page in Chromium to eliminate white margins */
        .page-bleed-bg {{
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            width: 100vw;
            height: 100vh;
            background-color: var(--bg) !important;
            z-index: -99999;
            pointer-events: none;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
        }}

        .doc-container {{
            max-width: 860px;
            margin: 0 auto;
            position: relative;
            z-index: 1;
        }}

        /* Document Header */
        .doc-header {{
            border-bottom: 2px solid var(--border);
            padding-bottom: 1.5rem;
            margin-bottom: 2rem;
            position: relative;
        }}

        .brand-pill {{
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 4px 10px;
            border-radius: 999px;
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            background: var(--primary-bg);
            color: var(--primary);
            border: 1px solid var(--primary);
            margin-bottom: 0.75rem;
        }}

        .doc-title {{
            font-size: var(--font-size-h1);
            font-weight: 700;
            line-height: 1.25;
            color: var(--text);
            margin-bottom: 0.4rem;
        }}

        .doc-subtitle {{
            font-size: 14.5px;
            color: var(--text-muted);
            line-height: 1.5;
            margin-bottom: 0.5rem;
        }}

        .doc-author {{
            font-size: 13px;
            color: var(--text-muted);
            margin-top: 0.4rem;
        }}

        /* Metadata Banner */
        .meta-strip {{
            display: flex;
            flex-wrap: wrap;
            gap: 1.25rem;
            background: var(--surface);
            border: 1px solid var(--border);
            border-radius: 10px;
            padding: 0.85rem 1.25rem;
            margin-bottom: 2.2rem;
            break-inside: avoid;
        }}

        .meta-item {{
            display: flex;
            flex-direction: column;
            gap: 2px;
        }}

        .meta-label {{
            font-size: 10.5px;
            text-transform: uppercase;
            letter-spacing: 0.06em;
            color: var(--text-muted);
            font-weight: 600;
        }}

        .meta-val {{
            font-size: 13px;
            font-weight: 600;
            color: var(--text);
        }}

        .meta-badge {{
            color: var(--primary);
        }}

        /* Turns & Messages */
        .turns-wrapper {{
            display: block;
        }}

        .turn {{
            border-radius: 12px;
            border: 1px solid var(--border);
            padding: 1.35rem 1.6rem;
            margin-bottom: 1.6rem;
            break-inside: auto;
            page-break-inside: auto;
            -webkit-box-decoration-break: clone;
            box-decoration-break: clone;
            position: relative;
        }}

        .turn-user {{
            background: var(--user-bubble);
            border-color: var(--user-border);
            margin-top: 1.25rem;
        }}

        .turns-wrapper > .turn:first-child,
        .page-break-spacer + .turn-user,
        .page-break-spacer + .turn {{
            margin-top: 0;
        }}

        .turn-ai {{
            background: var(--ai-bubble);
            border-color: var(--ai-border);
        }}

        .turn-header {{
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 0.9rem;
            padding-bottom: 0.6rem;
            border-bottom: 1px dashed var(--border);
            break-after: avoid;
            page-break-after: avoid;
        }}

        .turn-author {{
            display: flex;
            align-items: center;
            gap: 8px;
        }}

        .author-avatar {{
            width: 24px;
            height: 24px;
            border-radius: 6px;
            background: var(--primary);
            color: #ffffff;
            font-size: 11px;
            font-weight: 700;
            display: flex;
            align-items: center;
            justify-content: center;
        }}

        .author-name {{
            font-size: 13.5px;
            font-weight: 600;
            color: var(--text);
        }}

        .role-badge {{
            font-size: 10px;
            font-weight: 700;
            padding: 2px 7px;
            border-radius: 4px;
            background: var(--primary-bg);
            color: var(--primary);
            letter-spacing: 0.04em;
        }}

        .turn-meta {{
            font-size: 11.5px;
            color: var(--text-muted);
            font-family: 'JetBrains Mono', monospace;
        }}

        /* Thought Process Styling */
        .thought-container {{
            background: rgba(0, 0, 0, 0.25);
            border-left: 3px solid var(--accent);
            border-radius: 6px;
            padding: 0.8rem 1rem;
            margin-bottom: 1rem;
            font-size: 12.5px;
            color: var(--text-muted);
        }}

        .thought-badge {{
            display: flex;
            align-items: center;
            gap: 5px;
            font-size: 11px;
            font-weight: 600;
            color: var(--accent);
            margin-bottom: 0.4rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            break-after: avoid;
            page-break-after: avoid;
        }}

        .thought-body p {{
            margin-bottom: 0.4rem;
        }}

        /* Markdown Typography */
        .markdown-body {{
            color: var(--text);
        }}

        .markdown-body p {{
            margin-bottom: 0.85rem;
            line-height: 1.68;
        }}

        .markdown-body p:last-child {{
            margin-bottom: 0;
        }}

        .markdown-body h1, .markdown-body h2, .markdown-body h3, .markdown-body h4 {{
            color: var(--text);
            margin-top: 1.25rem;
            margin-bottom: 0.65rem;
            font-weight: 600;
            line-height: 1.35;
            break-after: avoid;
            page-break-after: avoid;
        }}

        .markdown-body h1 {{ font-size: var(--font-size-h1); border-bottom: 1px solid var(--border); padding-bottom: 0.3rem; }}
        .markdown-body h2 {{ font-size: var(--font-size-h2); }}
        .markdown-body h3 {{ font-size: 16.5px; }}

        .markdown-body ul, .markdown-body ol {{
            margin-left: 1.4rem;
            margin-bottom: 0.85rem;
        }}

        .markdown-body li {{
            margin-bottom: 0.35rem;
        }}

        .markdown-body blockquote {{
            border-left: 3.5px solid var(--primary);
            background: var(--primary-bg);
            padding: 0.65rem 1rem;
            border-radius: 0 6px 6px 0;
            margin: 1rem 0;
            font-style: normal;
        }}

        .markdown-body blockquote p {{
            margin: 0;
        }}

        /* Code Blocks */
        .markdown-body pre {{
            background: var(--code-bg) !important;
            border: 1px solid var(--border);
            border-radius: 8px;
            padding: 1rem 1.15rem;
            overflow-x: auto;
            margin: 1rem 0;
            font-family: 'JetBrains Mono', 'Fira Code', monospace;
            font-size: var(--font-size-code);
            line-height: 1.5;
            break-inside: auto;
            page-break-inside: auto;
            white-space: pre-wrap;
            word-break: break-word;
        }}

        .markdown-body code {{
            font-family: 'JetBrains Mono', 'Fira Code', monospace;
            font-size: 0.9em;
            background: rgba(125, 125, 125, 0.15);
            padding: 2px 5px;
            border-radius: 4px;
        }}

        .markdown-body pre code {{
            background: transparent !important;
            padding: 0;
            border-radius: 0;
            color: inherit;
        }}

        /* Tables */
        .markdown-body table {{
            width: 100%;
            border-collapse: collapse;
            margin: 1.1rem 0;
            font-size: 13.5px;
            break-inside: auto;
            page-break-inside: auto;
        }}

        .markdown-body tr {{
            break-inside: avoid;
            page-break-inside: avoid;
        }}

        .markdown-body th, .markdown-body td {{
            padding: 0.6rem 0.85rem;
            border: 1px solid var(--border);
            text-align: left;
        }}

        .markdown-body th {{
            background: var(--surface);
            font-weight: 600;
        }}

        .markdown-body hr {{
            border: none;
            border-top: 1px solid var(--border);
            margin: 1.5rem 0;
        }}

        /* Watermark */
        .watermark-stamp {{
            position: fixed;
            top: 45%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-30deg);
            font-size: 72px;
            font-weight: 900;
            color: rgba(150, 150, 150, 0.08);
            pointer-events: none;
            text-transform: uppercase;
            white-space: nowrap;
            letter-spacing: 0.1em;
            z-index: 999;
        }}

        /* Footer */
        .doc-footer {{
            margin-top: 3rem;
            padding-top: 1rem;
            border-top: 1px solid var(--border);
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 11px;
            color: var(--text-muted);
            break-inside: avoid;
        }}

        .page-break-spacer {{
            display: block;
            height: 1.5rem;
            margin-top: 2rem;
            margin-bottom: 0.75rem;
            position: relative;
        }}

        .page-break-before {{
            break-before: page !important;
            page-break-before: always !important;
        }}

        @media screen {{
            .page-break-spacer {{
                display: block;
                height: 1.5rem;
                margin-top: 2.25rem;
                margin-bottom: 1rem;
                position: relative;
            }}
            .page-break-spacer::after {{
                content: "— Page Break —";
                display: block;
                text-align: center;
                font-size: 10px;
                font-weight: 700;
                letter-spacing: 0.15em;
                text-transform: uppercase;
                color: var(--text-muted);
                opacity: 0.6;
                border-top: 1px dashed var(--border);
                padding-top: 0.6rem;
            }}
        }}

        @media print {{
            html, body {{
                background-color: var(--bg) !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
            }}
            body {{
                padding: 0 !important;
                margin: 0 !important;
                background-color: var(--bg) !important;
            }}
            .doc-container {{
                max-width: 100% !important;
                margin: 0 !important;
                padding: 0 !important;
            }}
            .page-break-spacer {{
                display: none !important;
            }}
            .page-break-before {{
                break-before: page !important;
                page-break-before: always !important;
            }}
            .turn {{
                break-inside: auto !important;
                page-break-inside: auto !important;
                -webkit-box-decoration-break: clone !important;
                box-decoration-break: clone !important;
            }}
            .turn-header {{
                break-inside: avoid !important;
                break-after: avoid !important;
                page-break-after: avoid !important;
            }}
            .markdown-body h1,
            .markdown-body h2,
            .markdown-body h3,
            .markdown-body h4,
            .markdown-body h5,
            .markdown-body h6 {{
                break-inside: avoid !important;
                break-after: avoid !important;
                page-break-after: avoid !important;
            }}
            .thought-container {{
                break-inside: auto !important;
                page-break-inside: auto !important;
                -webkit-box-decoration-break: clone !important;
                box-decoration-break: clone !important;
            }}
            .thought-badge {{
                break-inside: avoid !important;
                break-after: avoid !important;
                page-break-after: avoid !important;
            }}
            .markdown-body pre,
            .codehilite,
            .markdown-body table {{
                break-inside: avoid !important;
                page-break-inside: avoid !important;
            }}
            .markdown-body tr {{
                break-inside: avoid !important;
                page-break-inside: avoid !important;
            }}
            .markdown-body blockquote {{
                break-inside: avoid !important;
                page-break-inside: avoid !important;
                -webkit-box-decoration-break: clone !important;
                box-decoration-break: clone !important;
            }}
            p, li, blockquote {{
                orphans: 3 !important;
                widows: 3 !important;
            }}
        }}
    </style>
</head>
<body>
    <div class="page-bleed-bg" aria-hidden="true"></div>
    {watermark_html}
    <div class="doc-container">
        <header class="doc-header">
            <div class="brand-pill">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                ChatFolio Publication
            </div>
            <h1 class="doc-title">{safe_title}</h1>
            {subtitle_html}
            {author_html}
        </header>

        {metadata_banner_html}

        <main class="turns-wrapper">
            {turns_html}
        </main>

        <footer class="doc-footer">
            <span>Published with ChatFolio Studio</span>
            <span>{date_str}</span>
        </footer>
    </div>

    <!-- KaTeX auto-render on load -->
    <script>
        function triggerKaTeX() {{
            if (typeof renderMathInElement !== 'undefined') {{
                renderMathInElement(document.body, {{
                    delimiters: [
                        {{left: "$$", right: "$$", display: true}},
                        {{left: "$", right: "$", display: false}},
                        {{left: "\\\\(", right: "\\\\)", display: false}},
                        {{left: "\\\\[", right: "\\\\]", display: true}}
                    ],
                    throwOnError: false
                }});
            }}
        }}
        if (document.readyState === 'loading') {{
            document.addEventListener("DOMContentLoaded", triggerKaTeX);
        }} else {{
            triggerKaTeX();
        }}
    </script>
</body>
</html>
"""
    return full_html


def render_pdf_from_html(
    html_content: str,
    output_pdf_path: str,
    timeout_sec: int = 30,
) -> str:
    """Execute Microsoft Edge Headless to print HTML to high-resolution vector PDF."""
    browser_exe = find_browser_executable()
    if not browser_exe:
        raise FileNotFoundError("Microsoft Edge / Chrome executable not found on host system.")

    out_path = Path(output_pdf_path).resolve()
    out_path.parent.mkdir(parents=True, exist_ok=True)

    # Write temporary HTML file
    with tempfile.NamedTemporaryFile("w", suffix=".html", delete=False, encoding="utf-8") as tmp:
        tmp.write(html_content)
        tmp_html_path = Path(tmp.name).resolve()

    tmp_user_dir = tempfile.mkdtemp(prefix="chatfolio_browser_")
    try:
        # Edge / Chromium headless print command
        cmd = [
            browser_exe,
            "--headless=new",
            "--disable-gpu",
            "--no-sandbox",
            "--disable-dev-shm-usage",
            "--no-pdf-header-footer",
            f"--user-data-dir={tmp_user_dir}",
            "--run-all-compositor-stages-before-draw",
            f"--print-to-pdf={str(out_path)}",
            tmp_html_path.as_uri(),
        ]

        try:
            result = subprocess.run(
                cmd,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                timeout=timeout_sec,
                check=False,
            )
        except subprocess.TimeoutExpired:
            raise RuntimeError(f"Edge/Chrome headless PDF rendering timed out after {timeout_sec} seconds.")

        # Allow filesystem flush
        time.sleep(0.3)

        if not out_path.exists() or out_path.stat().st_size == 0:
            err = result.stderr.decode("utf-8", errors="ignore")
            raise RuntimeError(f"Edge headless failed to output PDF: {err}")

        return str(out_path)
    finally:
        try:
            if tmp_html_path.exists():
                tmp_html_path.unlink()
        except Exception:
            pass
        try:
            shutil.rmtree(tmp_user_dir, ignore_errors=True)
        except Exception:
            pass
