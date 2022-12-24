import { ASTRootBase } from './nodes'

export function* iterChildNodes(
  node: ASTRootBase,
): IterableIterator<ASTRootBase> {
  const type = Object.getPrototypeOf(node).constructor
  for (let attributeName of type._attributes) {
    // @ts-ignore
    const attribute = node[attributeName]

    if (attribute instanceof Array) {
      for (let arrayItem of attribute) {
        if (arrayItem instanceof ASTRootBase) {
          yield arrayItem
        }
      }
    } else if (attribute instanceof ASTRootBase) {
      yield attribute
    }
  }
}

export function* walk(node: ASTRootBase): IterableIterator<ASTRootBase> {
  const todo = [node]
  while (todo.length > 0) {
    const current = todo.shift()!
    todo.push(...iterChildNodes(current))
    yield current
  }
}

export class NodeVisitor {
  visit(node: ASTRootBase): any {
    const name = node.constructor.name
    // @ts-ignore
    const handler = this[`visit${name}`]
    if (handler === undefined) {
      return this.genericVisit(node)
    } else {
      return handler(node)
    }
  }

  genericVisit(node: ASTRootBase): void {
    for (let attribute of iterChildNodes(node)) {
      this.visit(attribute)
    }
  }
}
