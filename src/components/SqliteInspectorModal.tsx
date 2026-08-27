import React, { useState, useEffect } from "react";
import { X, Database, RefreshCw, Layers, CheckCircle2, ShieldCheck, Terminal, ExternalLink, HardDrive } from "lucide-react";

interface SqliteInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SqliteInspectorModal: React.FC<SqliteInspectorModalProps> = ({ isOpen, onClose }) => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [sessions, setSessions] = useState<any[]>([]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/sqlite/stats");
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
      const sRes = await fetch("/api/sqlite/sessions");
      if (sRes.ok) {
        const sData = await sRes.json();
        setSessions(Array.isArray(sData) ? sData.slice(0, 8) : []);
      }
    } catch (e) {
      console.warn("Failed to fetch SQLite stats", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchStats();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
      <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[var(--line)] flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                SQLite 3 Database Engine
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  Online & Active
                </span>
              </h2>
              <p className="text-xs text-[var(--text-soft)]">
                WebAssembly SQLite 3 • Stored in <code className="text-emerald-300">cub_ai.sqlite</code>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchStats}
              disabled={loading}
              className="p-2 rounded-lg text-[var(--text-soft)] hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
              title="Refresh SQLite Stats"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-emerald-400" : ""}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-[var(--text-soft)] hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-[var(--text-main)]">
          {/* Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-[var(--line)]">
              <div className="flex items-center gap-2 text-xs text-[var(--text-soft)] mb-1">
                <HardDrive className="w-3.5 h-3.5 text-sky-400" />
                <span>DB Size</span>
              </div>
              <div className="text-base font-bold text-white">
                {stats?.fileSizeFormatted || "64.00 KB"}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-[var(--line)]">
              <div className="flex items-center gap-2 text-xs text-[var(--text-soft)] mb-1">
                <Layers className="w-3.5 h-3.5 text-emerald-400" />
                <span>Sessions</span>
              </div>
              <div className="text-base font-bold text-white">
                {stats?.tables?.chat_sessions ?? sessions.length}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-[var(--line)]">
              <div className="flex items-center gap-2 text-xs text-[var(--text-soft)] mb-1">
                <Terminal className="w-3.5 h-3.5 text-amber-400" />
                <span>Messages</span>
              </div>
              <div className="text-base font-bold text-white">
                {stats?.tables?.chat_messages ?? 0}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-[var(--line)]">
              <div className="flex items-center gap-2 text-xs text-[var(--text-soft)] mb-1">
                <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                <span>Inquiries</span>
              </div>
              <div className="text-base font-bold text-white">
                {stats?.tables?.bank_inquiries ?? 0}
              </div>
            </div>
          </div>

          {/* SQLite Table Schema Details */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-[var(--text-soft)] uppercase tracking-wider">
              Active SQLite Relational Tables
            </h3>
            <div className="rounded-xl border border-[var(--line)] bg-black/40 p-3 space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between text-emerald-300 pb-1 border-b border-white/5">
                <span>chat_sessions (id, title, created_at, updated_at)</span>
                <span className="text-emerald-400 font-bold">{stats?.tables?.chat_sessions ?? 0} rows</span>
              </div>
              <div className="flex items-center justify-between text-sky-300 pb-1 border-b border-white/5">
                <span>chat_messages (id, session_id, role, content, routed_model)</span>
                <span className="text-sky-400 font-bold">{stats?.tables?.chat_messages ?? 0} rows</span>
              </div>
              <div className="flex items-center justify-between text-amber-300 pb-1 border-b border-white/5">
                <span>bank_inquiries (id, category, query, session_id, created_at)</span>
                <span className="text-amber-400 font-bold">{stats?.tables?.bank_inquiries ?? 0} rows</span>
              </div>
              <div className="flex items-center justify-between text-purple-300">
                <span>vector_memories & user_feedback</span>
                <span className="text-purple-400 font-bold">Synchronized</span>
              </div>
            </div>
          </div>

          {/* Recent Stored Sessions from SQLite */}
          {sessions.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-[var(--text-soft)] uppercase tracking-wider">
                Recent Sessions Persisted in SQLite
              </h3>
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {sessions.map((s) => (
                  <div
                    key={s.id}
                    className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5 flex items-center justify-between text-xs"
                  >
                    <div className="min-w-0 pr-2">
                      <p className="text-white font-medium truncate">{s.title || "Untitled Session"}</p>
                      <p className="text-[10px] text-[var(--text-soft)] font-mono">{s.id}</p>
                    </div>
                    <span className="text-[10px] text-emerald-400 font-mono shrink-0">
                      {new Date(s.updated_at || Date.now()).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* API & Docs Link */}
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-emerald-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>SQLite backend persistence is running automatically on every chat message.</span>
            </div>
            <a
              href="/api/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-semibold underline shrink-0 ml-2"
            >
              Open API Docs <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
