const {
  Engine,
  Render,
  Runner,
  World,
  Bodies,
  MouseConstraint,
  Mouse,
} = Matter;

// Constaints
const width = 800;
const height = 600;

const engine = Engine.create();
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
// mouse event
World.add(
  world,
  MouseConstraint.create(engine, {
    mouse: Mouse.create(render.canvas),
  })
);

// Walls
const walls = [
  // [x, y, w, h]
  Bodies.rectangle(400, 0, 800, 40, { isStatic: true }), // top
  Bodies.rectangle(400, 600, 800, 40, { isStatic: true }), // bottom
  Bodies.rectangle(800, 300, 40, 600, { isStatic: true }), // right
  Bodies.rectangle(0, 300, 40, 600, { isStatic: true }), // left
];
// adding walls
World.add(world, walls);

// add Rectangle at random
for (let i = 0; i < 20; i++) {
  if (Math.random() > 0.5) {
    World.add(
      world,
      Bodies.rectangle(Math.random() * width, Math.random() * height, 50, 50)
    );
  } else {
    World.add(
      world,
      Bodies.circle(Math.random() * width, Math.random() * height, 35, 50)
    );
  }
}
