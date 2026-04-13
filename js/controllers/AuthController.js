// ============================================
// js/controllers/AuthController.js — Auth Controller
// Mediates between AuthModel and AdminView
// ============================================

import { AuthModel } from '../models/AuthModel.js';

export class AuthController {
    constructor(view) {
        this.model = new AuthModel();
        this.view = view;
        this._onAuthChange = null;
    }

    onAuthChange(callback) {
        this._onAuthChange = callback;
    }

    async init() {
        const isAuthenticated = await this.model.checkSession();

        if (isAuthenticated) {
            this.view.showAdminPanel();
        } else {
            this.view.showLoginForm();
        }

        this.view.bindLoginForm(() => this.handleLogin());
        this.view.bindLogout(() => this.handleLogout());

        return isAuthenticated;
    }

    async handleLogin() {
        const { email, password } = this.view.getLoginCredentials();

        if (!email || !password) {
            this.view.showLoginError('Por favor ingresa correo y contraseña');
            return;
        }

        try {
            this.view.hideLoginError();
            await this.model.login(email, password);
            this.view.showAdminPanel();
            this._onAuthChange?.(true);
        } catch (err) {
            this.view.showLoginError(err.message || 'Error al iniciar sesión');
        }
    }

    async handleLogout() {
        await this.model.logout();
        this.view.showLoginForm();
        this._onAuthChange?.(false);
    }

    get isAuthenticated() {
        return this.model.isAuthenticated;
    }
}
