import React, { useState } from 'react';
import { Database, Check, Copy, Key, Shield, RefreshCw, X, Server } from 'lucide-react';
import { getSavedSupabaseConfig, saveSupabaseConfig, isSupabaseConnected } from '../../services/supabaseClient';
import { SUPABASE_SQL_SCHEMA } from '../../services/sqlSchema';
import { db } from '../../services/db';
import { useNotification } from '../../context/NotificationContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseSettingsModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const currentConfig = getSavedSupabaseConfig();
  const [url, setUrl] = useState(currentConfig.url);
  const [anonKey, setAnonKey] = useState(currentConfig.key);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'config' | 'sql'>('config');
  const { showToast } = useNotification();
  const isConnected = isSupabaseConnected();

  if (!isOpen) return null;

  const handleSave = () => {
    saveSupabaseConfig(url, anonKey);
    showToast({
      type: 'success',
      title: 'Supabase Settings Saved',
      message: url && anonKey ? 'Configuration updated. Page will reload to connect.' : 'Using local offline database.',
    });
    setTimeout(() => {
      window.location.reload();
    }, 800);
  };

  const handleCopySQL = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopied(true);
    showToast({
      type: 'info',
      title: 'SQL Schema Copied',
      message: 'Paste into your Supabase project SQL Editor to create all 10 tables & RLS policies.',
    });
    setTimeout(() => setCopied(false), 3000);
  };

  const handleResetData = () => {
    if (window.confirm('Reset database to realistic sample data (includes Lab 3 collision)?')) {
      db.resetToSampleData();
      showToast({
        type: 'success',
        title: 'Sample Data Restored',
        message: 'Loaded sample courses, venues, timetable, events, and reports.',
      });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold shadow-sm">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Supabase Database & Storage</h3>
              <p className="text-xs text-slate-500">PostgreSQL with Row-Level Security & Auth</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-slate-200 px-4 bg-white text-xs font-semibold">
          <button
            onClick={() => setActiveTab('config')}
            className={`py-3 px-3 border-b-2 transition ${
              activeTab === 'config'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Connection & Credentials
          </button>
          <button
            onClick={() => setActiveTab('sql')}
            className={`py-3 px-3 border-b-2 transition ${
              activeTab === 'sql'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            SQL Migration Script (10 Tables)
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex-1">
          {activeTab === 'config' ? (
            <div className="space-y-4 text-xs text-slate-600">
              {/* Status pill */}
              <div
                className={`p-3 rounded-xl border flex items-center justify-between ${
                  isConnected
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-amber-50 border-amber-200 text-amber-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                    }`}
                  />
                  <span className="font-bold">
                    {isConnected ? 'Connected to Live Supabase' : 'Offline / Local Storage Engine Active'}
                  </span>
                </div>
                <span className="text-[11px] font-medium opacity-80">
                  {isConnected ? 'PostgreSQL backend active' : '100% functional with local persistence'}
                </span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Supabase Project URL (VITE_SUPABASE_URL)
                </label>
                <input
                  type="url"
                  placeholder="https://xyzcompany.supabase.co"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800 font-mono text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Supabase Public Anon Key (VITE_SUPABASE_ANON_KEY)
                </label>
                <input
                  type="password"
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  value={anonKey}
                  onChange={(e) => setAnonKey(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800 font-mono text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
                <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                  <Shield className="w-3 h-3 text-emerald-600" />
                  Only client anon keys are accepted. Service-role keys are strictly never stored.
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleResetData}
                  className="flex items-center gap-1.5 px-3 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg font-medium transition"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Reset Sample Data</span>
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-sm transition"
                >
                  Save & Apply
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  Ready-to-run DDL for PostgreSQL with RLS and all 10 campus tables.
                </span>
                <button
                  onClick={handleCopySQL}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied!' : 'Copy SQL'}</span>
                </button>
              </div>
              <pre className="p-3 bg-slate-950 text-emerald-300 font-mono text-[11px] rounded-xl overflow-x-auto max-h-72 border border-slate-800 leading-relaxed select-all">
                {SUPABASE_SQL_SCHEMA}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
