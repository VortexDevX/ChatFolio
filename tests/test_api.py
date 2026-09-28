import pytest
from fastapi.testclient import TestClient
from backend.app import app

client = TestClient(app)


def test_api_health():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "editorial" in data["themes"]
    assert "has_chrome" in data


def test_api_samples():
    response = client.get("/api/samples")
    assert response.status_code == 200
    data = response.json()
    assert "samples" in data
    assert isinstance(data["samples"], list)
    assert len(data["samples"]) > 0
    first = data["samples"][0]
    assert "id" in first
    assert "title" in first


def test_api_parse_raw_json():
    payload = {
        "raw": """
        {
          "title": "API Test",
          "mapping": {
            "root": { "id": "root", "children": ["1"] },
            "1": {
              "id": "1",
              "parent": "root",
              "children": [],
              "message": {
                "author": { "role": "user" },
                "content": { "content_type": "text", "parts": ["Hello FastAPI"] }
              }
            }
          }
        }
        """
    }
    response = client.post("/api/parse-raw", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert len(data["messages"]) == 1
    assert data["messages"][0]["role"] == "user"
    assert "Hello FastAPI" in data["messages"][0]["content"]


def test_api_export_html():
    payload = {
        "chat": {
            "title": "FastAPI Guide",
            "model": "gpt-4o",
            "messages": [
                {
                    "id": "msg-1",
                    "role": "user",
                    "content": "Teach me decorators.",
                },
                {
                    "id": "msg-2",
                    "role": "assistant",
                    "content": "Decorators wrap functions.",
                },
            ],
        },
        "theme": "editorial",
        "options": {
            "custom_title": "Custom FastAPI Guide",
        },
        "selected_ids": ["msg-1", "msg-2"],
    }
    response = client.post("/api/export-html", json=payload)
    assert response.status_code == 200
    html_text = response.text
    assert "<!DOCTYPE html>" in html_text
    assert "Custom FastAPI Guide" in html_text
    assert "Decorators wrap functions." in html_text


def test_api_fetch_invalid_domain_blocked():
    payload = {
        "url": "https://malicious-site.com/share/steal-tokens"
    }
    response = client.post("/api/fetch", json=payload)
    assert response.status_code == 400
    assert "Unsupported domain" in response.json()["detail"]


def test_api_parse_raw_payload_too_large():
    # 26MB exceeds 25MB limit
    large_payload = {"raw": "x" * (26 * 1024 * 1024)}
    response = client.post("/api/parse-raw", json=large_payload)
    assert response.status_code == 413
    assert "Payload exceeds maximum limit of 25MB." in response.json()["detail"]


def test_api_export_html_empty_selection():
    payload = {
        "chat": {
            "title": "Selection Test",
            "messages": [
                {"id": "msg-1", "role": "user", "content": "Question"},
                {"id": "msg-2", "role": "assistant", "content": "Answer"},
            ],
        },
        "theme": "editorial",
        "options": {},
        "selected_ids": [],
    }
    response = client.post("/api/export-html", json=payload)
    assert response.status_code == 200
    assert "Question" not in response.text
    assert "Answer" not in response.text
    assert "Selection Test" in response.text
