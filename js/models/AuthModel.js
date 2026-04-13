// ============================================
// js/models/AuthModel.js — Authentication Model
// Single Responsibility: manages auth state only
// ============================================

import { APP_CONFIG, getSupabaseClient } from '../config.js';

export class AuthModel {
    constructor() {
        this._isAuthenticated = false;
        this._user = null;
    }

    // ── Public API ──────────────────────────────

    async login(email, password) {
        if (APP_CONFIG.isSupabaseConfigured) {
            return this._supabaseLogin(email, password);
        }
        return this._localLogin(email, password);
    }

    async logout() {
        if (APP_CONFIG.isSupabaseConfigured) {
            const supabase = await getSupabaseClient();
            await supabase.auth.signOut();
        }

        this._isAuthenticated = false;
        this._user = null;
        sessionStorage.removeItem('portfolio_auth');
    }

    async checkSession() {
        if (APP_CONFIG.isSupabaseConfigured) {
            const supabase = await getSupabaseClient();
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                this._isAuthenticated = true;
                this._user = session.user;
                return true;
            }
            return false;
        }

        const stored = sessionStorage.getItem('portfolio_auth');
        if (stored) {
            const parsed = JSON.parse(stored);
            if (parsed.authenticated) {
                this._isAuthenticated = true;
                this._user = { email: parsed.email };
                return true;
            }
        }
        return false;
    }

    get isAuthenticated() {
        return this._isAuthenticated;
    }

    get user() {
        return this._user;
    }

    // ── Private — Supabase ──────────────────────

    async _supabaseLogin(email, password) {
        const supabase = await getSupabaseClient();
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) throw new Error(error.message);

        this._isAuthenticated = true;
        this._user = data.user;
        return data.user;
    }

    // ── Private — Local Fallback ────────────────

    _localLogin(email, password) {
        const { adminCredentials } = APP_CONFIG;

        if (
            email === adminCredentials.email &&
            password === adminCredentials.password
        ) {
            this._isAuthenticated = true;
            this._user = { email };
            sessionStorage.setItem(
                'portfolio_auth',
                JSON.stringify({ email, authenticated: true })
            );
            return this._user;
        }

        throw new Error('Credenciales incorrectas');
    }
}
