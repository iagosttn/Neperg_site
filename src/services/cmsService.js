const crypto = require("node:crypto");
const dataStore = require("./dataStore");
const imageService = require("./imageService");

/**
 * Service to handle CMS business logic (Cloud version)
 */

async function safeDeleteUpload(value) {
    // Delegates deletion to imageService which handles Cloudinary
    await imageService.safeDeleteUpload(value);
}

async function persistImageValue(rawValue, previousValue) {
    const value = dataStore.normalizeText(rawValue, 5000000);

    const isAllowedImageValue = (val) => {
        const rawValue = dataStore.normalizeText(val, 5000000);
        if (!rawValue) return true;
        if (rawValue.startsWith("//")) return false;
        if (/^data:/i.test(rawValue)) {
            return /^data:image\/(?:avif|gif|jpeg|jpg|png|webp);base64,[a-z0-9+/=]+$/i.test(rawValue);
        }
        if (/^(javascript:|vbscript:)/i.test(rawValue)) return false;
        
        // Allow Cloudinary URLs and relative site paths
        if (rawValue.includes('cloudinary.com')) return true;
        
        const isRelativeSitePath = (v) => Boolean(v) && !/^[a-z][a-z0-9+.-]*:/i.test(v) && !v.startsWith("//");
        if (isRelativeSitePath(rawValue)) return true;
        
        try {
            const url = new URL(rawValue);
            const isLoopbackHost = (hostname) => ["localhost", "127.0.0.1", "[::1]", "::1"].includes(hostname);
            return url.protocol === "https:" || (url.protocol === "http:" && isLoopbackHost(url.hostname));
        } catch (e) { return false; }
    };

    if (!value) {
        if (previousValue && previousValue !== value) {
            await safeDeleteUpload(previousValue);
        }
        return "";
    }

    if (!isAllowedImageValue(value)) {
        throw new Error("A imagem precisa ser um link seguro ou um arquivo enviado pelo painel.");
    }

    // If it's a data URI, upload to Cloudinary
    if (/^data:image\//i.test(value)) {
        const cloudUrl = await imageService.processCmsImage(value);
        
        if (previousValue && previousValue !== cloudUrl) {
            await safeDeleteUpload(previousValue);
        }
        return cloudUrl;
    }

    // Cleanup old Cloudinary image if URL changed
    if (previousValue && previousValue !== value && previousValue.includes('cloudinary.com')) {
        await safeDeleteUpload(previousValue);
    }

    return value;
}

function getPublicContents(contents) {
    return contents
        .filter((item) => item.status === "published")
        .sort((left, right) => new Date(right.date || 0) - new Date(left.date || 0))
        .map((item) => ({
            id: item.id,
            type: item.type,
            status: item.status,
            featured: item.featured,
            title: item.title,
            summary: item.summary,
            body: item.body,
            category: item.category,
            tags: item.tags,
            date: item.date,
            location: item.location,
            image: item.image,
            ctaLabel: item.ctaLabel,
            ctaUrl: item.ctaUrl
        }));
}

function getAllContents(contents) {
    return [...contents]
        .sort((left, right) => new Date(right.date || 0) - new Date(left.date || 0))
        .map((item) => ({
            id: item.id,
            type: item.type,
            status: item.status,
            featured: item.featured,
            title: item.title,
            summary: item.summary,
            body: item.body,
            category: item.category,
            tags: item.tags,
            date: item.date,
            location: item.location,
            image: item.image,
            ctaLabel: item.ctaLabel,
            ctaUrl: item.ctaUrl,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
            createdBy: item.createdBy,
            updatedBy: item.updatedBy
        }));
}

function getMessagesForClient(messages) {
    const formatDateLabel = (value) => {
        if (!value) return "";
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return value;
        return new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium", timeStyle: "short" }).format(date);
    };

    return [...messages]
        .sort((left, right) => new Date(right.createdAt || 0) - new Date(left.createdAt || 0))
        .map((item) => ({
            id: item.id,
            name: item.name,
            email: item.email,
            subject: item.subject,
            message: item.message,
            createdAt: item.createdAt,
            createdAtLabel: formatDateLabel(item.createdAt)
        }));
}

function getUsersForClient(users) {
    const sanitizeUserForClient = (user) => ({
        id: user.id,
        username: user.username,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        lastLoginAt: user.lastLoginAt || ""
    });

    return [...users]
        .sort((left, right) => left.username.localeCompare(right.username, "pt-BR"))
        .map(sanitizeUserForClient);
}

function buildExportPayload(data) {
    return {
        exportedAt: dataStore.nowIso(),
        users: getUsersForClient(data.users || []),
        contents: getAllContents(data.contents),
        messages: [...data.messages]
            .sort((left, right) => new Date(right.createdAt || 0) - new Date(left.createdAt || 0))
            .map((item) => ({
                id: item.id,
                name: item.name,
                email: item.email,
                subject: item.subject,
                message: item.message,
                createdAt: item.createdAt
            }))
    };
}

module.exports = {
    persistImageValue,
    safeDeleteUpload,
    getPublicContents,
    getAllContents,
    getMessagesForClient,
    getUsersForClient,
    buildExportPayload
};
