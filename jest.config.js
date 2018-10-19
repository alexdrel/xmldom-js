module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  collectCoverage: true,
  collectCoverageFrom: [ "src/*.{ts,tsx}" ],
  // coverageReporters: [ "json", "text-summary"]
};
