const fs = require("fs");
const prettier = require("prettier");

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
    var exportDefaultRegex = /export default/;
    let output;
    if (autodocsRegex.test(data)) {
      output = data.replace(autodocsRegex, content);
    } else if (exportDefaultRegex.test(data)) {
      output = data.replace(exportDefaultRegex, `${content}export default`);
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
