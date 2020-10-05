const { Engine, Render, Runner, World, Bodies, Body, Events } = Matter;

// Constants **************

const cellsHorizontal = 12;
const cellsVertical = 11;
const width = window.innerWidth - 5;
const height = window.innerHeight - 4;
const unitLengthX = width / cellsHorizontal;
const unitLengthY = height / cellsVertical;

//***************** */

const engine = Engine.create();
engine.world.gravity.y = 0;
const { world } = engine;
const render = Render.create({
  element: document.body,
  engine,
  options: {
    width,
    height,
    wireframes: false,
  },
});

Render.run(render);
Runner.run(Runner.create(), engine);

// Walls
const walls = [
  // [x, y, w, h]
  Bodies.rectangle(width / 2, 0, width, 2, { isStatic: true }), // top
  Bodies.rectangle(width / 2, height, width, 2, { isStatic: true }), // bottom
  Bodies.rectangle(width, height / 2, 2, height, { isStatic: true }), // right
  Bodies.rectangle(0, height / 2, 2, height, { isStatic: true }), // left
];
// adding walls
World.add(world, walls);

// Maze Generations
const shuffle = (arr) => {
  let counter = arr.length;

  while (counter > 0) {
    const index = Math.floor(Math.random() * counter);
    counter--;

    const temp = arr[counter];
    arr[counter] = arr[index];
    arr[index] = temp;
  }

  return arr;
};

const grid = Array(cellsVertical)
  .fill(null)
  .map(() => Array(cellsHorizontal).fill(false));

// for (let i = 0; i < 3; i++) {
//   grid.push([]);
//   for (let j = 0; j < 3; j++) {
//     grid[i].push(false);
//   }
// }

const verticals = Array(cellsVertical)
  .fill(null)
  .map(() => Array(cellsHorizontal - 1).fill(false));

const horizontals = Array(cellsVertical - 1)
  .fill(null)
  .map(() => Array(cellsHorizontal).fill(false));

// Pick a RndIdx Starting Cell

const startRow = Math.floor(Math.random() * cellsVertical);
const startColumn = Math.floor(Math.random() * cellsHorizontal);

const recuringThroughCells = (row, column) => {
  // if i have visited the cell at [row, column], then return
  if (grid[row][column]) {
    return;
  }
  // Mark this cell as being VISITED
  grid[row][column] = true;
  //  Assemble randomly-ordered list of neighbors
  const neighbors = shuffle([
    [row - 1, column, 'up'],
    [row, column + 1, 'right'],
    [row + 1, column, 'down'],
    [row, column - 1, 'left'],
  ]);
  // For each neighbor
  for (let neighbor of neighbors) {
    const [nextRow, nextColumn, direction] = neighbor;
    //  See if that neighbor is out of bounds
    if (
      nextRow < 0 ||
      nextRow >= cellsVertical ||
      nextColumn < 0 ||
      nextColumn >= cellsHorizontal
    ) {
      continue; // Skip over the current loops
    }

    // If we have visited that neighbor, Continue to next neighbor
    if (grid[nextRow][nextColumn]) {
      continue; // Skip over the current loops
    }

    //  Remove a wall from either horizontals or verticals
    if (direction === 'left') {
      verticals[row][column - 1] = true;
    } else if (direction === 'right') {
      verticals[row][column] = true;
    } else if (direction === 'up') {
      horizontals[row - 1][column] = true;
    } else if (direction === 'down') {
      horizontals[row][column] = true;
    }

    // Visit that next cell
    recuringThroughCells(nextRow, nextColumn);
  }
};

recuringThroughCells(startRow, startColumn);

// Display the maze
horizontals.forEach((row, rowIndex) => {
  row.forEach((open, columnIndex) => {
    if (open) {
      return;
    }

    const wall = Bodies.rectangle(
      columnIndex * unitLengthX + unitLengthX / 2,
      rowIndex * unitLengthY + unitLengthY,
      unitLengthX,
      5,
      { isStatic: true, label: 'wall' }
    );

    World.add(world, wall);
  });
});

verticals.forEach((row, rowIndex) => {
  row.forEach((open, columnIndex) => {
    if (open) {
      return;
    }

    const wall = Bodies.rectangle(
      columnIndex * unitLengthX + unitLengthX,
      rowIndex * unitLengthY + unitLengthY / 2,
      5,
      unitLengthY,
      { isStatic: true, label: 'wall' }
    );

    World.add(world, wall);
  });
});

// Drawing the main target for goal to win
const goal = Bodies.rectangle(
  width - unitLengthX / 2,
  height - unitLengthY / 2,
  unitLengthX * 0.7,
  unitLengthY * 0.7,
  { isStatic: true, label: 'goal', render: { fillStyle: 'green' } }
);
World.add(world, goal);

// Ball
const ballRadius = Math.min(unitLengthX, unitLengthY) / 3;
const ball = Bodies.circle(unitLengthX / 2, unitLengthY / 2, ballRadius, {
  label: 'ball',
});
World.add(world, ball);

// Handling Movement
document.addEventListener('keydown', (e) => {
  const { x, y } = ball.velocity;

  if (e.key === 'w' || e.key === 'ArrowUp') {
    Body.setVelocity(ball, { x, y: y - 5 }); // move up
  } else if (e.key === 'a' || e.key === 'ArrowLeft') {
    Body.setVelocity(ball, { x: x - 5, y }); // move left
  } else if (e.key === 'd' || e.key === 'ArrowRight') {
    Body.setVelocity(ball, { x: x + 5, y }); // move right
  } else if (e.key === 's' || e.key === 'ArrowDown') {
    Body.setVelocity(ball, { x, y: y + 5 }); // move down
  }
});

// Win Conditions
Events.on(engine, 'collisionStart', (e) => {
  e.pairs.forEach((collision) => {
    const labels = ['ball', 'goal'];
    if (
      labels.includes(collision.bodyA.label) &&
      labels.includes(collision.bodyB.label)
    ) {
      // alert('USER WON');
      world.gravity.y = 1;
      world.bodies.forEach((body) => {
        if (body.label === 'wall') {
          Body.setStatic(body, false);
        }
      });
    }
  });
});
