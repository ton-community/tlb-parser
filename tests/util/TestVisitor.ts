import { NodeVisitor } from '../../src';
import * as nodes from '../../src/ast/nodes';

export class TestVisitor extends NodeVisitor {
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
