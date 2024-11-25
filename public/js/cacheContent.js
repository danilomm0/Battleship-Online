function storeDifficulty() {
    // url params
    const urlParams = new URLSearchParams(window.location.search);
    const difficulty = urlParams.get('difficulty');
    // store in local cache
    localStorage.setItem('gameDifficulty', difficulty);
}

/**
 * Storing the playerBoard locally
 * 
 * @param {*} board the playerboard
 */
function storeGameBoard(board) {
    // store board locally
    localStorage.setItem('boardPlayer', JSON.stringify(Array.from(board)));
}

