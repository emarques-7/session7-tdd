## ADDED Requirements

### Requirement: candidateFactory provides valid candidate plain-data objects with overrides
`createValidCandidateData` (located at `src/tests/factories/candidateFactory.ts`) SHALL return a plain object with all required fields (`firstName`, `lastName`, `email`) set to valid default values, and SHALL merge any `overrides` passed in, allowing callers to produce invalid variants without full duplication.

#### Scenario: Default factory returns valid data
- **WHEN** `createValidCandidateData()` is called with no arguments
- **THEN** it returns an object with `firstName`, `lastName`, and `email` set to valid defaults
- **THEN** `educations` and `workExperiences` default to empty arrays

#### Scenario: Factory merges overrides
- **WHEN** `createValidCandidateData({ firstName: undefined })` is called
- **THEN** the returned object has `firstName` equal to `undefined`
- **THEN** all other fields retain their default values

### Requirement: CandidateBuilder produces Candidate instances and raw data
`CandidateBuilder` (located at `src/tests/builders/CandidateBuilder.ts`) SHALL provide a fluent API to construct `Candidate` instances and raw data objects for use in domain model tests.

#### Scenario: build() returns a Candidate instance
- **WHEN** `new CandidateBuilder().build()` is called
- **THEN** the result is an instance of `Candidate` with default field values

#### Scenario: withEmail override is applied
- **WHEN** `new CandidateBuilder().withEmail('custom@test.com').build()` is called
- **THEN** the resulting `Candidate` has `email` equal to `'custom@test.com'`

#### Scenario: buildData() returns a plain object
- **WHEN** `new CandidateBuilder().buildData()` is called
- **THEN** the result is a plain object (not a `Candidate` instance) with all default fields
