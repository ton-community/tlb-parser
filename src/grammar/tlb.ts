const grammar = String.raw`
TLB {
  // See:
  // https://github.com/andreypfau/TL-B-docs

  // Root definition
  Program = SourceElement*

  // Utilities
  // Override Ohm's built-in definition of space.
  space := whitespace | lineTerminator | comment

  whitespace =
    | "\t"
    | "\x0B"    -- verticalTab
    | "\x0C"    -- formFeed
    | " "
    | "\u00A0"  -- noBreakSpace
    | "\uFEFF"  -- byteOrderMark
    | "\u2000".."\u200B"
    | "\u3000"

  sourceCharacter = any
  lineTerminator = "\n" | "\r" | "\u2028" | "\u2029"

  // Comments
  comment = multiLineComment | singleLineComment
  multiLineComment = "/*" (~"*/" sourceCharacter)* "*/"
  singleLineComment = "//" (~lineTerminator sourceCharacter)*

  // Data types
  binaryDigit = "0" | "1"
  decimalDigit = "0".."9"
  hex = hexChar*
  hexChar = decimalDigit | letter

  // Identifiers
  identifier = identifierStart identifierPart*
  identifierStart = "_" | letter
  identifierPart = identifierStart | digit

  // Primitives
  number = digit+

  // Builtins
  binary_builtins = "#<=" | "#<" | "##"
  unary_builtins = "#"
  field_builtins = "#" | "Type"

  // ----------
  // Base rules
  // ----------
  SourceElement = Declaration | comment
  Declaration = Constructor Fields "=" Combinator ";"

  // Constructors
  // ~~~~~~~~~~~~
  Constructor = ConstructorName
  ConstructorName = ("_" | identifier) ConstructorTag?
  ConstructorTag =
  	| "$" ("_" | binaryDigit+)  -- binary
    | "#" ("_" | hex)           -- hex

  // Fields
  // ~~~~~~
  Fields = FieldDefinition*
  FieldDefinition =
    | FieldBuiltinDef
    | FieldCurlyExprDef
    | FieldAnonymousDef
    | FieldNamedDef
    | FieldExprDef

  FieldBuiltinDef = "{" identifier ":" field_builtins "}"
  FieldCurlyExprDef = "{" CurlyExpression "}"

  // Technically, it is used here, because '_:^[ max_limit:int64 ]' is a thing.
  // It is not just a regular Field definition. Can be joined with 'CellRef'?
  FieldAnonymousDef = "^"? "[" Fields "]"
  FieldNamedDef = identifier ":" (FieldAnonymousDef | FieldExprDef)
  FieldExprDef = CondExpr

  // Combinators
  // ~~~~~~~~~~~
  Combinator = identifier SimpleExpr*

  // Expressions
  // ~~~~~~~~~~~

  // First come the complex rules we only use to define fields.
  // The line between fields definition and expressions is blury at this point.
  CurlyExpression = CompareExpr
  CondExpr =
    | CondDotAndQuestionExpr
    | CondQuestionExpr
    | TypeExpr

  CondDotted = TypeExpr "." number
  CondDotAndQuestionExpr = ( CondDotted | Parens<CondDotted> ) "?" TypeExpr
  CondQuestionExpr = TypeExpr "?" TypeExpr

  // Generic rule to allow parens around some expressions:
  Parens<expr> = "(" expr ")"

  // Compares:
  CompareExpr =
    | MathExpr "<=" MathExpr  -- lte
    | MathExpr ">=" MathExpr  -- gte
    | MathExpr "!=" MathExpr  -- ne
    | MathExpr "=" MathExpr   -- eq
    | MathExpr "<" MathExpr   -- lt
    | MathExpr ">" MathExpr   -- gt
    | Parens<CompareExpr>     -- parens
    | MathExpr                -- noop

  // Base rule for field defining expressions:
  TypeExpr =
    | CellRefExpr
    | BuiltinExpr
    | CombinatorExpr
    | SimpleExpr
    | Parens<TypeExpr>

  // Math:
  MathExpr = MulExpr ("+" MulExpr)*
  MulExpr = SimpleExpr ("*" SimpleExpr)*

  // TypeExpr's items:
  CellRefExpr = "^" ( CellRefInner | Parens<CellRefInner> )
  CellRefInner = CombinatorExpr | identifier

  BuiltinExpr = BuiltinBinary | BuiltinUnary
  // This needs extra 'Parens' because of '(##)' expr:
  BuiltinBinary = "(" ( binary_builtins | Parens<binary_builtins> ) RefExpr ")"
  BuiltinUnary = unary_builtins

  // It is different from 'Combinator' only in the quantity part:
  // we always need at least one argument here and it can be complex.
  CombinatorExpr = "(" identifier TypeExpr+ ")"

  SimpleExpr =
    | NegateExpr
    | MathExpr
    | RefExpr
    | Parens<SimpleExpr>

  NegateExpr = "~" SimpleExpr
  RefExpr = identifier | number
}
`

export default grammar
