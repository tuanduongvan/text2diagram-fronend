import { Project } from '@/interfaces';
import { axiosBackendInstance } from '../config';

export const getProjectById = async (id: string): Promise<Project> => {
  const data = await axiosBackendInstance.get(`/Projects/${id}`);
  return data.data;
};
