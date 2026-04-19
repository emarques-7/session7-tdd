const mockPrismaClientInstance = {
  candidate: {
    create: jest.fn(),
    update: jest.fn(),
    findUnique: jest.fn(),
  },
  education: {
    create: jest.fn(),
    update: jest.fn(),
  },
  workExperience: {
    create: jest.fn(),
    update: jest.fn(),
  },
  resume: {
    create: jest.fn(),
  },
};

jest.mock('@prisma/client', () => {
  const actual = jest.requireActual('@prisma/client');

  return {
    ...actual,
    PrismaClient: jest.fn(() => mockPrismaClientInstance),
  };
});
jest.mock('../domain/models/Candidate');
jest.mock('../domain/models/Education');
jest.mock('../domain/models/WorkExperience');
jest.mock('../domain/models/Resume');
jest.mock('../application/validator');
jest.mock('../application/services/candidateService');

import { Prisma } from '@prisma/client';
import { Candidate } from '../domain/models/Candidate';
import { Education } from '../domain/models/Education';
import { WorkExperience } from '../domain/models/WorkExperience';
import { Resume } from '../domain/models/Resume';
import { addCandidate } from '../application/services/candidateService';
import { validateCandidateData } from '../application/validator';
import { addCandidateController } from '../presentation/controllers/candidateController';
import { createValidCandidateData } from './factories/candidateFactory';
import { CandidateBuilder } from './builders/CandidateBuilder';

afterEach(() => {
  jest.clearAllMocks();
});

describe('validateCandidateData', () => {
  const { validateCandidateData: sut } = jest.requireActual(
    '../application/validator',
  ) as typeof import('../application/validator');

  it('should not throw when id is present', () => {
    // Arrange
    const data = { id: 1 };

    // Act
    const call = () => sut(data);

    // Assert
    expect(call).not.toThrow();
  });

  it.each([
    ['missing', { firstName: undefined }, true],
    ['too short', { firstName: 'A' }, true],
    ['too long', { firstName: 'A'.repeat(101) }, true],
    ['invalid chars', { firstName: 'John1' }, true],
    ['valid', { firstName: 'John' }, false],
  ])(
    'should validate firstName when %s',
    (_case, overrides, shouldThrow) => {
      // Arrange
      const data = createValidCandidateData(overrides);

      // Act
      const call = () => sut(data);

      // Assert
      if (shouldThrow) {
        expect(call).toThrow('Invalid name');
        return;
      }
      expect(call).not.toThrow();
    },
  );

  it.each([
    ['missing', { lastName: undefined }, true],
    ['too short', { lastName: 'A' }, true],
    ['too long', { lastName: 'A'.repeat(101) }, true],
    ['invalid chars', { lastName: 'Doe2' }, true],
    ['valid', { lastName: 'Doe' }, false],
  ])('should validate lastName when %s', (_case, overrides, shouldThrow) => {
    // Arrange
    const data = createValidCandidateData(overrides);

    // Act
    const call = () => sut(data);

    // Assert
    if (shouldThrow) {
      expect(call).toThrow('Invalid name');
      return;
    }
    expect(call).not.toThrow();
  });

  it.each([
    ['missing', { email: undefined }, true],
    ['malformed', { email: 'not-an-email' }, true],
    ['valid', { email: 'valid@example.com' }, false],
  ])('should validate email when %s', (_case, overrides, shouldThrow) => {
    // Arrange
    const data = createValidCandidateData(overrides);

    // Act
    const call = () => sut(data);

    // Assert
    if (shouldThrow) {
      expect(call).toThrow('Invalid email');
      return;
    }
    expect(call).not.toThrow();
  });

  it.each([
    ['invalid pattern', { phone: '12345' }, true],
    ['absent', { phone: undefined }, false],
    ['valid', { phone: '612345678' }, false],
  ])('should validate phone when %s', (_case, overrides, shouldThrow) => {
    // Arrange
    const data = createValidCandidateData(overrides);

    // Act
    const call = () => sut(data);

    // Assert
    if (shouldThrow) {
      expect(call).toThrow('Invalid phone');
      return;
    }
    expect(call).not.toThrow();
  });

  it('should throw when address exceeds max length', () => {
    // Arrange
    const data = createValidCandidateData({ address: 'A'.repeat(101) });

    // Act
    const call = () => sut(data);

    // Assert
    expect(call).toThrow('Invalid address');
  });

  it('should not throw when address is absent', () => {
    // Arrange
    const data = createValidCandidateData({ address: undefined });

    // Act
    const call = () => sut(data);

    // Assert
    expect(call).not.toThrow();
  });

  it.each([
    ['missing institution', { institution: undefined }, 'Invalid institution'],
    ['institution too long', { institution: 'A'.repeat(101) }, 'Invalid institution'],
    ['missing title', { title: undefined }, 'Invalid title'],
    ['missing startDate', { startDate: undefined }, 'Invalid date'],
    ['invalid endDate', { endDate: 'not-a-date' }, 'Invalid end date'],
    ['valid', {}, ''],
  ])(
    'should validate education when %s',
    (_case, educationOverrides, expectedError) => {
      // Arrange
      const validEducation = {
        institution: 'University',
        title: 'Engineer',
        startDate: '2020-01-01',
      };
      const data = createValidCandidateData({
        educations: [{ ...validEducation, ...educationOverrides }],
      });

      // Act
      const call = () => sut(data);

      // Assert
      if (expectedError) {
        expect(call).toThrow(expectedError);
        return;
      }
      expect(call).not.toThrow();
    },
  );

  it.each([
    ['missing company', { company: undefined }, 'Invalid company'],
    ['missing position', { position: undefined }, 'Invalid position'],
    ['description too long', { description: 'A'.repeat(201) }, 'Invalid description'],
    ['missing startDate', { startDate: undefined }, 'Invalid date'],
    ['invalid endDate', { endDate: 'bad-date' }, 'Invalid end date'],
    ['valid', {}, ''],
  ])('should validate work experiences when %s', (_case, expOverrides, expectedError) => {
    // Arrange
    const validExperience = {
      company: 'Acme',
      position: 'Developer',
      startDate: '2020-01-01',
      description: 'Building software',
    };
    const data = createValidCandidateData({
      workExperiences: [{ ...validExperience, ...expOverrides }],
    });

    // Act
    const call = () => sut(data);

    // Assert
    if (expectedError) {
      expect(call).toThrow(expectedError);
      return;
    }
    expect(call).not.toThrow();
  });

  it.each([
    ['missing filePath', { fileType: 'application/pdf' }, true],
    ['missing fileType', { filePath: '/uploads/cv.pdf' }, true],
    ['empty object', {}, false],
    ['valid', { filePath: '/uploads/cv.pdf', fileType: 'application/pdf' }, false],
  ])('should validate cv when %s', (_case, cv, shouldThrow) => {
    // Arrange
    const data = createValidCandidateData({ cv });

    // Act
    const call = () => sut(data);

    // Assert
    if (shouldThrow) {
      expect(call).toThrow('Invalid CV data');
      return;
    }
    expect(call).not.toThrow();
  });
});

describe('Candidate', () => {
  const { Candidate: CandidateModel } = jest.requireActual(
    '../domain/models/Candidate',
  ) as typeof import('../domain/models/Candidate');

  let sut: InstanceType<typeof CandidateModel>;

  beforeEach(() => {
    mockPrismaClientInstance.candidate.create = jest.fn();
    mockPrismaClientInstance.candidate.update = jest.fn();
    mockPrismaClientInstance.candidate.findUnique = jest.fn();

    sut = new CandidateModel(new CandidateBuilder().buildData());
  });

  it('should call prisma.candidate.create when id is absent', async () => {
    // Arrange
    mockPrismaClientInstance.candidate.create.mockResolvedValue({ id: 1 });

    // Act
    await sut.save();

    // Assert
    expect(mockPrismaClientInstance.candidate.create).toHaveBeenCalledTimes(1);
    expect(mockPrismaClientInstance.candidate.update).not.toHaveBeenCalled();
  });

  it('should return created record from prisma.candidate.create when id is absent', async () => {
    // Arrange
    const expected = { id: 1, firstName: 'John', lastName: 'Doe' };
    mockPrismaClientInstance.candidate.create.mockResolvedValue(expected);

    // Act
    const result = await sut.save();

    // Assert
    expect(result).toEqual(expected);
  });

  it('should include nested create payloads when candidate has education work experience and resumes', async () => {
    // Arrange
    sut = new CandidateModel(
      new CandidateBuilder()
        .withEducations([
          {
            institution: 'University',
            title: 'Engineer',
            startDate: '2020-01-01',
            endDate: undefined,
          },
        ])
        .buildData(),
    );
    sut.workExperience = [
      {
        company: 'Acme',
        position: 'Developer',
        description: 'Building software',
        startDate: new Date('2021-01-01'),
        endDate: undefined,
      } as never,
    ];
    sut.resumes = [{ filePath: '/uploads/cv.pdf', fileType: 'application/pdf' } as never];
    mockPrismaClientInstance.candidate.create.mockResolvedValue({ id: 1 });

    // Act
    await sut.save();

    // Assert
    expect(mockPrismaClientInstance.candidate.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          educations: expect.objectContaining({ create: expect.any(Array) }),
          workExperiences: expect.objectContaining({ create: expect.any(Array) }),
          resumes: expect.objectContaining({ create: expect.any(Array) }),
        }),
      }),
    );
  });

  it('should throw connection error message when PrismaClientInitializationError on create', async () => {
    // Arrange
    const initError = Object.create(Prisma.PrismaClientInitializationError.prototype);
    mockPrismaClientInstance.candidate.create.mockRejectedValue(initError);

    // Act & Assert
    await expect(sut.save()).rejects.toThrow('No se pudo conectar con la base de datos');
  });

  it('should re-throw unknown error when update fails with non handled error', async () => {
    // Arrange
    const expectedError = new Error('Unexpected update failure');
    sut = new CandidateModel(new CandidateBuilder().withId(1).buildData());
    mockPrismaClientInstance.candidate.update.mockRejectedValue(expectedError);

    // Act & Assert
    await expect(sut.save()).rejects.toBe(expectedError);
  });

  it('should re-throw unknown error when create fails with non handled error', async () => {
    // Arrange
    const expectedError = new Error('Unexpected create failure');
    mockPrismaClientInstance.candidate.create.mockRejectedValue(expectedError);

    // Act & Assert
    await expect(sut.save()).rejects.toBe(expectedError);
  });

  it('should call prisma.candidate.update with correct where clause when id is present', async () => {
    // Arrange
    sut = new CandidateModel(new CandidateBuilder().withId(1).withFirstName('Jane').buildData());
    mockPrismaClientInstance.candidate.update.mockResolvedValue({ id: 1, firstName: 'Jane' });

    // Act
    await sut.save();

    // Assert
    expect(mockPrismaClientInstance.candidate.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 1 } }),
    );
  });

  it('should return updated record from prisma.candidate.update when id is present', async () => {
    // Arrange
    const expected = { id: 1, firstName: 'Jane', lastName: 'Doe' };
    sut = new CandidateModel(new CandidateBuilder().withId(1).withFirstName('Jane').buildData());
    mockPrismaClientInstance.candidate.update.mockResolvedValue(expected);

    // Act
    const result = await sut.save();

    // Assert
    expect(result).toEqual(expected);
  });

  it('should throw not-found message on P2025 during update', async () => {
    // Arrange
    sut = new CandidateModel(new CandidateBuilder().withId(1).buildData());
    mockPrismaClientInstance.candidate.update.mockRejectedValue({ code: 'P2025' });

    // Act & Assert
    await expect(sut.save()).rejects.toThrow('No se pudo encontrar el registro del candidato');
  });

  it('should throw connection error message when PrismaClientInitializationError on update', async () => {
    // Arrange
    const initError = Object.create(Prisma.PrismaClientInitializationError.prototype);
    sut = new CandidateModel(new CandidateBuilder().withId(1).buildData());
    mockPrismaClientInstance.candidate.update.mockRejectedValue(initError);

    // Act & Assert
    await expect(sut.save()).rejects.toThrow('No se pudo conectar con la base de datos');
  });

  it('should return Candidate instance when findOne finds a record', async () => {
    // Arrange
    mockPrismaClientInstance.candidate.findUnique.mockResolvedValue({
      id: 7,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: null,
      address: null,
    });

    // Act
    const result = await CandidateModel.findOne(7);

    // Assert
    expect(mockPrismaClientInstance.candidate.findUnique).toHaveBeenCalledWith({
      where: { id: 7 },
    });
    expect(result).toBeInstanceOf(CandidateModel);
    expect(result?.id).toBe(7);
  });

  it('should return null when findOne finds no record', async () => {
    // Arrange
    mockPrismaClientInstance.candidate.findUnique.mockResolvedValue(null);

    // Act
    const result = await CandidateModel.findOne(7);

    // Assert
    expect(result).toBeNull();
  });
});

describe('addCandidate', () => {
  const { addCandidate: sut } = jest.requireActual(
    '../application/services/candidateService',
  ) as typeof import('../application/services/candidateService');

  const mockedCandidate = jest.mocked(Candidate);
  const mockedEducation = jest.mocked(Education);
  const mockedWorkExperience = jest.mocked(WorkExperience);
  const mockedResume = jest.mocked(Resume);
  const mockedValidateCandidateData = jest.mocked(validateCandidateData);

  let mockCandidateInstance: {
    save: jest.Mock;
    education: any[];
    workExperience: any[];
    resumes: any[];
  };
  let mockEducationInstance: { save: jest.Mock; candidateId?: number };
  let mockWorkExperienceInstance: { save: jest.Mock; candidateId?: number };
  let mockResumeInstance: { save: jest.Mock; candidateId?: number };

  beforeEach(() => {
    mockCandidateInstance = {
      save: jest.fn().mockResolvedValue({ id: 1, firstName: 'John' }),
      education: [],
      workExperience: [],
      resumes: [],
    };
    mockEducationInstance = {
      save: jest.fn().mockResolvedValue({ id: 10 }),
      candidateId: undefined,
    };
    mockWorkExperienceInstance = {
      save: jest.fn().mockResolvedValue({ id: 11 }),
      candidateId: undefined,
    };
    mockResumeInstance = {
      save: jest.fn().mockResolvedValue({ id: 12 }),
      candidateId: undefined,
    };

    mockedCandidate.mockImplementation(() => mockCandidateInstance as never);
    mockedEducation.mockImplementation(() => mockEducationInstance as never);
    mockedWorkExperience.mockImplementation(() => mockWorkExperienceInstance as never);
    mockedResume.mockImplementation(() => mockResumeInstance as never);
    mockedValidateCandidateData.mockImplementation(() => { });
  });

  it('should return saved candidate when valid minimal data is provided', async () => {
    // Arrange
    const candidateData = createValidCandidateData();

    // Act
    const result = await sut(candidateData);

    // Assert
    expect(result).toEqual({ id: 1, firstName: 'John' });
    expect(mockedValidateCandidateData).toHaveBeenCalledWith(candidateData);
    expect(mockedCandidate).toHaveBeenCalledWith(candidateData);
    expect(mockCandidateInstance.save).toHaveBeenCalledTimes(1);
  });

  it('should create and save education when educations are provided', async () => {
    // Arrange
    const educationData = {
      institution: 'University',
      title: 'Engineer',
      startDate: '2020-01-01',
    };
    const candidateData = createValidCandidateData({ educations: [educationData] });

    // Act
    await sut(candidateData);

    // Assert
    expect(mockedEducation).toHaveBeenCalledWith(educationData);
    expect(mockEducationInstance.save).toHaveBeenCalledTimes(1);
    expect(mockCandidateInstance.education).toHaveLength(1);
  });

  it('should create and save work experience when work experiences are provided', async () => {
    // Arrange
    const workExperienceData = {
      company: 'Acme',
      position: 'Developer',
      startDate: '2020-01-01',
      description: 'Building software',
    };
    const candidateData = createValidCandidateData({ workExperiences: [workExperienceData] });

    // Act
    await sut(candidateData);

    // Assert
    expect(mockedWorkExperience).toHaveBeenCalledWith(workExperienceData);
    expect(mockWorkExperienceInstance.save).toHaveBeenCalledTimes(1);
    expect(mockCandidateInstance.workExperience).toHaveLength(1);
  });

  it('should skip education and work experience creation when arrays are absent', async () => {
    // Arrange
    const candidateData = createValidCandidateData({
      educations: undefined,
      workExperiences: undefined,
    });

    // Act
    await sut(candidateData);

    // Assert
    expect(mockedEducation).not.toHaveBeenCalled();
    expect(mockedWorkExperience).not.toHaveBeenCalled();
  });

  it('should create and save resume when cv is provided', async () => {
    // Arrange
    const candidateData = createValidCandidateData({
      cv: { filePath: '/uploads/cv.pdf', fileType: 'application/pdf' },
    });

    // Act
    await sut(candidateData);

    // Assert
    expect(mockedResume).toHaveBeenCalledWith({
      filePath: '/uploads/cv.pdf',
      fileType: 'application/pdf',
    });
    expect(mockResumeInstance.save).toHaveBeenCalledTimes(1);
    expect(mockCandidateInstance.resumes).toHaveLength(1);
  });

  it('should not create resume when cv is empty object', async () => {
    // Arrange
    const candidateData = createValidCandidateData({ cv: {} });

    // Act
    await sut(candidateData);

    // Assert
    expect(mockedResume).not.toHaveBeenCalled();
  });

  it('should re-throw validation error as Error when validator throws', async () => {
    // Arrange
    mockedValidateCandidateData.mockImplementation(() => {
      throw new Error('Invalid name');
    });

    // Act & Assert
    await expect(sut(createValidCandidateData())).rejects.toThrow('Invalid name');
    expect(mockedCandidate).not.toHaveBeenCalled();
  });

  it('should throw duplicate email error when candidate save throws P2002', async () => {
    // Arrange
    mockCandidateInstance.save.mockRejectedValue({ code: 'P2002' });

    // Act & Assert
    await expect(sut(createValidCandidateData())).rejects.toThrow(
      'The email already exists in the database',
    );
  });

  it('should re-throw same error instance when candidate save throws unknown error', async () => {
    // Arrange
    const expectedError = new Error('DB connection lost');
    mockCandidateInstance.save.mockRejectedValue(expectedError);

    // Act & Assert
    await expect(sut(createValidCandidateData())).rejects.toBe(expectedError);
  });
});

describe('addCandidateController', () => {
  const mockedAddCandidate = jest.mocked(addCandidate);

  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;
  let mockReq: any;
  let mockRes: any;

  beforeEach(() => {
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });
    mockReq = { body: createValidCandidateData() };
    mockRes = { status: statusMock, json: jsonMock };
  });

  it('should respond 201 with candidate data when addCandidate resolves', async () => {
    // Arrange
    const candidate = { id: 1, firstName: 'John' };
    mockedAddCandidate.mockResolvedValue(candidate as never);

    // Act
    await addCandidateController(mockReq, mockRes);

    // Assert
    expect(mockedAddCandidate).toHaveBeenCalledWith(mockReq.body);
    expect(statusMock).toHaveBeenCalledWith(201);
    expect(jsonMock).toHaveBeenCalledWith({
      message: 'Candidate added successfully',
      data: candidate,
    });
  });

  it('should respond 400 with error.message when addCandidate rejects with Error', async () => {
    // Arrange
    mockedAddCandidate.mockRejectedValue(new Error('Invalid name'));

    // Act
    await addCandidateController(mockReq, mockRes);

    // Assert
    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith({
      message: 'Error adding candidate',
      error: 'Invalid name',
    });
  });

  it('should respond 400 with Unknown error when addCandidate rejects with non-Error', async () => {
    // Arrange
    mockedAddCandidate.mockRejectedValue('string error' as never);

    // Act
    await addCandidateController(mockReq, mockRes);

    // Assert
    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith({
      message: 'Error adding candidate',
      error: 'Unknown error',
    });
  });
});
