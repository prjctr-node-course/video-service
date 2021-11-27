const path = require('path');

const {
  isUploadAllowed,
  getContentType,
  getFileType,
  getUUID,
} = require('../utils/fileHelper');
const {
  convertAndDeleteVideo,
  handleFileDownload,
} = require('../services/workers');
const { statusCodes, fileTypes } = require('../consts/consts');

const postUpload = async (ctx) => {
  const contentType = getContentType(ctx.request.header);
  const fileType = getFileType(contentType);
  const fileHash = `${Date.now()}${getUUID()}`;
  const fileName = `${fileHash}.${fileTypes[fileType]}`;
  const filePath = path.join(`${__dirname}../../../inputFiles/`, fileName);
  const outputPath = path.join(`${__dirname}../../../outputFiles/${fileHash}`);
  const fileDetails = {
    fileName,
    filePath,
    outputPath,
  };

  if (!isUploadAllowed(contentType)) {
    return {
      code: statusCodes.unsupportedMedia,
      message: 'Unsupported Media Type',
    };
  }

  try {
    await handleFileDownload(ctx.req, filePath);
  } catch (error) {
    throw error;
  }

  try {
    return await convertAndDeleteVideo(fileDetails);
  } catch (error) {
    throw error;
  }
};

module.exports = {
  postUpload,
};
