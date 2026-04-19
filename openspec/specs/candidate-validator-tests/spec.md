# Capability: candidate-validator-tests

## Purpose
Define unit-test behavior requirements for `validateCandidateData` input validation.

## Requirements

### Requirement: validateCandidateData skips all validation when id is present
The validator SHALL return without error when the input data contains an `id` field, regardless of other fields.

#### Scenario: Data with id bypasses validation
- **WHEN** `validateCandidateData` is called with `{ id: 1 }`
- **THEN** no error is thrown

### Requirement: validateCandidateData validates firstName and lastName
The validator SHALL throw `Error('Invalid name')` when `firstName` or `lastName` is missing, too short (< 2), too long (> 100), or contains non-letter characters.

#### Scenario: Missing firstName throws
- **WHEN** `validateCandidateData` is called with `firstName` set to `undefined`
- **THEN** `Error('Invalid name')` is thrown

#### Scenario: firstName too short throws
- **WHEN** `validateCandidateData` is called with `firstName` of length 1
- **THEN** `Error('Invalid name')` is thrown

#### Scenario: firstName too long throws
- **WHEN** `validateCandidateData` is called with `firstName` of length 101
- **THEN** `Error('Invalid name')` is thrown

#### Scenario: firstName with digits throws
- **WHEN** `validateCandidateData` is called with `firstName` containing a digit character
- **THEN** `Error('Invalid name')` is thrown

#### Scenario: Missing lastName throws
- **WHEN** `validateCandidateData` is called with `lastName` set to `undefined`
- **THEN** `Error('Invalid name')` is thrown

#### Scenario: Valid name passes
- **WHEN** `validateCandidateData` is called with valid `firstName` and `lastName` meeting all constraints
- **THEN** no error is thrown for the name fields

### Requirement: validateCandidateData validates email
The validator SHALL throw `Error('Invalid email')` when `email` is missing or does not match the email regex pattern.

#### Scenario: Missing email throws
- **WHEN** `validateCandidateData` is called with `email` set to `undefined`
- **THEN** `Error('Invalid email')` is thrown

#### Scenario: Malformed email throws
- **WHEN** `validateCandidateData` is called with `email` equal to `'not-an-email'`
- **THEN** `Error('Invalid email')` is thrown

#### Scenario: Valid email passes
- **WHEN** `validateCandidateData` is called with a valid email address
- **THEN** no error is thrown for the email field

### Requirement: validateCandidateData validates phone (optional)
The validator SHALL throw `Error('Invalid phone')` when `phone` is present and does not match the Spanish phone pattern `(6|7|9)\d{8}`. Phone is optional — absent phone MUST NOT throw.

#### Scenario: Invalid phone throws
- **WHEN** `validateCandidateData` is called with `phone` equal to `'12345'`
- **THEN** `Error('Invalid phone')` is thrown

#### Scenario: Missing phone passes
- **WHEN** `validateCandidateData` is called without a `phone` field
- **THEN** no error is thrown for phone

#### Scenario: Valid phone passes
- **WHEN** `validateCandidateData` is called with `phone` equal to `'612345678'`
- **THEN** no error is thrown for phone

### Requirement: validateCandidateData validates address (optional)
The validator SHALL throw `Error('Invalid address')` when `address` is present and its length exceeds 100 characters.

#### Scenario: Address over 100 chars throws
- **WHEN** `validateCandidateData` is called with an `address` string of 101 characters
- **THEN** `Error('Invalid address')` is thrown

#### Scenario: Missing address passes
- **WHEN** `validateCandidateData` is called without an `address` field
- **THEN** no error is thrown for address

### Requirement: validateCandidateData validates each education entry
The validator SHALL throw for each education entry that is missing `institution`, has `institution` > 100 chars, is missing `title`, has `title` > 100 chars, is missing `startDate`, or has an `endDate` that does not match `YYYY-MM-DD`.

#### Scenario: Missing institution throws
- **WHEN** an education entry has no `institution`
- **THEN** `Error('Invalid institution')` is thrown

#### Scenario: Institution too long throws
- **WHEN** an education entry has `institution` of length 101
- **THEN** `Error('Invalid institution')` is thrown

#### Scenario: Missing title throws
- **WHEN** an education entry has no `title`
- **THEN** `Error('Invalid title')` is thrown

#### Scenario: Missing startDate throws
- **WHEN** an education entry has no `startDate`
- **THEN** `Error('Invalid date')` is thrown

#### Scenario: Invalid endDate throws
- **WHEN** an education entry has `endDate` equal to `'not-a-date'`
- **THEN** `Error('Invalid end date')` is thrown

#### Scenario: Valid education entry passes
- **WHEN** an education entry has valid `institution`, `title`, `startDate`, and no `endDate`
- **THEN** no error is thrown

### Requirement: validateCandidateData validates each work experience entry
The validator SHALL throw for each experience missing `company`, `company` > 100 chars, missing `position`, `position` > 100 chars, `description` > 200 chars, missing `startDate`, or invalid `endDate`.

#### Scenario: Missing company throws
- **WHEN** a work experience entry has no `company`
- **THEN** `Error('Invalid company')` is thrown

#### Scenario: Missing position throws
- **WHEN** a work experience entry has no `position`
- **THEN** `Error('Invalid position')` is thrown

#### Scenario: Description too long throws
- **WHEN** a work experience entry has `description` of length 201
- **THEN** `Error('Invalid description')` is thrown

#### Scenario: Missing startDate throws
- **WHEN** a work experience entry has no `startDate`
- **THEN** `Error('Invalid date')` is thrown

#### Scenario: Invalid endDate throws
- **WHEN** a work experience entry has `endDate` equal to `'bad-date'`
- **THEN** `Error('Invalid end date')` is thrown

#### Scenario: Valid experience entry passes
- **WHEN** a work experience entry has valid `company`, `position`, and `startDate`
- **THEN** no error is thrown

### Requirement: validateCandidateData validates CV when present and non-empty
The validator SHALL throw `Error('Invalid CV data')` when `cv` is present, non-empty, and is missing `filePath` or `fileType` or either is not a string.

#### Scenario: CV missing filePath throws
- **WHEN** `cv` is `{ fileType: 'application/pdf' }` with no `filePath`
- **THEN** `Error('Invalid CV data')` is thrown

#### Scenario: CV missing fileType throws
- **WHEN** `cv` is `{ filePath: '/uploads/cv.pdf' }` with no `fileType`
- **THEN** `Error('Invalid CV data')` is thrown

#### Scenario: Empty CV object passes
- **WHEN** `cv` is `{}`
- **THEN** no error is thrown

#### Scenario: Valid CV passes
- **WHEN** `cv` is `{ filePath: '/uploads/cv.pdf', fileType: 'application/pdf' }`
- **THEN** no error is thrown
