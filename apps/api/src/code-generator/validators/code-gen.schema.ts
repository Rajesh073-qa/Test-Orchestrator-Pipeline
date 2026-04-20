import { z } from 'zod';

export const CodeGenSchema = z.object({
  testFile: z.string().min(1),
  pageObject: z.string().min(1),
});

export type CodeGenAIResponse = z.infer<typeof CodeGenSchema>;
