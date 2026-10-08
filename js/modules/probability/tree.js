/**
 * OG - Probability Tree & Distribution Visualizer
 * Canvas rendering for:
 * 1. Two-Stage Probability Tree (Branches with branch probabilities & path probabilities)
 * 2. Binomial Distribution PMF Chart (Bars for P(X = k) with Expected Value marker)
 * 3. 2x2 Contingency Table visual matrix
 *
 * Uses OG Visual Identity:
 * - IVORY: #E8E0D2
 * - GOLD: #B89A5A
 * - DEEP ATLAS NAVY: #0E1D61
 *
 * ES6 Module
 */

export class ProbabilityTreeVisualizer {
  constructor(canvas) {
    this.canvas = typeof canvas === 'string' ? document.querySelector(canvas) : canvas;
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
    this.mode = 'tree'; // 'tree' | 'binomial' | 'contingency'
    this.modelData = null;
    this._listeners = [];

    this.colors = {
      navy: '#0E1D61',
      gold: '#B89A5A',
      ivory: '#E8E0D2',
      navyGlass: 'rgba(14, 29, 97, 0.75)',
      navyLight: 'rgba(14, 29, 97, 0.12)',
      goldGlass: 'rgba(184, 154, 90, 0.85)',
      goldGlow: 'rgba(184, 154, 90, 0.25)',
      grid: 'rgba(14, 29, 97, 0.08)',
      axis: 'rgba(14, 29, 97, 0.4)',
      text: '#0E1D61',
      textMuted: 'rgba(14, 29, 97, 0.65)'
    };

    if (this.canvas) {
      this._initEvents();
    }
  }

  destroy() {
    this._listeners.forEach(({ el, evt, fn }) => {
      try { el.removeEventListener(evt, fn); } catch (e) {}
    });
    this._listeners = [];
  }

  _on(el, evt, fn) {
    if (!el) return;
    el.addEventListener(evt, fn);
    this._listeners.push({ el, evt, fn });
  }

  _initEvents() {
    this._on(window, 'resize', () => {
      this.resize();
      this.render();
    });
  }

  resize() {
    if (!this.canvas) return;
    const parent = this.canvas.parentElement;
    if (!parent) return;

    const dpr = window.devicePixelRatio || 1;
    const w = parent.clientWidth || 600;
    const h = parent.clientHeight || 360;

    this.canvas.width = Math.round(w * dpr);
    this.canvas.height = Math.round(h * dpr);
    this.canvas.style.width = `${w}px`;
    this.canvas.style.height = `${h}px`;

    if (this.ctx) {
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
  }

  setData(mode, data) {
    this.mode = mode;
    this.modelData = data;
    this.render();
  }

  render() {
    if (!this.canvas || !this.ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const w = this.canvas.width / dpr;
    const h = this.canvas.height / dpr;
    const ctx = this.ctx;

    ctx.clearRect(0, 0, w, h);

    if (!this.modelData) {
      this._renderEmpty(w, h, 'No probability model loaded');
      return;
    }

    if (this.mode === 'binomial') {
      this._renderBinomialPMF(w, h);
    } else if (this.mode === 'contingency') {
      this._renderContingency(w, h);
    } else {
      this._renderProbabilityTree(w, h);
    }
  }

  _renderEmpty(w, h, msg) {
    const ctx = this.ctx;
    ctx.fillStyle = this.colors.textMuted;
    ctx.font = '14px Outfit, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(msg, w / 2, h / 2);
  }

  // --------------------------------------------------------------------------
  // 1. PROBABILITY TREE
  // --------------------------------------------------------------------------
  _renderProbabilityTree(w, h) {
    const ctx = this.ctx;
    const d = this.modelData || {};

    const pA = d.pA !== undefined ? Number(d.pA.value ?? d.pA) : 0.6;
    const pNotA = Math.max(0, 1 - pA);
    const pBgivenA = d.pAgivenB ? Number(d.pAgivenB.value ?? d.pAgivenB) : 0.5;
    const pNotBgivenA = Math.max(0, 1 - pBgivenA);
    const pBgivenNotA = d.pBgivenNotA !== undefined ? Number(d.pBgivenNotA) : 0.4;
    const pNotBgivenNotA = Math.max(0, 1 - pBgivenNotA);

    const rootX = 50;
    const rootY = h / 2;

    const stage1X = w * 0.38;
    const stage2X = w * 0.72;
    const pathX = w * 0.88;

    const yA = h * 0.28;
    const yNotA = h * 0.72;

    const yAB = h * 0.16;
    const yANotB = h * 0.40;
    const yNotAB = h * 0.60;
    const yNotANotB = h * 0.84;

    // Helper to draw clean branch line with label
    const drawBranch = (x1, y1, x2, y2, label, probStr) => {
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      const midX = (x1 + x2) / 2;
      ctx.bezierCurveTo(midX, y1, midX, y2, x2, y2);
      ctx.strokeStyle = this.colors.navy;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Branch probability tag
      ctx.save();
      const tagX = (x1 + x2) / 2;
      const tagY = (y1 + y2) / 2 - 8;
      ctx.fillStyle = this.colors.navy;
      ctx.font = 'bold 11px JetBrains Mono, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(probStr, tagX, tagY);
      ctx.restore();

      // End node circle
      ctx.beginPath();
      ctx.arc(x2, y2, 16, 0, Math.PI * 2);
      ctx.fillStyle = '#E8E0D2';
      ctx.fill();
      ctx.strokeStyle = this.colors.gold;
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = this.colors.navy;
      ctx.font = 'bold 12px Outfit, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, x2, y2);
    };

    // Root Node
    ctx.beginPath();
    ctx.arc(rootX, rootY, 14, 0, Math.PI * 2);
    ctx.fillStyle = this.colors.navy;
    ctx.fill();
    ctx.strokeStyle = this.colors.gold;
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#E8E0D2';
    ctx.font = 'bold 11px Outfit, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('S', rootX, rootY);

    // Stage 1 Branches
    drawBranch(rootX, rootY, stage1X, yA, 'A', `P(A)=${pA.toFixed(2)}`);
    drawBranch(rootX, rootY, stage1X, yNotA, "A'", `P(A')=${pNotA.toFixed(2)}`);

    // Stage 2 Branches
    drawBranch(stage1X, yA, stage2X, yAB, 'B', `P(B|A)=${pBgivenA.toFixed(2)}`);
    drawBranch(stage1X, yA, stage2X, yANotB, "B'", `P(B'|A)=${pNotBgivenA.toFixed(2)}`);
    drawBranch(stage1X, yNotA, stage2X, yNotAB, 'B', `P(B|A')=${pBgivenNotA.toFixed(2)}`);
    drawBranch(stage1X, yNotA, stage2X, yNotANotB, "B'", `P(B'|A')=${pNotBgivenNotA.toFixed(2)}`);

    // Joint Path Probabilities
    const paths = [
      { y: yAB, label: 'A ∩ B', p: (pA * pBgivenA).toFixed(4) },
      { y: yANotB, label: "A ∩ B'", p: (pA * pNotBgivenA).toFixed(4) },
      { y: yNotAB, label: "A' ∩ B", p: (pNotA * pBgivenNotA).toFixed(4) },
      { y: yNotANotB, label: "A' ∩ B'", p: (pNotA * pNotBgivenNotA).toFixed(4) }
    ];

    paths.forEach(p => {
      ctx.fillStyle = this.colors.navy;
      ctx.font = '11px JetBrains Mono, monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(`P(${p.label}) = ${p.p}`, pathX - 25, p.y);
    });

    // Title banner
    ctx.fillStyle = this.colors.navy;
    ctx.font = 'bold 13px Outfit, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('PROBABILITY TREE & PATH OUTCOMES', 20, 24);
  }

  // --------------------------------------------------------------------------
  // 2. BINOMIAL PMF CHART
  // --------------------------------------------------------------------------
  _renderBinomialPMF(w, h) {
    const ctx = this.ctx;
    const d = this.modelData || {};
    const table = d.pmfTable || [];
    if (table.length === 0) {
      this._renderEmpty(w, h, 'No Binomial PMF data');
      return;
    }

    const padLeft = 55;
    const padRight = 30;
    const padTop = 40;
    const padBottom = 45;

    const plotW = w - padLeft - padRight;
    const plotH = h - padTop - padBottom;

    const maxProb = Math.max(...table.map(t => t.prob), 0.05);

    // Axes
    ctx.strokeStyle = this.colors.axis;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(padLeft, padTop);
    ctx.lineTo(padLeft, h - padBottom);
    ctx.lineTo(w - padRight, h - padBottom);
    ctx.stroke();

    // Horizontal grid
    ctx.strokeStyle = this.colors.grid;
    ctx.lineWidth = 1;
    ctx.fillStyle = this.colors.textMuted;
    ctx.font = '10px JetBrains Mono, monospace';
    ctx.textAlign = 'right';

    for (let i = 0; i <= 4; i++) {
      const val = (maxProb / 4) * i;
      const y = h - padBottom - (plotH / 4) * i;
      ctx.beginPath();
      ctx.moveTo(padLeft, y);
      ctx.lineTo(w - padRight, y);
      ctx.stroke();
      ctx.fillText(val.toFixed(3), padLeft - 6, y + 4);
    }

    const barSlot = plotW / table.length;
    const barW = Math.min(32, barSlot * 0.7);

    table.forEach((t, idx) => {
      const bh = (t.prob / maxProb) * plotH;
      const x = padLeft + idx * barSlot + (barSlot - barW) / 2;
      const y = h - padBottom - bh;

      const isTarget = d.targetResult && d.targetResult.x === t.k;

      ctx.fillStyle = isTarget ? this.colors.gold : this.colors.navy;
      ctx.fillRect(x, y, barW, bh);

      ctx.strokeStyle = isTarget ? this.colors.navy : this.colors.gold;
      ctx.lineWidth = 1.2;
      ctx.strokeRect(x, y, barW, bh);

      // Label on top
      if (t.prob > 0.02) {
        ctx.fillStyle = this.colors.text;
        ctx.font = 'bold 9px JetBrains Mono, monospace';
        ctx.textAlign = 'center';
        ctx.fillText(t.prob.toFixed(3), x + barW / 2, y - 4);
      }

      // X label below
      ctx.fillStyle = this.colors.text;
      ctx.font = '10px JetBrains Mono, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(String(t.k), x + barW / 2, h - padBottom + 16);
    });

    // Title & Parameters
    ctx.fillStyle = this.colors.navy;
    ctx.font = 'bold 12px Outfit, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`BINOMIAL PMF: n = ${d.n}, p = ${d.p} (Mean μ = ${d.mean}, σ² = ${d.variance})`, padLeft, 22);
  }

  // --------------------------------------------------------------------------
  // 3. 2x2 CONTINGENCY TABLE VISUAL MATRIX
  // --------------------------------------------------------------------------
  _renderContingency(w, h) {
    const ctx = this.ctx;
    const d = this.modelData || {};
    const c = d.counts || { ab: 30, anb: 20, nab: 10, nanb: 40, totalA: 50, totalNotA: 50, totalB: 40, totalNotB: 60, N: 100 };

    const startX = w * 0.2;
    const startY = 60;
    const cellW = 100;
    const cellH = 55;

    // Headers
    ctx.font = 'bold 12px Outfit, sans-serif';
    ctx.fillStyle = this.colors.navy;
    ctx.textAlign = 'center';

    ctx.fillText('B', startX + cellW / 2, startY - 14);
    ctx.fillText("B'", startX + cellW + cellW / 2, startY - 14);
    ctx.fillText('Total', startX + cellW * 2 + cellW / 2, startY - 14);

    ctx.textAlign = 'right';
    ctx.fillText('A', startX - 14, startY + cellH / 2);
    ctx.fillText("A'", startX - 14, startY + cellH + cellH / 2);
    ctx.fillText('Total', startX - 14, startY + cellH * 2 + cellH / 2);

    // Cells Matrix: [ [ab, anb, totalA], [nab, nanb, totalNotA], [totalB, totalNotB, N] ]
    const matrix = [
      [c.ab, c.anb, c.totalA],
      [c.nab, c.nanb, c.totalNotA],
      [c.totalB, c.totalNotB, c.N]
    ];

    matrix.forEach((row, r) => {
      row.forEach((val, col) => {
        const x = startX + col * cellW;
        const y = startY + r * cellH;

        ctx.fillStyle = (r === 2 || col === 2) ? 'rgba(14, 29, 97, 0.08)' : 'rgba(184, 154, 90, 0.15)';
        ctx.fillRect(x, y, cellW, cellH);
        ctx.strokeStyle = this.colors.navy;
        ctx.lineWidth = 1.2;
        ctx.strokeRect(x, y, cellW, cellH);

        ctx.fillStyle = this.colors.navy;
        ctx.font = 'bold 14px JetBrains Mono, monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(String(val), x + cellW / 2, y + cellH / 2);
      });
    });

    ctx.fillStyle = this.colors.textMuted;
    ctx.font = '11px Outfit, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`P(A|B) = ${d.pAgivenB ? d.pAgivenB.decimal : (c.ab / c.totalB).toFixed(4)} | P(B|A) = ${d.pBgivenA ? d.pBgivenA.decimal : (c.ab / c.totalA).toFixed(4)}`, w / 2, startY + cellH * 3 + 30);
  }
}
