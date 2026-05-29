import { z } from 'zod';

export const resetPasswordSchema = z
  .object({
    newPassword: z.string().trim().min(8).max(20),
    confirmNewPassword: z.string().trim().min(8).max(20)
  })
  .strict()
  .required()
  .superRefine(({ confirmNewPassword, newPassword }, ctx) => {
    const regex = new RegExp(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()-+=^.]).{8,20}$/
    );
    if (!regex.test(newPassword)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          'Password must be 8-20 characters, include at least one lowercase letter, one uppercase letter, one digit, and one special character (!@#$%^&*()-+=^.)',
        path: ['newPassword']
      });
    }
    if (confirmNewPassword !== newPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Confirm new password is incorrect',
        path: ['confirmNewPassword']
      });
    }
  });

export type ResetPasswordSchemaType = z.infer<typeof resetPasswordSchema>;
