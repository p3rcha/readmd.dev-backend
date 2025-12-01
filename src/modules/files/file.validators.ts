import { z } from 'zod';

export const fileVisibilitySchema = z.enum(['private', 'unlisted', 'public']);

export const updateFileSchema = z.object({
  visibility: fileVisibilitySchema.optional(),
});

export type UpdateFileInput = z.infer<typeof updateFileSchema>;

