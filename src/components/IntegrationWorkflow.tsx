import React from 'react';
import { Network, Database, Server, ServerCrash, Share2, ServerCog, UploadCloud, AppWindow } from 'lucide-react';

export default function IntegrationWorkflow() {
  return (
    <div className="w-full max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
         <div className="max-w-2xl">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-800 flex items-center">
              <Network className="mr-3 text-indigo-600" />
              Data Integration Platform
            </h2>
            <p className="text-slate-500 mt-2 text-sm">
              Kelola koneksi antar sistem, endpoint API, dan sinkronisasi database eksternal untuk otomasi RPA (Robotic Process Automation). 
            </p>
         </div>
         <button className="bg-slate-900 text-white font-medium px-4 py-2 rounded-lg text-sm hover:bg-slate-800 transition-colors">
            + Tambah Konektor
         </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Connection Blocks */}
        <div className="space-y-4">
           <h3 className="font-semibold text-slate-700 text-sm uppercase tracking-wider mb-2">Endpoint Terhubung</h3>
           
           <div className="bg-white border text-sm border-slate-200 rounded-xl p-5 shadow-sm relative overflow-hidden group hover:border-emerald-300 transition-colors">
              <div className="absolute top-0 right-0 p-4">
                 <span className="flex items-center text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span> Aktif
                 </span>
              </div>
              <div className="flex items-start">
                 <div className="bg-slate-100 p-3 rounded-xl text-slate-600 mr-4 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                    <Database size={24} />
                 </div>
                 <div>
                    <h4 className="font-semibold text-slate-800 text-base">Siak Master DB (PostgreSQL)</h4>
                    <p className="text-slate-500 mt-1 text-xs">Sinkronisasi data langsung via secure tunnel (SSH). Target utama RPA untuk entri data penduduk.</p>
                    <div className="mt-4 font-mono text-xs text-slate-400 bg-slate-50 px-2 py-1 rounded inline-block">192.168.10.15:5432</div>
                 </div>
              </div>
           </div>

           <div className="bg-white border text-sm border-slate-200 rounded-xl p-5 shadow-sm relative overflow-hidden group hover:border-emerald-300 transition-colors">
              <div className="absolute top-0 right-0 p-4">
                 <span className="flex items-center text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span> Aktif
                 </span>
              </div>
              <div className="flex items-start">
                 <div className="bg-slate-100 p-3 rounded-xl text-slate-600 mr-4 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                    <AppWindow size={24} />
                 </div>
                 <div>
                    <h4 className="font-semibold text-slate-800 text-base">Sistem Arsip Nasional (API)</h4>
                    <p className="text-slate-500 mt-1 text-xs">REST API untuk validasi silang KTP (NIK) secara real-time. Membantu AI dalam verifikasi format.</p>
                    <div className="mt-4 font-mono text-xs text-slate-400 bg-slate-50 px-2 py-1 rounded inline-block">https://api.arsip.go.id/v1/</div>
                 </div>
              </div>
           </div>

           <div className="bg-white border text-sm border-slate-200 rounded-xl p-5 shadow-sm relative overflow-hidden group opacity-75 grayscale hover:grayscale-0 transition-all">
              <div className="absolute top-0 right-0 p-4">
                 <span className="flex items-center text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5"></span> Standby
                 </span>
              </div>
              <div className="flex items-start">
                 <div className="bg-slate-100 p-3 rounded-xl text-slate-600 mr-4 group-hover:bg-teal-50 group-hover:text-teal-600 transition-colors">
                    <UploadCloud size={24} />
                 </div>
                 <div>
                    <h4 className="font-semibold text-slate-800 text-base">Cloud Storage Backup S3</h4>
                    <p className="text-slate-500 mt-1 text-xs">Penyimpanan cold backup untuk gambar asli KTP yang sudah terbaca AI.</p>
                    <div className="mt-4 font-mono text-xs text-slate-400 bg-slate-50 px-2 py-1 rounded inline-block">s3://siak-archive-backup</div>
                 </div>
              </div>
           </div>
        </div>

        {/* Visual Mapping */}
        <div>
           <h3 className="font-semibold text-slate-700 text-sm uppercase tracking-wider mb-2">Topologi Aliran Data (Visual)</h3>
           <div className="bg-slate-900 rounded-xl p-6 h-[500px] border border-slate-800 shadow-lg relative flex flex-col items-center justify-center overflow-hidden">
               {/* Background Grid */}
               <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#475569 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
               
               {/* Architecture Nodes */}
               <div className="z-10 flex flex-col items-center space-y-12 w-full">
                  
                  {/* Scanner App */}
                  <div className="bg-slate-800 border border-slate-700 px-6 py-3 rounded-lg flex items-center shadow-lg w-64 justify-center">
                     <AppWindow className="text-blue-400 mr-3" size={20} />
                     <span className="text-white font-medium text-sm">Frontend/Mobile App</span>
                  </div>

                  <div className="h-10 w-0.5 bg-gradient-to-b from-blue-500 to-emerald-500 relative">
                     <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center animate-bounce">
                        <div className="w-2 h-2 rounded-full bg-white shadow-lg blur-[1px]"></div>
                     </div>
                  </div>

                  {/* AI Vision Core */}
                  <div className="bg-gradient-to-r from-emerald-900 to-teal-900 border border-emerald-700 px-6 py-4 rounded-xl flex items-center shadow-[0_0_15px_rgba(16,185,129,0.2)] w-72 justify-center relative">
                     <div className="absolute -right-2 top-2 w-3 h-3 bg-emerald-400 rounded-full animate-ping"></div>
                     <ServerCog className="text-emerald-400 mr-3" size={28} />
                     <div className="text-left">
                       <span className="text-white font-bold block text-sm">AI Vision Extraction Engine</span>
                       <span className="text-emerald-300 text-xs">(Gemini LLM / OCR)</span>
                     </div>
                  </div>

                  <div className="flex w-full px-12 justify-center gap-16 relative pt-4">
                     {/* Left Branch */}
                     <svg className="absolute top-0 left-1/2 w-32 h-16 transform -translate-x-full" preserveAspectRatio="none">
                        <path d="M 128 0 Q 32 0 32 64" fill="none" stroke="#64748b" strokeWidth="2" strokeDasharray="4 4" className="animate-pulse" />
                     </svg>
                     
                     {/* Right Branch */}
                     <svg className="absolute top-0 left-1/2 w-32 h-16" preserveAspectRatio="none">
                        <path d="M 0 0 Q 96 0 96 64" fill="none" stroke="#64748b" strokeWidth="2" strokeDasharray="4 4" className="animate-pulse" />
                     </svg>
                  </div>
                  
                  <div className="flex w-full px-4 justify-center gap-8 z-10 pt-4">
                     <div className="bg-slate-800 border border-slate-700 px-4 py-3 rounded-lg flex flex-col items-center shadow-lg w-40 text-center">
                       <Share2 className="text-indigo-400 mb-2" size={20} />
                       <span className="text-white font-medium text-xs">RPA Worker (Node)</span>
                     </div>
                     <div className="bg-slate-800 border border-slate-700 px-4 py-3 rounded-lg flex flex-col items-center shadow-lg w-40 text-center">
                       <Server className="text-amber-400 mb-2" size={20} />
                       <span className="text-white font-medium text-xs">Auth & API Gateway</span>
                     </div>
                  </div>

               </div>
           </div>
        </div>

      </div>
    </div>
  );
}
