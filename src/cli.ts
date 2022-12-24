// Only used for tests now, CLI will be awailable later
// TODO: build normal CLI

import fs from 'fs'
import util from 'util'

import { ast } from './index'

const input = fs.readFileSync(
  process.argv[2] as string,
  'utf-8',
)

import { NodeVisitor } from './ast/visit'
import * as nodes from './ast/nodes'
class TestVisitor extends NodeVisitor {
  public visited: {[key: string]: number}

  constructor() {
    super()
    this.visited = {}
  }

  override genericVisit(node: nodes.ASTRootBase): void {
    if (this.visited[node.constructor.name] === undefined) {
      this.visited[node.constructor.name] = 0
    }

    this.visited[node.constructor.name] += 1
    return super.genericVisit(node)
  }
}

const tree = ast(input)
const visitor = new TestVisitor()
visitor.visit(tree)
console.log(JSON.stringify(visitor.visited, null, 2))

console.log(
  util.inspect(
    tree,
    { showHidden: false, depth: null, colors: true },
  ),
)
