/**
 * OG - Interactive 2D Calculus Graph Visualizer
 * High-DPI Canvas plotter with curve plotting, tangent & normal overlay,
 * shaded integration regions, critical point markers, and dynamic mouse probe.
 * ES6 Module
 */

import { MathExpression } from '../../math/calculus.js';

export class CalculusGraphVisualizer {
  constructor(canvasElement, options = {}) {
    this.canvas = canvasElement;
    this.ctx = canvasElement.getContext('2d');

    // Functions
    this.exprStr = options.exprStr || 'x^3 - 3*x';
    this.exprGStr = options.exprGStr || null;
    this.showDerivative = options.showDerivative || false;
    this.derivStr = options.derivStr || null;

    // Initial view boundaries for reset
    this.initialXMin = options.xMin !== undefined ? options.xMin : -4.5;
    this.initialXMax = options.xMax !== undefined ? options.xMax : 4.5;
    this.initialYMin = options.yMin !== undefined ? options.yMin : -5.0;
    this.initialYMax = options.yMax !== undefined ? options.yMax : 5.0;

    // View boundaries
    this.xMin = this.initialXMin;
    this.xMax = this.initialXMax;
    this.yMin = this.initialYMin;
    this.yMax = this.initialYMax;

    // Tangent / Normal point
    this.tangentX0 = options.tangentX0 !== undefined ? options.tangentX0 : null;
    this.showNormal = options.showNormal || false;

    // Second derivative curve support
    this.showSecondDerivative = options.showSecondDerivative || false;
    this.secondDerivStr = options.secondDerivStr || null;

    // Shaded area bounds [a, b]
    this.shadeBounds = options.shadeBounds || null; // { a: number, b: number, type: 'under' | 'between' }

    // Critical points / Extrema markers
    this.markers = options.markers || []; // [{ x, y, label, type: 'max'|'min'|'root' }]

    // Interactivity callbacks
    this.onPointSelect = options.onPointSelect || null;

    // Hover & Pan state
    this.hoverX = null;
    this.isPanning = false;
    this.panStartX = 0;
    this.panStartY = 0;
    this.panOrigXMin = this.xMin;
    this.panOrigXMax = this.xMax;
    this.panOrigYMin = this.yMin;
    this.panOrigYMax = this.yMax;
    this.hasDragged = false;
    this.resizeObserver = null;

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
    const rect = parent ? parent.getBoundingClientRect() : { width: 640 };
    const width = Math.max(rect.width, 320);
    const height = Math.max(Math.min(rect.width * 0.52, 440), 280);

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
    this.canvas.style.cursor = 'crosshair';

    this.canvas.addEventListener('mousedown', (e) => {
      this.isPanning = true;
      this.hasDragged = false;
      this.panStartX = e.clientX;
      this.panStartY = e.clientY;
      this.panOrigXMin = this.xMin;
      this.panOrigXMax = this.xMax;
      this.panOrigYMin = this.yMin;
      this.panOrigYMax = this.yMax;
      this.canvas.style.cursor = 'grabbing';
    });

    window.addEventListener('mouseup', () => {
      if (this.isPanning) {
        this.isPanning = false;
        this.canvas.style.cursor = 'crosshair';
      }
    });

    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      this.hoverX = this.canvasToMathX(mouseX);

      if (this.isPanning) {
        const dx = e.clientX - this.panStartX;
        const dy = e.clientY - this.panStartY;
        if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
          this.hasDragged = true;
        }
        const mathDx = (dx / this.displayWidth) * (this.panOrigXMax - this.panOrigXMin);
        const mathDy = (dy / this.displayHeight) * (this.panOrigYMax - this.panOrigYMin);

        this.xMin = this.panOrigXMin - mathDx;
        this.xMax = this.panOrigXMax - mathDx;
        this.yMin = this.panOrigYMin + mathDy;
        this.yMax = this.panOrigYMax + mathDy;
      }

      this.render();
    });

    this.canvas.addEventListener('mouseleave', () => {
      this.hoverX = null;
      if (!this.isPanning) this.render();
    });

    this.canvas.addEventListener('click', (e) => {
      if (this.hasDragged) return;
      const rect = this.canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      const mathX = this.canvasToMathX(mouseX);
      const mathY = this.canvasToMathY(mouseY);
      const expr = new MathExpression(this.exprStr);
      const fx = expr.isValid() ? expr.evaluate(mathX) : null;

      if (typeof this.onPointSelect === 'function') {
        this.onPointSelect({ x: mathX, y: mathY, fx });
      }
    });

    this.canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      const factor = e.deltaY < 0 ? 0.9 : 1.1;
      const rect = this.canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      const mathX = this.canvasToMathX(mouseX);
      const mathY = this.canvasToMathY(mouseY);
      this.zoom(factor, mathX, mathY);
    }, { passive: false });
  }

  zoom(factor = 1.2, centerX = null, centerY = null) {
    const cx = centerX !== null ? centerX : (this.xMin + this.xMax) / 2;
    const cy = centerY !== null ? centerY : (this.yMin + this.yMax) / 2;

    const halfSpanX = ((this.xMax - this.xMin) * factor) / 2;
    const halfSpanY = ((this.yMax - this.yMin) * factor) / 2;

    this.xMin = cx - halfSpanX;
    this.xMax = cx + halfSpanX;
    this.yMin = cy - halfSpanY;
    this.yMax = cy + halfSpanY;

    this.render();
  }

  resetView() {
    this.xMin = this.initialXMin;
    this.xMax = this.initialXMax;
    this.yMin = this.initialYMin;
    this.yMax = this.initialYMax;
    this.render();
  }

  setTangentPoint(x0) {
    this.tangentX0 = x0;
    this.render();
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

  updateOptions(newOptions = {}) {
    Object.assign(this, newOptions);
    this.render();
  }

  render() {
    const ctx = this.ctx;
    const w = this.displayWidth;
    const h = this.displayHeight;

    if (!w || !h) return;

    ctx.clearRect(0, 0, w, h);

    // 1. Background Light Liquid Glass Canvas
    const bgGrad = ctx.createLinearGradient(0, 0, w, h);
    bgGrad.addColorStop(0, '#EFE8DC');
    bgGrad.addColorStop(1, '#E8E0D2');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // 2. Coordinate Grid & Axes
    this.drawGrid(ctx, w, h);

    // 3. Shaded Integration Region (if active)
    if (this.shadeBounds) {
      this.drawShadedArea(ctx);
    }

    // 4. Secondary Function Curve g(x) (if active)
    if (this.exprGStr) {
      this.drawFunctionCurve(ctx, this.exprGStr, '#0E1D61', 2, [4, 4]); // Navy dashed
    }

    // 5. Derivative Curve f'(x) (if enabled)
    if (this.showDerivative && this.derivStr) {
      this.drawFunctionCurve(ctx, this.derivStr, 'rgba(14, 29, 97, 0.75)', 1.8, [3, 3]); // Navy dashed
    }

    // 5b. Second Derivative Curve f''(x) (if enabled)
    if (this.showSecondDerivative && this.secondDerivStr) {
      this.drawFunctionCurve(ctx, this.secondDerivStr, 'rgba(184, 154, 90, 0.8)', 1.8, [6, 3]); // Gold dashed
    }

    // 6. Primary Function Curve f(x)
    this.drawFunctionCurve(ctx, this.exprStr, '#B89A5A', 2.8); // Gold

    // 7. Tangent & Normal lines
    if (this.tangentX0 !== null) {
      this.drawTangentAndNormal(ctx);
    }

    // 8. Critical Points & Markers
    this.drawMarkers(ctx);

    // 9. Interactive Mouse Probe
    if (this.hoverX !== null) {
      this.drawProbe(ctx);
    }
  }

  drawGrid(ctx, w, h) {
    const xZero = this.mathToCanvasX(0);
    const yZero = this.mathToCanvasY(0);

    ctx.strokeStyle = 'rgba(184, 154, 90, 0.16)';
    ctx.lineWidth = 1;

    // Grid lines for X
    const xStep = (this.xMax - this.xMin) > 10 ? 2 : 1;
    const firstX = Math.ceil(this.xMin / xStep) * xStep;
    for (let x = firstX; x <= this.xMax; x += xStep) {
      const cx = this.mathToCanvasX(x);
      ctx.beginPath();
      ctx.moveTo(cx, 0);
      ctx.lineTo(cx, h);
      ctx.stroke();

      // Axis label
      if (Math.abs(x) > 0.01) {
        ctx.fillStyle = 'rgba(14, 29, 97, 0.65)';
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(String(x), cx, Math.min(Math.max(yZero + 14, 14), h - 6));
      }
    }

    // Grid lines for Y
    const yStep = (this.yMax - this.yMin) > 10 ? 2 : 1;
    const firstY = Math.ceil(this.yMin / yStep) * yStep;
    for (let y = firstY; y <= this.yMax; y += yStep) {
      const cy = this.mathToCanvasY(y);
      ctx.beginPath();
      ctx.moveTo(0, cy);
      ctx.lineTo(w, cy);
      ctx.stroke();

      if (Math.abs(y) > 0.01) {
        ctx.fillStyle = 'rgba(14, 29, 97, 0.65)';
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.textAlign = 'right';
        ctx.fillText(String(y), Math.min(Math.max(xZero - 6, 24), w - 6), cy + 3);
      }
    }

    // Primary Axes (X and Y = 0)
    ctx.strokeStyle = 'rgba(14, 29, 97, 0.75)';
    ctx.lineWidth = 1.5;

    // X axis
    ctx.beginPath();
    ctx.moveTo(0, yZero);
    ctx.lineTo(w, yZero);
    ctx.stroke();

    // Y axis
    ctx.beginPath();
    ctx.moveTo(xZero, 0);
    ctx.lineTo(xZero, h);
    ctx.stroke();

    // Origin label '0'
    ctx.fillStyle = 'rgba(14, 29, 97, 0.8)';
    ctx.font = '11px "JetBrains Mono", monospace';
    ctx.textAlign = 'right';
    ctx.fillText('0', xZero - 6, yZero + 14);
  }

  drawFunctionCurve(ctx, exprStr, color, lineWidth = 2.5, lineDash = []) {
    const expr = new MathExpression(exprStr);
    if (!expr.isValid()) return;

    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.setLineDash(lineDash);

    // Glow effect
    ctx.shadowColor = color;
    ctx.shadowBlur = 8;

    ctx.beginPath();
    let started = false;
    const steps = 300;

    for (let i = 0; i <= steps; i++) {
      const x = this.xMin + (i / steps) * (this.xMax - this.xMin);
      const y = expr.evaluate(x);

      if (!Number.isFinite(y) || Number.isNaN(y)) {
        started = false;
        continue;
      }

      // Check for extreme vertical jumps (asymptotes)
      if (y < this.yMin - 15 || y > this.yMax + 15) {
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

  drawShadedArea(ctx) {
    const { a, b, type } = this.shadeBounds;
    const exprF = new MathExpression(this.exprStr);
    const exprG = this.exprGStr ? new MathExpression(this.exprGStr) : null;
    if (!exprF.isValid()) return;

    const startX = Math.min(a, b);
    const endX = Math.max(a, b);
    const numPoints = 120;

    ctx.save();
    ctx.beginPath();

    if (type === 'between' && exprG && exprG.isValid()) {
      // Area between curves: trace f(x) forward, trace g(x) backward
      for (let i = 0; i <= numPoints; i++) {
        const x = startX + (i / numPoints) * (endX - startX);
        const y = exprF.evaluate(x);
        const cx = this.mathToCanvasX(x);
        const cy = this.mathToCanvasY(y);
        if (i === 0) ctx.moveTo(cx, cy);
        else ctx.lineTo(cx, cy);
      }
      for (let i = numPoints; i >= 0; i--) {
        const x = startX + (i / numPoints) * (endX - startX);
        const y = exprG.evaluate(x);
        const cx = this.mathToCanvasX(x);
        const cy = this.mathToCanvasY(y);
        ctx.lineTo(cx, cy);
      }
      ctx.closePath();

      const fillGrad = ctx.createLinearGradient(0, 0, 0, this.displayHeight);
      fillGrad.addColorStop(0, 'rgba(184, 154, 90, 0.28)');
      fillGrad.addColorStop(1, 'rgba(14, 29, 97, 0.15)');
      ctx.fillStyle = fillGrad;
      ctx.fill();

      ctx.strokeStyle = 'rgba(184, 154, 90, 0.7)';
      ctx.lineWidth = 1;
      ctx.stroke();
    } else {
      // Area under curve: down to y=0
      const yZero = this.mathToCanvasY(0);
      const firstX = this.mathToCanvasX(startX);
      const lastX = this.mathToCanvasX(endX);

      ctx.moveTo(firstX, yZero);
      for (let i = 0; i <= numPoints; i++) {
        const x = startX + (i / numPoints) * (endX - startX);
        const y = exprF.evaluate(x);
        const cx = this.mathToCanvasX(x);
        const cy = this.mathToCanvasY(y);
        ctx.lineTo(cx, cy);
      }
      ctx.lineTo(lastX, yZero);
      ctx.closePath();

      const fillGrad = ctx.createLinearGradient(0, 0, 0, this.displayHeight);
      fillGrad.addColorStop(0, 'rgba(184, 154, 90, 0.30)');
      fillGrad.addColorStop(1, 'rgba(184, 154, 90, 0.08)');
      ctx.fillStyle = fillGrad;
      ctx.fill();

      // Border bounds vertical lines
      ctx.strokeStyle = 'rgba(184, 154, 90, 0.8)';
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }

    ctx.restore();
  }

  drawTangentAndNormal(ctx) {
    const x0 = this.tangentX0;
    const expr = new MathExpression(this.exprStr);
    if (!expr.isValid()) return;

    const y0 = expr.evaluate(x0);
    if (!Number.isFinite(y0)) return;

    // Estimate slope numerically or via derivative
    const h = 1e-5;
    const m = (expr.evaluate(x0 + h) - expr.evaluate(x0 - h)) / (2 * h);

    const cx0 = this.mathToCanvasX(x0);
    const cy0 = this.mathToCanvasY(y0);

    // Tangent Line: y = m*(x - x0) + y0
    ctx.save();
    ctx.strokeStyle = '#B89A5A'; // Gold
    ctx.lineWidth = 2;
    ctx.shadowColor = '#B89A5A';
    ctx.shadowBlur = 4;

    const xLeft = this.xMin;
    const yLeft = m * (xLeft - x0) + y0;
    const xRight = this.xMax;
    const yRight = m * (xRight - x0) + y0;

    ctx.beginPath();
    ctx.moveTo(this.mathToCanvasX(xLeft), this.mathToCanvasY(yLeft));
    ctx.lineTo(this.mathToCanvasX(xRight), this.mathToCanvasY(yRight));
    ctx.stroke();

    // Normal line: slope mN = -1/m
    if (this.showNormal && Math.abs(m) > 1e-6) {
      const mN = -1 / m;
      const yNLeft = mN * (xLeft - x0) + y0;
      const yNRight = mN * (xRight - x0) + y0;

      ctx.strokeStyle = '#0E1D61'; // Deep Atlas Navy
      ctx.lineWidth = 1.8;
      ctx.setLineDash([4, 4]);
      ctx.shadowColor = 'rgba(14, 29, 97, 0.3)';

      ctx.beginPath();
      ctx.moveTo(this.mathToCanvasX(xLeft), this.mathToCanvasY(yNLeft));
      ctx.lineTo(this.mathToCanvasX(xRight), this.mathToCanvasY(yNRight));
      ctx.stroke();
    }

    // Tangency point circle marker
    ctx.beginPath();
    ctx.arc(cx0, cy0, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#B89A5A';
    ctx.fill();
    ctx.strokeStyle = '#0E1D61';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.restore();
  }

  drawMarkers(ctx) {
    if (!this.markers || this.markers.length === 0) return;

    this.markers.forEach(m => {
      const cx = this.mathToCanvasX(m.x);
      const cy = this.mathToCanvasY(m.y);

      if (cx < 0 || cx > this.displayWidth || cy < 0 || cy > this.displayHeight) return;

      const isMax = m.type === 'max' || m.type === 'Local Maximum';
      const isMin = m.type === 'min' || m.type === 'Local Minimum';
      const color = isMax ? '#0E1D61' : isMin ? '#B89A5A' : '#0E1D61';

      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, 5, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Tooltip label
      ctx.fillStyle = '#0E1D61';
      ctx.font = 'bold 11px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      const label = `${m.type ? m.type.replace('Local ', '') : ''} (${m.x}, ${m.y})`;
      ctx.fillText(label, cx, isMax ? cy - 10 : cy + 18);
      ctx.restore();
    });
  }

  drawProbe(ctx) {
    const x = this.hoverX;
    const expr = new MathExpression(this.exprStr);
    if (!expr.isValid()) return;

    const y = expr.evaluate(x);
    if (!Number.isFinite(y)) return;

    const cx = this.mathToCanvasX(x);
    const cy = this.mathToCanvasY(y);

    // Crosshair line
    ctx.save();
    ctx.strokeStyle = 'rgba(14, 29, 97, 0.35)';
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(cx, 0);
    ctx.lineTo(cx, this.displayHeight);
    ctx.stroke();

    // Probe Dot
    ctx.beginPath();
    ctx.arc(cx, cy, 4.5, 0, Math.PI * 2);
    ctx.fillStyle = '#B89A5A';
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Info card badge
    const badgeText = `x = ${x.toFixed(2)}, y = ${y.toFixed(2)}`;
    ctx.font = '11px "JetBrains Mono", monospace';
    const textWidth = ctx.measureText(badgeText).width;
    const pad = 8;
    const boxW = textWidth + pad * 2;
    const boxH = 24;

    const boxX = Math.min(Math.max(cx - boxW / 2, 8), this.displayWidth - boxW - 8);
    const boxY = cy > 40 ? cy - 34 : cy + 14;

    ctx.fillStyle = '#0E1D61';
    ctx.strokeStyle = 'rgba(184, 154, 90, 0.5)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(boxX, boxY, boxW, boxH, 6) : ctx.rect(boxX, boxY, boxW, boxH);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#E8E0D2';
    ctx.textAlign = 'center';
    ctx.fillText(badgeText, boxX + boxW / 2, boxY + 16);
    ctx.restore();
  }

  destroy() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
  }
}
