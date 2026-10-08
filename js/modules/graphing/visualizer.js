/**
 * OG - Dedicated Multi-Function Graph Calculator Visualizer
 * High-DPI interactive 2D Canvas plotter supporting:
 * - Arbitrary multiple function expressions
 * - Radians internally for trigonometric functions
 * - Smooth drag-to-pan
 * - Mouse-centered zoom (wheel + buttons)
 * - Reset view
 * - Grid and axis tick labels
 * - Snap-to-curve coordinate probe on hover
 * - High-DPI Retina scaling and ResizeObserver
 * ES6 Module
 */

import { MathExpression, SymbolicDifferentiator } from '../../math/calculus.js';

export const GRAPH_COLOR_PALETTE = [
  '#B89A5A', // Gold (Primary function)
  '#0E1D61', // Deep Atlas Navy (Secondary)
  '#C5A059', // Light Gold
  '#283C9E', // Mid Navy
  '#8C6E2E', // Deep Gold / Bronze
  '#3B4EAF', // Cobalt Navy
  '#D4B673', // Pale Gold
  '#091442'  // Deep Navy
];

export class GraphCalculatorVisualizer {
  constructor(canvasElement, options = {}) {
    this.canvas = canvasElement;
    this.ctx = canvasElement.getContext('2d');

    // Expression items: Array of { id, text, expr, color, visible, showDerivative }
    this.expressions = options.expressions || [];

    // View boundaries
    this.xMin = options.xMin !== undefined ? options.xMin : -6;
    this.xMax = options.xMax !== undefined ? options.xMax : 6;
    this.yMin = options.yMin !== undefined ? options.yMin : -5;
    this.yMax = options.yMax !== undefined ? options.yMax : 5;

    // Default view memory for reset
    this.defaultView = {
      xMin: this.xMin,
      xMax: this.xMax,
      yMin: this.yMin,
      yMax: this.yMax
    };

    // Interaction states
    this.isPanning = false;
    this.panStart = { x: 0, y: 0 };
    this.hoverPoint = null; // { x, y, curveIndex, color }
    this.resizeObserver = null;
    this.onViewChange = options.onViewChange || null;

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
    const rect = parent ? parent.getBoundingClientRect() : { width: 640, height: 480 };
    const width = Math.max(rect.width, 320);
    const height = Math.max(rect.height || 480, 360);

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

  setupInteractivity() {
    // 1. Mouse Drag Pan
    this.canvas.addEventListener('mousedown', (e) => {
      this.isPanning = true;
      this.panStart = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('mousemove', (e) => {
      if (this.isPanning) {
        const dx = e.clientX - this.panStart.x;
        const dy = e.clientY - this.panStart.y;
        this.panStart = { x: e.clientX, y: e.clientY };
        this.panPixels(dx, dy);
        return;
      }

      // Hover Probe (when not panning and inside canvas)
      const rect = this.canvas.getBoundingClientRect();
      if (
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom
      ) {
        const cx = e.clientX - rect.left;
        const cy = e.clientY - rect.top;
        this.updateProbe(cx, cy);
      } else {
        if (this.hoverPoint) {
          this.hoverPoint = null;
          this.render();
        }
      }
    });

    window.addEventListener('mouseup', () => {
      if (this.isPanning) {
        this.isPanning = false;
      }
    });

    this.canvas.addEventListener('mouseleave', () => {
      this.hoverPoint = null;
      this.render();
    });

    // 2. Mouse Wheel Zoom
    this.canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      const rect = this.canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const mathCenter = {
        x: this.canvasToMathX(mouseX),
        y: this.canvasToMathY(mouseY)
      };

      const factor = e.deltaY < 0 ? 0.88 : 1.14;
      this.zoomAt(factor, mathCenter.x, mathCenter.y);
    }, { passive: false });

    // 3. Touch Support (Mobile)
    let lastTouch = null;
    this.canvas.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        lastTouch = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    }, { passive: true });

    this.canvas.addEventListener('touchmove', (e) => {
      if (e.touches.length === 1 && lastTouch) {
        const dx = e.touches[0].clientX - lastTouch.x;
        const dy = e.touches[0].clientY - lastTouch.y;
        lastTouch = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        this.panPixels(dx, dy);
      }
    }, { passive: true });

    this.canvas.addEventListener('touchend', () => {
      lastTouch = null;
    });
  }

  // Coordinate transforms
  mathToCanvasX(x) {
    return ((x - this.xMin) / (this.xMax - this.xMin)) * this.displayWidth;
  }

  mathToCanvasY(y) {
    return this.displayHeight - ((y - this.yMin) / (this.yMax - this.yMin)) * this.displayHeight;
  }

  canvasToMathX(cx) {
    return this.xMin + (cx / this.displayWidth) * (this.xMax - this.xMin);
  }

  canvasToMathY(cy) {
    return this.yMax - (cy / this.displayHeight) * (this.yMax - this.yMin);
  }

  // Navigation actions
  panPixels(dx, dy) {
    const xSpan = this.xMax - this.xMin;
    const ySpan = this.yMax - this.yMin;

    const mathDx = (dx / this.displayWidth) * xSpan;
    const mathDy = (dy / this.displayHeight) * ySpan;

    this.xMin -= mathDx;
    this.xMax -= mathDx;
    this.yMin += mathDy;
    this.yMax += mathDy;

    this.notifyViewChange();
    this.render();
  }

  zoom(factor) {
    const centerX = (this.xMin + this.xMax) / 2;
    const centerY = (this.yMin + this.yMax) / 2;
    this.zoomAt(factor, centerX, centerY);
  }

  zoomAt(factor, cx, cy) {
    const newHalfW = ((this.xMax - this.xMin) * factor) / 2;
    const newHalfH = ((this.yMax - this.yMin) * factor) / 2;

    this.xMin = cx - (cx - this.xMin) * factor;
    this.xMax = cx + (this.xMax - cx) * factor;
    this.yMin = cy - (cy - this.yMin) * factor;
    this.yMax = cy + (this.yMax - cy) * factor;

    this.notifyViewChange();
    this.render();
  }

  resetView() {
    this.xMin = this.defaultView.xMin;
    this.xMax = this.defaultView.xMax;
    this.yMin = this.defaultView.yMin;
    this.yMax = this.defaultView.yMax;
    this.notifyViewChange();
    this.render();
  }

  setDomain(xMin, xMax, yMin, yMax) {
    this.xMin = xMin;
    this.xMax = xMax;
    this.yMin = yMin;
    this.yMax = yMax;
    this.notifyViewChange();
    this.render();
  }

  notifyViewChange() {
    if (typeof this.onViewChange === 'function') {
      this.onViewChange({
        xMin: this.xMin,
        xMax: this.xMax,
        yMin: this.yMin,
        yMax: this.yMax
      });
    }
  }

  setExpressions(exprList) {
    this.expressions = exprList;
    this.render();
  }

  updateProbe(cx, cy) {
    const mathX = this.canvasToMathX(cx);
    const mathY = this.canvasToMathY(cy);

    let nearest = null;
    let minDist = Infinity;

    // Find closest curve at mathX
    this.expressions.forEach((item, idx) => {
      if (!item.visible || !item.expr) return;
      const yVal = item.expr.evaluate(mathX);
      if (!Number.isFinite(yVal)) return;

      const curveCy = this.mathToCanvasY(yVal);
      const dist = Math.abs(cy - curveCy);

      if (dist < 45 && dist < minDist) {
        minDist = dist;
        nearest = {
          x: mathX,
          y: yVal,
          label: item.rawText || item.text,
          color: item.color || '#B89A5A'
        };
      }
    });

    if (nearest) {
      this.hoverPoint = nearest;
    } else {
      this.hoverPoint = {
        x: mathX,
        y: mathY,
        label: null,
        color: '#94a3b8'
      };
    }
    this.render();
  }

  // Master Render Pass
  render() {
    const ctx = this.ctx;
    const w = this.displayWidth;
    const h = this.displayHeight;

    if (!w || !h) return;

    ctx.clearRect(0, 0, w, h);

    // 1. Luxury Ivory Graph Surface
    ctx.fillStyle = '#E8E0D2';
    ctx.fillRect(0, 0, w, h);

    // 2. Coordinate Grid & Axes (Ivory + Deep Atlas Navy + Gold)
    this.drawGridAndAxes(ctx, w, h);

    // 3. Plot each visible function
    this.expressions.forEach(item => {
      if (!item.visible || !item.expr) return;

      // Primary curve
      this.drawCurve(ctx, item.expr, item.color, 2.5);

      // Derivative overlay (if enabled)
      if (item.showDerivative && item.derivExpr) {
        this.drawCurve(ctx, item.derivExpr, item.color, 1.8, [4, 4]);
      }
    });

    // 4. Cursor Probe HUD
    if (this.hoverPoint) {
      this.drawProbeOverlay(ctx);
    }
  }

  drawGridAndAxes(ctx, w, h) {
    const xZero = this.mathToCanvasX(0);
    const yZero = this.mathToCanvasY(0);

    const xSpan = this.xMax - this.xMin;
    const ySpan = this.yMax - this.yMin;

    // Dynamic grid step calculation
    const calcStep = (span) => {
      if (span <= 4) return 0.5;
      if (span <= 12) return 1;
      if (span <= 30) return 2;
      if (span <= 80) return 5;
      return 10;
    };

    const xStep = calcStep(xSpan);
    const yStep = calcStep(ySpan);

    // Minor/Major grid lines: Subtle Gold & Deep Navy lines
    ctx.strokeStyle = 'rgba(184, 154, 90, 0.20)';
    ctx.lineWidth = 1;

    // X Grid
    const firstX = Math.floor(this.xMin / xStep) * xStep;
    for (let x = firstX; x <= this.xMax; x += xStep) {
      const cx = this.mathToCanvasX(x);
      ctx.beginPath();
      ctx.moveTo(cx, 0);
      ctx.lineTo(cx, h);
      ctx.stroke();

      if (Math.abs(x) > 1e-4) {
        ctx.fillStyle = 'rgba(14, 29, 97, 0.70)';
        ctx.font = '600 10px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        const labelY = Math.min(Math.max(yZero + 14, 14), h - 8);
        ctx.fillText(Number(x.toFixed(2)).toString(), cx, labelY);
      }
    }

    // Y Grid
    const firstY = Math.floor(this.yMin / yStep) * yStep;
    for (let y = firstY; y <= this.yMax; y += yStep) {
      const cy = this.mathToCanvasY(y);
      ctx.beginPath();
      ctx.moveTo(0, cy);
      ctx.lineTo(w, cy);
      ctx.stroke();

      if (Math.abs(y) > 1e-4) {
        ctx.fillStyle = 'rgba(14, 29, 97, 0.70)';
        ctx.font = '600 10px "JetBrains Mono", monospace';
        ctx.textAlign = 'right';
        const labelX = Math.min(Math.max(xZero - 6, 26), w - 6);
        ctx.fillText(Number(y.toFixed(2)).toString(), labelX, cy + 3);
      }
    }

    // Main Axes: X = 0 and Y = 0 (Deep Atlas Navy)
    ctx.strokeStyle = 'rgba(14, 29, 97, 0.85)';
    ctx.lineWidth = 2;

    // X axis line
    ctx.beginPath();
    ctx.moveTo(0, yZero);
    ctx.lineTo(w, yZero);
    ctx.stroke();

    // Y axis line
    ctx.beginPath();
    ctx.moveTo(xZero, 0);
    ctx.lineTo(xZero, h);
    ctx.stroke();

    // Origin 0 marker
    ctx.fillStyle = '#0E1D61';
    ctx.font = '700 11px "JetBrains Mono", monospace';
    ctx.textAlign = 'right';
    ctx.fillText('0', xZero - 6, yZero + 14);
  }

  drawCurve(ctx, expr, color, lineWidth = 2.5, lineDash = []) {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.setLineDash(lineDash);

    // Subtle Gold halo
    ctx.shadowColor = 'rgba(184, 154, 90, 0.35)';
    ctx.shadowBlur = 6;

    ctx.beginPath();
    let started = false;
    const steps = 400;

    for (let i = 0; i <= steps; i++) {
      const x = this.xMin + (i / steps) * (this.xMax - this.xMin);
      const y = expr.evaluate(x);

      if (!Number.isFinite(y) || Number.isNaN(y)) {
        started = false;
        continue;
      }

      // Filter asymptote spikes
      if (y < this.yMin - 20 || y > this.yMax + 20) {
        started = false;
        continue;
      }

      const cx = this.mathToCanvasX(x);
      const cy = this.mathToCanvasY(y);

      if (!started) {
        ctx.moveTo(cx, cy);
        started = true;
      } else {
        ctx.lineTo(cx, cy);
      }
    }

    ctx.stroke();
    ctx.restore();
  }

  drawProbeOverlay(ctx) {
    const pt = this.hoverPoint;
    const cx = this.mathToCanvasX(pt.x);
    const cy = this.mathToCanvasY(pt.y);

    ctx.save();

    // Crosshair guidelines (Deep Atlas Navy subtle)
    ctx.strokeStyle = 'rgba(14, 29, 97, 0.35)';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);

    ctx.beginPath();
    ctx.moveTo(cx, 0);
    ctx.lineTo(cx, this.displayHeight);
    ctx.moveTo(0, cy);
    ctx.lineTo(this.displayWidth, cy);
    ctx.stroke();

    // Point dot: Gold fill with Navy ring
    ctx.beginPath();
    ctx.arc(cx, cy, 5, 0, Math.PI * 2);
    ctx.fillStyle = pt.color || '#B89A5A';
    ctx.shadowColor = 'rgba(184, 154, 90, 0.5)';
    ctx.shadowBlur = 8;
    ctx.fill();
    ctx.strokeStyle = '#0E1D61';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Tooltip Card: Deep Atlas Navy with Gold border and Ivory text
    const text1 = `(${pt.x.toFixed(2)}, ${pt.y.toFixed(2)})`;
    const text2 = pt.label ? pt.label : null;

    ctx.font = '600 11px "JetBrains Mono", monospace';
    const w1 = ctx.measureText(text1).width;
    const w2 = text2 ? ctx.measureText(text2).width : 0;
    const boxW = Math.max(w1, w2) + 20;
    const boxH = text2 ? 40 : 26;

    const boxX = Math.min(Math.max(cx - boxW / 2, 10), this.displayWidth - boxW - 10);
    const boxY = cy > 50 ? cy - boxH - 12 : cy + 14;

    ctx.fillStyle = '#0E1D61';
    ctx.strokeStyle = '#B89A5A';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(boxX, boxY, boxW, boxH, 8) : ctx.rect(boxX, boxY, boxW, boxH);
    ctx.fill();
    ctx.stroke();

    ctx.textAlign = 'center';
    if (text2) {
      ctx.fillStyle = '#E8E0D2';
      ctx.fillText(text2, boxX + boxW / 2, boxY + 16);
      ctx.fillStyle = '#B89A5A';
      ctx.fillText(text1, boxX + boxW / 2, boxY + 32);
    } else {
      ctx.fillStyle = '#E8E0D2';
      ctx.fillText(text1, boxX + boxW / 2, boxY + 17);
    }

    ctx.restore();
  }

  destroy() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
  }
}
