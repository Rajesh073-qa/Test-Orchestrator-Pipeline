import { z } from 'zod';

export const TestPlanSchema = z.object({
  title: z.string().min(1),
  objective: z.string().min(1),
  scope: z.object({
    inScope: z.array(z.string()),
    outOfScope: z.array(z.string()),
  }),
  strategy: z.string().min(1),
  risks: z.array(z.string()),
  environment: z.string().min(1),
  entryCriteria: z.string().min(1),
  exitCriteria: z.string().min(1),
});

export type TestPlanAIResponse = z.infer<typeof TestPlanSchema>;
