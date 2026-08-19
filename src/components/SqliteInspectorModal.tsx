import React, { useEffect, useState } from "react";
import { Database, FileText, ExternalLink, RefreshCw, X, Table, HardDrive, CheckCircle2 } from "lucide-react";

interface SqliteInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SqliteInspectorModal: React.FC<SqliteInspectorModalProps> = ({ isOpen, onClose }) => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/sqlite/stats");
      if (!res.ok) throw new Error("Failed to load SQLite stats");
      const data = await res.json();
      setStats(data);
    } catch (err: any) {
      setError(err.message || "Could not connect to SQLite server");
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-[#0f0c08] border border-[var(--line)] rounded-2xl shadow-2xl overflow-hidden text-white">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-white/5 border-b border-[var(--line)]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[var(--t-primary)] to-[var(--t-secondary)] text-[#0a0806] flex items-center justify-center shadow-md">
              <Database className="w-5 h-5 font-bold" />
            </div>
            <div>
              <h3 className="font-['Sora'] font-bold text-base text-[var(--t-primary)]">
                SQLite Database & REST API
              </h3>
              <p className="text-xs text-[var(--text-soft)]">
                Local SQLite Database Engine & FastAPI-Style OpenAPI Docs
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[var(--text-soft)] hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Status Badge & Open Docs */}
          <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <p className="text-xs font-bold text-emerald-300">SQLite Database Active & Connected</p>
                <p className="text-[11px] text-emerald-400/80">
                  Engine: sql.js WebAssembly SQLite 3 • File: cub_ai.sqlite
                </p>
              </div>
            </div>

            <a
              href="/api/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-[var(--t-primary)] to-[var(--t-secondary)] text-[#0a0806] font-extrabold text-xs hover:brightness-110 active:scale-95 transition-all shadow-md cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Open OpenAPI Docs</span>
              <ExternalLink className="w-3 h-3 opacity-70" />
            </a>
          </div>

          {/* Database Stats */}
          {loading ? (
            <div className="py-8 text-center text-xs text-[var(--text-soft)] animate-pulse">
              Querying SQLite database metrics...
            </div>
          ) : error ? (
            <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/30 text-xs text-rose-300">
              {error}
            </div>
          ) : stats ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-2 text-[var(--text-soft)] text-xs mb-1">
                    <HardDrive className="w-3.5 h-3.5" />
                    <span>Database Size</span>
                  </div>
                  <p className="text-lg font-bold text-white">{stats.fileSizeFormatted}</p>
                </div>

                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-2 text-[var(--text-soft)] text-xs mb-1">
                    <Table className="w-3.5 h-3.5" />
                    <span>Total Tables</span>
                  </div>
                  <p className="text-lg font-bold text-[var(--t-primary)]">
                    {Object.keys(stats.tables || {}).length} Tables
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 col-span-2 sm:col-span-1">
                  <div className="flex items-center gap-2 text-[var(--text-soft)] text-xs mb-1">
                    <Database className="w-3.5 h-3.5" />
                    <span>Engine</span>
                  </div>
                  <p className="text-xs font-bold text-emerald-400 truncate">
                    {stats.engine}
                  </p>
                </div>
              </div>

              {/* Table Breakdown */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-[var(--text-soft)]">
                  <span>SQLite Table Metrics</span>
                  <button
                    onClick={fetchStats}
                    className="flex items-center gap-1 text-[var(--t-primary)] hover:underline cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Refresh</span>
                  </button>
                </div>

                <div className="divide-y divide-white/10 rounded-xl bg-white/5 border border-white/10 overflow-hidden text-xs">
                  {Object.entries(stats.tables || {}).map(([tableName, count]: [string, any]) => (
                    <div key={tableName} className="flex items-center justify-between px-4 py-3 hover:bg-white/5">
                      <div className="flex items-center gap-2 font-mono text-white">
                        <Table className="w-3.5 h-3.5 text-[var(--t-primary)]" />
                        <span>{tableName}</span>
                      </div>
                      <span className="font-bold px-2 py-0.5 rounded bg-white/10 text-[var(--t-primary)]">
                        {count} records
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}

          {/* Direct API Endpoints summary */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2 text-xs">
            <p className="font-bold text-[var(--t-primary)]">SQLite REST API Endpoints:</p>
            <ul className="space-y-1.5 font-mono text-[11px] text-[var(--text-soft)]">
              <li>• <span className="text-emerald-400 font-bold">GET</span> /api/sqlite/stats - SQLite DB status & row metrics</li>
              <li>• <span className="text-emerald-400 font-bold">GET</span> /api/sqlite/sessions - Fetch stored chat sessions</li>
              <li>• <span className="text-emerald-400 font-bold">GET</span> /api/sqlite/sessions/:id - Fetch session messages</li>
              <li>• <span className="text-sky-400 font-bold">POST</span> /api/sqlite/feedback - Store user rating in SQLite</li>
              <li>• <span className="text-purple-400 font-bold">GET</span> /api/docs - FastAPI style Swagger UI</li>
            </ul>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-white/5 border-t border-[var(--line)] flex justify-between items-center text-xs">
          <span className="text-[var(--text-soft)]">CUB AI SQLite System v1.0</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold transition-all cursor-pointer"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
