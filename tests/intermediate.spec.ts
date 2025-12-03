import { ast, parse, walk, Program, ASTBase, ASTRootBase } from '../src';
import { loadAstCases, loadGrammarCases, loadSchema } from './util/load';
import { TestVisitor } from './util/TestVisitor';

const maybe = (condition: boolean) => (condition ? test : test.skip);

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

    test.each([
        ['block.tlb', 19],
        ['boc.tlb', 18],
    ])('%s can be visited and walk parents', (name: string, visited: number) => {
        const tree = ast(loadSchema(name));
        expect(tree).toBeInstanceOf(Program);
        const visitor = new TestVisitor();
        visitor.visit(tree);
        expect(visitor.visited.size).toEqual(visited);
        for (let node of walk(tree)) {
            if (node instanceof Program) {
                expect(node.parent).toBe(null);
            } else {
                expect(node).toBeInstanceOf(ASTBase);
                expect(node.parent).toBeInstanceOf(ASTRootBase);
            }
        }
    });

    describe('invalid grammar', () => {
        for (let caseDef of loadGrammarCases('invalid-one-liners.yml')) {
            maybe(!caseDef.skip)(`${caseDef.case} - can not be parsed valid`, () => {
                expect.hasAssertions();

                const parsed = parse(caseDef.code);

                if (caseDef.error !== undefined) {
                    expect(parsed.shortMessage).toEqual(caseDef.error);
                } else if (caseDef.errorStart !== undefined) {
                    expect(parsed.shortMessage).toMatch(caseDef.errorStart);
                }

                if (caseDef.errorValidate !== undefined) {
                    expect(parsed.succeeded()).toBe(true);
                    expect(() => ast(caseDef.code)).toThrow(caseDef.errorValidate);
                } else {
                    expect(parsed.succeeded()).toBe(false);
                }
            });
        }
    });

    describe('valid grammar', () => {
        for (let caseDef of loadGrammarCases('valid-one-liners.yml')) {
            test(`${caseDef.case} - can be parsed valid`, () => {
                const parsed = parse(caseDef.code);
                expect(parsed.shortMessage).toBe(undefined);
                expect(parsed.succeeded()).toBe(true);
            });
            test(`${caseDef.case} - can be build ast valid`, () => {
                const tree = ast(caseDef.code);
                expect(tree).toBeInstanceOf(Program);
                expect(tree.declarations.length).toBeGreaterThan(0);
            });
        }
    });

    describe('node visitor', () => {
        for (let caseDef of loadAstCases('visit.yml')) {
            test(`Generated visit example: ${caseDef.case}`, () => {
                expect.hasAssertions();

                const visitor = new TestVisitor();
                visitor.visit(ast(caseDef.code));

                const expected = Object.entries(JSON.parse(caseDef.result!));
                expect(visitor.visited).toEqual(new Map(expected));
            });
        }
    });

    describe('ast examples', () => {
        for (let caseDef of loadAstCases('examples.yml')) {
            test(`Generated ast example: ${caseDef.case}`, () => {
                expect.hasAssertions();

                const tree = ast(caseDef.code);

                expect(tree).toBeInstanceOf(Program);
                expect(tree).toMatchSnapshot();
            });
        }
    });
});
