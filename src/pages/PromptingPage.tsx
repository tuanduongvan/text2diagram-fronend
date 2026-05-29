import { PreviewDiagram } from '@/components/PreviewDiagram';
import { LoadingSpinner } from '@/components/Spinner';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@/components/ui/command';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { DiagramTypeEnum } from '@/interfaces';
import { cn } from '@/lib/utils';
import {
  customDisplayDiagramType,
  CustomError,
  handleError,
  signalRConnection
} from '@/utils';
import { promptingSchema, PromptingSchemaType } from '@/validations';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Check,
  ChevronDown,
  FileText,
  FolderKanban,
  Plus,
  Text,
  X,
  SquarePen
} from 'lucide-react';
import { BsStars } from 'react-icons/bs';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { generateDiagram } from '@/services/api';
import { PreviewDiagramModal } from '@/components/modals/PreviewDiagramModal';
import { OrderedExcalidrawElement } from '@excalidraw/excalidraw/element/types';
import { toast } from 'sonner';

export type GeneratedDataType = {
  mermaidCode: string;
  diagramJson: string;
};

export const PromptingPage = () => {
  const form = useForm<PromptingSchemaType>({
    resolver: zodResolver(promptingSchema),
    defaultValues: {
      type: undefined,
      content: '',
      file: undefined
    }
  });
  const [open, setOpen] = useState(false);
  const [generatedData, setGeneratedData] = useState<GeneratedDataType>({
    mermaidCode: '',
    diagramJson: ''
  });
  const [isColorful, setIsColorful] = useState<boolean>(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [insertedElements, setInsertedElements] = useState<
    OrderedExcalidrawElement[]
  >([]);
  const [newEvent, setNewEvent] = useState('');
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'text' | 'file'>(
    localStorage.getItem('activeTab') === 'file' ? 'file' : 'text'
  );

  const file = form.watch('file');
  const extension = file ? file.name.split('.').pop() : '';

  useEffect(() => {
    localStorage.setItem('activeTab', activeTab);
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'text') {
      form.setValue('file', undefined);
    }
  }, [activeTab, form]);

  useEffect(() => {
    if (activeTab === 'file') {
      form.setValue('content', '');
    }
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
      const mapper = {
        type: 'diagramType',
        content: 'textInput',
        file: 'fileInput'
      };
      const formData = Object.keys(payload).reduce((formData, key) => {
        const k = key as keyof PromptingSchemaType;
        if (payload[k] && mapper[k]) {
          formData.append(mapper[k], payload[k]);
        }
        return formData;
      }, new FormData());
      await signalRConnection.start();
      const { diagramJson, mermaidCode } = await generateDiagram(formData);
      setGeneratedData({ mermaidCode, diagramJson });
      toast.success('Generating Diagram successfully!');
      setIsPreviewOpen(true);
    } catch (error) {
      handleError({
        message: 'Failed to generate diagram. Please try again.',
        code: 500
      } as CustomError);
      console.error('Error creating project:', error);
    } finally {
      await signalRConnection.stop();
    }
  };
  const handleOpenPreviewDiagramModal = (state: boolean) => {
    setIsPreviewOpen(state);
  };
  const handleInsertToEditor = (
    elementsToInsert: OrderedExcalidrawElement[]
  ) => {
    console.log('INSERT: ', elementsToInsert);
    setInsertedElements(elementsToInsert);
    setTimeout(() => {
      const previewElement = document.querySelector('#preview-diagram');
      if (previewElement) {
        previewElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };
  const handleChangeGeneratedData = (newValue: GeneratedDataType) => {
    setGeneratedData(newValue);
  };

  useEffect(() => {
    signalRConnection.on('StepGenerated', (message: string) => {
      setNewEvent(message);
      console.log('Data received: ', message);
    });
    return () => {
      signalRConnection.off('StepGenerated');
    };
  }, []);

  return (
    <div className="px-4 md:px-10 xl:px-[4rem] py-10">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="relative space-y-4"
        >
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem className="w-fit">
                <FormControl>
                  <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
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
                            {Object.values(DiagramTypeEnum).map((type) => (
                              <CommandItem
                                key={type}
                                value={type}
                                onSelect={(currentValue: string) => {
                                  field.onChange(
                                    currentValue as DiagramTypeEnum
                                  );
                                  setOpen(false);
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
                            ))}
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

          <Button className="absolute right-0 top-0">
            <Link
              to="../workspace"
              className="flex items-center justify-between gap-2"
            >
              <FolderKanban />
              <span className="hidden md:block">My Workspace</span>
            </Link>
          </Button>

          <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as 'file' | 'text')}
          >
            <TabsList
              className={cn(
                'mb-4',
                form.formState.isSubmitting && 'opacity-50 cursor-not-allowed'
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

            {/* Tab Text Prompt */}
            <TabsContent value="text">
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        {...field}
                        className={cn(
                          'bg-white border-2 border-zinc-300 dark:border-zinc-600 dark:bg-secondary text-gray-800 dark:text-white h-56 resize-none',
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
            </TabsContent>

            <TabsContent value="file">
              <FormField
                control={form.control}
                name="file"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div
                        className={cn(
                          'relative rounded-md border-2 border-dashed border-zinc-300 dark:border-zinc-600 bg-neutral-50 dark:bg-neutral-800 transition-colors',
                          isDragging && 'border-primary'
                        )}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                      >
                        {!file ? (
                          <label
                            htmlFor="file"
                            className="flex flex-col items-center justify-center text-center space-y-2 h-56 w-full cursor-pointer"
                          >
                            <div className="relative">
                              <FileText className="h-12 w-12 text-zinc-400 dark:text-zinc-500" />
                              <span className="absolute -bottom-1 -right-1 bg-primary text-white dark:text-black rounded-full p-[2px]">
                                <Plus className="h-3 w-3" />
                              </span>
                            </div>
                            <p className="font-semibold text-zinc-600 dark:text-zinc-200">
                              Click To Upload or Drop File Here
                            </p>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400">
                              Supports PDF, DOCX and TXT
                            </p>
                          </label>
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
                                variant="ghost"
                                className="absolute top-3 right-3"
                                onClick={() => form.setValue('file', undefined)}
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
                                  document.getElementById('file')?.click()
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
            </TabsContent>
          </Tabs>
          <div className="float-right">
            <p className="dark:text-white text-black italic text-sm">
              {form.formState.isSubmitting &&
                'Note: The process of generating the diagram can be time consuming.'}
            </p>
          </div>
          <div className="flex flex-row items-center space-x-2 space-y-0">
            <Checkbox
              id="colorful"
              disabled={form.formState.isSubmitting}
              checked={isColorful}
              onCheckedChange={(checked) => setIsColorful(checked as boolean)}
            />
            <Label
              htmlFor="colorful"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Colorful Diagram
            </Label>
          </div>

          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? (
              <>
                <BsStars /> Generating{' '}
                <LoadingSpinner className="h-4 w-4 ml-2" />
              </>
            ) : (
              <>
                <BsStars />
                Generate Diagram
              </>
            )}
          </Button>
        </form>
      </Form>
      {newEvent && (
        <div className="my-4 p-4 rounded bg-blue-100 text-blue-800 flex items-center justify-between transition-opacity duration-500">
          <span className="flex items-center gap-2">
            <BsStars className="text-blue-400" />
            {newEvent}
          </span>
        </div>
      )}
      <PreviewDiagramModal
        diagramType={form.getValues().type}
        generatedData={generatedData}
        isColorful={isColorful}
        open={isPreviewOpen}
        onOpenChange={handleOpenPreviewDiagramModal}
        onInsertToEditor={handleInsertToEditor}
        onChangeGeneratedData={handleChangeGeneratedData}
      />
      <PreviewDiagram elements={insertedElements} />
    </div>
  );
};
