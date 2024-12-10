const board = createBoard("#playerBoard");

// Initialize ship dock
const shipDock = d3
  .select("#ship-dock")
  .append("svg")
  .attr("width", "100%")
  .attr("height", SHIPS.length * (CELL_SIZE + 30));

// Create draggable ships
function makeShips() {
  SHIPS.forEach((ship, index) => {
    const shipGroup = shipDock
      .append("g")
      .attr("class", "ship-group")
      .attr("transform", `translate(10, ${index * (CELL_SIZE + 20)})`);
    
    shipGroup
      .append("image")
      .attr("class", "ship")
      .attr("width", ship.size * CELL_SIZE)
      .attr("height", CELL_SIZE)
      .attr("href", "images\\" + ship.name + ".png")
      .attr("data-size", ship.size)
      .attr("data-name", ship.name);
  });
}

makeShips();

// Drag behavior
const drag = d3
  .drag()
  .on("start", dragStarted)
  .on("drag", dragging)
  .on("end", dragEnded);
d3.selectAll(".ship").call(drag);

/**
 * drag has started
 *
 * @param {*} event
 * @param {*} d
 */
function dragStarted(event, d) {
  selectedShip = d3.select(this);
  selectedShip.classed("dragging", true);
}

/**
 * The dragging has started and element is being dragged
 *
 * @param {*} event
 * @param {*} d
 */
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

/**
 * Dragging the ship has ended so do all required checks
 *
 * @param {*} event
 * @param {*} d
 */
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

/**
 * Checking if where placed is valid
 *
 * @param {*} x
 * @param {*} y
 * @param {*} size
 * @returns
 */
function isValidPlacement(x, y, size) {
  if (x < 0 || y < 0) return false;

  const cells = getCellsForShip(x, y, size);
  return cells.every(
    ([x, y]) =>
      x >= 0 && x < BOARD_SIZE && y >= 0 && y < BOARD_SIZE && !isOccupied(x, y)
  );
}

/**
 * Getting current cells for a ship
 *
 * @param {*} x
 * @param {*} y
 * @param {*} size
 * @returns
 */
function getCellsForShip(x, y, size) {
  const cells = [];
  for (let i = 0; i < size; i++) {
    cells.push(isVertical ? [x, y + i] : [x + i, y]);
  }
  return cells;
}

/**
 * Checking if a ship placement area is occupied
 *
 * @param {*} x
 * @param {*} y
 * @returns
 */
function isOccupied(x, y) {
  return Array.from(placedShips.values()).some((ship) =>
    ship.cells.some(([shipX, shipY]) => shipX === x && shipY === y)
  );
}

/**
 * Placing the dragged ship
 *
 * @param {*} x
 * @param {*} y
 * @param {*} size
 * @param {*} name
 */
function placeShip(x, y, size, name) {
  const cells = getCellsForShip(x, y, size);
  placedShips.set(name, { cells, vertical: isVertical });

  cells.forEach(([x, y]) => {
    board
      .select(`rect[data-x="${x}"][data-y="${y}"]`)
      .classed("ship placed", true);
  });
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

/**
 * All placed allow to start
 */
function updateStartButton() {
  const startButton = d3.select("#startGame");
  const allShipsPlaced = placedShips.size === SHIPS.length;
  startButton.classed("hidden", !allShipsPlaced);
}

/**
 * Handle randomly placing ships.
 */
function placeRandom() {
  // Clear board and reset ships
  placedShips.clear();
  board.selectAll("rect").classed("ship placed", false);
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
  placedShips.clear();
  board.selectAll("rect").classed("ship placed", false);
  d3.selectAll(".ship-group").remove();
  makeShips();
}

function start() {
  storeDifficulty();
  storeGameBoard("playerBoard", placedShips);
  window.location.href = "game.html";
}
