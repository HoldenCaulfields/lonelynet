import express from 'express';
import Soul from '../models/Soul.js';
import { upload } from '../config/cloudinary.js';

const router = express.Router();

//Create Soul (post):
router.post("/", upload.single("image"), async (req, res) => {
  try {
    const { text, tags, position } = req.body;
    const parsedPos = JSON.parse(position);

    // build update fields dynamically
    const updateData = {};
    if (text) updateData.text = text;
    if (tags) {
      updateData.tags = Array.isArray(tags)
        ? tags
        : tags.split(",").map((t) => t.trim());
    }
    if (req.file) updateData.imageUrl = req.file.path;

    let soul = await Soul.findOne({ position: parsedPos });

    if (soul) {
      // Merge update instead of replacing
      soul = await Soul.findOneAndUpdate(
        { position: parsedPos },
        { $set: updateData },
        { new: true }
      );
      return res.status(200).json({ message: "Updated existing post", soul });
    } else {
      // Create new if not found
      const newSoul = new Soul({
        text: text || "",
        tags: updateData.tags || [],
        position: parsedPos,
        imageUrl: req.file ? req.file.path : null,
      });
      await newSoul.save();
      return res.status(201).json({ message: "Created new post", soul: newSoul });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


//Get all Souls
router.get('/', async (req, res) => {
  try {
    const { tag } = req.query; // Get tag from query
    
    if (tag) {
      // ✅ ONLY return Souls with THIS tag
      const souls = await Soul.find({ 
        tags: tag  // Exact match in tags array
      }).sort({createdAt: -1});
      return res.json(souls);
    }
    
    // No tag = return ALL
    const souls = await Soul.find().sort({createdAt: -1});
    res.json(souls);
  } catch (error) {
    res.status(500).json({error: error.message});
  }
});

export default router;