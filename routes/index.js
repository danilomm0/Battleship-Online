const express = require("express");
const path = require("path");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");
const { getUserByUsername, getLobbyById } = require("./middleware/fetchData.js");
const { register, authenticateUser } = require("./middleware/login.js");
const { updateWL, createLobby } = require("./middleware/writeData.js");

router.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/index.html"));
});

router.get("/login", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/login.html"));
});

router.post("/login", authenticateUser);

router.post("/register", register);

router.get("/account/:username", async (req, res) => {
    res.sendFile(path.join(__dirname, "../public/account.html"));
});


router.get("/help", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/help.html"));
});

// Serve the game page
router.get("/place-ships", (req, res) => {
    const mode = req.query.difficulty;
    console.log(mode);
    res.sendFile(path.join(__dirname, "../public/placeShips.html"));
});


router.get("/place-ships/:gameID", (req, res) => {
    const mode = req.query.difficulty;
    console.log(mode);
    console.log("multi")
    res.sendFile(path.join(__dirname, "../public/placeShips.html"));
});



router.post('/api/createLobby', async (req, res) => {
    console.log("HERE");
    try {
        const gameID = await createLobby();
        console.log(`Created new gameID: ${gameID}`);

        // back to frontend the data goes
        res.status(201).json({ gameID: gameID });
    } catch (err) {
        console.error('Error creating gameID:', err.message);
        res.status(500).json({ error: 'Failed to create newGame' });
    }
});


router.post("/api/gameStatus/:gameID", async (req, res) => {
    const { gameID } = req.params;

    try {
        const lobby = await getLobbyById(gameID);
        if (!lobby) {
            return res.status(404).json({ error: "Game not found" });
        }
        res.status(200).json({ message: "Game exists" });
    } catch (err) {
        console.error("Error with the Game Status");
        res.status(500).json({ error: "Internal server error" });
    }
});


router.post("/api/:username", async (req, res) => {
    const { username } = req.params;
    const { status } = req.body;

    try {
        await updateWL(username, status);
    } catch (err) {
        console.error("Error with the WL");
        res.status(500).json({ error: "Internal server error" });
    }
});


router.get("/api/account/:username", async (req, res) => {
    const { username } = req.params;

    try {
        // Fetch user from the database
        const user = await getUserByUsername(username);

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Return user details as JSON
        res.status(200).json({
            username: user.username,
            wins: user.wins,
            losses: user.losses,
        });
    } catch (err) {
        console.error(`Error fetching user data: ${err.message}`);
        res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;
