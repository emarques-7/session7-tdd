type CandidateData = {
  id?: number;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: string;
  educations?: Array<Record<string, unknown>>;
  workExperiences?: Array<Record<string, unknown>>;
  cv?: any;
};

export const createValidCandidateData = (
  overrides: Partial<CandidateData> = {},
): CandidateData => ({
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  phone: '612345678',
  address: '123 Main St',
  educations: [],
  workExperiences: [],
  ...overrides,
});
