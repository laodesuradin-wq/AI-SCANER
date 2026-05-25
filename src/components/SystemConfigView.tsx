import React from 'react';
import { Settings, Settings2, ShieldCheck, Database, Sliders } from 'lucide-react';

export default function SystemConfigView() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-text-main">Konfigurasi Sistem</h2>
          <p className="text-text-muted mt-1 text-sm">Pengaturan untuk Tugas Admin Logistik</p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-2">
          <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm">
            Simpan Perubahan
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-surface border border-border rounded-xl p-6 shadow-sm">
          <div className="flex items-center mb-4">
            <Settings2 className="text-emerald-500 mr-3" size={24} />
            <h3 className="text-lg font-semibold text-text-main">Aturan Validasi Logistik</h3>
          </div>
          <p className="text-sm text-text-muted mb-4">Atur batas skor kepercayaan untuk RPA Simulator dan batas minimum pembacaan dokumen penerimaan barang.</p>
          <div className="space-y-4 text-sm text-text-main">
             <div className="flex justify-between items-center bg-page p-3 rounded-lg border border-border">
               <span>Batas Minimum Skor OCR (%)</span>
               <input type="number" defaultValue="80" className="w-16 bg-surface border border-border rounded p-1 text-center font-mono text-emerald-500" />
             </div>
             <div className="flex justify-between items-center bg-page p-3 rounded-lg border border-border">
               <span>Otomatis Masuk Database jika Valid</span>
               <input type="checkbox" defaultChecked className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded" />
             </div>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-xl p-6 shadow-sm">
          <div className="flex items-center mb-4">
            <ShieldCheck className="text-indigo-500 mr-3" size={24} />
            <h3 className="text-lg font-semibold text-text-main">Akses & Modul Logistik</h3>
          </div>
          <p className="text-sm text-text-muted mb-4">Pengaturan terkait alur integrasi dari modul Scanner ke sistem pusat.</p>
          <div className="space-y-4 text-sm text-text-main">
             <div className="flex justify-between items-center bg-page p-3 rounded-lg border border-border">
               <span>Sinkronisasi Auto ke ERP Logistik</span>
               <input type="checkbox" defaultChecked className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded" />
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
