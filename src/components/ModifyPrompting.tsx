import { CustomError, handleError } from '@/utils';
import {
  modifyPromptingSchema,
  ModifyPromptingSchemaType
} from '@/validations';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Label } from './ui/label';
import { Form, FormControl, FormField, FormItem, FormMessage } from './ui/form';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { LoadingSpinner } from './Spinner';
import { BsStars } from 'react-icons/bs';
import { RefObject } from 'react';
import { OrderedExcalidrawElement } from '@excalidraw/excalidraw/element/types';
import { parseMermaidToExcalidraw } from '@/utils/mermaid-to-excalidraw';
import {
  convertToExcalidrawElements,
  exportToCanvas
} from '@excalidraw/excalidraw';
import { modifyDiagram } from '@/services/api';
import { DiagramTypeEnum } from '@/interfaces';
import { GeneratedDataType } from '@/pages';

interface ModifyPromptingProps {
  diagramType: DiagramTypeEnum;
  diagramJson: string;
  canvasRef: RefObject<HTMLDivElement | null>;
  isColorful: boolean;
  onSetElements: (elements: OrderedExcalidrawElement[]) => void;
  onChangeGeneratedData: (newValue: GeneratedDataType) => void;
  onSetProcessing: (state: boolean) => void;
}

export const ModifyPrompting = (props: ModifyPromptingProps) => {
  const {
    diagramJson,
    diagramType,
    isColorful,
    canvasRef,
    onSetElements,
    onSetProcessing,
    onChangeGeneratedData
  } = props;
  const form = useForm<ModifyPromptingSchemaType>({
    resolver: zodResolver(modifyPromptingSchema),
    defaultValues: {
      modifyPrompting: ''
    }
  });

  const onSubmit = async (payload: ModifyPromptingSchemaType) => {
    try {
      onSetProcessing(true);
      const formPromptData = new FormData();
      formPromptData.append('feedback', payload.modifyPrompting);
      formPromptData.append('diagramJson', diagramJson);
      formPromptData.append('diagramType', diagramType);
      // { mermaidCode, diagramJson }
      const modifyDiagramRes = await modifyDiagram(formPromptData);
      onChangeGeneratedData(modifyDiagramRes);
      if (modifyDiagramRes.mermaidCode) {
        const { elements, files } = await parseMermaidToExcalidraw(
          modifyDiagramRes.mermaidCode,
          {
            isColorful
          }
        );
        const excalidrawElements = convertToExcalidrawElements(elements);
        onSetElements(excalidrawElements);
        const refNode = canvasRef.current;
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
      onSetProcessing(false);
    }
  };

  return (
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
          <div>
            <p className="dark:text-white text-black italic">
              Note: Please enter modifying prompt in correct format
            </p>
          </div>
        </div>
      </form>
    </Form>
  );
};
