const express = require('express');
const path = require("path");
const router = express.Router();
const { register, authenticateUser } = require = require("./middleware/login.js")

router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});


router.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/login.html'))
});

router.post("/login", authenticateUser);

router.post("/register", register);

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
