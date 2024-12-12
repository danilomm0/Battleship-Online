const difficulty = retrieveDifficulty();
const turnElem = document.getElementById("turn");
const playerBoard = createBoard("#playerBoard");
const enemyBoard = createBoard("#enemyBoard");
const SHIP_SIZES = [5, 4, 3, 3, 2];
let playerShips = null;
let enemyShips = null;
let playerTurn = true;
let shipVertical = null;
let heatMap = null;

function isSunk(shipName, ships, board) {
  const ship = ships.get(shipName);
  if (!ship) return false;
  let allCellsHit = true;
  ship.cells.forEach(([x, y]) => {
    const cell = board.select(`rect[data-x="${x}"][data-y="${y}"]`);
    let temp = cell.classed("hit");
    if (!temp) {
      allCellsHit = false;
    }
  });
  if (allCellsHit) {
    shipVertical = null;
    ship.cells.forEach(([x, y]) => {
      board
        .select(`rect[data-x="${x}"][data-y="${y}"]`)
        .classed("sunk", true)
        .classed("hit", false)
        .classed("ship", false);
    });
  }
  return allCellsHit;
}

function isHit(x, y, board) {
  const cell = board.select(`rect[data-x="${x}"][data-y="${y}"]`);
  let ships = board === playerBoard ? playerShips : enemyShips;
  let hit = false;
  ships.forEach((shipData, shipName) => {
    const { cells, vertical } = shipData;
    cells.forEach(([shipX, shipY]) => {
      if (shipX === x && shipY === y) {
        hit = true;
        cell.classed("hit", true);
        if (isSunk(shipName, ships, board)) {
          console.log(`Sunk ${shipName} at (${x},${y})`);
        }
      }
    });
  });
  if (!hit) cell.classed("miss", true);
  return hit;
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
  console.log(
    `${difficultyElem} and ${difficultyElem.textContent} and ${difficulty}`
  );
  if (difficultyElem) {
    difficultyElem.textContent = DIFFICULTY[difficulty];
  } else {
    console.error("Invalid difficulty level");
  }

  // Add click handlers for ai board
  if (difficulty === "0") {
    // multiplayer
  } else {
    placeRandom();
    enemyShips = placedShips;
    enemyBoard.selectAll("rect").on("click", function () {
      let x = parseInt(d3.select(this).attr("data-x"));
      let y = parseInt(d3.select(this).attr("data-y"));

      if (!playerTurn) {
        return;
      }
      // Handle player's shot
      if (validCoord(x, y, enemyBoard)) {
        playerTurn = false;
        let temp = isHit(x, y, enemyBoard);
        console.log(`Shot at (${x},${y}) was a ${temp ? "hit" : "miss"}`);
        turnElem.textContent = parseInt(turnElem.textContent) + 1;
        enemyShot(difficulty);
      }
    });
  }
}

function replaceShips(board, ships) {
  if (!ships) {
    console.error("No ships found in local storage");
    return;
  }

  ships.forEach((shipData, shipName) => {
    const { cells, vertical } = shipData;

    imageX = 9;
    imageY = 9;

    for (let cell of cells) {
      if (cell[0] < imageX) imageX = cell[0];
      if (cell[1] < imageY) imageY = cell[1];
    }

    board
      .select(`image[data-name="${shipName}"]`)
      .attr("width", vertical ? CELL_SIZE : cells.length * CELL_SIZE)
      .attr("height", vertical ? cells.length * CELL_SIZE : CELL_SIZE)
      .attr("href", "/images\\" + shipName + (vertical ? "Vert" : "") + ".png")
      .attr("x", imageX * CELL_SIZE)
      .attr("y", imageY * CELL_SIZE)
      .attr("visibility", "visible");

    cells.forEach(([x, y]) => {
      board.select(`rect[data-x="${x}"][data-y="${y}"]`).classed("ship", true);
    });
  });
}

function enemyShot(dif) {
  if (gameOver(enemyBoard)) return;
  dif = parseInt(dif);
  if (dif === 1) {
    randomShot();
  }
  if (dif === 2) {
    if (playerBoard.selectAll(".hit").size() > 0) {
      if (sinkFound() === null) randomShot();
    } else {
      randomShot();
    }
  }
  if (dif === 3) {
    if (playerBoard.selectAll(".hit").size() > 0) {
      if (sinkFound() === null) gridShot();
    } else {
      gridShot();
    }
  }
  if (dif === 4) {
    impossibleShot();
  }
  if (gameOver(playerBoard)) return;
  turnElem.textContent = parseInt(turnElem.textContent) + 1;
  playerTurn = true;
}

function validCoord(x, y, board) {
  console.log(`Checking if (${x},${y}) is a valid coordinate`);
  if (x >= 0 && x < 10 && y >= 0 && y < 10) {
    const cell = board.select(`rect[data-x="${x}"][data-y="${y}"]`);
    if (
      !cell.classed("hit") &&
      !cell.classed("miss") &&
      !cell.classed("sunk")
    ) {
      return true;
    }
  }
  return false;
}

function sinkFound() {
  let numHits = playerBoard.selectAll(".hit").size();
  if (numHits === 1) {
    const cell = playerBoard.selectAll(".hit");
    const x = parseInt(cell.attr("data-x"));
    const y = parseInt(cell.attr("data-y"));
    if (validCoord(x + 1, y, playerBoard)) return isHit(x + 1, y, playerBoard);
    if (validCoord(x - 1, y, playerBoard)) return isHit(x - 1, y, playerBoard);
    if (validCoord(x, y + 1, playerBoard)) return isHit(x, y + 1, playerBoard);
    if (validCoord(x, y - 1, playerBoard)) return isHit(x, y - 1, playerBoard);
  }
  if (shipVertical === null) {
    let firstHit = null;
    let secondHit = null;
    playerBoard.selectAll(".hit").each(function (d, i) {
      const cell = d3.select(this);
      if (!firstHit) {
        firstHit = {
          x: parseInt(cell.attr("data-x")),
          y: parseInt(cell.attr("data-y")),
        };
      } else if (!secondHit) {
        secondHit = {
          x: parseInt(cell.attr("data-x")),
          y: parseInt(cell.attr("data-y")),
        };
      }
    });
    shipVertical = firstHit.x === secondHit.x;
  }
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  playerBoard.selectAll(".hit").each(function () {
    const cell = d3.select(this);
    const x = parseInt(cell.attr("data-x"));
    const y = parseInt(cell.attr("data-y"));
    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x);
    minY = Math.min(minY, y);
    maxY = Math.max(maxY, y);
  });
  if (shipVertical) {
    if (validCoord(minX, minY - 1, playerBoard))
      return isHit(minX, minY - 1, playerBoard);
    if (validCoord(minX, maxY + 1, playerBoard))
      return isHit(minX, maxY + 1, playerBoard);
  } else {
    if (validCoord(minX - 1, minY, playerBoard))
      return isHit(minX - 1, minY, playerBoard);
    if (validCoord(maxX + 1, minY, playerBoard))
      return isHit(maxX + 1, minY, playerBoard);
  }
  console.log("Could not find ship that has been hit once");
  return null;
}

function randomShot() {
  while (true) {
    const x = Math.floor(Math.random() * BOARD_SIZE);
    const y = Math.floor(Math.random() * BOARD_SIZE);
    if (validCoord(x, y, playerBoard)) return isHit(x, y, playerBoard);
  }
}

function gridShot() {
  while (true) {
    const x = Math.floor(Math.random() * BOARD_SIZE);
    const y = Math.floor(Math.random() * BOARD_SIZE);
    if ((x + y) % 2 === 0) {
      if (validCoord(x, y, playerBoard)) return isHit(x, y, playerBoard);
    }
  }
}

function isValidShipPlacement(startX, startY, size, horizontal, shots, hits) {
  if (horizontal) {
    if (startX < 0 || startX + size > 10) return false;
    for (let i = 0; i < size; i++) {
      const coord = `${startX + i},${startY}`;
      if (shots.has(coord) && !hits.has(coord)) return false;
    }
  } else {
    if (startY < 0 || startY + size > 10) return false;
    for (let i = 0; i < size; i++) {
      const coord = `${startX},${startY + i}`;
      if (shots.has(coord) && !hits.has(coord)) return false;
    }
  }
  return true;
}

function impossibleShot() {
  if (gameOver(playerBoard)) return;
  heatMap = Array(10)
    .fill()
    .map(() => Array(10).fill(0));

  let shots = new Set();
  playerBoard.selectAll(".hit, .miss, .sunk").each(function () {
    const cell = d3.select(this);
    const x = parseInt(cell.attr("data-x"));
    const y = parseInt(cell.attr("data-y"));
    shots.add(`${x},${y}`);
  });

  let hits = new Set();
  playerBoard.selectAll(".hit").each(function () {
    const cell = d3.select(this);
    const x = parseInt(cell.attr("data-x"));
    const y = parseInt(cell.attr("data-y"));
    hits.add(`${x},${y}`);
  });

  let remainingShips = [...SHIP_SIZES];
  playerBoard.selectAll(".sunk").each(function () {
    const length = d3.select(this).size();
    const index = remainingShips.indexOf(length);
    if (index > -1) remainingShips.splice(index, 1);
  });

  for (let y = 0; y < 10; y++) {
    for (let x = 0; x < 10; x++) {
      if (shots.has(`${x},${y}`)) continue;
      remainingShips.forEach((shipSize) => {
        for (let i = 0; i < shipSize; i++) {
          if (isValidShipPlacement(x - i, y, shipSize, true, shots, hits)) {
            for (let j = 0; j < shipSize; j++) {
              if (x - i + j >= 0 && x - i + j < 10) heatMap[y][x - i + j]++;
            }
          }
        }
        for (let i = 0; i < shipSize; i++) {
          if (isValidShipPlacement(x, y - i, shipSize, false, shots, hits)) {
            for (let j = 0; j < shipSize; j++) {
              if (y - i + j >= 0 && y - i + j < 10) heatMap[y - i + j][x]++;
            }
          }
        }
      });
      if (hits.size > 0) {
        hits.forEach((hitCoord) => {
          const [hitX, hitY] = hitCoord.split(",").map(Number);
          const distance = Math.abs(x - hitX) + Math.abs(y - hitY);
          if (distance === 1) heatMap[y][x] *= 2;
        });
      }
    }
  }
  let maxProb = -1;
  let bestShots = [];
  for (let y = 0; y < 10; y++) {
    for (let x = 0; x < 10; x++) {
      if (validCoord(x, y, playerBoard)) {
        if (heatMap[y][x] > maxProb) {
          maxProb = heatMap[y][x];
          bestShots = [[x, y]];
        } else if (heatMap[y][x] === maxProb) bestShots.push([x, y]);
      }
    }
  }
  const [x, y] = bestShots[Math.floor(Math.random() * bestShots.length)];
  return isHit(x, y, playerBoard);
}

function gameOver(board) {
  if (board.selectAll(".sunk").size() >= 17) {
    if (board === enemyBoard) d3.select("#end").text("won.");
    d3.select("#gameOver").classed("gameOver", false);
    const username = getLoginStatus();
    if (username) updateUserStatus(username, board === enemyBoard ? 1 : 0);
    return true;
  }
  return false;
}

function updateUserStatus(username, status) {
  fetch(`/api/${username}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status }),
  }).catch((err) => {
    console.error(`Error making request: ${err.message}`);
  });
}
