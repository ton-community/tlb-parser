import { NodeVisitor } from './visit';
import { ASTRootBase } from './nodes';

export class NodesCounter extends NodeVisitor {
    public nodes: { [key: string]: number };

    constructor() {
        super();
        this.nodes = {};
    }

    override genericVisit(node: ASTRootBase): void {
        const key = node.constructor.name;
        this.nodes[key] = (this.nodes[key] ?? 0) + 1;
        return super.genericVisit(node);
    }

    get total(): number {
        return Object.values(this.nodes).reduce((acc, cnt) => acc + cnt, 0);
    }
}
