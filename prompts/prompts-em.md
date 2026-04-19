# Session Prompts Log

# Project Setup

> **Tool:** Windsurf (AI Coding Assistant)  
> **Skill Used:** `typescript-unit-testing` (installed globally)  

---

## Prompt 1: Create Unit Testing Standards Spec

### User Prompt

> As an expert senior software engineer applying ai-driven-development with openspec framework, with broad expertise in typescript language and unit testing with Jest.
>
> I will like to create an standard file (spec) with all my unit testing guidelines in typescript for the backend project. I will like to include the best practices, latest patterns, arrange-act-assert pattern, parametrization, affirmation messages, edge cases testing, etc.
>
> Also, use the whole codebase as context.
>
> Write the file in a "ai-specs" folder inside "backend" folder.
>
> ask me all the questions you need

### AI Agent Response Summary

**Questions asked:**
- Format preference: Markdown (.md) vs MDC (.mdc) vs both → User chose **Markdown**
- Mocking approach: Plain jest.mock() vs jest-mock-extended vs @golevelup/ts-jest → User chose **jest-mock-extended**
- Test Data Builders: Builder pattern vs factory functions → User chose **Builder pattern + factory functions**
- Parametrized tests: test.each vs custom loops → User chose **test.each**

**Final result:** Created `backend/ai-specs/unit-testing-standards.md` (~1,180 lines) covering file conventions, AAA pattern, assertions, parametrized tests, mocking, test data builders, layer-specific testing, edge cases, coverage requirements (90%), and anti-patterns.

---

## Prompt 2: Review and Optimize for AI Agents

### User Prompt

> Now as an expert in ai-driven development, do you think this standard file for unit testing is accurate? is it loo long? can it be more concise? what is better for an ai agent?

### AI Agent Response Summary

**Questions asked:** None (analysis was direct)

**Final result:** Replaced the original ~1,180-line file with an AI-optimized version (~240 lines): 10 numbered rules, canonical test file template, mocking patterns, test data patterns, parametrized tests example, coverage requirements table, error testing patterns, and anti-patterns table. ~80% size reduction, rule-driven format.

---

## Prompt 3: Update OpenSpec config.yaml

### User Prompt

> As an expert in AI-Driven Development using openspec framework, can you please check the whole codebase and update the openspec @openspec/config.yaml file? according to best practices for openspec usage

### AI Agent Response Summary


**Final result:** Updated `openspec/config.yaml` from a bare scaffold (only `schema: spec-driven` with commented-out examples) to a fully populated configuration. Explored the entire codebase (backend, frontend, Prisma schema, API spec, testing standards, Docker config, domain models, services, controllers, routes) and the OpenSpec CLI internals (`project-config.d.ts` schema, `schema.yaml` artifact definitions) to understand the exact config structure.

The updated config includes:
- **`context`** — Full project knowledge for AI: project identity (LTI Talent Tracking System), tech stack with versions, layered backend architecture, component-based frontend, domain model (Candidate, Education, WorkExperience, Resume), API endpoints, and team conventions (ports, test naming, bilingual comments).
- **`rules`** — Per-artifact guardrails for all 4 `spec-driven` artifacts:
  - `proposal`: concise scope, Prisma/API impact, dependency tracking
  - `specs`: align with Prisma schema & validators, testable scenarios, OpenAPI references
  - `design`: preserve layered architecture, Active Record pattern, migration strategy
  - `tasks`: 2-hour chunks, dependency-ordered (schema → models → validators → services → controllers → routes → frontend), mandatory tasks for tests/OpenAPI/migrations

---

## Prompt 4: Analyze Codebase and Find Candidate Services

### User Prompt

> Plase analyse the whole codebase and give me a summary of the project.
>
> Also, for the backend project, please find the services or apis that stores candidate data in database

### AI Agent Response Summary

**Final result:** Provided comprehensive project summary covering:
- Architecture: React + TypeScript frontend, Express + TypeScript backend, PostgreSQL + Prisma ORM
- Project structure with layered backend (application/domain/presentation/routes)
- Database schema (Candidate, Education, WorkExperience, Resume models)
- Candidate storage services identified:
  - `candidateService.ts` - Main orchestration service (validates, saves candidate + related data)
  - `Candidate.ts` domain model - Direct Prisma CRUD operations
  - `Education.ts`, `WorkExperience.ts`, `Resume.ts` - Related entity models
  - `fileUploadService.ts` - CV file upload handling
- API endpoints: `POST /candidates`, `POST /upload`
- Frontend integration via `candidateService.js`

---

## Prompt 5: Create User Story for Candidate Registration

### User Prompt

> Now, I want to work with unit testing for the candidates registration process. Can you please analyse all the details of this action in the code and creates a user story that I can later use to create accurate unit tests? Please take into account for acceptance criteria, besides the normal behaviour, all the possible border cases. Create the user story in markdown format named: US-01-candidate-registration.md in @[backend/ai-specs]/changes folder. Ask me all the questions you need

### AI Agent Response Summary

**Questions asked:**
- Whether date order validation (endDate after startDate) should be included → User clarified: take code as source of truth, no new rules
- Whether minimum data requirements beyond firstName/lastName/email are needed → User clarified: follow existing code
- Whether max limits on educations/work experiences exist → User clarified: follow existing code
- User Story format preference → User clarified: use `agile-product-owner` skill, omit story points
- Whether future scope features should be included → User clarified: goal is unit testing for already-developed story only

**Final result:** Created `backend/ai-specs/changes/US-01-candidate-registration.md` with 30 acceptance criteria derived entirely from code:
- 5 happy-path scenarios (minimal, full, optional fields omitted, empty cv, multi-record)
- 21 validation failure scenarios (each field rule, format, length, missing required)
- 2 database error scenarios (duplicate email P2002, connection failure)
- 1 update-path bypass scenario (id present skips validation)
- Technical notes including validator/DB schema discrepancy on `education.title`
- Definition of Done checklist for unit tests

---

## Prompt 6: Clarify Approach and Refine User Story Scope

### User Prompt

> An important feature to refine your questions:
> - The goal is to create unit testing for the already developed story. I don't want to change the code at this moment.
> - Take the info from the code as the source of truth
> - Use the global agile-product-owner skill to create the user story
> - You can omit the story points step since this is an already developed user story.
>
> My main goal is to create a user story so I can use it then as a context for openspec to create the unit tests for this functionality. Do you think it is a good approach?

### AI Agent Response Summary

**Questions asked:** None

**Final result:** Confirmed the approach as optimal — user story acts as the behavioral specification layer giving OpenSpec: clear intent, acceptance criteria mapped to `it` blocks, boundary values and error messages already extracted, and a scoped Definition of Done. Created the final `US-01-candidate-registration.md` using the `agile-product-owner` skill, code as sole source of truth, story points omitted.

---

## Prompt 7: Propose Unit Tests via OpenSpec Backend Test Workflow

### User Prompt

> @[/opsx-backendtest-propose] us-01-candidate-registration-tests
> I want to create only the unit tests for this user story.
> Context: @[backend/ai-specs/changes/US-01-candidate-registration.md]

### AI Agent Response Summary

**Final result:** Executed `/opsx-backendtest-propose` workflow to create a new OpenSpec change at `openspec/changes/us-01-candidate-registration-tests/` with 4 artifacts:
- `proposal.md` — scope: unit tests for validator, service, model, controller + utilities + jest config + jest-mock-extended
- `design.md` — mocking strategy, AAA pattern, parametrized tests with `it.each`, 90% coverage threshold
- `specs/` — 5 spec files: candidate-validator-tests, candidate-service-tests, candidate-model-tests, candidate-controller-tests, test-utilities (all with detailed scenarios)
- `tasks.md` — 28 tasks across 7 groups covering infrastructure, utilities, and all test suites

Also anchored TypeScript unit testing standards (`skill: typescript-unit-testing`) and `unit-testing-standards.md` as constraints.

---

## Prompt 8: Adapt to Single Test File Format

### User Prompt

> Just to confirm, please make sure all the change artifacts contains intructions to mock all external calls like the database interaction

### AI Agent Response Summary

**Final result:** No changes needed — the specs already cover this implicitly. Validator tests use pure functions (no mocks), model tests mock Prisma delegates via `jest.mock('@prisma/client')`, service tests mock domain models and validator, controller tests mock the service.

---

## Prompt 9: Adapt Specs to Single File Format

### User Prompt

> Can you please adapt the specs you just created so all the tests must be written in a single file called "tests-em.test.ts" in "/backend/src/tests" folder? All the util files for testing must be also written inside the tests folder. Please do the updates to the openspec change files

### AI Agent Response Summary

**Questions asked:** None

**Final result:** Updated all 4 OpenSpec artifacts:
- `proposal.md` — consolidated 4 test files + `test-utils/` → single `src/tests/tests-em.test.ts` + `src/tests/factories/` + `src/tests/builders/`
- `design.md` — added shared `jest.mock` scope guidance, per-`describe` block `beforeEach` configuration responsibility, updated `testMatch` pattern
- `specs/test-utilities/spec.md` — updated paths to `src/tests/factories/` and `src/tests/builders/`
- `tasks.md` — restructured tasks: single file creation with all 7 `jest.mock(...)` declarations at top, `describe` blocks added sequentially inside same file, explicit mock setup per suite

---

## Prompt 10: Update Unit Testing Standards

### User Prompt

> Now, as an ai-driven development expert, do you consider updating @[backend/ai-specs/unit-testing-standards.md] file with this specifications about mocking so it can be included in future unit testing? Only do it so if you consider is necessary

### AI Agent Response Summary

**Questions asked:** None

**Final result:** Analyzed standards and identified 3 genuine gaps not previously covered:
1. `jest.mocked()` + `mockImplementation()` pattern for concrete class constructors (instance `save()` stubbing)
2. Prisma delegate stubbing pattern (`mockPrisma.candidate.create/update/findUnique`)
3. Shared `jest.mock` declarations across multiple `describe` suites in one file (isolation rules, top-level `afterEach` with `jest.clearAllMocks()`)

Updated `unit-testing-standards.md` `## Mocking` section with 3 new subsections (~60 lines) covering these patterns. Core principles (Rule 5, existing module mocking examples) were already adequate — only the specific implementation patterns were missing.

---

