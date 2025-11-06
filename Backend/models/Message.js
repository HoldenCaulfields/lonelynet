import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    // The foreign key linking this message back to the Soul/Post it belongs to.
    // This 'roomId' corresponds to the 'Soul' document's _id.
    roomId: {
        type: mongoose.Schema.Types.Mixed,
        ref: 'Soul', // References the 'Soul' model
        required: true,
        index: true // Indexing this field dramatically speeds up the chat history lookup
    },
    // The ID of the user who sent the message (used for display logic on the client).
    userId: {
        type: String, 
        required: true
    },
    text: {
        type: String,
        required: true,
        maxlength: 500
    },
    // Unix timestamp (number) to match the client's internal message structure
    timestamp: {
        type: Number,
        required: true,
        default: Date.now 
    },
}, { 
    // We explicitly disable default timestamps since we are managing 'timestamp' as a Number type for client compatibility.
    timestamps: false 
});

export default mongoose.model('Message', messageSchema);
