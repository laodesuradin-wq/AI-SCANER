import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { CheckCircle2, Cpu, Database, Server, RefreshCcw } from "lucide-react";
import { ExtractedData } from "./Scanner";

export default function RPASimulator({ data, onReset }: { data: ExtractedData, onReset: () => void }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [typedValues, setTypedValues] = useState<Record<string, string>>({});
  
  const fields = data.fields || [];

  // Simulate fast typing using RPA
  useEffect(() => {
    if (fields.length === 0) return;
    
    let isMounted = true;
    
    const simulateRPA = async () => {
      for (let i = 0; i < fields.length; i++) {
        if (!isMounted) return;
        const field = fields[i];
        
        // Move to field
        setCurrentStep(i);
        await new Promise(r => setTimeout(r, 600)); // Delay between fields jumping
        
        // Fast Type out the value
        let currentText = "";
        for (let j = 0; j < field.value.length; j++) {
           if (!isMounted) return;
           currentText += field.value[j];
           setTypedValues(prev => ({...prev, [field.key]: currentText}));
           await new Promise(r => setTimeout(r, 20)); // Super fast typing
        }
        
        await new Promise(r => setTimeout(r, 400));
      }
      
      // Done
      if (isMounted) {
         try {
           await fetch("/api/database", {
             method: "POST",
             headers: { "Content-Type": "application/json" },
             body: JSON.stringify(data),
           });
         } catch(e) {
           console.error("Failed to save to database", e);
         }
         setCurrentStep(fields.length); // Complete state
      }
    };
    
    simulateRPA();
    
    return () => { isMounted = false; }
  }, [fields]);

  const isComplete = currentStep === fields.length && fields.length > 0;

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-text-main flex items-center">
            <Cpu className="mr-3 text-blue-600" />
            Robotic Process Automation
          </h2>
          <p className="text-text-muted mt-1">Mengotomatisasi input form ke sistem database utama (tanpa campur tangan manusia).</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* RPA Server Visualization */}
        <div className="lg:col-span-1 bg-slate-900 rounded-xl p-6 shadow-xl text-slate-300 font-mono text-xs overflow-hidden relative flex flex-col h-[500px]">
          <div className="flex items-center gap-2 mb-6 border-b border-slate-700 pb-4">
             <Server className="text-emerald-400" size={18} />
             <span className="font-semibold text-white tracking-widest uppercase">RPA Worker #01</span>
             <div className="ml-auto w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          </div>
          
          <div className="flex-1 space-y-3 overflow-y-auto pr-2 custom-scrollbar flex flex-col justify-end">
            <motion.div initial={{opacity:0}} animate={{opacity: 1}} className="text-text-muted">
               &gt; Memulai koneksi SSH tersandi ke 192.168.10.15...
            </motion.div>
            <motion.div initial={{opacity:0}} animate={{opacity: 1}} transition={{delay: 0.5}} className="text-emerald-400">
               &gt; Tersambung ke Database ERP Manufacturing (V 9.12)
            </motion.div>
            <motion.div initial={{opacity:0}} animate={{opacity: 1}} transition={{delay: 1}} className="text-text-muted">
               &gt; Menginisialisasi virtual UI driver... OK.
            </motion.div>
            
            {fields.map((field, idx) => (
              <motion.div 
                key={idx}
                initial={{opacity: 0, x: -10}}
                animate={{
                  opacity: currentStep > idx ? 1 : currentStep === idx ? 1 : 0, 
                  x: 0,
                  color: currentStep > idx ? '#94a3b8' : currentStep === idx ? '#34d399' : '#475569'
                }}
                className="pt-2 border-t border-slate-800 mt-2"
              >
                &gt; Menemukan elemen <code>input[name="{field.key}"]</code><br/>
                &gt; Menulis payload: {typedValues[field.key] ? <span className="text-white bg-slate-800 px-1">{typedValues[field.key]}</span> : '...'}
                {currentStep > idx && <span className="ml-2 text-emerald-500">[OK]</span>}
              </motion.div>
            ))}

            {isComplete && (
               <motion.div initial={{opacity:0}} animate={{opacity: 1}} className="text-amber-400 mt-4 border-t border-slate-700 pt-3">
                 &gt; TRIGGER: SUBMIT_FORM()<br/>
                 &gt; RESPONSE: 201 Created<br/>
                 &gt; Commit transaksi berhasil. Human error dicegah.
               </motion.div>
            )}
          </div>
        </div>

        {/* Target Form (Simulation) */}
        <div className="lg:col-span-2">
           <div className="bg-surface rounded-xl shadow-lg border border-border h-[500px] flex flex-col overflow-hidden">
              <div className="bg-element px-4 py-3 border-b border-border flex items-center gap-4">
                 <div className="flex gap-1.5">
                   <div className="w-3 h-3 rounded-full bg-red-400"></div>
                   <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                   <div className="w-3 h-3 rounded-full bg-green-400"></div>
                 </div>
                 <div className="bg-surface px-3 py-1 rounded text-xs text-text-muted shadow-sm flex-1 truncate flex items-center">
                    <Database size={12} className="mr-2" />
                    internal.erp-logistics.local/master/material/entri-cepat
                 </div>
              </div>

              <div className="p-8 flex-1 overflow-y-auto bg-page relative">
                 {isComplete && (
                   <motion.div 
                     initial={{ scale: 0.8, opacity: 0}}
                     animate={{ scale: 1, opacity: 1}}
                     className="absolute inset-0 bg-surface/80 backdrop-blur-sm flex flex-col items-center justify-center z-10"
                   >
                     <div className="bg-surface p-6 rounded-2xl shadow-xl border border-emerald-100 text-center max-w-sm">
                        <CheckCircle2 size={64} className="text-emerald-500 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-text-main mb-2">Tersimpan ke Database</h3>
                        <p className="text-sm text-text-muted mb-6">Proses otomatisasi sukses. Data material logistik tervalidasi dan diunggah tanpa kesalahan ketik (Zero Human Error).</p>
                        <button 
                          onClick={onReset}
                          className="bg-slate-900 text-white px-6 py-2 rounded-full font-medium flex items-center justify-center w-full hover:bg-slate-800"
                        >
                          <RefreshCcw size={16} className="mr-2" />
                          Proses Dokumen Baru
                        </button>
                     </div>
                   </motion.div>
                 )}

                 <div className="max-w-md mx-auto bg-surface p-6 rounded-lg shadow-sm border border-border">
                    <h3 className="font-semibold text-text-main mb-6 border-b pb-4">Formulir Integrasi Master</h3>
                    
                    <div className="space-y-5">
                       {fields.map((field, idx) => (
                         <div key={idx} className="relative">
                            <label className="block text-xs font-semibold text-text-muted uppercase mb-1.5">{field.key}</label>
                            <div className={`
                               w-full p-2.5 rounded-md border text-sm font-medium
                               ${currentStep === idx ? 'border-blue-400 ring-2 ring-blue-100 bg-blue-50/30' : 'border-border bg-page text-text-main'}
                               transition-all duration-300
                            `}>
                               {typedValues[field.key] || <span className="opacity-0">.</span>}
                               {currentStep === idx && (
                                   <span className="inline-block w-1 h-4 bg-blue-500 ml-1 animate-pulse align-middle"></span>
                               )}
                            </div>
                         </div>
                       ))}
                    </div>
                 </div>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
}
