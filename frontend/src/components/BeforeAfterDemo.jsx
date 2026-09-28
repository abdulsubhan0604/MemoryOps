import React, { useState } from 'react';
import { Play, ArrowRight, Database, CheckCircle2, ShieldAlert, Sparkles, RefreshCw, Zap } from 'lucide-react';
import { analyzeIncident, retainIncident } from '../services/api';

export default function BeforeAfterDemo() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [beforeAnalysis, setBeforeAnalysis] = useState(null);
  const [afterAnalysis, setAfterAnalysis] = useState(null);
  const [retainedMemory, setRetainedMemory] = useState(null);
  const [error, setError] = useState(null);

  // Step 1: Execute Before Memory
  const runBeforeStep = async () => {
    setLoading(true);
    setError(null);
    try {
      const payload = {
        service: "Payment Gateway Microservice",
        environment: "production",
        description: "Payment Gateway is throwing HTTP 504 Gateway Timeout errors under high load",
        severity: "High"
      };
      const res = await analyzeIncident(payload);
      setBeforeAnalysis(res);
      setStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Retain Resolution in Hindsight
  const runRetainStep = async () => {
    setLoading(true);
    setError(null);
    try {
      const payload = {
        incident_id: "PAY-001",
        service: "Payment Gateway Microservice",
        environment: "production",
        symptoms: "HTTP 504 Gateway Timeout under load",
        root_cause: "Database connection pool exhaustion due to leaked connection handles",
        resolution: "Increased connection pool size from 20 to 100 and applied leak fix in checkout handler",
        impact: "Critical - Payment transaction failure",
        lessons_learned: "Alert on pool connection usage above 80%"
      };
      const res = await retainIncident(payload);
      setRetainedMemory(payload);
      setStep(3);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Execute After Memory
  const runAfterStep = async () => {
    setLoading(true);
    setError(null);
    try {
      const payload = {
        service: "Payment Gateway Microservice",
        environment: "production",
        description: "Payment Gateway Microservice latency spike with recurring HTTP 504 timeouts",
        severity: "High"
      };
      const res = await analyzeIncident(payload);
      setAfterAnalysis(res);
      setStep(4);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetDemo = () => {
    setStep(1);
    setBeforeAnalysis(null);
    setAfterAnalysis(null);
    setRetainedMemory(null);
    setError(null);
  };

  return (
    <div className="space-y-6">
      {/* Demo Intro Card */}
      <div className="bg-gradient-to-r from-purple-950/60 via-slate-900 to-slate-900 border border-purple-800/50 rounded-xl p-6 shadow-xl">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5 mb-1">
              <Sparkles className="w-4 h-4 text-purple-400" />
              Interactive Hindsight Memory Proof
            </span>
            <h2 className="text-xl font-extrabold text-white">
              BEFORE vs. AFTER Hindsight Memory Demonstration
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              Experience the core value of MemoryOps: Observe how the AI provides a generic response when no prior incident memory exists, and contrast it with instant, precise historical resolution retrieval after Hindsight retains the incident!
            </p>
          </div>

          <button
            onClick={resetDemo}
            className="px-3.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reset Demo Workflow
          </button>
        </div>

        {/* Workflow Stepper */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-6">
          <div className={`p-3 rounded-lg border text-xs ${step === 1 ? 'bg-purple-950/80 border-purple-500 text-purple-200' : step > 1 ? 'bg-slate-900 border-slate-700 text-emerald-400' : 'bg-slate-950/50 border-slate-800 text-slate-500'}`}>
            <div className="font-bold mb-1 flex items-center justify-between">
              <span>Step 1: Before Memory</span>
              {step > 1 && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
            </div>
            <p className="text-[11px] opacity-80">Submit HTTP 504 incident without historical memory.</p>
          </div>

          <div className={`p-3 rounded-lg border text-xs ${step === 2 ? 'bg-purple-950/80 border-purple-500 text-purple-200' : step > 2 ? 'bg-slate-900 border-slate-700 text-emerald-400' : 'bg-slate-950/50 border-slate-800 text-slate-500'}`}>
            <div className="font-bold mb-1 flex items-center justify-between">
              <span>Step 2: Hindsight Retain</span>
              {step > 3 && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
            </div>
            <p className="text-[11px] opacity-80">Store PAY-001 resolution experience into Hindsight.</p>
          </div>

          <div className={`p-3 rounded-lg border text-xs ${step === 3 ? 'bg-purple-950/80 border-purple-500 text-purple-200' : step > 3 ? 'bg-slate-900 border-slate-700 text-emerald-400' : 'bg-slate-950/50 border-slate-800 text-slate-500'}`}>
            <div className="font-bold mb-1 flex items-center justify-between">
              <span>Step 3: After Memory</span>
              {step > 3 && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
            </div>
            <p className="text-[11px] opacity-80">Submit similar incident & trigger Hindsight recall.</p>
          </div>

          <div className={`p-3 rounded-lg border text-xs ${step === 4 ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200' : 'bg-slate-950/50 border-slate-800 text-slate-500'}`}>
            <div className="font-bold mb-1 flex items-center justify-between">
              <span>Step 4: Comparison</span>
              {step === 4 && <Zap className="w-3.5 h-3.5 text-emerald-400" />}
            </div>
            <p className="text-[11px] opacity-80">Review Before vs After intelligence contrast!</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-950/80 border border-red-800 p-4 rounded-xl text-xs text-red-200">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Interactive Controls & Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Action Button 1 */}
        <div className={`bg-slate-900 border ${step === 1 ? 'border-purple-500 ring-2 ring-purple-500/20' : 'border-slate-800'} rounded-xl p-5 space-y-4`}>
          <div className="flex items-center gap-2 text-purple-400 font-bold text-sm">
            <span className="w-6 h-6 rounded-full bg-purple-900/60 text-purple-300 text-xs flex items-center justify-center font-mono">1</span>
            WITHOUT MEMORY
          </div>
          <p className="text-xs text-slate-400">
            Submit a new production incident to the AI before any historical memory has been retained in Hindsight.
          </p>
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-xs text-slate-300">
            "Payment Gateway is throwing HTTP 504 Gateway Timeout errors under high load"
          </div>
          <button
            onClick={runBeforeStep}
            disabled={loading || step !== 1}
            className="w-full py-2.5 px-4 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white rounded-lg font-semibold text-xs transition flex items-center justify-center gap-2"
          >
            {loading && step === 1 ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            Run 1: Analyze Without Memory
          </button>
        </div>

        {/* Action Button 2 */}
        <div className={`bg-slate-900 border ${step === 2 ? 'border-indigo-500 ring-2 ring-indigo-500/20' : 'border-slate-800'} rounded-xl p-5 space-y-4`}>
          <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
            <span className="w-6 h-6 rounded-full bg-indigo-900/60 text-indigo-300 text-xs flex items-center justify-center font-mono">2</span>
            HINDSIGHT RETAIN()
          </div>
          <p className="text-xs text-slate-400">
            Commit the resolved incident <code className="text-purple-300">PAY-001</code> (Connection Pool Exhaustion solution) into Hindsight bank.
          </p>
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-xs text-emerald-400">
            Fix: "Increased DB pool size 20-&gt;100 &amp; fixed checkout handle leak"
          </div>
          <button
            onClick={runRetainStep}
            disabled={loading || step !== 2}
            className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-lg font-semibold text-xs transition flex items-center justify-center gap-2"
          >
            {loading && step === 2 ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
            Run 2: Store PAY-001 in Hindsight
          </button>
        </div>

        {/* Action Button 3 */}
        <div className={`bg-slate-900 border ${step === 3 ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-slate-800'} rounded-xl p-5 space-y-4`}>
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
            <span className="w-6 h-6 rounded-full bg-emerald-900/60 text-emerald-300 text-xs flex items-center justify-center font-mono">3</span>
            WITH HINDSIGHT MEMORY
          </div>
          <p className="text-xs text-slate-400">
            Submit a similar incident. Hindsight will recall PAY-001 experience and inform the AI response!
          </p>
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-xs text-slate-300">
            "Payment Gateway Microservice latency spike with recurring HTTP 504 timeouts"
          </div>
          <button
            onClick={runAfterStep}
            disabled={loading || step !== 3}
            className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white rounded-lg font-semibold text-xs transition flex items-center justify-center gap-2"
          >
            {loading && step === 3 ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
            Run 3: Recall Memory &amp; Re-Analyze
          </button>
        </div>

      </div>

      {/* BEFORE vs AFTER Side-by-Side Comparison */}
      {(beforeAnalysis || afterAnalysis) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          
          {/* Before Result Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                <ShieldAlert className="w-4 h-4" />
                BEFORE MEMORY (Generic Response)
              </h3>
              <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono">
                Memory Used: False
              </span>
            </div>

            {beforeAnalysis && (
              <div className="space-y-3 text-xs font-mono">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Historical Evidence:</span>
                  <span className="text-amber-300 bg-amber-950/40 border border-amber-900/50 p-2 rounded block mt-0.5">
                    "{beforeAnalysis.historical_evidence}"
                  </span>
                </div>

                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Root Cause Assessment:</span>
                  <p className="text-slate-200 mt-0.5">{beforeAnalysis.root_cause}</p>
                </div>

                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Recommended Actions:</span>
                  <ul className="list-disc list-inside space-y-1 text-slate-300 mt-1">
                    {beforeAnalysis.recommended_actions.map((act, i) => (
                      <li key={i}>{act}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* After Result Card */}
          <div className="bg-slate-900 border border-emerald-900/80 rounded-xl p-5 space-y-4 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-xl pointer-events-none"></div>

            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                AFTER HINDSIGHT MEMORY (Contextual Response)
              </h3>
              <span className="text-[10px] bg-purple-950 text-purple-300 border border-purple-800 px-2 py-0.5 rounded font-mono font-bold">
                Memory Used: True (PAY-001)
              </span>
            </div>

            {afterAnalysis ? (
              <div className="space-y-3 text-xs font-mono">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Retrieved Memory Evidence:</span>
                  <div className="text-emerald-300 bg-emerald-950/60 border border-emerald-800/60 p-2.5 rounded mt-0.5 font-bold">
                    {afterAnalysis.historical_evidence}
                  </div>
                </div>

                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Proven Root Cause Identified:</span>
                  <p className="text-slate-100 font-semibold mt-0.5">{afterAnalysis.root_cause}</p>
                </div>

                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Immediate Remediation:</span>
                  <ul className="list-disc list-inside space-y-1 text-emerald-200 mt-1">
                    {afterAnalysis.recommended_actions.map((act, i) => (
                      <li key={i}>{act}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="text-center py-10 text-slate-500 text-xs">
                Complete Steps 1 and 2 above, then run Step 3 to view the Hindsight Memory transformation.
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}
