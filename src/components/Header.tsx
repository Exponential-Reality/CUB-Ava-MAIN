import React, { useState, useEffect, useRef } from "react";
import { LogoSvg } from "./LogoSvg";
import { Menu, ShieldCheck, Settings, User, ChevronDown, Palette, Mic, Globe, LogOut, ChevronUp } from "lucide-react";
import { getTranslation } from "../utils/i18n";
import { SettingsTab } from "./SettingsModal";

interface HeaderProps {
  onOpenMobile: () => void;
  onToggleDesktopSidebar?: () => void;
  isDesktopSidebarOpen?: boolean;
  language?: string;
  loggedInUser?: string | null;
  onOpenSettings: (tab?: SettingsTab) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenMobile,
  onToggleDesktopSidebar,
  isDesktopSidebarOpen = true,
  language = "en",
  loggedInUser,
  onOpenSettings,
}) => {
  const t = getTranslation(language);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="main-header flex flex-wrap items-center justify-between gap-3 p-4 sm:p-5">
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Mobile menu trigger */}
        <button
          onClick={onOpenMobile}
          className="lg:hidden text-[var(--text-soft)] hover:text-white p-2 rounded-xl bg-white/5 border border-[var(--line)] hover:border-[var(--t-primary)]/40 transition-all cursor-pointer"
          title="Open Sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Desktop menu trigger (shown when sidebar is closed) */}
        {!isDesktopSidebarOpen && (
          <button
            onClick={onToggleDesktopSidebar}
            className="hidden lg:block text-[var(--text-soft)] hover:text-white p-2 rounded-xl bg-white/5 border border-[var(--line)] hover:border-[var(--t-primary)]/40 transition-all cursor-pointer"
            title="Open Sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        {/* Logo Badge */}
        <div className="main-logo-badge logo-flash relative group">
          <LogoSvg />
        </div>
        <div>
          <h1 className="m-0 font-['Sora'] text-lg sm:text-2xl 3xl:text-3xl font-extrabold leading-tight tracking-tight">
            <span className="text-[var(--brand-teal)]">{t.appName}</span>
            <br />
            <span className="text-[var(--t-primary)]">{t.appSubtitle}</span>
          </h1>
        </div>
      </div>

      {/* Right Controls: Menu Dropdown & Official Verified Badge */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Verified Badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/5 border border-[var(--line)] text-xs text-[var(--text-soft)] shadow-sm">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span className="font-semibold text-white">{t.officialAssistant}</span>
        </div>
      </div>
    </div>
  );
};
