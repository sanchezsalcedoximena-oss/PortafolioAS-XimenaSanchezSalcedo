// ============================================
// js/views/ParticlesView.js — Interactive Particle Background
// Creates animated particles that react to mouse movement
// ============================================

export class ParticlesView {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;

        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.mouse = { x: -1000, y: -1000 };
        this.colors = ['#ab90f0', '#8f065a', '#f1eefd', '#570c43', '#d4c4f7'];
        this.animationId = null;

        this._resizeCanvas();
        this._createParticles();
        this._bindEvents();
        this._animate();
    }

    // ── Canvas Setup ────────────────────────────

    _resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    _createParticles() {
        const count = Math.min(Math.floor(window.innerWidth * 0.07), 100);
        this.particles = [];

        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * 3 + 1,
                speedX: (Math.random() - 0.5) * 0.6,
                speedY: (Math.random() - 0.5) * 0.6,
                color: this.colors[Math.floor(Math.random() * this.colors.length)],
                opacity: Math.random() * 0.5 + 0.15,
                pulseSpeed: Math.random() * 0.02 + 0.005,
                pulsePhase: Math.random() * Math.PI * 2
            });
        }
    }

    // ── Event Binding ───────────────────────────

    _bindEvents() {
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                this._resizeCanvas();
                this._createParticles();
            }, 250);
        });

        window.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });

        window.addEventListener('mouseout', () => {
            this.mouse.x = -1000;
            this.mouse.y = -1000;
        });
    }

    // ── Animation Loop ──────────────────────────

    _animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        const time = Date.now() * 0.001;

        for (let i = 0; i < this.particles.length; i++) {
            const p = this.particles[i];

            // Mouse repulsion
            const dx = this.mouse.x - p.x;
            const dy = this.mouse.y - p.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 180) {
                const force = (180 - dist) / 180;
                p.x -= dx * force * 0.025;
                p.y -= dy * force * 0.025;
            }

            // Update position
            p.x += p.speedX;
            p.y += p.speedY;

            // Wrap boundaries
            if (p.x < -10) p.x = this.canvas.width + 10;
            if (p.x > this.canvas.width + 10) p.x = -10;
            if (p.y < -10) p.y = this.canvas.height + 10;
            if (p.y > this.canvas.height + 10) p.y = -10;

            // Pulsating size
            const pulse = Math.sin(time * p.pulseSpeed * 60 + p.pulsePhase);
            const currentSize = p.size + pulse * 0.5;

            // Draw particle
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, Math.max(0.5, currentSize), 0, Math.PI * 2);
            this.ctx.fillStyle = p.color;
            this.ctx.globalAlpha = p.opacity;
            this.ctx.fill();

            // Draw connections (only forward to avoid duplicates)
            for (let j = i + 1; j < this.particles.length; j++) {
                const q = this.particles[j];
                const cx = p.x - q.x;
                const cy = p.y - q.y;
                const cdist = Math.sqrt(cx * cx + cy * cy);

                if (cdist < 130) {
                    this.ctx.beginPath();
                    this.ctx.strokeStyle = p.color;
                    this.ctx.globalAlpha = ((130 - cdist) / 130) * 0.12;
                    this.ctx.lineWidth = 0.6;
                    this.ctx.moveTo(p.x, p.y);
                    this.ctx.lineTo(q.x, q.y);
                    this.ctx.stroke();
                }
            }
        }

        this.ctx.globalAlpha = 1;
        this.animationId = requestAnimationFrame(() => this._animate());
    }

    // ── Cleanup ─────────────────────────────────

    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }
}
