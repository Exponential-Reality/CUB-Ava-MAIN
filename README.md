# Caribbean Union Bank AI Assistant (CUB AI)

Official digital banking assistant and multi-model AI system for **Caribbean Union Bank** (Antigua & Barbuda). Built with TypeScript, React, Vite, Node.js, and standalone zero-dependency HTML/JS for direct FastAPI integration.

---

## 🌟 Overview & What is CUB AI

**Caribbean Union Bank AI (CUB AI)** is a banking virtual assistant designed to deliver grounded financial guidance for Caribbean Union Bank customers. It handles inquiries regarding:

- **Personal & Business Accounts**: Savings tiers (Priority, Prestige, Dollar A Day, Premium Savers), Personal & Corporate Chequing, and required KYC onboarding documents.
- **Lending & Mortgages**: Residential Mortgages (terms up to 30 years), Land Purchase Financing, Auto Loans, and Consumer Credit Lines.
- **Interest Rates & Prime Benchmarks**: Grounded with CUB savings deposit rates (2.00%–2.75%), 10.00% Prime Lending rate, and local statutory banking rules.
- **Multilingual & Antiguan Creole**: Native support for **Antiguan Creole / Vernacular** alongside 24+ international languages.
- **Branches & Contact Details**: Full schedules and phone routing for the Headquarters (Friars Hill Road) and Factory Road Branch.

---

## 🧠 How It Works: System Architecture

```
                                  [ User Query ]
                                         │
                                         ▼
                     ┌───────────────────────────────────────┐
                     │     Intelligent Request Router        │
                     └───────────────────┬───────────────────┘
                                         │
                 ┌───────────────────────┴───────────────────────┐
                 ▼                                               ▼
     ┌────────────────────────┐                     ┌────────────────────────┐
     │   Groq Llama 3.3 70B   │                     │    Gemini 3.7 Flash    │
     │  (Fast FAQs, Hours,    │                     │  (Deep Loan Math, KYC, │
     │  Greetings, Contacts)  │                     │   Complex Financials)  │
     └───────────┬────────────┘                     └────────────┬───────────┘
                 │                                               │
                 └───────────────────────┬───────────────────────┘
                                         ▼
                     ┌───────────────────────────────────────┐
                     │   Pinecone Semantic Memory & SQLite 3 │
                     │   (Session Logging & Bank Policy DB)  │
                     └───────────────────┬───────────────────┘
                                         │
                                         ▼
                           [ Grounded Bank Response ]
```

### 1. Multi-Model Intelligent Router
Incoming queries are classified in real-time:
- **Fast Path (Groq Llama 3.3 70B)**: Sub-second latency for branch hours, contact routing, greeting dialogues, and basic FAQ lookups.
- **Deep Reasoning Path (Gemini 3.7 Flash)**: Loan amortization calculations, complex KYC verification, business signatory compliance, and detailed policy cross-checks.
- **Local Fallback Engine**: Verified local bank knowledge base ensures 100% uptime even if upstream APIs experience network interruptions.

### 2. Memory & Persistence Layer
- **Pinecone Vector Database**: Indexes official bank documentation for semantic search and conversational recall.
- **SQLite 3 (sql.js / WebAssembly)**: Server-side in-memory database with atomic disk persistence for conversation logs, audit trails, and sentiment analytics.

### 3. Strict Banking Safeguards & Compliance
- **Zero-Credential Policy**: The AI will *never* request passwords, PINs, CVVs, or full account numbers.
- **No Direct Financial Execution**: Does not execute fund transfers; directs customers to official CUB online banking or branch representatives for sensitive actions.

---

## 🚀 Dual Deployment Capabilities

### Mode A: Full-Stack React + Vite + Node.js
Complete banking dashboard with themes, audio synthesizers, interactive loan calculators, and OpenAPI Swagger documentation.

```bash
# 1. Install dependencies
npm install

# 2. Start the development server
npm run dev

# 3. Build for production
npm run build
npm start
```

- **Live Dashboard**: `http://localhost:3000`
- **OpenAPI Swagger UI**: `http://localhost:3000/docs`
- **Raw OpenAPI Spec**: `http://localhost:3000/openapi.json`
- **SQLite Inspector API**: `http://localhost:3000/api/db/stats`

---

### Mode B: Standalone Zero-Dependency HTML (`/public/standalone.html`)
A single, self-contained HTML/CSS/JS client that runs in any web browser without build tools. Designed for embedding into existing web portals or connecting directly to a **FastAPI** Python backend.

#### FastAPI Integration Example (`main.py`)

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

app = FastAPI(title="Caribbean Union Bank AI Assistant", version="2.0.0")

# Enable CORS for cross-origin frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: list[ChatMessage]
    pastChatsSummary: str = ""

@app.post("/chat")
@app.post("/api/chat")
async def chat_endpoint(req: ChatRequest):
    user_query = req.messages[-1].content if req.messages else ""
    # Process message with your LLM / RAG pipeline
    return {
        "reply": f"Caribbean Union Bank AI response to: {user_query}",
        "routedModel": "FASTAPI_BACKEND",
        "routingReason": "Direct FastAPI Python Endpoint"
    }

# Mount standalone.html directly
app.mount("/", StaticFiles(directory="public", html=True), name="static")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
```

---

## 🌐 Supported Languages (24+)

| Region | Languages |
| :--- | :--- |
| **Caribbean & Regional** | Antiguan Creole (Dialect), Haitian Creole, Papiamento, Spanish, French, Dutch, Portuguese |
| **Global & International** | English, Mandarin Chinese, Cantonese, Hindi, Arabic, Japanese, Korean, Russian, Tagalog/Filipino, Vietnamese, Polish, Swedish, Greek, Turkish, Bengali, German, Italian |

---

## 🔒 Security & Privacy

- All user data and sessions are encrypted in transit with TLS 1.3 / 256-bit encryption.
- No personally identifiable banking secrets (PINs, card CVVs, account passwords) are stored or transmitted.
- Compliant with Caribbean Union Bank digital guidelines.
