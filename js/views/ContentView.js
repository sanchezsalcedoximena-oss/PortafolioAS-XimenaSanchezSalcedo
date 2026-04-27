// ============================================
// js/views/ContentView.js — Content Display View
// Renders units & weeks for the public-facing page
// ============================================

import { APP_CONFIG } from '../config.js';

export class ContentView {
    constructor(containerSelector) {
        this.container = document.querySelector(containerSelector);
        this._initPreviewModal();
        this._initDownloadConfirm();
    }

    // ── Render All Units ────────────────────────

    renderUnits(contentByWeek) {
        if (!this.container) return;

        this.container.innerHTML = APP_CONFIG.units.map(unit => `
            <section id="unidad-${unit.id}" class="unit-section">
                <div class="unit-inner">
                    <div class="unit-header fade-in">
                        <h2 class="unit-title">${unit.title}</h2>
                        <p class="unit-description">${unit.description}</p>
                    </div>
                    <div class="weeks-grid stagger-children">
                        ${unit.weeks.map((week, idx) =>
            this._renderWeekCard(week, contentByWeek[week.number] || [], idx)
        ).join('')}
                    </div>
                </div>
            </section>
        `).join('');

        // Bind action buttons after rendering
        this._bindActionButtons();
    }

    // ── Single Week Card ────────────────────────

    _renderWeekCard(week, content, index) {
        const weekNum = week.number;
        const weekName = week.name || '';
        const hasContent = content.length > 0;

        return `
            <div id="semana-${weekNum}" class="week-card slide-up"
                 style="transition-delay: ${index * 0.1}s">
                <div class="week-card-header">
                    <span class="week-number">Semana ${weekNum}</span>
                    <span class="week-badge ${hasContent ? 'active' : 'empty'}">
                        ${hasContent ? content.length + ' recurso(s)' : 'Vacío'}
                    </span>
                </div>
                ${weekName ? `<div class="week-name">${weekName}</div>` : ''}
                <div class="week-card-body">
                    ${hasContent
                ? this._renderContentList(content)
                : `<div class="empty-state">
                               <span class="empty-icon">📭</span>
                               <p>Aún no hay actividades</p>
                           </div>`
            }
                </div>
            </div>
        `;
    }

    // ── Content List ────────────────────────────

    _renderContentList(content) {
        return `
            <ul class="content-list">
                ${content.map(item => this._renderContentItem(item)).join('')}
            </ul>
        `;
    }

    _renderContentItem(item) {
        const icon = item.type === 'link' ? '🔗' : this._fileIcon(item.file_type || '');
        const href = item.url || '#';

        if (item.type === 'link') {
            return `
                <li class="content-item content-link">
                    <span class="content-icon">${icon}</span>
                    <a href="${href}" target="_blank" rel="noopener noreferrer"
                       class="content-link-anchor">${item.title}</a>
                </li>
            `;
        }

        // File items: name + eye (preview) + download buttons
        return `
            <li class="content-item content-file">
                <span class="content-icon">${icon}</span>
                <span class="content-file-name">${item.title}</span>
                <div class="content-actions">
                    <button class="action-btn preview-btn"
                            data-url="${href}"
                            data-type="${item.file_type || ''}"
                            data-title="${item.title}"
                            title="Visualizar">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                             stroke="currentColor" stroke-width="2"
                             stroke-linecap="round" stroke-linejoin="round">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                            <circle cx="12" cy="12" r="3"/>
                        </svg>
                    </button>
                    <button class="action-btn download-btn"
                            data-url="${href}"
                            data-filename="${item.file_name || item.title}"
                            title="Descargar">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                             stroke="currentColor" stroke-width="2"
                             stroke-linecap="round" stroke-linejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                            <polyline points="7 10 12 15 17 10"/>
                            <line x1="12" y1="15" x2="12" y2="3"/>
                        </svg>
                    </button>
                </div>
            </li>
        `;
    }

    // ── File Icon Helper ────────────────────────

    _fileIcon(type) {
        if (type.includes('pdf')) return '📄';
        if (type.includes('word') || type.includes('document')) return '📝';
        if (type.includes('image')) return '🖼️';
        if (type.includes('spreadsheet') || type.includes('excel')) return '📊';
        if (type.includes('presentation') || type.includes('powerpoint')) return '📑';
        return '📁';
    }

    // ── Partial Update ──────────────────────────

    updateWeekContent(week, content) {
        const card = document.getElementById(`semana-${week}`);
        if (!card) return;

        const body = card.querySelector('.week-card-body');
        const badge = card.querySelector('.week-badge');

        if (content.length > 0) {
            body.innerHTML = this._renderContentList(content);
            badge.className = 'week-badge active';
            badge.textContent = `${content.length} recurso(s)`;
        } else {
            body.innerHTML = `
                <div class="empty-state">
                    <span class="empty-icon">📭</span>
                    <p>Aún no hay actividades</p>
                </div>
            `;
            badge.className = 'week-badge empty';
            badge.textContent = 'Vacío';
        }

        // Re-bind buttons after partial update
        this._bindActionButtons();
    }

    // ══════════════════════════════════════════════
    // PREVIEW MODAL
    // ══════════════════════════════════════════════

    _initPreviewModal() {
        // Create modal if it doesn't exist
        if (document.getElementById('preview-modal')) return;

        const modal = document.createElement('div');
        modal.id = 'preview-modal';
        modal.className = 'preview-modal';
        modal.innerHTML = `
            <div class="preview-overlay"></div>
            <div class="preview-container">
                <div class="preview-header">
                    <h3 class="preview-title"></h3>
                    <button class="preview-close-btn" id="preview-close-btn" title="Cerrar">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                             stroke="currentColor" stroke-width="2"
                             stroke-linecap="round" stroke-linejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"/>
                            <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                    </button>
                </div>
                <div class="preview-body" id="preview-body"></div>
            </div>
        `;
        document.body.appendChild(modal);

        // Close on overlay click
        modal.querySelector('.preview-overlay').addEventListener('click', () => this._closePreview());
        modal.querySelector('#preview-close-btn').addEventListener('click', () => this._closePreview());

        // Close on Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('active')) {
                this._closePreview();
            }
        });
    }

    _openPreview(url, fileType, title) {
        const modal = document.getElementById('preview-modal');
        const body = document.getElementById('preview-body');
        const titleEl = modal.querySelector('.preview-title');
        if (!modal || !body) return;

        titleEl.textContent = title;
        body.innerHTML = ''; // Clear previous

        if (fileType.includes('pdf')) {
            body.innerHTML = `<iframe class="preview-iframe" src="${url}" title="${title}"></iframe>`;
        } else if (fileType.includes('image')) {
            body.innerHTML = `<img class="preview-image" src="${url}" alt="${title}" />`;
        } else {
            // For other file types, show in iframe as fallback
            body.innerHTML = `
                <div class="preview-fallback">
                    <div class="preview-fallback-icon">📄</div>
                    <p>Vista previa no disponible para este tipo de archivo.</p>
                    <a href="${url}" target="_blank" rel="noopener noreferrer" class="preview-open-external">
                        Abrir en nueva pestaña
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                             stroke="currentColor" stroke-width="2"
                             stroke-linecap="round" stroke-linejoin="round">
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                            <polyline points="15 3 21 3 21 9"/>
                            <line x1="10" y1="14" x2="21" y2="3"/>
                        </svg>
                    </a>
                </div>
            `;
        }

        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    _closePreview() {
        const modal = document.getElementById('preview-modal');
        if (!modal) return;
        modal.classList.remove('active');
        document.body.style.overflow = '';
        // Clear iframe/content to stop any media
        setTimeout(() => {
            const body = document.getElementById('preview-body');
            if (body) body.innerHTML = '';
        }, 300);
    }

    // ══════════════════════════════════════════════
    // DOWNLOAD CONFIRMATION
    // ══════════════════════════════════════════════

    _initDownloadConfirm() {
        if (document.getElementById('download-confirm')) return;

        const dialog = document.createElement('div');
        dialog.id = 'download-confirm';
        dialog.className = 'download-confirm';
        dialog.innerHTML = `
            <div class="download-confirm-overlay"></div>
            <div class="download-confirm-card">
                <div class="download-confirm-icon">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none"
                         stroke="currentColor" stroke-width="1.5"
                         stroke-linecap="round" stroke-linejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="7 10 12 15 17 10"/>
                        <line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                </div>
                <h3 class="download-confirm-title">¿Descargar archivo?</h3>
                <p class="download-confirm-filename" id="download-confirm-filename"></p>
                <div class="download-confirm-actions">
                    <button class="download-confirm-btn confirm-yes" id="download-yes">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                             stroke="currentColor" stroke-width="2.5"
                             stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="20 6 9 17 4 12"/>
                        </svg>
                        Sí, descargar
                    </button>
                    <button class="download-confirm-btn confirm-no" id="download-no">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                             stroke="currentColor" stroke-width="2.5"
                             stroke-linecap="round" stroke-linejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"/>
                            <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                        No
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(dialog);

        // Close on overlay click
        dialog.querySelector('.download-confirm-overlay').addEventListener('click', () => {
            this._closeDownloadConfirm();
        });

        // No button
        dialog.querySelector('#download-no').addEventListener('click', () => {
            this._closeDownloadConfirm();
        });

        // Yes button
        dialog.querySelector('#download-yes').addEventListener('click', () => {
            this._executeDownload();
        });

        // Close on Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && dialog.classList.contains('active')) {
                this._closeDownloadConfirm();
            }
        });
    }

    _showDownloadConfirm(url, filename) {
        const dialog = document.getElementById('download-confirm');
        if (!dialog) return;

        this._pendingDownload = { url, filename };
        dialog.querySelector('#download-confirm-filename').textContent = filename;
        dialog.classList.add('active');
    }

    _closeDownloadConfirm() {
        const dialog = document.getElementById('download-confirm');
        if (!dialog) return;
        dialog.classList.remove('active');
        this._pendingDownload = null;
    }

    _executeDownload() {
        if (!this._pendingDownload) return;

        const { url, filename } = this._pendingDownload;
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        this._closeDownloadConfirm();
    }

    // ══════════════════════════════════════════════
    // EVENT BINDING
    // ══════════════════════════════════════════════

    _bindActionButtons() {
        // Preview buttons
        document.querySelectorAll('.preview-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const url = btn.dataset.url;
                const type = btn.dataset.type;
                const title = btn.dataset.title;
                this._openPreview(url, type, title);
            });
        });

        // Download buttons
        document.querySelectorAll('.download-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const url = btn.dataset.url;
                const filename = btn.dataset.filename;
                this._showDownloadConfirm(url, filename);
            });
        });
    }
}
