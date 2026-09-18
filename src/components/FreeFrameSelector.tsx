import React from 'react';
import { 
  Square, 
  Move, 
  Columns2, 
  Maximize, 
  PictureInPicture2,
  Sparkles,
  Crop,
  Layers
} from 'lucide-react';
import { FreeFrameMode, FrameAspectRatio } from '../types';

interface FreeFrameSelectorProps {
  currentMode: FreeFrameMode;
  onModeChange: (mode: FreeFrameMode) => void;
  aspectRatio: FrameAspectRatio;
  onAspectRatioChange: (ratio: FrameAspectRatio) => void;
  hasGeneratedImage: boolean;
}

export const FreeFrameSelector: React.FC<FreeFrameSelectorProps> = ({
  currentMode,
  onModeChange,
  aspectRatio,
  onAspectRatioChange,
  hasGeneratedImage,
}) => {
  const modes = [
    {
      id: 'standard' as FreeFrameMode,
      label: 'Standar',
      desc: 'Tampilan kartu proporsional dengan bingkai terstruktur',
      icon: <Square size={16} />,
      badge: 'Default',
    },
    {
      id: 'free-canvas' as FreeFrameMode,
      label: 'Kanvas Bebas',
      desc: 'Pan, zoom 50%-400% & rotasi tanpa batas terpotong bingkai',
      icon: <Move size={16} />,
      badge: 'Bebas Pan & Zoom',
    },
    {
      id: 'split-curtain' as FreeFrameMode,
      label: 'Tirai Geser',
      desc: 'Komparasi sebelum & sesudah dengan slider tirai real-time',
      icon: <Columns2 size={16} />,
      badge: 'Interaktif',
      disabled: !hasGeneratedImage,
    },
    {
      id: 'cinema-frameless' as FreeFrameMode,
      label: 'Bioskop Zen',
      desc: 'Layar penuh tanpa border bingkai (immersive borderless)',
      icon: <Maximize size={16} />,
      badge: 'Layar Penuh',
    },
    {
      id: 'floating-pip' as FreeFrameMode,
      label: 'Jendela PiP',
      desc: 'Jendela mengambang bebas yang dapat dipindahkan di layar',
      icon: <PictureInPicture2 size={16} />,
      badge: 'Floating',
    },
  ];

  const aspectRatios: { id: FrameAspectRatio; label: string; ratio: string }[] = [
    { id: 'free', label: 'Bebas Asli', ratio: 'Native' },
    { id: '1:1', label: '1:1', ratio: 'Persegi' },
    { id: '4:5', label: '4:5', ratio: 'Potret' },
    { id: '16:9', label: '16:9', ratio: 'Lanskap' },
    { id: '9:16', label: '9:16', ratio: 'Story' },
  ];

  return (
    <div id="free-frame-mode-toolbar" className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
            <Layers size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                Mode Akses Bebas Frame
              </h3>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Aktif
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Pilih cara menikmati dan memanipulasi gambar tanpa hambatan bingkai kaku
            </p>
          </div>
        </div>

        {/* Aspect ratio quick selector */}
        <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-xl border border-slate-200 text-xs">
          <span className="text-[11px] font-semibold text-slate-400 pl-2 pr-1 flex items-center gap-1">
            <Crop size={12} /> Framing:
          </span>
          {aspectRatios.map((item) => (
            <button
              key={item.id}
              onClick={() => onAspectRatioChange(item.id)}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all text-xs ${
                aspectRatio === item.id
                  ? 'bg-slate-900 text-white shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
              title={`Framing ${item.label} (${item.ratio})`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Access Mode Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
        {modes.map((m) => {
          const isActive = currentMode === m.id;
          return (
            <button
              key={m.id}
              onClick={() => !m.disabled && onModeChange(m.id)}
              disabled={m.disabled}
              title={m.disabled ? 'Perlu foto yang sudah ditransformasi AI dahulu' : m.desc}
              className={`relative text-left p-3 rounded-2xl border transition-all flex flex-col justify-between gap-1.5 ${
                isActive
                  ? 'border-[#800000] bg-red-50/50 text-[#800000] shadow-sm ring-1 ring-red-900/10'
                  : m.disabled
                  ? 'border-slate-100 bg-slate-50/50 text-slate-300 opacity-60 cursor-not-allowed'
                  : 'border-slate-200/80 bg-white hover:border-slate-300 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <div className={`p-1.5 rounded-lg ${isActive ? 'bg-[#800000] text-white' : 'bg-slate-100 text-slate-600'}`}>
                  {m.icon}
                </div>
                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${
                  isActive ? 'bg-red-100 text-[#800000]' : 'bg-slate-100 text-slate-500'
                }`}>
                  {m.badge}
                </span>
              </div>
              <div>
                <p className="text-xs font-bold">{m.label}</p>
                <p className="text-[11px] text-slate-500 line-clamp-1 leading-snug">{m.desc}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
