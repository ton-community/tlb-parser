import type { Node, TerminalNode, IterationNode } from 'ohm-js'

import * as ast from './ast'

export const rootNodes = {
  Program(node: IterationNode): any {
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
  Constructor(name: TerminalNode, tag: Node): any {
    const nameValue = name.sourceString
    let tagValue = null;

    if (tag.numChildren !== 0) {
      tagValue = tag.child(0)['Constructor']()
    }

    return new ast.Constructor(nameValue, tagValue)
  },

  ConstructorTag(node: Node): any {
    // This is a string-only node:
    return node.sourceString
  },
}

export const fieldNodes = {
  Fields(node: IterationNode): any {
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

  FieldCurlyExprDef(
    _lpar: TerminalNode,
    expr: Node,
    _rpar: TerminalNode,
  ): any {
    return new ast.FieldCurlyExprDef(expr['expr']())
  },

  FieldAnonymousDef(node: Node): any {
    const {name, isRef, fields} = node['Field']()
    return new ast.FieldAnonymousDef(name, isRef, fields)
  },

  FieldNamedDef(name: Node, _sep: TerminalNode, expr: Node): any {
    return new ast.FieldNamedDef(name.sourceString, expr['expr']())
  },

  FieldExprDef(node: Node): any {
    return new ast.FieldExprDef(node['expr']())
  },

  // Helpers to parse complex anonymous fields:
  FieldAnonRef(
    ref: TerminalNode,
    _lpar: TerminalNode,
    fields: IterationNode,
    _rpar: TerminalNode,
  ) {
    return {
      'name': null,
      'isRef': ref.numChildren !== 0,
      'fields': fields.children.map((field: Node) => field['Field']()),
    }
  },

  FieldNamedAnonRef(name: Node, _sep: TerminalNode, fields: Node) {
    return {
      ...fields['Field'](),
      'name': name.sourceString,
    }
  },
}

export const combinatorNodes = {
  Combinator(name: Node, exprs: IterationNode): any {
    return new ast.Combinator(
      name.sourceString,
      exprs.children.map((typeExpr: Node) => typeExpr['expr']()),
    )
  },
}

export const exprNodes = {
  // Math

  MathExpr(left: Node, ops: IterationNode, rights: IterationNode): any {
    return parseMath(left, ops, rights)
  },

  MulExpr(left: Node, ops: IterationNode, rights: IterationNode): any {
    return parseMath(left, ops, rights)
  },

  CompareExpr(node: Node): any {
    return node['expr']()
  },

  CompareOperatorExpr(left: Node, op: TerminalNode, right: Node): any {
    return new ast.CompareExpr(
      left['expr'](),
      op.sourceString as any,
      right['expr'](),
    )
  },

  // Conditional types

  CondExpr(expr: Node): any {
    const {leftExpr, dotExpr, condExpr} = expr['expr']()
    if (dotExpr === undefined && condExpr === undefined) {
      return leftExpr
    }

    return new ast.CondExpr(leftExpr, dotExpr, condExpr)
  },

  CondDotAndQuestionExpr(
    dotNode: Node,
    _sep: TerminalNode,
    condNode: Node,
  ): any {

    const x = {
      ...dotNode['expr'](),
      'condExpr': condNode['expr'](),
    }
    console.log(x)
    return x
  },

  CondQuestionExpr(left: Node, _sep: TerminalNode, condNode: Node): any {
    return {
      'leftExpr': left['expr'](),
      'dotExpr': null,
      'condExpr': condNode['expr'](),
    }
  },

  CondTypeExpr(node: Node): any {
    return {'leftExpr': node['expr']()}
  },

  CondDotted(left: Node, _sep: TerminalNode, number: Node): any {
    return {
      'leftExpr': left['expr'](),
      'dotExpr': new Number(number.sourceString),
    }
  },

  // TypeExpr

  CombinatorExpr(
    _lpar: TerminalNode,
    name: Node,
    args: IterationNode,
    _rpar: Node,
  ): any {
    return new ast.CombinatorExpr(
      name.sourceString,
      args.children.map((arg: Node) => arg['expr']()),
    )
  },

  CellRefExpr(_ref: TerminalNode, node: Node): any {
    return new ast.CellRefExpr(node['expr']())
  },

  BuiltinExpr(node: Node): any {
    return node['expr']()
  },

  NegateExpr(_term: TerminalNode, node: Node): any {
    return new ast.NegateExpr(node['expr']())
  },

  // Builtins

  BuiltinOneArg(
    _lpar: TerminalNode,
    expr: Node,
    arg: Node,
    _rpar: TerminalNode,
  ): any {
    // TODO: validate `expr` to be in allowed set of operators
    return new ast.BuiltinOneArgExpr(
      expr.sourceString as any,
      arg['expr'](),
    )
  },

  BuiltinZeroArgs(expr: Node): any {
    // TODO: validate `expr` to be in allowed set of operators
    return new ast.BuiltinZeroArgs(expr.sourceString as any)
  },

  // Base rules

  identifier(start: Node, rest: IterationNode): any {
    return new ast.NameExpr(start.sourceString + rest.sourceString)
  },

  number(node: TerminalNode): any {
    return new ast.NumberExpr(parseInt(node.sourceString))
  },

  // Helpers

  Parens(_lpar: TerminalNode, node: Node, _rpar: TerminalNode): any {
    // Just drop `()` around an expression, it should be fine
    return node['expr']()
  },
}

function parseMath(
  left: Node,
  ops: IterationNode,
  rights: IterationNode,
): ast.Expression {
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
