const { existsSync } = require('fs')
const path = require('path')
const setupFiles = [path.resolve(__dirname, 'setEnvVars.js')]
if (existsSync(path.resolve('.jest', 'setEnvVars.js'))) setupFiles.push(path.resolve('', '.jest', 'setEnvVars.js'))
module.exports = {
  rootDir: path.resolve(),
  moduleFileExtensions: ['js'],
  setupFiles: setupFiles,
  preset: '@shelf/jest-mongodb',
  testMatch: ['**/src/**/*.spec.(js)', '**/tests/**/*.spec.(js)'],
  testURL: 'http://localhost/',
  modulePathIgnorePatterns: ["<rootDir>/microservices/front"],
  collectCoverage: process.env.coverage === 'false' ? false : true,
  collectCoverageFrom: [
    '**/*.js',
    '!**/node_modules/**',
    '!**/coverage/**',
    '!**/tests/**',
    '!**/gulpfile.js',
    '!*.js'
  ],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    'testconfig.js',
    'package.json',
    'package-lock.json',
  ],
  testResultsProcessor: 'jest-sonar-reporter',
}
