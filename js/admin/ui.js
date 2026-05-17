/**
 * UI Helpers for Neperg CMS Admin
 */
export const ui = {
    showMessage(target, message, isError = true) {
        if (!target) return;
        target.classList.remove("hidden");
        target.textContent = message;
        target.classList.toggle("error-message", isError);
    },

    hideMessage(target) {
        if (!target) return;
        target.classList.add("hidden");
        target.textContent = "";
    },

    escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    },

    formatDateTime(value) {
        if (!value) return "";
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return value;
        return new Intl.DateTimeFormat("pt-BR", {
            dateStyle: "medium",
            timeStyle: "short"
        }).format(date);
    },

    toggleLoading(element, isLoading) {
        if (!element) return;
        element.classList.toggle("is-loading", isLoading);
        const buttons = element.querySelectorAll("button");
        buttons.forEach(btn => btn.disabled = isLoading);
    }
};
