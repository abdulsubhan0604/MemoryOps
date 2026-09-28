import React, { useState } from 'react';
import { Database, Search, ShieldCheck, ChevronDown, ChevronUp, FileCode } from 'lucide-react';

export default function MemoryPanel({ memories = [], memoryUsed }) {
  const [expandedId, setExpandedId] = useState(null);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-xl overflow-hidden h-full flex flex-col">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-purple-400" />
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            Hindsight Memory Engine
          </h2>
        </div>
        <span className="text-xs font-mono px-2 py-0.5 rounded bg-purple-950/80 text-purple-300 border border-purple-800/60">
          {memories.length} Memories Recalled
        </span>
      </div>

      <div className="p-5 flex-1 overflow-y-auto space-y-4">
        {memories.length === 0 ? (
          <div className="bg-slate-950/60 border border-slate-800 border-dashed rounded-xl p-8 text-center my-auto">
            <Search className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-slate-300">
              No relevant historical memory found.
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
              Hindsight searched the memory bank but found no past experiences matching this query pattern.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {memories.map((mem, idx) => {
              const score = mem.relevance_score ? Math.round(mem.relevance_score * 100) : 90;
              const isExpanded = expandedId === mem.memory_id;

              return (
                <div
                  key={mem.memory_id || idx}
                  className="bg-slate-950 border border-slate-800 hover:border-purple-600/50 rounded-lg overflow-hidden transition"
                >
                  {/* Memory Header Card */}
                  <div className="p-3.5 flex items-start justify-between gap-3 cursor-pointer" onClick={() => toggleExpand(mem.memory_id)}>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold font-mono text-purple-400 bg-purple-950/90 px-2 py-0.5 rounded border border-purple-800/60">
                          {mem.incident_id || mem.memory_id}
                        </span>
                        <span className="text-xs font-semibold text-slate-200">
                          {mem.service}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-1 font-mono">
                        Cause: {mem.root_cause}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div className="text-right">
                        <span className="text-[10px] uppercase tracking-wider text-slate-500 block font-semibold">
                          Relevance
                        </span>
                        <span className="text-xs font-bold font-mono text-emerald-400">
                          {score}%
                        </span>
                      </div>
                      <button className="p-1 text-slate-400 hover:text-white">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Resolution Snippet */}
                  <div className="px-3.5 pb-3 border-t border-slate-900 pt-2 bg-slate-900/40">
                    <span className="text-[11px] font-semibold text-slate-400 block mb-0.5">
                      Previous Proven Resolution:
                    </span>
                    <p className="text-xs text-emerald-300/90 font-mono bg-emerald-950/30 border border-emerald-900/40 p-2 rounded">
                      {mem.resolution}
                    </p>
                  </div>

                  {/* Expanded details */}
                  {isExpanded && mem.raw_text && (
                    <div className="p-3.5 bg-slate-950 border-t border-slate-800 space-y-2">
                      <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                        <FileCode className="w-3.5 h-3.5 text-purple-400" />
                        Raw Hindsight Memory Record:
                      </span>
                      <pre className="text-[11px] font-mono text-slate-300 bg-slate-900 p-2.5 rounded border border-slate-800 whitespace-pre-wrap">
                        {mem.raw_text}
                      </pre>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
