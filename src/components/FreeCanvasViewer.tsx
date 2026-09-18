import React, { useState, useRef, useEffect } from 'react';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  Grid, 
  RefreshCcw, 
  Sparkles,
  Download,
  Hand,
  Image as ImageIcon
} from 'lucide-react';
import { FrameAspectRatio, CanvasBgType } from '../types';

interface FreeCanvasViewerProps {
  sourceImage: string | null;
  generatedImage: string | null;
  aspectRatio: FrameAspectRatio;
  onDownload: () => void;
}

export const FreeCanvasViewer: React.FC<FreeCanvasViewerProps> = ({
  sourceImage,
  generatedImage,
  aspectRatio,
  onDownload,
}) => {
  const activeImage = generatedImage || sourceImage;
  const [selectedLayer, setSelectedLayer] = useState<'generated' | 'source' | 'dual'>(
    generatedImage ? 'generated' : 'source'
  );
  
  // Pan and Zoom states
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showGrid, setShowGrid] = useState(false);
  const [bgType, setBgType] = useState<CanvasBgType>('transparent-checker');

  const containerRef = useRef<HTMLDivElement>(null);

  // Sync active layer when generatedImage becomes available
  useEffect(() => {
    if (generatedImage) {
      setSelectedLayer('generated');
    }
  }, [generatedImage]);

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.15 : 0.88;
    setScale((prev) => Math.min(Math.max(prev * zoomFactor, 0.3), 5));
  };

  const resetCanvas = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
    setRotation(0);
  };

  const rotate90 = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const zoomIn = () => setScale((prev) => Math.min(prev * 1.25, 5));
  const zoomOut = () => setScale((prev) => Math.max(prev * 0.8, 0.3));

  const getAspectStyle = () => {
    switch (aspectRatio) {
      case '1:1': return 'aspect-square';
      case '4:5': return 'aspect-[4/5]';
      case '16:9': return 'aspect-[16/9]';
      case '9:16': return 'aspect-[9/16]';
      default: return 'aspect-auto max-h-[580px]';
    }
  };

  const getBgStyle = () => {
    if (bgType === 'transparent-checker') {
      return 'bg-[linear-gradient(45deg,#cbd5e1_25%,transparent_25%),linear-gradient(-45deg,#cbd5e1_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#cbd5e1_75%),linear-gradient(-45deg,transparent_75%,#cbd5e1_75%)] [background-size:20px_20px] [background-position:0_0,0_10px,10px_-10px,-10px_0px] bg-slate-50/90';
    }
    if (bgType === 'transparent-clean') {
      return 'bg-transparent';
    }
    return 'bg-slate-950';
  };

  if (!activeImage) {
    return (
      <div className="h-96 rounded-3xl bg-transparent border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 p-8 text-center">
        <ImageIcon size={48} className="mb-3 text-slate-300" />
        <p className="font-bold text-slate-700">Kanvas Bebas Belum Memiliki Gambar</p>
        <p className="text-sm text-slate-500 mt-1 max-w-sm">
          Unggah foto atau pilih salah satu sampel gambar di sebelah kiri untuk mulai menggunakan Kanvas Bebas Frame.
        </p>
      </div>
    );
  }

  return (
    <div className="relative rounded-3xl bg-transparent border border-slate-200/90 shadow-sm overflow-hidden select-none">
      {/* Top Floating Controls Bar */}
      <div className="absolute top-4 inset-x-4 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-1.5 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-slate-200/80 shadow-md text-slate-800">
          <span className="text-[11px] font-bold tracking-wide uppercase text-slate-500 flex items-center gap-1">
            <Hand size={13} className="text-[#800000]" /> Kanvas Bebas Transparan
          </span>
          <span className="text-slate-300">|</span>
          <span className="text-xs font-mono font-semibold text-emerald-600">
            {Math.round(scale * 100)}%
          </span>
          {rotation > 0 && (
            <span className="text-xs font-mono text-amber-600">
              {rotation}°
            </span>
          )}
        </div>

        {/* View Switcher: Original vs AI Result */}
        {sourceImage && generatedImage && (
          <div className="pointer-events-auto flex items-center bg-white/90 backdrop-blur-md p-1 rounded-2xl border border-slate-200/80 text-xs font-medium text-slate-800 shadow-md">
            <button
              onClick={() => setSelectedLayer('source')}
              className={`px-3 py-1 rounded-xl transition-all ${
                selectedLayer === 'source' ? 'bg-slate-800 text-white font-bold' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Foto Asli
            </button>
            <button
              onClick={() => setSelectedLayer('generated')}
              className={`px-3 py-1 rounded-xl flex items-center gap-1 transition-all ${
                selectedLayer === 'generated' ? 'bg-[#800000] text-white font-bold' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Sparkles size={12} className="text-red-200" /> Hasil AI
            </button>
            <button
              onClick={() => setSelectedLayer('dual')}
              className={`px-3 py-1 rounded-xl transition-all ${
                selectedLayer === 'dual' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Dua-Duanya
            </button>
          </div>
        )}
      </div>

      {/* Interactive Infinite Canvas Container with Transparent Background */}
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onWheel={handleWheel}
        className={`w-full h-[540px] md:h-[600px] flex items-center justify-center cursor-grab active:cursor-grabbing overflow-hidden ${getBgStyle()} ${
          showGrid
            ? 'after:content-[""] after:absolute after:inset-0 after:bg-[radial-gradient(#94a3b8_1px,transparent_1px)] after:[background-size:24px_24px] after:pointer-events-none'
            : ''
        }`}
      >
        <div
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale}) rotate(${rotation}deg)`,
            transformOrigin: 'center center',
            transition: isDragging ? 'none' : 'transform 0.1s ease-out',
          }}
          className="will-change-transform flex items-center justify-center pointer-events-none"
        >
          {selectedLayer === 'dual' && sourceImage && generatedImage ? (
            <div className="flex items-center gap-4 p-4 bg-white/60 backdrop-blur-md rounded-2xl border border-slate-200/80 shadow-xl">
              <div className="flex flex-col items-center gap-2">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider bg-white/80 px-2 py-0.5 rounded shadow-xs">Asli</span>
                <img
                  src={sourceImage}
                  alt="Original"
                  className={`max-w-[340px] sm:max-w-[420px] rounded-xl object-contain shadow-lg ${getAspectStyle()}`}
                  referrerPolicy="no-referrer"
                  draggable={false}
                />
              </div>
              <div className="flex flex-col items-center gap-2">
                <span className="text-[11px] font-bold text-white uppercase tracking-wider bg-[#800000] px-2 py-0.5 rounded shadow-xs">AI Hasil</span>
                <img
                  src={generatedImage}
                  alt="AI Result"
                  className={`max-w-[340px] sm:max-w-[420px] rounded-xl object-contain shadow-lg ${getAspectStyle()}`}
                  referrerPolicy="no-referrer"
                  draggable={false}
                />
              </div>
            </div>
          ) : (
            <div className="relative inline-block bg-transparent border-0 drop-shadow-2xl">
              <img
                src={
                  selectedLayer === 'source'
                    ? sourceImage || generatedImage!
                    : generatedImage || sourceImage!
                }
                alt="Frameless View"
                className={`max-w-[85vw] max-h-[75vh] object-contain rounded-xl ${getAspectStyle()}`}
                referrerPolicy="no-referrer"
                draggable={false}
              />
            </div>
          )}
        </div>
      </div>

      {/* Bottom Floating Control Bar */}
      <div className="absolute bottom-4 inset-x-4 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-1 bg-white/90 backdrop-blur-md p-1.5 rounded-2xl border border-slate-200/80 shadow-md text-slate-700">
          <button
            onClick={zoomOut}
            className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-600 hover:text-slate-900"
            title="Perkecil (-)"
          >
            <ZoomOut size={16} />
          </button>
          <button
            onClick={zoomIn}
            className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-600 hover:text-slate-900"
            title="Perbesar (+)"
          >
            <ZoomIn size={16} />
          </button>
          <div className="h-4 w-px bg-slate-200 mx-1" />
          <button
            onClick={rotate90}
            className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-600 hover:text-slate-900"
            title="Putar 90°"
          >
            <RotateCw size={16} />
          </button>
          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`p-2 rounded-xl transition-colors ${showGrid ? 'bg-amber-100 text-amber-800 font-bold' : 'hover:bg-slate-100 text-slate-600'}`}
            title="Toggle Kisi Grid Bantuan"
          >
            <Grid size={16} />
          </button>
          <button
            onClick={resetCanvas}
            className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-600 hover:text-slate-900"
            title="Reset Posisi & Skala"
          >
            <RefreshCcw size={16} />
          </button>

          <div className="h-4 w-px bg-slate-200 mx-1" />

          {/* Latar Belakang Transparan Selector */}
          <div className="flex items-center gap-0.5 bg-slate-100 p-0.5 rounded-xl text-[11px] font-semibold">
            <button
              onClick={() => setBgType('transparent-checker')}
              className={`px-2 py-1 rounded-lg transition-all ${
                bgType === 'transparent-checker' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Latar Belakang Pola Transparan Alpha"
            >
              Catur Transparan
            </button>
            <button
              onClick={() => setBgType('transparent-clean')}
              className={`px-2 py-1 rounded-lg transition-all ${
                bgType === 'transparent-clean' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Latar Belakang Bening Transparan Murni"
            >
              Bening
            </button>
            <button
              onClick={() => setBgType('dark-slate')}
              className={`px-2 py-1 rounded-lg transition-all ${
                bgType === 'dark-slate' ? 'bg-slate-800 text-white shadow-xs font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Latar Belakang Gelap"
            >
              Gelap
            </button>
          </div>
        </div>

        <div className="pointer-events-auto flex items-center gap-2">
          {generatedImage && (
            <button
              onClick={onDownload}
              className="bg-[#800000] hover:bg-red-900 text-white px-4 py-2.5 rounded-2xl font-bold text-xs flex items-center gap-2 shadow-lg shadow-red-900/20 transition-all active:scale-95"
            >
              <Download size={14} /> Unduh Bebas Frame
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
