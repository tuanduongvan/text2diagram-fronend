import { toast } from 'sonner';

export class CustomError extends Error {
  public code: number | string;

  constructor(message: string, code: number | string) {
    super(message);
    this.code = code;
  }
}

export const handleError = (error: CustomError) => {
  toast.error(`Error ${error.code}: ${error.message}`);
};
