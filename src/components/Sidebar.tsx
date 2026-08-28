import React, { useState } from "react";
import { ThemeName, BranchLocation, ChatSession, BackgroundAnimMode } from "../types";
import { THEMES, LOCATIONS, NAV_ITEMS } from "../data/bankData";
import { LogoSvg } from "./LogoSvg";
import { LANGUAGES_LIST, LanguageOption } from "../data/languages";
import { getTranslation } from "../utils/i18n";
import { ELEVENLABS_VOICES } from "../utils/speech";
import { Lock, MapPin, PhoneCall, Headphones, X, PlusCircle, Calculator, Home, CreditCard, ArrowRightLeft, TrendingUp, ShieldCheck, HelpCircle, Landmark, MessageSquare, Trash2, History, Sparkles, Monitor, ChevronDown, Layers, Globe2, Search, Check, Volume2, Mic, User, LogOut, Menu, Settings } from "lucide-react";

interface SidebarProps {
  currentTheme: ThemeName;
  onSelectTheme: (theme: ThemeName) => void;
  animMode?: BackgroundAnimMode;
  onChangeAnimMode?: (mode: BackgroundAnimMode) => void;
  onSelectNavPrompt: (prompt: string) => void;
  onNewChat: () => void;
  onOpenCalculator?: () => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  sessions?: ChatSession[];
  activeSessionId?: string;
  onSelectSession?: (id: string) => void;
  onDeleteSession?: (id: string) => void;
  language?: string;
  onSelectLanguage?: (code: string) => void;
  voiceId?: string;
  onSelectVoice?: (id: string) => void;
  loggedInUser?: string | null;
  onOpenLoginModal?: () => void;
  onLogout?: () => void;
  isDesktopSidebarOpen?: boolean;
  onOpenSettings?: (tab?: any) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTheme,
  onSelectTheme,
  animMode = "aurora",
  onChangeAnimMode,
  onSelectNavPrompt,
  onNewChat,
  onOpenCalculator,
  isOpenMobile,
  onCloseMobile,
  sessions = [],
  activeSessionId,
  onSelectSession,
  onDeleteSession,
  language = "en",
  onSelectLanguage,
  voiceId = "cgSgspJ2msm6clMCkdW9",
  onSelectVoice,
  loggedInUser,
  onOpenLoginModal,
  onLogout,
  isDesktopSidebarOpen = true,
  onOpenSettings,
}) => {
  const [showBranches, setShowBranches] = useState(false);
  const [showAnimDropdown, setShowAnimDropdown] = useState(false);
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [showVoiceDropdown, setShowVoiceDropdown] = useState(false);
  const [isMenuDropdownOpen, setIsMenuDropdownOpen] = useState(false);
  const [langSearchQuery, setLangSearchQuery] = useState<string>("");
  const [selectedBranchKey, setSelectedBranchKey] = useState<string>(
    "Headquarters — Friars Hill Road"
  );

  const t = getTranslation(language);
  const currentLang = LANGUAGES_LIST.find((l) => l.code === language) || LANGUAGES_LIST[0];
  const filteredLanguages = LANGUAGES_LIST.filter(
    (l) =>
      l.name.toLowerCase().includes(langSearchQuery.toLowerCase()) ||
      l.nativeName.toLowerCase().includes(langSearchQuery.toLowerCase()) ||
      l.code.toLowerCase().includes(langSearchQuery.toLowerCase())
  );

  const getAnimLabel = (m: BackgroundAnimMode) => {
    switch (m) {
      case "aurora": return "Aurora Flow";
      case "particles": return "Constellation Stars";
      case "wave": return "Sine Wave";
      case "nebula": return "Golden Nebula";
      case "matrix": return "Digital Matrix";
      case "grid": return "Cyber Grid";
      case "none": return "Static (Off)";
      default: return "Aurora Flow";
    }
  };

  const selectedLoc: BranchLocation = LOCATIONS[selectedBranchKey];

  const formatDate = (timestamp: number) => {
    const d = new Date(timestamp);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    if (isToday) {
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }
    return d.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  const handleNavClick = (label: string, prompt: string) => {
    if (!loggedInUser) {
      if (onOpenLoginModal) onOpenLoginModal();
      onCloseMobile();
      return;
    }
    if (label === "Home") {
      onNewChat();
    } else if (prompt) {
      onSelectNavPrompt(prompt);
    }
    onCloseMobile();
  };

  const handleQuickAction = (action: string) => {
    if (action === "branch") {
      setShowBranches((prev) => !prev);
    } else if (action === "contact") {
      onSelectNavPrompt("What are your contact numbers and hours?");
      onCloseMobile();
    } else if (action === "support") {
      onSelectNavPrompt("I'd like to speak with a live support agent");
      onCloseMobile();
    }
  };

  const getNavLocalizedLabel = (label: string): string => {
    switch (label) {
      case "Home": return t.navHome;
      case "Accounts": return t.navAccounts;
      case "Transfers": return t.navTransfers;
      case "Investments": return t.navInvestments;
      case "Loans": return t.navLoans;
      case "Security": return t.navSecurity;
      case "Support": return t.navSupport;
      default: return label;
    }
  };

  const getNavIcon = (label: string) => {
    switch (label) {
      case "Home": return <Home className="w-4 h-4 shrink-0" />;
      case "Accounts": return <Landmark className="w-4 h-4 shrink-0" />;
      case "Transfers": return <ArrowRightLeft className="w-4 h-4 shrink-0" />;
      case "Investments": return <TrendingUp className="w-4 h-4 shrink-0" />;
      case "Loans": return <CreditCard className="w-4 h-4 shrink-0" />;
      case "Security": return <ShieldCheck className="w-4 h-4 shrink-0" />;
      case "Support": return <HelpCircle className="w-4 h-4 shrink-0" />;
      default: return null;
    }
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-black/70 z-40 lg:hidden backdrop-blur-sm"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-[300px] 3xl:w-[360px] bg-[#0b0806] border-r border-[var(--line-soft)] p-4 flex flex-col transition-transform duration-300 ease-in-out overflow-y-auto lg:translate-x-0 ${
          isOpenMobile ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } ${!isDesktopSidebarOpen ? "lg:-translate-x-full lg:!translate-x-[-100%]" : ""}`}
      >
        {/* Mobile Close Button */}
        <button
          onClick={onCloseMobile}
          className="lg:hidden absolute top-4 right-4 text-gray-400 hover:text-white p-1"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Sidebar Header */}
        <div className="flex items-center gap-3 pb-3 border-b border-[var(--line-soft)] mb-3">
          <div className="side-logo-badge logo-flash">
            <LogoSvg />
          </div>
          <div>
            <h3 className="m-0 font-['Sora'] text-[13px] font-bold text-[var(--brand-teal)] leading-tight">
              {t.appName}
            </h3>
            <p className="m-0 text-[10px] font-bold tracking-wider uppercase text-[var(--t-primary)]">
              {t.appSubtitle}
            </p>
          </div>
        </div>

        {/* Navigation Menu */}
        <div className="space-y-1 mb-4 mt-2">
          {NAV_ITEMS.map((item, idx) => {
            const isHome = item.label === "Home";
            const localizedLabel = getNavLocalizedLabel(item.label);
            return (
              <button
                key={item.label}
                onClick={() => handleNavClick(item.label, item.prompt)}
                className={`w-full text-left px-3.5 py-2.5 rounded-[var(--radius-md)] text-[13px] font-medium flex items-center gap-2.5 transition-all cursor-pointer ${
                  isHome && idx === 0
                    ? "bg-gradient-to-r from-[var(--t-primary)] to-[var(--t-secondary)] text-[#0a0806] font-bold shadow-md"
                    : "text-[var(--text-soft)] hover:bg-white/5 hover:text-white hover:translate-x-1"
                }`}
              >
                {getNavIcon(item.label)}
                <span>{localizedLabel}</span>
              </button>
            );
          })}

          {/* Inline Dropdown for Menu / Settings */}
          <div>
            <button
              onClick={() => setIsMenuDropdownOpen(!isMenuDropdownOpen)}
              className={`w-full text-left px-3.5 py-2.5 rounded-[var(--radius-md)] text-[13px] font-medium flex items-center justify-between transition-all cursor-pointer ${
                isMenuDropdownOpen ? "bg-white/10 text-white" : "text-[var(--text-soft)] hover:bg-white/5 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Menu className="w-4 h-4 shrink-0" />
                <span>Menu Options</span>
              </div>
              <ChevronDown className={`w-4 h-4 transition-transform ${isMenuDropdownOpen ? "rotate-180" : ""}`} />
            </button>
            
            {isMenuDropdownOpen && (
              <div className="pl-4 pr-2 mt-1 space-y-1">
                <button
                  onClick={() => {
                    if (onOpenSettings) onOpenSettings("account");
                    if (isOpenMobile) onCloseMobile();
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-[var(--text-soft)] hover:text-white hover:bg-white/5 flex items-center gap-2 transition-all cursor-pointer"
                >
                  <User className="w-3.5 h-3.5 text-[var(--t-primary)]" />
                  {loggedInUser ? "Account & Sign Out" : "Secure Sign In"}
                </button>
                <button
                  onClick={() => {
                    if (onOpenSettings) onOpenSettings("appearance");
                    if (isOpenMobile) onCloseMobile();
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-[var(--text-soft)] hover:text-white hover:bg-white/5 flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Layers className="w-3.5 h-3.5 text-[var(--t-primary)]" />
                  Theme & Animation
                </button>
                <button
                  onClick={() => {
                    if (onOpenSettings) onOpenSettings("voice");
                    if (isOpenMobile) onCloseMobile();
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-[var(--text-soft)] hover:text-white hover:bg-white/5 flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Mic className="w-3.5 h-3.5 text-[var(--t-primary)]" />
                  Voice & Accent
                </button>
                <button
                  onClick={() => {
                    if (onOpenSettings) onOpenSettings("language");
                    if (isOpenMobile) onCloseMobile();
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-[var(--text-soft)] hover:text-white hover:bg-white/5 flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Globe2 className="w-3.5 h-3.5 text-[var(--t-primary)]" />
                  Language Support
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Saved Chats / History Section */}
        <div className="mb-4">
          <div className="side-section-label mb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-[11px] font-bold text-[var(--t-primary)] uppercase tracking-wider">
              <History className="w-3.5 h-3.5" /> {t.savedChats} ({sessions.length})
            </span>
            <button
              onClick={() => {
                onNewChat();
                onCloseMobile();
              }}
              className="flex items-center gap-1 text-[10px] font-bold text-[#0a0806] bg-[var(--t-primary)] hover:opacity-90 px-2 py-1 rounded-md transition-all cursor-pointer shadow-sm"
              title="Start New Conversation"
            >
              <PlusCircle className="w-3 h-3" />
              New
            </button>
          </div>

          <div className="space-y-1 max-h-[180px] overflow-y-auto pr-1 custom-scrollbar">
            {sessions.length === 0 ? (
              <p className="text-[11px] text-[var(--text-faint)] italic px-2 py-1.5">
                {t.noSavedChats}
              </p>
            ) : (
              sessions.map((sess) => {
                const isActive = sess.id === activeSessionId;
                return (
                  <div
                    key={sess.id}
                    onClick={() => {
                      if (!loggedInUser) {
                        if (onOpenLoginModal) onOpenLoginModal();
                        onCloseMobile();
                        return;
                      }
                      if (onSelectSession) onSelectSession(sess.id);
                      onCloseMobile();
                    }}
                    className={`group relative w-full p-2 rounded-xl text-left text-xs transition-all cursor-pointer flex items-center justify-between border ${
                      isActive
                        ? "bg-[var(--t-primary)]/15 border-[var(--t-primary)]/50 text-white font-semibold shadow-sm"
                        : "bg-white/[0.03] border-white/5 text-[var(--text-soft)] hover:bg-white/[0.07] hover:text-white hover:border-white/10"
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1 pr-1">
                      <MessageSquare
                        className={`w-3.5 h-3.5 shrink-0 ${
                          isActive ? "text-[var(--t-primary)]" : "text-gray-400"
                        }`}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-[12px] font-medium leading-tight text-gray-200 group-hover:text-white">
                          {sess.title || t.newConversation}
                        </div>
                        <div className="text-[10px] text-gray-400 mt-0.5 flex items-center gap-1.5">
                          <span>{formatDate(sess.updatedAt)}</span>
                          <span>•</span>
                          <span>{sess.messages.length} msg{sess.messages.length !== 1 ? "s" : ""}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      title="Delete chat session"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onDeleteSession) onDeleteSession(sess.id);
                      }}
                      className="p-1.5 rounded-lg opacity-80 group-hover:opacity-100 hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-all cursor-pointer shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Quick Actions & Code Export */}
        <div className="side-section-label">{t.quickTools}</div>
        <div className="space-y-1 mb-3">
          {onOpenCalculator && (
            <button
              onClick={() => {
                if (!loggedInUser) {
                  if (onOpenLoginModal) onOpenLoginModal();
                  onCloseMobile();
                  return;
                }
                onOpenCalculator();
                onCloseMobile();
              }}
              className="w-full text-left px-3.5 py-2 rounded-[var(--radius-md)] text-[12px] font-bold text-[#0a0806] bg-gradient-to-r from-[var(--t-primary)] to-[var(--t-secondary)] hover:brightness-110 flex items-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <Calculator className="w-4 h-4 shrink-0" />
              {t.calculatorTitle}
            </button>
          )}

          <button
            onClick={() => handleQuickAction("branch")}
            className="w-full text-left px-3.5 py-2 rounded-[var(--radius-md)] text-[13px] font-medium text-[var(--text-soft)] hover:bg-white/5 hover:text-white flex items-center gap-2 cursor-pointer"
          >
            <MapPin className="w-4 h-4 text-[var(--t-primary)]" />
            {t.branchLocations}
          </button>

          <button
            onClick={() => handleQuickAction("contact")}
            className="w-full text-left px-3.5 py-2 rounded-[var(--radius-md)] text-[13px] font-medium text-[var(--text-soft)] hover:bg-white/5 hover:text-white flex items-center gap-2 cursor-pointer"
          >
            <PhoneCall className="w-4 h-4 text-[var(--t-primary)]" />
            {t.contactUs}
          </button>
        </div>

        {/* Branch Dropdown details if branch locator active */}
        {showBranches && (
          <div className="mb-4">
            <div className="side-section-label">{t.branchHours}</div>
            <select
              value={selectedBranchKey}
              onChange={(e) => setSelectedBranchKey(e.target.value)}
              className="w-full bg-[#171310] text-white text-xs rounded-[var(--radius-sm)] border border-[var(--line)] p-2 mb-2 focus:outline-none focus:border-[var(--t-primary)]"
            >
              {Object.keys(LOCATIONS).map((key) => (
                <option key={key} value={key}>
                  {key}
                </option>
              ))}
            </select>

            <div className="branch-card text-xs space-y-1">
              <h4 className="font-['Sora'] text-[13px] font-bold text-[var(--t-primary)] mb-1">
                {selectedBranchKey}
              </h4>
              <p>
                <strong className="text-white">Address:</strong> {selectedLoc.address}
              </p>
              <p>
                <strong className="text-white">Phone:</strong>{" "}
                <a
                  href={`tel:${selectedLoc.phone_tel}`}
                  className="text-[var(--t-primary)] hover:underline font-semibold"
                >
                  {selectedLoc.phone}
                </a>
              </p>
              <p>
                <strong className="text-white">Hours:</strong> {selectedLoc.hours}
              </p>
            </div>
          </div>
        )}



        {/* Secure Banking Footer */}
        <div className="mt-auto pt-2">
          <div className="secure-card">
            <div className="icon">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h5 className="text-xs font-bold text-white m-0">Secure Banking</h5>
              <p className="text-[10px] text-[var(--text-faint)] m-0">
                256-bit Encrypted Session
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
