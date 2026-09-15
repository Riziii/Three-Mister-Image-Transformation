// High-performance client-side artistic rendering engine
// Provides instant, beautiful styling as an intelligent fallback or standalone pipeline

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

export async function applyArtisticFilter(
  imageSrc: string,
  mode: ArtMode,
  isHD = false
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) {
          throw new Error('Canvas context could not be created');
        }

        // Set dimensions (cap max resolution for performance, allow higher for HD)
        const maxDim = isHD ? 1600 : 1000;
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

        canvas.width = width;
        canvas.height = height;

        // Draw base image
        ctx.drawImage(img, 0, 0, width, height);
        const imgData = ctx.getImageData(0, 0, width, height);
        const data = imgData.data;

        // Apply style-specific transformations
        switch (mode) {
          case 'classic-seinen': {
            // Initial D 90s vintage manga: high contrast grayscale with ink edge lines
            applyClassicSeinen(data, width, height);
            break;
          }
          case 'modern-seinen': {
            // MF Ghost modern anime: sharp line work, high saturation, cinematic contrast
            applyModernSeinen(data, width, height);
            break;
          }
          case 'sketch': {
            // Energetic pencil sketch
            applySketch(data, width, height);
            break;
          }
          case 'pixel-art': {
            // 16-bit retro arcade pixelation
            applyPixelArt(ctx, canvas, img, width, height);
            resolve(canvas.toDataURL('image/png'));
            return;
          }
          case 'vector': {
            // Clean vector illustration / posterization
            applyPosterize(data, 5);
            boostEdges(data, width, height, 0.4);
            break;
          }
          case 'photo-hd': {
            // HDR contrast, sharpness & saturation upgrade
            applyPhotoHD(data, width, height);
            break;
          }
          case 'ghibli': {
            // Soft warm watercolor, nostalgic green/blue warmth
            applyGhibli(data, width, height);
            break;
          }
          case 'cyberpunk': {
            // Neon magenta, cyan glow & dark contrast
            applyCyberpunk(data, width, height);
            break;
          }
          case 'silhouette': {
            // Dramatic silhouette against sunset gradient
            applySilhouette(ctx, width, height, data);
            resolve(canvas.toDataURL('image/png'));
            return;
          }
          case 'neo-pop': {
            // Andy Warhol pop art high saturation
            applyNeoPop(data, width, height);
            break;
          }
          case 'hyper-anime': {
            // Vibrant anime cinematic look
            applyHyperAnime(data, width, height);
            break;
          }
          case 'comic':
          case 'comic-cartoon': {
            // Western comic bold black ink & punchy colors
            applyComic(data, width, height);
            break;
          }
          case 'blue-ink-sketch': {
            // Blue ballpoint pen sketch on off-white paper
            applyBlueInkSketch(data, width, height);
            break;
          }
          case 'vintage-travel-sketch': {
            // Vintage travel poster line art & clean wash
            applyVintageTravel(data, width, height);
            break;
          }
          case 'korean-webtoon': {
            // Smooth manhwa skin & vivid romantic tones
            applyWebtoon(data, width, height);
            break;
          }
          case 'automotive-vibes': {
            // High gloss metallic contrast & asphalt coolness
            applyAutomotive(data, width, height);
            break;
          }
          case 'pixar-remaster': {
            // Warm 3D ambient lighting and smooth curves
            applyPixar(data, width, height);
            break;
          }
          default: {
            // Default artistic enhancement
            applyModernSeinen(data, width, height);
            break;
          }
        }

        ctx.putImageData(imgData, 0, 0);

        // Optional post-processing overlays (e.g. paper texture or bloom)
        if (mode === 'blue-ink-sketch' || mode === 'vintage-travel-sketch') {
          ctx.fillStyle = 'rgba(247, 243, 233, 0.15)';
          ctx.fillRect(0, 0, width, height);
        }

        resolve(canvas.toDataURL('image/png', 0.95));
      } catch (err) {
        reject(err);
      }
    };
    img.onerror = () => reject(new Error('Gagal memuat gambar untuk proses filter'));
    img.src = imageSrc;
  });
}

// -------------------------------------------------------------
// FILTER ALGORITHMS
// -------------------------------------------------------------

function applyClassicSeinen(data: Uint8ClampedArray, width: number, height: number) {
  // Compute edge map first
  const edges = computeSobelEdges(data, width, height, 80);

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    let gray = 0.299 * r + 0.587 * g + 0.114 * b;

    // High contrast S-curve for 90s manga tone
    gray = gray < 120 ? gray * 0.7 : Math.min(255, gray * 1.25);

    const pxIndex = i / 4;
    const isEdge = edges[pxIndex] > 90;

    if (isEdge) {
      // Inky black comic line
      data[i] = 20;
      data[i + 1] = 20;
      data[i + 2] = 25;
    } else {
      // Add subtle retro sepia manga tint
      data[i] = Math.min(255, gray * 1.02);
      data[i + 1] = gray;
      data[i + 2] = Math.max(0, gray * 0.94);
    }
  }
}

function applyModernSeinen(data: Uint8ClampedArray, width: number, height: number) {
  const edges = computeSobelEdges(data, width, height, 75);

  for (let i = 0; i < data.length; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];

    // Boost saturation & contrast
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const delta = max - min;
    if (delta > 15) {
      r = Math.min(255, r + (r - 128) * 0.35);
      g = Math.min(255, g + (g - 128) * 0.35);
      b = Math.min(255, b + (b - 128) * 0.4);
    }

    const px = i / 4;
    if (edges[px] > 110) {
      data[i] = Math.max(0, r * 0.25);
      data[i + 1] = Math.max(0, g * 0.25);
      data[i + 2] = Math.max(0, b * 0.3);
    } else {
      data[i] = r;
      data[i + 1] = g;
      data[i + 2] = b;
    }
  }
}

function applySketch(data: Uint8ClampedArray, width: number, height: number) {
  const edges = computeSobelEdges(data, width, height, 50);

  for (let i = 0; i < data.length; i += 4) {
    const px = i / 4;
    const edgeVal = edges[px];
    
    // Invert: edges become dark graphite lines, flat areas become light paper
    let val = 255 - edgeVal * 1.8;
    val = Math.max(30, Math.min(255, val));

    // Subtle paper warm tint
    data[i] = val;
    data[i + 1] = Math.round(val * 0.98);
    data[i + 2] = Math.round(val * 0.92);
  }
}

function applyBlueInkSketch(data: Uint8ClampedArray, width: number, height: number) {
  const edges = computeSobelEdges(data, width, height, 45);

  for (let i = 0; i < data.length; i += 4) {
    const px = i / 4;
    const edge = edges[px];

    if (edge > 60) {
      // Classic BIC / fountain pen royal blue ink
      const factor = Math.min(1, (edge - 60) / 120);
      data[i] = Math.round(20 * (1 - factor) + 15 * factor);
      data[i + 1] = Math.round(50 * (1 - factor) + 40 * factor);
      data[i + 2] = Math.round(180 * (1 - factor) + 130 * factor);
    } else {
      // Warm ivory sketchbook paper
      data[i] = 250;
      data[i + 1] = 246;
      data[i + 2] = 238;
    }
  }
}

function applyVintageTravel(data: Uint8ClampedArray, width: number, height: number) {
  const edges = computeSobelEdges(data, width, height, 65);

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const gray = 0.299 * r + 0.587 * g + 0.114 * b;
    const px = i / 4;

    if (edges[px] > 90) {
      // Deep navy poster contour
      data[i] = 18;
      data[i + 1] = 32;
      data[i + 2] = 75;
    } else {
      // Quantized nostalgic pastel wash
      const step = Math.floor(gray / 64) * 64;
      data[i] = Math.min(255, step + 45);
      data[i + 1] = Math.min(255, step + 35);
      data[i + 2] = Math.min(255, step + 20);
    }
  }
}

function applyCyberpunk(data: Uint8ClampedArray, width: number, height: number) {
  const edges = computeSobelEdges(data, width, height, 80);

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const gray = (r + g + b) / 3;
    const px = i / 4;

    if (edges[px] > 95) {
      // Electric cyan / neon pink outline
      if (px % 2 === 0) {
        data[i] = 0;
        data[i + 1] = 245;
        data[i + 2] = 255; // Neon Cyan
      } else {
        data[i] = 255;
        data[i + 1] = 20;
        data[i + 2] = 180; // Neon Pink
      }
    } else {
      // Dark high-contrast mood
      data[i] = gray < 100 ? gray * 0.3 : Math.min(255, r * 1.3);
      data[i + 1] = gray < 100 ? gray * 0.4 : Math.min(255, g * 0.9);
      data[i + 2] = gray < 100 ? gray * 0.8 : Math.min(255, b * 1.4);
    }
  }
}

function applyGhibli(data: Uint8ClampedArray, _width: number, _height: number) {
  for (let i = 0; i < data.length; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];

    // Lift blacks to dark olive/warm brown, boost lush greens and nostalgic warm sky
    r = Math.min(255, r * 1.08 + 15);
    g = Math.min(255, g * 1.12 + 10);
    b = Math.min(255, b * 0.95);

    data[i] = r;
    data[i + 1] = g;
    data[i + 2] = b;
  }
  applyPosterize(data, 8);
}

function applyPhotoHD(data: Uint8ClampedArray, width: number, height: number) {
  // Unsharp mask approximation: contrast boost + localized edge sharpening
  const edges = computeSobelEdges(data, width, height, 40);

  for (let i = 0; i < data.length; i += 4) {
    const px = i / 4;
    const edge = edges[px];
    const sharpenFactor = edge > 40 ? 1.15 : 1.0;

    data[i] = Math.min(255, Math.max(0, (data[i] - 128) * 1.15 + 128) * sharpenFactor);
    data[i + 1] = Math.min(255, Math.max(0, (data[i + 1] - 128) * 1.15 + 128) * sharpenFactor);
    data[i + 2] = Math.min(255, Math.max(0, (data[i + 2] - 128) * 1.15 + 128) * sharpenFactor);
  }
}

function applyWebtoon(data: Uint8ClampedArray, width: number, height: number) {
  const edges = computeSobelEdges(data, width, height, 70);

  for (let i = 0; i < data.length; i += 4) {
    const px = i / 4;
    if (edges[px] > 95) {
      data[i] = 30;
      data[i + 1] = 25;
      data[i + 2] = 35;
    } else {
      // Smooth skin brightening with subtle pink glow
      data[i] = Math.min(255, data[i] * 1.08 + 8);
      data[i + 1] = Math.min(255, data[i + 1] * 1.04 + 4);
      data[i + 2] = Math.min(255, data[i + 2] * 1.02);
    }
  }
}

function applyComic(data: Uint8ClampedArray, width: number, height: number) {
  applyPosterize(data, 4);
  const edges = computeSobelEdges(data, width, height, 60);

  for (let i = 0; i < data.length; i += 4) {
    const px = i / 4;
    if (edges[px] > 80) {
      data[i] = 10;
      data[i + 1] = 10;
      data[i + 2] = 15;
    }
  }
}

function applyNeoPop(data: Uint8ClampedArray, width: number, height: number) {
  applyPosterize(data, 3);
  boostEdges(data, width, height, 0.8);
}

function applyHyperAnime(data: Uint8ClampedArray, width: number, height: number) {
  const edges = computeSobelEdges(data, width, height, 70);
  for (let i = 0; i < data.length; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];

    // High dynamic range boost
    r = Math.min(255, (r - 128) * 1.3 + 135);
    g = Math.min(255, (g - 128) * 1.25 + 130);
    b = Math.min(255, (b - 128) * 1.4 + 140);

    const px = i / 4;
    if (edges[px] > 95) {
      data[i] = 25;
      data[i + 1] = 20;
      data[i + 2] = 35;
    } else {
      data[i] = r;
      data[i + 1] = g;
      data[i + 2] = b;
    }
  }
}

function applyAutomotive(data: Uint8ClampedArray, width: number, height: number) {
  const edges = computeSobelEdges(data, width, height, 65);
  for (let i = 0; i < data.length; i += 4) {
    // High metallic reflection contrast with asphalt blue
    data[i] = Math.min(255, Math.max(0, (data[i] - 128) * 1.35 + 128));
    data[i + 1] = Math.min(255, Math.max(0, (data[i + 1] - 128) * 1.35 + 128));
    data[i + 2] = Math.min(255, Math.max(0, (data[i + 2] - 128) * 1.45 + 135));

    const px = i / 4;
    if (edges[px] > 90) {
      data[i] = 15;
      data[i + 1] = 18;
      data[i + 2] = 28;
    }
  }
}

function applyPixar(data: Uint8ClampedArray, _width: number, _height: number) {
  for (let i = 0; i < data.length; i += 4) {
    // Warm cinema lighting & rounded smooth vibrancy
    data[i] = Math.min(255, data[i] * 1.1 + 10);
    data[i + 1] = Math.min(255, data[i + 1] * 1.06 + 5);
    data[i + 2] = Math.min(255, data[i + 2] * 0.98);
  }
  applyPosterize(data, 10);
}

function applySilhouette(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  data: Uint8ClampedArray
) {
  // Create beautiful sunset/cyberpunk background gradient
  const grad = ctx.createLinearGradient(0, 0, width, height);
  grad.addColorStop(0, '#f97316'); // Orange
  grad.addColorStop(0.5, '#ec4899'); // Pink
  grad.addColorStop(1, '#6366f1'); // Indigo

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  const backgroundData = ctx.getImageData(0, 0, width, height);
  const bg = backgroundData.data;

  // Threshold subject to dark silhouette
  for (let i = 0; i < data.length; i += 4) {
    const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    if (gray < 140) {
      bg[i] = 15;
      bg[i + 1] = 15;
      bg[i + 2] = 25;
    }
  }

  ctx.putImageData(backgroundData, 0, 0);
}

function applyPixelArt(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  img: HTMLImageElement,
  width: number,
  height: number
) {
  // Downscale to 90px grid
  const pixelFactor = 0.12;
  const smallW = Math.max(16, Math.floor(width * pixelFactor));
  const smallH = Math.max(16, Math.floor(height * pixelFactor));

  const offCanvas = document.createElement('canvas');
  offCanvas.width = smallW;
  offCanvas.height = smallH;
  const offCtx = offCanvas.getContext('2d');
  if (!offCtx) return;

  offCtx.drawImage(img, 0, 0, smallW, smallH);

  // Quantize small canvas colors
  const smallData = offCtx.getImageData(0, 0, smallW, smallH);
  applyPosterize(smallData.data, 4);
  offCtx.putImageData(smallData, 0, 0);

  // Disable smoothing for sharp pixels
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(offCanvas, 0, 0, smallW, smallH, 0, 0, width, height);
}

function applyPosterize(data: Uint8ClampedArray, levels: number) {
  const step = 255 / (levels - 1);
  for (let i = 0; i < data.length; i += 4) {
    data[i] = Math.round(Math.round(data[i] / step) * step);
    data[i + 1] = Math.round(Math.round(data[i + 1] / step) * step);
    data[i + 2] = Math.round(Math.round(data[i + 2] / step) * step);
  }
}

function boostEdges(data: Uint8ClampedArray, width: number, height: number, strength: number) {
  const edges = computeSobelEdges(data, width, height, 70);
  for (let i = 0; i < data.length; i += 4) {
    const px = i / 4;
    if (edges[px] > 80) {
      data[i] = Math.max(0, data[i] * (1 - strength));
      data[i + 1] = Math.max(0, data[i + 1] * (1 - strength));
      data[i + 2] = Math.max(0, data[i + 2] * (1 - strength));
    }
  }
}

function computeSobelEdges(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  _threshold: number
): Uint8ClampedArray {
  const gray = new Uint8Array(width * height);
  for (let i = 0; i < data.length; i += 4) {
    gray[i / 4] = (data[i] * 77 + data[i + 1] * 150 + data[i + 2] * 29) >> 8;
  }

  const edges = new Uint8ClampedArray(width * height);

  for (let y = 1; y < height - 1; y++) {
    const rowPrev = (y - 1) * width;
    const rowCurr = y * width;
    const rowNext = (y + 1) * width;

    for (let x = 1; x < width - 1; x++) {
      // Sobel kernel X
      const gx =
        -gray[rowPrev + x - 1] + gray[rowPrev + x + 1] -
        2 * gray[rowCurr + x - 1] + 2 * gray[rowCurr + x + 1] -
        gray[rowNext + x - 1] + gray[rowNext + x + 1];

      // Sobel kernel Y
      const gy =
        -gray[rowPrev + x - 1] - 2 * gray[rowPrev + x] - gray[rowPrev + x + 1] +
        gray[rowNext + x - 1] + 2 * gray[rowNext + x] + gray[rowNext + x + 1];

      const mag = Math.abs(gx) + Math.abs(gy);
      edges[rowCurr + x] = mag > 255 ? 255 : mag;
    }
  }

  return edges;
}
