import React, { useState, useRef } from 'react';
import { compressImage } from './utils/imageCompressor';
import { applyArtisticTransformation, ArtMode } from './utils/artisticFilter';
import { 
  Upload, 
  Download, 
  Sparkles, 
  Image as ImageIcon, 
  Loader2, 
  X, 
  RefreshCw, 
  Pencil, 
  Box, 
  Zap, 
  Grid3X3, 
  ShieldCheck, 
  Cloud, 
  Cpu, 
  User,
  Info,
  Maximize2,
  Minimize2,
  Palette,
  Car,
  BookOpen,
  Smile,
  Tv,
  Wind,
  Gauge,
  Feather,
  Shapes,
  Gamepad2,
  Camera,
  Leaf,
  Bot,
  Ghost,
  Aperture,
  Baby,
  Clapperboard,
  Star,
  MessageSquare,
  Brush,
  Film,
  FlaskConical,
  Waves,
  PenTool,
  Map
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Logo } from './components/Logo';

type Mode = ArtMode;

export default function App() {
  const [mode, setMode] = useState<Mode>('classic-seinen');
  const [isHD, setIsHD] = useState(false);
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [hoveredDesc, setHoveredDesc] = useState<string | null>(null);
  const [compareMode, setCompareMode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const styleModes = [
    { id: 'classic-seinen', label: 'Classic', desc: 'Anime klasik 90-an dengan shading kontras.', icon: <Wind />, color: 'text-red-900' },
    { id: 'modern-seinen', label: 'Modern', desc: 'Estetika anime modern 2020-an yang tajam.', icon: <Gauge />, color: 'text-amber-500' },
    { id: 'ghibli', label: 'Ghibli', desc: 'Gaya cat air nostalgia khas Studio Ghibli.', icon: <Leaf />, color: 'text-teal-500' },
    { id: 'cyberpunk', desc: 'Dunia masa depan dengan cahaya neon & tech.', label: 'Cyber', icon: <Bot />, color: 'text-pink-500' },
    { id: 'sketch', label: 'Sketchy', desc: 'Gaya bebas penuh energi, spontan dan ekspresif.', icon: <Feather />, color: 'text-slate-500' },
    { id: 'pixel-art', label: 'Pixel', desc: 'Mahakarya retro 16-bit penuh nostalgia.', icon: <Gamepad2 />, color: 'text-purple-500' },
    { id: 'vector', label: 'Vector', desc: 'Ilustrasi vektor bersih dan modern.', icon: <Shapes />, color: 'text-indigo-500' },
    { id: 'silhouette', label: 'Siluet', desc: 'Minimalis artistik dengan ruang negatif.', icon: <Ghost />, color: 'text-slate-800' },
    { id: 'neo-pop', label: 'Neo Pop', desc: 'Ilustrasi pop art modern dengan warna berani.', icon: <Aperture />, color: 'text-orange-500' },
    { id: 'urban-chibi', label: 'Urban Chibi', desc: 'Karakter imut dengan gaya streetwear modern.', icon: <Baby />, color: 'text-yellow-500' },
    { id: 'comic-cartoon', label: 'Cartoon', desc: 'Perpaduan gaya kartun ekspresif & komik dinamik.', icon: <Clapperboard />, color: 'text-blue-400' },
    { id: 'hyper-anime', label: 'Hyper HD', desc: 'Anime resolusi tinggi dengan detail tekstur luar biasa.', icon: <Star />, color: 'text-rose-500' },
    { id: 'comic', label: 'Comic', desc: 'Buku komik Barat dengan shading berat.', icon: <MessageSquare />, color: 'text-red-500' },
    { id: 'photo-hd', label: 'Photo HD', desc: 'Restorasi foto super jernih & tajam.', icon: <Camera />, color: 'text-green-500' },
    { id: 'anime-redraw', label: 'Redraw', desc: 'Merekonstruksi adegan anime dengan sentuhan modern dan detail artistik baru.', icon: <Brush />, color: 'text-red-500' },
    { id: 'graffiti-mask', label: 'Graffiti', desc: 'Seni jalanan urban dengan efek cat semprot, stensil, dan garis berani.', icon: <Palette />, color: 'text-yellow-600' },
    { id: 'automotive-vibes', label: 'Auto Vibes', desc: 'Seni dinamis berfokus pada otomotif, menekankan kecepatan dan desain ramping.', icon: <Car />, color: 'text-blue-600' },
    { id: 'pixar-remaster', label: 'Pixar HD', desc: 'Gaya animasi 3D ultra-realistis khas Pixar dengan detail rumit.', icon: <Film />, color: 'text-cyan-500' },
    { id: 'artsy-experimental', label: 'Experimental', desc: 'Eksplorasi seni avant-garde dengan teknik tidak konvensional.', icon: <FlaskConical />, color: 'text-purple-600' },
    { id: 'korean-webtoon', label: 'Webtoon KR', desc: 'Gaya manhwa Webtoon Korea modern dengan garis bersih, pewarnaan trendi, dan estetika dramatis.', icon: <BookOpen />, color: 'text-pink-500' },
    { id: 'blue-ink-sketch', label: 'Blue Ink', desc: 'Sketsa pena tinta biru di atas kertas bertekstur, seperti gambar arsitektur atau pesisir klasik.', icon: <PenTool />, color: 'text-blue-800' },
    { id: 'vintage-travel-sketch', label: 'Vintage Travel', desc: 'Ilustrasi garis biru bersih bergaya poster travel vintage dengan sentuhan wash tipis.', icon: <Map />, color: 'text-indigo-600' },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Harap upload file gambar (PNG, JPG).');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setError('Ukuran file terlalu besar. Maksimal 15MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const raw = e.target?.result as string;
      try {
        // Compress client-side to ensure speedy uploads and prevent proxy limit errors
        const optimized = await compressImage(raw, 1280, 0.85);
        setSourceImage(optimized);
      } catch {
        setSourceImage(raw);
      }
      setGeneratedImage(null);
      setError(null);
      setNotice(null);
      setCompareMode(false);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const generateImage = async (isEnhancing = false) => {
    const targetImage = isEnhancing ? generatedImage : sourceImage;
    if (!targetImage) return;

    setIsGenerating(true);
    setError(null);
    setNotice(null);

    try {
      // Optimize image size to guarantee it never exceeds reverse proxy or cloud limits
      const optimizedImage = await compressImage(targetImage, isHD ? 1400 : 1000, 0.82);

      let data: any = null;
      let usedLocalFallback = false;

      try {
        const response = await fetch('/api/transform', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            image: optimizedImage,
            mode,
            isHD,
            isEnhancing,
          }),
        });

        const contentType = response.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          data = await response.json();
        } else {
          // Response is HTML or plain text (e.g., 413, 502, or proxy status page)
          const text = await response.text();
          console.warn('Server non-JSON response received:', text.slice(0, 150));
          usedLocalFallback = true;
        }
      } catch (networkErr) {
        console.warn('Network error reaching /api/transform, activating local engine:', networkErr);
        usedLocalFallback = true;
      }

      if (data?.success && data?.image) {
        setGeneratedImage(data.image);
        setNotice(null);
      } else if (data?.fallbackToLocalStylizer || usedLocalFallback || !data?.success) {
        // High quality artistic styling fallback
        const stylized = await applyArtisticTransformation(targetImage, mode as ArtMode, isHD);
        setGeneratedImage(stylized);
        setNotice(
          data?.error ||
          '✨ Gambar berhasil ditransformasikan dengan Artistic Style Engine! (Fitur generatif Gemini AI membutuhkan billing aktif di Google AI Studio).'
        );
      }
    } catch (err: any) {
      console.error('Generation error:', err);
      try {
        const stylized = await applyArtisticTransformation(targetImage, mode as ArtMode, isHD);
        setGeneratedImage(stylized);
        setNotice('✨ Ditransformasikan dengan Artistic Styling Engine.');
      } catch (fallbackErr) {
        setError('Gagal memproses gambar. Harap coba lagi dengan foto lain.');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadImage = () => {
    if (!generatedImage) return;
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `three-mister-transformation-${mode}-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const reset = () => {
    setSourceImage(null);
    setGeneratedImage(null);
    setError(null);
    setNotice(null);
    setCompareMode(false);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0f172a] font-sans selection:bg-red-100">
      {/* Navigation / Header */}
      <nav className={`sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 transition-all duration-700 ${isGenerating ? 'blur-sm opacity-60 pointer-events-none' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center p-1 border border-red-100 shadow-sm shadow-red-100/50">
              <Logo className="w-full h-full" color="#580305" />
            </div>
            <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[#800000] to-red-950">
              Three Mister Image Transformation
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-4 text-sm font-medium text-slate-500">
              <span className="flex items-center gap-1"><ShieldCheck size={14} className="text-green-500" /> Secure</span>
              <span className="flex items-center gap-1"><Zap size={14} className="text-amber-500" /> Fast</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className={`max-w-3xl mx-auto text-center mb-16 space-y-6 transition-all duration-700 ${isGenerating ? 'blur-md opacity-40 grayscale scale-[0.98]' : ''}`}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-red-50 text-[#800000] rounded-full text-sm font-bold tracking-wide uppercase border border-red-100"
          >
            <Logo className="w-4 h-4" color="#800000" />
            Three Mister AI Image Transformation
          </motion.div>
          <h1 className="text-5xl md:text-6xl font-black tracking-tight text-slate-900 leading-tight">
            Ubah Fotomu Menjadi <br />
            <span className="text-[#800000] italic">Karya Seni Digital</span>
          </h1>
          <p className="text-xl text-slate-600 max-w-xl mx-auto leading-relaxed">
            Gunakan teknologi Three Mister & Gemini AI tercanggih untuk mengubah portrait kamu menjadi berbagai gaya artistik ikonik secara instan.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Panel: Upload and Modes */}
          <section className={`lg:col-span-12 xl:col-span-5 space-y-10 transition-all duration-700 ${isGenerating ? 'blur-md opacity-40 grayscale pointer-events-none scale-[0.98]' : ''}`}>
            {/* Step 1: Mode Selection */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm">1</span>
                <h3 className="text-lg font-bold">Pilih Gaya Artistik</h3>
              </div>
              
              <div className="grid grid-cols-3 gap-3 relative">
                {styleModes.map((item, index) => (
                  <button
                    key={item.id}
                    onClick={() => setMode(item.id as Mode)}
                    onMouseEnter={() => setHoveredDesc(item.desc)}
                    onMouseLeave={() => setHoveredDesc(null)}
                    className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all group ${
                      mode === item.id 
                        ? 'border-[#800000] bg-red-50/50 shadow-sm' 
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className={`${item.color} scale-110 group-hover:scale-125 transition-transform`}>{item.icon}</div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
                      {index + 1}. {item.label}
                    </span>
                  </button>
                ))}

                {/* Styled Tooltip */}
                <AnimatePresence>
                  {hoveredDesc && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      className="absolute -bottom-14 left-0 right-0 bg-slate-900 text-white text-xs px-4 py-3 rounded-xl shadow-xl z-20 flex items-center gap-2 pointer-events-none"
                    >
                      <Info size={14} className="text-blue-400 shrink-0" />
                      {hoveredDesc}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Step 2: Quality & Upload */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm">2</span>
                  <h3 className="text-lg font-bold">Kualitas & Upload</h3>
                </div>
                
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="text-right">
                    <p className="text-xs font-bold text-slate-800">Ultra HD</p>
                    <p className="text-[10px] text-slate-500">Maksimum Detail</p>
                  </div>
                  <div 
                    onClick={() => setIsHD(!isHD)}
                    className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${isHD ? 'bg-[#800000]' : 'bg-slate-300'}`}
                  >
                    <motion.div
                      animate={{ x: isHD ? 24 : 0 }}
                      className="w-4 h-4 bg-white rounded-full shadow-lg"
                    />
                  </div>
                </label>
              </div>

              {!sourceImage ? (
                <motion.div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className="group relative border-2 border-dashed border-slate-300 rounded-[2rem] p-12 flex flex-col items-center justify-center gap-4 bg-white hover:border-[#800000] hover:bg-red-50/20 transition-all cursor-pointer"
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                  <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-400 group-hover:bg-red-100 group-hover:text-[#800000] transition-all transform group-hover:scale-110">
                    <Upload size={36} />
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-slate-900">Upload fotomu di sini</p>
                    <p className="text-sm text-slate-500 mt-1">Drag & drop atau klik untuk memilih file</p>
                  </div>
                  <div className="flex items-center gap-2 mt-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                    <Info size={12} /> PNG • JPG • Max 10MB
                  </div>
                </motion.div>
              ) : (
                <div className="space-y-8">
                  <div className="group relative aspect-[4/3] rounded-3xl overflow-hidden bg-slate-100 shadow-2xl border border-slate-200">
                    <img
                      src={sourceImage}
                      alt="Source"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        onClick={reset}
                        className="bg-white/90 text-red-600 px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-white"
                      >
                        <X size={18} /> Ganti Foto
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-4">
                    <button
                      onClick={() => generateImage(false)}
                      disabled={isGenerating}
                      className="relative overflow-hidden group bg-slate-900 disabled:bg-slate-400 text-white py-5 px-8 rounded-2xl font-bold text-xl flex items-center justify-center gap-3 shadow-xl transition-all active:scale-[0.98]"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="animate-spin" size={24} />
                          Menganalisis...
                        </>
                      ) : (
                        <>
                          <Sparkles size={24} className="text-red-400" />
                          Transform Now
                        </>
                      )}
                      
                      {/* Gloss effect */}
                      <div className="absolute inset-x-0 h-full w-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    </button>
                    
                    {error && (
                      <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-3 text-red-500 text-sm font-medium bg-red-50 p-4 rounded-xl border border-red-100"
                      >
                        <Info size={18} />
                        {error}
                      </motion.div>
                    )}

                    {notice && (
                      <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-start gap-3 text-amber-900 text-xs font-medium bg-amber-50 p-4 rounded-xl border border-amber-200 shadow-sm"
                      >
                        <Sparkles size={16} className="text-amber-600 shrink-0 mt-0.5" />
                        <p className="leading-relaxed">{notice}</p>
                      </motion.div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Right Panel: Output & Preview */}
          <section className={`lg:col-span-12 xl:col-span-7 h-full transition-all duration-700 ${isGenerating ? 'scale-[1.02] z-10' : ''}`}>
            <div className="sticky top-28 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-red-100 text-[#800000] flex items-center justify-center">
                    <ImageIcon size={18} />
                  </div>
                  <h3 className="text-lg font-bold">Pratinjau Hasil</h3>
                </div>
                
                {generatedImage && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCompareMode(!compareMode)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors ${
                        compareMode ? 'bg-[#800000] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {compareMode ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                      Compare
                    </button>
                    <button
                      onClick={downloadImage}
                      className="px-3 py-1.5 bg-green-50 text-green-600 hover:bg-green-100 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors"
                    >
                      <Download size={16} />
                      Save
                    </button>
                  </div>
                )}
              </div>

              <div className="relative aspect-[4/3] rounded-[2.5rem] bg-white shadow-2xl border border-slate-200 overflow-hidden group">
                <AnimatePresence mode="wait">
                  {generatedImage ? (
                    <motion.div
                      key="result-container"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="w-full h-full"
                    >
                      {compareMode ? (
                        <div className="grid grid-cols-2 h-full gap-0.5 bg-slate-200">
                          <div className="relative">
                            <img src={sourceImage!} className="w-full h-full object-cover" referrerPolicy="no-referrer" alt="Original" />
                            <span className="absolute bottom-4 left-4 bg-black/50 text-white text-[10px] font-bold px-2 py-1 rounded uppercase">Original</span>
                          </div>
                          <div className="relative">
                            <img src={generatedImage} className="w-full h-full object-cover" referrerPolicy="no-referrer" alt="Generated" />
                            <span className="absolute bottom-4 left-4 bg-[#800000] text-white text-[10px] font-bold px-2 py-1 rounded uppercase">Generated</span>
                          </div>
                        </div>
                      ) : (
                        <img
                          src={generatedImage}
                          alt={`Digital Style ${mode}`}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      )}
                    </motion.div>
                  ) : isGenerating ? (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="h-full flex flex-col items-center justify-center p-12 text-center bg-slate-50"
                    >
                      <div className="relative mb-8">
                        <div className="w-24 h-24 border-4 border-red-100 border-t-[#800000] rounded-full animate-spin" />
                        <div className="absolute inset-0 flex items-center justify-center text-[#800000]">
                          <RefreshCw size={32} className="animate-pulse" />
                        </div>
                      </div>
                      <div className="space-y-4 max-w-sm">
                        <h4 className="text-2xl font-black text-slate-900">Menyihir Fotomu...</h4>
                        <p className="text-slate-500 leading-relaxed font-medium">
                          Sedang merender gaya <span className="text-[#800000] font-bold uppercase">{mode}</span> 
                          {isHD && ' dalam resolusi tinggi'}. Proses ini membutuhkan waktu sekitar 10-20 detik.
                        </p>
                      </div>
                      
                      {/* Mock loading steps */}
                      <div className="mt-8 flex gap-2">
                        {[0, 1, 2].map((i) => (
                          <div key={i} className="h-1 w-8 bg-red-200 rounded-full overflow-hidden">
                            <motion.div 
                              className="h-full bg-[#800000]"
                              animate={{ x: ['-100%', '100%'] }}
                              transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.3 }}
                            />
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-300 p-12 text-center">
                      <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center border-4 border-dashed border-slate-100 mb-6 group-hover:scale-105 transition-transform">
                        <ImageIcon size={48} />
                      </div>
                      <p className="font-bold text-slate-900 text-lg">Siap Beraksi</p>
                      <p className="text-slate-400 max-w-xs mt-2 font-medium italic">
                        Hasil artistik kamu akan tampil di sini. Klik "Transform Now" untuk memulai keajaiban.
                      </p>
                    </div>
                  )}
                </AnimatePresence>
                
                {/* Interaction Overlay */}
                {generatedImage && !isGenerating && (
                  <div className="absolute bottom-6 inset-x-6 flex gap-3 pointer-events-none">
                    <div className="pointer-events-auto flex w-full">
                      <button 
                        onClick={() => generateImage(false)}
                        className="flex-1 bg-white/90 backdrop-blur-sm border border-slate-200 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-white shadow-xl transition-all"
                      >
                        <RefreshCw size={18} className="text-[#800000]" /> Regen
                      </button>
                      <button 
                        onClick={downloadImage}
                        className="ml-3 px-6 bg-[#800000] text-white rounded-2xl font-bold shadow-xl hover:bg-red-900 transition-all flex items-center gap-2"
                      >
                        <Download size={18} />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {generatedImage && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-[#800000] rounded-3xl p-6 text-white flex items-center justify-between shadow-2xl shadow-red-200"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                      <Zap size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold">Upgrade ke 4K Ultra HD?</h4>
                      <p className="text-sm text-red-100">Sempurnakan detail dan ketajaman hasil.</p>
                    </div>
                  </div>
                  <button
                    onClick={() => generateImage(true)}
                    disabled={isGenerating}
                    className="bg-white text-[#800000] px-6 py-3 rounded-xl font-black text-sm uppercase tracking-wide hover:bg-red-50 transition-colors shadow-lg active:scale-95"
                  >
                    Enhance
                  </button>
                </motion.div>
              )}
            </div>
          </section>
        </div>
      </main>

      {/* Footer Section */}
      <footer className="bg-slate-900 text-slate-400 py-20 mt-20 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-4 gap-12">
          <div className="md:col-span-2 space-y-6">
            <div className="flex items-center gap-3 text-white">
              <div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center p-1.5 border border-white/10">
                <Logo className="w-full h-full" color="#ffffff" />
              </div>
              <span className="text-2xl font-bold">Three Mister Image Transformation</span>
            </div>
            <p className="max-w-md text-slate-500 leading-relaxed">
              Platform AI tercanggih untuk transformasi visual. Nikmati kemudahan mengubah foto favoritmu menjadi karya seni digital dengan satu klik.
            </p>
          </div>
          
          <div className="space-y-4">
            <h5 className="text-white font-bold uppercase text-xs tracking-widest">Teknologi</h5>
            <ul className="space-y-2 text-sm">
              <li>Neural Artist Engine</li>
              <li>HD Upscaling</li>
            </ul>
          </div>
          
          <div className="space-y-4">
            <h5 className="text-white font-bold uppercase text-xs tracking-widest">Informasi</h5>
            <p className="text-xs">© 2026 Three Mister Image Transformation. Seluruh hak cipta dilindungi.</p>
            <div className="flex gap-4">
              <span className="text-white hover:text-red-800 cursor-pointer">Terms</span>
              <span className="text-white hover:text-red-800 cursor-pointer">Privacy</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
