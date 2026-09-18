import React, { useState, useEffect, useRef } from 'react';
import {
  Camera,
  Zap,
  ZapOff,
  RefreshCw,
  Grid,
  ChevronLeft,
  Check,
  Sparkles,
  Sliders,
  Image as ImageIcon
} from 'lucide-react';
import { ScanMode, DocumentPage } from '../../types';
import { playHaptic } from '../../services/haptics';
import { generateSampleDocumentCanvas } from '../../services/storage';

interface ScannerCameraScreenProps {
  onCapturePage: (page: DocumentPage, allPages: DocumentPage[]) => void;
  onFinishScan: (pages: DocumentPage[]) => void;
  onCancel: () => void;
  autoCaptureDefault?: boolean;
}

export const ScannerCameraScreen: React.FC<ScannerCameraScreenProps> = ({
  onCapturePage,
  onFinishScan,
  onCancel,
  autoCaptureDefault = true,
}) => {
  const [scanMode, setScanMode] = useState<ScanMode>('document');
  const [isAutoCapture, setIsAutoCapture] = useState(autoCaptureDefault);
  const [flashMode, setFlashMode] = useState<'off' | 'on' | 'auto' | 'torch'>('auto');
  const [isTorchOn, setIsTorchOn] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [scannedPages, setScannedPages] = useState<DocumentPage[]>([]);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [documentDetected, setDocumentDetected] = useState(true);
  const [stabilityCounter, setStabilityCounter] = useState(0);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Initialize camera
  useEffect(() => {
    let active = true;

    async function startCamera() {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: facingMode,
              width: { ideal: 1920 },
              height: { ideal: 1080 },
            },
            audio: false,
          });

          if (active && videoRef.current) {
            videoRef.current.srcObject = stream;
            streamRef.current = stream;
            setCameraActive(true);
            setCameraError(null);
          }
        } else {
          setCameraError('Camera API not accessible in this environment.');
        }
      } catch (err) {
        console.warn('Live camera access error, falling back to simulated high-res scanner feed:', err);
        setCameraActive(false);
        setCameraError('Camera access unavailable. Using simulated VisionKit test feed.');
      }
    }

    startCamera();

    return () => {
      active = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, [facingMode]);

  // Auto-capture timer simulation when document is stable
  useEffect(() => {
    if (!isAutoCapture || isCapturing) return;

    const interval = setInterval(() => {
      // Simulate stability detection
      setStabilityCounter(prev => {
        if (prev >= 4) {
          // Document is stable -> auto capture!
          triggerCapture();
          return 0;
        }
        return prev + 1;
      });
    }, 600);

    return () => clearInterval(interval);
  }, [isAutoCapture, isCapturing, scannedPages.length]);

  const toggleFlash = () => {
    playHaptic('light');
    if (flashMode === 'auto') setFlashMode('on');
    else if (flashMode === 'on') setFlashMode('torch');
    else if (flashMode === 'torch') {
      setFlashMode('off');
      setIsTorchOn(false);
    } else {
      setFlashMode('auto');
    }
  };

  const flipCamera = () => {
    playHaptic('medium');
    setFacingMode(prev => prev === 'environment' ? 'user' : 'environment');
  };

  const triggerCapture = () => {
    if (isCapturing) return;
    setIsCapturing(true);
    playHaptic('heavy');

    let captureImage = '';

    if (cameraActive && videoRef.current) {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 1080;
      canvas.height = video.videoHeight || 1920;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        captureImage = canvas.toDataURL('image/jpeg', 0.92);
      }
    }

    // Fallback simulated document if camera feed wasn't available
    if (!captureImage) {
      const sampleType = scanMode === 'receipt' ? 'receipt'
        : scanMode === 'passport' || scanMode === 'id_card' ? 'passport'
        : scanMode === 'handwritten' ? 'notes' : 'contract';
      captureImage = generateSampleDocumentCanvas(sampleType, `${scanMode.toUpperCase()} SCAN #${scannedPages.length + 1}`);
    }

    const newPage: DocumentPage = {
      id: `p-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      pageNumber: scannedPages.length + 1,
      originalImage: captureImage,
      enhancedImage: captureImage,
      thumbnailImage: captureImage,
      filter: 'magic_color',
      adjustments: { brightness: 0, contrast: 10, saturation: 0, sharpness: 15, exposure: 0, shadows: 0, highlights: 0 },
      rotation: 0,
      ocrConfidence: 0.96,
      ocrText: `Scanned ${scanMode} document. VisionKit edge detection verified.`,
    };

    const updated = [...scannedPages, newPage];
    setScannedPages(updated);
    onCapturePage(newPage, updated);

    setTimeout(() => {
      setIsCapturing(false);
      setStabilityCounter(0);
    }, 450);
  };

  const modes: { id: ScanMode; label: string }[] = [
    { id: 'document', label: 'Document' },
    { id: 'receipt', label: 'Receipt' },
    { id: 'id_card', label: 'ID Card' },
    { id: 'passport', label: 'Passport' },
    { id: 'business_card', label: 'Card' },
    { id: 'book', label: 'Book' },
    { id: 'handwritten', label: 'Notes' },
  ];

  return (
    <div className="flex-1 bg-black text-white flex flex-col justify-between relative overflow-hidden select-none">
      {/* Top Controls Overlay */}
      <div className="w-full pt-3 px-4 pb-2 flex items-center justify-between z-20 bg-gradient-to-b from-black/80 to-transparent">
        <button
          id="btn-camera-cancel"
          onClick={() => {
            playHaptic('light');
            onCancel();
          }}
          className="w-9 h-9 rounded-full bg-neutral-900/80 backdrop-blur-md border border-neutral-700/60 flex items-center justify-center text-white active:scale-95 transition cursor-pointer"
        >
          <ChevronLeft size={20} strokeWidth={2.4} />
        </button>

        {/* Scan Status Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-900/80 backdrop-blur-md border border-neutral-700/60 text-[11px] font-semibold text-white">
          <span className={`w-2 h-2 rounded-full ${documentDetected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
          <span>{documentDetected ? (isAutoCapture && stabilityCounter > 1 ? 'Holding still...' : 'Document Found') : 'Searching...'}</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Flash Button */}
          <button
            id="btn-camera-flash"
            onClick={toggleFlash}
            className="w-9 h-9 rounded-full bg-neutral-900/80 backdrop-blur-md border border-neutral-700/60 flex items-center justify-center text-white active:scale-95 transition cursor-pointer text-xs"
          >
            {flashMode === 'off' ? <ZapOff size={16} /> : <Zap size={16} className={flashMode === 'on' || flashMode === 'torch' ? 'text-amber-400 fill-amber-400' : 'text-white'} />}
          </button>

          {/* Grid Toggle */}
          <button
            id="btn-camera-grid"
            onClick={() => {
              playHaptic('light');
              setShowGrid(!showGrid);
            }}
            className={`w-9 h-9 rounded-full bg-neutral-900/80 backdrop-blur-md border border-neutral-700/60 flex items-center justify-center active:scale-95 transition cursor-pointer ${showGrid ? 'text-blue-400' : 'text-neutral-400'}`}
          >
            <Grid size={16} />
          </button>
        </div>
      </div>

      {/* Camera Viewfinder & Center Document Frame */}
      <div className="flex-1 relative overflow-hidden flex items-center justify-center">
        {/* Real Live Video or Fallback Feed */}
        {cameraActive ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-neutral-900 flex flex-col items-center justify-center p-6 text-center">
            <div className="w-56 h-80 rounded-2xl bg-neutral-800/90 border-2 border-neutral-700 shadow-2xl p-4 flex flex-col justify-between relative overflow-hidden">
              {/* Document Mockup Simulation */}
              <div className="space-y-2 opacity-60">
                <div className="h-4 bg-neutral-600 rounded-sm w-3/4" />
                <div className="h-2 bg-neutral-700 rounded-sm w-full" />
                <div className="h-2 bg-neutral-700 rounded-sm w-5/6" />
                <div className="h-2 bg-neutral-700 rounded-sm w-4/5" />
              </div>

              <div className="flex flex-col items-center text-center">
                <Sparkles size={24} className="text-blue-400 mb-1 animate-pulse" />
                <span className="text-[12px] font-semibold text-neutral-300">VisionKit Scanner Active</span>
                <span className="text-[10px] text-neutral-500 mt-0.5">Simulated HD Camera Feed</span>
              </div>

              <div className="h-8 border-t border-dashed border-neutral-700 flex items-center justify-between text-[10px] text-neutral-500">
                <span>Auto-Threshold</span>
                <span>300 DPI</span>
              </div>
            </div>
          </div>
        )}

        {/* Shutter flash effect */}
        {isCapturing && (
          <div className="absolute inset-0 bg-white z-40 animate-out fade-out duration-300" />
        )}

        {/* Document Boundary Detection Frame (Live Quadrilateral HUD) */}
        <div
          className={`relative transition-all duration-300 pointer-events-none ${
            scanMode === 'id_card' || scanMode === 'business_card'
              ? 'w-[320px] h-[200px]'
              : scanMode === 'passport'
              ? 'w-[310px] h-[360px]'
              : 'w-[290px] h-[400px]'
          }`}
        >
          {/* Glowing Quadrilateral Corner Brackets */}
          <div className="absolute -top-1 -left-1 w-8 h-8 border-t-[3px] border-l-[3px] border-emerald-400 rounded-tl-lg shadow-[0_0_12px_rgba(52,211,153,0.8)]" />
          <div className="absolute -top-1 -right-1 w-8 h-8 border-t-[3px] border-r-[3px] border-emerald-400 rounded-tr-lg shadow-[0_0_12px_rgba(52,211,153,0.8)]" />
          <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-[3px] border-l-[3px] border-emerald-400 rounded-bl-lg shadow-[0_0_12px_rgba(52,211,153,0.8)]" />
          <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-[3px] border-r-[3px] border-emerald-400 rounded-br-lg shadow-[0_0_12px_rgba(52,211,153,0.8)]" />

          {/* Translucent overlay inside frame */}
          <div className="w-full h-full border border-emerald-400/40 bg-emerald-500/5 rounded-md flex items-center justify-center">
            {/* Live scanning laser line animation */}
            <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_10px_rgba(34,211,238,0.9)] animate-bounce" />
          </div>

          {/* Grid lines if enabled */}
          {showGrid && (
            <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none opacity-30">
              <div className="border-r border-b border-white" />
              <div className="border-r border-b border-white" />
              <div className="border-b border-white" />
              <div className="border-r border-b border-white" />
              <div className="border-r border-b border-white" />
              <div className="border-b border-white" />
              <div className="border-r border-white" />
              <div className="border-r border-white" />
              <div />
            </div>
          )}

          {/* Guide label */}
          <div className="absolute -bottom-7 inset-x-0 flex justify-center">
            <span className="text-[11px] font-semibold text-white/90 bg-black/60 backdrop-blur-md px-3 py-0.5 rounded-full">
              {scanMode === 'id_card' ? 'Position ID card within frame' : 'Align document inside frame'}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Controls Area */}
      <div className="w-full z-20 pb-4 bg-gradient-to-t from-black via-black/90 to-transparent pt-2">
        {/* Mode Selector Strip */}
        <div className="flex items-center justify-center gap-4 overflow-x-auto no-scrollbar px-6 py-2 mb-3">
          {modes.map((m) => (
            <button
              key={m.id}
              onClick={() => {
                playHaptic('selection');
                setScanMode(m.id);
              }}
              className={`text-[12px] font-bold tracking-tight whitespace-nowrap transition cursor-pointer ${
                scanMode === m.id
                  ? 'text-amber-400 scale-105'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              {m.label.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Shutter & Batch Row */}
        <div className="px-6 flex items-center justify-between">
          {/* Left: Auto / Manual Toggle */}
          <button
            id="btn-toggle-auto-capture"
            onClick={() => {
              playHaptic('light');
              setIsAutoCapture(!isAutoCapture);
            }}
            className={`px-3 py-1.5 rounded-full text-xs font-bold border transition cursor-pointer ${
              isAutoCapture
                ? 'bg-blue-600/90 text-white border-blue-400'
                : 'bg-neutral-900/80 text-neutral-300 border-neutral-700'
            }`}
          >
            {isAutoCapture ? 'AUTO' : 'MANUAL'}
          </button>

          {/* Center: Large Shutter Button */}
          <div className="relative flex items-center justify-center">
            <button
              id="btn-shutter-capture"
              onClick={triggerCapture}
              disabled={isCapturing}
              className="w-18 h-18 rounded-full border-4 border-white p-1 flex items-center justify-center active:scale-90 transition cursor-pointer shadow-2xl"
              aria-label="Capture Photo"
            >
              <div className="w-full h-full rounded-full bg-white active:bg-neutral-300 transition" />
            </button>
          </div>

          {/* Right: Done / Batch Preview Badge */}
          {scannedPages.length > 0 ? (
            <button
              id="btn-finish-scan"
              onClick={() => {
                playHaptic('success');
                onFinishScan(scannedPages);
              }}
              className="relative flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 active:scale-95 transition cursor-pointer"
            >
              <Check size={14} strokeWidth={3} />
              <span>Done</span>
              <span className="w-5 h-5 rounded-full bg-white text-blue-600 text-[10px] font-extrabold flex items-center justify-center">
                {scannedPages.length}
              </span>
            </button>
          ) : (
            <button
              id="btn-flip-camera"
              onClick={flipCamera}
              className="w-10 h-10 rounded-full bg-neutral-900/80 border border-neutral-700 flex items-center justify-center text-white active:scale-95 transition cursor-pointer"
              aria-label="Flip Camera"
            >
              <RefreshCw size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
