import React, { useState } from "react";
import Scanner, { ExtractedData } from "./components/Scanner";
import RPASimulator from "./components/RPASimulator";
import DatabaseView from "./components/DatabaseView";
import DashboardView from "./components/DashboardView";
import IntegrationWorkflow from "./components/IntegrationWorkflow";
import { LayoutDashboard, Users, ScanLine, Bolt, Settings } from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "scanner" | "database" | "workflow">("scanner");
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);

  const handleReset = () => {
    setExtractedData(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col z-20 sticky top-0 h-screen hidden md:flex">
         <div className="p-6 border-b border-slate-800">
            <h1 className="text-xl font-bold text-white flex items-center cursor-pointer" onClick={() => setActiveTab("scanner")}>
              <span className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center mr-3 text-slate-900 font-bold">S</span>
              Sandra AI
            </h1>
            <p className="text-xs text-slate-500 mt-1">Sistem Administrasi Siak Mobile</p>
         </div>
         <nav className="flex-1 py-4 px-3">
            <ul className="space-y-1">
               <li>
                 <a 
                   href="#" 
                   onClick={(e) => { e.preventDefault(); setActiveTab("dashboard"); }}
                   className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${activeTab === 'dashboard' ? 'text-emerald-400 bg-slate-800/80' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                 >
                   <LayoutDashboard size={18} className="mr-3" /> Dashboard
                 </a>
               </li>
               <li>
                 <a 
                   href="#" 
                   onClick={(e) => { e.preventDefault(); setActiveTab("scanner"); }}
                   className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${activeTab === 'scanner' ? 'text-emerald-400 bg-slate-800/80' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                 >
                   <ScanLine size={18} className="mr-3" /> Vision Scanner & RPA
                 </a>
               </li>
               <li>
                 <a 
                   href="#" 
                   onClick={(e) => { e.preventDefault(); setActiveTab("database"); }}
                   className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${activeTab === 'database' ? 'text-emerald-400 bg-slate-800/80' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                 >
                   <Users size={18} className="mr-3" /> Database Penduduk
                 </a>
               </li>
               <li>
                 <a 
                   href="#" 
                   onClick={(e) => { e.preventDefault(); setActiveTab("workflow"); }}
                   className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${activeTab === 'workflow' ? 'text-emerald-400 bg-slate-800/80' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                 >
                   <Bolt size={18} className="mr-3" /> Auto-Workflow
                 </a>
               </li>
            </ul>
         </nav>
         <div className="p-4 border-t border-slate-800">
             <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white">SA</div>
                <div className="ml-3">
                   <p className="text-sm font-medium text-white">Sandra</p>
                   <p className="text-xs text-slate-400">Admin Siak AI</p>
                </div>
             </div>
         </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 px-8 py-5 flex justify-between items-center z-10 shadow-sm sticky top-0">
           <div>
             <h2 className="text-lg font-semibold text-slate-800">Ruang Kerja Otomasi</h2>
             <div className="flex items-center mt-1 space-x-2">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">AI Vision Engine: Online</span>
             </div>
           </div>
           
           <div className="flex items-center space-x-4">
              <button className="text-slate-400 hover:text-slate-600 transition-colors">
                <Settings size={20} />
              </button>
           </div>
        </header>
        
        {/* Dynamic Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
           {activeTab === "database" ? (
              <DatabaseView />
           ) : activeTab === "dashboard" ? (
              <DashboardView />
           ) : activeTab === "workflow" ? (
              <IntegrationWorkflow />
           ) : activeTab === "scanner" ? (
             !extractedData ? (
                <Scanner onComplete={(data) => setExtractedData(data)} />
             ) : (
                <RPASimulator data={extractedData} onReset={handleReset} />
             )
           ) : null}
        </div>
      </main>
    </div>
  );
}
