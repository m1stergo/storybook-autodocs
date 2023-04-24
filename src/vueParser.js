const parser = require("./parser");
const { getObjectStatement } = require("./utils");

const TYPE_PROPS_STATEMENT_REGEX = (target) => {
  return new RegExp(String.raw`type ${target} = ({(?:.|\n)+?)(?:\bconst\b|\bvar\b|\blet\b)`);
}
const WITH_DEFAULTS_REGEX = /withDefaults\([\n\s]*defineProps<((?:.|\n)+?)>\(\),[\s]+({(?:.|\n)+?)(?:\bconst\b|;|\bvar\b|\blet\b)/;
const DEFINE_PROPS_REGEX = /defineProps<[\n\s]*((?:.|\n)+?)>\(\)/;
const DEFINE_EMITS_REGEX = /defineEmits<[\n\s]*((?:.|\n)+?)>\(\)/;
const DEFINE_EXPOSE_REGEX = /defineExpose\([\n\s]*((?:.|\n)+?)\)/;
const SLOT_REGEX = /(<!--[\s\n]+@slot\s+((?:.|\n)+?)-->)?[\s\n]+(<slot(?:.|\n)+?>)/;
const SLOTS_REGEX = /(<!--[\s\n]+@slot\s+((?:.|\n)+?)-->)?[\s\n]+(<slot(?:.|\n)+?>)/gm;
const COMMENT_REGEX = /\/\*([^\*]|(\*(?!\/)))*\*\//;
const COMPONENT_DESC_REGEX = /<script(?:.)+?>\n?\/\*([^\*]|(\*(?!\/)))*\*\//;

const getTypedStatement = (str, target = "") => {
  const [,statement] = str.match(TYPE_PROPS_STATEMENT_REGEX(target)) || [];
  if (!statement) throw new Error(`Expected type ${target} statement, received: ${statement}`);
  return getObjectStatement(statement);
};

const getWithDefaultsStatement = (str) => {
  const [, props, defaults] = str.match(WITH_DEFAULTS_REGEX) || [];
  if (!props || !defaults) return null;
  if (props.includes("{")) {
    return {
      props: getObjectStatement(props),
      defaults: getObjectStatement(defaults),
    };
  }

  return {
    props: getTypedStatement(str, props),
    defaults: getObjectStatement(defaults),
  };
}

const getDefinePropsStatement = (str) => {
  const [, props] = str.match(DEFINE_PROPS_REGEX) || [];
  if (!props) return null;
  if (props.includes("{")) {
    return getObjectStatement(props);
  }
  return getTypedStatement(str, props);
};

const getEmitsStatement = (str) => {
  const [, emits] = str.match(DEFINE_EMITS_REGEX) || [];
  if (!emits) return null;
  if (emits.includes("{")) {
    return getObjectStatement(emits);
  }
  return getTypedStatement(str, emits);
};

const getExposeStatement = (str) => {
  const [, expose] = str.match(DEFINE_EXPOSE_REGEX) || [];
  if (!expose) return null;
  return getObjectStatement(expose);
};

const getSlotsStatement = (str) => {
  const slots  = str.match(SLOTS_REGEX) || [];
  return slots;
}

const getDescription = (str) => {
  const [desc = ""]  = str.match(COMPONENT_DESC_REGEX) || [];
  return desc;
}

function parseProps({ props, defaults }) {
  if (!props) throw new Error("Unexpected props");
  const propsAst = parser.parse(props);
  const defaultsAst = parser.parse(defaults);
  const defaultsObj = defaultsAst
    ? defaultsAst.reduce((acc, prop) => {
      return {
        ...acc,
        [prop.key]: prop.value.value,
      }
    }, {}) : {};

  const propsWithDefaults = propsAst.map((prop) => {
    return { ...prop, default: defaultsObj[prop.key] };
  });


  return propsWithDefaults;
}

function parseEmits(emits) {
  const emitsAst = parser.parse(emits);
  return emitsAst;
}

function parseExpose(expose) {
  const exposeAst = parser.parse(expose);
  return exposeAst;
}

function parseSlots(slots) {
  return slots.map((slot, i) => {
    let [,,comment,rest] = slot.match(SLOT_REGEX) || [];
    let [,name] = rest.match(/name=["']([\w\-]+)["']/) || [];
    if (!name && i == 0) {
      name = "default";
    }
    if (!name && comment) {
      const [n, ...r] = comment.split(" ");
      name = n;
      comment = r.join(" ");
    }

    return {
      name: name || `unnamed-slot-${i}`,
      comment,
    };
  });
}

function parseComponentDescription(desc) {
  const [comment = ""] = desc.match(COMMENT_REGEX) || [];
  return comment.replace(/\//gm, "").replace(/\*/gm, "").trim();
}

function parse(data) {
  try {
    const output = {};
    const withDefaultsStatement = getWithDefaultsStatement(data);
    const definePropsStatement = getDefinePropsStatement(data);

    // props
    if (withDefaultsStatement) {
      output.props = parseProps(withDefaultsStatement);
    } else if (definePropsStatement) {
      output.props = parseProps({ props: definePropsStatement });
    } else {
      console.log("> No props declaration found");
      output.props = [];
    }

    // emits
    const emitsStatement = getEmitsStatement(data);
    if (emitsStatement) {
      output.emits = parseEmits(emitsStatement);
    }

    // expose
    const exposeStatement = getExposeStatement(data);
    if (exposeStatement) {
      output.expose = parseExpose(exposeStatement);
    }

    // slots
    const slotsStatement = getSlotsStatement(data);
    if (slotsStatement) {
      output.slots = parseSlots(slotsStatement);
    }

    // component description
    const description = getDescription(data);
    if (description) {
      output.description = parseComponentDescription(description);
    }

    return output;
  } catch(err) {
    console.error(err.message);
    return {};
  }
}

module.exports = { parse };
