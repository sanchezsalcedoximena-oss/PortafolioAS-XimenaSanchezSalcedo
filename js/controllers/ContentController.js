// ============================================
// js/controllers/ContentController.js — Content Controller
// Orchestrates content CRUD between model and views
// ============================================

import { ContentModel } from '../models/ContentModel.js';

export class ContentController {
    constructor(contentView, adminView = null) {
        this.model = new ContentModel();
        this.contentView = contentView;
        this.adminView = adminView;
    }

    // ── Load Content ────────────────────────────

    async loadAllContent() {
        try {
            const allContent = await this.model.getAllContent();
            const grouped = this._groupByWeek(allContent);

            if (this.contentView) {
                this.contentView.renderUnits(grouped);
            }

            return grouped;
        } catch (err) {
            console.error('Error loading content:', err);
            this.contentView?.renderUnits({});
            return {};
        }
    }

    async loadWeekContent(week) {
        try {
            const content = await this.model.getContentByWeek(week);

            if (this.adminView) {
                this.adminView.renderContentList(content, (id) =>
                    this.handleDelete(id, week)
                );
            }

            return content;
        } catch (err) {
            console.error('Error loading week content:', err);
            return [];
        }
    }

    // ── File Upload ─────────────────────────────

    async handleFileUpload(week, files) {
        if (!files || files.length === 0) {
            this.adminView?.showNotification(
                'Selecciona al menos un archivo', 'error'
            );
            return;
        }

        try {
            for (const file of files) {
                await this.model.uploadFile(week, file);
            }

            this.adminView?.showNotification(
                `${files.length} archivo(s) subido(s) correctamente`
            );
            this.adminView?.clearFileInput();
            await this.loadWeekContent(week);
        } catch (err) {
            console.error('Error uploading file:', err);
            this.adminView?.showNotification(
                'Error al subir archivo(s)', 'error'
            );
        }
    }

    // ── Link Addition ───────────────────────────

    async handleAddLink(week, title, url) {
        if (!title || !url) {
            this.adminView?.showNotification(
                'Ingresa título y URL del enlace', 'error'
            );
            return;
        }

        try {
            new URL(url);
        } catch {
            this.adminView?.showNotification(
                'Ingresa una URL válida (incluye https://)', 'error'
            );
            return;
        }

        try {
            await this.model.addLink(week, title, url);
            this.adminView?.showNotification('Enlace agregado correctamente');
            this.adminView?.clearLinkInputs();
            await this.loadWeekContent(week);
        } catch (err) {
            console.error('Error adding link:', err);
            this.adminView?.showNotification(
                'Error al agregar enlace', 'error'
            );
        }
    }

    // ── Content Deletion ────────────────────────

    async handleDelete(id, week) {
        try {
            await this.model.removeContent(id);
            this.adminView?.showNotification('Recurso eliminado');
            await this.loadWeekContent(week);
        } catch (err) {
            console.error('Error deleting content:', err);
            this.adminView?.showNotification(
                'Error al eliminar recurso', 'error'
            );
        }
    }

    // ── Helpers ─────────────────────────────────

    _groupByWeek(content) {
        const grouped = {};
        content.forEach(item => {
            const w = item.week;
            if (!grouped[w]) grouped[w] = [];
            grouped[w].push(item);
        });
        return grouped;
    }
}
