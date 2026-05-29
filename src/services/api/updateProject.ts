import { Project } from '@/interfaces';
import { axiosBackendInstance } from '../config';
import { buildPatchData } from '@/utils';

export const updateProject = async (payload: Partial<Project>) => {
  const { id, ...rest } = payload;
  const patchData = buildPatchData(rest);
  console.log(patchData);
  const data = await axiosBackendInstance.patch(`/Projects/${id}`, patchData, {
    headers: {
      'Content-Type': 'application/json-patch+json'
    }
  });
  return data.data;
};
