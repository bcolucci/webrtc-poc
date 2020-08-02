const https = require("https");
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const expressJwt = require("express-jwt");
const jwt = require("jsonwebtoken");
const shortid = require("shortid");
const { readFileSync } = require("fs");
const dotenv = require("dotenv");
const twilio = require("twilio");

const users = require("./users.json");

dotenv.config();

const { SERVER_HOST, SERVER_PORT } = process.env;

const {
  TWILIO_ACCOUNT_SID,
  TWILIO_API_KEY_SID,
  TWILIO_API_KEY_SECRET,
} = process.env;

const JWT_HASH_ALGO = "RS256";

const AccessToken = twilio.jwt.AccessToken;
const VideoGrant = AccessToken.VideoGrant;

const sslKey = readFileSync(__dirname + "/ssl/server.key");
const sslCert = readFileSync(__dirname + "/ssl/server.cert");

const httpOpts = {
  key: sslKey,
  cert: sslCert,
};

const login = ({ username, password }) =>
  users.find((u) => u.username === username && u.password == password);

const app = express();
app.use(cors({ origin: `*`, optionsSuccessStatus: 200 }));

app.use(bodyParser.json());
app.use(
  expressJwt({ secret: sslKey, algorithms: [JWT_HASH_ALGO] }).unless({
    path: ["/auth"],
  })
);

app.post("/auth", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).end();
  }
  const user = login({ username, password });
  if (!user) {
    return res.status(401).end();
  }
  const token = jwt.sign(user, sslKey, { algorithm: JWT_HASH_ALGO });
  res.json(token);
});

app.get("/me", (req, res) => {
  const user = { ...req.user };
  delete user.password;
  res.json(user);
});

app.get("/token", (req, res) => {
  const { user } = req;

  let { roomName } = req.query;
  if (!roomName) {
    roomName = shortid();
  }

  const grant = new VideoGrant();
  grant.room = roomName;

  const accessToken = new AccessToken(
    TWILIO_ACCOUNT_SID,
    TWILIO_API_KEY_SID,
    TWILIO_API_KEY_SECRET
  );
  accessToken.identity = user.username;
  accessToken.addGrant(grant);

  const token = accessToken.toJwt();

  res.json({ roomName, token });
});

https.createServer(httpOpts, app).listen(SERVER_PORT, "0.0.0.0", () => {
  console.log(
    "Access token server listening on",
    "https://" + SERVER_HOST + ":" + SERVER_PORT
  );
});
