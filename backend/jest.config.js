module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  collectCoverageFrom: [
    'src/application/validator.ts',
    'src/application/services/candidateService.ts',
    'src/domain/models/Candidate.ts',
    'src/presentation/controllers/candidateController.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
  },
};
