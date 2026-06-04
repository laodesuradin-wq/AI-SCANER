import React, { useState, useEffect, useRef } from 'react';
import { Youtube, Sparkles, TrendingUp, Search, X, Loader2, Copy, CheckCircle2, Link as LinkIcon, Compass, PlaySquare, Download, Code2, Save, Settings2, Split, CheckSquare, Square, BarChart2, Tag, Plus } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface VideoSnippet {
  title: string;
  channelTitle: string;
  description: string;
  thumbnails: {
    high: { url: string };
    medium?: { url: string };
  };
  tags?: string[];
  categoryId?: string;
}

interface Video {
  id: string;
  snippet: VideoSnippet;
  statistics: {
    viewCount: string;
  };
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'trending' | 'search' | 'url' | 'saved'>('trending');
  
  // Trending State
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState<string>(''); 
  const [region, setRegion] = useState<string>('ID');
  
  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchVideos, setSearchVideos] = useState<Video[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  // URL State
  const [urlInput, setUrlInput] = useState('');
  const [urlLoading, setUrlLoading] = useState(false);

  // Saved Blueprints State
  const [savedBlueprints, setSavedBlueprints] = useState<any[]>([]);

  // Common
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [viewingPrompt, setViewingPrompt] = useState<{videoTitle: string, prompt: string} | null>(null);

  // Compare State
  const [isCompareMode, setIsCompareMode] = useState(false);
  const [selectedForCompare, setSelectedForCompare] = useState<Video[]>([]);
  const [showCompareModal, setShowCompareModal] = useState(false);

  // Stats Modal State
  const [statsVideo, setStatsVideo] = useState<Video | null>(null);
  const [selectedTagFilter, setSelectedTagFilter] = useState<string>('');

  useEffect(() => {
    const saved = localStorage.getItem('YT_REMAKER_SAVED');
    if (saved) {
      try { setSavedBlueprints(JSON.parse(saved)); } catch(e) {}
    }
  }, []);

  const getCategoryName = (categoryId?: string) => {
    if (!categoryId) return 'Uncategorized';
    const mapping: Record<string, string> = {
      '1': 'Film & Animation',
      '2': 'Autos & Vehicles',
      '10': 'Music',
      '15': 'Pets & Animals',
      '17': 'Sports',
      '19': 'Travel & Events',
      '20': 'Gaming',
      '22': 'People & Blogs',
      '23': 'Comedy',
      '24': 'Entertainment',
      '25': 'News & Politics',
      '26': 'Howto & Style',
      '27': 'Education',
      '28': 'Science & Technology',
      '29': 'Nonprofits & Activism',
    };
    return mapping[categoryId] || 'Other';
  };

  const saveBlueprint = (video: Video, promptText: string) => {
    const category = getCategoryName(video.snippet?.categoryId);
    const newSaved = [
      { id: Date.now().toString(), videoId: video.id, title: video.snippet.title, prompt: promptText, category, date: new Date().toISOString(), tags: [] },
      ...savedBlueprints
    ];
    setSavedBlueprints(newSaved);
    localStorage.setItem('YT_REMAKER_SAVED', JSON.stringify(newSaved));
  };
  
  const deleteBlueprint = (id: string) => {
    const newSaved = savedBlueprints.filter(b => b.id !== id);
    setSavedBlueprints(newSaved);
    localStorage.setItem('YT_REMAKER_SAVED', JSON.stringify(newSaved));
  };

  const addTag = (id: string, tag: string) => {
    if (!tag.trim()) return;
    const newSaved = savedBlueprints.map(b => {
      if (b.id === id) {
        const currentTags = b.tags || [];
        if (!currentTags.includes(tag.trim())) {
          return { ...b, tags: [...currentTags, tag.trim()] };
        }
      }
      return b;
    });
    setSavedBlueprints(newSaved);
    localStorage.setItem('YT_REMAKER_SAVED', JSON.stringify(newSaved));
  };

  const removeTag = (id: string, tag: string) => {
    const newSaved = savedBlueprints.map(b => {
      if (b.id === id) {
        return { ...b, tags: (b.tags || []).filter((t: string) => t !== tag) };
      }
      return b;
    });
    setSavedBlueprints(newSaved);
    localStorage.setItem('YT_REMAKER_SAVED', JSON.stringify(newSaved));
  };

  const categories = [
    { id: '', name: 'General' },
    { id: '10', name: 'Music' },
    { id: '20', name: 'Gaming' },
    { id: '23', name: 'Comedy' },
    { id: '24', name: 'Entertainment' },
    { id: '28', name: 'Science & Tech' },
  ];

  const regions = [
    { id: 'ID', name: 'Indonesia' },
    { id: 'US', name: 'United States' },
    { id: 'GB', name: 'United Kingdom' },
    { id: 'JP', name: 'Japan' },
    { id: 'KR', name: 'South Korea' },
  ];

  useEffect(() => {
    if (activeTab === 'trending') fetchTrending();
  }, [category, region, activeTab]);

  const fetchTrending = async () => {
    setIsLoading(true);
    setError(null);
    try {
      let url = `/api/youtube/trending?regionCode=${region}`;
      if (category) url += `&videoCategoryId=${category}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error((await res.json()).error || 'Failed to fetch');
      const data = await res.json();
      setVideos(data.items || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    setError(null);
    try {
      const res = await fetch(`/api/youtube/search?q=${encodeURIComponent(searchQuery)}`);
      if (!res.ok) throw new Error((await res.json()).error || 'Failed to search');
      const data = await res.json();
      setSearchVideos(data.items || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSearching(false);
    }
  };

  const handleUrlSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!urlInput.trim()) return;
    
    setUrlLoading(true);
    setError(null);
    try {
      let videoId = '';
      try {
        const urlObj = new URL(urlInput);
        if (urlObj.hostname.includes('youtube.com')) {
          videoId = urlObj.searchParams.get('v') || '';
        } else if (urlObj.hostname.includes('youtu.be')) {
          videoId = urlObj.pathname.slice(1);
        }
      } catch {
        // Fallback or assume it's an ID
        videoId = urlInput;
      }

      if (!videoId) throw new Error("Invalid YouTube URL");

      const res = await fetch(`/api/youtube/video?id=${videoId}`);
      if (!res.ok) throw new Error((await res.json()).error || 'Failed to fetch video');
      const data = await res.json();
      
      if (data.items && data.items.length > 0) {
        setSelectedVideo(data.items[0]);
      } else {
        throw new Error("Video not found or is private");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUrlLoading(false);
    }
  };

  const handleVideoClick = (video: Video) => {
    if (isCompareMode) {
      if (selectedForCompare.find(v => v.id === video.id)) {
        setSelectedForCompare(prev => prev.filter(v => v.id !== video.id));
      } else if (selectedForCompare.length < 2) {
        const newSelected = [...selectedForCompare, video];
        setSelectedForCompare(newSelected);
        if (newSelected.length === 2) {
          setShowCompareModal(true);
        }
      }
    } else {
      setSelectedVideo(video);
    }
  };

  const renderVideoCard = (video: Video) => {
    const isSelected = selectedForCompare.some(v => v.id === video.id);
    return (
      <div 
        key={video.id} 
        onClick={() => handleVideoClick(video)}
        className={`group cursor-pointer flex flex-col bg-white/5 rounded-2xl border ${isSelected ? 'border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.4)]' : 'border-white/10'} overflow-hidden hover:bg-white/10 transition-all relative ${isCompareMode && selectedForCompare.length === 2 && !isSelected ? 'opacity-50 pointer-events-none' : ''}`}
      >
        {isCompareMode && (
          <div className="absolute top-2 left-2 z-10">
            {isSelected ? (
              <div className="bg-purple-500 rounded-md p-1 shadow-md">
                <CheckSquare size={20} className="text-white" />
              </div>
            ) : (
              <div className="bg-black/50 rounded-md p-1 backdrop-blur-sm border border-white/20">
                 <Square size={20} className="text-white/70" />
              </div>
            )}
          </div>
        )}
        <div className="relative aspect-video overflow-hidden bg-black/50">
          <img 
            src={video.snippet.thumbnails.high?.url || video.snippet.thumbnails.medium?.url || ''} 
            alt={video.snippet.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-300" />
          <div className="absolute bottom-2 right-2 bg-black/80 backdrop-blur-sm text-xs font-medium px-2 py-1 rounded-md flex items-center shadow-lg shadow-black/50">
            <PlaySquare size={12} className="mr-1.5 text-red-500" />
            {video.statistics?.viewCount ? `${(parseInt(video.statistics.viewCount) / 1000000).toFixed(1)}M views` : 'N/A'}
          </div>
        </div>
        <div className="p-4 flex items-start space-x-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 shrink-0 flex items-center justify-center font-bold text-sm shadow-md">
            {video.snippet.channelTitle.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-[15px] font-semibold text-white leading-snug line-clamp-2 group-hover:text-red-400 transition-colors">
              {video.snippet.title}
            </h3>
            <p className="text-xs text-gray-400 mt-1.5">{video.snippet.channelTitle}</p>
          </div>
        </div>
        {!isCompareMode && (
          <div className="px-4 pb-4 mt-auto">
            <button
              onClick={(e) => { e.stopPropagation(); setStatsVideo(video); }}
              className="w-full bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 hover:text-blue-300 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center transition-colors"
            >
              <BarChart2 size={14} className="mr-1.5" />
              Stats & Analytics
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderCompareBanner = () => {
    if (!isCompareMode) return null;
    return (
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#1a1a1a] border border-purple-500/50 shadow-2xl shadow-purple-500/20 px-6 py-4 rounded-full z-40 flex items-center space-x-4 animate-in slide-in-from-bottom-10">
        <span className="text-white font-medium whitespace-nowrap">
          {selectedForCompare.length === 0 ? "Select 1st video to compare" :
           selectedForCompare.length === 1 ? "Select 2nd video to compare" :
           "Ready to compare!"}
        </span>
        <button 
          onClick={() => { setIsCompareMode(false); setSelectedForCompare([]); }}
          className="text-gray-400 hover:text-white bg-white/10 px-3 py-1.5 rounded-full text-sm transition-colors"
        >
          Cancel
        </button>
        {selectedForCompare.length === 2 && (
          <button 
            onClick={() => setShowCompareModal(true)}
            className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-1.5 rounded-full text-sm font-semibold transition-colors shadow-lg shadow-purple-500/20"
          >
            Compare Now
          </button>
        )}
      </div>
    );
  };

  const filteredBlueprints = savedBlueprints.filter(bp => {
    if (!selectedTagFilter) return true;
    return bp.tags && bp.tags.includes(selectedTagFilter);
  });

  const groupedBlueprints = filteredBlueprints.reduce((acc, bp) => {
    const cat = bp.category || 'Uncategorized';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(bp);
    return acc;
  }, {} as Record<string, any[]>);

  const allTags = Array.from(new Set(savedBlueprints.flatMap(bp => bp.tags || []))).sort();

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white font-sans selection:bg-red-500/30">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-[#0f0f0f]/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-tr from-red-600 to-pink-600 p-2 rounded-xl shadow-lg shadow-red-500/20">
              <Youtube size={24} className="text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">YT Remaker Tools</h1>
          </div>
          
          <div className="hidden md:flex space-x-1 p-1 bg-white/5 border border-white/10 rounded-xl">
             <button 
                onClick={() => setActiveTab('trending')}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium flex items-center transition-all ${activeTab === 'trending' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'}`}
             >
                <TrendingUp size={16} className="mr-2" /> Trending
             </button>
             <button 
                onClick={() => setActiveTab('search')}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium flex items-center transition-all ${activeTab === 'search' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'}`}
             >
                <Search size={16} className="mr-2" /> Keyword Search
             </button>
             <button 
                onClick={() => setActiveTab('url')}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium flex items-center transition-all ${activeTab === 'url' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'}`}
             >
                <LinkIcon size={16} className="mr-2" /> From URL
             </button>
             <div className="w-px bg-white/10 mx-1"></div>
             <button 
                onClick={() => setActiveTab('saved')}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium flex items-center transition-all ${activeTab === 'saved' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'}`}
             >
                <Sparkles size={16} className="mr-2" /> Saved
             </button>
          </div>
        </div>
      </header>

      {/* Mobile Tabs */}
      <div className="md:hidden flex px-4 pt-4 space-x-2 overflow-x-auto hide-scrollbar">
         <button 
            onClick={() => setActiveTab('trending')}
            className={`flex-1 min-w-[100px] px-3 py-2 rounded-xl text-sm font-medium flex items-center justify-center transition-all ${activeTab === 'trending' ? 'bg-white/10 text-white border border-white/10' : 'bg-white/5 text-gray-400 border border-transparent'}`}
         >
            <TrendingUp size={16} className="mr-2" /> Trending
         </button>
         <button 
            onClick={() => setActiveTab('search')}
            className={`flex-1 min-w-[100px] px-3 py-2 rounded-xl text-sm font-medium flex items-center justify-center transition-all ${activeTab === 'search' ? 'bg-white/10 text-white border border-white/10' : 'bg-white/5 text-gray-400 border border-transparent'}`}
         >
            <Search size={16} className="mr-2" /> Search
         </button>
         <button 
            onClick={() => setActiveTab('url')}
            className={`flex-1 min-w-[100px] px-3 py-2 rounded-xl text-sm font-medium flex items-center justify-center transition-all ${activeTab === 'url' ? 'bg-white/10 text-white border border-white/10' : 'bg-white/5 text-gray-400 border border-transparent'}`}
         >
            <LinkIcon size={16} className="mr-2" /> URL
         </button>
         <button 
            onClick={() => setActiveTab('saved')}
            className={`flex-1 min-w-[100px] px-3 py-2 rounded-xl text-sm font-medium flex items-center justify-center transition-all ${activeTab === 'saved' ? 'bg-white/10 text-white border border-white/10' : 'bg-white/5 text-gray-400 border border-transparent'}`}
         >
            <Sparkles size={16} className="mr-2" /> Saved
         </button>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-8">
        
        {/* TAB: TRENDING */}
        {activeTab === 'trending' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
             <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 space-y-4 md:space-y-0">
                <div className="flex overflow-x-auto pb-2 md:pb-0 space-x-2 hide-scrollbar w-full md:w-auto">
                  {categories.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setCategory(cat.id)}
                      className={`whitespace-nowrap px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                        category === cat.id 
                        ? 'bg-white text-black shadow-md shadow-white/10' 
                        : 'bg-white/5 text-gray-400 hover:bg-white/15'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                       setIsCompareMode(!isCompareMode);
                       setSelectedForCompare([]);
                    }}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-sm font-medium transition-all border ${isCompareMode ? 'bg-purple-500/20 border-purple-500/50 text-purple-400' : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'}`}
                  >
                    <Split size={16} />
                    <span className="hidden sm:inline">{isCompareMode ? 'Cancel Compare' : 'Compare'}</span>
                  </button>
                  <div className="flex items-center space-x-2 bg-white/5 border border-white/10 rounded-xl p-1 shrink-0">
                     <Compass size={16} className="text-gray-400 ml-2" />
                     <select 
                       value={region}
                       onChange={(e) => setRegion(e.target.value)}
                       className="bg-transparent text-sm font-medium text-white px-2 py-1 outline-none cursor-pointer border-none"
                     >
                       {regions.map(r => <option key={r.id} value={r.id} className="bg-gray-900">{r.name}</option>)}
                     </select>
                  </div>
                </div>
             </div>

             {isLoading ? (
               <div className="flex flex-col items-center justify-center py-32 text-gray-400">
                 <Loader2 size={32} className="animate-spin mb-4 text-red-500" />
                 <p>Fetching trends...</p>
               </div>
             ) : error ? (
               <ErrorMessage message={error} />
             ) : (
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                 {videos.map(renderVideoCard)}
               </div>
             )}
          </div>
        )}

        {/* TAB: SEARCH */}
        {activeTab === 'search' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 max-w-5xl mx-auto">
             <form onSubmit={handleSearch} className="mb-10 relative">
               <input 
                 type="text" 
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 placeholder="Search a niche, topic, or channel..."
                 className="w-full bg-white/5 border border-white/10 text-white rounded-2xl py-4 pl-14 pr-32 text-lg focus:outline-none focus:ring-2 focus:ring-red-500/50 shadow-inner"
               />
               <Search size={22} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
               <button 
                 type="submit"
                 disabled={isSearching || !searchQuery.trim()}
                 className="absolute right-2 top-2 bottom-2 bg-white text-black font-semibold px-6 rounded-xl hover:bg-gray-200 disabled:opacity-50 transition-colors flex items-center"
               >
                 {isSearching ? <Loader2 size={18} className="animate-spin" /> : 'Search'}
               </button>
             </form>

             {searchVideos.length > 0 && !isSearching && !error && (
               <div className="flex justify-end mb-6">
                  <button
                    onClick={() => {
                       setIsCompareMode(!isCompareMode);
                       setSelectedForCompare([]);
                    }}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-sm font-medium transition-all border ${isCompareMode ? 'bg-purple-500/20 border-purple-500/50 text-purple-400' : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'}`}
                  >
                    <Split size={16} />
                    <span className="hidden sm:inline">{isCompareMode ? 'Cancel Compare' : 'Compare Videos'}</span>
                  </button>
               </div>
             )}

             {isSearching ? (
               <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                 <Loader2 size={32} className="animate-spin mb-4 text-purple-500" />
                 <p>Searching YouTube database...</p>
               </div>
             ) : error ? (
               <ErrorMessage message={error} />
             ) : searchVideos.length > 0 ? (
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                 {searchVideos.map(renderVideoCard)}
               </div>
             ) : (
               <div className="text-center py-20">
                  <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                     <Search size={32} className="text-gray-500" />
                  </div>
                  <h3 className="text-xl font-medium text-white mb-2">Find Viral Concepts</h3>
                  <p className="text-gray-400">Search for any topic to generate blueprints from top results.</p>
               </div>
             )}
          </div>
        )}

        {/* TAB: URL */}
        {activeTab === 'url' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 max-w-3xl mx-auto pt-10">
             <div className="text-center mb-10">
                <div className="w-20 h-20 bg-gradient-to-tr from-rose-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-red-500/20 rotate-3">
                   <LinkIcon size={32} className="text-white" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-4 tracking-tight">Direct URL Blueprint</h2>
                <p className="text-gray-400 text-lg">Paste a specific YouTube link to instantly generate a remake strategy.</p>
             </div>

             <form onSubmit={handleUrlSubmit} className="relative group">
               <div className="absolute -inset-0.5 bg-gradient-to-r from-red-500 to-purple-600 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
               <div className="relative flex items-center">
                 <input 
                   type="text" 
                   value={urlInput}
                   onChange={(e) => setUrlInput(e.target.value)}
                   placeholder="https://youtube.com/watch?v=..."
                   className="w-full bg-[#111] border border-white/10 text-white rounded-2xl py-5 pl-6 pr-36 text-lg focus:outline-none placeholder-gray-600"
                 />
                 <button 
                   type="submit"
                   disabled={urlLoading || !urlInput.trim()}
                   className="absolute right-2 top-2 bottom-2 bg-gradient-to-r from-red-600 to-pink-600 text-white font-semibold px-8 rounded-xl hover:shadow-lg hover:shadow-pink-500/30 disabled:opacity-50 transition-all flex items-center group-hover:scale-[0.98] active:scale-95"
                 >
                   {urlLoading ? <Loader2 size={20} className="animate-spin" /> : 'Analyze'}
                 </button>
               </div>
             </form>
             
             {error && <div className="mt-8"><ErrorMessage message={error} /></div>}
          </div>
        )}

        {/* TAB: SAVED */}
        {activeTab === 'saved' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
             <div className="flex items-center justify-between mb-8">
               <div>
                  <h2 className="text-2xl font-bold text-white mb-2">Saved Blueprints</h2>
                  <p className="text-gray-400">Library of your generated AI strategies</p>
               </div>
             </div>

             {savedBlueprints.length === 0 ? (
               <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/10">
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                     <Sparkles size={24} className="text-gray-500" />
                  </div>
                  <h3 className="text-lg font-medium text-white mb-2">No saved blueprints yet</h3>
                  <p className="text-gray-400 text-sm max-w-sm mx-auto">Generate a blueprint from a trending video and save it here for future reference.</p>
               </div>
             ) : (
               <div className="space-y-12">
                 {allTags.length > 0 && (
                   <div className="flex flex-wrap gap-2 items-center mb-4 bg-white/5 p-4 rounded-xl border border-white/10">
                     <Tag size={16} className="text-gray-400 mr-2" />
                     <button
                       onClick={() => setSelectedTagFilter('')}
                       className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${!selectedTagFilter ? 'bg-purple-600 text-white' : 'bg-white/10 text-gray-300 hover:bg-white/20'}`}
                     >
                       All
                     </button>
                     {allTags.map(tag => (
                       <button
                         key={tag}
                         onClick={() => setSelectedTagFilter(tag as string)}
                         className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors flex items-center ${selectedTagFilter === tag ? 'bg-purple-600 text-white' : 'bg-white/10 text-gray-300 hover:bg-white/20'}`}
                       >
                         {tag as string}
                       </button>
                     ))}
                   </div>
                 )}

                 {Object.keys(groupedBlueprints).length === 0 ? (
                   <div className="text-center py-10 text-gray-400">No blueprints found for this tag.</div>
                 ) : (
                   (Object.entries(groupedBlueprints) as [string, any[]][]).map(([category, bps]) => (
                     <div key={category}>
                       <div className="flex items-center space-x-3 mb-6 border-b border-white/10 pb-3">
                         <h3 className="text-xl font-bold tracking-tight text-white">{category}</h3>
                         <span className="bg-white/10 text-gray-300 text-xs px-2 py-0.5 rounded-full font-medium">{bps.length}</span>
                       </div>
                       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                         {bps.map((bp: any) => (
                           <BlueprintCard 
                             key={bp.id} 
                             bp={bp} 
                             deleteBlueprint={deleteBlueprint} 
                             setViewingPrompt={setViewingPrompt} 
                             addTag={addTag}
                             removeTag={removeTag}
                           />
                         ))}
                       </div>
                     </div>
                   ))
                 )}
               </div>
             )}
          </div>
        )}

      </main>

      {/* Detail Modal */}
      {selectedVideo && (
        <PromptModal 
          video={selectedVideo} 
          onClose={() => setSelectedVideo(null)} 
          onSave={(promptText) => { saveBlueprint(selectedVideo, promptText); setSelectedVideo(null); setActiveTab('saved'); }}
        />
      )}

      {/* Viewing Saved Prompt Modal */}
      {viewingPrompt && (
        <PromptModal 
          video={{ snippet: { title: viewingPrompt.videoTitle }, id: '' } as any} 
          existingPrompt={viewingPrompt.prompt}
          onClose={() => setViewingPrompt(null)} 
        />
      )}

      {/* Compare Modal */}
      {showCompareModal && selectedForCompare.length === 2 && (
        <CompareModal
          videos={selectedForCompare}
          onClose={() => setShowCompareModal(false)}
        />
      )}
      
      {/* Stats Modal */}
      {statsVideo && (
        <StatsModal 
          video={statsVideo} 
          onClose={() => setStatsVideo(null)} 
        />
      )}

      {renderCompareBanner()}
    </div>
  );
}

function StatsModal({ video, onClose }: { video: Video, onClose: () => void }) {
  const [data, setData] = useState<any[]>([]);
  const [timeframe, setTimeframe] = useState<'7' | '30' | '90'>('7');

  useEffect(() => {
    if (!video.statistics) return;
    
    const views = parseInt(video.statistics.viewCount || '0');
    const days = parseInt(timeframe);
    const dataPoints = [];
    let currentV = Math.max(Math.floor(views * 0.4), 10);
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const options: Intl.DateTimeFormatOptions = timeframe === '7' 
        ? { weekday: 'short', month: 'short', day: 'numeric' }
        : { month: 'short', day: 'numeric' };
      const dayStr = date.toLocaleDateString('en-US', options);
      
      if (i === 0) {
        currentV = views;
      } else {
        currentV += Math.floor((views - currentV) / i * (0.8 + Math.random() * 0.4));
      }

      dataPoints.push({
        date: dayStr,
        views: currentV
      });
    }
    setData(dataPoints);
  }, [video, timeframe]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#181818] border border-white/10 w-full max-w-3xl rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in sm:zoom-in-95 duration-300">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/5">
          <div className="text-white font-semibold flex items-center text-lg">
             <BarChart2 className="text-blue-400 mr-2" size={24} />
             Stats & Analytics
          </div>
          <button onClick={onClose} className="p-2 bg-white/5 hover:bg-red-500/20 hover:text-red-400 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="p-6">
           <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
             <h3 className="text-gray-300 font-medium text-sm">Estimated {timeframe}-Day View Trend for "{video.snippet.title}"</h3>
             <div className="flex bg-white/5 rounded-lg p-1 border border-white/10">
               {(['7', '30', '90'] as const).map(tf => (
                 <button
                   key={tf}
                   onClick={() => setTimeframe(tf)}
                   className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${timeframe === tf ? 'bg-blue-500 text-white shadow-md' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                 >
                   {tf} Days
                 </button>
               ))}
             </div>
           </div>
           <div className="h-[300px] w-full">
             <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" vertical={false} />
                  <XAxis dataKey="date" stroke="#888" tick={{ fill: '#888', fontSize: 12 }} minTickGap={30} />
                  <YAxis 
                    stroke="#888" 
                    tick={{ fill: '#888', fontSize: 12 }} 
                    tickFormatter={(val) => val >= 1000000 ? (val / 1000000).toFixed(1) + 'M' : val >= 1000 ? (val / 1000).toFixed(1) + 'K' : val}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1f1f1f', borderColor: '#ffffff20', color: '#fff', borderRadius: '8px' }}
                    itemStyle={{ color: '#60a5fa' }}
                    formatter={(value: number) => [new Intl.NumberFormat().format(value), 'Views']}
                  />
                  <Line type="monotone" dataKey="views" stroke="#60a5fa" strokeWidth={3} dot={timeframe === '7' ? { r: 4, fill: '#60a5fa', strokeWidth: 0 } : false} activeDot={{ r: 6, fill: '#fff', stroke: '#60a5fa', strokeWidth: 2 }} />
                </LineChart>
             </ResponsiveContainer>
           </div>
        </div>
      </div>
    </div>
  );
}

function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center text-red-400 max-w-2xl mx-auto my-10">
      <p className="font-semibold mb-2">Error encountered</p>
      <p className="text-sm opacity-80">{message}</p>
      <p className="text-xs mt-4 opacity-60">Check API Quotas and Key configurations.</p>
    </div>
  );
}

function PromptModal({ video, onClose, onSave, existingPrompt }: { video: Video; onClose: () => void; onSave?: (prompt: string) => void; existingPrompt?: string }) {
  const [prompt, setPrompt] = useState<string | null>(existingPrompt || null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [showRefineMenu, setShowRefineMenu] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showMetadata, setShowMetadata] = useState(false);
  const [analysisMode, setAnalysisMode] = useState<'content' | 'business' | 'audience' | 'data' | 'script' | 'thumbnail' | 'algorithm'>('content');
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowRefineMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const refinePrompt = async (type: string) => {
    if (!prompt) return;
    setIsRefining(true);
    setShowRefineMenu(false);
    setError(null);
    try {
      const res = await fetch('/api/refine-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: prompt, refinementType: type })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to refine prompt');
      }

      const data = await res.json();
      setPrompt(data.prompt);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsRefining(false);
    }
  };

  const generatePrompt = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const res = await fetch('/api/generate-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metadata: video,
          analysisMode
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to generate prompt');
      }

      const data = await res.json();
      setPrompt(data.prompt);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (prompt) {
      navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (!prompt) return;
    const blob = new Blob([prompt], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Blueprint_${video.snippet.title.replace(/[^a-z0-9]/gi, '_').substring(0, 30)}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#181818] border border-white/10 w-full max-w-4xl h-full sm:h-auto sm:max-h-[85vh] sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in sm:zoom-in-95 slide-in-from-bottom-4 duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/5 shrink-0">
          <div className="flex items-center min-w-0 pr-4">
             <div className="w-8 h-8 rounded-full overflow-hidden mr-3 shrink-0 relative hidden sm:block">
               <img src={video.snippet.thumbnails.high?.url} className="w-full h-full object-cover" alt="" />
             </div>
             <h2 className="text-base sm:text-lg font-bold text-white truncate">{video.snippet.title}</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 bg-white/5 hover:bg-red-500/20 hover:text-red-400 rounded-full transition-colors shrink-0"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-8 scroll-smooth custom-scrollbar relative">
          
          {/* Hero Section of the modal before generation */}
          {!prompt && !isGenerating && !error && (
            <div className="flex flex-col items-center text-center py-10 px-4 max-w-xl mx-auto">
               <div className="relative mb-8">
                  <div className="absolute inset-0 bg-purple-500 blur-2xl opacity-20 rounded-full"></div>
                  <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-2xl shadow-purple-500/20 relative border border-white/20">
                    <Sparkles size={36} className="text-white drop-shadow-md" />
                  </div>
               </div>
               <h3 className="text-3xl font-extrabold text-white mb-3">AI Video Strategist</h3>
               <p className="text-gray-400 mb-8 text-lg leading-relaxed">
                 Generate a complete psychological breakdown, hook script, and editing blueprint to recreate the success of this video.
               </p>

               <div className="flex flex-col sm:flex-row flex-wrap justify-center items-center gap-2 mb-8 bg-white/5 p-2 rounded-2xl border border-white/10 w-full">
                 <button
                   onClick={() => setAnalysisMode('content')}
                   className={`flex-1 min-w-[120px] px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${analysisMode === 'content' ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md' : 'text-gray-400 hover:text-white bg-white/5 hover:bg-white/10'}`}
                 >
                   Remake Blueprint 
                 </button>
                 <button
                   onClick={() => setAnalysisMode('business')}
                   className={`flex-1 min-w-[120px] px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${analysisMode === 'business' ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md' : 'text-gray-400 hover:text-white bg-white/5 hover:bg-white/10'}`}
                 >
                   Business Logic
                 </button>
                 <button
                   onClick={() => setAnalysisMode('audience')}
                   className={`flex-1 min-w-[120px] px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${analysisMode === 'audience' ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md' : 'text-gray-400 hover:text-white bg-white/5 hover:bg-white/10'}`}
                 >
                   Audience & Views
                 </button>
                 <button
                   onClick={() => setAnalysisMode('data')}
                   className={`flex-1 min-w-[120px] px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${analysisMode === 'data' ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md' : 'text-gray-400 hover:text-white bg-white/5 hover:bg-white/10'}`}
                 >
                   Data & SEO
                 </button>
                 <button
                   onClick={() => setAnalysisMode('script')}
                   className={`flex-1 min-w-[120px] px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${analysisMode === 'script' ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md' : 'text-gray-400 hover:text-white bg-white/5 hover:bg-white/10'}`}
                 >
                   Write Script
                 </button>
                 <button
                   onClick={() => setAnalysisMode('thumbnail')}
                   className={`flex-1 min-w-[120px] px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${analysisMode === 'thumbnail' ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md' : 'text-gray-400 hover:text-white bg-white/5 hover:bg-white/10'}`}
                 >
                   Title & Thumbnail
                 </button>
                 <button
                   onClick={() => setAnalysisMode('algorithm')}
                   className={`flex-1 min-w-[120px] px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${analysisMode === 'algorithm' ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md' : 'text-gray-400 hover:text-white bg-white/5 hover:bg-white/10'}`}
                 >
                   Algorithm Boost
                 </button>
               </div>

               <button 
                 onClick={generatePrompt}
                 className="group bg-white text-black font-bold px-10 py-4 rounded-xl hover:scale-105 active:scale-[0.98] transition-all shadow-xl shadow-white/10 flex items-center justify-center text-lg w-full sm:w-auto"
               >
                 <Sparkles size={22} className="mr-3 group-hover:rotate-12 transition-transform" />
                 Generate {analysisMode === 'content' ? 'Blueprint' : analysisMode === 'business' ? 'Business Strategy' : analysisMode === 'data' ? 'Data Analytics' : analysisMode === 'script' ? 'Video Script' : analysisMode === 'thumbnail' ? 'Thumbnail Ideas' : analysisMode === 'algorithm' ? 'Algorithm Engine' : 'Audience Analysis'}
               </button>
            </div>
          )}

          {isGenerating && (
            <div className="flex flex-col items-center justify-center py-32 text-center">
              <div className="relative w-24 h-24 mb-8">
                <div className="absolute inset-0 rounded-full border-4 border-white/5 border-t-purple-500 animate-spin" style={{ animationDuration: '1s' }}></div>
                <div className="absolute inset-3 rounded-full border-4 border-white/5 border-t-pink-500 animate-spin shadow-lg" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
                <div className="absolute inset-6 rounded-full border-4 border-white/5 border-t-indigo-500 animate-spin" style={{ animationDuration: '2s' }}></div>
                <div className="absolute inset-0 flex items-center justify-center">
                   <Sparkles size={24} className="text-purple-400 animate-pulse" />
                </div>
              </div>
              <p className="text-2xl font-bold text-white mb-2 tracking-tight">Extracting Video DNA...</p>
              <p className="text-gray-400 max-w-xs mx-auto">Analyzing retention patterns, psychological hooks, and visual pacing.</p>
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center text-red-400 max-w-lg mx-auto">
              <p className="font-semibold mb-2">Generation Failed</p>
              <p className="text-sm opacity-80">{error}</p>
              <button onClick={() => setError(null)} className="mt-4 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-sm transition-colors">Try Again</button>
            </div>
          )}

          {prompt && (
            <div className="animate-in fade-in slide-in-from-bottom-6 duration-500">
               <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0 sticky top-0 bg-[#181818]/90 backdrop-blur pb-4 z-10 border-b border-white/5">
                 <h3 className="text-2xl font-bold flex items-center text-white">
                   <Sparkles size={24} className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 mr-3" />
                   AI Strategy Blueprint
                 </h3>
                 <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                   <button 
                     onClick={() => setShowMetadata(!showMetadata)}
                     className={`flex-1 sm:flex-none flex justify-center items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${showMetadata ? 'bg-purple-500/20 text-purple-400' : 'bg-white/5 hover:bg-white/10 text-gray-300'}`}
                   >
                     <Code2 size={16} className="mr-2" />
                     Data
                   </button>
                   {!existingPrompt && (
                     <button 
                       onClick={generatePrompt}
                       className="flex-1 sm:flex-none flex justify-center items-center px-3 py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg text-sm font-medium transition-colors"
                     >
                       Retry
                     </button>
                   )}
                   {onSave && !existingPrompt && (
                     <button 
                       onClick={() => onSave(prompt)}
                       className="flex-1 sm:flex-none flex justify-center items-center px-3 py-2 bg-white/5 hover:bg-emerald-500/20 hover:text-emerald-400 text-gray-300 rounded-lg text-sm font-medium transition-colors"
                     >
                       <Save size={16} className="mr-2" />
                       Save
                     </button>
                   )}
                   <button 
                     onClick={handleDownload}
                     className="flex-1 sm:flex-none flex justify-center items-center px-3 py-2 bg-white/5 hover:bg-blue-500/20 hover:text-blue-400 text-gray-300 rounded-lg text-sm font-medium transition-colors"
                   >
                     <Download size={16} className="mr-1 sm:mr-2" />
                     <span className="hidden sm:inline">Download</span>
                   </button>
                   <div className="relative flex-1 sm:flex-none hidden sm:block" ref={menuRef}>
                     <button 
                       onClick={() => setShowRefineMenu(!showRefineMenu)}
                       className={`w-full flex justify-center items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${showRefineMenu ? 'bg-purple-500/20 text-purple-400' : 'bg-white/5 hover:bg-white/10 text-gray-300'}`}
                     >
                       <Settings2 size={16} className="mr-1 sm:mr-2" />
                       <span>Refine</span>
                     </button>
                     {showRefineMenu && (
                       <div className="absolute top-full right-0 mt-2 w-40 bg-[#1f1f1f] border border-white/10 rounded-xl shadow-xl overflow-hidden z-20">
                         <button onClick={() => refinePrompt('simplify')} className="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-purple-500/20 transition-colors">Simplify</button>
                         <button onClick={() => refinePrompt('professional')} className="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-purple-500/20 transition-colors border-t border-white/5">Professional</button>
                         <button onClick={() => refinePrompt('casual')} className="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-purple-500/20 transition-colors border-t border-white/5">Casual</button>
                       </div>
                     )}
                   </div>
                   <button 
                     onClick={handleCopy}
                     className={`flex-1 sm:flex-none flex justify-center items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${copied ? 'bg-emerald-500/20 text-emerald-400' : 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-500/20'}`}
                   >
                     {copied ? <CheckCircle2 size={16} className="mr-1 sm:mr-2" /> : <Copy size={16} className="mr-1 sm:mr-2" />}
                     <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
                   </button>
                 </div>
               </div>
               
               {showMetadata ? (
                 <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-4 sm:p-6 overflow-x-auto text-sm text-green-400 font-mono">
                    <pre>{JSON.stringify(video, null, 2)}</pre>
                 </div>
               ) : (
                 <div className="relative bg-[#0f0f0f] border border-white/5 rounded-2xl p-6 sm:p-10 font-serif leading-relaxed text-gray-300 shadow-inner min-h-[300px]">
                    {isRefining && (
                      <div className="absolute inset-0 bg-[#0f0f0f]/80 backdrop-blur-sm flex flex-col items-center justify-center rounded-2xl z-10 animate-in fade-in duration-200">
                        <Loader2 className="w-10 h-10 text-purple-500 animate-spin mb-4" />
                        <p className="text-white font-medium animate-pulse">Refining strategy tone...</p>
                      </div>
                    )}
                    <div className={`markdown-body prose prose-invert max-w-none text-[15px] sm:text-base prose-headings:font-sans prose-headings:text-white prose-a:text-purple-400 prose-strong:text-white prose-li:marker:text-purple-500 transition-opacity ${isRefining ? 'opacity-30' : 'opacity-100'}`}>
                       <MarkdownContent content={prompt} />
                    </div>
                 </div>
               )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CompareModal({ videos, onClose }: { videos: Video[], onClose: () => void }) {
  const [prompt, setPrompt] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const generateComparison = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const res = await fetch('/api/generate-comparison', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metadataA: videos[0],
          metadataB: videos[1]
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to generate comparison');
      }

      const data = await res.json();
      setPrompt(data.prompt);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (prompt) {
      navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#181818] border border-white/10 w-full max-w-5xl h-full sm:h-auto sm:max-h-[90vh] sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in sm:zoom-in-95 slide-in-from-bottom-4 duration-300">
        
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/5 shrink-0">
          <div className="flex items-center space-x-3 text-white font-semibold flex-1 min-w-0 pr-4">
             <Split size={20} className="text-purple-400" />
             <span className="truncate">Strategy Comparison</span>
          </div>
          <button 
            onClick={onClose}
            className="p-2 bg-white/5 hover:bg-red-500/20 hover:text-red-400 rounded-full transition-colors shrink-0"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-8 scroll-smooth custom-scrollbar relative">
          {!prompt && !isGenerating && !error && (
            <div className="flex flex-col items-center py-6 text-center">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-3xl mb-10">
                {videos.map((vid, idx) => (
                  <div key={vid.id || idx} className="bg-white/5 p-4 rounded-2xl border border-white/10 text-left">
                    <div className="text-xs text-purple-400 font-bold mb-2 uppercase tracking-wider">Video {idx === 0 ? 'A' : 'B'}</div>
                    <img src={vid.snippet.thumbnails.high?.url || vid.snippet.thumbnails.medium?.url} className="w-full aspect-video object-cover rounded-xl mb-3" alt="" />
                    <h3 className="text-sm font-semibold text-white line-clamp-2">{vid.snippet.title}</h3>
                  </div>
                ))}
              </div>
              <button 
                onClick={generateComparison}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold px-8 py-4 rounded-xl hover:scale-105 active:scale-[0.98] transition-all shadow-xl shadow-purple-500/20 flex items-center text-lg"
              >
                <Sparkles size={22} className="mr-3" />
                Generate Side-by-Side Analysis
              </button>
            </div>
          )}

          {isGenerating && (
            <div className="flex flex-col items-center justify-center py-32 text-center">
              <Loader2 className="w-12 h-12 text-purple-500 animate-spin mb-6" />
              <p className="text-2xl font-bold text-white mb-2 tracking-tight">Analyzing Duel Elements...</p>
              <p className="text-gray-400">Comparing hooks, retention structures, and metadata strategies.</p>
            </div>
          )}
          
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center text-red-400 max-w-lg mx-auto">
              <p className="font-semibold mb-2">Comparison Failed</p>
              <p className="text-sm opacity-80">{error}</p>
              <button onClick={() => setError(null)} className="mt-4 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-sm transition-colors">Try Again</button>
            </div>
          )}

          {prompt && (
            <div className="animate-in fade-in slide-in-from-bottom-6 duration-500">
               <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0 sticky top-0 bg-[#181818]/90 backdrop-blur pb-4 z-10 border-b border-white/5">
                 <h3 className="text-2xl font-bold flex items-center text-white">
                   <Split size={24} className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 mr-3" />
                   Comparison Blueprint
                 </h3>
                 <div className="flex space-x-2 w-full sm:w-auto">
                   <button 
                     onClick={handleCopy}
                     className={`flex-1 sm:flex-none flex justify-center items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${copied ? 'bg-emerald-500/20 text-emerald-400' : 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-500/20'}`}
                   >
                     {copied ? <CheckCircle2 size={16} className="mr-2" /> : <Copy size={16} className="mr-2" />}
                     {copied ? 'Copied' : 'Copy'}
                   </button>
                 </div>
               </div>
               
               <div className="bg-[#0f0f0f] border border-white/5 rounded-2xl p-6 sm:p-10 font-serif leading-relaxed text-gray-300 shadow-inner">
                  <div className="markdown-body prose prose-invert max-w-none text-[15px] sm:text-base prose-headings:font-sans prose-headings:text-white prose-a:text-purple-400 prose-strong:text-white prose-li:marker:text-purple-500">
                     <MarkdownContent content={prompt} />
                  </div>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Simple markdown formatter since we don't have react-markdown installed.
function MarkdownContent({ content }: { content: string }) {
  // Very basic markdown parsing for bold, lists, and headers
  return (
    <div className="space-y-4 whitespace-pre-wrap">
      {content.split('\n').map((line, i) => {
        if (line.startsWith('### ')) return <h4 key={i} className="text-lg font-bold mt-8 mb-2 text-pink-300">{line.replace('### ', '')}</h4>;
        if (line.startsWith('## ')) return <h3 key={i} className="text-xl font-bold mt-10 mb-3 text-purple-400 flex items-center"><span className="w-2 h-2 rounded-full bg-purple-500 mr-3 hidden sm:block"></span>{line.replace('## ', '')}</h3>;
        if (line.startsWith('# ')) return <h2 key={i} className="text-2xl font-extrabold mt-12 mb-4 tracking-tight border-b border-white/10 pb-2">{line.replace('# ', '')}</h2>;
        if (line.startsWith('- ')) return <li key={i} className="ml-4 sm:ml-6 list-disc pl-2 mb-1.5 marker:text-purple-500">{parseInlineStyles(line.replace('- ', ''))}</li>;
        if (line.trim() === '') return <div key={i} className="h-1"></div>;
        return <p key={i} className="mb-3">{parseInlineStyles(line)}</p>;
      })}
    </div>
  );
}

function parseInlineStyles(text: string) {
  // Very naive bold parser
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i} className="text-white font-semibold">{part.slice(2, -2)}</strong>;
        }
        return part;
      })}
    </>
  );
}

function BlueprintCard({ bp, deleteBlueprint, setViewingPrompt, addTag, removeTag }: any) {
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [newTag, setNewTag] = useState('');

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      addTag(bp.id, newTag);
      setNewTag('');
      setIsAddingTag(false);
    }
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-colors flex flex-col h-full relative group">
       <div className="flex justify-between items-start mb-4">
         <div className="bg-purple-500/20 text-purple-400 text-xs font-semibold px-2 py-1 rounded">
            {new Date(bp.date).toLocaleDateString()}
         </div>
         <button 
           onClick={() => deleteBlueprint(bp.id)}
           className="text-gray-500 hover:text-red-400 transition-colors p-1"
           title="Delete"
         >
           <X size={16} />
         </button>
       </div>
       
       <div className="relative w-full aspect-video mb-4 overflow-hidden rounded-xl bg-white/5 shrink-0">
         <img 
           src={`https://img.youtube.com/vi/${bp.videoId}/mqdefault.jpg`} 
           alt={bp.title} 
           className="object-cover w-full h-full opacity-80 group-hover:opacity-100 transition-opacity"
         />
       </div>

       <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">{bp.title}</h3>
       
       <div className="flex flex-wrap gap-1.5 mb-3">
         {(bp.tags || []).map((t: string) => (
           <span key={t} className="bg-white/10 text-gray-300 text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center group/tag">
             {t}
             <button onClick={() => removeTag(bp.id, t)} className="ml-1 opacity-0 group-hover/tag:opacity-100 transition-opacity hover:text-red-400">
               <X size={10} />
             </button>
           </span>
         ))}
         {isAddingTag ? (
           <input
             autoFocus
             type="text"
             value={newTag}
             onChange={e => setNewTag(e.target.value)}
             onKeyDown={handleAddTag}
             onBlur={() => {
               if (newTag.trim()) addTag(bp.id, newTag);
               setNewTag('');
               setIsAddingTag(false);
             }}
             className="bg-transparent border border-white/20 rounded-full px-2 py-0.5 text-[10px] text-white w-20 outline-none focus:border-purple-500"
             placeholder="Tag..."
           />
         ) : (
           <button 
             onClick={() => setIsAddingTag(true)}
             className="bg-transparent border border-white/20 border-dashed text-gray-400 hover:text-white px-2 py-0.5 rounded-full text-[10px] flex items-center transition-colors"
           >
             <Plus size={10} className="mr-0.5" /> Add Tag
           </button>
         )}
       </div>

       <p className="text-sm text-gray-400 line-clamp-3 mb-6 flex-1 mt-2">
         {bp.prompt.replace(/[*#]/g, '')}
       </p>
       <button 
         onClick={() => setViewingPrompt({videoTitle: bp.title, prompt: bp.prompt})}
         className="w-full py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-medium transition-colors mt-auto"
       >
         View Blueprint
       </button>
    </div>
  );
}
