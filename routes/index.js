const express = require('express');
const path = require("path");
const router = express.Router();

router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Serve the game page
router.get('/place-ships', (req, res) => {
    const mode = req.query.difficulty;
    console.log(mode);
    res.sendFile(path.join(__dirname, '../public/placeShips.html'));
});

module.exports = router;
