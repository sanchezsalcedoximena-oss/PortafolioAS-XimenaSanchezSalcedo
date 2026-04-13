// ============================================
// js/views/AdminView.js — Admin Panel View
// Handles login form, file upload UI, link management
// ============================================

export class AdminView {
    constructor() {
        this.loginSection = document.getElementById('login-section');
        this.adminSection = document.getElementById('admin-section');
        this.loginForm = document.getElementById('login-form');
        this.loginError = document.getElementById('login-error');
        this.weekSelect = document.getElementById('week-select');
        this.fileInput = document.getElementById('file-input');
        this.linkTitleInput = document.getElementById('link-title');
        this.linkUrlInput = document.getElementById('link-url');
        this.addLinkBtn = document.getElementById('add-link-btn');
        this.uploadBtn = document.getElementById('upload-btn');
        this.contentList = document.getElementById('admin-content-list');
        this.logoutBtn = document.getElementById('logout-btn');
        this.notification = document.getElementById('notification');
    }

    // ── View Toggles ────────────────────────────

    showLoginForm() {
        if (this.loginSection) this.loginSection.style.display = 'flex';
        if (this.adminSection) this.adminSection.style.display = 'none';
    }

    showAdminPanel() {
        if (this.loginSection) this.loginSection.style.display = 'none';
        if (this.adminSection) this.adminSection.style.display = 'block';
    }

    // ── Login Helpers ───────────────────────────

    showLoginError(msg) {
        if (this.loginError) {
            this.loginError.textContent = msg;
            this.loginError.style.display = 'block';
        }
    }

    hideLoginError() {
        if (this.loginError) this.loginError.style.display = 'none';
    }

    getLoginCredentials() {
        return {
            email: document.getElementById('login-email')?.value || '',
            password: document.getElementById('login-password')?.value || ''
        };
    }

    // ── Data Getters ────────────────────────────

    getSelectedWeek() {
        return this.weekSelect?.value || '1';
    }

    getFiles() {
        return this.fileInput?.files || [];
    }

    getLinkData() {
        return {
            title: this.linkTitleInput?.value || '',
            url: this.linkUrlInput?.value || ''
        };
    }

    // ── Input Clearing ──────────────────────────

    clearLinkInputs() {
        if (this.linkTitleInput) this.linkTitleInput.value = '';
        if (this.linkUrlInput) this.linkUrlInput.value = '';
    }

    clearFileInput() {
        if (this.fileInput) this.fileInput.value = '';
        // Reset upload area text
        const area = document.getElementById('upload-area');
        if (area) {
            const textEl = area.querySelector('.upload-text');
            if (textEl) {
                textEl.innerHTML =
                    'Arrastra archivos aquí o <strong>haz clic para seleccionar</strong>';
            }
        }
    }

    // ── Content List Rendering ──────────────────

    renderContentList(content, onDelete) {
        if (!this.contentList) return;

        if (!content.length) {
            this.contentList.innerHTML =
                '<p class="admin-empty">No hay contenido para esta semana</p>';
            return;
        }

        this.contentList.innerHTML = content.map(item => `
            <div class="admin-content-item" data-id="${item.id}">
                <div class="admin-content-info">
                    <span class="admin-content-icon">
                        ${item.type === 'link' ? '🔗' : '📁'}
                    </span>
                    <span class="admin-content-title">${item.title}</span>
                    <span class="admin-content-type">
                        ${item.type === 'link' ? 'Enlace' : 'Archivo'}
                    </span>
                </div>
                <button class="admin-delete-btn" data-id="${item.id}"
                        title="Eliminar">✕</button>
            </div>
        `).join('');

        // Bind delete buttons
        this.contentList.querySelectorAll('.admin-delete-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                if (confirm('¿Estás seguro de eliminar este recurso?')) {
                    onDelete(btn.dataset.id);
                }
            });
        });
    }

    // ── Notifications ───────────────────────────

    showNotification(message, type = 'success') {
        if (!this.notification) return;

        this.notification.textContent = message;
        this.notification.className = `notification ${type} show`;

        clearTimeout(this._notifTimeout);
        this._notifTimeout = setTimeout(() => {
            this.notification.classList.remove('show');
        }, 3000);
    }

    // ── Event Binding ───────────────────────────

    bindLoginForm(cb) {
        this.loginForm?.addEventListener('submit', (e) => {
            e.preventDefault();
            cb();
        });
    }

    bindUploadBtn(cb) {
        this.uploadBtn?.addEventListener('click', cb);
    }

    bindAddLinkBtn(cb) {
        this.addLinkBtn?.addEventListener('click', cb);
    }

    bindWeekChange(cb) {
        this.weekSelect?.addEventListener('change', cb);
    }

    bindLogout(cb) {
        this.logoutBtn?.addEventListener('click', cb);
    }

    // ── Loading State ───────────────────────────

    setLoading(element, loading) {
        if (!element) return;
        element.disabled = loading;
        if (loading) {
            element.dataset.originalText = element.textContent;
            element.textContent = 'Cargando...';
        } else {
            element.textContent = element.dataset.originalText || element.textContent;
        }
    }
}
