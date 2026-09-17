import express from "express";
import path from "path";
import { GoogleGenAI } from "@google/genai";

const PORT = 3000;

const modePrompts: Record<string, string> = {
  'classic-seinen': "Transform this photo into a high-quality anime style following the classic 90s seinen aesthetic, specifically inspired by Shuichi Shigeno's art style (Initial D). Use gritty, detailed line work, expressive facial features, and a vintage hand-drawn feel. Focus on high-contrast shading and a sense of motion. Keep the original composition.",
  'modern-seinen': "Transform this photo into a sleek, modern automotive seinen anime style, inspired by MF Ghost. Use clean, sharp digital line work, realistic lighting, vibrant colors, and a polished 2020s aesthetic. Maintain the likeness of the subject but render it in high-definition with professional cinematic shading.",
  'sketch': 'Transform this photo into a raw, high-energy sketchy style illustration. Use spontaneous, messy, and expressive pencil or ink lines. The strokes should be energetic and deliberate but not perfectly neat, giving a sense of life and raw emotion. Focus on movement and artistic fluidity over precision. Black and white or sepia tones.',
  'vector': 'Transform this photo into a premium vector art illustration. Use clean, geometric paths, solid color gradients, and a modern corporate Memphis or flat-illustration style. The output should be crisp, scalable-looking, and very professional.',
  'pixel-art': 'Transform this photo into an 16-bit pixel art masterpiece. Use a sophisticated retro color palette, clear pixel clusters, and a level of detail found in peak SNES or arcade games. Maintain the core features while stylized for low-res grid art.',
  'photo-hd': 'Perform a state-of-the-art AI photographic restoration and upgrade. Enhance the clarity, remove all noise, sharpen the focus, and balance the dynamic range. The goal is a professional-grade, high-resolution portrait that looks authentic but superior.',
  'ghibli': "Transform this photo into the whimsical, painterly style of Studio Ghibli. Use soft textures, a warm and nostalgic color palette, and a hand-painted watercolor background aesthetic. The character should have simple, emotive features typical of Hayao Miyazaki's films.",
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

function getGeminiApiKey(): string | null {
  const envKey = process.env.GEMINI_API_KEY;
  if (envKey && envKey !== "MY_GEMINI_API_KEY" && envKey.trim().length > 10) {
    return envKey.trim();
  }
  return null;
}

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = getGeminiApiKey();
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

async function startServer() {
  const app = express();

  // Support large base64 image uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));

  // Status check endpoint
  app.get("/api/status", (_req, res) => {
    const key = getGeminiApiKey();
    res.json({
      status: "ok",
      hasKey: !!key && key.length > 10,
    });
  });

  // Image transformation endpoint
  app.post("/api/transform", async (req, res) => {
    try {
      const apiKey = getGeminiApiKey();
      if (!apiKey) {
        return res.json({
          success: false,
          fallbackToLocalStylizer: true,
          notice: "API Key belum terkonfigurasi. Menerapkan Artistic Styling Engine secara langsung.",
        });
      }

      const { image, mode, isHD, isEnhancing, customPrompt } = req.body;

      if (!image || typeof image !== "string") {
        return res.status(400).json({ error: "Data gambar tidak ditemukan." });
      }

      const match = image.match(/^data:([^;]+);base64,(.+)$/);
      if (!match) {
        return res.status(400).json({ error: "Format data gambar tidak valid (harus base64 data URL)." });
      }

      const mimeType = match[1];
      const base64Data = match[2];

      let prompt = customPrompt || "";
      if (isEnhancing) {
        prompt = "Perform a high-end AI HD enhancement on this image. Upscale the resolution, fix any blurry parts, sharpen the edges, and add professional-grade digital textures. Maintain the exact character, colors, and style, but make it look like a high-definition (4K), ultra-detailed professional masterpiece.";
      } else if (!prompt) {
        prompt = modePrompts[mode] || modePrompts["classic-seinen"];
        if (isHD) {
          prompt += " Render this in maximum available resolution. Ensure total clarity, no artifacts, and professional-grade rendering quality.";
        }
      }

      // Models to try in order of preference
      const candidateModels = isHD 
        ? ["gemini-3.1-flash-image", "gemini-2.5-flash-image", "gemini-3.1-flash-lite-image"]
        : ["gemini-3.1-flash-lite-image", "gemini-2.5-flash-image", "gemini-3.1-flash-image"];

      let resultImage: string | null = null;
      let lastError: any = null;

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

      for (const modelName of candidateModels) {
        try {
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
            if (part.inlineData && part.inlineData.data) {
              const outMime = part.inlineData.mimeType || "image/png";
              resultImage = `data:${outMime};base64,${part.inlineData.data}`;
              break;
            }
          }

          if (resultImage) {
            break;
          }
        } catch (err: any) {
          lastError = err;
          const errString = String(err?.message || err);
          if (errString.includes("UNAUTHENTICATED") || errString.includes("ACCOUNT_STATE_INVALID") || err?.status === 401) {
            break;
          }
        }
      }

      if (resultImage) {
        return res.json({ success: true, image: resultImage });
      }

      if (lastError) {
        const errorStr = String(lastError?.message || lastError);
        console.error("Gemini API error:", errorStr);

        if (errorStr.includes("ACCOUNT_STATE_INVALID") || errorStr.includes("deleted or disabled") || lastError?.status === 401) {
          // Gracefully fallback to artistic styling engine so user never experiences an error crash
          return res.json({
            success: false,
            fallbackToLocalStylizer: true,
            notice: "Service account untuk API Key default nonaktif. Menerapkan Artistic Styling Engine secara mulus.",
          });
        }

        if (errorStr.includes("API_KEY_INVALID") || errorStr.includes("API key not valid")) {
          return res.json({
            success: false,
            fallbackToLocalStylizer: true,
            notice: "API Key tidak valid atau belum diatur. Menerapkan Artistic Styling Engine.",
          });
        }

        if (errorStr.includes("429") || errorStr.includes("RESOURCE_EXHAUSTED") || errorStr.includes("quota")) {
          // Graceful fallback for client-side stylizer
          return res.json({
            success: false,
            quotaExceeded: true,
            fallbackToLocalStylizer: true,
            notice: "Batas kuota Gemini free-tier tercapai. Menerapkan Artistic Styling Engine.",
          });
        }

        return res.json({
          success: false,
          fallbackToLocalStylizer: true,
          notice: "Menerapkan Artistic Styling Engine untuk memproses gambar Anda.",
        });
      }

      return res.json({
        success: false,
        fallbackToLocalStylizer: true,
        notice: "Menerapkan Artistic Styling Engine untuk memproses gambar Anda.",
      });
    } catch (err: any) {
      console.error("Server transform error:", err);
      return res.status(500).json({
        error: err?.message || "Terjadi kesalahan server saat memproses gambar.",
      });
    }
  });

  // Vite middleware for development vs static build in production
  const distPath = path.join(process.cwd(), "dist");
  const isProduction =
    process.env.NODE_ENV === "production" ||
    Boolean(process.argv[1] && process.argv[1].endsWith(".cjs"));

  if (!isProduction) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
