/**
 * API Wrapper for Neperg CMS
 */
export const api = {
    async fetchJson(url, options = {}) {
        const response = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || 'Erro na requisição ao servidor.');
        }
        return data;
    },

    async getStatus() {
        return this.fetchJson('/api/status');
    },

    async login(username, password) {
        return this.fetchJson('/api/login', {
            method: 'POST',
            body: JSON.stringify({ username, password })
        });
    },

    async logout() {
        return this.fetchJson('/api/logout', { method: 'POST' });
    },

    async saveContent(payload) {
        return this.fetchJson('/api/contents', {
            method: 'POST',
            body: JSON.stringify(payload)
        });
    },

    async deleteContent(id) {
        return this.fetchJson(`/api/contents/${id}`, { method: 'DELETE' });
    },

    async getMessages() {
        return this.fetchJson('/api/messages');
    },

    async getUsers() {
        return this.fetchJson('/api/users');
    }
};
