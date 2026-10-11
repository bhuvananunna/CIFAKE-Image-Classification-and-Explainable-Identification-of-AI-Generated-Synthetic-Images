/**
 * CIFAKE: Image Classification and Explainable Identification of AI-Generated Synthetic Images
 * Master Application Orchestrator — CIFAKE Ultimate UI v2
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HomeHero } from './components/HomeHero';
import { PredictSection } from './components/PredictSection';
import { TrainingLab } from './components/TrainingLab';
import { ModelTheory } from './components/ModelTheory';
import { ExplainabilityView } from './components/ExplainabilityView';
import { ProjectReport } from './components/ProjectReport';
import { TestingSuite } from './components/TestingSuite';
import { HistoryDashboard } from './components/HistoryDashboard';
import { PythonCodeViewer } from './components/PythonCodeViewer';
import { AuthModal } from './components/AuthModal';
import { ConfigModal } from './components/ConfigModal';
import { LiveDemoModal } from './components/LiveDemoModal';

import { User } from './types';
import { getCurrentUser, logoutUser, initDatabase } from './services/db';
import { ShieldCheck, BookOpen, FileCode, CheckCircle2, Cpu, BarChart3, Eye, FileText, Layers, Play } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [isConfigOpen, setIsConfigOpen] = useState<boolean>(false);
  const [isLiveDemoOpen, setIsLiveDemoOpen] = useState<boolean>(false);

  // Sub-tab states for clustered pillars
  const [researchSubTab, setResearchSubTab] = useState<'training' | 'theory'>('training');
  const [insightsSubTab, setInsightsSubTab] = useState<'theory' | 'explainability'>('theory');
  const [projectSubTab, setProjectSubTab] = useState<'report' | 'tests' | 'code'>('report');

  useEffect(() => {
    // Initialize SQLite-compatible database seeds and user session
    initDatabase().then(() => {
      const existing = getCurrentUser();
      if (existing) {
        setCurrentUser(existing);
      }
    });
  }, []);

  // Sync subtabs if a direct alias was called
  const handleNavigate = (tab: string) => {
    if (tab === 'training') {
      setActiveTab('research');
      setResearchSubTab('training');
    } else if (tab === 'models') {
      setActiveTab('insights');
      setInsightsSubTab('theory');
    } else if (tab === 'explainability') {
      setActiveTab('insights');
      setInsightsSubTab('explainability');
    } else if (tab === 'report') {
      setActiveTab('project');
      setProjectSubTab('report');
    } else if (tab === 'tests' || tab === 'testing') {
      setActiveTab('project');
      setProjectSubTab('tests');
    } else if (tab === 'code') {
      setActiveTab('project');
      setProjectSubTab('code');
    } else if (tab === 'predict' || tab === 'analyze') {
      setActiveTab('analyze');
    } else if (tab === 'history' || tab === 'account') {
      setActiveTab('account');
    } else {
      setActiveTab(tab);
    }
  };

  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
    if (activeTab === 'account' || activeTab === 'history') {
      setActiveTab('home');
    }
  };

  const handleAuthSuccess = (user: User) => {
    setCurrentUser(user);
    setIsAuthOpen(false);
  };

  // Determine which master pillar is active
  const isAnalyzeActive = activeTab === 'analyze' || activeTab === 'predict';
  const isResearchActive = activeTab === 'research' || activeTab === 'training';
  const isInsightsActive = activeTab === 'insights' || activeTab === 'models' || activeTab === 'explainability';
  const isProjectActive = activeTab === 'project' || activeTab === 'report' || activeTab === 'tests' || activeTab === 'testing' || activeTab === 'code';
  const isAccountActive = activeTab === 'account' || activeTab === 'history';

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Bar Navigation (Strict 6-Pillar Contract + Live Demo) */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={handleNavigate}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
        onOpenConfig={() => setIsConfigOpen(true)}
        onOpenProfile={() => handleNavigate('account')}
        onOpenLiveDemo={() => setIsLiveDemoOpen(true)}
      />

      {/* Main Viewport Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* 1. HOME PILLAR */}
        {activeTab === 'home' && (
          <HomeHero
            onGetStarted={() => handleNavigate('analyze')}
            onLearnMore={() => handleNavigate('research')}
            onNavigateTab={handleNavigate}
            onOpenAuth={() => setIsAuthOpen(true)}
            onOpenLiveDemo={() => setIsLiveDemoOpen(true)}
            currentUser={currentUser}
          />
        )}

        {/* 2. ANALYZE PILLAR (Primary 5-Stage Console) */}
        {isAnalyzeActive && (
          <PredictSection
            currentUser={currentUser}
            onOpenAuth={() => setIsAuthOpen(true)}
            onGoToHistory={() => handleNavigate('account')}
          />
        )}

        {/* 3. RESEARCH PILLAR */}
        {isResearchActive && (
          <div className="space-y-8">
            {/* Sub-navigation Ribbon */}
            <div className="flex items-center justify-between border-b border-[#1c2638] pb-3">
              <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono">
                <button
                  onClick={() => setResearchSubTab('training')}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                    researchSubTab === 'training' ? 'bg-blue-600 text-white font-semibold shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span>Training Lab & Convergence Monitor</span>
                </button>
                <button
                  onClick={() => setResearchSubTab('theory')}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                    researchSubTab === 'theory' ? 'bg-blue-600 text-white font-semibold shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Model Comparison & Specifications</span>
                </button>
              </div>
              <span className="text-[11px] font-mono text-slate-500 hidden sm:inline">
                Research Workspace · Standard CNN2D vs Modified CNN2D
              </span>
            </div>

            {researchSubTab === 'training' ? <TrainingLab /> : <ModelTheory />}
          </div>
        )}

        {/* 4. INSIGHTS PILLAR */}
        {isInsightsActive && (
          <div className="space-y-8">
            {/* Sub-navigation Ribbon */}
            <div className="flex items-center justify-between border-b border-[#1c2638] pb-3">
              <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono">
                <button
                  onClick={() => setInsightsSubTab('theory')}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                    insightsSubTab === 'theory' ? 'bg-blue-600 text-white font-semibold shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Cpu className="w-3.5 h-3.5" />
                  <span>Model Theory & Interactive Architecture</span>
                </button>
                <button
                  onClick={() => setInsightsSubTab('explainability')}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                    insightsSubTab === 'explainability' ? 'bg-blue-600 text-white font-semibold shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Grad-CAM Mathematical Foundations & XAI</span>
                </button>
              </div>
              <span className="text-[11px] font-mono text-slate-500 hidden sm:inline">
                Theoretical Foundations · Attribution Mathematics
              </span>
            </div>

            {insightsSubTab === 'theory' ? (
              <ModelTheory />
            ) : (
              <ExplainabilityView onGoToPredict={() => handleNavigate('analyze')} />
            )}
          </div>
        )}

        {/* 5. PROJECT PILLAR */}
        {isProjectActive && (
          <div className="space-y-8">
            {/* Sub-navigation Ribbon */}
            <div className="flex items-center justify-between border-b border-[#1c2638] pb-3">
              <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono">
                <button
                  onClick={() => setProjectSubTab('report')}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                    projectSubTab === 'report' ? 'bg-blue-600 text-white font-semibold shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Academic Report (Chapters 1–10)</span>
                </button>
                <button
                  onClick={() => setProjectSubTab('tests')}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                    projectSubTab === 'tests' ? 'bg-blue-600 text-white font-semibold shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Automated QA Suite (12 Tests)</span>
                </button>
                <button
                  onClick={() => setProjectSubTab('code')}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                    projectSubTab === 'code' ? 'bg-blue-600 text-white font-semibold shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <FileCode className="w-3.5 h-3.5" />
                  <span>Python Source Codebase</span>
                </button>
              </div>
              <span className="text-[11px] font-mono text-slate-500 hidden sm:inline">
                Academic Artifacts & Verification Suite
              </span>
            </div>

            {projectSubTab === 'report' && <ProjectReport />}
            {projectSubTab === 'tests' && <TestingSuite />}
            {projectSubTab === 'code' && <PythonCodeViewer />}
          </div>
        )}

        {/* 6. ACCOUNT PILLAR */}
        {isAccountActive && (
          <HistoryDashboard
            currentUser={currentUser}
            onNavigateToUpload={() => handleNavigate('analyze')}
            onOpenAuth={() => setIsAuthOpen(true)}
          />
        )}
      </main>

      {/* Academic Footer */}
      <footer className="bg-[#0b0e17] border-t border-[#1c2638] py-8 text-xs text-slate-400 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div className="space-y-1">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              <span className="font-extrabold text-sm text-white font-sans">
                CIFAKE Research Platform
              </span>
            </div>
            <p className="text-slate-500 text-[11px]">
              Image Classification and Explainable Identification of AI-Generated Synthetic Images
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] font-sans">
            <button
              onClick={() => handleNavigate('analyze')}
              className="hover:text-blue-400 transition-colors cursor-pointer"
            >
              Analyze Console
            </button>
            <span className="text-slate-700">·</span>
            <button
              onClick={() => handleNavigate('research')}
              className="hover:text-blue-400 transition-colors cursor-pointer"
            >
              Training Lab
            </button>
            <span className="text-slate-700">·</span>
            <button
              onClick={() => handleNavigate('insights')}
              className="hover:text-blue-400 transition-colors cursor-pointer"
            >
              Model Theory & Grad-CAM
            </button>
            <span className="text-slate-700">·</span>
            <button
              onClick={() => handleNavigate('report')}
              className="hover:text-blue-400 transition-colors cursor-pointer"
            >
              Dissertation (Ch 1-10)
            </button>
            <span className="text-slate-700">·</span>
            <button
              onClick={() => handleNavigate('tests')}
              className="hover:text-blue-400 transition-colors cursor-pointer"
            >
              12 QA Tests
            </button>
            <span className="text-slate-700">·</span>
            <button
              onClick={() => handleNavigate('code')}
              className="hover:text-blue-400 transition-colors cursor-pointer"
            >
              Python Code
            </button>
            <span className="text-slate-700">·</span>
            <button
              onClick={() => setIsLiveDemoOpen(true)}
              className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors cursor-pointer"
            >
              Live Demo
            </button>
          </div>

          <div className="text-[11px] text-slate-500 font-mono">
            Final-Year CSE Academic Project · 2026
          </div>
        </div>
      </footer>

      {/* Authentication Dialog */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={handleAuthSuccess}
      />

      {/* Configuration Dialog */}
      <ConfigModal
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
      />

      {/* Live Demo Guided Walkthrough Modal */}
      <LiveDemoModal
        isOpen={isLiveDemoOpen}
        onClose={() => setIsLiveDemoOpen(false)}
        onJumpToAnalyze={() => handleNavigate('analyze')}
      />
    </div>
  );
}
