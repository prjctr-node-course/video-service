const statusCodes = {
  success: 200,
  notFound: 404,
  notAllowed: 405,
  unsupportedMedia: 415,
};

const fileTypes = {
  'x-msvideo': 'avi',
  quicktime: 'mov',
  mp4: '.mp4',
};

module.exports = {
  statusCodes,
  fileTypes,
};
