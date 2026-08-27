import React, { useRef, useEffect, useState } from "react";
import { ChatMessage } from "../types";
import { LogoSvg } from "./LogoSvg";
import { User, Volume2, VolumeX, Copy, Check, ShieldCheck, ArrowDown } from "lucide-react";
import { speakText, stopSpeech, isSpeaking as checkIsSpeaking } from "../utils/speech";
import { copyToClipboard } from "../utils/clipboard";
import { FormattedMessage } from "./FormattedMessage";
import { getTranslation } from "../utils/i18n";

interface ChatWindowProps {
  messages: ChatMessage[];
  isLoading: boolean;
  onOpenCalculator?: () => void;
  onSendMessage?: (prompt: string) => void;
  onSelectPromptDraft?: (prompt: string) => void;
  onMessageAnimated?: (id: string) => void;
  language?: string;
  voiceId?: string;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  messages,
  isLoading,
  onOpenCalculator,
  onSendMessage,
  onSelectPromptDraft,
  onMessageAnimated,
  language = "en",
  voiceId,
}) => {
  const bottomRef = useRef<HTMLDivElement>(null);
  const lastScrollTime = useRef<number>(0);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [userIsAtBottom, setUserIsAtBottom] = useState(true);
  const t = getTranslation(language);

  // Monitor if speech stopped externally
  useEffect(() => {
    const interval = setInterval(() => {
      if (speakingId && !checkIsSpeaking()) {
        setSpeakingId(null);
      }
    }, 400);
    return () => clearInterval(interval);
  }, [speakingId]);

  // Monitor scroll position to detect if user has manually scrolled up
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollPosition = window.innerHeight + window.scrollY;
          const threshold = document.documentElement.scrollHeight - 220;
          setUserIsAtBottom(scrollPosition >= threshold);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToBottom = (force = false) => {
    if (force) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      setUserIsAtBottom(true);
      return;
    }

    const now = Date.now();
    if (now - lastScrollTime.current > 250) {
      lastScrollTime.current = now;
      if (userIsAtBottom) {
        window.scrollTo({
          top: document.documentElement.scrollHeight,
          behavior: "instant" as ScrollBehavior,
        });
      }
    }
  };

  // Scroll when message list or loading state changes
  useEffect(() => {
    const lastMsg = messages[messages.length - 1];
    if (lastMsg?.role === "user") {
      scrollToBottom(true);
    } else if (lastMsg?.role === "assistant") {
      scrollToBottom(false);
    }
  }, [messages, isLoading]);

  const handleSpeakMessage = (id: string, text: string) => {
    if (speakingId === id) {
      stopSpeech();
      setSpeakingId(null);
      return;
    }

    setSpeakingId(id);
    speakText(
      text,
      {
        onStart: () => setSpeakingId(id),
        onEnd: () => setSpeakingId(null),
        onError: () => setSpeakingId(null),
      },
      language,
      voiceId
    );
  };

  // Find index of the last assistant message
  const lastAssistantIndex = messages.reduce((acc, msg, idx) => (msg.role === "assistant" ? idx : acc), -1);

  return (
    <div className="chat-window flex flex-col space-y-4 relative min-h-[50vh]">
      {/* Greeting Bubble if no messages */}
      {messages.length === 0 && (
        <div className="flex flex-col space-y-3">
          <div className="greeting-bubble self-start flex items-center gap-2">
            <span>👋 {t.welcomeMessage}</span>
            <button
              onClick={() => handleSpeakMessage("greeting", t.welcomeMessage)}
              title={t.listen}
              className="p-1 rounded-full hover:bg-white/10 text-[var(--t-primary)] transition-all shrink-0 cursor-pointer"
            >
              {speakingId === "greeting" ? (
                <VolumeX className="w-3.5 h-3.5 animate-pulse" />
              ) : (
                <Volume2 className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>
      )}

      {/* Message List */}
      {messages.map((msg, index) => {
        const isUser = msg.role === "user";
        const isLatestAssistant = !isUser && index === lastAssistantIndex;

        // If this is the initial welcome message, ensure it displays the translated welcome text
        const isWelcomeMessage =
          !isUser &&
          (msg.id.startsWith("msg-welcome-") || (index === 0 && messages.length === 1));
        const displayContent = isWelcomeMessage ? t.welcomeMessage : msg.content;

        return (
          <div
            key={msg.id}
            className={`flex items-start gap-3 max-w-[88%] sm:max-w-[80%] bubble-anim ${
              isUser ? "ml-auto flex-row-reverse" : "mr-auto"
            }`}
          >
            {/* Avatar Icon */}
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-md ${
                isUser
                  ? "bg-[var(--t-primary)] text-[#0a0806]"
                  : "bg-gradient-to-br from-[var(--t-primary)] to-[var(--t-secondary)] text-[#0a0806]"
              }`}
            >
              {isUser ? (
                <User className="w-4 h-4 font-bold" />
              ) : (
                <div className="w-5 h-5 rounded-full overflow-hidden p-0.5">
                  <LogoSvg />
                </div>
              )}
            </div>

            {/* Bubble Content Area */}
            <div className="flex flex-col space-y-1.5 w-full min-w-0">
              {/* Header Label: You vs CUB AI Assistant */}
              <div
                className={`flex items-center gap-2 text-[11px] font-semibold text-[var(--text-soft)] px-1 ${
                  isUser ? "justify-end" : "justify-start"
                }`}
              >
                {!isUser && (
                  <span className="text-[var(--t-primary)] flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    <span>{t.assistantBadge}</span>
                  </span>
                )}
                {isUser && <span>You</span>}
                <span className="text-[10px] text-gray-400">• {msg.timestamp}</span>
              </div>

              {/* Message Box */}
              <div
                className={`px-4 py-3 sm:px-5 sm:py-3.5 rounded-2xl shadow-md text-sm leading-relaxed ${
                  isUser
                    ? "bg-gradient-to-r from-[var(--t-primary)] to-[var(--t-secondary)] text-[#0a0806] font-medium rounded-tr-sm"
                    : "bg-[#14100c]/90 border border-[var(--line)] text-gray-100 rounded-tl-sm backdrop-blur-md"
                }`}
              >
                {isUser ? (
                  <div className="whitespace-pre-wrap break-words">{msg.content}</div>
                ) : (
                  <FormattedMessage
                    text={displayContent}
                    animate={isLatestAssistant && !msg.animated}
                    onAnimated={() => {
                      if (onMessageAnimated) {
                        onMessageAnimated(msg.id);
                      }
                    }}
                    onOpenCalculator={onOpenCalculator}
                    onSendMessage={onSendMessage}
                  />
                )}
              </div>

              {/* Action Buttons for Assistant Message: Listen, Copy */}
              {!isUser && (
                <div className="flex items-center justify-between gap-2 px-1 text-xs">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={async () => {
                        const ok = await copyToClipboard(displayContent);
                        if (ok) {
                          setCopiedId(msg.id);
                          setTimeout(() => setCopiedId(null), 2000);
                        }
                      }}
                      title="Copy response"
                      className="flex items-center gap-1 font-semibold text-[var(--text-soft)] hover:text-white transition-colors cursor-pointer"
                    >
                      {copiedId === msg.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">{t.copied}</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>{t.copy}</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handleSpeakMessage(msg.id, displayContent)}
                      title="Read aloud"
                      className="flex items-center gap-1 font-semibold text-[var(--t-primary)] opacity-90 hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      {speakingId === msg.id ? (
                        <>
                          <VolumeX className="w-3.5 h-3.5 animate-pulse" />
                          <span>{t.stop}</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3.5 h-3.5" />
                          <span>{t.listen}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* Typing Indicator Animation */}
      {isLoading && (
        <div className="flex items-start gap-3 max-w-[85%] sm:max-w-[78%] mr-auto bubble-anim">
          <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-gradient-to-br from-[var(--t-primary)] to-[var(--t-secondary)] text-[#0a0806] shadow-md">
            <div className="w-5 h-5 rounded-full overflow-hidden p-0.5">
              <LogoSvg />
            </div>
          </div>

          <div className="px-4 py-3 bg-[#120e0b]/90 border border-[var(--line)] text-white rounded-[6px_20px_20px_20px] shadow-md flex items-center gap-3 backdrop-blur-md">
            <span className="text-xs font-semibold text-[var(--t-primary)] flex items-center gap-1.5">
              <span>{t.thinking}</span>
            </span>
            <div className="flex items-center gap-1.5 py-0.5">
              <span className="w-2 h-2 rounded-full bg-[var(--t-primary)] animate-bounce" style={{ animationDelay: "0ms" }}></span>
              <span className="w-2 h-2 rounded-full bg-[var(--t-primary)] animate-bounce" style={{ animationDelay: "150ms" }}></span>
              <span className="w-2 h-2 rounded-full bg-[var(--t-primary)] animate-bounce" style={{ animationDelay: "300ms" }}></span>
            </div>
          </div>
        </div>
      )}

      {/* Floating Jump-to-Bottom Button */}
      {!userIsAtBottom && (
        <button
          onClick={() => scrollToBottom(true)}
          className="fixed bottom-28 right-6 sm:right-12 z-40 flex items-center gap-2 px-4 py-2.5 rounded-full bg-gradient-to-r from-[var(--t-primary)] to-[var(--t-secondary)] text-[#0a0806] font-extrabold text-xs shadow-2xl shadow-[var(--t-glow)] border border-white/30 hover:scale-105 active:scale-95 transition-all cursor-pointer animate-bounce"
          title={t.jumpToLatest}
        >
          <ArrowDown className="w-4 h-4 stroke-[3]" />
          <span>{t.jumpToLatest}</span>
        </button>
      )}

      <div ref={bottomRef} />
    </div>
  );
};
