import { ExcalidrawConfig } from './index';
import { FlowchartToExcalidrawSkeletonConverter } from './converter/types/flowchart';
import { GraphImageConverter } from './converter/types/graphImage';
import { GraphImage, MermaidToExcalidrawResult } from './interfaces';
import { SequenceToExcalidrawSkeletonConvertor } from './converter/types/sequence';
import { Sequence } from './parser/sequence';
import { Flowchart } from './parser/flowchart';
import { Class } from './parser/class';
import { ER } from './parser/er';
import { Usecase } from './parser/usecase';
import { classToExcalidrawSkeletonConvertor } from './converter/types/class';
import { erToExcalidrawSkeletonConvertor } from './converter/types/er';
import { usecaseToExcalidrawSkeletonConvertor } from './converter/types/usecase';

export const graphToExcalidraw = (
  graph: Flowchart | GraphImage | Sequence | Class | ER | Usecase,
  options: ExcalidrawConfig = {}
): MermaidToExcalidrawResult => {
  switch (graph.type) {
    case 'graphImage': {
      return GraphImageConverter.convert(graph, options);
    }

    case 'flowchart': {
      return FlowchartToExcalidrawSkeletonConverter.convert(graph, options);
    }

    case 'sequence': {
      return SequenceToExcalidrawSkeletonConvertor.convert(graph, options);
    }

    case 'class': {
      return classToExcalidrawSkeletonConvertor.convert(graph, options);
    }

    case 'er': {
      return erToExcalidrawSkeletonConvertor.convert(graph, options);
    }

    case 'usecase': {
      return usecaseToExcalidrawSkeletonConvertor.convert(graph, options);
    }

    default: {
      throw new Error(
        `graphToExcalidraw: unknown graph type "${
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (graph as any).type
        }`
      );
    }
  }
};
