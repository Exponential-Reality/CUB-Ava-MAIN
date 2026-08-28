import React, { useState, useEffect, useRef } from "react";
import { Send, Volume2, VolumeX, Mic, MicOff, Calculator, Clock, FileText, Landmark, Lock, User } from "lucide-react";
import { speakText, stopSpeech, isSpeaking as checkIsSpeaking, getBCP47LanguageCode } from "../utils/speech";
import { getTranslation } from "../utils/i18n";

interface ChatInputProps {
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  lastAssistantMessage?: string;
  draftInputPrompt?: string;
  onClearDraftPrompt?: () => void;
  onOpenCalculator?: () => void;
  language?: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isLoading,
  lastAssistantMessage,
  draftInputPrompt,
  onClearDraftPrompt,
  onOpenCalculator,
  language = "en",
}) => {
  const [input, setInput] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const t = getTranslation(language);

  useEffect(() => {
    if (draftInputPrompt) {
      setInput(draftInputPrompt);
      if (inputRef.current) {
        inputRef.current.focus();
      }
      if (onClearDraftPrompt) {
        onClearDraftPrompt();
      }
    }
  }, [draftInputPrompt, onClearDraftPrompt]);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsSpeaking(checkIsSpeaking());
    }, 300);
    return () => clearInterval(interval);
  }, []);

  // Cleanup speech recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    if (isListening && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
      setIsListening(false);
    }
    onSendMessage(input.trim());
    setInput("");
  };

  const handleTextToSpeech = () => {
    if (isSpeaking) {
      stopSpeech();
      setIsSpeaking(false);
      return;
    }

    const textToSpeak =
      input.trim() ||
      lastAssistantMessage ||
      t.welcomeMessage;

    speakText(
      textToSpeak,
      {
        onStart: () => setIsSpeaking(true),
        onEnd: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false),
      },
      language
    );
  };

  const handleVoiceInput = () => {
    if (typeof window === "undefined") return;

    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceError("Voice recognition is not supported in this browser.");
      setTimeout(() => setVoiceError(null), 3500);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = getBCP47LanguageCode(language);

      recognition.onstart = () => {
        setIsListening(true);
        setVoiceError(null);
      };

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join("");
        setInput(transcript);
      };

      recognition.onerror = (err: any) => {
        console.warn("Speech recognition error:", err);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error("Speech recognition error:", err);
      setIsListening(false);
    }
  };

  const localizedPills = [
    {
      id: "rates",
      label: t.pillMortgage,
      prompt: t.pillMortgagePrompt,
      icon: <Calculator className="w-3.5 h-3.5 text-[var(--t-primary)] shrink-0" />,
      isCalc: false,
    },
    {
      id: "docs",
      label: t.pillDocuments,
      prompt: t.pillDocumentsPrompt,
      icon: <FileText className="w-3.5 h-3.5 text-[var(--t-primary)] shrink-0" />,
      isCalc: false,
    },
    {
      id: "hours",
      label: t.pillHours,
      prompt: t.pillHoursPrompt,
      icon: <Clock className="w-3.5 h-3.5 text-[var(--t-primary)] shrink-0" />,
      isCalc: false,
    },
    {
      id: "calc",
      label: t.pillCalculator,
      prompt: t.pillCalculatorPrompt,
      icon: <Landmark className="w-3.5 h-3.5 text-[var(--t-primary)] shrink-0" />,
      isCalc: true,
    },
  ];

  return (
    <div className="space-y-3 mt-3 relative">
      {/* Input Form Bar */}
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 p-2 pl-5 rounded-full bg-[#0a0806]/95 border-2 border-[var(--t-glow)] focus-within:border-[var(--t-primary)] shadow-[0_4px_25px_var(--t-glow)] transition-all"
      >
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            isListening
              ? t.listeningNow
              : voiceError || t.inputPlaceholder
          }
          disabled={isLoading}
          className="flex-1 bg-transparent border-none text-white font-medium text-sm focus:outline-none placeholder:text-gray-400 caret-[var(--t-primary)] py-1.5"
        />

        {/* Voice Input Button */}
        <button
          type="button"
          onClick={handleVoiceInput}
          title={isListening ? t.micStopTooltip : t.micTooltip}
          className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer ${
            isListening
              ? "bg-red-500 text-white animate-pulse shadow-lg scale-105"
              : "bg-white/10 hover:bg-white/20 text-white"
          }`}
        >
          {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>

        {/* Text-To-Speech Button */}
        <button
          type="button"
          onClick={handleTextToSpeech}
          title={isSpeaking ? t.stop : t.speakTooltip}
          className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer ${
            isSpeaking
              ? "bg-[var(--t-primary)] text-[#0a0806] font-bold animate-pulse shadow-lg scale-105"
              : "bg-white/10 hover:bg-white/20 text-white"
          }`}
        >
          {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>

        {/* Send Button */}
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          title={t.send}
          className="w-10 h-10 min-w-10 rounded-full bg-gradient-to-br from-[var(--t-primary)] to-[var(--t-secondary)] text-[#0a0806] font-extrabold flex items-center justify-center hover:scale-105 active:scale-95 disabled:opacity-40 disabled:hover:scale-100 transition-all shadow-md cursor-pointer"
        >
          <Send className="w-4 h-4 ml-0.5" />
        </button>
      </form>

      {/* Quick Suggestion Chips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {localizedPills.map((pill) => {
          return (
            <button
              key={pill.id}
              onClick={() => {
                if (pill.isCalc && onOpenCalculator) {
                  onOpenCalculator();
                } else {
                  onSendMessage(pill.prompt);
                }
              }}
              disabled={isLoading}
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-full bg-white/5 border border-[var(--line)] text-xs font-semibold text-[var(--text-soft)] hover:bg-white/10 hover:border-[var(--t-primary)] hover:text-white transition-all text-center hover:-translate-y-0.5 cursor-pointer shadow-sm truncate"
              title={pill.prompt}
            >
              {pill.icon}
              <span className="truncate">{pill.label}</span>
            </button>
          );
        })}
      </div>

      <div className="footer-tagline text-center text-[10px] uppercase tracking-widest text-[var(--t-primary)] font-bold opacity-60">
        {t.tagline}
      </div>
    </div>
  );
};
