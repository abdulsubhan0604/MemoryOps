import React from 'react';
import { Activity, Database, Cpu, ShieldCheck, Zap, RefreshCw } from 'lucide-react';

export default function Header({ health, activeTab, setActiveTab, onRefreshHealth, loading }) {
  const hindsightConnected = health?.hindsight?.hindsight_cloud_connected ?? false;
  const memoryCount = health?.hindsight?.local_memory_count ?? 0;
  const bankId = health?.hindsight?.bank_id || 'memoryops-incidents';
  const llmModel = health?.llm_model || 'llama-3.3-70b-versatile';

  return (
    <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Brand & Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-blue-500 p-0.5 shadow-lg shadow-purple-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Zap className="w-5 h-5 text-purple-400 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold tracking-tight text-white flex items-center gap-1.5">
                Memory<span className="text-purple-400">Ops</span>
              </h1>
              <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">
                v1.0 SRE
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              AI Incident Response Agent • Powered by Hindsight Memory System
            </p>
          </div>
        </div>

        {/* Status Indicators & Navigation */}
        <div className="flex items-center flex-wrap gap-3">
          
          {/* Hindsight Status Badge */}
          <div className="flex items-center gap-2 bg-slate-950/80 border border-slate-800 rounded-lg px-3 py-1.5 text-xs">
            <Database className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-slate-400 font-mono">Bank:</span>
            <span className="text-purple-300 font-mono font-medium">{bankId}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-700"></span>
            
            {hindsightConnected ? (
              <span className="flex items-center gap-1 text-emerald-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block"></span>
                Cloud Connected
              </span>
            ) : (
              <span className="flex items-center gap-1 text-amber-400 font-medium" title="Running in resilient local memory mode">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                Active ({memoryCount} memories)
              </span>
            )}
          </div>

          {/* Groq LLM Badge */}
          <div className="hidden sm:flex items-center gap-2 bg-slate-950/80 border border-slate-800 rounded-lg px-3 py-1.5 text-xs">
            <Cpu className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-slate-400 font-mono">LLM:</span>
            <span className="text-blue-300 font-mono font-medium truncate max-w-[130px]">{llmModel}</span>
          </div>

          {/* Refresh Health */}
          <button
            onClick={onRefreshHealth}
            disabled={loading}
            className="p-1.5 text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-800 rounded-lg transition"
            title="Refresh connection status"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-800/60 flex space-x-1">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`px-4 py-2.5 text-xs font-semibold flex items-center gap-2 border-b-2 transition ${
            activeTab === 'dashboard'
              ? 'border-purple-500 text-purple-400 bg-purple-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <Activity className="w-4 h-4" />
          Incident Command Dashboard
        </button>

        <button
          onClick={() => setActiveTab('demo')}
          className={`px-4 py-2.5 text-xs font-semibold flex items-center gap-2 border-b-2 transition ${
            activeTab === 'demo'
              ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <Zap className="w-4 h-4 text-amber-400" />
          Before vs. After Memory Demo
        </button>
      </div>
    </header>
  );
}
