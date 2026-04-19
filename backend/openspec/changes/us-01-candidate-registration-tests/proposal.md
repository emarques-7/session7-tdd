## Why

The candidate registration flow has no automated unit tests, leaving core business logic (validation, service orchestration, controller error handling, and domain model persistence) unverified. Adding a comprehensive unit test suite for US-01 establishes a safety net before any refactoring or extension and enforces the project's 90% coverage threshold.

## What Changes

- Add a single test file `src/tests/tests-em.test.ts` covering all units: validator, service, domain model, and controller
- Add test utilities inside `src/tests/`: `factories/candidateFactory.ts` and `builders/CandidateBuilder.ts`
- Install `jest-mock-extended` as a dev dependency (required by testing standards)
- Add `jest.config.js` (currently missing) to configure `ts-jest`

## Capabilities

### New Capabilities

- `candidate-validator-tests`: Unit tests for all validation logic in `validator.ts`
- `candidate-service-tests`: Unit tests for `addCandidate` orchestration in `candidateService.ts`
- `candidate-model-tests`: Unit tests for `Candidate` domain model `save()` and `findOne()` methods
- `candidate-controller-tests`: Unit tests for `addCandidateController` HTTP handler
- `test-utilities`: Shared factories and builders for candidate test data

### Modified Capabilities

## Impact

- New dev dependency: `jest-mock-extended`
- New `jest.config.js` at backend root
- Single test file at `src/tests/tests-em.test.ts`
- Utility files under `src/tests/factories/` and `src/tests/builders/`
- `@prisma/client` must be module-mocked in all tests touching domain models
