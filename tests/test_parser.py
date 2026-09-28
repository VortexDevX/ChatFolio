import pytest
from backend.parser import fetch_share_page, parse_chat_json, parse_share_html


def test_ssrf_protection_rejects_invalid_scheme():
    with pytest.raises(ValueError, match="Invalid URL format."):
        fetch_share_page("file:///etc/passwd")

    with pytest.raises(ValueError, match="Invalid URL protocol. Only HTTP and HTTPS links are allowed."):
        fetch_share_page("ftp://chatgpt.com/share/12345")


def test_ssrf_protection_rejects_disallowed_hosts():
    disallowed_urls = [
        "https://evil.com/share/12345",
        "http://169.254.169.254/metadata",
        "http://localhost:8000/internal",
        "https://attacker.org/chatgpt.com",
    ]
    for url in disallowed_urls:
        with pytest.raises(ValueError, match="Unsupported domain"):
            fetch_share_page(url)


def test_parse_chat_json_linear():
    mapping_data = {
        "title": "Quantum Physics Conversation",
        "model": "gpt-4o",
        "mapping": {
            "root": {
                "id": "root",
                "message": None,
                "parent": None,
                "children": ["msg-1"],
            },
            "msg-1": {
                "id": "msg-1",
                "parent": "root",
                "children": ["msg-2"],
                "message": {
                    "author": {"role": "user"},
                    "create_time": 1700000000,
                    "content": {
                        "content_type": "text",
                        "parts": ["Explain quantum entanglement simply."],
                    },
                },
            },
            "msg-2": {
                "id": "msg-2",
                "parent": "msg-1",
                "children": [],
                "message": {
                    "author": {"role": "assistant"},
                    "create_time": 1700000005,
                    "content": {
                        "content_type": "text",
                        "parts": ["Quantum entanglement is a phenomenon where particles share state."],
                    },
                },
            },
        },
    }

    result = parse_chat_json(mapping_data)
    assert result.title == "Quantum Physics Conversation"
    assert result.model == "gpt-4o"
    assert len(result.messages) == 2
    assert result.messages[0].role == "user"
    assert "Explain quantum entanglement" in result.messages[0].content
    assert result.messages[1].role == "assistant"
    assert "particles share state" in result.messages[1].content


def test_parse_chat_json_branching_with_current_node():
    # Tree where msg-1 has two children: msg-2a (old) and msg-2b (regenerated/active)
    mapping_data = {
        "title": "Branching Conversation",
        "current_node": "msg-2b",
        "mapping": {
            "root": {
                "id": "root",
                "message": None,
                "parent": None,
                "children": ["msg-1"],
            },
            "msg-1": {
                "id": "msg-1",
                "parent": "root",
                "children": ["msg-2a", "msg-2b"],
                "message": {
                    "author": {"role": "user"},
                    "content": {"content_type": "text", "parts": ["What is 2+2?"]},
                },
            },
            "msg-2a": {
                "id": "msg-2a",
                "parent": "msg-1",
                "children": [],
                "message": {
                    "author": {"role": "assistant"},
                    "content": {"content_type": "text", "parts": ["It might be 4."]},
                },
            },
            "msg-2b": {
                "id": "msg-2b",
                "parent": "msg-1",
                "children": [],
                "message": {
                    "author": {"role": "assistant"},
                    "content": {"content_type": "text", "parts": ["2 + 2 = 4."]},
                },
            },
        },
    }

    result = parse_chat_json(mapping_data)
    assert len(result.messages) == 2
    # Ensure active branch (msg-2b) was traversed, not msg-2a
    assert result.messages[1].content == "2 + 2 = 4."


def test_parse_share_html_dom_fallback():
    html_markup = """
    <!DOCTYPE html>
    <html>
      <head><title>Test Chat - ChatGPT</title></head>
      <body>
        <main>
          <div data-message-author-role="user">
            <p>How far is the moon?</p>
          </div>
          <div data-message-author-role="assistant">
            <p>The Moon is approximately 384,400 km from Earth.</p>
          </div>
        </main>
      </body>
    </html>
    """
    result = parse_share_html(html_markup)
    assert len(result.messages) == 2
    assert result.messages[0].role == "user"
    assert "How far is the moon?" in result.messages[0].content
    assert result.messages[1].role == "assistant"
    assert "384,400 km" in result.messages[1].content


def test_parse_chat_json_multimodal_parts():
    mapping_data = {
        "title": "Multimodal Chat",
        "mapping": {
            "root": {
                "id": "root",
                "children": ["msg-1"],
            },
            "msg-1": {
                "id": "msg-1",
                "parent": "root",
                "children": [],
                "message": {
                    "author": {"role": "assistant"},
                    "content": {
                        "content_type": "multimodal_text",
                        "parts": [
                            "Here is the chart:",
                            {"asset_pointer": "file-service://file-abc", "content_type": "image_asset_pointer"},
                            "And summary below.",
                        ],
                    },
                },
            },
        },
    }
    result = parse_chat_json(mapping_data)
    assert len(result.messages) == 1
    content = result.messages[0].content
    assert "Here is the chart:" in content
    assert "And summary below." in content
