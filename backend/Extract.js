const path = require("path");
const fs = require("fs"); 
const unzipper = require("unzipper");

const extract = async (filename, pass) => {
  try {
    const directory = await unzipper.Open.file(`uploads/${filename}`);
    const extracted = await directory.files[0].buffer(pass);
    const content = extracted.toString();

    const extractFolder = "extracted";
    const filePath = path.join(__dirname, extractFolder, filename + ".xml");

    fs.writeFile(filePath, content, (err) => {
      if (err) {
        console.error("Error writing file:", err);
      }
    });
  } catch (e) {
    console.log(e);
  }
};

module.exports = {extract}