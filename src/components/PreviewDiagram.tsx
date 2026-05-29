import { Excalidraw, MainMenu } from '@excalidraw/excalidraw';
import { useEffect, useState } from 'react';
import { SaveDiagramDialog } from './SaveDiagramDialog';
import { useTheme } from './providers/ThemeProvider';
import { mappingAppThemeToExcalidrawTheme } from '@/utils';
import { ExcalidrawImperativeAPI } from '@excalidraw/excalidraw/types';
import { OrderedExcalidrawElement } from '@excalidraw/excalidraw/element/types';

interface PreviewDiagramProps {
  elements: OrderedExcalidrawElement[];
}

export const PreviewDiagram = (props: PreviewDiagramProps) => {
  const { elements: insertedElements } = props;
  const { theme } = useTheme();
  const [excalidrawAPI, setExcalidrawAPI] =
    useState<ExcalidrawImperativeAPI | null>(null);

  useEffect(() => {
    if (excalidrawAPI && theme) {
      const excalidrawTheme = mappingAppThemeToExcalidrawTheme(theme);
      excalidrawAPI.updateScene({ appState: { theme: excalidrawTheme } });
    }
  }, [theme, excalidrawAPI]);
  useEffect(() => {
    if (insertedElements && excalidrawAPI) {
      const selectedElementIds: { [id: string]: true } = {};
      insertedElements.forEach((element) => {
        selectedElementIds[element.id] = true;
      });
      excalidrawAPI.updateScene({
        elements: [...excalidrawAPI.getSceneElements(), ...insertedElements],
        appState: { selectedElementIds }
      });
      excalidrawAPI.scrollToContent(insertedElements, {
        fitToContent: true
      });
    }
  }, [excalidrawAPI, insertedElements]);

  return (
    <div className="my-10 p-4 sm:p-6 md:p-8 rounded-md border-3 dark:border-secondary">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
        <p className="text-2xl md:text-3xl font-semibold text-gray-800 dark:text-white flex items-center gap-2">
          Output
        </p>
        <div
          className={`mt-4 md:mt-0 ${
            insertedElements && insertedElements.length
              ? ''
              : 'pointer-events-none opacity-50'
          }`}
        >
          <SaveDiagramDialog excalidrawAPI={excalidrawAPI} />
        </div>
      </div>

      {/* Excalidraw Container */}
      <div
        className={`
          relative
          mx-auto
          w-full
          max-w-full
          ${insertedElements && insertedElements.length ? '' : 'pointer-events-none opacity-50 -z-50'}
        `}
        id="preview-diagram"
        style={{ height: '100vh', minHeight: '600px' }}
      >
        <Excalidraw
          excalidrawAPI={(api) => setExcalidrawAPI(api)}
          initialData={{
            appState: {
              theme: mappingAppThemeToExcalidrawTheme(theme)
            }
          }}
        >
          <MainMenu>
            <MainMenu.DefaultItems.Export />
            <MainMenu.DefaultItems.SaveAsImage />
            <MainMenu.DefaultItems.ChangeCanvasBackground />
          </MainMenu>
        </Excalidraw>
      </div>
    </div>
  );
};
