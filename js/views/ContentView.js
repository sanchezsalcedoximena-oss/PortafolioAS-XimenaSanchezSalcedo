// ============================================
// js/views/ContentView.js — Content Display View
// Renders units & weeks for the public-facing page
// ============================================

import { APP_CONFIG } from '../config.js';

export class ContentView {
    constructor(containerSelector) {
        this.container = document.querySelector(containerSelector);
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

        return `
            <li class="content-item content-file">
                <span class="content-icon">${icon}</span>
                <a href="${href}" download="${item.file_name || item.title}"
                   class="content-link-anchor">${item.title}</a>
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
    }
}
