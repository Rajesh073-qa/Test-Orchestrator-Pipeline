import { AIProviderInterface } from '../interfaces/ai.interface';

export class MockAIProvider implements AIProviderInterface {
  async generateTestPlan(storyContext: string): Promise<string> {
    return JSON.stringify({
      title: "Test Plan: Automated User Login",
      objective: "To verify that users can securely authenticate using valid credentials.",
      scope: {
        inScope: ["Login page", "API endpoints", "Session management"],
        outOfScope: ["Password recovery flow", "Social login integration"]
      },
      strategy: "Automated functional testing using Playwright with POM.",
      risks: ["Slow network latency", "Browser compatibility issues"],
      environment: "Staging/QA Environment",
      entryCriteria: "Stable build deployed to QA.",
      exitCriteria: "All priority High and Medium tests passing."
    });
  }

  async generateTestCases(storyContext: string): Promise<string> {
    return JSON.stringify([
      { 
        title: "Successful login with valid credentials", 
        description: "Verify that a user can login with a valid email and password.",
        type: "Positive", 
        priority: "High",
        steps: [
          { stepNumber: 1, action: "Navigate to /login", expectedResult: "Login page visible" },
          { stepNumber: 2, action: "Enter valid credentials and click Login", expectedResult: "Redirected to dashboard" }
        ]
      },
      { 
        title: "Failed login with invalid password", 
        description: "Verify that login fails with an incorrect password.",
        type: "Negative", 
        priority: "Medium",
        steps: [
          { stepNumber: 1, action: "Navigate to /login", expectedResult: "Login page visible" },
          { stepNumber: 2, action: "Enter invalid password and click Login", expectedResult: "Error message 'Invalid credentials' shown" }
        ]
      }
    ]);
  }

  async generateAutomationCode(testCaseContext: string): Promise<string> {
    return JSON.stringify({
      testFile: `import { test, expect } from '@playwright/test';\nimport { LoginPage } from '../pages/login.page';\n\ntest('Successful login', async ({ page }) => {\n  const loginPage = new LoginPage(page);\n  await loginPage.goto();\n  await loginPage.login('user@example.com', 'password');\n  await expect(page).toHaveURL('/dashboard');\n});`,
      pageObject: `export class LoginPage {\n  constructor(private page: any) {}\n  async goto() { await this.page.goto('/login'); }\n  async login(u, p) { ... }\n}`
    });
  }

  async parseRequirement(rawInput: string): Promise<string> {
    return JSON.stringify({
      title: "Automated User Login",
      description: "As a registered user, I want to login with my credentials so that I can access my dashboard.",
      acceptanceCriteria: ["Valid email/password", "Error message on invalid", "Redirect to /dashboard"],
      notes: "Mocked response for free development"
    });
  }
}
