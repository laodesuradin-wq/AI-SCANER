import React, { useState } from 'react';
import { Users, Mail, Phone, Briefcase, ChevronRight, Shield, Search, Filter, UserPlus, FileText, BadgeCheck, BarChart4 } from 'lucide-react';
import { motion } from 'motion/react';

let employees = [
  { id: 1, name: "Sandra Dewi", role: "Admin Logistik", email: "sandra.admin@erp.local", phone: "0812-3456-7890", status: "Active" },
  { id: 2, name: "Budi Santoso", role: "Data Entry Operator", email: "budi.op@erp.local", phone: "0812-9876-5432", status: "Active" },
  { id: 3, name: "Rina Marlina", role: "Data Validator", email: "rina.val@erp.local", phone: "0813-1122-3344", status: "Offline" },
  { id: 4, name: "Agus Pratama", role: "System Administrator", email: "agus.sysadm@erp.local", phone: "0819-8877-6655", status: "Active" },
];

interface EmployeeViewProps {
  activeView?: "list" | "add" | "roles" | "reports";
}

export default function EmployeeView({ activeView: initialView = "list" }: EmployeeViewProps) {
  const [activeView, setActiveView] = useState<"list" | "add" | "roles" | "reports">(initialView);

  React.useEffect(() => {
    setActiveView(initialView);
  }, [initialView]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "Admin Logistik"
  });
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSaveEmployee = () => {
    if (!formData.name || !formData.email) return;

    const newEmployee = {
      id: employees.length + 1,
      name: formData.name,
      email: formData.email,
      phone: formData.phone || "-",
      role: formData.role,
      status: "Active"
    };

    employees.push(newEmployee);
    setShowSuccess(true);
    setFormData({ name: "", email: "", phone: "", role: "Admin Logistik" });
    
    setTimeout(() => {
      setShowSuccess(false);
      setActiveView("list");
    }, 3000);
  };

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          emp.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "All" || emp.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const TabMenu = () => (
    <div className="flex border-b border-border w-full overflow-x-auto mb-6">
      <button 
        onClick={() => setActiveView("list")}
        className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${activeView === 'list' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-text-muted hover:text-text-main'}`}
      >
        <Users size={16} className="inline mr-2" /> Data Karyawan
      </button>
      <button 
        onClick={() => setActiveView("add")}
        className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${activeView === 'add' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-text-muted hover:text-text-main'}`}
      >
        <UserPlus size={16} className="inline mr-2" /> Tambah Karyawan
      </button>
      <button 
        onClick={() => setActiveView("roles")}
        className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${activeView === 'roles' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-text-muted hover:text-text-main'}`}
      >
        <Shield size={16} className="inline mr-2" /> Hak Akses & Peran
      </button>
      <button 
        onClick={() => setActiveView("reports")}
        className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${activeView === 'reports' ? 'border-amber-500 text-amber-600' : 'border-transparent text-text-muted hover:text-text-main'}`}
      >
        <BarChart4 size={16} className="inline mr-2" /> Laporan Kinerja
      </button>
    </div>
  );

  return (
    <div className="w-full max-w-5xl mx-auto">
      <TabMenu />

      {activeView === "add" && (
        <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-text-main flex items-center">
            <UserPlus className="mr-3 text-emerald-600" />
            Tambah Karyawan Baru
          </h2>
          <p className="text-text-muted mt-1 text-sm">Masukkan data profil untuk karyawan atau staf baru.</p>
        </div>
        <div className="bg-surface border border-border rounded-xl p-6 shadow-sm">
          {showSuccess && (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center text-emerald-800 text-sm">
              <BadgeCheck className="mr-2 text-emerald-600" size={18} />
              Data karyawan baru berhasil ditambahkan!
            </div>
          )}
          <form className="space-y-4">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                   <label className="text-sm font-medium text-text-main">Nama Lengkap</label>
                   <input 
                     type="text" 
                     value={formData.name}
                     onChange={(e) => setFormData({...formData, name: e.target.value})}
                     className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" 
                     placeholder="Contoh: Bima Sakti" 
                     required
                   />
                </div>
                <div className="space-y-1.5">
                   <label className="text-sm font-medium text-text-main">Email Pegawai</label>
                   <input 
                     type="email" 
                     value={formData.email}
                     onChange={(e) => setFormData({...formData, email: e.target.value})}
                     className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" 
                     placeholder="bima@erp.local" 
                     required
                   />
                </div>
                <div className="space-y-1.5">
                   <label className="text-sm font-medium text-text-main">No. Telepon / WhatsApp</label>
                   <input 
                     type="tel" 
                     value={formData.phone}
                     onChange={(e) => setFormData({...formData, phone: e.target.value})}
                     className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" 
                     placeholder="0812..." 
                   />
                </div>
                <div className="space-y-1.5">
                   <label className="text-sm font-medium text-text-main">Peran (Role)</label>
                   <select 
                     value={formData.role}
                     onChange={(e) => setFormData({...formData, role: e.target.value})}
                     className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-surface"
                   >
                      <option>Admin Logistik</option>
                      <option>Data Entry Operator</option>
                      <option>Data Validator</option>
                   </select>
                </div>
             </div>
             <div className="pt-4 flex justify-end">
               <button 
                 type="button" 
                 onClick={handleSaveEmployee}
                 className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-lg font-medium shadow-sm transition-colors text-sm"
               >
                 Simpan Data Karyawan
               </button>
             </div>
          </form>
        </div>
        </div>
      )}
      {activeView === "roles" && (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-text-main flex items-center">
            <Shield className="mr-3 text-indigo-600" />
            Hak Akses & Peran
          </h2>
          <p className="text-text-muted mt-1 text-sm">Kelola izin dan modul apa saja yang dapat diakses oleh setiap peran.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="bg-surface border border-border rounded-xl p-5 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div>
                   <h3 className="font-semibold text-text-main">Admin Logistik</h3>
                   <span className="text-xs text-text-muted">Akses Penuh (Full Access)</span>
                </div>
                <BadgeCheck className="text-indigo-600" size={24} />
              </div>
              <ul className="text-sm space-y-2 text-slate-600">
                <li className="flex items-center"><ChevronRight size={14} className="mr-1 text-indigo-400" /> Manajemen Karyawan</li>
                <li className="flex items-center"><ChevronRight size={14} className="mr-1 text-indigo-400" /> Validasi Database Logistik</li>
                <li className="flex items-center"><ChevronRight size={14} className="mr-1 text-indigo-400" /> RPA Simulator Master</li>
                <li className="flex items-center"><ChevronRight size={14} className="mr-1 text-indigo-400" /> Konfigurasi Sistem</li>
              </ul>
           </div>
           <div className="bg-surface border border-border rounded-xl p-5 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div>
                   <h3 className="font-semibold text-text-main">Data Entry Operator</h3>
                   <span className="text-xs text-text-muted">Akses Terbatas (Limited Access)</span>
                </div>
                <Users className="text-text-muted" size={24} />
              </div>
              <ul className="text-sm space-y-2 text-slate-600">
                <li className="flex items-center"><ChevronRight size={14} className="mr-1 text-emerald-400" /> Vision Scanner</li>
                <li className="flex items-center"><ChevronRight size={14} className="mr-1 text-emerald-400" /> Input Data Manual</li>
                <li className="flex items-center text-text-muted line-through"><ChevronRight size={14} className="mr-1 text-slate-300" /> Validasi / Hapus Data</li>
                <li className="flex items-center text-text-muted line-through"><ChevronRight size={14} className="mr-1 text-slate-300" /> Manajemen Karyawan</li>
              </ul>
           </div>
        </div>
      </div>
      )}
      {activeView === "reports" && (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-text-main flex items-center">
            <BarChart4 className="mr-3 text-amber-600" />
            Laporan Kinerja Karyawan
          </h2>
          <p className="text-text-muted mt-1 text-sm">Pantau statistik dokumen yang diproses dan aktivitas harian staf.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
           <div className="bg-surface rounded-xl shadow-sm border border-border p-5">
             <div className="text-text-muted text-xs font-medium uppercase tracking-wider mb-1">Total Dokumen (Hari ini)</div>
             <div className="text-3xl font-bold text-text-main">142</div>
             <div className="text-xs text-emerald-600 font-medium mt-2 flex items-center">
               Meningkat 12% dari kemarin
             </div>
           </div>
           <div className="bg-surface rounded-xl shadow-sm border border-border p-5">
             <div className="text-text-muted text-xs font-medium uppercase tracking-wider mb-1">Rata-rata Akurasi</div>
             <div className="text-3xl font-bold text-text-main">98.5%</div>
             <div className="text-xs text-text-muted font-medium mt-2 flex items-center">
               Konsisten bulan ini
             </div>
           </div>
           <div className="bg-surface rounded-xl shadow-sm border border-border p-5">
             <div className="text-text-muted text-xs font-medium uppercase tracking-wider mb-1">Staf Teraktif</div>
             <div className="text-xl font-bold text-text-main mt-1">Budi Santoso</div>
             <div className="text-xs text-text-muted font-medium mt-2">
               84 Dokumen diproses
             </div>
           </div>
        </div>
        
        <div className="bg-surface border text-sm border-border rounded-xl overflow-hidden shadow-sm mt-8">
           <div className="px-5 py-4 border-b border-border flex justify-between items-center bg-page">
             <h3 className="font-semibold text-text-main">Log Aktivitas Terbaru</h3>
           </div>
           <ul className="divide-y divide-slate-100">
             <li className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-element flex items-center justify-center text-slate-600 font-bold text-xs mr-3">BS</div>
                  <div>
                    <span className="font-medium text-text-main">Budi Santoso</span> mengekstrak <span className="text-indigo-600 font-medium">Label Packing - Batch 327...</span>
                  </div>
                </div>
                <div className="text-xs text-text-muted font-mono">10:42 WIB</div>
             </li>
             <li className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-element flex items-center justify-center text-slate-600 font-bold text-xs mr-3">RM</div>
                  <div>
                    <span className="font-medium text-text-main">Rina Marlina</span> memvalidasi 15 data logistik.
                  </div>
                </div>
                <div className="text-xs text-text-muted font-mono">09:15 WIB</div>
             </li>
           </ul>
        </div>
        </div>
      )}
      {activeView === "list" && (
      <div className="space-y-6">
      <div className="flex items-center justify-between">
         <div>
            <h2 className="text-2xl font-semibold tracking-tight text-text-main flex items-center">
              <Shield className="mr-3 text-indigo-600" />
              Tabel Data Karyawan
            </h2>
            <p className="text-text-muted mt-1 text-sm">Kelola akses dan profil karyawan logistik.</p>
         </div>
         <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors shadow-sm">
            + Tambah Karyawan
         </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
          <input 
            type="text" 
            placeholder="Cari berdasarkan nama atau email..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-surface border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
        </div>
        <div className="relative min-w-[200px]">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full pl-10 pr-8 py-2 bg-surface border border-border rounded-lg text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
          >
            <option value="All">Semua Status</option>
            <option value="Active">Aktif (Active)</option>
            <option value="Offline">Non-aktif (Offline)</option>
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted">
            <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
      </div>

      <div className="bg-surface border text-sm border-border rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-page border-b border-border text-text-muted font-medium">
                <th className="px-5 py-3 w-14">Profil</th>
                <th className="px-5 py-3">Nama Lengkap</th>
                <th className="px-5 py-3">Peran (Role)</th>
                <th className="px-5 py-3 hidden md:table-cell">Kontak</th>
                <th className="px-5 py-3 text-center">Status</th>
                <th className="px-5 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-text-muted">
                    Tidak ada karyawan yang sesuai dengan pencarian Anda.
                  </td>
                </tr>
              ) : filteredEmployees.map((emp, i) => (
                <motion.tr 
                  key={emp.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="hover:bg-page transition-colors group"
                >
                  <td className="px-5 py-4 align-middle">
                    <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 font-bold">
                      {emp.name.substring(0, 2).toUpperCase()}
                    </div>
                  </td>
                  <td className="px-5 py-4 align-middle">
                     <div className="font-semibold text-text-main">{emp.name}</div>
                     <div className="text-xs text-text-muted mt-0.5">ID: EMP-{1000 + emp.id}</div>
                  </td>
                  <td className="px-5 py-4 align-middle">
                      <div className="flex items-center text-text-main">
                        <Briefcase size={14} className="mr-2 text-text-muted" />
                        {emp.role}
                      </div>
                  </td>
                  <td className="px-5 py-4 align-middle hidden md:table-cell text-text-muted">
                      <div className="flex items-center mb-1"><Mail size={12} className="mr-2" /> {emp.email}</div>
                      <div className="flex items-center"><Phone size={12} className="mr-2" /> {emp.phone}</div>
                  </td>
                  <td className="px-5 py-4 align-middle text-center">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${emp.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-element text-text-muted'}`}>
                        {emp.status}
                      </span>
                  </td>
                  <td className="px-5 py-4 align-middle text-right">
                     <button className="text-indigo-600 hover:text-indigo-800 text-xs font-medium bg-indigo-50 px-3 py-1.5 rounded transition-colors opacity-0 group-hover:opacity-100">
                        Kelola
                     </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      </div>
      )}
    </div>
  );
}
