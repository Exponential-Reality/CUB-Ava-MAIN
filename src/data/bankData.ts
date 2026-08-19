import { ThemeColors, ThemeName, BranchLocation } from "../types";

export const THEMES: Record<ThemeName, ThemeColors> = {
  "Amber Gold": {
    primary: "#ff9f43",
    secondary: "#ffb366",
    glow: "rgba(255,159,67,0.35)",
    tint: "#1a1005",
  },
  "Ocean Teal": {
    primary: "#1fa89c",
    secondary: "#2dc4c0",
    glow: "rgba(31,168,156,0.35)",
    tint: "#051a18",
  },
  "Royal Purple": {
    primary: "#a855f7",
    secondary: "#c084fc",
    glow: "rgba(168,85,247,0.35)",
    tint: "#160a1f",
  },
  "Crimson Red": {
    primary: "#ef4444",
    secondary: "#f87171",
    glow: "rgba(239,68,68,0.35)",
    tint: "#1f0a0a",
  },
  "Emerald": {
    primary: "#10b981",
    secondary: "#34d399",
    glow: "rgba(16,185,129,0.35)",
    tint: "#051f14",
  },
  "Sapphire Blue": {
    primary: "#3b82f6",
    secondary: "#60a5fa",
    glow: "rgba(59,130,246,0.35)",
    tint: "#050e1f",
  },
};

export const LOCATIONS: Record<string, BranchLocation> = {
  "Headquarters — Friars Hill Road": {
    address: "Friars Hill Road, P.O. Box W2010, St. John's, Antigua",
    phone: "(268) 481-8278",
    phone_tel: "2684818278",
    email: "customer.service@cub.ag",
    hours: "Mon – Thu: 8:00 am – 2:00 pm · Fri: 8:00 am – 3:00 pm",
  },
  "Factory Road Branch": {
    address: "Starling Business Complex, Factory Road, St. John's, Antigua",
    phone: "(268) 481-8285",
    phone_tel: "2684818285",
    email: "customer.service@cub.ag",
    hours: "Mon – Thu: 8:00 am – 2:00 pm · Fri: 8:00 am – 3:00 pm",
  },
  "Jolly Harbour Branch": {
    address: "Valley Road, Jolly Harbour Marina, St. Mary's, Antigua",
    phone: "(268) 481-8265",
    phone_tel: "2684818265",
    email: "customer.service@cub.ag",
    hours: "Mon – Fri: 9:00 am – 1:00 pm",
  },
  "Human Resources": {
    address: "Headquarters, Friars Hill Road, St. John's",
    phone: "(268) 481-8285",
    phone_tel: "2684818285",
    email: "hr@cub.ag",
    hours: "Mon – Thu: 8am–2pm · Fri: 8am–3pm",
  },
  "Business Development": {
    address: "Headquarters, Friars Hill Road, St. John's",
    phone: "(268) 481-8244",
    phone_tel: "2684818244",
    email: "businessdevelopment@cub.ag",
    hours: "Mon – Thu: 8am–2pm · Fri: 8am–3pm",
  },
  "Card Services": {
    address: "Headquarters, Friars Hill Road, St. John's",
    phone: "(268) 481-8250",
    phone_tel: "2684818250",
    email: "cardservices@cub.ag",
    hours: "Mon – Thu: 8am–2pm · Fri: 8am–3pm",
  },
  "Credit Services (Loans)": {
    address: "Headquarters, Friars Hill Road, St. John's",
    phone: "(268) 481-8285",
    phone_tel: "2684818285",
    email: "creditservices@cub.ag",
    hours: "Mon – Thu: 8am–2pm · Fri: 8am–3pm",
  },
  Finance: {
    address: "Headquarters, Friars Hill Road, St. John's",
    phone: "(268) 481-8278",
    phone_tel: "2684818278",
    email: "finance@cub.ag",
    hours: "Mon – Thu: 8am–2pm · Fri: 8am–3pm",
  },
};

export const NAV_ITEMS = [
  { label: "Home", prompt: "" },
  { label: "Accounts", prompt: "Tell me about account types" },
  { label: "Transfers", prompt: "How do I transfer money?" },
  { label: "Investments", prompt: "Tell me about investment and CD options" },
  { label: "Loans", prompt: "Tell me about loans and loan options" },
  { label: "Security", prompt: "How does CUB keep my account secure?" },
  { label: "Support", prompt: "I need help — what support options are available?" },
];

export const QUICK_PILLS = [
  { label: "CUB Rates & Calculator", prompt: "What are Caribbean Union Bank's interest rates for savings accounts and loans?" },
  { label: "Opening Hours", prompt: "What are your branch opening hours and locations?" },
  { label: "Required Documents", prompt: "What documents do I need to open an account?" },
  { label: "Loan Options", prompt: "What loan and mortgage options does CUB offer?" },
];

export const CUB_INTEREST_RATES_SUMMARY = {
  prioritySavings: { rate: "2.00%", minOpening: "$100" },
  prestigeSavings: { rate: "Minimum 2.50%", minOpening: "$1,000", notes: "Varies by balance" },
  dollarADay: { rate: "Minimum 2.25%", minOpening: "$100", notes: "Varies by balance" },
  premiumSavers: { rate: "Minimum 2.75%", minOpening: "$5,000", notes: "Varies by balance" },
  primeLending: { benchmarkRate: "10.00%", notes: "Adjusted based on individual credit history and evaluations" },
};

export interface FAQItem {
  id: string;
  category: "General & Loans" | "Credit Cards";
  question: string;
  prompt: string;
  previewAnswer?: string;
}

export const FAQ_ITEMS: FAQItem[] = [
  {
    id: "account-for-loan",
    category: "General & Loans",
    question: "Do I need to have an account with CUB to get a loan?",
    prompt: "Do I need to have an account with CUB to get a loan?",
    previewAnswer: "If you do not have an account, you can apply for a loan; however, once a loan application is approved a CUB account will be required for loan servicing."
  },
  {
    id: "who-is-cub",
    category: "General & Loans",
    question: "I've never heard about Caribbean Union Bank. Who are you?",
    prompt: "I've never heard about Caribbean Union Bank. Who are you?",
    previewAnswer: "Caribbean Union Bank (CUB) is a premier indigenous full-service commercial bank operating in Antigua and Barbuda."
  },
  {
    id: "loan-types",
    category: "General & Loans",
    question: "What kind of loans do you offer?",
    prompt: "What kind of loans do you offer?",
    previewAnswer: "CUB offers Mortgages (up to 30 yrs), Vehicle Loans, Land Purchase Loans, Consumer Personal Loans, and Commercial Business Loans."
  },
  {
    id: "deposit-required",
    category: "General & Loans",
    question: "Is a deposit required for loans?",
    prompt: "Is a deposit required for loans?",
    previewAnswer: "Equity or down payment deposit requirements depend on the specific loan facility and credit qualification."
  },
  {
    id: "repayment-term",
    category: "General & Loans",
    question: "How long is the repayment term?",
    prompt: "How long is the repayment term for CUB loans?",
    previewAnswer: "Mortgages offer terms up to 30 years, Vehicle loans typically range from 3 to 7 years, and Consumer loans are customized."
  },
  {
    id: "card-payment",
    category: "Credit Cards",
    question: "How can I make a payment to my card account?",
    prompt: "How can I make a payment to my card account?",
    previewAnswer: "You can pay via CUB Internet Banking, Mobile App transfers, standing orders, over-the-counter branch payments, or wire transfers."
  },
  {
    id: "authorized-user",
    category: "Credit Cards",
    question: "How do I add an Authorized User to my credit card account?",
    prompt: "How do I add an Authorized User to my credit card account?",
    previewAnswer: "Visit any CUB branch or contact Card Services with a completed Credit Card Amendment form and a valid photo ID."
  },
  {
    id: "compromised-card",
    category: "Credit Cards",
    question: "What do I do when I suspect my account information has been compromised or my card is lost or stolen?",
    prompt: "What do I do when I suspect my account information has been compromised or my card is lost or stolen?",
    previewAnswer: "Immediately call CUB Card Services at (268) 481-8250 or email cardservices@cub.ag to freeze your card."
  },
  {
    id: "travel-notice",
    category: "Credit Cards",
    question: "Why do I need to notify the Bank when I am traveling?",
    prompt: "Why do I need to notify the Bank when I am traveling?",
    previewAnswer: "Notifying CUB prevents automated security filters from placing temporary fraud blocks on your card during overseas transactions."
  }
];

export const CUB_FAQ_URL = "https://caribbeanunionbank.com/faqs/";

