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

  const fileType = getFileType(req.headers["content-type"]);
  const fileHash = `${Date.now()}${getUUID()}`;
  const fileName = `${fileHash}.${fileTypes[fileType]}`;
  const filePath = path.join(__dirname, fileName);
  const videoFile = fs.createWriteStream(filePath);

  const isFileTypeAllowed = Object.keys(fileTypes).includes(fileType);

  function convertAndDeleteVideo() {
    const resolvedDetails = resolveRoutes(pathname);

    hbjs
      .spawn({
        input: fileName,
        output: `${fileHash}.mp4`,
      })
      .on("end", () => {
        fs.unlink(filePath, (err) => {
          if (err) throw err;

          console.log("File deleted!");
        });

        res.statusCode = resolvedDetails.code;
        res.end(resolvedDetails.response);
      });
  }

  function handleFileDownload() {
    req.pipe(videoFile);
  }

  if (method === REQUEST_METHODS.post) {
    if (isFileTypeAllowed) {
      handleFileDownload();
      convertAndDeleteVideo();
    } else {
      res.statusCode = 422;
      res.end("Unprocessable Entity");
    }
  }
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
