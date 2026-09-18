import React, { useState, useRef, useCallback } from 'react';
import { 
  Columns, 
  Rows, 
  Sparkles, 
  Download, 
  Image as ImageIcon,
  ChevronsLeftRight,
  ChevronsUpDown
} from 'lucide-react';
import { FrameAspectRatio } from '../types';

interface SplitCurtainViewerProps {
  sourceImage: string | null;
  generatedImage: string | null;
  aspectRatio: FrameAspectRatio;
  onDownload: () => void;
}

export const SplitCurtainViewer: React.FC<SplitCurtainViewerProps> = ({
  sourceImage,
  generatedImage,
  aspectRatio,
  onDownload,
}) => {
  const [sliderPosition, setSliderPosition] = useState(50); // percentage 0 to 100
  const [orientation, setOrientation] = useState<'vertical' | 'horizontal'>('vertical');
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback((clientX: number, clientY: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();

    if (orientation === 'vertical') {
      const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
      const percentage = (x / rect.width) * 100;
      setSliderPosition(percentage);
    } else {
      const y = Math.max(0, Math.min(clientY - rect.top, rect.height));
      const percentage = (y / rect.height) * 100;
      setSliderPosition(percentage);
    }
  }, [orientation]);

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    handleMove(e.clientX, e.clientY);
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    handleMove(e.clientX, e.clientY);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
  };

  const getAspectStyle = () => {
    switch (aspectRatio) {
      case '1:1': return 'aspect-square';
      case '4:5': return 'aspect-[4/5]';
      case '16:9': return 'aspect-[16/9]';
      case '9:16': return 'aspect-[9/16]';
      default: return 'aspect-auto min-h-[440px] max-h-[620px]';
    }
  };

  if (!sourceImage || !generatedImage) {
    return (
      <div className="h-96 rounded-3xl bg-slate-50 border border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 p-8 text-center">
        <ImageIcon size={48} className="mb-3 text-slate-300" />
        <p className="font-bold text-slate-700">Tirai Geser Membutuhkan 2 Gambar</p>
        <p className="text-sm text-slate-500 mt-1 max-w-sm">
          Unggah foto asli dan lakukan transformasi AI terlebih dahulu untuk membuka mode komparasi tirai geser interaktif.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Top Toolbar */}
      <div className="flex items-center justify-between bg-white px-4 py-2.5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-700">Arah Tirai:</span>
          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setOrientation('vertical')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-colors ${
                orientation === 'vertical' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
              }`}
            >
              <Columns size={13} /> Vertikal
            </button>
            <button
              onClick={() => setOrientation('horizontal')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-colors ${
                orientation === 'horizontal' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
              }`}
            >
              <Rows size={13} /> Horizontal
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono font-bold text-slate-500 hidden sm:inline">
            Split: {Math.round(sliderPosition)}%
          </span>
          <button
            onClick={onDownload}
            className="px-3.5 py-1.5 bg-[#800000] text-white hover:bg-red-900 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Download size={13} /> Unduh Hasil
          </button>
        </div>
      </div>

      {/* Interactive Curtain Container with Transparent Background */}
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className={`relative w-full rounded-3xl overflow-hidden cursor-ew-resize select-none bg-[linear-gradient(45deg,#cbd5e1_25%,transparent_25%),linear-gradient(-45deg,#cbd5e1_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#cbd5e1_75%),linear-gradient(-45deg,transparent_75%,#cbd5e1_75%)] [background-size:20px_20px] [background-position:0_0,0_10px,10px_-10px,-10px_0px] bg-slate-50/90 border border-slate-200/90 shadow-sm flex items-center justify-center ${getAspectStyle()}`}
      >
        {/* Layer 1: Generated Image (Underneath) */}
        <img
          src={generatedImage}
          alt="AI Transformed"
          className="w-full h-full object-contain pointer-events-none"
          referrerPolicy="no-referrer"
          draggable={false}
        />

        {/* Layer 2: Source Image (Clipped) */}
        <div
          style={{
            clipPath:
              orientation === 'vertical'
                ? `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)`
                : `polygon(0 0, 100% 0, 100% ${sliderPosition}%, 0 ${sliderPosition}%)`,
          }}
          className="absolute inset-0 w-full h-full flex items-center justify-center pointer-events-none"
        >
          <img
            src={sourceImage}
            alt="Original Source"
            className="w-full h-full object-contain pointer-events-none"
            referrerPolicy="no-referrer"
            draggable={false}
          />
        </div>

        {/* Curtain Divider Line & Handle */}
        {orientation === 'vertical' ? (
          <div
            style={{ left: `${sliderPosition}%` }}
            className="absolute inset-y-0 w-1 bg-white shadow-[0_0_12px_rgba(0,0,0,0.8)] -translate-x-1/2 flex items-center justify-center pointer-events-none z-10"
          >
            <div className="w-9 h-9 rounded-full bg-slate-900 border-2 border-white text-white flex items-center justify-center shadow-xl">
              <ChevronsLeftRight size={18} className="text-amber-400" />
            </div>
          </div>
        ) : (
          <div
            style={{ top: `${sliderPosition}%` }}
            className="absolute inset-x-0 h-1 bg-white shadow-[0_0_12px_rgba(0,0,0,0.8)] -translate-y-1/2 flex items-center justify-center pointer-events-none z-10"
          >
            <div className="w-9 h-9 rounded-full bg-slate-900 border-2 border-white text-white flex items-center justify-center shadow-xl">
              <ChevronsUpDown size={18} className="text-amber-400" />
            </div>
          </div>
        )}

        {/* Labels */}
        <div className="absolute top-4 left-4 pointer-events-none z-20">
          <span className="bg-slate-950/80 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1 rounded-full border border-white/20 shadow-lg flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-slate-400" /> Foto Asli
          </span>
        </div>
        <div className="absolute top-4 right-4 pointer-events-none z-20">
          <span className="bg-[#800000]/90 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1 rounded-full border border-red-400/40 shadow-lg flex items-center gap-1.5">
            <Sparkles size={12} className="text-red-300" /> AI Masterpiece
          </span>
        </div>

        {/* Instruction hint */}
        <div className="absolute bottom-4 inset-x-0 flex justify-center pointer-events-none z-20">
          <span className="bg-slate-900/80 backdrop-blur-md text-slate-300 text-xs px-4 py-1.5 rounded-full border border-slate-700/60 shadow-lg">
            Geser pemisah ke kiri/kanan untuk melihat perbandingan bebas frame
          </span>
        </div>
      </div>
    </div>
  );
};
