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
    const { tag, search } = req.query;

    let query = {};

    if (tag) {
      query.tags = tag; // exact match
    }

    if (search) {
      query.$text = { $search: search };
    }

    const souls = await Soul.find(query).sort({ createdAt: -1 });
    res.json(souls);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/:id/love", async (req, res) => {
  try {
    const soul = await Soul.findById(req.params.id);
    if (!soul) return res.status(404).json({ error: "Soul not found" });

    // if 'loves' not exist yet, default to 0
    soul.loves = (soul.loves || 0) + 1;
    await soul.save();

    res.json(soul);
  } catch (err) {
    res.status(500).json({ error: "Failed to update love" });
  }
});


export default router;