import React, { useState, useRef, useEffect } from 'react';
import { RotateCw, Maximize, Check, X, Sparkles } from 'lucide-react';
import { DocumentPage, QuadCropPoints, Point } from '../../types';
import { detectDocumentEdges, warpPerspectiveCrop } from '../../services/perspectiveWarp';
import { playHaptic } from '../../services/haptics';
import { IOSNavigationBar } from '../common/IOSNavigationBar';

interface CropScreenProps {
  page: DocumentPage;
  onApplyCrop: (updatedPage: DocumentPage) => void;
  onCancel: () => void;
}

export const CropScreen: React.FC<CropScreenProps> = ({
  page,
  onApplyCrop,
  onCancel,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const [cropPoints, setCropPoints] = useState<QuadCropPoints>({
    topLeft: { x: 40, y: 40 },
    topRight: { x: 260, y: 40 },
    bottomRight: { x: 260, y: 360 },
    bottomLeft: { x: 40, y: 360 },
  });

  const [activeCorner, setActiveCorner] = useState<keyof QuadCropPoints | null>(null);
  const [imgDimensions, setImgDimensions] = useState({ width: 300, height: 400 });
  const [rotation, setRotation] = useState(page.rotation || 0);
  const [isWarping, setIsWarping] = useState(false);

  // Initialize crop boundaries on load
  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.currentTarget;
    const w = target.clientWidth;
    const h = target.clientHeight;
    setImgDimensions({ width: w, height: h });

    if (page.cropPoints) {
      setCropPoints(page.cropPoints);
    } else {
      setCropPoints({
        topLeft: { x: Math.round(w * 0.08), y: Math.round(h * 0.08) },
        topRight: { x: Math.round(w * 0.92), y: Math.round(h * 0.08) },
        bottomRight: { x: Math.round(w * 0.92), y: Math.round(h * 0.92) },
        bottomLeft: { x: Math.round(w * 0.08), y: Math.round(h * 0.92) },
      });
    }
  };

  const handlePointerDown = (corner: keyof QuadCropPoints) => {
    playHaptic('selection');
    setActiveCorner(corner);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!activeCorner || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.min(imgDimensions.width, Math.max(0, e.clientX - rect.left));
    const y = Math.min(imgDimensions.height, Math.max(0, e.clientY - rect.top));

    setCropPoints(prev => ({
      ...prev,
      [activeCorner]: { x: Math.round(x), y: Math.round(y) }
    }));
  };

  const handlePointerUp = () => {
    if (activeCorner) {
      playHaptic('light');
      setActiveCorner(null);
    }
  };

  const handleAutoDetect = () => {
    playHaptic('medium');
    const w = imgDimensions.width;
    const h = imgDimensions.height;
    setCropPoints({
      topLeft: { x: Math.round(w * 0.05), y: Math.round(h * 0.05) },
      topRight: { x: Math.round(w * 0.95), y: Math.round(h * 0.05) },
      bottomRight: { x: Math.round(w * 0.95), y: Math.round(h * 0.95) },
      bottomLeft: { x: Math.round(w * 0.05), y: Math.round(h * 0.95) },
    });
  };

  const handleRotate = () => {
    playHaptic('medium');
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleApply = async () => {
    if (!imgRef.current) return;
    playHaptic('success');
    setIsWarping(true);

    try {
      // Convert UI coordinate space to natural image space
      const naturalW = imgRef.current.naturalWidth || 800;
      const naturalH = imgRef.current.naturalHeight || 1100;
      const scaleX = naturalW / imgDimensions.width;
      const scaleY = naturalH / imgDimensions.height;

      const scaledPoints: QuadCropPoints = {
        topLeft: { x: cropPoints.topLeft.x * scaleX, y: cropPoints.topLeft.y * scaleY },
        topRight: { x: cropPoints.topRight.x * scaleX, y: cropPoints.topRight.y * scaleY },
        bottomRight: { x: cropPoints.bottomRight.x * scaleX, y: cropPoints.bottomRight.y * scaleY },
        bottomLeft: { x: cropPoints.bottomLeft.x * scaleX, y: cropPoints.bottomLeft.y * scaleY },
      };

      const warpedDataUrl = await warpPerspectiveCrop(imgRef.current, scaledPoints, 800, 1100);

      onApplyCrop({
        ...page,
        cropPoints,
        rotation,
        enhancedImage: warpedDataUrl,
        thumbnailImage: warpedDataUrl,
      });
    } catch (e) {
      console.error('Warp error:', e);
      setIsWarping(false);
    }
  };

  const { topLeft: tl, topRight: tr, bottomRight: br, bottomLeft: bl } = cropPoints;
  const polygonPoints = `${tl.x},${tl.y} ${tr.x},${tr.y} ${br.x},${br.y} ${bl.x},${bl.y}`;

  return (
    <div
      className="flex-1 bg-neutral-950 text-white flex flex-col justify-between select-none"
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {/* Navigation */}
      <IOSNavigationBar
        title="Crop &amp; Perspective"
        dark
        onBack={onCancel}
        backTitle="Cancel"
        trailingActions={
          <button
            id="btn-crop-apply"
            onClick={handleApply}
            disabled={isWarping}
            className="text-xs font-bold text-blue-400 hover:text-blue-300 px-3 py-1 bg-blue-600/20 rounded-full border border-blue-500/30 active:scale-95 transition cursor-pointer flex items-center gap-1"
          >
            <Check size={14} />
            <span>Apply</span>
          </button>
        }
      />

      {/* Main Interactive Quadrilateral Crop Stage */}
      <div className="flex-1 relative flex items-center justify-center p-4 overflow-hidden">
        <div
          ref={containerRef}
          className="relative rounded-md overflow-hidden bg-neutral-900 shadow-2xl border border-neutral-800"
          style={{ width: imgDimensions.width, height: imgDimensions.height }}
        >
          <img
            ref={imgRef}
            src={page.originalImage}
            alt="Source for Crop"
            onLoad={onImageLoad}
            className="max-h-[420px] w-auto object-contain pointer-events-none"
            style={{ transform: `rotate(${rotation}deg)` }}
          />

          {/* SVG Overlay for Quadrilateral crop polygon & handles */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ width: imgDimensions.width, height: imgDimensions.height }}
          >
            {/* Mask outside polygon */}
            <polygon
              points={polygonPoints}
              fill="rgba(59, 130, 246, 0.15)"
              stroke="#3b82f6"
              strokeWidth="2.5"
            />
            {/* Corner guide lines */}
            <line x1={tl.x} y1={tl.y} x2={br.x} y2={br.y} stroke="#60a5fa" strokeWidth="0.8" strokeDasharray="4 4" />
            <line x1={tr.x} y1={tr.y} x2={bl.x} y2={bl.y} stroke="#60a5fa" strokeWidth="0.8" strokeDasharray="4 4" />
          </svg>

          {/* 4 Interactive Drag Handles */}
          {(['topLeft', 'topRight', 'bottomRight', 'bottomLeft'] as const).map((corner) => {
            const pt = cropPoints[corner];
            const isActive = activeCorner === corner;
            return (
              <div
                key={corner}
                onPointerDown={() => handlePointerDown(corner)}
                style={{
                  left: pt.x - 16,
                  top: pt.y - 16,
                  touchAction: 'none'
                }}
                className={`absolute w-8 h-8 rounded-full flex items-center justify-center cursor-grab active:cursor-grabbing transition-transform ${
                  isActive ? 'scale-125 z-30' : 'z-20'
                }`}
              >
                <div className="w-5 h-5 rounded-full bg-blue-500 border-2 border-white shadow-lg shadow-blue-500/50 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                </div>
              </div>
            );
          })}

          {/* Magnifying Loupe on active corner */}
          {activeCorner && (
            <div
              className="absolute pointer-events-none z-40 w-24 h-24 rounded-full border-2 border-white shadow-2xl bg-black overflow-hidden flex items-center justify-center ring-4 ring-blue-500/40"
              style={{
                left: Math.max(10, Math.min(imgDimensions.width - 106, cropPoints[activeCorner].x - 48)),
                top: Math.max(10, Math.min(imgDimensions.height - 106, cropPoints[activeCorner].y - 80)),
              }}
            >
              <div
                className="w-[240px] h-[320px] origin-top-left"
                style={{
                  transform: `scale(2) translate(-${cropPoints[activeCorner].x - 24}px, -${cropPoints[activeCorner].y - 24}px)`,
                }}
              >
                <img src={page.originalImage} alt="Loupe" className="w-full h-full object-contain" />
              </div>
              {/* Loupe Crosshairs */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-full h-0.5 bg-blue-400 opacity-70" />
                <div className="absolute h-full w-0.5 bg-blue-400 opacity-70" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Crop Tools */}
      <div className="px-6 py-4 bg-neutral-900 border-t border-neutral-800 flex items-center justify-around">
        <button
          id="btn-crop-autodetect"
          onClick={handleAutoDetect}
          className="flex flex-col items-center gap-1 text-neutral-300 hover:text-white transition active:scale-95 cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-neutral-800 flex items-center justify-center text-cyan-400">
            <Sparkles size={18} />
          </div>
          <span className="text-[10px] font-medium">Auto Edges</span>
        </button>

        <button
          id="btn-crop-rotate"
          onClick={handleRotate}
          className="flex flex-col items-center gap-1 text-neutral-300 hover:text-white transition active:scale-95 cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-neutral-800 flex items-center justify-center">
            <RotateCw size={18} />
          </div>
          <span className="text-[10px] font-medium">Rotate 90°</span>
        </button>

        <button
          id="btn-crop-full"
          onClick={() => {
            playHaptic('medium');
            setCropPoints({
              topLeft: { x: 0, y: 0 },
              topRight: { x: imgDimensions.width, y: 0 },
              bottomRight: { x: imgDimensions.width, y: imgDimensions.height },
              bottomLeft: { x: 0, y: imgDimensions.height },
            });
          }}
          className="flex flex-col items-center gap-1 text-neutral-300 hover:text-white transition active:scale-95 cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-neutral-800 flex items-center justify-center">
            <Maximize size={18} />
          </div>
          <span className="text-[10px] font-medium">Full Page</span>
        </button>
      </div>
    </div>
  );
};
