const grammar = String.raw`
TLB {
  // See:
  // https://github.com/andreypfau/TL-B-docs

  // Root definition
  Program = SourceElement*

  // Utilities
  // Override Ohm's built-in definition of space.
  space := whitespace | lineTerminator | comment

  whitespace
    = "\t"
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
  builtins = "#<" | "#<=" | "##" | "#"

  // ----------
  // Base rules
  // ----------
  SourceElement = Declaration | comment
  Declaration = Constructor Fields "=" Combinator ";"

  // Constructors
  // ~~~~~~~~~~~~
  Constructor = ConstructorName
  ConstructorName = ("_" | identifier) ConstructorTag?
  ConstructorTag
  	= "$" (binaryDigit+ | "_")
    | "#" (hex | "_")

  // Fields
  // ~~~~~~
  Fields = FieldDefinition*
  FieldDefinition = FieldImplicitDef | FieldNamedDef | CellRefExpr | ParenExpr | CondExpr
  FieldImplicitDef = "{" (FieldImplicit | Expression) "}"
  FieldImplicit = identifier ":" ("#" | "Type")
  FieldNamedDef = identifier ":" CondExpr

  // Combinators
  // ~~~~~~~~~~~
  Combinator = identifier TypeExpr*

  // Expressions
  // ~~~~~~~~~~~
  Expression = CompareExpr

  CompareExpr
    = MathExpr "<=" MathExpr  -- lte
    | MathExpr ">=" MathExpr  -- gte
    | MathExpr "!=" MathExpr  -- ne
    | MathExpr "=" MathExpr   -- eq
    | MathExpr "<" MathExpr   -- lt
    | MathExpr ">" MathExpr   -- gt
    | MathExpr                -- noop

  MathExpr = MulExpr ("+" MulExpr)*
  MulExpr = PrimitiveExpr ("*" PrimitiveExpr)*

  // Misc
  // ~~~~
  PrimitiveExpr = CondExpr+
  CondExpr = NestedTypeExpr CondTypeExpr?
  NestedTypeExpr = TypeExpr ("." TypeExpr)?
  CondTypeExpr = "?" TypeExpr

  TypeExpr = "~"? ( AnnonymousConstructorExpr | CellRefExpr | ParenExpr | RefExpr )
  AnnonymousConstructorExpr = "[" Fields "]"
  CellRefExpr = "^" TypeExpr
  ParenExpr = "(" Expression ")"
  RefExpr = builtins | identifier | number
}
`

export default grammar
