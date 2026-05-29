import { z } from 'zod';

export const loginSchema = z
  .object({
    email: z.string().email({ message: 'Email is invalid' }),
    password: z.string().trim().min(8).max(20)
  })
  .strict()
  .required()
  .superRefine(({ password }, ctx) => {
    const regex = new RegExp(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()-+=^.]).{8,20}$/
    );
    if (!regex.test(password)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          'Password must be 8-20 characters, include at least one lowercase letter, one uppercase letter, one digit, and one special character (!@#$%^&*()-+=^.)',
        path: ['password']
      });
    }
  });

export type LoginSchemaType = z.infer<typeof loginSchema>;
