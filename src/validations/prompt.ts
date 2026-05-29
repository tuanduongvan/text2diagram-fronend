import { DiagramTypeEnum } from '@/interfaces';
import { z } from 'zod';

const fileSizeLimit = 5 * 1024 * 1024; // 5MB

export const promptingSchema = z
  .object({
    content: z.string().optional(),
    type: z.custom<DiagramTypeEnum>(),
    file: z
      .instanceof(File)
      .refine(
        (file) => {
          const allowedExtensions = ['docx', 'pdf', 'txt'];
          const fileExtension = file.name.split('.').pop()?.toLowerCase();
          return fileExtension && allowedExtensions.includes(fileExtension);
        },
        {
          message: 'Invalid file type. Allowed types: .docx, .pdf, .txt'
        }
      )
      .refine(
        (file) => {
          return file.size < fileSizeLimit;
        },
        {
          message: 'File size must not exceed 5MB'
        }
      )
      .optional()
  })
  .strict()
  .required({ type: true })
  .superRefine((val, ctx) => {
    const { file, content, type } = val;
    if (!type) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Must provide a diagram type',
        path: ['type']
      });
    }
    if (file && content) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Only provide one of the following: prompting or file',
        path: ['content']
      });
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Only provide one of the following: prompting or file',
        path: ['file']
      });
    }
    if (!file && !content) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Must provide at least prompting or file',
        path: ['content']
      });

      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Must provide at least prompting or file',
        path: ['file']
      });
    } else if (content && content.length < 50) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Your prompt must be at least 50 characters',
        path: ['content']
      });
    }
  });

export type PromptingSchemaType = z.infer<typeof promptingSchema>;

export const modifyPromptingSchema = z.object({
  modifyPrompting: z.string().refine(
    (val) => {
      return val.length >= 10;
    },
    { message: 'Your prompt must be at least 10 characters' }
  )
});

export type ModifyPromptingSchemaType = z.infer<typeof modifyPromptingSchema>;
