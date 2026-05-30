import { Project } from '@/interfaces';
import { axiosBackendInstance } from '../config';

export const createProject = async (payload: Partial<Project>) => {
  const data = await axiosBackendInstance.post('/projects', payload);
  return data.data;
};
