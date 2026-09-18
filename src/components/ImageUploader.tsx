import React, { useRef } from 'react';
import { 
  Upload, 
  Sparkles, 
  Loader2, 
  X, 
  ImageIcon, 
  Layers, 
  Zap,
  Info,
  CheckCircle2
} from 'lucide-react';
import { SampleImage } from '../types';
import { SAMPLE_IMAGES } from '../data/styles';

interface ImageUploaderProps {
  sourceImage: string | null;
  onImageSelected: (base64: string) => void;
  onReset: () => void;
  isHD: boolean;
  onToggleHD: () => void;
  isGenerating: boolean;
  onTransform: () => void;
  error: string | null;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  sourceImage,
  onImageSelected,
  onReset,
  isHD,
  onToggleHD,
  isGenerating,
  onTransform,
  error,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Harap pilih file gambar yang valid (PNG, JPG, WebP).');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert('Ukuran file maksimal adalah 10MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        onImageSelected(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  // Convert external sample URL to base64 via canvas so Gemini inlineData works reliably
  const loadSampleImage = async (sample: SampleImage) => {
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = sample.url;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || 800;
        canvas.height = img.naturalHeight || 600;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
          onImageSelected(dataUrl);
        }
      };
      img.onerror = () => {
        // Fallback directly
        onImageSelected(sample.url);
      };
    } catch {
      onImageSelected(sample.url);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
            2
          </span>
          <h3 className="text-base font-bold text-slate-900">Upload Foto & Kualitas</h3>
        </div>

        {/* HD Toggle */}
        <button
          type="button"
          onClick={onToggleHD}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
            isHD
              ? 'bg-[#800000] border-[#800000] text-white shadow-xs'
              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Zap size={13} className={isHD ? 'text-amber-300' : 'text-slate-400'} />
          <span>Ultra HD 4K</span>
          <span className={`w-2 h-2 rounded-full ${isHD ? 'bg-amber-300' : 'bg-slate-300'}`} />
        </button>
      </div>

      {!sourceImage ? (
        <div className="space-y-4">
          {/* Dropzone */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="group relative border-2 border-dashed border-slate-300 rounded-3xl p-8 flex flex-col items-center justify-center gap-3 bg-white hover:border-[#800000] hover:bg-red-50/20 transition-all cursor-pointer text-center"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
              }}
              accept="image/*"
              className="hidden"
            />
            <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-500 group-hover:bg-red-100 group-hover:text-[#800000] transition-all group-hover:scale-105">
              <Upload size={24} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">Tarik atau Pilih Foto Di Sini</p>
              <p className="text-xs text-slate-500 mt-0.5">Mendukung PNG, JPG, WebP (Maks. 10MB)</p>
            </div>
          </div>

          {/* Sample images quick-picker */}
          <div className="space-y-2">
            <p className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
              <Sparkles size={13} className="text-amber-500" /> Coba Gambar Sampel Instan:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {SAMPLE_IMAGES.map((sample) => (
                <button
                  key={sample.id}
                  onClick={() => loadSampleImage(sample)}
                  className="group relative rounded-xl overflow-hidden border border-slate-200 aspect-[4/3] bg-slate-100 text-left transition-all hover:border-[#800000] hover:shadow-md"
                >
                  <img
                    src={sample.url}
                    alt={sample.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-1.5">
                    <span className="text-[10px] font-bold text-white leading-tight">
                      {sample.title}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative aspect-[4/3] max-h-64 rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 group">
            <img
              src={sourceImage}
              alt="Source Input"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <button
                onClick={onReset}
                className="bg-white/95 text-red-600 hover:bg-white px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-lg"
              >
                <X size={14} /> Ganti Foto
              </button>
            </div>
            <div className="absolute top-2.5 left-2.5 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
              <CheckCircle2 size={11} className="text-emerald-400" /> Foto Siap
            </div>
          </div>

          <button
            onClick={onTransform}
            disabled={isGenerating}
            className="w-full bg-[#800000] hover:bg-red-950 disabled:bg-slate-400 text-white py-4 px-6 rounded-2xl font-bold text-base flex items-center justify-center gap-2.5 shadow-lg shadow-red-950/20 transition-all active:scale-[0.99]"
          >
            {isGenerating ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                <span>Mentransformasi Gaya AI...</span>
              </>
            ) : (
              <>
                <Sparkles size={20} className="text-red-300" />
                <span>Transform Now (Render AI)</span>
              </>
            )}
          </button>

          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-2xl flex items-start gap-2">
              <Info size={16} className="shrink-0 text-red-500 mt-0.5" />
              <p>{error}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
