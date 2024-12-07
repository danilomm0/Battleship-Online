const User = require('../../models/User'); // Adjust the path to your User model

/**
 * Fetch a user by username.
 * @param {string} username - The username of the user to fetch.
 * @returns {Promise<object|null>} - The user object if found, or null if not found.
 */
const getUserByUsername = async (username) => {
  try {
    const user = await User.findOne({ username });
    return user;
  } catch (err) {
    console.error(`Error fetching user: ${err.message}`);
    throw new Error('Database query failed');
  }
};

module.exports = {
  getUserByUsername,
};
