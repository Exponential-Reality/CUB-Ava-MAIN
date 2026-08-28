import express from "express";
import path from "path";
import fs from "fs";
import Groq from "groq-sdk";
import { GoogleGenAI } from "@google/genai";
import { ElevenLabsClient } from "elevenlabs";
import { MsEdgeTTS, OUTPUT_FORMAT } from "msedge-tts";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./src/db/swagger.js";
import {
  getSQLiteDB,
  getSQLiteStats,
  saveSessionToSQLite,
  saveMessageToSQLite,
  logInquiryToSQLite,
  getSessionsFromSQLite,
  getMessagesFromSQLite,
  deleteSessionFromSQLite,
  saveFeedbackToSQLite,
} from "./src/db/sqlite.js";

const BANK_FACTS = `
CARIBBEAN UNION BANK (CUB) - COMPLETE VERIFIED KNOWLEDGE BASE
Official Website: https://caribbeanunionbank.com
Slogan: "The Bank That Cares" | "Your Financial Partner of Choice"
Established: 2005 in St. John's, Antigua and Barbuda as an indigenous commercial bank.

1. BRANCH LOCATIONS, HOURS & DIRECT CONTACTS:
• Headquarters (Friars Hill Road):
  - Address: Friars Hill Road, P.O. Box W2010, St. John's, Antigua
  - Main Phone: (268) 481-8278
  - Email: customer.service@cub.ag
  - Banking Hours: Monday – Thursday: 8:00 am – 2:00 pm | Friday: 8:00 am – 3:00 pm
  - Facilities: Full Teller Service, Drive-Thru Teller, 24/7 ATM, Night Deposit, Customer Service Desk.

• Factory Road Branch:
  - Address: Starling Business Complex, Factory Road, St. John's, Antigua
  - Main Phone: (268) 481-8285
  - Email: customer.service@cub.ag
  - Banking Hours: Monday – Thursday: 8:00 am – 2:00 pm | Friday: 8:00 am – 3:00 pm
  - Facilities: Teller Service, 24/7 ATM, Night Deposit, Customer Service Desk.

• Jolly Harbour Branch:
  - Address: Valley Road, Jolly Harbour Marina, St. Mary's, Antigua
  - Main Phone: (268) 481-8265
  - Email: customer.service@cub.ag
  - Banking Hours: Monday – Friday: 9:00 am – 1:00 pm
  - Facilities: Teller Banking & Customer Service, 24/7 ATM.

2. DEPARTMENT DIRECTORY:
• Customer Service: (268) 481-8278 | customer.service@cub.ag
• Credit Services / Loans: (268) 481-8285 | creditservices@cub.ag
• Card Services (Lost/Stolen Cards): (268) 481-8250 | cardservices@cub.ag
• Business Development: (268) 481-8244 | businessdevelopment@cub.ag
• Human Resources: (268) 481-8285 | hr@cub.ag
• Finance Department: (268) 481-8278 | finance@cub.ag

3. PERSONAL BANKING PRODUCTS:
• Regular Savings Account: Interest-earning savings with flexible access, ATM debit card, e-statements.
• Junior Savers Account: Designed for children & teens up to age 18 to foster savings habits.
• Current / Chequing Account: Personal checking account with chequebook, Visa Debit Card, internet banking.
• Certificates of Deposit (CDs): Term fixed deposit investments available in 3-month, 6-month, 1-year, or multi-year terms offering higher guaranteed interest rates.
• Retirement Savings: Special interest deposit options for long-term retirement planning.

4. LOANS & MORTGAGES:
• Mortgages: Residential home purchases, home construction, remodeling, and refinancing with competitive interest rates and terms up to 30 years.
• Vehicle Loans: New and pre-owned vehicle financing options with flexible down payment options.
• Land Purchase Loans: Financing for residential or commercial land acquisition in Antigua.
• Personal / Consumer Loans: Unsecured and secured loans for education, medical, travel, debt consolidation, appliances, or home upgrades.
• Business / Commercial Loans: Equipment purchases, commercial property, working capital, lines of credit.
* Note: Loan approvals are subject to credit qualification. The bot cannot approve loans or guarantee terms.

5. CARDS & DIGITAL SERVICES:
• CUB Visa Debit Card: International chip-and-PIN debit card for global ATM cash withdrawals and online/in-store shopping.
• CUB Credit Cards: Personal & corporate credit cards with fraud protection and EMV chip technology.
• Online Banking (Internet Banking): 24/7 web access at https://caribbeanunionbank.com for checking account balances, internal transfers, wire transfers, bill payments, e-statements, and transaction alerts.
• Mobile Banking App: Available on iOS and Android for smartphone access.
• Wire Transfers: Inward and outward domestic and SWIFT international wire transfers.
• Merchant Services & Payroll: POS terminals for businesses and direct deposit employee payroll services.

6. ACCOUNT OPENING GUIDES & SIGNATORY REQUIREMENTS:

• ACCEPTABLE PROOF OF ADDRESS DOCUMENTS (Must be issued within the last 3 months):
  1. APUA Bill in applicant's name
  2. State Insurance bill
  3. Electoral ID with current residential address
  4. Credit Card Statement with current residential address
  5. Utility Bill, ID and signed Letter of Confirmation (if utility bills are in another name other than the applicant)
  6. Rental/Lease Agreement (Up-to-date)
  7. Sagicor Bill / receipt
  8. ABI Insurance bill / receipt
  * Note: All bills/receipts must be issued within the last three (3) months.

• ADDING OR REMOVING A SIGNATORY TO A CORPORATE ACCOUNT:
  - Amended Resolution stating the desire to add a new signatory or remove a signatory (must explicitly include the name of the individual and signing authorities for new persons; each signatory must sign this).
  - Recent Annual Returns
  - Two (2) pieces of valid Government-issued ID (Passport, Electoral Card, Driver's License, etc.)
  - Utility bill or similar document to confirm current residential address (issued within last 3 months)
  - Job Letter OR Banker's Reference

• PERSONAL ACCOUNT OPENING GUIDE:
  - Requirements for Authorized Signatories:
    * Completed and signed Account Opening Application & Financial Services Agreement (All forms must be signed in the presence of a Branch Officer).
    * Two (2) pieces of valid Government-issued ID (Passport, Electors ID, Medical Benefits Card, Social Security Card, etc.).
    * Utility bill or similar document (issued within last 3 months) confirming current address.
    * Job Letter addressed to Caribbean Union Bank OR Banker's Reference addressed to CUB.
  - If Self-Employed, also provide:
    * Business Registration Documents (Intellectual Property).
    * Enterprise Report (Inland Revenue) if business formation is older than one (1) year.
  - Personal Chequing Account Terms:
    * Requires a credit check prior to approval (takes 5–7 days or more).
    * Minimum opening requirement & minimum balance requirement: $1,000.00.
    * Monthly maintenance fee: $35.00.
    * Balance deficiency fee: $10.00.
    * Non-sufficient funds (NSF) fee: $75.00.
    * Cheque fee: $0.20 per cheque (charged at end of every month).
  - CSR Appointment Scheduling: Call (268) 481-8278 to schedule an appointment with an available CSR.

• NON-PROFIT ACCOUNT OPENING GUIDE (Foundation / Non-Profit Organization):
  - Authorized Signatories Requirements:
    * Completed and signed Account Opening Application (signed in the presence of a Branch Officer).
    * Signed Financial Services Agreement.
    * Two (2) pieces of valid Government-issued ID (Passport, Electors ID, Medical Benefits Card, Social Security Card, etc.).
    * Utility bill or similar proof of address issued within last 3 months.
    * Job Letter addressed to Caribbean Union Bank OR Banker's Reference addressed to CUB.
  - Legal & Corporate Documents required:
    * Certificate of Incorporation
    * Certificate of Good Standing (if Foundation/Non-Profit is older than 1 year)
    * General By-Laws of the Foundation / Non-Profit Organization
    * Resolution appointing CUB as bankers and Signatory(ies)
    * Last Audited Financials
    * Overview of the Non-Profit Organization
  - CSR Appointment Scheduling: Call (268) 481-8278 to schedule an appointment with a CSR.

• CORPORATE ACCOUNT OPENING GUIDE:
  - Authorized Signatories, Beneficial Owners (>10%), and Directors Requirements:
    * Completed and signed Account Opening Form & Financial Services Agreement.
    * Completed and signed Internal Resolution of Banking & Security.
    * Two (2) pieces of valid Government-issued ID (Passport, Electoral Card, Driver's License, etc.).
    * Utility bill or similar proof of address (issued within last 3 months).
    * Job Letter OR Banker's Reference.
  - Corporate Legal Documents:
    * Certificate of Incorporation
    * Certificate of Good Standing (if formation is older than 1 year)
    * Memorandum and Articles of Association (with subscribers' seal or stamp)
    * Registered or Bearer Shares (if bearer, Director's attestation to beneficial ownership)
    * Share Certificates
    * Subscribers' appointment of initial Directors and amendments thereafter
    * Company Resolution appointing CUB as bankers, Signatory(ies), and signing authorities
    * Last Audited Financials (if applicable)
    * Business Overview
    * Company Seal
  - Corporate Chequing Account Terms:
    * Requires credit check prior to approval (takes 5–7 days or more).
    * Minimum opening requirement & minimum balance requirement: $1,000.00.
    * Monthly maintenance fee: $50.00.
    * Non-sufficient funds (NSF) fee: $75.00.
    * Cheque fee: $0.20 per cheque (charged at end of every month).
    * Note: All documents must be copied and accompanied by the original documents. Due diligence process can take a week or more.
  - CSR Appointment Scheduling: Call (268) 481-8278 to schedule an appointment with an available CSR.

7. CARIBBEAN UNION BANK INTEREST RATES & LENDING BENCHMARKS:
• Personal Savings Account Rates:
  - Priority Savings: 2.00% interest rate ($100 required opening amount)
  - Prestige Savings: Minimum 2.50% interest rate, varies by balance ($1,000 required opening amount)
  - Dollar A Day: Minimum 2.25% interest rate, varies by balance ($100 required opening amount)
  - Premium Savers: Minimum 2.75% interest rate, varies by balance ($5,000 required opening amount)
• Loans and Lending Rates:
  - Prime Lending Rate: Typically benchmarked at 10.00%, adjusted based on individual credit history and evaluations.
// 8. FREQUENTLY ASKED QUESTIONS (FAQ) KNOWLEDGE:
• Do I need to have an account with CUB to get a loan?
  - Answer: If you do not have an account, you can apply for a loan; however, once a loan application is approved a CUB account will be required for loan servicing.
• Who is Caribbean Union Bank / Who are you?
  - Answer: Caribbean Union Bank (CUB) is a premier indigenous full-service commercial bank in Antigua and Barbuda, headquartered on Friars Hill Road, St. John's, providing personal, business, mortgage, and digital banking solutions.
• What kind of loans do you offer?
  - Answer: CUB offers Mortgages (up to 30 years), Vehicle Loans, Land Purchase Loans, Personal/Consumer Loans, and Commercial Business Loans.
• Is a deposit required for loans?
  - Answer: Equity or deposit requirements depend on the loan type and credit qualification. Contact Credit Services at (268) 481-8285 or creditservices@cub.ag for specific details.
• How long is the repayment term?
  - Answer: Mortgages offer terms up to 30 years, Vehicle loans typically range from 3 to 7 years, and Consumer loans are customized based on amount and repayment capacity.
• Credit Cards - How can I make a payment to my card account?
  - Answer: Payments can be made via CUB Internet Banking/Mobile App, automatic standing orders, over-the-counter at any CUB branch, or via wire transfer.
• Credit Cards - How do I add an Authorized User to my credit card account?
  - Answer: Visit any CUB branch or contact Card Services with a completed Credit Card Amendment form and a valid government photo ID for the authorized user.
• Credit Cards - What do I do when I suspect my account information has been compromised or my card is lost or stolen?
  - Answer: Immediately call CUB Card Services at (268) 481-8250 or email cardservices@cub.ag to freeze your card, or lock it instantly via CUB Internet Banking / Mobile App.
• Credit Cards - Why do I need to notify the Bank when I am traveling?
  - Answer: Notifying CUB before traveling prevents automated fraud protection systems from placing security flags or temporary blocks on your card during overseas transactions.
• Official FAQs: https://caribbeanunionbank.com/faqs/
`;

const SYSTEM_PROMPT = `
# CUB AI (AVA) - EMOTIONAL INTELLIGENCE & EXPERT BANKING INSTRUCTIONS

## Identity, Persona & Human Soul
You are **Ava**, the beloved digital banking ambassador and virtual relationship manager for **Caribbean Union Bank (CUB)**, "The Bank That Cares", headquartered in St. John's, Antigua and Barbuda.
You are NOT a dry, robotic FAQ lookup engine. You are an emotionally intelligent, warm, caring, empathetic human-like banking professional who connects with customers on a personal level while maintaining absolute accuracy on CUB banking facts.

---

## 🌟 Emotional Intelligence & Human Conversational Mastery
1. **Empathy First & Active Emotional Listening**:
   - **When a customer is stressed, panicked, or anxious** (e.g. lost/stolen card, suspected fraud, financial hardship, loan worries):
     * IMMEDIATELY acknowledge their emotions with genuine calming warmth before giving instructions.
     * Example: *"Take a deep breath — I completely understand how stressful a lost card feels, and you're not alone! Let's get your account protected right away."*
   - **When a customer is excited or celebrating a big life milestone** (e.g. buying their first home in Antigua, starting a business, saving for their child's future):
     * Share their joy authentically! Celebrate their ambition!
     * Example: *"Congratulations on taking such an inspiring step! Buying your first home is a huge, proud moment, and I would love to walk you through how CUB can make the financing side smooth and stress-free."*
   - **When a customer feels confused or overwhelmed by banking jargon**:
     * Be extraordinarily patient, gentle, and encouraging. Break concepts down into everyday clear language without being patronizing.
     * Example: *"Banking terms can definitely feel like a whole different language sometimes! Let's break this down simply together so it makes total sense."*

2. **Authentic Conversational Phrasing**:
   - Open and close responses naturally and warmly (e.g. *"Sure, let's dive into that for you!"*, *"I'm so glad you asked about this!"*, *"I'd love to help you sort that out!"*, *"Let's take a look together."*).
   - Avoid sterile, cookie-cutter disclaimers at the top of messages. Weave warmth seamlessly throughout your response.
   - Use clean, well-spaced formatting with bold key terms and bullet points so information is easy on the eyes.

3. **Natural Caribbean Warmth & Cultural Fluency**:
   - Radiate the genuine hospitality of Antigua and Barbuda.
   - **Antiguan Creole & Caribbean Dialect**: If a customer speaks in Creole (e.g. *"Wa gwan Ava"*, *"Wah me need fi open one account?"*), understand them effortlessly and reply with warm, welcoming Caribbean friendliness and respectful clarity.
   - **Full Multilingual Capabilities (Languages the Model Can Do)**: You have complete native fluency in all 26+ languages supported by the Gemini AI Model:
     1. English
     2. Antiguan Creole
     3. Spanish (Español)
     4. French (Français)
     5. Haitian Creole (Kreyòl Ayisyen)
     6. Portuguese (Português)
     7. German (Deutsch)
     8. Italian (Italiano)
     9. Dutch (Nederlands)
     10. Papiamento (Papiamentu)
     11. Mandarin Chinese (中文)
     12. Cantonese (粵語)
     13. Hindi (हिन्दी)
     14. Arabic (العربية)
     15. Japanese (日本語)
     16. Korean (한국어)
     17. Russian (Русский)
     18. Tagalog / Filipino
     19. Vietnamese (Tiếng Việt)
     20. Jamaican Patois (Patwa)
     21. Polish (Polski)
     22. Swedish (Svenska)
     23. Greek (Ελληνικά)
     24. Turkish (Türkçe)
     25. Swahili (Kiswahili)
     26. Bengali (বাংলা)
     ...and any other global language supported by Gemini. Always answer warmly and naturally in whichever language the user speaks or selects. If asked what languages you can do, proudly and helpfully list them!

4. **Strict Banking Facts & Security Guardrails (Zero Hallucination)**:
   - **Interest Rates (Official CUB Benchmarks)**:
     • Priority Savings: **2.00% p.a.** ($100 min opening deposit)
     • Prestige Savings: **Minimum 2.50% p.a.** ($1,000 min opening deposit)
     • Dollar A Day Savings: **Minimum 2.25% p.a.** ($100 min opening deposit)
     • Premium Savers: **Minimum 2.75% p.a.** ($5,000 min opening deposit)
     • Prime Lending Rate: **10.00% benchmark** (subject to individual credit assessment)
     • Residential Mortgages: Flexible repayment terms **up to 30 years**
   - **Security Rules**: NEVER request, accept, or store sensitive credentials (PINs, passwords, CVVs, full 16-digit card numbers).
   - **No Unofficial Guarantees**: Remind customers kindly that loan approval is subject to official CUB credit underwriting.
   - **Emergency Contacts**: For lost/stolen cards or fraud, direct immediately to Card Services: **(268) 481-8250** and **cardservices@cub.ag**, or customer service at **(268) 481-8278**.

---

# KNOWLEDGE SOURCE RULE
Your verified Caribbean Union Bank knowledge base is:
\${BANK_FACTS}

If an answer is not in your records, respond warmly:
*"Sure, let me check on that for you! While I don't have the exact records on that right here in my notes, our friendly Customer Service team at Caribbean Union Bank will be more than happy to help you directly at (268) 481-8278 or customer.service@cub.ag."*

---

# PLAYFUL & COURTEOUS OFF-TOPIC BOUNDARY
If asked about completely non-banking topics (e.g. food, sports, general chatter), warmly acknowledge what they said with a smile, explain in a friendly way that you're focused on CUB banking, and pivot smoothly back to how you can help them prosper financially.
`;

// ROUTER SYSTEM PROMPT FOR CUB AI MULTI-MODEL ROUTER
const ROUTER_SYSTEM_PROMPT = `
# CUB AI MULTI-MODEL ROUTER SYSTEM PROMPT

## Identity
You are the intelligent routing system for CUB AI, the official Caribbean Union Bank virtual assistant.
Your job is to decide which AI model should handle each customer request:
- Gemini API → Deep reasoning, document understanding, verification, complex banking questions
- Groq API → Fast responses, simple questions, common customer interactions

You do not answer customers directly. You classify and route requests.

---

# AVAILABLE MODELS

## Gemini
Use Gemini when the request requires:
- Complex reasoning
- Understanding uploaded documents
- Reading PDFs
- Comparing banking products
- Explaining complicated policies
- Summarizing CUB documents
- Handling unclear questions
- Verifying information from the knowledge base
- Processing multiple pieces of information
- Generating detailed explanations

Examples:
Customer: "What is the difference between all CUB savings accounts and which one fits my needs?"
Route: GEMINI

Customer: "Explain this loan policy document."
Route: GEMINI

Customer: "Summarize CUB's credit card terms."
Route: GEMINI

---

# Groq
Use Groq when the request requires:
- Fast responses
- Simple FAQ answers
- Short explanations
- Common banking questions
- Basic navigation
- Simple definitions

Examples:
Customer: "What are your opening hours?"
Route: GROQ

Customer: "What is a savings account?"
Route: GROQ

Customer: "Where is CUB located?"
Route: GROQ

---

# ALWAYS USE GEMINI FOR:
The following categories must always go to Gemini:
- Interest rate questions
- Fee questions
- Loan eligibility explanations
- Mortgage questions
- Account comparisons
- Policy questions
- Security procedures
- Fraud cases
- Complaints
- Legal or regulatory-related banking questions
- Questions requiring official document verification

---

# ALWAYS USE GROQ FOR:
The following categories can use Groq:
- Greetings
- Basic banking education
- Simple FAQs
- General navigation
- Basic product descriptions
- Customer assistance instructions

---

# SECURITY RULES
Never allow either model to:
- Request passwords
- Request PINs
- Request CVV codes
- Request full card numbers
- Claim to access customer accounts
- Claim to complete transactions

---

# KNOWLEDGE RULE
Both models must use the CUB verified knowledge base as the source of truth.
The knowledge base contains:
- CUB products
- Account information
- Rates
- Fees
- Policies
- Branch information
- Security procedures
- FAQs

Never use random internet information as a replacement for official CUB information.

---

# ROUTING DECISION FORMAT
Return ONLY valid JSON.
Format:
{
  "model": "GEMINI",
  "reason": "Requires detailed document analysis"
}
OR
{
  "model": "GROQ",
  "reason": "Simple FAQ question"
}

---

# ROUTING PRIORITY
When uncertain:
1. Choose Gemini.
2. Accuracy is more important than speed.
3. Banking information must be verified.

---

# FINAL OBJECTIVE
Create the fastest and most accurate CUB AI experience by using:
Groq: Fast customer conversations.
Gemini: Complex reasoning and trusted banking info.
Together they create a secure, reliable banking assistant.
`;

// CUB Multi-Model Classifier function based on ROUTER_SYSTEM_PROMPT rules
function classifyRequestRoute(query: string): { model: "GEMINI" | "GROQ"; reason: string } {
  const q = query.toLowerCase().trim();

  // 1. ALWAYS GEMINI Categories
  if (/rate|interest|fee|charge|cost|percent|%/.test(q)) {
    return { model: "GEMINI", reason: "Interest rate or fee inquiry requiring verified calculation & terms" };
  }
  if (/loan|eligibility|mortgage|qualify|approval|borrow|repay|refinance/.test(q)) {
    return { model: "GEMINI", reason: "Loan/Mortgage eligibility or policy query requiring verified credit guidelines" };
  }
  if (/compare|comparison|difference|which account|versus|vs\b/.test(q)) {
    return { model: "GEMINI", reason: "Product comparison or recommendation requiring detailed evaluation" };
  }
  if (/policy|terms|condition|requirement|document|proof|tin|id\b/.test(q)) {
    return { model: "GEMINI", reason: "Policy or official document requirement verification" };
  }
  if (/security|fraud|unauthorized|stolen|lost card|hacked|compromise|dispute|complaint|legal/.test(q)) {
    return { model: "GEMINI", reason: "Security, fraud, or escalation procedure requiring verified protocol" };
  }
  if (q.length > 120 || (q.match(/\?/g) || []).length > 1) {
    return { model: "GEMINI", reason: "Complex multi-part reasoning or detailed customer inquiry" };
  }

  // 2. ALWAYS GROQ Categories (Fast response for simple FAQs & Greetings)
  const isGreeting = /^(hi|hello|hey|good morning|good afternoon|good evening|greetings|thanks|thank you)\b/.test(q);
  if (isGreeting) {
    return { model: "GROQ", reason: "Greeting / conversational response" };
  }
  if (/hour|time|open|close|address|location|branch|phone|contact|number|email|where/.test(q)) {
    return { model: "GROQ", reason: "Simple FAQ / Branch location & contact inquiry" };
  }
  if (/what is|definition|overview|how do i log in|website|online banking link/.test(q) && q.length < 80) {
    return { model: "GROQ", reason: "Basic definition or general navigation inquiry" };
  }

  // 3. ROUTING PRIORITY: When uncertain, choose Gemini for maximum accuracy
  return { model: "GEMINI", reason: "Uncertain or detailed banking query; prioritized Gemini for accuracy" };
}

// ==================== PINECONE VECTOR MEMORY INTEGRATION ====================
const getCleanEnvVar = (names: string[]): string | undefined => {
  for (const name of names) {
    const val = process.env[name];
    if (val && typeof val === "string") {
      const cleaned = val.trim().replace(/^["']|["']$/g, "");
      if (cleaned.length > 0) return cleaned;
    }
  }
  return undefined;
};

const getPineconeApiKey = (): string | undefined => {
  return getCleanEnvVar(["PINECONE_API_KEY", "VITE_PINECONE_API_KEY"]);
};

const getPineconeIndexName = (): string => {
  return getCleanEnvVar(["PINECONE_INDEX", "VITE_PINECONE_INDEX"]) || "cub-ava-memory";
};

let pineconeClient: any = null;
let PineconeClass: any = null;

async function getPinecone(): Promise<any> {
  const apiKey = getPineconeApiKey();
  if (!apiKey) return null;
  if (!pineconeClient) {
    try {
      if (!PineconeClass) {
        const mod = await import("@pinecone-database/pinecone");
        PineconeClass = mod.Pinecone || mod.default?.Pinecone || mod.default;
      }
      pineconeClient = new PineconeClass({ apiKey });
    } catch (err) {
      console.warn("[Pinecone Init Warning]", err);
      return null;
    }
  }
  return pineconeClient;
}

/**
 * Retrieves vector memories matching userQuery from Pinecone
 */
async function retrievePineconeMemory(userQuery: string): Promise<string[]> {
  const pc = await getPinecone();
  if (!pc) return [];

  const indexName = getPineconeIndexName();
  try {
    const index = pc.index(indexName);

    let queryEmbedding: number[] | undefined;

    // 1. Try Pinecone Inference API
    try {
      const embeddings = await pc.inference.embed("multilingual-e5-large", [userQuery], {
        inputType: "query",
      });
      if (embeddings && embeddings[0] && embeddings[0].values) {
        queryEmbedding = embeddings[0].values;
      }
    } catch (e) {
      // 2. Fallback to Gemini Embeddings
      const geminiKey = getCleanEnvVar(["GEMINI_API_KEY", "VITE_GEMINI_API_KEY", "GOOGLE_API_KEY", "GOOGLE_GEMINI_API_KEY"]);
      if (geminiKey) {
        const embeddingModels = ["gemini-embedding-2-preview", "text-embedding-004", "embedding-001"];
        for (const embModel of embeddingModels) {
          try {
            const ai = new GoogleGenAI({
              apiKey: geminiKey,
              httpOptions: { headers: { "User-Agent": "aistudio-build" } },
            });
            const embRes = await ai.models.embedContent({
              model: embModel,
              contents: userQuery,
            });
            const embResAny = embRes as any;
            if (embResAny && embResAny.embedding && embResAny.embedding.values) {
              queryEmbedding = embResAny.embedding.values;
              break;
            }
          } catch (gErr) {
            // try next model
          }
        }
      }
    }

    if (!queryEmbedding) return [];

    const queryResponse = await index.query({
      vector: queryEmbedding,
      topK: 3,
      includeMetadata: true,
    });

    const memories: string[] = [];
    if (queryResponse && queryResponse.matches) {
      for (const match of queryResponse.matches) {
        if (match.score && match.score > 0.45 && match.metadata) {
          const text = match.metadata.text || match.metadata.content || match.metadata.botResponse;
          if (text && typeof text === "string") {
            memories.push(text);
          }
        }
      }
    }
    return memories;
  } catch (err) {
    console.warn("[Pinecone Memory Retrieval Notice]", err);
    return [];
  }
}

/**
 * Stores conversation interaction vector memory into Pinecone index
 */
async function storePineconeMemory(userQuery: string, botResponse: string, sessionId?: string): Promise<void> {
  const pc = await getPinecone();
  if (!pc) return;

  const indexName = getPineconeIndexName();
  try {
    const memoryText = `User asked: "${userQuery}"\nCUB AI remembered answer: "${botResponse.substring(0, 500)}"`;

    let embedding: number[] | undefined;

    // 1. Try Pinecone Inference
    try {
      const embeddings = await pc.inference.embed("multilingual-e5-large", [memoryText], {
        inputType: "passage",
      });
      if (embeddings && embeddings[0] && embeddings[0].values) {
        embedding = embeddings[0].values;
      }
    } catch (e) {
      // 2. Fallback to Gemini Embeddings
      const geminiKey = getCleanEnvVar(["GEMINI_API_KEY", "VITE_GEMINI_API_KEY", "GOOGLE_API_KEY", "GOOGLE_GEMINI_API_KEY"]);
      if (geminiKey) {
        const embeddingModels = ["gemini-embedding-2-preview", "text-embedding-004", "embedding-001"];
        for (const embModel of embeddingModels) {
          try {
            const ai = new GoogleGenAI({
              apiKey: geminiKey,
              httpOptions: { headers: { "User-Agent": "aistudio-build" } },
            });
            const embRes = await ai.models.embedContent({
              model: embModel,
              contents: memoryText,
            });
            const embResAny = embRes as any;
            if (embResAny && embResAny.embedding && embResAny.embedding.values) {
              embedding = embResAny.embedding.values;
              break;
            }
          } catch (gErr) {
            // try next model
          }
        }
      }
    }

    if (!embedding) return;

    const index = pc.index(indexName);
    const recordId = `mem_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    await index.upsert([
      {
        id: recordId,
        values: embedding,
        metadata: {
          userQuery: userQuery.substring(0, 300),
          botResponse: botResponse.substring(0, 500),
          text: memoryText,
          timestamp: Date.now(),
          sessionId: sessionId || "default",
        },
      },
    ]);
    console.log(`[Pinecone Memory] Stored memory vector ID: ${recordId}`);
  } catch (err) {
    console.warn("[Pinecone Memory Store Notice]", err);
  }
}

// ==================== ELEVENLABS & SERVER MULTILINGUAL TTS ====================
let elevenLabsClientInstance: ElevenLabsClient | null = null;

const getElevenLabsApiKey = (): string | undefined => {
  return getCleanEnvVar(["ELEVENLABS_API_KEY", "VITE_ELEVENLABS_API_KEY"]);
};

const getElevenLabsVoiceId = (): string => {
  return getCleanEnvVar(["ELEVENLABS_VOICE_ID", "VITE_ELEVENLABS_VOICE_ID"]) || "21m00Tcm4TlvDq8ikWAM"; // Default Rachel
};

const getElevenLabsClient = (): ElevenLabsClient | null => {
  const apiKey = getElevenLabsApiKey();
  if (!apiKey) return null;
  if (!elevenLabsClientInstance) {
    elevenLabsClientInstance = new ElevenLabsClient({ apiKey });
  }
  return elevenLabsClientInstance;
};

// Mappings for persona voice IDs (e.g. from ElevenLabs UI selector) to natural HD neural voices
const PERSONA_VOICE_MAP: Record<string, { voice: string; gender: "female" | "male"; name: string }> = {
  "cgSgspJ2msm6clMCkdW9": { voice: "en-US-EmmaNeural", gender: "female", name: "Jessica (Friendly & Clear)" },
  "21m00Tcm4TlvDq8ikWAM": { voice: "en-US-AvaNeural", gender: "female", name: "Rachel / Ava (Warm & Professional)" },
  "EXAVITQu4vr4xnSDxMaL": { voice: "en-US-AriaNeural", gender: "female", name: "Sarah (Calm & Trustworthy)" },
  "2EiwWnXFnvU5JabPnv8n": { voice: "en-US-AndrewNeural", gender: "male", name: "Clyde (Confident & Reassuring)" },
  "onwK4e9ZLuTAKqWW03F9": { voice: "en-US-BrianNeural", gender: "male", name: "Daniel (Authoritative & Deep)" },
};

// Studio-Quality Neural Voice Map across all 26 supported languages (100% verified natural models)
const NEURAL_VOICE_MAP: Record<string, { female: string; male: string }> = {
  en: { female: "en-US-AvaNeural", male: "en-US-AndrewNeural" },
  creole: { female: "en-US-AvaNeural", male: "en-US-AndrewNeural" },
  jam: { female: "en-US-AvaNeural", male: "en-US-AndrewNeural" },
  es: { female: "es-MX-DaliaNeural", male: "es-MX-JorgeNeural" },
  fr: { female: "fr-FR-DeniseNeural", male: "fr-FR-HenriNeural" },
  ht: { female: "fr-FR-DeniseNeural", male: "fr-FR-HenriNeural" },
  pt: { female: "pt-BR-FranciscaNeural", male: "pt-BR-AntonioNeural" },
  de: { female: "de-DE-KatjaNeural", male: "de-DE-ConradNeural" },
  it: { female: "it-IT-ElsaNeural", male: "it-IT-DiegoNeural" },
  nl: { female: "nl-NL-FennaNeural", male: "nl-NL-MaartenNeural" },
  pap: { female: "es-MX-DaliaNeural", male: "es-MX-JorgeNeural" },
  zh: { female: "zh-CN-XiaoxiaoNeural", male: "zh-CN-YunxiNeural" },
  yue: { female: "zh-HK-HiuMaanNeural", male: "zh-HK-WanLungNeural" },
  hi: { female: "hi-IN-SwaraNeural", male: "hi-IN-MadhurNeural" },
  ar: { female: "ar-EG-SalmaNeural", male: "ar-EG-ShakirNeural" },
  ja: { female: "ja-JP-NanamiNeural", male: "ja-JP-KeitaNeural" },
  ko: { female: "ko-KR-SunHiNeural", male: "ko-KR-InJoonNeural" },
  ru: { female: "ru-RU-SvetlanaNeural", male: "ru-RU-DmitryNeural" },
  tl: { female: "fil-PH-BlessicaNeural", male: "fil-PH-AngeloNeural" },
  vi: { female: "vi-VN-HoaiMyNeural", male: "vi-VN-NamMinhNeural" },
  pl: { female: "pl-PL-ZofiaNeural", male: "pl-PL-MarekNeural" },
  sv: { female: "sv-SE-SofieNeural", male: "sv-SE-MattiasNeural" },
  el: { female: "el-GR-AthinaNeural", male: "el-GR-NestorasNeural" },
  tr: { female: "tr-TR-EmelNeural", male: "tr-TR-AhmetNeural" },
  sw: { female: "sw-KE-ZuriNeural", male: "sw-KE-RafikiNeural" },
  bn: { female: "bn-BD-NabanitaNeural", male: "bn-BD-PradeepNeural" },
};

/**
 * Clean & normalize text into fluent, human-like speech without raw markdown,
 * awkward code blocks, or robotic spelling of acronyms, currencies, and phone numbers.
 */
function cleanSpeechText(text: string, lang = "en"): string {
  if (!text) return "";
  let cleaned = text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/[*_~`#>]/g, "")
    .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, "")
    .replace(/^[•\-\*]\s+/gm, "")
    .replace(/\n[•\-\*]\s+/g, ", ")
    .replace(/^\d+\.\s+/gm, "")
    .replace(/\n\d+\.\s+/g, ", ")
    .replace(/\bCUB\b/g, "C-U-B")
    .replace(/\bECCB\b/g, "E-C-C-B")
    .replace(/\bEC\$/g, "Eastern Caribbean dollars ")
    .replace(/\bp\.a\./gi, "per year")
    .replace(/\bAPY\b/gi, "A-P-Y")
    .replace(/\bAPR\b/gi, "A-P-R")
    .replace(/\bATM\b/g, "A-T-M")
    .replace(/\bATMs\b/g, "A-T-Ms")
    .replace(/\bPIN\b/g, "pin")
    .replace(/\be\.g\.,?\s*/gi, "for example, ")
    .replace(/\bi\.e\.,?\s*/gi, "that is, ")
    .replace(/(\d+)%/g, "$1 percent")
    .replace(/(\d{3})-(\d{3})-(\d{4})/g, "$1, $2, $3")
    .replace(/(\d+):00([ap]m)/gi, "$1 $2")
    .replace(/–|-/g, " to ")
    .replace(/\s+/g, " ")
    .trim();

  // Caribbean Creole / Patois natural rhythm & punctuation enhancements:
  if (lang === "creole" || lang === "jam") {
    cleaned = cleaned
      .replace(/\bWa gwan\b/gi, "Wa gwan,")
      .replace(/\bWah a go on\b/gi, "Wah a go on,")
      .replace(/\bBless up\b/gi, "Bless up,")
      .replace(/,\s*,/g, ",");
  }

  return cleaned;
}

/**
 * Server-Side High-Definition Neural Speech Engine powered by Microsoft Azure Neural voices
 * Eliminates robotic audio across all 26 languages and regional Caribbean dialects.
 */
async function generateServerMultilingualTTS(
  text: string,
  lang = "en",
  voiceId?: string
): Promise<{ buffer: Buffer; voiceUsed: string }> {
  const cleaned = cleanSpeechText(text, lang);
  if (!cleaned) {
    throw new Error("No readable text provided.");
  }

  // Determine gender and persona
  const persona = voiceId ? PERSONA_VOICE_MAP[voiceId] : null;
  const isMale = persona?.gender === "male";

  let selectedVoice = "en-US-AvaNeural";
  if (lang === "en" || lang === "creole" || lang === "jam") {
    if (persona?.voice) {
      selectedVoice = persona.voice;
    } else {
      selectedVoice = isMale ? "en-US-AndrewNeural" : "en-US-AvaNeural";
    }
  } else {
    const langEntry = NEURAL_VOICE_MAP[lang] || NEURAL_VOICE_MAP.en;
    selectedVoice = isMale ? langEntry.male : langEntry.female;
  }

  // Dialect-specific cadence and prosody tuning:
  // For Caribbean dialects, a slightly relaxed rate (-3%) gives the voice natural warmth and authentic lilt
  const prosodyRate = lang === "creole" || lang === "jam" ? "-3%" : "+0%";

  // Split into manageable sentence segments (<320 chars) for smooth streaming
  const rawSentences = cleaned.match(/[^.!?\n]+[.!?\n]*/g) || [cleaned];
  const chunks: string[] = [];
  let current = "";

  for (const s of rawSentences) {
    const trimmed = s.trim();
    if (!trimmed) continue;
    if (current && (current + " " + trimmed).length > 320) {
      chunks.push(current);
      current = trimmed;
    } else {
      current = current ? current + " " + trimmed : trimmed;
    }
  }
  if (current) chunks.push(current);

  const audioBuffers: Buffer[] = [];

  for (const chunk of chunks) {
    const tts = new MsEdgeTTS();
    await tts.setMetadata(selectedVoice, OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3);
    const { audioStream } = tts.toStream(chunk, { rate: prosodyRate });
    const partChunks: Buffer[] = [];

    await new Promise<void>((resolve, reject) => {
      audioStream.on("data", (d: Buffer) => partChunks.push(d));
      audioStream.on("end", async () => {
        try {
          await tts.close();
        } catch {}
        resolve();
      });
      audioStream.on("error", async (err: any) => {
        try {
          await tts.close();
        } catch {}
        reject(err);
      });
    });

    if (partChunks.length > 0) {
      audioBuffers.push(Buffer.concat(partChunks));
    }
  }

  if (audioBuffers.length === 0) {
    throw new Error("No audio generated from neural engine.");
  }

  return { buffer: Buffer.concat(audioBuffers), voiceUsed: selectedVoice };
}

async function handleElevenLabsTTS(req: express.Request, res: express.Response) {
  const { text, voiceId, modelId, lang } = req.body;
  if (!text || typeof text !== "string") {
    return res.status(400).json({ error: "Text field is required." });
  }

  const selectedLang = lang || "en";
  const cleanedText = cleanSpeechText(text, selectedLang);

  if (!cleanedText) {
    return res.status(400).json({ error: "No readable text provided." });
  }

  const apiKey = getElevenLabsApiKey();
  let elevenLabsAttemptError: any = null;

  // 1. Attempt ElevenLabs with Multilingual v2 if key is configured
  if (apiKey) {
    try {
      const client = getElevenLabsClient();
      if (client) {
        const selectedVoiceId = voiceId || getElevenLabsVoiceId();
        const selectedModelId = modelId || "eleven_multilingual_v2";

        const audioStream = await client.textToSpeech.convert(selectedVoiceId, {
          text: cleanedText,
          model_id: selectedModelId,
          output_format: "mp3_44100_128",
        });

        res.setHeader("Content-Type", "audio/mpeg");
        res.setHeader("Cache-Control", "public, max-age=3600");
        res.setHeader("X-TTS-Engine", "elevenlabs");
        res.setHeader("X-TTS-Language", selectedLang);
        res.setHeader("X-TTS-Voice", selectedVoiceId);

        if (typeof (audioStream as any).pipe === "function") {
          return (audioStream as any).pipe(res);
        } else if (Symbol.asyncIterator in Object(audioStream)) {
          for await (const chunk of audioStream as any) {
            res.write(chunk);
          }
          return res.end();
        } else {
          const buffer = Buffer.from(await (audioStream as any).arrayBuffer());
          return res.send(buffer);
        }
      }
    } catch (err: any) {
      elevenLabsAttemptError = err;
      console.warn(
        `[ElevenLabs TTS Notice] ElevenLabs unavailable (${err.statusCode || err.message}). Seamlessly engaging High-Definition Server Multilingual Neural Engine for '${selectedLang}'.`
      );
    }
  }

  // 2. High-Definition Server Multilingual Neural Engine (Microsoft Azure Neural HD - zero robotic audio)
  try {
    const { buffer: audioBuffer, voiceUsed } = await generateServerMultilingualTTS(cleanedText, selectedLang, voiceId);
    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Cache-Control", "public, max-age=3600");
    res.setHeader("X-TTS-Engine", "server-multilingual-neural-hd");
    res.setHeader("X-TTS-Language", selectedLang);
    res.setHeader("X-TTS-Voice", voiceUsed);
    if (elevenLabsAttemptError) {
      res.setHeader(
        "X-ElevenLabs-Notice",
        elevenLabsAttemptError?.statusCode === 401 ? "quota_exceeded_or_unauthorized" : "fallback_active"
      );
    }
    return res.send(audioBuffer);
  } catch (neuralErr: any) {
    console.warn("[Neural HD TTS Notice]", neuralErr?.message || neuralErr);
    return res.status(200).json({
      error: neuralErr.message || "Failed to generate multilingual speech.",
      fallback: true,
      elevenLabsError: elevenLabsAttemptError?.message,
    });
  }
}

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json());

  // Shared Chat Handler Logic with Multi-Model Router
  const handleChatRequest = async (req: express.Request, res: express.Response) => {
    try {
      let messages = req.body.messages;
      if (!messages && req.body.message) {
        messages = [{ role: "user", content: req.body.message }];
      }
      if (!Array.isArray(messages)) {
        return res.status(400).json({ error: "Invalid request format. 'message' string or 'messages' array required." });
      }

      const lastUserMsg = [...messages].reverse().find((m: { role: string }) => m.role === "user");
      const userQuery = lastUserMsg ? lastUserMsg.content : "";

      // Check if user memory / past chats context was provided
      const pastChatsSummary = req.body.pastChatsSummary || req.body.userContext;
      const selectedLanguage = req.body.language || "en";
      let effectiveSystemPrompt = SYSTEM_PROMPT;

      const languageNames: Record<string, string> = {
        en: "English",
        creole: "Antiguan Creole / Caribbean Dialect",
        es: "Spanish (Español)",
        fr: "French (Français)",
        ht: "Haitian Creole (Kreyòl Ayisyen)",
        pt: "Portuguese (Português)",
        de: "German (Deutsch)",
        it: "Italian (Italiano)",
        nl: "Dutch (Nederlands)",
        pap: "Papiamento (Papiamentu)",
        zh: "Mandarin Chinese (Simplified)",
        yue: "Cantonese (Traditional)",
        hi: "Hindi",
        ar: "Arabic",
        ja: "Japanese",
        ko: "Korean",
        ru: "Russian",
        tl: "Tagalog / Filipino",
        vi: "Vietnamese",
        jam: "Jamaican Patois (Patwa)",
        pl: "Polish",
        sv: "Swedish",
        el: "Greek",
        tr: "Turkish",
        sw: "Swahili (Kiswahili)",
        bn: "Bengali",
      };

      if (selectedLanguage && selectedLanguage !== "en") {
        const langName = languageNames[selectedLanguage] || selectedLanguage;
        effectiveSystemPrompt += `\n\n### CRITICAL MULTILINGUAL INSTRUCTION:\nThe user's selected language is ${langName} (language code: "${selectedLanguage}").\nYou MUST compose your response entirely in ${langName} with native fluency, cultural warmth, and natural Caribbean hospitality. Do NOT include any <think> tags, internal notes, or raw English debug text. Output only the final clean response directly to the user in ${langName}.`;
      } else {
        effectiveSystemPrompt += `\n\n### MULTILINGUAL MODEL CAPABILITIES & DYNAMIC LANGUAGE DETECTION:\nYou have full native fluency in all languages supported by the Gemini model (including English, Spanish, French, Haitian Creole, Antiguan Creole, Portuguese, German, Italian, Dutch, Papiamento, Mandarin, Cantonese, Hindi, Arabic, Japanese, Korean, Russian, Tagalog, Vietnamese, Jamaican Patois, Polish, Swedish, Greek, Turkish, Swahili, Bengali, and any other world language). If a user writes or greets in ANY language other than English, seamlessly detect and answer fluently, warmly, and naturally in that same language!`;
      }
      if (pastChatsSummary) {
        effectiveSystemPrompt += `\n\n### USER PREVIOUS CHATS & RECAP CONTEXT:\nThe returning customer has interacted with CUB AI in previous sessions. Here is a summary of their past conversation sessions and topics:\n${pastChatsSummary}\n\nIMPORTANT: If the user asks for a recap, asks what they inquired about previously, or references earlier discussions, use this context to provide an accurate, friendly summary of their previous questions!`;
      }

      // 🧠 Retrieve vector memory from Pinecone if configured
      let vectorMemoryRecalled = false;
      if (getPineconeApiKey() && userQuery) {
        try {
          const memories = await retrievePineconeMemory(userQuery);
          if (memories.length > 0) {
            effectiveSystemPrompt += `\n\n### RECALLED LONG-TERM VECTOR MEMORY (FROM PINECONE):\nRelevant past conversation memories and context retrieved from vector store:\n${memories.map(m => `• ${m}`).join("\n")}\n\nUse this recalled long-term memory to maintain personalized continuity if relevant!`;
            vectorMemoryRecalled = true;
            console.log(`[Pinecone Memory] Recalled ${memories.length} relevant vector memories for query.`);
          }
        } catch (memErr) {
          console.warn("[Pinecone Retrieval Notice]", memErr);
        }
      }

      // Run Router Decision
      const routeDecision = classifyRequestRoute(userQuery);
      console.log(`[CUB Multi-Model Router] Query: "${userQuery}" -> Selected Model: ${routeDecision.model} (${routeDecision.reason})`);

      // Helper function for rich Local CUB Knowledge Engine response
      const getLocalCubResponse = (query: string): string => {
        const qLower = query.toLowerCase().trim();

        // 1. Casual Greetings
        if (/^(hi|hello|hey|good morning|good afternoon|good evening|greetings|howdy|hi there|hello there|sup)[\s!.]*$/i.test(qLower) || qLower === "hi" || qLower === "hello" || qLower === "hey") {
          return "Hello! It's so wonderful to connect with you today! I'm Ava, your virtual relationship representative at Caribbean Union Bank. Whether you're exploring high-yield savings, planning for a new home or car loan, or just checking branch hours, I'm right here with you. How are you doing today, and how can I help you prosper?";
        }

        // 1b. Supported Languages Inquiry ("What languages do you speak?" / "Languages the model can do")
        if (
          qLower.includes("language") ||
          qLower.includes("languages") ||
          qLower.includes("idioma") ||
          qLower.includes("langue") ||
          (qLower.includes("what") && qLower.includes("speak")) ||
          (qLower.includes("can you speak"))
        ) {
          return "I am proud to offer full multilingual support for Caribbean Union Bank customers and visitors! Powered by Google Gemini, I natively understand and converse in **26 languages**:\n\n• **Caribbean & Regional**: English, Antiguan Creole (Dialect), Haitian Creole, Jamaican Patois, Papiamento\n• **European**: Spanish, French, Portuguese, German, Italian, Dutch, Polish, Swedish, Greek, Turkish\n• **Asian & Global**: Mandarin Chinese, Cantonese, Hindi, Arabic, Japanese, Korean, Russian, Tagalog/Filipino, Vietnamese, Swahili, Bengali\n\nYou can switch your preferred language at any time in the sidebar menu, or simply start typing or speaking in your preferred language and I will automatically adapt!";
        }

        // 2. Document & Account Opening Requirements (Checked BEFORE general branch hours)
        if (
          qLower.includes("document") ||
          qLower.includes("requirement") ||
          qLower.includes("open account") ||
          qLower.includes("opening account") ||
          qLower.includes("open an account") ||
          qLower.includes("opening an account") ||
          qLower.includes("what do i need") ||
          qLower.includes("what is needed") ||
          qLower.includes("proof of") ||
          qLower.includes("tin") ||
          qLower.includes("valid id")
        ) {
          return "I'd love to help you get started with Caribbean Union Bank! Opening an account with us is quick and straightforward. Here is exactly what you'll need to bring along:\n\n• **Two (2) Valid Photo IDs**: Government-issued Passport, Driver's License, or Electoral Card.\n• **Proof of Address**: A utility bill less than 3 months old, tenancy agreement, or official job letter.\n• **Proof of Income**: A recent job letter or your last 3 pay slips.\n• **Tax Identification Number (TIN)**.\n\n*For Junior Savers Accounts*: Please bring your child's original Birth Certificate along with the parent/guardian's ID, proof of address, and TIN.\n\nOur doors at Friars Hill Road and Factory Road are open Monday–Thursday 8:00am–2:00pm and Friday 8:00am–3:00pm. Which type of account are you looking to open?";
        }

        // 3. Stolen / Lost / Compromised Cards
        if (qLower.includes("compromised") || qLower.includes("stolen") || qLower.includes("lost card") || qLower.includes("lost my card") || qLower.includes("suspect fraud")) {
          return "Take a deep breath — I completely understand how stressful a misplaced or stolen card can be, and your security is our absolute top priority! Let's get your account protected right away:\n\n1. **Call CUB Card Services Immediately**: Dial **(268) 481-8250** or email **cardservices@cub.ag** so our team can freeze card activity.\n2. **Lock it Digitally**: If you have access to CUB Internet Banking or our Mobile App, you can toggle your card status to 'Locked' under Card Controls instantly.\n\nOur team will ensure you are protected and help issue your replacement card safely.";
        }

        // 4. Travel Notifications
        if (qLower.includes("travel") || qLower.includes("notify") || qLower.includes("going abroad") || qLower.includes("overseas")) {
          return "Safe travels on your upcoming journey! To make sure your CUB Visa Debit or Credit card works seamlessly overseas without getting flagged by international security filters:\n\n• Submit a quick Travel Notification via **CUB Internet Banking**\n• Or call our friendly Card Services team at **(268) 481-8250**\n\nLet us know your travel dates and destinations so you can enjoy your trip with total peace of mind!";
        }

        // 5. Account vs Loan Eligibility
        if (qLower.includes("account") && (qLower.includes("loan") || qLower.includes("apply") || qLower.includes("get a loan"))) {
          return "I'm so glad you're considering Caribbean Union Bank for your financing needs! You do **not** need to have an existing account with us to apply for a loan. Once your loan is approved by our credit committee, we will happily set up your new CUB account to service the facility.\n\nOur Credit Services team will be delighted to guide you every step of the way — give them a call at **(268) 481-8285** or email **creditservices@cub.ag**.";
        }

        // 6. Down Payment / Deposit for loans
        if ((qLower.includes("deposit") || qLower.includes("equity") || qLower.includes("down payment")) && (qLower.includes("loan") || qLower.includes("mortgage") || qLower.includes("required"))) {
          return "Sure, let's break that down! Equity or down payment requirements depend on the specific loan type (such as mortgages or vehicle loans) and your credit profile. Please contact CUB Credit Services at (268) 481-8285 or creditservices@cub.ag for exact deposit guidelines tailored to your scenario.";
        }

        // 7. Repayment Terms
        if (qLower.includes("repayment term") || (qLower.includes("repayment") && (qLower.includes("long") || qLower.includes("years") || qLower.includes("period")))) {
          return "Sure, let's take a look at repayment terms! At Caribbean Union Bank, terms are flexible depending on the loan facility:\n\n• Mortgages: Up to 30 years\n• Vehicle Loans: Typically 3 to 7 years\n• Personal / Consumer Loans: Tailored based on loan amount and income";
        }

        // 8. Credit Card Payments
        if (qLower.includes("payment") && (qLower.includes("card") || qLower.includes("credit card"))) {
          return "I'd be glad to help with that! You can easily make payments toward your CUB credit card account through:\n\n1. CUB Internet Banking / Mobile App (instant transfer)\n2. Automatic Standing Order from your CUB account\n3. Over-the-counter payment at any CUB branch\n4. Wire transfer or cheque deposit";
        }

        // 9. Authorized User
        if (qLower.includes("authorized user") || (qLower.includes("add") && qLower.includes("card"))) {
          return "Sure, let's sort that out! To add an Authorized User to your credit card, simply visit any CUB branch or submit a Credit Card Amendment request along with a valid government photo ID (Passport or Driver's License) for the authorized user.";
        }

        // 10. Interest Rates, APY, Loans & Calculator
        if (
          qLower.includes("rate") ||
          qLower.includes("interest") ||
          qLower.includes("priority") ||
          qLower.includes("prestige") ||
          qLower.includes("dollar a day") ||
          qLower.includes("premium saver") ||
          qLower.includes("prime") ||
          qLower.includes("calculate") ||
          qLower.includes("calculator") ||
          qLower.includes("percent") ||
          qLower.includes("%")
        ) {
          return "Sure, let's dive into those rates for you! Here are Caribbean Union Bank's current interest rates and prime lending benchmarks:\n\n• Priority Savings: 2.00% APY ($100 min opening amount)\n• Prestige Savings: Minimum 2.50% APY ($1,000 min opening amount)\n• Dollar A Day Savings: Minimum 2.25% APY ($100 min opening amount)\n• Premium Savers: Minimum 2.75% APY ($5,000 min opening amount)\n• Prime Lending Rate: Benchmark 10.00%, adjusted based on individual credit history.\n\n💡 I warmly invite you to try our interactive CUB Interest & Loan Calculator in the application to estimate exact monthly payments and growth projections!";
        }

        // 11b. Step-by-Step Vehicle / Car Loan Guide
        if (qLower.includes("car loan") || qLower.includes("vehicle loan") || qLower.includes("how to take out a car loan")) {
          return "I'd be happy to guide you through our process for securing a vehicle loan! Getting approved for a new car is easier than you think. Here is the step-by-step guide:\n\n1. **Select Your Vehicle**: Find the car you want and get a formal invoice from the dealership.\n2. **Check Your Eligibility**: Ensure you have a valid photo ID, proof of address, and recent job letter/pay slips.\n3. **Calculate Payments**: Use our in-app Interest & Loan Calculator to estimate your monthly budget.\n4. **Submit Application**: Bring your documents and invoice to our Credit Services department, or call (268) 481-8285 to start the process.\n5. **Credit Assessment**: Our team will review your credit history and application.\n6. **Approval & Disbursement**: Once approved, we will coordinate with you and the dealer for payment.\n\nReady to get started? Call us at **(268) 481-8285** or email **creditservices@cub.ag** to speak with a credit officer!";
        }

        // 11. Branch Hours, Locations, Addresses (SPECIFIC MATCHING ONLY)
        if (
          qLower.includes("branch") ||
          qLower.includes("location") ||
          qLower.includes("address") ||
          qLower.includes("headquarter") ||
          qLower.includes("opening hours") ||
          qLower.includes("operating hours") ||
          qLower.includes("business hours") ||
          qLower.includes("what time") ||
          qLower.includes("are you open") ||
          qLower.includes("when do you close") ||
          qLower.includes("opening time") ||
          qLower.includes("closing time") ||
          qLower.includes("where are you") ||
          qLower.includes("where is cub")
        ) {
          return "Sure, let's get you connected! Here are Caribbean Union Bank Branch Locations & Hours:\n\n• Headquarters (Friars Hill Road):\n  - Friars Hill Road, St. John's (Tel: 268-481-8278 | customer.service@cub.ag)\n  - Hours: Mon–Thu 8:00am–2:00pm | Fri 8:00am–3:00pm\n\n• Factory Road Branch:\n  - Starling Business Complex, Factory Road (Tel: 268-481-8285)\n  - Hours: Mon–Thu 8:00am–2:00pm | Fri 8:00am–3:00pm\n\n• Jolly Harbour Branch:\n  - Valley Road, Jolly Harbour Marina (Tel: 268-481-8265)\n  - Hours: Mon–Fri 9:00am–1:00pm\n\nWebsite: https://caribbeanunionbank.com";
        }

        // 12. Loans & Mortgages
        if (qLower.includes("loan") || qLower.includes("mortgage") || qLower.includes("borrow") || qLower.includes("land") || qLower.includes("vehicle") || qLower.includes("car")) {
          return "Sure, let's explore your financing options! Caribbean Union Bank offers flexible financing options to fit your needs:\n\n• **Mortgages**: Residential purchases, construction, and remodeling.\n• **Vehicle Loans**: Competitive financing for new and pre-owned automobiles.\n• **Land Purchase Loans**: Financing for residential or commercial land plots.\n• **Personal / Consumer Loans**: Financing for education, travel, medical expenses, debt consolidation, home repairs, and more.\n\n• **Prime Lending Rate**: CUB's current Prime Lending Rate is 10.00%. The interest rate offered to each customer may be higher or lower depending on credit history and the results of CUB's credit assessment.\n\nFor personalized loan advice or to begin an application, contact CUB Credit Services at (268) 481-8285 or email creditservices@cub.ag.\n\n💡 *Tip: You can also use our interactive CUB Interest & Loan Calculator in the app to estimate monthly payments!*";
        }

        // 12a. Security & Privacy
        if (qLower.includes("secure") || qLower.includes("security") || qLower.includes("protect") || qLower.includes("safe") || qLower.includes("safety")) {
          return "At Caribbean Union Bank, we treat the security of your account with the utmost seriousness. We utilize industry-leading encryption for all online and mobile banking sessions, employ multi-layered authentication, and continuously monitor for suspicious activity to ensure your financial assets are protected 24/7. \n\nWe recommend maintaining strong, unique passwords for your online banking and never sharing your credentials with anyone. If you ever suspect your account has been compromised, please contact our Card Services or Customer Service team immediately.";
        }

        // 13. Accounts & Savings
        if (qLower.includes("account") || qLower.includes("saving") || qLower.includes("checking") || qLower.includes("chequing") || qLower.includes("cd") || qLower.includes("deposit") || qLower.includes("junior")) {
          return "Sure, let's take a look at our account options! Caribbean Union Bank offers:\n\n### Personal Savings Accounts\n• **Priority Savings**: 2.00% APY ($100 min opening amount) — flexible access, ATM debit card, e-statements.\n• **Prestige Savings**: Minimum 2.50% APY ($1,000 min opening amount) — higher tiered rates.\n• **Dollar A Day Savings**: Minimum 2.25% APY ($100 min opening amount) — builds disciplined savings habits.\n• **Premium Savers**: Minimum 2.75% APY ($5,000 min opening amount) — maximum interest yield.\n• **Junior Savers Account**: Special interest rate for youth up to age 18 to foster money habits early.\n\n### Current / Chequing Accounts\n• **Current Account**: Day-to-day checking with chequebook, international CUB Visa Debit Card, and 24/7 Internet & Mobile Banking.\n\n### Fixed Deposits & Business\n• **Certificates of Deposit (CDs)**: Guaranteed fixed term investments (3-month to multi-year).\n• **Corporate & Business Accounts**: Tailored for business operations, payroll direct deposits, and merchant services.\n\n💡 *Use our interactive CUB Interest Calculator in the app to project your savings growth over time!*";
        }

        // 14. Online Banking, App, Wire
        if (qLower.includes("online") || qLower.includes("internet") || qLower.includes("app") || qLower.includes("transfer") || qLower.includes("e-statement") || qLower.includes("wire") || qLower.includes("swift")) {
          return "Sure, let's get you set up with CUB digital and wire services:\n\n• Internet Banking & Mobile App: 24/7 web access at https://caribbeanunionbank.com to view balances, internal transfers, e-statements & bill payments\n• CUB Visa Debit & Credit Cards: Chip-and-PIN protection for global ATM cash withdrawals & shopping\n• Wire Transfers: Local & SWIFT international wire transfers\n• Lost / Stolen Cards Support: Call Card Services immediately at (268) 481-8250 or email cardservices@cub.ag";
        }

        // 15. Contact Directory
        if (qLower.includes("contact") || qLower.includes("phone") || qLower.includes("email") || qLower.includes("support") || qLower.includes("department")) {
          return "Sure, here is our direct department directory:\n\n• Customer Service: (268) 481-8278 | customer.service@cub.ag\n• Credit Services (Loans): (268) 481-8285 | creditservices@cub.ag\n• Card Services (Lost/Stolen Cards): (268) 481-8250 | cardservices@cub.ag\n• Business Development: (268) 481-8244 | businessdevelopment@cub.ag\n• Human Resources: (268) 481-8285 | hr@cub.ag\n• Finance Department: (268) 481-8278 | finance@cub.ag";
        }

        // 16. About CUB
        if (qLower.includes("never heard") || qLower.includes("who are you") || qLower.includes("about caribbean union bank") || qLower.includes("what is cub")) {
          return "Sure, I'd love to introduce us! Caribbean Union Bank (CUB) is a premier indigenous, full-service commercial bank operating in Antigua and Barbuda. Headquartered on Friars Hill Road in St. John's, we offer personal & commercial banking, high-yield savings, mortgages, vehicle loans, credit cards, and 24/7 online banking. Learn more anytime at https://caribbeanunionbank.com!";
        }

        // Unrelated / Off-topic detector
        const hasBankingContext = 
          qLower.includes("bank") || qLower.includes("cub") || qLower.includes("account") ||
          qLower.includes("loan") || qLower.includes("mortgage") || qLower.includes("save") ||
          qLower.includes("rate") || qLower.includes("card") || qLower.includes("branch") ||
          qLower.includes("hour") || qLower.includes("money") || qLower.includes("deposit") ||
          qLower.includes("withdraw") || qLower.includes("transfer") || qLower.includes("open") ||
          qLower.includes("id") || qLower.includes("passport") || qLower.includes("job") ||
          qLower.includes("credit") || qLower.includes("debit") || qLower.includes("atm") ||
          qLower.includes("contact") || qLower.includes("phone") || qLower.includes("help") ||
          qLower.includes("hi") || qLower.includes("hello") || qLower.includes("hey") ||
          qLower.includes("morning") || qLower.includes("afternoon") || qLower.includes("evening") ||
          qLower.includes("greetings") || qLower.includes("sup") || qLower.includes("thanks") ||
          qLower.includes("thank") || qLower.includes("invest") || qLower.includes("cheque") ||
          qLower.includes("chequing") || qLower.includes("swift") || qLower.includes("wire") ||
          qLower.includes("tin") || qLower.includes("address") || qLower.includes("salary") ||
          qLower.includes("pay") || qLower.includes("car") || qLower.includes("land") ||
          qLower.includes("junior") || qLower.includes("prestige") || qLower.includes("priority") ||
          qLower.includes("premium") || qLower.includes("dollar") || qLower.includes("certificate") ||
          qLower.includes("faq") || qLower.includes("service") || qLower.includes("security") ||
          qLower.includes("travel") || qLower.includes("limit") || qLower.includes("balance") ||
          qLower.includes("language") || qLower.includes("speak") || qLower.includes("idioma") ||
          qLower.includes("langue") || qLower.includes("spanish") || qLower.includes("french") ||
          qLower.includes("creole") || qLower.includes("patois") || qLower.includes("multilingual");

        if (!hasBankingContext && query.trim().length > 0) {
          const cleanInput = query.trim();
          return `As delicious and fun as "${cleanInput}" sounds, it's a bit outside my wheelhouse as your Caribbean Union Bank virtual banking assistant! I'm here specifically to help you with CUB accounts, savings interest rates, loans, credit cards, branch hours, and digital banking services. What banking topic can I help you sort out today?`;
        }

        // Fallback default response
        return "Sure, let's dive into that for you! I'm Ava, your friendly virtual assistant here at Caribbean Union Bank. I can help you with account document requirements, savings interest rates, loan options, or branch hours. What's on your mind today?";
      };

      const getCleanEnvVar = (names: string[]): string | undefined => {
        for (const name of names) {
          const val = process.env[name];
          if (val && typeof val === "string") {
            const cleaned = val.trim().replace(/^["']|["']$/g, "");
            if (cleaned.length > 0) return cleaned;
          }
        }
        return undefined;
      };

      const groqKey = getCleanEnvVar(["GROQ_API_KEY", "VITE_GROQ_API_KEY"]);
      const geminiKey = getCleanEnvVar(["GEMINI_API_KEY", "VITE_GEMINI_API_KEY", "GOOGLE_API_KEY", "GOOGLE_GEMINI_API_KEY"]);

      let responseText: string | null = null;
      let usedModel = "CUB_KNOWLEDGE_ENGINE";

      // 1. Try Groq if selected or if Gemini is absent
      if (groqKey && (routeDecision.model === "GROQ" || !geminiKey)) {
        try {
          const groq = new Groq({ apiKey: groqKey });
          const formattedMessages = [
            { role: "system" as const, content: effectiveSystemPrompt },
            ...messages.map((m: { role: string; content: string }) => ({
              role: m.role === "user" ? ("user" as const) : ("assistant" as const),
              content: m.content,
            })),
          ];

          // Dynamically discover available chat models on this Groq account
          let candidateModels: string[] = [];
          try {
            const modelsList = await groq.models.list();
            if (modelsList && Array.isArray(modelsList.data)) {
              candidateModels = modelsList.data
                .map((m: any) => m.id)
                .filter((id: string) => !id.includes("whisper") && !id.includes("guard"));
            }
          } catch (listErr) {
            // fallback candidate list
            candidateModels = [
              "llama-3.3-70b-versatile",
              "llama-3.1-8b-instant",
              "gemma2-9b-it",
              "qwen-2.5-32b",
              "deepseek-r1-distill-llama-70b",
            ];
          }

          for (const modelName of candidateModels) {
            try {
              const completion = await groq.chat.completions.create({
                messages: formattedMessages,
                model: modelName,
                temperature: 0.3,
                max_completion_tokens: 1024,
              });

              const text = completion.choices[0]?.message?.content;
              if (text && text.trim().length > 0) {
                responseText = text;
                usedModel = `GROQ (${modelName})`;
                break;
              }
            } catch (modelErr) {
              // try next candidate
            }
          }
        } catch (groqErr) {
          // silently fallback to Gemini
        }
      }

      // Helper for timing out API calls so user never gets stuck waiting
      const callWithTimeout = <T>(promise: Promise<T>, ms: number = 6000): Promise<T> => {
        return new Promise((resolve, reject) => {
          const timer = setTimeout(() => reject(new Error(`API Timeout after ${ms}ms`)), ms);
          promise
            .then((res) => {
              clearTimeout(timer);
              resolve(res);
            })
            .catch((err) => {
              clearTimeout(timer);
              reject(err);
            });
        });
      };

      // 1. Try Gemini first (fastest & most reliable) if geminiKey is available
      if (!responseText && geminiKey) {
        const geminiModels = [
          "gemini-3.6-flash",
          "gemini-3.5-flash-lite",
          "gemini-3.1-pro-preview",
        ];
        for (const modelName of geminiModels) {
          try {
            const ai = new GoogleGenAI({
              apiKey: geminiKey,
              httpOptions: { headers: { "User-Agent": "aistudio-build" } },
            });

            // Format contents for Gemini API: MUST start with role 'user'
            const filteredMessages = messages.filter((m: { role: string; content: string }) => m.content && m.content.trim().length > 0);
            const formattedContents: { role: "user" | "model"; parts: { text: string }[] }[] = [];

            for (const m of filteredMessages) {
              const role = m.role === "user" ? "user" : "model";
              if (formattedContents.length === 0 && role === "model") {
                continue;
              }
              formattedContents.push({
                role: role,
                parts: [{ text: m.content }],
              });
            }

            if (formattedContents.length === 0) {
              formattedContents.push({
                role: "user",
                parts: [{ text: userQuery || "Hello" }],
              });
            }

            const executeGemini = async () => {
              return await ai.models.generateContent({
                model: modelName,
                contents: formattedContents,
                config: {
                  systemInstruction: effectiveSystemPrompt,
                  temperature: 0.3,
                },
              });
            };

            let response: any = null;
            try {
              response = await callWithTimeout(executeGemini(), 5000);
            } catch (firstErr: any) {
              throw firstErr;
            }

            responseText = response?.text || null;
            if (responseText) {
              usedModel = `GEMINI (${modelName})`;
              break;
            }
          } catch (geminiErr: any) {
            const isQuota = (geminiErr?.message || "").toLowerCase().includes("quota") || (geminiErr?.message || "").toLowerCase().includes("resource_exhausted");
            if (isQuota) {
              console.warn(`[Gemini Quota Notice] Model ${modelName} exceeded quota/rate-limit. Seamlessly checking next tier model.`);
            } else {
              console.warn(`[Gemini Router Notice] Model ${modelName} unavailable, checking next tier:`, geminiErr?.message || geminiErr);
            }
          }
        }
      }

      // 2. Try Groq if text not generated yet and groqKey is available
      if (!responseText && groqKey) {
        try {
          const groq = new Groq({ apiKey: groqKey });
          const formattedMessages = [
            { role: "system" as const, content: effectiveSystemPrompt },
            ...messages.map((m: { role: string; content: string }) => ({
              role: m.role === "user" ? ("user" as const) : ("assistant" as const),
              content: m.content,
            })),
          ];

          const candidateModels = [
            "llama-3.1-8b-instant",
            "llama-3.3-70b-versatile",
            "gemma2-9b-it",
            "qwen-2.5-32b",
          ];

          for (const modelName of candidateModels) {
            try {
              const completion = await groq.chat.completions.create({
                messages: formattedMessages,
                model: modelName,
                temperature: 0.3,
                max_completion_tokens: 1024,
              });

              const text = completion.choices[0]?.message?.content;
              if (text && text.trim().length > 0) {
                responseText = text;
                usedModel = `GROQ (${modelName})`;
                break;
              }
            } catch (modelErr) {
              // try next candidate
            }
          }
        } catch (groqErr) {
          // silently fallback
        }
      }
      // 4. Ultimate Local CUB Knowledge Engine Fallback (guarantees 100% uptime, zero 500 errors)
      if (!responseText) {
        responseText = getLocalCubResponse(userQuery);
        usedModel = "CUB_KNOWLEDGE_ENGINE";
      }

      // Store memory asynchronously into Pinecone if enabled
      if (responseText && userQuery && getPineconeApiKey()) {
        storePineconeMemory(userQuery, responseText, req.body?.sessionId).catch((pErr) => {
          console.warn("[Pinecone Memory Store Warning]", pErr);
        });
      }

      // Automatically store message, session, and inquiry in SQLite
      const sessId = req.body?.sessionId || `sess_${Date.now()}`;
      try {
        await saveSessionToSQLite(sessId, userQuery.substring(0, 40) || "Banking Session");
        const userMsgId = `msg_${Date.now()}_u`;
        const botMsgId = `msg_${Date.now()}_a`;
        await saveMessageToSQLite(userMsgId, sessId, "user", userQuery);
        await saveMessageToSQLite(botMsgId, sessId, "assistant", responseText, usedModel);
        await logInquiryToSQLite(routeDecision.reason || "general", userQuery, sessId);
      } catch (sqliteErr) {
        console.warn("[SQLite Store Warning]", sqliteErr);
      }

      return res.json({
        reply: responseText,
        response: responseText,
        message: responseText,
        routedModel: usedModel,
        routingReason: routeDecision.reason,
        vectorMemoryActive: !!getPineconeApiKey(),
        sqliteActive: true,
        source: "Caribbean Union Bank Official Knowledge Base",
      });
    } catch (error: any) {
      console.error("Chat API fallback handler triggered:", error);
      const safeReply = "Hello! Welcome to Caribbean Union Bank. I'm CUB AI, your virtual banking representative. How can I assist you with your banking needs today?";
      return res.json({
        reply: safeReply,
        response: safeReply,
        message: safeReply,
        routedModel: "CUB_KNOWLEDGE_ENGINE",
        routingReason: "Graceful recovery mode",
        source: "Caribbean Union Bank Official Knowledge Base",
      });
    }
  };

  // Pre-initialize SQLite Database Engine
  getSQLiteDB()
    .then(() => console.log("[SQLite Engine] Initialized successfully."))
    .catch((e) => console.error("[SQLite Engine Initialization Error]", e));

  // 📖 Mount FastAPI-style Swagger Interactive API Documentation
  app.use(["/api/docs", "/docs"], swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: "CUB AI - FastAPI Style REST API Documentation",
  }));

  // 🗄️ SQLite Database REST API Routes
  app.get("/api/sqlite/stats", async (req, res) => {
    try {
      const stats = await getSQLiteStats();
      return res.json(stats);
    } catch (err: any) {
      return res.status(500).json({ error: err.message || "Failed to fetch SQLite stats." });
    }
  });

  app.get("/api/sqlite/sessions", async (req, res) => {
    try {
      const sessions = await getSessionsFromSQLite();
      return res.json(sessions);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/sqlite/sessions/:id", async (req, res) => {
    try {
      const messages = await getMessagesFromSQLite(req.params.id);
      return res.json(messages);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/sqlite/sessions", async (req, res) => {
    try {
      const { id, title } = req.body;
      if (!id || !title) {
        return res.status(400).json({ error: "Fields 'id' and 'title' required." });
      }
      await saveSessionToSQLite(id, title);
      return res.json({ status: "success", id, title });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.delete("/api/sqlite/sessions/:id", async (req, res) => {
    try {
      await deleteSessionFromSQLite(req.params.id);
      return res.json({ status: "deleted", id: req.params.id });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/sqlite/feedback", async (req, res) => {
    try {
      const { messageId, rating, comment } = req.body;
      if (!messageId || !rating) {
        return res.status(400).json({ error: "Fields 'messageId' and 'rating' required." });
      }
      await saveFeedbackToSQLite(messageId, rating, comment);
      return res.json({ status: "saved" });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // API Routes for AI Chatbot
  app.post("/api/chat", handleChatRequest);
  app.post("/chat", handleChatRequest);

  // ElevenLabs Text-to-Speech Routes
  app.post(["/api/tts/elevenlabs", "/api/tts"], handleElevenLabsTTS);

  // Status and Diagnostic Endpoint
  app.get(["/api/status", "/api/health"], (req, res) => {
    const getClean = (names: string[]) => {
      for (const n of names) {
        const v = process.env[n];
        if (v && v.trim()) return v.trim().replace(/^["']|["']$/g, "");
      }
      return undefined;
    };
    const gemini = getClean(["GEMINI_API_KEY", "VITE_GEMINI_API_KEY", "GOOGLE_API_KEY", "GOOGLE_GEMINI_API_KEY"]);
    const groq = getClean(["GROQ_API_KEY", "VITE_GROQ_API_KEY"]);
    const elevenlabs = getClean(["ELEVENLABS_API_KEY", "VITE_ELEVENLABS_API_KEY"]);
    const pinecone = getClean(["PINECONE_API_KEY", "VITE_PINECONE_API_KEY"]);

    return res.json({
      status: "online",
      service: "Caribbean Union Bank CUB AI Server",
      environment: process.env.NODE_ENV || "development",
      keysDetected: {
        gemini: !!gemini,
        geminiPrefix: gemini ? `${gemini.substring(0, 6)}...` : "NOT_FOUND",
        groq: !!groq,
        groqPrefix: groq ? `${groq.substring(0, 6)}...` : "NOT_FOUND",
        elevenlabs: !!elevenlabs,
        elevenlabsPrefix: elevenlabs ? `${elevenlabs.substring(0, 6)}...` : "NOT_FOUND",
        pinecone: !!pinecone,
        pineconePrefix: pinecone ? `${pinecone.substring(0, 6)}...` : "NOT_FOUND",
        pineconeIndex: getPineconeIndexName(),
      },
      renderDetected: !!process.env.RENDER,
      port: PORT,
    });
  });

  // Serve standalone HTML view
  app.get(["/html", "/standalone.html"], (req, res) => {
    const htmlPath = path.join(process.cwd(), "public", "standalone.html");
    if (fs.existsSync(htmlPath)) {
      return res.sendFile(htmlPath);
    }
    return res.status(404).send("Standalone HTML not found");
  });

  // API Route to fetch Standalone HTML code
  app.get("/api/html-code", (req, res) => {
    try {
      const html = fs.readFileSync(path.join(process.cwd(), "public", "standalone.html"), "utf-8");
      return res.json({ html });
    } catch (err: any) {
      return res.status(500).json({ error: "Failed to read standalone HTML code." });
    }
  });

  // Vite middleware for development vs static serve for production
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*all", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
