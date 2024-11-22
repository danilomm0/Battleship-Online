const BOARD_SIZE = 10;
const CELL_SIZE = 50;
const DIFFICULTY = { 1: "Easy", 2: "Medium", 3: "Hard", 4: "Impossible" };
const SHIPS = [
  { name: "Carrier", size: 5 },
  { name: "Battleship", size: 4 },
  { name: "Cruiser", size: 3 },
  { name: "Submarine", size: 3 },
  { name: "Destroyer", size: 2 },
];

let selectedShip = null;
let isVertical = false;
let placedShips = new Map();

// Initialize the game board
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

  return board;
}

const board = createBoard("#playerBoard");

// Initialize ship dock
const shipDock = d3
  .select("#ship-dock")
  .append("svg")
  .attr("width", "100%")
  .attr("height", SHIPS.length * (CELL_SIZE + 30));

// Create draggable ships
SHIPS.forEach((ship, index) => {
  const shipGroup = shipDock
    .append("g")
    .attr("class", "ship-group")
    .attr("transform", `translate(10, ${index * (CELL_SIZE + 20)})`);

  shipGroup
    .append("rect")
    .attr("class", "ship")
    .attr("width", ship.size * CELL_SIZE)
    .attr("height", CELL_SIZE)
    .attr("data-size", ship.size)
    .attr("data-name", ship.name);
});

// Drag behavior
const drag = d3
  .drag()
  .on("start", dragStarted)
  .on("drag", dragging)
  .on("end", dragEnded);

d3.selectAll(".ship").call(drag);

function dragStarted(event, d) {
  selectedShip = d3.select(this);
  selectedShip.classed("dragging", true);
}

function dragging(event, d) {
  const shipSize = parseInt(selectedShip.attr("data-size"));
  const [mouseX, mouseY] = d3.pointer(event, board.node());
  const gridX = Math.floor(mouseX / CELL_SIZE);
  const gridY = Math.floor(mouseY / CELL_SIZE);

  // Clear previous hover states
  d3.selectAll(".cell-hover, .cell-invalid").attr("class", "cell");

  // Check if placement is valid
  const isValid = isValidPlacement(gridX, gridY, shipSize);
  const cells = getCellsForShip(gridX, gridY, shipSize);

  cells.forEach(([x, y]) => {
    if (x >= 0 && x < BOARD_SIZE && y >= 0 && y < BOARD_SIZE) {
      const cell = board.select(`rect[data-x="${x}"][data-y="${y}"]`);
      cell.attr("class", isValid ? "cell-hover" : "cell-invalid");
    }
  });
}

function dragEnded(event, d) {
  const [mouseX, mouseY] = d3.pointer(event, board.node());
  const gridX = Math.floor(mouseX / CELL_SIZE);
  const gridY = Math.floor(mouseY / CELL_SIZE);
  const shipSize = parseInt(selectedShip.attr("data-size"));
  const shipName = selectedShip.attr("data-name");

  // Clear hover states
  d3.selectAll(".cell-hover, .cell-invalid").attr("class", "cell");

  if (isValidPlacement(gridX, gridY, shipSize)) {
    placeShip(gridX, gridY, shipSize, shipName);
    selectedShip.remove();
    updateStartButton();
    isVertical = false;
  }

  selectedShip.classed("dragging", false);
  selectedShip = null;
}

function isValidPlacement(x, y, size) {
  if (x < 0 || y < 0) return false;

  const cells = getCellsForShip(x, y, size);
  return cells.every(
    ([x, y]) =>
      x >= 0 && x < BOARD_SIZE && y >= 0 && y < BOARD_SIZE && !isOccupied(x, y)
  );
}

function getCellsForShip(x, y, size) {
  const cells = [];
  for (let i = 0; i < size; i++) {
    cells.push(isVertical ? [x, y + i] : [x + i, y]);
  }
  return cells;
}

function isOccupied(x, y) {
  return Array.from(placedShips.values()).some((ship) =>
    ship.cells.some(([shipX, shipY]) => shipX === x && shipY === y)
  );
}

function placeShip(x, y, size, name) {
  const cells = getCellsForShip(x, y, size);
  placedShips.set(name, { cells, vertical: isVertical });

  cells.forEach(([x, y]) => {
    board
      .append("rect")
      .attr("class", "ship placed")
      .attr("x", x * CELL_SIZE)
      .attr("y", y * CELL_SIZE)
      .attr("width", CELL_SIZE)
      .attr("height", CELL_SIZE);
  });
}

function updateStartButton() {
  const startButton = d3.select("#startGame");
  const allShipsPlaced = placedShips.size === SHIPS.length;
  startButton.classed("hidden", !allShipsPlaced);
}

function placeRandom() {
  // Clear board and reset ships
  placedShips.clear();
  board.selectAll(".ship.placed").remove();
  d3.selectAll(".ship-group").remove();

  // Place ships randomly
  SHIPS.forEach((ship) => {
    let placed = false;
    while (!placed) {
      const x = Math.floor(Math.random() * BOARD_SIZE);
      const y = Math.floor(Math.random() * BOARD_SIZE);
      isVertical = Math.random() > 0.5;

      if (isValidPlacement(x, y, ship.size)) {
        placeShip(x, y, ship.size, ship.name);
        placed = true;
      }
    }
  });

  updateStartButton();
}

// Reset button
function reset() {
  location.reload();
}

// Rotation keyboard controls
document.addEventListener("keydown", (e) => {
  if (e.key === "r" || e.key === "R") {
    isVertical = !isVertical;
    if (selectedShip) {
      const size = parseInt(selectedShip.attr("data-size"));
      selectedShip
        .attr("width", isVertical ? CELL_SIZE : size * CELL_SIZE)
        .attr("height", isVertical ? size * CELL_SIZE : CELL_SIZE);
    }
  }
});

let gameState = {
  difficulty: null,
  playerBoard: null,
  enemyBoard: null,
  currentTurn: "player",
  gameOver: false,
};

function newAIGame(type) {
  if (type < 1 || type > 4) {
    console.log("Invalid difficulty level.");
    return null;
  }

  gameState = {
    difficulty: type,
  };

  // Redirect to the place ships page
  window.location.href = "placeShips.html";
}

function start() {
  gameState.playerBoard = placedShips;
  gameState.enemyBoard = placedShips;

  console.log(gameState.playerBoard);
  console.log(gameState.enemyBoard);

  window.location.href = "game.html";

  d3.select("#difficulty").text(DIFFICULTY[gameState.difficulty]);
  d3.select("#enemyName").text(DIFFICULTY[gameState.difficulty] + " AI's");

  createBoard("#playerBoard");
  createBoard("#enemyBoard");

  sleep(10000).then(() => {
    console.log("It made it to here");
  });
}

function handleShot(event) {
  // Implementation for handling player shots
}

/////////////////////////////////////////////////////////////////
// I do not know if we need these but they are here if we do
/////////////////////////////////////////////////////////////////

// Saves the current game state to local storage
function saveGameState() {
  localStorage.setItem("battleshipGame", JSON.stringify(gameState));
}

/**
 * Retrieves the game state from local storage
 * @returns {Object|null} Game state object or null if no saved state exists
 */
function loadGameState() {
  const savedState = localStorage.getItem("battleshipGame");
  return savedState ? JSON.parse(savedState) : null;
}
