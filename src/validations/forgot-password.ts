import { z } from 'zod';

export const forgotPasswordSchema = z
  .object({
    email: z.string().email({ message: 'Email is invalid' })
  })
  .strict()
  .required();

export type ForgotPasswordSchemaType = z.infer<typeof forgotPasswordSchema>;
