import { ASTBase, Program } from './nodes';
import { walk, iterChildNodes } from './visit';

export function withParents(tree: Program): Program {
    for (let parent of walk(tree)) {
        for (let child of iterChildNodes(parent)) {
            if (parent) {
                child.parent = parent as ASTBase;
            } else {
                child.parent = parent;
            }
        }
    }

    return tree;
}
