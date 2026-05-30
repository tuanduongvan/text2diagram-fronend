import { axiosBackendInstance } from '../config';

export const deleteProject = async (id: string) => {
  const data = await axiosBackendInstance.delete(`/projects/${id}`);
  return data.data;
};
