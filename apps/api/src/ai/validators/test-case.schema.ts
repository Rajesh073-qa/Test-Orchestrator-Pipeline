import { z } from 'zod';

export const TestCaseStepSchema = z.object({
  stepNumber: z.number(),
  action: z.string().min(1),
  expectedResult: z.string().min(1),
});

export const TestCaseSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  preConditions: z.string().optional(),
  type: z.string(),
  priority: z.enum(['High', 'Medium', 'Low']),
  dataScenarios: z.array(z.string()).optional(),
  steps: z.array(TestCaseStepSchema).min(1),
});

export const TestCasesResponseSchema = z.array(TestCaseSchema);

export type TestCaseAIResponse = z.infer<typeof TestCaseSchema>;
export type TestCasesAIResponse = z.infer<typeof TestCasesResponseSchema>;
