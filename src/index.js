const findStories = require("./findStories.js");
const parseFiles = require("./parseFiles.js");

const arg = process.argv.slice(2);
const dir = arg[0] ? arg[0].split("=")[1] : __dirname;

parseFiles(findStories(dir))
