/**
 * OG - Interactive 2D Coordinate Plane
 * High-DPI interactive Canvas 2D plotter supporting:
 * - Click-to-create points, drag-to-move, rename, delete
 * - Smooth pan and wheel/touch zoom, reset view
 * - Live mouse coordinate probe
 * - Plotting points, segments, lines, circles, parabolas, ellipses, hyperbolas, triangles
 * - Measurement Mode (2 points: Δx, Δy, distance, slope, angle; 3 points: sides, area, angles)
 * - Color palette: Ivory, Gold, Deep Atlas Navy Liquid Glass aesthetics
 * ES6 Module
 */

export const GEOM_COLORS = {
  navy: '#0E1D61',
  gold: '#B89A5A',
  goldLight: '#D4B673',
  navyLight: '#283C9E',
  ivory: '#E8E0D2',
  gridMajor: 'rgba(14, 29, 97, 0.12)',
  gridMinor: 'rgba(14, 29, 97, 0.05)',
  axis: 'rgba(14, 29, 97, 0.85)',
  pointHalo: 'rgba(184, 154, 90, 0.28)',
  accentRed: '#ef4444',
  accentGreen: '#10b981'
};

export class CoordinatePlaneVisualizer {
  constructor(canvasElement, options = {}) {
    this.canvas = canvasElement;
    this.ctx = canvasElement.getContext('2d');

    // Coordinate boundaries
    this.xMin = options.xMin !== undefined ? options.xMin : -8;
    this.xMax = options.xMax !== undefined ? options.xMax : 8;
    this.yMin = options.yMin !== undefined ? options.yMin : -6;
    this.yMax = options.yMax !== undefined ? options.yMax : 6;

    this.defaultView = { xMin: this.xMin, xMax: this.xMax, yMin: this.yMin, yMax: this.yMax };

    // Geometry objects to render
    this.points = options.points || []; // [{ id, name, x, y, color, isSelected }]
    this.lines = options.lines || [];   // [{ type: 'line', A, B, C, m, c, color, label }]
    this.conics = options.conics || []; // [{ type: 'circle'|'parabola'|'ellipse'|'hyperbola', ... }]
    this.shapes = options.shapes || []; // [{ type: 'triangle'|'segment', points, ... }]

    // Interactivity
    this.isPanning = false;
    this.panStart = { x: 0, y: 0 };
    this.draggedPoint = null;
    this.hoveredPoint = null;
    this.mouseCoords = { x: 0, y: 0, rawX: 0, rawY: 0 };
    this.measurementMode = options.measurementMode || false;
    this.selectedPointsForMeasure = [];

    // Callbacks
    this.onPointChange = options.onPointChange || null;
    this.onMeasureChange = options.onMeasureChange || null;
    this.onCoordHover = options.onCoordHover || null;

    this.showGrid = true;
    this.showAxes = true;
    this.showLabels = true;

    this.init();
  }

  init() {
    this.setupResizeObserver();
    this.setupInteractivity();
    this.render();
  }

  setupResizeObserver() {
    if (typeof ResizeObserver !== 'undefined' && this.canvas.parentElement) {
      this.resizeObserver = new ResizeObserver(() => {
        this.resize();
        this.render();
      });
      this.resizeObserver.observe(this.canvas.parentElement);
    }
    this.resize();
  }

  resize() {
    const parent = this.canvas.parentElement;
    const rect = parent ? parent.getBoundingClientRect() : { width: 640, height: 440 };
    const width = Math.max(rect.width, 300);
    const height = Math.max(rect.height || 440, 320);

    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = width * dpr;
    this.canvas.height = height * dpr;
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;

    this.ctx.resetTransform?.();
    this.ctx.scale(dpr, dpr);
    this.displayWidth = width;
    this.displayHeight = height;
  }

  // Coordinate transformations
  toScreenX(x) {
    return ((x - this.xMin) / (this.xMax - this.xMin)) * this.displayWidth;
  }

  toScreenY(y) {
    return this.displayHeight - ((y - this.yMin) / (this.yMax - this.yMin)) * this.displayHeight;
  }

  toWorldX(screenX) {
    return this.xMin + (screenX / this.displayWidth) * (this.xMax - this.xMin);
  }

  toWorldY(screenY) {
    return this.yMin + ((this.displayHeight - screenY) / this.displayHeight) * (this.yMax - this.yMin);
  }

  setupInteractivity() {
    // Mouse down: detect point click / drag or start pan
    this.canvas.addEventListener('mousedown', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const sx = e.clientX - rect.left;
      const sy = e.clientY - rect.top;
      const wx = this.toWorldX(sx);
      const wy = this.toWorldY(sy);

      // Check if clicking existing point
      const clickedPt = this._findPointAt(sx, sy);
      if (clickedPt) {
        this.draggedPoint = clickedPt;

        if (this.measurementMode) {
          const idx = this.selectedPointsForMeasure.indexOf(clickedPt);
          if (idx === -1) {
            this.selectedPointsForMeasure.push(clickedPt);
            if (this.selectedPointsForMeasure.length > 3) this.selectedPointsForMeasure.shift();
          } else {
            this.selectedPointsForMeasure.splice(idx, 1);
          }
          this._updateMeasurements();
        }
        this.render();
        return;
      }

      // If alt key or middle click or just dragging empty space: Pan
      this.isPanning = true;
      this.panStart = { x: e.clientX, y: e.clientY };
    });

    // Double click to create new point
    this.canvas.addEventListener('dblclick', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const sx = e.clientX - rect.left;
      const sy = e.clientY - rect.top;
      const rawWx = this.toWorldX(sx);
      const rawWy = this.toWorldY(sy);

      // Snap to nearest 0.5 or integer if close
      const wx = Math.round(rawWx * 2) / 2;
      const wy = Math.round(rawWy * 2) / 2;

      this.addPoint(wx, wy);
    });

    // Mouse move: drag point or pan or probe
    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const sx = e.clientX - rect.left;
      const sy = e.clientY - rect.top;
      const wx = this.toWorldX(sx);
      const wy = this.toWorldY(sy);

      this.mouseCoords = { x: wx, y: wy, rawX: sx, rawY: sy };
      if (this.onCoordHover) this.onCoordHover(wx, wy);

      if (this.draggedPoint) {
        // Snap to grid if shift key held
        if (e.shiftKey) {
          this.draggedPoint.x = Math.round(wx);
          this.draggedPoint.y = Math.round(wy);
        } else {
          this.draggedPoint.x = parseFloat(wx.toFixed(2));
          this.draggedPoint.y = parseFloat(wy.toFixed(2));
        }
        if (this.onPointChange) this.onPointChange(this.draggedPoint, this.points);
        if (this.measurementMode) this._updateMeasurements();
        this.render();
        return;
      }

      if (this.isPanning) {
        const dx = e.clientX - this.panStart.x;
        const dy = e.clientY - this.panStart.y;
        this.panStart = { x: e.clientX, y: e.clientY };

        const worldDx = (dx / this.displayWidth) * (this.xMax - this.xMin);
        const worldDy = (dy / this.displayHeight) * (this.yMax - this.yMin);

        this.xMin -= worldDx;
        this.xMax -= worldDx;
        this.yMin += worldDy;
        this.yMax += worldDy;
        this.render();
        return;
      }

      // Hover detection
      const prevHover = this.hoveredPoint;
      this.hoveredPoint = this._findPointAt(sx, sy);
      if (prevHover !== this.hoveredPoint) {
        this.canvas.style.cursor = this.hoveredPoint ? 'grab' : 'crosshair';
        this.render();
      }
    });

    window.addEventListener('mouseup', () => {
      this.isPanning = false;
      this.draggedPoint = null;
    });

    // Wheel Zoom centered at cursor
    this.canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      const rect = this.canvas.getBoundingClientRect();
      const cursorSx = e.clientX - rect.left;
      const cursorSy = e.clientY - rect.top;

      const cursorWx = this.toWorldX(cursorSx);
      const cursorWy = this.toWorldY(cursorSy);

      const zoomFactor = e.deltaY > 0 ? 1.15 : 0.85;

      const newWidth = (this.xMax - this.xMin) * zoomFactor;
      const newHeight = (this.yMax - this.yMin) * zoomFactor;

      if (newWidth < 0.5 || newWidth > 200) return;

      const ratioX = (cursorWx - this.xMin) / (this.xMax - this.xMin);
      const ratioY = (cursorWy - this.yMin) / (this.yMax - this.yMin);

      this.xMin = cursorWx - ratioX * newWidth;
      this.xMax = this.xMin + newWidth;
      this.yMin = cursorWy - ratioY * newHeight;
      this.yMax = this.yMin + newHeight;

      this.render();
    }, { passive: false });

    // Touch support (Mobile drag & pan)
    let lastTouch = null;
    this.canvas.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        const touch = e.touches[0];
        const rect = this.canvas.getBoundingClientRect();
        const sx = touch.clientX - rect.left;
        const sy = touch.clientY - rect.top;
        const pt = this._findPointAt(sx, sy);
        if (pt) {
          this.draggedPoint = pt;
        } else {
          this.isPanning = true;
          lastTouch = { x: touch.clientX, y: touch.clientY };
        }
      }
    });

    this.canvas.addEventListener('touchmove', (e) => {
      if (e.touches.length === 1) {
        const touch = e.touches[0];
        const rect = this.canvas.getBoundingClientRect();
        const sx = touch.clientX - rect.left;
        const sy = touch.clientY - rect.top;
        const wx = this.toWorldX(sx);
        const wy = this.toWorldY(sy);

        if (this.draggedPoint) {
          e.preventDefault();
          this.draggedPoint.x = parseFloat(wx.toFixed(2));
          this.draggedPoint.y = parseFloat(wy.toFixed(2));
          if (this.onPointChange) this.onPointChange(this.draggedPoint, this.points);
          this.render();
        } else if (this.isPanning && lastTouch) {
          e.preventDefault();
          const dx = touch.clientX - lastTouch.x;
          const dy = touch.clientY - lastTouch.y;
          lastTouch = { x: touch.clientX, y: touch.clientY };
          const worldDx = (dx / this.displayWidth) * (this.xMax - this.xMin);
          const worldDy = (dy / this.displayHeight) * (this.yMax - this.yMin);
          this.xMin -= worldDx;
          this.xMax -= worldDx;
          this.yMin += worldDy;
          this.yMax += worldDy;
          this.render();
        }
      }
    }, { passive: false });

    this.canvas.addEventListener('touchend', () => {
      this.draggedPoint = null;
      this.isPanning = false;
      lastTouch = null;
    });
  }

  _findPointAt(screenX, screenY, tolerance = 12) {
    for (let i = this.points.length - 1; i >= 0; i--) {
      const pt = this.points[i];
      const sx = this.toScreenX(pt.x);
      const sy = this.toScreenY(pt.y);
      if (Math.hypot(screenX - sx, screenY - sy) <= tolerance) {
        return pt;
      }
    }
    return null;
  }

  addPoint(x, y, name = null) {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const pointName = name || letters[this.points.length % letters.length] || `P${this.points.length + 1}`;
    const newPt = {
      id: 'pt_' + Date.now() + Math.random().toString(36).substr(2, 4),
      name: pointName,
      x: parseFloat(x.toFixed(2)),
      y: parseFloat(y.toFixed(2)),
      color: GEOM_COLORS.gold
    };
    this.points.push(newPt);
    if (this.onPointChange) this.onPointChange(newPt, this.points);
    this.render();
    return newPt;
  }

  setPoints(pointsList) {
    this.points = pointsList.map((p, i) => ({
      id: p.id || 'pt_' + i,
      name: p.name || String.fromCharCode(65 + i),
      x: p.x,
      y: p.y,
      color: p.color || GEOM_COLORS.gold
    }));
    this.render();
  }

  clearPoints() {
    this.points = [];
    this.selectedPointsForMeasure = [];
    this.render();
  }

  resetView() {
    this.xMin = this.defaultView.xMin;
    this.xMax = this.defaultView.xMax;
    this.yMin = this.defaultView.yMin;
    this.yMax = this.defaultView.yMax;
    this.render();
  }

  zoom(factor) {
    const midX = (this.xMin + this.xMax) / 2;
    const midY = (this.yMin + this.yMax) / 2;
    const width = (this.xMax - this.xMin) * factor;
    const height = (this.yMax - this.yMin) * factor;

    this.xMin = midX - width / 2;
    this.xMax = midX + width / 2;
    this.yMin = midY - height / 2;
    this.yMax = midY + height / 2;
    this.render();
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER PIPELINE
  // ─────────────────────────────────────────────────────────────────────────────

  render() {
    const ctx = this.ctx;
    const w = this.displayWidth;
    const h = this.displayHeight;

    if (!w || !h) return;

    ctx.clearRect(0, 0, w, h);

    // Subtle ivory background
    ctx.fillStyle = '#FAF7F2';
    ctx.fillRect(0, 0, w, h);

    if (this.showGrid) this._drawGrid();
    if (this.showAxes) this._drawAxes();

    // Render Geometric Shapes (Triangles, Conics, Lines, Segments)
    this._drawConics();
    this._drawLines();
    this._drawShapes();
    this._drawPoints();
    this._drawHoverTooltip();
    this._drawMeasurementOverlay();
  }

  _drawGrid() {
    const ctx = this.ctx;
    const spanX = this.xMax - this.xMin;

    // Pick nice step size (0.5, 1, 2, 5, 10...)
    let step = 1;
    if (spanX > 40) step = 5;
    else if (spanX > 20) step = 2;
    else if (spanX < 6) step = 0.5;

    ctx.lineWidth = 1;

    // Minor vertical grid lines
    const startX = Math.floor(this.xMin / step) * step;
    for (let x = startX; x <= this.xMax; x += step) {
      const sx = this.toScreenX(x);
      ctx.strokeStyle = (Math.abs(x) < 1e-6) ? GEOM_COLORS.axis : GEOM_COLORS.gridMajor;
      ctx.beginPath();
      ctx.moveTo(sx, 0);
      ctx.lineTo(sx, this.displayHeight);
      ctx.stroke();
    }

    // Minor horizontal grid lines
    const startY = Math.floor(this.yMin / step) * step;
    for (let y = startY; y <= this.yMax; y += step) {
      const sy = this.toScreenY(y);
      ctx.strokeStyle = (Math.abs(y) < 1e-6) ? GEOM_COLORS.axis : GEOM_COLORS.gridMajor;
      ctx.beginPath();
      ctx.moveTo(0, sy);
      ctx.lineTo(this.displayWidth, sy);
      ctx.stroke();
    }
  }

  _drawAxes() {
    const ctx = this.ctx;
    const ox = this.toScreenX(0);
    const oy = this.toScreenY(0);

    ctx.strokeStyle = GEOM_COLORS.axis;
    ctx.lineWidth = 2;

    // X Axis
    if (oy >= 0 && oy <= this.displayHeight) {
      ctx.beginPath();
      ctx.moveTo(0, oy);
      ctx.lineTo(this.displayWidth, oy);
      ctx.stroke();

      // Arrow on positive X
      ctx.fillStyle = GEOM_COLORS.axis;
      ctx.beginPath();
      ctx.moveTo(this.displayWidth, oy);
      ctx.lineTo(this.displayWidth - 8, oy - 4);
      ctx.lineTo(this.displayWidth - 8, oy + 4);
      ctx.fill();
    }

    // Y Axis
    if (ox >= 0 && ox <= this.displayWidth) {
      ctx.beginPath();
      ctx.moveTo(ox, this.displayHeight);
      ctx.lineTo(ox, 0);
      ctx.stroke();

      // Arrow on positive Y
      ctx.fillStyle = GEOM_COLORS.axis;
      ctx.beginPath();
      ctx.moveTo(ox, 0);
      ctx.lineTo(ox - 4, 8);
      ctx.lineTo(ox + 4, 8);
      ctx.fill();
    }

    // Tick Numbers
    ctx.font = '10px JetBrains Mono, monospace';
    ctx.fillStyle = 'rgba(14, 29, 97, 0.75)';
    ctx.textAlign = 'center';

    const spanX = this.xMax - this.xMin;
    let step = spanX > 30 ? 5 : spanX > 15 ? 2 : 1;

    const startX = Math.floor(this.xMin / step) * step;
    for (let x = startX; x <= this.xMax; x += step) {
      if (Math.abs(x) < 1e-6) continue;
      const sx = this.toScreenX(x);
      const labelY = Math.min(Math.max(oy + 14, 14), this.displayHeight - 4);
      ctx.fillText(x.toString(), sx, labelY);
    }

    ctx.textAlign = 'right';
    const startY = Math.floor(this.yMin / step) * step;
    for (let y = startY; y <= this.yMax; y += step) {
      if (Math.abs(y) < 1e-6) continue;
      const sy = this.toScreenY(y);
      const labelX = Math.min(Math.max(ox - 6, 20), this.displayWidth - 6);
      ctx.fillText(y.toString(), labelX, sy + 3);
    }

    // Origin "O"
    if (ox >= 15 && ox <= this.displayWidth - 15 && oy >= 15 && oy <= this.displayHeight - 15) {
      ctx.textAlign = 'right';
      ctx.fillText('O', ox - 5, oy + 12);
    }
  }

  _drawPoints() {
    const ctx = this.ctx;

    this.points.forEach((pt) => {
      const sx = this.toScreenX(pt.x);
      const sy = this.toScreenY(pt.y);

      const isHovered = this.hoveredPoint === pt;
      const isSelected = this.selectedPointsForMeasure.includes(pt);

      // Gold Glow halo
      ctx.fillStyle = isSelected ? 'rgba(184, 154, 90, 0.45)' : isHovered ? 'rgba(184, 154, 90, 0.35)' : GEOM_COLORS.pointHalo;
      ctx.beginPath();
      ctx.arc(sx, sy, isHovered || isSelected ? 12 : 8, 0, Math.PI * 2);
      ctx.fill();

      // Point core circle
      ctx.fillStyle = isSelected ? '#B89A5A' : GEOM_COLORS.navy;
      ctx.beginPath();
      ctx.arc(sx, sy, 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.lineWidth = 1.5;
      ctx.strokeStyle = '#FFFFFF';
      ctx.stroke();

      // Point label: A(2, 3)
      if (this.showLabels) {
        ctx.font = '600 12px Outfit, sans-serif';
        ctx.fillStyle = GEOM_COLORS.navy;
        ctx.textAlign = 'left';
        ctx.fillText(`${pt.name}(${pt.x}, ${pt.y})`, sx + 8, sy - 6);
      }
    });

    // If at least 2 points, draw connecting segment with distance
    if (this.points.length >= 2) {
      for (let i = 0; i < this.points.length - 1; i++) {
        const p1 = this.points[i];
        const p2 = this.points[i + 1];
        const sx1 = this.toScreenX(p1.x);
        const sy1 = this.toScreenY(p1.y);
        const sx2 = this.toScreenX(p2.x);
        const sy2 = this.toScreenY(p2.y);

        ctx.strokeStyle = 'rgba(184, 154, 90, 0.65)';
        ctx.lineWidth = 1.8;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(sx1, sy1);
        ctx.lineTo(sx2, sy2);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }
  }

  _drawLines() {
    const ctx = this.ctx;
    this.lines.forEach(l => {
      ctx.strokeStyle = l.color || GEOM_COLORS.navy;
      ctx.lineWidth = 2.2;

      // Line: y = mx + c or Ax + By + C = 0
      let x1 = this.xMin, x2 = this.xMax;
      let y1, y2;

      if (l.isVertical || (l.B !== undefined && Math.abs(l.B) < 1e-9)) {
        const vx = l.xVal !== undefined ? l.xVal : (-l.C / l.A);
        const sx = this.toScreenX(vx);
        ctx.beginPath();
        ctx.moveTo(sx, 0);
        ctx.lineTo(sx, this.displayHeight);
        ctx.stroke();
        return;
      }

      if (l.m !== undefined && l.c !== undefined) {
        y1 = l.m * x1 + l.c;
        y2 = l.m * x2 + l.c;
      } else if (l.A !== undefined && l.B !== undefined && l.C !== undefined) {
        y1 = (-l.A * x1 - l.C) / l.B;
        y2 = (-l.A * x2 - l.C) / l.B;
      }

      ctx.beginPath();
      ctx.moveTo(this.toScreenX(x1), this.toScreenY(y1));
      ctx.lineTo(this.toScreenX(x2), this.toScreenY(y2));
      ctx.stroke();

      if (l.label) {
        ctx.font = '11px JetBrains Mono, monospace';
        ctx.fillStyle = l.color || GEOM_COLORS.navy;
        ctx.fillText(l.label, this.toScreenX(x2) - 60, this.toScreenY(y2) - 6);
      }
    });
  }

  _drawConics() {
    const ctx = this.ctx;

    this.conics.forEach(c => {
      ctx.strokeStyle = c.color || GEOM_COLORS.gold;
      ctx.lineWidth = 2.2;

      if (c.type === 'circle') {
        const sx = this.toScreenX(c.h);
        const sy = this.toScreenY(c.k);
        const sr = (c.r / (this.xMax - this.xMin)) * this.displayWidth;

        ctx.beginPath();
        ctx.arc(sx, sy, Math.max(1, sr), 0, Math.PI * 2);
        ctx.stroke();

        // Center marker
        ctx.fillStyle = GEOM_COLORS.navy;
        ctx.beginPath();
        ctx.arc(sx, sy, 3, 0, Math.PI * 2);
        ctx.fill();

        // Radius line
        ctx.setLineDash([3, 3]);
        ctx.strokeStyle = 'rgba(184, 154, 90, 0.7)';
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(sx + sr, sy);
        ctx.stroke();
        ctx.setLineDash([]);
      } else if (c.type === 'parabola') {
        // Parametric y^2 = 4ax  =>  x = y² / 4a
        const a = c.a || 1;
        ctx.beginPath();
        let started = false;
        for (let y = this.yMin - 5; y <= this.yMax + 5; y += 0.1) {
          const x = (y * y) / (4 * a);
          const sx = this.toScreenX(x);
          const sy = this.toScreenY(y);
          if (!started) { ctx.moveTo(sx, sy); started = true; }
          else { ctx.lineTo(sx, sy); }
        }
        ctx.stroke();

        // Focus & Directrix
        const sfx = this.toScreenX(a);
        const sfy = this.toScreenY(0);
        ctx.fillStyle = GEOM_COLORS.accentRed;
        ctx.beginPath();
        ctx.arc(sfx, sfy, 4, 0, Math.PI * 2);
        ctx.fill();

        // Directrix line x = -a
        const sdx = this.toScreenX(-a);
        ctx.setLineDash([4, 4]);
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.6)';
        ctx.beginPath();
        ctx.moveTo(sdx, 0);
        ctx.lineTo(sdx, this.displayHeight);
        ctx.stroke();
        ctx.setLineDash([]);
      } else if (c.type === 'ellipse') {
        // (x-h)²/a² + (y-k)²/b² = 1
        const a = c.a || 5;
        const b = c.b || 3;
        const h = c.h || 0;
        const k = c.k || 0;

        ctx.beginPath();
        for (let t = 0; t <= Math.PI * 2 + 0.05; t += 0.05) {
          const x = h + a * Math.cos(t);
          const y = k + b * Math.sin(t);
          const sx = this.toScreenX(x);
          const sy = this.toScreenY(y);
          if (t === 0) ctx.moveTo(sx, sy);
          else ctx.lineTo(sx, sy);
        }
        ctx.stroke();

        // Draw Foci
        const focalDist = Math.sqrt(Math.abs(a * a - b * b));
        const f1x = this.toScreenX(a >= b ? h - focalDist : h);
        const f1y = this.toScreenY(a >= b ? k : k - focalDist);
        const f2x = this.toScreenX(a >= b ? h + focalDist : h);
        const f2y = this.toScreenY(a >= b ? k : k + focalDist);

        ctx.fillStyle = GEOM_COLORS.navy;
        [ [f1x, f1y], [f2x, f2y] ].forEach(([fx, fy]) => {
          ctx.beginPath();
          ctx.arc(fx, fy, 3, 0, Math.PI * 2);
          ctx.fill();
        });
      } else if (c.type === 'hyperbola') {
        // x²/a² - y²/b² = 1
        const a = c.a || 4;
        const b = c.b || 3;

        // Right branch: x = a * cosh(t), y = b * sinh(t)
        ctx.beginPath();
        let started = false;
        for (let t = -3; t <= 3; t += 0.05) {
          const x = a * Math.cosh(t);
          const y = b * Math.sinh(t);
          const sx = this.toScreenX(x);
          const sy = this.toScreenY(y);
          if (!started) { ctx.moveTo(sx, sy); started = true; }
          else { ctx.lineTo(sx, sy); }
        }
        ctx.stroke();

        // Left branch: x = -a * cosh(t)
        ctx.beginPath();
        started = false;
        for (let t = -3; t <= 3; t += 0.05) {
          const x = -a * Math.cosh(t);
          const y = b * Math.sinh(t);
          const sx = this.toScreenX(x);
          const sy = this.toScreenY(y);
          if (!started) { ctx.moveTo(sx, sy); started = true; }
          else { ctx.lineTo(sx, sy); }
        }
        ctx.stroke();

        // Asymptotes y = ± (b/a)x
        ctx.setLineDash([4, 4]);
        ctx.strokeStyle = 'rgba(14, 29, 97, 0.4)';
        const slope = b / a;
        ctx.beginPath();
        ctx.moveTo(this.toScreenX(this.xMin), this.toScreenY(-slope * this.xMin));
        ctx.lineTo(this.toScreenX(this.xMax), this.toScreenY(-slope * this.xMax));
        ctx.moveTo(this.toScreenX(this.xMin), this.toScreenY(slope * this.xMin));
        ctx.lineTo(this.toScreenX(this.xMax), this.toScreenY(slope * this.xMax));
        ctx.stroke();
        ctx.setLineDash([]);
      }
    });
  }

  _drawShapes() {
    const ctx = this.ctx;
    this.shapes.forEach(s => {
      if (s.type === 'triangle' && s.points && s.points.length === 3) {
        const [p1, p2, p3] = s.points;
        const sx1 = this.toScreenX(p1.x), sy1 = this.toScreenY(p1.y);
        const sx2 = this.toScreenX(p2.x), sy2 = this.toScreenY(p2.y);
        const sx3 = this.toScreenX(p3.x), sy3 = this.toScreenY(p3.y);

        // Semi-transparent shaded interior
        ctx.fillStyle = 'rgba(184, 154, 90, 0.12)';
        ctx.beginPath();
        ctx.moveTo(sx1, sy1);
        ctx.lineTo(sx2, sy2);
        ctx.lineTo(sx3, sy3);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = GEOM_COLORS.gold;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Centroid marker G
        const gx = (p1.x + p2.x + p3.x) / 3;
        const gy = (p1.y + p2.y + p3.y) / 3;
        const sgx = this.toScreenX(gx), sgy = this.toScreenY(gy);
        ctx.fillStyle = GEOM_COLORS.navy;
        ctx.beginPath();
        ctx.arc(sgx, sgy, 3.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.font = 'bold 11px Outfit, sans-serif';
        ctx.fillText('G', sgx + 5, sgy - 5);
      }
    });
  }

  _drawHoverTooltip() {
    if (!this.hoveredPoint) return;
    const ctx = this.ctx;
    const pt = this.hoveredPoint;
    const sx = this.toScreenX(pt.x);
    const sy = this.toScreenY(pt.y);

    const text = `${pt.name}: (${pt.x}, ${pt.y})`;
    ctx.font = '11px JetBrains Mono, monospace';
    const textWidth = ctx.measureText(text).width;

    const pad = 6;
    const bx = sx + 12;
    const by = sy - 28;

    ctx.fillStyle = 'rgba(14, 29, 97, 0.92)';
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(bx, by, textWidth + pad * 2, 22, 6) : ctx.rect(bx, by, textWidth + pad * 2, 22);
    ctx.fill();

    ctx.fillStyle = '#E8E0D2';
    ctx.textAlign = 'left';
    ctx.fillText(text, bx + pad, by + 15);
  }

  _drawMeasurementOverlay() {
    if (!this.measurementMode || this.selectedPointsForMeasure.length < 2) return;
    const ctx = this.ctx;
    const [p1, p2] = this.selectedPointsForMeasure;

    const sx1 = this.toScreenX(p1.x), sy1 = this.toScreenY(p1.y);
    const sx2 = this.toScreenX(p2.x), sy2 = this.toScreenY(p2.y);

    // Connecting measurement line
    ctx.strokeStyle = GEOM_COLORS.accentGreen;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(sx1, sy1);
    ctx.lineTo(sx2, sy2);
    ctx.stroke();

    const midSx = (sx1 + sx2) / 2;
    const midSy = (sy1 + sy2) / 2;
    const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y);

    ctx.font = 'bold 12px JetBrains Mono, monospace';
    ctx.fillStyle = GEOM_COLORS.navy;
    ctx.fillText(`d = ${dist.toFixed(2)}`, midSx + 8, midSy - 8);
  }

  _updateMeasurements() {
    if (!this.onMeasureChange) return;
    if (this.selectedPointsForMeasure.length === 2) {
      const [p1, p2] = this.selectedPointsForMeasure;
      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const dist = Math.hypot(dx, dy);
      const slope = Math.abs(dx) < 1e-9 ? 'Undefined' : (dy / dx).toFixed(4);
      let angle = (Math.atan2(dy, dx) * 180) / Math.PI;
      if (angle < 0) angle += 360;

      this.onMeasureChange({
        count: 2,
        p1, p2,
        dx: dx.toFixed(2),
        dy: dy.toFixed(2),
        dist: dist.toFixed(4),
        slope,
        angle: angle.toFixed(2)
      });
    } else if (this.selectedPointsForMeasure.length === 3) {
      const [p1, p2, p3] = this.selectedPointsForMeasure;
      const d12 = Math.hypot(p2.x - p1.x, p2.y - p1.y);
      const d23 = Math.hypot(p3.x - p2.x, p3.y - p2.y);
      const d31 = Math.hypot(p1.x - p3.x, p1.y - p3.y);
      const area = 0.5 * Math.abs(p1.x * (p2.y - p3.y) + p2.x * (p3.y - p1.y) + p3.x * (p1.y - p2.y));

      this.onMeasureChange({
        count: 3,
        p1, p2, p3,
        sideA: d12.toFixed(3),
        sideB: d23.toFixed(3),
        sideC: d31.toFixed(3),
        perimeter: (d12 + d23 + d31).toFixed(3),
        area: area.toFixed(3)
      });
    }
  }
}
