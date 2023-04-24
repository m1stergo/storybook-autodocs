const getLastBracketIndex = (str) => {
  let lastBracketIndex = -1;
  for (let i = str.length - 1; i >= 0; i--) {
    if (str[i] === "}") {
      lastBracketIndex = i;
      break;
    }
  }
  return lastBracketIndex;
};

const hasTrailingComma = (str) => {
  const lastBracketIndex = getLastBracketIndex(str);
  for (let i = lastBracketIndex - 1; i >= 0; i--) {
    if (str[i].trim() !== "") {
      if (str[i].trim() === ",") return true;
      return false;
    }
  }
  return false;
}

const getObjectStatement = (str) => {
  let lastBracketIndex = getLastBracketIndex(str);
  if (lastBracketIndex > -1) return str.slice(0, lastBracketIndex + 1);
  throw new Error("Unexpected string, no ending bracket found");
};

module.exports = {
  getLastBracketIndex,
  getObjectStatement,
  hasTrailingComma,
}
