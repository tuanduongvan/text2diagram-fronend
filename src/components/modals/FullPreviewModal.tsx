import { RefObject } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Separator } from '../ui/separator';
import { PreviewDiagramCanvas } from '../PreviewDiagramCanvas';

interface FullPreviewModalProps {
  open: boolean;
  onOpenChange: (state: boolean) => void;
  canvasRef: RefObject<HTMLDivElement | null>;
}

export const FullPreviewModal = (props: FullPreviewModalProps) => {
  const { open, onOpenChange, canvasRef } = props;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="overflow-y-scroll max-h-[80vh] min-w-[80%] 2xl:min-w-[70%]"
        aria-describedby={undefined}
      >
        <DialogHeader>
          <DialogTitle className="text-center text-xl w-full">
            Preview Diagram
          </DialogTitle>
        </DialogHeader>
        <Separator />
        <div className="w-full h-full overflow-auto flex justify-center items-center">
          <PreviewDiagramCanvas canvasRef={canvasRef} />
        </div>
      </DialogContent>
    </Dialog>
  );
};
