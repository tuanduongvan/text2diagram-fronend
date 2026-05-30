import { axiosBackendInstance } from '../config';

export const generateDiagram = async (payload: FormData) => {
  const data = await axiosBackendInstance.post('/generators', payload, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return data.data;
};
