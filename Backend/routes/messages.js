import express from 'express';
import Message from '../models/Message.js';

const router = express.Router();

// 1. GET message history for a specific room
// Route: GET /:roomId
router.get("/:roomId", async (req, res) => {
    try {
        const roomId = req.params.roomId;

        // Fetch all messages associated with the roomId, sorted by timestamp
        const messages = await Message.find({ roomId }).sort({ timestamp: 1 });

        // ⭐ MODIFICATION HERE: Create the single room object structure
        const roomMessagesObject = {
            roomId: roomId,
            messages: messages, // The array of all messages from that room
        };

        // Respond with the new structured object
        res.json(roomMessagesObject);

    } catch (error) {
        console.error("Error fetching message history:", error);
        res.status(500).json({ error: "Server error fetching message history" });
    }
});

// 2. POST a new message
// ... (The POST route remains unchanged as it handles individual message creation)
router.post("/", async (req, res) => {
    try {
        const { roomId, userId, text, timestamp } = req.body;

        if (!roomId || !userId || !text) {
            return res.status(400).json({ error: "Missing required message fields: roomId, userId, or text." });
        }

        const newMessage = new Message({
            roomId,
            userId,
            text,
            timestamp: timestamp || Date.now(),
        });

        await newMessage.save();

        res.status(201).json(newMessage);

    } catch (error) {
        console.error("Error saving new message:", error);
        res.status(500).json({ error: "Server error saving message." });
    }
});

export default router;