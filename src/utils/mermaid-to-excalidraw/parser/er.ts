/* eslint-disable @typescript-eslint/no-explicit-any */
import { ExcalidrawLinearElement } from '@excalidraw/excalidraw/element/types';
import { Diagram } from 'mermaid/dist/Diagram.js';
import {
  Arrow,
  Container,
  createArrowSkeletion,
  createContainerSkeletonFromSVG,
  createTextSkeleton,
  Line,
  Node,
  Text
} from '../elementSkeleton';
import { cleanString, computeEdgePositions, getTransformAttr } from '../utils';
import { nanoid } from 'nanoid';

enum CARDINALITY_TYPE {
  MD_PARENT = 'MD_PARENT',
  ONE_OR_MORE = 'ONE_OR_MORE',
  ONLY_ONE = 'ONLY_ONE',
  ZERO_OR_MORE = 'ZERO_OR_MORE',
  ZERO_OR_ONE = 'ZERO_OR_ONE'
}

enum IDENTIFICATION_TYPE {
  NON_IDENTIFYING = 'NON_IDENTIFYING',
  IDENTIFYING = 'IDENTIFYING'
}

const mappingCadinalityType = {
  [CARDINALITY_TYPE.ONE_OR_MORE]: '(1,n)',
  [CARDINALITY_TYPE.ONLY_ONE]: '(1,1)',
  [CARDINALITY_TYPE.ZERO_OR_MORE]: '(0,n)',
  [CARDINALITY_TYPE.ZERO_OR_ONE]: '(0,1)',
  [CARDINALITY_TYPE.MD_PARENT]: ''
};

type RelationshipType = {
  entityA: string;
  idA: string;
  entityB: string;
  idB: string;
  relSpec: {
    cardA: string;
    cardB: string;
    relType: string;
  };
  roleA: string;
};

type EntityType = {
  id: string;
  alias: any;
  attributes: Array<{
    attributeName: string;
    attributeType: string;
    attributeComment: string;
    attributeKeyTypeList: string[];
  }>;
};

export interface ER {
  type: 'er';
  nodes: Array<Node[]>;
  arrows: Arrow[];
  text: Text[];
}

const getStrokeStyle = (type: IDENTIFICATION_TYPE) => {
  let lineType: ExcalidrawLinearElement['strokeStyle'];
  switch (type) {
    case IDENTIFICATION_TYPE.IDENTIFYING:
      lineType = 'solid';
      break;
    case IDENTIFICATION_TYPE.NON_IDENTIFYING:
      lineType = 'dashed';
      break;
    default:
      lineType = 'solid';
  }
  return lineType;
};

// const getArrowhead = (type: CARDINALITY_TYPE) => {
//   let arrowhead: ExcalidrawLinearElement['startArrowhead'];
//   switch (type) {
//     case CARDINALITY_TYPE.ONE_OR_MORE:
//       arrowhead = 'crowfoot_one_or_many';
//       break;
//     case CARDINALITY_TYPE.ONLY_ONE:
//       arrowhead = 'crowfoot_one';
//       break;
//     case CARDINALITY_TYPE.ZERO_OR_MORE:
//       arrowhead = 'crowfoot_many';
//       break;
//     case CARDINALITY_TYPE.ZERO_OR_ONE:
//       arrowhead = 'circle_outline';
//       break;

//     case CARDINALITY_TYPE.MD_PARENT:
//     default:
//       arrowhead = null;
//       break;
//   }
//   return arrowhead;
// };

const parseRelationships = (
  relations: RelationshipType[],
  containerEl: Element
) => {
  const relationships = containerEl.querySelectorAll('.relationshipLine');

  if (!relationships) {
    throw new Error('No Relationships found!');
  }
  const arrows: Arrow[] = [];
  const cardinalities: Text[] = [];

  relations.forEach((relationNode, index) => {
    const { relSpec } = relationNode;

    const strokeStyle = getStrokeStyle(relSpec.relType as IDENTIFICATION_TYPE);
    // const startArrowhead = getArrowhead(
    //   relationNode.relSpec.cardB as CARDINALITY_TYPE
    // );
    // const endArrowhead = getArrowhead(
    //   relationNode.relSpec.cardA as CARDINALITY_TYPE
    // );
    const groupId = nanoid();
    const startCadinalityType =
      mappingCadinalityType[relationNode.relSpec.cardB as CARDINALITY_TYPE];
    const endCadinalityType =
      mappingCadinalityType[relationNode.relSpec.cardA as CARDINALITY_TYPE];
    const relationshipPositionData = computeEdgePositions(
      relationships[index] as SVGPathElement
    );
    const [offsetX, offsetY] = [15, 15];
    const directionOffset = 15;
    let [x, y] = [0, 0];
    // Start
    x = relationshipPositionData.startX - offsetX;
    if (relationshipPositionData.endX < relationshipPositionData.startX) {
      x -= directionOffset;
    } else {
      x += directionOffset;
    }
    y = relationshipPositionData.startY + offsetY;
    const textStartElement = createTextSkeleton(x, y, startCadinalityType, {
      groupId,
      fontSize: 10
    });
    // End
    x = relationshipPositionData.endX + offsetX;
    if (relationshipPositionData.endX > relationshipPositionData.startX) {
      x -= directionOffset;
    } else {
      x += directionOffset;
    }
    y = relationshipPositionData.endY - offsetY;
    const textEndElement = createTextSkeleton(x, y, endCadinalityType, {
      groupId,
      fontSize: 10
    });
    cardinalities.push(textStartElement, textEndElement);
    const arrowSkeletion = createArrowSkeletion(
      relationshipPositionData.startX,
      relationshipPositionData.startY,
      relationshipPositionData.endX,
      relationshipPositionData.endY,
      {
        strokeStyle,
        startArrowhead: null,
        endArrowhead: null,
        label: relationNode.roleA
          ? { text: relationNode.roleA, fontSize: 10 }
          : undefined,
        start: { type: 'rectangle', id: relationNode.idA },
        end: { type: 'rectangle', id: relationNode.idB }
      }
    );
    arrowSkeletion.strokeWidth = 1;
    arrows.push(arrowSkeletion);
  });
  return { arrows, cardinalities };
};

const parseEntities = (
  entities: { [key: string]: EntityType },
  containerEl: Element
) => {
  const nodes: Container[] = [];
  const lines: Line[] = [];
  const text: Text[] = [];

  Object.keys(entities).forEach((key) => {
    const [entityId, groupId] = [entities[key].id, nanoid()];
    key = cleanString(key);
    const domNode = containerEl.querySelector(`[id*="entity-${key}-"]`);
    if (!domNode) {
      throw Error(`DOM Node with id ${key} not found`);
    }
    const { transformX, transformY } = getTransformAttr(domNode);
    // Rect
    const container = createContainerSkeletonFromSVG(
      domNode.firstChild as SVGRectElement,
      'rectangle',
      { id: entityId, groupId }
    );
    container.x += transformX;
    container.y += transformY;
    container.strokeWidth = 0;
    nodes.push(container);
    // Rect attributes
    const rectNodes = Array.from(
      domNode.querySelectorAll('.attributeBoxOdd, .attributeBoxEven')
    ) as SVGRectElement[];
    rectNodes.forEach((rectNode) => {
      const id = nanoid();
      const rect = createContainerSkeletonFromSVG(
        rectNode as SVGRectElement,
        'rectangle',
        { id, groupId }
      );
      rect.x += transformX;
      rect.y += transformY;
      rect.strokeWidth = 0;
      nodes.push(rect);
    });
    // Label
    const labelNodes = domNode.querySelectorAll(`[id*="text-entity-${key}-"]`);

    if (!labelNodes) {
      throw 'label nodes not found';
    }

    Array.from(labelNodes).forEach((node) => {
      const label = node.textContent;
      if (!label) {
        return;
      }
      const id = nanoid();
      // eslint-disable-next-line prefer-const
      let { transformX: textTransformX, transformY: textTransformY } =
        getTransformAttr(node);
      const boundingBox = (node as SVGTextElement).getBBox();
      if (
        ['type', 'name', 'key', 'comment'].includes(node.id.split('-').pop()!)
      ) {
        const textElement = createTextSkeleton(
          transformX + textTransformX,
          transformY + textTransformY,
          label,
          {
            width: boundingBox.width,
            height: boundingBox.height,
            fontSize: 10,
            id,
            groupId,
            metadata: { key }
          }
        );
        text.push(textElement);
      } else {
        const textElement = createTextSkeleton(
          transformX + textTransformX,
          transformY + textTransformY,
          label,
          {
            width: boundingBox.width,
            height: boundingBox.height,
            fontSize: 12,
            textAlign: 'center',
            id,
            groupId,
            metadata: { key }
          }
        );
        text.push(textElement);
      }
    });
  });
  return { nodes, lines, text };
};

export const parseMermaidERDiagram = (
  diagram: Diagram,
  containerEl: Element
): ER => {
  console.log({ containerEl });
  diagram.parse();
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const mermaidParser = diagram.parser.yy;
  const nodes: Array<Node[]> = [];
  const lines: Array<Line> = [];
  const text: Array<Text> = [];

  const entities = mermaidParser.getEntities();
  for (const key of Object.keys(entities)) {
    entities[key].id = nanoid();
  }
  const relations = mermaidParser.getRelationships();
  for (const relation of relations) {
    relation.idA = entities[relation.entityA].id;
    relation.idB = entities[relation.entityB].id;
  }
  if (Object.keys(entities).length) {
    const entityData = parseEntities(entities, containerEl);
    nodes.push(entityData.nodes);
    lines.push(...entityData.lines);
    text.push(...entityData.text);
  }
  console.log({ relations, entities });
  const { arrows, cardinalities } = parseRelationships(relations, containerEl);
  text.push(...cardinalities);
  return { type: 'er', nodes, arrows, text };
};
