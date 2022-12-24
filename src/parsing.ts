import type { Node, TerminalNode, IterationNode } from 'ohm-js'

import * as ast from './ast/nodes'
import { withLocations } from './ast/locations'

export const rootNodes = {
  Program(node: IterationNode): any {
    return withLocations(
      new ast.Program(
        node.children.map((child: Node) => child['root']()),
      ),
      node,
    )
  },

  SourceElement(node: Node): any {
    return withLocations(
      new ast.Declaration(
        node.child(0)['Constructor'](),
        node.child(1)['Field'](),
        node.child(3)['Combinator'](),
      ),
      node,
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

    return withLocations(
      new ast.Constructor(nameValue, tagValue),
      name,
    )
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
    lpar: TerminalNode,
    name: Node,
    _sep: TerminalNode,
    type: Node,
    _rpar: TerminalNode,
  ): any {
    // TODO: validate `type.sourceString` to be in allowed values.
    return withLocations(
      new ast.FieldBuiltinDef(
        name.sourceString,
        type.sourceString as any,
      ),
      lpar,
    )
  },

  FieldCurlyExprDef(
    lpar: TerminalNode,
    expr: Node,
    _rpar: TerminalNode,
  ): any {
    return withLocations(
      new ast.FieldCurlyExprDef(expr['expr']()),
      lpar,
    )
  },

  FieldAnonymousDef(node: Node): any {
    const {name, isRef, fields} = node['Field']()
    return withLocations(
      new ast.FieldAnonymousDef(name, isRef, fields),
      node,
    )
  },

  FieldNamedDef(name: Node, _sep: TerminalNode, expr: Node): any {
    return withLocations(
      new ast.FieldNamedDef(name.sourceString, expr['expr']()),
      name,
    )
  },

  FieldExprDef(node: Node): any {
    return withLocations(
      new ast.FieldExprDef(node['expr']()),
      node,
    )
  },

  // Helpers to parse complex anonymous fields:
  // TODO: move out of this semantics
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
    return withLocations(
      new ast.Combinator(
        name.sourceString,
        exprs.children.map((typeExpr: Node) => typeExpr['expr']()),
      ),
      name,
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
    return withLocations(
      new ast.CompareExpr(
        left['expr'](),
        op.sourceString as any,
        right['expr'](),
      ),
      op,
    )
  },

  // Conditional types

  CondExpr(expr: Node): any {
    const { leftExpr, dotExpr, condExpr } = expr['expr']()
    if (dotExpr === undefined && condExpr === undefined) {
      return leftExpr
    }

    return withLocations(
      new ast.CondExpr(leftExpr, dotExpr, condExpr),
      expr,
    )
  },

  // TODO: move out of this semantics
  CondDotAndQuestionExpr(
    dotNode: Node,
    _sep: TerminalNode,
    condNode: Node,
  ): any {

    return {
      ...dotNode['expr'](),
      'condExpr': condNode['expr'](),
    }
  },

  CondQuestionExpr(left: Node, _sep: TerminalNode, condNode: Node): any {
    return {
      'leftExpr': left['expr'](),
      'dotExpr': null,
      'condExpr': condNode['expr'](),
    }
  },

  CondTypeExpr(node: Node): any {
    return {
      'leftExpr': node['expr'](),
    }
  },

  CondDotted(left: Node, _sep: TerminalNode, number: Node): any {
    return {
      'leftExpr': left['expr'](),
      'dotExpr': new Number(number.sourceString),
    }
  },

  // TypeExpr

  CombinatorExpr(
    lpar: TerminalNode,
    name: Node,
    args: IterationNode,
    _rpar: Node,
  ): any {
    return withLocations(
      new ast.CombinatorExpr(
        name.sourceString,
        args.children.map((arg: Node) => arg['expr']()),
      ),
      lpar,
    )
  },

  CellRefExpr(ref: TerminalNode, node: Node): any {
    return withLocations(
      new ast.CellRefExpr(node['expr']()),
      ref,
    )
  },

  BuiltinExpr(node: Node): any {
    return withLocations(node['expr'](), node)
  },

  NegateExpr(op: TerminalNode, node: Node): any {
    return withLocations(new ast.NegateExpr(node['expr']()), op)
  },

  // Builtins

  BuiltinOneArg(
    lpar: TerminalNode,
    expr: Node,
    arg: Node,
    _rpar: TerminalNode,
  ): any {
    // TODO: validate `expr` to be in allowed set of operators
    return withLocations(
      new ast.BuiltinOneArgExpr(
        expr.sourceString as any,
        arg['expr'](),
      ),
      lpar,
    )
  },

  BuiltinZeroArgs(expr: Node): any {
    // TODO: validate `expr` to be in allowed set of operators
    return withLocations(
      new ast.BuiltinZeroArgs(expr.sourceString as any),
      expr,
    )
  },

  // Base rules

  identifier(start: Node, rest: IterationNode): any {
    return withLocations(
      new ast.NameExpr(start.sourceString + rest.sourceString),
      start,
    )
  },

  number(node: TerminalNode): any {
    return withLocations(
      new ast.NumberExpr(parseInt(node.sourceString)),
      node,
    )
  },

  // Helpers

  Parens(lpar: TerminalNode, node: Node, _rpar: TerminalNode): any {
    // Just drop `()` around an expression, it should be fine
    return withLocations(node['expr'](), lpar)
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
    return withLocations(leftExpr, left)
  }

  // We always use the left part for all the math expressions,
  // it should be fine for now.
  let expr = withLocations(
    new ast.MathExpr(leftExpr, opsSigns[0] as any, rightExprs[0]),
    left,
  )
  for (let index = 1; index < opsSigns.length; index++) {
    expr = withLocations(
      new ast.MathExpr(
        expr,
        opsSigns[index] as any, // validated earlier
        rightExprs[index],
      ),
      left,
    )
  }

  return expr
}
