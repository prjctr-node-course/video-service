const http = require("http");
const url = require("url");
const fs = require("fs");
const crypto = require("crypto");
const path = require("path");
const ffmpeg = require("fluent-ffmpeg");

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
};

const REQUEST_METHODS = {
  get: "GET",
  post: "POST",
  delete: "DELETE",
};

const fileTypes = ["quicktime", "x-msvideo", "mp4"];

function getUUID() {
  return crypto.randomBytes(16).toString("hex");
}

function getFileType(contentType) {
  if (!contentType) {
    return "";
  }

  return contentType.split("/")[1];
}

function uploadRoute() {
  return {
    response: "Upload route",
    code: STATUS_CODES.success,
  };
}

function notFoundRoute() {
  return {
    response: "Not found",
    code: STATUS_CODES.notFound,
  };
}

function resolveRoutes(pathname) {
  switch (pathname) {
    case ROUTES.upload:
      return uploadRoute();

    default:
      return notFoundRoute();
  }
}

const server = http.createServer((req, res) => {
  const pathname = url.parse(req.url, false).pathname;
  const method = req.method;

  const fileName = `${Date.now()}${getUUID()}.mp4`;
  const filePath = path.join(__dirname, fileName);
  const videoFile = fs.createWriteStream(filePath);

  console.log(req.headers["content-type"]);

  const fileType = getFileType(req.headers["content-type"]);
  const isFileTypeAllowed = fileTypes.includes(fileType);

  if (method === REQUEST_METHODS.post) {
    const resolvedDetails = resolveRoutes(pathname);

    if (isFileTypeAllowed) {
      req.pipe(videoFile).on("finish", () => {
        res.statusCode = resolvedDetails.code;
        res.end(resolvedDetails.response);
      });
    } else {
      res.statusCode = 422;
      res.end("Unprocessable Entity");
    }
  }
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
