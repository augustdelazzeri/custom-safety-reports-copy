import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import React from 'react';

// Fixed internal canvas resolution for consistent cross-device rendering
// All drawings are saved at this resolution regardless of display size
const CANVAS_INTERNAL_WIDTH = 800;
const CANVAS_INTERNAL_HEIGHT = 600; // 4:3 aspect ratio
const CANVAS_ASPECT_RATIO = CANVAS_INTERNAL_WIDTH / CANVAS_INTERNAL_HEIGHT;

// Default max display width for compact use cases (signatures, small diagrams)
const CANVAS_DEFAULT_MAX_WIDTH = 480;

type DrawProps = {
  onFinish?: (data: string) => void;
  onClear?: () => void;
  viewMode?: boolean;
  data?: string;
  label?: string;
  /** When true, canvas uses full available width (for sketch diagrams). Default: false (capped at 480px) */
  fullWidth?: boolean;
  /** @deprecated Use fullWidth prop instead for cross-device consistency */
  height?: number;
};

export const Draw = ({ onFinish, onClear, viewMode = false, data, label, fullWidth = false }: DrawProps) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = React.useState(false);
  const [hasDrawn, setHasDrawn] = React.useState(false);

  // Track if we need to restore data after canvas init
  const dataRef = React.useRef(data);
  dataRef.current = data;

  // Helper to draw image preserving aspect ratio (centered) for legacy images with different dimensions
  const drawImagePreservingAspectRatio = (
    ctx: CanvasRenderingContext2D,
    img: HTMLImageElement,
    canvasWidth: number,
    canvasHeight: number,
  ) => {
    const imgAspect = img.width / img.height;
    const canvasAspect = canvasWidth / canvasHeight;

    let drawWidth: number;
    let drawHeight: number;
    let offsetX = 0;
    let offsetY = 0;

    if (imgAspect > canvasAspect) {
      // Image is wider than canvas - fit to width
      drawWidth = canvasWidth;
      drawHeight = canvasWidth / imgAspect;
      offsetY = (canvasHeight - drawHeight) / 2;
    } else {
      // Image is taller than canvas - fit to height
      drawHeight = canvasHeight;
      drawWidth = canvasHeight * imgAspect;
      offsetX = (canvasWidth - drawWidth) / 2;
    }

    ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
  };

  // Initialize canvas with fixed internal resolution (same on all devices)
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Use requestAnimationFrame to ensure CSS has been applied
    const initCanvas = () => {
      // Use fixed internal resolution - same on all devices for consistent stroke width
      canvas.width = CANVAS_INTERNAL_WIDTH;
      canvas.height = CANVAS_INTERNAL_HEIGHT;

      // Set drawing styles
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // If data exists, display it (preserving aspect ratio for legacy images with different dimensions)
      if (dataRef.current) {
        const img = new Image();
        img.onload = () => {
          drawImagePreservingAspectRatio(ctx, img, CANVAS_INTERNAL_WIDTH, CANVAS_INTERNAL_HEIGHT);
          setHasDrawn(true);
        };
        img.src = dataRef.current;
      }
    };

    // Wait for next frame to ensure CSS has been applied
    requestAnimationFrame(initCanvas);
  }, []); // Only run once on mount

  // Restore drawing when data changes (e.g., after clicking Done)
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // If data is cleared, wipe the canvas and return early
    if (!data) {
      ctx.clearRect(0, 0, CANVAS_INTERNAL_WIDTH, CANVAS_INTERNAL_HEIGHT);
      return;
    }

    const img = new Image();
    img.onload = () => {
      // Clear and redraw to show saved state (preserving aspect ratio for legacy images)
      ctx.clearRect(0, 0, CANVAS_INTERNAL_WIDTH, CANVAS_INTERNAL_HEIGHT);
      drawImagePreservingAspectRatio(ctx, img, CANVAS_INTERNAL_WIDTH, CANVAS_INTERNAL_HEIGHT);
    };
    img.src = data;
  }, [data]);

  // Get coordinates scaled from display size to internal canvas resolution
  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    // Scale from display coordinates to internal canvas coordinates
    const scaleX = CANVAS_INTERNAL_WIDTH / rect.width;
    const scaleY = CANVAS_INTERNAL_HEIGHT / rect.height;

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  // Signature drawing functions
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (viewMode) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsDrawing(true);
    setHasDrawn(true);

    const { x, y } = getCoordinates(e);
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(x, y);
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (viewMode) return;
    e.preventDefault();
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const { x, y } = getCoordinates(e);
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const stopDrawing = (e?: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (viewMode) return;
    if (e) e.preventDefault();
    setIsDrawing(false);
  };

  const handleFinish = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const data = canvas.toDataURL();
      onFinish?.(data);
    }

    setHasDrawn(false);
    setIsDrawing(false);
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, CANVAS_INTERNAL_WIDTH, CANVAS_INTERNAL_HEIGHT);
      }
    }
    setHasDrawn(false);
    setIsDrawing(false);
    onClear?.();
  };

  return (
    <div className="rounded-md border border-gray-200">
      {!viewMode && (
        <div className="rounded-t-md border-b border-gray-200 bg-gray-50 p-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">{label || 'Sign below:'}</span>
            <div className="flex gap-2">
              <Button type="button" variant="outline" size="sm" onClick={handleClear} className="text-xs">
                Clear
              </Button>
              {hasDrawn && (
                <Button type="button" variant="default" size="sm" onClick={handleFinish} className="text-xs">
                  Done
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
      <div className="p-4">
        {/* Canvas uses consistent aspect ratio; fullWidth mode removes max-width for larger drawing areas */}
        <canvas
          ref={canvasRef}
          className={cn('w-full rounded border border-gray-200', viewMode ? 'cursor-default' : 'cursor-crosshair')}
          style={{
            touchAction: viewMode ? 'auto' : 'none',
            maxWidth: fullWidth ? undefined : `${CANVAS_DEFAULT_MAX_WIDTH}px`,
            aspectRatio: `${CANVAS_ASPECT_RATIO}`,
          }}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
      </div>
    </div>
  );
};
