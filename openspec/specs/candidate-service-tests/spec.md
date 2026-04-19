# Capability: candidate-service-tests

## Purpose
Define unit-test behavior requirements for `addCandidate` service orchestration.

## Requirements

### Requirement: All domain models and validator MUST be fully mocked — no real DB calls or validation side-effects
The test suite for `addCandidate` SHALL rely on top-level `jest.mock(...)` calls in `tests-em.test.ts` for: `../domain/models/Candidate`, `../domain/models/Education`, `../domain/models/WorkExperience`, `../domain/models/Resume`, and `../application/validator`. Inside the `describe('addCandidate')` block, a `beforeEach` MUST obtain mocked constructors via `jest.mocked(Candidate)`, `jest.mocked(Education)`, etc., and configure `mockCandidateInstance.save` as a `jest.fn()` resolving to a fixture. `validateCandidateData` MUST be stubbed as a no-op by default (using `jest.mocked(validateCandidateData).mockImplementation(() => {})`) and overridden to throw only in error-path tests. No real Prisma call, file I/O, or network request SHALL occur.

#### Scenario: Domain model constructors and save() are stubbed before each test
- **WHEN** the `describe('addCandidate')` block initialises
- **THEN** `Candidate`, `Education`, `WorkExperience`, and `Resume` are all mocked classes
- **THEN** each instance's `save()` method is a `jest.fn()` returning a resolved promise
- **THEN** `validateCandidateData` is a `jest.fn()` that does not throw by default

### Requirement: addCandidate returns saved candidate on valid data
`addCandidate` SHALL call `validateCandidateData`, instantiate `Candidate`, call `candidate.save()`, and return the resolved saved candidate object.

#### Scenario: Happy path — minimal valid data
- **WHEN** `addCandidate` is called with valid minimal candidate data (no educations, no experiences, no cv)
- **THEN** it returns the object resolved by `candidate.save()`
- **THEN** `Candidate` constructor is called once with the input data
- **THEN** `candidate.save()` is called once

#### Scenario: Happy path — with educations
- **WHEN** `addCandidate` is called with valid data including one education entry
- **THEN** `Education` constructor is called once with the education data
- **THEN** `educationModel.save()` is called once
- **THEN** the education is pushed onto `candidate.education`

#### Scenario: Happy path — with work experiences
- **WHEN** `addCandidate` is called with valid data including one work experience entry
- **THEN** `WorkExperience` constructor is called once with the experience data
- **THEN** `experienceModel.save()` is called once
- **THEN** the experience is pushed onto `candidate.workExperience`

#### Scenario: Happy path — with CV
- **WHEN** `addCandidate` is called with valid data including a non-empty `cv` object
- **THEN** `Resume` constructor is called once with the cv data
- **THEN** `resumeModel.save()` is called once
- **THEN** the resume is pushed onto `candidate.resumes`

#### Scenario: Empty cv object is ignored
- **WHEN** `addCandidate` is called with `cv: {}`
- **THEN** `Resume` constructor is NOT called

### Requirement: addCandidate re-throws validation errors as Error
`addCandidate` SHALL catch any error thrown by `validateCandidateData` and re-throw it as `new Error(error)`.

#### Scenario: Validation failure propagates as Error
- **WHEN** `validateCandidateData` throws `Error('Invalid name')`
- **THEN** `addCandidate` rejects with an `Error` whose message contains `'Invalid name'`
- **THEN** `Candidate` constructor is NOT called

### Requirement: addCandidate throws duplicate email error on Prisma P2002
`addCandidate` SHALL catch Prisma error code `P2002` from `candidate.save()` and throw `Error('The email already exists in the database')`.

#### Scenario: P2002 error maps to duplicate email message
- **WHEN** `candidate.save()` rejects with `{ code: 'P2002' }`
- **THEN** `addCandidate` rejects with `Error('The email already exists in the database')`

### Requirement: addCandidate re-throws unknown Prisma errors
`addCandidate` SHALL re-throw any error from `candidate.save()` that is not `P2002` without modification.

#### Scenario: Unknown error propagates unchanged
- **WHEN** `candidate.save()` rejects with an arbitrary `Error('DB connection lost')`
- **THEN** `addCandidate` rejects with the same error instance
