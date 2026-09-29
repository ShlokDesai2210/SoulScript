# 🔥 SoulScript

### *"Speak Human. We'll Speak AI."*

SoulScript is a web app that takes your raw, messy, unstructured thoughts and transforms them into well-crafted prompts optimized for specific AI tools.

**Most people think in fragments.** AI tools need structured prompts. SoulScript bridges that gap.

![SoulScript Screenshot](https://img.shields.io/badge/Status-Active-brightgreen) ![Python](https://img.shields.io/badge/Python-3.12+-blue) ![Flask](https://img.shields.io/badge/Flask-3.1-lightgrey)

---

## ✨ What It Does

```
Your messy thought  →  SoulScript  →  Structured prompt + AI recommendation
```

**Example:**
- **Input:** *"i want to make a cool app that tracks gym workouts and tells me what to eat"*
- **Output:**
  - 🎯 **Recommended AI:** Gemini (95%) for planning, Claude (82%) for code
  - 📝 **Polished Prompt:** A detailed, structured prompt ready to paste into Gemini

## 🤖 Supported AI Tools

| AI Tool | Best For |
|---------|----------|
| **Gemini** | Research, coding, multimodal, data analysis |
| **ChatGPT** | Conversation, writing, brainstorming |
| **Claude** | Long documents, code review, reasoning |
| **Midjourney** | Artistic images, concept art |
| **DALL-E** | Photorealistic images, mockups |
| **GitHub Copilot** | Code completion, IDE integration |
| **Perplexity** | Real-time research, citations |

## 🚀 Quick Start

### 1. Clone the repo
```bash
git clone https://github.com/YOUR_USERNAME/SoulScript.git
cd SoulScript
```

### 2. Set up Python environment
```bash
python -m venv .venv
.venv\Scripts\activate       # Windows
source .venv/bin/activate    # Mac/Linux
pip install -r requirements.txt
```

### 3. Add your Gemini API key
Get a free key from [Google AI Studio](https://aistudio.google.com/apikey), then create a `.env` file:
```
GEMINI_API_KEY=your_key_here
```

### 4. Run it
```bash
python app.py
```
Open **http://localhost:5000** 🎉

## 🎨 Features

- 🧠 **Brain Dump** — Just type your raw thoughts, messy is fine
- 🎯 **Smart AI Recommendation** — Tells you which AI tool is best for your task
- ✨ **Prompt Refinement** — Transforms messy thoughts into structured prompts
- 🌙☀️ **Dark / Light Theme** — Workspace-style UI with theme toggle
- 📋 **Copy to Clipboard** — One-click copy for your generated prompt
- 🕐 **History** — Saves your past transformations
- 📱 **Mobile Responsive** — Works on any device
- ⚡ **Quick Templates** — Pre-built starting points

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML + CSS + Vanilla JavaScript |
| Backend | Python Flask |
| AI Engine | Google Gemini API |
| Styling | CSS Custom Properties (dark/light theme) |

## 📁 Project Structure

```
├── app.py                  # Flask server + Gemini API
├── requirements.txt        # Python dependencies
├── .env.example            # API key template
├── data/
│   ├── ai_profiles.json    # 7 AI tool profiles
│   └── categories.json     # 7 task categories
├── static/
│   ├── css/style.css       # Workspace theme (dark + light)
│   └── js/app.js           # Frontend logic
└── templates/
    └── index.html          # Main UI
```

## 📄 License

MIT License — use it however you want.

---

*Built with 🔥 by Shlok*
