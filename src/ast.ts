export abstract class ASTRootBase {
  // If the `parent` field is `null` it means that we've reached the root node.
  // only `Program` has `parent` as null.
  // All other nodes have valid node parents.
  // We define `parent` while building the tree
  // in the intermediate represtantation.
  readonly parent!: ASTBase | null
}

export abstract class ASTBase extends ASTRootBase {
  // TODO: set parents
  override readonly parent!: ASTBase
}

export class Program extends ASTRootBase {
  override readonly parent: null = null

  constructor(
    readonly declarations: Declaration[],
  ) {
    super()
  }
}

export class Declaration extends ASTBase {
  constructor(
    readonly contructor: Constructor,
    readonly fields: FieldDefinition[],
    readonly combinator: Combinator,
  ) {
    super()
  }
}

export class Constructor extends ASTBase {
  constructor(
    readonly name: string,
    readonly tag: string | null,
  ) {
    super()
  }

  getTagType(): 'binary' | 'hex' | null {
    if (this.tag === null) {
      return null
    }
    return this.tag.startsWith('$') ? 'binary' : 'hex'
  }
}

// Fields
// ------

export type FieldDefinition =
  | FieldBuiltinDef
  | FieldImplicitDef
  | FieldAnonymousDef
  | FieldNamedDef
  | FieldExprDef

export abstract class Field extends ASTBase {}

export const FieldBuiltinType = ['+', 'Type'] as const

export class FieldBuiltinDef extends Field {
  constructor(
    readonly name: string,
    readonly type: typeof FieldBuiltinType[number],
  ) {
    super()
  }
}

export class FieldImplicitDef extends Field {
  constructor(
    readonly expr: Expression,
  ) {
    super()
  }
}

export class FieldAnonymousDef extends Field {}

export class FieldNamedDef extends Field {
  constructor(
    readonly name: string,
    readonly expr: FieldAnonymousDef | FieldExprDef,
  ) {
    super()
  }
}

export class FieldExprDef extends Field {
  constructor(
    readonly expr: CondExpr,
  ) {
    super()
  }
}

// Combinators
// -----------

export class Combinator extends ASTBase {
  constructor(
    readonly name: string,
    readonly exprs: TypeExpr[],
  ) {
    super()
  }
}

// Expressions
// -----------

export abstract class Expression extends ASTBase {}

export const CompOperator = ['<=', '>=', '!=', '=', '<', '>'] as const

export class CompareExpr extends Expression {
  // TODO: narrower type for `left` and `right`?
  constructor(
    readonly left: Expression,
    readonly op: typeof CompOperator[number],
    readonly right: Expression,
  ) {
    super()
  }
}

export const MathOperator = ['*', '+'] as const

export class MathExpr extends Expression {
  // TODO: narrower type for `left` and `right`?
  constructor(
    readonly left: Expression,
    readonly op: typeof MathOperator[number],
    readonly right: Expression,
  ) {
    super()
  }
}

export class CondExpr extends Expression {
  constructor(
    readonly left: TypeExpr,
    readonly dotExpr: TypeExpr | null,
    readonly condExpr: TypeExpr | null,
  ) {
    super()
  }
}

export class TypeExpr extends Expression {}

export class CellRefExpr extends Expression {
  constructor(
    readonly expr: Expression,
  ) {
    super()
  }
}

export class NegateExpr extends Expression {
  constructor(
    readonly expr: Expression,
  ) {
    super()
  }
}

export class NameExpr extends Expression {
  constructor(
    readonly name: string,
  ) {
    super()
  }
}

export class NumberExpr extends Expression {
  constructor(
    readonly num: number,
  ) {
    super()
  }
}
