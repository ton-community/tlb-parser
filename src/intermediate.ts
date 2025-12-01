import type { Grammar } from 'ohm-js';
import * as ohm from 'ohm-js';

import type { Program } from './ast/nodes';
import { withParents } from './ast/parents';
import grammar from './grammar/tlb';
import { constructorNodes, combinatorNodes, exprNodes, fieldNodes, rootNodes } from './parsing';

export function buildGrammar(): Grammar {
    return ohm.grammar(grammar);
}

export function buildAST(input: string, grammar: Grammar): Program {
    const semantics = grammar.createSemantics();
    semantics.addOperation('root', rootNodes);
    semantics.addOperation('Constructor', constructorNodes);
    semantics.addOperation('Field', fieldNodes);
    semantics.addOperation('Combinator', combinatorNodes);
    semantics.addOperation('expr', exprNodes);

    const matchResult = grammar.match(input);
    const ast = semantics(matchResult)['root']();
    return withParents(ast);
}
