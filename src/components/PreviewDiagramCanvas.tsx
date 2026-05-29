import { RefObject } from 'react';

interface PreviewDiagramCanvasProps {
  canvasRef: RefObject<HTMLDivElement | null>;
  onClick?: () => void;
}

export const PreviewDiagramCanvas = (props: PreviewDiagramCanvasProps) => {
  const { canvasRef, onClick } = props;

  return (
    <div
      ref={canvasRef}
      className="inline-block overflow-auto cursor-pointer"
      onClick={onClick}
    />
  );
};
