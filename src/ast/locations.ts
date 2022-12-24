import type { Node } from 'ohm-js'

import * as ast from '../ast/nodes'

export function withLocations<T extends ast.ASTRootBase>(
  astNode: T,
  intermediateNode: Node,
): T {
  // It exists, but is not listed in TS definitions.
  // @ts-ignore
  const lineAndColumn = intermediateNode.source.getLineAndColumn()

  // This is the only place where we set it, ignore the type error
  // @ts-ignore
  astNode.locations = {
    'line': lineAndColumn.lineNum,
    'column': lineAndColumn.colNum,
  }
  return astNode
}
