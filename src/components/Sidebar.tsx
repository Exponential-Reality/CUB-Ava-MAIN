import React, { useState } from "react";
import { ThemeName, BranchLocation, ChatSession, BackgroundAnimMode } from "../types";
import { THEMES, LOCATIONS, NAV_ITEMS } from "../data/bankData";
import { LogoSvg } from "./LogoSvg";
import { LANGUAGES_LIST, LanguageOption } from "./LanguageSelectorBar";
import { getTranslation } from "../utils/i18n";
import { Lock, MapPin, PhoneCall, Headphones, X, PlusCircle, Calculator, Home, CreditCard, ArrowRightLeft, TrendingUp, ShieldCheck, HelpCircle, Landmark, MessageSquare, Trash2, History, Sparkles, Monitor, ChevronDown, Layers, Database, Globe2, Search, Check } from "lucide-react";

interface SidebarProps {
  currentTheme: ThemeName;
  onSelectTheme: (theme: ThemeName) => void;
  animMode?: BackgroundAnimMode;
  onChangeAnimMode?: (mode: BackgroundAnimMode) => void;
  onSelectNavPrompt: (prompt: string) => void;
  onNewChat: () => void;
  onOpenCalculator?: () => void;
  onOpenSqliteModal?: () => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  sessions?: ChatSession[];
  activeSessionId?: string;
  onSelectSession?: (id: string) => void;
  onDeleteSession?: (id: string) => void;
  language?: string;
  onSelectLanguage?: (code: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTheme,
  onSelectTheme,
  animMode = "aurora",
  onChangeAnimMode,
  onSelectNavPrompt,
  onNewChat,
  onOpenCalculator,
  onOpenSqliteModal,
  isOpenMobile,
  onCloseMobile,
  sessions = [],
  activeSessionId,
  onSelectSession,
  onDeleteSession,
  language = "en",
  onSelectLanguage,
}) => {
  const [showBranches, setShowBranches] = useState(false);
  const [showAnimDropdown, setShowAnimDropdown] = useState(false);
  const [showLangDropdown, setShowLangDropdown] = useState(false);
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
        }`}
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
              Caribbean Union Bank
            </h3>
            <p className="m-0 text-[10px] font-bold tracking-wider uppercase text-[var(--t-primary)]">
              AI Chatbox
            </p>
          </div>
        </div>

        {/* New Chat Primary Button */}
        <button
          onClick={() => {
            onNewChat();
            onCloseMobile();
          }}
          className="w-full mb-3.5 group relative flex items-center justify-center gap-2.5 px-4 py-3 rounded-2xl bg-gradient-to-r from-[var(--t-primary)] to-[var(--t-secondary)] text-[#0a0806] font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-[var(--t-glow)] hover:shadow-xl hover:brightness-110 active:scale-[0.98] transition-all duration-200 cursor-pointer border border-white/20"
        >
          <PlusCircle className="w-4 h-4 text-[#0a0806] group-hover:rotate-90 transition-transform duration-300 shrink-0" />
          <span className="font-['Sora'] font-bold text-[13px]">{t.newConversation}</span>
          <Sparkles className="w-3.5 h-3.5 text-[#0a0806]/70 group-hover:scale-125 transition-transform shrink-0 ml-auto" />
        </button>

        {/* Navigation Menu */}
        <div className="space-y-1 mb-4">
          {NAV_ITEMS.map((item, idx) => {
            const isHome = item.label === "Home";
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
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Saved Chats / History Section */}
        <div className="mb-4">
          <div className="side-section-label mb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-[11px] font-bold text-[var(--t-primary)] uppercase tracking-wider">
              <History className="w-3.5 h-3.5" /> Saved Chats ({sessions.length})
            </span>
          </div>

          <div className="space-y-1 max-h-[180px] overflow-y-auto pr-1 custom-scrollbar">
            {sessions.length === 0 ? (
              <p className="text-[11px] text-[var(--text-faint)] italic px-2 py-1.5">
                No saved chats yet.
              </p>
            ) : (
              sessions.map((sess) => {
                const isActive = sess.id === activeSessionId;
                return (
                  <div
                    key={sess.id}
                    onClick={() => {
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
                          {sess.title || "New Conversation"}
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
        <div className="side-section-label">Quick Tools</div>
        <div className="space-y-1 mb-3">
          {onOpenCalculator && (
            <button
              onClick={() => {
                onOpenCalculator();
                onCloseMobile();
              }}
              className="w-full text-left px-3.5 py-2 rounded-[var(--radius-md)] text-[12px] font-bold text-[#0a0806] bg-gradient-to-r from-[var(--t-primary)] to-[var(--t-secondary)] hover:brightness-110 flex items-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <Calculator className="w-4 h-4 shrink-0" />
              CUB Interest Calculator
            </button>
          )}

          <button
            onClick={() => handleQuickAction("branch")}
            className="w-full text-left px-3.5 py-2 rounded-[var(--radius-md)] text-[13px] font-medium text-[var(--text-soft)] hover:bg-white/5 hover:text-white flex items-center gap-2 cursor-pointer"
          >
            <MapPin className="w-4 h-4 text-[var(--t-primary)]" />
            Branch Locator
          </button>

          <button
            onClick={() => handleQuickAction("contact")}
            className="w-full text-left px-3.5 py-2 rounded-[var(--radius-md)] text-[13px] font-medium text-[var(--text-soft)] hover:bg-white/5 hover:text-white flex items-center gap-2 cursor-pointer"
          >
            <PhoneCall className="w-4 h-4 text-[var(--t-primary)]" />
            Contact Us
          </button>
        </div>

        {/* Branch Dropdown details if branch locator active */}
        {showBranches && (
          <div className="mb-4">
            <div className="side-section-label">Branches & Contact</div>
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

        {/* Language Selector Dropdown Menu */}
        <div className="mb-3 relative">
          <div className="side-section-label">Language Support</div>
          <button
            onClick={() => setShowLangDropdown((prev) => !prev)}
            className="w-full text-left px-3 py-2 rounded-[var(--radius-md)] text-xs font-semibold bg-white/5 border border-[var(--line)] hover:border-[var(--t-primary)]/50 text-white flex items-center justify-between transition-all cursor-pointer shadow-sm hover:shadow-md"
            title="Select Language (24+ Languages)"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-base shrink-0">{currentLang.flag}</span>
              <span className="truncate text-gray-200">{currentLang.name}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-[var(--t-primary)] font-bold">24+</span>
              <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${showLangDropdown ? "rotate-180" : ""}`} />
            </div>
          </button>

          {showLangDropdown && (
            <div className="absolute left-0 right-0 mt-1.5 bg-[#14100c] border border-[var(--line)] rounded-2xl p-2.5 shadow-2xl z-50 animate-fadeIn backdrop-blur-xl space-y-2">
              <div className="flex items-center justify-between gap-1 border-b border-white/5 pb-1.5">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[var(--t-primary)] flex items-center gap-1.5">
                  <Globe2 className="w-3 h-3" /> Select Language
                </span>
              </div>
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-soft)]" />
                <input
                  type="text"
                  value={langSearchQuery}
                  onChange={(e) => setLangSearchQuery(e.target.value)}
                  placeholder="Search languages..."
                  className="w-full pl-8 pr-3 py-1 text-xs bg-black/50 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[var(--t-primary)]"
                />
              </div>
              <div className="max-h-52 overflow-y-auto custom-scrollbar space-y-1 pr-1">
                {filteredLanguages.map((lang) => {
                  const isSelected = language === lang.code;
                  return (
                    <button
                      key={lang.code}
                      onClick={() => {
                        if (onSelectLanguage) {
                          onSelectLanguage(lang.code);
                        }
                        setShowLangDropdown(false);
                        onCloseMobile();
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? "bg-[var(--t-primary)]/25 text-white font-bold border border-[var(--t-primary)]/50 shadow-sm"
                          : "text-[var(--text-soft)] hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span>{lang.flag}</span>
                        <span className="truncate">{lang.name}</span>
                      </div>
                      {isSelected && <Check className="w-3 h-3 text-[var(--t-primary)] shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Background Animation Mode Selector (Dropdown Menu) */}
        {onChangeAnimMode && (
          <div className="mb-3 relative">
            <div className="side-section-label">Background Motion</div>
            <button
              onClick={() => setShowAnimDropdown((prev) => !prev)}
              className="w-full text-left px-3 py-2 rounded-[var(--radius-md)] text-xs font-semibold bg-white/5 border border-[var(--line)] hover:border-[var(--t-primary)]/50 text-white flex items-center justify-between transition-all cursor-pointer shadow-sm hover:shadow-md"
              title="Select Animation Preset"
            >
              <div className="flex items-center gap-2 min-w-0">
                <Sparkles className={`w-3.5 h-3.5 shrink-0 ${animMode !== "none" ? "text-[var(--t-primary)] animate-pulse" : "text-gray-400"}`} />
                <span className="truncate text-gray-200">{getAnimLabel(animMode)}</span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${showAnimDropdown ? "rotate-180" : ""}`} />
            </button>

            {showAnimDropdown && (
              <div className="absolute left-0 right-0 mt-1.5 bg-[#14100c] border border-[var(--line)] rounded-2xl p-2 shadow-2xl z-50 animate-fadeIn backdrop-blur-xl space-y-0.5">
                <div className="text-[10px] font-extrabold uppercase tracking-widest text-[var(--t-primary)] px-2.5 py-1 flex items-center gap-1.5 border-b border-white/5 mb-1">
                  <Layers className="w-3 h-3" /> Motion Preset
                </div>
                {(
                  [
                    "aurora",
                    "particles",
                    "wave",
                    "nebula",
                    "matrix",
                    "grid",
                    "none",
                  ] as BackgroundAnimMode[]
                ).map((m) => {
                  const isSelected = animMode === m;
                  return (
                    <button
                      key={m}
                      onClick={() => {
                        onChangeAnimMode(m);
                        setShowAnimDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? "bg-[var(--t-primary)]/20 text-white font-bold border border-[var(--t-primary)]/40 shadow-sm"
                          : "text-[var(--text-soft)] hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <span>{getAnimLabel(m)}</span>
                      {m === "none" && (
                        <span className="text-[10px] text-amber-400 font-bold px-1.5 py-0.2 rounded bg-amber-400/10">
                          Off
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Background Theme Selector */}
        <div className="side-section-label">Color Theme</div>
        <div className="grid grid-cols-2 gap-1.5 mb-4">
          {(Object.keys(THEMES) as ThemeName[]).map((themeName) => {
            const isSelected = currentTheme === themeName;
            const themeConfig = THEMES[themeName];
            return (
              <button
                key={themeName}
                onClick={() => onSelectTheme(themeName)}
                className={`text-[11px] font-semibold py-1.5 px-2 rounded-[var(--radius-pill)] border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? "border-[var(--t-primary)] bg-gradient-to-r from-[var(--t-glow)] to-transparent text-white shadow-sm font-bold"
                    : "border-[var(--line)] bg-white/5 text-[var(--text-soft)] hover:border-[var(--t-primary)] hover:text-white"
                }`}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0 border border-white/20"
                  style={{ backgroundColor: themeConfig.primary }}
                />
                <span className="truncate">{themeName}</span>
              </button>
            );
          })}
        </div>

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
