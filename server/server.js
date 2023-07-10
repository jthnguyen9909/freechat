require("dotenv").config();
const express = require("express");
const PORT = process.env.PORT || 3001;

const { createServer } = require("http");
const { Server } = require("socket.io");
const path = require("path");

const { initGame, gameLoop, getUpdatedVelocity } = require("./utils/game");
const { FRAME_RATE } = require("./utils/constants");
const { makeId } = require("./utils/utils");

const app = express();
const httpServer = createServer(app);
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

const io = require("socket.io")();

const state = {};
const clientRooms = {};

io.on("connection", (client) => {
  client.on("keydown", handleKeyDown);
  client.on("newGame", handleNewGame);
  client.on("joinGame", handleJoinGame);

  client.on("test", handleTest);
  function handleTest() {
    console.log(clientRooms);
    console.log("servertest");
  }

  function handleNewGame() {
    let roomName = makeId(6);
    clientRooms[client.id] = roomName;
    client.emit("gameCode", roomName);

    state[roomName] = initGame();

    client.join(roomName);
    client.number = 1;
    client.emit("init", 1);
  }

  function handleJoinGame(roomName) {
    const room = io.sockets.adapter.rooms[roomName];

    let allUsers;
    if (room) {
      allUsers = room.sockets;
    }

    let numClients = 0;
    if (allUsers) {
      numClients = Object.keys(allUsers).length;
    }

    if (numClients === 0) {
      client.emit("unknownGame");
      return;
    } else if (numClients > 1) {
      client.emit("tooManyPlayers");
      return;
    }

    clientRooms[client.id] = roomName;
    client.join(roomName);
    client.number = 2;
    client.emit("init", 2);
    startGameInterval(roomName);
  }

  function handleKeyDown(keyCode) {
    const roomName = clientRooms[client.id];
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
      state[roomName].players[client.number - 1].vel = vel;
    }
  }
});

function startGameInterval(roomName) {
  const intervalId = setInterval(() => {
    const winner = gameLoop(state[roomName]);
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

io.listen(process.env.PORT || 3000);
app.listen(process.env.PORT || 3000);
