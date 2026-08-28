import React, { useState } from "react";
import { X, Globe, Mic, Monitor, Palette, User, LogOut, Check, ShieldCheck, KeyRound } from "lucide-react";
import { ThemeName, BackgroundAnimMode } from "../types";
import { THEMES } from "../data/bankData";
import { LANGUAGES_LIST } from "../data/languages";
import { ELEVENLABS_VOICES } from "../utils/speech";

export type SettingsTab = "appearance" | "voice" | "language";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: SettingsTab;
  currentTheme: ThemeName;
  onSelectTheme: (theme: ThemeName) => void;
  animMode: BackgroundAnimMode;
  onChangeAnimMode: (mode: BackgroundAnimMode) => void;
  language: string;
  onSelectLanguage: (code: string) => void;
  voiceId: string;
  onSelectVoice: (id: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  initialTab = "appearance",
  currentTheme,
  onSelectTheme,
  animMode,
  onChangeAnimMode,
  language,
  onSelectLanguage,
  voiceId,
  onSelectVoice,
}) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>(initialTab);

  React.useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-[#120f0a] border border-[var(--line)] rounded-3xl p-6 sm:p-8 shadow-2xl text-white flex flex-col max-h-[85vh]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-white p-2 rounded-full bg-white/5 hover:bg-white/10 transition-all cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Title */}
        <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
          <div className="w-10 h-10 rounded-xl bg-[var(--t-primary)]/15 border border-[var(--t-primary)]/40 flex items-center justify-center text-[var(--t-primary)]">
            <Monitor className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold font-['Sora'] text-white">Application Settings</h2>
            <p className="text-xs text-[var(--text-soft)]">Manage themes, voice personas, and language preferences</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-white/10 pb-3 mb-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab("appearance")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
              activeTab === "appearance"
                ? "bg-[var(--t-primary)] text-[#0a0806] shadow-md"
                : "bg-white/5 text-gray-300 hover:bg-white/10"
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Theme & Animation</span>
          </button>
          <button
            onClick={() => setActiveTab("voice")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
              activeTab === "voice"
                ? "bg-[var(--t-primary)] text-[#0a0806] shadow-md"
                : "bg-white/5 text-gray-300 hover:bg-white/10"
            }`}
          >
            <Mic className="w-3.5 h-3.5" />
            <span>Voice & Accent</span>
          </button>
          <button
            onClick={() => setActiveTab("language")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
              activeTab === "language"
                ? "bg-[var(--t-primary)] text-[#0a0806] shadow-md"
                : "bg-white/5 text-gray-300 hover:bg-white/10"
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Language Support</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="overflow-y-auto space-y-6 pr-1 flex-1">
          {activeTab === "appearance" && (
            <div className="space-y-6 animate-fadeIn">
              {/* Theme Picker */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--t-primary)] mb-3">
                  Color Theme Palette
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {Object.keys(THEMES).map((k) => {
                    const tKey = k as ThemeName;
                    const isSelected = currentTheme === tKey;
                    return (
                      <button
                        key={k}
                        onClick={() => onSelectTheme(tKey)}
                        className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? "bg-[var(--t-primary)]/20 border-[var(--t-primary)] shadow-lg"
                            : "bg-white/5 border-white/10 hover:border-white/20"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span
                            className="w-4 h-4 rounded-full shadow"
                            style={{
                              backgroundColor:
                                tKey === "Amber Gold" ? "#ff9f43" :
                                tKey === "Ocean Teal" ? "#1fa89c" :
                                tKey === "Royal Purple" ? "#a855f7" :
                                tKey === "Crimson Red" ? "#ef4444" :
                                tKey === "Emerald" ? "#10b981" : "#3b82f6",
                            }}
                          ></span>
                          <span className="text-xs font-semibold text-white">{k}</span>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-[var(--t-primary)]" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Background Animation Mode */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--t-primary)] mb-3">
                  Background Visual Animation
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { id: "aurora", name: "Aurora Flow" },
                    { id: "particles", name: "Constellation Stars" },
                    { id: "wave", name: "Sine Wave" },
                    { id: "nebula", name: "Golden Nebula" },
                    { id: "matrix", name: "Digital Matrix" },
                    { id: "grid", name: "Cyber Grid" },
                    { id: "none", name: "Static (Off)" },
                  ].map((mode) => {
                    const isSelected = animMode === mode.id;
                    return (
                      <button
                        key={mode.id}
                        onClick={() => onChangeAnimMode && onChangeAnimMode(mode.id as BackgroundAnimMode)}
                        className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? "bg-[var(--t-primary)]/20 border-[var(--t-primary)] shadow-lg"
                            : "bg-white/5 border-white/10 hover:border-white/20"
                        }`}
                      >
                        <span className="text-xs font-semibold text-white">{mode.name}</span>
                        {isSelected && <Check className="w-4 h-4 text-[var(--t-primary)]" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeTab === "voice" && (
            <div className="space-y-4 animate-fadeIn">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--t-primary)] mb-2">
                ElevenLabs Voice Personas & Accents
              </label>
              <p className="text-xs text-gray-400 mb-4">
                Select your preferred voice persona for speech responses and audio assistance.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {ELEVENLABS_VOICES.map((v) => {
                  const isSelected = voiceId === v.id;
                  return (
                    <button
                      key={v.id}
                      onClick={() => onSelectVoice(v.id)}
                      className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-start justify-between ${
                        isSelected
                          ? "bg-[var(--t-primary)]/20 border-[var(--t-primary)] shadow-lg"
                          : "bg-white/5 border-white/10 hover:border-white/20"
                      }`}
                    >
                      <div>
                        <div className="text-xs font-bold text-white flex items-center gap-1.5">
                          <Mic className="w-3.5 h-3.5 text-[var(--t-primary)]" />
                          <span>{v.name}</span>
                        </div>
                        <p className="text-[10px] text-gray-400 mt-1">{v.persona}</p>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-[var(--t-primary)] mt-1" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === "language" && (
            <div className="space-y-4 animate-fadeIn">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--t-primary)] mb-2">
                Language Support & Localization
              </label>
              <p className="text-xs text-gray-400 mb-4">
                Choose your preferred language for the CUB Ava interface and assistant prompts.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {LANGUAGES_LIST.map((l) => {
                  const isSelected = language === l.code;
                  return (
                    <button
                      key={l.code}
                      onClick={() => onSelectLanguage(l.code)}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? "bg-[var(--t-primary)]/20 border-[var(--t-primary)] shadow-lg"
                          : "bg-white/5 border-white/10 hover:border-white/20"
                      }`}
                    >
                      <div>
                        <div className="text-xs font-bold text-white">{l.name}</div>
                        <div className="text-[10px] text-gray-400">{l.nativeName}</div>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-[var(--t-primary)]" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-[var(--t-primary)] text-[#0a0806] font-bold text-xs hover:opacity-90 transition-all cursor-pointer shadow-lg"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
