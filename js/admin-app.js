// ============================================
// js/admin-app.js — Admin Application Entry Point
// Bootstraps auth, content management & upload UI
// ============================================

import { AuthController } from './controllers/AuthController.js';
import { ContentController } from './controllers/ContentController.js';
import { AdminView } from './views/AdminView.js';
import { ParticlesView } from './views/ParticlesView.js';

class AdminApp {
    constructor() {
        this.adminView = new AdminView();
        this.authController = new AuthController(this.adminView);
        this.contentController = new ContentController(null, this.adminView);
        this._panelInitialised = false;
    }

    async init() {
        // Background particles
        new ParticlesView('particles-canvas');

        // Auth state callback
        this.authController.onAuthChange((authenticated) => {
            if (authenticated && !this._panelInitialised) {
                this._initAdminPanel();
            }
        });

        // Check existing session
        const isAuth = await this.authController.init();

        if (isAuth && !this._panelInitialised) {
            this._initAdminPanel();
        }
    }

    _initAdminPanel() {
        this._panelInitialised = true;

        // Set up upload area interactions
        this._initUploadArea();

        // Load content for default week
        const week = this.adminView.getSelectedWeek();
        this.contentController.loadWeekContent(week);

        // Bind week selector
        this.adminView.bindWeekChange(() => {
            const w = this.adminView.getSelectedWeek();
            this.contentController.loadWeekContent(w);
        });

        // Bind file upload
        this.adminView.bindUploadBtn(async () => {
            const w = this.adminView.getSelectedWeek();
            const files = Array.from(this.adminView.getFiles());
            await this.contentController.handleFileUpload(w, files);
        });

        // Bind link addition
        this.adminView.bindAddLinkBtn(async () => {
            const w = this.adminView.getSelectedWeek();
            const { title, url } = this.adminView.getLinkData();
            await this.contentController.handleAddLink(w, title, url);
        });
    }

    _initUploadArea() {
        const uploadArea = document.getElementById('upload-area');
        const fileInput = document.getElementById('file-input');

        if (!uploadArea || !fileInput) return;

        // Click to open file picker
        uploadArea.addEventListener('click', () => fileInput.click());

        // Drag & drop
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('drag-over');
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('drag-over');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('drag-over');
            fileInput.files = e.dataTransfer.files;
            this._updateUploadAreaText(fileInput.files);
        });

        // File input change
        fileInput.addEventListener('change', () => {
            this._updateUploadAreaText(fileInput.files);
        });
    }

    _updateUploadAreaText(files) {
        const area = document.getElementById('upload-area');
        if (!area || !files?.length) return;

        const textEl = area.querySelector('.upload-text');
        if (!textEl) return;

        const label = files.length === 1
            ? `📎 ${files[0].name}`
            : `📎 ${files.length} archivos seleccionados`;

        textEl.innerHTML = `<strong>${label}</strong>`;
    }
}

// ── Bootstrap ───────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
    const app = new AdminApp();
    app.init().catch(err => console.error('Admin init error:', err));
});
