import { Button } from './ui/button';
import { Minimize2, ZoomIn, ZoomOut } from 'lucide-react';
import { MAX_ZOOM, MIN_ZOOM, ZOOM_STEP } from '@/utils';

interface ZoomPreviewDiagramProps {
  zoom: number;
  onSetZoom: (zoom: number) => void;
}

export const ZoomPreviewDiagram = (props: ZoomPreviewDiagramProps) => {
  const { zoom, onSetZoom } = props;

  const round = (num: number) => {
    return Number(num.toFixed(1));
  };

  return (
    <div className="z-10 bottom-2 right-2 rounded-md flex items-center gap-2 mb-2 justify-end drop-shadow-sm bg-white dark:bg-black">
      <Button
        type="button"
        size="icon"
        variant="ghost"
        onClick={() => onSetZoom(round(Math.max(MIN_ZOOM, zoom - ZOOM_STEP)))}
        disabled={zoom <= MIN_ZOOM}
        title="Zoom Out"
      >
        <ZoomOut className="w-5 h-5" />
      </Button>
      <span className="text-sm w-12 text-center select-none">
        {Math.round(zoom * 100)}%
      </span>
      <Button
        type="button"
        size="icon"
        variant="ghost"
        onClick={() => onSetZoom(round(Math.min(MAX_ZOOM, zoom + ZOOM_STEP)))}
        disabled={zoom >= MAX_ZOOM}
        title="Zoom In"
      >
        <ZoomIn className="w-5 h-5" />
      </Button>
      <Button
        type="button"
        size="icon"
        variant="ghost"
        onClick={() => onSetZoom(1)}
        disabled={zoom === 1}
        title="Reset Zoom"
      >
        <Minimize2 className="w-5 h-5" />
      </Button>
    </div>
  );
};
