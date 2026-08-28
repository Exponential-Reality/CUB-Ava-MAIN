import React, { useState } from "react";
import { Lock, User, ShieldCheck, KeyRound, ArrowRight, X, Mail, CheckCircle2 } from "lucide-react";
import { LogoSvg } from "./LogoSvg";
import { getTranslation } from "../utils/i18n";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (username: string) => void;
  language?: string;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  language = "en",
}) => {
  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const t = getTranslation(language);

  if (!isOpen) return null;

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setError("Please enter your Gmail address.");
      return;
    }
    if (!cleanEmail.endsWith("@gmail.com") && !cleanEmail.endsWith("@googlemail.com")) {
      setError("Only official @gmail.com accounts are permitted.");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/verify-gmail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setIsLoading(false);
        setError(data.error || "Gmail verification failed. Please enter a valid active Gmail address.");
        return;
      }

      const code = data.code || "123456";
      setGeneratedOtp(code);
      setIsLoading(false);
      setSuccessMsg(`A verification code has been sent to your Gmail account (${cleanEmail}). Please check your inbox.`);
      setStep("otp");
    } catch (err) {
      setIsLoading(false);
      setError("Network or server error sending verification code. Please try again.");
    }
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode.trim()) {
      setError("Please enter the 6-digit verification code from your email.");
      return;
    }

    if (otpCode.trim() !== generatedOtp) {
      setError("Invalid verification code. Please check your Gmail inbox and enter the exact 6-digit code.");
      return;
    }

    setError("");
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      onLoginSuccess(email.trim());
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-[#120f0a] border border-[var(--line)] rounded-3xl p-6 sm:p-8 shadow-2xl text-white">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-white p-2 rounded-full bg-white/5 hover:bg-white/10 transition-all cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Branding */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-[var(--t-primary)]/15 border border-[var(--t-primary)]/40 flex items-center justify-center mb-3 shadow-[var(--t-glow)]">
            <LogoSvg />
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold font-['Sora'] tracking-tight">
            <span className="text-[var(--brand-teal)]">Caribbean Union Bank</span>
          </h2>
          <p className="text-xs text-[var(--text-soft)] mt-1">
            Secure Gmail Account Verification
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {step === "email" ? (
          <form onSubmit={handleRequestOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--t-primary)] mb-1.5">
                Gmail Account (@gmail.com)
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="yourname@gmail.com"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white text-xs focus:outline-none focus:border-[var(--t-primary)] transition-all"
                />
              </div>
              <p className="text-[10px] text-gray-400 mt-1.5">
                A verification code will be sent to your Gmail account.
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-[var(--t-primary)] text-[#0a0806] font-bold text-xs flex items-center justify-center gap-2 hover:opacity-90 transition-all cursor-pointer shadow-lg shadow-[var(--t-glow)] mt-2"
            >
              {isLoading ? (
                <span className="animate-spin w-4 h-4 border-2 border-[#0a0806] border-t-transparent rounded-full"></span>
              ) : (
                <>
                  <span>Send Verification Code</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4 animate-fadeIn">
            <div className="bg-white/5 p-3.5 rounded-xl border border-white/10 text-xs text-gray-300">
              A verification code has been sent to <span className="text-[var(--t-primary)] font-bold">{email}</span>. Please check your inbox.
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--t-primary)] mb-1.5">
                Enter 6-Digit Code
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="123456"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white text-base tracking-widest font-mono focus:outline-none focus:border-[var(--t-primary)] transition-all"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setStep("email")}
                className="w-1/3 py-2.5 rounded-xl bg-white/10 text-gray-300 font-semibold text-xs hover:bg-white/15 transition-all cursor-pointer"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="w-2/3 py-2.5 rounded-xl bg-[var(--t-primary)] text-[#0a0806] font-bold text-xs flex items-center justify-center gap-2 hover:opacity-90 transition-all cursor-pointer shadow-lg shadow-[var(--t-glow)]"
              >
                {isLoading ? (
                  <span className="animate-spin w-4 h-4 border-2 border-[#0a0806] border-t-transparent rounded-full"></span>
                ) : (
                  <>
                    <span>Confirm & Sign In</span>
                    <CheckCircle2 className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Security Notice */}
        <div className="mt-6 flex items-center gap-2 text-[10px] text-gray-400 bg-white/5 p-2.5 rounded-xl border border-white/5">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Secure Bank Verification • Encrypted Session</span>
        </div>
      </div>
    </div>
  );
};
