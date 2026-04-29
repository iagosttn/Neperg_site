const crypto = require("node:crypto");
const fs = require("node:fs/promises");
const path = require("node:path");

const ROOT_DIR = path.join(__dirname, '..', '..');
const CMS_STORAGE_DIR = String(process.env.CMS_STORAGE_DIR || "").trim();
const STORAGE_ROOT = path.resolve(CMS_STORAGE_DIR || ROOT_DIR);
const HAS_CUSTOM_STORAGE_DIR = Boolean(CMS_STORAGE_DIR);
const RUNTIME_DIR = path.join(STORAGE_ROOT, "data", "runtime");
const DATA_FILE = path.join(RUNTIME_DIR, "cms.json");
const UPLOAD_DIR = path.join(STORAGE_ROOT, "uploads");
const DATA_DIR = path.join(ROOT_DIR, "data");
const IS_PRODUCTION = String(process.env.NODE_ENV || "").trim().toLowerCase() === "production";

let cachedData = null;
let writeChain = Promise.resolve();

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

function clone(value) {
    return JSON.parse(JSON.stringify(value));
}

function nowIso() {
    return new Date().toISOString();
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

function normalizeData(data) {
    const getLegacyUsers = (data) => {
        if (!data?.profile || !data.profile.username || !data.profile.passwordHash || !data.profile.passwordSalt) {
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
    };

    const getNormalizedUsers = (data) => {
        const sourceUsers = Array.isArray(data?.users) ? data.users : getLegacyUsers(data);
        return sourceUsers
            .map((item, index) => normalizeStoredUser(item, index === 0 ? "owner" : "editor"))
            .filter((item) => item.username && item.passwordHash && item.passwordSalt);
    };

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

function createDefaultData() {
    return {
        users: [],
        contents: clone(seedContents),
        messages: [],
        createdAt: nowIso(),
        updatedAt: nowIso()
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
            throw error;
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

module.exports = {
    ensureRuntimeReady,
    readData,
    mutateData,
    normalizeText,
    normalizeTags,
    normalizeStoredUser,
    normalizeStoredContent,
    clone,
    nowIso,
    seedContents,
    UPLOAD_DIR,
    STORAGE_ROOT,
    DATA_DIR,
    ROOT_DIR,
    IS_PRODUCTION
};
