import type { Node, TerminalNode } from 'ohm-js'

import * as ast from './ast'

export const rootNodes = {
  Program(node: Node): any {
    return new ast.Program(
      node.children.map((child: Node) => child['root']()),
    )
  },

  SourceElement(node: Node): any {
    return new ast.Declaration(
      node.child(0)['Constructor'](),
      node.child(1)['Field'](),
      node.child(3)['Combinator'](),
    )
  },
}

export const constructorNodes = {
  Constructor(node: Node): any {
    return new ast.Constructor(
      node.child(0).sourceString,
      node.child(1).child(0)['Constructor'](),
    )
  },

  ConstructorTag(node: Node): any {
    // This is a string-only node:
    return node.sourceString
  },
}

export const fieldNodes = {
  Fields(node: Node): any {
    return node.children.map((child: Node) => child['Field']())
  },

  FieldDefinition(node: Node): any {
    return node['Field']() // just a wrapper node, unwrapping
  },

  FieldBuiltinDef(
    _lpar: TerminalNode,
    name: Node,
    _sep: TerminalNode,
    type: Node,
    _rpar: TerminalNode,
  ): any {
    // TODO: validate `type.sourceString` to be in allowed values.
    return new ast.FieldBuiltinDef(
      name.sourceString,
      type.sourceString as any,
    )
  },

  FieldImplicitDef(
    _lpar: TerminalNode,
    field: Node,
    _rpar: TerminalNode,
  ): any {
    return new ast.FieldImplicitDef(field['Field']())
  },

  FieldNamedDef(name: Node, _sep: TerminalNode, expr: Node): any {
    return new ast.FieldNamedDef(name.sourceString, expr['Field']())
  },

  FieldExprDef(node: Node): any {
    return new ast.FieldExprDef(node['expr']())
  },
}

export const combinatorNodes = {
  Combinator(name: Node, exprs: Node): any {
    return new ast.Combinator(
      name.sourceString,
      exprs.children.map((typeExpr: Node) => typeExpr['expr']()),
    )
  },
}

export const exprNodes = {
  MathExpr(left: Node, ops: Node, rights: Node): any {
    return parseMath(left, ops, rights)
  },

  MulExpr(left: Node, ops: Node, rights: Node): any {
    return parseMath(left, ops, rights)
  },

  PrimitiveExpr(node: Node): any {
    // Just unwrap it, temp rule:
    console.log(node)
    return node['expr']()
  },

  CondExpr(
    left: Node,
    _dot: TerminalNode,
    dotExpr: Node,
    _cond: TerminalNode,
    condExpr: Node,
  ): any {
    const leftExpr = left['expr']()
    if (dotExpr.numChildren === 0 && condExpr.numChildren === 0) {
      // This is not a `CondExpr`, passing through.
      return leftExpr
    }

    return new ast.CondExpr(
      leftExpr,
      dotExpr.numChildren === 0 ? dotExpr['expr']() : null,
      condExpr.numChildren === 0 ? condExpr['expr']() : null,
    )
  },

  CellRefExpr(_ref: TerminalNode, node: Node): any {
    return new ast.CellRefExpr(node['expr']())
  },

  NegateExpr(_term: TerminalNode, node: Node): any {
    return new ast.NegateExpr(node['expr']())
  },

  ParenExpr(_lpar: TerminalNode, node: Node, _rpar: TerminalNode): any {
    // Just drop `()` around an expression, it should be fine
    console.log(node, node['expr']())
    return node['expr']()
  },

  RefExpr(node: Node): any {
    const number = parseInt(node.sourceString)
    if (!isNaN(number)) {
      return new ast.NumberExpr(number)
    }
    return new ast.NameExpr(node.sourceString)
  },
}

function parseMath(left: Node, ops: Node, rights: Node): ast.Expression {
  const leftExpr = left['expr']()

  const opsSigns = []
  for (let child of ops.children) {
    // TODO: validate op is in ast.MathOperators
    opsSigns.push(child.sourceString)
  }

  const rightExprs = []
  for (let child of rights.children) {
    const rightExpr = child['expr']()
    if (rightExpr !== undefined) {
      rightExprs.push(rightExpr)
    }
  }

  if (opsSigns.length !== rightExprs.length) {
    throw new Error('Invalid math operation') // should not happen
  }

  if (opsSigns.length === 0) {
    // This is not a math expr, just the left part
    return leftExpr
  }

  let expr = new ast.MathExpr(leftExpr, opsSigns[0] as any, rightExprs[0])
  for (let index = 1; index < opsSigns.length; index++) {
    expr = new ast.MathExpr(
      expr,
      opsSigns[index] as any, // validated earlier
      rightExprs[index],
    )
  }

  return expr
}
