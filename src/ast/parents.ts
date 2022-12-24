import type { Program } from './nodes'

import { walk, iterChildNodes } from './visit'

export function withParents(tree: Program): Program {
  for (let parent of walk(tree)) {
    for (let child of iterChildNodes(parent)) {
      // We only set it here, so ignore
      // @ts-ignore
      child.parent = parent
    }
  }

  return tree
}
