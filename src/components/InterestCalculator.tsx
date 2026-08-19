import React, { useState, useEffect } from "react";
import { Calculator, Sparkles, AlertCircle, ArrowRight, DollarSign, Percent, Calendar, CheckCircle2, Copy, Check } from "lucide-react";
import { copyToClipboard } from "../utils/clipboard";

export interface RateOption {
  id: string;
  name: string;
  type: "savings" | "loan";
  rate: number; // percentage
  minDeposit: number;
  description: string;
  badge: string;
}

export const CUB_RATE_OPTIONS: RateOption[] = [
  {
    id: "priority_savings",
    name: "Priority Savings Account",
    type: "savings",
    rate: 2.00,
    minDeposit: 100,
    description: "2.00% interest rate with $100 required opening amount.",
    badge: "2.00% APY",
  },
  {
    id: "prestige_savings",
    name: "Prestige Savings Account",
    type: "savings",
    rate: 2.50,
    minDeposit: 1000,
    description: "Minimum 2.50% interest rate, varies by balance ($1,000 opening amount).",
    badge: "2.50% APY+",
  },
  {
    id: "dollar_a_day",
    name: "Dollar A Day Savings",
    type: "savings",
    rate: 2.25,
    minDeposit: 100,
    description: "Minimum 2.25% interest rate, varies by balance ($100 opening amount).",
    badge: "2.25% APY",
  },
  {
    id: "premium_savers",
    name: "Premium Savers Account",
    type: "savings",
    rate: 2.75,
    minDeposit: 5000,
    description: "Minimum 2.75% interest rate, varies by balance ($5,000 opening amount).",
    badge: "2.75% APY+",
  },
  {
    id: "prime_lending",
    name: "Prime Lending / Personal Loan",
    type: "loan",
    rate: 10.00,
    minDeposit: 1000,
    description: "Prime Lending Rate benchmarked at 10.00%, adjusted based on credit history.",
    badge: "10.00% Prime Rate",
  },
];

interface InterestCalculatorProps {
  onAskAi?: (prompt: string) => void;
  onClose?: () => void;
  isModal?: boolean;
}

export const InterestCalculator: React.FC<InterestCalculatorProps> = ({
  onAskAi,
  onClose,
  isModal = false,
}) => {
  const [selectedId, setSelectedId] = useState<string>("priority_savings");
  const [principal, setPrincipal] = useState<number>(1000);
  const [monthlyContribution, setMonthlyContribution] = useState<number>(100);
  const [customRate, setCustomRate] = useState<number>(2.00);
  const [termYears, setTermYears] = useState<number>(3);
  const [compounding, setCompounding] = useState<"monthly" | "annually">("monthly");
  const [copied, setCopied] = useState<boolean>(false);

  const selectedOption = CUB_RATE_OPTIONS.find((o) => o.id === selectedId) || CUB_RATE_OPTIONS[0];

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && onClose) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // When dropdown selection changes, sync rate & min deposit recommendation
  useEffect(() => {
    setCustomRate(selectedOption.rate);
    if (principal < selectedOption.minDeposit) {
      setPrincipal(selectedOption.minDeposit);
    }
  }, [selectedId]);

  // Calculation Logic
  const isLoan = selectedOption.type === "loan";
  const r = customRate / 100;
  const t = termYears;
  const n = compounding === "monthly" ? 12 : 1;

  let totalBalance = 0;
  let totalInterest = 0;
  let totalContributions = principal;
  let monthlyPayment = 0;

  if (isLoan) {
    // Amortized Loan Repayment Formula: M = P * [i(1+i)^months] / [(1+i)^months - 1]
    const months = t * 12;
    const i = r / 12;
    if (i > 0 && months > 0) {
      monthlyPayment = (principal * (i * Math.pow(1 + i, months))) / (Math.pow(1 + i, months) - 1);
      totalBalance = monthlyPayment * months; // Total repayment
      totalInterest = totalBalance - principal;
    } else {
      monthlyPayment = principal / (months || 1);
      totalBalance = principal;
      totalInterest = 0;
    }
  } else {
    // Compound Savings Formula:
    // A = P(1 + r/n)^(n*t) + PMT * [ ((1 + r/n)^(n*t) - 1) / (r/n) ]
    const periods = n * t;
    const ratePerPeriod = r / n;
    const pmtPerPeriod = compounding === "monthly" ? monthlyContribution : monthlyContribution * 12;

    const compoundPrincipal = principal * Math.pow(1 + ratePerPeriod, periods);
    const compoundPMT =
      ratePerPeriod > 0
        ? pmtPerPeriod * ((Math.pow(1 + ratePerPeriod, periods) - 1) / ratePerPeriod)
        : pmtPerPeriod * periods;

    totalBalance = compoundPrincipal + compoundPMT;
    totalContributions = principal + monthlyContribution * 12 * t;
    totalInterest = totalBalance - totalContributions;
  }

  const isBelowMinDeposit = principal < selectedOption.minDeposit;

  const handleAskAiClick = () => {
    const text = isLoan
      ? `I calculated a CUB ${selectedOption.name} with a principal of $${principal.toLocaleString()} at ${customRate}% interest over ${termYears} years. Estimated monthly payment is $${monthlyPayment.toFixed(2)} and total interest paid is $${totalInterest.toFixed(2)}. Can you give me advice or details on loan application requirements?`
      : `I calculated CUB ${selectedOption.name} with an initial deposit of $${principal.toLocaleString()}, monthly savings of $${monthlyContribution.toLocaleString()} at ${customRate}% interest over ${termYears} years. Projected balance is $${totalBalance.toFixed(2)} with $${totalInterest.toFixed(2)} interest earned. How do I open this account?`;

    if (onAskAi) {
      onAskAi(text);
      if (onClose) onClose();
    }
  };

  const handleCopySummary = async () => {
    const summary = isLoan
      ? `Caribbean Union Bank (CUB) Loan Estimate:\n• Option: ${selectedOption.name}\n• Principal: $${principal.toLocaleString()}\n• Interest Rate: ${customRate}%\n• Term: ${termYears} Years\n• Monthly Payment: $${monthlyPayment.toFixed(2)}\n• Total Interest Paid: $${totalInterest.toFixed(2)}\n• Total Repayment: $${totalBalance.toFixed(2)}`
      : `Caribbean Union Bank (CUB) Savings Projection:\n• Account: ${selectedOption.name}\n• Initial Deposit: $${principal.toLocaleString()}\n• Monthly Addition: $${monthlyContribution.toLocaleString()}\n• Interest Rate: ${customRate}% APY\n• Duration: ${termYears} Years\n• Total Interest Earned: $${totalInterest.toFixed(2)}\n• Final Balance: $${totalBalance.toFixed(2)}`;

    const success = await copyToClipboard(summary);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const content = (
    <div className="bg-[#120e0a] border border-[var(--line)] text-white rounded-2xl p-5 sm:p-6 shadow-2xl relative max-w-xl w-full mx-auto font-sans">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-3 mb-5 pb-4 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[var(--t-primary)] to-[var(--t-secondary)] text-[#0a0806] flex items-center justify-center font-bold shadow-md">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-['Sora'] font-extrabold text-lg text-white leading-tight">
              CUB Interest & Loan Calculator
            </h3>
            <p className="text-xs text-[var(--text-soft)]">
              Caribbean Union Bank Official Rates & Projections
            </p>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 text-xs font-bold text-gray-300 hover:text-white px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 cursor-pointer transition-all shadow-sm"
            title="Close Calculator (Esc)"
          >
            <span>Close</span>
            <span className="text-[10px] bg-black/40 px-1.5 py-0.5 rounded text-gray-400">ESC</span>
            <span className="text-sm leading-none ml-0.5">✕</span>
          </button>
        )}
      </div>

      {/* DROPDOWN MENU */}
      <div className="mb-5">
        <label className="block text-xs font-bold uppercase tracking-wider text-[var(--t-primary)] mb-2 flex items-center gap-1.5">
          <span>Select CUB Product or Rate Menu</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--t-primary)]/15 text-[var(--t-primary)] border border-[var(--t-primary)]/30 font-semibold">
            Dropdown
          </span>
        </label>
        <div className="relative">
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="w-full bg-[#1c1610] text-white text-sm font-semibold rounded-xl px-4 py-3 border border-[var(--t-primary)]/40 focus:border-[var(--t-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--t-primary)]/30 appearance-none cursor-pointer transition-all shadow-inner"
          >
            {CUB_RATE_OPTIONS.map((opt) => (
              <option key={opt.id} value={opt.id} className="bg-[#18120c] text-white py-2">
                {opt.name} ({opt.badge})
              </option>
            ))}
          </select>
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--t-primary)] font-bold text-xs">
            ▼
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-2 flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-[var(--t-primary)] shrink-0" />
          <span>{selectedOption.description}</span>
        </p>
      </div>

      {/* Minimum Opening Amount Alert */}
      {isBelowMinDeposit && (
        <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
          <span>
            Notice: {selectedOption.name} requires a minimum opening deposit of{" "}
            <strong>${selectedOption.minDeposit.toLocaleString()}</strong>.
          </span>
        </div>
      )}

      {/* INPUT CONTROLS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
        {/* Principal / Deposit Amount */}
        <div className="bg-[#18120c] p-3.5 rounded-xl border border-white/10">
          <label className="text-xs font-semibold text-gray-300 mb-1 block flex items-center justify-between">
            <span>{isLoan ? "Loan Principal ($)" : "Initial Deposit ($)"}</span>
            <span className="text-[var(--t-primary)] font-bold">${principal.toLocaleString()}</span>
          </label>
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-gray-400" />
            <input
              type="number"
              min={isLoan ? 500 : 50}
              step={50}
              value={principal}
              onChange={(e) => setPrincipal(Math.max(0, Number(e.target.value)))}
              className="w-full bg-[#221810] text-white font-bold text-sm rounded-lg px-2.5 py-1.5 border border-white/10 focus:border-[var(--t-primary)] focus:outline-none"
            />
          </div>
          <input
            type="range"
            min={isLoan ? 500 : 50}
            max={isLoan ? 100000 : 50000}
            step={50}
            value={principal}
            onChange={(e) => setPrincipal(Number(e.target.value))}
            className="w-full accent-[var(--t-primary)] cursor-pointer"
          />
        </div>

        {/* Monthly Contribution or Repayment */}
        {!isLoan ? (
          <div className="bg-[#18120c] p-3.5 rounded-xl border border-white/10">
            <label className="text-xs font-semibold text-gray-300 mb-1 block flex items-center justify-between">
              <span>Monthly Addition ($)</span>
              <span className="text-[var(--t-primary)] font-bold">${monthlyContribution.toLocaleString()}</span>
            </label>
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-gray-400" />
              <input
                type="number"
                min={0}
                step={25}
                value={monthlyContribution}
                onChange={(e) => setMonthlyContribution(Math.max(0, Number(e.target.value)))}
                className="w-full bg-[#221810] text-white font-bold text-sm rounded-lg px-2.5 py-1.5 border border-white/10 focus:border-[var(--t-primary)] focus:outline-none"
              />
            </div>
            <input
              type="range"
              min={0}
              max={5000}
              step={25}
              value={monthlyContribution}
              onChange={(e) => setMonthlyContribution(Number(e.target.value))}
              className="w-full accent-[var(--t-primary)] cursor-pointer"
            />
          </div>
        ) : (
          <div className="bg-[#18120c] p-3.5 rounded-xl border border-white/10">
            <label className="text-xs font-semibold text-gray-300 mb-1 block flex items-center justify-between">
              <span>Loan Duration (Years)</span>
              <span className="text-[var(--t-primary)] font-bold">{termYears} Years</span>
            </label>
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <input
                type="number"
                min={1}
                max={30}
                value={termYears}
                onChange={(e) => setTermYears(Math.max(1, Math.min(30, Number(e.target.value))))}
                className="w-full bg-[#221810] text-white font-bold text-sm rounded-lg px-2.5 py-1.5 border border-white/10 focus:border-[var(--t-primary)] focus:outline-none"
              />
            </div>
            <input
              type="range"
              min={1}
              max={30}
              value={termYears}
              onChange={(e) => setTermYears(Number(e.target.value))}
              className="w-full accent-[var(--t-primary)] cursor-pointer"
            />
          </div>
        )}

        {/* Interest Rate */}
        <div className="bg-[#18120c] p-3.5 rounded-xl border border-white/10">
          <label className="text-xs font-semibold text-gray-300 mb-1 block flex items-center justify-between">
            <span>Interest Rate (%)</span>
            <span className="text-[var(--t-primary)] font-bold">{customRate}%</span>
          </label>
          <div className="flex items-center gap-2 mb-2">
            <Percent className="w-4 h-4 text-gray-400" />
            <input
              type="number"
              step={0.1}
              min={0.1}
              max={25}
              value={customRate}
              onChange={(e) => setCustomRate(Math.max(0.1, Number(e.target.value)))}
              className="w-full bg-[#221810] text-white font-bold text-sm rounded-lg px-2.5 py-1.5 border border-white/10 focus:border-[var(--t-primary)] focus:outline-none"
            />
          </div>
          <p className="text-[10px] text-gray-400">Default benchmark for {selectedOption.name}</p>
        </div>

        {/* Term Years for Savings */}
        {!isLoan && (
          <div className="bg-[#18120c] p-3.5 rounded-xl border border-white/10">
            <label className="text-xs font-semibold text-gray-300 mb-1 block flex items-center justify-between">
              <span>Savings Horizon</span>
              <span className="text-[var(--t-primary)] font-bold">{termYears} Years</span>
            </label>
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <input
                type="number"
                min={1}
                max={30}
                value={termYears}
                onChange={(e) => setTermYears(Math.max(1, Math.min(30, Number(e.target.value))))}
                className="w-full bg-[#221810] text-white font-bold text-sm rounded-lg px-2.5 py-1.5 border border-white/10 focus:border-[var(--t-primary)] focus:outline-none"
              />
            </div>
            <input
              type="range"
              min={1}
              max={30}
              value={termYears}
              onChange={(e) => setTermYears(Number(e.target.value))}
              className="w-full accent-[var(--t-primary)] cursor-pointer"
            />
          </div>
        )}
      </div>

      {/* RESULTS SUMMARY CARD */}
      <div className="bg-gradient-to-br from-[#1e1710] to-[#281d12] border border-[var(--t-primary)]/30 rounded-2xl p-4 sm:p-5 mb-5 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--t-primary)]/10 rounded-full blur-2xl pointer-events-none" />

        <h4 className="text-xs font-bold uppercase tracking-widest text-[var(--t-primary)] mb-3">
          {isLoan ? "Estimated Loan Repayment" : "Projected Savings Growth"}
        </h4>

        {isLoan ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
            <div className="bg-[#120e0a]/80 p-3 rounded-xl border border-white/5">
              <p className="text-[11px] text-gray-400">Monthly Payment</p>
              <p className="text-lg sm:text-xl font-extrabold text-[var(--t-primary)] mt-0.5">
                ${monthlyPayment.toFixed(2)}
              </p>
            </div>
            <div className="bg-[#120e0a]/80 p-3 rounded-xl border border-white/5">
              <p className="text-[11px] text-gray-400">Total Interest Paid</p>
              <p className="text-lg sm:text-xl font-extrabold text-amber-400 mt-0.5">
                ${totalInterest.toFixed(2)}
              </p>
            </div>
            <div className="bg-[#120e0a]/80 p-3 rounded-xl border border-white/5">
              <p className="text-[11px] text-gray-400">Total Repayment</p>
              <p className="text-lg sm:text-xl font-extrabold text-white mt-0.5">
                ${totalBalance.toFixed(2)}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
            <div className="bg-[#120e0a]/80 p-3 rounded-xl border border-white/5">
              <p className="text-[11px] text-gray-400">Total Contributions</p>
              <p className="text-lg sm:text-xl font-extrabold text-gray-200 mt-0.5">
                ${totalContributions.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </p>
            </div>
            <div className="bg-[#120e0a]/80 p-3 rounded-xl border border-white/5">
              <p className="text-[11px] text-gray-400">Interest Earned</p>
              <p className="text-lg sm:text-xl font-extrabold text-[var(--t-primary)] mt-0.5">
                +${totalInterest.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="bg-[#120e0a]/80 p-3 rounded-xl border border-white/5">
              <p className="text-[11px] text-gray-400">Final Balance</p>
              <p className="text-lg sm:text-xl font-extrabold text-white mt-0.5">
                ${totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        )}

        {/* Progress Bar Visual */}
        <div className="mt-4 pt-3 border-t border-white/10">
          <div className="flex justify-between text-[11px] text-gray-400 mb-1">
            <span>Principal ({((principal / (totalBalance || 1)) * 100).toFixed(0)}%)</span>
            <span>Interest ({((totalInterest / (totalBalance || 1)) * 100).toFixed(0)}%)</span>
          </div>
          <div className="w-full h-2.5 bg-black/50 rounded-full overflow-hidden flex">
            <div
              className="h-full bg-white/70 transition-all duration-300"
              style={{ width: `${Math.min(100, (principal / (totalBalance || 1)) * 100)}%` }}
            />
            <div
              className="h-full bg-[var(--t-primary)] transition-all duration-300"
              style={{ width: `${Math.min(100, (totalInterest / (totalBalance || 1)) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* FOOTER ACTIONS */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <button
          onClick={handleAskAiClick}
          className="w-full sm:w-auto flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-[var(--t-primary)] to-[var(--t-secondary)] text-[#0a0806] font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer"
        >
          <Sparkles className="w-4 h-4 shrink-0" />
          <span>Discuss Calculation with CUB AI</span>
          <ArrowRight className="w-4 h-4 shrink-0" />
        </button>

        <button
          onClick={handleCopySummary}
          className="w-full sm:w-auto px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-gray-200 flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-green-400" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 text-gray-400" />
              <span>Copy Summary</span>
            </>
          )}
        </button>

        {onClose && (
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/30 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <span>Exit Calculator</span>
            <span>✕</span>
          </button>
        )}
      </div>
    </div>
  );

  if (isModal) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto"
        onClick={(e) => {
          if (e.target === e.currentTarget && onClose) {
            onClose();
          }
        }}
      >
        <div onClick={(e) => e.stopPropagation()} className="w-full max-w-xl my-auto">
          {content}
        </div>
      </div>
    );
  }

  return content;
};
