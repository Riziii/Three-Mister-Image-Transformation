import React, { useState, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
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
  Map,
  Key,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Logo } from './components/Logo';
import { ApiKeyModal } from './components/ApiKeyModal';

// Robustly retrieve API key across Vite, Vercel, Node, and browser environments
const getInitialEnvApiKey = (): string => {
  // 1. Check Vite standard client environment variables (primary on Vercel)
  try {
    const metaEnv = (import.meta as any)?.env;
    if (metaEnv) {
      const viteKey = 
        metaEnv.VITE_GEMINI_API_KEY ||
        metaEnv.GEMINI_API_KEY ||
        metaEnv.VITE_API_KEY ||
        metaEnv.API_KEY;
      if (viteKey && typeof viteKey === 'string' && viteKey.trim()) {
        return viteKey.trim();
      }
    }
  } catch {
    // Ignore error
  }

  // 2. Check process.env (injected by vite.config.ts define or Node runtime)
  try {
    if (typeof process !== 'undefined' && process.env) {
      const procKey = 
        process.env.VITE_GEMINI_API_KEY ||
        process.env.GEMINI_API_KEY ||
        process.env.VITE_API_KEY ||
        process.env.API_KEY;
      if (procKey && typeof procKey === 'string' && procKey.trim()) {
        return procKey.trim();
      }
    }
  } catch {
    // Ignore error
  }

  return '';
};

const GEMINI_API_KEY = getInitialEnvApiKey();

// Fallback models if high-demand/rate-limit occurs on primary
const CANDIDATE_IMAGE_MODELS = [
  'gemini-2.5-flash-image',
  'gemini-3.1-flash-lite-image',
  'gemini-3.1-flash-image'
];

/**
 * Optimizes image client-side before sending to Gemini API.
 * Drastically reduces payload from ~8MB to ~250KB, preventing 429 TPM/size limits and speeding up generation.
 */
async function optimizeImageForApi(dataUrl: string, maxDim = 1280): Promise<{ base64Data: string; mimeType: string }> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      let width = img.width;
      let height = img.height;
      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);
        const optimizedDataUrl = canvas.toDataURL('image/jpeg', 0.88);
        const parts = optimizedDataUrl.split(',');
        resolve({
          base64Data: parts[1],
          mimeType: 'image/jpeg',
        });
        return;
      }
      const parts = dataUrl.split(',');
      const mime = dataUrl.split(';')[0].split(':')[1] || 'image/jpeg';
      resolve({ base64Data: parts[1], mimeType: mime });
    };
    img.onerror = () => {
      const parts = dataUrl.split(',');
      const mime = dataUrl.split(';')[0].split(':')[1] || 'image/jpeg';
      resolve({ base64Data: parts[1], mimeType: mime });
    };
    img.src = dataUrl;
  });
}

type Mode = 'classic-seinen' | 'modern-seinen' | 'sketch' | 'vector' | 'pixel-art' | 'photo-hd' | 'ghibli' | 'cyberpunk' | 'silhouette' | 'neo-pop' | 'hyper-anime' | 'comic' | 'urban-chibi' | 'comic-cartoon' | 'anime-redraw' | 'graffiti-mask' | 'automotive-vibes' | 'pixar-remaster' | 'artsy-experimental' | 'korean-webtoon' | 'blue-ink-sketch' | 'vintage-travel-sketch';

export default function App() {
  const [mode, setMode] = useState<Mode>('classic-seinen');
  const [isHD, setIsHD] = useState(false);
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hoveredDesc, setHoveredDesc] = useState<string | null>(null);
  const [compareMode, setCompareMode] = useState(false);
  const [generationStatus, setGenerationStatus] = useState<string>('');
  const [retryCountdown, setRetryCountdown] = useState<number>(0);
  const [isRateLimitedError, setIsRateLimitedError] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Timer for cooldown countdown
  React.useEffect(() => {
    if (retryCountdown <= 0) return;
    const timer = setInterval(() => {
      setRetryCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [retryCountdown]);

  // Client-side API key management for deployed website support
  const [customApiKey, setCustomApiKey] = useState<string>(() => {
    try {
      return localStorage.getItem('three_mister_gemini_api_key') || '';
    } catch {
      return '';
    }
  });
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const [keyModalError, setKeyModalError] = useState<string | null>(null);

  const envApiKey = (GEMINI_API_KEY || '').trim();
  const activeApiKey = customApiKey.trim() || envApiKey;

  const handleSaveKey = (key: string) => {
    const trimmed = key.trim();
    setCustomApiKey(trimmed);
    try {
      localStorage.setItem('three_mister_gemini_api_key', trimmed);
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
    setError(null);
    setKeyModalError(null);
  };

  const handleClearKey = () => {
    setCustomApiKey('');
    try {
      localStorage.removeItem('three_mister_gemini_api_key');
    } catch (e) {
      console.error('Failed to remove from localStorage:', e);
    }
  };

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

    if (file.size > 10 * 1024 * 1024) {
      setError('Ukuran file terlalu besar. Maksimal 10MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setSourceImage(e.target?.result as string);
      setGeneratedImage(null);
      setError(null);
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

    if (!activeApiKey) {
      const msg = 'API Key Google Gemini belum diatur. Silakan masukkan API Key gratis Anda agar transformasi gambar dapat berjalan di website ini.';
      setError(msg);
      setKeyModalError(msg);
      setIsKeyModalOpen(true);
      return;
    }

    setIsGenerating(true);
    setGenerationStatus('Menyiapkan & mengoptimalkan gambar...');
    setError(null);
    setKeyModalError(null);
    setIsRateLimitedError(false);

    try {
      // 1. Optimize image client-side to prevent 429 token/request-size limits
      const { base64Data, mimeType } = await optimizeImageForApi(targetImage, 1280);

      let prompt = '';
      if (isEnhancing) {
        prompt = "Perform a high-end AI HD enhancement on this image. Upscale the resolution, fix any blurry parts, sharpen the edges, and add professional-grade digital textures. Maintain the exact character, colors, and style, but make it look like a high-definition (4K), ultra-detailed professional masterpiece.";
      } else {
        const modePrompts: Record<Mode, string> = {
          'classic-seinen': "Transform this photo into a high-quality anime style following the classic 90s seinen aesthetic, specifically inspired by Shuichi Shigeno's art style (Initial D). Use gritty, detailed line work, expressive facial features, and a vintage hand-drawn feel. Focus on high-contrast shading and a sense of motion. Keep the original composition.",
          'modern-seinen': "Transform this photo into a sleek, modern automotive seinen anime style, inspired by MF Ghost. Use clean, sharp digital line work, realistic lighting, vibrant colors, and a polished 2020s aesthetic. Maintain the likeness of the subject but render it in high-definition with professional cinematic shading.",
          'sketch': 'Transform this photo into a raw, high-energy sketchy style illustration. Use spontaneous, messy, and expressive pencil or ink lines. The strokes should be energetic and deliberate but not perfectly neat, giving a sense of life and raw emotion. Focus on movement and artistic fluidity over precision. Black and white or sepia tones.',
          'vector': 'Transform this photo into a premium vector art illustration. Use clean, geometric paths, solid color gradients, and a modern corporate Memphis or flat-illustration style. The output should be crisp, scalable-looking, and very professional.',
          'pixel-art': 'Transform this photo into an 16-bit pixel art masterpiece. Use a sophisticated retro color palette, clear pixel clusters, and a level of detail found in peak SNES or arcade games. Maintain the core features while stylized for low-res grid art.',
          'photo-hd': 'Perform a state-of-the-art AI photographic restoration and upgrade. Enhance the clarity, remove all noise, sharpen the focus, and balance the dynamic range. The goal is a professional-grade, high-resolution portrait that looks authentic but superior.',
          'ghibli': 'Transform this photo into the whimsical, painterly style of Studio Ghibli. Use soft textures, a warm and nostalgic color palette, and a hand-painted watercolor background aesthetic. The character should have simple, emotive features typical of Hayao Miyazaki\'s films.',
          'cyberpunk': 'Transform this photo into a gritty Cyberpunk Edgerunners style. Use extreme lighting contrast, neon color palettes (electric blue, radioactive pink, lime green), and detailed cybernetic motifs. The atmosphere should be rainy, tech-noir, and high-energy.',
          'silhouette': 'Transform this photo into a sophisticated minimalist silhouette. Use bold negative space and clean outlines. The subject should be a solid dark shape against an artistic, atmospheric background gradient that tells a story without facial details.',
          'neo-pop': 'Transform this photo into a vibrant Neo Pop illustration. Use bold, saturated colors, thick black outlines, and a clean, high-contrast aesthetic. Incorporate elements of modern street art and commercial pop art, with a focus on graphic impact and stylistic flair. The result should be energetic, trendy, and visually striking.',
          'hyper-anime': 'Transform this photo into a hyper-detailed, high-end anime art masterpiece. Use professional digital painting techniques, intricate lighting effects, detailed hair and eye textures, and a polished cinematic atmosphere. The result should look like a high-budget anime movie still (e.g., Makoto Shinkai style) with ultra-fine details and vibrant, expressive color grading.',
          'urban-chibi': 'Transform this photo into a stylized Urban Chibi illustration. Use exaggerated cute proportions (big head, small body), but combined with modern streetwear and urban fashion elements. Incorporate bold lines, vibrant city-themed colors, and a trendy vibe while maintaining the adorable chibi aesthetic.',
          'comic-cartoon': 'Transform this photo into a dynamic Comic Cartoon style. Blend the expressive, fluid movement of professional Western animation with the bold outlines of comic book art. Use clean line work, bright colors, and exaggerated facial expressions.',
          'comic': 'Transform this photo into a high-quality comic book art style. Use bold, expressive black outlines, vibrant and saturated color palettes, and heavy professional shading. Incorporate dynamic panel-like framing or subtle halftone textures where appropriate. The result should look like a premium traditional Western comic book illustration with high energy and cinematic impact.',
          'anime-redraw': 'Recreate this photo as a high-quality anime scene with a modern redraw twist. Add intricate new details, sharper lighting, and a contemporary artistic interpretation of classic anime aesthetics. The result should feel like a high-budget modern remake of a classic scene.',
          'graffiti-mask': 'Transform this photo into vibrant urban graffiti art. Incorporte spray paint textures, stencil-style drips, bold outlines, and gritty street art elements. Use a high-contrast, energetic palette typical of modern street murals.',
          'automotive-vibes': 'Transform this photo with a focus on automotive vibes and dynamic energy. Emphasize sleek designs, high-speed motion blurs, and a high-octane atmosphere with metallic reflections and cinematic road lighting.',
          'pixar-remaster': 'Transform this photo into an ultra-realistic, high-definition 3D animation style reminiscent of modern Pixar films. Focus on intricate textures (skin, hair, fabric), vibrant cinematic lighting, and expressive 3D character modeling.',
          'artsy-experimental': 'Transform this photo into an avant-garde experimental art piece. Push artistic boundaries with unconventional techniques, abstract overlays, unique textures, and non-traditional color schemes to create a thought-provoking masterpiece.',
          'korean-webtoon': 'Transform this photo into a modern Korean Webtoon (Manhwa) digital art style. Focus on ultra-clean digital line work, smooth k-beauty inspired skin, vibrantly polished realistic coloring, and gorgeous expressive romantic/dramatic eyes. The background should have a beautiful watercolor-tinted or stylish modern city-living webtoon aesthetic. The result should look like a highly polished panel from a top-trending webtoon manhwa series.',
          'blue-ink-sketch': 'Transform this photo into a blue ink ballpoint pen sketch on textured off-white/beige paper. Use hatching and cross-hatching techniques to build depth, shading, and detail. The drawing should have an architectural or landscape sketchbook feel, with varied line weight, loose but precise strokes, and a classic monochrome blue aesthetic. The background should have a distinct paper texture.',
          'vintage-travel-sketch': 'Transform this photo into a vintage travel poster style line art. Use clean, bold dark blue outlines with a smooth hand-drawn feel on a light cream or off-white background. Add subtle, flat light-blue washes for shading and depth, avoiding complex cross-hatching. The overall aesthetic should be elegant, simplified, and reminiscent of classic architectural or city tourism poster sketches.'
        };

        prompt = modePrompts[mode];
        if (isHD) {
          prompt += " Render this in maximum available resolution. Ensure total clarity, no artifacts, and professional-grade rendering quality.";
        }
      }

      const ai = new GoogleGenAI({ apiKey: activeApiKey });
      let foundImageResult: string | null = null;
      let lastErr: any = null;

      // Try candidate models with retry & fallback
      for (let m = 0; m < CANDIDATE_IMAGE_MODELS.length; m++) {
        const modelName = CANDIDATE_IMAGE_MODELS[m];
        const maxRetries = 2; // total 3 attempts per model

        for (let attempt = 0; attempt <= maxRetries; attempt++) {
          try {
            const friendlyName = modelName.includes('3.1-flash-lite')
              ? 'Gemini 3.1 Flash-Lite'
              : modelName.includes('3.1-flash')
              ? 'Gemini 3.1 Flash'
              : 'Gemini 2.5 Flash';

            if (m > 0 || attempt > 0) {
              setGenerationStatus(`Memproses dengan ${friendlyName} (Percobaan ${attempt + 1}/${maxRetries + 1})...`);
            } else {
              setGenerationStatus(`Mengirim instruksi seni ke ${friendlyName}...`);
            }

            const response = await ai.models.generateContent({
              model: modelName,
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

            const candidates = response.candidates || [];
            const parts = candidates[0]?.content?.parts || [];

            for (const part of parts) {
              if (part.inlineData) {
                foundImageResult = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                break;
              } else if (part.text) {
                console.warn('AI returned text instead of image:', part.text);
              }
            }

            if (foundImageResult) {
              setGeneratedImage(foundImageResult);
              break;
            } else {
              throw new Error('AI tidak menghasilkan data gambar. Mencoba model lain...');
            }
          } catch (err: any) {
            lastErr = err;
            const errorMsg = err?.message || String(err);
            const errorStr = typeof err === 'string' ? err : JSON.stringify(err);

            const isLeakedKey = errorStr.includes('reported as leaked') || errorMsg.includes('reported as leaked') || errorStr.includes('leaked');
            const isForbidden = errorStr.includes('403') || errorStr.includes('PERMISSION_DENIED') || err?.status === 403;
            const isInvalidKey = errorStr.includes('API_KEY_INVALID') || errorMsg.includes('API key not valid');

            if (isLeakedKey || isForbidden || isInvalidKey) {
              // Stop retrying immediately if key is invalid/blocked
              throw err;
            }

            const isRateLimit =
              errorStr.includes('429') ||
              errorStr.includes('RESOURCE_EXHAUSTED') ||
              errorStr.includes('high demand') ||
              errorStr.includes('temporarily overloaded') ||
              errorStr.includes('Quota exceeded') ||
              errorStr.includes('503') ||
              err?.status === 429 ||
              err?.status === 503;

            if (isRateLimit) {
              if (attempt < maxRetries) {
                const waitSecs = 2 + attempt * 2; // 2s, 4s backoff
                for (let s = waitSecs; s > 0; s--) {
                  setGenerationStatus(
                    `Server Gemini sedang padat. Menunggu ${s} detik lalu mencoba ulang otomatis... (${attempt + 1}/${maxRetries})`
                  );
                  await new Promise((r) => setTimeout(r, 1000));
                }
                continue;
              } else if (m < CANDIDATE_IMAGE_MODELS.length - 1) {
                setGenerationStatus('Kapasitas model penuh. Beralih ke model cadangan Gemini...');
                await new Promise((r) => setTimeout(r, 1200));
                break; // Break inner loop, try next model in outer loop
              }
            }

            // For other non-rate-limit errors on the current model, break and try next model
            break;
          }
        }

        if (foundImageResult) break;
      }

      if (!foundImageResult && lastErr) {
        throw lastErr;
      }
    } catch (err: any) {
      console.error('Generation error:', err);
      
      const errorMsg = err?.message || String(err);
      const errorStr = typeof err === 'string' ? err : JSON.stringify(err);
      
      const isLeakedKey = errorStr.includes('reported as leaked') || errorMsg.includes('reported as leaked') || errorStr.includes('leaked');
      const isForbidden = errorStr.includes('403') || errorStr.includes('PERMISSION_DENIED') || err?.status === 403;
      const isInvalidKey = errorStr.includes('API_KEY_INVALID') || errorMsg.includes('API key not valid');

      if (isLeakedKey) {
        const detail = 'API Key yang digunakan dilaporkan bocor (leaked) dan telah dinonaktifkan permanen oleh Google demi keamanan. Silakan masukkan API Key Gemini baru Anda (gratis di Google AI Studio).';
        setError(detail);
        setKeyModalError(detail);
        setIsKeyModalOpen(true);
      } else if (isForbidden || isInvalidKey) {
        const detail = 'Akses ditolak (Error 403 / API Key tidak valid). Silakan periksa kembali atau masukkan API Key Gemini baru Anda.';
        setError(detail);
        setKeyModalError(detail);
        setIsKeyModalOpen(true);
      } else if (
        errorStr.includes('429') || 
        errorStr.includes('RESOURCE_EXHAUSTED') || 
        errorStr.includes('high demand') ||
        errorStr.includes('temporarily overloaded') ||
        errorStr.includes('Quota exceeded') ||
        err.status === 429
      ) {
        setIsRateLimitedError(true);
        setRetryCountdown(30); // 30 seconds cooldown timer
        setError('Server Google Gemini sedang sangat padat (High Demand) atau kuota permintaan per menit tercapai. Sistem telah mencoba cadangan model.');
      } else if (err.message) {
        setError(err.message);
      } else {
        setError(`Gagal memproses gambar ${mode}. Harap coba lagi nanti.`);
      }
    } finally {
      setIsGenerating(false);
      setGenerationStatus('');
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
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setKeyModalError(null);
                setIsKeyModalOpen(true);
              }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all shadow-xs cursor-pointer ${
                activeApiKey 
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100' 
                  : 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100 animate-pulse'
              }`}
              title="Konfigurasi API Key Gemini untuk website deploy"
            >
              <span className="relative flex h-2 w-2">
                <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${activeApiKey ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`} />
                <span className={`relative inline-flex rounded-full h-2 w-2 ${activeApiKey ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              </span>
              <Key size={13} className={activeApiKey ? 'text-emerald-600' : 'text-amber-600'} />
              <span className="whitespace-nowrap font-bold">
                {activeApiKey ? (customApiKey ? 'API Key Kustom' : 'API Key Aktif') : 'Atur API Key'}
              </span>
            </button>

            <div className="hidden md:flex items-center gap-4 text-sm font-medium text-slate-500 pl-2 border-l border-slate-200">
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
                    
                    {/* Status Key Indicator */}
                    <div className="flex items-center justify-between px-2 text-xs">
                      {activeApiKey ? (
                        <div className="flex items-center gap-1.5 font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/70">
                          <CheckCircle2 size={13} className="text-emerald-600" />
                          <span>Gemini AI Connected ({customApiKey ? 'Kunci Kustom' : 'Kunci Bawaan'})</span>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setKeyModalError('Silakan masukkan API Key Gemini gratis Anda untuk mulai mentransformasi gambar.');
                            setIsKeyModalOpen(true);
                          }}
                          className="flex items-center gap-1.5 font-medium text-amber-800 bg-amber-50 hover:bg-amber-100 px-2.5 py-1 rounded-lg border border-amber-300 transition-colors cursor-pointer"
                        >
                          <AlertCircle size={13} className="text-amber-600" />
                          <span>Perlu API Key — Klik di Sini</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setKeyModalError(null);
                          setIsKeyModalOpen(true);
                        }}
                        className="text-[11px] text-slate-500 hover:text-[#800000] underline font-medium cursor-pointer"
                      >
                        Kelola Key
                      </button>
                    </div>
                    
                    {error && (
                      <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex flex-col gap-3 p-4 rounded-2xl border shadow-sm ${
                          isRateLimitedError 
                            ? 'bg-amber-50/95 border-amber-200 text-amber-950' 
                            : 'bg-red-50 border-red-200 text-red-700'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {isRateLimitedError ? (
                            <Clock size={20} className="text-amber-600 shrink-0 mt-0.5 animate-pulse" />
                          ) : (
                            <Info size={18} className="text-red-500 shrink-0 mt-0.5" />
                          )}
                          <div className="space-y-1">
                            <p className="font-bold text-sm">
                              {isRateLimitedError ? 'Server Sedang Sibuk (Rate Limit)' : 'Terjadi Kendala'}
                            </p>
                            <p className="text-xs leading-relaxed opacity-90">{error}</p>
                          </div>
                        </div>

                        {isRateLimitedError && (
                          <div className="bg-amber-100/70 border border-amber-300/60 rounded-xl px-3 py-2 flex items-center justify-between text-xs font-semibold text-amber-900">
                            <span className="flex items-center gap-1.5">
                              <RefreshCw size={13} className={retryCountdown > 0 ? "animate-spin" : ""} />
                              Siklus Kuota Pulih:
                            </span>
                            <span className="px-2 py-0.5 bg-amber-200 rounded-md font-mono font-bold">
                              {retryCountdown > 0 ? `${retryCountdown} detik` : 'Siap dicoba!'}
                            </span>
                          </div>
                        )}

                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          {isRateLimitedError && (
                            <button
                              type="button"
                              onClick={() => generateImage(false)}
                              disabled={isGenerating}
                              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#800000] hover:bg-red-900 text-white text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer disabled:opacity-50"
                            >
                              <RotateCcw size={13} />
                              {retryCountdown > 0 ? `Coba Lagi (${retryCountdown}s)` : 'Coba Lagi Sekarang'}
                            </button>
                          )}
                          
                          <button
                            type="button"
                            onClick={() => {
                              setKeyModalError(error);
                              setIsKeyModalOpen(true);
                            }}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer ${
                              isRateLimitedError 
                                ? 'bg-white hover:bg-amber-100/80 text-amber-900 border border-amber-300' 
                                : 'bg-[#800000] hover:bg-red-900 text-white'
                            }`}
                          >
                            <Key size={13} />
                            Atur / Ganti API Key Baru
                          </button>
                        </div>
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
                        <div className="min-h-[50px] flex items-center justify-center">
                          {generationStatus ? (
                            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-red-50 text-[#800000] rounded-xl text-xs font-bold border border-red-200/80 shadow-sm animate-pulse">
                              <Cpu size={14} className="shrink-0" />
                              {generationStatus}
                            </span>
                          ) : (
                            <p className="text-slate-500 leading-relaxed font-medium text-sm">
                              Sedang merender gaya <span className="text-[#800000] font-bold uppercase">{mode}</span> 
                              {isHD && ' dalam resolusi tinggi'}. Proses ini membutuhkan waktu sekitar 10-20 detik.
                            </p>
                          )}
                        </div>
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

      {/* API Key Modal for Deployed Website Access */}
      <ApiKeyModal
        isOpen={isKeyModalOpen}
        onClose={() => setIsKeyModalOpen(false)}
        customApiKey={customApiKey}
        onSaveKey={handleSaveKey}
        onClearKey={handleClearKey}
        hasEnvKey={Boolean(envApiKey)}
        initialError={keyModalError}
      />
    </div>
  );
}
