import React, { useState } from 'react';
import { User } from '../types';
import {
  ShieldCheck,
  Play,
  Settings,
  LogOut,
  User as UserIcon,
  Menu,
  X,
  Sparkles
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: User | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  onOpenConfig: () => void;
  onOpenProfile?: () => void;
  onOpenLiveDemo?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  onOpenAuth,
  onLogout,
  onOpenConfig,
  onOpenProfile,
  onOpenLiveDemo,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // The 6 Primary Architectural Pillars defined in Section 6
  const navItems = [
    { id: 'home', label: 'HOME' },
    { id: 'analyze', label: 'ANALYZE' },
    { id: 'research', label: 'RESEARCH' },
    { id: 'insights', label: 'INSIGHTS' },
    { id: 'project', label: 'PROJECT' },
    { id: 'account', label: 'ACCOUNT' },
  ];

  const handleNavClick = (tabId: string) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
  };

  // Helper to determine active state including aliases
  const isNavActive = (id: string) => {
    if (activeTab === id) return true;
    if (id === 'analyze' && (activeTab === 'predict')) return true;
    if (id === 'research' && (activeTab === 'training')) return true;
    if (id === 'insights' && (activeTab === 'models' || activeTab === 'explainability')) return true;
    if (id === 'project' && (activeTab === 'report' || activeTab === 'testing' || activeTab === 'tests' || activeTab === 'code')) return true;
    if (id === 'account' && (activeTab === 'history')) return true;
    return false;
  };

  return (
    <header className="sticky top-0 z-50 bg-[#07090e]/95 backdrop-blur-md border-b border-[#1c2638] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Zone 1: Single Element Brand Wordmark */}
          <button
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-2.5 cursor-pointer text-left focus:outline-none"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-extrabold text-base tracking-tight text-white font-sans">
                CIFAKE
              </span>
              <span className="text-[11px] font-mono text-cyan-400 font-semibold">
                ULTIMATE UI v2
              </span>
            </div>
          </button>

          {/* Zone 2: Clean 6 Single-Line Text Links (Home, Analyze, Research, Insights, Project, Account) */}
          <nav className="hidden lg:flex items-center gap-1.5 text-xs font-semibold font-mono tracking-wider">
            {navItems.map((item) => {
              const active = isNavActive(item.id);
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                    active
                      ? 'bg-blue-600/20 text-cyan-300 font-bold border border-cyan-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Actions (Live Demo, Settings, Auth/Profile) */}
          <div className="flex items-center gap-2.5">
            {/* Live Demo Guided Walkthrough Button */}
            {onOpenLiveDemo && (
              <button
                onClick={onOpenLiveDemo}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-600/15 hover:bg-cyan-600/25 text-cyan-300 border border-cyan-500/40 transition-colors cursor-pointer shadow-sm"
                title="Launch guided viva & presentation demonstration"
              >
                <Play className="w-3.5 h-3.5 fill-cyan-400" />
                <span className="font-mono">LIVE DEMO</span>
              </button>
            )}

            <button
              onClick={onOpenConfig}
              title="Project Hyperparameters & Settings"
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Configuration Settings"
            >
              <Settings className="w-4 h-4" />
            </button>

            {currentUser ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={onOpenProfile || (() => handleNavClick('account'))}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700/80 hover:border-slate-600 transition-colors text-xs cursor-pointer"
                  title="View User Profile & History"
                >
                  <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-[10px] font-bold text-white">
                    {currentUser.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden sm:inline font-medium text-slate-200 truncate max-w-[100px]">
                    {currentUser.name}
                  </span>
                </button>

                <button
                  onClick={onLogout}
                  title="Sign Out"
                  className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
                  aria-label="Log Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="px-3.5 py-1.5 rounded-lg text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white transition-colors cursor-pointer whitespace-nowrap shadow-sm shadow-blue-600/20"
              >
                Sign In
              </button>
            )}

            {/* Mobile menu hamburger toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none"
              aria-label="Toggle Mobile Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-slate-800 space-y-1.5 animate-in slide-in-from-top-2 duration-150 font-mono">
            {navItems.map((item) => {
              const active = isNavActive(item.id);
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    active
                      ? 'bg-blue-600/20 text-cyan-300 border border-cyan-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <span>{item.label}</span>
                </button>
              );
            })}

            {onOpenLiveDemo && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenLiveDemo();
                }}
                className="w-full flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold text-cyan-400 bg-cyan-950/40 border border-cyan-500/30"
              >
                <Play className="w-3.5 h-3.5 fill-cyan-400" />
                <span>Launch Guided Live Demo</span>
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
