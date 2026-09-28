"""ChatGPT Shared Conversation Parser

Extracts structured conversation data from public ChatGPT share links,
supporting modern React Flight streaming loader payloads, legacy Next.js data,
post share formats, raw HTML fallback, and official export JSON trees.
"""

from __future__ import annotations

import ipaddress
import json
import re
import socket
import time
from dataclasses import dataclass, field
from datetime import datetime
from html.parser import HTMLParser
from typing import Any, Dict, List, Mapping, Optional, Sequence, Tuple, Union, cast
from urllib.parse import urljoin, urlparse
import requests

JsonScalar = Union[str, int, float, bool, None]
JsonValue = Union[JsonScalar, Dict[str, "JsonValue"], List["JsonValue"]]

DEFAULT_HEADERS: Dict[str, str] = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36"
    ),
    "Sec-Ch-Ua": '"Chromium";v="128", "Not=A?Brand";v="24", "Google Chrome";v="128"',
    "Sec-Ch-Ua-Mobile": "?0",
    "Sec-Ch-Ua-Platform": '"Windows"',
    "Accept": (
        "text/html,application/xhtml+xml,application/xml;q=0.9,"
        "image/avif,image/webp,image/apng,*/*;q=0.8"
    ),
    "Accept-Language": "en-US,en;q=0.9",
    "Cache-Control": "no-cache",
    "Pragma": "no-cache",
}

CITATION_TOKEN_PATTERN = re.compile(r"[\ue000-\uf8ff]|【[^】]*†[^】]*】|【\d+[^】]*】")
PRIVATE_USE_PATTERN = re.compile(r"[\ue000-\uf8ff]")


class _ScriptCollector(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self._in_script = False
        self._current_attrs: Dict[str, str] = {}
        self._current_data: List[str] = []
        self.scripts: List[Tuple[Dict[str, str], str]] = []

    def handle_starttag(self, tag: str, attrs: Sequence[Tuple[str, Optional[str]]]) -> None:
        if tag.lower() == "script":
            self._in_script = True
            self._current_attrs = {name: (value or "") for name, value in attrs}
            self._current_data = []

    def handle_endtag(self, tag: str) -> None:
        if tag.lower() == "script" and self._in_script:
            content = "".join(self._current_data)
            self.scripts.append((self._current_attrs, content))
            self._in_script = False
            self._current_attrs = {}
            self._current_data = []

    def handle_data(self, data: str) -> None:
        if self._in_script:
            self._current_data.append(data)


def _extract_scripts(html: str) -> List[Tuple[Dict[str, str], str]]:
    parser = _ScriptCollector()
    parser.feed(html)
    parser.close()
    return parser.scripts


def strip_citation_tokens(text: str) -> str:
    cleaned_lines = []
    for line in text.split("\n"):
        cleaned = CITATION_TOKEN_PATTERN.sub("", line).rstrip()
        cleaned_lines.append(cleaned)
    return "\n".join(cleaned_lines)


def strip_private_use(text: str) -> str:
    return PRIVATE_USE_PATTERN.sub("", text)


def extract_loader_payload(html: str) -> Optional[List[JsonValue]]:
    """Extract React Flight loader streaming payload from script tags."""
    for _attrs, text in _extract_scripts(html):
        if not text or "streamController.enqueue" not in text:
            continue
        decoder = json.JSONDecoder()
        start = 0
        while True:
            anchor = text.find("streamController.enqueue(", start)
            if anchor == -1:
                break
            anchor += len("streamController.enqueue(")
            quote_pos = text.find('"', anchor)
            next_close = text.find(");", anchor)
            if quote_pos != -1 and (next_close == -1 or quote_pos < next_close):
                try:
                    chunk, end_offset = decoder.raw_decode(text, quote_pos)
                except json.JSONDecodeError:
                    start = anchor + 1
                    continue
                start = end_offset
            else:
                end = text.find(");", anchor)
                if end == -1:
                    break
                chunk = text[anchor:end].strip()
                if chunk.startswith("(") and chunk.endswith(")"):
                    chunk = chunk[1:-1].strip()
                start = end + 2
            if isinstance(chunk, str):
                chunk = chunk.strip()
            if isinstance(chunk, str) and chunk.startswith("["):
                try:
                    parsed_chunk = json.loads(chunk)
                except json.JSONDecodeError:
                    parsed_chunk = None
                if isinstance(parsed_chunk, list):
                    return cast(List[JsonValue], parsed_chunk)
    return None


def decode_loader(loader: List[JsonValue]) -> Dict[str, JsonValue]:
    """Decode flattened index-referenced loader array into structured objects."""
    cache: Dict[int, JsonValue] = {}

    def decode_key(raw_key: JsonValue) -> str:
        if isinstance(raw_key, str) and raw_key.startswith("_") and raw_key[1:].isdigit():
            idx = int(raw_key[1:])
            if 0 <= idx < len(loader):
                candidate = loader[idx]
                if isinstance(candidate, str):
                    return candidate
        return str(raw_key)

    def resolve(value: JsonValue) -> JsonValue:
        if type(value) is int:
            if value in cache:
                return cache[value]
            if not (0 <= value < len(loader)):
                return cast(JsonValue, value)
            cache[value] = cast(JsonValue, None)
            resolved_value = resolve(loader[value])
            cache[value] = resolved_value
            return resolved_value
        if isinstance(value, list):
            return cast(JsonValue, [resolve(item) for item in value])
        if isinstance(value, dict):
            return cast(
                JsonValue,
                {decode_key(k): resolve(v) for k, v in value.items()},
            )
        return value

    resolved: Dict[str, JsonValue] = {}
    iterator = iter(loader[1:])
    for key in iterator:
        try:
            value = next(iterator)
        except StopIteration:
            break
        if isinstance(key, str) and key not in resolved:
            resolved[key] = resolve(value)
    return resolved


@dataclass
class ChatAsset:
    asset_type: str
    url: str
    filename: str
    description: Optional[str] = None


@dataclass
class ChatMessage:
    id: str
    role: str
    author: str
    content: str
    created_at: Optional[float] = None
    thought: Optional[str] = None
    assets: List[ChatAsset] = field(default_factory=list)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "role": self.role,
            "author": self.author,
            "content": self.content,
            "created_at": self.created_at,
            "thought": self.thought,
            "assets": [
                {
                    "asset_type": a.asset_type,
                    "url": a.url,
                    "filename": a.filename,
                    "description": a.description,
                }
                for a in self.assets
            ],
        }


@dataclass
class ChatConversation:
    share_id: str
    title: str
    model: str
    updated_at: Optional[float]
    messages: List[ChatMessage]

    def to_dict(self) -> Dict[str, Any]:
        return {
            "share_id": self.share_id,
            "title": self.title or "ChatGPT Conversation",
            "model": self.model or "ChatGPT",
            "updated_at": self.updated_at,
            "messages": [m.to_dict() for m in self.messages],
        }


def _extract_message_parts(message_obj: Mapping[str, Any]) -> Tuple[str, Optional[str], List[ChatAsset]]:
    content = message_obj.get("content") or {}
    if not isinstance(content, Mapping):
        return "", None, []

    content_type = content.get("content_type")
    text_parts: List[str] = []
    thought_parts: List[str] = []
    assets: List[ChatAsset] = []

    # Text content
    if content_type == "text":
        parts = content.get("parts", [])
        if isinstance(parts, list):
            for part in parts:
                if not isinstance(part, str):
                    continue
                cleaned = strip_private_use(part).strip("\n")
                if cleaned.startswith("{") and cleaned.endswith("}"):
                    try:
                        maybe_json = json.loads(cleaned)
                        if isinstance(maybe_json, dict) and "response" in maybe_json:
                            cleaned = str(maybe_json["response"])
                    except json.JSONDecodeError:
                        pass
                text_parts.append(cleaned)

    # Code content
    elif content_type == "code":
        lang = content.get("language") or ""
        code_text = content.get("text") or ""
        text_parts.append(f"```{lang}\n{code_text}\n```")

    # Multimodal content (text + image pointers)
    elif content_type in ("multimodal_text", "multimodal"):
        parts = content.get("parts", [])
        if isinstance(parts, list):
            for part in parts:
                if isinstance(part, str):
                    cleaned = strip_private_use(part).strip("\n")
                    text_parts.append(cleaned)
                elif isinstance(part, Mapping):
                    p_type = part.get("content_type")
                    if p_type == "text" or "text" in part:
                        t = part.get("text") or ""
                        if isinstance(t, str):
                            text_parts.append(strip_private_use(t).strip("\n"))
                    elif p_type in ("image_asset_pointer", "image") or "asset_pointer" in part or "image_url" in part:
                        url = part.get("download_url") or part.get("image_url") or part.get("url") or ""
                        filename = part.get("filename") or part.get("name") or "image.png"
                        if url and isinstance(url, str):
                            assets.append(ChatAsset(asset_type="image", url=url, filename=str(filename)))

    # Reasoning / Thought (o1/o3/DeepSeek)
    elif content_type in ("thought", "reasoning"):
        parts = content.get("parts", [])
        if isinstance(parts, list):
            for p in parts:
                if isinstance(p, str):
                    thought_parts.append(p.strip())

    # Metadata attachments (e.g. DALL-E, file uploads)
    metadata = message_obj.get("metadata") or {}
    if isinstance(metadata, Mapping):
        # Check thought in metadata
        thought_field = metadata.get("thought") or metadata.get("reasoning")
        if isinstance(thought_field, str) and thought_field.strip():
            thought_parts.append(thought_field.strip())

        attachments = metadata.get("attachments") or []
        if isinstance(attachments, list):
            for att in attachments:
                if not isinstance(att, Mapping):
                    continue
                url = att.get("download_url") or att.get("file_url")
                if not url or not isinstance(url, str):
                    continue
                name = att.get("name") or att.get("title") or "file"
                file_type = att.get("file_type") or att.get("type") or "file"
                is_img = "image" in file_type.lower() or name.lower().endswith((".png", ".jpg", ".jpeg", ".webp"))
                assets.append(
                    ChatAsset(
                        asset_type="image" if is_img else "file",
                        url=url,
                        filename=str(name),
                        description=att.get("title"),
                    )
                )

    combined_text = "\n\n".join(p for p in text_parts if p.strip())
    combined_text = strip_citation_tokens(combined_text)
    combined_thought = "\n\n".join(thought_parts).strip() if thought_parts else None

    return combined_text, combined_thought, assets


def is_ignorable_message(role: Optional[str], content: str, assets: Optional[List[Any]] = None) -> bool:
    """Check if message is internal plumbing, plugin redacted placeholder, or tool execution."""
    r = (role or "").strip().lower()
    if r in ("system", "tool"):
        return True

    c = (content or "").strip().lower()
    if not c and not (assets and len(assets) > 0):
        return True
    if "the output of this plugin was redacted" in c:
        return True
    if c.startswith("original custom instructions no longer available"):
        return True
    return False


def parse_share_html(html: str) -> ChatConversation:
    """Parse ChatGPT share HTML using React Flight streaming, legacy __NEXT_DATA__, or post share."""
    loader = extract_loader_payload(html)
    if loader is not None:
        decoded = decode_loader(loader)
        loader_data = decoded.get("loaderData")
        if isinstance(loader_data, Mapping):
            # Check 1: Modern share route
            share_route = loader_data.get("routes/share.$shareId.($action)")
            if isinstance(share_route, Mapping):
                server_resp = share_route.get("serverResponse") or {}
                data = server_resp.get("data") or {}
                share_id = str(share_route.get("sharedConversationId") or "shared")
                title = str(data.get("title") or "")
                model_info = data.get("model") or {}
                model_slug = str(model_info.get("slug") or "") if isinstance(model_info, Mapping) else ""
                updated_raw = data.get("update_time")
                updated_at = float(updated_raw) if isinstance(updated_raw, (int, float)) else None

                seq = data.get("linear_conversation") or []
                mapping = data.get("mapping") or {}
                messages: List[ChatMessage] = []

                if isinstance(seq, list) and seq:
                    for idx, node in enumerate(seq):
                        if not isinstance(node, Mapping):
                            continue
                        msg = node.get("message")
                        if not isinstance(msg, Mapping):
                            node_id = node.get("id")
                            if node_id and isinstance(mapping, Mapping) and node_id in mapping:
                                mapped_node = mapping.get(node_id) or {}
                                msg = mapped_node.get("message") if isinstance(mapped_node, Mapping) else None
                        if not isinstance(msg, Mapping):
                            continue
                        author_info = msg.get("author") or {}
                        role = author_info.get("role") or "assistant"
                        content_str, thought_str, assets = _extract_message_parts(msg)
                        if is_ignorable_message(role, content_str, assets):
                            continue
                        author = "User" if role == "user" else "ChatGPT"
                        msg_id = str(msg.get("id") or f"msg-{idx}")
                        create_time = msg.get("create_time")
                        created_at = float(create_time) if isinstance(create_time, (int, float)) else None
                        messages.append(
                            ChatMessage(
                                id=msg_id,
                                role=str(role),
                                author=author,
                                content=content_str,
                                created_at=created_at,
                                thought=thought_str,
                                assets=assets,
                            )
                        )
                if messages:
                    return ChatConversation(
                        share_id=share_id,
                        title=title,
                        model=model_slug,
                        updated_at=updated_at,
                        messages=messages,
                    )

            # Check 2: Post share route (routes/s.$postId)
            post_route = loader_data.get("routes/s.$postId")
            if isinstance(post_route, Mapping):
                profile = post_route.get("postWithProfile") or {}
                post = profile.get("post") or {} if isinstance(profile, Mapping) else {}
                share_id = str(post.get("id") or "shared")
                title = str(post.get("text") or "Shared Conversation")
                posted_at = post.get("posted_at")
                updated_at = float(posted_at) if isinstance(posted_at, (int, float)) else None
                messages = []
                attachments = post.get("attachments") or []
                if isinstance(attachments, list):
                    for att in attachments:
                        if not isinstance(att, Mapping) or att.get("kind") != "message_slice":
                            continue
                        raw_msgs = att.get("messages") or []
                        if isinstance(raw_msgs, list):
                            for idx, msg in enumerate(raw_msgs):
                                if not isinstance(msg, Mapping):
                                    continue
                                author_info = msg.get("author") or {}
                                role = author_info.get("role") or "assistant"
                                content_str, thought_str, assets = _extract_message_parts(msg)
                                if is_ignorable_message(role, content_str, assets):
                                    continue
                                author = "User" if role == "user" else "ChatGPT"
                                msg_id = str(msg.get("id") or f"msg-{idx}")
                                create_time = msg.get("create_time")
                                created_at = float(create_time) if isinstance(create_time, (int, float)) else None
                                messages.append(
                                    ChatMessage(
                                        id=msg_id,
                                        role=str(role),
                                        author=author,
                                        content=content_str,
                                        created_at=created_at,
                                        thought=thought_str,
                                        assets=assets,
                                    )
                                )
                if messages:
                    return ChatConversation(
                        share_id=share_id,
                        title=title,
                        model="",
                        updated_at=updated_at,
                        messages=messages,
                    )

    # Check 3: Legacy __NEXT_DATA__
    for attrs, text in _extract_scripts(html):
        if attrs.get("id") == "__NEXT_DATA__" and text:
            try:
                payload = json.loads(text)
                props = payload.get("props") or {}
                page_props = props.get("pageProps") or {}
                server_resp = page_props.get("serverResponse") or {}
                data = server_resp.get("data") or {}
                share_id = str(data.get("conversation_id") or "shared")
                title = str(data.get("title") or "")
                model_info = data.get("model") or {}
                model_slug = str(model_info.get("slug") or "") if isinstance(model_info, Mapping) else ""
                updated_raw = data.get("update_time")
                updated_at = float(updated_raw) if isinstance(updated_raw, (int, float)) else None

                seq = data.get("linear_conversation") or []
                messages = []
                for idx, node in enumerate(seq):
                    if not isinstance(node, Mapping):
                        continue
                    msg = node.get("message")
                    if not isinstance(msg, Mapping):
                        continue
                    author_info = msg.get("author") or {}
                    role = author_info.get("role") or "assistant"
                    content_str, thought_str, assets = _extract_message_parts(msg)
                    if is_ignorable_message(role, content_str, assets):
                        continue
                    author = "User" if role == "user" else "ChatGPT"
                    msg_id = str(msg.get("id") or f"msg-{idx}")
                    create_time = msg.get("create_time")
                    created_at = float(create_time) if isinstance(create_time, (int, float)) else None
                    messages.append(
                        ChatMessage(
                            id=msg_id,
                            role=str(role),
                            author=author,
                            content=content_str,
                            created_at=created_at,
                            thought=thought_str,
                            assets=assets,
                        )
                    )
                if messages:
                    return ChatConversation(
                        share_id=share_id,
                        title=title,
                        model=model_slug,
                        updated_at=updated_at,
                        messages=messages,
                    )
            except Exception:
                pass

    # Check 4: Fallback DOM parser for raw HTML (e.g. copied from elements)
    fallback = _parse_dom_fallback(html)
    if fallback and fallback.messages:
        return fallback

    raise ValueError("Could not extract ChatGPT conversation from provided HTML. Please ensure the link is a public shared chat.")


def _parse_dom_fallback(html: str) -> Optional[ChatConversation]:
    """Parse text and turns from plain DOM when internal JSON scripts are absent."""
    # Look for title in <title>...</title>
    title_match = re.search(r"<title>(.*?)</title>", html, re.IGNORECASE | re.DOTALL)
    title = title_match.group(1).split("- ChatGPT")[0].strip() if title_match else "Shared Conversation"

    # Match conversation turns by data-message-author-role on div, article, or section
    pattern = re.compile(
        r'<(?:div|article|section)[^>]*data-message-author-role="([^"]+)"[^>]*>(.*?)</(?:div|article|section)>',
        re.DOTALL | re.IGNORECASE,
    )
    matches = pattern.findall(html)
    if not matches:
        # Fallback to loose attribute match
        pattern_loose = re.compile(
            r'data-message-author-role="([^"]+)"[^>]*>(.*?)(?=(?:data-message-author-role=|$))',
            re.DOTALL | re.IGNORECASE,
        )
        matches = pattern_loose.findall(html)
    if not matches:
        return None

    messages: List[ChatMessage] = []
    for idx, (role, body) in enumerate(matches):
        # Strip html tags simply
        clean_text = re.sub(r"<[^>]+>", " ", body)
        clean_text = " ".join(clean_text.split()).strip()
        if is_ignorable_message(role, clean_text):
            continue
        author = "User" if role == "user" else "ChatGPT"
        messages.append(
            ChatMessage(
                id=f"dom-{idx}",
                role=role.lower(),
                author=author,
                content=clean_text,
                created_at=time.time(),
                assets=[],
            )
        )

    if messages:
        return ChatConversation(
            share_id="dom-export",
            title=title,
            model="ChatGPT",
            updated_at=time.time(),
            messages=messages,
        )
    return None


def parse_chat_json(data: Mapping[str, Any]) -> ChatConversation:
    """Parse raw JSON (e.g. from conversations.json or API snapshot)."""
    title = str(data.get("title") or "Exported Conversation")
    share_id = str(data.get("id") or data.get("conversation_id") or "export")
    model = str(data.get("model") or "")
    updated_at = float(data.get("update_time") or time.time())

    mapping = data.get("mapping")
    messages: List[ChatMessage] = []

    if isinstance(mapping, Mapping):
        # Reconstruct tree in order by finding root or active linear chain
        nodes = list(mapping.values())
        id_to_node = {n.get("id"): n for n in nodes if isinstance(n, Mapping) and n.get("id")}

        # Prefer active leaf path if current_node is provided
        current_node_id = data.get("current_node")
        if current_node_id and current_node_id in id_to_node:
            chain: List[Mapping[str, Any]] = []
            curr: Optional[Mapping[str, Any]] = id_to_node[current_node_id]
            visited = set()
            while curr and curr.get("id") not in visited:
                visited.add(curr.get("id"))
                chain.append(curr)
                parent_id = curr.get("parent")
                curr = id_to_node.get(parent_id) if parent_id else None
            chain.reverse()

            for node in chain:
                msg = node.get("message")
                if isinstance(msg, Mapping):
                    author_info = msg.get("author") or {}
                    role = author_info.get("role") or "assistant"
                    content_str, thought_str, assets = _extract_message_parts(msg)
                    if not is_ignorable_message(role, content_str, assets):
                        messages.append(
                            ChatMessage(
                                id=str(msg.get("id") or len(messages)),
                                role=str(role),
                                author="User" if role == "user" else "ChatGPT",
                                content=content_str,
                                created_at=msg.get("create_time"),
                                thought=thought_str,
                                assets=assets,
                            )
                        )
        else:
            # Find root: node with no parent or parent is null
            root = None
            for n in nodes:
                if isinstance(n, Mapping) and not n.get("parent"):
                    root = n
                    break

            current = root
            visited = set()
            while current and current.get("id") not in visited:
                visited.add(current.get("id"))
                msg = current.get("message")
                if isinstance(msg, Mapping):
                    author_info = msg.get("author") or {}
                    role = author_info.get("role") or "assistant"
                    content_str, thought_str, assets = _extract_message_parts(msg)
                    if not is_ignorable_message(role, content_str, assets):
                        messages.append(
                            ChatMessage(
                                id=str(msg.get("id") or len(messages)),
                                role=str(role),
                                author="User" if role == "user" else "ChatGPT",
                                content=content_str,
                                created_at=msg.get("create_time"),
                                thought=thought_str,
                                assets=assets,
                            )
                        )
                children = current.get("children") or []
                if children and isinstance(children, list):
                    # Pick latest regenerated child branch that exists in id_to_node
                    next_id = next((cid for cid in reversed(children) if cid in id_to_node), None)
                    current = id_to_node[next_id] if next_id else None
                else:
                    break
    elif isinstance(data.get("messages"), list):
        for idx, m in enumerate(data["messages"]):
            if isinstance(m, Mapping):
                role = str(m.get("role") or "assistant")
                raw_c = m.get("content")
                if isinstance(raw_c, Mapping):
                    content_str, thought_str, m_assets = _extract_message_parts(m)
                else:
                    content_str = str(raw_c or "")
                    thought_str = m.get("thought")
                    m_assets = []
                if is_ignorable_message(role, content_str, m_assets):
                    continue
                messages.append(
                    ChatMessage(
                        id=str(m.get("id") or idx),
                        role=role,
                        author=str(m.get("author") or ("User" if role == "user" else "ChatGPT")),
                        content=content_str,
                        created_at=m.get("created_at"),
                        thought=thought_str,
                        assets=m_assets,
                    )
                )

    return ChatConversation(
        share_id=share_id,
        title=title,
        model=model,
        updated_at=updated_at,
        messages=messages,
    )


def _validate_safe_url(url: str) -> None:
    """Validate URL protocol, hostname whitelist, and enforce non-private IP resolution."""
    parsed = urlparse(url)
    if not parsed.scheme or not parsed.netloc:
        raise ValueError("Invalid URL format.")

    if parsed.scheme.lower() not in ("http", "https"):
        raise ValueError("Invalid URL protocol. Only HTTP and HTTPS links are allowed.")

    hostname = (parsed.hostname or "").lower()
    allowed_hosts = ("chatgpt.com", "chat.openai.com", "openai.com")
    is_valid_host = (
        hostname in allowed_hosts
        or any(hostname.endswith("." + h) for h in allowed_hosts)
    )
    if not is_valid_host:
        raise ValueError(
            f"Unsupported domain '{hostname}'. Please provide a valid ChatGPT shared link "
            "(https://chatgpt.com/share/... or https://chat.openai.com/share/...)."
        )

    # DNS Resolution & IP safety verification to block intranet SSRF and DNS rebinding
    try:
        port = parsed.port or (443 if parsed.scheme.lower() == "https" else 80)
        addr_infos = socket.getaddrinfo(hostname, port)
        for _fam, _sock, _proto, _canon, sockaddr in addr_infos:
            ip_str = sockaddr[0]
            ip_obj = ipaddress.ip_address(ip_str)
            if not ip_obj.is_global:
                raise ValueError(f"Restricted target IP address '{ip_str}' resolved for host '{hostname}'.")
    except socket.gaierror as e:
        raise ValueError(f"DNS resolution failed for host '{hostname}': {e}")


def fetch_share_page(url: str, timeout: int = 25) -> str:
    """Fetch public ChatGPT share page using browser-grade headers and strict SSRF defenses."""
    cur_url = url
    for _redirect_count in range(5):
        _validate_safe_url(cur_url)
        parsed = urlparse(cur_url)
        path = parsed.path or ""
        if "/c/" in path:
            raise ValueError(
                "This link appears to be a private conversation link (/c/...). "
                "Please click the 'Share' icon in ChatGPT to generate a public share link (https://chatgpt.com/share/...)."
            )

        headers = {**DEFAULT_HEADERS, "Referer": "https://chatgpt.com/"}
        resp = None

        # Retry on transient network glitches
        for attempt in range(3):
            try:
                resp = requests.get(cur_url, headers=headers, timeout=timeout, allow_redirects=False)
                break
            except (requests.ConnectionError, requests.Timeout):
                if attempt == 2:
                    raise
                time.sleep(1.2 * (attempt + 1))

        if resp is None:
            raise RuntimeError("Failed to fetch share link after retries.")

        # Explicitly validate and follow redirects safely
        if resp.status_code in (301, 302, 303, 307, 308):
            location = resp.headers.get("Location")
            if not location:
                raise ValueError("Redirect response missing Location header.")
            cur_url = urljoin(cur_url, location)
            continue

        if resp.status_code in (403, 429):
            lower_body = resp.text.lower()
            if any(term in lower_body for term in ("cloudflare", "turnstile", "just a moment", "challenge")):
                raise PermissionError("Cloudflare verification challenge detected by ChatGPT.")

        resp.raise_for_status()
        return resp.text

    raise ValueError("Too many redirects encountered while fetching share link.")
