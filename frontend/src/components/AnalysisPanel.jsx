import React from 'react';
import { ShieldAlert, CheckCircle, AlertOctagon, HelpCircle, FileText, ArrowRight, Brain, Zap } from 'lucide-react';

export default function AnalysisPanel({ analysis }) {
  if (!analysis) {
    return (
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-8 text-center">
        <Brain className="w-12 h-12 text-slate-700 mx-auto mb-3" />
        <h3 className="text-base font-semibold text-slate-400">No Incident Analyzed Yet</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          Submit an incident above to recall historical Hindsight memory and generate AI root-cause analysis.
        </p>
      </div>
    );
  }

  const {
    summary,
    root_cause,
    severity,
    recommended_investigation = [],
    recommended_actions = [],
    historical_evidence,
    confidence,
    explanation,
    memory_used
  } = analysis;

  const severityColor = {
    CRITICAL: 'bg-red-500/10 text-red-400 border-red-500/30',
    HIGH: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
    MEDIUM: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    LOW: 'bg-blue-500/10 text-blue-400 border-blue-500/30'
  }[severity] || 'bg-purple-500/10 text-purple-400 border-purple-500/30';

  const confidenceColor = {
    HIGH: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
    MEDIUM: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
    LOW: 'text-slate-400 border-slate-500/30 bg-slate-500/10'
  }[confidence] || 'text-purple-400 border-purple-500/30 bg-purple-500/10';

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-xl overflow-hidden space-y-0">
      
      {/* Header bar */}
      <div className="px-5 py-4 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-purple-400" />
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            AI Incident Analysis & Diagnostics
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {memory_used ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-purple-950/80 text-purple-300 border border-purple-700/60 shadow-sm">
              <Brain className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
              Hindsight Memory Context Applied
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700">
              Generic (No Memory Found)
            </span>
          )}

          <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${severityColor}`}>
            {severity}
          </span>
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* Incident Summary */}
        {summary && (
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Incident Summary
            </span>
            <p className="text-sm text-slate-200 font-medium">
              {summary}
            </p>
          </div>
        )}

        {/* Root Cause Section */}
        <div className="bg-slate-950/80 border border-purple-900/50 rounded-lg p-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/5 rounded-full blur-2xl pointer-events-none"></div>
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-xs font-bold text-purple-300 uppercase tracking-wider mb-1">
                Identified Root Cause
              </h3>
              <p className="text-sm text-white font-semibold leading-relaxed">
                {root_cause}
              </p>
            </div>
          </div>
        </div>

        {/* Recommended Actions */}
        {recommended_actions.length > 0 && (
          <div>
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              Recommended Remediation Actions
            </h4>
            <ul className="space-y-2">
              {recommended_actions.map((action, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2.5 bg-slate-950/50 border border-slate-800/80 p-3 rounded-lg text-xs text-slate-200 font-mono"
                >
                  <ArrowRight className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{action}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Recommended Investigation Steps */}
        {recommended_investigation.length > 0 && (
          <div>
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-blue-400" />
              Recommended Investigation Steps
            </h4>
            <div className="grid grid-cols-1 gap-2">
              {recommended_investigation.map((step, idx) => (
                <div key={idx} className="bg-slate-950/40 border border-slate-800/60 p-2.5 rounded-lg text-xs text-slate-300 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-400 text-[10px] font-bold flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Confidence & Historical Evidence footer */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-800/60">
          <div className="bg-slate-950/60 border border-slate-800 p-3 rounded-lg">
            <span className="text-[11px] font-semibold text-slate-400 block mb-1">
              Confidence Score
            </span>
            <span className={`inline-block px-2.5 py-0.5 rounded text-xs font-bold border ${confidenceColor}`}>
              {confidence} CONFIDENCE
            </span>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 p-3 rounded-lg">
            <span className="text-[11px] font-semibold text-slate-400 block mb-1">
              Historical Evidence Status
            </span>
            <p className="text-xs text-slate-300 font-mono line-clamp-2">
              {historical_evidence}
            </p>
          </div>
        </div>

        {/* Explanation */}
        {explanation && (
          <div className="text-xs text-slate-400 bg-slate-950/30 p-3 rounded-lg border border-slate-800/40">
            <span className="font-semibold text-slate-300 block mb-1">AI Reasoning & Diagnostics Note:</span>
            <p className="leading-relaxed">{explanation}</p>
          </div>
        )}
      </div>
    </div>
  );
}
