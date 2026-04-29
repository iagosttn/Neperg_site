const dataStore = require("../services/dataStore");
const authService = require("../services/authService");
const cmsService = require("../services/cmsService");
const validator = require("../utils/validator");
const crypto = require("node:crypto");

exports.getStatus = async (req, res) => {
    const data = await dataStore.readData();
    const session = authService.getSession(req);
    const syncedSession = authService.syncSessionWithData(session, data);

    res.json({
        serverAvailable: true,
        hasUsers: Array.isArray(data?.users) && data.users.length > 0,
        authenticated: Boolean(syncedSession),
        sessionUser: syncedSession?.username || "",
        sessionRole: syncedSession?.role || "",
        csrfToken: syncedSession?.csrfToken || "",
        contactEnabled: true,
        requiresSetupToken: authService.isSetupTokenRequired(data),
        setupLocked: authService.isSetupLocked(data),
        canManageUsers: syncedSession?.role === "owner",
        userCount: Array.isArray(data?.users) ? data.users.length : 0
    });
};

exports.getContents = async (req, res) => {
    const data = await dataStore.readData();
    const session = authService.getSession(req);
    const scope = dataStore.normalizeText(req.query.scope, 20);

    const items = scope === "all" && session
        ? cmsService.getAllContents(data.contents)
        : cmsService.getPublicContents(data.contents);

    res.json({ items });
};

exports.getMessages = async (req, res) => {
    const session = authService.getSession(req);
    if (!session) return res.status(401).json({ error: "Sessão expirada." });

    const data = await dataStore.readData();
    res.json({ items: cmsService.getMessagesForClient(data.messages) });
};

exports.getUsers = async (req, res) => {
    const session = authService.getSession(req);
    if (!session || session.role !== "owner") return res.status(403).json({ error: "Acesso negado." });

    const data = await dataStore.readData();
    res.json({ items: cmsService.getUsersForClient(data.users || []) });
};

exports.exportData = async (req, res) => {
    const session = authService.getSession(req);
    if (!session) return res.status(401).json({ error: "Sessão expirada." });

    const data = await dataStore.readData();
    res.setHeader("Content-Disposition", `attachment; filename="neperg-backup-${dataStore.nowIso().slice(0, 10)}.json"`);
    res.json(cmsService.buildExportPayload(data));
};

exports.login = async (req, res) => {
    const ip = req.ip || req.socket.remoteAddress || "unknown";
    const { state, now } = authService.getAuthThrottleState(ip, "login");

    if (state.blockedUntil > now) {
        return res.status(429).json({ error: "Muitas tentativas. Aguarde alguns minutos." });
    }

    const { username, password } = req.body;
    const v = validator(req.body)
        .required("username", "Informe o usuário.")
        .required("password", "Informe a senha.");

    if (!v.isValid()) {
        return res.status(400).json({ error: v.getErrorMessage() });
    }

    const data = await dataStore.readData();
    const user = (data.users || []).find(u => u.username.toLowerCase() === String(username || "").toLowerCase());

    if (!user || !authService.verifyPassword(password, user)) {
        const key = `${state.key}`;
        const attempts = [...state.attempts, now];
        const blockedUntil = attempts.length >= 8 ? now + (1000 * 60 * 15) : state.blockedUntil;
        authService.authThrottle.set(key, { attempts, blockedUntil });
        return res.status(401).json({ error: "Usuário ou senha inválidos." });
    }

    await dataStore.mutateData((current) => {
        const u = current.users.find(u => u.id === user.id);
        if (u) u.lastLoginAt = dataStore.nowIso();
        return current;
    });

    const nextSession = authService.createSession(user);
    res.cookie(authService.SESSION_COOKIE, nextSession.token, {
        httpOnly: true,
        maxAge: authService.SESSION_TTL_MS,
        path: "/",
        sameSite: "Lax",
        secure: req.secure || process.env.NODE_ENV === "production"
    });

    res.json({ ok: true, csrfToken: nextSession.csrfToken });
};

exports.logout = (req, res) => {
    const session = authService.getSession(req);
    if (session) authService.clearSession(session.token);
    res.clearCookie(authService.SESSION_COOKIE);
    res.json({ ok: true });
};

exports.saveContent = async (req, res) => {
    const session = authService.getSession(req);
    if (!session) return res.status(401).json({ error: "Sessão expirada." });

    const data = await dataStore.readData();
    const payload = req.body;

    const v = validator(payload)
        .required("title", "O título é obrigatório.")
        .required("summary", "O resumo é obrigatório.")
        .required("type", "O tipo de conteúdo é obrigatório.");

    if (!v.isValid()) {
        return res.status(400).json({ error: v.getErrorMessage() });
    }

    const existing = data.contents.find(c => c.id === payload.id) || null;

    // Normalização local rápida (pode ser movida para serviço se crescer)
    const normalized = await dataStore.mutateData(async (current) => {
        const type = ["news", "event", "announcement"].includes(payload.type) ? payload.type : "news";
        const image = await cmsService.persistImageValue(payload.image, existing?.image || "");

        const item = {
            ...dataStore.normalizeStoredContent(payload),
            id: existing ? existing.id : (payload.id || `content-${Date.now()}`),
            image,
            updatedAt: dataStore.nowIso(),
            updatedBy: session.username
        };

        if (!existing) {
            item.createdAt = dataStore.nowIso();
            item.createdBy = session.username;
            current.contents.push(item);
        } else {
            const idx = current.contents.findIndex(c => c.id === existing.id);
            current.contents[idx] = item;
        }
        return current;
    });

    res.json({ items: cmsService.getAllContents(normalized.contents) });
};

exports.deleteContent = async (req, res) => {
    const session = authService.getSession(req);
    if (!session) return res.status(401).json({ error: "Sessão expirada." });

    const id = req.params.id;
    const data = await dataStore.readData();
    const existing = data.contents.find(c => c.id === id);

    if (!existing) return res.status(404).json({ error: "Conteúdo não encontrado." });

    const updated = await dataStore.mutateData(async (current) => {
        current.contents = current.contents.filter(c => c.id !== id);
        return current;
    });

    await cmsService.safeDeleteUpload(existing.image);
    res.json({ items: cmsService.getAllContents(updated.contents) });
};

exports.submitContact = async (req, res) => {
    const { name, email, subject, message, website } = req.body;
    if (website) return res.status(202).json({ ok: true }); // Honeypot

    const v = validator(req.body)
        .required("name", "O nome é obrigatório.")
        .required("email", "O e-mail é obrigatório.")
        .email("email", "E-mail inválido.")
        .required("message", "A mensagem não pode estar vazia.");

    if (!v.isValid()) {
        return res.status(400).json({ error: v.getErrorMessage() });
    }

    await dataStore.mutateData((current) => {
        current.messages.push({
            id: `msg-${Date.now()}`,
            name, email, subject, message,
            createdAt: dataStore.nowIso()
        });
        return current;
    });

    res.status(201).json({ ok: true });
};

exports.setup = async (req, res) => {
    const data = await dataStore.readData();
    if (data.users && data.users.length > 0) {
        return res.status(400).json({ error: "O acesso administrativo já foi configurado." });
    }

    const { username, password, confirmPassword, setupToken } = req.body;
    
    const v = validator(req.body)
        .required("username", "Usuário é obrigatório.")
        .minLength("username", 3, "O usuário precisa ter ao menos 3 caracteres.")
        .required("password", "Senha é obrigatória.")
        .minLength("password", 8, "A senha precisa ter ao menos 8 caracteres.")
        .required("confirmPassword", "Confirme a senha.");

    if (!v.isValid()) {
        return res.status(400).json({ error: v.getErrorMessage() });
    }

    if (password !== confirmPassword) return res.status(400).json({ error: "A confirmação de senha não confere." });
    
    if (authService.isSetupTokenRequired(data) && setupToken !== authService.ADMIN_SETUP_TOKEN) {
        return res.status(400).json({ error: "Chave de configuração inicial inválida." });
    }

    const { passwordHash, passwordSalt } = authService.hashPassword(password);
    const ownerUser = dataStore.normalizeStoredUser({
        username,
        passwordHash,
        passwordSalt,
        role: "owner",
        createdAt: dataStore.nowIso(),
        updatedAt: dataStore.nowIso(),
        lastLoginAt: dataStore.nowIso()
    });

    await dataStore.mutateData((current) => {
        current.users = [ownerUser];
        return current;
    });

    const nextSession = authService.createSession(ownerUser);
    res.cookie(authService.SESSION_COOKIE, nextSession.token, {
        httpOnly: true,
        maxAge: authService.SESSION_TTL_MS,
        path: "/",
        sameSite: "Lax",
        secure: req.secure || process.env.NODE_ENV === "production"
    });

    res.status(201).json({
        ok: true,
        csrfToken: nextSession.csrfToken,
        user: { id: ownerUser.id, username: ownerUser.username, role: ownerUser.role }
    });
};
