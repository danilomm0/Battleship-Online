const express = require('express');
const path = require("path");
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { getUserByUsername } = require("./middleware/fetchData.js")
const { register, authenticateUser } = require("./middleware/login.js");

router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});


router.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/login.html'))
});

router.post("/login", authenticateUser);

router.post("/register", register);

router.get('/account/:username', async (req, res) => {
    res.sendFile(path.join(__dirname, '../public/account.html'))
});

router.get('/api/account/:username', async (req, res) => {
    const { username } = req.params;

    try {
        // Fetch user from the database
        const user = await getUserByUsername(username);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Return user details as JSON
        res.status(200).json({
            username: user.username,
            wins: user.wins,
            losses: user.losses,
        });
    } catch (err) {
        console.error(`Error fetching user data: ${err.message}`);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/help', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/help.html'))
});

// Serve the game page
router.get('/place-ships', (req, res) => {
    const mode = req.query.difficulty;
    console.log(mode);
    res.sendFile(path.join(__dirname, '../public/placeShips.html'));
});


// Create a new multiplayer game
router.post('/create', async (req, res) => {
    const { userId, username, board } = req.body;

    try {
        const gameId = uuidv4();
        const newGame = new Game({
            gameId,
            players: [
                {
                    userId,
                    username,
                    board,
                },
            ],
        });

        await newGame.save();
        res.status(201).json({ gameId, message: 'Game created successfully!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to create the game.' });
    }
});

// Join an existing multiplayer game
router.post('/join/:gameId', async (req, res) => {
    const { gameId } = req.params;
    const { userId, username, board } = req.body;

    try {
        const game = await Game.findOne({ gameId });

        if (!game) {
            return res.status(404).json({ error: 'Game not found.' });
        }

        if (game.players.length >= 2) {
            return res.status(400).json({ error: 'Game already full.' });
        }

        game.players.push({ userId, username, board });
        game.currentTurn = game.players[0].userId; // Set the first player as the current turn
        await game.save();

        res.status(200).json({ message: 'Joined the game successfully!', game });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to join the game.' });
    }
});

module.exports = router;
