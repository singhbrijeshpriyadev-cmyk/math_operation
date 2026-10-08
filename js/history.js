/**
 * OG - Calculation History Manager & Interactive View
 * Premium Liquid Glass interface for reviewing, searching, filtering,
 * copying, reopening, and managing calculation history.
 *
 * Privacy & Security:
 * Strictly stores only calculation inputs, outputs, module context, and timestamps.
 * No personal or tracking data is stored.
 *
 * ES6 Module
 */

import { store } from './state.js';
import { copyToClipboard, showToast, SVG_ICONS } from './utils.js';

// SVG Icons tailored for history actions
const ICONS = {
  reopen: `<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 4v6h6"></path><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path></svg>`,
  clock: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`,
  calc: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="2" width="16" height="20" rx="2"></rect><line x1="8" y1="6" x2="16" y2="6"></line><line x1="16" y1="14" x2="16" y2="18"></line><path d="M8 10h.01M12 10h.01M16 10h.01M8 14h.01M12 14h.01M8 18h.01M12 18h.01"></path></svg>`,
  close: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`,
  filter: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>`,
  alert: `<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`
};

/**
 * Returns specific CSS badge classes for modules
 */
export function getModuleTagClass(moduleName = '') {
  const norm = String(moduleName).toLowerCase();
  if (norm.includes('scientific') || norm.includes('calc')) return 'tag-calculator';
  if (norm.includes('trig')) return 'tag-trigonometry';
  if (norm.includes('matrix') || norm.includes('determinant')) return 'tag-matrices';
  if (norm.includes('limit') || norm.includes('derivative') || norm.includes('integral') || norm.includes('continuity') || norm.includes('differential')) return 'tag-calculus';
  if (norm.includes('probability') || norm.includes('stat')) return 'tag-probability';
  if (norm.includes('line') || norm.includes('conic') || norm.includes('3d') || norm.includes('vector')) return 'tag-geometry';
  return 'tag-algebra';
}

/**
 * Reopens a calculation by populating state and navigating to originating module or calculator
 */
export function reopenCalculation(item) {
  if (!item) return;

  const targetModuleId = item.moduleId || store.resolveModuleSlug(item.module);

  // Update calculator state so expression is ready
  store.setExpression(item.expression);
  store.setResult(item.result);

  // Save in sessionStorage for context transfer across modules
  try {
    sessionStorage.setItem('og_reopened_calc', JSON.stringify({
      id: item.id,
      module: item.module,
      moduleId: targetModuleId,
      expression: item.expression,
      result: item.result,
      timestamp: Date.now()
    }));
  } catch (e) {
    // ignore sessionStorage errors in private mode
  }

  if (!targetModuleId || targetModuleId === 'calculator') {
    window.location.hash = '#/calculator';
    showToast(`Loaded expression into Scientific Calculator`, 'success');
  } else {
    window.location.hash = `#/modules/${targetModuleId}`;
    showToast(`Reopened in ${item.module}`, 'success');
  }
}

/**
 * Full Interactive Liquid Glass History View Component
 */
export class HistoryView {
  constructor(container) {
    this.container = typeof container === 'string' ? document.querySelector(container) : container;
    this.searchQuery = '';
    this.activeModuleFilter = 'all'; // 'all' or specific module name
    this.showClearConfirmModal = false;
    this.unsubscribe = null;
  }

  mount() {
    this.unsubscribe = store.subscribe(() => {
      // Re-render when store updates if view is still active
      if (document.body.contains(this.container)) {
        this.render();
        this.attachEventListeners();
      }
    });

    this.render();
    this.attachEventListeners();
  }

  destroy() {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
  }

  getFilteredHistory() {
    const history = store.getState().history || [];
    const q = this.searchQuery.trim().toLowerCase();

    return history.filter(item => {
      // Module filter
      if (this.activeModuleFilter !== 'all' && item.module !== this.activeModuleFilter) {
        return false;
      }

      // Search filter across expression, result, module, and timestamp
      if (q) {
        const expr = String(item.expression || '').toLowerCase();
        const res = String(item.result || '').toLowerCase();
        const mod = String(item.module || '').toLowerCase();
        const time = String(item.timestamp || '').toLowerCase();
        if (!expr.includes(q) && !res.includes(q) && !mod.includes(q) && !time.includes(q)) {
          return false;
        }
      }

      return true;
    });
  }

  render() {
    if (!this.container) return;

    const allHistory = store.getState().history || [];
    const filteredHistory = this.getFilteredHistory();

    // Collect unique modules present in history
    const moduleCounts = new Map();
    allHistory.forEach(item => {
      const mod = item.module || 'Scientific Calculator';
      moduleCounts.set(mod, (moduleCounts.get(mod) || 0) + 1);
    });

    // If completely empty history (no items ever or cleared)
    if (allHistory.length === 0) {
      this.container.innerHTML = `
        <div class="history-view-container view-animate-in">
          <div class="history-header">
            <div class="history-header-titles">
              <h2><span>Calculation History</span></h2>
              <p>Review, search, replay, and manage previous mathematical computations</p>
            </div>
          </div>

          <div class="history-empty-container">
            <div class="history-empty-icon">∿</div>
            <h3 class="history-empty-title">No Calculations Recorded Yet</h3>
            <p class="history-empty-desc">
              Your calculations from the Scientific Calculator and all 24 mathematics modules
              are securely saved in your browser's local storage for instant retrieval.
            </p>
            <div class="history-empty-actions">
              <a href="#/calculator" class="glass-btn glass-btn-primary">
                <span>Open Scientific Calculator</span>
                ${SVG_ICONS.arrowRight}
              </a>
              <a href="#/modules" class="glass-btn glass-btn-outline">
                <span>Explore Mathematics Modules</span>
              </a>
            </div>
          </div>
        </div>
      `;
      return;
    }

    // Build module filter chips HTML
    const chipsHtml = [
      `
      <button class="history-filter-chip ${this.activeModuleFilter === 'all' ? 'active' : ''}" data-history-filter="all">
        <span>All Modules</span>
        <span class="history-chip-count">${allHistory.length}</span>
      </button>
      `
    ];

    moduleCounts.forEach((count, modName) => {
      chipsHtml.push(`
        <button class="history-filter-chip ${this.activeModuleFilter === modName ? 'active' : ''}" data-history-filter="${modName}">
          <span>${modName}</span>
          <span class="history-chip-count">${count}</span>
        </button>
      `);
    });

    // Build items HTML or empty search results
    let itemsListHtml = '';
    if (filteredHistory.length === 0) {
      itemsListHtml = `
        <div class="history-empty-container" style="padding: 50px 20px;">
          <div class="history-empty-icon" style="width: 54px; height: 54px; font-size: 1.5rem;">${SVG_ICONS.search}</div>
          <h4 class="history-empty-title" style="font-size: 1.25rem;">No Matching Calculations Found</h4>
          <p class="history-empty-desc">
            No history entries match "${this.searchQuery}" in ${this.activeModuleFilter === 'all' ? 'any module' : this.activeModuleFilter}.
          </p>
          <button class="glass-btn glass-btn-primary" id="btn-reset-history-filters">
            <span>Reset Search & Filters</span>
          </button>
        </div>
      `;
    } else {
      itemsListHtml = `
        <div class="history-cards-list">
          ${filteredHistory.map(item => this.renderHistoryCard(item)).join('')}
        </div>
      `;
    }

    // Modal HTML if confirm clear is triggered
    const modalHtml = this.showClearConfirmModal ? `
      <div class="history-modal-overlay" id="history-clear-modal">
        <div class="history-modal-content">
          <div class="history-modal-icon">${ICONS.alert}</div>
          <h3 class="history-modal-title">Clear Calculation History?</h3>
          <p class="history-modal-desc">
            This will permanently erase all <strong>${allHistory.length}</strong> recorded calculation entries from your local browser storage. This action cannot be undone.
          </p>
          <div class="history-modal-buttons">
            <button class="glass-btn glass-btn-outline" id="btn-cancel-clear-history">Cancel</button>
            <button class="glass-btn glass-btn-primary" id="btn-confirm-clear-history" style="background: rgba(244, 63, 94, 0.35); border-color: rgba(244, 63, 94, 0.6); color: #fff;">
              ${SVG_ICONS.trash}
              <span>Clear All History</span>
            </button>
          </div>
        </div>
      </div>
    ` : '';

    this.container.innerHTML = `
      <div class="history-view-container view-animate-in">
        <!-- Header -->
        <div class="history-header">
          <div class="history-header-titles">
            <h2><span>Calculation History</span></h2>
            <p>Review, search, replay, and manage previous mathematical computations</p>
          </div>
          <div class="history-header-actions">
            <button id="btn-trigger-clear-history" class="glass-btn glass-btn-outline" style="color: var(--rose-primary); border-color: rgba(244, 63, 94, 0.35);" title="Clear all calculations from storage">
              ${SVG_ICONS.trash}
              <span>Clear All</span>
            </button>
          </div>
        </div>

        <!-- Stats Ribbon -->
        <div class="history-stats-bar">
          <div class="history-stat-badge">
            <span>Total Calculations:</span>
            <strong>${allHistory.length}</strong>
          </div>
          <div class="history-stat-badge">
            <span>Modules Used:</span>
            <strong>${moduleCounts.size}</strong>
          </div>
          ${filteredHistory.length !== allHistory.length ? `
            <div class="history-stat-badge" style="border-color: rgba(0, 242, 254, 0.3);">
              <span>Showing Matches:</span>
              <strong style="color: var(--cyan-primary);">${filteredHistory.length}</strong>
            </div>
          ` : ''}
          <div class="history-stat-badge" style="margin-left: auto;">
            <span style="display: flex; align-items: center; gap: 6px;">${ICONS.clock} <span>Last:</span></span>
            <strong style="color: var(--text-secondary);">${allHistory[0] ? allHistory[0].timestamp : 'None'}</strong>
          </div>
        </div>

        <!-- Search & Filter Panel -->
        <div class="history-toolbar-panel">
          <div class="history-search-row">
            <span class="history-search-icon">${SVG_ICONS.search}</span>
            <input
              type="text"
              id="history-search-input"
              class="history-search-input"
              placeholder="Search history by expression, result, module, or time..."
              value="${this.searchQuery}"
              autocomplete="off"
              spellcheck="false"
            />
            <button id="btn-clear-history-search" class="history-search-clear-btn" style="display: ${this.searchQuery ? 'flex' : 'none'};" title="Clear search" aria-label="Clear search">
              ${ICONS.close}
            </button>
          </div>

          <div class="history-filters-row">
            ${chipsHtml.join('')}
          </div>
        </div>

        <!-- Calculation Cards -->
        <div id="history-items-container">
          ${itemsListHtml}
        </div>

        ${modalHtml}
      </div>
    `;
  }

  renderHistoryCard(item) {
    const tagClass = getModuleTagClass(item.module);
    const targetModuleId = item.moduleId || store.resolveModuleSlug(item.module);
    const isGenericCalc = (!targetModuleId || targetModuleId === 'calculator');

    return `
      <div class="history-item-card" data-card-id="${item.id}">
        <!-- Top row: Module Pill & Timestamp -->
        <div class="history-card-header">
          <span class="history-module-tag ${tagClass}">
            <span>${item.module || 'Scientific Calculator'}</span>
          </span>
          <span class="history-timestamp">
            ${ICONS.clock}
            <span>${item.timestamp}</span>
          </span>
        </div>

        <!-- Middle row: Expression & Glowing Result -->
        <div class="history-card-body">
          <div class="history-expr-box">
            <div class="history-expr-text">${item.expression}</div>
          </div>
          <div class="history-result-box" title="Calculated result">
            <span class="history-result-equal">=</span>
            <span class="history-result-val">${item.result}</span>
          </div>
        </div>

        <!-- Bottom row: Interactive Actions Toolbar -->
        <div class="history-card-footer">
          <div class="history-card-actions-left">
            <!-- Copy Result Action -->
            <button class="history-btn-action" data-copy-result="${item.result}" title="Copy result to clipboard">
              ${SVG_ICONS.copy}
              <span>Copy Result</span>
            </button>

            <!-- Copy Expression Action -->
            <button class="history-btn-action" data-copy-expr="${item.expression}" title="Copy expression to clipboard">
              <span>Copy Expression</span>
            </button>
          </div>

          <div class="history-card-actions-right">
            <!-- Reopen Calculation Action -->
            <button class="history-btn-action history-btn-reopen" data-reopen-id="${item.id}" title="Reopen this calculation in its originating workspace">
              ${ICONS.reopen}
              <span>Reopen ${isGenericCalc ? 'in Calculator' : item.module}</span>
            </button>

            ${!isGenericCalc ? `
              <!-- Also allow opening in general Scientific Calculator -->
              <button class="history-btn-action" data-open-calc-expr="${item.expression}" title="Open expression in Scientific Calculator">
                ${ICONS.calc}
                <span>Open in Calc</span>
              </button>
            ` : ''}

            <!-- Delete Individual Item Action -->
            <button class="history-btn-action history-btn-delete" data-delete-id="${item.id}" title="Delete this calculation from history" aria-label="Delete calculation">
              ${SVG_ICONS.trash}
              <span>Delete</span>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  attachEventListeners() {
    if (!this.container) return;

    // Search input typing
    const searchInput = document.getElementById('history-search-input');
    const clearSearchBtn = document.getElementById('btn-clear-history-search');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value;
        if (clearSearchBtn) {
          clearSearchBtn.style.display = this.searchQuery ? 'flex' : 'none';
        }
        this.updateCardsOnly();
      });
      // Retain focus position if freshly rendered
      if (this.searchQuery) {
        searchInput.focus();
        searchInput.setSelectionRange(searchInput.value.length, searchInput.value.length);
      }
    }

    // Clear search button
    if (clearSearchBtn) {
      clearSearchBtn.addEventListener('click', () => {
        this.searchQuery = '';
        this.render();
        this.attachEventListeners();
        const input = document.getElementById('history-search-input');
        if (input) input.focus();
      });
    }

    // Reset filters button
    const resetFiltersBtn = document.getElementById('btn-reset-history-filters');
    if (resetFiltersBtn) {
      resetFiltersBtn.addEventListener('click', () => {
        this.searchQuery = '';
        this.activeModuleFilter = 'all';
        this.render();
        this.attachEventListeners();
      });
    }

    // Filter chips click
    this.container.querySelectorAll('[data-history-filter]').forEach(chip => {
      chip.addEventListener('click', () => {
        const mod = chip.getAttribute('data-history-filter');
        if (mod && mod !== this.activeModuleFilter) {
          this.activeModuleFilter = mod;
          this.render();
          this.attachEventListeners();
        }
      });
    });

    // Copy Result clicks
    this.container.querySelectorAll('[data-copy-result]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const res = btn.getAttribute('data-copy-result');
        if (res !== null) {
          copyToClipboard(res, `Result "${res}" copied!`);
        }
      });
    });

    // Copy Expression clicks
    this.container.querySelectorAll('[data-copy-expr]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const expr = btn.getAttribute('data-copy-expr');
        if (expr !== null) {
          copyToClipboard(expr, `Expression "${expr}" copied!`);
        }
      });
    });

    // Reopen Calculation clicks
    this.container.querySelectorAll('[data-reopen-id]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-reopen-id');
        const history = store.getState().history || [];
        const item = history.find(h => String(h.id) === String(id));
        if (item) {
          reopenCalculation(item);
        }
      });
    });

    // Open expression in general Scientific Calculator
    this.container.querySelectorAll('[data-open-calc-expr]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const expr = btn.getAttribute('data-open-calc-expr');
        if (expr) {
          store.setExpression(expr);
          window.location.hash = '#/calculator';
          showToast(`Loaded expression into Scientific Calculator`, 'success');
        }
      });
    });

    // Delete Individual Item clicks
    this.container.querySelectorAll('[data-delete-id]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-delete-id');
        if (id) {
          const success = store.deleteHistoryItem(id);
          if (success) {
            showToast('Calculation removed from history', 'info');
            this.render();
            this.attachEventListeners();
          }
        }
      });
    });

    // Trigger Clear All History Modal
    const triggerClearBtn = document.getElementById('btn-trigger-clear-history');
    if (triggerClearBtn) {
      triggerClearBtn.addEventListener('click', () => {
        this.showClearConfirmModal = true;
        this.render();
        this.attachEventListeners();
      });
    }

    // Cancel Clear Modal
    const cancelClearBtn = document.getElementById('btn-cancel-clear-history');
    if (cancelClearBtn) {
      cancelClearBtn.addEventListener('click', () => {
        this.showClearConfirmModal = false;
        this.render();
        this.attachEventListeners();
      });
    }

    // Confirm Clear All History
    const confirmClearBtn = document.getElementById('btn-confirm-clear-history');
    if (confirmClearBtn) {
      confirmClearBtn.addEventListener('click', () => {
        store.clearHistory();
        this.showClearConfirmModal = false;
        showToast('All calculation history cleared', 'info');
        this.render();
        this.attachEventListeners();
      });
    }
  }

  updateCardsOnly() {
    const container = document.getElementById('history-items-container');
    if (!container) {
      this.render();
      this.attachEventListeners();
      return;
    }

    const filteredHistory = this.getFilteredHistory();
    if (filteredHistory.length === 0) {
      container.innerHTML = `
        <div class="history-empty-container" style="padding: 50px 20px;">
          <div class="history-empty-icon" style="width: 54px; height: 54px; font-size: 1.5rem;">${SVG_ICONS.search}</div>
          <h4 class="history-empty-title" style="font-size: 1.25rem;">No Matching Calculations Found</h4>
          <p class="history-empty-desc">
            No history entries match "${this.searchQuery}" in ${this.activeModuleFilter === 'all' ? 'any module' : this.activeModuleFilter}.
          </p>
          <button class="glass-btn glass-btn-primary" id="btn-reset-history-filters">
            <span>Reset Search & Filters</span>
          </button>
        </div>
      `;
    } else {
      container.innerHTML = `
        <div class="history-cards-list">
          ${filteredHistory.map(item => this.renderHistoryCard(item)).join('')}
        </div>
      `;
    }

    // Reattach card action listeners without losing search input focus
    this.attachCardEventListeners();
  }

  attachCardEventListeners() {
    // Reset filters button in empty card state
    const resetFiltersBtn = document.getElementById('btn-reset-history-filters');
    if (resetFiltersBtn) {
      resetFiltersBtn.addEventListener('click', () => {
        this.searchQuery = '';
        this.activeModuleFilter = 'all';
        this.render();
        this.attachEventListeners();
      });
    }

    // Copy Result
    this.container.querySelectorAll('[data-copy-result]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const res = btn.getAttribute('data-copy-result');
        if (res !== null) {
          copyToClipboard(res, `Result "${res}" copied!`);
        }
      });
    });

    // Copy Expr
    this.container.querySelectorAll('[data-copy-expr]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const expr = btn.getAttribute('data-copy-expr');
        if (expr !== null) {
          copyToClipboard(expr, `Expression "${expr}" copied!`);
        }
      });
    });

    // Reopen
    this.container.querySelectorAll('[data-reopen-id]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-reopen-id');
        const history = store.getState().history || [];
        const item = history.find(h => String(h.id) === String(id));
        if (item) {
          reopenCalculation(item);
        }
      });
    });

    // Open in Calc
    this.container.querySelectorAll('[data-open-calc-expr]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const expr = btn.getAttribute('data-open-calc-expr');
        if (expr) {
          store.setExpression(expr);
          window.location.hash = '#/calculator';
          showToast(`Loaded expression into Scientific Calculator`, 'success');
        }
      });
    });

    // Delete Item
    this.container.querySelectorAll('[data-delete-id]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-delete-id');
        if (id) {
          const success = store.deleteHistoryItem(id);
          if (success) {
            showToast('Calculation removed from history', 'info');
            this.render();
            this.attachEventListeners();
          }
        }
      });
    });
  }
}

/**
 * Functional backward-compatibility exports
 */
let activeHistoryInstance = null;

export function renderHistoryView() {
  const dummyDiv = document.createElement('div');
  const tempView = new HistoryView(dummyDiv);
  tempView.render();
  return dummyDiv.innerHTML;
}

export function attachHistoryListeners() {
  const container = document.getElementById('app') || document.querySelector('.history-view-container');
  if (container) {
    if (activeHistoryInstance) {
      activeHistoryInstance.destroy();
    }
    activeHistoryInstance = new HistoryView(container);
    activeHistoryInstance.attachEventListeners();
  }
}
