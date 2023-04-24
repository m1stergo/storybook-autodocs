function isObject(type) {
  return type == "Object"
}

function isArrayLiteral(type) {
  return type === "ArrayLiteral";
}

function isArrayType(type) {
  return type === "ArrayType";
}

function isBooleanType(type) {
  return type === "BooleanType";
}

function isStringType(type) {
  return type === "StringType";
}

function isStringLiteral(type) {
  return type === "StringLiteral";
}

function isNumberType(type) {
  return type === "NumberType";
}

function isNumberLiteral(type) {
  return type === "NumberLiteral";
}

function isFunction(type) {
  return type === "Function";
}

function isUnion(type) {
  return type === "Union";
}

function isNull(type) {
  return type === "Null";
}

function getDescription(str) {
  if (!str) return [];
  return str.split("@example");
}

function getTypeSummary(prop, deep) {
  if (isStringType(prop.type)) {
    return "string";
  }
  if (isBooleanType(prop.type)) {
    return "boolean";
  }
  if (isNull(prop.type)) {
    return "null";
  }
  if (isFunction(prop.type)) {
    if (deep) {
      return `(${prop.params.map((p) => getTypeSummary(p, true)).join(", ")}) => ${prop.output.value}`;
    }
    return "function";
  }
  if (isArrayType(prop.type)) {
    const val = getTypeSummary(prop.value);
    return `Array<${val}>`;
  }
  if (isArrayLiteral(prop.type)) {
    return "array"
  }

  if (isObject(prop.type)) {
    return "object"
  }

  if (prop.value.value) {
    return getTypeSummary(prop.value);
  }

  if (isUnion(prop.type)) {
    return prop.value.map((v) => getTypeSummary(v)).join("|");
  }

  return typeof prop.value === "string" ? prop.value.replace(/"|'/gm, "") : prop.value;
}

function createArgTypeObject({
  name,
  options,
  optional,
  defaultValue,
  comment,
  summary,
  controlType,
  category,
  action,
  detail,
}) {
  const [description, descDetail] = getDescription(comment);
  const defValue = typeof defaultValue === "string" ? defaultValue.replace(/"/g, ""): defaultValue;
  return {
    name,
    type: { required: !optional },
    description,
    options,
    table: {
      category,
      type: {
        summary,
        detail: detail || descDetail,
      },
      defaultValue: { summary: defValue },
    },
    control: {
      type: controlType || null
    },
    action,
  };
}

function createStringType(prop) {
  return {
    [prop.key] : createArgTypeObject({
      name: prop.key,
      summary: "string",
      optional: prop.optional,
      defaultValue: prop.default,
      comment: prop.comment,
      controlType: "text",
      category: "props",
    }),
  };
}

function createObjectType(prop) {
  const objectDetail = prop.value.value.reduce((acc, o) => {
    acc = {
      ...acc,
      [o.key] : o.value.value,
    }
    return acc;
  }, {});
  return {
    [prop.key] : createArgTypeObject({
      name: prop.key,
      summary: "object",
      optional: prop.optional,
      defaultValue: prop.default,
      comment: prop.comment,
      controlType: "object",
      category: "props",
      detail: objectDetail !== {} ? JSON.stringify(objectDetail) : undefined,
    }),
  };
}

function createArrayType(prop) {
  const arrayOf = prop.value.value.value;

  return {
    [prop.key] : createArgTypeObject({
      name: prop.key,
      summary: `Array<${arrayOf}>`,
      optional: prop.optional,
      defaultValue: prop.default,
      comment: prop.comment,
      category: "props",
    }),
  };

}

function createArrayLiteralType(prop) {
  const arr = prop.value.value.map((v) => v.value);

  return {
    [prop.key] : createArgTypeObject({
      name: prop.key,
      summary: "Array",
      optional: prop.optional,
      defaultValue: prop.default,
      comment: prop.comment,
      category: "props",
      detail: arr.length > 0 ? `[${arr.join(", ")}]` : undefined,
    }),
  };

}

function createUnionType(prop) {
  const types = prop.value.value.map((v) => v.type);
  const values = prop.value.value.map((v) => {
    return getTypeSummary(v);
  });
  if (types.some((t) => t === "Object" || t === "Array") || values.some((v) => v === "HTMLElement")) {
    return {
      [prop.key] : createArgTypeObject({
        name: prop.key,
        summary: values.join("|"),
        optional: prop.optional,
        defaultValue: prop.default,
        comment: prop.comment,
        category: "props",
      }),
    };
  }

  return {
    [prop.key] : createArgTypeObject({
      name: prop.key,
      options: values,
      summary: values.join("|"),
      optional: prop.optional,
      defaultValue: prop.default,
      comment: prop.comment,
      controlType: "select",
      category: "props",
    }),
  };
}

function createBooleanType(prop) {
  return {
    [prop.key] : createArgTypeObject({
      name: prop.key,
      summary: "boolean",
      optional: prop.optional,
      defaultValue: prop.default !== undefined ? ["false"].includes(prop.default) ? false : true: undefined,
      comment: prop.comment,
      controlType: "boolean",
      category: "props",
    }),
  };
}

function createNumberType(prop) {
  return {
    [prop.key] : createArgTypeObject({
      name: prop.key,
      summary: "number",
      optional: prop.optional,
      defaultValue: prop.default,
      comment: prop.comment,
      controlType: "number",
      category: "props",
    }),
  };
}

function createCustomType(prop) {
  return {
    [prop.key] : createArgTypeObject({
      name: prop.key,
      summary: prop.value.value,
      optional: prop.optional,
      defaultValue: prop.default,
      comment: prop.comment,
      controlType: null,
      category: "props",
    }),
  };
}

function createFunctionType(prop) {
  const detail = getTypeSummary(prop.value, true);
  return {
    [prop.key] : createArgTypeObject({
      name: prop.key,
      summary: "function",
      detail,
      optional: prop.optional,
      defaultValue: prop.default,
      comment: prop.comment,
      controlType: null,
      category: "props",
    }),
  };
}

function createPropsArgType(prop) {
  if (isStringType(prop.value.type)) {
    return createStringType(prop);
  }
  if (isObject(prop.value.type)) {
    return createObjectType(prop);
  }
  if (isArrayType(prop.value.type)) {
    return createArrayType(prop);
  }
  if (isArrayLiteral(prop.value.type)) {
    return createArrayLiteralType(prop);
  }
  if (isBooleanType(prop.value.type)) {
    return createBooleanType(prop);
  }
  if (isNumberType(prop.value.type)) {
    return createNumberType(prop);
  }
  if (isUnion(prop.value.type)) {
    return createUnionType(prop);
  }
  if (isFunction(prop.value.type)) {
    return createFunctionType(prop);
  }

  return createCustomType(prop);
}

function getParamsInComment(comment, params) {
  let output = ""
  const paramsComment = comment?.match(/(@param[\s|\n]+(\w+))(.+)/gm);
  if (paramsComment?.length) {
    paramsComment.forEach((p) => {
      const [,,name,desc] = p.match(/(@param[\s|\n]+(\w+))(.+)/);
      const param = params?.find((p) => p.name === name);
      if (param) {
        output += `\`${getTypeSummary(param)}\` ${param.name} ${desc} `;
      }
    })
  }
  return output;
}
function createEmitsArgType(emit) {
  let detailedDescription = "";
  const name = emit.name.replace(/"/gm,"");
  const key = `on${name.slice(0,1).toUpperCase()}${name.slice(1)}`;
  const params = emit.params?.map((p) => getTypeSummary(p)).join("|");
  detailedDescription = getParamsInComment(emit.comment, emit.params);
  return {
    // disable infered events
    [name]: {
      table: {
        disable: true,
      },
    },
    [key]: createArgTypeObject({
      name: name,
      comment: detailedDescription ? detailedDescription : emit.comment,
      summary: detailedDescription ? null : params,
      controlType: null,
      category: "events",
      action: name,
      optional: true,
    }),
  };
}

function createExposeArgType(expose) {
  const name = expose.key.replace(/"/gm,"");

  return {
    [`expose-${name}`]: createArgTypeObject({
      name: name,
      comment: expose.comment,
      controlType: null,
      category: "expose",
      optional: true,
    }),
  };
}

function createSlotsArgType(slot) {
  const name = slot.name.replace(/"/gm,"");
  return {
    // disable infered slots
    [name]: createArgTypeObject({
      name: name,
      comment: slot.comment,
      summary: slot.comment?.includes("@example") ? "more" : null,
      controlType: "text",
      category: "slots",
      optional: true,
    }),
  };
}

function createArgTypes({ props, emits = [], expose = [], slots = [] }) {
  const propsArgs = props.map(createPropsArgType).reduce((args, item) => {
    return {
      ...args,
      ...item
    };
  }, {});

  const emitsArgs = emits?.map(createEmitsArgType).reduce((args, item) => {
    return {
      ...args,
      ...item
    };
  }, {});

  const exposedArgs = expose?.map(createExposeArgType).reduce((args, item) => {
    return {
      ...args,
      ...item
    };
  }, {});

  const slotsArgs = slots?.map(createSlotsArgType).reduce((args, item) => {
    return {
      ...args,
      ...item
    };
  }, {});

  return {
    ...propsArgs,
    ...emitsArgs,
    ...exposedArgs,
    ...slotsArgs,
  }
}

module.exports = createArgTypes;
