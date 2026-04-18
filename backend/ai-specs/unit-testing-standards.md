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
