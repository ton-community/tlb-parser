import type { Grammar, MatchResult } from 'ohm-js';

import type { Program } from './ast/nodes';
import { buildGrammar, buildAST } from './intermediate';
import { validate } from './validation';

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
