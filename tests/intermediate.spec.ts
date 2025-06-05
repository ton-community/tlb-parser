import fs from 'fs';
import path from 'path';

import { parse } from '../src';
import { loadYamlCases } from './loaders/yaml';

const fixturesDir = path.resolve(__dirname, 'fixtures');
const maybe = (condition: boolean) => (condition ? test : test.skip);

describe('parsing into intermediate representation using grammar', () => {
    test('block.tlb can be parsed', () => {
        expect.hasAssertions();

        const input = fs.readFileSync(path.resolve(fixturesDir, 'tlb', 'block.tlb'), 'utf-8');
        const parsed = parse(input);

        expect(parsed.shortMessage).toBe(undefined);
        expect(parsed.succeeded()).toBe(true);
    });

    for (let caseDef of loadYamlCases(fixturesDir, 'grammar', 'invalid-one-liners.yml')) {
        maybe(!caseDef.skip)(`Generated invalid example: ${caseDef.case}`, () => {
            expect.hasAssertions();

            const parsed = parse(caseDef.code);

            if (caseDef.error !== undefined) {
                expect(parsed.shortMessage).toEqual(caseDef.error);
            } else if (caseDef.errorStart !== undefined) {
                expect(parsed.shortMessage).toMatch(caseDef.errorStart);
            }
            expect(parsed.succeeded()).toBe(false);
        });
    }

    for (let caseDef of loadYamlCases(fixturesDir, 'grammar', 'valid-one-liners.yml')) {
        test(`Generated valid example: ${caseDef.case}`, () => {
            expect.hasAssertions();

            const parsed = parse(caseDef.code);

            expect(parsed.shortMessage).toBe(undefined);
            expect(parsed.succeeded()).toBe(true);
        });
    }
});
