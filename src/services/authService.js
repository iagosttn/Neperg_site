const crypto = require("node:crypto");
const dataStore = require("./dataStore");

const sessions = new Map();
const authThrottle = new Map();

const SESSION_COOKIE = "neperg_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 12;
const AUTH_WINDOW_MS = 1000 * 60 * 15;
const MAX_AUTH_ATTEMPTS = 8;
const ADMIN_SETUP_TOKEN = String(process.env.ADMIN_SETUP_TOKEN || "").trim();
const REQUIRES_SETUP_TOKEN = Boolean(ADMIN_SETUP_TOKEN);

function createSession(user) {
    const token = crypto.randomBytes(32).toString("hex");
    const csrfToken = crypto.randomBytes(24).toString("hex");

    sessions.set(token, {
        userId: user.id,
        username: user.username,
        role: user.role,
        csrfToken,
        expiresAt: Date.now() + SESSION_TTL_MS
    });

    return { token, csrfToken };
}

function cleanupSessions() {
    const now = Date.now();
    for (const [token, session] of sessions.entries()) {
        if (session.expiresAt <= now) {
            sessions.delete(token);
        }
    }
}

function getSession(req) {
    cleanupSessions();
    const token = req.cookies[SESSION_COOKIE];

    if (!token || !sessions.has(token)) {
        return null;
    }

    const session = sessions.get(token);
    session.expiresAt = Date.now() + SESSION_TTL_MS;
    return { ...session, token };
}

function clearSession(token) {
    if (token) {
        sessions.delete(token);
    }
}

function syncSessionWithData(session, data) {
    if (!session?.token) {
        return null;
    }

    const currentUser = (data.users || []).find((item) => item.id === session.userId);
    if (!currentUser) {
        clearSession(session.token);
        return null;
    }

    const nextSession = {
        ...session,
        username: currentUser.username,
        role: currentUser.role
    };

    sessions.set(session.token, {
        userId: currentUser.id,
        username: currentUser.username,
        role: currentUser.role,
        csrfToken: session.csrfToken,
        expiresAt: Date.now() + SESSION_TTL_MS
    });

    return nextSession;
}

function hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) {
    const passwordHash = crypto.scryptSync(password, salt, 64).toString("hex");
    return { passwordHash, passwordSalt: salt };
}

function verifyPassword(password, profile) {
    const hash = crypto.scryptSync(password, profile.passwordSalt, 64);
    const stored = Buffer.from(profile.passwordHash, "hex");

    if (stored.length !== hash.length) {
        return false;
    }

    return crypto.timingSafeEqual(stored, hash);
}

function getAuthThrottleState(ip, action) {
    const key = `${action}:${crypto.createHash("sha256").update(ip).digest("hex").slice(0, 24)}`;
    const now = Date.now();
    const current = authThrottle.get(key) || {
        attempts: [],
        blockedUntil: 0
    };

    const nextState = {
        attempts: current.attempts.filter((timestamp) => now - timestamp < AUTH_WINDOW_MS),
        blockedUntil: current.blockedUntil > now ? current.blockedUntil : 0
    };

    authThrottle.set(key, nextState);
    return { key, now, state: nextState };
}

function isSetupTokenRequired(data) {
    const hasUsers = Array.isArray(data?.users) && data.users.length > 0;
    return !hasUsers && (REQUIRES_SETUP_TOKEN || dataStore.IS_PRODUCTION);
}

function isSetupLocked(data) {
    const hasUsers = Array.isArray(data?.users) && data.users.length > 0;
    return !hasUsers && dataStore.IS_PRODUCTION && !ADMIN_SETUP_TOKEN;
}

module.exports = {
    createSession,
    getSession,
    clearSession,
    syncSessionWithData,
    hashPassword,
    verifyPassword,
    getAuthThrottleState,
    isSetupTokenRequired,
    isSetupLocked,
    authThrottle,
    SESSION_COOKIE,
    SESSION_TTL_MS,
    ADMIN_SETUP_TOKEN
};
