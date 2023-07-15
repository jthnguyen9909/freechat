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

const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000", // Change the cors origin to the link of deployed app when deployed
    methods: ["GET", "POST"],
  },
});

app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

const state = {};
const clientRooms = {};

io.on("connection", (socket) => {
  // socket.emit("initconnect", { data: "hello world" });

  socket.on("keydown", handleKeyDown);
  socket.on("newGame", handleNewGame);
  socket.on("joinGame", handleJoinGame);

  socket.on("testcall", handleTest);
  function handleTest() {
    console.log("servertest");
    console.log(clientRooms);
  }

  function handleNewGame() {
    let roomName = makeId(6);

    clientRooms[socket.id] = roomName;
    socket.emit("gameCode", roomName);

    state[roomName] = initGame();

    socket.join(roomName);
    socket.number = 1;
    socket.emit("init", 1);
    // console.log(roomName);
    console.log(clientRooms[socket.id]);
    // console.log("test", io.sockets.adapter.rooms.get(roomName));
  }

  function handleJoinGame(roomName) {
    // const room = io.sockets.adapter.rooms[roomName];
    // const room = io.sockets.adapter.rooms.get(roomName);

    // console.log(roomName);

    const room = io.sockets.adapter.rooms.has(roomName.value);

    // console.log("array", Array.from(socket.rooms));
    let allUsers;
    if (room) {
      // allUsers = room.sockets;
      allUsers = Array.from(socket.rooms);
    }
    console.log("room", room, "allUsers", allUsers);

    let numClients = 0;
    if (allUsers) {
      numClients = Object.keys(allUsers).length;
    }

    if (numClients === 0) {
      socket.emit("unknownGame");
      return;
    } else if (numClients > 1) {
      socket.emit("tooManyPlayers");
      return;
    }

    clientRooms[socket.id] = roomName.value;
    socket.join(roomName.value);
    socket.number = 2;
    socket.emit("init", 2);
    startGameInterval(roomName.value);
  }

  function handleKeyDown(keyCode) {
    const roomName = clientRooms[socket.id];
    if (!roomName) {
      return;
    }

    try {
      keyCode = parseInt(keyCode);
    } catch (err) {
      console.log(err);
    }

    const vel = getUpdatedVelocity(keyCode);

    if (vel) {
      state[roomName].players[socket.number - 1].vel = vel;
    }
  }
});

function startGameInterval(roomName) {
  const intervalId = setInterval(() => {
    const winner = gameLoop(state[roomName]);
    console.log(gameLoop(state[roomName]));
    // win check to see if there is a winner at specific interval of game
    if (!winner) {
      emitGameState(roomName, state[roomName]);
    } else {
      emitGameOver(roomName, winner);
      state[roomName] = null;
      clearInterval(intervalId);
    }
  }, 1000 / FRAME_RATE);
}

function emitGameState(room, gameState) {
  // Send this event to everyone in the room.
  io.sockets.in(room).emit("gameState", JSON.stringify(gameState));
}

function emitGameOver(room, winner) {
  io.sockets.in(room).emit("gameOver", JSON.stringify({ winner }));
}

// io.listen(process.env.PORT || 3000);
// app.listen(process.env.PORT || 3000);

httpServer.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
