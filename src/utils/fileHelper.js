const crypto = require('crypto');
const { fileTypes } = require('../consts/consts');

function getUUID() {
  return crypto.randomBytes(16).toString('hex');
}

function getFileType(contentType) {
  if (!contentType) {
    return '';
  }

  return contentType.split('/')[1];
}

function isUploadAllowed(contentType) {
  const fileType = getFileType(contentType);

  return Object.keys(fileTypes).includes(fileType);
}

function getContentType(headers) {
  return headers['content-type'] || '';
}

module.exports = {
  getUUID,
  getFileType,
  isUploadAllowed,
  getContentType,
};
