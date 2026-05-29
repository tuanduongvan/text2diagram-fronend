import { z } from 'zod';

export const changePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .trim()
      .min(1, { message: 'Current password is required' }),
    newPassword: z
      .string()
      .trim()
      .min(8, { message: 'New password must be at least 8 characters' })
      .max(20, { message: 'New password must be at most 20 characters' }),
    confirmNewPassword: z
      .string()
      .trim()
      .min(8, { message: 'Confirm new password must be at least 8 characters' })
      .max(20, {
        message: 'Confirm new password must be at most 20 characters'
      })
  })
  .strict()
  .superRefine(({ newPassword, confirmNewPassword }, ctx) => {
    const regex = new RegExp(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()-+=^.]).{8,20}$/
    );
    if (!regex.test(newPassword)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          'New password must be 8-20 characters, include at least one lowercase letter, one uppercase letter, one digit, and one special character (!@#$%^&*()-+=^.)',
        path: ['newPassword']
      });
    }
    if (newPassword !== confirmNewPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Confirm new password does not match new password',
        path: ['confirmNewPassword']
      });
    }
  });

export type ChangePasswordSchemaType = z.infer<typeof changePasswordSchema>;
