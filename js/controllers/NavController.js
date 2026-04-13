// ============================================
// js/controllers/NavController.js — Navigation Controller
// Initialises nav, handles scroll-triggered state
// ============================================

import { NavView } from '../views/NavView.js';

export class NavController {
    constructor() {
        this.view = new NavView();
    }

    init() {
        this.view.init();
        this._bindScrollHandler();
    }

    initScrollSpy() {
        this.view.initScrollSpy();
    }

    _bindScrollHandler() {
        let ticking = false;

        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    this.view.setScrolledState(window.scrollY > 50);
                    ticking = false;
                });
                ticking = true;
            }
        });
    }
}
