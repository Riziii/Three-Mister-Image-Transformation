export type ArtisticStyleMode =
  | 'classic-seinen'
  | 'modern-seinen'
  | 'sketch'
  | 'vector'
  | 'pixel-art'
  | 'photo-hd'
  | 'ghibli'
  | 'cyberpunk'
  | 'silhouette'
  | 'neo-pop'
  | 'hyper-anime'
  | 'comic'
  | 'urban-chibi'
  | 'comic-cartoon'
  | 'anime-redraw'
  | 'graffiti-mask'
  | 'automotive-vibes'
  | 'pixar-remaster'
  | 'artsy-experimental'
  | 'korean-webtoon'
  | 'blue-ink-sketch'
  | 'vintage-travel-sketch';

export type FreeFrameMode = 
  | 'standard'        // Tampilan Standar Berbingkai
  | 'free-canvas'     // Kanvas Bebas: Pan, Zoom, Rotasi tanpa batas bingkai
  | 'split-curtain'   // Tirai Geser Bebas: Komparasi interaktif sebelum & sesudah
  | 'cinema-frameless'// Bioskop Layar Penuh Bebas Frame (Borderless Zen)
  | 'floating-pip';   // Jendela Mini Mengambang Bebas (Draggable PiP)

export type CanvasBgType = 'transparent-checker' | 'transparent-clean' | 'dark-slate';

export type FrameAspectRatio = 'free' | '1:1' | '4:5' | '16:9' | '9:16';

export interface ArtisticStyle {
  id: ArtisticStyleMode;
  label: string;
  desc: string;
  category: 'Anime & Manga' | 'Artistik & Sketsa' | 'Digital & 3D' | 'Retro & Pop';
  icon: string;
  color: string;
  prompt: string;
}

export interface SampleImage {
  id: string;
  title: string;
  category: string;
  url: string;
  alt: string;
}
