document.addEventListener("DOMContentLoaded", async () => {
    if (window.NepergCMS?.ready) {
        await window.NepergCMS.ready();
    }

    applyBrandLogo();
    initCMSPublicViews();
    normalizeLocalizedText();
    setupNavigation();
    setupBackToTop();
    setupCurrentYear();
    setupFilterBars();
    setupPublicationSearch();
    setupFaq();
    setupForms();
});

function applyBrandLogo() {
    const logoContainers = document.querySelectorAll(".brand-mark");
    if (!logoContainers.length) {
        return;
    }

    const mainScript = Array.from(document.scripts).find((script) =>
        script.src.includes("/js/main.js")
    );
    const logoSrc = mainScript
        ? mainScript.src.replace(/\/js\/main\.js(?:\?.*)?$/, "/img/logo/logo.png")
        : "img/logo/logo.png";

    logoContainers.forEach((container) => {
        if (container.querySelector("img")) {
            return;
        }

        const logo = document.createElement("img");
        logo.src = logoSrc;
        logo.alt = "Logo do NEPERG";
        container.replaceChildren(logo);
    });
}

function normalizeLocalizedText() {
    const replacements = [
        ["Nucleo", "N\u00facleo"],
        ["nucleo", "n\u00facleo"],
        ["Extensao", "Extens\u00e3o"],
        ["extensao", "extens\u00e3o"],
        ["Inicio", "In\u00edcio"],
        ["inicio", "in\u00edcio"],
        ["Publicacoes", "Publica\u00e7\u00f5es"],
        ["publicacoes", "publica\u00e7\u00f5es"],
        ["Noticias", "Not\u00edcias"],
        ["noticias", "not\u00edcias"],
        ["Tematica", "Tem\u00e1tica"],
        ["tematica", "tem\u00e1tica"],
        ["cientifico", "cient\u00edfico"],
        ["cientifica", "cient\u00edfica"],
        ["rapida", "r\u00e1pida"],
        ["rapido", "r\u00e1pido"],
        ["pagina", "p\u00e1gina"],
        ["paginas", "p\u00e1ginas"],
        ["producao", "produ\u00e7\u00e3o"],
        ["protecao", "prote\u00e7\u00e3o"],
        ["simulacao", "simula\u00e7\u00e3o"],
        ["laboratorio", "laborat\u00f3rio"],
        ["laboratrio", "laborat\u00f3rio"],
        ["lesoes", "les\u00f5es"],
        ["acucar", "a\u00e7\u00facar"],
        ["rodizios", "rod\u00edzios"],
        ["rodizio", "rod\u00edzio"],
        ["alem", "al\u00e9m"],
        ["dimensoes", "dimens\u00f5es"],
        ["pedagogicas", "pedag\u00f3gicas"],
        ["frigorifico", "frigor\u00edfico"],
        ["regiao", "regi\u00e3o"],
        ["doencas", "doen\u00e7as"],
        ["comunicacao", "comunica\u00e7\u00e3o"],
        ["gestao", "gest\u00e3o"],
        ["prevencao", "preven\u00e7\u00e3o"],
        ["preveno", "preven\u00e7\u00e3o"],
        ["reciclavel", "recicl\u00e1vel"],
        ["iniciacao", "inicia\u00e7\u00e3o"],
        ["academicos", "acad\u00eamicos"],
        ["academico", "acad\u00eamico"],
        ["academica", "acad\u00eamica"],
        ["historico", "hist\u00f3rico"],
        ["historica", "hist\u00f3rica"],
        ["histrica", "hist\u00f3rica"],
        ["referencia", "refer\u00eancia"],
        ["referencias", "refer\u00eancias"],
        ["dimensao", "dimens\u00e3o"],
        ["tecnica", "t\u00e9cnica"],
        ["tecnico", "t\u00e9cnico"],
        ["termico", "t\u00e9rmico"],
        ["termicas", "t\u00e9rmicas"],
        ["acustico", "ac\u00fastico"],
        ["acstica", "ac\u00fastica"],
        ["acusticas", "ac\u00fasticas"],
        ["luminico", "lum\u00ednico"],
        ["instituicoes", "institui\u00e7\u00f5es"],
        ["computacao", "computa\u00e7\u00e3o"],
        ["edicoes", "edi\u00e7\u00f5es"],
        ["reune", "re\u00fane"],
        ["Rene", "Re\u00fane"],
        ["resiliencia", "resili\u00eancia"],
        ["reabilitacao", "reabilita\u00e7\u00e3o"],
        ["missao", "miss\u00e3o"],
        ["Missao", "Miss\u00e3o"],
        ["visao", "vis\u00e3o"],
        ["Visao", "Vis\u00e3o"],
        ["condicoes", "condi\u00e7\u00f5es"],
        ["Condies", "Condi\u00e7\u00f5es"],
        ["solicitacoes", "solicita\u00e7\u00f5es"],
        ["avaliacao", "avalia\u00e7\u00e3o"],
        ["situacoes", "situa\u00e7\u00f5es"],
        ["ciencia", "ci\u00eancia"],
        ["Fisica", "F\u00edsica"],
        ["fisica", "f\u00edsica"],
        ["Antonio", "Ant\u00f4nio"],
        ["Luis", "Lu\u00eds"],
        ["Liria", "L\u00edria"],
        ["Nobrega", "N\u00f3brega"],
        ["varias", "v\u00e1rias"],
        ["etica", "\u00e9tica"],
        ["areas", "\u00e1reas"],
        ["uteis", "\u00fateis"],
        ["trajetoria", "trajet\u00f3ria"],
        ["dialogo", "di\u00e1logo"],
        ["intervencao", "interven\u00e7\u00e3o"],
        ["acoes", "a\u00e7\u00f5es"],
        ["articulacao", "articula\u00e7\u00e3o"],
        ["acessivel", "acess\u00edvel"],
        ["legivel", "leg\u00edvel"],
        ["horarios", "hor\u00e1rios"],
        ["disponiveis", "dispon\u00edveis"],
        ["Ministerio", "Minist\u00e9rio"],
        ["equilibrio", "equil\u00edbrio"],
        ["funcao", "fun\u00e7\u00e3o"],
        ["organizacao", "organiza\u00e7\u00e3o"],
        ["apresentacoes", "apresenta\u00e7\u00f5es"],
        ["apresentacao", "apresenta\u00e7\u00e3o"],
        ["localizacao", "localiza\u00e7\u00e3o"],
        ["implantacao", "implanta\u00e7\u00e3o"],
        ["Implantao", "Implanta\u00e7\u00e3o"],
        ["Endereco", "Endere\u00e7o"],
        ["conteudo", "conte\u00fado"],
        ["Conteudo", "Conte\u00fado"],
        ["faceis", "f\u00e1ceis"],
        ["Nao", "N\u00e3o"],
        ["nao", "n\u00e3o"],
        ["graduacao", "gradua\u00e7\u00e3o"],
        ["exposicoes", "exposi\u00e7\u00f5es"],
        ["distribuicao", "distribui\u00e7\u00e3o"],
        ["comite", "comit\u00ea"],
        ["saude", "sa\u00fade"],
        ["Saude", "Sa\u00fade"],
        ["formacao", "forma\u00e7\u00e3o"],
        ["Formacao", "Forma\u00e7\u00e3o"],
        ["criterios", "crit\u00e9rios"],
        ["multiusuario", "multiusu\u00e1rio"],
        ["multiusuaria", "multiusu\u00e1ria"],
        ["multiusuria", "multiusu\u00e1ria"],
        ["vinculo", "v\u00ednculo"],
        ["sintese", "s\u00edntese"],
        ["Sntese", "S\u00edntese"],
        ["critica", "cr\u00edtica"],
        ["cretica", "cr\u00edtica"],
        ["generico", "gen\u00e9rico"],
        ["genrico", "gen\u00e9rico"],
        ["consistencia", "consist\u00eancia"],
        ["Navegao", "Navega\u00e7\u00e3o"],
        ["navegacao", "navega\u00e7\u00e3o"],
        ["Atuao", "Atua\u00e7\u00e3o"],
        ["atuao", "atua\u00e7\u00e3o"],
        ["Frentes prioritrias", "Frentes priorit\u00e1rias"],
        ["adequao", "adequa\u00e7\u00e3o"],
        ["Seminrio", "Semin\u00e1rio"],
        ["mantm", "mant\u00e9m"],
        ["verso", "vers\u00e3o"],
        ["rudo", "ru\u00eddo"],
        ["temtico", "tem\u00e1tico"],
        ["temtica", "tem\u00e1tica"],
        ["biomecnica", "biomec\u00e2nica"],
        ["analise", "an\u00e1lise"],
        ["Analise", "An\u00e1lise"],
        ["Nunez", "N\u00fa\u00f1ez"],
        ["Ue", "U\u00ea"],
        ["Coordenao", "Coordena\u00e7\u00e3o"],
        ["coordenao", "coordena\u00e7\u00e3o"],
        ["Educao", "Educa\u00e7\u00e3o"],
        ["educao", "educa\u00e7\u00e3o"],
        ["iluminao", "ilumina\u00e7\u00e3o"],
        ["estatstica", "estat\u00edstica"],
        ["cartogrfica", "cartogr\u00e1fica"],
        ["filtrvel", "filtr\u00e1vel"],
        ["Acesso rapido", "Acesso r\u00e1pido"],
        ["Pessoas do nucleo", "Pessoas do n\u00facleo"],
        ["Navegao rapida", "Navega\u00e7\u00e3o r\u00e1pida"]
    ];

    const replaceText = (text) => {
        let normalized = text;

        replacements.forEach(([from, to]) => {
            normalized = normalized.replace(new RegExp(`\\b${escapeRegExp(from)}\\b`, "g"), to);
        });

        normalized = normalized
            .replace(/FCT\/UNESP  Presidente Prudente/g, "FCT/UNESP \u2022 Presidente Prudente")
            .replace(/8h-17h/g, "8h\u201317h");

        return normalized;
    };

    document.title = replaceText(document.title);

    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription?.content) {
        metaDescription.content = replaceText(metaDescription.content);
    }

    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
        acceptNode(node) {
            if (!node.nodeValue.trim()) {
                return NodeFilter.FILTER_REJECT;
            }

            const parent = node.parentElement;
            if (!parent || ["SCRIPT", "STYLE", "NOSCRIPT"].includes(parent.tagName)) {
                return NodeFilter.FILTER_REJECT;
            }

            return NodeFilter.FILTER_ACCEPT;
        }
    });

    const textNodes = [];
    while (walker.nextNode()) {
        textNodes.push(walker.currentNode);
    }

    textNodes.forEach((node) => {
        node.nodeValue = replaceText(node.nodeValue);
    });

    document.querySelectorAll("[placeholder], [aria-label]").forEach((element) => {
        if (element.hasAttribute("placeholder")) {
            element.setAttribute("placeholder", replaceText(element.getAttribute("placeholder")));
        }

        if (element.hasAttribute("aria-label")) {
            element.setAttribute("aria-label", replaceText(element.getAttribute("aria-label")));
        }
    });
}

function escapeRegExp(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function setupNavigation() {
    const toggle = document.querySelector("[data-menu-toggle]");
    const menu = document.querySelector("[data-menu]");

    if (!toggle || !menu) {
        return;
    }

    const setMenuState = (open) => {
        toggle.setAttribute("aria-expanded", String(open));
        menu.classList.toggle("is-open", open);
        document.body.classList.toggle("menu-open", open);
    };

    toggle.addEventListener("click", () => {
        const open = toggle.getAttribute("aria-expanded") !== "true";
        setMenuState(open);
    });

    menu.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => setMenuState(false));
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            setMenuState(false);
        }
    });

    document.addEventListener("click", (event) => {
        if (!menu.contains(event.target) && !toggle.contains(event.target)) {
            setMenuState(false);
        }
    });
}

function setupBackToTop() {
    const button = document.querySelector("[data-back-to-top]");

    if (!button) {
        return;
    }

    const updateVisibility = () => {
        button.classList.toggle("visible", window.scrollY > 420);
    };

    updateVisibility();
    window.addEventListener("scroll", updateVisibility);
    button.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });
}

function setupCurrentYear() {
    document.querySelectorAll("[data-current-year]").forEach((node) => {
        node.textContent = new Date().getFullYear();
    });
}

function setupFilterBars() {
    document.querySelectorAll("[data-filter-scope]").forEach((scope) => {
        const filterButtons = scope.querySelectorAll("[data-filter]");
        const cards = scope.querySelectorAll("[data-filter-item]");

        if (!filterButtons.length || !cards.length) {
            return;
        }

        filterButtons.forEach((button) => {
            button.addEventListener("click", () => {
                const selected = button.dataset.filter;

                filterButtons.forEach((item) => item.classList.remove("active"));
                button.classList.add("active");

                cards.forEach((card) => {
                    const categories = (card.dataset.category || "")
                        .split(" ")
                        .filter(Boolean);
                    const shouldShow = selected === "all" || categories.includes(selected);
                    card.classList.toggle("hidden", !shouldShow);
                });
            });
        });
    });
}

function setupPublicationSearch() {
    document.querySelectorAll("[data-publication-search]").forEach((input) => {
        const scopeSelector = input.dataset.publicationSearch;
        const scope = document.querySelector(scopeSelector);

        if (!scope) {
            return;
        }

        const cards = scope.querySelectorAll("[data-publication-item]");
        const emptyState = scope.querySelector("[data-empty-state]");
        const categoryButtons = document.querySelectorAll(
            `${scopeSelector} [data-filter], [data-publication-filters] [data-filter]`
        );

        const runFilter = () => {
            const term = input.value.trim().toLowerCase();
            const activeButton = Array.from(categoryButtons).find((button) =>
                button.classList.contains("active")
            );
            const activeCategory = activeButton ? activeButton.dataset.filter : "all";

            let visibleCount = 0;

            cards.forEach((card) => {
                const text = card.textContent.toLowerCase();
                const categories = (card.dataset.category || "").split(" ").filter(Boolean);
                const matchesTerm = !term || text.includes(term);
                const matchesCategory =
                    activeCategory === "all" || categories.includes(activeCategory);
                const visible = matchesTerm && matchesCategory;

                card.classList.toggle("hidden", !visible);

                if (visible) {
                    visibleCount += 1;
                }
            });

            if (emptyState) {
                emptyState.classList.toggle("hidden", visibleCount !== 0);
            }
        };

        input.addEventListener("input", runFilter);
        categoryButtons.forEach((button) => {
            button.addEventListener("click", () => {
                requestAnimationFrame(runFilter);
            });
        });

        runFilter();
    });
}

function setupFaq() {
    document.querySelectorAll("[data-faq-item]").forEach((item) => {
        const trigger = item.querySelector("[data-faq-trigger]");

        if (!trigger) {
            return;
        }

        trigger.addEventListener("click", () => {
            const isOpen = item.classList.contains("active");

            item
                .closest("[data-faq-list]")
                ?.querySelectorAll("[data-faq-item]")
                .forEach((entry) => entry.classList.remove("active"));

            item.classList.toggle("active", !isOpen);
        });
    });
}

function setupForms() {
    document.querySelectorAll("[data-demo-form]").forEach((form) => {
        const messageTarget = form.querySelector("[data-form-message]");
        const submitButton = form.querySelector('button[type="submit"]');

        form.addEventListener("submit", async (event) => {
            event.preventDefault();

            if (!window.NepergCMS?.submitContactMessage || !window.NepergCMS.isServerMode()) {
                if (messageTarget) {
                    messageTarget.classList.remove("hidden");
                    messageTarget.textContent =
                        "Inicie o servidor do projeto para ativar o envio real das mensagens.";
                }
                return;
            }

            const formData = new FormData(form);
            const payload = Object.fromEntries(formData.entries());

            if (submitButton) {
                submitButton.disabled = true;
            }

            try {
                await window.NepergCMS.submitContactMessage(payload);

                if (messageTarget) {
                    messageTarget.classList.remove("hidden");
                    messageTarget.textContent =
                        "Mensagem enviada com sucesso. A equipe pode acompanhar este contato no painel administrativo.";
                }

                form.reset();
            } catch (error) {
                if (messageTarget) {
                    messageTarget.classList.remove("hidden");
                    messageTarget.textContent =
                        error.message || "Nao foi possivel enviar a mensagem agora.";
                }
            } finally {
                if (submitButton) {
                    submitButton.disabled = false;
                }
            }
        });
    });
}

function initCMSPublicViews() {
    if (!window.NepergCMS) {
        return;
    }

    renderHomeAnnouncements();
    renderHomeFeed();
    setupCmsCollections();
}

function renderHomeAnnouncements() {
    const target = document.querySelector("[data-cms-announcements]");

    if (!target) {
        return;
    }

    const items = window.NepergCMS.getPublishedContents("announcement").slice(0, 3);

    target.innerHTML = items.length
        ? items
              .map(
                  (item) => `
                    <article class="card">
                        <div class="card-top">
                            <span class="icon-badge"><i class="fa-solid fa-bullhorn"></i></span>
                            <div>
                                <h3>${escapeHtml(item.title)}</h3>
                                <span class="tag">${escapeHtml(item.category || "Aviso")}</span>
                            </div>
                        </div>
                        <p>${escapeHtml(item.summary)}</p>
                        <div class="meta-line">
                            <span><i class="fa-solid fa-calendar-days"></i> ${escapeHtml(window.NepergCMS.formatDate(item.date))}</span>
                            ${item.location ? `<span><i class="fa-solid fa-location-dot"></i> ${escapeHtml(item.location)}</span>` : ""}
                        </div>
                        ${renderCtaButton(item)}
                    </article>
                `
              )
              .join("")
        : `<article class="content-card"><h3>Nenhum aviso publicado.</h3><p>Publique os destaques institucionais que devem aparecer nesta área.</p></article>`;
}
}

function renderHomeFeed() {
    const target = document.querySelector("[data-cms-home-feed]");

    if (!target) {
        return;
    }

    const featured = window.NepergCMS
        .getContents()
        .filter((item) => item.status === "published" && item.featured && item.type !== "announcement")
        .slice(0, 4);
    const items = featured.length
        ? featured
        : window.NepergCMS
              .getContents()
              .filter((item) => item.status === "published" && item.type !== "announcement")
              .slice(0, 4);

    target.innerHTML = items.length
        ? items.map((item) => renderFeedCard(item)).join("")
        : `<article class="content-card"><h3>Nenhum conteúdo disponível.</h3><p>Publique notícias ou eventos para preencher esta área automaticamente.</p></article>`;
}
}

function setupCmsCollections() {
    document.querySelectorAll("[data-cms-collection]").forEach((scope) => {
        const type = scope.dataset.cmsCollection;
        const searchInput = scope.querySelector("[data-cms-search]");
        const filtersTarget = scope.querySelector("[data-cms-filters]");
        const gridTarget = scope.querySelector("[data-cms-grid]");
        const emptyState = scope.querySelector("[data-cms-empty]");
        let activeCategory = "all";

        if (!gridTarget || !filtersTarget) {
            return;
        }

        const categories = window.NepergCMS.getCategories(type);

        filtersTarget.innerHTML = [
            '<button class="filter-button active" type="button" data-category="all">Tudo</button>'
        ]
            .concat(
                categories.map(
                    (category) =>
                        `<button class="filter-button" type="button" data-category="${escapeAttribute(
                            category
                        )}">${escapeHtml(category)}</button>`
                )
            )
            .join("");

        const runRender = () => {
            const term = (searchInput?.value || "").trim().toLowerCase();
            const items = window.NepergCMS.getPublishedContents(type).filter((item) => {
                const haystack = [
                    item.title,
                    item.summary,
                    item.body,
                    item.category,
                    item.location,
                    ...(item.tags || [])
                ]
                    .join(" ")
                    .toLowerCase();

                const matchesTerm = !term || haystack.includes(term);
                const matchesCategory =
                    activeCategory === "all" || item.category === activeCategory;

                return matchesTerm && matchesCategory;
            });

            gridTarget.innerHTML = items.map((item) => renderCollectionCard(type, item)).join("");

            if (emptyState) {
                emptyState.classList.toggle("hidden", items.length !== 0);
            }
        };

        filtersTarget.addEventListener("click", (event) => {
            const button = event.target.closest("[data-category]");

            if (!button) {
                return;
            }

            activeCategory = button.dataset.category || "all";
            filtersTarget
                .querySelectorAll("[data-category]")
                .forEach((item) => item.classList.toggle("active", item === button));
            runRender();
        });

        searchInput?.addEventListener("input", runRender);
        runRender();
    });
}

function renderCollectionCard(type, item) {
    if (item.type === "news") {
        return `
            <article class="news-card">
                <div class="news-image">
                    <img src="${escapeAttribute(window.NepergCMS.getImageUrl(item.image))}" alt="${escapeAttribute(
                        item.title
                    )}">
                </div>
                <div class="news-body">
                    <div class="news-top">
                        <span class="icon-badge"><i class="fa-solid fa-newspaper"></i></span>
                        <span class="tag">${escapeHtml(item.category || "Noticia")}</span>
                    </div>
                    <h3>${escapeHtml(item.title)}</h3>
                    <div class="meta-line">
                        <span><i class="fa-solid fa-calendar-days"></i> ${escapeHtml(window.NepergCMS.formatDate(item.date))}</span>
                        ${item.location ? `<span><i class="fa-solid fa-location-dot"></i> ${escapeHtml(item.location)}</span>` : ""}
                    </div>
                    <p>${escapeHtml(item.summary)}</p>
                    ${renderCtaButton(item)}
                </div>
            </article>
        `;
    }

    if (item.type === "announcement") {
        return `
            <article class="event-card">
                <div class="event-top">
                    <span class="icon-badge"><i class="fa-solid fa-bullhorn"></i></span>
                    <span class="tag">${escapeHtml(item.category || "Aviso")}</span>
                </div>
                <h3>${escapeHtml(item.title)}</h3>
                <div class="meta-line">
                    <span><i class="fa-solid fa-calendar-days"></i> ${escapeHtml(window.NepergCMS.formatDate(item.date))}</span>
                    ${item.location ? `<span><i class="fa-solid fa-location-dot"></i> ${escapeHtml(item.location)}</span>` : ""}
                </div>
                <p>${escapeHtml(item.summary)}</p>
                ${renderCtaButton(item)}
            </article>
        `;
    }

    return `
        <article class="event-card">
            <div class="event-top">
                <span class="icon-badge"><i class="fa-solid fa-calendar-days"></i></span>
                <span class="tag">${escapeHtml(item.category || "Evento")}</span>
            </div>
            <h3>${escapeHtml(item.title)}</h3>
            <div class="meta-line">
                <span><i class="fa-solid fa-calendar-days"></i> ${escapeHtml(window.NepergCMS.formatDate(item.date))}</span>
                ${item.location ? `<span><i class="fa-solid fa-location-dot"></i> ${escapeHtml(item.location)}</span>` : ""}
            </div>
            <p>${escapeHtml(item.summary)}</p>
            ${renderCtaButton(item)}
        </article>
    `;
}

function renderFeedCard(item) {
    const meta = window.NepergCMS.getTypeMeta(item.type);
    const body = item.summary || item.body || "";

    return `
        <article class="archive-card">
            <div class="event-top">
                <span class="icon-badge"><i class="fa-solid ${escapeAttribute(meta.icon)}"></i></span>
                <span class="tag">${escapeHtml(meta.label)}</span>
            </div>
            <h3>${escapeHtml(item.title)}</h3>
            <div class="meta-line">
                <span><i class="fa-solid fa-calendar-days"></i> ${escapeHtml(window.NepergCMS.formatDate(item.date))}</span>
                <span><i class="fa-solid fa-tag"></i> ${escapeHtml(item.category || "Geral")}</span>
            </div>
            <p>${escapeHtml(body)}</p>
            ${renderCtaButton(item)}
        </article>
    `;
}

function renderCtaButton(item) {
    const href = window.NepergCMS.resolveUrl(item.ctaUrl);

    if (!href) {
        return "";
    }

    return `<a class="btn btn-secondary" href="${escapeAttribute(href)}">${escapeHtml(
        item.ctaLabel || "Saiba mais"
    )}</a>`;
}

function escapeHtml(value) {
    return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function escapeAttribute(value) {
    return escapeHtml(value);
}
