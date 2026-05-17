/**
 * Simple validation utility to replace manual if checks
 */
class Validator {
    constructor(data) {
        this.data = data;
        this.errors = [];
    }

    required(field, message) {
        const value = this.data[field];
        if (value === undefined || value === null || (typeof value === "string" && value.trim() === "")) {
            this.errors.push(message || `O campo ${field} é obrigatório.`);
        }
        return this;
    }

    minLength(field, min, message) {
        const value = this.data[field];
        if (value && value.length < min) {
            this.errors.push(message || `O campo ${field} deve ter no mínimo ${min} caracteres.`);
        }
        return this;
    }

    email(field, message) {
        const value = this.data[field];
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (value && !emailRegex.test(value)) {
            this.errors.push(message || `O campo ${field} deve ser um e-mail válido.`);
        }
        return this;
  }

    isValid() {
        return this.errors.length === 0;
    }

    getErrorMessage() {
        return this.errors[0];
    }
}

module.exports = (data) => new Validator(data);
