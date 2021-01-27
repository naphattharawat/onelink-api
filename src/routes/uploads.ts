const IncomingForm = require('formidable').IncomingForm;
const fs = require('fs');
const path = require("path");

module.exports = function upload(req, res) {
  const form = new IncomingForm();
  form.maxFileSize = 500 * 1024 * 1024;
  form.on('file',async (field, file) => {
    // Do something with the file
    // e.g. save it to the database
    // you can access it using file.path
    console.log('file', file.name);
    const readStream = fs.createReadStream(file.path);

    await new Promise((res) =>
        fs.createReadStream(file.path)
          .pipe(
            fs.createWriteStream(
              path.join(__dirname, "../../images", file.name)
            )
          )
          .on("close", res)
      );
      return true;
    // console.log(readStream);
    
  });
  form.on('end', () => {
    res.json();
  });
  form.parse(req);
};
