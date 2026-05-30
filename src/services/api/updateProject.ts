import { Project } from '@/interfaces';
import { axiosBackendInstance } from '../config';

export const updateProject = async (payload: Partial<Project>) => {
  const { id, ...rest } = payload;
  const data = await axiosBackendInstance.patch(`/projects/${id}`, rest);
  return data.data;
};
