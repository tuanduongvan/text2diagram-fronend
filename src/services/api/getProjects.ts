import { PaginatedResponse, Project } from '@/interfaces';
import { axiosBackendInstance } from '../config';

interface GetProjectsPayload {
  page?: number;
  pageSize?: number;
}

export const getProjects = async (
  payload: GetProjectsPayload = { page: 1, pageSize: 10 }
): Promise<PaginatedResponse<Project>> => {
  const { page, pageSize } = payload;
  const data = await axiosBackendInstance.get(
    `/Projects?page=${page}&pageSize=${pageSize}`
  );
  return data.data;
};
