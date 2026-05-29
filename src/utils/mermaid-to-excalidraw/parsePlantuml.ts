import { axiosPlantumlParserInstance } from '@/services';
import { parsePlantumlUsecaseDiagram, Usecase } from './parser/usecase';
import plantUmlEncoder from 'plantuml-encoder';
import { extractEntity, MappingEntity } from './helper';

export type ReversedMap = {
  actors: MappingEntity;
  usecases: MappingEntity;
};

export const parsePlantUML = async (definition: string): Promise<Usecase> => {
  const defArr = definition.split('\n');
  const { actors, usecases, newDefinition } = extractEntity(defArr);
  console.log('DEBUG: ', { actors, usecases, newDefinition });
  const { data: parseUML } = await axiosPlantumlParserInstance.post(
    '/plantuml-parse',
    {
      definition: newDefinition
    }
  );
  const encoded = plantUmlEncoder.encode(newDefinition);
  const response = await fetch(
    `https://www.plantuml.com/plantuml/svg/${encoded}`
  );
  const svgText = await response.text();
  const svgContainer = document.createElement('div');
  svgContainer.setAttribute(
    'style',
    `opacity: 0; position: relative; z-index: -1;`
  );
  svgContainer.innerHTML = svgText;
  svgContainer.id = 'plantuml-diagram';
  document.body.appendChild(svgContainer);

  const reversedMap = { actors: {}, usecases: {} } as ReversedMap;
  for (const key in actors) {
    reversedMap.actors[actors[key]] = key;
  }
  for (const key in usecases) {
    reversedMap.usecases[usecases[key]] = key;
  }
  console.log('Reversed map: ', reversedMap);
  const data = parsePlantumlUsecaseDiagram(parseUML, svgContainer, reversedMap);
  svgContainer.remove();

  return data;
};
