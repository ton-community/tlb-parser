import type { Grammar, MatchResult } from 'ohm-js';

import type { Program } from './ast/nodes';
import { buildGrammar, buildAST } from './intermediate';
import { validate } from './validation';
import { NodesCounter } from './ast/NodesCounter';
import { ASTRootBase } from './ast/nodes';

export function parse(input: string, grammar: Grammar | undefined = undefined): MatchResult {
    if (grammar === undefined) {
        grammar = buildGrammar();
    }

    return grammar.match(input);
}

export function ast(input: string): Program {
    const program = buildAST(input, buildGrammar());
    validate(program);
    return program;
}

export function counterASTNodes(tree: ASTRootBase): NodesCounter {
    const visitor = new NodesCounter();
    visitor.visit(tree);
    return visitor;
}
