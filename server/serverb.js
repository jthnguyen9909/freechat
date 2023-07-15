require("dotenv").config();

// game functionality
const { initGame, gameLoop, getUpdatedVelocity } = require("./utils/game");
const { FRAME_RATE } = require("./utils/constants");
const { makeId } = require("./utils/utils");

const express = require("express");
const path = require("path");
const PORT = process.env.PORT || 3001;
const app = express();

const { createServer } = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const httpServer = createServer(app);

// const io = new Server(httpServer);

const io = require("socket.io")(httpServer, {
  cors: {
    origin: "http://localhost:3000",
  },
});

// const io = new Server(httpServer, {
//   cors: {
//     origin: "*", // Change the cors origin to the link of deployed app when deployed
//     methods: ["GET", "POST"],
//   },
// });

app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// io.attachApp(httpServer);

const state = {};
const clientRooms = {};

io.on("connection", (socket) => {
  socket.emit("init", { data: "hello world" });

  // socket.on("keydown", handleKeyDown);
  // socket.on("newGame", handleNewGame);
  // socket.on("joinGame", handleJoinGame);
});

httpServer.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
