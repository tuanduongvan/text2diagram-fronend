import { useState, useEffect, useRef, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { Textarea } from '../ui/textarea';
import { LoadingSpinner } from '../Spinner';
import { Plus, Trash2 } from 'lucide-react';
import { handleError, CustomError } from '@/utils';
import {
  modifyPromptingSchema,
  ModifyPromptingSchemaType
} from '@/validations';
import { Label } from '../ui/label';
import { PreviewDiagramCanvas } from '../PreviewDiagramCanvas';
import { OrderedExcalidrawElement } from '@excalidraw/excalidraw/element/types';
import { parseMermaidToExcalidraw } from '@/utils/mermaid-to-excalidraw';
import {
  convertToExcalidrawElements,
  exportToCanvas
} from '@excalidraw/excalidraw';
import { modifyDiagram } from '@/services/api';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage
} from '../ui/form';
import { BsStars } from 'react-icons/bs';
import { GeneratedDataType } from '@/pages';
import { DiagramTypeEnum } from '@/interfaces';
import { FullPreviewModal } from './FullPreviewModal';

interface PreviewDiagramModalProps {
  diagramType: DiagramTypeEnum;
  generatedData: GeneratedDataType;
  isColorful: boolean;
  open: boolean;
  onOpenChange: (state: boolean) => void;
  onInsertToEditor: (elements: OrderedExcalidrawElement[]) => void;
  onChangeGeneratedData: (newValue: GeneratedDataType) => void;
}

export const PreviewDiagramModal = (props: PreviewDiagramModalProps) => {
  const {
    generatedData: { mermaidCode, diagramJson },
    diagramType,
    isColorful,
    open,
    onOpenChange,
    onInsertToEditor,
    onChangeGeneratedData
  } = props;
  const form = useForm<ModifyPromptingSchemaType>({
    resolver: zodResolver(modifyPromptingSchema),
    defaultValues: {
      modifyPrompting: ''
    }
  });
  const [isParsing, setIsParsing] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [elements, setElements] = useState<OrderedExcalidrawElement[]>([]);
  const isLoading = useMemo(() => {
    if (!form.formState.isSubmitting && !isParsing) return false;
    return form.formState.isSubmitting || isParsing;
  }, [form.formState.isSubmitting, isParsing]);
  const [isInitializing, setIsInitializing] = useState(false);
  const [fullPreviewOpen, setFullPreviewOpen] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const fullPreviewCanvasRef = useRef<HTMLDivElement>(null);

  const handleOpenFullPreviewDiagramModal = (state: boolean) => {
    exportToCanvas({
      elements,
      exportPadding: 10,
      maxWidthOrHeight: 1750
    }).then((canvas: HTMLCanvasElement) => {
      const refNode = fullPreviewCanvasRef.current;
      if (refNode) {
        refNode.replaceChildren(canvas);
      }
    });

    setFullPreviewOpen(state);
  };

  const onSubmit = async (payload: ModifyPromptingSchemaType) => {
    try {
      const refNode = canvasRef.current;
      if (!refNode) return;
      const formPromptData = new FormData();
      formPromptData.append('feedback', payload.modifyPrompting);
      formPromptData.append('diagramJson', diagramJson);
      formPromptData.append('diagramType', diagramType);
      // { mermaidCode, diagramJson }
      const modifyDiagramRes = await modifyDiagram(formPromptData);
      onChangeGeneratedData(modifyDiagramRes);
      if (modifyDiagramRes.mermaidCode) {
        setIsParsing(true);
        const { elements, files } = await parseMermaidToExcalidraw(
          modifyDiagramRes.mermaidCode,
          {
            isColorful
          }
        );
        const excalidrawElements = convertToExcalidrawElements(elements);
        setElements(excalidrawElements);
        if (refNode) {
          const canvas = await exportToCanvas({
            elements: excalidrawElements,
            files,
            exportPadding: 10,
            maxWidthOrHeight:
              Math.max(
                refNode.parentElement?.offsetWidth || 0,
                refNode.parentElement?.offsetHeight || 0
              ) * window.devicePixelRatio
          });
          refNode.replaceChildren(canvas);
        }
      }
    } catch (error) {
      handleError({ message: String(error), code: 500 } as CustomError);
    } finally {
      setIsParsing(false);
    }
  };
  const handleInsertToEditor = () => {
    onInsertToEditor(elements);
    onOpenChange(false);
    // Clear data after inserting
    handleClear(true);
  };
  const handleClear = (force = false) => {
    if (force || window.confirm('Are you sure you want to clear the generated diagram?')) {
      onChangeGeneratedData({ mermaidCode: '', diagramJson: '' });
      setElements([]);
      if (canvasRef.current) {
        canvasRef.current.replaceChildren();
      }
      setShowClearConfirm(false);
    }
  };
  const handleCloseDialog = () => {
    onOpenChange(false);
  };

  useEffect(() => {
    if (open) {
      form.reset({
        modifyPrompting: ''
      });
      setIsParsing(false);
      setIsInitializing(false);
    }
  }, [open, form]);
  useEffect(() => {
    let mounted = true;

    async function fn() {
      if (!open || !mermaidCode) {
        setIsInitializing(false);
        return;
      }

      setIsInitializing(true);
      // Use requestAnimationFrame to ensure DOM is ready
      requestAnimationFrame(() => {
        const refNode = canvasRef.current;
        if (!refNode || !mounted) {
          setIsInitializing(false);
          return;
        }

        parseMermaidToExcalidraw(mermaidCode, { isColorful })
          .then(({ elements, files }) => {
            if (!mounted) return;
            const excalidrawElements = convertToExcalidrawElements(elements);
            setElements(excalidrawElements);

            if (refNode) {
              exportToCanvas({
                elements: excalidrawElements,
                files,
                exportPadding: 10,
                maxWidthOrHeight:
                  Math.max(
                    refNode.parentElement?.offsetWidth || 0,
                    refNode.parentElement?.offsetHeight || 0
                  ) * window.devicePixelRatio
              }).then((canvas: HTMLCanvasElement) => {
                if (!mounted) return;
                refNode.replaceChildren(canvas);
                setIsInitializing(false);
              });
            }
          })
          .catch((error) => {
            if (!mounted) return;
            handleError({ message: String(error), code: 500 } as CustomError);
            setIsInitializing(false);
          });
      });
    }

    fn();

    return () => {
      mounted = false;
    };
  }, [mermaidCode, isColorful, open]);

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
        <div
          className="space-4 flex flex-col-reverse lg:grid lg:gap-x-4"
          style={{ gridTemplateColumns: '1fr minmax(70%, 2fr)' }}
        >
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 min-w-full max-w-[450px] 2xl:max-w-[500px]"
            >
              <div>
                <Label className="block text-lg font-semibold mb-2">
                  Your Prompt
                </Label>
                <FormField
                  control={form.control}
                  name="modifyPrompting"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          {...field}
                          className="bg-white border-2 border-gray-300 dark:border-gray-600 dark:bg-secondary text-gray-800 dark:text-white h-56 resize-none"
                          placeholder="Describe your requirement in text to modify diagram ..."
                          disabled={form.formState.isSubmitting}
                        />
                      </FormControl>
                      <FormMessage className="text-red-500 text-sm" />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseDialog}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? (
                    <>
                      Modifying <LoadingSpinner className="h-4 w-4" />
                    </>
                  ) : (
                    <>
                      <BsStars /> Modify Diagram
                    </>
                  )}
                </Button>
              </div>
              <div>
                <p className="dark:text-white text-black italic">
                  Note: Please enter modifying prompt in correct format
                </p>
              </div>
            </form>
          </Form>
          <div className="space-y-4">
            <div>
              <Label className="block text-lg font-semibold mb-2">
                Preview
              </Label>
              <div className="relative rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50 min-h-[400px] flex items-center justify-center p-4 overflow-auto">
                <PreviewDiagramCanvas
                  canvasRef={canvasRef}
                  onClick={() => handleOpenFullPreviewDiagramModal(true)}
                />
                {(isLoading || isInitializing) && (
                  <>
                    <div className="absolute inset-0 bg-white/30 dark:bg-black/30 backdrop-blur-[2px] rounded-lg z-10" />
                    <div className="absolute -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 flex flex-col items-center gap-2 z-20">
                      <div className="bg-white/80 dark:bg-gray-900/80 rounded-full p-4 shadow-lg">
                        <LoadingSpinner className="h-12 w-12" />
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 font-medium bg-white/80 dark:bg-gray-900/80 px-4 py-2 rounded-full shadow-sm">
                        {isInitializing ? 'Initializing...' : 'Processing...'}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
            {(mermaidCode ||
              (!isLoading && form.formState.isSubmitSuccessful)) && (
              <div className="flex justify-end gap-2">
                <Button
                  variant="destructive"
                  onClick={() => handleClear()}
                  className="flex items-center gap-2"
                  disabled={isLoading}
                >
                  <Trash2 className="h-4 w-4" />
                  Clear
                </Button>
                <Button
                  onClick={handleInsertToEditor}
                  className="flex items-center gap-2"
                  disabled={isLoading}
                >
                  <Plus className="h-4 w-4" />
                  Insert Diagram
                </Button>
              </div>
            )}
          </div>
          <FullPreviewModal
            open={fullPreviewOpen}
            onOpenChange={handleOpenFullPreviewDiagramModal}
            canvasRef={fullPreviewCanvasRef}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
