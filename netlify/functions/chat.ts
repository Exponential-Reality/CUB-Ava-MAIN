import { GoogleGenAI } from "@google/genai";

const CUB_KNOWLEDGE = `
CARIBBEAN UNION BANK (CUB) OFFICIAL KNOWLEDGE BASE:

1. ABOUT CARIBBEAN UNION BANK:
• Premier indigenous full-service commercial bank in Antigua & Barbuda.
• Headquarters: Friars Hill Road, St. John's, Antigua.
• Website: https://caribbeanunionbank.com
• Phone: (268) 481-8278 / Customer Service: customer.service@cub.ag

2. BRANCH LOCATIONS & OPERATING HOURS:
• Headquarters — Friars Hill Road: Mon–Thu 8:00am–2:00pm | Fri 8:00am–3:00pm | Tel: (268) 481-8278
• Factory Road Branch: Mon–Thu 8:00am–2:00pm | Fri 8:00am–3:00pm | Tel: (268) 481-8285
• Jolly Harbour Branch: Mon–Fri 9:00am–1:00pm | Tel: (268) 481-8265
• All branches feature 24/7 ATMs.

3. ACCOUNTS & SAVINGS:
• Priority Savings: 2.00% APY ($100 min opening deposit), ATM debit card.
• Prestige Savings: Min 2.50% APY ($1,000 min opening deposit), tiered rates.
• Dollar A Day Savings: Min 2.25% APY ($100 min opening deposit).
• Premium Savers: Min 2.75% APY ($5,000 min opening deposit).
• Current Chequing Account: Chequebook, CUB Visa Debit Card, 24/7 Internet Banking.

4. LOANS & RATES:
• Prime Lending Rate: 10.00% benchmark.
• Mortgages (up to 30 yrs), Vehicle Loans, Land Loans, Personal Loans, Business Financing.
• Credit Services Contact: (268) 481-8285 or creditservices@cub.ag.

5. ACCOUNT OPENING REQUIREMENTS:
• 2 valid government photo IDs, Proof of Address (<3 mos old), Proof of Income, TIN.
`;

const SYSTEM_PROMPT = `
You are CUB AI, the official virtual banking representative for Caribbean Union Bank (CUB).
Speak warmly, knowledgeably, and helpfully like a human CUB banking representative.
Never guess or fabricate interest rates, never ask for passwords/PINs/CVVs, and guide customers on CUB products, locations, loan rates, and account requirements.
`;

export default async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
      },
    });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json();
    const messages = body.messages || [];
    const userMessage = messages[messages.length - 1]?.content || "";

    const rawKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    const apiKey = rawKey ? rawKey.trim().replace(/^["']|["']$/g, "") : "";

    if (!apiKey) {
      return new Response(
        JSON.stringify({
          reply: "Welcome to Caribbean Union Bank! To enable real-time AI responses on Netlify, please add your GEMINI_API_KEY in Netlify Site Configuration > Environment Variables.",
          routedModel: "NETLIFY_SETUP_NOTICE",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: { headers: { "User-Agent": "aistudio-build" } },
    });
    const geminiModels = ["gemini-3.6-flash", "gemini-flash-latest", "gemini-3.1-flash-lite"];

    let replyText = "";
    let usedModel = "";

    for (const modelName of geminiModels) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: [
            {
              role: "user",
              parts: [{ text: `${SYSTEM_PROMPT}\n\nKNOWLEDGE BASE:\n${CUB_KNOWLEDGE}\n\nUser Question: ${userMessage}` }],
            },
          ],
        });
        if (response.text) {
          replyText = response.text;
          usedModel = modelName;
          break;
        }
      } catch (err) {
        console.warn(`Model ${modelName} failed on Netlify:`, err);
      }
    }

    if (!replyText) {
      replyText = "Thank you for contacting Caribbean Union Bank. How else may I assist you with your banking needs today?";
      usedModel = "CUB_KNOWLEDGE_BASE";
    }

    return new Response(
      JSON.stringify({
        reply: replyText,
        routedModel: usedModel.toUpperCase(),
        routingReason: "Netlify Serverless AI Function",
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Netlify serverless chat error:", error);
    return new Response(
      JSON.stringify({
        reply: "Hello! Welcome to Caribbean Union Bank. How can I assist you with our accounts, loans, mortgages, or branch services today?",
        routedModel: "CUB_FALLBACK_ENGINE",
        error: error.message,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  }
};
