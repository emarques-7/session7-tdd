# Capability: candidate-model-tests

## Purpose
Define unit-test behavior requirements for the `Candidate` domain model persistence methods.

## Requirements

### Requirement: Prisma client MUST be fully mocked — no real database calls
The test suite for `Candidate` domain model SHALL declare `jest.mock('@prisma/client')` at the top of `tests-em.test.ts`. Inside the `describe('Candidate')` block, a `beforeEach` MUST obtain the mocked `PrismaClient` instance and stub `prisma.candidate.create`, `prisma.candidate.update`, and `prisma.candidate.findUnique` as `jest.fn()`. No real database connection, query, or transaction SHALL occur during any test.

#### Scenario: Prisma delegates are stubbed before each test
- **WHEN** the `describe('Candidate')` block initialises
- **THEN** `PrismaClient` is the mocked class from `jest.mock('@prisma/client')`
- **THEN** `mockPrismaInstance.candidate.create`, `.update`, and `.findUnique` are each a `jest.fn()`

### Requirement: Candidate.save() creates a new record when id is absent
`Candidate.save()` SHALL call `prisma.candidate.create` with the candidate's fields and return the created record when `this.id` is falsy.

#### Scenario: Create with minimal fields
- **WHEN** a `Candidate` has no `id` and minimal fields (`firstName`, `lastName`, `email`)
- **THEN** `prisma.candidate.create` is called once with those fields
- **THEN** the resolved database record is returned

#### Scenario: PrismaClientInitializationError on create throws connection message
- **WHEN** `prisma.candidate.create` rejects with `PrismaClientInitializationError`
- **THEN** `save()` rejects with `Error` containing the no-connection message

### Requirement: Candidate.save() updates an existing record when id is present
`Candidate.save()` SHALL call `prisma.candidate.update` with `where: { id }` and the candidate's fields when `this.id` is truthy.

#### Scenario: Update existing candidate
- **WHEN** a `Candidate` has `id: 1` and updated `firstName`
- **THEN** `prisma.candidate.update` is called with `{ where: { id: 1 }, data: { firstName: ... } }`
- **THEN** the resolved database record is returned

#### Scenario: P2025 on update throws not-found message
- **WHEN** `prisma.candidate.update` rejects with `{ code: 'P2025' }`
- **THEN** `save()` rejects with `Error` containing the not-found message

#### Scenario: PrismaClientInitializationError on update throws connection message
- **WHEN** `prisma.candidate.update` rejects with `PrismaClientInitializationError`
- **THEN** `save()` rejects with `Error` containing the no-connection message

### Requirement: Candidate.findOne returns a Candidate instance when found
`Candidate.findOne(id)` SHALL call `prisma.candidate.findUnique({ where: { id } })` and return a `Candidate` instance wrapping the data.

#### Scenario: Record found
- **WHEN** `prisma.candidate.findUnique` resolves with a valid candidate record
- **THEN** `findOne` returns a `Candidate` instance with matching fields

#### Scenario: Record not found returns null
- **WHEN** `prisma.candidate.findUnique` resolves with `null`
- **THEN** `findOne` returns `null`
