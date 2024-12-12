const User = require('../../models/User')
const Lobby = require('../../models/GameStatus')
/**
 * Fetch a user by username.
 * 
 * @param {String} username - user were getting
 * @returns {*} - the username if found else null
 */
const getUserByUsername = async (username) => {
  try {
    const user = await User.findOne({ username });
    return user;
  } catch (err) {
    console.error(`Error getting user: ${err.message}`);
    throw new Error('query failed for user');
  }
};

/**
 * get lobby by its id
 * 
 * @param {String} lobbyId - the id of lobby
 * @returns {*} - lobby info else null
 */
const getLobbyById = async (lobbyId) => {
  try {
    const lobby = await Lobby.findOne({ lobbyId });
    return lobby;
  } catch (err) {
    console.error(`Error getting lobby: ${err.message}`);
    throw new Error('query failed for lobby');
  }
};


module.exports = {
  getUserByUsername,
  getLobbyById,
};
