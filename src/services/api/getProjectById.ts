import { Project } from '@/interfaces';
import { axiosBackendInstance } from '../config';

export const getProjectById = async (id: string): Promise<Project> => {
  const data = await axiosBackendInstance.get(`/projects/${id}`);
  return data.data;
};
