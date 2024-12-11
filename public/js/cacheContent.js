/**
 * Store the difficulty which is grabbed from the current URL
 */
function storeDifficulty() {
  // url params
  const urlParams = new URLSearchParams(window.location.search);
  const difficulty = urlParams.get("difficulty");
  // store in local cache
  sessionStorage.setItem("gameDifficulty", difficulty);
}

/**
 * Storing the playerBoard locally
 *
 * @param {String} type either pass playerBoard or enemyBoard
 * @param {Map} board the playerboard
 */
function storeGameBoard(type, board) {
  // store board locally
  sessionStorage.setItem(type, JSON.stringify(Array.from(board)));
}

/**
 * Getting current game difficulty from local storage
 *
 * @returns Int -> the game difficulty
 */
function retrieveDifficulty() {
  const difficulty = sessionStorage.getItem("gameDifficulty");
  if (difficulty) {
    return difficulty;
  }
  console.error(
    "Couldnt get the difficulty from local storage :( Returning max difficulty!"
  );
  return 4;
}

/**
 * Retriving the game board from the local storage
 *
 * @param {String} type either pass playerBoard or enemyBoard
 * @returns Map of the game board requested
 */
function retrieveGameBoard(type) {
  const storedBoard = sessionStorage.getItem(type);
  if (storedBoard) {
    return new Map(JSON.parse(storedBoard));
  }
  console.error("Couldnt get board from local storage. :(");
  return null;
}

/**
 *
 * @param {*} username The username setting of this user
 */
function writeLoginStatus(username) {
  sessionStorage.setItem("battleShipLogin", username);
}

/**
 * Clears the login status from local storage, signifying a logout
 */
function clearLoginStatus() {
  sessionStorage.removeItem("battleShipLogin");
}

/**
 *
 * @returns The username if logged in else null
 */
function getLoginStatus() {
  const username = sessionStorage.getItem("battleShipLogin");
  if (username) {
    return username;
  }
  return null;
}
