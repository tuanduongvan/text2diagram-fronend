import { signalRConnection } from '@/utils';
import { axiosBackendInstance } from '../config';

export const generateDiagram = async (payload: FormData) => {
  const data = await axiosBackendInstance.post('/Generators', payload, {
    headers: {
      'Content-Type': 'multipart/form-data',
      'X-Connection-Id': signalRConnection.connectionId
    }
  });
  return data.data;
};
