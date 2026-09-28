import React, { useState } from 'react';
import { AlertTriangle, Play, Database, Sparkles, Layers, Server } from 'lucide-react';

const DEMO_PRESETS = [
  {
    label: 'PAY-001 (504 Timeout)',
    service: 'Payment API',
    environment: 'production',
    severity: 'High',
    description: 'Payment API is returning HTTP 504 Gateway Timeout errors under high traffic'
  },
  {
    label: 'DB-002 (Conn Limit)',
    service: 'PostgreSQL Primary',
    environment: 'production',
    severity: 'Critical',
    description: 'PostgreSQL max connection limits exceeded, rejecting write transactions'
  },
  {
    label: 'AUTH-003 (JWT Fail)',
    service: 'Authentication Service',
    environment: 'production',
    severity: 'High',
    description: 'HTTP 401 Unauthorized errors across all downstream APIs'
  },
  {
    label: 'CACHE-004 (Redis OOM)',
    service: 'Redis Cluster',
    environment: 'production',
    severity: 'Medium',
    description: 'Redis OOM memory error, key evictions failing'
  },
  {
    label: 'API-005 (Latency Spike)',
    service: 'API Gateway',
    environment: 'production',
    severity: 'High',
    description: 'Latency spike to 5000ms on /v1/orders endpoints'
  }
];

export default function IncidentInput({ onAnalyze, loading, onSeedDemo, seeding }) {
  const [service, setService] = useState('Payment API');
  const [environment, setEnvironment] = useState('production');
  const [severity, setSeverity] = useState('High');
  const [description, setDescription] = useState('Payment API is returning HTTP 504 Gateway Timeout errors under high traffic');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!service || !description) return;
    onAnalyze({
      service,
      environment,
      severity,
      description
    });
  };

  const handleSelectPreset = (preset) => {
    setService(preset.service);
    setEnvironment(preset.environment);
    setSeverity(preset.severity);
    setDescription(preset.description);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-xl overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-800/80 bg-slate-950/50 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            Production Incident Report
          </h2>
        </div>

        <button
          type="button"
          onClick={onSeedDemo}
          disabled={seeding}
          className="text-xs font-semibold text-purple-300 hover:text-purple-200 bg-purple-950/60 hover:bg-purple-900/60 border border-purple-800/50 px-3 py-1.5 rounded-lg transition flex items-center gap-1.5"
        >
          <Database className={`w-3.5 h-3.5 text-purple-400 ${seeding ? 'animate-spin' : ''}`} />
          {seeding ? 'Seeding Hindsight...' : 'Seed Hindsight Demo Data'}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-5 space-y-4">
        {/* Presets */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-2 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            Quick Presets / Realistic Incidents:
          </label>
          <div className="flex flex-wrap gap-2">
            {DEMO_PRESETS.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectPreset(preset)}
                className="text-xs font-medium px-2.5 py-1.5 rounded-md bg-slate-800/80 hover:bg-purple-900/40 text-slate-300 hover:text-purple-300 border border-slate-700/60 hover:border-purple-600/50 transition font-mono"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Form Fields Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
              <Server className="w-3.5 h-3.5 text-slate-400" />
              Service Name
            </label>
            <input
              type="text"
              value={service}
              onChange={(e) => setService(e.target.value)}
              placeholder="e.g. Payment API"
              required
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 transition font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-slate-400" />
              Environment
            </label>
            <select
              value={environment}
              onChange={(e) => setEnvironment(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-purple-500 transition"
            >
              <option value="production">production</option>
              <option value="staging">staging</option>
              <option value="development">development</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Severity
            </label>
            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-purple-500 transition"
            >
              <option value="Critical">Critical (P1)</option>
              <option value="High">High (P2)</option>
              <option value="Medium">Medium (P3)</option>
              <option value="Low">Low (P4)</option>
            </select>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Incident Description & Symptoms
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the failure, HTTP status codes, error messages, or symptoms..."
            required
            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 transition font-mono"
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full md:w-auto px-6 py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-semibold text-sm shadow-lg shadow-purple-600/20 transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Recalling Hindsight & Analyzing...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>Analyze Incident with Hindsight AI</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
