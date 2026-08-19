import React, { useState, useEffect, useRef } from "react";

interface TypewriterTextProps {
  text: string;
  speed?: number; // ms per character/word step
  animate?: boolean;
  onScroll?: () => void;
}

export const TypewriterText: React.FC<TypewriterTextProps> = ({
  text,
  speed = 14,
  animate = true,
  onScroll,
}) => {
  const [displayedLength, setDisplayedLength] = useState(animate ? 0 : text.length);
  const [isTyping, setIsTyping] = useState(animate && text.length > 0);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (!animate) {
      setDisplayedLength(text.length);
      setIsTyping(false);
      return;
    }

    // Reset typing animation when text changes or is new
    setDisplayedLength(0);
    setIsTyping(true);

    let currentLen = 0;
    const totalLen = text.length;

    const step = () => {
      if (currentLen < totalLen) {
        // Step forward by 1-3 chars depending on speed to ensure smooth word flow
        const increment = Math.min(2, totalLen - currentLen);
        currentLen += increment;
        setDisplayedLength(currentLen);
        if (onScroll) onScroll();
        timerRef.current = setTimeout(step, speed);
      } else {
        setIsTyping(false);
      }
    };

    timerRef.current = setTimeout(step, speed);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [text, animate, speed]);

  const visibleText = text.slice(0, displayedLength);

  return (
    <div className="whitespace-pre-wrap inline">
      {visibleText}
      {isTyping && (
        <span className="inline-block w-1.5 h-4 ml-0.5 bg-[var(--t-primary)] animate-pulse align-middle rounded-sm" />
      )}
    </div>
  );
};
