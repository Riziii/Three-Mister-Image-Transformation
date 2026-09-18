import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { 
  Sparkles, 
  Download, 
  Maximize2, 
  Layers, 
  Zap, 
  ShieldCheck, 
  RotateCw,
  RefreshCw,
  Columns2,
  Move,
  PictureInPicture2,
  Check
} from 'lucide-react';
import { ArtisticStyleMode, FreeFrameMode, FrameAspectRatio } from './types';
import { ARTISTIC_STYLES } from './data/styles';
import { FreeFrameSelector } from './components/FreeFrameSelector';
import { StyleSelector } from './components/StyleSelector';
import { ImageUploader } from './components/ImageUploader';
import { FreeCanvasViewer } from './components/FreeCanvasViewer';
import { SplitCurtainViewer } from './components/SplitCurtainViewer';
import { CinemaFramelessModal } from './components/CinemaFramelessModal';
import { FloatingPiPViewer } from './components/FloatingPiPViewer';

// Initialize Gemini AI Client
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

export default function App() {
  // Artistic style state
  const [selectedStyle, setSelectedStyle] = useState<ArtisticStyleMode>('classic-seinen');
  const [isHD, setIsHD] = useState(false);
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Free Frame Access Mode states
  const [freeFrameMode, setFreeFrameMode] = useState<FreeFrameMode>('standard');
  const [aspectRatio, setAspectRatio] = useState<FrameAspectRatio>('free');
  const [isCinemaOpen, setIsCinemaOpen] = useState(false);
  const [isPiPOpen, setIsPiPOpen] = useState(false);
  const [compareStandard, setCompareStandard] = useState(false);

  const activeStyleObj = ARTISTIC_STYLES.find((s) => s.id === selectedStyle) || ARTISTIC_STYLES[0];

  // Handle switching to free frame modes
  const handleModeChange = (mode: FreeFrameMode) => {
    setFreeFrameMode(mode);
    if (mode === 'cinema-frameless') {
      setIsCinemaOpen(true);
    } else if (mode === 'floating-pip') {
      setIsPiPOpen(true);
    }
  };

  const handleDownload = () => {
    const target = generatedImage || sourceImage;
    if (!target) return;
    const link = document.createElement('a');
    link.href = target;
    link.download = `3mr-bebas-frame-${selectedStyle}-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleReset = () => {
    setSourceImage(null);
    setGeneratedImage(null);
    setError(null);
    setIsPiPOpen(false);
    setIsCinemaOpen(false);
    setFreeFrameMode('standard');
  };

  // AI Image Transformation using Gemini 2.5 Flash Image
  const generateTransformation = async (isEnhancing = false) => {
    const targetImage = isEnhancing ? generatedImage : sourceImage;
    if (!targetImage) {
      setError('Harap unggah atau pilih foto terlebih dahulu.');
      return;
    }

    if (!GEMINI_API_KEY) {
      setError('API Key Gemini tidak ditemukan. Harap pastikan variabel GEMINI_API_KEY telah dikonfigurasikan.');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const base64Data = targetImage.split(',')[1];
      const mimeType = targetImage.split(';')[0].split(':')[1] || 'image/jpeg';

      let prompt = activeStyleObj.prompt;
      if (isEnhancing) {
        prompt = "Perform a high-end AI HD enhancement on this image. Upscale resolution, fix blur, sharpen contours, and add pristine texture depth while maintaining exact style likeness.";
      } else if (isHD) {
        prompt += " Render in ultra-high definition with pristine clarity, razor-sharp outlines, and zero compression artifacts.";
      }

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            {
              inlineData: {
                data: base64Data,
                mimeType: mimeType,
              },
            },
            {
              text: prompt,
            },
          ],
        },
      });

      let foundImage = false;
      const candidates = response.candidates || [];
      const parts = candidates[0]?.content?.parts || [];

      for (const part of parts) {
        if (part.inlineData) {
          setGeneratedImage(`data:${part.inlineData.mimeType};base64,${part.inlineData.data}`);
          foundImage = true;
          break;
        } else if (part.text && !foundImage) {
          console.warn('AI response note:', part.text);
        }
      }

      if (!foundImage) {
        throw new Error('AI tidak dapat merender gambar baru untuk foto ini. Silakan coba gaya lain atau foto berbeda.');
      }
    } catch (err: any) {
      console.error('Generation error:', err);
      let errMsg = `Gagal memproses transformasi gaya ${activeStyleObj.label}.`;
      const errStr = typeof err === 'string' ? err : JSON.stringify(err);

      if (errStr.includes('429') || errStr.includes('RESOURCE_EXHAUSTED') || errStr.includes('high demand')) {
        errMsg = 'Server Gemini sedang melayani trafik padat (Rate Limit). Silakan tunggu sekitar 30 detik lalu coba lagi.';
      } else if (err.message) {
        errMsg = err.message;
      }
      setError(errMsg);
    } finally {
      setIsGenerating(false);
    }
  };

  const getAspectClass = () => {
    switch (aspectRatio) {
      case '1:1': return 'aspect-square';
      case '4:5': return 'aspect-[4/5]';
      case '16:9': return 'aspect-[16/9]';
      case '9:16': return 'aspect-[9/16]';
      default: return 'aspect-auto min-h-[400px] max-h-[580px]';
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-red-100 flex flex-col justify-between">
      {/* Navigation Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#800000] rounded-xl flex items-center justify-center text-white shadow-md shadow-red-900/20">
              <Sparkles size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black tracking-tight text-slate-900">
                  3MR <span className="text-[#800000]">Transformation</span>
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-100 text-amber-900 tracking-wider">
                  Bebas Frame
                </span>
              </div>
              <p className="text-[10px] text-slate-400 hidden md:block">
                Artistic AI Studio • Mode Akses Bebas Frame & Multi-Kanvas
              </p>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center gap-3 text-xs font-semibold text-slate-500 mr-2">
              <span className="flex items-center gap-1">
                <ShieldCheck size={14} className="text-emerald-500" /> Bebas Watermark
              </span>
              <span className="flex items-center gap-1">
                <Zap size={14} className="text-amber-500" /> Gemini Vision
              </span>
            </div>

            {(generatedImage || sourceImage) && (
              <button
                onClick={() => setIsCinemaOpen(true)}
                className="bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                title="Buka Pratinjau Layar Penuh Bioskop"
              >
                <Maximize2 size={14} /> Layar Penuh
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8 flex-1 w-full">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-[#800000] border border-red-200 text-xs font-bold uppercase tracking-wider">
            <Layers size={13} />
            <span>Fitur Baru: Mode Akses Bebas Frame</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-slate-900">
            Transformasi Foto Tanpa Batas <br />
            <span className="text-[#800000]">Mode Akses Bebas Frame</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Nikmati karya seni digital foto Anda dalam beragam mode akses bebas: kanvas tak terbatas dengan pan & zoom, tirai geser sebelum/sesudah, tampilan bioskop borderless, dan jendela mengambang.
          </p>
        </div>

        {/* Free Frame Access Mode Toolbar */}
        <FreeFrameSelector
          currentMode={freeFrameMode}
          onModeChange={handleModeChange}
          aspectRatio={aspectRatio}
          onAspectRatioChange={setAspectRatio}
          hasGeneratedImage={!!generatedImage}
        />

        {/* Studio Workspace Layout */}
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Styles & Upload Controls */}
          <div className="lg:col-span-5 space-y-8 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
            <StyleSelector
              styles={ARTISTIC_STYLES}
              selectedMode={selectedStyle}
              onSelectMode={setSelectedStyle}
            />

            <hr className="border-slate-100" />

            <ImageUploader
              sourceImage={sourceImage}
              onImageSelected={(b64) => {
                setSourceImage(b64);
                setGeneratedImage(null);
                setError(null);
              }}
              onReset={handleReset}
              isHD={isHD}
              onToggleHD={() => setIsHD(!isHD)}
              isGenerating={isGenerating}
              onTransform={() => generateTransformation(false)}
              error={error}
            />
          </div>

          {/* Right Column: Dynamic Stage based on Free Frame Mode */}
          <div className="lg:col-span-7 space-y-4">
            {/* View Mode Context Header */}
            <div className="flex items-center justify-between bg-white px-5 py-3 rounded-2xl border border-slate-200/80 shadow-xs">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  {freeFrameMode === 'standard' && 'Pratinjau Standar'}
                  {freeFrameMode === 'free-canvas' && 'Kanvas Bebas Frame (Pan & Zoom Aktif)'}
                  {freeFrameMode === 'split-curtain' && 'Tirai Geser Interaktif (Sebelum & Sesudah)'}
                  {freeFrameMode === 'cinema-frameless' && 'Bioskop Layar Penuh'}
                  {freeFrameMode === 'floating-pip' && 'Jendela Mengambang (PiP)'}
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-400 font-medium hidden sm:inline">Framing:</span>
                <span className="font-bold text-slate-700 uppercase bg-slate-100 px-2 py-0.5 rounded-md">
                  {aspectRatio === 'free' ? 'Bebas Asli' : aspectRatio}
                </span>
              </div>
            </div>

            {/* Dynamic Viewport Rendering */}
            {freeFrameMode === 'free-canvas' ? (
              <FreeCanvasViewer
                sourceImage={sourceImage}
                generatedImage={generatedImage}
                aspectRatio={aspectRatio}
                onDownload={handleDownload}
              />
            ) : freeFrameMode === 'split-curtain' ? (
              <SplitCurtainViewer
                sourceImage={sourceImage}
                generatedImage={generatedImage}
                aspectRatio={aspectRatio}
                onDownload={handleDownload}
              />
            ) : (
              /* Standard Boxed / Floating Hybrid View */
              <div className="space-y-4">
                <div className={`relative rounded-3xl bg-[linear-gradient(45deg,#cbd5e1_25%,transparent_25%),linear-gradient(-45deg,#cbd5e1_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#cbd5e1_75%),linear-gradient(-45deg,transparent_75%,#cbd5e1_75%)] [background-size:20px_20px] [background-position:0_0,0_10px,10px_-10px,-10px_0px] bg-slate-50/90 border border-slate-200/90 shadow-sm overflow-hidden flex items-center justify-center ${getAspectClass()}`}>
                  {generatedImage ? (
                    compareStandard && sourceImage ? (
                      <div className="grid grid-cols-2 w-full h-full gap-1 bg-slate-200/60 p-1">
                        <div className="relative flex items-center justify-center p-2 bg-transparent">
                          <img
                            src={sourceImage}
                            alt="Original"
                            className="max-h-[500px] w-full object-contain rounded-xl"
                            referrerPolicy="no-referrer"
                          />
                          <span className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded">
                            Foto Asli
                          </span>
                        </div>
                        <div className="relative flex items-center justify-center p-2 bg-transparent">
                          <img
                            src={generatedImage}
                            alt="AI Result"
                            className="max-h-[500px] w-full object-contain rounded-xl"
                            referrerPolicy="no-referrer"
                          />
                          <span className="absolute bottom-3 left-3 bg-[#800000]/90 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded">
                            Hasil AI
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center p-4 bg-transparent">
                        <img
                          src={generatedImage}
                          alt="AI Transformed"
                          className="max-h-[520px] max-w-full object-contain rounded-2xl drop-shadow-2xl"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    )
                  ) : sourceImage ? (
                    <div className="w-full h-full flex items-center justify-center p-4 bg-transparent">
                      <img
                        src={sourceImage}
                        alt="Uploaded Original"
                        className="max-h-[520px] max-w-full object-contain rounded-2xl opacity-90 drop-shadow-md"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  ) : (
                    <div className="text-center p-12 text-slate-500 space-y-3 bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/80 shadow-xs m-4">
                      <div className="w-16 h-16 rounded-3xl bg-red-50 border border-red-100 flex items-center justify-center mx-auto text-[#800000]">
                        <Sparkles size={28} />
                      </div>
                      <div>
                        <p className="text-base font-bold text-slate-800">Area Bebas Frame Siap</p>
                        <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                          Pilih gaya dan upload foto Anda atau coba sampel gambar untuk merender karya seni bebas bingkai berlatar transparan.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Standard Floating Controls when generated image is ready */}
                  {generatedImage && (
                    <div className="absolute top-4 right-4 flex items-center gap-2">
                      <button
                        onClick={() => setCompareStandard(!compareStandard)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 backdrop-blur-md shadow-lg ${
                          compareStandard
                            ? 'bg-[#800000] text-white'
                            : 'bg-slate-900/80 text-white hover:bg-slate-800'
                        }`}
                      >
                        <Columns2 size={13} /> {compareStandard ? 'Tutup Bandingkan' : 'Bandingkan'}
                      </button>
                      <button
                        onClick={() => setIsCinemaOpen(true)}
                        className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-white backdrop-blur-md shadow-lg transition-colors"
                        title="Perbesar Layar Penuh (Bioskop Zen)"
                      >
                        <Maximize2 size={14} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Bottom Action Cards */}
                {generatedImage && (
                  <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => generateTransformation(false)}
                        disabled={isGenerating}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
                      >
                        <RefreshCw size={13} /> Render Ulang
                      </button>
                      <button
                        onClick={() => generateTransformation(true)}
                        disabled={isGenerating}
                        className="px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
                      >
                        <Zap size={13} className="text-amber-600" /> Sempurnakan Ultra HD
                      </button>
                    </div>

                    <button
                      onClick={handleDownload}
                      className="px-5 py-2.5 bg-[#800000] hover:bg-red-900 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-sm transition-all active:scale-95"
                    >
                      <Download size={14} /> Unduh Bebas Frame
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Floating Picture-in-Picture Widget */}
      {isPiPOpen && (generatedImage || sourceImage) && (
        <FloatingPiPViewer
          image={(generatedImage || sourceImage)!}
          sourceImage={sourceImage}
          onClose={() => setIsPiPOpen(false)}
          onDownload={handleDownload}
          styleLabel={activeStyleObj.label}
        />
      )}

      {/* Cinema Zen Frameless Fullscreen Modal */}
      <CinemaFramelessModal
        isOpen={isCinemaOpen}
        onClose={() => setIsCinemaOpen(false)}
        sourceImage={sourceImage}
        generatedImage={generatedImage}
        styleName={activeStyleObj.label}
        onDownload={handleDownload}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-10 mt-16 text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-[#800000] rounded-lg flex items-center justify-center text-white">
              <Sparkles size={13} />
            </div>
            <span className="font-bold text-slate-800">
              3MR Transformation • Mode Akses Bebas Frame
            </span>
          </div>
          <p>© 2026 3MR AI Studio. Bebas batas bingkai foto dengan dukungan Gemini Vision.</p>
        </div>
      </footer>
    </div>
  );
}
