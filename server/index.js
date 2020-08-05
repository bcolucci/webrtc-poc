require("dotenv").config();

const https = require("https");
const { readFileSync } = require("fs");
const app = require("./app");
const connectSocket = require("./connectSocket");

const { SERVER_HOST, SERVER_PORT } = process.env;

const sslKey = readFileSync(__dirname + "/ssl/server.key");
const sslCert = readFileSync(__dirname + "/ssl/server.cert");

const httpOpts = {
  key: sslKey,
  cert: sslCert,
};

const server = https.createServer(httpOpts, app);
connectSocket(server);

server.listen(SERVER_PORT, "0.0.0.0", () => {
  console.log(
    "Server listening on",
    "https://" + SERVER_HOST + ":" + SERVER_PORT
  );
});
