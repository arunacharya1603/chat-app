import mongoose from "mongoose";

const connectionSchema = new mongoose.Schema({
    requester: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending'
    }
}, { timestamps: true });

// Ensure unique connection between two users
connectionSchema.index({ requester: 1, recipient: 1 }, { unique: true });

// Prevent self-connections
connectionSchema.pre('save', function(next) {
    if (this.requester.toString() === this.recipient.toString()) {
        next(new Error('Cannot send connection request to yourself'));
    }
    next();
});

const Connection = mongoose.model("Connection", connectionSchema);

export default Connection;

