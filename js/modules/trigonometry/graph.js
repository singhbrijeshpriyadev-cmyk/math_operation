/**
 * OG - Interactive 2D Trigonometric Graph Visualizer
 * High-DPI Canvas plotter with radian scaling, asymptote handling, dynamic cursor probe,
 * and responsive Liquid Glass styling.
 * ES6 Module
 */

export class TrigGraphVisualizer {
  constructor(canvasElement, options = {}) {
    this.canvas = canvasElement;
    this.ctx = canvasElement.getContext('2d');
    this.func = options.func || 'sin'; // 'sin' | 'cos' | 'tan' | 'cot' | 'sec' | 'csc'
    this.amplitude = options.amplitude || 1;
    this.frequency = options.frequency || 1;
    this.probeAngleRad = options.probeAngleRad !== undefined ? options.probeAngleRad : null;
    this.hoverX = null;
    this.resizeObserver = null;

    // View boundaries in radians
    this.xMin = -2.5 * Math.PI;
    this.xMax = 2.5 * Math.PI;
    this.yMin = -3.2;
    this.yMax = 3.2;

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
    const rect = this.canvas.parentElement.getBoundingClientRect();
    const width = Math.max(rect.width, 320);
    const height = Math.max(Math.min(rect.width * 0.52, 420), 280);

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
    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      this.hoverX = this.canvasToMathX(mouseX);
      this.render();
    });

    this.canvas.addEventListener('mouseleave', () => {
      this.hoverX = null;
      this.render();
    });
  }

  setFunction(funcName) {
    this.func = funcName;
    if (funcName === 'tan' || funcName === 'cot') {
      this.yMin = -4.5;
      this.yMax = 4.5;
    } else {
      this.yMin = -3.2;
      this.yMax = 3.2;
    }
    this.render();
  }

  setAmplitude(amp) {
    this.amplitude = amp;
    this.render();
  }

  setFrequency(freq) {
    this.frequency = freq;
    this.render();
  }

  setProbeAngle(angleRad) {
    this.probeAngleRad = angleRad;
    this.render();
  }

  mathToCanvasX(x) {
    return ((x - this.xMin) / (this.xMax - this.xMin)) * this.displayWidth;
  }

  mathToCanvasY(y) {
    return this.displayHeight - ((y - this.yMin) / (this.yMax - this.yMin)) * this.displayHeight;
  }

  canvasToMathX(cx) {
    return this.xMin + (cx / this.displayWidth) * (this.xMax - this.xMin);
  }

  evaluateFunction(x) {
    const arg = this.frequency * x;
    switch (this.func) {
      case 'sin': return this.amplitude * Math.sin(arg);
      case 'cos': return this.amplitude * Math.cos(arg);
      case 'tan': {
        const cosVal = Math.cos(arg);
        if (Math.abs(cosVal) < 1e-6) return null;
        const t = this.amplitude * Math.tan(arg);
        return Math.abs(t) > 20 ? null : t;
      }
      case 'cot': {
        const sinVal = Math.sin(arg);
        if (Math.abs(sinVal) < 1e-6) return null;
        const c = this.amplitude * (1 / Math.tan(arg));
        return Math.abs(c) > 20 ? null : c;
      }
      case 'sec': {
        const cosVal = Math.cos(arg);
        if (Math.abs(cosVal) < 1e-6) return null;
        return this.amplitude * (1 / cosVal);
      }
      case 'csc': {
        const sinVal = Math.sin(arg);
        if (Math.abs(sinVal) < 1e-6) return null;
        return this.amplitude * (1 / sinVal);
      }
      default: return Math.sin(x);
    }
  }

  getThemeColors() {
    switch (this.func) {
      case 'sin':
        return { stroke: '#B89A5A', fill: 'rgba(184, 154, 90, 0.12)', glow: 'rgba(184, 154, 90, 0.35)' };
      case 'cos':
        return { stroke: '#0E1D61', fill: 'rgba(14, 29, 97, 0.10)', glow: 'rgba(14, 29, 97, 0.25)' };
      case 'tan':
        return { stroke: '#8C733E', fill: 'rgba(140, 115, 62, 0.12)', glow: 'rgba(140, 115, 62, 0.35)' };
      default:
        return { stroke: '#B89A5A', fill: 'rgba(184, 154, 90, 0.12)', glow: 'rgba(184, 154, 90, 0.35)' };
    }
  }

  render() {
    if (!this.ctx || !this.displayWidth || !this.displayHeight) return;

    const ctx = this.ctx;
    const w = this.displayWidth;
    const h = this.displayHeight;

    // Fill Ivory Light Liquid Glass Background
    const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
    bgGrad.addColorStop(0, '#EFE8DC');
    bgGrad.addColorStop(1, '#E8E0D2');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // 1. Draw Liquid Glass Background Grid
    this.drawGrid(ctx, w, h);

    // 2. Draw Asymptotes (for tan, cot, sec, csc)
    this.drawAsymptotes(ctx);

    // 3. Plot Curve
    this.drawCurve(ctx);

    // 4. Highlight Probed Angle Point (from calculation)
    if (this.probeAngleRad !== null && !isNaN(this.probeAngleRad)) {
      this.drawProbePoint(ctx, this.probeAngleRad, 'Evaluated Point', '#B89A5A');
    }

    // 5. Highlight Interactive Mouse Hover
    if (this.hoverX !== null) {
      this.drawHoverProbe(ctx, this.hoverX);
    }
  }

  drawGrid(ctx, w, h) {
    const originX = this.mathToCanvasX(0);
    const originY = this.mathToCanvasY(0);

    // Grid lines styling
    ctx.lineWidth = 1;

    // Horizontal grid lines (Y ticks: -3, -2, -1, 1, 2, 3)
    for (let y = Math.ceil(this.yMin); y <= Math.floor(this.yMax); y++) {
      if (y === 0) continue;
      const cy = this.mathToCanvasY(y);
      ctx.strokeStyle = 'rgba(14, 29, 97, 0.08)';
      ctx.beginPath();
      ctx.moveTo(0, cy);
      ctx.lineTo(w, cy);
      ctx.stroke();

      // Tick label
      ctx.fillStyle = 'rgba(14, 29, 97, 0.65)';
      ctx.font = '11px JetBrains Mono, monospace';
      ctx.textAlign = 'right';
      ctx.fillText(String(y), originX - 8, cy + 4);
    }

    // Vertical grid lines (X ticks in multiples of π/2)
    const piStep = Math.PI / 2;
    const minStep = Math.ceil(this.xMin / piStep);
    const maxStep = Math.floor(this.xMax / piStep);

    for (let i = minStep; i <= maxStep; i++) {
      if (i === 0) continue;
      const x = i * piStep;
      const cx = this.mathToCanvasX(x);

      ctx.strokeStyle = 'rgba(14, 29, 97, 0.08)';
      ctx.beginPath();
      ctx.moveTo(cx, 0);
      ctx.lineTo(cx, h);
      ctx.stroke();

      // Radian label
      let label = '';
      if (i === 1) label = 'π/2';
      else if (i === -1) label = '-π/2';
      else if (i === 2) label = 'π';
      else if (i === -2) label = '-π';
      else if (i === 3) label = '3π/2';
      else if (i === -3) label = '-3π/2';
      else if (i === 4) label = '2π';
      else if (i === -4) label = '-2π';
      else if (i % 2 === 0) label = `${i / 2}π`;
      else label = `${i}π/2`;

      ctx.fillStyle = 'rgba(14, 29, 97, 0.65)';
      ctx.font = '11px JetBrains Mono, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(label, cx, originY + 16);
    }

    // Main Axes (X & Y Axis)
    ctx.strokeStyle = 'rgba(14, 29, 97, 0.85)';
    ctx.lineWidth = 1.5;

    // X Axis
    ctx.beginPath();
    ctx.moveTo(0, originY);
    ctx.lineTo(w, originY);
    ctx.stroke();

    // Y Axis
    ctx.beginPath();
    ctx.moveTo(originX, 0);
    ctx.lineTo(originX, h);
    ctx.stroke();

    // Origin label "0"
    ctx.fillStyle = 'rgba(14, 29, 97, 0.75)';
    ctx.textAlign = 'right';
    ctx.fillText('0', originX - 6, originY + 14);
  }

  drawAsymptotes(ctx) {
    if (this.func !== 'tan' && this.func !== 'cot' && this.func !== 'sec' && this.func !== 'csc') return;

    ctx.save();
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = 'rgba(244, 63, 94, 0.35)';
    ctx.lineWidth = 1;

    let step = Math.PI;
    let offset = Math.PI / 2;
    if (this.func === 'cot' || this.func === 'csc') {
      offset = 0;
    }

    for (let k = -4; k <= 4; k++) {
      const asymX = (offset + k * step) / this.frequency;
      if (asymX >= this.xMin && asymX <= this.xMax) {
        const cx = this.mathToCanvasX(asymX);
        ctx.beginPath();
        ctx.moveTo(cx, 0);
        ctx.lineTo(cx, this.displayHeight);
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  drawCurve(ctx) {
    const colors = this.getThemeColors();
    const stepPx = 1.5;
    const totalSteps = Math.ceil(this.displayWidth / stepPx);

    ctx.save();
    ctx.strokeStyle = colors.stroke;
    ctx.lineWidth = 2.5;
    ctx.shadowColor = colors.glow;
    ctx.shadowBlur = 10;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    let isDrawing = false;
    let prevY = null;

    for (let i = 0; i <= totalSteps; i++) {
      const cx = i * stepPx;
      const mx = this.canvasToMathX(cx);
      const my = this.evaluateFunction(mx);

      if (my === null || isNaN(my)) {
        isDrawing = false;
        continue;
      }

      const cy = this.mathToCanvasY(my);

      // Check for abrupt asymptote jumps
      if (prevY !== null && Math.abs(cy - prevY) > this.displayHeight * 0.7) {
        isDrawing = false;
      }

      if (!isDrawing) {
        ctx.moveTo(cx, cy);
        isDrawing = true;
      } else {
        ctx.lineTo(cx, cy);
      }
      prevY = cy;
    }
    ctx.stroke();
    ctx.restore();
  }

  drawProbePoint(ctx, xRad, label, color) {
    const yVal = this.evaluateFunction(xRad);
    if (yVal === null || isNaN(yVal)) return;

    const cx = this.mathToCanvasX(xRad);
    const cy = this.mathToCanvasY(yVal);

    if (cx < 0 || cx > this.displayWidth || cy < 0 || cy > this.displayHeight) return;

    // Guideline rays to axes
    ctx.save();
    ctx.setLineDash([3, 3]);
    ctx.strokeStyle = 'rgba(184, 154, 90, 0.55)';
    ctx.lineWidth = 1.2;

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx, this.mathToCanvasY(0));
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(this.mathToCanvasX(0), cy);
    ctx.stroke();
    ctx.restore();

    // Pulsating halo
    ctx.save();
    ctx.fillStyle = 'rgba(184, 154, 90, 0.25)';
    ctx.beginPath();
    ctx.arc(cx, cy, 9, 0, 2 * Math.PI);
    ctx.fill();

    // Solid core dot
    ctx.fillStyle = '#B89A5A';
    ctx.strokeStyle = '#0E1D61';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, 4.5, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // Value badge tooltip
    const deg = (xRad * 180) / Math.PI;
    const badgeText = `(${deg.toFixed(1)}°, ${yVal.toFixed(3)})`;
    this.drawTooltip(ctx, cx, cy - 14, badgeText);
  }

  drawHoverProbe(ctx, mx) {
    const my = this.evaluateFunction(mx);
    if (my === null || isNaN(my)) return;

    const cx = this.mathToCanvasX(mx);
    const cy = this.mathToCanvasY(my);

    ctx.save();
    ctx.strokeStyle = 'rgba(14, 29, 97, 0.4)';
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 2]);

    ctx.beginPath();
    ctx.moveTo(cx, 0);
    ctx.lineTo(cx, this.displayHeight);
    ctx.stroke();

    // Hover dot
    ctx.fillStyle = '#0E1D61';
    ctx.beginPath();
    ctx.arc(cx, cy, 3.5, 0, 2 * Math.PI);
    ctx.fill();

    const deg = (mx * 180) / Math.PI;
    const tip = `x: ${deg.toFixed(0)}°  y: ${my.toFixed(3)}`;
    this.drawTooltip(ctx, cx, cy - 12, tip);
    ctx.restore();
  }

  drawTooltip(ctx, cx, cy, text) {
    ctx.save();
    ctx.font = '11px JetBrains Mono, monospace';
    const textWidth = ctx.measureText(text).width;
    const pad = 6;
    const boxW = textWidth + pad * 2;
    const boxH = 20;

    let bx = cx - boxW / 2;
    let by = cy - boxH;
    if (bx < 4) bx = 4;
    if (bx + boxW > this.displayWidth - 4) bx = this.displayWidth - boxW - 4;
    if (by < 4) by = cy + 12;

    ctx.fillStyle = 'rgba(244, 239, 230, 0.95)';
    ctx.strokeStyle = 'rgba(184, 154, 90, 0.6)';
    ctx.lineWidth = 1;

    // Rounded rectangle
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(bx, by, boxW, boxH, 4) : ctx.rect(bx, by, boxW, boxH);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#0E1D61';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, bx + boxW / 2, by + boxH / 2);
    ctx.restore();
  }

  destroy() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
  }
}
