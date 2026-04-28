document.addEventListener("DOMContentLoaded", async () => {
    if (!window.NepergCMS) {
        return;
    }

    await window.NepergCMS.ready();

    const TYPE_HELP = {
        news: "Noticia: aparece na pagina Noticias e pode aparecer na pagina inicial se voce marcar como destaque.",
        event: "Evento: aparece na pagina Eventos e pode aparecer na pagina inicial se voce marcar como destaque.",
        announcement:
            "Aviso: aparece na area de avisos da pagina inicial. Ideal para recados, chamadas e informacoes rapidas."
    };

    const SAVE_HELP = {
        published: "Se voce publicar, o item aparece no site imediatamente.",
        draft: "Se voce salvar como rascunho, o item fica guardado no painel e nao aparece no site ainda."
    };

    const DEFAULT_IMAGE_HELP =
        "Prefira imagens leves para nao ocupar muito espaco no servidor e no carregamento da pagina.";
    const MAX_IMAGE_SIZE = 2 * 1024 * 1024;
    const MIN_USERNAME_LENGTH = 3;
    const MIN_PASSWORD_LENGTH = 8;
    const ROLE_LABELS = {
        owner: "Proprietario",
        editor: "Editor"
    };
    const SERVER_REQUIRED_MESSAGE =
        "Servidor indisponivel. Inicie o backend do projeto para usar o painel administrativo.";

    const unavailableSection = document.querySelector("[data-admin-unavailable]");
    const setupSection = document.querySelector("[data-admin-setup]");
    const loginSection = document.querySelector("[data-admin-login]");
    const appSection = document.querySelector("[data-admin-app]");
    const setupForm = document.querySelector("[data-admin-setup-form]");
    const setupMessage = document.querySelector("[data-setup-message]");
    const setupLockNote = document.querySelector("[data-setup-lock-note]");
    const setupTokenRow = document.querySelector("[data-setup-token-row]");
    const loginForm = document.querySelector("[data-admin-login-form]");
    const loginMessage = document.querySelector("[data-login-message]");
    const contentForm = document.querySelector("[data-content-form]");
    const profileForm = document.querySelector("[data-profile-form]");
    const userManagementSection = document.querySelector("[data-user-management]");
    const userForm = document.querySelector("[data-user-form]");
    const userMessage = document.querySelector("[data-user-message]");
    const usersTarget = document.querySelector("[data-admin-users]");
    const listTarget = document.querySelector("[data-admin-list]");
    const messagesTarget = document.querySelector("[data-admin-messages]");
    const statsTarget = document.querySelector("[data-admin-stats]");
    const adminUser = document.querySelector("[data-admin-user]");
    const filterSearch = document.querySelector("[data-admin-search]");
    const filterType = document.querySelector("[data-admin-type-filter]");
    const filterStatus = document.querySelector("[data-admin-status-filter]");
    const filterCategory = document.querySelector("[data-admin-category-filter]");
    const resetContentButton = document.querySelector("[data-reset-content]");
    const logoutButtons = document.querySelectorAll("[data-admin-logout]");
    const formMessage = document.querySelector("[data-form-message]");
    const resetFormButton = document.querySelector("[data-reset-form]");
    const profileMessage = document.querySelector("[data-profile-message]");
    const localNote = document.querySelector("[data-admin-local-note]");
    const typeButtons = document.querySelectorAll("[data-type-choice]");
    const quickTypeButtons = document.querySelectorAll("[data-new-type]");
    const destinationNote = document.querySelector("[data-content-destination]");
    const saveHint = document.querySelector("[data-save-hint]");
    const saveModeButtons = document.querySelectorAll("[data-save-mode]");
    const imagePickButton = document.querySelector("[data-image-pick]");
    const imageRemoveButton = document.querySelector("[data-image-remove]");
    const imageUploadInput = document.querySelector("[data-image-upload]");
    const imageManualInput = document.querySelector("[data-image-manual]");
    const imagePreview = document.querySelector("[data-image-preview]");
    const imageStatus = document.querySelector("[data-image-status]");

    const typeInput = contentForm?.querySelector('[name="type"]');
    const statusInput = contentForm?.querySelector('[name="status"]');
    const imageInput = contentForm?.querySelector('[name="image"]');

    let editingId = "";

    function showMessage(target, message) {
        if (!target) {
            return;
        }

        target.classList.remove("hidden");
        target.textContent = message;
    }

    function hideMessage(target) {
        if (!target) {
            return;
        }

        target.classList.add("hidden");
        target.textContent = "";
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

    function formatDateTime(value) {
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

    function validateCredentials(username, password, confirmPassword = password) {
        if (username.length < MIN_USERNAME_LENGTH) {
            return `O usuario precisa ter ao menos ${MIN_USERNAME_LENGTH} caracteres.`;
        }

        if (password.length < MIN_PASSWORD_LENGTH) {
            return `A senha precisa ter ao menos ${MIN_PASSWORD_LENGTH} caracteres.`;
        }

        if (password !== confirmPassword) {
            return "A confirmacao de senha nao confere.";
        }

        return "";
    }

    function updateImageStatus(message, isError = false) {
        if (!imageStatus) {
            return;
        }

        imageStatus.textContent = message;
        imageStatus.classList.toggle("field-help-error", isError);
    }

    function renderImagePreview(value) {
        if (!imagePreview) {
            return;
        }

        imagePreview.replaceChildren();

        if (!value) {
            const placeholder = document.createElement("span");
            placeholder.className = "image-placeholder";
            placeholder.textContent = "Nenhuma imagem selecionada.";
            imagePreview.appendChild(placeholder);
            return;
        }

        const preview = document.createElement("img");
        preview.src = window.NepergCMS.getImageUrl(value);
        preview.alt = "Pre-visualizacao da imagem";
        imagePreview.appendChild(preview);
    }

    function setImageValue(value, options = {}) {
        const { manualValue = null, statusMessage = DEFAULT_IMAGE_HELP, isError = false } = options;

        if (imageInput) {
            imageInput.value = value || "";
        }

        if (imageManualInput && manualValue !== null) {
            imageManualInput.value = manualValue;
        }

        if (!value && imageUploadInput) {
            imageUploadInput.value = "";
        }

        renderImagePreview(value);
        updateImageStatus(statusMessage, isError);
    }

    function updateTypeUI(type) {
        if (typeInput) {
            typeInput.value = type;
        }

        typeButtons.forEach((button) => {
            button.classList.toggle("active", button.dataset.typeChoice === type);
        });

        if (destinationNote) {
            destinationNote.textContent = TYPE_HELP[type] || TYPE_HELP.news;
        }
    }

    function updateSaveMode(status) {
        if (statusInput) {
            statusInput.value = status;
        }

        saveModeButtons.forEach((button) => {
            button.classList.toggle("active", button.dataset.saveMode === status);
        });

        if (saveHint) {
            saveHint.textContent = SAVE_HELP[status] || SAVE_HELP.published;
        }
    }

    function renderVisibility() {
        const adminAvailable = window.NepergCMS.isAdminAvailable();
        const hasProfile = window.NepergCMS.hasProfile();
        const authenticated = adminAvailable && hasProfile && window.NepergCMS.isAuthenticated();
        const canManageUsers = authenticated && window.NepergCMS.canManageUsers();

        unavailableSection?.classList.toggle("hidden", adminAvailable);
        setupSection?.classList.toggle("hidden", !adminAvailable || hasProfile);
        loginSection?.classList.toggle("hidden", !adminAvailable || !hasProfile || authenticated);
        appSection?.classList.toggle("hidden", !authenticated);
        userManagementSection?.classList.toggle("hidden", !canManageUsers);

        if (adminUser) {
            adminUser.textContent = window.NepergCMS.getSessionUser() || "-";
        }

        if (localNote) {
            localNote.textContent = adminAvailable
                ? "Servidor conectado. As alteracoes ficam persistidas no backend do site."
                : SERVER_REQUIRED_MESSAGE;
        }

        const needsSetupToken = window.NepergCMS.requiresSetupToken();
        const setupLocked = window.NepergCMS.isSetupLocked();
        setupTokenRow?.classList.toggle("hidden", !needsSetupToken);
        setupForm?.setupToken?.toggleAttribute("required", needsSetupToken);
        setupLockNote?.classList.toggle("hidden", !setupLocked);

        if (setupForm) {
            setupForm.querySelectorAll("input, button").forEach((field) => {
                field.disabled = setupLocked;
            });
        }
    }

    function renderStats() {
        if (!statsTarget) {
            return;
        }

        const contents = window.NepergCMS.getContents("", true);
        const published = contents.filter((item) => item.status === "published");
        const draft = contents.filter((item) => item.status === "draft");
        const messages = window.NepergCMS.getMessages();
        const userCount = window.NepergCMS.getUserCount();

        statsTarget.innerHTML = `
            <article class="metric-card">
                <strong>${contents.length}</strong>
                <span>Total de conteudos cadastrados</span>
            </article>
            <article class="metric-card">
                <strong>${published.filter((item) => item.type === "news").length}</strong>
                <span>Noticias publicadas</span>
            </article>
            <article class="metric-card">
                <strong>${published.filter((item) => item.type === "event").length}</strong>
                <span>Eventos ativos</span>
            </article>
            <article class="metric-card">
                <strong>${draft.length}</strong>
                <span>Rascunhos salvos</span>
            </article>
            <article class="metric-card">
                <strong>${messages.length}</strong>
                <span>Mensagens recebidas</span>
            </article>
            <article class="metric-card">
                <strong>${userCount}</strong>
                <span>Acessos administrativos</span>
            </article>
        `;
    }

    function renderCategoryFilter() {
        if (!filterCategory) {
            return;
        }

        const selected = filterCategory.value;
        const categories = window.NepergCMS.getCategories(filterType?.value || "");
        const options = ['<option value="">Todas as categorias</option>']
            .concat(
                categories.map(
                    (category) =>
                        `<option value="${escapeHtml(category)}">${escapeHtml(category)}</option>`
                )
            )
            .join("");

        filterCategory.innerHTML = options;
        filterCategory.value = categories.includes(selected) ? selected : "";
    }

    function getFilteredItems() {
        const term = (filterSearch?.value || "").trim().toLowerCase();
        const type = filterType?.value || "";
        const status = filterStatus?.value || "";
        const category = filterCategory?.value || "";

        return window.NepergCMS.getContents("", true).filter((item) => {
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
            const matchesType = !type || item.type === type;
            const matchesStatus = !status || item.status === status;
            const matchesCategory = !category || item.category === category;

            return matchesTerm && matchesType && matchesStatus && matchesCategory;
        });
    }

    function renderList() {
        if (!listTarget) {
            return;
        }

        const items = getFilteredItems();

        if (!items.length) {
            listTarget.innerHTML = `
                <article class="content-card">
                    <h3>Nenhum conteudo encontrado.</h3>
                    <p>Ajuste os filtros ou cadastre um novo item no formulario ao lado.</p>
                </article>
            `;
            return;
        }

        listTarget.innerHTML = items
            .map((item) => {
                const meta = window.NepergCMS.getTypeMeta(item.type);
                const tags = (item.tags || [])
                    .map((tag) => `<span class="chip">${escapeHtml(tag)}</span>`)
                    .join("");
                const statusLabel = item.status === "published" ? "Publicado" : "Rascunho";
                const imageLabel = item.image ? "Com imagem" : "Sem imagem";

                return `
                    <article class="admin-item" data-item-id="${escapeAttribute(item.id)}">
                        <div class="admin-item-top">
                            <div>
                                <div class="tag-row">
                                    <span class="tag">${meta.label}</span>
                                    <span class="tag">${escapeHtml(item.category || "Geral")}</span>
                                    <span class="tag">${statusLabel}</span>
                                    <span class="tag">${imageLabel}</span>
                                </div>
                                <h3>${escapeHtml(item.title)}</h3>
                            </div>
                            <div class="inline-actions">
                                <button class="btn btn-secondary" type="button" data-action="edit" data-id="${escapeAttribute(item.id)}">Editar</button>
                                <button class="btn btn-secondary" type="button" data-action="delete" data-id="${escapeAttribute(item.id)}">Excluir</button>
                            </div>
                        </div>
                        <p>${escapeHtml(item.summary || item.body || "")}</p>
                        <div class="meta-line">
                            <span><i class="fa-solid fa-calendar-days"></i> ${escapeHtml(window.NepergCMS.formatDate(item.date) || "Sem data")}</span>
                            <span><i class="fa-solid fa-location-dot"></i> ${escapeHtml(item.location || "Sem local")}</span>
                        </div>
                        <div class="meta-line">
                            <span><i class="fa-solid fa-user-pen"></i> Atualizado por ${escapeHtml(item.updatedBy || "Sistema")}</span>
                            <span><i class="fa-solid fa-clock"></i> ${escapeHtml(formatDateTime(item.updatedAt) || "Sem historico")}</span>
                        </div>
                        ${tags ? `<div class="chip-list">${tags}</div>` : ""}
                    </article>
                `;
            })
            .join("");
    }

    function renderMessages() {
        if (!messagesTarget) {
            return;
        }

        const items = window.NepergCMS.getMessages();

        if (!items.length) {
            messagesTarget.innerHTML = `
                <article class="content-card">
                    <h3>Nenhuma mensagem recebida ainda.</h3>
                    <p>As mensagens enviadas pelo formulario de contato vao aparecer aqui.</p>
                </article>
            `;
            return;
        }

        messagesTarget.innerHTML = items
            .map(
                (item) => `
                    <article class="content-card">
                        <div class="card-top">
                            <span class="icon-badge"><i class="fa-solid fa-envelope"></i></span>
                            <div>
                                <h3>${escapeHtml(item.subject || "Mensagem sem assunto")}</h3>
                                <p>${escapeHtml(item.name)} • ${escapeHtml(item.email)}</p>
                            </div>
                        </div>
                        <p>${escapeHtml(item.message)}</p>
                        <div class="meta-line">
                            <span><i class="fa-solid fa-calendar-days"></i> ${escapeHtml(item.createdAtLabel || item.createdAt || "")}</span>
                        </div>
                    </article>
                `
            )
            .join("");
    }

    function renderUsers() {
        if (!usersTarget) {
            return;
        }

        if (!window.NepergCMS.canManageUsers()) {
            usersTarget.innerHTML = "";
            return;
        }

        const users = window.NepergCMS.getUsers();

        if (!users.length) {
            usersTarget.innerHTML = `
                <article class="content-card">
                    <h3>Nenhum acesso administrativo cadastrado.</h3>
                    <p>Crie pelo menos um acesso para separar o uso do painel entre as pessoas da equipe.</p>
                </article>
            `;
            return;
        }

        usersTarget.innerHTML = users
            .map((user) => {
                const isCurrentUser = user.username === window.NepergCMS.getSessionUser();
                const roleLabel = ROLE_LABELS[user.role] || ROLE_LABELS.editor;

                return `
                    <article class="admin-item" data-user-id="${escapeAttribute(user.id)}">
                        <div class="admin-item-top">
                            <div>
                                <div class="tag-row">
                                    <span class="tag">${escapeHtml(roleLabel)}</span>
                                    ${isCurrentUser ? '<span class="tag">Voce</span>' : ""}
                                </div>
                                <h3>${escapeHtml(user.username)}</h3>
                            </div>
                            <div class="inline-actions">
                                ${isCurrentUser ? "" : `<button class="btn btn-secondary" type="button" data-user-action="delete" data-id="${escapeAttribute(user.id)}" data-username="${escapeAttribute(user.username)}">Remover</button>`}
                            </div>
                        </div>
                        <div class="meta-line">
                            <span><i class="fa-solid fa-user-group"></i> ${escapeHtml(roleLabel)}</span>
                            <span><i class="fa-solid fa-calendar-days"></i> Criado em ${escapeHtml(formatDateTime(user.createdAt) || "Sem data")}</span>
                        </div>
                        <div class="meta-line">
                            <span><i class="fa-solid fa-clock"></i> Ultimo acesso: ${escapeHtml(formatDateTime(user.lastLoginAt) || "Ainda nao entrou")}</span>
                        </div>
                    </article>
                `;
            })
            .join("");
    }

    function fillForm(item) {
        if (!contentForm) {
            return;
        }

        editingId = item?.id || "";
        contentForm.reset();

        contentForm.querySelector('[name="id"]').value = editingId;
        updateTypeUI(item?.type || "news");
        updateSaveMode(item?.status || "published");
        contentForm.querySelector('[name="title"]').value = item?.title || "";
        contentForm.querySelector('[name="category"]').value = item?.category || "";
        contentForm.querySelector('[name="date"]').value = item?.date || "";
        contentForm.querySelector('[name="location"]').value = item?.location || "";
        contentForm.querySelector('[name="summary"]').value = item?.summary || "";
        contentForm.querySelector('[name="body"]').value = item?.body || "";
        contentForm.querySelector('[name="ctaLabel"]').value = item?.ctaLabel || "";
        contentForm.querySelector('[name="ctaUrl"]').value = item?.ctaUrl || "";
        contentForm.querySelector('[name="tags"]').value = (item?.tags || []).join(", ");
        contentForm.querySelector('[name="featured"]').checked = Boolean(item?.featured);

        const imageValue = item?.image || "";
        setImageValue(imageValue, {
            manualValue: imageValue.startsWith("data:") ? "" : imageValue,
            statusMessage: imageValue ? "Imagem carregada para este conteudo." : DEFAULT_IMAGE_HELP
        });
    }

    function resetForm(clearMessage = true) {
        editingId = "";

        if (contentForm) {
            contentForm.reset();
            contentForm.querySelector('[name="id"]').value = "";
        }

        updateTypeUI("news");
        updateSaveMode("published");
        setImageValue("", {
            manualValue: "",
            statusMessage: DEFAULT_IMAGE_HELP
        });

        if (clearMessage) {
            hideMessage(formMessage);
        }
    }

    async function refreshDashboard() {
        renderVisibility();

        if (window.NepergCMS.isAdminAvailable()) {
            await window.NepergCMS.refreshContents({
                includeDrafts: window.NepergCMS.isAuthenticated()
            });

            if (window.NepergCMS.isAuthenticated()) {
                await window.NepergCMS.refreshMessages();
                await window.NepergCMS.refreshUsers();
            }
        }

        renderStats();
        renderCategoryFilter();
        renderList();
        renderMessages();
        renderUsers();

        const profile = window.NepergCMS.getProfile();
        if (profileForm) {
            profileForm.username.value = profile?.username || "";
            profileForm.password.value = "";
        }
    }

    setupForm?.addEventListener("submit", async (event) => {
        event.preventDefault();
        hideMessage(setupMessage);

        if (window.NepergCMS.isSetupLocked()) {
            showMessage(
                setupMessage,
                "Defina ADMIN_SETUP_TOKEN na hospedagem antes de criar o primeiro acesso em producao."
            );
            return;
        }

        const username = setupForm.username.value.trim();
        const setupToken = setupForm.setupToken?.value.trim() || "";
        const password = setupForm.password.value.trim();
        const confirmPassword = setupForm.confirmPassword.value.trim();
        const validationMessage = validateCredentials(username, password, confirmPassword);

        if (validationMessage) {
            showMessage(setupMessage, validationMessage);
            return;
        }

        try {
            await window.NepergCMS.setupProfile({
                username,
                password,
                confirmPassword,
                setupToken
            });
            setupForm.reset();
            await refreshDashboard();
        } catch (error) {
            showMessage(setupMessage, error.message || "Nao foi possivel criar o primeiro acesso.");
        }
    });

    loginForm?.addEventListener("submit", async (event) => {
        event.preventDefault();
        hideMessage(loginMessage);

        const username = loginForm.username.value.trim();
        const password = loginForm.password.value;

        try {
            await window.NepergCMS.login(username, password);
            loginForm.reset();
            await refreshDashboard();
        } catch (error) {
            showMessage(loginMessage, error.message || "Usuario ou senha invalidos.");
        }
    });

    typeButtons.forEach((button) => {
        button.addEventListener("click", () => {
            updateTypeUI(button.dataset.typeChoice || "news");
        });
    });

    quickTypeButtons.forEach((button) => {
        button.addEventListener("click", () => {
            resetForm();
            updateTypeUI(button.dataset.newType || "news");
            showMessage(formMessage, "Formulario preparado para um novo conteudo.");
            contentForm?.scrollIntoView({ behavior: "smooth", block: "start" });
        });
    });

    saveModeButtons.forEach((button) => {
        button.addEventListener("click", () => {
            updateSaveMode(button.dataset.saveMode || "published");
        });
    });

    imagePickButton?.addEventListener("click", () => {
        imageUploadInput?.click();
    });

    imageUploadInput?.addEventListener("change", () => {
        const file = imageUploadInput.files?.[0];

        if (!file) {
            return;
        }

        if (!file.type.startsWith("image/")) {
            setImageValue("", {
                manualValue: "",
                statusMessage: "Selecione um arquivo de imagem valido.",
                isError: true
            });
            return;
        }

        if (file.size > MAX_IMAGE_SIZE) {
            setImageValue("", {
                manualValue: "",
                statusMessage: "A imagem esta muito grande. Use uma imagem com ate 2 MB.",
                isError: true
            });
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            setImageValue(String(reader.result || ""), {
                manualValue: "",
                statusMessage: `Imagem carregada: ${file.name}`
            });
        };
        reader.readAsDataURL(file);
    });

    imageManualInput?.addEventListener("input", () => {
        const value = imageManualInput.value.trim();

        if (value && !window.NepergCMS.isAllowedImageValue(value)) {
            setImageValue("", {
                manualValue: value,
                statusMessage:
                    "Use um caminho interno, uma URL https ou uma imagem enviada do computador.",
                isError: true
            });
            return;
        }

        setImageValue(value, {
            manualValue: value,
            statusMessage: value
                ? "Imagem definida por link ou caminho manual."
                : DEFAULT_IMAGE_HELP
        });
    });

    imageRemoveButton?.addEventListener("click", () => {
        setImageValue("", {
            manualValue: "",
            statusMessage: "Imagem removida. O sistema vai usar o placeholder padrao."
        });
    });

    contentForm?.addEventListener("submit", async (event) => {
        event.preventDefault();
        hideMessage(formMessage);

        const formData = new FormData(contentForm);
        const payload = Object.fromEntries(formData.entries());
        payload.featured = formData.get("featured") === "on";
        payload.status = statusInput?.value || "published";
        payload.type = typeInput?.value || "news";
        payload.image = imageInput?.value || "";

        if (!payload.title || !payload.summary || !payload.date) {
            showMessage(formMessage, "Preencha ao menos titulo, resumo e data.");
            return;
        }

        if (payload.ctaUrl && !window.NepergCMS.isAllowedLinkValue(payload.ctaUrl)) {
            showMessage(
                formMessage,
                "Use um link seguro: caminho interno, ancora, mailto, tel ou URL https."
            );
            return;
        }

        if (payload.image && !window.NepergCMS.isAllowedImageValue(payload.image)) {
            showMessage(
                formMessage,
                "A imagem precisa ser interna, https ou um arquivo enviado do computador."
            );
            return;
        }

        try {
            await window.NepergCMS.upsertContent(payload);

            let successMessage = "Conteudo salvo com sucesso.";
            if (payload.status === "draft") {
                successMessage = "Conteudo salvo como rascunho.";
            } else if (editingId) {
                successMessage = "Conteudo atualizado e publicado.";
            } else {
                successMessage = "Conteudo criado e publicado.";
            }

            resetForm(false);
            showMessage(formMessage, successMessage);
            await refreshDashboard();
        } catch (error) {
            showMessage(formMessage, error.message || "Nao foi possivel salvar o conteudo.");
        }
    });

    profileForm?.addEventListener("submit", async (event) => {
        event.preventDefault();
        hideMessage(profileMessage);

        const username = profileForm.username.value.trim();
        const password = profileForm.password.value.trim();
        const currentProfile = window.NepergCMS.getProfile();
        const validationMessage = password
            ? validateCredentials(username, password)
            : username.length < MIN_USERNAME_LENGTH
              ? `O usuario precisa ter ao menos ${MIN_USERNAME_LENGTH} caracteres.`
              : "";

        if (!username || !currentProfile?.username) {
            showMessage(profileMessage, "Sessao invalida. Entre novamente no painel.");
            return;
        }

        if (validationMessage) {
            showMessage(profileMessage, validationMessage);
            return;
        }

        try {
            await window.NepergCMS.saveProfile({
                username,
                password
            });

            showMessage(
                profileMessage,
                password ? "Credenciais atualizadas." : "Usuario atualizado. A senha anterior foi mantida."
            );
            await refreshDashboard();
        } catch (error) {
            showMessage(profileMessage, error.message || "Nao foi possivel atualizar o acesso.");
        }
    });

    userForm?.addEventListener("submit", async (event) => {
        event.preventDefault();
        hideMessage(userMessage);

        const username = userForm.username.value.trim();
        const password = userForm.password.value.trim();
        const confirmPassword = userForm.confirmPassword.value.trim();
        const role = userForm.role.value || "editor";
        const validationMessage = validateCredentials(username, password, confirmPassword);

        if (validationMessage) {
            showMessage(userMessage, validationMessage);
            return;
        }

        try {
            await window.NepergCMS.createUser({
                username,
                password,
                confirmPassword,
                role
            });
            userForm.reset();
            if (userForm.role) {
                userForm.role.value = "editor";
            }
            showMessage(userMessage, "Novo acesso criado com sucesso.");
            await refreshDashboard();
        } catch (error) {
            showMessage(userMessage, error.message || "Nao foi possivel criar o novo acesso.");
        }
    });

    usersTarget?.addEventListener("click", async (event) => {
        const button = event.target.closest("[data-user-action]");
        if (!button) {
            return;
        }

        const userId = button.dataset.id || "";
        const username = button.dataset.username || "este usuario";

        if (button.dataset.userAction === "delete") {
            const confirmed = window.confirm(
                `Deseja remover o acesso de "${username}"? Essa pessoa perdera o acesso ao painel.`
            );

            if (!confirmed) {
                return;
            }

            try {
                await window.NepergCMS.deleteUser(userId);
                showMessage(userMessage, "Acesso removido com sucesso.");
                await refreshDashboard();
            } catch (error) {
                showMessage(userMessage, error.message || "Nao foi possivel remover o acesso.");
            }
        }
    });

    listTarget?.addEventListener("click", async (event) => {
        const button = event.target.closest("[data-action]");

        if (!button) {
            return;
        }

        const { action, id } = button.dataset;

        if (action === "edit") {
            const item = window.NepergCMS.getContentById(id);
            fillForm(item);
            showMessage(formMessage, "Editando item selecionado.");
            contentForm?.scrollIntoView({ behavior: "smooth", block: "start" });
            return;
        }

        if (action === "delete") {
            const item = window.NepergCMS.getContentById(id);
            if (!item) {
                return;
            }

            const confirmed = window.confirm(`Deseja excluir "${item.title}"?`);
            if (!confirmed) {
                return;
            }

            try {
                await window.NepergCMS.deleteContent(id);
                if (editingId === id) {
                    resetForm();
                }
                await refreshDashboard();
            } catch (error) {
                showMessage(formMessage, error.message || "Nao foi possivel excluir o conteudo.");
            }
        }
    });

    [filterSearch, filterType, filterStatus, filterCategory].forEach((field) => {
        field?.addEventListener("input", () => {
            if (field === filterType) {
                renderCategoryFilter();
            }
            renderList();
        });

        field?.addEventListener("change", () => {
            if (field === filterType) {
                renderCategoryFilter();
            }
            renderList();
        });
    });

    resetFormButton?.addEventListener("click", () => {
        resetForm();
    });

    resetContentButton?.addEventListener("click", async () => {
        const confirmed = window.confirm(
            "Deseja restaurar o conteudo inicial do site e manter a estrutura pronta para novos cadastros?"
        );

        if (!confirmed) {
            return;
        }

        try {
            await window.NepergCMS.resetToSeed();
            resetForm();
            await refreshDashboard();
        } catch (error) {
            showMessage(formMessage, error.message || "Nao foi possivel restaurar o conteudo inicial.");
        }
    });

    logoutButtons.forEach((button) => {
        button.addEventListener("click", async () => {
            await window.NepergCMS.logout();
            resetForm();
            await refreshDashboard();
        });
    });

    resetForm();
    await refreshDashboard();
});
