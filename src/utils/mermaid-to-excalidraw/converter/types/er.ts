import { GraphConverter } from '../GraphConverter';

import type { ExcalidrawElementSkeleton } from '@excalidraw/excalidraw/data/transform';
import type { ER } from '../../parser/er';
import {
  transformToExcalidrawArrowSkeleton,
  transformToExcalidrawContainerSkeleton,
  transformToExcalidrawLineSkeleton,
  transformToExcalidrawTextSkeleton
} from '../transformToExcalidrawSkeleton';
import {
  decorateLine,
  decorateEllipse,
  decorateRectangle,
  decorateText
} from '../helpers';

export const erToExcalidrawSkeletonConvertor = new GraphConverter({
  converter: (chart: ER, options) => {
    const elements: ExcalidrawElementSkeleton[] = [];
    const isColorful = options.isColorful;

    Object.values(chart.nodes).forEach((node) => {
      if (!node || !node.length) {
        return;
      }
      node.forEach((element) => {
        let excalidrawElement: ExcalidrawElementSkeleton;

        switch (element.type) {
          case 'line':
            excalidrawElement = transformToExcalidrawLineSkeleton(element);
            if (isColorful) {
              decorateLine(excalidrawElement);
            }
            break;

          case 'rectangle':
            excalidrawElement = transformToExcalidrawContainerSkeleton(element);
            if (isColorful) {
              decorateRectangle(excalidrawElement);
            }
            break;

          case 'ellipse':
            excalidrawElement = transformToExcalidrawContainerSkeleton(element);
            if (isColorful) {
              decorateEllipse(excalidrawElement);
            }
            break;

          case 'text':
            excalidrawElement = transformToExcalidrawTextSkeleton(element);
            if (isColorful) {
              decorateText(excalidrawElement);
            }
            break;
          default:
            throw `unknown type ${element.type}`;
        }
        elements.push(excalidrawElement);
      });
    });

    Object.values(chart.arrows).forEach((arrow) => {
      if (!arrow) {
        return;
      }
      const excalidrawElement = transformToExcalidrawArrowSkeleton(arrow);
      if (isColorful) {
        decorateLine(excalidrawElement);
      }
      elements.push(excalidrawElement);
    });

    Object.values(chart.text).forEach((ele) => {
      const excalidrawElement = transformToExcalidrawTextSkeleton(ele);
      if (isColorful) {
        decorateText(excalidrawElement);
      }
      elements.push(excalidrawElement);
    });
    return { elements };
  }
});
