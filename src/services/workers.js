const hbjs = require('handbrake-js');
const fs = require('fs');
const inputDir = '';

const { statusCodes } = require('../consts/consts');

function removeFile(filePath) {
  fs.unlink(filePath, (err) => {
    if (err) throw err;

    console.log('File deleted!');
  });
}

async function convertAndDeleteVideo(fileDetails) {
  return new Promise((resolve, reject) => {
    hbjs
      .spawn({
        input: `${fileDetails.filePath}`,
        output: `${fileDetails.outputPath}.mp4`,
      })
      .on('error', (error) => {
        removeFile(fileDetails.filePath);
        reject(error);
      })
      .on('end', () => {
        removeFile(fileDetails.filePath);

        resolve({
          code: statusCodes.success,
          message: 'File uploaded',
        });
      });
  });
}

async function handleFileDownload(req, filePath) {
  const videoFile = fs.createWriteStream(filePath);

  await new Promise((resolve, reject) => {
    req
      .pipe(videoFile)
      .on('error', (error) => {
        reject(error);
      })
      .on('finish', () => {
        resolve();
      });
  });
}

module.exports = {
  convertAndDeleteVideo,
  handleFileDownload,
};
