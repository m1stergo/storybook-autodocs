const chevrotain = require("chevrotain");
const { Lexer, createToken } = chevrotain;

const Null = createToken({name: "Null", pattern: /null/});
const LParen = createToken({name: "LParen", pattern: /\(/});
const RParen = createToken({name: "RParen", pattern: /\)/});
const LCurly = createToken({name: "LCurly", pattern: /{/});
const RCurly = createToken({name: "RCurly", pattern: /}/});
const LSquare = createToken({name: "LSquare", pattern: /\[/});
const RSquare = createToken({name: "RSquare", pattern: /]/});
const Lt = createToken({name: "LessThan", pattern: /</});
const Gt = createToken({name: "GreaterThan", pattern: />/});
const Comma = createToken({name: "Comma", pattern: /,/});
const Colon = createToken({name: "Colon", pattern: /:/});
const Semicolon = createToken({name: "Semicolon", pattern: /;/});
const Or = createToken({name: "Or", pattern: /\|/});
const StringLiteral = createToken({
  name: "StringLiteral", pattern: /["'](?:[^\\"']|\\(?:[bfnrtv"\\\/]|u[0-9a-fA-F]{4}))*["']/
});
const NumberLiteral = createToken({
  name: "NumberLiteral", pattern: /-?(0|[1-9]\d*)(\.\d+)?([eE][+-]?\d+)?/
});
const BooleanLiteral = createToken({
  name: "BooleanLiteral",
  pattern: /true|false/,
})
const Word = createToken({ name: "Word", pattern: /([\w-]+)((\.[\w-]+)+|(\[['"]\w+['"]\])+)?/ });
const WhiteSpace = createToken({
  name: "WhiteSpace",
  pattern: /\s+/,
  group: Lexer.SKIPPED
});
const StringType = createToken({
  name: "StringType",
  pattern: /string/,
});
const NumberType = createToken({
  name: "NumberType",
  pattern: /number/,
});
const BooleanType = createToken({
  name: "BooleanType",
  pattern: /boolean/,
});
const ArrayWord = createToken({
  name: "ArrayWord",
  pattern: /Array/,
});
const TypeProps = createToken({
  name: "TypeProps",
  pattern: /type\s+Props\s+=/
})
const WithDefaults = createToken({
  name: "WithDefaults",
  pattern: /withDefaults/
})
const DefinePropsType = createToken({
  name: "DefinePropsType",
  pattern: /defineProps<Props>/
})
const DefineProps = createToken({
  name: "DefineProps",
  pattern: /defineProps/
})
const QuestionMark = createToken({
  name: "QuestionMark",
  pattern: /\?/
})

const Comment = createToken({
  name: "Comment",
  pattern: /\/\*([^\*]|(\*(?!\/)))*\*\//,
})

const InlineComment = createToken({
  name: "InlineComment",
  pattern: /\/\/(?:.)+?,(?:\n)/,
  group: Lexer.SKIPPED,
})

const Arrow = createToken({
  name: "Arrow",
  pattern: /=>/,
})

// Labels only affect error messages and Diagrams.
LCurly.LABEL = "'{'";
RCurly.LABEL = "'}'";
LSquare.LABEL = "'['";
RSquare.LABEL = "']'";
LParen.LABEL = "(";
RParen.LABEL = ")";
Lt.LABEL = "<";
Gt.LABEL = ">";
Or.LABEL = "|";
Comma.LABEL = "','";
Semicolon.LABEL = "';'";
Colon.LABEL = "':'";
QuestionMark.LABEL = "?";
Arrow.LABEL = "=>";

module.exports = {
  Null,
  LParen,
  RParen,
  LCurly,
  RCurly,
  LSquare,
  RSquare,
  Lt,
  Gt,
  Comma,
  Comment,
  InlineComment,
  Colon,
  Semicolon,
  Or,
  StringLiteral,
  NumberLiteral,
  BooleanLiteral,
  Word,
  WhiteSpace,
  StringType,
  NumberType,
  BooleanType,
  ArrayWord,
  TypeProps,
  WithDefaults,
  DefinePropsType,
  DefineProps,
  QuestionMark,
  Arrow,
};
