const express = require('express');
const path = require("path");
const router = express.Router();
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
    const { username } = req.params;

    try {
        // Fetch user using utility function
        const user = await getUserByUsername(username);

        if (!user) {
            // Redirect to home if user does not exist
            return res.redirect('/');
        }

        // Return account details as JSON
        res.status(200).json({
            username: user.username,
            wins: user.wins,
            losses: user.losses,
        });
    } catch (err) {
        console.error(`Error in /account/:username route: ${err.message}`);
        res.redirect('/');
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

module.exports = router;
