import fs from 'fs';
import path from 'path';

import { ast } from '../../src';
import * as nodes from '../../src/ast/nodes';
import { NodeVisitor, walk } from '../../src/ast/visit';
import { loadYamlCases } from '../loaders/yaml';

const fixturesDir = path.resolve(__dirname, '..', 'fixtures');

class TestVisitor extends NodeVisitor {
    public visited: Map<string, number>;

    constructor() {
        super();
        this.visited = new Map();
    }

    override genericVisit(node: nodes.ASTRootBase): void {
        this.visited.set(node.constructor.name, (this.visited.get(node.constructor.name) || 0) + 1);
        return super.genericVisit(node);
    }
}

describe('NodeVisitor', () => {
    test('block.tlb can be visited', () => {
        expect.hasAssertions();

        const blockInput = fs.readFileSync(path.resolve(fixturesDir, 'tlb', 'block.tlb'), 'utf-8');
        const tree = ast(blockInput);
        expect(tree).toBeInstanceOf(nodes.Program);

        const visitor = new TestVisitor();
        visitor.visit(tree);

        expect(visitor.visited).not.toEqual(new Map());
    });

    for (let caseDef of loadYamlCases(fixturesDir, 'ast', 'visit.yml')) {
        test(`Generated visit example: ${caseDef.case}`, () => {
            expect.hasAssertions();

            const visitor = new TestVisitor();
            visitor.visit(ast(caseDef.code));

            const expected = Object.entries(JSON.parse(caseDef.result!));
            expect(visitor.visited).toEqual(new Map(expected));
        });
    }
});

describe('walk parents', () => {
    test('block.tlb can be visited', () => {
        expect.hasAssertions();

        const blockInput = fs.readFileSync(path.resolve(fixturesDir, 'tlb', 'block.tlb'), 'utf-8');
        const tree = ast(blockInput);
        expect(tree).toBeInstanceOf(nodes.Program);

        for (let node of walk(tree)) {
            if (node instanceof nodes.Program) {
                expect(node.parent).toBe(null);
            } else {
                expect(node).toBeInstanceOf(nodes.ASTBase);
                expect(node.parent).toBeInstanceOf(nodes.ASTRootBase);
            }
        }
    });
});
