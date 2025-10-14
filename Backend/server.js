import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import lonelyland from './routes/lonelyland.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

//Middleware
app.use(cors());
app.use(express.json());

//Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error(err));

//Routes
app.use('/api/lonelyland', lonelyland); //Mounting the lonelyland routes

//Sample route
app.get('/', (req, res) => {
    res.send('Hello from LonelyNet Backend!');
});

//Start server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));