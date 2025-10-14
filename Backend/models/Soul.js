import mongoose from 'mongoose';

const soulSchema = new mongoose.Schema({
    text: {type: String},
    imageUrl: {type: String},
    tags: {type: [String], default: []},
    position: {type: [Number, Number], required: true},
}, {timestamps: true});

export default mongoose.model('Soul', soulSchema);