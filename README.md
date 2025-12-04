# tlb-parser

[![npm @ton-community/tlb-parser version](https://img.shields.io/npm/v/@ton-community/tlb-parser)](https://www.npmjs.com/package/@ton-community/tlb-parser)
[![qa](https://github.com/ton-community/tlb-parser/actions/workflows/qa.yml/badge.svg)](https://github.com/ton-community/tlb-parser/actions/workflows/qa.yml)

## Installation

```bash
npm install @ton-community/tlb-parser
```

## Usage

Create a file with TLB scheme according to the [documentation](https://docs.ton.org/develop/data-formats/tl-b-language). This is an example of such a file (call it `example.tlb`):
```
t$_ x:# y:(uint 5) = A;
```

Then do:
```bash
npx tlb-parser example.tlb
```

Or you can use the tool from inside JS or TS code.

```typescript
import { ast, NodeVisitor, ASTRootBase } from "@ton-community/tlb-parser";

class TestVisitor extends NodeVisitor {
  public visited: { [key: string]: number };

  constructor() {
    super();
    this.visited = {};
  }

  override genericVisit(node: nodes.ASTRootBase): void {
    if (this.visited[node.constructor.name] === undefined) {
      this.visited[node.constructor.name] = 0;
    }

    this.visited[node.constructor.name] += 1;
    return super.genericVisit(node);
  }
}

const scheme = `
t$_ x:# y:(uint 5) = A;
`;

const tree = ast(scheme);
const visitor = new TestVisitor();
visitor.visit(tree);

console.log(
  util.inspect(
    visitor.visited,
    {showHidden: false, depth: null, colors: true},
  ),
);

console.log(
  util.inspect(
    tree,
    {showHidden: false, depth: null, colors: true},
  ),
);
```

## Related

- IntelliJ plugin: https://github.com/ton-blockchain/intellij-ton
