export interface ThemeColors {
  primary: string;
  secondary: string;
  glow: string;
  tint: string;
}

export type ThemeName =
  | "Amber Gold"
  | "Ocean Teal"
  | "Royal Purple"
  | "Crimson Red"
  | "Emerald"
  | "Sapphire Blue";

export type BackgroundAnimMode =
  | "aurora"
  | "particles"
  | "wave"
  | "nebula"
  | "matrix"
  | "grid"
  | "none";

export interface BranchLocation {
  address: string;
  phone: string;
  phone_tel: string;
  email: string;
  hours: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
  routedModel?: "GEMINI" | "GROQ" | "LOCAL_KNOWLEDGE_ENGINE";
  routingReason?: string;
  animated?: boolean;
  source?: string;
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: ChatMessage[];
}
