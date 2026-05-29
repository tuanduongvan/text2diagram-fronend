import { ExcalidrawElementSkeleton } from '@excalidraw/excalidraw/data/transform';
import { nanoid } from 'nanoid';

import { GraphConverter } from '../GraphConverter';
import { Sequence } from '../../parser/sequence';
import {
  transformToExcalidrawLineSkeleton,
  transformToExcalidrawTextSkeleton,
  transformToExcalidrawContainerSkeleton,
  transformToExcalidrawArrowSkeleton
} from '../transformToExcalidrawSkeleton';

import type { ExcalidrawElement } from '../../types';
import {
  decorateEllipse,
  decorateLine,
  decorateRectangle,
  decorateText
} from '../helpers';

export const SequenceToExcalidrawSkeletonConvertor = new GraphConverter({
  converter: (chart: Sequence, options) => {
    const elements: ExcalidrawElementSkeleton[] = [];
    const activations: ExcalidrawElementSkeleton[] = [];
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
            if (isColorful) {
              // eslint-disable-next-line @typescript-eslint/no-unused-expressions
              isColorful && element.label && (element.label.color = '#e03131');
            }
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
        if (element.type === 'rectangle' && element?.subtype === 'activation') {
          activations.push(excalidrawElement);
        } else {
          elements.push(excalidrawElement);
        }
      });
    });

    Object.values(chart.lines).forEach((line) => {
      if (!line) {
        return;
      }
      const excalidrawElement = transformToExcalidrawLineSkeleton(line);
      if (isColorful) {
        decorateLine(excalidrawElement);
      }
      elements.push(excalidrawElement);
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
      if (arrow.sequenceNumber) {
        const excalidrawElement = transformToExcalidrawContainerSkeleton(
          arrow.sequenceNumber
        );
        if (isColorful) {
          decorateRectangle(excalidrawElement);
        }
        elements.push(excalidrawElement);
      }
    });
    elements.push(...activations);

    // loops
    if (chart.loops) {
      const { lines, texts, nodes } = chart.loops;
      lines.forEach((line) => {
        const excalidrawElement = transformToExcalidrawLineSkeleton(line);
        if (isColorful) {
          decorateLine(excalidrawElement);
        }
        elements.push(excalidrawElement);
      });
      texts.forEach((text) => {
        const excalidrawElement = transformToExcalidrawTextSkeleton(text);
        if (isColorful) {
          decorateText(excalidrawElement);
        }
        elements.push(excalidrawElement);
      });
      nodes.forEach((node) => {
        const excalidrawElement = transformToExcalidrawContainerSkeleton(node);
        if (isColorful) {
          decorateRectangle(excalidrawElement);
        }
        elements.push(excalidrawElement);
      });
    }

    if (chart.groups) {
      chart.groups.forEach((group) => {
        const { actorKeys, name } = group;
        let minX = Infinity;
        let minY = Infinity;
        let maxX = 0;
        let maxY = 0;
        if (!actorKeys.length) {
          return;
        }
        const actors = elements.filter((ele) => {
          if (ele.id) {
            const hyphenIndex = ele.id.indexOf('-');
            const id = ele.id.substring(0, hyphenIndex);
            return actorKeys.includes(id);
          }
        });
        actors.forEach((actor) => {
          if (
            actor.x === undefined ||
            actor.y === undefined ||
            actor.width === undefined ||
            actor.height === undefined
          ) {
            throw new Error(`Actor attributes missing ${actor}`);
          }
          minX = Math.min(minX, actor.x);
          minY = Math.min(minY, actor.y);
          maxX = Math.max(maxX, actor.x + actor.width);
          maxY = Math.max(maxY, actor.y + actor.height);
        });
        // Draw the outer rectangle enclosing the group elements
        const PADDING = 10;
        const groupRectX = minX - PADDING;
        const groupRectY = minY - PADDING;
        const groupRectWidth = maxX - minX + PADDING * 2;
        const groupRectHeight = maxY - minY + PADDING * 2;
        const groupRectId = nanoid();
        const groupRect = transformToExcalidrawContainerSkeleton({
          type: 'rectangle',
          x: groupRectX,
          y: groupRectY,
          width: groupRectWidth,
          height: groupRectHeight,
          bgColor: group.fill,
          id: groupRectId
        });
        if (isColorful) {
          decorateRectangle(groupRect);
        }
        elements.unshift(groupRect);
        const frameId = nanoid();

        const frameChildren: ExcalidrawElement['id'][] = [groupRectId];

        elements.forEach((ele) => {
          if (ele.type === 'frame') {
            return;
          }
          if (
            ele.x === undefined ||
            ele.y === undefined ||
            ele.width === undefined ||
            ele.height === undefined
          ) {
            throw new Error(`Element attributes missing ${ele}`);
          }
          if (
            ele.x >= minX &&
            ele.x + ele.width <= maxX &&
            ele.y >= minY &&
            ele.y + ele.height <= maxY
          ) {
            const elementId = ele.id || nanoid();
            if (!ele.id) {
              Object.assign(ele, { id: elementId });
            }
            frameChildren.push(elementId);
          }
        });

        const frame: ExcalidrawElementSkeleton = {
          type: 'frame',
          id: frameId,
          name,
          children: frameChildren
        };
        elements.push(frame);
      });
    }
    return { elements };
  }
});
