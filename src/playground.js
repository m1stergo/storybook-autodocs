(function jsonGrammarOnlyExample() {
  // ----------------- Lexer -----------------
  const createToken = chevrotain.createToken;
  const Lexer = chevrotain.Lexer;

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
const Word = createToken({ name: "Word", pattern: /(\w+)((.[\w_-]+)+|(\["\w+"\]))?/ });
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
  pattern: /\/\*\s*\n?([^\*]|(\*(?!\/)))*\*\//,
})

const InlineComment = createToken({
  name: "InlineComment",
  pattern: /\/\/(?:.)+?,(?:\n)/,
  group: Lexer.SKIPPED,
})


const Union = createToken({
  name: "Union",
  pattern: /[|\s\w\-'"\{\}:\[\]]+/,
})

const Arrow = createToken({
  name: "Arrow",
  pattern: /=>/,
})

const jsonTokens = [
  WhiteSpace,
  StringLiteral,
  NumberLiteral,
  BooleanLiteral,
  LCurly, RCurly,
  LSquare, RSquare,
  Lt, Gt, Or,
  Comma, Colon, Semicolon,Null,
  StringType, NumberType, BooleanType,
  ArrayWord,QuestionMark,
  Comment,
  LParen, RParen, Arrow,
  Word, 
];;

  const JsonLexer = new Lexer(jsonTokens, {
    // Less position info tracked, reduces verbosity of the playground output.
    positionTracking: "onlyStart"
  });

  // Labels only affect error messages and Diagrams.
  LCurly.LABEL = "'{'";
  RCurly.LABEL = "'}'";
  LSquare.LABEL = "'['";
  RSquare.LABEL = "']'";
  // LParen.LABEL = "(";
  // RParen.LABEL = ")";
  Lt.LABEL = "<";
  Gt.LABEL = ">";
  // Or.LABEL = "|";
  Comma.LABEL = "','";
  Semicolon.LABEL = "';'";
  Colon.LABEL = "':'";
  QuestionMark.LABEL = "?";


  // ----------------- parser -----------------
  const CstParser = chevrotain.CstParser;

  class JsonParser extends CstParser {
    constructor() {
      super(jsonTokens, {
        recoveryEnabled: true
      })

      const $ = this;

      $.RULE("start", () => {
        $.SUBRULE($.object);
      });
  
      $.RULE("object", () => {
        $.CONSUME(LCurly);
        $.MANY(() => $.SUBRULE($.objectItem));
        $.CONSUME(RCurly);
      });
  
      $.RULE("objectItem", () => {
        $.OPTION(() => {
          $.CONSUME(Comment);
        });
        $.OR([
          { ALT: () => $.CONSUME(InlineComment) },
          { ALT: () => $.SUBRULE($.objectEntry) },
          { ALT: () => $.SUBRULE($.emitEntry) },
        ]);
      });
  
      $.RULE("objectEntry", () => {
        $.OR([
            { ALT: () => $.CONSUME(StringLiteral) },
            { ALT: () => $.CONSUME(Word) },
          ]);
          $.OPTION(() => {
            $.OR2([
              { ALT: () => $.CONSUME(QuestionMark) },
              { ALT: () => $.CONSUME(Comma) },
            ]);
          });
          $.OPTION2(() => {
            $.CONSUME(Colon);
            $.SUBRULE($.valueDef);
            $.OPTION3(() => {
              $.OR3([
                  { ALT: () => $.CONSUME(Semicolon) },
                  { ALT: () => $.CONSUME2(Comma) },
              ]);
            })
          });
      });
  
  
      $.RULE("emitEntry", () => {
        $.CONSUME(LParen);
        $.SUBRULE($.emitEvent);
        $.CONSUME(RParen);
        $.SUBRULE($.emitReturnType);
      });
  
      $.RULE("emitEvent", () => {
          $.CONSUME(Word);
          $.CONSUME(Colon);
          $.CONSUME(StringLiteral);
          $.OPTION(() => {
            $.CONSUME(Comma);
            $.MANY_SEP({
              SEP: Comma,
              DEF: () => $.SUBRULE($.emitParam),
            });
          });
      });
  
      $.RULE("emitReturnType", () => {
        $.CONSUME(Colon);
          $.SUBRULE($.valueDef);
          $.CONSUME(Semicolon);
      });
      $.RULE("emitParam", () => {
        $.CONSUME(Word)
        $.CONSUME(Colon);
        $.SUBRULE($.valueDef);
      })
  
      $.RULE("valueDef", () => {
        $.MANY(() => {
            $.SUBRULE($.value);
            $.OPTION(() => $.CONSUME(Or));
          })
      });
  
      $.RULE("value", () => {
        $.OR([
          {
            ALT: () => {
              $.CONSUME(StringType)
            }
          },
          {
            ALT: () => {
              $.CONSUME(NumberType)
            }
          },
          {
            ALT: () => {
              $.CONSUME(BooleanType);
            }
          },
          {
            ALT: () => {
              $.CONSUME(StringLiteral)
            }
          },
          {
            ALT: () => {
              $.CONSUME(NumberLiteral)
            }
          },
          {
            ALT: () => {
              $.CONSUME(BooleanLiteral);
            }
          },
          {
            ALT: () => {
              $.CONSUME(Null)
            }
          },
          {
            ALT: () => {
              $.SUBRULE($.object)
            }
          },
          {
            ALT: () => {
              $.SUBRULE($.arrayType);
            }
          },
          {
            ALT: () => {
              $.SUBRULE($.arrayLiteral);
            }
          },
          {
            ALT: () => {
              $.CONSUME(Word)
            }
          },
          {
            ALT: () => {
              $.SUBRULE($.arrowFunction)
            }
          },
        ]);
        $.OPTION(() => {
          $.SUBRULE($.isBracketArray);
        })
      });
  
      $.RULE("arrayType", () => {
        $.CONSUME(ArrayWord);
        $.CONSUME(Lt);
        $.SUBRULE($.valueDef);
        $.CONSUME(Gt);
      });
  
      $.RULE("isBracketArray", () => {
        $.CONSUME(LSquare);
        $.CONSUME(RSquare);
      });
  
      $.RULE("arrayLiteral", () => {
        $.CONSUME(LSquare);
        $.MANY(() => $.SUBRULE($.arrayItem));
        $.CONSUME(RSquare);
      });
  
      $.RULE("arrayItem", () => {
        $.SUBRULE($.value);
        $.OPTION(() => {
          $.CONSUME(Comma)
        });
      });
  
      $.RULE("arrowFunction", () => {
        $.CONSUME(LParen);
        $.SUBRULE($.functionParams);
        $.CONSUME(RParen);
        $.CONSUME(Arrow);
        $.SUBRULE($.returnType);
      })
  
      $.RULE("returnType", () => {
        $.OPTION(() => {
            $.CONSUME(LParen);
          });
          $.SUBRULE($.object);
          $.OPTION2(() => {
            $.CONSUME(RParen);
          });
      });
  
      $.RULE("functionParams", () => {
        $.MANY(() => {
            $.SUBRULE($.functionParam);
            $.OPTION(() => $.CONSUME(Comma));
        });
      })
  
      $.RULE("functionParam", () => {
        $.OPTION(() => {
          $.CONSUME(Word);
            $.CONSUME(Colon);
        });
        $.SUBRULE($.valueDef);
      });
      // very important to call this after all the rules have been setup.
      // otherwise the parser may not work correctly as it will lack information
      // derived from the self analysis.
      this.performSelfAnalysis();
    // very important to call this after all the rules have been setup.
    // otherwise the parser may not work correctly as it will lack information
    // derived from the self analysis.
    this.performSelfAnalysis();
  }
}

  // for the playground to work the returned object must contain these fields
  return {
    lexer: JsonLexer,
    parser: JsonParser,
    defaultRule: "start"
  };
}())
