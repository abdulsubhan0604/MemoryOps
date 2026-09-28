import React, { useState, useEffect } from 'react';
import { Database, Save, CheckCircle2, RefreshCw } from 'lucide-react';

export default function ResolutionPanel({ currentIncident, analysis, onRetain, loading }) {
  const [incidentId, setIncidentId] = useState('INC-001');
  const [service, setService] = useState('');
  const [environment, setEnvironment] = useState('production');
  const [symptoms, setSymptoms] = useState('');
  const [rootCause, setRootCause] = useState('');
  const [resolution, setResolution] = useState('');
  const [lessons, setLessons] = useState('');
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    if (currentIncident) {
      setService(currentIncident.service || '');
      setEnvironment(currentIncident.environment || 'production');
      setSymptoms(currentIncident.description || '');
      setIncidentId(`INC-${Math.floor(100 + Math.random() * 900)}`);
    }
    if (analysis) {
      if (analysis.root_cause) {
        setRootCause(analysis.root_cause);
      }
      if (analysis.recommended_actions && analysis.recommended_actions.length > 0) {
        setResolution(analysis.recommended_actions.join('; '));
      }
    }
  }, [currentIncident, analysis]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage(null);

    const payload = {
      incident_id: incidentId,
      service,
      environment,
      symptoms,
      root_cause: rootCause,
      resolution,
      lessons_learned: lessons || 'N/A'
    };

    try {
      const res = await onRetain(payload);
      setSuccessMessage(`Resolution retained as ${res.incident_id || incidentId} into Hindsight Memory!`);
      setTimeout(() => setSuccessMessage(null), 6000);
    } catch (err) {
      // Handled in parent
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-xl overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-emerald-400" />
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            Commit Resolution to Hindsight Memory (retain)
          </h2>
        </div>
        <span className="text-xs text-slate-400 font-mono">
          Teaches Hindsight for Future Incidents
        </span>
      </div>

      <form onSubmit={handleSubmit} className="p-5 space-y-4">
        {successMessage && (
          <div className="bg-emerald-950/80 border border-emerald-600/60 p-3 rounded-lg flex items-center gap-2 text-xs text-emerald-200 font-medium animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Incident ID
            </label>
            <input
              type="text"
              value={incidentId}
              onChange={(e) => setIncidentId(e.target.value)}
              required
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Service
            </label>
            <input
              type="text"
              value={service}
              onChange={(e) => setService(e.target.value)}
              required
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Environment
            </label>
            <input
              type="text"
              value={environment}
              onChange={(e) => setEnvironment(e.target.value)}
              required
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Observed Symptoms
            </label>
            <textarea
              rows={2}
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              required
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Verified Root Cause
            </label>
            <textarea
              rows={2}
              value={rootCause}
              onChange={(e) => setRootCause(e.target.value)}
              required
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-emerald-400 mb-1">
            Proven Resolution / Fixed Applied (Key Memory Data)
          </label>
          <textarea
            rows={2}
            value={resolution}
            onChange={(e) => setResolution(e.target.value)}
            required
            placeholder="e.g. Increased database connection pool size from 20 to 100 and restarted service"
            className="w-full bg-slate-950 border border-emerald-700/60 rounded-lg p-2.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-emerald-400"
          />
        </div>

        <div className="flex items-center justify-between pt-2">
          <span className="text-[11px] text-slate-500">
            Hindsight Method: <code className="text-purple-400">client.retain(bank_id='memoryops-incidents', content=...)</code>
          </span>

          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-lg shadow-emerald-600/20 transition flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            Save Resolution to Memory
          </button>
        </div>
      </form>
    </div>
  );
}
