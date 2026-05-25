import React, { useState, useEffect } from "react";
import DocumentScanner from "./components/DocumentScanner";
import DatabaseView from "./components/DatabaseView";
import DashboardView from "./components/DashboardView";
import { ScanLine, Sun, Moon, Database, LayoutDashboard } from "lucide-react";

export default function App() {
  const [isDark, setIsDark] = useState(false);
  const [activeTab, setActiveTab] = useState<'scanner' | 'database' | 'dashboard'>('scanner');

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  return (
    <div className="min-h-screen bg-page font-sans flex flex-col text-text-main transition-colors duration-200">
      {/* Top Header */}
      <header className="bg-surface border-b border-border px-4 md:px-8 py-4 flex justify-between items-center z-10 shadow-sm sticky top-0">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center mr-3 text-white shadow-lg shadow-indigo-500/20">
            <ScanLine size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold leading-tight">Siak Mobile</h1>
            <p className="text-xs text-text-muted">Menu: Scan Kartu Keluarga (KK)</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Tabs */}
          <div className="hidden md:flex items-center bg-page border border-border rounded-lg p-1 mr-4">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center ${activeTab === 'dashboard' ? 'bg-surface text-indigo-600 shadow-sm' : 'text-text-muted hover:text-text-main'}`}
            >
              <LayoutDashboard size={16} className="mr-2" /> Dashboard
            </button>
            <button
              onClick={() => setActiveTab('scanner')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center ${activeTab === 'scanner' ? 'bg-surface text-indigo-600 shadow-sm' : 'text-text-muted hover:text-text-main'}`}
            >
              <ScanLine size={16} className="mr-2" /> Scanner
            </button>
            <button
              onClick={() => setActiveTab('database')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center ${activeTab === 'database' ? 'bg-surface text-indigo-600 shadow-sm' : 'text-text-muted hover:text-text-main'}`}
            >
              <Database size={16} className="mr-2" /> Database Warga
            </button>
          </div>

          <button 
            onClick={() => setIsDark(!isDark)}
            className="text-text-muted hover:text-text-main transition-colors p-2.5 rounded-lg bg-page border border-border outline-none focus:ring-2 focus:ring-indigo-500"
            title="Toggle Theme"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </header>

      {/* Mobile Tabs */}
      <div className="md:hidden flex items-center bg-surface border-b border-border p-2 space-x-2 overflow-x-auto">
         <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex shrink-0 min-w-[100px] justify-center py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'dashboard' ? 'bg-page text-indigo-600 shadow-sm border border-border' : 'text-text-muted'}`}
          >
            <LayoutDashboard size={16} className="mr-2" /> <span className="hidden sm:inline">Dashboard</span>
          </button>
         <button
            onClick={() => setActiveTab('scanner')}
            className={`flex shrink-0 min-w-[100px] justify-center py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'scanner' ? 'bg-page text-indigo-600 shadow-sm border border-border' : 'text-text-muted'}`}
          >
            <ScanLine size={16} className="mr-2" /> <span className="hidden sm:inline">Scanner</span>
          </button>
          <button
            onClick={() => setActiveTab('database')}
            className={`flex shrink-0 min-w-[100px] justify-center py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'database' ? 'bg-page text-indigo-600 shadow-sm border border-border' : 'text-text-muted'}`}
          >
            <Database size={16} className="mr-2" /> <span className="hidden sm:inline">Database Warga</span>
          </button>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden bg-page p-4 md:p-8">
        <div className="max-w-6xl mx-auto w-full flex-1 flex flex-col">
          {activeTab === 'dashboard' && <DashboardView />}
          {activeTab === 'scanner' && <DocumentScanner />}
          {activeTab === 'database' && <DatabaseView />}
        </div>
      </main>
    </div>
  );
}
