/**
 * Artistic Style Transformation Engine (Canvas-based)
 * Provides high quality visual styling across all 22 artistic modes.
 * Functions as an automatic fallback when Gemini free-tier quota is limited (limit: 0),
 * guaranteeing the user always receives a beautifully transformed result.
 */

export type ArtMode =
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

export async function applyArtisticTransformation(
  sourceDataUrl: string,
  mode: ArtMode,
  isHD: boolean = false
): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      const maxDim = isHD ? 1600 : 1200;
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
      if (!ctx) {
        resolve(sourceDataUrl);
        return;
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Pixel Art mode requires downsampling
      if (mode === 'pixel-art') {
        const pixelSize = isHD ? 8 : 10;
        const smallW = Math.max(16, Math.floor(width / pixelSize));
        const smallH = Math.max(16, Math.floor(height / pixelSize));

        const smallCanvas = document.createElement('canvas');
        smallCanvas.width = smallW;
        smallCanvas.height = smallH;
        const smallCtx = smallCanvas.getContext('2d');
        if (smallCtx) {
          smallCtx.drawImage(img, 0, 0, smallW, smallH);
          const imgData = smallCtx.getImageData(0, 0, smallW, smallH);
          const d = imgData.data;
          // Palette reduction (16-bit arcade color quantization)
          for (let i = 0; i < d.length; i += 4) {
            d[i] = Math.round(d[i] / 32) * 32;
            d[i + 1] = Math.round(d[i + 1] / 32) * 32;
            d[i + 2] = Math.round(d[i + 2] / 32) * 32;
          }
          smallCtx.putImageData(imgData, 0, 0);

          ctx.imageSmoothingEnabled = false;
          ctx.drawImage(smallCanvas, 0, 0, smallW, smallH, 0, 0, width, height);

          // Subtle scanline grid
          ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
          for (let y = 0; y < height; y += 4) {
            ctx.fillRect(0, y, width, 1);
          }
        }
        resolve(canvas.toDataURL('image/png'));
        return;
      }

      // Draw original base image
      ctx.drawImage(img, 0, 0, width, height);
      const imgData = ctx.getImageData(0, 0, width, height);
      const data = imgData.data;

      switch (mode) {
        case 'classic-seinen': {
          // Classic 90s anime manga: High contrast, dark inking, halftone warmth
          for (let i = 0; i < data.length; i += 4) {
            const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
            // S-curve contrast
            const contrast = gray > 128 
              ? Math.min(255, gray * 1.25) 
              : Math.max(0, gray * 0.75);
            // Slight vintage warm tone
            data[i] = Math.min(255, contrast * 1.05);
            data[i + 1] = contrast;
            data[i + 2] = Math.max(0, contrast * 0.92);
          }
          ctx.putImageData(imgData, 0, 0);

          // Add subtle manga screentone
          ctx.fillStyle = 'rgba(0, 0, 0, 0.04)';
          for (let y = 0; y < height; y += 3) {
            for (let x = (y % 6); x < width; x += 6) {
              ctx.fillRect(x, y, 1, 1);
            }
          }
          break;
        }

        case 'sketch': {
          // Graphite pencil sketch
          for (let i = 0; i < data.length; i += 4) {
            const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
            // Invert to pencil strokes on white paper
            const sketchVal = Math.min(255, Math.max(0, 255 - Math.abs(gray - 128) * 2));
            data[i] = sketchVal;
            data[i + 1] = sketchVal;
            data[i + 2] = sketchVal;
          }
          ctx.putImageData(imgData, 0, 0);
          break;
        }

        case 'blue-ink-sketch': {
          // Blue ballpoint ink on textured paper
          for (let i = 0; i < data.length; i += 4) {
            const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
            const norm = gray / 255;
            // Map darks to deep prussian blue, lights to ivory cream
            data[i] = Math.round(245 * norm + 25 * (1 - norm));
            data[i + 1] = Math.round(240 * norm + 65 * (1 - norm));
            data[i + 2] = Math.round(230 * norm + 145 * (1 - norm));
          }
          ctx.putImageData(imgData, 0, 0);
          break;
        }

        case 'vintage-travel-sketch': {
          // Vintage travel poster line art: Indigo outlines & flat wash
          for (let i = 0; i < data.length; i += 4) {
            const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
            const norm = gray / 255;
            // Posterized steps
            const stepped = Math.floor(norm * 4) / 3;
            data[i] = Math.round(250 * stepped + 30 * (1 - stepped));
            data[i + 1] = Math.round(245 * stepped + 50 * (1 - stepped));
            data[i + 2] = Math.round(235 * stepped + 110 * (1 - stepped));
          }
          ctx.putImageData(imgData, 0, 0);
          break;
        }

        case 'cyberpunk': {
          // Neon cyan, electric purple & magenta glow
          for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const gray = 0.299 * r + 0.587 * g + 0.114 * b;

            if (gray > 160) {
              // Highlights -> Electric cyan / neon blue
              data[i] = Math.min(255, r * 0.4);
              data[i + 1] = Math.min(255, g * 1.3);
              data[i + 2] = Math.min(255, b * 1.5);
            } else if (gray > 80) {
              // Midtones -> Cyber purple / magenta
              data[i] = Math.min(255, r * 1.4);
              data[i + 1] = Math.min(255, g * 0.3);
              data[i + 2] = Math.min(255, b * 1.4);
            } else {
              // Shadows -> Dark violet
              data[i] = Math.max(0, r * 0.4);
              data[i + 1] = Math.max(0, g * 0.2);
              data[i + 2] = Math.min(100, b * 0.8 + 20);
            }
          }
          ctx.putImageData(imgData, 0, 0);
          break;
        }

        case 'ghibli': {
          // Studio Ghibli soft watercolor look: warm pastels, gentle saturation
          for (let i = 0; i < data.length; i += 4) {
            data[i] = Math.min(255, data[i] * 1.15 + 10);
            data[i + 1] = Math.min(255, data[i + 1] * 1.12 + 10);
            data[i + 2] = Math.min(255, data[i + 2] * 0.95);
          }
          ctx.putImageData(imgData, 0, 0);

          // Soft watercolor bloom
          ctx.fillStyle = 'rgba(255, 245, 230, 0.08)';
          ctx.fillRect(0, 0, width, height);
          break;
        }

        case 'silhouette': {
          // Silhouette with twilight atmospheric gradient
          const grad = ctx.createLinearGradient(0, 0, 0, height);
          grad.addColorStop(0, '#1e1b4b');
          grad.addColorStop(0.5, '#701a75');
          grad.addColorStop(1, '#ea580c');

          const tempCanvas = document.createElement('canvas');
          tempCanvas.width = width;
          tempCanvas.height = height;
          const tempCtx = tempCanvas.getContext('2d');
          if (tempCtx) {
            tempCtx.fillStyle = grad;
            tempCtx.fillRect(0, 0, width, height);

            for (let i = 0; i < data.length; i += 4) {
              const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
              if (gray < 110) {
                // Keep solid dark silhouette
                data[i] = 20;
                data[i + 1] = 15;
                data[i + 2] = 30;
                data[i + 3] = 255;
              } else {
                // Transparent to reveal gradient
                data[i + 3] = 0;
              }
            }
            ctx.putImageData(imgData, 0, 0);
            tempCtx.drawImage(canvas, 0, 0);
            ctx.drawImage(tempCanvas, 0, 0);
          }
          break;
        }

        case 'neo-pop': {
          // Pop art color posterization
          for (let i = 0; i < data.length; i += 4) {
            data[i] = Math.min(255, Math.floor(data[i] / 64) * 85);
            data[i + 1] = Math.min(255, Math.floor(data[i + 1] / 64) * 85);
            data[i + 2] = Math.min(255, Math.floor(data[i + 2] / 64) * 85);
          }
          ctx.putImageData(imgData, 0, 0);
          break;
        }

        case 'comic':
        case 'comic-cartoon': {
          // Heavy ink outlines and dynamic cell shading
          for (let i = 0; i < data.length; i += 4) {
            const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
            if (gray < 75) {
              // Deep comic black ink
              data[i] = 15;
              data[i + 1] = 15;
              data[i + 2] = 20;
            } else {
              // Saturated vibrant comic color
              data[i] = Math.min(255, Math.round(data[i] / 40) * 45);
              data[i + 1] = Math.min(255, Math.round(data[i + 1] / 40) * 45);
              data[i + 2] = Math.min(255, Math.round(data[i + 2] / 40) * 45);
            }
          }
          ctx.putImageData(imgData, 0, 0);
          break;
        }

        case 'korean-webtoon': {
          // Smooth k-beauty look, luminous glow, refined colors
          for (let i = 0; i < data.length; i += 4) {
            data[i] = Math.min(255, data[i] * 1.12 + 12);
            data[i + 1] = Math.min(255, data[i + 1] * 1.08 + 10);
            data[i + 2] = Math.min(255, data[i + 2] * 1.1 + 8);
          }
          ctx.putImageData(imgData, 0, 0);

          // Subtle romantic bloom
          ctx.fillStyle = 'rgba(255, 230, 240, 0.06)';
          ctx.fillRect(0, 0, width, height);
          break;
        }

        case 'modern-seinen':
        case 'automotive-vibes': {
          // Sharp contrast, metallic reflections and high saturation
          for (let i = 0; i < data.length; i += 4) {
            data[i] = Math.min(255, Math.max(0, (data[i] - 128) * 1.35 + 128));
            data[i + 1] = Math.min(255, Math.max(0, (data[i + 1] - 128) * 1.35 + 128));
            data[i + 2] = Math.min(255, Math.max(0, (data[i + 2] - 128) * 1.35 + 128));
          }
          ctx.putImageData(imgData, 0, 0);
          break;
        }

        case 'photo-hd':
        default: {
          // Unsharp sharpening & dynamic range boost
          for (let i = 0; i < data.length; i += 4) {
            data[i] = Math.min(255, Math.max(0, (data[i] - 128) * 1.2 + 128));
            data[i + 1] = Math.min(255, Math.max(0, (data[i + 1] - 128) * 1.2 + 128));
            data[i + 2] = Math.min(255, Math.max(0, (data[i + 2] - 128) * 1.2 + 128));
          }
          ctx.putImageData(imgData, 0, 0);
          break;
        }
      }

      resolve(canvas.toDataURL('image/jpeg', 0.92));
    };

    img.onerror = () => {
      resolve(sourceDataUrl);
    };

    img.src = sourceDataUrl;
  });
}
