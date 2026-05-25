import { Upload, FileText, CheckCircle, Fingerprint, MapPin, Loader2, Bot, FileCheck, ServerCog, Wand2, Download, Camera, X, CreditCard, Receipt, Package, Tag } from "lucide-react";
import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import jsQR from "jsqr";
import { cn } from "../lib/utils";

export interface ExtractedData {
  fields: { key: string; value: string }[];
  summary: string;
  confidence_score: number;
  document_type?: string;
}

export default function Scanner({ onComplete }: { onComplete: (data: ExtractedData) => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<ExtractedData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const captureInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scanActiveRaw = useRef(false);

  useEffect(() => {
    return () => {
      if (scanActiveRaw.current) stopCamera();
    };
  }, []);

  const startCamera = async () => {
    setFile(null);
    setPreviewUrl(null);
    setResult(null);
    setError(null);
    setIsCameraOpen(true);
    scanActiveRaw.current = true;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute("playsinline", "true");
        videoRef.current.play();
        requestAnimationFrame(tick);
      }
    } catch (err: any) {
      if (err.name === 'NotAllowedError' || err.message === 'Permission denied' || err.name === 'NotSupportedError') {
        setError("Izin kamera ditolak. Silakan buka aplikasi di tab baru, ATAU gunakan tombol 'Unggah Dokumen' untuk memotret menggunakan kamera bawaan ponsel/komputer.");
      } else {
        setError(`Kamera tidak dapat diakses: ${err.message || "Pastikan perangkat memiliki kamera."}`);
      }
      stopCamera();
    }
  };

  const stopCamera = () => {
    setIsCameraOpen(false);
    scanActiveRaw.current = false;
    if (videoRef.current?.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const tick = () => {
    if (!scanActiveRaw.current) return;
    
    if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!canvas) {
        requestAnimationFrame(tick);
        return;
      }
      
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) {
        requestAnimationFrame(tick);
        return;
      }

      canvas.height = video.videoHeight;
      canvas.width = video.videoWidth;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: "dontInvert",
      });

      if (code) {
        canvas.toBlob((blob) => {
          if (blob) {
            const newFile = new File([blob], "qr_scan.jpg", { type: "image/jpeg" });
            setFile(newFile);
            setPreviewUrl(URL.createObjectURL(newFile));
            setResult(null);
            
            stopCamera();
            processImage(newFile);
          }
        }, "image/jpeg", 0.9);
        return;
      }
    }
    requestAnimationFrame(tick);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selected = e.target.files[0];
      setFile(selected);
      setPreviewUrl(URL.createObjectURL(selected));
      setResult(null);
      setError(null);
    }
  };

  const enhanceImage = () => {
    if (!previewUrl || !file) return;
    setIsEnhancing(true);

    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = previewUrl;
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        setIsEnhancing(false);
        return;
      }
      
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      // High Contrast & Grayscale Filter for OCR Enhancement
      const contrast = 75; // -255 to 255
      const factor = (259.0 * (contrast + 255.0)) / (255.0 * (259.0 - contrast));
      
      for (let i = 0; i < data.length; i += 4) {
         // Convert to grayscale
         const r = data[i], g = data[i + 1], b = data[i + 2];
         const avg = 0.299 * r + 0.587 * g + 0.114 * b;
         
         // Apply contrast
         let newValue = factor * (avg - 128.0) + 128.0;
         
         // Clamp
         if (newValue > 255) newValue = 255;
         if (newValue < 0) newValue = 0;
         
         data[i] = newValue;     
         data[i + 1] = newValue; 
         data[i + 2] = newValue; 
      }
      
      ctx.putImageData(imageData, 0, 0);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const newFile = new File([blob], "enhanced_" + file.name, { type: "image/jpeg" });
          setFile(newFile);
          setPreviewUrl(URL.createObjectURL(newFile));
        }
        setIsEnhancing(false);
      }, "image/jpeg", 0.9);
    };
    
    img.onerror = () => {
      setIsEnhancing(false);
    }
  };

  const processImage = async (targetFile?: File) => {
    const fileToProcess = targetFile || file;
    if (!fileToProcess) return;
    setIsProcessing(true);
    setError(null);
    
    const formData = new FormData();
    formData.append("document", fileToProcess);

    try {
      const response = await fetch("/api/extract", {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to process image");
      }
      
      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">AI Vision Scanner</h2>
          <p className="text-text-muted mt-1">Upload Label Packing, Barcode, atau formulir produksi.</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upload Section */}
        <div className="space-y-4">
          <div 
            onClick={() => {
              if (!isCameraOpen) fileInputRef.current?.click();
            }}
            className={cn(
              "border-2 border-dashed rounded-xl p-8 transition-colors text-center cursor-pointer flex flex-col items-center justify-center min-h-[300px] relative overflow-hidden",
              previewUrl ? "border-emerald-200 bg-emerald-50/30" : "border-border hover:border-emerald-400 hover:bg-page"
            )}
          >
            {isCameraOpen ? (
              <div className="absolute inset-0 bg-black flex flex-col">
                <video 
                  ref={videoRef} 
                  className="w-full h-full object-cover"
                  playsInline
                  autoPlay
                  muted
                />
                <button 
                  onClick={(e) => { e.stopPropagation(); stopCamera(); }}
                  className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition"
                >
                  <X size={20} />
                </button>
                <div className="absolute bottom-4 inset-x-0 text-center">
                  <span className="bg-black/60 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-md">
                    Scanning untuk QR Code...
                  </span>
                </div>
                {/* Hidden canvas for image data extraction */}
                <canvas ref={canvasRef} className="hidden" />
              </div>
            ) : (
              <>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleFileChange}
                />
                <input 
                  type="file" 
                  ref={captureInputRef} 
                  className="hidden" 
                  accept="image/*"
                  capture="environment" 
                  onChange={handleFileChange}
                />
                {previewUrl ? (
                  <div className="space-y-4 w-full">
                    <img src={previewUrl} alt="Preview" className="max-h-[250px] object-contain mx-auto rounded-lg shadow-sm" />
                    <p className="text-sm font-medium text-emerald-700">{file?.name}</p>
                  </div>
                ) : (
                  <div className="space-y-4 text-text-muted flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 mb-2">
                      <Upload size={24} />
                    </div>
                    <p className="font-medium">Klik untuk upload dokumen referensi</p>
                    <p className="text-xs">Mendukung format PNG, JPG, JPEG (Max 5MB)</p>
                  </div>
                )}
              </>
            )}
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={startCamera}
              disabled={isProcessing || isEnhancing || isCameraOpen}
              className="flex-1 bg-surface border border-border text-text-main font-medium py-2.5 px-4 rounded-xl shadow-sm hover:bg-page disabled:opacity-50 transition-all flex items-center justify-center text-sm"
            >
              <Camera className="mr-2" size={16} />
              Scan QR Code
            </button>
          </div>
          
          {previewUrl && !result && (
            <button
              onClick={enhanceImage}
              disabled={isEnhancing || isProcessing}
              className="w-full bg-slate-800 text-white font-medium py-2.5 px-4 rounded-xl shadow-sm hover:shadow-md disabled:opacity-50 transition-all flex items-center justify-center text-sm"
            >
              {isEnhancing ? (
                <Loader2 className="animate-spin mr-2" size={16} />
              ) : (
                <Wand2 className="mr-2" size={16} />
              )}
              {isEnhancing ? "Memproses gambar..." : "Perjelas Dokumen (High-Contrast OCR)"}
            </button>
          )}
          
          <button
            onClick={processImage}
            disabled={!file || isProcessing || isEnhancing}
            className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-medium py-3 px-4 rounded-xl shadow-md hover:shadow-lg disabled:opacity-50 disabled:shadow-none hover:-translate-y-0.5 transition-all flex items-center justify-center"
          >
            {isProcessing ? (
              <>
                <Loader2 className="animate-spin mr-2" size={18} />
                Mengekstrak Data OCR & AI...
              </>
            ) : (
              <>
                <Bot className="mr-2" size={18} />
                Proses dengan Computer Vision
              </>
            )}
          </button>
          
          {error && (
             <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm border border-red-100">
               {error}
             </div>
          )}
        </div>

        {/* Result Area */}
        <div className="relative">
          {(!result && !isProcessing) ? (
            <div className="h-full border border-border bg-page/50 rounded-xl flex flex-col items-center justify-center text-text-muted p-8 min-h-[400px]">
              <FileCheck size={48} className="mb-4 text-gray-300" />
              <p>Hasil ekstraksi Computer Vision akan muncul di sini.</p>
              <p className="text-xs mt-2 text-center max-w-xs">AI akan mendeteksi entitas dan validasi format dokumen secara otomatis.</p>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {isProcessing ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="h-full border border-border bg-surface rounded-xl shadow-sm p-6 flex flex-col items-center gap-4 justify-center min-h-[400px]"
                >
                  <div className="relative">
                     <div className="absolute inset-0 bg-emerald-200 rounded-full animate-ping opacity-75"></div>
                     <div className="relative bg-emerald-100 text-emerald-600 p-4 rounded-full">
                       <ServerCog size={32} />
                     </div>
                  </div>
                  <div className="text-center space-y-2">
                    <h3 className="font-medium text-text-main">Menganalisis Gambar...</h3>
                    <p className="text-sm text-text-muted">Mendeteksi SKU, Batch ID, dan data material.</p>
                  </div>
                </motion.div>
              ) : result ? (
                 <motion.div
                  key="result"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="h-full border border-emerald-100 bg-surface rounded-xl shadow-sm overflow-hidden flex flex-col"
                >
                  <div className="bg-emerald-50 px-6 py-4 border-b border-emerald-100 flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold text-emerald-800 flex items-center">
                        <CheckCircle size={18} className="mr-2 text-emerald-500" />
                        Verifikasi AI Berhasil
                      </h3>
                      <p className="text-xs text-emerald-600 mt-1">{result.summary}</p>
                    </div>
                    <div className="bg-surface px-3 py-1 rounded-full shadow-sm text-xs font-medium text-emerald-700 flex items-center">
                       Akurasi: {result.confidence_score || 98}%
                    </div>
                  </div>
                  
                  <div className="p-6 flex-1 overflow-y-auto">
                    <div className="flex justify-between items-center mb-4">
                      <p className="text-xs font-medium text-text-muted uppercase tracking-wider">Extracted Fields</p>
                      {result.document_type && (
                        <span className="flex items-center text-xs font-medium bg-emerald-100 text-emerald-800 px-2 py-1 rounded-md border border-emerald-200">
                          {result.document_type.toLowerCase().includes('ktp') ? <CreditCard size={12} className="mr-1.5" /> : 
                           result.document_type.toLowerCase().includes('invoice') ? <Receipt size={12} className="mr-1.5" /> :
                           result.document_type.toLowerCase().includes('shipping') || result.document_type.toLowerCase().includes('label') ? <Package size={12} className="mr-1.5" /> :
                           <Tag size={12} className="mr-1.5" />}
                          {result.document_type}
                        </span>
                      )}
                    </div>
                    <div className="space-y-4">
                      {result.fields?.map((field, idx) => (
                        <div key={idx} className="group flex flex-col border-b border-gray-50 pb-3">
                          <label className="text-xs font-medium text-text-muted flex items-center">
                            {field.key}
                          </label>
                          <input 
                            type="text" 
                            defaultValue={field.value} 
                            className="bg-transparent font-mono text-sm font-medium text-text-main focus:outline-none focus:ring-1 focus:ring-emerald-400 rounded-md py-1 px-2 -ml-2 transition-colors hover:bg-page focus:bg-surface"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 bg-page border-t border-border flex flex-col gap-3">
                    <button 
                      onClick={() => onComplete(result)}
                      className="w-full bg-slate-900 text-white font-medium py-3 rounded-lg shadow-sm hover:bg-slate-800 transition-colors flex justify-center items-center cursor-pointer"
                    >
                      Kirim Data ke Otomasi (RPA) &rarr;
                    </button>
                    <button 
                      onClick={() => {
                        const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const link = document.createElement('a');
                        link.href = url;
                        link.download = `dokumen_hasil_${new Date().getTime()}.json`;
                        link.click();
                      }}
                      className="w-full bg-surface border border-border text-text-main font-medium py-3 rounded-lg shadow-sm hover:bg-page transition-colors flex justify-center items-center cursor-pointer"
                    >
                      <Download size={18} className="mr-2 text-text-muted" />
                      Simpan / Unduh Dokumen (JSON)
                    </button>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
}
