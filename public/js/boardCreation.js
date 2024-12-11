const BOARD_SIZE = 10;
const CELL_SIZE = 50;
const DIFFICULTY = {
  0: "Multiplayer",
  1: "Easy",
  2: "Medium",
  3: "Hard",
  4: "Impossible",
};
const SHIPS = [
  { name: "Carrier", size: 5 },
  { name: "Battleship", size: 4 },
  { name: "Cruiser", size: 3 },
  { name: "Destroyer", size: 3 },
  { name: "Patrol", size: 2 },
];

let selectedShip = null;
let isVertical = false;
let placedShips = new Map();

function createBoard(id) {
  const board = d3
    .select(id)
    .append("svg")
    .attr("width", BOARD_SIZE * CELL_SIZE)
    .attr("height", BOARD_SIZE * CELL_SIZE);

  // Create grid
  for (let i = 0; i < BOARD_SIZE; i++) {
    for (let j = 0; j < BOARD_SIZE; j++) {
      board
        .append("rect")
        .attr("class", "cell")
        .attr("x", j * CELL_SIZE)
        .attr("y", i * CELL_SIZE)
        .attr("width", CELL_SIZE)
        .attr("height", CELL_SIZE)
        .attr("data-x", j)
        .attr("data-y", i);
    }
  }

  SHIPS.forEach((ship, index) => {
    board
      .append("image")
      .attr("visibility", "hidden")
      .attr("x", -1)
      .attr("y", -1)
      .attr("width", ship.size * CELL_SIZE)
      .attr("height", CELL_SIZE)
      .attr("href", "images\\" + ship.name + ".png")
      .attr("data-size", ship.size)
      .attr("data-name", ship.name);
  });

  return board;
}
