import { faker } from '@faker-js/faker';

export type ProgramInput = {
  name: string;
  description: string;
};

/**
 * Happy-path program payload. Names are unique per call so parallel runs
 * do not collide; callers still own API/UI cleanup of what they create.
 */
export function buildProgram(overrides: Partial<ProgramInput> = {}): ProgramInput {
  return {
    name: `QA ${faker.commerce.department()} ${faker.string.alphanumeric(6)}`,
    description: faker.lorem.sentence(),
    ...overrides,
  };
}
