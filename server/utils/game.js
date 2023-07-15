const { GRID_SIZE } = require("./constants.js");

function initGame() {
  const state = createGameState();
  randomFood(state);
  return state;
}

function createGameState() {
  return {
    players: [
      {
        pos: {
          x: 3,
          y: 10,
        },
        vel: { x: 1, y: 0 },
        snake: [
          { x: 1, y: 10 },
          { x: 2, y: 10 },
          { x: 3, y: 10 },
        ],
      },
      {
        pos: {
          x: 16,
          y: 8,
        },
        vel: { x: -1, y: 0 },
        snake: [
          { x: 18, y: 8 },
          { x: 17, y: 8 },
          { x: 16, y: 8 },
        ],
      },
    ],
    food: {},
    gridSize: GRID_SIZE,
  };
}

function gameLoop(state) {
  if (!state) {
    return;
  }

  const playerOne = state.players[0];
  const playerTwo = state.players[1];

  // update player position by velocity
  playerOne.pos.x += playerOne.vel.x;
  playerOne.pos.y += playerOne.vel.y;

  playerTwo.pos.x += playerTwo.vel.x;
  playerTwo.pos.y += playerTwo.vel.y;

  // if playerOne goes to edge of grid, they lose
  if (
    playerOne.pos.x < 0 ||
    playerOne.pos.x > GRID_SIZE ||
    playerOne.pos.y < 0 ||
    playerOne.pos.y > GRID_SIZE
  ) {
    // playerOne loss
    return 2;
  }

  if (
    playerTwo.pos.x < 0 ||
    playerTwo.pos.x > GRID_SIZE ||
    playerTwo.pos.y < 0 ||
    playerTwo.pos.y > GRID_SIZE
  ) {
    // playerTwo loss
    return 1;
  }

  // if the head of playerOne's snake reaches food, elongate snake by push & update position
  if (state.food.x === playerOne.pos.x && state.food.y === playerOne.pos.y) {
    playerOne.snake.push({ ...playerOne.pos });
    playerOne.pos.x += playerOne.vel.x;
    playerOne.pos.y += playerOne.vel.y;
    // generate new food item
    randomFood(state);
  }

  if (state.food.x === playerTwo.pos.x && state.food.y === playerTwo.pos.y) {
    playerTwo.snake.push({ ...playerTwo.pos });
    playerTwo.pos.x += playerTwo.vel.x;
    playerTwo.pos.y += playerTwo.vel.y;
    // generate new food item
    randomFood(state);
  }

  // make sure the snake is moving and hasn't bumped into itself
  if (playerOne.vel.x || playerOne.vel.y) {
    for (let cell of playerOne.snake) {
      // case where head bumps (overlaps) into cell in body of the snake
      if (cell.x === playerOne.pos.x && cell.y === playerOne.pos.y) {
        return 2;
      }
    }

    // if game hasn't ended, move snake forward by pushing new value and shifting off end
    playerOne.snake.push({ ...playerOne.pos });
    playerOne.snake.shift();
  }

  if (playerTwo.vel.x || playerTwo.vel.y) {
    for (let cell of playerTwo.snake) {
      if (cell.x === playerTwo.pos.x && cell.y === playerTwo.pos.y) {
        return 1;
      }
    }
    playerTwo.snake.push({ ...playerTwo.pos });
    playerTwo.snake.shift();
  }
  return false;
}

function randomFood(state) {
  food = {
    x: Math.floor(Math.random() * GRID_SIZE),
    y: Math.floor(Math.random() * GRID_SIZE),
  };

  // returns random food until food is on a different space to player.snake
  for (let cell of state.players[0].snake) {
    if ((cell.x === food.x ** cell.y) === food.y) {
      return randomFood(state);
    }
  }

  for (let cell of state.players[1].snake) {
    if ((cell.x === food.x ** cell.y) === food.y) {
      return randomFood(state);
    }
  }

  state.food = food;
}

// change velocity based on player input
function getUpdatedVelocity(keyCode) {
  switch (keyCode) {
    // left
    case 37: {
      return { x: -1, y: 0 };
    }
    // down
    case 38: {
      return { x: 0, y: -1 };
    }
    // right
    case 39: {
      return { x: 1, y: 0 };
    }
    // up
    case 40: {
      return { x: 0, y: 1 };
    }
  }
}

module.exports = {
  initGame,
  gameLoop,
  getUpdatedVelocity,
};
