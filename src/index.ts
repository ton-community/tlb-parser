import type { Grammar, MatchResult } from 'ohm-js';

import type { Program } from './ast/nodes';
import { buildGrammar, buildAST } from './intermediate';

export function parse(input: string, grammar: Grammar | undefined = undefined): MatchResult {
    if (grammar === undefined) {
        grammar = buildGrammar();
    }

    return grammar.match(input);
}

export function ast(input: string): Program {
    return buildAST(input, buildGrammar());
}

export { NodeVisitor } from './ast/visit';

export {
    ASTRootBase,
    ASTBase,
    Program,
    Declaration,
    Constructor,
    Field,
    FieldBuiltinDef,
    FieldCurlyExprDef,
    FieldAnonymousDef,
    FieldNamedDef,
    FieldExprDef,
    Combinator,
    Expression,
    CondExpr,
    CompareExpr,
    CellRefExpr,
    BuiltinExpr,
    BuiltinOneArgExpr,
    BuiltinZeroArgs,
    CombinatorExpr,
    MathExpr,
    NegateExpr,
    RefExpr,
    NameExpr,
    NumberExpr,
    FieldDefinition,
    TypeExpr,
    SimpleExpr,
    Reference,
    FieldBuiltinType,
    CompareOperator,
    BuiltinOneArgOperators,
    BuiltinZeroArgsOperators,
    MathOperator,
} from './ast/nodes';
