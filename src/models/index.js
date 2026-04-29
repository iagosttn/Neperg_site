const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    passwordSalt: { type: String, required: true },
    role: { type: String, enum: ['owner', 'editor'], default: 'editor' },
    lastLoginAt: String,
    createdAt: String,
    updatedAt: String
});

const ContentSchema = new mongoose.Schema({
    id: { type: String, unique: true }, // Keeping the string ID for compatibility
    type: { type: String, required: true },
    status: { type: String, default: 'draft' },
    featured: { type: Boolean, default: false },
    title: String,
    summary: String,
    body: String,
    category: String,
    tags: [String],
    date: String,
    location: String,
    image: String,
    ctaLabel: String,
    ctaUrl: String,
    createdAt: String,
    updatedAt: String,
    createdBy: String,
    updatedBy: String
});

const MessageSchema = new mongoose.Schema({
    id: String,
    name: String,
    email: String,
    subject: String,
    message: String,
    createdAt: String
});

module.exports = {
    User: mongoose.model('User', UserSchema),
    Content: mongoose.model('Content', ContentSchema),
    Message: mongoose.model('Message', MessageSchema)
};
