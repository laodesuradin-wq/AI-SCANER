import React, { useState, useEffect } from 'react';
import { Database, Search, FileText, Trash2, Users } from 'lucide-react';
import { KartuKeluarga } from '../types';

export default function DatabaseView() {
  const [documents, setDocuments] = useState<KartuKeluarga[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedKk, setSelectedKk] = useState<KartuKeluarga | null>(null);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = () => {
    // Try to load SIAK_AMAHOLU_DB from localStorage
    const savedInfo = localStorage.getItem('SIAK_AMAHOLU_DB');
    let loadedData: KartuKeluarga[] = [];
    
    if (savedInfo) {
      try {
        loadedData = JSON.parse(savedInfo);
      } catch (e) {
        console.error("Failed to parse SIAK_AMAHOLU_DB");
      }
    }
    
    setDocuments(loadedData);
  };

  const deleteDocument = (no_kk: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus data KK ini?')) {
      const updatedDocs = documents.filter(doc => doc.no_kk !== no_kk);
      setDocuments(updatedDocs);
      localStorage.setItem('SIAK_AMAHOLU_DB', JSON.stringify(updatedDocs));
      if (selectedKk?.no_kk === no_kk) setSelectedKk(null);
    }
  };

  const filteredDocs = documents.filter(doc => {
    const kepalaKeluarga = doc.anggota?.find(a => a.hubungan?.toLowerCase().includes('kepala'))?.nama || '';
    return doc.no_kk?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           kepalaKeluarga.toLowerCase().includes(searchTerm.toLowerCase()) ||
           doc.alamat?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="flex-1 flex flex-col pt-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-text-main flex items-center">
            <Database size={24} className="mr-3 text-indigo-500" />
            Database Warga
          </h2>
          <p className="text-text-muted mt-1">SIAK Amaholu Losy - Data terintegrasi dari scanner dan sistem rekam.</p>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-2xl shadow-sm flex-1 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-border bg-page flex items-center space-x-4">
           <div className="relative flex-1 max-w-md">
             <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
             <input 
               type="text" 
               placeholder="Cari berdasarkan No KK atau Nama Kepala Keluarga..."
               className="w-full bg-surface border border-border rounded-xl pl-10 pr-4 py-2 text-sm outline-none focus:border-indigo-500 transition-colors"
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
             />
           </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* List Kiri */}
          <div className="w-full md:w-1/3 border-r border-border bg-page overflow-y-auto p-4 space-y-3">
            {filteredDocs.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-70 p-4">
                <Database size={32} className="text-text-muted mb-4 stroke-[1]" />
                <p className="text-text-main font-medium">Belum ada data warga</p>
                <p className="text-xs text-text-muted mt-1">Data dari SIAK_AMAHOLU_DB akan muncul di sini.</p>
              </div>
            ) : (
              filteredDocs.map((doc, idx) => {
                const kepalaKeluarga = doc.anggota?.find(a => a.hubungan?.toLowerCase() === 'kepala keluarga')?.nama || "Tidak Ada Data";
                const isSelected = selectedKk?.no_kk === doc.no_kk;
                return (
                  <div 
                    key={idx} 
                    onClick={() => setSelectedKk(doc)}
                    className={`p-4 border rounded-xl cursor-pointer transition-all ${isSelected ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-border bg-surface hover:border-indigo-300'}`}
                  >
                    <div className="flex justify-between items-start">
                       <div>
                         <h3 className="font-bold text-text-main leading-tight mb-1">{kepalaKeluarga}</h3>
                         <p className="text-xs font-mono text-text-muted mb-2">{doc.no_kk}</p>
                       </div>
                       <button 
                         onClick={(e) => { e.stopPropagation(); deleteDocument(doc.no_kk); }}
                         className="text-text-muted hover:text-red-500 p-1 rounded-md hover:bg-page transition-colors"
                       >
                         <Trash2 size={16} />
                       </button>
                    </div>
                    
                    <div className="flex items-center text-xs text-text-muted mt-2 pt-2 border-t border-border">
                       <Users size={14} className="mr-1.5" /> {doc.anggota?.length || 0} Anggota Keluarga
                    </div>
                  </div>
                );
              })
            )}
          </div>
          
          {/* Detail Kanan */}
          <div className="hidden md:flex flex-1 bg-surface p-6 overflow-y-auto">
            {selectedKk ? (
              <div className="w-full animate-in fade-in">
                <div className="flex items-center justify-between mb-6 border-b border-border pb-4">
                   <div>
                     <h3 className="text-xl font-bold text-text-main">Detail Kartu Keluarga</h3>
                     <p className="text-indigo-600 font-mono mt-1">{selectedKk.no_kk}</p>
                   </div>
                   <div className="px-3 py-1 bg-page border border-border rounded-lg text-sm text-text-muted">
                     {selectedKk.anggota?.length || 0} Jiwa
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-page p-3 rounded-lg border border-border">
                    <span className="block text-xs text-text-muted mb-1">Alamat</span>
                    <span className="block text-sm font-medium">{selectedKk.alamat || '-'}</span>
                  </div>
                  <div className="bg-page p-3 rounded-lg border border-border">
                    <span className="block text-xs text-text-muted mb-1">RT/RW</span>
                    <span className="block text-sm font-medium">{selectedKk.rt_rw || '-'}</span>
                  </div>
                  <div className="bg-page p-3 rounded-lg border border-border">
                    <span className="block text-xs text-text-muted mb-1">Desa/Kelurahan</span>
                    <span className="block text-sm font-medium">{selectedKk.Desa || '-'}</span>
                  </div>
                  <div className="bg-page p-3 rounded-lg border border-border">
                    <span className="block text-xs text-text-muted mb-1">Kecamatan</span>
                    <span className="block text-sm font-medium">{selectedKk.Kecamatan || '-'}</span>
                  </div>
                  <div className="bg-page p-3 rounded-lg border border-border">
                    <span className="block text-xs text-text-muted mb-1">Kabupaten/Kota</span>
                    <span className="block text-sm font-medium">{selectedKk.Kabupaten || '-'}</span>
                  </div>
                  <div className="bg-page p-3 rounded-lg border border-border">
                    <span className="block text-xs text-text-muted mb-1">Provinsi</span>
                    <span className="block text-sm font-medium">{selectedKk.Provinsi || '-'}</span>
                  </div>
                </div>

                <h4 className="font-bold text-text-main mb-4 flex items-center">
                  <Users size={18} className="mr-2 text-indigo-500" /> Daftar Anggota Keluarga
                </h4>

                <div className="overflow-x-auto border border-border rounded-xl">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-page border-b border-border">
                      <tr>
                        <th className="px-4 py-3 font-medium text-text-muted">No</th>
                        <th className="px-4 py-3 font-medium text-text-muted">Nama / NIK</th>
                        <th className="px-4 py-3 font-medium text-text-muted">TTL</th>
                        <th className="px-4 py-3 font-medium text-text-muted">JK</th>
                        <th className="px-4 py-3 font-medium text-text-muted">Hubungan</th>
                        <th className="px-4 py-3 font-medium text-text-muted">Pekerjaan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {selectedKk.anggota?.map((anggota, i) => (
                        <tr key={i} className="hover:bg-page/50 transition-colors">
                          <td className="px-4 py-3">{i + 1}</td>
                          <td className="px-4 py-3">
                            <div className="font-medium">{anggota.nama}</div>
                            <div className="text-xs font-mono text-text-muted">{anggota.nik}</div>
                          </td>
                          <td className="px-4 py-3">
                            <div>{anggota.tempat_lahir}</div>
                            <div className="text-xs text-text-muted">{anggota.tgl}</div>
                          </td>
                          <td className="px-4 py-3">{anggota.jk}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded-md text-[11px] font-medium ${anggota.hubungan === 'Kepala Keluarga' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'}`}>
                              {anggota.hubungan}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs">{anggota.pekerjaan || '-'}</td>
                        </tr>
                      ))}
                      {(!selectedKk.anggota || selectedKk.anggota.length === 0) && (
                        <tr>
                          <td colSpan={6} className="px-4 py-8 text-center text-text-muted">Tidak ada data anggota keluarga</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-text-muted opacity-70">
                <FileText size={64} className="mb-4 stroke-[1]" />
                <p className="text-lg">Pilih dokumen KK di samping untuk melihat detail</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
