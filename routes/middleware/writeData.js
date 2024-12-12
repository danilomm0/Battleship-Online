const { v4: uuidv4 } = require('uuid');
const User = require("../../models/User");
const Game = require("../../models/GameStatus")

/**
 * update WL of user
 *
 * @param {String} username - username were searching for
 * @param {*} status - 0 for a loss, 1 for a win.
 */
const updateWL = async (username, status) => {
    try {
        const user = await User.findOne({ username });
        console.log(user);
        if (status === 1) {
            user.wins += 1;
        } else {
            user.losses += 1;
        }

        await user.save();
    } catch (err) {
        console.error(`Error updating user WL: ${err.message}`);
    }
};

/**
 * Create a new lobby in the database.
 *
 * @returns {String} - the uid of the game
 */
const createLobby = async () => {
    try {
        const lobbyId = uuidv4();
        const newGame = new Game({
            lobbyId,
            players: [],
            currentTurn: 1,
        });

        await newGame.save();
        console.log(`Created new lobby: ${lobbyId}`);
        return lobbyId;
    } catch (err) {
        console.error(`Error creating lobby: ${err.message}`);
        return null;
    }
};

module.exports = {
    updateWL,
    createLobby,
};
