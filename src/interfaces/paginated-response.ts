export interface PaginatedResponse<T> {
  data: T[];
  totalPage: number;
  page: number;
  pageSize: number;
}
