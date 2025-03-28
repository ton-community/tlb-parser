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
  hex = hexChar* "_"?
  hexChar = decimalDigit | letter

  // Identifiers
  identifier = identifierStart identifierPart*
  identifierStart = "_" | letter
  identifierPart = identifierStart | digit

  // Primitives
  number = digit+

  // Builtins
  builtins_one_arg = "#<=" | "#<" | "##"
  builtins_zero_args = "#"
  builtins_field = "#" | "Type"


  // ----------
  // Base rules
  // ----------
  SourceElement = Declaration | comment
  Declaration = Constructor Fields "=" Combinator ";"


  // Constructors
  // ~~~~~~~~~~~~
  Constructor = ConstructorStart ConstructorTag?
  ConstructorStart = "!"? ("_" | identifier)
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

  FieldBuiltinDef = "{" identifier ":" builtins_field "}"
  FieldCurlyExprDef = "{" CurlyExpression "}"
  FieldAnonymousDef = FieldAnonRef | FieldNamedAnonRef
  FieldNamedDef = identifier ":" CondExpr
  FieldExprDef = CondExpr

  FieldAnonRef = "^"? "[" FieldDefinition* "]"
  FieldNamedAnonRef = identifier ":" FieldAnonRef


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
    | CondTypeExpr

  CondDotted = TypeExpr "." number
  CondDotAndQuestionExpr = ( CondDotted | Parens<CondDotted> ) "?" TypeExpr
  CondQuestionExpr = TypeExpr "?" TypeExpr
  CondTypeExpr = TypeExpr

  // Compares:
  CompareExpr =
    | CompareOperatorExpr
    | Parens<CompareExpr>
    | MathExpr

  CompareOperatorExpr =
    | MathExpr "<=" MathExpr
    | MathExpr ">=" MathExpr
    | MathExpr "!=" MathExpr
    | MathExpr "=" MathExpr
    | MathExpr "<" MathExpr
    | MathExpr ">" MathExpr

  // Base rule for field defining expressions:
  TypeExpr =
    | CellRefExpr
    | BuiltinExpr
    | CombinatorExpr
    | SimpleExpr
    | Parens<TypeExpr>

  // Math:
  MathExpr = MulExpr ("+" MulExpr)*
  // You can multiply by constant values only: 'Bit' and numbers, basically
  MulExpr = SimpleExpr ("*" RefExpr)*

  // TypeExpr's items:
  CellRefExpr = "^" ( CellRefInner | Parens<CellRefInner> )
  CellRefInner = CombinatorExpr | identifier

  BuiltinExpr = BuiltinOneArg | BuiltinZeroArgs
  // This needs extra 'Parens' because of '(##)' expr:
  BuiltinOneArg = "(" ( builtins_one_arg | Parens<builtins_one_arg> ) RefExpr ")"
  BuiltinZeroArgs = builtins_zero_args

  // It is different from 'Combinator' only in the quantity part:
  // we always need at least one argument here and it can be complex.
  CombinatorExpr = "(" identifier TypeExpr+ ")"

  SimpleExpr =
    | NegateExpr
    | MathExpr
    | RefExpr
    | Parens<SimpleExpr>

  NegateExpr = "~" SimpleExpr
  RefExpr = RefInner | Parens<RefInner>
  RefInner = identifier | number


  // Helpers
  // ~~~~~~~

  // Generic rule to allow parens around some expressions:
  Parens<expr> = "(" expr ")"
}
`

export default grammar
