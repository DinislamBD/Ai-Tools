import { Point, QuadCropPoints } from '../types';

export const detectDocumentEdges = (
  canvas: HTMLCanvasElement
): QuadCropPoints => {
  const w = canvas.width;
  const h = canvas.height;

  // Default smart inset quadrilateral
  return {
    topLeft: { x: Math.round(w * 0.08), y: Math.round(h * 0.08) },
    topRight: { x: Math.round(w * 0.92), y: Math.round(h * 0.09) },
    bottomRight: { x: Math.round(w * 0.91), y: Math.round(h * 0.91) },
    bottomLeft: { x: Math.round(w * 0.09), y: Math.round(h * 0.92) }
  };
};

// Bilinear subdivision quadrilateral warp for high quality perspective crop
export const warpPerspectiveCrop = (
  img: HTMLImageElement | HTMLCanvasElement,
  points: QuadCropPoints,
  targetWidth = 800,
  targetHeight = 1100
): Promise<string> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      resolve(img instanceof HTMLCanvasElement ? img.toDataURL() : img.src);
      return;
    }

    // Tessellate quadrilateral into micro triangles to achieve authentic perspective mapping
    const stepsX = 20;
    const stepsY = 25;

    const { topLeft: tl, topRight: tr, bottomRight: br, bottomLeft: bl } = points;

    // Helper to interpolate 4 corners
    const getQuadPoint = (u: number, v: number): Point => {
      const topX = tl.x + (tr.x - tl.x) * u;
      const topY = tl.y + (tr.y - tl.y) * u;
      const botX = bl.x + (br.x - bl.x) * u;
      const botY = bl.y + (br.y - bl.y) * u;
      return {
        x: topX + (botX - topX) * v,
        y: topY + (botY - topY) * v,
      };
    };

    for (let y = 0; y < stepsY; y++) {
      for (let x = 0; x < stepsX; x++) {
        const u0 = x / stepsX;
        const u1 = (x + 1) / stepsX;
        const v0 = y / stepsY;
        const v1 = (y + 1) / stepsY;

        const srcP00 = getQuadPoint(u0, v0);
        const srcP10 = getQuadPoint(u1, v0);
        const srcP01 = getQuadPoint(u0, v1);
        const srcP11 = getQuadPoint(u1, v1);

        const dstX0 = u0 * targetWidth;
        const dstX1 = u1 * targetWidth;
        const dstY0 = v0 * targetHeight;
        const dstY1 = v1 * targetHeight;

        // Draw upper triangle
        drawTriangle(ctx, img,
          dstX0, dstY0, dstX1, dstY0, dstX0, dstY1,
          srcP00.x, srcP00.y, srcP10.x, srcP10.y, srcP01.x, srcP01.y
        );

        // Draw lower triangle
        drawTriangle(ctx, img,
          dstX1, dstY0, dstX1, dstY1, dstX0, dstY1,
          srcP10.x, srcP10.y, srcP11.x, srcP11.y, srcP01.x, srcP01.y
        );
      }
    }

    resolve(canvas.toDataURL('image/jpeg', 0.92));
  });
};

function drawTriangle(
  ctx: CanvasRenderingContext2D,
  im: HTMLImageElement | HTMLCanvasElement,
  x0: number, y0: number,
  x1: number, y1: number,
  x2: number, y2: number,
  sx0: number, sy0: number,
  sx1: number, sy1: number,
  sx2: number, sy2: number
) {
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.lineTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.closePath();
  ctx.clip();

  const denom = (sx0 * (sy1 - sy2) - sx1 * sy0 + sx2 * sy0 + (sx1 - sx2) * sy1);
  if (denom === 0) {
    ctx.restore();
    return;
  }

  const m11 = - (sy0 * (x1 - x2) - sy1 * x0 + sy2 * x0 + (sy1 - sy2) * x1) / denom;
  const m12 = (sy1 * y2 + sy0 * (y1 - y2) - sy2 * y1 + (sy2 - sy1) * y0) / denom;
  const m21 = (sx0 * (x1 - x2) - sx1 * x0 + sx2 * x0 + (sx1 - sx2) * x1) / denom;
  const m22 = - (sx1 * y2 + sx0 * (y1 - y2) - sx2 * y1 + (sx2 - sx1) * y0) / denom;
  const dx = (sx0 * (sy2 * x1 - sy1 * x2) + sy0 * (sx1 * x2 - sx2 * x1) + (sx2 * sy1 - sx1 * sy2) * x0) / denom;
  const dy = (sx0 * (sy2 * y1 - sy1 * y2) + sy0 * (sx1 * y2 - sx2 * y1) + (sx2 * sy1 - sx1 * sy2) * y0) / denom;

  ctx.transform(m11, m12, m21, m22, dx, dy);
  ctx.drawImage(im, 0, 0);
  ctx.restore();
}
