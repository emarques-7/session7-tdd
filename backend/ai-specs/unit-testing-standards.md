# Unit Testing Standards — Backend TypeScript

> Scope: unit tests only. No integration, E2E, or contract tests.
> Stack: Node.js · Express · TypeScript · Jest 29 · ts-jest · jest-mock-extended · Prisma

---

## Rules (always apply)

1. Every `it` block follows **AAA** — always include `// Arrange`, `// Act`, `// Assert` comments.
2. Name tests: `should [expected behavior] when [condition]`.
3. Name SUT variable: `sut`. Name mocks: `mock` prefix (`mockCandidateRepo`, `mockValidator`).
4. Call `jest.clearAllMocks()` in `afterEach` — never `resetAllMocks` or `restoreAllMocks`.
5. Never use a real database, file system, or network in unit tests.
6. Never assert only existence (`toBeDefined`). Always assert exact values (`toEqual`).
7. One behavior per `it` block — never test two independent behaviors in the same test.
8. Use `rejects.toThrow()` for async error testing — never `try/catch` inside `it` blocks.
9. Use `it.each` / `describe.each` for parametrized cases — never copy-paste `it` blocks.
10. Mock only what the SUT directly depends on — do not mock the SUT itself.

---

## File Conventions

- Suffix: `*.test.ts` (never `*.spec.ts`)
- Co-located with source file. One test file per source file.

```
src/application/services/candidateService.ts  →  candidateService.test.ts
src/application/validator.ts                  →  validator.test.ts
src/domain/models/Candidate.ts                →  Candidate.test.ts
src/presentation/controllers/candidateController.ts  →  candidateController.test.ts
```

---

## Canonical Test File Template

```typescript
import { mock, MockProxy } from 'jest-mock-extended';
import { SomeService } from './someService';
import { ISomeRepository } from '../../domain/repositories/ISomeRepository';
import { createValidSomeData } from '../../../test-utils/factories/someFactory';

jest.mock('../../domain/models/SomeModel'); // only for concrete modules without interfaces

describe('SomeService', () => {
  let sut: SomeService;
  let mockRepo: MockProxy<ISomeRepository>;

  beforeEach(() => {
    mockRepo = mock<ISomeRepository>();
    sut = new SomeService(mockRepo);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('methodName', () => {
    it('should return the result when valid input is provided', async () => {
      // Arrange
      const input = createValidSomeData();
      const expected = { id: 1, ...input };
      mockRepo.save.mockResolvedValue(expected);

      // Act
      const result = await sut.methodName(input);

      // Assert
      expect(result).toEqual(expected);
      expect(mockRepo.save).toHaveBeenCalledWith(expect.objectContaining({ id: input.id }));
      expect(mockRepo.save).toHaveBeenCalledTimes(1);
    });

    it('should throw Error when repository rejects', async () => {
      // Arrange
      mockRepo.save.mockRejectedValue(new Error('DB failure'));

      // Act & Assert
      await expect(sut.methodName(createValidSomeData())).rejects.toThrow('DB failure');
      expect(mockRepo.save).toHaveBeenCalledTimes(1);
    });
  });
});
```

---

## Mocking

### Typed interface mocks (preferred)
```typescript
import { mock, MockProxy } from 'jest-mock-extended';
let mockRepo: MockProxy<ICandidateRepository>;
beforeEach(() => { mockRepo = mock<ICandidateRepository>(); });
```

### Module mocking (concrete modules / Prisma)
```typescript
jest.mock('@prisma/client');                         // file top
jest.mock('../../domain/models/Candidate');          // file top
const MockCandidate = Candidate as jest.MockedClass<typeof Candidate>;
```

### Obtaining typed references and stubbing instance methods after `jest.mock`
Use `jest.mocked()` to get a typed handle on the mocked constructor, then configure the mock instance's methods in `beforeEach`:
```typescript
import { Candidate } from '../../domain/models/Candidate';
jest.mock('../../domain/models/Candidate');

const MockedCandidate = jest.mocked(Candidate);
let mockCandidateInstance: jest.Mocked<Candidate>;

beforeEach(() => {
  mockCandidateInstance = {
    save: jest.fn().mockResolvedValue({ id: 1, firstName: 'John' }),
    education: [],
    workExperience: [],
    resumes: [],
  } as unknown as jest.Mocked<Candidate>;
  MockedCandidate.mockImplementation(() => mockCandidateInstance);
});
```
Apply the same pattern for `Education`, `WorkExperience`, and `Resume` when testing the service layer.

### Mocking Prisma delegates directly (domain model tests)
When testing a domain model class that instantiates `PrismaClient` at module top-level, mock `@prisma/client` and stub the specific delegate methods:
```typescript
import { PrismaClient } from '@prisma/client';
jest.mock('@prisma/client');

const MockedPrismaClient = jest.mocked(PrismaClient);
let mockPrisma: jest.Mocked<PrismaClient>;

beforeEach(() => {
  mockPrisma = {
    candidate: {
      create: jest.fn(),
      update: jest.fn(),
      findUnique: jest.fn(),
    },
  } as unknown as jest.Mocked<PrismaClient>;
  MockedPrismaClient.mockImplementation(() => mockPrisma);
});
```

### Sharing `jest.mock` declarations across multiple `describe` suites in one file
When all test suites live in a single file, declare every `jest.mock(...)` at the very top of the file (Jest hoists them automatically). Each `describe` block is then responsible for configuring only the mocks it needs inside its own `beforeEach` — do not rely on setup from a sibling `describe`. Always call `jest.clearAllMocks()` in a top-level `afterEach` to reset all shared mocks between suites.
```typescript
// file top — all mocks declared once
jest.mock('@prisma/client');
jest.mock('../domain/models/Candidate');
jest.mock('../application/services/candidateService');

// each describe configures only what it needs
describe('Candidate', () => {
  beforeEach(() => { /* stub prisma delegates */ });
});

describe('addCandidate', () => {
  beforeEach(() => { /* stub Candidate constructor + save */ });
});

afterEach(() => { jest.clearAllMocks(); });
```

### Return value patterns
```typescript
mockRepo.findById.mockResolvedValue(fixture);                             // async success
mockRepo.findById.mockRejectedValue(new Error('DB error'));               // async error
mockFn.mockReturnValue(value);                                            // sync
mockFn.mockImplementation(() => { throw new Error('msg'); });             // sync throw
mockRepo.findById.mockResolvedValueOnce(fixture).mockResolvedValueOnce(null); // successive
```

### What to mock per layer

| Layer | Mock |
|---|---|
| Domain model (`Candidate`) | `@prisma/client` module |
| Validator | Nothing — pure functions |
| Service | Domain model classes + validator module |
| Controller | Service module |

---

## Test Data

### Builder — domain entity instances (`test-utils/builders/`)
```typescript
export class CandidateBuilder {
  private data: any = {
    firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com',
    education: [], workExperience: [], resumes: [],
  };
  withId(id: number): this { this.data.id = id; return this; }
  withEmail(email: string): this { this.data.email = email; return this; }
  withFirstName(name: string): this { this.data.firstName = name; return this; }
  withEducations(educations: any[]): this { this.data.education = educations; return this; }
  build(): Candidate { return new Candidate(this.data); }
  buildData(): typeof this.data { return { ...this.data }; }
}
```

### Factory — plain data objects (`test-utils/factories/`)
```typescript
export const createValidCandidateData = (overrides: Partial<any> = {}) => ({
  firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com',
  phone: '612345678', address: '123 Main St',
  educations: [], workExperiences: [],
  ...overrides,
});
```
Always use the `overrides` pattern — never duplicate full objects per test.

---

## Parametrized Tests

```typescript
it.each([
  ['missing firstName',      { firstName: undefined },        'Invalid name'],
  ['firstName too short',    { firstName: 'A' },              'Invalid name'],
  ['firstName too long',     { firstName: 'A'.repeat(101) }, 'Invalid name'],
  ['firstName with numbers', { firstName: 'John1' },         'Invalid name'],
])(
  'should throw when %s',
  (_label, overrides, expectedMessage) => {
    // Arrange
    const data = createValidCandidateData(overrides);
    // Act & Assert
    expect(() => validateCandidateData(data)).toThrow(expectedMessage);
  }
);
```
Use `describe.each` when multiple `it` blocks share the same variant context.

---

## Required Coverage per Function

| Category | Examples |
|---|---|
| Happy path | Valid inputs, expected return value |
| Validation errors | Invalid/malformed inputs |
| Not-found / empty | `null`, `[]`, resource missing |
| Dependency failures | DB error, rejected promise |
| Error-code branches | `P2002`, `P2025`, unknown errors |
| Boundary values | min, max, min−1, max+1, empty string, null, undefined |

Coverage threshold: **90%** branches · functions · lines · statements.

---

## Error Testing

```typescript
// Specific type
await expect(sut.save()).rejects.toThrow(SomeSpecificError);

// Specific message
await expect(sut.save()).rejects.toThrow('The email already exists in the database');

// Same error instance propagates (no wrapping)
const err = new Error('Disk full');
mockSave.mockRejectedValue(err);
await expect(sut.addCandidate(data)).rejects.toBe(err);

// Non-Error thrown value (controller guard)
mockService.add.mockRejectedValue('string error');
await controller(mockReq, mockRes);
expect(jsonMock).toHaveBeenCalledWith(expect.objectContaining({ error: 'Unknown error' }));
```

---

## Controller Test Setup

```typescript
const jsonMock = jest.fn();
const statusMock = jest.fn();
beforeEach(() => {
  statusMock.mockReturnValue({ json: jsonMock });
  mockReq = { body: createValidCandidateData() };
  mockRes = { status: statusMock, json: jsonMock };
});
```

---

## Anti-Patterns

| Never | Instead |
|---|---|
| `expect(result).toBeDefined()` | `expect(result).toEqual({ id: 1, ... })` |
| `try/catch` inside `it` for errors | `rejects.toThrow()` |
| Mutable state shared between `it` blocks | Re-create everything in `beforeEach` |
| `jest.resetAllMocks()` | `jest.clearAllMocks()` |
| Duplicate `it` blocks differing by one value | `it.each` |
| Real Prisma/DB calls | Mock `@prisma/client` |
| `it.skip` permanently | Fix or delete |
