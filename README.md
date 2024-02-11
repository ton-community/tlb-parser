# tlb-parser

## Installation

```bash
npm install @toncommunity/tlb-parser
```

## Usage

```typescript
import { parse } from "@toncommunity/tlb-parser"

const scheme = `
t$_ x:# y:(uint 5) = A;
`

const ast = parse(scheme)

console.log(ast)
```

## Related

- IntelliJ plugin: https://github.com/ton-blockchain/intellij-ton
