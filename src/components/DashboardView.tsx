import React, { useState, useEffect } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer 
} from 'recharts';
import { 
  Activity, Cpu, Network, Bot, Zap, AlertTriangle, TrendingUp 
} from 'lucide-react';

const initialActivityData = [
  { time: '08:00', scans: 12, errors: 0 },
  { time: '09:00', scans: 25, errors: 2 },
  { time: '10:00', scans: 45, errors: 1 },
  { time: '11:00', scans: 30, errors: 4 },
  { time: '12:00', scans: 15, errors: 0 },
  { time: '13:00', scans: 50, errors: 3 },
  { time: '14:00', scans: 60, errors: 2 },
];

const initialEvents = [
  { id: 1, type: 'rpa', icon: Bot, color: 'text-indigo-500', title: 'RPA Task: Auto-Validation', desc: 'Berhasil memvalidasi 12 dokumen batch terbaru dengan server Dukcapil.', time: 'Baru saja' },
  { id: 2, type: 'ai', icon: Cpu, color: 'text-rose-500', title: 'AI Anomaly Detection', desc: 'Mendeteksi kemungkinan NIK ganda pada scan DOC-84221.', time: '2 menit yang lalu' },
  { id: 3, type: 'sync', icon: Network, color: 'text-emerald-500', title: 'Data Integration Sync', desc: 'Sinkronisasi delta warehouse wilayah Jakarta Selatan selesai.', time: '5 menit yang lalu' }
];

export default function DashboardView() {
  const [isSyncing, setIsSyncing] = useState(true);
  const [activityData, setActivityData] = useState(initialActivityData);
  const [events, setEvents] = useState(initialEvents);
  const [rpaTasks, setRpaTasks] = useState(124);
  const [accuracy, setAccuracy] = useState(98.7);
  const [inferenceTime, setInferenceTime] = useState(1.2);

  useEffect(() => {
    // Sync indicator interval
    const syncInterval = setInterval(() => {
      setIsSyncing(prev => !prev);
    }, 3000);

    // Dynamic data update interval
    const updateInterval = setInterval(() => {
      // Update chart data
      setActivityData(prev => {
        const newData = [...prev];
        const lastData = newData[newData.length - 1];
        
        // Sometimes add new data point
        if (Math.random() > 0.7) {
          const timeParts = lastData.time.split(':');
          let hour = parseInt(timeParts[0]);
          let min = parseInt(timeParts[1]) + 15;
          if (min >= 60) {
            min = 0;
            hour += 1;
          }
          const timeStr = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
          
          if (newData.length >= 8) newData.shift(); // keep it bounded
          
          newData.push({
            time: timeStr,
            scans: Math.floor(Math.random() * 40) + 20,
            errors: Math.floor(Math.random() * 5)
          });
        } else {
          // just perturb the last point slightly
          newData[newData.length - 1] = {
            ...lastData,
            scans: lastData.scans + Math.floor(Math.random() * 3)
          };
        }
        return newData;
      });
      
      // Update RPA tasks
      if (Math.random() > 0.5) {
        setRpaTasks(prev => prev + Math.floor(Math.random() * 3) + 1);
      }

      // Fluctuate accuracy slightly
      setAccuracy(prev => {
        const newAcc = prev + (Math.random() * 0.4 - 0.2);
        return Math.min(99.9, Math.max(95.0, newAcc));
      });

      // Fluctuate inference time slightly
      setInferenceTime(prev => {
        const newTime = prev + (Math.random() * 0.2 - 0.1);
        return Math.max(0.5, newTime);
      });

      // Add a new event occasionally
      if (Math.random() > 0.8) {
         setEvents(prev => {
            const types = [
              { icon: Bot, color: 'text-indigo-500', type: 'rpa', title: 'RPA Extract', desc: `Mengekstrak data dari ${Math.floor(Math.random() * 5) + 1} KK.` },
              { icon: Cpu, color: 'text-rose-500', type: 'ai', title: 'AI OCR Tuning', desc: 'Auto-kalibrasi model OCR selesai pada node-2.' },
              { icon: Network, color: 'text-emerald-500', type: 'sync', title: 'Data Validated', desc: `Ping API Dukcapil sukses (${Math.floor(Math.random() * 20 + 10)}ms).` },
            ];
            const randType = types[Math.floor(Math.random() * types.length)];
            
            const newEvent = {
              id: Date.now(),
              type: randType.type,
              icon: randType.icon,
              color: randType.color,
              title: randType.title,
              desc: randType.desc,
              time: 'Baru saja'
            };
            
            // update times on old events (simplified)
            const updated = prev.map(e => {
              if (e.time === 'Baru saja') return { ...e, time: 'Beberapa menit yang lalu' };
              return e;
            });
            
            return [newEvent, ...updated].slice(0, 5); // Keep last 5
         });
      }
    }, 4000);

    return () => {
      clearInterval(syncInterval);
      clearInterval(updateInterval);
    };
  }, []);

  return (
    <div className="flex-1 flex flex-col pt-4 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-text-main flex items-center">
            <Activity size={24} className="mr-3 text-indigo-500" />
            SIAK Control Center
          </h2>
          <p className="text-text-muted mt-1">Real-time Dashboard & System Analytics</p>
        </div>
        <div className="flex items-center space-x-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 px-3 py-1.5 rounded-full text-sm font-medium border border-emerald-200 dark:border-emerald-800">
          <span className="relative flex h-2 w-2 mr-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          System Online
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Computer Vision Widget */}
        <div className="bg-surface border border-border p-4 rounded-xl shadow-sm flex flex-col">
          <div className="flex justify-between items-start mb-2">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400">
              <Zap size={20} />
            </div>
            <span className="text-xs font-medium text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-full">Optimized</span>
          </div>
          <h3 className="text-text-muted text-sm font-medium">Computer Vision</h3>
          <div className="mt-1 flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-text-main">{accuracy.toFixed(1)}%</span>
            <span className="text-xs text-text-muted">Akurasi OCR</span>
          </div>
        </div>

        {/* Data Integration Platform Widget */}
        <div className="bg-surface border border-border p-4 rounded-xl shadow-sm flex flex-col">
          <div className="flex justify-between items-start mb-2">
            <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-purple-600 dark:text-purple-400">
              <Network size={20} />
            </div>
            <span className="text-xs font-medium text-blue-500 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-full">{isSyncing ? 'Syncing...' : 'Connected'}</span>
          </div>
          <h3 className="text-text-muted text-sm font-medium">Data Integration</h3>
          <div className="mt-1 flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-text-main">4 API</span>
            <span className="text-xs text-text-muted">Dukcapil Terhubung</span>
          </div>
        </div>

        {/* AI Analytics Widget */}
        <div className="bg-surface border border-border p-4 rounded-xl shadow-sm flex flex-col">
          <div className="flex justify-between items-start mb-2">
            <div className="p-2 bg-rose-50 dark:bg-rose-900/20 rounded-lg text-rose-600 dark:text-rose-400">
              <Cpu size={20} />
            </div>
            <span className="text-xs font-medium text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-full flex items-center">
              <TrendingUp size={12} className="mr-1" /> Active
            </span>
          </div>
          <h3 className="text-text-muted text-sm font-medium">AI Analytics</h3>
          <div className="mt-1 flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-text-main">{inferenceTime.toFixed(1)}s</span>
            <span className="text-xs text-text-muted">Avg Inference Time</span>
          </div>
        </div>

        {/* RPA Widget */}
        <div className="bg-surface border border-border p-4 rounded-xl shadow-sm flex flex-col">
          <div className="flex justify-between items-start mb-2">
            <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg text-amber-600 dark:text-amber-400">
              <Bot size={20} />
            </div>
            <span className="text-xs font-medium text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded-full animate-pulse border border-amber-200 dark:border-amber-800">
              Processing
            </span>
          </div>
          <h3 className="text-text-muted text-sm font-medium">RPA Status</h3>
          <div className="mt-1 flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-text-main">{rpaTasks}</span>
            <span className="text-xs text-text-muted">Tasks Auto-Completed</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-[300px]">
        {/* Real-time Chart */}
        <div className="col-span-1 lg:col-span-2 bg-surface border border-border rounded-xl shadow-sm p-4 flex flex-col">
          <h3 className="text-sm font-bold text-text-main mb-4 flex items-center">
            <Activity size={16} className="mr-2 text-indigo-500" />
            Real-Time Scan Activity
          </h3>
          <div className="flex-1 min-h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activityData}>
                <defs>
                  <linearGradient id="colorScans" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="scans" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorScans)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Secondary Chart / Events */}
        <div className="col-span-1 bg-surface border border-border rounded-xl shadow-sm p-4 flex flex-col">
          <h3 className="text-sm font-bold text-text-main mb-4 flex items-center">
            <AlertTriangle size={16} className="mr-2 text-amber-500" />
            RPA & AI Event Log
          </h3>
          <div className="flex-1 overflow-y-auto space-y-3 pr-2">
            {events.map(event => {
               const EventIcon = event.icon;
               return (
                 <div key={event.id} className="flex items-start space-x-3 p-3 bg-page rounded-lg border border-border animate-in fade-in slide-in-from-top-2 duration-300">
                    <EventIcon size={16} className={`${event.color} mt-0.5 shrink-0`} />
                    <div>
                      <p className="text-xs font-semibold text-text-main">{event.title}</p>
                      <p className="text-[11px] text-text-muted mt-1">{event.desc}</p>
                      <span className="text-[10px] text-text-muted">{event.time}</span>
                    </div>
                 </div>
               );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
