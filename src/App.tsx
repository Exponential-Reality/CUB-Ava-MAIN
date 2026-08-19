import React, { useState, useEffect } from "react";
import { ThemeName, ChatMessage, ChatSession, BackgroundAnimMode } from "./types";
import { THEMES } from "./data/bankData";
import { Sidebar } from "./components/Sidebar";
import { Header } from "./components/Header";
import { ChatWindow } from "./components/ChatWindow";
import { ChatInput } from "./components/ChatInput";
import { InterestCalculator } from "./components/InterestCalculator";
import { BackgroundAnimation } from "./components/BackgroundAnimation";
import { SqliteInspectorModal } from "./components/SqliteInspectorModal";
import { stopSpeech } from "./utils/speech";

const STORAGE_KEY_SESSIONS = "cub_chat_sessions_v2";
const STORAGE_KEY_ACTIVE_ID = "cub_active_session_id_v2";
const STORAGE_KEY_THEME = "cub_theme_v2";
const STORAGE_KEY_ANIM_MODE = "cub_anim_mode_v2";

const createDefaultSession = (): ChatSession => {
  const id = "session-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6);
  return {
    id,
    title: "New Conversation",
    createdAt: Date.now(),
    updatedAt: Date.now(),
    messages: [
      {
        id: "msg-welcome-" + Date.now(),
        role: "assistant",
        content:
          "Hello! Welcome to Caribbean Union Bank. I'm CUB AI, your virtual banking representative. How can I assist you today? Feel free to ask about our personal savings accounts, mortgages, credit cards, or branch locations!",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ],
  };
};

const generateTitleFromQuery = (query: string): string => {
  const clean = query.trim().replace(/^[^\w]+/, "");
  if (!clean) return "New Conversation";

  const qLower = clean.toLowerCase();
  if (qLower.includes("loan") || qLower.includes("mortgage") || qLower.includes("borrow"))
    return "Loan & Mortgage Inquiry";
  if (qLower.includes("rate") || qLower.includes("interest") || qLower.includes("apy"))
    return "Interest Rates & APY";
  if (qLower.includes("branch") || qLower.includes("location") || qLower.includes("hour"))
    return "Branch Locations & Hours";
  if (qLower.includes("account") || qLower.includes("saving") || qLower.includes("checking"))
    return "Account Opening Info";
  if (qLower.includes("card") || qLower.includes("stolen") || qLower.includes("lost"))
    return "Card & Security Support";
  if (qLower.includes("transfer") || qLower.includes("wire") || qLower.includes("online"))
    return "Digital Transfers & App";

  let snippet = clean.slice(0, 26);
  if (clean.length > 26) snippet += "...";
  return snippet.charAt(0).toUpperCase() + snippet.slice(1);
};

const buildPastChatsSummary = (allSessions: ChatSession[], activeId: string): string => {
  const pastSessions = allSessions.filter((s) => s.id !== activeId && s.messages.length > 1);
  if (pastSessions.length === 0) {
    return "";
  }

  return pastSessions
    .slice(0, 6)
    .map((s) => {
      const dateStr = new Date(s.updatedAt).toLocaleDateString([], {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
      const userQuestions = s.messages
        .filter((m) => m.role === "user")
        .map((m) => `"${m.content.replace(/\n/g, " ").slice(0, 100)}"`)
        .join("; ");

      return `• Session "${s.title}" (${dateStr}): Questions asked by user: [${userQuestions || "General Inquiry"}]`;
    })
    .join("\n");
};

export const App: React.FC = () => {
  // Persisted Theme State
  const [theme, setTheme] = useState<ThemeName>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_THEME);
      if (saved && THEMES[saved as ThemeName]) return saved as ThemeName;
    } catch (e) {}
    return "Amber Gold";
  });

  // Persisted Animation Mode State
  const [animMode, setAnimMode] = useState<BackgroundAnimMode>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ANIM_MODE);
      if (saved) return saved as BackgroundAnimMode;
    } catch (e) {}
    return "aurora";
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isOpenMobile, setIsOpenMobile] = useState<boolean>(false);
  const [isCalcOpen, setIsCalcOpen] = useState<boolean>(false);
  const [isSqliteModalOpen, setIsSqliteModalOpen] = useState<boolean>(false);
  const [draftInputPrompt, setDraftInputPrompt] = useState<string>("");

  // Initialize Chat Sessions from LocalStorage or Default
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SESSIONS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          parsed.forEach((s: ChatSession) => {
            s.messages.forEach((m) => {
              m.animated = true;
            });
          });
          return parsed;
        }
      }
    } catch (e) {
      console.error("Failed to load chat sessions from localStorage:", e);
    }
    return [createDefaultSession()];
  });

  const [activeSessionId, setActiveSessionId] = useState<string>(() => {
    try {
      const savedId = localStorage.getItem(STORAGE_KEY_ACTIVE_ID);
      if (savedId && sessions.some((s) => s.id === savedId)) return savedId;
    } catch (e) {}
    return sessions[0]?.id || "";
  });

  // Save Theme to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_THEME, theme);
    } catch (e) {}
  }, [theme]);

  // Save Animation Mode to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ANIM_MODE, animMode);
    } catch (e) {}
  }, [animMode]);

  // Save sessions to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(sessions));
    } catch (e) {
      console.error("Failed to save sessions to localStorage:", e);
    }
  }, [sessions]);

  // Save active session ID
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ACTIVE_ID, activeSessionId);
    } catch (e) {}
  }, [activeSessionId]);

  // Derive current session messages
  const currentSession = sessions.find((s) => s.id === activeSessionId) || sessions[0];
  const messages = currentSession ? currentSession.messages : [];

  const handleNewChat = () => {
    stopSpeech();
    const newSess = createDefaultSession();
    setSessions((prev) => [newSess, ...prev]);
    setActiveSessionId(newSess.id);
  };

  const handleSelectSession = (sessionId: string) => {
    stopSpeech();
    setActiveSessionId(sessionId);
  };

  const handleDeleteSession = (sessionId: string) => {
    stopSpeech();
    setSessions((prev) => {
      const remaining = prev.filter((s) => s.id !== sessionId);
      if (remaining.length === 0) {
        const fresh = createDefaultSession();
        setActiveSessionId(fresh.id);
        return [fresh];
      }
      if (activeSessionId === sessionId) {
        setActiveSessionId(remaining[0].id);
      }
      return remaining;
    });
  };

  // Apply theme CSS variables to root element
  useEffect(() => {
    const t = THEMES[theme];
    if (t) {
      document.documentElement.style.setProperty("--t-primary", t.primary);
      document.documentElement.style.setProperty("--t-secondary", t.secondary);
      document.documentElement.style.setProperty("--t-glow", t.glow);
      document.documentElement.style.setProperty("--t-bg-tint", t.tint);
    }
  }, [theme]);

  const getClientCubFallback = (query: string): string => {
    const qLower = query.toLowerCase().trim();

    if (
      qLower.includes("account") ||
      qLower.includes("saving") ||
      qLower.includes("checking") ||
      qLower.includes("chequing") ||
      qLower.includes("cd") ||
      qLower.includes("deposit") ||
      qLower.includes("type")
    ) {
      return "Caribbean Union Bank offers a variety of account options tailored to your personal and business financial goals:\n\n### Personal Savings Accounts\n• **Priority Savings**: 2.00% APY ($100 minimum opening deposit) — flexible access & ATM debit card.\n• **Prestige Savings**: Minimum 2.50% APY ($1,000 minimum opening deposit) with tiered rates.\n• **Dollar A Day Savings**: Minimum 2.25% APY ($100 minimum opening deposit) to build disciplined savings habits.\n• **Premium Savers**: Minimum 2.75% APY ($5,000 minimum opening deposit) for maximum interest yield.\n• **Junior Savers Account**: Special youth savings account for ages up to 18.\n\n### Current / Chequing Accounts\n• **Current Account**: Personal checking with chequebook, international CUB Visa Debit Card & 24/7 Internet Banking.\n\n### Fixed Deposits & Business\n• **Certificates of Deposit (CDs)**: Guaranteed term deposits (3-month to multi-year) offering higher yields.\n• **Corporate & Business Accounts**: Daily operations, payroll direct deposit, and merchant POS solutions.\n\n💡 *To open an account, bring 2 valid photo IDs, proof of address (<3 months old), proof of income, and your Tax Identification Number (TIN).* How can I assist you further?";
    }

    if (
      qLower.includes("loan") ||
      qLower.includes("mortgage") ||
      qLower.includes("borrow") ||
      qLower.includes("vehicle") ||
      qLower.includes("car") ||
      qLower.includes("land")
    ) {
      return "Caribbean Union Bank offers flexible financing options to fit your needs:\n\n• **Mortgages**: Residential purchases, construction, and remodeling.\n• **Vehicle Loans**: Competitive financing for new and pre-owned automobiles.\n• **Land Purchase Loans**: Financing for residential or commercial land plots.\n• **Personal / Consumer Loans**: Financing for education, travel, medical expenses, debt consolidation, home repairs, and more.\n\n• **Prime Lending Rate**: CUB's current Prime Lending Rate is 10.00%. The interest rate offered to each customer may be higher or lower depending on credit history and the results of CUB's credit assessment.\n\nFor personalized loan advice or to begin an application, contact CUB Credit Services at (268) 481-8285 or email creditservices@cub.ag.\n\n💡 *Tip: You can also use our interactive CUB Interest & Loan Calculator in the app to estimate monthly payments!*";
    }

    if (qLower.includes("hour") || qLower.includes("location") || qLower.includes("branch") || qLower.includes("address") || qLower.includes("where")) {
      return "Caribbean Union Bank Branch Locations & Operating Hours:\n\n• **Friars Hill Road Headquarters**: Mon–Thu 8:00am–2:00pm | Fri 8:00am–3:00pm (Tel: 268-481-8278)\n• **Factory Road Branch**: Mon–Thu 8:00am–2:00pm | Fri 8:00am–3:00pm (Tel: 268-481-8285)\n• **Jolly Harbour Branch**: Mon–Fri 9:00am–1:00pm (Tel: 268-481-8265)\n\nAll locations feature 24/7 ATMs. Reach Customer Service at (268) 481-8278 or customer.service@cub.ag!";
    }

    return "Hello! Welcome to Caribbean Union Bank. I'm CUB AI, your virtual banking representative. How can I assist you today? Feel free to ask about our personal savings accounts, mortgages, credit cards, or branch locations!";
  };

  const handleSendMessage = async (text: string) => {
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const targetSessionId = activeSessionId;
    const targetSession = sessions.find((s) => s.id === targetSessionId) || currentSession;

    // Check if session title should be auto-updated
    let updatedTitle = targetSession.title;
    if (targetSession.title === "New Conversation" || targetSession.title === "New CUB Conversation") {
      updatedTitle = generateTitleFromQuery(text);
    }

    const updatedMessages = [...targetSession.messages, userMsg];

    // Update state with user's message
    setSessions((prev) =>
      prev.map((s) =>
        s.id === targetSessionId
          ? { ...s, title: updatedTitle, updatedAt: Date.now(), messages: updatedMessages }
          : s
      )
    );

    setIsLoading(true);

    // Generate memory context from previous sessions
    const pastChatsSummary = buildPastChatsSummary(sessions, targetSessionId);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({ role: m.role, content: m.content })),
          pastChatsSummary: pastChatsSummary,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to reach Caribbean Union Bank AI Server.");
      }

      const data = await response.json();
      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.reply || "Thank you for contacting Caribbean Union Bank.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        routedModel: data.routedModel,
        routingReason: data.routingReason,
      };

      setSessions((prev) =>
        prev.map((s) =>
          s.id === targetSessionId
            ? { ...s, updatedAt: Date.now(), messages: [...s.messages, assistantMsg] }
            : s
        )
      );
    } catch (error: any) {
      console.error("Chat error:", error);
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: getClientCubFallback(text),
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        routedModel: "LOCAL_KNOWLEDGE_ENGINE",
        routingReason: "Instant fallback engine",
      };
      setSessions((prev) =>
        prev.map((s) =>
          s.id === targetSessionId
            ? { ...s, updatedAt: Date.now(), messages: [...s.messages, errorMsg] }
            : s
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleMessageAnimated = (messageId: string) => {
    setSessions((prev) =>
      prev.map((s) =>
        s.id === activeSessionId
          ? {
              ...s,
              messages: s.messages.map((m) => (m.id === messageId ? { ...m, animated: true } : m)),
            }
          : s
      )
    );
  };

  return (
    <div className="min-h-screen text-white relative antialiased selection:bg-[var(--t-primary)] selection:text-black">
      {/* Dynamic Background Animation (Canvas) */}
      <BackgroundAnimation mode={animMode} themeName={theme} />

      {/* Static Background Gradients Fallback */}
      <div className="app-bg" />
      <div className="app-glow" />
      <div className="top-brand-bar" />

      {/* Fixed Sidebar */}
      <Sidebar
        currentTheme={theme}
        onSelectTheme={setTheme}
        animMode={animMode}
        onChangeAnimMode={setAnimMode}
        onSelectNavPrompt={handleSendMessage}
        onNewChat={handleNewChat}
        onOpenCalculator={() => setIsCalcOpen(true)}
        onOpenSqliteModal={() => setIsSqliteModalOpen(true)}
        isOpenMobile={isOpenMobile}
        onCloseMobile={() => setIsOpenMobile(false)}
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={handleSelectSession}
        onDeleteSession={handleDeleteSession}
      />

      {/* Main Content Area (Default 4K Ultra HD Layout) */}
      <main className="lg:pl-[300px] 3xl:pl-[360px] transition-all duration-300">
        <div className="mx-auto px-4 py-6 sm:px-6 3xl:px-12 3xl:py-10 max-w-[1920px] 2xl:max-w-[2200px] transition-all duration-300 space-y-4">
          <Header
            onOpenMobile={() => setIsOpenMobile(true)}
            onOpenSqliteModal={() => setIsSqliteModalOpen(true)}
          />

          <ChatWindow
            messages={messages}
            isLoading={isLoading}
            onOpenCalculator={() => setIsCalcOpen(true)}
            onSendMessage={handleSendMessage}
            onSelectPromptDraft={(prompt) => setDraftInputPrompt(prompt)}
            onMessageAnimated={handleMessageAnimated}
          />

          <ChatInput
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            lastAssistantMessage={
              [...messages].reverse().find((m) => m.role === "assistant")?.content
            }
            draftInputPrompt={draftInputPrompt}
            onClearDraftPrompt={() => setDraftInputPrompt("")}
          />
        </div>
      </main>

      {/* CUB Calculator Modal */}
      {isCalcOpen && (
        <InterestCalculator
          isModal={true}
          onClose={() => setIsCalcOpen(false)}
          onAskAi={handleSendMessage}
        />
      )}

      {/* SQLite Database & OpenAPI Inspector Modal */}
      <SqliteInspectorModal
        isOpen={isSqliteModalOpen}
        onClose={() => setIsSqliteModalOpen(false)}
      />
    </div>
  );
};

export default App;
