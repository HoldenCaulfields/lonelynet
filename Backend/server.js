const express = require('express');
const cors = require('cors');
require('dotenv').config();
const lonelyland = require('./routes/lonelyland');

const app = express();
const PORT = process.env.PORT || 5000;

//Middleware
app.use(cors());
app.use(express.json());
app.use('/api/lonelyland', lonelyland)

//Sample route
app.get('/', (req, res) => {
    res.send('Hello from LonelyNet Backend!');
});

//Example API
app.get('/api/data', (req, res) => {
    res.json({message: "arisu"});
});

//Start server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));