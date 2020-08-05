const socketIO = require("socket.io");

const chatRooms = {};

const onDoesChatExists = (roomName, answer) => {
  const exists = Object.values(chatRooms).includes(roomName);
  answer(exists);
  console.log("is chat", roomName, "exists?", exists);
};

const onChatCreated = (socket) => (roomName, cbk) => {
  chatRooms[socket.id] = roomName;
  cbk();
  console.log("chat", roomName, "created by", socket.id);
};

const onAskChatInvitation = (io) => (roomName, username) => {
  const creatorSocketId = Object.keys(chatRooms).find(
    (key) => chatRooms[key] === roomName
  );
  if (creatorSocketId) {
    io.to(creatorSocketId).emit("inviteToChat", username);
    console.log(
      "user",
      creatorSocketId,
      "must invite",
      username,
      "to chat",
      roomName
    );
  }
};

const onCloseChat = (io, socket) => () => {
  delete chatRooms[socket.id];
  io.emit("chatClosed");
};

const onDisconnect = (socket) => (reason) =>
  console.log("user", socket.id, "disconnect:", reason);

const onConnect = (io) => (socket) => {
  console.log("user connected", socket.id);

  socket.on("doesChatExists", onDoesChatExists);
  socket.on("chatCreated", onChatCreated(socket));
  socket.on("askChatInvitation", onAskChatInvitation(io));
  socket.on("closeChat", onCloseChat(io, socket));

  socket.on("disconnect", onDisconnect(io, socket));
};

module.exports = (server) => {
  const io = socketIO(server);
  io.on("connection", onConnect(io));
};
