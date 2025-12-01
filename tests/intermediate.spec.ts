import fs from 'fs';
import path from 'path';

import { ast, parse, Program } from '../src';
import { loadYamlCases } from './loaders/yaml';

const fixturesDir = path.resolve(__dirname, 'fixtures');
const maybe = (condition: boolean) => (condition ? test : test.skip);
const loadSchema = (name: string) => fs.readFileSync(path.resolve(fixturesDir, 'tlb', name), 'utf-8');

describe('parsing into intermediate representation using grammar', () => {
    test.each(['block.tlb', 'boc.tlb'])('%s can be parsed', (name: string) => {
        const parsed = parse(loadSchema(name));
        expect(parsed.shortMessage).toBe(undefined);
        expect(parsed.succeeded()).toBe(true);
    });

    test.each([
        ['block.tlb', 376],
        ['boc.tlb', 7],
    ])('%s can be build ast', (name: string, declarations: number) => {
        const tree = ast(loadSchema(name));
        expect(tree).toBeInstanceOf(Program);
        expect(tree.declarations.length).toEqual(declarations);
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
