import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import lonelyland from './routes/lonelyland.js';
import http from "http";
import {Server} from "socket.io";
import initSocket from "./socket/socket.js";
import messages from "./routes/messages.js"

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

//Middleware
app.use(cors({
  origin: [
    "https://thelonelynet.com",
    "https://www.thelonelynet.com", "http://localhost:3000", "https://lonelynet.vercel.app"
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true
}));
app.use(express.json());

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
app.use('/api/lonelyland', lonelyland); 
app.use('/api/messages', messages)

//Sample route
app.get('/', (req, res) => {
    res.send('Hello from LonelyNet Backend!');
});

//socket.io
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
    },
});
initSocket(io);

//Start server
server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));