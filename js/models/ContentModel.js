// ============================================
// js/models/ContentModel.js — Content Data Model
// Single Responsibility: CRUD for portfolio content
// ============================================

import { APP_CONFIG, getSupabaseClient } from '../config.js';

// ✅ FUNCIÓN NUEVA (ANTI ERRORES DE NOMBRE)
function sanitizeFileName(fileName) {
    return fileName
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, "_")
        .replace(/[^a-z0-9._-]/g, "");
}

export class ContentModel {
    constructor() {
        this._storageKey = 'portfolio_content';
    }

    // ── Public API ──────────────────────────────

    async getContentByWeek(week) {
        if (APP_CONFIG.isSupabaseConfigured) {
            return this._sbGetContent(parseInt(week));
        }
        return this._localGetContent(parseInt(week));
    }

    async getAllContent() {
        if (APP_CONFIG.isSupabaseConfigured) {
            return this._sbGetAllContent();
        }
        return this._localGetAllContent();
    }

    async addLink(week, title, url) {
        const item = {
            id: this._generateId(),
            week: parseInt(week),
            type: 'link',
            title,
            url,
            file_name: null,
            file_type: null,
            created_at: new Date().toISOString()
        };

        if (APP_CONFIG.isSupabaseConfigured) {
            return this._sbAddContent(item);
        }
        return this._localAddContent(item);
    }

    async uploadFile(week, file) {
        if (APP_CONFIG.isSupabaseConfigured) {
            return this._sbUploadFile(parseInt(week), file);
        }
        return this._localUploadFile(parseInt(week), file);
    }

    async removeContent(id) {
        if (APP_CONFIG.isSupabaseConfigured) {
            return this._sbRemoveContent(id);
        }
        return this._localRemoveContent(id);
    }

    // ── Supabase Implementation ─────────────────

    async _sbGetContent(week) {
        const supabase = await getSupabaseClient();
        const { data, error } = await supabase
            .from('activities')
            .select('*')
            .eq('week', week)
            .order('created_at', { ascending: true });

        if (error) throw new Error(error.message);
        return data || [];
    }

    async _sbGetAllContent() {
        const supabase = await getSupabaseClient();
        const { data, error } = await supabase
            .from('activities')
            .select('*')
            .order('week', { ascending: true })
            .order('created_at', { ascending: true });

        if (error) throw new Error(error.message);
        return data || [];
    }

    async _sbAddContent(item) {
        const supabase = await getSupabaseClient();
        const { data, error } = await supabase
            .from('activities')
            .insert(item)
            .select()
            .single();

        if (error) throw new Error(error.message);
        return data;
    }

    async _sbUploadFile(week, file) {
        const supabase = await getSupabaseClient();
        // LIMPIA EL NOMBRE
        const cleanName = sanitizeFileName(file.name);
        // USA EL NOMBRE LIMPIO
        const fileName = `week-${week}/${Date.now()}-${file.name}`;

        const { error: uploadError } = await supabase.storage
            .from('portfolio-files')
            .upload(fileName, file);

        if (uploadError) throw new Error(uploadError.message);

        const { data: { publicUrl } } = supabase.storage
            .from('portfolio-files')
            .getPublicUrl(fileName);

        const item = {
            id: this._generateId(),
            week,
            type: 'file',
            title: file.name,
            url: publicUrl,
            file_name: cleanName,   // 👈 IMPORTANTE (para eliminar luego)
            file_type: file.type,
            created_at: new Date().toISOString()
        };

        return this._sbAddContent(item);
    }

    async _sbRemoveContent(id) {
        const supabase = await getSupabaseClient();

        const { data: item } = await supabase
            .from('activities')
            .select('*')
            .eq('id', id)
            .single();

        if (item?.type === 'file' && item.file_name) {
            await supabase.storage
                .from('portfolio-files')
                .remove([`week-${item.week}/${item.file_name}`]);
        }

        const { error } = await supabase
            .from('activities')
            .delete()
            .eq('id', id);

        if (error) throw new Error(error.message);
    }

    // ── Local Storage Implementation ────────────

    _localGetContent(week) {
        return this._localGetAllContent().filter(i => i.week === week);
    }

    _localGetAllContent() {
        const raw = localStorage.getItem(this._storageKey);
        return raw ? JSON.parse(raw) : [];
    }

    _localAddContent(item) {
        const all = this._localGetAllContent();
        all.push(item);
        localStorage.setItem(this._storageKey, JSON.stringify(all));
        return item;
    }

    async _localUploadFile(week, file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const item = {
                    id: this._generateId(),
                    week,
                    type: 'file',
                    title: file.name,
                    url: reader.result,       // base64 data URI
                    file_name: file.name,
                    file_type: file.type,
                    created_at: new Date().toISOString()
                };
                resolve(this._localAddContent(item));
            };
            reader.onerror = () => reject(new Error('Error al leer el archivo'));
            reader.readAsDataURL(file);
        });
    }

    _localRemoveContent(id) {
        const filtered = this._localGetAllContent().filter(i => i.id !== id);
        localStorage.setItem(this._storageKey, JSON.stringify(filtered));
    }

    // ── Helpers ─────────────────────────────────

    _generateId() {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
}
