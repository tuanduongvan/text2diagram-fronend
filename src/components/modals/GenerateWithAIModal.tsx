import { useState, useEffect, useRef, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '../ui/command';
import { Textarea } from '../ui/textarea';
import { Input } from '../ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { LoadingSpinner } from '../Spinner';
import {
  Check,
  ChevronDown,
  FileText,
  Plus,
  X,
  SquarePen,
  Text,
  Trash2
} from 'lucide-react';
import { DiagramTypeEnum } from '@/interfaces';
import {
  customDisplayDiagramType,
  handleError,
  CustomError,
  webSocketService
} from '@/utils';
import { promptingSchema, PromptingSchemaType } from '@/validations';
import { cn } from '@/lib/utils';
import { Label } from '../ui/label';
import { PreviewDiagramCanvas } from '../PreviewDiagramCanvas';
import { OrderedExcalidrawElement } from '@excalidraw/excalidraw/element/types';
import { parseMermaidToExcalidraw } from '@/utils/mermaid-to-excalidraw';
import {
  convertToExcalidrawElements,
  exportToCanvas
} from '@excalidraw/excalidraw';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage
} from '../ui/form';
import { BsStars } from 'react-icons/bs';
import { Checkbox } from '../ui/checkbox';
import { ModifyPrompting } from '../ModifyPrompting';
import { GeneratedDataType } from '@/pages';
import { toast } from 'sonner';
import { FullPreviewModal } from './FullPreviewModal';
import { generateDiagram } from '@/services/api';

interface GenerateWithAIModalProps {
  open: boolean;
  onOpenChange: (state: boolean) => void;
  onInsertToEditor: (elements: OrderedExcalidrawElement[]) => void;
}

export const GenerateWithAIModal = (props: GenerateWithAIModalProps) => {
  const { open, onOpenChange, onInsertToEditor } = props;
  const form = useForm<PromptingSchemaType>({
    resolver: zodResolver(promptingSchema),
    defaultValues: {
      type: undefined,
      content: '',
      file: undefined
    }
  });

  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [openTypePopover, setOpenTypePopover] = useState<boolean>(false);
  const [isParsing, setIsParsing] = useState(false);
  const [isAlreadyGeneratedSuccess, setIsAlreadyGeneratedSuccess] =
    useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [elements, setElements] = useState<OrderedExcalidrawElement[]>([]);
  const isLoading = useMemo(() => {
    if (!form.formState.isSubmitting && !isParsing) return false;
    return form.formState.isSubmitting || isParsing;
  }, [form.formState.isSubmitting, isParsing]);
  const file = form.watch('file');
  const extension = file ? file.name.split('.').pop() : '';
  const [isColorful, setIsColorful] = useState<boolean>(false);
  const [generatedData, setGeneratedData] = useState<GeneratedDataType>({
    mermaidCode: '',
    diagramJson: ''
  });
  const [isModifyingDiagram, setIsModifyingDiagram] = useState(false);
  const [newEvent, setNewEvent] = useState('');

  const [activeTab, setActiveTab] = useState<'text' | 'file'>(
    localStorage.getItem('activeTab') === 'file' ? 'file' : 'text'
  );

  const [fullPreviewOpen, setFullPreviewOpen] = useState(false);
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

  useEffect(() => {
    localStorage.setItem('activeTab', activeTab);
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'text') {
      form.setValue('file', undefined);
    }
    // Clear old data when switching tabs
    setGeneratedData({ mermaidCode: '', diagramJson: '' });
    setElements([]);
    setIsAlreadyGeneratedSuccess(false);
  }, [activeTab, form]);

  useEffect(() => {
    if (activeTab === 'file') {
      form.setValue('content', '');
    }
    // Clear old data when switching tabs
    setGeneratedData({ mermaidCode: '', diagramJson: '' });
    setElements([]);
    setIsAlreadyGeneratedSuccess(false);
  }, [activeTab, form]);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      form.setValue('file', files[0]);
    }
  };

  const onSubmit = async (payload: PromptingSchemaType) => {
    try {
      const refNode = canvasRef.current;
      if (!refNode) return;

      await webSocketService.start();

      // Wait for connectionId to be received from the server
      const connectionId = await new Promise<string>((resolve) => {
        const existingId = webSocketService.getConnectionId();
        if (existingId) {
          resolve(existingId);
        } else {
          webSocketService.on('ConnectionIdReceived', (id: string) =>
            resolve(id)
          );
        }
      });

      let finalResult: GeneratedDataType;

      if (activeTab === 'file' && payload.file) {
        const formData = new FormData();
        formData.append('type', payload.type);
        formData.append('file', payload.file);
        formData.append('connectionId', connectionId);

        const result = await generateDiagram(formData);
        finalResult = result;
      } else {
        // Listen for completion (for text prompt)
        const completionPromise = new Promise<GeneratedDataType>(
          (resolve, reject) => {
            webSocketService.on('Complete', (data: GeneratedDataType) =>
              resolve(data)
            );
            webSocketService.on('Error', (message: string) =>
              reject(new Error(message))
            );
          }
        );

        // Send generation request via WebSocket (for text prompt)
        webSocketService.send('generate', {
          diagram_type: payload.type,
          text_input: payload.content
        });

        finalResult = await completionPromise;
      }

      const { diagramJson, mermaidCode } = finalResult;

      if (mermaidCode && diagramJson) {
        setGeneratedData({ diagramJson, mermaidCode });
        setIsParsing(true);
        const { elements, files } = await parseMermaidToExcalidraw(
          mermaidCode,
          { isColorful }
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
          setIsAlreadyGeneratedSuccess(true);
        }
      }
      toast.success('Generating Diagram successfully!');
    } catch (error) {
      handleError({ message: String(error), code: 500 } as CustomError);
    } finally {
      setIsParsing(false);
      webSocketService.stop();
    }
  };
  const handleInsertToEditor = () => {
    onInsertToEditor(elements);
    onOpenChange(false);
    handleClear(true);
  };
  const handleCloseDialog = () => {
    onOpenChange(false);
  };
  const handleClear = (force = false) => {
    if (
      force ||
      window.confirm('Are you sure you want to clear the generated diagram?')
    ) {
      setGeneratedData({ mermaidCode: '', diagramJson: '' });
      setElements([]);
      setIsAlreadyGeneratedSuccess(false);
      if (canvasRef.current) {
        canvasRef.current.replaceChildren();
      }
      form.reset({
        type: undefined,
        content: '',
        file: undefined
      });
      setNewEvent('');
    }
  };
  const handleChangeGeneratedData = (newValue: GeneratedDataType) => {
    setGeneratedData(newValue);
  };
  const handleSetDiagramModifying = (state: boolean) => {
    setIsModifyingDiagram(state);
  };
  const handleSetElements = (elements: OrderedExcalidrawElement[]) => {
    setElements(elements);
  };

  // RESET form mỗi khi modal được mở (open = true)
  useEffect(() => {
    if (open) {
      setOpenTypePopover(false);
      setIsParsing(false);
      setIsModifyingDiagram(false);
    }
  }, [open]);

  useEffect(() => {
    let mounted = true;
    async function fn() {
      if (
        !open ||
        !isAlreadyGeneratedSuccess ||
        !generatedData.mermaidCode ||
        !canvasRef.current
      )
        return;

      requestAnimationFrame(async () => {
        const refNode = canvasRef.current;
        if (!refNode || !mounted) return;

        try {
          const { elements: parsedElements, files } =
            await parseMermaidToExcalidraw(generatedData.mermaidCode, {
              isColorful
            });
          const excalidrawElements =
            convertToExcalidrawElements(parsedElements);
          setElements(excalidrawElements);

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
          if (mounted) refNode.replaceChildren(canvas);
        } catch (error) {
          console.error(error);
        }
      });
    }
    fn();
    return () => {
      mounted = false;
    };
  }, [open, isAlreadyGeneratedSuccess, generatedData.mermaidCode, isColorful]);

  useEffect(() => {
    webSocketService.on('StepGenerated', (message: string) => {
      setNewEvent(message);
      console.log('Data received: ', message);
    });
    return () => {
      webSocketService.off('StepGenerated');
      webSocketService.off('Complete');
      webSocketService.off('Error');
    };
  }, []);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="overflow-y-scroll max-h-[80vh] min-w-[80%] 2xl:min-w-[70%]"
        aria-describedby={undefined}
      >
        {/* Tiêu đề modal được canh giữa */}
        <DialogHeader>
          <DialogTitle className="text-center w-full">
            Generate Diagram with AI
          </DialogTitle>
        </DialogHeader>
        {/* Separator của shadcn/ui */}
        <Separator />
        <div
          className="space-y-4 block lg:grid lg:gap-x-4"
          style={{ gridTemplateColumns: '1fr minmax(60%, 2fr)' }}
        >
          {isAlreadyGeneratedSuccess ? (
            <ModifyPrompting
              diagramType={form.getValues().type}
              diagramJson={generatedData.diagramJson}
              canvasRef={canvasRef}
              isColorful={isColorful}
              onSetElements={handleSetElements}
              onChangeGeneratedData={handleChangeGeneratedData}
              onSetProcessing={handleSetDiagramModifying}
            />
          ) : (
            <div>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6 min-w-full max-w-[450px] 2xl:max-w-[500px]"
                >
                  {/* Phần chọn loại diagram */}
                  <div>
                    <Label className="block text-sm font-medium mb-2">
                      Diagram Type
                    </Label>
                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem className="w-fit">
                          <FormControl>
                            <Popover
                              open={openTypePopover}
                              onOpenChange={setOpenTypePopover}
                            >
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  role="combobox"
                                  aria-expanded={openTypePopover}
                                  size="default"
                                  disabled={form.formState.isSubmitting}
                                >
                                  {field.value
                                    ? customDisplayDiagramType(field.value)
                                    : 'Choose a diagram'}
                                  <ChevronDown className="opacity-50" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-[200px] p-0">
                                <Command>
                                  <CommandInput placeholder="Select a diagram" />
                                  <CommandList>
                                    <CommandEmpty>No Type Found.</CommandEmpty>
                                    <CommandGroup>
                                      {Object.values(DiagramTypeEnum).map(
                                        (type) => (
                                          <CommandItem
                                            key={type}
                                            value={type}
                                            onSelect={(
                                              currentValue: string
                                            ) => {
                                              field.onChange(
                                                currentValue as DiagramTypeEnum
                                              );
                                              setOpenTypePopover(false);
                                            }}
                                          >
                                            {customDisplayDiagramType(type)}
                                            <Check
                                              className={cn(
                                                'ml-auto',
                                                type === field.value
                                                  ? 'opacity-100'
                                                  : 'opacity-0'
                                              )}
                                            />
                                          </CommandItem>
                                        )
                                      )}
                                    </CommandGroup>
                                  </CommandList>
                                </Command>
                              </PopoverContent>
                            </Popover>
                          </FormControl>
                          <FormMessage className="text-red-500 text-sm" />
                        </FormItem>
                      )}
                    />
                  </div>
                  <Tabs
                    value={activeTab}
                    onValueChange={(value) =>
                      setActiveTab(value as 'file' | 'text')
                    }
                    className="!mb-4"
                  >
                    <TabsList
                      className={cn(
                        'mb-2 mx-auto',
                        form.formState.isSubmitting &&
                          'opacity-50 cursor-not-allowed'
                      )}
                    >
                      <TabsTrigger value="text">
                        <span className="flex items-center gap-2">
                          <Text />
                          Text Prompt
                        </span>
                      </TabsTrigger>
                      <TabsTrigger value="file">
                        <span className="flex items-center gap-2">
                          <FileText />
                          Upload File
                        </span>
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="text">
                      <div>
                        <Label className="block text-sm font-medium mb-2">
                          Your Prompt
                        </Label>
                        <FormField
                          control={form.control}
                          name="content"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Textarea
                                  {...field}
                                  className={cn(
                                    'bg-white border-3 border-gray-300 dark:border-gray-600 dark:bg-secondary text-gray-800 dark:text-white h-56 resize-none',
                                    form.formState.isSubmitting && 'opacity-50'
                                  )}
                                  placeholder={`Describe your requirement:\n- For Use Case and ER diagrams: provide Software Requirement Specification (SRS)\n- For Flowchart and Sequence diagrams: provide Use Case Specification`}
                                  disabled={form.formState.isSubmitting}
                                />
                              </FormControl>
                              <FormMessage className="text-red-500 text-sm" />
                            </FormItem>
                          )}
                        />
                      </div>
                    </TabsContent>
                    <TabsContent value="file">
                      <div>
                        <Label className="block text-sm font-medium mb-2">
                          Upload File
                        </Label>
                        <FormField
                          control={form.control}
                          name="file"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <div
                                  className={cn(
                                    'relative rounded-md border-3 border-dashed border-gray-300 dark:border-gray-600 bg-neutral-50 dark:bg-neutral-800 transition-colors',
                                    isDragging && 'border-primary'
                                  )}
                                  onDragOver={handleDragOver}
                                  onDragLeave={handleDragLeave}
                                  onDrop={handleDrop}
                                >
                                  {!file ? (
                                    <Label
                                      htmlFor="file"
                                      className="flex flex-col items-center justify-center text-center space-y-2 h-56 w-full cursor-pointer"
                                    >
                                      <div className="relative">
                                        <FileText className="h-12 w-12 text-gray-400 dark:text-gray-500" />
                                        <span className="absolute -bottom-1 -right-1 bg-primary text-white dark:text-black rounded-full p-[2px]">
                                          <Plus className="h-3 w-3" />
                                        </span>
                                      </div>
                                      <p className="font-semibold text-gray-600 dark:text-gray-200">
                                        Click To Upload or Drop File Here
                                      </p>
                                      <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                        Supports PDF, DOCX and TXT
                                      </p>
                                    </Label>
                                  ) : (
                                    <div
                                      className={cn(
                                        'relative p-[1px] rounded-xl',
                                        form.formState.isSubmitting &&
                                          activeTab === 'file' &&
                                          'opacity-50'
                                      )}
                                    >
                                      <div className="relative rounded-xl bg-white dark:bg-neutral-800 p-6 flex flex-col items-center justify-center h-56">
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          className="absolute top-3 right-3"
                                          onClick={() =>
                                            form.setValue('file', undefined)
                                          }
                                          disabled={form.formState.isSubmitting}
                                        >
                                          <X className="h-5 w-5" />
                                        </Button>
                                        {extension === 'docx' ? (
                                          <div className="h-20 w-20 bg-blue-500 dark:bg-blue-900 rounded flex items-center justify-center">
                                            <span className="text-blue-900 dark:text-blue-300 font-bold text-center">
                                              DOCX
                                            </span>
                                          </div>
                                        ) : extension === 'pdf' ? (
                                          <div className="h-20 w-20 bg-red-500 dark:bg-red-900 rounded flex items-center justify-center">
                                            <span className="text-red-700 dark:text-red-300 font-bold text-center">
                                              PDF
                                            </span>
                                          </div>
                                        ) : extension === 'txt' ? (
                                          <div className="h-20 w-20 bg-emerald-500 dark:bg-emerald-900 rounded flex items-center justify-center">
                                            <span className="text-emerald-800 dark:text-emerald-300 font-bold text-center">
                                              TXT
                                            </span>
                                          </div>
                                        ) : null}
                                        <span className="font-semibold mt-2 md:mt-4 text-gray-800 dark:text-gray-200 text-sm line-clamp-1 max-w-xl">
                                          {file.name}
                                        </span>
                                        <Button
                                          type="button"
                                          variant="outline"
                                          className="mt-4 dark:hover:bg-zinc-900 transition-all"
                                          onClick={() =>
                                            document
                                              .getElementById('file')
                                              ?.click()
                                          }
                                          disabled={form.formState.isSubmitting}
                                        >
                                          <SquarePen />
                                          Change File
                                        </Button>
                                      </div>
                                    </div>
                                  )}

                                  <Input
                                    id="file"
                                    type="file"
                                    accept=".docx,.pdf,.txt"
                                    className="hidden"
                                    onChange={(event) => {
                                      if (
                                        event.target.files &&
                                        event.target.files.length > 0
                                      ) {
                                        field.onChange(event.target.files[0]);
                                      }
                                    }}
                                  />
                                </div>
                              </FormControl>
                              <FormMessage className="text-red-500 text-sm" />
                            </FormItem>
                          )}
                        />
                      </div>
                    </TabsContent>
                  </Tabs>

                  <div className="flex flex-row items-center space-x-2 !my-4">
                    <Checkbox
                      id="colorful"
                      disabled={isLoading}
                      checked={isColorful}
                      onCheckedChange={(checked) =>
                        setIsColorful(checked as boolean)
                      }
                    />
                    <Label
                      htmlFor="colorful"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Colorful Diagram
                    </Label>
                  </div>

                  {/* Phần các nút hành động: Generate và Cancel */}
                  <div className="flex justify-end gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCloseDialog}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={form.formState.isSubmitting}
                    >
                      {form.formState.isSubmitting ? (
                        <>
                          Generating <LoadingSpinner className="h-4 w-4" />
                        </>
                      ) : (
                        <>
                          <BsStars /> Generate Diagram
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
              {newEvent && (
                <div className="mt-4 p-4 rounded bg-blue-100 text-blue-800 flex items-center justify-between transition-opacity duration-500">
                  <span className="flex items-center gap-2">
                    <BsStars className="text-blue-400" />
                    {newEvent}
                  </span>
                </div>
              )}
            </div>
          )}
          <div className="space-y-4">
            <div>
              <Label className="block text-lg font-semibold mb-2">
                Preview
              </Label>
              <div className="relative rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50 min-h-[400px] flex items-center justify-center p-4">
                <PreviewDiagramCanvas
                  canvasRef={canvasRef}
                  onClick={() => handleOpenFullPreviewDiagramModal(true)}
                />
                {(isLoading || isModifyingDiagram) && (
                  <>
                    <div className="absolute inset-0 bg-white/30 dark:bg-black/30 backdrop-blur-[2px] rounded-lg z-10" />
                    <div className="absolute -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 flex flex-col items-center gap-2 z-20">
                      <div className="bg-white/80 dark:bg-gray-900/80 rounded-full p-4 shadow-lg">
                        <LoadingSpinner className="h-12 w-12" />
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 font-medium bg-white/80 dark:bg-gray-900/80 px-4 py-2 rounded-full shadow-sm">
                        {isModifyingDiagram
                          ? 'Processing...'
                          : 'Generating diagram...'}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
            {isAlreadyGeneratedSuccess && !isLoading && (
              <div className="flex justify-end gap-2">
                <Button
                  variant="destructive"
                  onClick={() => handleClear()}
                  className="flex items-center gap-2"
                  disabled={isModifyingDiagram}
                >
                  <Trash2 className="h-4 w-4" />
                  Clear
                </Button>
                <Button
                  onClick={handleInsertToEditor}
                  className="flex items-center gap-2"
                  disabled={isModifyingDiagram}
                >
                  <Plus className="h-4 w-4" />
                  Insert Diagram
                </Button>
              </div>
            )}
            <div className="float-right">
              <p className="dark:text-white text-black italic text-sm">
                {form.formState.isSubmitting &&
                  'Note: The process of generating the diagram can be time consuming.'}
              </p>
            </div>
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
