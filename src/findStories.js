var path = require('path'),
fs = require('fs');

function findStories(startPath, vueFiles = []) {
  if (!fs.existsSync(startPath)) {
    console.log("No directory provided", startPath);
    return;
  }
  var files = fs.readdirSync(startPath);
  for (var i = 0; i < files.length; i++) {
    var filePath = path.join(startPath, files[i]);
    var stat = fs.lstatSync(filePath);
    if (stat.isDirectory()) {
      findStories(filePath, vueFiles); //recurse
    } else if (filePath.endsWith("stories.js") || filePath.endsWith("stories.ts")) {
      const extension = path.extname(filePath);
      const fileName = path.basename(filePath, extension);
      const name = fileName.split(".stories")[0];
      try {
        const vuePath = path.join(startPath, `${name}.vue`)
        if(fs.existsSync(vuePath)) {
          vueFiles.push([vuePath, filePath]);
        }
      } catch(err) {
        // do nothing
      }
    };
  };
  return vueFiles;
};

module.exports = findStories;
