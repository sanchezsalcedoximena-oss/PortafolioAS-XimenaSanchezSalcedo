// ============================================
// js/app.js — Main Application Entry Point (Public Page)
// Bootstraps controllers and initialises the portfolio
// ============================================

import { NavController } from './controllers/NavController.js';
import { ContentController } from './controllers/ContentController.js';
import { ContentView } from './views/ContentView.js';
import { ParticlesView } from './views/ParticlesView.js';

class App {
    constructor() {
        this.navController = new NavController();
        this.contentView = new ContentView('#units-container');
        this.contentController = new ContentController(this.contentView);
        this.particlesView = null;
    }

    async init() {
        // 1. Navigation (static elements already in DOM)
        this.navController.init();

        // 2. Interactive particle background
        this.particlesView = new ParticlesView('particles-canvas');

        // 3. Load and render dynamic content
        await this.contentController.loadAllContent();

        // 4. Scroll spy (needs dynamic sections to exist first)
        this.navController.initScrollSpy();

        // 5. Scroll-triggered animations
        this._initScrollAnimations();
    }

    _initScrollAnimations() {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                    }
                });
            },
            { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
        );

        document.querySelectorAll(
            '.fade-in, .slide-up, .slide-left, .slide-right'
        ).forEach(el => observer.observe(el));
    }
}

// ── Bootstrap ───────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
    const app = new App();
    app.init().catch(err => console.error('App init error:', err));
});
