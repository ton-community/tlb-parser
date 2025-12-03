import type { Node, TerminalNode, IterationNode } from 'ohm-js';

import * as ast from './ast/nodes';
import { withLocations } from './ast/locations';

export const rootNodes = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Program(node: IterationNode): any {
        return withLocations(new ast.Program(node.children.map((child: Node) => child['root']())), node);
    },

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    SourceElement(node: Node): any {
        return withLocations(
            new ast.Declaration(
                node.child(0)['Constructor'](),
                node.child(1)['Field'](),
                node.child(3)['Combinator'](),
            ),
            node,
        );
    },
};

export const constructorNodes = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Constructor(name: TerminalNode, tag: Node): any {
        const nameValue = name.sourceString;
        let tagValue = null;

        if (tag.numChildren !== 0) {
            tagValue = tag.child(0)['Constructor']();
        }

        return withLocations(new ast.Constructor(nameValue, tagValue), name);
    },

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ConstructorTag(node: Node): any {
        // This is a string-only node:
        return node.sourceString;
    },
};

export const fieldNodes = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Fields(node: IterationNode): any {
        return node.children.map((child: Node) => child['Field']());
    },

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    FieldDefinition(node: Node): any {
        return node['Field'](); // just a wrapper node, unwrapping
    },

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    FieldBuiltinDef(lpar: TerminalNode, name: Node, _sep: TerminalNode, type: Node, _rpar: TerminalNode): any {
        // TODO: validate `type.sourceString` to be in allowed values.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return withLocations(new ast.FieldBuiltinDef(name.sourceString, type.sourceString as any), lpar);
    },

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    FieldCurlyExprDef(lpar: TerminalNode, expr: Node, _rpar: TerminalNode): any {
        return withLocations(new ast.FieldCurlyExprDef(expr['expr']()), lpar);
    },

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    FieldAnonymousDef(node: Node): any {
        const { name, isRef, fields } = node['Field']();
        return withLocations(new ast.FieldAnonymousDef(name, isRef, fields), node);
    },

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    FieldNamedDef(name: Node, _sep: TerminalNode, expr: Node): any {
        return withLocations(new ast.FieldNamedDef(name.sourceString, expr['expr']()), name);
    },

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    FieldExprDef(node: Node): any {
        return withLocations(new ast.FieldExprDef(node['expr']()), node);
    },

    // Helpers to parse complex anonymous fields:
    // TODO: move out of this semantics
    FieldAnonRef(ref: TerminalNode, _lpar: TerminalNode, fields: IterationNode, _rpar: TerminalNode) {
        return {
            name: null,
            isRef: ref.numChildren !== 0,
            fields: fields.children.map((field: Node) => field['Field']()),
        };
    },

    FieldNamedAnonRef(name: Node, _sep: TerminalNode, fields: Node) {
        return {
            ...fields['Field'](),
            name: name.sourceString,
        };
    },
};

export const combinatorNodes = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Combinator(name: Node, exprs: IterationNode): any {
        return withLocations(
            new ast.Combinator(
                name.sourceString,
                exprs.children.map((typeExpr: Node) => typeExpr['expr']()),
            ),
            name,
        );
    },
};

export const exprNodes = {
    // Math

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    MathExpr(left: Node, ops: IterationNode, rights: IterationNode): any {
        return parseMath(left, ops, rights);
    },

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    MulExpr(left: Node, ops: IterationNode, rights: IterationNode): any {
        return parseMath(left, ops, rights);
    },

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    CompareExpr(node: Node): any {
        return node['expr']();
    },

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    CompareOperatorExpr(left: Node, op: TerminalNode, right: Node): any {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return withLocations(new ast.CompareExpr(left['expr'](), op.sourceString as any, right['expr']()), op);
    },

    // Conditional types

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    CondExpr(expr: Node): any {
        const { leftExpr, dotExpr, condExpr } = expr['expr']();
        if (dotExpr === undefined && condExpr === undefined) {
            return leftExpr;
        }

        return withLocations(new ast.CondExpr(leftExpr, dotExpr, condExpr), expr);
    },

    // TODO: move out of this semantics
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    CondDotAndQuestionExpr(dotNode: Node, _sep: TerminalNode, condNode: Node): any {
        return {
            ...dotNode['expr'](),
            condExpr: condNode['expr'](),
        };
    },

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    CondQuestionExpr(left: Node, _sep: TerminalNode, condNode: Node): any {
        return {
            leftExpr: left['expr'](),
            dotExpr: null,
            condExpr: condNode['expr'](),
        };
    },

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    CondTypeExpr(node: Node): any {
        return {
            leftExpr: node['expr'](),
        };
    },

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    CondDotted(left: Node, _sep: TerminalNode, number: Node): any {
        return {
            leftExpr: left['expr'](),
            dotExpr: new Number(number.sourceString),
        };
    },

    // TypeExpr

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    CombinatorExpr(lpar: TerminalNode, name: Node, args: IterationNode, _rpar: Node): any {
        return withLocations(
            new ast.CombinatorExpr(
                name.sourceString,
                args.children.map((arg: Node) => arg['expr']()),
            ),
            lpar,
        );
    },

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    CellRefExpr(ref: TerminalNode, node: Node): any {
        return withLocations(new ast.CellRefExpr(node['expr']()), ref);
    },

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    BuiltinExpr(node: Node): any {
        return withLocations(node['expr'](), node);
    },

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    NegateExpr(op: TerminalNode, node: Node): any {
        return withLocations(new ast.NegateExpr(node['expr']()), op);
    },

    // Builtins

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    BuiltinOneArg(expr: Node, arg: Node): any {
        // TODO: validate `expr` to be in allowed set of operators
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return withLocations(new ast.BuiltinOneArgExpr(expr.sourceString as any, arg['expr']()), expr);
    },

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    BuiltinZeroArgs(expr: Node): any {
        // TODO: validate `expr` to be in allowed set of operators
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return withLocations(new ast.BuiltinZeroArgs(expr.sourceString as any), expr);
    },

    // Base rules

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    identifier(start: Node, rest: IterationNode): any {
        return withLocations(new ast.NameExpr(start.sourceString + rest.sourceString), start);
    },

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    number(node: TerminalNode): any {
        return withLocations(new ast.NumberExpr(parseInt(node.sourceString)), node);
    },

    // Helpers

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Parens(lpar: TerminalNode, node: Node, _rpar: TerminalNode): any {
        // Just drop `()` around an expression, it should be fine
        return withLocations(node['expr'](), lpar);
    },

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    FieldAnonRef(ref: TerminalNode, lpar: TerminalNode, fields: IterationNode, _rpar: TerminalNode): any {
        return withLocations(
            new ast.FieldAnonExpr(
                fields.children.map((field: Node) => field['Field']()),
                ref.numChildren !== 0,
            ),
            lpar,
        );
    },

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    CombinatorArg(node: Node): any {
        return node['expr']();
    },

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    SimpleExprNoMath(node: Node): any {
        return node['expr']();
    },
};

function parseMath(left: Node, ops: IterationNode, rights: IterationNode): ast.Expression {
    const leftExpr = left['expr']();

    const opsSigns = [];
    for (let child of ops.children) {
        // TODO: validate op is in ast.MathOperators
        opsSigns.push(child.sourceString);
    }

    const rightExprs = [];
    for (let child of rights.children) {
        const rightExpr = child['expr']();
        rightExprs.push(rightExpr);
    }

    if (opsSigns.length !== rightExprs.length) {
        throw new Error('Invalid math operation'); // should not happen
    }

    if (opsSigns.length === 0) {
        // This is not a math expr, just the left part
        return withLocations(leftExpr, left);
    }

    // We always use the left part for all the math expressions,
    // it should be fine for now.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let expr = withLocations(new ast.MathExpr(leftExpr, opsSigns[0] as any, rightExprs[0]), left);
    for (let index = 1; index < opsSigns.length; index++) {
        expr = withLocations(
            new ast.MathExpr(
                expr,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                opsSigns[index] as any, // validated earlier
                rightExprs[index],
            ),
            left,
        );
    }

    return expr;
}
