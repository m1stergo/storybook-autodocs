const chevrotain = require("chevrotain");

const { CstParser, Lexer } = chevrotain;

const {
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
  Word, Comment, InlineComment,
  LParen, RParen, Arrow,
} = require("./tokens.js");

const tokens = [
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
  Word, Comment, InlineComment,
  LParen, RParen, Arrow,
];

const ProgramLexer = new Lexer(tokens, {
  positionTracking: "onlyStart"
});

class ProgramParser extends CstParser {
  constructor() {
    super(tokens, {
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
  }
}

function createVisitor(Visitor) {
  class ProgramVisitor extends Visitor {
    constructor() {
      super()
      // The "validateVisitor" method is a helper utility which performs static analysis
      // to detect missing or redundant visitor methods
      this.validateVisitor()
    }
    /* Visit methods go here */
    start(ctx) {
      const result = this.visit(ctx.object);
      return result;
    }

    object(ctx) {
      const result = ctx.objectItem.map((c) => {
        return this.visit(c)
      })
      return result;
    }

    objectEntry(ctx) {
      const key = ctx.Word[0].image;
      let value = key;

      if (ctx.valueDef) {
        // value = ctx.valueDef.map((v) => this.visit(v));
        value = this.visit(ctx.valueDef[0]);
      }
      const optional = Boolean(ctx.QuestionMark);
      return {
        type: "Prop",
        key,
        value,
        optional,
      };
    }

    emitEntry(ctx) {
      const event = this.visit(ctx.emitEvent[0]);
      // not needed
      // const returnType = this.visit(ctx.returnType);
      return event;
    }

    objectItem(ctx) {
      let entry = {};
      if (ctx.objectEntry) {
        entry = this.visit(ctx.objectEntry);
      } else if (ctx.emitEntry) {
        entry = this.visit(ctx.emitEntry);
      }
      const comment = ctx.Comment?.[0]?.image?.replace(/\//gm, "").replace(/\*/gm, "").trim();
      return {
        type: "Prop",
        ...entry,
        comment,
      };
    }

    valueDef(ctx) {
      if (ctx.Or && ctx.value.length > 1) {
        return {
          type: "Union",
          value: ctx.value.map((c) => this.visit(c)),
        }
      }
      return this.visit(ctx.value);
    }

    value(ctx) {
      const [key, [value]] = Object.entries(ctx)[0];
      if (ctx.isBracketArray) {
        return {
          type: "ArrayType",
          value: {
            type: key,
            value: value.image,
          },
        }
      }
      if (key === "arrayType") {
        const result = this.visit(value.children.valueDef);
        return {
          type: "ArrayType",
          value: result,
        };
      };

      if (key === "arrayLiteral") {
        const result = value.children.arrayItem.map((a) => this.visit(a.children.value));
        return {
          type: "Array",
          value: result,
        };
      };

      if (key ==="object") {
        const result = value.children.objectItem.map((v) => this.visit(v));
        return {
          type: "Object",
          value: result,
        }
      }

      if (key === "arrowFunction") {
        const params = this.visit(value.children.functionParams);
        const output = this.visit(value.children.returnType);
        return {
          type: "Function",
          params,
          output,
        }
      }

      return {
        type: key,
        value: value.image,
      };
    }

    arrayType(ctx) {
      const result = this.visit(ctx[0]);
      return result;
    }

    isBracketArray(ctx) {
      return true;
    }

    arrayLiteral(ctx) {
      const result = this.visit(ctx[0]);
      return result;
    }

    arrayItem(ctx) {
      const result = this.visit(ctx[0]);
      return result;
    }

    emitObject(ctx) {
      const result = ctx.emitItem.map((c) => this.visit(c));
      return result;
    }

    emitItem(ctx) {
      const result = this.visit(ctx.emitEvent);
      return {
        ...result,
        description: ctx.Comment?.[0]?.image?.replace(/\//gm, "").replace(/\*/gm, "").trim()
      };
    }

    emitEvent(ctx) {
      const eventName = ctx.StringLiteral[0].image.replace(/"/g, "");
      let params;
      if (ctx.emitParam) {
        params = ctx.emitParam.map((c) => this.visit(c));
      }
      return {
        type: "event",
        name: eventName,
        params,
      };
    }

    emitReturnType(ctx) {
      return {};
    }

    emitParam(ctx) {
      const value = this.visit(ctx.valueDef);

      return {
        name: ctx.Word[0].image,
        ...value,
      }
    }

    arrowFunction(ctx) {
      return {};
    }

    functionParams(ctx) {
      return ctx.functionParam.map((p) => {
        return this.visit(p)
      }).filter((p) => {
        return p !== undefined;
      });
    }

    functionParam(ctx) {
      return this.visit(ctx.valueDef);
    }

    returnType(ctx) {
      // @TODO fix
      if (ctx.object) {
        return this.visit(ctx.object);
      }
      if (ctx.valueDef) {
        return this.visit(ctx.valueDef);
      }
      return this.visit(ctx.value);
    }
  }
  return ProgramVisitor;
}

function parse(data) {
  if (!data) return [];

  const lexingResult = ProgramLexer.tokenize(data);
  if (lexingResult.errors.length > 0) {
    console.error("Lexing Error\n" + lexingResult.errors[0].message);
  }
  const parser = new ProgramParser([], { outputCst: true });
  const visitor = createVisitor(parser.getBaseCstVisitorConstructor());
  const visitorInstance = new visitor();

  parser.input = lexingResult.tokens;
  const cst = parser.start();

  if (parser.errors.length > 0) {
    console.error(
      "Parsing Error while parsing props\n" +
      parser.errors[0].message
    )
  }
  const ast = visitorInstance.visit(cst);

  return ast;
}

module.exports = { parse };
