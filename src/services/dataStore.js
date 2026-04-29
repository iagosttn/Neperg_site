const { User, Content, Message } = require('../models');
const connectDB = require('./db');

/**
 * Bridge to MongoDB that maintains the same interface as the JSON-based dataStore
 */

async function readData() {
    await connectDB();
    const [users, contents, messages] = await Promise.all([
        User.find().lean(),
        Content.find().lean(),
        Message.find().lean()
    ]);
    
    return {
        users: users || [],
        contents: contents || [],
        messages: messages || []
    };
}

/**
 * mutateData is now a wrapper that handles MongoDB operations.
 * For compatibility with existing controller logic, it still uses a callback
 * but we try to optimize it.
 */
async function mutateData(callback) {
    await connectDB();
    const current = await readData();
    const updated = await callback(current);

    // Sync back to MongoDB
    // This is a bit "naive" but keeps the controller logic unchanged.
    // Ideally, we should refactor controllers to use Mongoose directly.
    
    // 1. Sync Users
    if (updated.users) {
        for (const u of updated.users) {
            await User.findOneAndUpdate({ username: u.username }, u, { upsert: true });
        }
    }

    // 2. Sync Contents
    if (updated.contents) {
        for (const c of updated.contents) {
            await Content.findOneAndUpdate({ id: c.id }, c, { upsert: true });
        }
        // Remove deleted
        const updatedIds = updated.contents.map(c => c.id);
        await Content.deleteMany({ id: { $nin: updatedIds } });
    }

    // 3. Sync Messages
    if (updated.messages) {
        for (const m of updated.messages) {
            await Message.findOneAndUpdate({ id: m.id }, m, { upsert: true });
        }
    }

    return updated;
}

function normalizeText(value, limit = 100) {
    return String(value || "").trim().slice(0, limit);
}

function nowIso() {
    return new Date().toISOString();
}

// Keep normalization helpers
function normalizeStoredUser(user) {
    return {
        id: user.id || `user-${Date.now()}`,
        username: normalizeText(user.username, 50).toLowerCase(),
        passwordHash: user.passwordHash,
        passwordSalt: user.passwordSalt,
        role: ["owner", "editor"].includes(user.role) ? user.role : "editor",
        createdAt: user.createdAt || nowIso(),
        updatedAt: nowIso(),
        lastLoginAt: user.lastLoginAt || ""
    };
}

function normalizeStoredContent(payload) {
    return {
        title: normalizeText(payload.title, 200),
        summary: normalizeText(payload.summary, 1000),
        body: String(payload.body || "").trim(),
        category: normalizeText(payload.category, 50),
        tags: Array.isArray(payload.tags) ? payload.tags.map(t => normalizeText(t, 30)) : [],
        date: payload.date || nowIso(),
        location: normalizeText(payload.location, 100),
        featured: Boolean(payload.featured),
        status: ["published", "draft"].includes(payload.status) ? payload.status : "draft",
        type: ["news", "event", "announcement"].includes(payload.type) ? payload.type : "news",
        ctaLabel: normalizeText(payload.ctaLabel, 50),
        ctaUrl: normalizeText(payload.ctaUrl, 500)
    };
}

module.exports = {
    readData,
    mutateData,
    normalizeText,
    nowIso,
    normalizeStoredUser,
    normalizeStoredContent,
    // We don't need local paths for DB
    UPLOAD_DIR: '', 
    STORAGE_ROOT: ''
};
