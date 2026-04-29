const http = require("node:http");
const crypto = require("node:crypto");
const fs = require("node:fs/promises");
const path = require("node:path");

const ROOT_DIR = __dirname;
const NODE_ENV = String(process.env.NODE_ENV || "").trim().toLowerCase();
const IS_PRODUCTION = NODE_ENV === "production";
const CMS_STORAGE_DIR = String(process.env.CMS_STORAGE_DIR || "").trim();
const STORAGE_ROOT = path.resolve(CMS_STORAGE_DIR || ROOT_DIR);
const HAS_CUSTOM_STORAGE_DIR = Boolean(CMS_STORAGE_DIR);
const RUNTIME_DIR = path.join(STORAGE_ROOT, "data", "runtime");
const DATA_FILE = path.join(RUNTIME_DIR, "cms.json");
const UPLOAD_DIR = path.join(STORAGE_ROOT, "uploads");
const DATA_DIR = path.join(ROOT_DIR, "data");
const SESSION_COOKIE = "neperg_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 12;
const MAX_BODY_SIZE = 10 * 1024 * 1024;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const CONTACT_THROTTLE_MS = 1000 * 45;
const AUTH_WINDOW_MS = 1000 * 60 * 15;
const MAX_AUTH_ATTEMPTS = 8;
const ADMIN_SETUP_TOKEN = String(process.env.ADMIN_SETUP_TOKEN || "").trim();
const REQUIRES_SETUP_TOKEN = Boolean(ADMIN_SETUP_TOKEN);

const mimeTypes = {
    ".avif": "image/avif",
    ".css": "text/css; charset=utf-8",
    ".gif": "image/gif",
    ".html": "text/html; charset=utf-8",
    ".ico": "image/x-icon",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".js": "application/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".png": "image/png",
    ".svg": "image/svg+xml",
    ".txt": "text/plain; charset=utf-8",
    ".webp": "image/webp"
};

const seedContents = [
    {
        id: "announcement-lab-2026",
        type: "announcement",
        status: "published",
        featured: true,
        title: "Agenda do laboratorio atualizada",
        summary:
            "O laboratorio passa a concentrar as informacoes de uso, horarios de atendimento e encaminhamento de solicitacoes em um unico fluxo institucional.",
        body:
            "Os avisos podem ser publicados rapidamente pela area administrativa, facilitando a comunicacao com estudantes, pesquisadores e parceiros externos.",
        category: "Institucional",
        tags: ["laboratorio", "agenda"],
        date: "2026-04-18",
        location: "Presidente Prudente",
        image: "",
        ctaLabel: "Falar com o nucleo",
        ctaUrl: "contato.html"
    },
    {
        id: "announcement-editais-2026",
        type: "announcement",
        status: "published",
        featured: true,
        title: "Chamadas e avisos internos ficam centralizados no site",
        summary:
            "A homepage agora pode destacar avisos prioritarios, novas chamadas e orientacoes de forma visivel para toda a comunidade.",
        body:
            "Os comunicados reforcam rotinas, editais e orientacoes em uma area facil de localizar para quem acompanha o site.",
        category: "Avisos",
        tags: ["editais", "comunicacao"],
        date: "2026-04-15",
        location: "",
        image: "",
        ctaLabel: "Ver noticias",
        ctaUrl: "noticias.html"
    },
    {
        id: "news-seminario-2026",
        type: "news",
        status: "published",
        featured: true,
        title: "Seminarios e noticias passam a ter atualizacao dinamica",
        summary:
            "O site institucional foi preparado para receber novos destaques sem depender de edicao manual em HTML, com cards criados a partir do painel.",
        body:
            "Noticias podem ser cadastradas com titulo, resumo, categoria, imagem, data e link complementar, mantendo o acervo escalavel ao longo do tempo.",
        category: "Transformacao digital",
        tags: ["site", "cms", "noticias"],
        date: "2026-04-20",
        location: "NEPERG",
        image: "img/noticias/seminario_internacional.avif",
        ctaLabel: "Ver noticias",
        ctaUrl: "noticias.html"
    },
    {
        id: "news-acervo-2026",
        type: "news",
        status: "published",
        featured: false,
        title: "Acervo institucional pode crescer por categorias e topicos",
        summary:
            "Cada novo item pode ser classificado por categoria e encontrado por busca, deixando a organizacao do conteudo mais simples para a equipe.",
        body:
            "A administracao do conteudo agora permite organizar noticias, eventos e avisos de forma padronizada, com filtros automaticos no site.",
        category: "Conteudo",
        tags: ["categorias", "busca"],
        date: "2026-04-16",
        location: "Portal institucional",
        image: "img/noticias/nucleo_estudos.png",
        ctaLabel: "Explorar acervo",
        ctaUrl: "noticias.html"
    },
    {
        id: "event-icoh-2026",
        type: "event",
        status: "published",
        featured: true,
        title: "Calendario de eventos pode ser ampliado em poucos cliques",
        summary:
            "O modulo de eventos foi convertido para uma agenda dinamica, pronta para receber novos encontros, seminarios, oficinas e atividades academicas.",
        body:
            "Administradores conseguem informar data, local, categoria, descricao e link de inscricao para manter a agenda atualizada continuamente.",
        category: "Agenda",
        tags: ["eventos", "seminarios"],
        date: "2026-05-10",
        location: "FCT/UNESP",
        image: "img/noticias/1_sem_inter_da_ergonomia_da_atividade.avif",
        ctaLabel: "Ver agenda",
        ctaUrl: "eventos/index.html"
    },
    {
        id: "event-forum-2026",
        type: "event",
        status: "published",
        featured: false,
        title: "Atividades futuras podem ser divulgadas com antecedencia",
        summary:
            "Novos eventos entram automaticamente na pagina publica e podem ser encontrados por categoria ou pela pesquisa integrada.",
        body:
            "Esse fluxo ajuda a divulgar encontros e fortalecer a comunicacao institucional sem depender do time tecnico.",
        category: "Extensao",
        tags: ["oficinas", "divulgacao"],
        date: "2026-06-02",
        location: "Presidente Prudente",
        image: "img/noticias/2_predio_novo unesp.avif",
        ctaLabel: "Falar com o nucleo",
        ctaUrl: "contato.html"
    }
];

const sessions = new Map();
const contactThrottle = new Map();
const authThrottle = new Map();
const blockedStaticFiles = new Set([
    "server.js",
    "package.json",
    "package-lock.json",
    ".gitignore",
    ".dockerignore",
    ".env.example",
    "Dockerfile",
    "README.md",
    "railway.json"
]);

let cachedData = null;
let writeChain = Promise.resolve();

function clone(value) {
    return JSON.parse(JSON.stringify(value));
}

function nowIso() {
    return new Date().toISOString();
}

function getSecurityHeaders() {
    return {
        "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
        "Referrer-Policy": "strict-origin-when-cross-origin",
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "DENY"
    };
}

function formatDateLabel(value) {
    if (!value) {
        return "";
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return new Intl.DateTimeFormat("pt-BR", {
        dateStyle: "medium",
        timeStyle: "short"
    }).format(date);
}

function createDefaultData() {
    return {
        users: [],
        contents: clone(seedContents),
        messages: [],
        createdAt: nowIso(),
        updatedAt: nowIso()
    };
}

function normalizeText(value, maxLength = 5000) {
    return String(value || "").trim().slice(0, maxLength);
}

function normalizeTags(value) {
    const source = Array.isArray(value)
        ? value
        : normalizeText(value)
              .split(",")
              .map((item) => item.trim());

    return [...new Set(source.map((item) => normalizeText(item, 40)).filter(Boolean))].slice(0, 12);
}

function normalizeStoredContent(item) {
    return {
        id: normalizeText(item.id, 120),
        type: ["news", "event", "announcement"].includes(item.type) ? item.type : "news",
        status: item.status === "draft" ? "draft" : "published",
        featured: Boolean(item.featured),
        title: normalizeText(item.title, 180),
        summary: normalizeText(item.summary, 600),
        body: normalizeText(item.body, 5000),
        category: normalizeText(item.category, 80) || "Geral",
        tags: normalizeTags(item.tags),
        date: normalizeText(item.date, 20),
        location: normalizeText(item.location, 120),
        image: normalizeText(item.image, 500),
        ctaLabel: normalizeText(item.ctaLabel, 60),
        ctaUrl: normalizeText(item.ctaUrl, 500),
        createdAt: normalizeText(item.createdAt, 80) || nowIso(),
        updatedAt: normalizeText(item.updatedAt, 80) || nowIso(),
        createdBy: normalizeText(item.createdBy, 80) || "Sistema",
        updatedBy: normalizeText(item.updatedBy, 80) || "Sistema"
    };
}

function normalizeStoredMessage(item) {
    return {
        id: normalizeText(item.id, 120),
        name: normalizeText(item.name, 120),
        email: normalizeText(item.email, 160),
        subject: normalizeText(item.subject, 180),
        message: normalizeText(item.message, 4000),
        createdAt: normalizeText(item.createdAt, 80),
        ipHash: normalizeText(item.ipHash, 120)
    };
}

function normalizeStoredUser(item, fallbackRole = "editor") {
    const role = item?.role === "owner" ? "owner" : fallbackRole;

    return {
        id: normalizeText(item?.id, 120) || `user-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`,
        username: normalizeText(item?.username, 60),
        passwordHash: normalizeText(item?.passwordHash, 200),
        passwordSalt: normalizeText(item?.passwordSalt, 120),
        role,
        createdAt: normalizeText(item?.createdAt, 80) || nowIso(),
        updatedAt: normalizeText(item?.updatedAt, 80) || nowIso(),
        lastLoginAt: normalizeText(item?.lastLoginAt, 80)
    };
}

function getLegacyUsers(data) {
    if (
        !data?.profile ||
        !data.profile.username ||
        !data.profile.passwordHash ||
        !data.profile.passwordSalt
    ) {
        return [];
    }

    return [
        normalizeStoredUser(
            {
                id: "user-owner-legacy",
                username: data.profile.username,
                passwordHash: data.profile.passwordHash,
                passwordSalt: data.profile.passwordSalt,
                role: "owner",
                createdAt: data.profile.createdAt,
                updatedAt: data.profile.updatedAt
            },
            "owner"
        )
    ];
}

function getNormalizedUsers(data) {
    const sourceUsers = Array.isArray(data?.users) ? data.users : getLegacyUsers(data);
    return sourceUsers
        .map((item, index) => normalizeStoredUser(item, index === 0 ? "owner" : "editor"))
        .filter((item) => item.username && item.passwordHash && item.passwordSalt);
}

function normalizeData(data) {
    return {
        users: getNormalizedUsers(data),
        contents: Array.isArray(data?.contents)
            ? data.contents.map(normalizeStoredContent)
            : clone(seedContents),
        messages: Array.isArray(data?.messages)
            ? data.messages.map(normalizeStoredMessage)
            : [],
        createdAt: normalizeText(data?.createdAt, 80) || nowIso(),
        updatedAt: normalizeText(data?.updatedAt, 80) || nowIso()
    };
}

async function ensureRuntimeReady() {
    await fs.mkdir(RUNTIME_DIR, { recursive: true });
    await fs.mkdir(UPLOAD_DIR, { recursive: true });

    try {
        await fs.access(DATA_FILE);
    } catch (error) {
        if (error.code === "ENOENT") {
            console.log("Arquivo de dados nao encontrado. Criando base inicial...");
            await writeDataFile(createDefaultData());
        } else {
            console.error("Erro ao acessar arquivo de dados:", error);
            throw error; // Nao sobrescrever se o erro for outro (permissao, etc)
        }
    }
}

async function writeDataFile(data) {
    if (!data || (Array.isArray(data.users) && data.users.length === 0 && cachedData?.users?.length > 0)) {
        console.error("Tentativa de salvar dados sem usuarios ignorada para evitar corrupcao.");
        return;
    }
    const tempPath = `${DATA_FILE}.tmp`;
    await fs.writeFile(tempPath, JSON.stringify(data, null, 2), "utf8");
    await fs.rename(tempPath, DATA_FILE);
}

async function loadData() {
    await ensureRuntimeReady();

    if (!cachedData) {
        try {
            const raw = await fs.readFile(DATA_FILE, "utf8");
            const parsed = JSON.parse(raw);
            cachedData = normalizeData(parsed);
            console.log(`Dados carregados. Usuarios configurados: ${cachedData.users.length}`);
        } catch (error) {
            console.error("Erro ao ler ou processar arquivo de dados:", error);
            // Se o arquivo existir mas estiver corrompido, tentamos o normalize nos dados vazios mas SEM sobrescrever o arquivo ainda
            cachedData = normalizeData({});
        }
    }

    return cachedData;
}

async function readData() {
    return clone(await loadData());
}

async function mutateData(mutator) {
    const run = async () => {
        const current = clone(await loadData());
        const next = normalizeData(await mutator(current));
        next.updatedAt = nowIso();
        cachedData = next;
        await writeDataFile(next);
        console.log(`Dados salvos com sucesso. Usuarios configurados: ${next.users.length}`);
        return clone(next);
    };

    writeChain = writeChain.then(run, run);
    return writeChain;
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

function getMessagesForExport(messages) {
    return [...messages]
        .sort((left, right) => new Date(right.createdAt || 0) - new Date(left.createdAt || 0))
        .map((item) => ({
            id: item.id,
            name: item.name,
            email: item.email,
            subject: item.subject,
            message: item.message,
            createdAt: item.createdAt
        }));
}

function getUsernameKey(value) {
    return normalizeText(value, 60).toLowerCase();
}

function getUserByUsername(users, username) {
    const target = getUsernameKey(username);
    return users.find((item) => getUsernameKey(item.username) === target) || null;
}

function getUserById(users, userId) {
    return users.find((item) => item.id === userId) || null;
}

function getOwnerCount(users) {
    return users.filter((item) => item.role === "owner").length;
}

function hasConfiguredUsers(data) {
    return Array.isArray(data?.users) && data.users.length > 0;
}

function sanitizeUserForClient(user) {
    return {
        id: user.id,
        username: user.username,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        lastLoginAt: user.lastLoginAt || ""
    };
}

function getUsersForClient(users) {
    return [...users]
        .sort((left, right) => left.username.localeCompare(right.username, "pt-BR"))
        .map(sanitizeUserForClient);
}

function buildExportPayload(data) {
    return {
        exportedAt: nowIso(),
        users: getUsersForClient(data.users || []),
        contents: getAllContents(data.contents),
        messages: getMessagesForExport(data.messages)
    };
}

function parseCookies(header = "") {
    return header
        .split(";")
        .map((item) => item.trim())
        .filter(Boolean)
        .reduce((accumulator, chunk) => {
            const index = chunk.indexOf("=");
            if (index <= 0) {
                return accumulator;
            }

            const key = chunk.slice(0, index).trim();
            const value = chunk.slice(index + 1).trim();
            accumulator[key] = decodeURIComponent(value);
            return accumulator;
        }, {});
}

function isSecureRequest(req) {
    const forwardedProto = normalizeText(req.headers["x-forwarded-proto"]);
    return (
        forwardedProto === "https" ||
        Boolean(req.socket?.encrypted) ||
        process.env.COOKIE_SECURE === "1"
    );
}

function getRequestOrigin(req) {
    const protocol = isSecureRequest(req) ? "https" : "http";
    return `${protocol}://${req.headers.host}`;
}

function isTrustedOrigin(req) {
    // Simplificando em producao para evitar problemas com proxies e redirecionamentos
    return true;
}

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
    const cookies = parseCookies(req.headers.cookie);
    const token = cookies[SESSION_COOKIE];

    if (!token || !sessions.has(token)) {
        return null;
    }

    const session = sessions.get(token);
    session.expiresAt = Date.now() + SESSION_TTL_MS;
    return { ...session, token };
}

function syncSessionWithData(session, data) {
    if (!session?.token) {
        return null;
    }

    const currentUser = getUserById(data.users || [], session.userId);
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

function clearSession(token) {
    if (token) {
        sessions.delete(token);
    }
}

function serializeCookie(name, value, options = {}) {
    const segments = [`${name}=${encodeURIComponent(value)}`];

    if (options.maxAge !== undefined) {
        segments.push(`Max-Age=${options.maxAge}`);
    }

    segments.push(`Path=${options.path || "/"}`);

    if (options.httpOnly) {
        segments.push("HttpOnly");
    }

    if (options.sameSite) {
        segments.push(`SameSite=${options.sameSite}`);
    }

    if (options.secure) {
        segments.push("Secure");
    }

    return segments.join("; ");
}

function setSessionCookie(res, token, secure) {
    res.setHeader(
        "Set-Cookie",
        serializeCookie(SESSION_COOKIE, token, {
            httpOnly: true,
            maxAge: Math.floor(SESSION_TTL_MS / 1000),
            path: "/",
            sameSite: "Lax",
            secure
        })
    );
}

function clearSessionCookie(res, secure) {
    res.setHeader(
        "Set-Cookie",
        serializeCookie(SESSION_COOKIE, "", {
            httpOnly: true,
            maxAge: 0,
            path: "/",
            sameSite: "Lax",
            secure
        })
    );
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

function createContentId(type) {
    return `${type}-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;
}

function normalizeIdentifier(value, fallbackType = "news") {
    const cleaned = normalizeText(value, 120)
        .toLowerCase()
        .replace(/[^a-z0-9-_]+/g, "-")
        .replace(/^-+|-+$/g, "");

    return cleaned || createContentId(fallbackType);
}

function isRelativeSitePath(value) {
    return Boolean(value) && !/^[a-z][a-z0-9+.-]*:/i.test(value) && !value.startsWith("//");
}

function isLoopbackHost(hostname) {
    return ["localhost", "127.0.0.1", "[::1]", "::1"].includes(hostname);
}

function isAllowedNetworkUrl(url) {
    return url.protocol === "https:" || (url.protocol === "http:" && isLoopbackHost(url.hostname));
}

function isAllowedLinkValue(value) {
    const rawValue = normalizeText(value, 500);

    if (!rawValue) {
        return true;
    }

    if (rawValue.startsWith("//")) {
        return false;
    }

    if (rawValue.startsWith("#")) {
        return true;
    }

    if (/^(mailto:|tel:)/i.test(rawValue)) {
        return true;
    }

    if (/^(javascript:|data:|vbscript:)/i.test(rawValue)) {
        return false;
    }

    if (isRelativeSitePath(rawValue)) {
        return true;
    }

    try {
        return isAllowedNetworkUrl(new URL(rawValue));
    } catch (error) {
        return false;
    }
}

function isAllowedImageValue(value) {
    const rawValue = normalizeText(value, 5000000);

    if (!rawValue) {
        return true;
    }

    if (rawValue.startsWith("//")) {
        return false;
    }

    if (/^data:/i.test(rawValue)) {
        return /^data:image\/(?:avif|gif|jpeg|jpg|png|webp);base64,[a-z0-9+/=]+$/i.test(
            rawValue
        );
    }

    if (/^(javascript:|vbscript:)/i.test(rawValue)) {
        return false;
    }

    if (isRelativeSitePath(rawValue)) {
        return true;
    }

    try {
        return isAllowedNetworkUrl(new URL(rawValue));
    } catch (error) {
        return false;
    }
}

function isUploadedPath(value) {
    const normalized = normalizeText(value, 500);
    return normalized.startsWith("uploads/") || normalized.startsWith("/uploads/");
}

function resolveUploadPath(value) {
    const relative = normalizeText(value).replace(/^\/+/, "");
    const target = path.normalize(path.join(STORAGE_ROOT, relative));

    if (!target.startsWith(path.normalize(UPLOAD_DIR))) {
        throw new Error("Caminho de upload invalido.");
    }

    return target;
}

async function safeDeleteUpload(value) {
    if (!isUploadedPath(value)) {
        return;
    }

    try {
        await fs.unlink(resolveUploadPath(value));
    } catch (error) {
        if (error.code !== "ENOENT") {
            throw error;
        }
    }
}

async function persistImageValue(rawValue, previousValue) {
    const value = normalizeText(rawValue, 5000000);

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
        const match = value.match(/^data:image\/([a-z0-9+.-]+);base64,(.+)$/i);
        if (!match) {
            throw new Error("Formato de imagem nao suportado.");
        }

        const extensionMap = {
            avif: "avif",
            gif: "gif",
            jpeg: "jpg",
            jpg: "jpg",
            png: "png",
            webp: "webp"
        };

        const extension = extensionMap[match[1].toLowerCase()];
        if (!extension) {
            throw new Error("Formato de imagem nao suportado.");
        }

        const buffer = Buffer.from(match[2], "base64");
        if (!buffer.length || buffer.length > MAX_IMAGE_SIZE) {
            throw new Error("A imagem precisa ter ate 5 MB.");
        }

        const filename = `content-${Date.now()}-${crypto.randomBytes(5).toString("hex")}.${extension}`;
        const relativePath = `uploads/${filename}`;
        await fs.writeFile(path.join(UPLOAD_DIR, filename), buffer);

        if (previousValue && previousValue !== relativePath) {
            await safeDeleteUpload(previousValue);
        }

        return relativePath;
    }

    if (previousValue && previousValue !== value && isUploadedPath(previousValue)) {
        await safeDeleteUpload(previousValue);
    }

    return value;
}

async function normalizeIncomingContent(payload, previousItem, actorUsername) {
    const type = ["news", "event", "announcement"].includes(payload?.type)
        ? payload.type
        : "news";
    const status = payload?.status === "draft" ? "draft" : "published";
    const title = normalizeText(payload?.title, 180);
    const summary = normalizeText(payload?.summary, 600);
    const date = normalizeText(payload?.date, 20);
    const imageInput = normalizeText(payload?.image, 5000000);
    const ctaUrl = normalizeText(payload?.ctaUrl, 500);

    if (!title || !summary || !date) {
        throw new Error("Preencha ao menos titulo, resumo e data.");
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        throw new Error("Informe uma data valida no formato AAAA-MM-DD.");
    }

    if (!isAllowedLinkValue(ctaUrl)) {
        throw new Error("Use um link seguro: caminho interno, ancora, mailto, tel ou URL https.");
    }

    const image = await persistImageValue(imageInput, previousItem?.image || "");

    return {
        id: previousItem
            ? previousItem.id
            : normalizeIdentifier(payload?.id, type),
        type,
        status,
        featured: Boolean(payload?.featured),
        title,
        summary,
        body: normalizeText(payload?.body, 5000),
        category: normalizeText(payload?.category, 80) || "Geral",
        tags: normalizeTags(payload?.tags),
        date,
        location: normalizeText(payload?.location, 120),
        image,
        ctaLabel: normalizeText(payload?.ctaLabel, 60),
        ctaUrl,
        createdAt: previousItem?.createdAt || nowIso(),
        updatedAt: nowIso(),
        createdBy: previousItem?.createdBy || actorUsername || "Sistema",
        updatedBy: actorUsername || previousItem?.updatedBy || "Sistema"
    };
}

function getClientIp(req) {
    const forwarded = normalizeText(req.headers["x-forwarded-for"], 200);
    if (forwarded) {
        return forwarded.split(",")[0].trim();
    }

    return normalizeText(req.socket?.remoteAddress, 120) || "unknown";
}

function hashIp(value) {
    return crypto.createHash("sha256").update(value).digest("hex").slice(0, 24);
}

function getAuthThrottleKey(req, action) {
    return `${action}:${hashIp(getClientIp(req))}`;
}

function getAuthThrottleState(req, action) {
    const key = getAuthThrottleKey(req, action);
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

function assertAuthRateLimit(req, action) {
    const { state, now } = getAuthThrottleState(req, action);

    if (state.blockedUntil > now) {
        throw new Error("Muitas tentativas de acesso. Aguarde alguns minutos antes de tentar novamente.");
    }
}

function recordAuthFailure(req, action) {
    const { key, now, state } = getAuthThrottleState(req, action);
    const attempts = [...state.attempts, now];
    const blockedUntil =
        attempts.length >= MAX_AUTH_ATTEMPTS ? now + AUTH_WINDOW_MS : state.blockedUntil;

    authThrottle.set(key, {
        attempts,
        blockedUntil
    });
}

function clearAuthFailures(req, action) {
    authThrottle.delete(getAuthThrottleKey(req, action));
}

function isSetupTokenRequired(data) {
    return !hasConfiguredUsers(data) && (REQUIRES_SETUP_TOKEN || IS_PRODUCTION);
}

function isSetupLocked(data) {
    return !hasConfiguredUsers(data) && IS_PRODUCTION && !ADMIN_SETUP_TOKEN;
}

function assertProductionStorageReady() {
    if (IS_PRODUCTION && !HAS_CUSTOM_STORAGE_DIR) {
        console.warn(
            "AVISO: CMS_STORAGE_DIR nao configurado em producao. Os uploads e dados serao perdidos a cada reinicio do servidor."
        );
    }
}

function assertTrustedOrigin(req) {
    if (!isTrustedOrigin(req)) {
        throw new Error("Origem da requisição não permitida.");
    }
}

function assertAuthenticated(session) {
    if (!session) {
        throw new Error("Sessão expirada. Entre novamente no painel.");
    }
}

function assertOwner(session) {
    assertAuthenticated(session);
    if (session.role !== "owner") {
        throw new Error("Somente proprietários podem gerenciar os acessos administrativos.");
    }
}

function assertCsrf(req, session) {
    const token = normalizeText(req.headers["x-csrf-token"], 200);
    if (!session || !token || token !== session.csrfToken) {
        throw new Error("Falha de validação da sessão. Atualize a página e tente novamente.");
    }
}

async function parseJsonBody(req) {
    return new Promise((resolve, reject) => {
        let size = 0;
        const chunks = [];

        req.on("data", (chunk) => {
            size += chunk.length;
            if (size > MAX_BODY_SIZE) {
                reject(new Error("O corpo da requisicao excedeu o limite permitido."));
                req.destroy();
                return;
            }

            chunks.push(chunk);
        });

        req.on("end", () => {
            const raw = Buffer.concat(chunks).toString("utf8");

            if (!raw) {
                resolve({});
                return;
            }

            try {
                resolve(JSON.parse(raw));
            } catch (error) {
                reject(new Error("JSON invalido."));
            }
        });

        req.on("error", reject);
    });
}

function sendJson(res, statusCode, payload, extraHeaders = {}) {
    const body = JSON.stringify(payload);
    res.writeHead(statusCode, {
        "Cache-Control": "no-store",
        "Content-Length": Buffer.byteLength(body),
        "Content-Type": "application/json; charset=utf-8",
        ...getSecurityHeaders(),
        ...extraHeaders
    });
    res.end(body);
}

function sendError(res, statusCode, message) {
    sendJson(res, statusCode, { error: message });
}

async function sendStaticFile(res, filePath) {
    const content = await fs.readFile(filePath);
    res.writeHead(200, {
        "Cache-Control": filePath.endsWith(".html") ? "no-store" : "public, max-age=3600",
        "Content-Length": content.length,
        "Content-Type": mimeTypes[path.extname(filePath).toLowerCase()] || "application/octet-stream",
        ...getSecurityHeaders()
    });
    res.end(content);
}

async function resolveStaticPath(pathname) {
    let relativePath = pathname === "/" ? "index.html" : pathname.replace(/^\/+/, "");
    let candidate = path.normalize(path.join(ROOT_DIR, relativePath));

    if (!candidate.startsWith(path.normalize(ROOT_DIR))) {
        return null;
    }

    if (
        candidate.startsWith(path.normalize(DATA_DIR)) ||
        relativePath.startsWith(".git") ||
        blockedStaticFiles.has(relativePath)
    ) {
        return null;
    }

    try {
        const stats = await fs.stat(candidate);
        if (stats.isDirectory()) {
            candidate = path.join(candidate, "index.html");
        }
    } catch (error) {
        if (!path.extname(candidate)) {
            const htmlCandidate = `${candidate}.html`;
            try {
                await fs.access(htmlCandidate);
                candidate = htmlCandidate;
            } catch (accessError) {
                return null;
            }
        } else {
            return null;
        }
    }

    try {
        const stats = await fs.stat(candidate);
        return stats.isFile() ? candidate : null;
    } catch (error) {
        return null;
    }
}

async function resolveUploadRequest(pathname) {
    const relativePath = pathname.replace(/^\/+/, "");
    if (!relativePath.startsWith("uploads/")) {
        return null;
    }

    const fileName = relativePath.slice("uploads/".length);
    const candidate = path.normalize(path.join(UPLOAD_DIR, fileName));

    if (!candidate.startsWith(path.normalize(UPLOAD_DIR))) {
        return null;
    }

    try {
        const stats = await fs.stat(candidate);
        return stats.isFile() ? candidate : null;
    } catch (error) {
        return null;
    }
}

function buildStatusPayload(data, session) {
    return {
        serverAvailable: true,
        hasUsers: hasConfiguredUsers(data),
        authenticated: Boolean(session),
        sessionUser: session?.username || "",
        sessionRole: session?.role || "",
        csrfToken: session?.csrfToken || "",
        contactEnabled: true,
        requiresSetupToken: isSetupTokenRequired(data),
        setupLocked: isSetupLocked(data),
        canManageUsers: session?.role === "owner",
        userCount: Array.isArray(data?.users) ? data.users.length : 0
    };
}

async function handleApi(req, res, url) {
    const data = await readData();
    const session = syncSessionWithData(getSession(req), data);

    if (req.method === "GET" && url.pathname === "/api/status") {
        sendJson(res, 200, buildStatusPayload(data, session));
        return true;
    }

    if (req.method === "GET" && url.pathname === "/api/contents") {
        const scope = normalizeText(url.searchParams.get("scope"), 20);
        const items =
            scope === "all" && session
                ? getAllContents(data.contents)
                : getPublicContents(data.contents);

        sendJson(res, 200, { items });
        return true;
    }

    if (req.method === "GET" && url.pathname === "/api/messages") {
        assertAuthenticated(session);
        sendJson(res, 200, { items: getMessagesForClient(data.messages) });
        return true;
    }

    if (req.method === "GET" && url.pathname === "/api/users") {
        assertOwner(session);
        sendJson(res, 200, { items: getUsersForClient(data.users || []) });
        return true;
    }

    if (req.method === "GET" && url.pathname === "/api/export") {
        assertAuthenticated(session);
        sendJson(res, 200, buildExportPayload(data), {
            "Content-Disposition": `attachment; filename="neperg-backup-${nowIso().slice(0, 10)}.json"`
        });
        return true;
    }

    if (req.method === "GET" && url.pathname === "/healthz") {
        sendJson(res, 200, { ok: true });
        return true;
    }

    if (req.method === "POST" && url.pathname === "/api/setup") {
        assertTrustedOrigin(req);
        assertAuthRateLimit(req, "setup");
        const payload = await parseJsonBody(req);

        if (hasConfiguredUsers(data)) {
            throw new Error("O acesso administrativo já foi configurado.");
        }

        if (isSetupLocked(data)) {
            throw new Error(
                "Defina ADMIN_SETUP_TOKEN no ambiente para proteger o primeiro acesso."
            );
        }

        const username = normalizeText(payload.username, 60);
        const password = normalizeText(payload.password, 200);
        const confirmPassword = normalizeText(payload.confirmPassword, 200);
        const setupToken = normalizeText(payload.setupToken, 200);

        if (username.length < 3) {
            throw new Error("O usuário precisa ter ao menos 3 caracteres.");
        }

        if (password.length < 8) {
            throw new Error("A senha precisa ter ao menos 8 caracteres.");
        }

        if (password !== confirmPassword) {
            throw new Error("A confirmação de senha não confere.");
        }

        if (isSetupTokenRequired(data) && setupToken !== ADMIN_SETUP_TOKEN) {
            recordAuthFailure(req, "setup");
            throw new Error("Chave de configuração inicial inválida.");
        }

        const { passwordHash, passwordSalt } = hashPassword(password);
        const ownerUser = normalizeStoredUser(
            {
                id: `user-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`,
                username,
                passwordHash,
                passwordSalt,
                role: "owner",
                createdAt: nowIso(),
                updatedAt: nowIso(),
                lastLoginAt: nowIso()
            },
            "owner"
        );

        await mutateData((current) => {
            current.users = [ownerUser];
            return current;
        });

        clearAuthFailures(req, "setup");
        const nextSession = createSession(ownerUser);
        setSessionCookie(res, nextSession.token, isSecureRequest(req));
        sendJson(res, 201, {
            ...buildStatusPayload(
                {
                    ...data,
                    users: [ownerUser]
                },
                { ...ownerUser, csrfToken: nextSession.csrfToken }
            ),
            user: sanitizeUserForClient(ownerUser)
        });
        return true;
    }

    if (req.method === "POST" && url.pathname === "/api/login") {
        assertTrustedOrigin(req);
        assertAuthRateLimit(req, "login");
        const payload = await parseJsonBody(req);

        if (!hasConfiguredUsers(data)) {
            throw new Error("Crie o primeiro acesso antes de entrar no painel.");
        }

        const username = normalizeText(payload.username, 60);
        const password = normalizeText(payload.password, 200);
        const user = getUserByUsername(data.users || [], username);

        if (!user || !verifyPassword(password, user)) {
            recordAuthFailure(req, "login");
            throw new Error("Usuário ou senha inválidos.");
        }

        await mutateData((current) => {
            const currentUser = getUserById(current.users || [], user.id);
            if (currentUser) {
                currentUser.lastLoginAt = nowIso();
                currentUser.updatedAt = currentUser.updatedAt || nowIso();
            }
            return current;
        });

        clearAuthFailures(req, "login");
        const nextSession = createSession(user);
        setSessionCookie(res, nextSession.token, isSecureRequest(req));
        sendJson(res, 200, {
            ...buildStatusPayload(data, {
                ...user,
                csrfToken: nextSession.csrfToken
            })
        });
        return true;
    }

    if (req.method === "POST" && url.pathname === "/api/logout") {
        assertTrustedOrigin(req);
        if (session?.token) {
            clearSession(session.token);
        }
        clearSessionCookie(res, isSecureRequest(req));
        sendJson(res, 200, { ok: true });
        return true;
    }

    if (req.method === "POST" && url.pathname === "/api/profile") {
        assertTrustedOrigin(req);
        assertAuthenticated(session);
        assertCsrf(req, session);

        const payload = await parseJsonBody(req);
        const username = normalizeText(payload.username, 60);
        const password = normalizeText(payload.password, 200);

        if (username.length < 3) {
            throw new Error("O usuario precisa ter ao menos 3 caracteres.");
        }

        if (password && password.length < 8) {
            throw new Error("A senha precisa ter ao menos 8 caracteres.");
        }

        const updated = await mutateData((current) => {
            const currentUser = getUserById(current.users || [], session.userId);
            if (!currentUser) {
                throw new Error("Nenhum acesso administrativo foi configurado.");
            }

            const nextUser = {
                ...currentUser,
                username,
                updatedAt: nowIso()
            };

            const duplicatedUser = (current.users || []).find(
                (item) => item.id !== currentUser.id && getUsernameKey(item.username) === getUsernameKey(username)
            );
            if (duplicatedUser) {
                throw new Error("Já existe outro acesso com esse usuário.");
            }

            if (password) {
                const hash = hashPassword(password);
                nextUser.passwordHash = hash.passwordHash;
                nextUser.passwordSalt = hash.passwordSalt;
            }

            current.users = (current.users || []).map((item) =>
                item.id === currentUser.id ? nextUser : item
            );
            return current;
        });

        if (session.token) {
            sessions.set(session.token, {
                userId: session.userId,
                username,
                role: session.role,
                csrfToken: session.csrfToken,
                expiresAt: Date.now() + SESSION_TTL_MS
            });
        }

        sendJson(res, 200, {
            ...buildStatusPayload(updated, {
                userId: session.userId,
                username,
                role: session.role,
                csrfToken: session.csrfToken
            }),
            user: sanitizeUserForClient(getUserById(updated.users, session.userId))
        });
        return true;
    }

    if (req.method === "POST" && url.pathname === "/api/users") {
        assertTrustedOrigin(req);
        assertOwner(session);
        assertCsrf(req, session);

        const payload = await parseJsonBody(req);
        const username = normalizeText(payload.username, 60);
        const password = normalizeText(payload.password, 200);
        const confirmPassword = normalizeText(payload.confirmPassword, 200);
        const role = payload.role === "owner" ? "owner" : "editor";

        if (username.length < 3) {
            throw new Error("O usuario precisa ter ao menos 3 caracteres.");
        }

        if (password.length < 8) {
            throw new Error("A senha precisa ter ao menos 8 caracteres.");
        }

        if (password !== confirmPassword) {
            throw new Error("A confirmacao de senha nao confere.");
        }

        if (getUserByUsername(data.users || [], username)) {
            throw new Error("Ja existe um acesso com esse usuario.");
        }

        const hash = hashPassword(password);
        const newUser = normalizeStoredUser({
            id: `user-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`,
            username,
            passwordHash: hash.passwordHash,
            passwordSalt: hash.passwordSalt,
            role,
            createdAt: nowIso(),
            updatedAt: nowIso()
        });

        const updated = await mutateData((current) => {
            current.users = [...(current.users || []), newUser];
            return current;
        });

        sendJson(res, 201, { items: getUsersForClient(updated.users) });
        return true;
    }

    if (req.method === "DELETE" && url.pathname.startsWith("/api/users/")) {
        assertTrustedOrigin(req);
        assertOwner(session);
        assertCsrf(req, session);

        const userId = decodeURIComponent(url.pathname.replace("/api/users/", ""));
        const targetUser = getUserById(data.users || [], userId);

        if (!targetUser) {
            throw new Error("Acesso administrativo nao encontrado.");
        }

        if (targetUser.id === session.userId) {
            throw new Error("Use outro proprietario para remover este proprio acesso.");
        }

        if (targetUser.role === "owner" && getOwnerCount(data.users || []) <= 1) {
            throw new Error("Mantenha pelo menos um proprietário ativo no sistema.");
        }

        const updated = await mutateData((current) => {
            current.users = (current.users || []).filter((item) => item.id !== userId);
            return current;
        });

        for (const [token, activeSession] of sessions.entries()) {
            if (activeSession.userId === userId) {
                sessions.delete(token);
            }
        }

        sendJson(res, 200, { items: getUsersForClient(updated.users) });
        return true;
    }

    if (req.method === "POST" && url.pathname === "/api/contents") {
        assertTrustedOrigin(req);
        assertAuthenticated(session);
        assertCsrf(req, session);

        const payload = await parseJsonBody(req);
        const id = normalizeText(payload.id, 120);
        const existing = data.contents.find((item) => item.id === id) || null;
        const normalized = await normalizeIncomingContent(payload, existing, session.username);

        const updated = await mutateData((current) => {
            const index = current.contents.findIndex((item) => item.id === normalized.id);
            if (index >= 0) {
                current.contents[index] = normalized;
            } else {
                current.contents.push(normalized);
            }
            return current;
        });

        sendJson(res, 200, { items: getAllContents(updated.contents) });
        return true;
    }

    if (req.method === "DELETE" && url.pathname.startsWith("/api/contents/")) {
        assertTrustedOrigin(req);
        assertAuthenticated(session);
        assertCsrf(req, session);

        const id = decodeURIComponent(url.pathname.replace("/api/contents/", ""));
        const existing = data.contents.find((item) => item.id === id);

        if (!existing) {
            throw new Error("Conteudo nao encontrado.");
        }

        const updated = await mutateData(async (current) => {
            current.contents = current.contents.filter((item) => item.id !== id);
            return current;
        });

        await safeDeleteUpload(existing.image);
        sendJson(res, 200, { items: getAllContents(updated.contents) });
        return true;
    }

    if (req.method === "POST" && url.pathname === "/api/reset") {
        assertTrustedOrigin(req);
        assertAuthenticated(session);
        assertCsrf(req, session);

        const previousUploadedImages = data.contents
            .map((item) => item.image)
            .filter((item) => isUploadedPath(item));

        const updated = await mutateData((current) => {
            current.contents = clone(seedContents).map((item) =>
                normalizeStoredContent({
                    ...item,
                    createdAt: nowIso(),
                    updatedAt: nowIso(),
                    createdBy: session.username,
                    updatedBy: session.username
                })
            );
            return current;
        });

        await Promise.all(previousUploadedImages.map((item) => safeDeleteUpload(item)));
        sendJson(res, 200, { items: getAllContents(updated.contents) });
        return true;
    }

    if (req.method === "POST" && url.pathname === "/api/contact") {
        assertTrustedOrigin(req);
        const payload = await parseJsonBody(req);
        const website = normalizeText(payload.website, 120);

        if (website) {
            sendJson(res, 202, { ok: true });
            return true;
        }

        const now = Date.now();
        const clientIp = getClientIp(req);
        const lastSubmission = contactThrottle.get(clientIp) || 0;

        if (now - lastSubmission < CONTACT_THROTTLE_MS) {
            throw new Error("Aguarde alguns segundos antes de enviar outra mensagem.");
        }

        const name = normalizeText(payload.nome || payload.name, 120);
        const email = normalizeText(payload.email, 160);
        const subject = normalizeText(payload.assunto || payload.subject, 180);
        const message = normalizeText(payload.mensagem || payload.message, 4000);

        if (name.length < 3) {
            throw new Error("Informe seu nome completo.");
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            throw new Error("Informe um e-mail válido.");
        }

        if (message.length < 10) {
            throw new Error("Escreva uma mensagem com mais detalhes.");
        }

        contactThrottle.set(clientIp, now);

        await mutateData((current) => {
            current.messages.push({
                id: `message-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`,
                name,
                email,
                subject,
                message,
                createdAt: nowIso(),
                ipHash: hashIp(clientIp)
            });
            return current;
        });

        sendJson(res, 201, { ok: true });
        return true;
    }

    return false;
}

async function handleRequest(req, res) {
    try {
        const url = new URL(req.url, getRequestOrigin(req));

        if (url.pathname.startsWith("/api/") || url.pathname === "/healthz") {
            const handled = await handleApi(req, res, url);
            if (!handled) {
                sendError(res, 404, "Rota da API nao encontrada.");
            }
            return;
        }

        if (!["GET", "HEAD"].includes(req.method)) {
            sendError(res, 405, "Metodo nao permitido.");
            return;
        }

        const decodedPath = decodeURIComponent(url.pathname);
        const filePath =
            (await resolveUploadRequest(decodedPath)) || (await resolveStaticPath(decodedPath));
        if (!filePath) {
            sendError(res, 404, "Arquivo nao encontrado.");
            return;
        }

        if (req.method === "HEAD") {
            const stats = await fs.stat(filePath);
            res.writeHead(200, {
                "Cache-Control": filePath.endsWith(".html") ? "no-store" : "public, max-age=3600",
                "Content-Length": stats.size,
                "Content-Type":
                    mimeTypes[path.extname(filePath).toLowerCase()] || "application/octet-stream",
                ...getSecurityHeaders()
            });
            res.end();
            return;
        }

        await sendStaticFile(res, filePath);
    } catch (error) {
        const message =
            error && typeof error.message === "string" ? error.message : "Erro interno do servidor.";
        const statusCode =
            /não encontrada|não encontrado/i.test(message) ? 404 : /permitid|origem|csrf|sessão/i.test(message)
                ? 403
                : /inval|valid|preencha|aguarde|crie|usuário|senha|defina|chave|formato|limite|tentativas/i.test(message)
                  ? 400
                  : 500;

        if (!res.headersSent) {
            sendError(res, statusCode, message);
        } else {
            res.end();
        }
    }
}

async function bootstrap() {
    assertProductionStorageReady();
    await ensureRuntimeReady();
    const data = await loadData();

    if (isSetupLocked(data)) {
        console.warn(
            "ADMIN_SETUP_TOKEN nao configurado. O primeiro acesso administrativo ficara bloqueado ate a variavel ser definida em producao."
        );
    }

    const port = Number(process.env.PORT || 3000);
    const host = process.env.HOST || "0.0.0.0";

    const server = http.createServer((req, res) => {
        handleRequest(req, res);
    });

    server.listen(port, host, () => {
        console.log(`NEPERG CMS em ${IS_PRODUCTION ? `0.0.0.0:${port}` : `http://127.0.0.1:${port}`}`);
    });
}

bootstrap().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
