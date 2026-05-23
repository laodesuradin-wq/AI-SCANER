import React, { useEffect, useState } from "react";
import { Database, Search, Clock, FileText, ChevronRight, Download } from "lucide-react";
import { motion } from "motion/react";
import { ExtractedData } from "./Scanner";

interface DBRecord extends ExtractedData {
  id: string;
  timestamp: string;
}

export default function DatabaseView() {
  const [records, setRecords] = useState<DBRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDB = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/database");
        if (res.ok) {
          const data = await res.json();
          // reverse so newest is first
          setRecords(data.reverse());
        }
      } catch (e) {
        console.error("Failed to fetch database", e);
      } finally {
        setLoading(false);
      }
    };
    fetchDB();
  }, []);

  const exportToCSV = () => {
    if (records.length === 0) return;

    // Collect all unique keys from all records to form the CSV header
    const allKeys = new Set<string>();
    records.forEach(record => {
      record.fields?.forEach(field => allKeys.add(field.key));
    });
    
    const headers = ["ID", "Waktu Ekstraksi", "Ringkasan Validasi", "Skor Kepercayaan", ...Array.from(allKeys)];
    
    const csvRows = [];
    csvRows.push(headers.map(h => `"${h}"`).join(","));

    records.forEach(record => {
      const row = [
        record.id,
        new Date(record.timestamp).toLocaleString("id-ID"),
        record.summary || "",
        record.confidence_score?.toString() || ""
      ];

      Array.from(allKeys).forEach(key => {
        const field = record.fields?.find(f => f.key === key);
        row.push(field ? field.value : "");
      });

      // Escape quotes and format row
      const formattedRow = row.map(val => `"${val.replace(/"/g, '""')}"`).join(",");
      csvRows.push(formattedRow);
    });

    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `database_penduduk_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 cursor-default">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-800 flex items-center">
            <Database className="mr-3 text-indigo-600" />
            Database Penduduk Terpadu
          </h2>
          <p className="text-gray-500 mt-1">
            Data hasil otomasi ekstraksi RPA dari dokumen KTP dan administrasi lainnya.
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="flex bg-white border border-slate-200 rounded-lg shadow-sm px-3 py-2">
             <Search size={18} className="text-slate-400 mr-2" />
             <input 
               type="text" 
               placeholder="Cari NIK / Nama..." 
               className="bg-transparent border-none text-sm focus:outline-none w-48 text-slate-700" 
             />
          </div>
          <button 
            onClick={exportToCSV}
            disabled={records.length === 0}
            className="flex items-center bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg shadow-sm transition-colors disabled:opacity-50"
          >
            <Download size={16} className="mr-2" />
            Export CSV
          </button>
        </div>
      </div>

      <div className="bg-white border text-sm border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <ul className="divide-y divide-slate-100">
          {loading ? (
             <div className="p-8 text-center text-slate-400">Memuat database...</div>
          ) : records.length === 0 ? (
             <div className="p-12 text-center text-slate-400 flex flex-col items-center">
                <FileText size={48} className="mb-4 text-slate-300" />
                <p>Database kosong.</p>
                <p className="text-xs mt-1">Mulai scan dokumen melalui menu RPA Scanner untuk mengisi data.</p>
             </div>
          ) : (
            records.map((record, i) => {
              const nameField = record.fields?.find(f => f.key.toLowerCase().includes("nama") || f.key.toLowerCase().includes("name"))?.value || "N/A";
              const nikField = record.fields?.find(f => f.key.toLowerCase().includes("nik") || f.key.toLowerCase().includes("id"))?.value || "N/A";
              
              const date = new Date(record.timestamp);
              
              return (
                <motion.li 
                  key={record.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="p-5 hover:bg-slate-50 transition-colors flex items-center gap-4"
                >
                  <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 font-bold flex-shrink-0">
                    {nameField !== "N/A" ? nameField.substring(0,2).toUpperCase() : "ID"}
                  </div>
                  <div className="flex-1">
                     <div className="font-semibold text-slate-800">{nameField}</div>
                     <div className="text-xs font-mono text-slate-500 mt-0.5 tracking-wide">NIK: {nikField}</div>
                  </div>
                  <div className="hidden md:block flex-1">
                      <div className="text-xs text-slate-500 flex items-center">
                         <span className="inline-block px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] uppercase font-bold mr-2">VERIFIED</span>
                         {record.summary}
                      </div>
                  </div>
                  <div className="text-right text-xs text-slate-400 flex flex-col items-end">
                     <span className="flex items-center"><Clock size={12} className="mr-1" /> {date.toLocaleDateString("id-ID")}</span>
                     <span className="mt-1">{date.toLocaleTimeString("id-ID", {hour: '2-digit', minute:'2-digit'})}</span>
                  </div>
                  <div className="text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">
                     <ChevronRight size={18} />
                  </div>
                </motion.li>
              );
            })
          )}
        </ul>
      </div>
    </div>
  );
}
