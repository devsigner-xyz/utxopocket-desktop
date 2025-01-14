module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: '../coverage',
  moduleNameMapper: {
    '^@common/(.*)$': '<rootDir>/common/$1',
    '^@src/(.*)$': '<rootDir>/$1',
    '^@node/(.*)$': '<rootDir>/node/$1',
    '^@descriptor/(.*)$': '<rootDir>/descriptor/$1',
    '^@electrum/(.*)$': '<rootDir>/electrum/$1',
    '^@discovery/(.*)$': '<rootDir>/discovery/$1',
    '^@transaction/(.*)$': '<rootDir>/transaction/$1',
    '^@balance/(.*)$': '<rootDir>/balance/$1',
    '^@utxo/(.*)$': '<rootDir>/utxo/$1',
    '^@address/(.*)$': '<rootDir>/address/$1',
  }
};
