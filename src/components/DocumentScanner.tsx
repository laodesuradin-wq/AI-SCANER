import React, { useState, useRef } from 'react';
import { Upload, Camera, FileText, CheckCircle2, ScanLine, X, Loader2, ArrowRight } from 'lucide-react';

type ScanState = 'idle' | 'scanning' | 'results';

export default function DocumentScanner() {
  const [scanState, setScanState] = useState<ScanState>('idle');
  const [scannedImage, setScannedImage] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [extractedData, setExtractedData] = useState<{ label: string; value: string }[]>([]);

  const [isSaved, setIsSaved] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setScannedImage(event.target?.result as string);
        startScanningProcess();
      };
      reader.readAsDataURL(file);
    }
  };

  const simulateCameraCapture = () => {
    // Generate a placeholder image to simulate camera capture
    setScannedImage("https://images.unsplash.com/photo-1620288627223-53302f4e8c74?auto=format&fit=crop&q=80&w=600&h=800");
    startScanningProcess();
  };

  const startScanningProcess = () => {
    setScanState('scanning');
    setProgress(0);
    setIsSaved(false);
    
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += Math.floor(Math.random() * 15) + 5;
      if (currentProgress >= 100) {
        currentProgress = 100;
        clearInterval(interval);
        
        // Mock extracted data
        setTimeout(() => {
          const isMockValid = Math.random() > 0.5;
          const noKk = isMockValid ? '3171234567890123' : '317123A456';
          setExtractedData([
            { label: 'No. KK', value: noKk },
            { label: 'Nama Kepala Keluarga', value: 'Budi Santoso' },
            { label: 'Alamat', value: 'Jl. Merdeka No. 45' },
            { label: 'RT/RW', value: '001/002' },
            { label: 'Desa/Kelurahan', value: 'Sukajaya' },
            { label: 'Kecamatan', value: 'Makmur' },
            { label: 'Kabupaten/Kota', value: 'Kota Baru' },
            { label: 'Provinsi', value: 'Jawa Barat' },
            { label: 'Kode Pos', value: '12345' },
            { label: 'Tanggal Pindai', value: new Date().toLocaleDateString('id-ID') },
            { label: 'Tingkat Kepercayaan', value: isMockValid ? '98.5%' : '72.1%' }
          ]);
          setScanState('results');
        }, 500);
      }
      setProgress(currentProgress);
    }, 400);
  };

  const saveToDatabase = () => {
    if (extractedData.length === 0) return;
    
    // Check if KK is valid (for demonstration, we might prevent save, but here we just save it)
    const getVal = (labelMatch: string) => extractedData.find(e => e.label.toLowerCase().includes(labelMatch))?.value || '';

    const noKk = getVal('no. kk');
    
    // Create new KartuKeluarga formatted object
    const newDoc = {
      no_kk: noKk,
      alamat: getVal('alamat'),
      rt_rw: getVal('rt/rw'),
      Desa: getVal('desa'),
      Kecamatan: getVal('kecamatan'),
      Kabupaten: getVal('kabupaten'),
      Provinsi: getVal('provinsi'),
      anggota: [
        {
          nama: getVal('kepala keluarga'),
          nik: '',
          tempat_lahir: '',
          tgl: '',
          jk: '',
          hubungan: 'Kepala Keluarga',
          agama: '',
          pendidikan: '',
          pekerjaan: '',
          bansos: ''
        }
      ]
    };

    const existingData = localStorage.getItem('SIAK_AMAHOLU_DB');
    const documents = existingData ? JSON.parse(existingData) : [];
    
    // Add to beginning of array or overwrite if no_kk exists
    const filteredDocs = documents.filter((d: any) => d.no_kk !== noKk);
    localStorage.setItem('SIAK_AMAHOLU_DB', JSON.stringify([newDoc, ...filteredDocs]));
    setIsSaved(true);
    
    // Auto reset after 3 seconds
    setTimeout(() => {
      resetScanner();
    }, 3000);
  };

  const resetScanner = () => {
    setScanState('idle');
    setScannedImage(null);
    setExtractedData([]);
    setProgress(0);
    setIsSaved(false);
  };

  return (
    <div className="flex-1 flex flex-col">
      <div className="bg-surface border border-border rounded-2xl shadow-sm overflow-hidden flex-1 flex flex-col md:flex-row">
        
        {/* Left Side: Scanner / Upload Area */}
        <div className="flex-1 p-6 md:p-8 flex flex-col justify-center border-b md:border-b-0 md:border-r border-border">
          
          {scanState === 'idle' && (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
              <div className="w-24 h-24 bg-indigo-50 dark:bg-indigo-900/20 rounded-full flex items-center justify-center mb-2">
                <ScanLine size={48} className="text-indigo-500" />
              </div>
              
              <div>
                <h2 className="text-2xl font-bold text-text-main mb-2">Pindai Kartu Keluarga (KK)</h2>
                <p className="text-text-muted">Upload file atau gunakan kamera ponsel untuk memindai dokumen aslinya</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-4 rounded-xl font-medium transition-all flex items-center justify-center shadow-lg shadow-indigo-600/20"
                >
                  <Upload size={18} className="mr-2" /> Upload Dokumen
                </button>
                <button 
                  onClick={simulateCameraCapture}
                  className="flex-1 bg-surface border border-border hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 text-text-main py-3 px-4 rounded-xl font-medium transition-all flex items-center justify-center shadow-sm"
                >
                  <Camera size={18} className="mr-2" /> Buka Kamera
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                  accept="image/*,.pdf" 
                  className="hidden" 
                />
              </div>
            </div>
          )}

          {(scanState === 'scanning' || scanState === 'results') && (
            <div className="h-full flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-semibold text-text-main flex items-center">
                  {scanState === 'scanning' ? (
                    <><Loader2 size={18} className="mr-2 animate-spin text-indigo-500" /> Memindai Dokumen...</>
                  ) : (
                    <><CheckCircle2 size={18} className="mr-2 text-emerald-500" /> Pemindaian Selesai</>
                  )}
                </h3>
                {scanState === 'results' && (
                  <button onClick={resetScanner} className="text-text-muted hover:text-red-500 p-2 rounded-lg hover:bg-page transition-colors">
                    <X size={20} />
                  </button>
                )}
              </div>

              <div className="flex-1 relative rounded-xl border border-border overflow-hidden bg-page flex items-center justify-center p-4 min-h-[300px]">
                {scannedImage && (
                  <img 
                    src={scannedImage} 
                    alt="Scanned Document" 
                    className="max-h-full max-w-full object-contain rounded-lg shadow-sm"
                  />
                )}
                
                {/* Scanning Animation Overlay */}
                {scanState === 'scanning' && (
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="w-full max-w-xs px-8 text-center pt-10">
                       <div className="relative h-1 w-full bg-white/20 rounded-full overflow-hidden mb-4">
                          <div 
                            className="absolute top-0 left-0 h-full bg-indigo-500 transition-all duration-300 ease-out"
                            style={{ width: `${progress}%` }}
                          />
                       </div>
                       <p className="text-white text-center font-medium font-mono text-sm leading-relaxed drop-shadow-md">
                         Menganalisis piksel... {progress}%
                       </p>
                    </div>
                    {/* Laser Line */}
                    <div 
                      className="absolute left-0 w-full h-1 bg-indigo-500 shadow-[0_0_20px_5px_rgba(99,102,241,0.7)] z-20 transition-all duration-300"
                      style={{ top: `${progress}%` }}
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Results Area */}
        <div className="w-full md:w-80 lg:w-96 bg-page p-6 md:p-8 flex flex-col h-full border-t md:border-t-0 md:border-l border-border min-h-[300px]">
          <h3 className="font-semibold text-text-main flex items-center mb-6">
            <FileText size={18} className="mr-2 text-indigo-500" /> Hasil Ekstraksi Data
          </h3>

          {scanState === 'idle' || scanState === 'scanning' ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50">
              <FileText size={48} className="text-text-muted mb-4 stroke-[1]" />
              <p className="text-sm text-text-muted px-4">
                {scanState === 'idle' ? 'Lakukan pemindaian untuk melihat hasil ekstraksi data OCR.' : 'Menunggu hasil analisis dokumen...'}
              </p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col space-y-6 animate-in slide-in-from-right-4 fade-in duration-500">
              <div className="space-y-4 flex-1 overflow-y-auto pr-2">
                {extractedData.map((item, index) => {
                  const isKk = item.label.toLowerCase() === 'no. kk';
                  const isKkValid = isKk ? /^\d{16}$/.test(item.value) : true;
                  
                  return (
                    <div key={index} className={`bg-surface border p-4 rounded-xl shadow-sm ${!isKkValid ? 'border-red-500 bg-red-50 dark:bg-red-900/10' : 'border-border'}`}>
                      <span className={`block text-xs font-medium mb-1 ${!isKkValid ? 'text-red-500 font-semibold' : 'text-text-muted'}`}>{item.label}</span>
                      <span className={`block text-sm font-semibold ${!isKkValid ? 'text-red-600 dark:text-red-400' : 'text-text-main'}`}>{item.value}</span>
                      {!isKkValid && <span className="block mt-2 text-xs text-red-500 flex items-center"><X size={12} className="mr-1" /> No. KK harus 16 digit angka</span>}
                    </div>
                  );
                })}
              </div>

              <div className="pt-4 border-t border-border mt-auto">
                <button 
                  onClick={saveToDatabase}
                  disabled={isSaved}
                  className={`w-full py-3 px-4 rounded-xl font-medium transition-colors flex items-center justify-center shadow-md ${
                    isSaved 
                      ? 'bg-emerald-500 text-white' 
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  }`}
                >
                   {isSaved ? (
                     <><CheckCircle2 size={18} className="mr-2" /> Berhasil Disimpan</>
                   ) : (
                     <>Simpan Data <ArrowRight size={18} className="ml-2" /></>
                   )}
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
