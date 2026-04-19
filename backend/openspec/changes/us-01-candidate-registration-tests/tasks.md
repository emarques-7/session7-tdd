## 1. Infrastructure Setup

- [ ] 1.1 Install `jest-mock-extended` as a dev dependency (`npm install --save-dev jest-mock-extended`)
- [ ] 1.2 Create `jest.config.js` at backend root configuring `ts-jest` preset, `testMatch: ['**/tests/tests-em.test.ts']`, and 90% coverage thresholds for branches/functions/lines/statements
- [ ] 1.3 Verify `npm test` runs without errors on an empty test suite

## 2. Test Utilities

- [ ] 2.1 Create `src/tests/factories/candidateFactory.ts` exporting `createValidCandidateData(overrides?)` with valid defaults for `firstName`, `lastName`, `email`, `phone`, `address`, `educations: []`, `workExperiences: []`
- [ ] 2.2 Create `src/tests/builders/CandidateBuilder.ts` exporting `CandidateBuilder` with fluent methods `withId`, `withEmail`, `withFirstName`, `withLastName`, `withEducations`, `build()`, and `buildData()`

## 3. Validator Unit Tests

- [ ] 3.1 Create `src/tests/tests-em.test.ts` with all top-level `jest.mock(...)` declarations at file top: `jest.mock('@prisma/client')`, `jest.mock('../domain/models/Candidate')`, `jest.mock('../domain/models/Education')`, `jest.mock('../domain/models/WorkExperience')`, `jest.mock('../domain/models/Resume')`, `jest.mock('../application/validator')`, `jest.mock('../application/services/candidateService')`
- [ ] 3.2 Add `describe('validateCandidateData')` block; implement test: `should not throw when id is present`
- [ ] 3.3 Implement `it.each` table tests for `firstName` — missing, too short, too long, invalid chars, valid
- [ ] 3.4 Implement `it.each` table tests for `lastName` — missing, too short, too long, invalid chars, valid
- [ ] 3.5 Implement `it.each` table tests for `email` — missing, malformed, valid
- [ ] 3.6 Implement `it.each` table tests for `phone` — invalid pattern, absent (no throw), valid
- [ ] 3.7 Implement tests for `address` — over 100 chars throws, absent passes
- [ ] 3.8 Implement `it.each` table tests for each education validation rule (institution, title, startDate, endDate)
- [ ] 3.9 Implement `it.each` table tests for each work experience validation rule (company, position, description, startDate, endDate)
- [ ] 3.10 Implement tests for CV validation — missing filePath, missing fileType, empty object, valid object

## 4. Candidate Model Unit Tests

- [ ] 4.1 Add `describe('Candidate')` block inside `tests-em.test.ts`; in its `beforeEach`, obtain the mocked `PrismaClient` instance and stub `mockPrisma.candidate.create`, `.update`, and `.findUnique` as `jest.fn()` — no real DB calls allowed
- [ ] 4.2 Implement test: `should call prisma.candidate.create when id is absent`
- [ ] 4.3 Implement test: `should return created record from prisma.candidate.create`
- [ ] 4.4 Implement test: `should throw connection error message when PrismaClientInitializationError on create`
- [ ] 4.5 Implement test: `should call prisma.candidate.update with correct where clause when id is present`
- [ ] 4.6 Implement test: `should return updated record from prisma.candidate.update`
- [ ] 4.7 Implement test: `should throw not-found message on P2025 during update`
- [ ] 4.8 Implement test: `should throw connection error message when PrismaClientInitializationError on update`
- [ ] 4.9 Implement test: `should return Candidate instance when findOne finds a record`
- [ ] 4.10 Implement test: `should return null when findOne finds no record`

## 5. Candidate Service Unit Tests

- [ ] 5.1 Add `describe('addCandidate')` block inside `tests-em.test.ts`; in its `beforeEach`, use `jest.mocked(Candidate)` / `jest.mocked(Education)` / etc. to configure mock constructors and stub each `instance.save` as a resolving `jest.fn()`; stub `validateCandidateData` as a no-op `jest.fn()` by default
- [ ] 5.2 Implement test: happy path minimal — resolves with saved candidate, constructor and save called once
- [ ] 5.3 Implement test: happy path with educations — Education constructor, save, and push called
- [ ] 5.4 Implement test: happy path with work experiences — WorkExperience constructor, save, and push called
- [ ] 5.5 Implement test: happy path with CV — Resume constructor, save, and push called
- [ ] 5.6 Implement test: empty cv `{}` — Resume constructor NOT called
- [ ] 5.7 Implement test: validation error re-thrown as Error with original message
- [ ] 5.8 Implement test: P2002 from candidate.save() → `Error('The email already exists in the database')`
- [ ] 5.9 Implement test: unknown error from candidate.save() → same error instance re-thrown

## 6. Candidate Controller Unit Tests

- [ ] 6.1 Add `describe('addCandidateController')` block inside `tests-em.test.ts`; in its `beforeEach`, obtain `jest.mocked(addCandidate)` and create mock `req` (`{ body: createValidCandidateData() }`) and `res` (`{ status: jest.fn().mockReturnValue({ json: jsonMock }), json: jest.fn() }`) — no real service or HTTP calls allowed
- [ ] 6.2 Implement test: `should respond 201 with candidate data when addCandidate resolves`
- [ ] 6.3 Implement test: `should respond 400 with error.message when addCandidate rejects with Error`
- [ ] 6.4 Implement test: `should respond 400 with 'Unknown error' when addCandidate rejects with non-Error`

## 7. Coverage Verification

- [ ] 7.1 Run `npm test -- --coverage` and confirm all four source files meet 90% threshold
- [ ] 7.2 Fix any uncovered branches identified in the coverage report
