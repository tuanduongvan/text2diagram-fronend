export const customDisplayDiagramType = (type: string): string => {
  return type[0].toUpperCase().concat(type.slice(1)).concat(' Diagram');
};
