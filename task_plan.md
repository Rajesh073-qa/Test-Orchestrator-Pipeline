# Test Orchestrator - Task Plan

## Phases

### 1. Phase: Discovery
**Goal:** Understand product vision, requirements, technical constraints, and user needs.
**Checklist:**
- [x] Ask discovery questions across all 10 core categories.
- [x] Receive answers from the user.
- [x] Update `findings.md` with research insights, decisions, constraints, and assumptions.
- [x] Get final approval on `task_plan.md`.

### 2. Phase: Design
**Goal:** Define the system architecture, UI/UX structure, and data flow.
**Checklist:**
- [x] Define Monorepo Architecture (Next.js App Router + NestJS Modular).
- [x] Design Normalized PostgreSQL database schema via Prisma.
- [x] Design AI Isolation Layer and Centralized Prompts.
- [x] Document Jira API endpoints and AI Provider integration flow.

### 3. Phase: Build (Implementation) - MVP
**Goal:** Develop the core MVP strictly adhering to constraints.
**Checklist:**
- [ ] Initialize Monorepo (Turborepo/Nx) with `/apps` and `/packages`.
- [ ] Setup Prisma Schema (`users`, `jira_connections`, `projects`, `user_stories`, `test_plans`, `test_cases`, `test_case_steps`, `automation_scripts`).
- [ ] Implement Auth Module (JWT, bcrypt) & Secure Token Storage.
- [ ] Build Jira Integration Module (API Token, short-term caching).
- [ ] Implement AI Service Abstraction Layer & Centralized Prompts.
- [ ] Build AI Test Plan Generation with mandatory Review Layer.
- [ ] Build Smart Test Case Creation with mandatory Review Layer.
- [ ] Build Test Case Dashboard with Excel Export and Inline Editing.
- [ ] Build Playwright Code Generator (structured files, `data-testid` priority).

### 4. Phase: Test
**Goal:** Ensure code quality, security, and requirement adherence.
**Checklist:**
- [ ] Unit testing of NestJS services, especially the AI abstraction layer.
- [ ] Integration testing with Jira and AI.
- [ ] End-to-end testing of the "Jira Story → Code" flow.

### 5. Phase: Deploy
**Goal:** Release MVP to production environments.
**Checklist:**
- [ ] Deploy Next.js to Vercel.
- [ ] Deploy NestJS to Railway/Render.
- [ ] Setup PostgreSQL database.
- [ ] Final smoke tests.

## Dependencies and Risks
- **Dependencies:** Jira Cloud API access, OpenAI API access, PostgreSQL hosting.
- **Risks:** Scope creep, AI Hallucination, Jira API Rate Limits, Poor automation selectors, High generation latency.
