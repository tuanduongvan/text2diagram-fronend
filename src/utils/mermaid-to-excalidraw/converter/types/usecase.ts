import { GraphConverter } from '../GraphConverter';

import { Usecase } from '../../parser/usecase';
import { ExcalidrawElementSkeleton } from '@excalidraw/excalidraw/data/transform';
import {
  transformToExcalidrawArrowSkeleton,
  transformToExcalidrawContainerSkeleton,
  transformToExcalidrawLineSkeleton,
  transformToExcalidrawTextSkeleton
} from '../transformToExcalidrawSkeleton';
import {
  decorateEllipse,
  decorateLine,
  decorateRectangle,
  decorateText
} from '../helpers';

export const usecaseToExcalidrawSkeletonConvertor = new GraphConverter({
  converter: (chart: Usecase, options) => {
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

    Object.values(chart.lines).forEach((line) => {
      const excalidrawElement = transformToExcalidrawLineSkeleton(line);
      if (isColorful) {
        decorateLine(excalidrawElement);
      }
      elements.push(excalidrawElement);
    });

    return { elements };
  }
});
