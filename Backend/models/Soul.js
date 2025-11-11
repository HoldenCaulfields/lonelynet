import mongoose from 'mongoose';

const soulSchema = new mongoose.Schema({
    text: {type: String},
    imageUrl: { type: String },
    tags: {type: [String], default: []},
    loves: { type: Number, default: 0 },
    position: {type: [Number, Number], required: true},
    links: [{ type: {type: String,
          enum: ["facebook","instagram","x","reddit",
            "github","linkedin","email","phone","website",],
        },url: String,},
    ],
    icon: {type: String},
}, {timestamps: true});

export default mongoose.model('Soul', soulSchema);