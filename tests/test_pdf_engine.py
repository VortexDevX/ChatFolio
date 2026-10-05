import html
import pytest
from backend.pdf_engine import build_document_html, find_browser_executable, get_margin_css


def test_build_document_html_escapes_xss():
    chat_data = {
        "title": "<script>alert('title')</script>",
        "model": "<img src=x onerror=alert(1)>",
        "created_at": "2026-09-24",
        "messages": [
            {
                "id": "msg-1",
                "role": "user",
                "author": "Alice",
                "content": "Hello world",
            }
        ],
    }
    options = {
        "custom_title": "<script>alert('custom')</script>",
        "custom_subtitle": "<b>bold subtitle</b>",
        "author_tag": "<script>evil()</script>",
        "watermark": "<svg onload=alert(2)>",
        "margins": "wide",
    }

    html_out = build_document_html(chat_data, theme="editorial", options=options)

    # User inputs must be escaped
    assert "<script>alert('custom')</script>" not in html_out
    assert html.escape("<script>alert('custom')</script>") in html_out
    assert "<script>evil()</script>" not in html_out
    assert html.escape("<script>evil()</script>") in html_out
    assert "<svg onload=alert(2)>" not in html_out
    assert html.escape("<svg onload=alert(2)>") in html_out


def test_margin_css_calculation():
    # @page rule uses real margins to properly support multi-page responses
    assert "10mm 10mm 10mm 10mm" in get_margin_css("narrow", "A4")
    assert "16mm 14mm 16mm 14mm" in get_margin_css("normal", "A4")
    assert "letter portrait" in get_margin_css("normal", "Letter")
    assert "auto" in get_margin_css("normal", "Continuous")

    # Content margins are passed to body via --page-padding variable
    sample_chat = {"title": "Test", "messages": [{"id": "1", "role": "user", "content": "Hi"}]}
    narrow_html = build_document_html(sample_chat, options={"margins": "narrow"})
    assert "--page-padding: 10mm 10mm 10mm 10mm" in narrow_html

    wide_html = build_document_html(sample_chat, options={"margins": "wide"})
    assert "--page-padding: 24mm 20mm 24mm 20mm" in wide_html


def test_build_document_html_includes_assets_and_thoughts():
    chat_data = {
        "title": "Assets & Thoughts Test",
        "messages": [
            {
                "id": "msg-1",
                "role": "assistant",
                "content": "Here is the response.",
                "thought": "Let me calculate the steps first...",
                "assets": [
                    {
                        "type": "image",
                        "url": "https://example.com/diagram.png",
                        "name": "diagram.png",
                    }
                ],
            }
        ],
    }
    options = {
        "show_thoughts": True,
    }

    html_out = build_document_html(chat_data, theme="academic", options=options)
    assert "Thought Process" in html_out
    assert "Let me calculate the steps first..." in html_out
    assert 'src="https://example.com/diagram.png"' in html_out
    assert "diagram.png" in html_out


def test_find_browser_executable_safe():
    path = find_browser_executable()
    # Should either return a string or None, never raise an unhandled exception
    assert path is None or isinstance(path, str)


def test_empty_selection_exports_zero_messages():
    chat_data = {
        "title": "Empty Selection Chat",
        "messages": [
            {"id": "msg-1", "role": "user", "content": "Hello"},
            {"id": "msg-2", "role": "assistant", "content": "World"},
        ],
    }
    # User selected 0 messages explicitly
    html_out = build_document_html(chat_data, theme="editorial", selected_message_ids=[])
    assert "Hello" not in html_out
    assert "World" not in html_out
    assert "Empty Selection Chat" in html_out


def test_xss_in_markdown_content_and_thought_stripped():
    chat_data = {
        "title": "XSS Test",
        "messages": [
            {
                "id": "msg-1",
                "role": "user",
                "content": "<script>alert('pwned')</script> Hello <b>world</b> <iframe src='evil.html'></iframe>",
                "thought": "<img src=x onerror=alert('thought')> Thinking about it",
            }
        ],
    }
    options = {"show_thoughts": True}
    html_out = build_document_html(chat_data, theme="editorial", options=options)
    assert "alert('pwned')" not in html_out
    assert "alert('thought')" not in html_out
    assert "<iframe" not in html_out
    assert "evil.html" not in html_out
    assert "onerror=" not in html_out
    assert "<b>world</b>" in html_out
    assert "Thinking about it" in html_out


def test_unsafe_asset_urls_neutralized():
    chat_data = {
        "title": "Unsafe Assets Test",
        "messages": [
            {
                "id": "msg-1",
                "role": "assistant",
                "content": "Check this file",
                "assets": [
                    {
                        "type": "file",
                        "url": "javascript:alert('steal_cookie')",
                        "name": "malicious.js",
                    },
                    {
                        "type": "image",
                        "url": "javascript:alert('image_xss')",
                        "name": "fake.png",
                    },
                ],
            }
        ],
    }
    html_out = build_document_html(chat_data, theme="editorial")
    assert "javascript:" not in html_out


def test_page_break_modes_and_print_hardening():
    chat_data = {
        "title": "Pagination Test",
        "messages": [
            {"id": "msg-1", "role": "user", "content": "Question 1"},
            {"id": "msg-2", "role": "assistant", "content": "Answer 1"},
            {"id": "msg-3", "role": "user", "content": "Question 2"},
            {"id": "msg-4", "role": "assistant", "content": "Answer 2"},
        ],
    }

    # 1. Continuous (default): no page-break-before class
    html_continuous = build_document_html(chat_data, options={"page_break_mode": "continuous"})
    assert 'class="turn turn-user page-break-before"' not in html_continuous
    assert 'class="turn turn-ai page-break-before"' not in html_continuous

    # 2. Pair: break before user prompt on subsequent turns (idx > 1 and is_user)
    html_pair = build_document_html(chat_data, options={"page_break_mode": "pair"})
    # msg-1 is turn 1 user, should NOT break
    assert '<article class="turn turn-user" data-turn-id="msg-1">' in html_pair
    # msg-2 is turn 2 assistant, should NOT break
    assert '<article class="turn turn-ai" data-turn-id="msg-2">' in html_pair
    # msg-3 is turn 3 user, SHOULD break before with spacer
    assert '<div class="page-break-spacer" aria-hidden="true"></div>' in html_pair
    assert '<article class="turn turn-user page-break-before" data-turn-id="msg-3">' in html_pair
    # msg-4 is turn 4 assistant, should NOT break
    assert '<article class="turn turn-ai" data-turn-id="msg-4">' in html_pair

    # 3. Message: break before every message after turn 1
    html_message = build_document_html(chat_data, options={"page_break_mode": "message"})
    assert '<article class="turn turn-user" data-turn-id="msg-1">' in html_message
    assert '<article class="turn turn-ai page-break-before" data-turn-id="msg-2">' in html_message
    assert '<article class="turn turn-user page-break-before" data-turn-id="msg-3">' in html_message
    assert '<article class="turn turn-ai page-break-before" data-turn-id="msg-4">' in html_message

    # 4. Print engine hardening and default flow verification
    assert "orphans: 3" in html_continuous
    assert "widows: 3" in html_continuous
    assert "box-decoration-break: clone" in html_continuous
    assert "break-before: page !important" in html_continuous
    assert "--page-top-margin:" in html_continuous
    assert "Published with ChatFolio Studio" in html_continuous
    assert "ChatFolio Publication" in html_continuous

    # 5. Defaults: message mode, show_thoughts: False, and editorial theme are default
    html_default = build_document_html(chat_data)
    assert 'data-theme="editorial"' in html_default
    assert '<div class="page-break-spacer" aria-hidden="true"></div>' in html_default
    assert '<article class="turn turn-ai page-break-before" data-turn-id="msg-2">' in html_default
    assert '<article class="turn turn-user page-break-before" data-turn-id="msg-3">' in html_default
    assert '<article class="turn turn-ai page-break-before" data-turn-id="msg-4">' in html_default

