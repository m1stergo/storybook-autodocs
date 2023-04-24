const fs = require("fs");
const prettier = require("prettier");
const { getLastBracketIndex, hasTrailingComma } = require("./utils");

function writeDoc(component) {
  fs.readFile(component.storyPath, 'utf8', function (err, data) {
    if (err) {
      console.log(err);
      return;
    }

    let content = `/**
      * storybook-autodocs::begin
      * The following statements where created automatically, do not edit!
      * For more info see: https://github.com/m1stergo/storybook-autodocs
      **/
      const argTypes = ${JSON.stringify(component.argTypes, null, 2)};\n`;
    if (component.description) {
      content += `
      const parameters = {
        docs: {
          description: {
            component: \`${component.description}\`,
          },
        },
      };\n`
    }
    content += `/** storybook-autodocs::end **/`;
    content = prettier.format(content,{ parser: "babel" })+"\n";

    var autodocsRegex = /\/\*\*\n\s+\*\s+storybook-autodocs::begin(?:.|\n)+?storybook-autodocs::end \*\*\/\n*/;
    var metaRegex = /const meta/;
    var exportDefaultRegex = /export default/;

    // add argTypes
    let output;
    if (autodocsRegex.test(data)) {
      output = data.replace(autodocsRegex, content);
    } else if (metaRegex.test(data)) {
      output = data.replace(metaRegex, `${content}const meta`);
      var found = output.match(/meta = ({(?:.|\n)+}) satisfies/);
      var [,metaBlock] = found;
      if (!metaBlock.includes("argTypes,")) {
        const lastBracketIndex = getLastBracketIndex(metaBlock);
        const offset = 6; // c:1 o:2 n:3 s:4 t:5 _:6
        const argTypes = hasTrailingComma(metaBlock) ? "\nargTypes,\n}" : ",\nargTypes,\n}";
        output = output.slice(0, found.index + lastBracketIndex + offset) + argTypes;
      }
    } else if (exportDefaultRegex.test(data)) {
      output = data.replace(exportDefaultRegex, `${content}export default`);

      var found = output.match(/export default ({(?:.|\n)+?})[\n|\s]*(?:\bconst\b|;|\bvar\b|\blet\b|as)/);
      var [,exportBlock] = found;
      if (!exportBlock.includes("argTypes")) {
        const lastBracketIndex = getLastBracketIndex(exportBlock);
        const argTypes = hasTrailingComma(exportBlock) ? "\nargTypes,\n}" : ",\nargTypes,\n}";
        output = output.slice(0, found.index + lastBracketIndex) + argTypes;
      }
    } else {
      throw new Error("Unexpected file data, make sure export default is defined");
    }

    fs.writeFile(component.storyPath, output, (error) => {
      if (error) {
        console.error(error);
      } else {
        console.log(`Argtypes for ${component.fileName} written successfully\n`);
      }
    });
  });
}

module.exports = writeDoc;
