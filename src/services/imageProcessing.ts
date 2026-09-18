import { FilterType, ImageAdjustments } from '../types';

export const defaultAdjustments: ImageAdjustments = {
  brightness: 0,
  contrast: 0,
  saturation: 0,
  sharpness: 0,
  exposure: 0,
  shadows: 0,
  highlights: 0,
};

export const applyDocumentFilters = (
  sourceImg: HTMLImageElement | HTMLCanvasElement,
  filter: FilterType,
  adjustments: ImageAdjustments,
  rotationDegrees: number = 0
): Promise<string> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) {
      resolve(sourceImg instanceof HTMLCanvasElement ? sourceImg.toDataURL() : sourceImg.src);
      return;
    }

    const rads = (rotationDegrees * Math.PI) / 180;
    const isSideways = rotationDegrees % 180 !== 0;

    const naturalWidth = sourceImg instanceof HTMLCanvasElement ? sourceImg.width : sourceImg.naturalWidth || sourceImg.width;
    const naturalHeight = sourceImg instanceof HTMLCanvasElement ? sourceImg.height : sourceImg.naturalHeight || sourceImg.height;

    canvas.width = isSideways ? naturalHeight : naturalWidth;
    canvas.height = isSideways ? naturalWidth : naturalHeight;

    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(rads);
    ctx.drawImage(sourceImg, -naturalWidth / 2, -naturalHeight / 2);
    ctx.restore();

    // Fast-path for original without adjustments
    if (
      filter === 'original' &&
      adjustments.brightness === 0 &&
      adjustments.contrast === 0 &&
      adjustments.saturation === 0 &&
      adjustments.sharpness === 0 &&
      adjustments.exposure === 0 &&
      adjustments.shadows === 0 &&
      adjustments.highlights === 0
    ) {
      resolve(canvas.toDataURL('image/jpeg', 0.9));
      return;
    }

    // Process pixel buffer
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;
    const len = data.length;

    // Precalculate factors
    const brightnessFactor = (adjustments.brightness + adjustments.exposure) * 1.5;
    const contrastFactor = Math.tan(((adjustments.contrast + 100) * Math.PI) / 400); // 0 to infinity
    const satFactor = (adjustments.saturation + 100) / 100;
    const shadowFactor = adjustments.shadows / 100;
    const highlightFactor = adjustments.highlights / 100;

    for (let i = 0; i < len; i += 4) {
      let r = data[i];
      let g = data[i + 1];
      let b = data[i + 2];

      // 1. Filter Preset Transform
      switch (filter) {
        case 'black_and_white': {
          // Binarization with paper whitening
          const gray = 0.299 * r + 0.587 * g + 0.114 * b;
          // Document adaptive high-contrast threshold
          const threshold = 145;
          const val = gray > threshold ? 255 : (gray * 0.7);
          r = val;
          g = val;
          b = val;
          break;
        }

        case 'grayscale': {
          const gray = 0.299 * r + 0.587 * g + 0.114 * b;
          // Slight contrast bump for paper clarity
          const enhancedGray = Math.min(255, Math.max(0, (gray - 128) * 1.2 + 138));
          r = enhancedGray;
          g = enhancedGray;
          b = enhancedGray;
          break;
        }

        case 'magic_color': {
          // Flatten paper yellows/grays towards clean white, saturate text
          const maxVal = Math.max(r, g, b);
          const minVal = Math.min(r, g, b);
          const delta = maxVal - minVal;
          // If close to neutral/gray/white, whiten it
          if (minVal > 140 && delta < 45) {
            r = Math.min(255, r * 1.15);
            g = Math.min(255, g * 1.15);
            b = Math.min(255, b * 1.15);
          } else {
            // Sharpen text ink
            r = Math.max(0, r * 0.9);
            g = Math.max(0, g * 0.9);
            b = Math.max(0, b * 0.9);
          }
          break;
        }

        case 'document': {
          // High contrast clean document filter
          const gray = 0.299 * r + 0.587 * g + 0.114 * b;
          if (gray > 160) {
            // Push bright paper background to crisp white
            r = Math.min(255, gray + (255 - gray) * 0.75);
            g = r;
            b = r;
          } else {
            // Darken ink text
            r = Math.max(0, gray * 0.7);
            g = r;
            b = r;
          }
          break;
        }

        case 'enhanced': {
          // Auto color & edge balance
          r = Math.min(255, Math.max(0, (r - 128) * 1.25 + 132));
          g = Math.min(255, Math.max(0, (g - 128) * 1.25 + 132));
          b = Math.min(255, Math.max(0, (b - 128) * 1.25 + 132));
          break;
        }

        case 'low_light': {
          // Gamma lift + shadow enhancement
          r = Math.min(255, Math.pow(r / 255, 0.72) * 255 + 20);
          g = Math.min(255, Math.pow(g / 255, 0.72) * 255 + 20);
          b = Math.min(255, Math.pow(b / 255, 0.72) * 255 + 20);
          break;
        }

        case 'auto': {
          // Smart balance
          const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
          if (luminance > 180) {
            r = Math.min(255, r * 1.08);
            g = Math.min(255, g * 1.08);
            b = Math.min(255, b * 1.08);
          } else if (luminance < 90) {
            r = Math.max(0, r * 0.85);
            g = Math.max(0, g * 0.85);
            b = Math.max(0, b * 0.85);
          }
          break;
        }

        case 'original':
        default:
          break;
      }

      // 2. Manual Adjustments: Brightness & Exposure
      r += brightnessFactor;
      g += brightnessFactor;
      b += brightnessFactor;

      // 3. Contrast
      r = (r - 128) * contrastFactor + 128;
      g = (g - 128) * contrastFactor + 128;
      b = (b - 128) * contrastFactor + 128;

      // 4. Shadows & Highlights
      const lum = (r + g + b) / 3;
      if (lum < 128) {
        const factor = (128 - lum) / 128 * shadowFactor * 40;
        r += factor;
        g += factor;
        b += factor;
      } else {
        const factor = (lum - 128) / 128 * highlightFactor * 40;
        r -= factor;
        g -= factor;
        b -= factor;
      }

      // 5. Saturation
      if (satFactor !== 1) {
        const grayVal = 0.299 * r + 0.587 * g + 0.114 * b;
        r = grayVal + (r - grayVal) * satFactor;
        g = grayVal + (g - grayVal) * satFactor;
        b = grayVal + (b - grayVal) * satFactor;
      }

      // Clamp values
      data[i] = Math.min(255, Math.max(0, r));
      data[i + 1] = Math.min(255, Math.max(0, g));
      data[i + 2] = Math.min(255, Math.max(0, b));
    }

    ctx.putImageData(imgData, 0, 0);

    // 6. Optional Sharpness filter using 3x3 convolution
    if (adjustments.sharpness > 0) {
      const sharpAmount = adjustments.sharpness / 100;
      const kernel = [
        0, -sharpAmount * 0.5, 0,
        -sharpAmount * 0.5, 1 + 2 * sharpAmount, -sharpAmount * 0.5,
        0, -sharpAmount * 0.5, 0
      ];
      applyConvolution(ctx, canvas.width, canvas.height, kernel);
    }

    resolve(canvas.toDataURL('image/jpeg', 0.9));
  });
};

function applyConvolution(ctx: CanvasRenderingContext2D, width: number, height: number, weights: number[]) {
  const srcData = ctx.getImageData(0, 0, width, height);
  const dstData = ctx.createImageData(width, height);
  const src = srcData.data;
  const dst = dstData.data;

  const side = 3;
  const halfSide = 1;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const dstOff = (y * width + x) * 4;
      let r = 0, g = 0, b = 0;

      for (let cy = 0; cy < side; cy++) {
        for (let cx = 0; cx < side; cx++) {
          const scy = Math.min(height - 1, Math.max(0, y + cy - halfSide));
          const scx = Math.min(width - 1, Math.max(0, x + cx - halfSide));
          const srcOff = (scy * width + scx) * 4;
          const wt = weights[cy * side + cx];

          r += src[srcOff] * wt;
          g += src[srcOff + 1] * wt;
          b += src[srcOff + 2] * wt;
        }
      }

      dst[dstOff] = Math.min(255, Math.max(0, r));
      dst[dstOff + 1] = Math.min(255, Math.max(0, g));
      dst[dstOff + 2] = Math.min(255, Math.max(0, b));
      dst[dstOff + 3] = src[dstOff + 3];
    }
  }

  ctx.putImageData(dstData, 0, 0);
}
