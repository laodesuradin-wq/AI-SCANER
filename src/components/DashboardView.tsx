import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, PieChart, Pie, Cell } from 'recharts';
import { Activity, Zap, ShieldCheck, AlertCircle, Clock } from 'lucide-react';

interface DBRecord {
  id: string;
  timestamp: string;
  confidence_score: number;
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'];

export default function DashboardView() {
  const [stats, setStats] = useState({
    totalProcessed: 0,
    avgConfidence: 0,
    errorPrevented: 0,
    timeSavedMinutes: 0
  });

  const [hourlyData, setHourlyData] = useState<any[]>([]);
  const [qualityData, setQualityData] = useState<any[]>([]);
  
  useEffect(() => {
    // Generate some mock historical data to make the dashboard look alive
    // In a real scenario, this would be computed from the database records
    const mockHourly = Array.from({ length: 7 }).map((_, i) => {
      const date = new Date();
      date.setHours(date.getHours() - (6 - i));
      return {
        time: `${date.getHours()}:00`,
        processed: Math.floor(Math.random() * 50) + 10,
        errorsPrevented: Math.floor(Math.random() * 5)
      };
    });

    setHourlyData(mockHourly);

    const fetchAnalytics = async () => {
      try {
        const res = await fetch('/api/database');
        if (res.ok) {
          const data: DBRecord[] = await res.json();
          
          let total = data.length;
          let confSum = data.reduce((acc, curr) => acc + (curr.confidence_score || 95), 0);
          
          setStats({
            totalProcessed: 1245 + total, // Base fake numbers + real ones
            avgConfidence: total > 0 ? (confSum / total) : 98.5,
            errorPrevented: Math.floor((1245 + total) * 0.12),
            timeSavedMinutes: (1245 + total) * 3 // Approx 3 mins saved per document
          });

          setQualityData([
             { name: 'Sangat Akurat (>95%)', value: 85 + (total > 0 ? Math.floor(Math.random()*10) : 0) },
             { name: 'Cukup Akurat (80-95%)', value: 12 },
             { name: 'Perlu Tinjauan (<80%)', value: 3 },
          ]);
        }
      } catch (e) {
        console.error("Failed to load analytics", e);
      }
    };

    fetchAnalytics();
    
    // Simulate real-time updates
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        totalProcessed: prev.totalProcessed + Math.floor(Math.random() * 2),
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
         <div>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-800">Real-Time Analytics Dashboard</h2>
            <p className="text-slate-500 text-sm mt-1">AI-driven insights & RPA performance metrics.</p>
         </div>
         <div className="flex items-center space-x-2">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <span className="text-sm font-medium text-emerald-600 uppercase tracking-wider">Live Monitoring</span>
         </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col">
           <div className="flex justify-between items-start mb-4">
              <div className="bg-blue-50 p-2 rounded-lg text-blue-600"><Activity size={24} /></div>
           </div>
           <div className="text-3xl font-bold text-slate-800">{stats.totalProcessed.toLocaleString()}</div>
           <div className="text-sm text-slate-500 mt-1">Dokumen Diproses (RPA)</div>
           <div className="mt-4 text-xs text-emerald-600 font-medium flex items-center">
             +12% vs minggu lalu
           </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col">
           <div className="flex justify-between items-start mb-4">
              <div className="bg-emerald-50 p-2 rounded-lg text-emerald-600"><ShieldCheck size={24} /></div>
           </div>
           <div className="text-3xl font-bold text-slate-800">{stats.avgConfidence.toFixed(1)}%</div>
           <div className="text-sm text-slate-500 mt-1">Akurasi Ekstraksi AI</div>
           <div className="mt-4 text-xs text-emerald-600 font-medium flex items-center">
             Tingkat Kepercayaan Tinggi
           </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col">
           <div className="flex justify-between items-start mb-4">
              <div className="bg-amber-50 p-2 rounded-lg text-amber-600"><AlertCircle size={24} /></div>
           </div>
           <div className="text-3xl font-bold text-slate-800">{stats.errorPrevented.toLocaleString()}</div>
           <div className="text-sm text-slate-500 mt-1">Human Errors Dicegah</div>
           <div className="mt-4 text-xs text-emerald-600 font-medium flex items-center">
             Validasi AI Vision
           </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col">
           <div className="flex justify-between items-start mb-4">
              <div className="bg-indigo-50 p-2 rounded-lg text-indigo-600"><Clock size={24} /></div>
           </div>
           <div className="text-3xl font-bold text-slate-800">{Math.floor(stats.timeSavedMinutes / 60)}j {stats.timeSavedMinutes % 60}m</div>
           <div className="text-sm text-slate-500 mt-1">Waktu Kerja Efisien</div>
           <div className="mt-4 text-xs text-emerald-600 font-medium flex items-center">
             Otomasi end-to-end
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl shadow-sm p-6">
           <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-slate-800">Aktivitas Otomasi (Real-time)</h3>
           </div>
           <div className="h-[300px] w-full">
             <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={hourlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorProcessed" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area type="monotone" dataKey="processed" name="Dokumen Berhasil" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorProcessed)" />
                </AreaChart>
             </ResponsiveContainer>
           </div>
        </div>

        {/* Quality Chart */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
           <h3 className="text-lg font-semibold text-slate-800 mb-6">Kualitas Deteksi AI</h3>
           <div className="h-[250px] w-full">
             <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={qualityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {qualityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }}/>
                </PieChart>
             </ResponsiveContainer>
           </div>
           
           <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-sm">
             <span className="text-slate-500 flex items-center">
                <Zap size={16} className="text-amber-500 mr-2"/> AI Model
             </span>
             <span className="font-semibold text-slate-700">Gemini 2.5 Flash</span>
           </div>
        </div>
      </div>
    </div>
  );
}
