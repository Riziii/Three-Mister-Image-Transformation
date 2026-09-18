import React, { useState, useEffect, useCallback } from 'react';
import { 
  X, 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  Download, 
  Sparkles, 
  RefreshCw,
  Maximize2,
  Minimize2,
  Info
} from 'lucide-react';

interface CinemaFramelessModalProps {
  isOpen: boolean;
  onClose: () => void;
  sourceImage: string | null;
  generatedImage: string | null;
  styleName: string;
  onDownload: () => void;
}

export const CinemaFramelessModal: React.FC<CinemaFramelessModalProps> = ({
  isOpen,
  onClose,
  sourceImage,
  generatedImage,
  styleName,
  onDownload,
}) => {
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [activeTab, setActiveTab] = useState<'generated' | 'source'>('generated');
  const [showHUD, setShowHUD] = useState(true);
  const [bgMode, setBgMode] = useState<'transparent-checker' | 'transparent-clean' | 'dark'>('transparent-checker');

  // Reset when opened
  useEffect(() => {
    if (isOpen) {
      setScale(1);
      setRotation(0);
      setActiveTab(generatedImage ? 'generated' : 'source');
    }
  }, [isOpen, generatedImage]);

  // Keyboard shortcut (ESC)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
      if (e.key === '+' || e.key === '=') setScale((s) => Math.min(s + 0.25, 4));
      if (e.key === '-') setScale((s) => Math.max(s - 0.25, 0.4));
      if (e.key === '0') { setScale(1); setRotation(0); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const currentDisplayImage = activeTab === 'generated' ? (generatedImage || sourceImage) : sourceImage;

  const getBackdropClass = () => {
    if (bgMode === 'transparent-checker') {
      return 'bg-[linear-gradient(45deg,#334155_25%,transparent_25%),linear-gradient(-45deg,#334155_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#334155_75%),linear-gradient(-45deg,transparent_75%,#334155_75%)] [background-size:24px_24px] [background-position:0_0,0_12px,12px_-12px,-12px_0px] bg-slate-950/85 backdrop-blur-xl';
    }
    if (bgMode === 'transparent-clean') {
      return 'bg-black/35 backdrop-blur-md';
    }
    return 'bg-black/95 backdrop-blur-2xl';
  };

  return (
    <div className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center select-none overflow-hidden animate-fadeIn ${getBackdropClass()}`}>
      {/* Top Floating Glass Header */}
      <div 
        className={`absolute top-6 inset-x-6 z-30 flex items-center justify-between transition-opacity duration-300 ${
          showHUD ? 'opacity-100' : 'opacity-20 hover:opacity-100'
        }`}
      >
        <div className="flex items-center gap-3 bg-neutral-900/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-neutral-800 text-white shadow-2xl">
          <div className="w-7 h-7 rounded-lg bg-[#800000] flex items-center justify-center">
            <Sparkles size={16} className="text-red-200" />
          </div>
          <div>
            <p className="text-xs font-bold leading-none">Mode Bioskop Bebas Frame</p>
            <p className="text-[11px] text-neutral-400 capitalize mt-0.5">Gaya: {styleName}</p>
          </div>
        </div>

        {/* Source vs Generated Switcher */}
        {sourceImage && generatedImage && (
          <div className="flex items-center bg-neutral-900/80 backdrop-blur-md p-1 rounded-2xl border border-neutral-800 text-xs font-semibold text-white shadow-2xl">
            <button
              onClick={() => setActiveTab('source')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                activeTab === 'source' ? 'bg-neutral-800 text-white font-bold' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Foto Asli
            </button>
            <button
              onClick={() => setActiveTab('generated')}
              className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all ${
                activeTab === 'generated' ? 'bg-[#800000] text-white font-bold' : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Sparkles size={13} className="text-red-300" /> Hasil AI
            </button>
          </div>
        )}

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-10 h-10 rounded-2xl bg-neutral-900/80 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-white flex items-center justify-center transition-all shadow-2xl"
          title="Tutup Mode Bioskop (ESC)"
        >
          <X size={20} />
        </button>
      </div>

      {/* Main Frameless Display Stage */}
      <div 
        className="w-full h-full flex items-center justify-center p-4 sm:p-8 cursor-default"
        onClick={() => setShowHUD(!showHUD)}
      >
        {currentDisplayImage ? (
          <div
            style={{
              transform: `scale(${scale}) rotate(${rotation}deg)`,
              transition: 'transform 0.15s ease-out',
            }}
            className="will-change-transform max-w-full max-h-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={currentDisplayImage}
              alt="Cinema Frameless Display"
              className="max-w-[92vw] max-h-[85vh] object-contain rounded-2xl shadow-[0_20px_70px_rgba(0,0,0,0.9)]"
              referrerPolicy="no-referrer"
              draggable={false}
            />
          </div>
        ) : (
          <p className="text-neutral-500 font-medium">Tidak ada gambar yang dimuat</p>
        )}
      </div>

      {/* Bottom Floating Control Bar */}
      <div 
        className={`absolute bottom-6 inset-x-6 z-30 flex items-center justify-center gap-2 transition-opacity duration-300 pointer-events-none ${
          showHUD ? 'opacity-100' : 'opacity-20 hover:opacity-100'
        }`}
      >
        <div className="pointer-events-auto flex items-center gap-2 bg-neutral-900/85 backdrop-blur-md px-3 py-2 rounded-2xl border border-neutral-800 text-white shadow-2xl">
          <button
            onClick={() => setScale((s) => Math.max(s - 0.2, 0.4))}
            className="p-2 hover:bg-neutral-800 rounded-xl text-neutral-300 hover:text-white transition-colors"
            title="Perkecil (-)"
          >
            <ZoomOut size={17} />
          </button>
          <span className="text-xs font-mono font-semibold px-1 text-emerald-400">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={() => setScale((s) => Math.min(s + 0.2, 4))}
            className="p-2 hover:bg-neutral-800 rounded-xl text-neutral-300 hover:text-white transition-colors"
            title="Perbesar (+)"
          >
            <ZoomIn size={17} />
          </button>
          <div className="h-4 w-px bg-neutral-700" />
          <button
            onClick={() => setRotation((r) => (r + 90) % 360)}
            className="p-2 hover:bg-neutral-800 rounded-xl text-neutral-300 hover:text-white transition-colors"
            title="Rotasi 90 Derajat"
          >
            <RotateCw size={17} />
          </button>
          <button
            onClick={() => { setScale(1); setRotation(0); }}
            className="p-2 hover:bg-neutral-800 rounded-xl text-neutral-300 hover:text-white transition-colors"
            title="Reset Ukuran (0)"
          >
            <RefreshCw size={17} />
          </button>
          
          <div className="h-4 w-px bg-neutral-700 mx-1" />

          {/* Latar Belakang Transparan Selector */}
          <div className="flex items-center gap-0.5 bg-neutral-800/80 p-0.5 rounded-xl text-[11px] font-semibold">
            <button
              onClick={() => setBgMode('transparent-checker')}
              className={`px-2 py-1 rounded-lg transition-all ${
                bgMode === 'transparent-checker' ? 'bg-white text-neutral-900 font-bold' : 'text-neutral-400 hover:text-white'
              }`}
              title="Latar Belakang Catur Transparan"
            >
              Catur
            </button>
            <button
              onClick={() => setBgMode('transparent-clean')}
              className={`px-2 py-1 rounded-lg transition-all ${
                bgMode === 'transparent-clean' ? 'bg-white text-neutral-900 font-bold' : 'text-neutral-400 hover:text-white'
              }`}
              title="Latar Belakang Bening Transparan"
            >
              Bening
            </button>
            <button
              onClick={() => setBgMode('dark')}
              className={`px-2 py-1 rounded-lg transition-all ${
                bgMode === 'dark' ? 'bg-neutral-700 text-white font-bold' : 'text-neutral-400 hover:text-white'
              }`}
              title="Latar Belakang Gelap"
            >
              Gelap
            </button>
          </div>

          {generatedImage && (
            <>
              <div className="h-4 w-px bg-neutral-700" />
              <button
                onClick={onDownload}
                className="bg-[#800000] hover:bg-red-900 text-white px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-lg transition-all"
              >
                <Download size={14} /> Unduh
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
