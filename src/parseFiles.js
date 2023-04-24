const fs = require("fs");
const path = require("path");
const vueParser = require("./vueParser.js");
const createArgTypes = require("./createArgTypes.js");
const writeDoc = require("./writeDoc.js");

function parseFiles(files = []) {
  files.forEach(([vuePath, storyPath]) => {
    fs.readFile(vuePath, "utf-8", (err, data) => {
      if (err) {
        throw new Error(err);
      }
      const extension = path.extname(vuePath);
      const fileName = path.basename(vuePath, extension);
      try {
        console.log(`Parsing ${fileName}${extension}`);
        const parsedFile = vueParser.parse(data);
        const argTypes = createArgTypes(parsedFile);
        const component = {
          fileName,
          storyPath,
          argTypes,
          description: parsedFile.description
        };
        writeDoc(component);
      } catch(error) {
        console.log(`Unable to parse ${fileName}${extension}`);
        console.log(error.message);
      }
    });
  });
}

module.exports = parseFiles;
