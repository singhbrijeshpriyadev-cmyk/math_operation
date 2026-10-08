/**
 * OG - Coordinate Geometry Dedicated Tools Workspace
 * Dedicated workspaces for:
 * 01. Coordinate Plane (Interactive 2D Workspace & Measurement Mode)
 * 02. Point Calculator (Distance, Midpoint, Section Formula m:n, Slope, Triangle)
 * 03. Line Analyzer (Single line forms, Line relationships, Pair of straight lines)
 * 04. Circle Analyzer (Standard & general forms, intercepts, dynamic sliders)
 * 05. Conic Analyzer (Parabola, Ellipse, Hyperbola, General Conic Classifier, Comparison)
 * 06. 3D Geometry (3D Points, Distance, Section Formula, 3D Lines, 3D Planes with 3D canvas)
 * ES6 Module
 */

import { copyToClipboard, showToast, SVG_ICONS } from '../../utils.js';
import { CoordinateGeometryMathEngine } from '../../math/geometry.js';
import { CoordinatePlaneVisualizer } from './coordinate_plane.js';
import { CoordinatePlane3DVisualizer } from './plane_3d.js';

export class CoordinateGeometryToolsView {
  constructor(container, tool = 'point-calculator') {
    this.container = typeof container === 'string' ? document.querySelector(container) : container;
    
    // Map tool aliases
    const aliasMap = {
      'plane': 'coordinate-plane',
      'coordinate-plane': 'coordinate-plane',
      'points': 'point-calculator',
      'point': 'point-calculator',
      'point-calc': 'point-calculator',
      'lines': 'line-analyzer',
      'line': 'line-analyzer',
      'circle': 'circle-analyzer',
      'circles': 'circle-analyzer',
      'conic': 'conic-analyzer',
      'conics': 'conic-analyzer',
      'parabola': 'conic-analyzer',
      'ellipse': 'conic-analyzer',
      'hyperbola': 'conic-analyzer',
      '3d': '3d-geometry',
      '3d-geometry': '3d-geometry',
      '3d-lines': '3d-geometry',
      '3d-planes': '3d-geometry'
    };
    this.tool = aliasMap[tool] || tool || 'point-calculator';
    this._listeners = [];
    this.activeVisualizer2D = null;
    this.activeVisualizer3D = null;
  }

  mount() {
    this.render();
    this._attachListeners();
  }

  destroy() {
    this._listeners.forEach(({ el, evt, fn }) => el.removeEventListener(evt, fn));
    this._listeners = [];
    if (this.activeVisualizer2D) {
      this.activeVisualizer2D = null;
    }
    if (this.activeVisualizer3D) {
      this.activeVisualizer3D = null;
    }
  }

  _on(el, evt, fn) {
    if (!el) return;
    el.addEventListener(evt, fn);
    this._listeners.push({ el, evt, fn });
  }

  render() {
    const toolConfigs = {
      'coordinate-plane': {
        title: 'Interactive Coordinate Plane',
        subtitle: '2D plane with real-time coordinate tracking, point dragging, and measurement mode',
        badge: 'XY',
        content: this._renderCoordinatePlaneTool()
      },
      'point-calculator': {
        title: 'Point Calculator',
        subtitle: 'Distance, midpoint, section formula (m:n), slope, and 3-point triangle analysis',
        badge: 'P(x,y)',
        content: this._renderPointCalculatorTool()
      },
      'line-analyzer': {
        title: 'Straight Line Analyzer',
        subtitle: 'All line forms, parallel/perpendicular relationships, and pair of straight lines',
        badge: 'Ax+By',
        content: this._renderLineAnalyzerTool()
      },
      'circle-analyzer': {
        title: 'Circle Analyzer',
        subtitle: 'Standard & general forms, radius, center, intercepts, and dynamic parameter controls',
        badge: 'x²+y²',
        content: this._renderCircleAnalyzerTool()
      },
      'conic-analyzer': {
        title: 'Conic Sections Analyzer',
        subtitle: 'Parabola, ellipse, hyperbola, general conic classifier, and side-by-side comparison',
        badge: 'e < 1',
        content: this._renderConicAnalyzerTool()
      },
      '3d-geometry': {
        title: '3D Geometry Workspace',
        subtitle: '3D coordinates, distance, section formula, lines in 3D, and planes with 3D canvas',
        badge: 'XYZ',
        content: this._render3DGeometryTool()
      }
    };

    const currentConfig = toolConfigs[this.tool] || toolConfigs['point-calculator'];

    this.container.innerHTML = `
      <div class="geom-workspace-container">
        <!-- Breadcrumb / Header -->
        <div class="geom-header">
          <div class="geom-header-badge">
            <span class="geom-badge-dot"></span>
            ADVANCED TOOLS
          </div>
          <h1 class="geom-header-title">${currentConfig.title}</h1>
          <p class="geom-header-subtitle">${currentConfig.subtitle}</p>
        </div>

        <!-- Tool Switcher Pills -->
        <div class="geom-tool-switcher">
          <button class="geom-switcher-btn ${this.tool === 'coordinate-plane' ? 'active' : ''}" data-tool="coordinate-plane">01. Plane</button>
          <button class="geom-switcher-btn ${this.tool === 'point-calculator' ? 'active' : ''}" data-tool="point-calculator">02. Points</button>
          <button class="geom-switcher-btn ${this.tool === 'line-analyzer' ? 'active' : ''}" data-tool="line-analyzer">03. Lines</button>
          <button class="geom-switcher-btn ${this.tool === 'circle-analyzer' ? 'active' : ''}" data-tool="circle-analyzer">04. Circle</button>
          <button class="geom-switcher-btn ${this.tool === 'conic-analyzer' ? 'active' : ''}" data-tool="conic-analyzer">05. Conics</button>
          <button class="geom-switcher-btn ${this.tool === '3d-geometry' ? 'active' : ''}" data-tool="3d-geometry">06. 3D Space</button>
        </div>

        <!-- Main Tool Content -->
        <div class="geom-tool-main-body">
          ${currentConfig.content}
        </div>
      </div>
    `;

    // Initialize canvases after DOM insertion
    setTimeout(() => {
      this._initVisualizers();
    }, 50);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // TOOL 1: COORDINATE PLANE
  // ─────────────────────────────────────────────────────────────────────────────

  _renderCoordinatePlaneTool() {
    return `
      <div class="geom-plane-tool-grid">
        <div class="geom-canvas-card">
          <div class="geom-canvas-toolbar">
            <div class="geom-canvas-toolbar-group">
              <span class="geom-canvas-title">Interactive 2D Plane</span>
              <span class="geom-coord-badge" id="plane-cursor-coords">X: 0.00, Y: 0.00</span>
            </div>
            <div class="geom-canvas-toolbar-group">
              <button class="geom-icon-btn" id="btn-plane-measure" title="Toggle Measurement Mode">📏 Measure</button>
              <button class="geom-icon-btn" id="btn-plane-zoomin" title="Zoom In">+</button>
              <button class="geom-icon-btn" id="btn-plane-zoomout" title="Zoom Out">−</button>
              <button class="geom-icon-btn" id="btn-plane-reset" title="Reset View">⟲ Reset</button>
              <button class="geom-icon-btn text-danger" id="btn-plane-clear" title="Clear Points">🗑️</button>
            </div>
          </div>
          <div class="geom-canvas-wrapper" style="height: 480px;">
            <canvas id="standalone-geom-canvas" class="geom-interactive-canvas"></canvas>
            <div class="geom-canvas-hint">Click to add points • Drag to move • Scroll to zoom • Drag background to pan</div>
          </div>
        </div>

        <!-- Sidebar controls & measurements -->
        <div class="geom-plane-sidebar">
          <div class="geom-card">
            <div class="geom-card-header">
              <h3 class="geom-card-title">Add Point Exactly</h3>
            </div>
            <div class="geom-input-row" style="margin-bottom: 0.75rem;">
              <div class="geom-input-group">
                <label>Point Label</label>
                <input type="text" id="add-pt-name" class="geom-input-field" value="P" maxlength="4">
              </div>
              <div class="geom-input-group">
                <label>X coordinate</label>
                <input type="number" id="add-pt-x" class="geom-input-field" value="3" step="any">
              </div>
              <div class="geom-input-group">
                <label>Y coordinate</label>
                <input type="number" id="add-pt-y" class="geom-input-field" value="4" step="any">
              </div>
            </div>
            <button class="geom-action-btn primary" id="btn-add-exact-pt" style="width: 100%;">Plot Point</button>
          </div>

          <div class="geom-card" id="measurement-panel-card">
            <div class="geom-card-header">
              <h3 class="geom-card-title">Measurement Readout</h3>
              <span class="geom-badge-status" id="measure-mode-status">Inactive</span>
            </div>
            <div id="measure-output-content" class="geom-measure-details">
              <p class="geom-empty-hint">Click "📏 Measure" then click 2 or 3 points on the graph to view instant distance, slope, angle, and triangle area.</p>
            </div>
          </div>

          <div class="geom-card">
            <div class="geom-card-header">
              <h3 class="geom-card-title">Plotted Points (<span id="plotted-count">0</span>)</h3>
            </div>
            <div class="geom-points-list" id="plane-points-list">
              <div class="geom-empty-hint">No points plotted yet.</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // TOOL 2: POINT CALCULATOR
  // ─────────────────────────────────────────────────────────────────────────────

  _renderPointCalculatorTool() {
    return `
      <div class="geom-two-col-layout">
        <div class="geom-controls-panel">
          <div class="geom-card">
            <div class="geom-card-header">
              <h3 class="geom-card-title">Points Input</h3>
              <div class="geom-radio-toggle">
                <button class="geom-toggle-btn active" id="btn-mode-2pt">2 Points (A, B)</button>
                <button class="geom-toggle-btn" id="btn-mode-3pt">3 Points (A, B, C)</button>
              </div>
            </div>

            <!-- Point A -->
            <div class="geom-point-input-row">
              <span class="geom-pt-badge">A</span>
              <div class="geom-input-group">
                <label>x₁</label>
                <input type="number" id="pt-a-x" class="geom-input-field" value="2" step="any">
              </div>
              <div class="geom-input-group">
                <label>y₁</label>
                <input type="number" id="pt-a-y" class="geom-input-field" value="3" step="any">
              </div>
            </div>

            <!-- Point B -->
            <div class="geom-point-input-row">
              <span class="geom-pt-badge">B</span>
              <div class="geom-input-group">
                <label>x₂</label>
                <input type="number" id="pt-b-x" class="geom-input-field" value="6" step="any">
              </div>
              <div class="geom-input-group">
                <label>y₂</label>
                <input type="number" id="pt-b-y" class="geom-input-field" value="7" step="any">
              </div>
            </div>

            <!-- Point C (hidden by default) -->
            <div class="geom-point-input-row" id="pt-c-container" style="display: none;">
              <span class="geom-pt-badge">C</span>
              <div class="geom-input-group">
                <label>x₃</label>
                <input type="number" id="pt-c-x" class="geom-input-field" value="0" step="any">
              </div>
              <div class="geom-input-group">
                <label>y₃</label>
                <input type="number" id="pt-c-y" class="geom-input-field" value="5" step="any">
              </div>
            </div>

            <!-- Section Formula Parameters -->
            <div id="section-formula-params" class="geom-sub-params">
              <div class="geom-card-subhead">Section Division Ratio (m : n)</div>
              <div class="geom-input-row">
                <div class="geom-input-group">
                  <label>m</label>
                  <input type="number" id="ratio-m" class="geom-input-field" value="1" min="0.01" step="any">
                </div>
                <div class="geom-input-group">
                  <label>n</label>
                  <input type="number" id="ratio-n" class="geom-input-field" value="2" min="0.01" step="any">
                </div>
                <div class="geom-input-group">
                  <label>Type</label>
                  <select id="section-type" class="geom-input-field">
                    <option value="internal">Internal Division</option>
                    <option value="external">External Division</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Operations buttons -->
            <div class="geom-actions-cluster">
              <button class="geom-action-btn primary" id="btn-calc-distance">Distance</button>
              <button class="geom-action-btn primary" id="btn-calc-midpoint">Midpoint</button>
              <button class="geom-action-btn primary" id="btn-calc-slope">Slope</button>
              <button class="geom-action-btn primary" id="btn-calc-section">Section Formula</button>
              <button class="geom-action-btn secondary" id="btn-calc-triangle">Triangle / Collinear</button>
            </div>
          </div>

          <!-- Result Panel -->
          <div class="geom-result-panel" id="point-calc-result-panel" style="display: none;">
            <!-- Injected dynamically -->
          </div>
        </div>

        <!-- Canvas Visualizer Column -->
        <div class="geom-canvas-card">
          <div class="geom-canvas-toolbar">
            <span class="geom-canvas-title">Visual Representation</span>
            <div class="geom-canvas-toolbar-group">
              <button class="geom-icon-btn" id="btn-tool-plane-reset">⟲ Reset</button>
            </div>
          </div>
          <div class="geom-canvas-wrapper" style="height: 480px;">
            <canvas id="point-tool-canvas" class="geom-interactive-canvas"></canvas>
          </div>
        </div>
      </div>
    `;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // TOOL 3: LINE ANALYZER
  // ─────────────────────────────────────────────────────────────────────────────

  _renderLineAnalyzerTool() {
    return `
      <div class="geom-two-col-layout">
        <div class="geom-controls-panel">
          <div class="geom-card">
            <div class="geom-card-header">
              <h3 class="geom-card-title">Straight Line Analysis</h3>
              <div class="geom-sub-nav-tabs">
                <button class="geom-sub-tab-btn active" id="tab-line-single">Single Line</button>
                <button class="geom-sub-tab-btn" id="tab-line-two">Two Lines</button>
                <button class="geom-sub-tab-btn" id="tab-line-pair">Pair of Lines</button>
              </div>
            </div>

            <!-- Mode 1: Single Line -->
            <div id="pane-line-single">
              <div class="geom-input-group" style="margin-bottom: 0.8rem;">
                <label>Input Format</label>
                <select id="line-form-select" class="geom-input-field">
                  <option value="general">General Form: Ax + By + C = 0</option>
                  <option value="slope-intercept">Slope-Intercept: y = mx + c</option>
                  <option value="intercept">Intercept Form: x/a + y/b = 1</option>
                  <option value="two-points">Line Through Two Points</option>
                </select>
              </div>

              <!-- General Form inputs -->
              <div id="line-inputs-general" class="geom-input-row">
                <div class="geom-input-group">
                  <label>A</label>
                  <input type="number" id="line-A" class="geom-input-field" value="3" step="any">
                </div>
                <div class="geom-input-group">
                  <label>B</label>
                  <input type="number" id="line-B" class="geom-input-field" value="4" step="any">
                </div>
                <div class="geom-input-group">
                  <label>C</label>
                  <input type="number" id="line-C" class="geom-input-field" value="-12" step="any">
                </div>
              </div>

              <!-- Slope-intercept inputs -->
              <div id="line-inputs-slope" class="geom-input-row" style="display: none;">
                <div class="geom-input-group">
                  <label>Slope (m)</label>
                  <input type="number" id="line-m" class="geom-input-field" value="2" step="any">
                </div>
                <div class="geom-input-group">
                  <label>Y-Intercept (c)</label>
                  <input type="number" id="line-c" class="geom-input-field" value="3" step="any">
                </div>
              </div>

              <!-- Intercept inputs -->
              <div id="line-inputs-intercept" class="geom-input-row" style="display: none;">
                <div class="geom-input-group">
                  <label>x-intercept (a)</label>
                  <input type="number" id="line-int-a" class="geom-input-field" value="4" step="any">
                </div>
                <div class="geom-input-group">
                  <label>y-intercept (b)</label>
                  <input type="number" id="line-int-b" class="geom-input-field" value="3" step="any">
                </div>
              </div>

              <!-- Two points inputs -->
              <div id="line-inputs-twopt" style="display: none;">
                <div class="geom-input-row" style="margin-bottom: 0.5rem;">
                  <div class="geom-input-group"><label>x₁</label><input type="number" id="line-x1" class="geom-input-field" value="1"></div>
                  <div class="geom-input-group"><label>y₁</label><input type="number" id="line-y1" class="geom-input-field" value="2"></div>
                </div>
                <div class="geom-input-row">
                  <div class="geom-input-group"><label>x₂</label><input type="number" id="line-x2" class="geom-input-field" value="4"></div>
                  <div class="geom-input-group"><label>y₂</label><input type="number" id="line-y2" class="geom-input-field" value="6"></div>
                </div>
              </div>

              <div class="geom-actions-cluster" style="margin-top: 1rem;">
                <button class="geom-action-btn primary" id="btn-analyze-single-line">Analyze Line</button>
              </div>
            </div>

            <!-- Mode 2: Two Lines Relationship -->
            <div id="pane-line-two" style="display: none;">
              <div class="geom-card-subhead">Line 1: A₁x + B₁y + C₁ = 0</div>
              <div class="geom-input-row" style="margin-bottom: 0.75rem;">
                <div class="geom-input-group"><label>A₁</label><input type="number" id="l1-A" class="geom-input-field" value="2"></div>
                <div class="geom-input-group"><label>B₁</label><input type="number" id="l1-B" class="geom-input-field" value="-1"></div>
                <div class="geom-input-group"><label>C₁</label><input type="number" id="l1-C" class="geom-input-field" value="3"></div>
              </div>

              <div class="geom-card-subhead">Line 2: A₂x + B₂y + C₂ = 0</div>
              <div class="geom-input-row" style="margin-bottom: 1rem;">
                <div class="geom-input-group"><label>A₂</label><input type="number" id="l2-A" class="geom-input-field" value="1"></div>
                <div class="geom-input-group"><label>B₂</label><input type="number" id="l2-B" class="geom-input-field" value="2"></div>
                <div class="geom-input-group"><label>C₂</label><input type="number" id="l2-C" class="geom-input-field" value="-4"></div>
              </div>

              <button class="geom-action-btn primary" id="btn-analyze-two-lines" style="width: 100%;">Compare Line Relationship</button>
            </div>

            <!-- Mode 3: Pair of Straight Lines -->
            <div id="pane-line-pair" style="display: none;">
              <div class="geom-card-subhead">General 2nd Degree: ax² + 2hxy + by² + 2gx + 2fy + c = 0</div>
              <div class="geom-input-row" style="margin-bottom: 0.5rem;">
                <div class="geom-input-group"><label>a (x²)</label><input type="number" id="pair-a" class="geom-input-field" value="2"></div>
                <div class="geom-input-group"><label>2h (xy)</label><input type="number" id="pair-2h" class="geom-input-field" value="7"></div>
                <div class="geom-input-group"><label>b (y²)</label><input type="number" id="pair-b" class="geom-input-field" value="3"></div>
              </div>
              <div class="geom-input-row" style="margin-bottom: 1rem;">
                <div class="geom-input-group"><label>2g (x)</label><input type="number" id="pair-2g" class="geom-input-field" value="0"></div>
                <div class="geom-input-group"><label>2f (y)</label><input type="number" id="pair-2f" class="geom-input-field" value="0"></div>
                <div class="geom-input-group"><label>c (const)</label><input type="number" id="pair-c" class="geom-input-field" value="0"></div>
              </div>
              <button class="geom-action-btn primary" id="btn-analyze-pair-lines" style="width: 100%;">Analyze Pair of Lines</button>
            </div>
          </div>

          <!-- Result output -->
          <div class="geom-result-panel" id="line-result-panel" style="display: none;"></div>
        </div>

        <!-- Canvas column -->
        <div class="geom-canvas-card">
          <div class="geom-canvas-toolbar">
            <span class="geom-canvas-title">Line Visualization</span>
            <div class="geom-canvas-toolbar-group">
              <button class="geom-icon-btn" id="btn-line-plane-reset">⟲ Reset</button>
            </div>
          </div>
          <div class="geom-canvas-wrapper" style="height: 480px;">
            <canvas id="line-tool-canvas" class="geom-interactive-canvas"></canvas>
          </div>
        </div>
      </div>
    `;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // TOOL 4: CIRCLE ANALYZER
  // ─────────────────────────────────────────────────────────────────────────────

  _renderCircleAnalyzerTool() {
    return `
      <div class="geom-two-col-layout">
        <div class="geom-controls-panel">
          <div class="geom-card">
            <div class="geom-card-header">
              <h3 class="geom-card-title">Circle Analyzer</h3>
              <div class="geom-radio-toggle">
                <button class="geom-toggle-btn active" id="btn-circle-std">Standard Form</button>
                <button class="geom-toggle-btn" id="btn-circle-gen">General Form</button>
              </div>
            </div>

            <!-- Standard form: (x-h)^2 + (y-k)^2 = r^2 -->
            <div id="circle-std-form">
              <div class="geom-card-subhead">Equation: (x − h)² + (y − k)² = r²</div>
              <div class="geom-input-row" style="margin-bottom: 0.5rem;">
                <div class="geom-input-group">
                  <label>Center X (h)</label>
                  <input type="number" id="circle-h" class="geom-input-field" value="0" step="any">
                </div>
                <div class="geom-input-group">
                  <label>Center Y (k)</label>
                  <input type="number" id="circle-k" class="geom-input-field" value="0" step="any">
                </div>
                <div class="geom-input-group">
                  <label>Radius (r)</label>
                  <input type="number" id="circle-r" class="geom-input-field" value="5" min="0.1" step="any">
                </div>
              </div>

              <!-- Interactive Sliders -->
              <div class="geom-slider-box">
                <label>Radius Slider: <span id="circle-r-val">5</span></label>
                <input type="range" id="slider-circle-r" class="geom-slider" min="0.5" max="15" step="0.5" value="5">
              </div>
            </div>

            <!-- General form: x^2 + y^2 + 2gx + 2fy + c = 0 -->
            <div id="circle-gen-form" style="display: none;">
              <div class="geom-card-subhead">Equation: x² + y² + 2gx + 2fy + c = 0</div>
              <div class="geom-input-row" style="margin-bottom: 0.5rem;">
                <div class="geom-input-group">
                  <label>2g (coeff of x)</label>
                  <input type="number" id="circle-2g" class="geom-input-field" value="-4" step="any">
                </div>
                <div class="geom-input-group">
                  <label>2f (coeff of y)</label>
                  <input type="number" id="circle-2f" class="geom-input-field" value="6" step="any">
                </div>
                <div class="geom-input-group">
                  <label>c (constant)</label>
                  <input type="number" id="circle-c" class="geom-input-field" value="-12" step="any">
                </div>
              </div>
            </div>

            <div class="geom-actions-cluster" style="margin-top: 1rem;">
              <button class="geom-action-btn primary" id="btn-calc-circle">Analyze Circle</button>
            </div>
          </div>

          <!-- Circle Results -->
          <div class="geom-result-panel" id="circle-result-panel" style="display: none;"></div>
        </div>

        <!-- Canvas Visualizer -->
        <div class="geom-canvas-card">
          <div class="geom-canvas-toolbar">
            <span class="geom-canvas-title">Circle Plot</span>
            <div class="geom-canvas-toolbar-group">
              <button class="geom-icon-btn" id="btn-circle-plane-reset">⟲ Reset</button>
            </div>
          </div>
          <div class="geom-canvas-wrapper" style="height: 480px;">
            <canvas id="circle-tool-canvas" class="geom-interactive-canvas"></canvas>
          </div>
        </div>
      </div>
    `;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // TOOL 5: CONIC ANALYZER
  // ─────────────────────────────────────────────────────────────────────────────

  _renderConicAnalyzerTool() {
    return `
      <div class="geom-two-col-layout">
        <div class="geom-controls-panel">
          <div class="geom-card">
            <div class="geom-card-header">
              <h3 class="geom-card-title">Conic Sections</h3>
              <div class="geom-sub-nav-tabs">
                <button class="geom-sub-tab-btn active" id="tab-conic-parabola">Parabola</button>
                <button class="geom-sub-tab-btn" id="tab-conic-ellipse">Ellipse</button>
                <button class="geom-sub-tab-btn" id="tab-conic-hyperbola">Hyperbola</button>
                <button class="geom-sub-tab-btn" id="tab-conic-general">Classifier</button>
                <button class="geom-sub-tab-btn" id="tab-conic-compare">Compare</button>
              </div>
            </div>

            <!-- Pane 1: Parabola -->
            <div id="pane-conic-parabola">
              <div class="geom-input-group" style="margin-bottom: 0.8rem;">
                <label>Standard Form</label>
                <select id="parabola-type" class="geom-input-field">
                  <option value="y2_pos">y² = 4ax (Opens Right)</option>
                  <option value="y2_neg">y² = -4ax (Opens Left)</option>
                  <option value="x2_pos">x² = 4ay (Opens Upward)</option>
                  <option value="x2_neg">x² = -4ay (Opens Downward)</option>
                </select>
              </div>
              <div class="geom-input-group" style="margin-bottom: 0.8rem;">
                <label>Focal Parameter (a > 0)</label>
                <input type="number" id="parabola-a" class="geom-input-field" value="2" min="0.01" step="any">
              </div>
              <button class="geom-action-btn primary" id="btn-calc-parabola" style="width: 100%;">Analyze Parabola</button>
            </div>

            <!-- Pane 2: Ellipse -->
            <div id="pane-conic-ellipse" style="display: none;">
              <div class="geom-card-subhead">Equation: x² / a² + y² / b² = 1</div>
              <div class="geom-input-row" style="margin-bottom: 0.8rem;">
                <div class="geom-input-group">
                  <label>Semi-Major/X Axis (a)</label>
                  <input type="number" id="ellipse-a" class="geom-input-field" value="5" min="0.1" step="any">
                </div>
                <div class="geom-input-group">
                  <label>Semi-Minor/Y Axis (b)</label>
                  <input type="number" id="ellipse-b" class="geom-input-field" value="3" min="0.1" step="any">
                </div>
              </div>
              <button class="geom-action-btn primary" id="btn-calc-ellipse" style="width: 100%;">Analyze Ellipse</button>
            </div>

            <!-- Pane 3: Hyperbola -->
            <div id="pane-conic-hyperbola" style="display: none;">
              <div class="geom-input-group" style="margin-bottom: 0.8rem;">
                <label>Transverse Axis Orientation</label>
                <select id="hyperbola-type" class="geom-input-field">
                  <option value="horizontal">Horizontal: x²/a² − y²/b² = 1</option>
                  <option value="vertical">Vertical: y²/a² − x²/b² = 1</option>
                </select>
              </div>
              <div class="geom-input-row" style="margin-bottom: 0.8rem;">
                <div class="geom-input-group">
                  <label>Semi-transverse Axis (a)</label>
                  <input type="number" id="hyperbola-a" class="geom-input-field" value="4" min="0.1" step="any">
                </div>
                <div class="geom-input-group">
                  <label>Semi-conjugate Axis (b)</label>
                  <input type="number" id="hyperbola-b" class="geom-input-field" value="3" min="0.1" step="any">
                </div>
              </div>
              <button class="geom-action-btn primary" id="btn-calc-hyperbola" style="width: 100%;">Analyze Hyperbola</button>
            </div>

            <!-- Pane 4: General Classifier -->
            <div id="pane-conic-general" style="display: none;">
              <div class="geom-card-subhead">Ax² + Bxy + Cy² + Dx + Ey + F = 0</div>
              <div class="geom-input-row" style="margin-bottom: 0.5rem;">
                <div class="geom-input-group"><label>A (x²)</label><input type="number" id="gen-conic-A" class="geom-input-field" value="1"></div>
                <div class="geom-input-group"><label>B (xy)</label><input type="number" id="gen-conic-B" class="geom-input-field" value="0"></div>
                <div class="geom-input-group"><label>C (y²)</label><input type="number" id="gen-conic-C" class="geom-input-field" value="1"></div>
              </div>
              <div class="geom-input-row" style="margin-bottom: 0.8rem;">
                <div class="geom-input-group"><label>D (x)</label><input type="number" id="gen-conic-D" class="geom-input-field" value="0"></div>
                <div class="geom-input-group"><label>E (y)</label><input type="number" id="gen-conic-E" class="geom-input-field" value="0"></div>
                <div class="geom-input-group"><label>F (const)</label><input type="number" id="gen-conic-F" class="geom-input-field" value="-25"></div>
              </div>
              <button class="geom-action-btn primary" id="btn-calc-conic-classify" style="width: 100%;">Classify Conic</button>
            </div>

            <!-- Pane 5: Conic Comparison -->
            <div id="pane-conic-compare" style="display: none;">
              <div class="geom-card-subhead">Conic Sections Comparison</div>
              <div class="geom-table-responsive">
                <table class="geom-compare-table">
                  <thead>
                    <tr>
                      <th>Conic</th>
                      <th>Eccentricity (e)</th>
                      <th>Standard Form</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><strong>Circle</strong></td>
                      <td>e = 0</td>
                      <td>x² + y² = r²</td>
                    </tr>
                    <tr>
                      <td><strong>Ellipse</strong></td>
                      <td>0 &lt; e &lt; 1</td>
                      <td>x²/a² + y²/b² = 1</td>
                    </tr>
                    <tr>
                      <td><strong>Parabola</strong></td>
                      <td>e = 1</td>
                      <td>y² = 4ax</td>
                    </tr>
                    <tr>
                      <td><strong>Hyperbola</strong></td>
                      <td>e &gt; 1</td>
                      <td>x²/a² − y²/b² = 1</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- Conic result -->
          <div class="geom-result-panel" id="conic-result-panel" style="display: none;"></div>
        </div>

        <!-- Canvas Visualizer -->
        <div class="geom-canvas-card">
          <div class="geom-canvas-toolbar">
            <span class="geom-canvas-title">Conic Visualization</span>
            <div class="geom-canvas-toolbar-group">
              <button class="geom-icon-btn" id="btn-conic-plane-reset">⟲ Reset</button>
            </div>
          </div>
          <div class="geom-canvas-wrapper" style="height: 480px;">
            <canvas id="conic-tool-canvas" class="geom-interactive-canvas"></canvas>
          </div>
        </div>
      </div>
    `;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // TOOL 6: 3D GEOMETRY
  // ─────────────────────────────────────────────────────────────────────────────

  _render3DGeometryTool() {
    return `
      <div class="geom-two-col-layout">
        <div class="geom-controls-panel">
          <div class="geom-card">
            <div class="geom-card-header">
              <h3 class="geom-card-title">Three-Dimensional Geometry</h3>
              <div class="geom-sub-nav-tabs">
                <button class="geom-sub-tab-btn active" id="tab-3d-pts">Points & Distance</button>
                <button class="geom-sub-tab-btn" id="tab-3d-lines">3D Lines</button>
                <button class="geom-sub-tab-btn" id="tab-3d-planes">3D Planes</button>
              </div>
            </div>

            <!-- 3D Points Tab -->
            <div id="pane-3d-pts">
              <div class="geom-point-input-row">
                <span class="geom-pt-badge">A</span>
                <div class="geom-input-group"><label>x₁</label><input type="number" id="pt3-a-x" class="geom-input-field" value="1"></div>
                <div class="geom-input-group"><label>y₁</label><input type="number" id="pt3-a-y" class="geom-input-field" value="2"></div>
                <div class="geom-input-group"><label>z₁</label><input type="number" id="pt3-a-z" class="geom-input-field" value="3"></div>
              </div>

              <div class="geom-point-input-row">
                <span class="geom-pt-badge">B</span>
                <div class="geom-input-group"><label>x₂</label><input type="number" id="pt3-b-x" class="geom-input-field" value="4"></div>
                <div class="geom-input-group"><label>y₂</label><input type="number" id="pt3-b-y" class="geom-input-field" value="6"></div>
                <div class="geom-input-group"><label>z₂</label><input type="number" id="pt3-b-z" class="geom-input-field" value="8"></div>
              </div>

              <div class="geom-sub-params">
                <div class="geom-card-subhead">Section Division (m : n)</div>
                <div class="geom-input-row">
                  <div class="geom-input-group"><label>m</label><input type="number" id="ratio3-m" class="geom-input-field" value="1" min="0.01"></div>
                  <div class="geom-input-group"><label>n</label><input type="number" id="ratio3-n" class="geom-input-field" value="2" min="0.01"></div>
                  <div class="geom-input-group">
                    <label>Type</label>
                    <select id="ratio3-type" class="geom-input-field">
                      <option value="internal">Internal</option>
                      <option value="external">External</option>
                    </select>
                  </div>
                </div>
              </div>

              <div class="geom-actions-cluster" style="margin-top: 1rem;">
                <button class="geom-action-btn primary" id="btn-calc-3d-dist">3D Distance</button>
                <button class="geom-action-btn primary" id="btn-calc-3d-section">3D Section Formula</button>
              </div>
            </div>

            <!-- 3D Lines Tab -->
            <div id="pane-3d-lines" style="display: none;">
              <div class="geom-card-subhead">Line Through Point A with Direction Ratios (l, m, n)</div>
              <div class="geom-point-input-row" style="margin-bottom: 0.5rem;">
                <span class="geom-pt-badge">Pt</span>
                <div class="geom-input-group"><label>x₀</label><input type="number" id="l3d-x0" class="geom-input-field" value="2"></div>
                <div class="geom-input-group"><label>y₀</label><input type="number" id="l3d-y0" class="geom-input-field" value="-1"></div>
                <div class="geom-input-group"><label>z₀</label><input type="number" id="l3d-z0" class="geom-input-field" value="4"></div>
              </div>
              <div class="geom-point-input-row" style="margin-bottom: 1rem;">
                <span class="geom-pt-badge">DR</span>
                <div class="geom-input-group"><label>l</label><input type="number" id="l3d-l" class="geom-input-field" value="3"></div>
                <div class="geom-input-group"><label>m</label><input type="number" id="l3d-m" class="geom-input-field" value="2"></div>
                <div class="geom-input-group"><label>n</label><input type="number" id="l3d-n" class="geom-input-field" value="-1"></div>
              </div>
              <button class="geom-action-btn primary" id="btn-calc-3d-line" style="width: 100%;">Analyze 3D Line</button>
            </div>

            <!-- 3D Planes Tab -->
            <div id="pane-3d-planes" style="display: none;">
              <div class="geom-card-subhead">Plane Equation: Ax + By + Cz + D = 0</div>
              <div class="geom-input-row" style="margin-bottom: 0.75rem;">
                <div class="geom-input-group"><label>A</label><input type="number" id="p3d-A" class="geom-input-field" value="2"></div>
                <div class="geom-input-group"><label>B</label><input type="number" id="p3d-B" class="geom-input-field" value="-3"></div>
                <div class="geom-input-group"><label>C</label><input type="number" id="p3d-C" class="geom-input-field" value="6"></div>
                <div class="geom-input-group"><label>D</label><input type="number" id="p3d-D" class="geom-input-field" value="-14"></div>
              </div>
              <button class="geom-action-btn primary" id="btn-calc-3d-plane" style="width: 100%;">Analyze 3D Plane</button>
            </div>
          </div>

          <!-- Result Panel -->
          <div class="geom-result-panel" id="plane3d-result-panel" style="display: none;"></div>
        </div>

        <!-- 3D Canvas Column -->
        <div class="geom-canvas-card">
          <div class="geom-canvas-toolbar">
            <span class="geom-canvas-title">Interactive 3D Workspace</span>
            <div class="geom-canvas-toolbar-group">
              <button class="geom-icon-btn" id="btn-3d-cam-reset">⟲ Reset Camera</button>
            </div>
          </div>
          <div class="geom-canvas-wrapper" style="height: 480px;">
            <canvas id="space3d-tool-canvas" class="geom-interactive-canvas"></canvas>
            <div class="geom-canvas-hint">Drag to orbit camera • Scroll to zoom • Shift+drag to pan</div>
          </div>
        </div>
      </div>
    `;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // CANVAS INITIALIZATION
  // ─────────────────────────────────────────────────────────────────────────────

  _initVisualizers() {
    if (this.tool === 'coordinate-plane') {
      const canvas = document.getElementById('standalone-geom-canvas');
      if (canvas) {
        this.activeVisualizer2D = new CoordinatePlaneVisualizer(canvas, {
          onCoordHover: (coords) => {
            const badge = document.getElementById('plane-cursor-coords');
            if (badge) badge.textContent = `X: ${coords.x.toFixed(2)}, Y: ${coords.y.toFixed(2)}`;
          },
          onPointChange: () => this._updatePlaneSidebarPoints(),
          onMeasureChange: (data) => this._renderMeasureData(data)
        });
        this._updatePlaneSidebarPoints();
      }
    } else if (this.tool === 'point-calculator') {
      const canvas = document.getElementById('point-tool-canvas');
      if (canvas) {
        this.activeVisualizer2D = new CoordinatePlaneVisualizer(canvas);
        this._syncPointToolCanvas();
      }
    } else if (this.tool === 'line-analyzer') {
      const canvas = document.getElementById('line-tool-canvas');
      if (canvas) {
        this.activeVisualizer2D = new CoordinatePlaneVisualizer(canvas);
        this._syncLineToolCanvas();
      }
    } else if (this.tool === 'circle-analyzer') {
      const canvas = document.getElementById('circle-tool-canvas');
      if (canvas) {
        this.activeVisualizer2D = new CoordinatePlaneVisualizer(canvas);
        this._syncCircleToolCanvas();
      }
    } else if (this.tool === 'conic-analyzer') {
      const canvas = document.getElementById('conic-tool-canvas');
      if (canvas) {
        this.activeVisualizer2D = new CoordinatePlaneVisualizer(canvas);
        this._syncConicToolCanvas();
      }
    } else if (this.tool === '3d-geometry') {
      const canvas = document.getElementById('space3d-tool-canvas');
      if (canvas) {
        this.activeVisualizer3D = new CoordinatePlane3DVisualizer(canvas);
        this._sync3DToolCanvas();
      }
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // EVENT LISTENERS
  // ─────────────────────────────────────────────────────────────────────────────

  _attachListeners() {
    // Tool switcher buttons
    const switcherBtns = this.container.querySelectorAll('.geom-switcher-btn');
    switcherBtns.forEach(btn => {
      this._on(btn, 'click', () => {
        const nextTool = btn.dataset.tool;
        window.location.hash = `#/geometry/${nextTool}`;
      });
    });

    if (this.tool === 'coordinate-plane') {
      this._attachCoordinatePlaneListeners();
    } else if (this.tool === 'point-calculator') {
      this._attachPointCalculatorListeners();
    } else if (this.tool === 'line-analyzer') {
      this._attachLineAnalyzerListeners();
    } else if (this.tool === 'circle-analyzer') {
      this._attachCircleAnalyzerListeners();
    } else if (this.tool === 'conic-analyzer') {
      this._attachConicAnalyzerListeners();
    } else if (this.tool === '3d-geometry') {
      this._attach3DGeometryListeners();
    }
  }

  // ── Coordinates Plane Listeners ──
  _attachCoordinatePlaneListeners() {
    const btnMeasure = document.getElementById('btn-plane-measure');
    const measureStatus = document.getElementById('measure-mode-status');
    if (btnMeasure) {
      this._on(btnMeasure, 'click', () => {
        if (!this.activeVisualizer2D) return;
        const active = this.activeVisualizer2D.toggleMeasurementMode();
        btnMeasure.classList.toggle('active', active);
        if (measureStatus) {
          measureStatus.textContent = active ? 'Active' : 'Inactive';
          measureStatus.classList.toggle('active', active);
        }
      });
    }

    const btnZoomIn = document.getElementById('btn-plane-zoomin');
    if (btnZoomIn) this._on(btnZoomIn, 'click', () => this.activeVisualizer2D?.zoom(0.8));

    const btnZoomOut = document.getElementById('btn-plane-zoomout');
    if (btnZoomOut) this._on(btnZoomOut, 'click', () => this.activeVisualizer2D?.zoom(1.25));

    const btnReset = document.getElementById('btn-plane-reset');
    if (btnReset) this._on(btnReset, 'click', () => this.activeVisualizer2D?.resetView());

    const btnClear = document.getElementById('btn-plane-clear');
    if (btnClear) {
      this._on(btnClear, 'click', () => {
        this.activeVisualizer2D?.clearPoints();
        this._updatePlaneSidebarPoints();
        const out = document.getElementById('measure-output-content');
        if (out) out.innerHTML = '<p class="geom-empty-hint">Click "📏 Measure" then click 2 or 3 points to view measurements.</p>';
      });
    }

    const btnAddExact = document.getElementById('btn-add-exact-pt');
    if (btnAddExact) {
      this._on(btnAddExact, 'click', () => {
        const name = document.getElementById('add-pt-name')?.value || 'P';
        const x = parseFloat(document.getElementById('add-pt-x')?.value) || 0;
        const y = parseFloat(document.getElementById('add-pt-y')?.value) || 0;
        this.activeVisualizer2D?.addPoint(x, y, name);
        this._updatePlaneSidebarPoints();
      });
    }
  }

  _updatePlaneSidebarPoints() {
    const list = document.getElementById('plane-points-list');
    const count = document.getElementById('plotted-count');
    if (!list || !this.activeVisualizer2D) return;

    const pts = this.activeVisualizer2D.points;
    if (count) count.textContent = pts.length;

    if (pts.length === 0) {
      list.innerHTML = '<div class="geom-empty-hint">No points plotted yet. Click plane or use exact input.</div>';
      return;
    }

    list.innerHTML = pts.map(p => `
      <div class="geom-point-item">
        <span class="geom-pt-badge">${p.name}</span>
        <span class="geom-pt-coords">(${p.x}, ${p.y})</span>
        <button class="geom-pt-del" data-id="${p.id}" title="Remove point">✕</button>
      </div>
    `).join('');

    list.querySelectorAll('.geom-pt-del').forEach(btn => {
      this._on(btn, 'click', () => {
        const id = btn.dataset.id;
        this.activeVisualizer2D.points = this.activeVisualizer2D.points.filter(p => p.id !== id);
        this.activeVisualizer2D.render();
        this._updatePlaneSidebarPoints();
      });
    });
  }

  _renderMeasureData(data) {
    const container = document.getElementById('measure-output-content');
    if (!container) return;

    if (data.type === 'segment') {
      container.innerHTML = `
        <div class="geom-measure-metric">
          <span class="geom-metric-label">Points</span>
          <span class="geom-metric-val">${data.p1.name} → ${data.p2.name}</span>
        </div>
        <div class="geom-measure-metric">
          <span class="geom-metric-label">Δx</span>
          <span class="geom-metric-val">${data.dx.toFixed(2)}</span>
        </div>
        <div class="geom-measure-metric">
          <span class="geom-metric-label">Δy</span>
          <span class="geom-metric-val">${data.dy.toFixed(2)}</span>
        </div>
        <div class="geom-measure-metric">
          <span class="geom-metric-label">Distance</span>
          <span class="geom-metric-val highlight">${data.distance.toFixed(4)}</span>
        </div>
        <div class="geom-measure-metric">
          <span class="geom-metric-label">Slope (m)</span>
          <span class="geom-metric-val">${data.slope === 'Undefined' ? 'Undefined slope' : data.slope.toFixed(4)}</span>
        </div>
        <div class="geom-measure-metric">
          <span class="geom-metric-label">Angle</span>
          <span class="geom-metric-val">${data.angleDeg.toFixed(2)}°</span>
        </div>
      `;
    } else if (data.type === 'triangle') {
      container.innerHTML = `
        <div class="geom-measure-metric">
          <span class="geom-metric-label">Vertices</span>
          <span class="geom-metric-val">${data.p1.name}, ${data.p2.name}, ${data.p3.name}</span>
        </div>
        <div class="geom-measure-metric">
          <span class="geom-metric-label">Side a</span>
          <span class="geom-metric-val">${data.a.toFixed(3)}</span>
        </div>
        <div class="geom-measure-metric">
          <span class="geom-metric-label">Side b</span>
          <span class="geom-metric-val">${data.b.toFixed(3)}</span>
        </div>
        <div class="geom-measure-metric">
          <span class="geom-metric-label">Side c</span>
          <span class="geom-metric-val">${data.c.toFixed(3)}</span>
        </div>
        <div class="geom-measure-metric">
          <span class="geom-metric-label">Perimeter</span>
          <span class="geom-metric-val">${data.perimeter.toFixed(3)}</span>
        </div>
        <div class="geom-measure-metric">
          <span class="geom-metric-label">Area</span>
          <span class="geom-metric-val highlight">${data.area.toFixed(4)} sq. units</span>
        </div>
      `;
    }
  }

  // ── Point Calculator Listeners ──
  _attachPointCalculatorListeners() {
    const btnMode2 = document.getElementById('btn-mode-2pt');
    const btnMode3 = document.getElementById('btn-mode-3pt');
    const ptC = document.getElementById('pt-c-container');

    if (btnMode2 && btnMode3 && ptC) {
      this._on(btnMode2, 'click', () => {
        btnMode2.classList.add('active');
        btnMode3.classList.remove('active');
        ptC.style.display = 'none';
        this._syncPointToolCanvas();
      });
      this._on(btnMode3, 'click', () => {
        btnMode3.classList.add('active');
        btnMode2.classList.remove('active');
        ptC.style.display = 'flex';
        this._syncPointToolCanvas();
      });
    }

    const resetBtn = document.getElementById('btn-tool-plane-reset');
    if (resetBtn) this._on(resetBtn, 'click', () => this.activeVisualizer2D?.resetView());

    // Calc Distance
    const btnDist = document.getElementById('btn-calc-distance');
    if (btnDist) {
      this._on(btnDist, 'click', () => {
        const p1 = this._getP1();
        const p2 = this._getP2();
        const res = CoordinateGeometryMathEngine.distance2D(p1, p2);
        this._renderResultPanel('point-calc-result-panel', res);
        this._syncPointToolCanvas();
      });
    }

    // Calc Midpoint
    const btnMid = document.getElementById('btn-calc-midpoint');
    if (btnMid) {
      this._on(btnMid, 'click', () => {
        const p1 = this._getP1();
        const p2 = this._getP2();
        const res = CoordinateGeometryMathEngine.midpoint2D(p1, p2);
        this._renderResultPanel('point-calc-result-panel', res);
        this._syncPointToolCanvas();
      });
    }

    // Calc Slope
    const btnSlope = document.getElementById('btn-calc-slope');
    if (btnSlope) {
      this._on(btnSlope, 'click', () => {
        const p1 = this._getP1();
        const p2 = this._getP2();
        const res = CoordinateGeometryMathEngine.slope2D(p1, p2);
        this._renderResultPanel('point-calc-result-panel', res);
        this._syncPointToolCanvas();
      });
    }

    // Calc Section
    const btnSec = document.getElementById('btn-calc-section');
    if (btnSec) {
      this._on(btnSec, 'click', () => {
        const p1 = this._getP1();
        const p2 = this._getP2();
        const m = parseFloat(document.getElementById('ratio-m')?.value) || 1;
        const n = parseFloat(document.getElementById('ratio-n')?.value) || 1;
        const type = document.getElementById('section-type')?.value === 'internal';
        const res = CoordinateGeometryMathEngine.sectionFormula2D(p1, p2, m, n, type);
        this._renderResultPanel('point-calc-result-panel', res);
        this._syncPointToolCanvas();
      });
    }

    // Triangle analysis
    const btnTri = document.getElementById('btn-calc-triangle');
    if (btnTri) {
      this._on(btnTri, 'click', () => {
        const p1 = this._getP1();
        const p2 = this._getP2();
        const p3 = {
          x: parseFloat(document.getElementById('pt-c-x')?.value) || 0,
          y: parseFloat(document.getElementById('pt-c-y')?.value) || 0
        };
        const res = CoordinateGeometryMathEngine.triangleAnalysis(p1, p2, p3);
        this._renderResultPanel('point-calc-result-panel', res);
        this._syncPointToolCanvas(true);
      });
    }
  }

  _getP1() {
    return {
      x: parseFloat(document.getElementById('pt-a-x')?.value) || 0,
      y: parseFloat(document.getElementById('pt-a-y')?.value) || 0
    };
  }

  _getP2() {
    return {
      x: parseFloat(document.getElementById('pt-b-x')?.value) || 0,
      y: parseFloat(document.getElementById('pt-b-y')?.value) || 0
    };
  }

  _syncPointToolCanvas(includeC = false) {
    if (!this.activeVisualizer2D) return;
    const p1 = this._getP1();
    const p2 = this._getP2();
    const pts = [
      { name: 'A', x: p1.x, y: p1.y },
      { name: 'B', x: p2.x, y: p2.y }
    ];

    if (includeC || document.getElementById('pt-c-container')?.style.display !== 'none') {
      const p3 = {
        name: 'C',
        x: parseFloat(document.getElementById('pt-c-x')?.value) || 0,
        y: parseFloat(document.getElementById('pt-c-y')?.value) || 0
      };
      pts.push(p3);
      this.activeVisualizer2D.shapes = [{
        type: 'triangle',
        points: pts
      }];
    } else {
      this.activeVisualizer2D.shapes = [];
    }

    this.activeVisualizer2D.setPoints(pts);
  }

  // ── Line Analyzer Listeners ──
  _attachLineAnalyzerListeners() {
    const tabSingle = document.getElementById('tab-line-single');
    const tabTwo = document.getElementById('tab-line-two');
    const tabPair = document.getElementById('tab-line-pair');

    const paneSingle = document.getElementById('pane-line-single');
    const paneTwo = document.getElementById('pane-line-two');
    const panePair = document.getElementById('pane-line-pair');

    const selectTab = (tab, pane) => {
      [tabSingle, tabTwo, tabPair].forEach(t => t?.classList.remove('active'));
      [paneSingle, paneTwo, panePair].forEach(p => { if (p) p.style.display = 'none'; });
      tab.classList.add('active');
      pane.style.display = 'block';
    };

    if (tabSingle && paneSingle) this._on(tabSingle, 'click', () => selectTab(tabSingle, paneSingle));
    if (tabTwo && paneTwo) this._on(tabTwo, 'click', () => selectTab(tabTwo, paneTwo));
    if (tabPair && panePair) this._on(tabPair, 'click', () => selectTab(tabPair, panePair));

    // Format dropdown
    const formSelect = document.getElementById('line-form-select');
    if (formSelect) {
      this._on(formSelect, 'change', (e) => {
        const val = e.target.value;
        const gRow = document.getElementById('line-inputs-general');
        const sRow = document.getElementById('line-inputs-slope');
        const iRow = document.getElementById('line-inputs-intercept');
        const tRow = document.getElementById('line-inputs-twopt');
        if (gRow) gRow.style.display = val === 'general' ? 'flex' : 'none';
        if (sRow) sRow.style.display = val === 'slope-intercept' ? 'flex' : 'none';
        if (iRow) iRow.style.display = val === 'intercept' ? 'flex' : 'none';
        if (tRow) tRow.style.display = val === 'two-points' ? 'block' : 'none';
      });
    }

    // Reset button
    const resetBtn = document.getElementById('btn-line-plane-reset');
    if (resetBtn) this._on(resetBtn, 'click', () => this.activeVisualizer2D?.resetView());

    // Single line analysis
    const btnSingle = document.getElementById('btn-analyze-single-line');
    if (btnSingle) {
      this._on(btnSingle, 'click', () => {
        const form = document.getElementById('line-form-select')?.value;
        let A, B, C;
        if (form === 'general') {
          A = parseFloat(document.getElementById('line-A')?.value) || 0;
          B = parseFloat(document.getElementById('line-B')?.value) || 0;
          C = parseFloat(document.getElementById('line-C')?.value) || 0;
        } else if (form === 'slope-intercept') {
          const m = parseFloat(document.getElementById('line-m')?.value) || 0;
          const c = parseFloat(document.getElementById('line-c')?.value) || 0;
          // y = mx + c => mx - y + c = 0
          A = m; B = -1; C = c;
        } else if (form === 'intercept') {
          const a = parseFloat(document.getElementById('line-int-a')?.value) || 1;
          const b = parseFloat(document.getElementById('line-int-b')?.value) || 1;
          // bx + ay - ab = 0
          A = b; B = a; C = -a * b;
        } else if (form === 'two-points') {
          const x1 = parseFloat(document.getElementById('line-x1')?.value) || 0;
          const y1 = parseFloat(document.getElementById('line-y1')?.value) || 0;
          const x2 = parseFloat(document.getElementById('line-x2')?.value) || 0;
          const y2 = parseFloat(document.getElementById('line-y2')?.value) || 0;
          A = y2 - y1;
          B = x1 - x2;
          C = x2 * y1 - x1 * y2;
        }

        const res = CoordinateGeometryMathEngine.analyzeLine(A, B, C);
        this._renderResultPanel('line-result-panel', res);

        if (this.activeVisualizer2D) {
          this.activeVisualizer2D.lines = [{ A, B, C, label: `${A}x + ${B}y + ${C} = 0` }];
          this.activeVisualizer2D.render();
        }
      });
    }

    // Two lines relationship
    const btnTwo = document.getElementById('btn-analyze-two-lines');
    if (btnTwo) {
      this._on(btnTwo, 'click', () => {
        const l1 = {
          A: parseFloat(document.getElementById('l1-A')?.value) || 0,
          B: parseFloat(document.getElementById('l1-B')?.value) || 0,
          C: parseFloat(document.getElementById('l1-C')?.value) || 0
        };
        const l2 = {
          A: parseFloat(document.getElementById('l2-A')?.value) || 0,
          B: parseFloat(document.getElementById('l2-B')?.value) || 0,
          C: parseFloat(document.getElementById('l2-C')?.value) || 0
        };
        const res = CoordinateGeometryMathEngine.lineRelationships(l1, l2);
        this._renderResultPanel('line-result-panel', res);

        if (this.activeVisualizer2D) {
          this.activeVisualizer2D.lines = [
            { A: l1.A, B: l1.B, C: l1.C, color: '#0E1D61', label: 'L₁' },
            { A: l2.A, B: l2.B, C: l2.C, color: '#B89A5A', label: 'L₂' }
          ];
          if (res.intersection) {
            this.activeVisualizer2D.setPoints([{ name: 'I', x: res.intersection.x, y: res.intersection.y }]);
          } else {
            this.activeVisualizer2D.setPoints([]);
          }
          this.activeVisualizer2D.render();
        }
      });
    }

    // Pair of lines
    const btnPair = document.getElementById('btn-analyze-pair-lines');
    if (btnPair) {
      this._on(btnPair, 'click', () => {
        const a = parseFloat(document.getElementById('pair-a')?.value) || 0;
        const h2 = parseFloat(document.getElementById('pair-2h')?.value) || 0;
        const b = parseFloat(document.getElementById('pair-b')?.value) || 0;
        const g2 = parseFloat(document.getElementById('pair-2g')?.value) || 0;
        const f2 = parseFloat(document.getElementById('pair-2f')?.value) || 0;
        const c = parseFloat(document.getElementById('pair-c')?.value) || 0;

        const res = CoordinateGeometryMathEngine.pairOfLines(a, h2 / 2, b, g2 / 2, f2 / 2, c);
        this._renderResultPanel('line-result-panel', res);
      });
    }
  }

  _syncLineToolCanvas() {
    if (!this.activeVisualizer2D) return;
    this.activeVisualizer2D.lines = [{ A: 3, B: 4, C: -12, label: '3x + 4y - 12 = 0' }];
    this.activeVisualizer2D.render();
  }

  // ── Circle Analyzer Listeners ──
  _attachCircleAnalyzerListeners() {
    const btnStd = document.getElementById('btn-circle-std');
    const btnGen = document.getElementById('btn-circle-gen');
    const paneStd = document.getElementById('circle-std-form');
    const paneGen = document.getElementById('circle-gen-form');

    if (btnStd && btnGen && paneStd && paneGen) {
      this._on(btnStd, 'click', () => {
        btnStd.classList.add('active');
        btnGen.classList.remove('active');
        paneStd.style.display = 'block';
        paneGen.style.display = 'none';
        this._syncCircleToolCanvas();
      });
      this._on(btnGen, 'click', () => {
        btnGen.classList.add('active');
        btnStd.classList.remove('active');
        paneStd.style.display = 'none';
        paneGen.style.display = 'block';
        this._syncCircleToolCanvas();
      });
    }

    // Interactive slider
    const sliderR = document.getElementById('slider-circle-r');
    const inputR = document.getElementById('circle-r');
    const valR = document.getElementById('circle-r-val');
    if (sliderR && inputR) {
      this._on(sliderR, 'input', (e) => {
        inputR.value = e.target.value;
        if (valR) valR.textContent = e.target.value;
        this._syncCircleToolCanvas();
      });
      this._on(inputR, 'input', (e) => {
        sliderR.value = e.target.value;
        if (valR) valR.textContent = e.target.value;
        this._syncCircleToolCanvas();
      });
    }

    const resetBtn = document.getElementById('btn-circle-plane-reset');
    if (resetBtn) this._on(resetBtn, 'click', () => this.activeVisualizer2D?.resetView());

    // Calc Circle
    const btnCalc = document.getElementById('btn-calc-circle');
    if (btnCalc) {
      this._on(btnCalc, 'click', () => {
        const isStd = btnStd?.classList.contains('active');
        let res;
        if (isStd) {
          const h = parseFloat(document.getElementById('circle-h')?.value) || 0;
          const k = parseFloat(document.getElementById('circle-k')?.value) || 0;
          const r = parseFloat(document.getElementById('circle-r')?.value) || 1;
          res = CoordinateGeometryMathEngine.analyzeCircle(h, k, r, true);
        } else {
          const g2 = parseFloat(document.getElementById('circle-2g')?.value) || 0;
          const f2 = parseFloat(document.getElementById('circle-2f')?.value) || 0;
          const c = parseFloat(document.getElementById('circle-c')?.value) || 0;
          res = CoordinateGeometryMathEngine.analyzeCircle(g2 / 2, f2 / 2, c, false);
        }

        this._renderResultPanel('circle-result-panel', res);
        this._syncCircleToolCanvas();
      });
    }
  }

  _syncCircleToolCanvas() {
    if (!this.activeVisualizer2D) return;
    const isStd = document.getElementById('btn-circle-std')?.classList.contains('active');
    let h = 0, k = 0, r = 5;

    if (isStd) {
      h = parseFloat(document.getElementById('circle-h')?.value) || 0;
      k = parseFloat(document.getElementById('circle-k')?.value) || 0;
      r = parseFloat(document.getElementById('circle-r')?.value) || 5;
    } else {
      const g2 = parseFloat(document.getElementById('circle-2g')?.value) || 0;
      const f2 = parseFloat(document.getElementById('circle-2f')?.value) || 0;
      const c = parseFloat(document.getElementById('circle-c')?.value) || 0;
      const g = g2 / 2, f = f2 / 2;
      h = -g;
      k = -f;
      const rSq = g * g + f * f - c;
      r = rSq > 0 ? Math.sqrt(rSq) : 1;
    }

    this.activeVisualizer2D.conics = [{ type: 'circle', h, k, r }];
    this.activeVisualizer2D.render();
  }

  // ── Conic Analyzer Listeners ──
  _attachConicAnalyzerListeners() {
    const tabs = ['parabola', 'ellipse', 'hyperbola', 'general', 'compare'];
    tabs.forEach(t => {
      const btn = document.getElementById(`tab-conic-${t}`);
      const pane = document.getElementById(`pane-conic-${t}`);
      if (btn && pane) {
        this._on(btn, 'click', () => {
          tabs.forEach(other => {
            document.getElementById(`tab-conic-${other}`)?.classList.remove('active');
            const otherPane = document.getElementById(`pane-conic-${other}`);
            if (otherPane) otherPane.style.display = 'none';
          });
          btn.classList.add('active');
          pane.style.display = 'block';
          this._syncConicToolCanvas();
        });
      }
    });

    const resetBtn = document.getElementById('btn-conic-plane-reset');
    if (resetBtn) this._on(resetBtn, 'click', () => this.activeVisualizer2D?.resetView());

    // Calc Parabola
    const btnPar = document.getElementById('btn-calc-parabola');
    if (btnPar) {
      this._on(btnPar, 'click', () => {
        const type = document.getElementById('parabola-type')?.value || 'y2_pos';
        const a = parseFloat(document.getElementById('parabola-a')?.value) || 1;
        const res = CoordinateGeometryMathEngine.analyzeParabola(type, a);
        this._renderResultPanel('conic-result-panel', res);
        this._syncConicToolCanvas();
      });
    }

    // Calc Ellipse
    const btnEll = document.getElementById('btn-calc-ellipse');
    if (btnEll) {
      this._on(btnEll, 'click', () => {
        const a = parseFloat(document.getElementById('ellipse-a')?.value) || 5;
        const b = parseFloat(document.getElementById('ellipse-b')?.value) || 3;
        const res = CoordinateGeometryMathEngine.analyzeEllipse(a, b);
        this._renderResultPanel('conic-result-panel', res);
        this._syncConicToolCanvas();
      });
    }

    // Calc Hyperbola
    const btnHyp = document.getElementById('btn-calc-hyperbola');
    if (btnHyp) {
      this._on(btnHyp, 'click', () => {
        const type = document.getElementById('hyperbola-type')?.value === 'horizontal';
        const a = parseFloat(document.getElementById('hyperbola-a')?.value) || 4;
        const b = parseFloat(document.getElementById('hyperbola-b')?.value) || 3;
        const res = CoordinateGeometryMathEngine.analyzeHyperbola(a, b, type);
        this._renderResultPanel('conic-result-panel', res);
        this._syncConicToolCanvas();
      });
    }

    // Classify General Conic
    const btnCls = document.getElementById('btn-calc-conic-classify');
    if (btnCls) {
      this._on(btnCls, 'click', () => {
        const A = parseFloat(document.getElementById('gen-conic-A')?.value) || 0;
        const B = parseFloat(document.getElementById('gen-conic-B')?.value) || 0;
        const C = parseFloat(document.getElementById('gen-conic-C')?.value) || 0;
        const D = parseFloat(document.getElementById('gen-conic-D')?.value) || 0;
        const E = parseFloat(document.getElementById('gen-conic-E')?.value) || 0;
        const F = parseFloat(document.getElementById('gen-conic-F')?.value) || 0;
        const res = CoordinateGeometryMathEngine.classifyGeneralConic(A, B, C, D, E, F);
        this._renderResultPanel('conic-result-panel', res);
      });
    }
  }

  _syncConicToolCanvas() {
    if (!this.activeVisualizer2D) return;

    if (document.getElementById('tab-conic-parabola')?.classList.contains('active')) {
      const a = parseFloat(document.getElementById('parabola-a')?.value) || 2;
      this.activeVisualizer2D.conics = [{ type: 'parabola', a }];
    } else if (document.getElementById('tab-conic-ellipse')?.classList.contains('active')) {
      const a = parseFloat(document.getElementById('ellipse-a')?.value) || 5;
      const b = parseFloat(document.getElementById('ellipse-b')?.value) || 3;
      this.activeVisualizer2D.conics = [{ type: 'ellipse', a, b }];
    } else if (document.getElementById('tab-conic-hyperbola')?.classList.contains('active')) {
      const a = parseFloat(document.getElementById('hyperbola-a')?.value) || 4;
      const b = parseFloat(document.getElementById('hyperbola-b')?.value) || 3;
      this.activeVisualizer2D.conics = [{ type: 'hyperbola', a, b }];
    }
    this.activeVisualizer2D.render();
  }

  // ── 3D Geometry Listeners ──
  _attach3DGeometryListeners() {
    const tabPts = document.getElementById('tab-3d-pts');
    const tabLines = document.getElementById('tab-3d-lines');
    const tabPlanes = document.getElementById('tab-3d-planes');

    const panePts = document.getElementById('pane-3d-pts');
    const paneLines = document.getElementById('pane-3d-lines');
    const panePlanes = document.getElementById('pane-3d-planes');

    const select3DTab = (tab, pane) => {
      [tabPts, tabLines, tabPlanes].forEach(t => t?.classList.remove('active'));
      [panePts, paneLines, panePlanes].forEach(p => { if (p) p.style.display = 'none'; });
      tab.classList.add('active');
      pane.style.display = 'block';
    };

    if (tabPts && panePts) this._on(tabPts, 'click', () => select3DTab(tabPts, panePts));
    if (tabLines && paneLines) this._on(tabLines, 'click', () => select3DTab(tabLines, paneLines));
    if (tabPlanes && panePlanes) this._on(tabPlanes, 'click', () => select3DTab(tabPlanes, panePlanes));

    const resetCam = document.getElementById('btn-3d-cam-reset');
    if (resetCam) this._on(resetCam, 'click', () => this.activeVisualizer3D?.resetCamera());

    // 3D Distance
    const btnDist = document.getElementById('btn-calc-3d-dist');
    if (btnDist) {
      this._on(btnDist, 'click', () => {
        const p1 = {
          x: parseFloat(document.getElementById('pt3-a-x')?.value) || 0,
          y: parseFloat(document.getElementById('pt3-a-y')?.value) || 0,
          z: parseFloat(document.getElementById('pt3-a-z')?.value) || 0
        };
        const p2 = {
          x: parseFloat(document.getElementById('pt3-b-x')?.value) || 0,
          y: parseFloat(document.getElementById('pt3-b-y')?.value) || 0,
          z: parseFloat(document.getElementById('pt3-b-z')?.value) || 0
        };
        const res = CoordinateGeometryMathEngine.distance3D(p1, p2);
        this._renderResultPanel('plane3d-result-panel', res);
        this._sync3DToolCanvas();
      });
    }

    // 3D Section
    const btnSec = document.getElementById('btn-calc-3d-section');
    if (btnSec) {
      this._on(btnSec, 'click', () => {
        const p1 = {
          x: parseFloat(document.getElementById('pt3-a-x')?.value) || 0,
          y: parseFloat(document.getElementById('pt3-a-y')?.value) || 0,
          z: parseFloat(document.getElementById('pt3-a-z')?.value) || 0
        };
        const p2 = {
          x: parseFloat(document.getElementById('pt3-b-x')?.value) || 0,
          y: parseFloat(document.getElementById('pt3-b-y')?.value) || 0,
          z: parseFloat(document.getElementById('pt3-b-z')?.value) || 0
        };
        const m = parseFloat(document.getElementById('ratio3-m')?.value) || 1;
        const n = parseFloat(document.getElementById('ratio3-n')?.value) || 1;
        const type = document.getElementById('ratio3-type')?.value === 'internal';
        const res = CoordinateGeometryMathEngine.sectionFormula3D(p1, p2, m, n, type);
        this._renderResultPanel('plane3d-result-panel', res);
      });
    }

    // 3D Line
    const btnLine = document.getElementById('btn-calc-3d-line');
    if (btnLine) {
      this._on(btnLine, 'click', () => {
        const p0 = {
          x: parseFloat(document.getElementById('l3d-x0')?.value) || 0,
          y: parseFloat(document.getElementById('l3d-y0')?.value) || 0,
          z: parseFloat(document.getElementById('l3d-z0')?.value) || 0
        };
        const dr = {
          l: parseFloat(document.getElementById('l3d-l')?.value) || 1,
          m: parseFloat(document.getElementById('l3d-m')?.value) || 1,
          n: parseFloat(document.getElementById('l3d-n')?.value) || 1
        };
        const res = CoordinateGeometryMathEngine.line3D(p0, dr);
        this._renderResultPanel('plane3d-result-panel', res);
      });
    }

    // 3D Plane
    const btnPlane = document.getElementById('btn-calc-3d-plane');
    if (btnPlane) {
      this._on(btnPlane, 'click', () => {
        const A = parseFloat(document.getElementById('p3d-A')?.value) || 0;
        const B = parseFloat(document.getElementById('p3d-B')?.value) || 0;
        const C = parseFloat(document.getElementById('p3d-C')?.value) || 0;
        const D = parseFloat(document.getElementById('p3d-D')?.value) || 0;
        const res = CoordinateGeometryMathEngine.plane3D(A, B, C, D);
        this._renderResultPanel('plane3d-result-panel', res);

        if (this.activeVisualizer3D) {
          this.activeVisualizer3D.planes = [{ A, B, C, D }];
          this.activeVisualizer3D.render();
        }
      });
    }
  }

  _sync3DToolCanvas() {
    if (!this.activeVisualizer3D) return;
    const p1 = {
      name: 'A',
      x: parseFloat(document.getElementById('pt3-a-x')?.value) || 1,
      y: parseFloat(document.getElementById('pt3-a-y')?.value) || 2,
      z: parseFloat(document.getElementById('pt3-a-z')?.value) || 3
    };
    const p2 = {
      name: 'B',
      x: parseFloat(document.getElementById('pt3-b-x')?.value) || 4,
      y: parseFloat(document.getElementById('pt3-b-y')?.value) || 6,
      z: parseFloat(document.getElementById('pt3-b-z')?.value) || 8
    };

    this.activeVisualizer3D.points = [p1, p2];
    this.activeVisualizer3D.lines = [{ p1, p2, label: 'AB' }];
    this.activeVisualizer3D.render();
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // RESULT PANEL RENDERER
  // ─────────────────────────────────────────────────────────────────────────────

  _renderResultPanel(containerId, data) {
    const panel = document.getElementById(containerId);
    if (!panel) return;

    if (!data.success) {
      panel.style.display = 'block';
      panel.innerHTML = `
        <div class="geom-error-card">
          <div class="geom-error-title">Mathematical Error</div>
          <div class="geom-error-msg">${data.error || 'Computation could not be completed.'}</div>
        </div>
      `;
      return;
    }

    panel.style.display = 'block';
    const stepsHtml = data.steps ? data.steps.map((s, idx) => `
      <div class="geom-step-item">
        <div class="geom-step-num">Step ${idx + 1} • ${s.label}</div>
        <div class="geom-step-val">${s.value}</div>
      </div>
    `).join('') : '';

    panel.innerHTML = `
      <div class="geom-solution-card">
        <div class="geom-solution-header">
          <span class="geom-operation-tag">${data.operation || 'Result'}</span>
          <button class="geom-copy-btn" id="btn-copy-${containerId}" title="Copy Result">Copy Answer</button>
        </div>
        <div class="geom-solution-value">${data.result}</div>

        ${stepsHtml ? `
          <div class="geom-steps-accordion">
            <div class="geom-steps-title">Step-by-Step Derivation</div>
            <div class="geom-steps-list">${stepsHtml}</div>
          </div>
        ` : ''}
      </div>
    `;

    const copyBtn = document.getElementById(`btn-copy-${containerId}`);
    if (copyBtn) {
      this._on(copyBtn, 'click', () => {
        copyToClipboard(data.result);
        showToast('Result copied to clipboard!');
      });
    }
  }
}
