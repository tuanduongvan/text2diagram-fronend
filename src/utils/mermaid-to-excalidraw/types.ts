import { ImportedDataState } from '@excalidraw/excalidraw/data/types';
import {
  ExcalidrawRectangleElement,
  ExcalidrawDiamondElement,
  ExcalidrawEllipseElement
} from '@excalidraw/excalidraw/element/types';
import { Mutable } from '@excalidraw/excalidraw/common/utility-types';

export type ArrayElement<A> = A extends readonly (infer T)[] ? T : never;

export type ExcalidrawElement = Mutable<
  ArrayElement<ImportedDataState['elements']>
>;

export type ExcalidrawVertexElement =
  | ExcalidrawRectangleElement
  | ExcalidrawDiamondElement
  | ExcalidrawEllipseElement;
