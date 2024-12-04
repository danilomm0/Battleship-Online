const difficulty = retrieveDifficulty();
const turnElem = document.getElementById("turn");
let playerShips = null;
let enemyShips = null;
let playerTurn = true;
const playerBoard = createBoard("#playerBoard");
const enemyBoard = createBoard("#enemyBoard");

function isHit(x, y, board) {
  const cell = board.select(`rect[data-x="${x}"][data-y="${y}"]`);
  let temp = false;
  let ships = enemyShips;
  if (board === playerBoard) {
    ships = playerShips;
  }
  ships.forEach((shipData, shipName) => {
    const { cells, vertical } = shipData;
    cells.forEach(([shipX, shipY]) => {
      if (shipX === x && shipY === y) {
        temp = true;
      }
    });
  });
  cell.classed(temp ? "hit" : "miss", true);
  return temp;
}

function gameLoop() {
  // Retrieve the player's board configuration
  playerShips = retrieveGameBoard("playerBoard");
  if (!playerShips) {
    console.error("Could not retrieve player board configuration");
    return;
  }
  replaceShips(playerBoard, playerShips);

  // Update difficulty display
  const difficultyElem = document.getElementById("difficulty");
  if (difficultyElem) {
    difficultyElem.textContent = DIFFICULTY[difficulty];
  } else {
    console.error("Invalid difficulty level");
  }

  // Add click handlers for ai board
  if (difficulty !== "0") {
    placeRandom();
    enemyShips = placedShips;
    enemyBoard.selectAll("rect").on("click", function () {
      let x = parseInt(d3.select(this).attr("data-x"));
      let y = parseInt(d3.select(this).attr("data-y"));

      if (!playerTurn || gameOver(playerBoard)) {
        return;
      }
      playerTurn = false;
      console.log(`Attempted shot at (${x},${y})`);
      // Handle player's shot
      if (!d3.select(this).classed("hit") && !d3.select(this).classed("miss")) {
        let temp = isHit(x, y, enemyBoard);
        console.log(`Hit was a ${temp ? "hit" : "miss"}`);
        turnElem.textContent = parseInt(turnElem.textContent) + 1;
      }
      enemyShot(difficulty);
    });
  } else {
    //multiplayer
  }
}

function replaceShips(board, ships) {
  if (!ships) {
    console.error("No ships found in local storage");
    return;
  }

  ships.forEach((shipData, shipName) => {
    const { cells, vertical } = shipData;
    cells.forEach(([x, y]) => {
      board
        .select(`rect[data-x="${x}"][data-y="${y}"]`)
        .classed("ship placed", true);
    });
  });
}

function enemyShot(dif) {
  if (gameOver(enemyBoard)) {
    return;
  }
  dif = parseInt(dif);
  if (dif === 1) {
    randomShot();
    turnElem.textContent = parseInt(turnElem.textContent) + 1;
    playerTurn = true;
  }
  ///////////////////////////////////////////////////////////////
  // Add other difficulties here
  ///////////////////////////////////////////////////////////////
}

function randomShot() {
  let count = 0;
  // Keep trying until we find a cell that hasn't been shot at
  while (count < 1000) {
    count++;
    // Generate random coordinates
    const x = Math.floor(Math.random() * BOARD_SIZE);
    const y = Math.floor(Math.random() * BOARD_SIZE);

    // Check if this cell has already been shot at
    const cell = playerBoard.select(`rect[data-x="${x}"][data-y="${y}"]`);
    if (!cell.classed("hit") && !cell.classed("miss")) {
      return isHit(x, y, playerBoard);
    }
  }
}

function gameOver(board) {
  if (board.selectAll(".hit").size() >= 17) {
    if (board === enemyBoard) {
      d3.select("#end").text("won.");
    }
    d3.select("#gameOver").classed("gameOver", false);
    return true;
  }
  return false;
}
