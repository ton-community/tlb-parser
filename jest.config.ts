import type { Config } from 'jest';

const config: Config = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: ['<rootDir>/tests'],
    verbose: true,
    silent: false,
    coverageThreshold: {
        global: {
            statements: 98.13,
        },
    },
    coveragePathIgnorePatterns: ['tests/'],
};

export default config;
