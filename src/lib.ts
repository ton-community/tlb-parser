import type { Grammar, MatchResult, FailedMatchResult } from 'ohm-js';

import type { Program } from './ast/nodes';
import { buildGrammar, buildAST } from './intermediate';
import { validate } from './validation';
import { NodesCounter } from './ast/NodesCounter';
import { ASTRootBase } from './ast/nodes';

// Backward compatibility wrapper: adds shortMessage property to MatchResult
export interface CompatibleMatchResult extends MatchResult {
    shortMessage: string | undefined;
}

function wrapMatchResult(result: MatchResult): CompatibleMatchResult {
    return new Proxy(result, {
        get(target, prop) {
            if (prop === 'shortMessage') {
                if (target.failed()) {
                    return (target as FailedMatchResult).shortMessage;
                }
                return undefined;
            }
            return Reflect.get(target, prop);
        },
    }) as CompatibleMatchResult;
}

export function parse(input: string, grammar: Grammar | undefined = undefined): CompatibleMatchResult {
    if (grammar === undefined) {
        grammar = buildGrammar();
    }

    return wrapMatchResult(grammar.match(input));
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
