const express = require('express');
const router = express.Router();

//Routes
router.get('/', (req, res) => {
    res.send('Welcome to LonelyLand API!');
});

router.post('/', (req, res) => {
    res.send('POST request to the LonelyLand API');
});

router.get('/:id', (req, res) => {
    res.send(`You requested data for ID: ${req.params.id}`);
});

router.put('/:id', (req, res) => {
    res.send(`Update request for ID: ${req.params.id}`);
});

module.exports = router;