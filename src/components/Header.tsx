import React from "react";
import { LogoSvg } from "./LogoSvg";
import { Menu, ShieldCheck } from "lucide-react";
import { getTranslation } from "../utils/i18n";

interface HeaderProps {
  onOpenMobile: () => void;
  onOpenSqliteModal?: () => void;
  language?: string;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenMobile,
  language = "en",
}) => {
  const t = getTranslation(language);

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

        <div className="main-logo-badge logo-flash">
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

      {/* Right Controls: Official Verified Badge */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/5 border border-[var(--line)] text-xs text-[var(--text-soft)] shadow-sm">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span className="font-semibold text-white">{t.officialAssistant}</span>
        </div>
      </div>
    </div>
  );
};


