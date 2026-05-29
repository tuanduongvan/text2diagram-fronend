import { Theme as AppTheme } from '@/components/providers/ThemeProvider';
import { Theme } from '@excalidraw/excalidraw/element/types';

export const mappingAppThemeToExcalidrawTheme = (appTheme: AppTheme): Theme => {
  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';

  console.log({ appTheme, systemTheme });

  switch (appTheme) {
    case 'system':
      return systemTheme as Theme;
    default:
      return appTheme as Theme;
  }
};
