import { axiosBackendInstance } from '../config';

export const modifyDiagram = async (payload: FormData) => {
  const data = await axiosBackendInstance.post(
    '/Generators/regenerate',
    payload,
    {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }
  );
  return data.data;
};
