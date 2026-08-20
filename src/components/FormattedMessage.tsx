import React, { useState, useEffect, useRef } from "react";
import Markdown from "react-markdown";
import { Sparkles, Globe, Phone, Mail, Calculator, ExternalLink } from "lucide-react";

interface FormattedMessageProps {
  text: string;
  animate?: boolean;
  speed?: number;
  onScroll?: () => void;
  onOpenCalculator?: () => void;
  onSendMessage?: (prompt: string) => void;
  onAnimated?: () => void;
}

const preprocessText = (input: string): string => {
  if (!input) return "";
  let text = input;

  // Auto-link phone numbers like (268) 481-8278 or 268-481-8278 not already in markdown links
  text = text.replace(/(?<!\]\()(?:tel:)?(\(?268\)?[\s.-]?\d{3}[\s.-]?\d{4})/g, (match, p1) => {
    const cleanNum = p1.replace(/\D/g, "");
    return `[${match}](tel:${cleanNum})`;
  });

  // Auto-link email addresses not already in markdown links
  text = text.replace(/(?<!\]\()([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g, (match) => {
    return `[${match}](mailto:${match})`;
  });

  // Auto-link URLs not already in markdown links
  text = text.replace(/(?<!\]\()(https?:\/\/[^\s)]+|caribbeanunionbank\.com[^\s)]*)/g, (match) => {
    if (match.startsWith("[")) return match;
    const url = match.startsWith("http") ? match : `https://${match}`;
    return `[${match}](${url})`;
  });

  return text;
};

export const FormattedMessage: React.FC<FormattedMessageProps> = ({
  text,
  animate = false,
  speed = 10,
  onScroll,
  onOpenCalculator,
  onAnimated,
}) => {
  const processedFull = React.useMemo(() => preprocessText(text || ""), [text]);
  const [displayedLength, setDisplayedLength] = useState(animate ? 0 : processedFull.length);
  const [isTyping, setIsTyping] = useState(animate && processedFull.length > 0);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (!animate) {
      setDisplayedLength(processedFull.length);
      setIsTyping(false);
      onAnimated?.();
      return;
    }

    setDisplayedLength(0);
    setIsTyping(true);

    let currentLen = 0;
    const totalLen = processedFull.length;

    const step = () => {
      if (currentLen < totalLen) {
        const increment = Math.min(4, totalLen - currentLen);
        currentLen += increment;
        setDisplayedLength(currentLen);
        if (onScroll) onScroll();
        timerRef.current = setTimeout(step, speed);
      } else {
        setIsTyping(false);
        onAnimated?.();
      }
    };

    timerRef.current = setTimeout(step, speed);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [processedFull, animate, speed]);

  if (!text) return null;

  const visibleMarkdown = processedFull.slice(0, displayedLength);

  return (
    <div className="formatted-message space-y-2">
      <div className="markdown-body text-xs sm:text-sm leading-relaxed text-gray-100 font-normal">
        <Markdown
          components={{
            h1({ children }) {
              return (
                <div className="font-extrabold text-sm sm:text-base text-[var(--t-primary)] mt-3 mb-1.5 flex items-center gap-2 border-b border-white/10 pb-1">
                  <Sparkles className="w-4 h-4 text-[var(--t-primary)] shrink-0" />
                  <span>{children}</span>
                </div>
              );
            },
            h2({ children }) {
              return (
                <div className="font-bold text-xs sm:text-sm text-[var(--t-primary)] mt-2.5 mb-1 flex items-center gap-1.5 border-b border-white/10 pb-0.5">
                  <span className="w-2 h-2 rounded-full bg-[var(--t-primary)] shrink-0" />
                  <span>{children}</span>
                </div>
              );
            },
            h3({ children }) {
              return (
                <div className="font-bold text-xs sm:text-sm text-[var(--t-primary)] mt-2 mb-1 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--t-primary)] shrink-0" />
                  <span>{children}</span>
                </div>
              );
            },
            a({ href, children }) {
              const linkText = String(children);

              if (href === "#calc") {
                return (
                  <button
                    type="button"
                    onClick={() => onOpenCalculator?.()}
                    className="inline-flex items-center gap-1.5 px-3 py-1 my-0.5 rounded-xl bg-gradient-to-r from-[var(--t-primary)] to-[var(--t-secondary)] text-[#0a0806] font-bold text-xs shadow-md hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                  >
                    <Calculator className="w-3.5 h-3.5" />
                    <span>{linkText || "Open Calculator"}</span>
                  </button>
                );
              }

              if (href?.startsWith("tel:")) {
                return (
                  <a
                    href={href}
                    className="inline-flex items-center gap-1.5 text-[var(--t-primary)] hover:underline font-bold"
                  >
                    <Phone className="w-3.5 h-3.5 inline shrink-0" />
                    <span>{children}</span>
                  </a>
                );
              }

              if (href?.startsWith("mailto:")) {
                return (
                  <a
                    href={href}
                    className="inline-flex items-center gap-1.5 text-[var(--t-primary)] hover:underline font-bold"
                  >
                    <Mail className="w-3.5 h-3.5 inline shrink-0" />
                    <span>{children}</span>
                  </a>
                );
              }

              return (
                <a
                  href={href || "https://caribbeanunionbank.com"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[var(--t-primary)] hover:underline font-bold"
                >
                  <Globe className="w-3.5 h-3.5 inline shrink-0" />
                  <span>{children}</span>
                  <ExternalLink className="w-3 h-3 inline opacity-70" />
                </a>
              );
            },
            ul({ children }) {
              return <ul className="space-y-1 my-1.5 pl-2">{children}</ul>;
            },
            ol({ children }) {
              return <ol className="space-y-1 my-1.5 pl-4 list-decimal list-inside text-gray-200">{children}</ol>;
            },
            li({ children }) {
              return (
                <li className="text-xs sm:text-sm text-gray-200 leading-relaxed list-disc list-inside">
                  <span>{children}</span>
                </li>
              );
            },
            strong({ children }) {
              return (
                <strong className="font-bold text-[var(--t-primary)]">
                  {children}
                </strong>
              );
            },
            p({ children }) {
              return <p className="mb-2 last:mb-0 leading-relaxed text-gray-200">{children}</p>;
            },
            hr() {
              return <hr className="my-2.5 border-white/10" />;
            },
          }}
        >
          {visibleMarkdown}
        </Markdown>
        {isTyping && (
          <span className="inline-block w-1.5 h-4 ml-1 bg-[var(--t-primary)] animate-pulse align-middle rounded-sm" />
        )}
      </div>
    </div>
  );
};
