import { Candidate } from '../../domain/models/Candidate';

type CandidateBuilderData = {
  id?: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  education: any[];
  workExperience: any[];
  resumes: any[];
};

export class CandidateBuilder {
  private data: CandidateBuilderData = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '612345678',
    address: '123 Main St',
    education: [],
    workExperience: [],
    resumes: [],
  };

  withId(id: number): this {
    this.data.id = id;
    return this;
  }

  withEmail(email: string): this {
    this.data.email = email;
    return this;
  }

  withFirstName(firstName: string): this {
    this.data.firstName = firstName;
    return this;
  }

  withLastName(lastName: string): this {
    this.data.lastName = lastName;
    return this;
  }

  withEducations(educations: any[]): this {
    this.data.education = educations;
    return this;
  }

  build(): Candidate {
    return new Candidate(this.data);
  }

  buildData(): CandidateBuilderData {
    return { ...this.data };
  }
}
