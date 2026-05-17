const crypto = require("node:crypto");
const fs = require("node:fs/promises");
const path = require("node:path");
const dataStore = require("./dataStore");
const imageService = require("./imageService");

async function safeDeleteUpload(value) {
    const isUploadedPath = (val) => {
        const normalized = dataStore.normalizeText(val, 500);
        return normalized.startsWith("uploads/") || normalized.startsWith("/uploads/");
    };

    if (!isUploadedPath(value)) {
        return;
    }

    try {
        const relative = dataStore.normalizeText(value).replace(/^\/+/, "");
        const target = path.normalize(path.join(dataStore.STORAGE_ROOT, relative));

        if (!target.startsWith(path.normalize(dataStore.UPLOAD_DIR))) {
            throw new Error("Caminho de upload invalido.");
        }
        await fs.unlink(target);
    } catch (error) {
        if (error.code !== "ENOENT") {
            throw error;
        }
    }
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
        throw new Error("A imagem precisa ser interna, https ou um arquivo enviado pelo painel.");
    }

    if (/^data:image\//i.test(value)) {
        const filename = await imageService.processCmsImage(value, dataStore.UPLOAD_DIR);
        const relativePath = `uploads/${filename}`;

        if (previousValue && previousValue !== relativePath) {
            await safeDeleteUpload(previousValue);
        }
        return relativePath;
    }

    const isUploadedPath = (val) => {
        const normalized = dataStore.normalizeText(val, 500);
        return normalized.startsWith("uploads/") || normalized.startsWith("/uploads/");
    };

    if (previousValue && previousValue !== value && isUploadedPath(previousValue)) {
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
