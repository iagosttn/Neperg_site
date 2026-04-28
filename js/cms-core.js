(function () {
    const PLACEHOLDER_IMAGE = "img/placeholder-publication.jpg";
    const API_STATUS_URL = "/api/status";
    const API_CONTENTS_URL = "/api/contents";
    const API_MESSAGES_URL = "/api/messages";
    const API_CONTACT_URL = "/api/contact";
    const API_USERS_URL = "/api/users";

    const fallbackContents = [
        {
            id: "announcement-lab-2026",
            type: "announcement",
            status: "published",
            featured: true,
            title: "Agenda do laboratório atualizada",
            summary:
                "O laboratório passa a concentrar as informações de uso, horários de atendimento e encaminhamento de solicitações em um único fluxo institucional.",
            body:
                "Os avisos podem ser publicados rapidamente pela área administrativa, facilitando a comunicação com estudantes, pesquisadores e parceiros externos.",
            category: "Institucional",
            tags: ["laboratório", "agenda"],
            date: "2026-04-18",
            location: "Presidente Prudente",
            image: "",
            ctaLabel: "Falar com o núcleo",
            ctaUrl: "contato.html"
        },
        {
            id: "announcement-editais-2026",
            type: "announcement",
            status: "published",
            featured: true,
            title: "Chamadas e avisos internos ficam centralizados no site",
            summary:
                "A homepage agora pode destacar avisos prioritários, novas chamadas e orientações de forma visível para toda a comunidade.",
            body:
                "Os comunicados reforçam rotinas, editais e orientações em uma área fácil de localizar para quem acompanha o site.",
            category: "Avisos",
            tags: ["editais", "comunicação"],
            date: "2026-04-15",
            location: "",
            image: "",
            ctaLabel: "Ver notícias",
            ctaUrl: "noticias.html"
        },
        {
            id: "news-seminario-2026",
            type: "news",
            status: "published",
            featured: true,
            title: "Seminários e notícias passam a ter atualização dinâmica",
            summary:
                "O site institucional foi preparado para receber novos destaques sem depender de edição manual em HTML, com cards criados a partir do painel.",
            body:
                "Notícias podem ser cadastradas com título, resumo, categoria, imagem, data e link complementar, mantendo o acervo escalável ao longo do tempo.",
            category: "Transformação digital",
            tags: ["site", "cms", "notícias"],
            date: "2026-04-20",
            location: "NEPERG",
            image: "img/noticias/seminario_internacional.avif",
            ctaLabel: "Ver notícias",
            ctaUrl: "noticias.html"
        },
        {
            id: "news-acervo-2026",
            type: "news",
            status: "published",
            featured: false,
            title: "Acervo institucional pode crescer por categorias e tópicos",
            summary:
                "Cada novo item pode ser classificado por categoria e encontrado por busca, deixando a organização do conteúdo mais simples para a equipe.",
            body:
                "A administração do conteúdo agora permite organizar notícias, eventos e avisos de forma padronizada, com filtros automáticos no site.",
            category: "Conteúdo",
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
            title: "Calendário de eventos pode ser ampliado em poucos cliques",
            summary:
                "O módulo de eventos foi convertido para uma agenda dinâmica, pronta para receber novos encontros, seminários, oficinas e atividades acadêmicas.",
            body:
                "Administradores conseguem informar data, local, categoria, descrição e link de inscrição para manter a agenda atualizada continuamente.",
            category: "Agenda",
            tags: ["eventos", "seminários"],
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
            title: "Atividades futuras podem ser divulgadas com antecedência",
            summary:
                "Novos eventos entram automaticamente na página pública e podem ser encontrados por categoria ou pela pesquisa integrada.",
            body:
                "Esse fluxo ajuda a divulgar encontros e fortalecer a comunicação institucional sem depender do time técnico.",
            category: "Extensão",
            tags: ["oficinas", "divulgação"],
            date: "2026-06-02",
            location: "Presidente Prudente",
            image: "img/noticias/2_predio_novo unesp.avif",
            ctaLabel: "Falar com o núcleo",
            ctaUrl: "contato.html"
        }
    ];

    const state = {
        mode: "fallback",
        serverAvailable: false,
        hasUsers: false,
        authenticated: false,
        currentUser: "",
        currentRole: "",
        csrfToken: "",
        contactEnabled: false,
        requiresSetupToken: false,
        setupLocked: false,
        canManageUsers: false,
        userCount: 0,
        contents: cloneContents(fallbackContents),
        messages: [],
        users: []
    };

    let readyPromise = null;

    function cloneContents(contents) {
        return contents.map((item) => ({
            ...item,
            tags: Array.isArray(item.tags) ? [...item.tags] : []
        }));
    }

    function normalizeText(value) {
        return String(value || "").trim();
    }

    function cloneMessages(messages) {
        return messages.map((item) => ({ ...item }));
    }

    function isHttpEnvironment() {
        return /^https?:$/i.test(window.location.protocol);
    }

    function getAssetRoot() {
        const script = Array.from(document.scripts).find((item) =>
            item.src.includes("/js/cms-core.js")
        );

        return script
            ? script.src.replace(/\/js\/cms-core\.js(?:\?.*)?$/, "/")
            : window.location.href;
    }

    function isLoopbackHost(hostname) {
        return ["localhost", "127.0.0.1", "[::1]", "::1"].includes(hostname);
    }

    function normalizeUrlValue(value) {
        return String(value || "").trim();
    }

    function isRelativeSitePath(value) {
        return Boolean(value) && !/^[a-z][a-z0-9+.-]*:/i.test(value) && !value.startsWith("//");
    }

    function resolveAgainstAssetRoot(value) {
        const normalized = value.startsWith("/") ? value.slice(1) : value;
        return new URL(normalized, getAssetRoot());
    }

    function isAllowedNetworkUrl(url) {
        return url.protocol === "https:" || (url.protocol === "http:" && isLoopbackHost(url.hostname));
    }

    function sanitizeLinkUrl(value) {
        const rawValue = normalizeUrlValue(value);

        if (!rawValue || rawValue.startsWith("//")) {
            return "";
        }

        if (rawValue.startsWith("#")) {
            return rawValue;
        }

        if (/^(mailto:|tel:)/i.test(rawValue)) {
            return rawValue;
        }

        if (/^(javascript:|data:|vbscript:)/i.test(rawValue)) {
            return "";
        }

        try {
            const resolved = resolveAgainstAssetRoot(rawValue);

            if (isRelativeSitePath(rawValue)) {
                return resolved.href;
            }

            return isAllowedNetworkUrl(resolved) ? resolved.href : "";
        } catch (error) {
            return "";
        }
    }

    function sanitizeImageUrl(value) {
        const rawValue = normalizeUrlValue(value);

        if (!rawValue || rawValue.startsWith("//")) {
            return "";
        }

        if (/^data:/i.test(rawValue)) {
            return /^data:image\/(?:avif|gif|jpeg|jpg|png|webp);base64,[a-z0-9+/=]+$/i.test(
                rawValue
            )
                ? rawValue
                : "";
        }

        if (/^(javascript:|vbscript:)/i.test(rawValue)) {
            return "";
        }

        try {
            const resolved = resolveAgainstAssetRoot(rawValue);

            if (isRelativeSitePath(rawValue)) {
                return resolved.href;
            }

            return isAllowedNetworkUrl(resolved) ? resolved.href : "";
        } catch (error) {
            return "";
        }
    }

    function isAllowedLinkValue(value) {
        return !normalizeUrlValue(value) || Boolean(sanitizeLinkUrl(value));
    }

    function isAllowedImageValue(value) {
        return !normalizeUrlValue(value) || Boolean(sanitizeImageUrl(value));
    }

    function formatDate(value) {
        if (!value) {
            return "";
        }

        const date = new Date(`${value}T00:00:00`);

        if (Number.isNaN(date.getTime())) {
            return value;
        }

        return new Intl.DateTimeFormat("pt-BR", {
            day: "2-digit",
            month: "long",
            year: "numeric"
        }).format(date);
    }

    function getTypeMeta(type) {
        const map = {
            news: {
                label: "Notícia",
                plural: "Notícias",
                icon: "fa-newspaper"
            },
            event: {
                label: "Evento",
                plural: "Eventos",
                icon: "fa-calendar-days"
            },
            announcement: {
                label: "Aviso",
                plural: "Avisos",
                icon: "fa-bullhorn"
            }
        };

        return map[type] || map.news;
    }

    function sortContents(contents) {
        return cloneContents(contents).sort((left, right) => {
            const leftTime = new Date(left.date || 0).getTime();
            const rightTime = new Date(right.date || 0).getTime();
            return rightTime - leftTime;
        });
    }

    function normalizeContentArray(items) {
        if (!Array.isArray(items)) {
            return [];
        }

        return sortContents(
            items.map((item) => ({
                id: normalizeText(item.id),
                type: normalizeText(item.type) || "news",
                status: normalizeText(item.status) || "published",
                featured: Boolean(item.featured),
                title: normalizeText(item.title),
                summary: normalizeText(item.summary),
                body: normalizeText(item.body),
                category: normalizeText(item.category) || "Geral",
                tags: Array.isArray(item.tags)
                    ? item.tags.map((tag) => normalizeText(tag)).filter(Boolean)
                    : [],
                date: normalizeText(item.date),
                location: normalizeText(item.location),
                image: normalizeText(item.image),
                ctaLabel: normalizeText(item.ctaLabel),
                ctaUrl: normalizeText(item.ctaUrl),
                createdAt: normalizeText(item.createdAt),
                updatedAt: normalizeText(item.updatedAt),
                createdBy: normalizeText(item.createdBy),
                updatedBy: normalizeText(item.updatedBy)
            }))
        );
    }

    function normalizeUserArray(items) {
        if (!Array.isArray(items)) {
            return [];
        }

        return items
            .map((item) => ({
                id: normalizeText(item.id),
                username: normalizeText(item.username),
                role: normalizeText(item.role) || "editor",
                createdAt: normalizeText(item.createdAt),
                updatedAt: normalizeText(item.updatedAt),
                lastLoginAt: normalizeText(item.lastLoginAt)
            }))
            .sort((left, right) => left.username.localeCompare(right.username, "pt-BR"));
    }

    function applyStatus(payload) {
        state.mode = "server";
        state.serverAvailable = Boolean(payload?.serverAvailable);
        state.hasUsers = Boolean(payload?.hasUsers);
        state.authenticated = Boolean(payload?.authenticated);
        state.currentUser = normalizeText(payload?.sessionUser);
        state.currentRole = normalizeText(payload?.sessionRole);
        state.csrfToken = normalizeText(payload?.csrfToken);
        state.contactEnabled = payload?.contactEnabled !== false;
        state.requiresSetupToken = Boolean(payload?.requiresSetupToken);
        state.setupLocked = Boolean(payload?.setupLocked);
        state.canManageUsers = Boolean(payload?.canManageUsers);
        state.userCount = Number(payload?.userCount || 0);
    }

    async function apiRequest(url, options = {}) {
        const headers = {
            Accept: "application/json",
            ...(options.headers || {})
        };

        if (state.csrfToken && !headers["X-CSRF-Token"]) {
            headers["X-CSRF-Token"] = state.csrfToken;
        }

        let body = options.body;
        if (body !== undefined && body !== null && typeof body !== "string") {
            headers["Content-Type"] = "application/json";
            body = JSON.stringify(body);
        }

        const response = await window.fetch(url, {
            method: options.method || "GET",
            headers,
            body,
            credentials: "same-origin"
        });

        const text = await response.text();
        let payload = {};

        if (text) {
            try {
                payload = JSON.parse(text);
            } catch (error) {
                throw new Error("Resposta inválida do servidor.");
            }
        }

        if (!response.ok) {
            throw new Error(payload?.error || "Falha ao comunicar com o servidor.");
        }

        return payload;
    }

    async function refreshStatus() {
        const status = await apiRequest(`${API_STATUS_URL}?t=${Date.now()}`);
        applyStatus(status);
        return status;
    }

    async function refreshContents(options = {}) {
        if (!isHttpEnvironment()) {
            return getContents(options.type, options.includeDrafts);
        }

        const query = [`t=${Date.now()}`];
        if (options.includeDrafts && state.authenticated) {
            query.push("scope=all");
        }

        const payload = await apiRequest(
            `${API_CONTENTS_URL}?${query.join("&")}`
        );

        state.contents = normalizeContentArray(payload.items);
        return getContents(options.type, options.includeDrafts);
    }

    async function refreshMessages() {
        if (!isHttpEnvironment() || !state.authenticated) {
            state.messages = [];
            return [];
        }

        const payload = await apiRequest(API_MESSAGES_URL);
        state.messages = cloneMessages(payload.items || []);
        return getMessages();
    }

    async function refreshUsers() {
        if (!isHttpEnvironment() || !state.authenticated || !state.canManageUsers) {
            state.users = [];
            return [];
        }

        const payload = await apiRequest(API_USERS_URL);
        state.users = normalizeUserArray(payload.items || []);
        return getUsers();
    }

    async function boot() {
        if (!isHttpEnvironment() || !window.fetch) {
            state.mode = "fallback";
            state.serverAvailable = false;
            state.contactEnabled = false;
            state.requiresSetupToken = false;
            state.setupLocked = false;
            state.hasUsers = false;
            state.authenticated = false;
            state.currentUser = "";
            state.currentRole = "";
            state.csrfToken = "";
            state.canManageUsers = false;
            state.userCount = 0;
            state.messages = [];
            state.users = [];
            state.contents = cloneContents(fallbackContents);
            return state;
        }

        try {
            await refreshStatus();
            await refreshContents({ includeDrafts: state.authenticated });

            if (state.authenticated) {
                await refreshMessages();
                await refreshUsers();
            } else {
                state.messages = [];
                state.users = [];
            }
        } catch (error) {
            state.mode = "fallback";
            state.serverAvailable = false;
            state.hasUsers = false;
            state.authenticated = false;
            state.currentUser = "";
            state.currentRole = "";
            state.csrfToken = "";
            state.contactEnabled = false;
            state.requiresSetupToken = false;
            state.setupLocked = false;
            state.canManageUsers = false;
            state.userCount = 0;
            state.contents = cloneContents(fallbackContents);
            state.messages = [];
            state.users = [];
        }

        return state;
    }

    function ready(options = {}) {
        if (!readyPromise || options.force) {
            readyPromise = boot();
        }

        return readyPromise;
    }

    function getContents(type, includeDrafts = false) {
        const types = type ? type.split(",") : [];
        return state.contents.filter((item) => {
            if (!includeDrafts && item.status !== "published") {
                return false;
            }

            return types.length === 0 || types.includes(item.type);
        });
    }

    function getPublishedContents(type) {
        return getContents(type, false);
    }

    function getContentById(id) {
        return state.contents.find((item) => item.id === id) || null;
    }

    function getCategories(type) {
        const types = type ? type.split(",") : [];
        const values = state.contents
            .filter((item) => types.length === 0 || types.includes(item.type))
            .map((item) => item.category)
            .filter(Boolean);

        return [...new Set(values)].sort((left, right) => left.localeCompare(right, "pt-BR"));
    }

    function getImageUrl(value) {
        return sanitizeImageUrl(value) || sanitizeImageUrl(PLACEHOLDER_IMAGE) || "";
    }

    function resolveUrl(value) {
        return sanitizeLinkUrl(value);
    }

    async function setupProfile(payload) {
        const response = await apiRequest("/api/setup", {
            method: "POST",
            body: payload
        });

        applyStatus(response);
        await refreshContents({ includeDrafts: true });
        await refreshUsers();
        return response.user || null;
    }

    async function login(username, password) {
        const response = await apiRequest("/api/login", {
            method: "POST",
            body: { username, password }
        });

        applyStatus(response);
        await refreshContents({ includeDrafts: true });
        await refreshMessages();
        await refreshUsers();
        return true;
    }

    async function logout() {
        if (isHttpEnvironment() && state.mode === "server") {
            try {
                await apiRequest("/api/logout", { method: "POST" });
            } catch (error) {
                // Ignore logout response errors and clear local state anyway.
            }
        }

        state.authenticated = false;
        state.currentUser = "";
        state.currentRole = "";
        state.csrfToken = "";
        state.messages = [];
        state.users = [];

        if (isHttpEnvironment() && state.mode === "server") {
            await refreshContents();
        }
    }

    async function saveProfile(payload) {
        const response = await apiRequest("/api/profile", {
            method: "POST",
            body: payload
        });

        applyStatus(response);
        return response.user || null;
    }

    async function createUser(payload) {
        const response = await apiRequest(API_USERS_URL, {
            method: "POST",
            body: payload
        });

        state.users = normalizeUserArray(response.items);
        return getUsers();
    }

    async function deleteUser(id) {
        const response = await apiRequest(`${API_USERS_URL}/${encodeURIComponent(id)}`, {
            method: "DELETE"
        });

        state.users = normalizeUserArray(response.items);
        return getUsers();
    }

    async function upsertContent(payload) {
        const response = await apiRequest(API_CONTENTS_URL, {
            method: "POST",
            body: payload
        });

        state.contents = normalizeContentArray(response.items);
        return getContents("", true);
    }

    async function deleteContent(id) {
        const response = await apiRequest(`${API_CONTENTS_URL}/${encodeURIComponent(id)}`, {
            method: "DELETE"
        });

        state.contents = normalizeContentArray(response.items);
        return getContents("", true);
    }

    async function resetToSeed() {
        const response = await apiRequest("/api/reset", { method: "POST" });
        state.contents = normalizeContentArray(response.items);
        await refreshMessages();
        return getContents("", true);
    }

    function getMessages() {
        return cloneMessages(state.messages);
    }

    async function submitContactMessage(payload) {
        const response = await apiRequest(API_CONTACT_URL, {
            method: "POST",
            body: payload
        });

        return response;
    }

    function getProfile() {
        return state.currentUser
            ? {
                  username: state.currentUser,
                  role: state.currentRole
              }
            : null;
    }

    function getUsers() {
        return normalizeUserArray(state.users);
    }

    window.NepergCMS = {
        ready,
        refreshStatus,
        refreshContents,
        refreshMessages,
        refreshUsers,
        getContents,
        getPublishedContents,
        upsertContent,
        deleteContent,
        getContentById,
        getProfile,
        getUsers,
        createUser,
        deleteUser,
        saveProfile,
        setupProfile,
        login,
        logout,
        requiresSetupToken() {
            return state.requiresSetupToken;
        },
        isSetupLocked() {
            return state.setupLocked;
        },
        hasProfile() {
            return state.hasUsers;
        },
        isAuthenticated() {
            return state.authenticated;
        },
        getSessionUser() {
            return state.currentUser;
        },
        getSessionRole() {
            return state.currentRole;
        },
        canManageUsers() {
            return state.canManageUsers;
        },
        getUserCount() {
            return state.userCount;
        },
        isServerMode() {
            return state.mode === "server";
        },
        isAdminAvailable() {
            return state.mode === "server";
        },
        isContactEnabled() {
            return state.contactEnabled;
        },
        resetToSeed,
        getCategories,
        getTypeMeta,
        formatDate,
        resolveUrl,
        getImageUrl,
        isAllowedLinkValue,
        isAllowedImageValue,
        getMessages,
        submitContactMessage
    };
})();
