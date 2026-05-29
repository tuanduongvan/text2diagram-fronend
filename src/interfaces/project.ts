export interface Project {
  id: string;
  userId: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
  name: string;
  thumbnail: string;
  createdAt: Date;
  updatedAt: Date;
}
