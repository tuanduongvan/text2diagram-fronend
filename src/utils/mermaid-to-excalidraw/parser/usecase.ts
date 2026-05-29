/* eslint-disable @typescript-eslint/no-explicit-any */
import { ExcalidrawLinearElement } from '@excalidraw/excalidraw/element/types';
import {
  Arrow,
  Container,
  createArrowSkeletion,
  createContainerSkeletonFromSVG,
  createLineSkeletonFromSVG,
  createTextSkeleton,
  Line,
  Node,
  Text
} from '../elementSkeleton';
import { nanoid } from 'nanoid';
import { computeEdgePositionsMC, getTransformAttr } from '../utils';
import { ReversedMap } from '../parsePlantuml';
import { MappingEntity } from '../helper';

enum ARROW_HEAD {
  ARROW_RIGHT = '>',
  ARROW_LEFT = '<',
  INHERITANCE = '|>',
  NONE = ''
}

enum ARROW_BODY {
  DASH = '..',
  SOLID = '--'
}

type RelationshipArrowType = {
  leftArrowHead: string;
  leftArrowBody: string;
  rightArrowHead: string;
  rightArrowBody: string;
};

type RelationshipType = {
  idA: string;
  idB: string;
  cardLeft: string;
  cardRight: string;
  arrow: RelationshipArrowType;
  label: string;
};

type EntityType = {
  entity: string;
  id: string;
  type: string;
};

export interface Usecase {
  type: 'usecase';
  nodes: Array<Node[]>;
  arrows: Arrow[];
  lines: Line[];
  text: Text[];
}

const parsedPlantUML = (raw: any) => {
  const entities: EntityType[] = [],
    relationships: RelationshipType[] = [];
  if ((raw as Array<any>).length > 0 && raw[0].elements.length > 0) {
    raw = raw[0].elements;
    for (const i of raw) {
      const elements = i?.elements;
      if (!elements) continue;
      for (const element of elements) {
        if (element.comment) continue;
        const [idLeft, idRight] = [nanoid(), nanoid()];
        if (
          !entities.find(
            (entity) =>
              entity.entity === element.left && entity.type === element.leftType
          )
        ) {
          entities.push({
            entity: element.left,
            id: idLeft,
            type: element.leftType
          });
        }
        if (
          !entities.find(
            (entity) =>
              entity.entity === element.right &&
              entity.type === element.rightType
          )
        ) {
          entities.push({
            entity: element.right,
            id: idRight,
            type: element.rightType
          });
        }
        const actorA = entities.find(
          (entity) => entity.entity === element.left
        );
        const actorB = entities.find(
          (entity) => entity.entity === element.right
        );
        relationships.push({
          idA: actorA?.id || nanoid(),
          idB: actorB?.id || nanoid(),
          cardLeft: element.leftCardinality,
          cardRight: element.rightCardinality,
          arrow: {
            leftArrowHead: element.leftArrowHead,
            leftArrowBody: element.leftArrowBody,
            rightArrowHead: element.rightArrowHead,
            rightArrowBody: element.rightArrowBody
          },
          label: element.label
        });
      }
    }
  }
  const { actors, usecases } = entities.reduce(
    (acc: { actors: EntityType[]; usecases: EntityType[] }, entity) => {
      switch (entity.type) {
        case 'Unknown':
          acc.actors.push(entity);
          break;
        case 'UseCase':
          acc.usecases.push(entity);
          break;
        default:
          break;
      }
      return acc;
    },
    { actors: [], usecases: [] }
  );
  return { actors, usecases, relationships };
};

const getStrokeStyle = (type: string) => {
  let lineType: ExcalidrawLinearElement['strokeStyle'];
  switch (type) {
    case ARROW_BODY.SOLID:
      lineType = 'solid';
      break;
    case ARROW_BODY.DASH:
      lineType = 'dashed';
      break;
    default:
      lineType = 'solid';
  }
  return lineType;
};

const getArrowhead = (type: string) => {
  let arrowhead: ExcalidrawLinearElement['startArrowhead'];
  switch (type) {
    case ARROW_HEAD.ARROW_LEFT:
    case ARROW_HEAD.ARROW_RIGHT:
      arrowhead = 'arrow';
      break;
    case ARROW_HEAD.INHERITANCE:
      arrowhead = 'triangle_outline';
      break;
    case ARROW_HEAD.NONE:
    default:
      arrowhead = null;
      break;
  }
  return arrowhead;
};

const extractPoints = (dAttr: string) => {
  // Split by 'M' to separate different sub-paths, keeping 'M' at the start
  const paths = dAttr.match(/M[^M]+/g) || [];

  const lines: Array<Array<number>> = [];

  paths.forEach((path) => {
    // Extract coordinates from 'M' and 'L' commands
    const coords =
      path
        .match(/[\d.]+,[\d.]+/g)
        ?.map((point) => point.split(',').map(Number)) || [];

    // Convert [x, y] points into line segments [x1, y1, x2, y2]
    for (let i = 1; i < coords.length; i++) {
      lines.push([...coords[i - 1], ...coords[i]]);
    }
  });

  return lines;
};

const createActorSymbol = (
  element: Element,
  groupId: string,
  actorId: string,
  transformX: number,
  transformY: number
) => {
  const lines: Line[] = [];
  const nodes: Container[] = [];

  // Ellipse
  const actorEllipse = createContainerSkeletonFromSVG(
    element.querySelector('ellipse') as unknown as SVGSVGElement,
    'ellipse',
    { id: actorId, groupId }
  );
  actorEllipse.x += transformX;
  actorEllipse.y += transformY;
  nodes.push(actorEllipse);
  // Path
  const pathNode = element.querySelector('path');
  if (!pathNode) {
    return { lines, nodes };
  }
  const dAttr = pathNode.getAttribute('d');
  if (!dAttr) {
    return { lines, nodes };
  }
  const points = extractPoints(dAttr);
  points.forEach((point) => {
    const lineNode = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'line'
    );
    lineNode.setAttribute('x1', point[0].toString());
    lineNode.setAttribute('y1', point[1].toString());
    lineNode.setAttribute('x2', point[2].toString());
    lineNode.setAttribute('y2', point[3].toString());
    const line = createLineSkeletonFromSVG(
      lineNode,
      point[0],
      point[1],
      point[2],
      point[3],
      {
        groupId,
        id: nanoid()
      }
    );
    line.metadata = { dAttr };
    lines.push(line);
  });

  return { lines, nodes };
};

const parseCluster = (containerEl: Element) => {
  const nodes: Array<Container> = [];
  const text: Array<Text> = [];
  const clusters = containerEl.querySelectorAll(`[id^="cluster_`);

  if (clusters.length) {
    for (const cluster of clusters) {
      const clusterId = nanoid();
      const { transformX, transformY } = getTransformAttr(cluster);
      const clusterNode = createContainerSkeletonFromSVG(
        cluster as SVGSVGElement,
        'rectangle',
        { id: nanoid(), groupId: clusterId }
      );
      clusterNode.x += transformX;
      clusterNode.y += transformY;
      nodes.push(clusterNode);
      const clusterTitleNode = cluster.querySelector('text');
      if (clusterTitleNode) {
        const title = clusterTitleNode.textContent || '';
        const boundingBox = (clusterTitleNode as SVGTextElement).getBBox();

        const textElement = createTextSkeleton(
          transformX + Number(clusterTitleNode.getAttribute('x')),
          transformY + Number(clusterTitleNode.getAttribute('y')),
          title,
          {
            id: nanoid(),
            width: boundingBox.width,
            height: boundingBox.height,
            groupId: clusterId,
            metadata: { key: title }
          }
        );
        text.push(textElement);
      }
    }
  }
  return { nodes, text };
};

const parseActor = (
  actors: EntityType[],
  containerEl: Element,
  reversedActor: MappingEntity
) => {
  const nodes: Container[] = [];
  const text: Text[] = [];
  const lines: Line[] = [];

  actors.forEach((actor) => {
    const actorNode = containerEl.querySelector(
      `[id="entity_${actor.entity}"]`
    );
    if (!actorNode) {
      throw Error(`DOM Node with id ${actor.entity} not found`);
    }
    const groupId = nanoid();
    const { transformX, transformY } = getTransformAttr(actorNode);
    // Actor
    const actorData = createActorSymbol(
      actorNode,
      groupId,
      actor.id,
      transformX,
      transformY
    );
    nodes.push(...actorData.nodes);
    lines.push(...actorData.lines);
    // Actor name
    const actorLabelNode = actorNode.querySelector('text');
    if (!actorLabelNode) {
      throw Error('Label not found');
    }
    const actorLabel = reversedActor[actorLabelNode.textContent!] || '';
    const boundingBox = (actorLabelNode as SVGTextElement).getBBox();

    const textElement = createTextSkeleton(
      transformX + Number(actorLabelNode.getAttribute('x')),
      transformY + Number(actorLabelNode.getAttribute('y')),
      actorLabel,
      {
        id: nanoid(),
        groupId,
        width: boundingBox.width,
        height: boundingBox.height,
        fontSize: 16,
        metadata: { key: actor.entity }
      }
    );
    text.push(textElement);
  });

  return { nodes, text, lines };
};

const parseUsecase = (
  usecases: EntityType[],
  containerEl: Element,
  reversedUsecase: MappingEntity
) => {
  const nodes: Container[] = [];
  const text: Text[] = [];

  usecases.forEach((usecase) => {
    const usecaseNode = containerEl.querySelector(
      `[id="entity_${usecase.entity}"]`
    );
    if (!usecaseNode) {
      throw Error(`DOM Node with id ${usecase.entity} not found`);
    }
    const groupId = nanoid();
    const { transformX, transformY } = getTransformAttr(usecaseNode);
    // Ellipse
    const usecaseEllipse = createContainerSkeletonFromSVG(
      usecaseNode as SVGSVGElement,
      'ellipse',
      { id: usecase.id, groupId }
    );
    usecaseEllipse.x += transformX;
    usecaseEllipse.y += transformY;
    nodes.push(usecaseEllipse);
    // Text
    const usecaseLabelNode = usecaseNode.querySelector('text');
    if (!usecaseLabelNode) {
      throw Error('Label not found');
    }
    const usecaseLabel = reversedUsecase[usecaseLabelNode.textContent!] || '';
    const boundingBox = (usecaseLabelNode as SVGTextElement).getBBox();

    const textElement = createTextSkeleton(
      transformX + Number(usecaseLabelNode.getAttribute('x')),
      transformY + Number(usecaseLabelNode.getAttribute('y')),
      usecaseLabel,
      {
        id: nanoid(),
        groupId,
        width: boundingBox.width,
        height: boundingBox.height,
        fontSize: 16,
        metadata: { key: usecase.entity }
      }
    );
    text.push(textElement);
  });
  return { nodes, text };
};

const parseRelationships = (
  relationships: RelationshipType[],
  containerEl: Element
) => {
  const arrows: Array<Arrow> = [];
  const relationshipLinks = containerEl.querySelectorAll(`[id^="link_"]`);
  relationships.forEach((relationship, index) => {
    const { leftArrowHead, leftArrowBody, rightArrowBody, rightArrowHead } =
      relationship.arrow;
    const arrowBody = `${leftArrowBody}${rightArrowBody}`;
    const startArrowhead = getArrowhead(leftArrowHead);
    const endArrowhead = getArrowhead(rightArrowHead);
    const strokeStyle = getStrokeStyle(arrowBody);
    const relationshipPositionData = computeEdgePositionsMC(
      relationshipLinks[index].firstChild as SVGPathElement
    );
    const arrowSkeletion = createArrowSkeletion(
      relationshipPositionData.startX,
      relationshipPositionData.startY,
      relationshipPositionData.endX,
      relationshipPositionData.endY,
      {
        strokeStyle,
        startArrowhead,
        endArrowhead,
        label: relationship.label
          ? { text: relationship.label, fontSize: 14 }
          : undefined,
        start: { id: relationship.idA, type: 'ellipse' },
        end: { id: relationship.idB, type: 'ellipse' }
      }
    );
    arrows.push(arrowSkeletion);
  });
  return { arrows };
};

export const parsePlantumlUsecaseDiagram = (
  parseUML: any,
  containerEl: Element,
  reversedMap: ReversedMap
): Usecase => {
  console.log({ containerEl, parseUML });
  const nodes: Array<Node[]> = [];
  const text: Array<Text> = [];
  const lines: Array<Line> = [];

  const { actors, usecases, relationships } = parsedPlantUML(parseUML);
  console.log({ actors, usecases, relationships });

  const clusterData = parseCluster(containerEl);
  nodes.push(clusterData.nodes);
  text.push(...clusterData.text);

  if (actors.length) {
    const entityData = parseActor(actors, containerEl, reversedMap.actors);
    nodes.push(entityData.nodes);
    text.push(...entityData.text);
    lines.push(...entityData.lines);
  }
  if (usecases.length) {
    const entityData = parseUsecase(
      usecases,
      containerEl,
      reversedMap.usecases
    );
    nodes.push(entityData.nodes);
    text.push(...entityData.text);
  }
  const { arrows } = parseRelationships(relationships, containerEl);

  return {
    type: 'usecase',
    nodes,
    arrows,
    text,
    lines
  };
};
