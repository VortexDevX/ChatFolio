# 📖 ChatFolio Studio

<div align="center">

**The Editorial AI Publishing Studio**  
_Transform AI conversations into publication-grade folios, monographs, and vector PDFs with live typography, native KaTeX math, and custom editorial finishes._

[![Python](https://img.shields.io/badge/Python-3.10%2B-blue.svg)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115%2B-009688.svg)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18-61DAFB.svg)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6.svg)](https://www.typescriptlang.org)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC.svg)](https://tailwindcss.com)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

</div>

---

## 🌟 The Core Vision

**ChatFolio** completely reimagines how AI dialogues become permanent knowledge. Instead of treating AI chat exports as endless message logs, ChatFolio views them as **Anthologies & Folios**:

- **The Storyboard Filmstrip**: Each conversational prompt and response is an illuminated chapter block with detected content signatures (_LaTeX Math_, _Code Implementation_, _Expository Prose_).
- **The Virtual Printing Desk**: A genuine live WYSIWYG paper canvas with realistic drop shadows, real margins, and instant preview rendering.
- **The Finishes & Print Cabinet**: Instantly switch between luxury book finishes, curated typography, paper sizes, and privacy redaction.
- **Docked Command Controller**: Cleanly docked to the bottom of the studio with zero content or equation overlap.

---

## ✨ Key Features

### 1. 🖨️ Precision Vector PDF Engine

- **Razor-Sharp Vector Output**: Leverages Microsoft Edge / Google Chrome / Chromium headless engine (`--headless --print-to-pdf`) to produce true vector text, selectable fonts, and crisp page breaks.
- **Journal-Grade KaTeX Math**: Renders both inline math (`$E=mc^2$`) and complex multiline equations (`$$\ket{\psi^-} = \frac{1}{\sqrt{2}}(\ket{00} - \ket{11})$$`) flawlessly.
- **Multi-Language Syntax Highlighting**: Powered by Pygments and Prism.js for TypeScript, Python, SQL, Rust, Go, Bash, and JSON.
- **Full-Bleed Print Geometry**: Eliminates awkward white borders on dark themes with CSS `@page` bleed-through calculations.

### 2. 🎨 5 Editorial Finishes & Themes

1. **Atelier Noir**: Precision obsidian dark mode with electric cobalt blue and crisp typography.
2. **Cream Vellum**: Warm stationery paper with classic book serif typography.
3. **Oxford Linen**: Academic journal styling with navy accents and structured dividers.
4. **Cyberpunk Neo**: High-contrast terminal styling with cyan rules.
5. **Swiss Monochrome**: Stark Bauhaus black-and-white ink-saver mode.

### 3. 📖 3 Interactive View Modes

- **Book Spread (Side-by-Side)**: Edit and curate chapters on the left while watching the live document update on the right.
- **Manuscript View**: Full-screen focused reading view of the document.
- **Storyboard View**: Full-screen editorial organizer for reordering, pruning, and editing prompts.

### 4. 🛡️ Privacy Shield & Redaction

- **1-Click Auto Redact**: Scans for OpenAI API keys (`sk-...`), AWS credentials, GitHub tokens, emails, passwords, and IP addresses, masking them with `[REDACTED]` tags. Includes 1-click Undo.
- **100% In-Memory Processing**: ChatFolio never writes your personal conversations to disk or third-party servers.

### 5. 📦 Universal Conversation Ingestion

- **ChatGPT Public Share Links**: Accepts `https://chatgpt.com/share/...` links.
- **React Flight & Next.js Parser**: Server-side decoding of React Flight streaming payloads (`streamController.enqueue(...)`) and Next.js `__NEXT_DATA__`.
- **Direct Prompt / JSON Paste**: Offline fallback modal for pasting raw text, markdown, or chat JSON.
- **5 Preloaded Masterworks**: Real-world curated conversations covering Quantum Physics, Distributed Systems, Database Architecture, Creative Fiction, and Lifestyle.

---

## 🚀 Quick Start

### Prerequisites

- **Python 3.10+** (Python 3.12 or 3.13 recommended)
- **Node.js 18+** & **npm**
- **Microsoft Edge** or **Google Chrome** (pre-installed on Windows/macOS/Linux)

### 1. Clone & Set Up Python Environment

```bash
git clone https://github.com/your-username/ChatFolio.git
cd ChatFolio

# Create virtual environment
python -m venv .venv

# Activate on Windows:
.venv\Scripts\activate

# Activate on macOS/Linux:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Build Frontend

```bash
npm install
npm run build
```

### 3. Launch ChatFolio Studio

```bash
python run.py
```

The launcher will verify your local Chromium/Edge engine and launch the studio at:
👉 **[http://localhost:8000](http://localhost:8000)**

---

## 🏛️ Architecture Overview

```
ChatFolio/
├── backend/                  # FastAPI Application Core
│   ├── app.py                # REST API endpoints & static asset router
│   ├── parser.py             # React Flight & Next.js DOM extractor
│   ├── pdf_engine.py         # Headless Chromium vector PDF compiler
│   └── samples.py            # Preloaded showcase folios
├── src/                      # React 18 & TypeScript Frontend
│   ├── components/
│   │   ├── brand/            # ChatFolio bespoke vector logo
│   │   ├── chatfolio/        # ChatFolio Landing, Studio, Deck, Canvas & Cabinet
│   │   ├── messages/         # Markdown, KaTeX & Prism message renderer
│   │   └── ui/               # Design system buttons and inputs
│   ├── hooks/                # Custom React hooks (Theme, Selection, Export)
│   ├── tokens/               # Editorial finishes & typography palettes
│   └── index.css             # Tailwind design tokens & dark mode styling
├── dist/                     # Compiled production assets
├── tests/                    # Pytest backend test suite (20 tests)
└── run.py                    # One-command studio launcher
```

---

## 🧪 Running Tests

ChatFolio includes a comprehensive test suite covering SSRF protection, React Flight parsing, XSS sanitization, and vector PDF margin rules:

```bash
# Run backend test suite
pytest -v
```

All 20 tests validate:

- Zero XSS vulnerability in rendered markdown or thought blocks
- SSRF prevention against internal IP ranges
- Vector print margin accuracy
- Empty selection edge cases

---

## 📄 License

ChatFolio is open-source software licensed under the [MIT License](LICENSE).
