const hbjs = require('handbrake-js');
const fs = require('fs');
const path = require('path');

const {
  isUploadAllowed,
  getContentType,
  getFileType,
  getUUID,
} = require('../utils/file-helper');
const { statusCodes, fileTypes } = require('../consts/consts');

function removeFile(filePath) {
  fs.unlink(filePath, (err) => {
    if (err) throw err;

    console.log('File deleted!');
  });
}

async function convertAndDeleteVideo(ctx, fileDetails) {
  return new Promise((resolve, reject) => {
    hbjs
      .spawn({
        input: `${fileDetails.filePath}`,
        output: `../output-files/${fileDetails.fileHash}.mp4`,
      })
      .on('error', () => {
        removeFile(fileDetails.filePath);
        reject();
      })
      .on('end', () => {
        removeFile(fileDetails.filePath);

        ctx.status = statusCodes.success;
        ctx.body = 'File uploaded';
        resolve();
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

const postUpload = async (ctx) => {
  const contentType = getContentType(ctx.request.header);
  const fileType = getFileType(contentType);
  const fileHash = `${Date.now()}${getUUID()}`;
  const fileName = `${fileHash}.${fileTypes[fileType]}`;
  const filePath = path.join(`${__dirname}../../../input-files/`, fileName);
  const fileDetails = {
    fileName,
    fileHash,
    filePath,
  };

  if (!isUploadAllowed(contentType)) {
    ctx.status = statusCodes.unsupportedMedia;
    ctx.body = 'Unsupported Media Type';
  }

  try {
    await handleFileDownload(ctx.req, filePath);
  } catch (error) {
    throw error;
  }

  try {
    await convertAndDeleteVideo(ctx, fileDetails);
  } catch (error) {
    throw error;
  }
};

module.exports = {
  postUpload,
};
