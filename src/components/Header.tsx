import React, { useState, useEffect } from "react";
import { LogoSvg } from "./LogoSvg";
import { Menu, ShieldCheck, Volume2, VolumeX, User, LogOut } from "lucide-react";
import { getTranslation } from "../utils/i18n";
import { speakText, stopSpeech, isSpeaking as checkIsSpeaking } from "../utils/speech";

interface HeaderProps {
  onOpenMobile: () => void;
  language?: string;
  loggedInUser?: string | null;
  onOpenLoginModal?: () => void;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenMobile,
  language = "en",
  loggedInUser,
  onOpenLoginModal,
  onLogout,
}) => {
  const [speaking, setSpeaking] = useState<boolean>(false);
  const t = getTranslation(language);

  // Sync state if audio stopped externally
  useEffect(() => {
    const interval = setInterval(() => {
      setSpeaking(checkIsSpeaking());
    }, 400);
    return () => clearInterval(interval);
  }, []);

  const handleToggleAvaSpeech = () => {
    if (speaking) {
      stopSpeech();
      setSpeaking(false);
      return;
    }

    setSpeaking(true);
    speakText(
      t.welcomeMessage,
      {
        onStart: () => setSpeaking(true),
        onEnd: () => setSpeaking(false),
        onError: () => setSpeaking(false),
      },
      language
    );
  };

  return (
    <div className="main-header flex flex-wrap items-center justify-between gap-3 p-4 sm:p-5">
      <div className="flex items-center gap-3 sm:gap-4">
        <button
          onClick={onOpenMobile}
          className="lg:hidden text-[var(--text-soft)] hover:text-white p-2 rounded-xl bg-white/5 border border-[var(--line)] hover:border-[var(--t-primary)]/40 transition-all cursor-pointer"
          title="Open Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Ava Interactive Avatar Logo Badge */}
        <button
          onClick={handleToggleAvaSpeech}
          className="main-logo-badge logo-flash relative group cursor-pointer focus:outline-none"
          title={t.listenToAva}
        >
          <LogoSvg />
          {speaking && (
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--t-primary)] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[var(--t-primary)]"></span>
            </span>
          )}
        </button>

        <div>
          <h1 className="m-0 font-['Sora'] text-lg sm:text-2xl 3xl:text-3xl font-extrabold leading-tight tracking-tight">
            <span className="text-[var(--brand-teal)]">{t.appName}</span>
            <br />
            <span className="text-[var(--t-primary)]">{t.appSubtitle}</span>
          </h1>
        </div>
      </div>

      {/* Right Controls: Ava Voice Button, Login / Profile, & Verified Badge */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Login or User Profile */}
        {loggedInUser ? (
          <div className="flex items-center gap-2 bg-[var(--t-primary)]/15 border border-[var(--t-primary)]/40 px-3 py-1.5 rounded-full text-xs font-semibold text-white">
            <User className="w-3.5 h-3.5 text-[var(--t-primary)]" />
            <span className="max-w-[120px] truncate">{loggedInUser}</span>
            {onLogout && (
              <button
                onClick={onLogout}
                className="text-gray-400 hover:text-white ml-1 p-0.5 rounded-full hover:bg-white/10 transition-all cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ) : (
          <button
            onClick={onOpenLoginModal}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[var(--t-primary)] text-[#0a0806] font-extrabold text-xs hover:opacity-90 transition-all cursor-pointer shadow-md shadow-[var(--t-glow)]"
            title="Sign In to CUB Portal"
          >
            <User className="w-4 h-4" />
            <span>Sign In</span>
          </button>
        )}

        {/* Girl / Ava Talking Voice Button */}
        <button
          onClick={handleToggleAvaSpeech}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-full border text-xs font-bold transition-all cursor-pointer shadow-md ${
            speaking
              ? "bg-[var(--t-primary)] text-[#0a0806] border-white/40 shadow-[var(--t-glow)] animate-pulse"
              : "bg-white/10 hover:bg-white/15 text-[var(--t-primary)] border-[var(--t-primary)]/40 hover:border-[var(--t-primary)]"
          }`}
          title={speaking ? t.stop : t.listenToAva}
        >
          {speaking ? (
            <>
              <VolumeX className="w-4 h-4 animate-bounce" />
              <span>{t.stop}</span>
            </>
          ) : (
            <>
              <Volume2 className="w-4 h-4" />
              <span>{t.listenToAva}</span>
            </>
          )}
        </button>

        {/* Verified Badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/5 border border-[var(--line)] text-xs text-[var(--text-soft)] shadow-sm">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span className="font-semibold text-white">{t.officialAssistant}</span>
        </div>
      </div>
    </div>
  );
};
