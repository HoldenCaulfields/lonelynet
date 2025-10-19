import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import lonelyland from './routes/lonelyland.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

//Middleware
const allowedOrigins = ['https://lonelynet.vercel.app', 'https://lonelynet.onrender.com', 'http://localhost:3000'];

app.use(cors({
    origin: allowedOrigins,
}));
app.use(express.json());

//Connect to MongoDB
//Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log('MongoDB connected');

        // ✅ Create text index on 'text' field of souls collection
        try {
            await mongoose.connection.db.collection('souls').createIndex({ text: "text" });
            console.log("Text index created on 'souls.text'");
        } catch (err) {
            console.error("Index creation error:", err);
        }
    })
    .catch(err => console.error(err));


//Routes
app.use('/api/lonelyland', lonelyland); //Mounting the lonelyland routes

//Sample route
app.get('/', (req, res) => {
    res.send('Hello from LonelyNet Backend!');
});

//Start server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));