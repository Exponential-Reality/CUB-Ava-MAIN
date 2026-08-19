import express from "express";
import path from "path";
import fs from "fs";
import Groq from "groq-sdk";
import { GoogleGenAI } from "@google/genai";
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
• Official FAQs Link: https://caribbeanunionbank.com/faqs/
`;

const SYSTEM_PROMPT = `
# CUB AI - SYSTEM INSTRUCTIONS

## Identity & Tone
You are CUB AI, the official digital banking representative for Caribbean Union Bank (CUB) in Antigua and Barbuda.
You speak naturally, warmly, intelligently, and professionally — like an experienced, welcoming human banker at our Friars Hill Road or Factory Road branches.

---

## Conversational Guidelines
- **Keep it Simple & Understanding**: Speak with genuine warmth, empathy, and clarity. Avoid overly verbose explanations, unnecessary corporate jargon, or excessive bullet points. Get straight to the point while remaining kind and understanding.
- **Be Direct and Helpful**: Answer the customer's specific question clearly and concisely. Avoid unnecessary filler or forced generic headers.
- **Natural Caribbean Hospitality**: Speak with warm, courteous professionalism ("Hello!", "I would be happy to help you with that.").
- **Multilingual & Caribbean Creole**:
  - If a user speaks to you in Antiguan Creole or Caribbean dialect (e.g., "Wa gwan", "Wah documents me need fi open one account?"), understand it perfectly and respond warmly, naturally, and helpfully with Caribbean friendliness.
  - If a user speaks in another language (Spanish, French, Haitian Creole, German, Mandarin, etc.), respond fluently, politely, and accurately in that same language.
- **Strict Banking Rules**:
  - Never guess or fabricate interest rates, fees, or loan terms. Use ONLY the verified CUB facts provided.
  - Never guarantee loan approvals; explain that approvals are subject to CUB's credit assessment.
  - Never ask for sensitive security details (passwords, PINs, CVVs, full card numbers).

---

## Caribbean Union Bank Interest Rates & Key Details:
• Priority Savings: 2.00% p.a. ($100 minimum opening deposit)
• Prestige Savings: Minimum 2.50% p.a. ($1,000 minimum opening deposit)
• Dollar A Day Savings: Minimum 2.25% p.a. ($100 minimum opening deposit)
• Premium Savers: Minimum 2.75% p.a. ($5,000 minimum opening deposit)
• Prime Lending Rate: 10.00% benchmark (actual loan rates depend on credit assessment)
• Residential Mortgages: Repayment terms up to 30 years
• Contact: Customer Service (268) 481-8278 | Credit Services (268) 481-8285 | customer.service@cub.ag
• Branch Hours: Mon–Thu 8:00am–2:00pm, Fri 8:00am–3:00pm (Friars Hill Rd & Factory Rd)

---

# CORE KNOWLEDGE AREAS
You are only responsible for information related to:

## Caribbean Union Bank Information
You can explain:
- CUB products and services
- CUB banking procedures
- CUB account options
- CUB customer support information
- CUB digital banking services
- CUB business services
- CUB policies provided in your knowledge files

## PERSONAL BANKING
You can answer questions about:
- Savings accounts
- Current/checking accounts
- Certificates of Deposit
- Debit cards
- Credit cards
- Personal banking services
- Account benefits
- Account requirements
- Account opening procedures
- Required documents
- Banking features

## LOANS AND CREDIT
You can explain:
- Personal loans
- Business loans
- Vehicle loans
- Mortgage loans
- Loan application processes
- General loan requirements
- Loan terminology
- Repayment concepts

You must never guarantee loan approval.
You must never decide whether someone qualifies for a loan.

## BUSINESS BANKING
You can explain:
- Business accounts
- Business services
- Merchant services
- Payroll services
- Corporate banking solutions
- Business banking procedures

## CARDS
You can explain:
- Debit cards
- Credit cards
- Card features
- Card usage information
- Card safety
- Lost or stolen card procedures
- General card support

Never request:
- Full card numbers
- CVV codes
- PIN numbers

## DIGITAL BANKING
You can explain:
- Online banking
- Mobile banking
- Account access procedures
- Digital banking features
- Password recovery guidance

Never request:
- Passwords
- One-time passwords
- Security answers
- Login credentials

## PAYMENTS AND TRANSFERS
You can explain:
- Wire transfers
- Bank transfers
- Payment procedures
- Transfer requirements
- Transfer safety

You cannot perform transfers or access accounts.

## FEES AND RATES
You may explain:
- Interest rates
- Banking fees
- Charges
- Loan rates
- Account costs

ONLY use information provided in official CUB knowledge sources.
Never estimate.
Never guess.
Never create a rate or fee.

## SECURITY AND FRAUD
You can help with:
- Fraud prevention
- Account security education
- Suspicious activity guidance
- Safe banking practices

If a customer reports:
- Fraud
- Unauthorized transactions
- Lost cards
- Stolen information
- Account compromise
Warmly and immediately advise contacting CUB directly through official channels ((268) 481-8250 or cardservices@cub.ag).

## CUSTOMER SUPPORT
You can assist with:
- Frequently asked questions
- Banking explanations
- Finding relevant CUB information
- Explaining procedures

---

# KNOWLEDGE SOURCE RULE
Your verified CUB knowledge base is:
${BANK_FACTS}

If the answer is not available in your knowledge sources, say warmly:
"I don't have the exact details on that in my current records, but our friendly Customer Service team at Caribbean Union Bank will be glad to assist you! You can reach them at (268) 481-8278 or customer.service@cub.ag."

Never invent information.

---

# STRICT LIMITATIONS
You must not answer questions about:
- Politics
- Medical advice
- Legal advice
- Programming
- Gaming
- Entertainment
- Personal opinions
- School assignments
- General unrelated topics
- Investment recommendations
- Tax advice

If asked about non-banking topics, respond warmly but firmly with:
"I'd love to chat, but I am specialized specifically as your Caribbean Union Bank virtual banking assistant! I'm here to help you with any questions about CUB accounts, interest rates, loans, credit cards, or branch services. What banking topic can I help you with today?"

---

# RESPONSE STYLE & FORMAT
1. Be warm, natural, human, and conversational while being clear and professional.
2. Use bullet points and bold formatting for easy scanning (e.g., list of requirements or interest rate tiers).
3. Answer directly, provide helpful details, and offer logical next steps or contact info.

Example:
Customer: "What documents do I need to open a personal account?"
Response:
"I'd be glad to help you get ready to open your personal account with us! Here is what you'll need to bring into any Caribbean Union Bank branch:

• **Two valid photo IDs**: Government-issued Passport, Driver's License, or Electoral Card.
• **Proof of Address**: Utility bill less than 3 months old, job letter, or tax statement.
• **Proof of Income**: Recent job letter or your last 3 pay slips.
• **Tax Identification Number (TIN)**.

Our branches on Friars Hill Road and Factory Road are open Monday through Thursday 8am–2pm and Fridays 8am–3pm. Let me know if you have any questions about specific account options!"

---

# HUMAN ESCALATION
Recommend human assistance for:
- Account-specific requests
- Balance inquiries
- Transactions
- Fraud cases
- Lost cards
- Password issues
- Complaints
- Loan decisions
- Account closures
- Legal issues

---

# FINAL RULE
Your priority is accuracy, warmth, and customer safety.
If you do not know, say so politely.
Never guess.
Never pretend to have access to live CUB account systems.
You are a trusted, friendly CUB information assistant!
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
      let effectiveSystemPrompt = SYSTEM_PROMPT;
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
          return "Hello! Welcome to Caribbean Union Bank. I'm CUB AI, your virtual banking representative. How can I help you today? Feel free to ask about our high-yield savings accounts, home mortgages, credit cards, or branch locations!";
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
          return "To open a Personal Account at Caribbean Union Bank, you'll just need to bring:\n\n1. Two (2) valid government photo IDs (Passport, Driver's License, or Electoral Card)\n2. Proof of Address (Utility bill under 3 months old or Job Letter)\n3. Proof of Income (Job Letter or last 3 pay slips)\n4. Tax Identification Number (TIN)\n\nFor Junior Savers Accounts: Child's original Birth Certificate + Parent/Guardian photo ID, proof of address & TIN.\n\nOur branches are open Monday–Thursday 8:00am–2:00pm and Friday 8:00am–3:00pm. Let me know if you need help choosing an account type!";
        }

        // 3. Stolen / Lost / Compromised Cards
        if (qLower.includes("compromised") || qLower.includes("stolen") || qLower.includes("lost card") || qLower.includes("lost my card") || qLower.includes("suspect fraud")) {
          return "If you suspect your card or account has been compromised, or if your card is lost or stolen:\n\n1. Call CUB Card Services immediately at (268) 481-8250 or email cardservices@cub.ag\n2. Lock or freeze your card instantly via CUB Internet Banking or Mobile App under Card Settings.";
        }

        // 4. Travel Notifications
        if (qLower.includes("travel") || qLower.includes("notify") || qLower.includes("going abroad") || qLower.includes("overseas")) {
          return "Notifying us before you travel ensures your CUB Visa Debit or Credit card remains active and isn't flagged by security filters during international transactions. Submit a quick travel notification via CUB Internet Banking or call Card Services at (268) 481-8250.";
        }

        // 5. Account vs Loan Eligibility
        if (qLower.includes("account") && (qLower.includes("loan") || qLower.includes("apply") || qLower.includes("get a loan"))) {
          return "If you don't have an account with us yet, you can still apply for a loan! Once your application is approved, we'll set up a CUB account for your loan servicing.\n\nOur Credit Services team will be happy to guide you — reach out to them at (268) 481-8285 or creditservices@cub.ag.";
        }

        // 6. Down Payment / Deposit for loans
        if ((qLower.includes("deposit") || qLower.includes("equity") || qLower.includes("down payment")) && (qLower.includes("loan") || qLower.includes("mortgage") || qLower.includes("required"))) {
          return "Equity or down payment requirements depend on the specific loan type (such as mortgages or vehicle loans) and your credit profile. Please contact CUB Credit Services at (268) 481-8285 or creditservices@cub.ag for exact deposit guidelines tailored to your scenario.";
        }

        // 7. Repayment Terms
        if (qLower.includes("repayment term") || (qLower.includes("repayment") && (qLower.includes("long") || qLower.includes("years") || qLower.includes("period")))) {
          return "Repayment terms at Caribbean Union Bank are flexible and depend on the loan facility:\n\n• Mortgages: Up to 30 years\n• Vehicle Loans: Typically 3 to 7 years\n• Personal / Consumer Loans: Tailored based on loan amount and income";
        }

        // 8. Credit Card Payments
        if (qLower.includes("payment") && (qLower.includes("card") || qLower.includes("credit card"))) {
          return "You can easily make payments toward your CUB credit card account through:\n\n1. CUB Internet Banking / Mobile App (instant transfer)\n2. Automatic Standing Order from your CUB account\n3. Over-the-counter payment at any CUB branch\n4. Wire transfer or cheque deposit";
        }

        // 9. Authorized User
        if (qLower.includes("authorized user") || (qLower.includes("add") && qLower.includes("card"))) {
          return "To add an Authorized User to your credit card, simply visit any CUB branch or submit a Credit Card Amendment request along with a valid government photo ID (Passport or Driver's License) for the authorized user.";
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
          return "Here are Caribbean Union Bank's current interest rates and prime lending benchmarks:\n\n• Priority Savings: 2.00% APY ($100 min opening amount)\n• Prestige Savings: Minimum 2.50% APY ($1,000 min opening amount)\n• Dollar A Day Savings: Minimum 2.25% APY ($100 min opening amount)\n• Premium Savers: Minimum 2.75% APY ($5,000 min opening amount)\n• Prime Lending Rate: Benchmark 10.00%, adjusted based on individual credit history.\n\n💡 I warmly invite you to try our interactive CUB Interest & Loan Calculator in the application to estimate exact monthly payments and growth projections!";
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
          return "Caribbean Union Bank Branch Locations & Hours:\n\n• Headquarters (Friars Hill Road):\n  - Friars Hill Road, St. John's (Tel: 268-481-8278 | customer.service@cub.ag)\n  - Hours: Mon–Thu 8:00am–2:00pm | Fri 8:00am–3:00pm\n\n• Factory Road Branch:\n  - Starling Business Complex, Factory Road (Tel: 268-481-8285)\n  - Hours: Mon–Thu 8:00am–2:00pm | Fri 8:00am–3:00pm\n\n• Jolly Harbour Branch:\n  - Valley Road, Jolly Harbour Marina (Tel: 268-481-8265)\n  - Hours: Mon–Fri 9:00am–1:00pm\n\nWebsite: https://caribbeanunionbank.com";
        }

        // 12. Loans & Mortgages
        if (qLower.includes("loan") || qLower.includes("mortgage") || qLower.includes("borrow") || qLower.includes("land") || qLower.includes("vehicle") || qLower.includes("car")) {
          return "Caribbean Union Bank offers flexible financing options to fit your needs:\n\n• **Mortgages**: Residential purchases, construction, and remodeling.\n• **Vehicle Loans**: Competitive financing for new and pre-owned automobiles.\n• **Land Purchase Loans**: Financing for residential or commercial land plots.\n• **Personal / Consumer Loans**: Financing for education, travel, medical expenses, debt consolidation, home repairs, and more.\n\n• **Prime Lending Rate**: CUB's current Prime Lending Rate is 10.00%. The interest rate offered to each customer may be higher or lower depending on credit history and the results of CUB's credit assessment.\n\nFor personalized loan advice or to begin an application, contact CUB Credit Services at (268) 481-8285 or email creditservices@cub.ag.\n\n💡 *Tip: You can also use our interactive CUB Interest & Loan Calculator in the app to estimate monthly payments!*";
        }

        // 13. Accounts & Savings
        if (qLower.includes("account") || qLower.includes("saving") || qLower.includes("checking") || qLower.includes("chequing") || qLower.includes("cd") || qLower.includes("deposit") || qLower.includes("junior")) {
          return "Caribbean Union Bank Account Options & Interest Rates:\n\n### Personal Savings Accounts\n• **Priority Savings**: 2.00% APY ($100 min opening amount) — flexible access, ATM debit card, e-statements.\n• **Prestige Savings**: Minimum 2.50% APY ($1,000 min opening amount) — higher tiered rates.\n• **Dollar A Day Savings**: Minimum 2.25% APY ($100 min opening amount) — builds disciplined savings habits.\n• **Premium Savers**: Minimum 2.75% APY ($5,000 min opening amount) — maximum interest yield.\n• **Junior Savers Account**: Special interest rate for youth up to age 18 to foster money habits early.\n\n### Current / Chequing Accounts\n• **Current Account**: Day-to-day checking with chequebook, international CUB Visa Debit Card, and 24/7 Internet & Mobile Banking.\n\n### Fixed Deposits & Business\n• **Certificates of Deposit (CDs)**: Guaranteed fixed term investments (3-month to multi-year).\n• **Corporate & Business Accounts**: Tailored for business operations, payroll direct deposits, and merchant services.\n\n💡 *Use our interactive CUB Interest Calculator in the app to project your savings growth over time!*";
        }

        // 14. Online Banking, App, Wire
        if (qLower.includes("online") || qLower.includes("internet") || qLower.includes("app") || qLower.includes("transfer") || qLower.includes("e-statement") || qLower.includes("wire") || qLower.includes("swift")) {
          return "CUB Digital Banking & Card Services:\n\n• Internet Banking & Mobile App: 24/7 web access at https://caribbeanunionbank.com to view balances, internal transfers, e-statements & bill payments\n• CUB Visa Debit & Credit Cards: Chip-and-PIN protection for global ATM cash withdrawals & shopping\n• Wire Transfers: Local & SWIFT international wire transfers\n• Lost / Stolen Cards Support: Call Card Services immediately at (268) 481-8250 or email cardservices@cub.ag";
        }

        // 15. Contact Directory
        if (qLower.includes("contact") || qLower.includes("phone") || qLower.includes("email") || qLower.includes("support") || qLower.includes("department")) {
          return "Caribbean Union Bank Department Directory:\n\n• Customer Service: (268) 481-8278 | customer.service@cub.ag\n• Credit Services (Loans): (268) 481-8285 | creditservices@cub.ag\n• Card Services (Lost/Stolen Cards): (268) 481-8250 | cardservices@cub.ag\n• Business Development: (268) 481-8244 | businessdevelopment@cub.ag\n• Human Resources: (268) 481-8285 | hr@cub.ag\n• Finance Department: (268) 481-8278 | finance@cub.ag";
        }

        // 16. About CUB
        if (qLower.includes("never heard") || qLower.includes("who are you") || qLower.includes("about caribbean union bank") || qLower.includes("what is cub")) {
          return "Caribbean Union Bank (CUB) is a premier indigenous, full-service commercial bank operating in Antigua and Barbuda. Headquartered on Friars Hill Road in St. John's, we offer personal & commercial banking, high-yield savings, mortgages, vehicle loans, credit cards, and 24/7 online banking. Learn more anytime at https://caribbeanunionbank.com!";
        }

        // Fallback default response
        return "Hello! I'm CUB AI, your digital assistant for Caribbean Union Bank. I can help you with account document requirements, savings interest rates, loan applications, credit cards, or branch hours. How may I assist you today?";
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
        const geminiModels = ["gemini-3.6-flash", "gemini-3.7-flash", "gemini-flash-latest"];
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
              usedModel = "GEMINI";
              break;
            }
          } catch (geminiErr: any) {
            console.warn(`[Gemini Router Notice] Model ${modelName} unavailable, checking next tier:`, geminiErr?.message || geminiErr);
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
