import React, { useState } from 'react';
import { 
  X, 
  Minus, 
  Maximize2, 
  GripHorizontal, 
  Download, 
  Sparkles,
  Layers
} from 'lucide-react';

interface FloatingPiPViewerProps {
  image: string;
  sourceImage: string | null;
  onClose: () => void;
  onDownload: () => void;
  styleLabel: string;
}

export const FloatingPiPViewer: React.FC<FloatingPiPViewerProps> = ({
  image,
  sourceImage,
  onClose,
  onDownload,
  styleLabel,
}) => {
  const [position, setPosition] = useState({ x: 24, y: 80 }); // relative to bottom-right
  const [isMinimized, setIsMinimized] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showOriginal, setShowOriginal] = useState(false);

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const newX = Math.max(10, Math.min(window.innerWidth - 320, e.clientX - dragStart.x));
    const newY = Math.max(10, Math.min(window.innerHeight - 200, e.clientY - dragStart.y));
    setPosition({ x: newX, y: newY });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
  };

  const activeImg = showOriginal && sourceImage ? sourceImage : image;

  return (
    <div
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
      className={`fixed z-50 rounded-2xl shadow-2xl bg-slate-900/95 backdrop-blur-xl border border-slate-700 text-white overflow-hidden transition-all duration-150 ${
        isMinimized ? 'w-64' : 'w-72 sm:w-80'
      }`}
    >
      {/* Draggable Header */}
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="p-2.5 bg-slate-800/80 flex items-center justify-between cursor-grab active:cursor-grabbing border-b border-slate-700/60 select-none"
      >
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
          <GripHorizontal size={14} className="text-slate-500" />
          <span className="truncate max-w-[130px]">PiP: {styleLabel}</span>
        </div>

        <div className="flex items-center gap-1">
          {sourceImage && !isMinimized && (
            <button
              onClick={() => setShowOriginal(!showOriginal)}
              className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition-colors ${
                showOriginal ? 'bg-amber-500 text-black' : 'bg-slate-700 text-slate-300'
              }`}
              title="Toggle Foto Asli / AI"
            >
              {showOriginal ? 'Asli' : 'AI'}
            </button>
          )}
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-700 transition-colors"
            title={isMinimized ? 'Perbesar' : 'Minimalkan'}
          >
            {isMinimized ? <Maximize2 size={12} /> : <Minus size={12} />}
          </button>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-red-400 rounded hover:bg-slate-700 transition-colors"
            title="Tutup Jendela Mengambang"
          >
            <X size={12} />
          </button>
        </div>
      </div>

      {/* Body Content */}
      {!isMinimized && (
        <div className="p-3 space-y-2.5">
          <div className="relative aspect-square rounded-xl overflow-hidden bg-[linear-gradient(45deg,#334155_25%,transparent_25%),linear-gradient(-45deg,#334155_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#334155_75%),linear-gradient(-45deg,transparent_75%,#334155_75%)] [background-size:16px_16px] [background-position:0_0,0_8px,8px_-8px,-8px_0px] bg-slate-950/80 border border-slate-700/60">
            <img
              src={activeImg}
              alt="Floating Preview"
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
              draggable={false}
            />
            <span className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-md text-[10px] font-semibold text-white px-2 py-0.5 rounded">
              {showOriginal ? 'Foto Asli' : 'Bebas Frame'}
            </span>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-slate-400">Jendela Mengambang</span>
            <button
              onClick={onDownload}
              className="px-2.5 py-1 bg-[#800000] hover:bg-red-900 rounded-lg text-xs font-bold flex items-center gap-1 transition-all"
            >
              <Download size={11} /> Simpan
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
