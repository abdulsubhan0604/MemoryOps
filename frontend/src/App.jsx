import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import IncidentInput from './components/IncidentInput';
import AnalysisPanel from './components/AnalysisPanel';
import MemoryPanel from './components/MemoryPanel';
import ResolutionPanel from './components/ResolutionPanel';
import BeforeAfterDemo from './components/BeforeAfterDemo';
import { getHealthStatus, analyzeIncident, retainIncident, getMemories, seedDemoData } from './services/api';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [health, setHealth] = useState(null);
  const [loadingHealth, setLoadingHealth] = useState(false);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [loadingRetain, setLoadingRetain] = useState(false);
  const [seedingDemo, setSeedingDemo] = useState(false);

  const [currentIncident, setCurrentIncident] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [recalledMemories, setRecalledMemories] = useState([]);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);

  const fetchHealth = async () => {
    setLoadingHealth(true);
    try {
      const data = await getHealthStatus();
      setHealth(data);
    } catch (err) {
      console.warn("Backend health check failed:", err.message);
    } finally {
      setLoadingHealth(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  const handleAnalyze = async (incidentPayload) => {
    setLoadingAnalysis(true);
    setError(null);
    setCurrentIncident(incidentPayload);
    try {
      const result = await analyzeIncident(incidentPayload);
      setAnalysis(result);
      setRecalledMemories(result.historical_memories || []);
    } catch (err) {
      setError(err.message || "Failed to analyze incident.");
    } finally {
      setLoadingAnalysis(false);
    }
  };

  const handleRetain = async (resolutionPayload) => {
    setLoadingRetain(true);
    setError(null);
    try {
      const result = await retainIncident(resolutionPayload);
      setNotification(`Successfully committed ${result.incident_id || 'resolution'} to Hindsight memory!`);
      setTimeout(() => setNotification(null), 5000);
      fetchHealth(); // refresh local memory counter
      return result;
    } catch (err) {
      setError(err.message || "Failed to retain resolution.");
      throw err;
    } finally {
      setLoadingRetain(false);
    }
  };

  const handleSeedDemo = async () => {
    setSeedingDemo(true);
    setError(null);
    try {
      const res = await seedDemoData();
      setNotification(`Seeded ${res.seeded?.length || 5} realistic incident memories into Hindsight!`);
      setTimeout(() => setNotification(null), 5000);
      fetchHealth();
    } catch (err) {
      setError(err.message || "Failed to seed demo memories.");
    } finally {
      setSeedingDemo(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-purple-500 selection:text-white">
      {/* Header Bar */}
      <Header
        health={health}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onRefreshHealth={fetchHealth}
        loading={loadingHealth}
      />

      {/* Global Banners */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-4 space-y-2">
        {error && (
          <div className="bg-red-950/80 border border-red-800/80 p-3.5 rounded-xl flex items-center justify-between text-xs text-red-200 shadow-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-white font-bold">
              ✕
            </button>
          </div>
        )}

        {notification && (
          <div className="bg-emerald-950/80 border border-emerald-800/80 p-3.5 rounded-xl flex items-center justify-between text-xs text-emerald-200 shadow-lg animate-fadeIn">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{notification}</span>
            </div>
            <button onClick={() => setNotification(null)} className="text-emerald-400 hover:text-white font-bold">
              ✕
            </button>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1">
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            
            {/* Top Row: Incident Report Form */}
            <IncidentInput
              onAnalyze={handleAnalyze}
              loading={loadingAnalysis}
              onSeedDemo={handleSeedDemo}
              seeding={seedingDemo}
            />

            {/* Middle Row: AI Analysis Panel & Hindsight Memory Panel */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <AnalysisPanel analysis={analysis} />
              </div>

              <div className="lg:col-span-1">
                <MemoryPanel
                  memories={recalledMemories}
                  memoryUsed={analysis?.memory_used}
                />
              </div>
            </div>

            {/* Bottom Row: Retain Resolution Form */}
            <ResolutionPanel
              currentIncident={currentIncident}
              analysis={analysis}
              onRetain={handleRetain}
              loading={loadingRetain}
            />

          </div>
        )}

        {activeTab === 'demo' && (
          <BeforeAfterDemo />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 text-center text-xs text-slate-600">
        MemoryOps AI Incident Response Agent • Powered by Hindsight Memory System &amp; Groq LLM
      </footer>
    </div>
  );
}
