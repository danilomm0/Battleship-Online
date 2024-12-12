const User = require('../../models/User'); // Import the User model

// Register a new user
const register = async (req, res) => {
  const {username} = req.body;

  try {
    // Check if the username already exists
    const existingUser = await User.findOne({username});
    if (existingUser) {
      return res.status(400).json({ error: 'Username taken.' });
    }

    // Create and save the new user
    const user = new User({username});
    await user.save();
    res.status(201).json({ message: 'Success', user });
  } catch (err) {
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
};

// Authenticate user login
const authenticateUser = async (req, res) => {
  const { username, password } = req.body;

  try {
    // Find the user in the database
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ error: 'Invalid username'});
    }
    res.status(200).json({ message: 'Login successful', user: { username: user.username, wins: user.wins, losses: user.losses } });
  } catch (err) {
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
};

module.exports = { register, authenticateUser };
