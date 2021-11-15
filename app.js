const http = require("http");
const url = require("url");
const fs = require("fs");
const crypto = require("crypto");
const path = require("path");
const hbjs = require("handbrake-js");

const hostname = "127.0.0.1";
const port = 3000;
const ROUTES = {
  main: "/",
  upload: "/upload",
};

const STATUS_CODES = {
  success: 200,
  notFound: 404,
  notAllowed: 405,
  unsupportedMedia: 415,
};

const REQUEST_METHODS = {
  get: "GET",
  post: "POST",
  delete: "DELETE",
};

const fileTypes = {
  "x-msvideo": "avi",
  quicktime: "mov",
  mp4: ".mp4",
};

function getUUID() {
  return crypto.randomBytes(16).toString("hex");
}

function getFileType(contentType) {
  if (!contentType) {
    return "";
  }

  return contentType.split("/")[1];
}

function resolvePostRoutes(req, res, fileDetails, pathname) {
  switch (pathname) {
    case ROUTES.upload:
      uploadRoute(req, res, fileDetails);
      break;

    default:
      notFoundRoute(res);
      break;
  }
}

async function uploadRoute(req, res, fileDetails) {
  await handleFileDownload(req, fileDetails.filePath);
  await convertAndDeleteVideo(res, fileDetails);
}

function notFoundRoute(res) {
  res.statusCode = STATUS_CODES.notFound;
  res.end("Not found");
}

function removeFile(filePath) {
  fs.unlink(filePath, (err) => {
    if (err) throw err;

    console.log("File deleted!");
  });
}

function convertAndDeleteVideo(res, fileDetails) {
  hbjs
    .spawn({
      input: fileDetails.fileName,
      output: `${fileDetails.fileHash}.mp4`,
    })
    .on("error", () => {
      removeFile(fileDetails.filePath);
    })
    .on("end", () => {
      removeFile(fileDetails.filePath);

      res.statusCode = STATUS_CODES.success;
      res.end("Upload route");
    });
}

async function handleFileDownload(req, filePath) {
  const videoFile = fs.createWriteStream(filePath);

  await new Promise((resolve, reject) => {
    req
      .pipe(videoFile)
      .on("error", (error) => {
        reject(error);
      })
      .on("finish", () => {
        resolve();
      });
  });
}

const server = http.createServer((req, res) => {
  const pathname = url.parse(req.url, false).pathname;
  const method = req.method;

  const fileType = getFileType(req.headers["content-type"]);
  const fileHash = `${Date.now()}${getUUID()}`;
  const fileName = `${fileHash}.${fileTypes[fileType]}`;

  const fileDetails = {
    fileHash,
    fileName,
    filePath: path.join(__dirname, fileName),
  };

  const isFileTypeAllowed = Object.keys(fileTypes).includes(fileType);

  function resolveStatus(status, msg) {
    res.statusCode = status;
    res.end(msg);
  }

  switch (method) {
    case REQUEST_METHODS.post:
      if (!isFileTypeAllowed) {
        resolveStatus(STATUS_CODES.unsupportedMedia, "Unsupported Media Type");

        return;
      }

      resolvePostRoutes(req, res, fileDetails, pathname);
      break;

    case REQUEST_METHODS.get:
    case REQUEST_METHODS.delete:
      resolveStatus(STATUS_CODES.notAllowed, "Method Not Allowed");
      break;

    default:
      resolveStatus(STATUS_CODES.notAllowed, "Method Not Allowed");
      break;
  }
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
