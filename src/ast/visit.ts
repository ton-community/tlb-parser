import { ASTRootBase } from './nodes';

type AttrMap = Record<string, ASTRootBase | ASTRootBase[] | undefined>;

export function* iterChildNodes(node: ASTRootBase): IterableIterator<ASTRootBase> {
    const item = Object.getPrototypeOf(node).constructor as typeof ASTRootBase & {
        _attributes: string[];
    };

    for (const attributeName of item._attributes) {
        const raw = (node as unknown as AttrMap)[attributeName];

        if (Array.isArray(raw)) {
            for (const child of raw) {
                yield child;
            }
        } else if (raw instanceof ASTRootBase) {
            yield raw;
        }
    }
}

export function* walk(node: ASTRootBase): IterableIterator<ASTRootBase> {
    const todo = [node];
    while (todo.length > 0) {
        const current = todo.shift()!;
        todo.push(...iterChildNodes(current));
        yield current;
    }
}

export class NodeVisitor {
    visit(node: ASTRootBase): unknown {
        const constructorName = node.constructor.name;
        const handlerName = `visit${constructorName}` as keyof this;
        const handler = this[handlerName];

        if (typeof handler === 'function') {
            return (handler as (n: ASTRootBase) => unknown).call(this, node);
        } else {
            return this.genericVisit(node);
        }
    }

    genericVisit(node: ASTRootBase): void {
        for (let attribute of iterChildNodes(node)) {
            this.visit(attribute);
        }
    }
}
