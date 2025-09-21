/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/test'], // <-- Look for tests inside 'test' folder
  testMatch: ['**/*.ts'], // <-- Only run .ts files
};
