# Capability: candidate-controller-tests

## Purpose
Define unit-test behavior requirements for `addCandidateController`.

## Requirements

### Requirement: candidateService and Express objects MUST be fully mocked — no real service calls or HTTP I/O
The test suite for `addCandidateController` SHALL rely on the top-level `jest.mock('../application/services/candidateService')` in `tests-em.test.ts`. Inside the `describe('addCandidateController')` block, a `beforeEach` MUST:
- Obtain the mocked `addCandidate` via `jest.mocked(addCandidate)`
- Create a mock `req` object as `{ body: createValidCandidateData() }`
- Create a mock `res` object with `status` as `jest.fn()` returning `{ json: jsonMock }` and `json` as `jest.fn()`

No real service logic, database access, or HTTP transport SHALL be invoked.

#### Scenario: addCandidate is stubbed and req/res are mocked before each test
- **WHEN** the `describe('addCandidateController')` block initialises
- **THEN** `addCandidate` is a `jest.fn()` (mocked via `jest.mock`)
- **THEN** `mockRes.status` is a `jest.fn()` returning `{ json: mockRes.json }`
- **THEN** `mockReq.body` contains valid candidate data from the factory

### Requirement: addCandidateController responds 201 on success
`addCandidateController` SHALL call `addCandidate(req.body)` and respond with HTTP 201 and `{ message: 'Candidate added successfully', data: candidate }` when the service resolves.

#### Scenario: Successful candidate creation
- **WHEN** `addCandidate` resolves with a candidate object
- **THEN** `res.status` is called with `201`
- **THEN** `res.json` is called with `{ message: 'Candidate added successfully', data: <candidateObject> }`

### Requirement: addCandidateController responds 400 with Error message
`addCandidateController` SHALL respond with HTTP 400 and `{ message: 'Error adding candidate', error: error.message }` when the service rejects with an `Error` instance.

#### Scenario: Service throws Error
- **WHEN** `addCandidate` rejects with `new Error('Invalid name')`
- **THEN** `res.status` is called with `400`
- **THEN** `res.json` is called with `{ message: 'Error adding candidate', error: 'Invalid name' }`

### Requirement: addCandidateController responds 400 with 'Unknown error' for non-Error throws
`addCandidateController` SHALL respond with HTTP 400 and `{ message: 'Error adding candidate', error: 'Unknown error' }` when the service rejects with a non-`Error` value.

#### Scenario: Service throws a non-Error value
- **WHEN** `addCandidate` rejects with a plain string `'string error'`
- **THEN** `res.status` is called with `400`
- **THEN** `res.json` is called with `{ message: 'Error adding candidate', error: 'Unknown error' }`
