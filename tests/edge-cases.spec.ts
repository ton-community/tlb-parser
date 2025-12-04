import type { IterationNode, Node } from 'ohm-js';

import {
    ast,
    ASTBase,
    ASTRootBase,
    BuiltinOneArgExpr,
    Combinator,
    Constructor,
    Declaration,
    FieldAnonymousDef,
    FieldNamedDef,
    NameExpr,
    NumberExpr,
    parse,
    Program,
    walk,
} from '../src';
import { iterChildNodes } from '../src/ast/visit';
import { withParents } from '../src/ast/parents';
import { exprNodes } from '../src/parsing';
import { isNatField } from '../src/validation';

describe('edge cases', () => {
    test.each([
        ['_ n:(## 2) c:(n * Cell) = X;', null],
        ['_ n:(## 2) c:(n * ^Cell) = X;', null],
        ['_ x:# = X;', null],
        ['test$10 = Test;', 'binary' as const],
        ['test#0a = Test;', 'hex' as const],
        ['test = Test;', null],
        ['_ {n:#} = X (n + 1 + 2);', null],
        ['_ {n:#} l:(## (n * 2 * 4)) = X;', null],
    ])('parse & ast: %s', (schema: string, tagType: 'binary' | 'hex' | null) => {
        expect(parse(schema).succeeded()).toBe(true);
        const tree = ast(schema);
        expect(tree).toBeInstanceOf(Program);
        expect(tree.declarations[0]!.constructorDef.getTagType()).toBe(tagType);
    });

    test('withParents handles all cases', () => {
        const constructor = new Constructor('test', null);
        const combinator = new Combinator('Test', []);
        const decl = new Declaration(constructor, [], combinator);
        const program = new Program([decl]);
        const result = withParents(program);
        expect(result.parent).toBe(null);

        const tree = ast('_ x:# = X;');
        const treeWithParents = withParents(tree);
        expect(treeWithParents.parent).toBe(null);

        for (let node of walk(treeWithParents)) {
            if (node instanceof Program) {
                expect(node.parent).toBe(null);
            } else {
                expect(node).toBeInstanceOf(ASTBase);
                expect(node.parent).not.toBe(undefined);
            }
        }
    });

    test('iterChildNodes handles ASTRootBase attributes', () => {
        class TestNode extends ASTRootBase {
            child: ASTRootBase;
            static override readonly _attributes: string[] = ['child'];
            constructor() {
                super();
                this.child = new Program([]);
            }
        }
        const node = new TestNode();
        const children = Array.from(iterChildNodes(node));
        expect(children).toHaveLength(1);
        expect(children[0]).toBeInstanceOf(Program);
    });

    test('handles missing attributes iterChildNodes', () => {
        class BrokenNode extends ASTRootBase {
            static override readonly _attributes: string[] = ['missing'];
            // 'missing' property is not defined
        }
        const node = new BrokenNode();
        const children = Array.from(iterChildNodes(node));
        expect(children).toEqual([]);
    });

    test('throws on mismatched ops/rights for MathExpr', () => {
        const left = { expr: () => new NumberExpr(1) } as unknown as Node;
        const ops = { children: [{ sourceString: '+' }] } as unknown as IterationNode; // 1 op
        const rights = { children: [] } as unknown as IterationNode; // 0 rights
        expect(() => {
            exprNodes.MathExpr(left, ops, rights);
        }).toThrow('Invalid math operation');
    });

    test('isNatField with FieldNamedDef', () => {
        const field1 = new FieldNamedDef('x', new BuiltinOneArgExpr('##', new NameExpr('y')));
        expect(isNatField(field1)).toBe(true);
        const field2 = new FieldNamedDef('x', new NameExpr('Type'));
        expect(isNatField(field2)).toBe(false);
    });

    test('isNatField returns false for other field types', () => {
        const dummy = new FieldAnonymousDef(null, false, []);
        expect(isNatField(dummy)).toBe(false);
    });
});
