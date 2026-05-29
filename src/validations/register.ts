import { z } from 'zod';

export const registerSchema = z
  .object({
    email: z.string().email({ message: 'Email is invalid' }),
    password: z.string().trim().min(8).max(20),
    confirmPassword: z.string().trim().min(8).max(20)
  })
  .strict()
  .required()
  .superRefine(({ confirmPassword, password }, ctx) => {
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
    if (confirmPassword !== password) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Confirm password is incorrect',
        path: ['confirmPassword']
      });
    }
  });

export type RegisterSchemaType = z.infer<typeof registerSchema>;
