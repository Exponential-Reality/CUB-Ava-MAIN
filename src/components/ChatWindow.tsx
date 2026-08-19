import React, { useRef, useEffect, useState } from "react";
import { ChatMessage } from "../types";
import { LogoSvg } from "./LogoSvg";
import { User, Volume2, VolumeX, Copy, Check, ShieldCheck, ArrowDown } from "lucide-react";
import { speakText, stopSpeech } from "../utils/speech";
import { copyToClipboard } from "../utils/clipboard";
import { FormattedMessage } from "./FormattedMessage";

interface ChatWindowProps {
  messages: ChatMessage[];
  isLoading: boolean;
  onOpenCalculator?: () => void;
  onSendMessage?: (prompt: string) => void;
  onSelectPromptDraft?: (prompt: string) => void;
  onMessageAnimated?: (id: string) => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  messages,
  isLoading,
  onOpenCalculator,
  onSendMessage,
  onSelectPromptDraft,
  onMessageAnimated,
}) => {
  const bottomRef = useRef<HTMLDivElement>(null);
  const lastScrollTime = useRef<number>(0);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [userIsAtBottom, setUserIsAtBottom] = useState(true);

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

    // During streaming/typing, throttle scroll calls to once every 250ms and use instant scroll
    // ONLY if the user is currently at the bottom
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
    // Force smooth scroll if user just sent a message
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
    speakText(text, {
      onStart: () => setSpeakingId(id),
      onEnd: () => setSpeakingId(null),
      onError: () => setSpeakingId(null),
    });
  };

  // Find index of the last assistant message so only the newest message animates
  const lastAssistantIndex = messages.reduce((acc, msg, idx) => (msg.role === "assistant" ? idx : acc), -1);

  return (
    <div className="chat-window flex flex-col space-y-4 relative min-h-[50vh]">
      {/* Greeting Bubble if no messages or starting new chat */}
      {messages.length === 0 && (
        <div className="flex flex-col space-y-3">
          <div className="greeting-bubble self-start flex items-center gap-2">
            <span>👋 Hello! I'm CUB AI assistant for Caribbean Union Bank. How can I assist you today?</span>
            <button
              onClick={() =>
                handleSpeakMessage("greeting", "Hello! I'm CUB AI assistant for Caribbean Union Bank. How can I assist you today?")
              }
              title="Listen to message"
              className="p-1 rounded-full hover:bg-white/10 text-[var(--t-primary)] transition-all shrink-0"
            >
              {speakingId === "greeting" ? (
                <VolumeX className="w-3.5 h-3.5" />
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

            {/* Bubble Content */}
            <div
              className={`px-4.5 py-3.5 text-sm leading-relaxed relative group transition-all ${
                isUser
                  ? "bg-gradient-to-br from-[var(--t-primary)] to-[var(--t-secondary)] text-[#0a0806] font-semibold rounded-[20px_6px_20px_20px] shadow-[0_8px_24px_var(--t-glow)] border border-white/20"
                  : "bg-[#120e0b]/90 border border-[var(--line)] text-white rounded-[6px_20px_20px_20px] shadow-lg backdrop-blur-md"
              }`}
            >
              {isUser ? (
                <div className="whitespace-pre-wrap">{msg.content}</div>
              ) : (
                <FormattedMessage
                  text={msg.content}
                  animate={isLatestAssistant && !msg.animated}
                  speed={10}
                  onScroll={() => scrollToBottom(false)}
                  onOpenCalculator={onOpenCalculator}
                  onSendMessage={onSendMessage}
                  onAnimated={() => onMessageAnimated?.(msg.id)}
                />
              )}

              {/* TTS & Copy Actions for assistant messages */}
              {!isUser && (
                <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between gap-2 text-[11px]">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-[var(--t-primary)] opacity-90">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>CUB AI Assistant</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={async () => {
                        const success = await copyToClipboard(msg.content);
                        if (success) {
                          setCopiedId(msg.id);
                          setTimeout(() => setCopiedId(null), 2000);
                        }
                      }}
                      title="Copy response to clipboard"
                      className="flex items-center gap-1 font-semibold text-[var(--text-soft)] hover:text-white transition-colors cursor-pointer"
                    >
                      {copiedId === msg.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handleSpeakMessage(msg.id, msg.content)}
                      title="Read message aloud"
                      className="flex items-center gap-1 font-semibold text-[var(--t-primary)] opacity-90 hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      {speakingId === msg.id ? (
                        <>
                          <VolumeX className="w-3.5 h-3.5 animate-pulse" />
                          <span>Stop</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3.5 h-3.5" />
                          <span>Listen</span>
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

      {/* Typing Indicator Animation for Assistant Messages */}
      {isLoading && (
        <div className="flex items-start gap-3 max-w-[85%] sm:max-w-[78%] mr-auto bubble-anim">
          <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-gradient-to-br from-[var(--t-primary)] to-[var(--t-secondary)] text-[#0a0806] shadow-md">
            <div className="w-5 h-5 rounded-full overflow-hidden p-0.5">
              <LogoSvg />
            </div>
          </div>

          <div className="px-4 py-3 bg-[#120e0b]/90 border border-[var(--line)] text-white rounded-[6px_20px_20px_20px] shadow-md flex items-center gap-3 backdrop-blur-md">
            <span className="text-xs font-semibold text-[var(--t-primary)] flex items-center gap-1.5">
              <span>CUB AI is thinking</span>
            </span>
            <div className="flex items-center gap-1.5 py-0.5">
              <span className="w-2 h-2 rounded-full bg-[var(--t-primary)] animate-bounce" style={{ animationDelay: "0ms" }}></span>
              <span className="w-2 h-2 rounded-full bg-[var(--t-primary)] animate-bounce" style={{ animationDelay: "150ms" }}></span>
              <span className="w-2 h-2 rounded-full bg-[var(--t-primary)] animate-bounce" style={{ animationDelay: "300ms" }}></span>
            </div>
          </div>
        </div>
      )}

      {/* Floating Jump-to-Bottom Button when user scrolls up */}
      {!userIsAtBottom && (
        <button
          onClick={() => scrollToBottom(true)}
          className="fixed bottom-28 right-6 sm:right-12 z-40 flex items-center gap-2 px-4 py-2.5 rounded-full bg-gradient-to-r from-[var(--t-primary)] to-[var(--t-secondary)] text-[#0a0806] font-extrabold text-xs shadow-2xl shadow-[var(--t-glow)] border border-white/30 hover:scale-105 active:scale-95 transition-all cursor-pointer animate-bounce"
          title="Jump to latest messages"
        >
          <ArrowDown className="w-4 h-4 stroke-[3]" />
          <span>Jump to latest</span>
        </button>
      )}

      <div ref={bottomRef} />
    </div>
  );
};
