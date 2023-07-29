require("dotenv").config();

// game functionality
const { initGame, gameLoop, getUpdatedVelocity } = require("./utils/game");
const { FRAME_RATE } = require("./utils/constants");
const { makeId } = require("./utils/utils");
const routes = require("./controllers");

const express = require("express");
const path = require("path");
const session = require("express-session");
const sequelize = require("./config");
const SequelizeStore = require("connect-session-sequelize")(session.Store);

const PORT = process.env.PORT || 3001;
// const PORT = 3001;
const app = express();

const { createServer } = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    // Change the cors origin to the link of deployed app when deployed
    methods: ["GET", "POST"],
  },
});

app.use(express.static("public"));

const sess = {
  secret: "Super secret secret",
  cookie: {
    maxAge: 300000,
    httpOnly: true,
    secure: false,
    sameSite: "strict",
  },
  resave: false,
  saveUninitialized: true,
  store: new SequelizeStore({
    db: sequelize,
  }),
};
app.use(session(sess));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(routes);

const state = {};
const clientRooms = {};
const chatUsers = [];

io.on("connection", (socket) => {
  // socket.emit("initconnect", { data: "hello world" });

  // Global Chat Code
  // to single client
  socket.emit("message", "Welcome to ChatHub!");
  // broadcast to everyone except the user
  socket.on("userJoinMessage", (username) => {
    if (username) {
      socket.broadcast.emit("joinMessage", `${username} has joined the chat!`);
    }
  });
  // socket.broadcast.emit("joinMessage", "A user has joined the chat!");
  // io.emit() goes to everyone including user

  // runs when client disconnects
  // not sure when this is fired or how many times
  socket.on("disconnect", () => {
    // io.emit("message", "A user has left the chat.");
    removeUserBySocketId(chatUsers, socket.id);
    io.emit("userUpdate", chatUsers);
  });

  function removeUserBySocketId(chatUsers, socketId) {
    const indexToRemove = chatUsers.findIndex(
      (user) => user.socket_id === socketId
    );
    if (indexToRemove !== -1) {
      chatUsers.splice(indexToRemove, 1);
      console.log("removed user", socket.id);
    }
  }

  socket.on("userJoin", (username) => {
    if (username && isUsernameTaken(username)) {
      socket.emit("usernameError", "Username is already online.");
      console.log(`${username} is already online`);
    }
    if (username && !isUsernameTaken(username)) {
      // push seems to be able to send data over to client, but not
      // chatUsers[socket.id] = username;
      let newUser = { socket_id: socket.id, username: username };
      chatUsers.push(newUser);
    } else {
    }
    io.emit("userUpdate", chatUsers);
  });

  // checks if username is already in online array
  function isUsernameTaken(username) {
    return chatUsers.some((user) => user.username === username);
    // return Object.values(chatUsers).includes(username);
  }

  // listen for chatMessage
  socket.on("chatMessage", (msg, username) => {
    // socket.broadcast.emit("message", msg);
    io.emit("message", msg, username);
  });

  // snakeGame socket code
  socket.on("keydown", handleKeyDown);
  socket.on("newGame", handleNewGame);
  socket.on("joinGame", handleJoinGame);

  function handleNewGame() {
    let roomName = makeId(6);

    clientRooms[socket.id] = roomName;
    socket.emit("gameCode", roomName);

    state[roomName] = initGame();

    socket.join(roomName);
    socket.number = 1;
    socket.emit("init", 1);
  }

  function handleJoinGame(roomName) {
    // const room = io.sockets.adapter.rooms[roomName];

    // boolean
    const room = io.sockets.adapter.rooms.has(roomName.value);

    let allUsers;
    if (room) {
      // allUsers = room.sockets;
      allUsers = Array.from(socket.rooms);
    }

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

sequelize
  .sync()
  .then(() =>
    httpServer.listen(PORT, () => console.log(`App listening on port ${PORT}`))
  )
  .catch((err) => console.error(err));
