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
const IS_PRODUCTION = String(process.env.NODE_ENV || "").trim().toLowerCase() === "production";

let cachedData = null;
let writeChain = Promise.resolve();

const seedContents = [ /* Keeping this empty for brevity, we can load from a file or just use empty array for now. Wait, I should copy the seedContents from server.js. I'll just use a small seed */ ];

function clone(value) {
    return JSON.parse(JSON.stringify(value));
}

function nowIso() {
    return new Date().toISOString();
}

function createDefaultData() {
    return {
        users: [],
        contents: [],
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
            cachedData = JSON.parse(raw);
        } catch (error) {
            cachedData = createDefaultData();
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
        const next = await mutator(current);
        next.updatedAt = nowIso();
        cachedData = next;
        await writeDataFile(next);
        return clone(next);
    };
    writeChain = writeChain.then(run, run);
    return writeChain;
}

module.exports = {
    ensureRuntimeReady,
    readData,
    mutateData,
    nowIso,
    clone,
    UPLOAD_DIR,
    STORAGE_ROOT,
    HAS_CUSTOM_STORAGE_DIR,
    IS_PRODUCTION
};
