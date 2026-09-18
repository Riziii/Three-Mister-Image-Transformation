import { ArtisticStyle, SampleImage } from '../types';

export const ARTISTIC_STYLES: ArtisticStyle[] = [
  {
    id: 'classic-seinen',
    label: 'Classic Seinen',
    desc: 'Anime klasik 90-an dengan shading kontras & garis gritty gaya Shuichi Shigeno (Initial D).',
    category: 'Anime & Manga',
    icon: 'Wind',
    color: 'text-red-700',
    prompt: "Transform this photo into a high-quality anime style following the classic 90s seinen aesthetic, specifically inspired by Shuichi Shigeno's art style (Initial D). Use gritty, detailed line work, expressive facial features, and a vintage hand-drawn feel. Focus on high-contrast shading and a sense of motion. Keep the original composition."
  },
  {
    id: 'modern-seinen',
    label: 'Modern Seinen',
    desc: 'Estetika anime modern 2020-an tajam dan pencahayaan sinematik (MF Ghost).',
    category: 'Anime & Manga',
    icon: 'Gauge',
    color: 'text-amber-500',
    prompt: "Transform this photo into a sleek, modern automotive seinen anime style, inspired by MF Ghost. Use clean, sharp digital line work, realistic lighting, vibrant colors, and a polished 2020s aesthetic. Maintain the likeness of the subject but render it in high-definition with professional cinematic shading."
  },
  {
    id: 'ghibli',
    label: 'Studio Ghibli',
    desc: 'Gaya cat air nostalgia lembut khas Studio Ghibli & Hayao Miyazaki.',
    category: 'Anime & Manga',
    icon: 'Leaf',
    color: 'text-teal-600',
    prompt: "Transform this photo into the whimsical, painterly style of Studio Ghibli. Use soft textures, a warm and nostalgic color palette, and a hand-painted watercolor background aesthetic. The character should have simple, emotive features typical of Hayao Miyazaki's films."
  },
  {
    id: 'hyper-anime',
    label: 'Hyper Anime HD',
    desc: 'Anime resolusi tinggi dengan detail tekstur cahaya layaknya film Makoto Shinkai.',
    category: 'Anime & Manga',
    icon: 'Star',
    color: 'text-rose-600',
    prompt: "Transform this photo into a hyper-detailed, high-end anime art masterpiece. Use professional digital painting techniques, intricate lighting effects, detailed hair and eye textures, and a polished cinematic atmosphere. The result should look like a high-budget anime movie still (e.g., Makoto Shinkai style) with ultra-fine details and vibrant, expressive color grading."
  },
  {
    id: 'korean-webtoon',
    label: 'Korean Webtoon',
    desc: 'Gaya Manhwa Webtoon Korea modern dengan garis ultra-bersih dan warna dramatis.',
    category: 'Anime & Manga',
    icon: 'BookOpen',
    color: 'text-pink-600',
    prompt: "Transform this photo into a modern Korean Webtoon (Manhwa) digital art style. Focus on ultra-clean digital line work, smooth k-beauty inspired skin, vibrantly polished realistic coloring, and gorgeous expressive romantic/dramatic eyes. The background should have a beautiful watercolor-tinted or stylish modern city-living webtoon aesthetic. The result should look like a highly polished panel from a top-trending webtoon manhwa series."
  },
  {
    id: 'anime-redraw',
    label: 'Anime Redraw',
    desc: 'Rekonstruksi adegan anime dengan sentuhan remake modern dan detail tajam.',
    category: 'Anime & Manga',
    icon: 'Brush',
    color: 'text-red-500',
    prompt: "Recreate this photo as a high-quality anime scene with a modern redraw twist. Add intricate new details, sharper lighting, and a contemporary artistic interpretation of classic anime aesthetics. The result should feel like a high-budget modern remake of a classic scene."
  },
  {
    id: 'urban-chibi',
    label: 'Urban Chibi',
    desc: 'Karakter imut proporsi kepala besar dengan gaya streetwear perkotaan trendi.',
    category: 'Anime & Manga',
    icon: 'Baby',
    color: 'text-yellow-600',
    prompt: "Transform this photo into a stylized Urban Chibi illustration. Use exaggerated cute proportions (big head, small body), but combined with modern streetwear and urban fashion elements. Incorporate bold lines, vibrant city-themed colors, and a trendy vibe while maintaining the adorable chibi aesthetic."
  },
  {
    id: 'sketch',
    label: 'Raw Sketchy',
    desc: 'Sketsa pensil arang spontan, ekspresif, dan penuh energi gerakan dinamis.',
    category: 'Artistik & Sketsa',
    icon: 'Feather',
    color: 'text-slate-600',
    prompt: "Transform this photo into a raw, high-energy sketchy style illustration. Use spontaneous, messy, and expressive pencil or ink lines. The strokes should be energetic and deliberate but not perfectly neat, giving a sense of life and raw emotion. Focus on movement and artistic fluidity over precision. Black and white or sepia tones."
  },
  {
    id: 'blue-ink-sketch',
    label: 'Blue Ink Pen',
    desc: 'Sketsa pena tinta biru di atas kertas bertekstur arsitektural klasik.',
    category: 'Artistik & Sketsa',
    icon: 'PenTool',
    color: 'text-blue-800',
    prompt: "Transform this photo into a blue ink ballpoint pen sketch on textured off-white/beige paper. Use hatching and cross-hatching techniques to build depth, shading, and detail. The drawing should have an architectural or landscape sketchbook feel, with varied line weight, loose but precise strokes, and a classic monochrome blue aesthetic. The background should have a distinct paper texture."
  },
  {
    id: 'vintage-travel-sketch',
    label: 'Vintage Travel',
    desc: 'Ilustrasi garis merah marun (#580001) bergaya poster travel vintage elegan.',
    category: 'Artistik & Sketsa',
    icon: 'Map',
    color: 'text-amber-800',
    prompt: "Transform this photo into a vintage travel poster style line art. Use clean, bold outlines strictly in the hex color #580001 (deep maroon/red) with a smooth hand-drawn feel on a light cream or off-white background. Add subtle, flat lighter washes of the same maroon hue for shading and depth, avoiding complex cross-hatching. The overall aesthetic should be elegant, simplified, and reminiscent of classic architectural or city tourism poster sketches."
  },
  {
    id: 'silhouette',
    label: 'Artistic Silhouette',
    desc: 'Minimalis dramatis dengan siluet kontras dan latar gradasi atmosferik.',
    category: 'Artistik & Sketsa',
    icon: 'Ghost',
    color: 'text-neutral-800',
    prompt: "Transform this photo into a sophisticated minimalist silhouette. Use bold negative space and clean outlines. The subject should be a solid dark shape against an artistic, atmospheric background gradient that tells a story without facial details."
  },
  {
    id: 'artsy-experimental',
    label: 'Experimental Art',
    desc: 'Eksplorasi seni avant-garde tidak konvensional dengan tekstur abstrak unik.',
    category: 'Artistik & Sketsa',
    icon: 'FlaskConical',
    color: 'text-purple-700',
    prompt: "Transform this photo into an avant-garde experimental art piece. Push artistic boundaries with unconventional techniques, abstract overlays, unique textures, and non-traditional color schemes to create a thought-provoking masterpiece."
  },
  {
    id: 'cyberpunk',
    label: 'Cyberpunk Edgerunner',
    desc: 'Latar masa depan futuristik dengan pencahayaan neon elektrik & motif cyber.',
    category: 'Digital & 3D',
    icon: 'Bot',
    color: 'text-fuchsia-600',
    prompt: "Transform this photo into a gritty Cyberpunk Edgerunners style. Use extreme lighting contrast, neon color palettes (electric blue, radioactive pink, lime green), and detailed cybernetic motifs. The atmosphere should be rainy, tech-noir, and high-energy."
  },
  {
    id: 'pixar-remaster',
    label: 'Pixar 3D HD',
    desc: 'Animasi 3D ultra-realistis khas Pixar dengan tekstur halus & pencahayaan hangat.',
    category: 'Digital & 3D',
    icon: 'Film',
    color: 'text-cyan-600',
    prompt: "Transform this photo into an ultra-realistic, high-definition 3D animation style reminiscent of modern Pixar films. Focus on intricate textures (skin, hair, fabric), vibrant cinematic lighting, and expressive 3D character modeling."
  },
  {
    id: 'vector',
    label: 'Clean Vector',
    desc: 'Ilustrasi vektor flat modern dengan kontur geometris presisi & rapi.',
    category: 'Digital & 3D',
    icon: 'Shapes',
    color: 'text-indigo-600',
    prompt: "Transform this photo into a premium vector art illustration. Use clean, geometric paths, solid color gradients, and a modern corporate Memphis or flat-illustration style. The output should be crisp, scalable-looking, and very professional."
  },
  {
    id: 'photo-hd',
    label: 'Photo Master HD',
    desc: 'Restorasi dan peningkatan kejernihan foto ultra-tajam dengan dynamic range sempurna.',
    category: 'Digital & 3D',
    icon: 'Camera',
    color: 'text-emerald-600',
    prompt: "Perform a state-of-the-art AI photographic restoration and upgrade. Enhance the clarity, remove all noise, sharpen the focus, and balance the dynamic range. The goal is a professional-grade, high-resolution portrait that looks authentic but superior."
  },
  {
    id: 'automotive-vibes',
    label: 'Automotive Vibes',
    desc: 'Nuansa otomotif berkecepatan tinggi dengan pantulan metallic dan motion blur.',
    category: 'Digital & 3D',
    icon: 'Car',
    color: 'text-blue-600',
    prompt: "Transform this photo with a focus on automotive vibes and dynamic energy. Emphasize sleek designs, high-speed motion blurs, and a high-octane atmosphere with metallic reflections and cinematic road lighting."
  },
  {
    id: 'pixel-art',
    label: 'Pixel Retro 16-Bit',
    desc: 'Mahakarya retro pixel art era konsol 16-bit klasik penuh nostalgia arcade.',
    category: 'Retro & Pop',
    icon: 'Gamepad2',
    color: 'text-purple-600',
    prompt: "Transform this photo into an 16-bit pixel art masterpiece. Use a sophisticated retro color palette, clear pixel clusters, and a level of detail found in peak SNES or arcade games. Maintain the core features while stylized for low-res grid art."
  },
  {
    id: 'neo-pop',
    label: 'Neo Pop Art',
    desc: 'Pop art kontemporer dengan palet warna saturated dan garis luar tebal mencolok.',
    category: 'Retro & Pop',
    icon: 'Aperture',
    color: 'text-orange-500',
    prompt: "Transform this photo into a vibrant Neo Pop illustration. Use bold, saturated colors, thick black outlines, and a clean, high-contrast aesthetic. Incorporate elements of modern street art and commercial pop art, with a focus on graphic impact and stylistic flair. The result should be energetic, trendy, and visually striking."
  },
  {
    id: 'comic',
    label: 'Western Comic',
    desc: 'Gaya buku komik Barat dengan garis ekspresif hitam pekat dan shading berbobot.',
    category: 'Retro & Pop',
    icon: 'MessageSquare',
    color: 'text-red-600',
    prompt: "Transform this photo into a high-quality comic book art style. Use bold, expressive black outlines, vibrant and saturated color palettes, and heavy professional shading. Incorporate dynamic panel-like framing or subtle halftone textures where appropriate. The result should look like a premium traditional Western comic book illustration with high energy and cinematic impact."
  },
  {
    id: 'comic-cartoon',
    label: 'Comic Cartoon',
    desc: 'Perpaduan animasi kartun ekspresif dan tata letak panel komik ceria.',
    category: 'Retro & Pop',
    icon: 'Clapperboard',
    color: 'text-sky-500',
    prompt: "Transform this photo into a dynamic Comic Cartoon style. Blend the expressive, fluid movement of professional Western animation with the bold outlines of comic book art. Use clean line work, bright colors, and exaggerated facial expressions."
  },
  {
    id: 'graffiti-mask',
    label: 'Urban Street Graffiti',
    desc: 'Seni jalanan perkotaan dengan efek cat semprot aerosol, stensil, dan drips liar.',
    category: 'Retro & Pop',
    icon: 'Palette',
    color: 'text-yellow-600',
    prompt: "Transform this photo into vibrant urban graffiti art. Incorporate spray paint textures, stencil-style drips, bold outlines, and gritty street art elements. Use a high-contrast, energetic palette typical of modern street murals."
  }
];

export const SAMPLE_IMAGES: SampleImage[] = [
  {
    id: 'sample-portrait',
    title: 'Portrait Kasual',
    category: 'Portrait',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
    alt: 'Portrait wanita dengan ekspresi alami'
  },
  {
    id: 'sample-car',
    title: 'Mobil Olahraga',
    category: 'Automotive',
    url: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=800&q=80',
    alt: 'Mobil sport retro modern'
  },
  {
    id: 'sample-city',
    title: 'Malam Kota Neon',
    category: 'Landscape',
    url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80',
    alt: 'Pemandangan malam kota bercahaya'
  },
  {
    id: 'sample-street',
    title: 'Gaya Streetwear',
    category: 'Fashion',
    url: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=800&q=80',
    alt: 'Model dengan busana urban kekinian'
  }
];
