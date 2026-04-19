## Context

The backend is a Node.js + Express + TypeScript application using Prisma as ORM. There is no jest configuration file and `jest-mock-extended` is absent. The testing standards mandate `jest-mock-extended`, AAA pattern, `sut` as the SUT variable, `mock` prefix for mocks, and `jest.clearAllMocks()` in `afterEach`. All tests for this user story are consolidated in a single file `src/tests/tests-em.test.ts`. Test utilities (factories, builders) live under `src/tests/`. Domain models (`Candidate`, `Education`, `WorkExperience`, `Resume`) import `PrismaClient` directly at module level, requiring `jest.mock('@prisma/client')` at the top of the test file.

## Goals / Non-Goals

**Goals:**
- Achieve ≥90% branch/function/line/statement coverage on the four source files under test
- Follow all rules in `unit-testing-standards.md` without exception
- Keep tests isolated: no real Prisma calls, no file system, no network
- Provide reusable `candidateFactory` (plain data) and `CandidateBuilder` (domain instances) in `src/tests/`
- Configure Jest via `jest.config.js` with `ts-jest` so `npm test` works out of the box

**Non-Goals:**
- Integration or E2E tests
- Tests for `fileUploadService.ts` (out of US-01 scope)
- Tests for `Education`, `WorkExperience`, or `Resume` models in isolation (they are covered indirectly through the service tests)
- Mutation testing or performance benchmarks

## Decisions

### 1. Mocking strategy for external calls and dependencies
**Decision:** All external calls MUST be intercepted via `jest.mock(...)` declarations at the top of `src/tests/tests-em.test.ts`. The complete list of modules that MUST be mocked is:

| Module path (relative to `src/tests/tests-em.test.ts`) | Why |
|---|---|
| `@prisma/client` | Prevents real DB connections in `Candidate`, `Education`, `WorkExperience`, `Resume` model tests |
| `../domain/models/Candidate` | Intercepts constructor + `save()` in the service suite |
| `../domain/models/Education` | Intercepts constructor + `save()` in the service suite |
| `../domain/models/WorkExperience` | Intercepts constructor + `save()` in the service suite |
| `../domain/models/Resume` | Intercepts constructor + `save()` in the service suite |
| `../application/validator` | Allows controlling `validateCandidateData` throws in the service suite |
| `../application/services/candidateService` | Intercepts `addCandidate` in the controller suite |

After `jest.mock(...)`, each `describe` block obtains typed references via `jest.mocked(...)` or direct casting and resets relevant mocks in its own `beforeEach` using `jest.clearAllMocks()` in `afterEach`.

For the **model suite** (`describe('Candidate')`), `prisma.candidate.create`, `prisma.candidate.update`, and `prisma.candidate.findUnique` MUST be replaced with `jest.fn()` mock implementations inside `beforeEach`, set up via `(PrismaClient as jest.MockedClass<typeof PrismaClient>).prototype` or by casting the `mockPrisma` instance returned from the module mock.

**Rationale:** Domain models are concrete classes (no interface), so module-level mocking is the only way to intercept constructor calls and `save()` without touching the real Prisma client. This matches the per-layer mock table in the standards.

**Alternative considered:** Dependency injection wrapper around Prisma — rejected because it requires modifying production code outside US-01 scope.

### 2. `jest-mock-extended` for typed mocks
**Decision:** Install `jest-mock-extended` and use `mock<T>()` / `MockProxy<T>` for any repository or service interface mock.

**Rationale:** Standards explicitly require it. Provides full type-safety and auto-completion for mock setup, reducing typos in `mockFn.mockResolvedValue(...)` chains.

### 3. Parametrized validation tests with `it.each`
**Decision:** Use `it.each` tables for all boundary/invalid-value cases in the `describe('validateCandidateData')` block inside `tests-em.test.ts`.

**Rationale:** The validator has many homogeneous cases (name too short, too long, invalid pattern, etc.). `it.each` avoids copy-paste `it` blocks and is mandated by standard rule 9.

### 4. `jest.config.js` configuration
**Decision:** Add a `jest.config.js` at the backend root with `ts-jest` preset, `testMatch: ['**/tests/tests-em.test.ts']`, and a coverage threshold of 90 for all metrics.

**Rationale:** No jest config exists. Without it, `npm test` cannot transpile TypeScript. The threshold enforces the standards' 90% requirement automatically in CI.

### 5. `MockProxy` types for Prisma delegate mocks in model tests
**Decision:** In the `describe('Candidate')` block inside `tests-em.test.ts`, mock `prisma.candidate`, `prisma.education`, etc. as `MockProxy` objects via the top-level `jest.mock('@prisma/client')` and casting.

**Rationale:** Keeps model tests consistent with the `jest-mock-extended` approach used everywhere else; avoids fragile manual `jest.fn()` chains for each Prisma method.

## Risks / Trade-offs

- **Prisma module mock brittleness** → The `PrismaClient` instantiation at module top-level means `jest.mock('@prisma/client')` must be declared before any import that triggers `new PrismaClient()`. Jest hoists `jest.mock` calls automatically, so this is safe as long as the mock is declared at file top.
- **Single-file `jest.mock` scope** → All `jest.mock(...)` declarations must sit at the very top of `tests-em.test.ts` (before any imports that trigger module evaluation). Jest hoists them automatically, but mixing module mocks that serve different `describe` suites in one file requires care: the same mock for `Candidate` is shared by both the model suite and the service suite. Each `describe` block must reset relevant mock implementations in its own `beforeEach`.
- **Indirect model coverage** → `Education`, `WorkExperience`, and `Resume` `save()` calls are covered only via mocks in the service suite. If their logic grows, dedicated files should be added. This is acceptable for US-01 scope.
- **`addCandidate` wraps validation errors in `new Error(error)`** → The service catches validator errors and re-throws as `new Error(error)`, which means tests must assert on the outer message string, not the original `Error` type.
