import { z } from 'zod';

export const contactSchema = z.object({
  name: z.string().trim().min(1, 'nameRequired').max(120, 'nameTooLong'),
  email: z.string().trim().min(1, 'emailRequired').email('emailInvalid'),
  message: z
    .string()
    .trim()
    .min(1, 'messageRequired')
    .min(20, 'messageTooShort')
    .max(4000, 'messageTooLong'),
  company: z.string().max(0).optional(),
});

export type ContactInput = z.infer<typeof contactSchema>;
