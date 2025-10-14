import express from 'express';
import Soul from '../models/Soul.js';
import { upload } from '../config/cloudinary.js';

const router = express.Router();

//Create Soul (post):
router.post('/', upload.single('image'), async (req, res) => {
    try {
        const { text, tags, userAddress } = req.body;
        const newSoul = new Soul({
            text,
            tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
            userAddress,
            imageUrl: req.file ? req.file.path : null,
        });
        await newSoul.save();
        res.status(201).json(newSoul);
    } catch (error) {
        res.status(500).json({error: error.message});
    }
});

//Get all Souls
router.get('/', async (req, res) => {
    try {
        const souls = await Soul.find().sort({createdAt: -1});
        res.json(souls);
    } catch (error) {
        res.status(500).json({error: error.message});
    }
});


export default router;