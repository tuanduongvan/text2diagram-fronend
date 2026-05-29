export const buildPatchData = (payload: object) => {
  return Object.entries(payload).map(([key, value]) => {
    return {
      op: 'replace',
      path: '/' + key,
      value
    };
  });
};
