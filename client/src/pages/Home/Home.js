import SnakeGame from "../../components/snakeGame";
import React, { useState } from "react";
const { io } = require("socket.io-client");

const BG_COLOR = "#231f20";
const SNAKE_COLOR = "#c2c2c2";
const FOOD_COLOR = "#e66916";

const gameScreen = document.getElementById("gameScreen");
const initialScreen = document.getElementById("initialScreen");
// const newGameBtn = document.getElementById("newGameButton");
// const joinGameBtn = document.getElementById("joinGameButton");
const gameCodeInput = document.getElementById("gameCodeInput");
const gameCodeDisplay = document.getElementById("gameCodeDisplay");

// const testBtn = document.getElementById("testButton");

// newGameBtn.addEventListener("click", newGame);
// joinGameBtn.addEventListener("click", joinGame);
// testBtn.addEventListener("click", testRoom);

function newGame() {
  socket.emit("newGame");
  init();
}

function joinGame() {
  const code = gameCodeInput.value;
  socket.emit("joinGame", code);
  init();
}

function testRoom() {
  socket.emit("test");
  // console.log("test");
  // console.log(gameScreen);
  handleCanvas();
  init();
  console.log(canvas, ctx);
}

const socket = io("http://localhost:3000/");

socket.on("init", handleInit);
socket.on("gameState", handleGameState);
socket.on("gameOver", handleGameOver);
socket.on("gameCode", handleGameCode);
socket.on("unknownGame", handleUnknownGame);
socket.on("tooManyPlayers", handleTooManyPlayers);

let canvas, ctx;
let playerNumber;
let gameActive = false;

// init
function init() {
  // initialScreen.style.display = "none";
  // gameScreen.style.display = "block";

  // grabs canvas element by id
  // canvas = document.getElementById("canvas");
  ctx = canvas.getContext("2d");
  console.log(canvas);
  console.log(ctx);

  // adjusts canvas width and height to be fixed
  canvas.width = canvas.height = 600;

  // fill in canvas element with BG_COLOR
  ctx.fillStyle = BG_COLOR;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  document.addEventListener("keydown", keydown);
  gameActive = true;
}

const handleCanvas = () => {
  canvas = document.getElementById("canvas");
  console.log("test", canvas);
};

function keydown(e) {
  socket.emit("keydown", e.keyCode);
}

function paintGame(state) {
  ctx.fillStyle = BG_COLOR;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const food = state.food;
  const gridSize = state.gridSize;
  const size = canvas.width / gridSize;

  ctx.fillStyle = FOOD_COLOR;
  ctx.fillRect(food.x * size, food.y * size, size, size);

  paintPlayer(state.players[0], size, SNAKE_COLOR);
  paintPlayer(state.players[1], size, "red");
}

function paintPlayer(playerState, size, color) {
  const snake = playerState.snake;

  ctx.fillStyle = color;
  for (let cell of snake) {
    ctx.fillRect(cell.x * size, cell.y * size, size, size);
  }
}

// paintGame(gameState);

function handleInit(number) {
  playerNumber = number;
}

function handleGameState(gameState) {
  if (!gameActive) {
    return;
  }
  gameState = JSON.parse(gameState);
  requestAnimationFrame(() => paintGame(gameState));
}

function handleGameOver(data) {
  if (!gameActive) {
    return;
  }
  data = JSON.parse(data);
  if (data.winner === playerNumber) {
    alert("You Win!");
  } else {
    alert("You Lose");
  }
  gameActive = false;
}

function handleGameCode(gameCode) {
  gameCodeDisplay.innerText = gameCode;
}

function handleUnknownGame() {
  reset();
  alert("Unknown game code");
}

function handleTooManyPlayers() {
  reset();
  alert("Game already in progress");
}

function reset() {
  playerNumber = null;
  gameCodeInput.value = "";
  gameCodeDisplay.innerText = "";
  initialScreen.style.display = "block";
  gameScreen.style.display = "none";
}

export default function Home() {
  const [showGame, setShowGame] = React.useState(false);
  const revealGame = () => {
    setShowGame(true);
  };

  const [hide, setHide] = React.useState({ display: "block" });
  const hideScreen = () => {
    setHide({ display: "none" });
  };
  const [unhide, setUnhide] = React.useState({ display: "none" });
  const unHideScreen = () => {
    setUnhide({ display: "block" });
  };

  return (
    <div className="App">
      <section className="vh-100">
        <div className="container h-100">
          {/* {!showGame ? (
            <>
              <div id="initialScreen" className="h-100">
                <div className="d-flex flex-column align-items-center justify-content-center h-100">
                  <h1>Multiplayer Snake</h1>
                  <button
                    type="submit"
                    className="btn btn-success"
                    id="newGameButton"
                    onClick={() => {
                      revealGame();
                      newGame();
                    }}
                  >
                    Create New Game
                  </button>
                  <div>OR</div>
                  <div className="form-group">
                    <input
                      type="text"
                      placeholder="Enter Game Code"
                      id="gameCodeInput"
                    />
                  </div>
                  <button
                    type="submit"
                    className="btn btn-success"
                    id="joinGameButton"
                    onClick={() => {
                      revealGame();
                      joinGame();
                    }}
                  >
                    Join Game
                  </button>
                  <button
                    type="submit"
                    className="btn btn-success"
                    id="testButton"
                    onClick={() => {
                      revealGame();
                      testRoom();
                    }}
                  >
                    Test rooms
                  </button>
                </div>
              </div>
              <div id="gameScreen" className="h-100">
                <div className="d-flex flex-column align-items-center justify-content-center h-100">
                  <h1>
                    Your game code is: <span id="gameCodeDisplay"></span>
                  </h1>

                  <canvas id="canvas"></canvas>
                </div>
              </div>
            </>
          ) : (
            <div id="gameScreen" className="h-100">
              <div className="d-flex flex-column align-items-center justify-content-center h-100">
                <h1>
                  Your game code is: <span id="gameCodeDisplay"></span>
                </h1>

                <canvas id="canvas"></canvas>
              </div>
            </div>
          )} */}
          <>
            <div id="initialScreen" className="h-100" style={hide}>
              <div className="d-flex flex-column align-items-center justify-content-center h-100">
                <h1>Multiplayer Snake</h1>
                <button
                  type="submit"
                  className="btn btn-success"
                  id="newGameButton"
                  onClick={() => {
                    revealGame();
                    newGame();
                  }}
                >
                  Create New Game
                </button>
                <div>OR</div>
                <div className="form-group">
                  <input
                    type="text"
                    placeholder="Enter Game Code"
                    id="gameCodeInput"
                  />
                </div>
                <button
                  type="submit"
                  className="btn btn-success"
                  id="joinGameButton"
                  onClick={() => {
                    revealGame();
                    joinGame();
                  }}
                >
                  Join Game
                </button>
                <button
                  type="submit"
                  className="btn btn-success"
                  id="testButton"
                  onClick={() => {
                    // revealGame();
                    hideScreen();
                    unHideScreen();
                    testRoom();
                  }}
                >
                  Test rooms
                </button>
              </div>
            </div>
            <div id="gameScreen" className="h-100" style={unhide}>
              <div className="d-flex flex-column align-items-center justify-content-center h-100">
                <h1>
                  Your game code is: <span id="gameCodeDisplay"></span>
                </h1>

                <canvas id="canvas"></canvas>
              </div>
            </div>
          </>
        </div>
      </section>
    </div>
  );
}
