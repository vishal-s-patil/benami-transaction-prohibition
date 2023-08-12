const path = require("path");
const fs = require("fs");
const unzipper = require("unzipper");

const extract = function(filename, pass) {
    return new Promise(async function (resolve, reject) {
        try {
            const directory = await unzipper.Open.file(`uploads/${filename}.zip`);
            const extracted = await directory.files[0].buffer(pass);
            // const content = extracted.toString();
            // console.log('content', content);
    
            const extractFolder = "../extracted";
            const filePath = path.join(__dirname, extractFolder, filename + '.xml');
    
            fs.writeFile(filePath, extracted, (err) => {
                if (err) {
                    console.error("Error writing file:", err);
                    reject();
                }
                resolve();
            });
        } catch (e) {
            console.log(e);
            reject();
        }
    })
}

module.exports = {
    extract
}