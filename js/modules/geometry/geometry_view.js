/**
 * OG - Coordinate Geometry Dashboard & Workspace View
 * Visual identity: Ivory (#E8E0D2), Gold (#B89A5A), Deep Atlas Navy (#0E1D61)
 * Liquid Glass Design
 *
 * Provides:
 * - Header: COORDINATE GEOMETRY "Plot • Analyze • Explore"
 * - Universal Input Bar: [ A(2,3)   B(6,7) ] [ Analyze ]
 * - Quick Tools: Distance, Midpoint, Slope, Line Equation, Circle, Parabola, Ellipse, Hyperbola, etc.
 * - Side-by-side Coordinate Plane & Properties Panel
 * - Dedicated Conic Analyzer Section with live Conic Canvas, parameters table & step-by-step
 * - Curriculum Modules & Advanced Tools Navigation Grid
 * ES6 Module
 */

import { store } from '../../state.js';
import { copyToClipboard, showToast, SVG_ICONS } from '../../utils.js';
import { CoordinateGeometryMathEngine } from '../../math/geometry.js';
import { CoordinatePlaneVisualizer } from './coordinate_plane.js';

const CURRICULUM_MODULES = [
  { id: 'straight-lines',    num: '09', title: 'Straight Lines',      icon: '╱',    desc: 'Slope, forms of equations, parallel & perpendicular lines', href: '#/modules/straight-lines' },
  { id: 'conic-sections',    num: '10', title: 'Conic Sections',      icon: '◯',    desc: 'Circles, parabolas, ellipses, hyperbolas and eccentricity', href: '#/modules/conic-sections' },
  { id: 'intro-3d-geometry', num: '11', title: '3D Geometry',         icon: '◰',    desc: 'Spatial coordinates, 3D distance, section formula, planes', href: '#/modules/intro-3d-geometry' },
];

const ADVANCED_TOOLS = [
  { id: 'plane',    icon: '∿',  title: 'Coordinate Plane', desc: 'Interactive 2D Cartesian plane with probe' },
  { id: 'points',   icon: '•',  title: 'Point Calculator', desc: 'Distance, midpoint, section, slope & triangle' },
  { id: 'lines',    icon: '╱',  title: 'Line Analyzer',    desc: 'Intercepts, angle, distance & line pairs' },
  { id: 'circle',   icon: '◯',  title: 'Circle Analyzer',  desc: 'Center, radius, diameter, intercepts & tangents' },
  { id: 'conics',   icon: '⌓',  title: 'Conic Analyzer',   desc: 'Parabola, ellipse, hyperbola & general conic' },
  { id: '3d',       icon: '◰',  title: '3D Geometry',      desc: '3D points, distance, vectors, lines & planes' },
];

export class CoordinateGeometryView {
  constructor(container) {
    this.container = typeof container === 'string' ? document.querySelector(container) : container;
    this.planeVisualizer = null;
    this.conicVisualizer = null;
    this.currentInput = 'A(2,3)   B(6,7)';
    this.activeConicPreset = 'ellipse';
    this.currentPropertiesData = null;
    this.currentConicData = null;
    this._listeners = [];
  }

  mount() {
    this.render();
    this.initVisualizers();
    this._attachListeners();
    // Run initial analysis for both the primary workspace and conic analyzer
    this.analyzeCurrentInput();
    this.updateConicSection('ellipse');
  }

  destroy() {
    this._listeners.forEach(({ el, evt, fn }) => el.removeEventListener(evt, fn));
    this._listeners = [];
    this.planeVisualizer = null;
    this.conicVisualizer = null;
  }

  _on(el, evt, fn) {
    if (!el) return;
    el.addEventListener(evt, fn);
    this._listeners.push({ el, evt, fn });
  }

  render() {
    const recentHistory = store.getState().history.filter(h =>
      ['Geometry', 'Lines', 'Conics', 'Circle', 'Parabola', 'Ellipse', '3D', 'Distance'].some(k => (h.module || '').includes(k))
    ).slice(0, 4);

    this.container.innerHTML = `
      <div class="geom-workspace view-animate-in">

        <!-- ── HEADER ── -->
        <div class="geom-header" style="text-align: center; justify-content: center; flex-direction: column; align-items: center; margin-bottom: 32px;">
          <div class="geom-badge" style="margin-bottom: 8px;">
            <span class="geom-badge-dot"></span>
            COORDINATE GEOMETRY WORKSPACE
          </div>
          <h1 class="geom-title" style="letter-spacing: 0.04em;">COORDINATE GEOMETRY</h1>
          <p class="geom-subtitle" style="font-size: 1.15rem; color: #B89A5A; font-weight: 600; letter-spacing: 0.05em;">
            Plot • Analyze • Explore
          </p>
        </div>

        <!-- ── UNIVERSAL INPUT BAR ── -->
        <div class="geom-unified-bar-box">
          <input
            type="text"
            id="geom-main-input"
            class="geom-unified-input"
            value="A(2,3)   B(6,7)"
            placeholder="e.g. A(2,3)   B(6,7)  or  y = 2x + 3  or  x² + y² = 25"
            autocomplete="off"
            spellcheck="false"
          />
          <button class="geom-unified-analyze-btn" id="geom-btn-analyze">
            Analyze
          </button>
        </div>

        <!-- ── QUICK TOOLS ── -->
        <div class="geom-section-label-caps">QUICK TOOLS</div>
        <div class="geom-quick-bar" role="navigation" style="margin-bottom: 28px;">
          <button class="geom-quick-pill" data-quick="distance">Distance</button>
          <button class="geom-quick-pill" data-quick="midpoint">Midpoint</button>
          <button class="geom-quick-pill" data-quick="slope">Slope</button>
          <button class="geom-quick-pill" data-quick="line">Line Equation</button>
          <button class="geom-quick-pill" data-quick="circle">Circle</button>
          <button class="geom-quick-pill" data-quick="parabola">Parabola</button>
          <button class="geom-quick-pill" data-quick="ellipse">Ellipse</button>
          <button class="geom-quick-pill" data-quick="hyperbola">Hyperbola</button>
          <button class="geom-quick-pill" data-quick="triangle">Triangle</button>
          <button class="geom-quick-pill" data-quick="3d-dist">3D Distance</button>
        </div>

        <!-- ── MAIN SPLIT: COORDINATE PLANE + PROPERTIES ── -->
        <div class="geom-workspace-split">
          <!-- Left: COORDINATE PLANE -->
          <div class="geom-canvas-card">
            <div class="geom-canvas-toolbar">
              <span class="geom-canvas-title">COORDINATE PLANE</span>
              <div class="geom-canvas-toolbar-group">
                <span class="geom-coord-badge" id="geom-cursor-coords">X: 0.00, Y: 0.00</span>
                <button class="geom-icon-btn" id="canvas-zoom-in" title="Zoom In">+</button>
                <button class="geom-icon-btn" id="canvas-zoom-out" title="Zoom Out">−</button>
                <button class="geom-icon-btn" id="canvas-reset" title="Reset View">⟲ Reset</button>
                <button class="geom-icon-btn" id="canvas-toggle-measure" title="Toggle Measurement Mode">📏 Measure</button>
                <button class="geom-icon-btn" id="canvas-clear-pts" title="Clear All Points">🗑️</button>
              </div>
            </div>
            <div class="geom-canvas-wrapper" style="height: 440px;">
              <canvas id="geom-coordinate-canvas" class="geom-interactive-canvas"></canvas>
              <div class="geom-canvas-hint">Drag points A & B to recalculate live • Scroll to zoom • Drag background to pan</div>
            </div>
            <!-- Measurement probe banner -->
            <div class="geom-measure-box" id="geom-measure-box" style="display:none; margin: 12px 16px 16px 16px;">
              <div class="geom-measure-title">Measurement Probe</div>
              <div class="geom-measure-data" id="geom-measure-data">Select two points on the plane</div>
            </div>
          </div>

          <!-- Right: PROPERTIES -->
          <div class="geom-properties-card">
            <div>
              <div class="geom-card-header">
                <h3 class="geom-card-title">PROPERTIES</h3>
                <span class="geom-badge-status active" id="geom-prop-badge">Active Analysis</span>
              </div>

              <!-- Main Properties List -->
              <div class="geom-prop-metric-list" id="geom-prop-metrics">
                <div class="geom-prop-row">
                  <span class="geom-prop-label">Distance</span>
                  <span class="geom-prop-val" id="prop-val-distance">4√2 <span class="geom-prop-subval">(≈ 5.657)</span></span>
                </div>
                <div class="geom-prop-row">
                  <span class="geom-prop-label">Midpoint</span>
                  <span class="geom-prop-val" id="prop-val-midpoint">(4, 5)</span>
                </div>
                <div class="geom-prop-row">
                  <span class="geom-prop-label">Slope</span>
                  <span class="geom-prop-val" id="prop-val-slope">1</span>
                </div>
                <div class="geom-prop-row">
                  <span class="geom-prop-label">Line Equation</span>
                  <span class="geom-prop-val" id="prop-val-line">y = x + 1</span>
                </div>
              </div>

              <!-- Additional details container -->
              <div id="geom-prop-extras" style="margin-bottom: 12px;"></div>
            </div>

            <div>
              <div class="geom-btn-row">
                <button class="geom-btn-sm primary" id="btn-prop-show-steps">[Show Steps]</button>
                <button class="geom-btn-sm" id="btn-prop-formula">[Formula]</button>
                <button class="geom-btn-sm" id="btn-prop-copy">[Copy]</button>
                <button class="geom-btn-sm" id="btn-prop-save">[Save]</button>
              </div>

              <!-- Collapsible steps breakdown -->
              <div id="geom-prop-steps-accordion" class="geom-steps-accordion" style="display:none; margin-top: 14px; max-height: 200px; overflow-y: auto;">
              </div>
            </div>
          </div>
        </div>

        <!-- ── CONIC ANALYZER SECTION ── -->
        <div class="geom-conic-analyzer-section">
          <div class="geom-card-header">
            <div>
              <div class="geom-section-label-caps" style="margin-bottom: 4px;">CONIC ANALYZER</div>
              <h2 style="font-size: 1.6rem; font-weight: 800; color: #0E1D61; margin: 0;">Conic Sections Exploration</h2>
            </div>
            <!-- Preset switcher pills -->
            <div class="geom-sub-nav-tabs">
              <button class="geom-sub-tab-btn active" data-conic-tab="ellipse">Ellipse</button>
              <button class="geom-sub-tab-btn" data-conic-tab="parabola">Parabola</button>
              <button class="geom-sub-tab-btn" data-conic-tab="circle">Circle</button>
              <button class="geom-sub-tab-btn" data-conic-tab="hyperbola">Hyperbola</button>
            </div>
          </div>

          <div class="geom-conic-split">
            <!-- Left: Conic Parameters Table -->
            <div class="geom-card" style="margin-bottom: 0; background: rgba(255, 255, 255, 0.75);">
              <div style="margin-bottom: 12px;">
                <span style="font-size: 0.78rem; color: #0E1D61; font-weight: 700; text-transform: uppercase;">Equation:</span>
                <div id="conic-card-eq" style="font-family: var(--font-math); font-size: 1.45rem; font-weight: 700; color: #0E1D61;">x²/25 + y²/9 = 1</div>
              </div>
              <div style="margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 0.78rem; color: #0E1D61; font-weight: 700; text-transform: uppercase;">Type:</span>
                <span id="conic-card-type" class="geom-badge" style="font-size: 0.85rem; padding: 2px 10px;">ELLIPSE</span>
              </div>

              <table class="geom-conic-param-table" id="conic-card-params">
                <!-- Dynamically generated rows -->
              </table>

              <div class="geom-btn-row">
                <button class="geom-btn-sm primary" id="btn-conic-steps">[Show Steps]</button>
                <button class="geom-btn-sm" id="btn-conic-formula">[Formula]</button>
                <button class="geom-btn-sm" id="btn-conic-save">[Save]</button>
                <button class="geom-btn-sm" id="btn-conic-copy">[Copy]</button>
              </div>

              <!-- Conic steps accordion -->
              <div id="conic-steps-box" class="geom-steps-accordion" style="display: none; margin-top: 14px; max-height: 180px; overflow-y: auto;">
              </div>
            </div>

            <!-- Right: Dedicated Conic Canvas Plot -->
            <div class="geom-conic-canvas-box">
              <canvas id="conic-live-canvas" style="width: 100%; height: 100%; display: block;"></canvas>
            </div>
          </div>
        </div>

        <!-- ── CURRICULUM MODULES & ADVANCED TOOLS ── -->
        <div class="geom-grid-2col">
          <!-- Left: Curriculum Modules -->
          <div>
            <div class="geom-section-header">
              <h2 class="geom-section-title">Curriculum Modules</h2>
              <a href="#/modules" class="geom-see-all">All 24 Modules ${SVG_ICONS.arrowRight}</a>
            </div>
            <div class="geom-modules-list">
              ${CURRICULUM_MODULES.map(m => `
                <a href="${m.href}" class="geom-module-card">
                  <div class="geom-module-icon">${m.icon}</div>
                  <div class="geom-module-info">
                    <div class="geom-module-num">#${m.num}</div>
                    <div class="geom-module-name">${m.title}</div>
                    <div class="geom-module-desc">${m.desc}</div>
                  </div>
                  <div class="geom-module-arrow">${SVG_ICONS.arrowRight}</div>
                </a>
              `).join('')}
            </div>
          </div>

          <!-- Right: Advanced Geometry Tools -->
          <div>
            <div class="geom-section-header">
              <h2 class="geom-section-title">Advanced Geometry Tools</h2>
            </div>
            <div class="geom-tools-grid">
              ${ADVANCED_TOOLS.map(t => `
                <a href="#/geometry/${t.id}" class="geom-tool-card" id="geom-tool-${t.id}">
                  <span class="geom-tool-icon">${t.icon}</span>
                  <span class="geom-tool-name">${t.title}</span>
                  <span class="geom-tool-desc">${t.desc}</span>
                </a>
              `).join('')}
            </div>

            <!-- Recent Activity -->
            <div class="geom-section-header" style="margin-top:28px;">
              <h2 class="geom-section-title">Recent Activity</h2>
              <a href="#/history" class="geom-see-all">History ${SVG_ICONS.arrowRight}</a>
            </div>
            <div class="glass-panel" style="padding:16px;border-radius:14px;background:rgba(255,255,255,0.7);">
              ${recentHistory.length === 0 ? `
                <div style="text-align:center;padding:18px 8px;color:rgba(14,29,97,0.6);font-size:0.86rem;">
                  No geometry activity recorded yet. Try calculating above.
                </div>
              ` : recentHistory.map(h => `
                <div style="padding:8px 0;border-bottom:1px solid rgba(184,154,90,0.15);font-size:0.86rem;">
                  <div style="font-weight:700;color:#0E1D61;">${h.expression}</div>
                  <div style="color:#B89A5A;font-family:var(--font-math);font-size:0.95rem;">= ${h.result}</div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>

      </div>
    `;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // CANVAS INITIALIZATION
  // ─────────────────────────────────────────────────────────────────────────────

  initVisualizers() {
    // 1. Primary 2D Coordinate Plane
    const primaryCanvas = document.getElementById('geom-coordinate-canvas');
    if (primaryCanvas) {
      this.planeVisualizer = new CoordinatePlaneVisualizer(primaryCanvas, {
        xMin: -8, xMax: 8, yMin: -6, yMax: 6,
        points: [
          { id: 'p1', name: 'A', x: 2, y: 3 },
          { id: 'p2', name: 'B', x: 6, y: 7 }
        ],
        onPointChange: (pt, allPoints) => {
          if (allPoints.length >= 2) {
            const p1 = allPoints[0];
            const p2 = allPoints[1];
            const input = document.getElementById('geom-main-input');
            if (input) {
              input.value = `A(${p1.x},${p1.y})   B(${p2.x},${p2.y})`;
              this.currentInput = input.value;
              this.analyzeCurrentInput(false);
            }
          }
        },
        onCoordHover: (coords) => {
          const banner = document.getElementById('geom-cursor-coords');
          if (banner) banner.textContent = `X: ${coords.x.toFixed(2)}, Y: ${coords.y.toFixed(2)}`;
        },
        onMeasureChange: (data) => {
          const box = document.getElementById('geom-measure-box');
          const dataEl = document.getElementById('geom-measure-data');
          if (!box || !dataEl) return;
          box.style.display = 'flex';
          if (data.type === 'segment') {
            dataEl.innerHTML = `
              <span>Δx: <strong>${data.dx.toFixed(2)}</strong></span>
              <span>Δy: <strong>${data.dy.toFixed(2)}</strong></span>
              <span>Distance: <strong>${data.distance.toFixed(4)}</strong></span>
              <span>Slope: <strong>${data.slope === 'Undefined' ? 'Undefined slope' : data.slope.toFixed(4)}</strong></span>
              <span>Angle: <strong>${data.angleDeg.toFixed(2)}°</strong></span>
            `;
          } else if (data.type === 'triangle') {
            dataEl.innerHTML = `
              <span>a: <strong>${data.a.toFixed(2)}</strong></span>
              <span>b: <strong>${data.b.toFixed(2)}</strong></span>
              <span>c: <strong>${data.c.toFixed(2)}</strong></span>
              <span>Perimeter: <strong>${data.perimeter.toFixed(2)}</strong></span>
              <span>Area: <strong>${data.area.toFixed(4)}</strong></span>
            `;
          }
        }
      });
    }

    // 2. Dedicated Conic Canvas
    const conicCanvas = document.getElementById('conic-live-canvas');
    if (conicCanvas) {
      this.conicVisualizer = new CoordinatePlaneVisualizer(conicCanvas, {
        xMin: -8, xMax: 8, yMin: -6, yMax: 6,
        conics: [{ type: 'ellipse', h: 0, k: 0, a: 5, b: 3 }]
      });
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // EVENT LISTENERS
  // ─────────────────────────────────────────────────────────────────────────────

  _attachListeners() {
    const input = document.getElementById('geom-main-input');
    const analyzeBtn = document.getElementById('geom-btn-analyze');

    // Enter key triggers analysis
    this._on(input, 'keydown', (e) => {
      if (e.key === 'Enter') {
        this.analyzeCurrentInput();
      }
    });

    this._on(analyzeBtn, 'click', () => {
      this.analyzeCurrentInput();
    });

    // Quick toolbar chips
    document.querySelectorAll('.geom-quick-pill').forEach(pill => {
      this._on(pill, 'click', () => {
        const action = pill.dataset.quick;
        this.handleQuickTool(action);
      });
    });

    // Coordinate Plane Controls
    this._on(document.getElementById('canvas-zoom-in'), 'click', () => this.planeVisualizer?.zoom(0.8));
    this._on(document.getElementById('canvas-zoom-out'), 'click', () => this.planeVisualizer?.zoom(1.25));
    this._on(document.getElementById('canvas-reset'), 'click', () => this.planeVisualizer?.resetView());
    this._on(document.getElementById('canvas-toggle-measure'), 'click', () => {
      if (this.planeVisualizer) {
        const active = this.planeVisualizer.toggleMeasurementMode();
        document.getElementById('canvas-toggle-measure')?.classList.toggle('active', active);
        const box = document.getElementById('geom-measure-box');
        if (box) box.style.display = active ? 'flex' : 'none';
      }
    });
    this._on(document.getElementById('canvas-clear-pts'), 'click', () => {
      this.planeVisualizer?.clearPoints();
    });

    // Properties Action Buttons
    const btnPropSteps = document.getElementById('btn-prop-show-steps');
    const stepsAccordion = document.getElementById('geom-prop-steps-accordion');
    this._on(btnPropSteps, 'click', () => {
      const isOpen = stepsAccordion.style.display !== 'none';
      stepsAccordion.style.display = isOpen ? 'none' : 'block';
      btnPropSteps.textContent = isOpen ? '[Show Steps]' : '[Hide Steps]';
    });

    const btnPropFormula = document.getElementById('btn-prop-formula');
    this._on(btnPropFormula, 'click', () => {
      showToast('Formula: d = √[(x₂-x₁)² + (y₂-y₁)²], m = (y₂-y₁)/(x₂-x₁)');
    });

    const btnPropCopy = document.getElementById('btn-prop-copy');
    this._on(btnPropCopy, 'click', () => {
      if (this.currentPropertiesData) {
        const str = `Distance: ${this.currentPropertiesData.distance}\nMidpoint: ${this.currentPropertiesData.midpoint}\nSlope: ${this.currentPropertiesData.slope}\nLine: ${this.currentPropertiesData.line}`;
        copyToClipboard(str);
        showToast('Properties copied to clipboard!');
      }
    });

    const btnPropSave = document.getElementById('btn-prop-save');
    this._on(btnPropSave, 'click', () => {
      if (this.currentPropertiesData) {
        store.addHistoryItem(this.currentInput, `Distance: ${this.currentPropertiesData.distance}, Slope: ${this.currentPropertiesData.slope}`, 'Geometry · Properties', 'geometry');
        showToast('Saved to history!');
      }
    });

    // Conic Tab Switchers
    document.querySelectorAll('[data-conic-tab]').forEach(btn => {
      this._on(btn, 'click', () => {
        document.querySelectorAll('[data-conic-tab]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.updateConicSection(btn.dataset.conicTab);
      });
    });

    // Conic Action Buttons
    const btnConicSteps = document.getElementById('btn-conic-steps');
    const conicStepsBox = document.getElementById('conic-steps-box');
    this._on(btnConicSteps, 'click', () => {
      const isOpen = conicStepsBox.style.display !== 'none';
      conicStepsBox.style.display = isOpen ? 'none' : 'block';
      btnConicSteps.textContent = isOpen ? '[Show Steps]' : '[Hide Steps]';
    });

    const btnConicFormula = document.getElementById('btn-conic-formula');
    this._on(btnConicFormula, 'click', () => {
      if (this.activeConicPreset === 'ellipse') {
        showToast('Standard Ellipse: x²/a² + y²/b² = 1, e = c/a = √(1 - b²/a²)');
      } else if (this.activeConicPreset === 'parabola') {
        showToast('Standard Parabola: y² = 4ax, Focus (a, 0), Directrix x = -a');
      } else if (this.activeConicPreset === 'hyperbola') {
        showToast('Standard Hyperbola: x²/a² - y²/b² = 1, e = √(1 + b²/a²)');
      } else {
        showToast('Standard Circle: (x - h)² + (y - k)² = r²');
      }
    });

    const btnConicSave = document.getElementById('btn-conic-save');
    this._on(btnConicSave, 'click', () => {
      if (this.currentConicData) {
        store.addHistoryItem(this.currentConicData.eq, `${this.currentConicData.type}: e = ${this.currentConicData.e}`, 'Geometry · Conic Analysis', 'geometry');
        showToast('Conic analysis saved to history!');
      }
    });

    const btnConicCopy = document.getElementById('btn-conic-copy');
    this._on(btnConicCopy, 'click', () => {
      if (this.currentConicData) {
        copyToClipboard(`${this.currentConicData.type}: ${this.currentConicData.eq} (e = ${this.currentConicData.e})`);
        showToast('Conic data copied to clipboard!');
      }
    });
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // CORE ANALYSIS & PROPERTIES UPDATER
  // ─────────────────────────────────────────────────────────────────────────────

  analyzeCurrentInput(syncGraph = true) {
    const input = document.getElementById('geom-main-input');
    const expr = (input && input.value.trim()) || this.currentInput.trim();
    if (!expr) return;

    this.currentInput = expr;
    const det = CoordinateGeometryMathEngine.detectGeometryInput(expr);

    // If input is 2 points: A(x1, y1) and B(x2, y2)
    if (det.type === 'two-points-2d') {
      const p1 = det.p1, p2 = det.p2;

      // Calculate all 4 main properties at once
      const distRes = CoordinateGeometryMathEngine.distance2D(p1, p2);
      const midRes = CoordinateGeometryMathEngine.midpoint2D(p1, p2);
      const slopeRes = CoordinateGeometryMathEngine.slope2D(p1, p2);

      // Line Equation: (y2 - y1)x - (x2 - x1)y + (x2 y1 - x1 y2) = 0
      const A = p2.y - p1.y;
      const B = p1.x - p2.x;
      const C = p2.x * p1.y - p1.x * p2.y;
      const lineRes = CoordinateGeometryMathEngine.analyzeLine(A, B, C);

      this.currentPropertiesData = {
        distance: distRes.exact !== distRes.decimal ? `${distRes.exact} (≈ ${distRes.decimal})` : distRes.exact,
        midpoint: midRes.result,
        slope: slopeRes.result === 'Undefined slope' ? 'Undefined slope' : (slopeRes.numericValue !== null ? slopeRes.numericValue : slopeRes.result),
        line: lineRes.slopeIntercept || lineRes.generalForm,
        steps: [
          ...distRes.steps,
          ...midRes.steps.slice(1),
          ...slopeRes.steps.slice(1),
          ...lineRes.steps.slice(1)
        ]
      };

      // Update DOM Readouts
      const elDist = document.getElementById('prop-val-distance');
      const elMid = document.getElementById('prop-val-midpoint');
      const elSlope = document.getElementById('prop-val-slope');
      const elLine = document.getElementById('prop-val-line');

      if (elDist) elDist.innerHTML = `${distRes.exact} <span class="geom-prop-subval">(≈ ${distRes.decimal})</span>`;
      if (elMid) elMid.textContent = `(${midRes.x}, ${midRes.y})`;
      if (elSlope) elSlope.textContent = slopeRes.result.replace('m = ', '');
      if (elLine) elLine.textContent = lineRes.slopeIntercept || lineRes.generalForm;

      // Extra metrics
      const extrasEl = document.getElementById('geom-prop-extras');
      if (extrasEl) {
        extrasEl.innerHTML = `
          <div style="display:flex;gap:12px;font-size:0.82rem;color:rgba(14,29,97,0.7);padding:6px 4px;font-family:var(--font-mono, monospace);">
            <span>Δx: <strong>${distRes.dx}</strong></span>
            <span>Δy: <strong>${distRes.dy}</strong></span>
            <span>θ: <strong>${slopeRes.angleDeg !== null ? slopeRes.angleDeg.toFixed(1) + '°' : '90°'}</strong></span>
          </div>
        `;
      }

      // Populate steps
      const stepsAccordion = document.getElementById('geom-prop-steps-accordion');
      if (stepsAccordion) {
        stepsAccordion.innerHTML = this.currentPropertiesData.steps.map((s, idx) => `
          <div class="geom-step-item">
            <div class="geom-step-num">Step ${idx + 1} • ${s.label}</div>
            <div class="geom-step-val">${s.value}</div>
          </div>
        `).join('');
      }

      // Sync Coordinate Plane
      if (syncGraph && this.planeVisualizer) {
        this.planeVisualizer.setPoints([
          { name: 'A', x: p1.x, y: p1.y },
          { name: 'B', x: p2.x, y: p2.y }
        ]);
        this.planeVisualizer.lines = [{ A, B, C, label: lineRes.slopeIntercept || 'AB' }];
        this.planeVisualizer.render();
      }

      // Save to history
      store.addHistoryItem(expr, `d=${distRes.exact}, m=${slopeRes.result}`, 'Geometry · Properties', 'geometry');
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // CONIC ANALYZER SECTION HANDLER
  // ─────────────────────────────────────────────────────────────────────────────

  updateConicSection(type = 'ellipse') {
    this.activeConicPreset = type;
    const eqEl = document.getElementById('conic-card-eq');
    const typeEl = document.getElementById('conic-card-type');
    const tableEl = document.getElementById('conic-card-params');
    const stepsBox = document.getElementById('conic-steps-box');

    let data = {};

    if (type === 'ellipse') {
      const elRes = CoordinateGeometryMathEngine.analyzeEllipse(5, 3);
      data = {
        eq: 'x²/25 + y²/9 = 1',
        type: 'ELLIPSE',
        e: elRes.eccentricity,
        params: [
          { label: 'Center', val: `(${elRes.center.x}, ${elRes.center.y})` },
          { label: 'a (Semi-major)', val: elRes.a },
          { label: 'b (Semi-minor)', val: elRes.b },
          { label: 'c (Focal dist)', val: elRes.c },
          { label: 'Eccentricity (e)', val: elRes.eccentricity },
          { label: 'Foci', val: `(±${elRes.c}, 0)` },
          { label: 'Latus Rectum', val: elRes.latusRectum }
        ],
        steps: elRes.steps
      };

      if (this.conicVisualizer) {
        this.conicVisualizer.conics = [{ type: 'ellipse', h: 0, k: 0, a: 5, b: 3 }];
        this.conicVisualizer.render();
      }
    } else if (type === 'parabola') {
      const pRes = CoordinateGeometryMathEngine.analyzeParabola(1, 'y2_4ax');
      data = {
        eq: 'y² = 4x',
        type: 'PARABOLA',
        e: '1.0',
        params: [
          { label: 'Vertex', val: '(0, 0)' },
          { label: 'Focus', val: `(${pRes.focus.x}, ${pRes.focus.y})` },
          { label: 'Directrix', val: pRes.directrix },
          { label: 'Parameter a', val: '1' },
          { label: 'Eccentricity (e)', val: '1.0' },
          { label: 'Axis', val: 'y = 0 (X-axis)' },
          { label: 'Latus Rectum', val: pRes.latusRectum }
        ],
        steps: pRes.steps
      };

      if (this.conicVisualizer) {
        this.conicVisualizer.conics = [{ type: 'parabola', a: 1 }];
        this.conicVisualizer.render();
      }
    } else if (type === 'circle') {
      const cRes = CoordinateGeometryMathEngine.analyzeCircle(0, 0, 5);
      data = {
        eq: 'x² + y² = 25',
        type: 'CIRCLE',
        e: '0',
        params: [
          { label: 'Center', val: '(0, 0)' },
          { label: 'Radius (r)', val: '5' },
          { label: 'Diameter (2r)', val: '10' },
          { label: 'Eccentricity (e)', val: '0' },
          { label: 'Area', val: '25π ≈ 78.54' },
          { label: 'Circumference', val: '10π ≈ 31.42' }
        ],
        steps: cRes.steps
      };

      if (this.conicVisualizer) {
        this.conicVisualizer.conics = [{ type: 'circle', h: 0, k: 0, r: 5 }];
        this.conicVisualizer.render();
      }
    } else if (type === 'hyperbola') {
      const hRes = CoordinateGeometryMathEngine.analyzeHyperbola(5, 3, true);
      data = {
        eq: 'x²/25 - y²/9 = 1',
        type: 'HYPERBOLA',
        e: hRes.eccentricity,
        params: [
          { label: 'Center', val: '(0, 0)' },
          { label: 'a (Transverse)', val: hRes.a },
          { label: 'b (Conjugate)', val: hRes.b },
          { label: 'c (Focal dist)', val: hRes.c },
          { label: 'Eccentricity (e)', val: hRes.eccentricity },
          { label: 'Asymptotes', val: hRes.asymptotes },
          { label: 'Latus Rectum', val: hRes.latusRectum }
        ],
        steps: hRes.steps
      };

      if (this.conicVisualizer) {
        this.conicVisualizer.conics = [{ type: 'hyperbola', a: 5, b: 3 }];
        this.conicVisualizer.render();
      }
    }

    this.currentConicData = data;

    if (eqEl) eqEl.textContent = data.eq;
    if (typeEl) typeEl.textContent = data.type;
    if (tableEl) {
      tableEl.innerHTML = data.params.map(p => `
        <tr>
          <td>${p.label}</td>
          <td>${p.val}</td>
        </tr>
      `).join('');
    }

    if (stepsBox && data.steps) {
      stepsBox.innerHTML = data.steps.map((s, idx) => `
        <div class="geom-step-item">
          <div class="geom-step-num">Step ${idx + 1} • ${s.label}</div>
          <div class="geom-step-val">${s.value}</div>
        </div>
      `).join('');
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // QUICK TOOLS ACTIONS
  // ─────────────────────────────────────────────────────────────────────────────

  handleQuickTool(action) {
    const input = document.getElementById('geom-main-input');
    const presets = {
      'distance': 'A(2,3)   B(6,7)',
      'midpoint': 'A(2,3)   B(8,7)',
      'slope': 'A(2,3)   B(6,7)',
      'line': 'A(1,2)   B(4,6)',
      'circle': 'x² + y² = 25',
      'parabola': 'y² = 4x',
      'ellipse': 'x²/25 + y²/9 = 1',
      'hyperbola': 'x²/25 - y²/9 = 1',
      'triangle': 'A(0,0), B(4,0), C(0,3)',
      '3d-dist': 'A(1,2,3), B(4,6,8)'
    };

    if (presets[action] && input) {
      input.value = presets[action];
      this.currentInput = presets[action];

      if (action === 'ellipse' || action === 'parabola' || action === 'circle' || action === 'hyperbola') {
        // Switch conic tab
        document.querySelectorAll('[data-conic-tab]').forEach(b => {
          b.classList.toggle('active', b.dataset.conicTab === action);
        });
        this.updateConicSection(action);
        document.querySelector('.geom-conic-analyzer-section')?.scrollIntoView({ behavior: 'smooth' });
      } else {
        this.analyzeCurrentInput();
      }
    }
  }
}
