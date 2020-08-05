const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const expressJwt = require("express-jwt");
const jwt = require("jsonwebtoken");
const { readFileSync } = require("fs");
const generateToken = require("./generateToken");
const users = require("./users.json");

const JWT_HASH_ALGO = "RS256";

const sslKey = readFileSync(__dirname + "/ssl/server.key");

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
  const { roomName } = req.query;
  res.json(generateToken({ user, roomName }));
});

module.exports = app;
