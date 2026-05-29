import {
  Theme as AppTheme,
  useTheme
} from '@/components/providers/ThemeProvider';
import { mappingAppThemeToExcalidrawTheme } from '@/utils';
import { Excalidraw, MainMenu } from '@excalidraw/excalidraw';
import {
  NonDeletedExcalidrawElement,
  Ordered,
  OrderedExcalidrawElement,
  Theme
} from '@excalidraw/excalidraw/element/types';
import {
  ExcalidrawImperativeAPI,
  AppState
} from '@excalidraw/excalidraw/types';
import { GenerateWithAIModal } from '@/components/modals/GenerateWithAIModal';
import { LogOut, Stars } from 'lucide-react';
import { useEffect, useState, useRef, useCallback } from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { useNavigate, useParams } from 'react-router-dom';
import { getProjectById, updateProject } from '@/services/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CustomError, handleError } from '@/utils';

type ExcalidrawData = {
  elements?: Readonly<Array<object>>;
  appState?: AppState;
  files?: object;
};

type SavedDataRef = {
  elements: readonly Ordered<NonDeletedExcalidrawElement>[];
  appState: AppState;
  files: object;
};

export const DrawPage = () => {
  const { theme, setTheme } = useTheme();
  const [excalidrawAPI, setExcalidrawAPI] =
    useState<ExcalidrawImperativeAPI | null>(null);
  const [open, setOpen] = useState(false);
  const [exitIconColor, setExitIconColor] = useState('');
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const lastSavedData = useRef<SavedDataRef>({} as SavedDataRef);
  const saveTimeoutRef = useRef<NodeJS.Timeout>(null);
  const queryClient = useQueryClient();

  const { mutate: saveProject } = useMutation({
    mutationFn: updateProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', 1] });
    },
    onError: (error) => {
      handleError({
        message: 'Failed to save project. Please try again.',
        code: 500
      } as CustomError);
      console.error('Error saving project:', error);
    }
  });

  const getInitialState = async () => {
    const { data } = await getProjectById(id!);
    const { appState, ...rest } = data as ExcalidrawData;
    if (appState) {
      appState.collaborators = new Map();
      appState.theme = mappingAppThemeToExcalidrawTheme(theme);
    }
    lastSavedData.current = {
      elements: JSON.parse(JSON.stringify(data.elements || [])),
      appState: JSON.parse(JSON.stringify(appState || {})),
      files: JSON.parse(JSON.stringify(data.files || {}))
    };
    return {
      ...rest,
      appState,
      scrollToContent: true
    };
  };

  const changeTheme = (theme: Theme) => {
    console.log('Changed theme: ', theme);
    setTheme(theme as AppTheme);
  };

  const handleOpenModal = (state: boolean) => {
    setOpen(state);
  };

  const debouncedSave = useCallback(() => {
    // Clear any existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    // Set a new timeout
    saveTimeoutRef.current = setTimeout(() => {
      if (id && excalidrawAPI) {
        const [elements, appState, files] = [
          excalidrawAPI.getSceneElements(),
          excalidrawAPI.getAppState(),
          excalidrawAPI.getFiles()
        ];
        saveProject({
          id,
          data: {
            elements,
            appState,
            files
          }
        });
        lastSavedData.current = {
          elements: JSON.parse(JSON.stringify(elements)),
          appState: JSON.parse(JSON.stringify(appState)),
          files: JSON.parse(JSON.stringify(files))
        };
      }
    }, 1000); // 1.0 second delay
  }, [id, excalidrawAPI, saveProject]);

  const handleExcalidrawChange = () => {
    if (excalidrawAPI) {
      const [elements, appState, files] = [
        excalidrawAPI.getSceneElements(),
        excalidrawAPI.getAppState(),
        excalidrawAPI.getFiles()
      ];
      // Check if elements/appState/files have actually changed
      const hasElementsChanges =
        !!lastSavedData.current.elements &&
        JSON.stringify(elements) !==
          JSON.stringify(lastSavedData.current.elements);
      const hasAppStatesChanges =
        !!lastSavedData.current.appState &&
        JSON.stringify(appState) !==
          JSON.stringify(lastSavedData.current.appState);
      const hasFilesChanges =
        !!lastSavedData.current.files &&
        JSON.stringify(files) !== JSON.stringify(lastSavedData.current.files);

      if (hasElementsChanges || hasAppStatesChanges || hasFilesChanges) {
        debouncedSave();
      }
    }
  };

  const handleInsertToEditor = (
    elementsToInsert: OrderedExcalidrawElement[]
  ) => {
    console.log('INSERT: ', elementsToInsert);
    if (excalidrawAPI) {
      const selectedElementIds: { [id: string]: true } = {};
      elementsToInsert.forEach((element) => {
        selectedElementIds[element.id] = true;
      });
      excalidrawAPI.updateScene({
        elements: [...excalidrawAPI.getSceneElements(), ...elementsToInsert],
        appState: {
          selectedElementIds
        }
      });
      excalidrawAPI.scrollToContent(elementsToInsert, {
        fitToContent: true
      });
    }
  };

  useEffect(() => {
    if (excalidrawAPI && theme) {
      const excalidrawTheme = mappingAppThemeToExcalidrawTheme(theme);
      excalidrawAPI.updateScene({ appState: { theme: excalidrawTheme } });
      if (excalidrawTheme === 'dark') {
        setExitIconColor('text-white/70');
      } else {
        setExitIconColor('text-black/70');
      }
      console.log('Updated theme', excalidrawTheme);
    }
  }, [theme, excalidrawAPI]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="h-screen w-full">
      <Excalidraw
        onChange={handleExcalidrawChange}
        initialData={getInitialState}
        excalidrawAPI={(api) => setExcalidrawAPI(api)}
        renderTopRightUI={() => {
          return (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <button
                    className="rounded-md border-1 p-1.5"
                    style={{
                      background: `linear-gradient(#e66465, #9198e5)`
                    }}
                    onClick={() => setOpen(true)}
                  >
                    <Stars className="text-white" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Generate with AI</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        }}
      >
        <MainMenu>
          <MainMenu.DefaultItems.LoadScene />
          <MainMenu.DefaultItems.Export />
          <MainMenu.DefaultItems.SaveAsImage />
          <MainMenu.DefaultItems.SearchMenu />
          <MainMenu.DefaultItems.ClearCanvas />
          <MainMenu.DefaultItems.ToggleTheme onSelect={changeTheme} />
          <MainMenu.ItemCustom className="!mt-0">
            <button
              onClick={() => navigate('/workspace')}
              className="dropdown-menu-item dropdown-menu-item-base"
            >
              <div className="dropdown-menu-item__icon">
                <LogOut className={`w-[1rem] h-[1rem] ${exitIconColor}`} />
              </div>
              <div className="dropdown-menu-item__text">Exit</div>
            </button>
          </MainMenu.ItemCustom>
          <MainMenu.DefaultItems.ChangeCanvasBackground />
        </MainMenu>
      </Excalidraw>
      <GenerateWithAIModal
        open={open}
        onOpenChange={handleOpenModal}
        onInsertToEditor={handleInsertToEditor}
      />
    </div>
  );
};
