import { DEFAULT_FONT_SIZE } from './constants';
import { graphToExcalidraw } from './graphToExcalidraw';
import { parseMermaid } from './parseMermaid';
import { parsePlantUML } from './parsePlantuml';

export interface MermaidConfig {
  /**
   * Whether to start the diagram automatically when the page loads.
   * @default false
   */
  startOnLoad?: boolean;
  /**
   * The flowchart curve style.
   * @default "linear"
   */
  flowchart?: {
    curve?: 'linear' | 'basis';
  };
  /**
   * Theme variables
   * @default { fontSize: "25px" }
   */
  themeVariables?: {
    fontSize?: string;
  };
  /**
   * Maximum number of edges to be rendered.
   * @default 1000
   */
  maxEdges?: number;
  /**
   * Maximum number of characters to be rendered.
   * @default 1000
   */
  maxTextSize?: number;
  /**
   * Whether to use colorful elements.
   * @default false
   */
  isColorful?: boolean;
}

export interface ExcalidrawConfig {
  fontSize?: number;
  isColorful?: boolean;
}

export const parseMermaidToExcalidraw = async (
  definition: string,
  config?: MermaidConfig
) => {
  const mermaidConfig = config || {};
  const fontSize =
    parseInt(mermaidConfig.themeVariables?.fontSize ?? '') || DEFAULT_FONT_SIZE;
  const isColorful = mermaidConfig.isColorful ?? false;
  // Plantuml
  if (definition.trim().startsWith('@startuml')) {
    const parsedPlantUMLData = await parsePlantUML(definition);
    return graphToExcalidraw(parsedPlantUMLData, {
      fontSize,
      isColorful
    });
  }
  const parsedMermaidData = await parseMermaid(definition, {
    ...mermaidConfig,
    themeVariables: {
      ...mermaidConfig.themeVariables,
      // Multiplying by 1.25 to increase the font size by 25% and render correctly in Excalidraw
      fontSize: `${fontSize * 1.25}px`
    }
  });
  // Only font size supported for excalidraw elements
  const excalidrawElements = graphToExcalidraw(parsedMermaidData, {
    fontSize,
    isColorful
  });
  return excalidrawElements;
};
