import express from 'express';
import Soul from '../models/Soul.js';
import { upload } from '../config/cloudinary.js';
import mongoose from "mongoose";

const router = express.Router();

//Create Soul (post):
router.post("/", upload.single("image"), async (req, res) => {
  try {
    const { text, tags, position, links } = req.body;
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
    if (links) {
      updateData.links = Array.isArray(links)
        ? links
        : JSON.parse(links);
    }

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
        links: links ? JSON.parse(links) : [],
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
    let souls = [];

    // 1️⃣ Nếu có tag → chỉ tìm theo tag (exact match)
    if (tag) {
      souls = await Soul.find({ tags: tag }).sort({ createdAt: -1 });
      return res.json(souls || []);
    }

    // 2️⃣ Nếu có search → thử tìm trong text trước
    if (search) {
      // thử full-text search
      souls = await Soul.find({ $text: { $search: search } }).sort({ createdAt: -1 });

      // 3️⃣ Nếu không có kết quả → fallback tìm trong tags
      if (!souls.length) {
        souls = await Soul.find({
          tags: { $regex: search, $options: 'i' },
        }).sort({ createdAt: -1 });
      }

      return res.json(souls || []);
    }

    // 4️⃣ Không có tag / search → trả về tất cả
    souls = await Soul.find().sort({ createdAt: -1 });
    return res.json(souls || []);
  } catch (error) {
    console.error("🔥 Error in /api/lonelyland:", error.message);
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

router.get("/:roomId", async (req, res) => {
  try {
    const { roomId } = req.params;

    // ✅ Nếu không phải ObjectId (room ảo), trả về thông tin mô phỏng
    if (!mongoose.Types.ObjectId.isValid(roomId)) {
      return res.json({
        _id: roomId,
        type: "virtual",
        text: "🌐 This is a virtual chat room (no Soul in DB)",
        createdAt: new Date(),
      });
    }

    // ✅ Còn nếu là ObjectId thật → truy vấn DB như bình thường
    const soul = await Soul.findById(roomId);
    if (!soul) return res.status(404).json({ error: "Post not found" });
    res.json(soul);
  } catch (error) {
    console.error("Error fetching soul:", error);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;