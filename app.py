import os
import sys
import json
import re
from typing import List, Optional, Dict, Any

# Try importing FastAPI and Uvicorn. If not installed, print clean installation instructions.
try:
    from fastapi import FastAPI, Request, HTTPException
    from fastapi.responses import HTMLResponse, JSONResponse
    from fastapi.middleware.cors import CORSMiddleware
    from fastapi.staticfiles import StaticFiles
    import uvicorn
except ImportError:
    print("\n" + "="*70)
    print("MISSING DEPENDENCIES!")
    print("Please install the required Python packages by running:")
    print("    pip install fastapi uvicorn requests google-genai pydantic")
    print("="*70 + "\n")
    sys.exit(1)

# Initialize FastAPI App
app = FastAPI(
    title="Caribbean Union Bank - CUB AI Assistant Server",
    description="Full-stack Python backend & web server for CUB AI Assistant",
    version="2.0.0"
)

# Enable CORS for local development and web access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ===================== CUB KNOWLEDGE BASE DATA =====================
CUB_KNOWLEDGE = {
    "bank_name": "Caribbean Union Bank (CUB)",
    "headquarters": "Friars Hill Road, P.O. Box W2010, St. John's, Antigua",
    "phone_primary": "(268) 481-8278",
    "email_primary": "customer.service@cub.ag",
    "website": "https://caribbeanunionbank.com",
    "faqs_url": "https://caribbeanunionbank.com/faqs/",
    "savings_rates": {
        "Priority Savings": "2.00% (Min opening: $100)",
        "Prestige Savings": "Minimum 2.50% (Min opening: $1,000)",
        "Dollar A Day": "Minimum 2.25% (Min opening: $100)",
        "Premium Savers": "Minimum 2.75% (Min opening: $5,000)"
    },
    "prime_lending_rate": "10.00% benchmark"
}

def generate_cub_python_response(query: str) -> str:
    """Intelligent fallback Python knowledge engine for CUB AI queries."""
    q = query.lower().strip()

    # FAQ 1: Do I need an account for a loan?
    if "account" in q and ("loan" in q or "apply" in q or "get a loan" in q):
        return (
            "If you do not have an account, you can apply for a loan; however, once a loan application is "
            "approved a CUB account will be required for loan servicing.\n\n"
            "Contact CUB Credit Services at (268) 481-8285 or email creditservices@cub.ag for assistance."
        )

    # FAQ 2: Who are you / About CUB
    if "never heard" in q or "who are you" in q or "about caribbean union bank" in q or "who is cub" in q:
        return (
            "Caribbean Union Bank (CUB) is a premier indigenous full-service commercial bank in Antigua and Barbuda. "
            "Headquartered on Friars Hill Road, St. John's, CUB provides personal & business checking/savings, "
            "mortgages, vehicle financing, credit cards, and 24/7 digital banking solutions.\n\n"
            "Learn more at https://caribbeanunionbank.com"
        )

    # FAQ 3: Loan Types
    if "kind of loan" in q or "type of loan" in q or "loans do you offer" in q or ("what" in q and "loan" in q and "offer" in q):
        return (
            "Caribbean Union Bank offers a comprehensive range of lending solutions:\n\n"
            "1. Residential Mortgages (Terms up to 30 years)\n"
            "2. Vehicle & Auto Financing (3 to 7 year repayment terms)\n"
            "3. Land Purchase Loans\n"
            "4. Personal & Consumer Loans\n"
            "5. Commercial & Business Loans\n\n"
            "Contact CUB Credit Services at (268) 481-8285 or creditservices@cub.ag to start your application."
        )

    # FAQ 4: Deposit required for loans
    if "deposit" in q and ("loan" in q or "required" in q or "equity" in q or "down payment" in q):
        return (
            "Equity or deposit requirements depend on the specific loan type (e.g., mortgages, vehicle, or commercial loans) "
            "and individual credit qualification. Contact CUB Credit Services at (268) 481-8285 or creditservices@cub.ag "
            "for specific down payment details."
        )

    # FAQ 5: Repayment terms
    if "repayment term" in q or ("repayment" in q and ("long" in q or "term" in q)):
        return (
            "Repayment terms at Caribbean Union Bank vary depending on the loan facility:\n\n"
            "• Mortgages: Repayment terms up to 30 years\n"
            "• Vehicle Loans: Typically range from 3 to 7 years\n"
            "• Consumer/Personal Loans: Customized terms based on loan amount and income capacity"
        )

    # FAQ 6: Credit Cards - Make payment
    if "payment" in q and ("card" in q or "credit card" in q):
        return (
            "You can make payments to your CUB credit card account using any of the following options:\n\n"
            "1. CUB Internet Banking / Mobile App (instant transfer)\n"
            "2. Automatic Standing Order from your CUB deposit account\n"
            "3. Over-the-counter payment at any CUB branch\n"
            "4. Wire transfer or cheque deposit"
        )

    # FAQ 7: Credit Cards - Authorized User
    if "authorized user" in q or ("add" in q and "card" in q and "account" in q):
        return (
            "To add an Authorized User to your credit card account, visit any Caribbean Union Bank branch or contact "
            "Card Services with a completed Credit Card Amendment form and a valid government photo ID "
            "(Passport, Driver's License) for the authorized user."
        )

    # FAQ 8: Credit Cards - Compromised / Lost / Stolen
    if "compromised" in q or "stolen" in q or "lost" in q or "suspect" in q:
        return (
            "⚠️ EMERGENCY CARD SECURITY ALERT:\n\n"
            "If you suspect your card or account information has been compromised, or if your card is lost or stolen:\n\n"
            "1. Immediately call CUB Card Services at (268) 481-8250 or email cardservices@cub.ag\n"
            "2. Lock or freeze your card instantly via CUB Internet Banking or the CUB Mobile App under Card Settings."
        )

    # FAQ 9: Credit Cards - Travel Notice
    if "travel" in q or "traveling" in q or "notify" in q:
        return (
            "Notifying the Bank when you travel ensures your CUB Visa Debit or Credit card is not flagged or blocked "
            "by automated fraud security filters during international transactions.\n\n"
            "Submit a travel notice via CUB Internet Banking or call Card Services at (268) 481-8250 before departing."
        )

    # Interest Rates & Calculator Queries
    if any(k in q for k in ["rate", "interest", "priority", "prestige", "dollar a day", "premium saver", "prime", "calculate", "calculator", "percent", "%"]):
        return (
            "Official Caribbean Union Bank (CUB) Interest Rates & Benchmarks:\n\n"
            "• Priority Savings: 2.00% Interest Rate ($100 required opening amount)\n"
            "• Prestige Savings: Minimum 2.50% Interest Rate ($1,000 required opening amount)\n"
            "• Dollar A Day Savings: Minimum 2.25% Interest Rate ($100 required opening amount)\n"
            "• Premium Savers: Minimum 2.75% Interest Rate ($5,000 required opening amount)\n"
            "• Prime Lending Rate: Benchmark 10.00% (adjusted based on credit history)\n\n"
            "💡 You can use our interactive CUB Interest & Loan Calculator in the web interface to project precise earnings or monthly loan payments!"
        )

    # Opening Accounts Requirements
    if "open" in q or "requirement" in q or "document" in q:
        return (
            "Requirements to open an account with Caribbean Union Bank:\n\n"
            "1. Two (2) valid government-issued photo IDs (Passport, Driver's License, Electoral Card)\n"
            "2. Proof of Residential Address (Utility bill < 3 months old, or job letter)\n"
            "3. Proof of Income (Recent job letter or last 3 pay slips)\n"
            "4. Tax Identification Number (TIN)\n\n"
            "Visit any CUB branch or start online at https://caribbeanunionbank.com"
        )

    # Contact & Hours
    if "contact" in q or "phone" in q or "hour" in q or "branch" in q or "location" in q or "address" in q:
        return (
            "Caribbean Union Bank Branches & Contact Info:\n\n"
            "📍 Headquarters — Friars Hill Road, St. John's\n"
            "   • Phone: (268) 481-8278 | Email: customer.service@cub.ag\n"
            "   • Hours: Mon–Thu 8:00am–2:00pm | Fri 8:00am–3:00pm\n\n"
            "📍 Factory Road Branch — Starling Business Complex\n"
            "   • Phone: (268) 481-8285\n"
            "   • Hours: Mon–Thu 8:00am–2:00pm | Fri 8:00am–3:00pm\n\n"
            "📍 Jolly Harbour Branch — Valley Road Marina\n"
            "   • Phone: (268) 481-8265\n"
            "   • Hours: Mon–Fri 9:00am–1:00pm\n\n"
            "🌐 Official Website & FAQs: https://caribbeanunionbank.com/faqs/"
        )

    # General Fallback
    return (
        "Welcome to Caribbean Union Bank AI! I can assist you with account opening requirements, interest rates, "
        "loan options (Mortgages, Vehicle, Consumer), credit cards, travel notices, lost card reporting, and online banking.\n\n"
        "How can I help you today? You can also explore our official FAQs at https://caribbeanunionbank.com/faqs/"
    )

# ===================== API ROUTING & GEMINI INTEGRATION =====================
async def in_gemini_query(messages: list) -> Optional[str]:
    """Queries Gemini API if GEMINI_API_KEY environment variable is present."""
    raw_key = os.environ.get("GEMINI_API_KEY") or os.environ.get("VITE_GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
    if not raw_key:
        return None
    api_key = raw_key.strip().strip("'").strip('"')
    if not api_key:
        return None

    try:
        import requests
        
        gemini_models = ["gemini-3.6-flash", "gemini-flash-latest", "gemini-3.1-flash-lite"]
        
        system_context = (
            "You are CUB AI, official banking assistant for Caribbean Union Bank (CUB) in Antigua and Barbuda.\n"
            "Official CUB Knowledge:\n"
            "- Do I need an account for a loan? If you do not have an account, you can apply; however, an account is required upon loan approval for servicing.\n"
            "- Loan types: Mortgages (up to 30 yrs), Vehicle (3-7 yrs), Consumer, Commercial.\n"
            "- Interest Rates: Priority Savings (2.00%), Prestige (2.50%+), Dollar A Day (2.25%+), Premium Savers (2.75%+), Prime Lending (10.00%).\n"
            "- Card Services Phone: (268) 481-8250, Credit Services: (268) 481-8285.\n"
            "- Official Website & FAQs: https://caribbeanunionbank.com/faqs/\n"
            "Be professional, polite, helpful, and concise."
        )

        formatted_contents = []
        formatted_contents.append({"role": "user", "parts": [{"text": f"System Context:\n{system_context}"}]})
        
        for msg in messages:
            role = "user" if msg.get("role") == "user" else "model"
            content = msg.get("content", "")
            if not content:
                continue
            if len(formatted_contents) == 1 and role == "model":
                continue
            formatted_contents.append({"role": role, "parts": [{"text": content}]})

        payload = {"contents": formatted_contents}
        
        for m_name in gemini_models:
            try:
                url = f"https://generativelanguage.googleapis.com/v1beta/models/{m_name}:generateContent?key={api_key}"
                resp = requests.post(url, json=payload, timeout=10)
                if resp.status_code == 200:
                    res_data = resp.json()
                    candidates = res_data.get("candidates", [])
                    if candidates:
                        parts = candidates[0].get("content", {}).get("parts", [])
                        if parts and "text" in parts[0]:
                            return parts[0]["text"]
            except Exception as e:
                continue
    except Exception as e:
        print(f"Gemini API Notice: {e}")

    return None

# ===================== FASTAPI ENDPOINTS =====================
@app.get("/health")
def health():
    return {"status": "ok", "bank": "Caribbean Union Bank", "version": "2.0.0"}

@app.post("/chat")
@app.post("/api/chat")
async def chat_endpoint(request: Request):
    """Processes chat requests from web client or API callers."""
    try:
        body = await request.json()
    except Exception:
        body = {}

    user_text = body.get("message") or body.get("prompt") or ""
    messages_list = body.get("messages", [])

    if not user_text and messages_list:
        user_text = messages_list[-1].get("content", "")

    if not user_text:
        return JSONResponse({"reply": "Hello! How can I assist you with Caribbean Union Bank today?"})

    # Try Gemini API first if configured
    gemini_reply = await in_gemini_query(messages_list or [{"role": "user", "content": user_text}])
    if gemini_reply:
        return JSONResponse({"reply": gemini_reply, "source": "Gemini AI Engine"})

    # Fallback to CUB Python Knowledge Engine
    reply = generate_cub_python_response(user_text)
    return JSONResponse({"reply": reply, "source": "CUB Python Knowledge Engine"})

@app.get("/", response_class=HTMLResponse)
async def serve_index():
    """Serves index.html or standalone.html directly from the project directory."""
    for file_name in ["standalone.html", "index.html"]:
        if os.path.exists(file_name):
            with open(file_name, "r", encoding="utf-8") as f:
                return f.read()
    
    return "<h1>Caribbean Union Bank AI Server Running</h1><p>API endpoint available at <code>/api/chat</code></p>"

# ===================== MAIN EXECUTION ENTRYPOINT =====================
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    print("\n" + "="*70)
    print("🚀 CARIBBEAN UNION BANK AI ASSISTANT PYTHON SERVER")
    print("="*70)
    print(f"Server starting on: http://127.0.0.1:{port}")
    print(f"Open http://127.0.0.1:{port} in your browser to use the CUB AI Assistant!")
    print("API Endpoint: POST http://127.0.0.1:{port}/api/chat")
    print("="*70 + "\n")
    uvicorn.run("app:app", host="0.0.0.0", port=port, reload=True)
