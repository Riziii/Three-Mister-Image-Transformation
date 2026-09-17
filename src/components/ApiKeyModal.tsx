import React, { useState, useEffect } from 'react';
import { 
  Key, 
  X, 
  ExternalLink, 
  Check, 
  AlertTriangle, 
  Eye, 
  EyeOff, 
  Trash2, 
  ShieldCheck, 
  Sparkles,
  Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  customApiKey: string;
  onSaveKey: (key: string) => void;
  onClearKey: () => void;
  hasEnvKey: boolean;
  initialError?: string | null;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({
  isOpen,
  onClose,
  customApiKey,
  onSaveKey,
  onClearKey,
  hasEnvKey,
  initialError,
}) => {
  const [inputVal, setInputVal] = useState(customApiKey);
  const [showKey, setShowKey] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    setInputVal(customApiKey);
  }, [customApiKey, isOpen]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanKey = inputVal.trim();
    if (!cleanKey) return;
    onSaveKey(cleanKey);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 900);
  };

  const handleClear = () => {
    onClearKey();
    setInputVal('');
  };

  const maskKey = (key: string) => {
    if (!key) return '';
    if (key.length <= 8) return '••••••••';
    return `${key.slice(0, 6)}••••••••${key.slice(-4)}`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 my-auto"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-[#580305] text-white p-6 pb-7">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/15">
                    <Key className="w-5 h-5 text-amber-300" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold tracking-tight">Konfigurasi API Key Gemini</h2>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Untuk penggunaan di website yang di-deploy (GitHub Pages, hosting publik)
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
                  aria-label="Tutup"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Status Badge */}
              <div className="mt-5 flex flex-wrap items-center gap-2 text-xs">
                <span className="text-slate-300 font-medium">Status Saat Ini:</span>
                {customApiKey ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-400/30">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    Kunci Kustom Aktif ({maskKey(customApiKey)})
                  </span>
                ) : hasEnvKey ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 font-semibold border border-blue-400/30">
                    <span className="w-2 h-2 rounded-full bg-blue-400" />
                    Kunci Bawaan Lingkungan Terpasang
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 font-semibold border border-amber-400/30">
                    <AlertTriangle size={13} />
                    Belum Ada Kunci (Wajib Diisi)
                  </span>
                )}
              </div>
            </div>

            <div className="p-6 sm:p-7 space-y-6">
              {/* Leaked or Permission Denied Alert Warning */}
              {initialError && (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm space-y-1.5">
                  <div className="flex items-center gap-2 font-bold text-amber-950">
                    <AlertTriangle className="text-amber-600 shrink-0" size={18} />
                    <span>Penyebab Error: Kunci Dilaporkan Bocor / Tidak Diizinkan</span>
                  </div>
                  <p className="text-slate-700 leading-relaxed">
                    Google secara otomatis menonaktifkan API Key jika pernah terdeteksi pada repositori publik Git (pesan: <em>"Your API key was reported as leaked"</em>). Solusinya adalah memasukkan API Key baru Anda sendiri di bawah ini.
                  </p>
                </div>
              )}

              {/* Input Form */}
              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label htmlFor="gemini-key-input" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Masukkan Gemini API Key Baru
                  </label>
                  <div className="relative flex items-center">
                    <input
                      id="gemini-key-input"
                      type={showKey ? 'text' : 'password'}
                      value={inputVal}
                      onChange={(e) => setInputVal(e.target.value)}
                      placeholder="AIzaSy..."
                      className="w-full pl-4 pr-24 py-3.5 bg-slate-50 border border-slate-300 focus:border-[#800000] focus:bg-white focus:ring-2 focus:ring-red-100 rounded-2xl text-sm font-mono transition-all outline-none"
                    />
                    <div className="absolute right-2 flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setShowKey(!showKey)}
                        className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-200/60 transition-colors"
                        title={showKey ? 'Sembunyikan' : 'Tampilkan'}
                      >
                        {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1.5 flex items-center gap-1">
                    <Lock size={12} className="text-slate-400" />
                    Kunci disimpan secara privat di browser Anda (<code className="bg-slate-100 px-1 py-0.5 rounded text-[10px]">localStorage</code>) dan tidak pernah dikirim ke Git.
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={!inputVal.trim()}
                    className="flex-1 bg-[#800000] hover:bg-red-900 disabled:bg-slate-300 text-white font-bold py-3.5 px-6 rounded-2xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-red-900/20 transition-all active:scale-[0.99] cursor-pointer disabled:cursor-not-allowed"
                  >
                    {savedSuccess ? (
                      <>
                        <Check size={18} className="text-white" />
                        Tersimpan & Aktif!
                      </>
                    ) : (
                      <>
                        <Sparkles size={16} />
                        Simpan & Aktifkan Kunci
                      </>
                    )}
                  </button>

                  {customApiKey && (
                    <button
                      type="button"
                      onClick={handleClear}
                      className="px-4 py-3.5 border border-slate-300 hover:border-red-300 hover:bg-red-50 text-slate-600 hover:text-red-700 font-semibold rounded-2xl text-sm flex items-center gap-1.5 transition-colors"
                      title="Hapus kunci tersimpan"
                    >
                      <Trash2 size={16} />
                      <span className="hidden sm:inline">Hapus</span>
                    </button>
                  )}
                </div>
              </form>

              {/* How to get a free key */}
              <div className="border-t border-slate-200 pt-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck size={14} className="text-[#800000]" />
                    Cara Mendapatkan Kunci Gemini Gratis (1 Menit)
                  </h3>
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#800000] hover:text-red-900 hover:underline"
                  >
                    Buka Google AI Studio
                    <ExternalLink size={12} />
                  </a>
                </div>

                <ol className="text-xs text-slate-600 space-y-1.5 pl-4 list-decimal leading-relaxed">
                  <li>
                    Kunjungi tautan <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-[#800000] font-semibold underline">Google AI Studio API Keys</a>.
                  </li>
                  <li>
                    Login dengan akun Google Anda, lalu klik tombol biru <strong>"Create API key"</strong>.
                  </li>
                  <li>
                    Salin (*copy*) teks kunci yang diawali dengan <code>AIzaSy...</code>, lalu tempelkan (*paste*) pada kolom input di atas.
                  </li>
                </ol>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
