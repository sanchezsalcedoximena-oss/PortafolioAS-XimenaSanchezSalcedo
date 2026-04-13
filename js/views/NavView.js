// ============================================
// js/views/NavView.js — Navigation View
// Handles sticky nav, dropdowns, smooth scroll, scroll spy
// ============================================

export class NavView {
    constructor() {
        this.nav = document.getElementById('main-nav');
        this.mobileToggle = document.getElementById('mobile-toggle');
        this.navMenu = document.getElementById('nav-menu');
    }

    // ── Initialization ──────────────────────────

    init() {
        this._bindMobileToggle();
        this._bindDropdowns();
        this._bindSmoothScroll();
    }

    initScrollSpy() {
        this._bindScrollSpy();
    }

    // ── Mobile Menu Toggle ──────────────────────

    _bindMobileToggle() {
        if (!this.mobileToggle || !this.navMenu) return;

        this.mobileToggle.addEventListener('click', () => {
            this.navMenu.classList.toggle('active');
            this.mobileToggle.classList.toggle('active');
        });

        // Close menu on nav-link click (except dropdown toggles)
        this.navMenu.querySelectorAll('a:not(.dropdown-toggle)').forEach(link => {
            link.addEventListener('click', () => {
                this.navMenu.classList.remove('active');
                this.mobileToggle.classList.remove('active');
            });
        });
    }

    // ── Dropdown Menus ──────────────────────────

    _bindDropdowns() {
        const dropdowns = document.querySelectorAll('.nav-dropdown');

        dropdowns.forEach(dropdown => {
            const toggle = dropdown.querySelector('.dropdown-toggle');
            const menu = dropdown.querySelector('.dropdown-menu');
            if (!toggle || !menu) return;

            // Desktop: hover
            dropdown.addEventListener('mouseenter', () => {
                if (window.innerWidth > 768) {
                    menu.classList.add('show');
                }
            });

            dropdown.addEventListener('mouseleave', () => {
                if (window.innerWidth > 768) {
                    menu.classList.remove('show');
                }
            });

            // Mobile: click toggle
            toggle.addEventListener('click', (e) => {
                if (window.innerWidth <= 768) {
                    e.preventDefault();
                    menu.classList.toggle('show');

                    // Close sibling dropdowns
                    dropdowns.forEach(other => {
                        if (other !== dropdown) {
                            other.querySelector('.dropdown-menu')?.classList.remove('show');
                        }
                    });
                }
            });

            // Close dropdown on item click (mobile)
            menu.querySelectorAll('a').forEach(link => {
                link.addEventListener('click', () => {
                    if (window.innerWidth <= 768) {
                        menu.classList.remove('show');
                        this.navMenu?.classList.remove('active');
                        this.mobileToggle?.classList.remove('active');
                    }
                });
            });
        });
    }

    // ── Smooth Scrolling ────────────────────────

    _bindSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                const targetId = anchor.getAttribute('href');
                if (targetId === '#') return;

                const target = document.querySelector(targetId);
                if (target) {
                    e.preventDefault();
                    const navH = this.nav?.offsetHeight || 70;
                    const top = target.getBoundingClientRect().top
                        + window.scrollY - navH - 20;

                    window.scrollTo({ top, behavior: 'smooth' });
                }
            });
        });
    }

    // ── Scroll Spy ──────────────────────────────

    _bindScrollSpy() {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-link[href^="#"]');

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const id = entry.target.id;
                        navLinks.forEach(link => {
                            link.classList.toggle(
                                'active',
                                link.getAttribute('href') === `#${id}`
                            );
                        });
                    }
                });
            },
            { threshold: 0.2, rootMargin: '-80px 0px -40% 0px' }
        );

        sections.forEach(s => observer.observe(s));
    }

    // ── Scroll State (compact nav) ──────────────

    setScrolledState(isScrolled) {
        this.nav?.classList.toggle('scrolled', isScrolled);
    }
}
