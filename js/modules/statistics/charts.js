/**
 * OG - Statistical Chart Visualizer
 * Canvas-based rendering engine using OG Visual Identity:
 * - IVORY: #E8E0D2
 * - GOLD: #B89A5A
 * - DEEP ATLAS NAVY: #0E1D61
 *
 * Supported Charts:
 * 1. Histogram (Dynamic bins, frequencies, interval labels, hover tooltip)
 * 2. Bar Chart (Discrete categories / values)
 * 3. Frequency Polygon (Class midpoints connected to baseline)
 * 4. Frequency Curve (Smooth curve through points)
 * 5. Pie Chart (OG harmonious navy & gold segments with percentages)
 * 6. Box Plot (Box & Whisker: Min, Q1, Median, Q3, Max, Fences, Outlier dots)
 * 7. Scatter Plot (Bivariate points with Pearson regression line ŷ = a + bx)
 *
 * ES6 Module
 */

export class StatisticalChartVisualizer {
  constructor(canvas) {
    this.canvas = typeof canvas === 'string' ? document.querySelector(canvas) : canvas;
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
    this.chartType = 'histogram'; // 'histogram' | 'bar' | 'polygon' | 'curve' | 'pie' | 'boxplot' | 'scatter'
    this.chartData = null;
    this.hoverIndex = -1;
    this.mousePos = { x: -1, y: -1 };
    this._listeners = [];

    // OG Color Tokens
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
      textMuted: 'rgba(14, 29, 97, 0.6)'
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
    this._on(this.canvas, 'mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mousePos = {
        x: (e.clientX - rect.left) * (this.canvas.width / rect.width),
        y: (e.clientY - rect.top) * (this.canvas.height / rect.height)
      };
      this.render();
    });

    this._on(this.canvas, 'mouseleave', () => {
      this.mousePos = { x: -1, y: -1 };
      this.hoverIndex = -1;
      this.render();
    });

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

  setData(type, data) {
    this.chartType = type;
    this.chartData = data;
    this.render();
  }

  render() {
    if (!this.canvas || !this.ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const w = this.canvas.width / dpr;
    const h = this.canvas.height / dpr;
    const ctx = this.ctx;

    ctx.clearRect(0, 0, w, h);

    if (!this.chartData) {
      this._renderEmpty(w, h, 'No data loaded for statistical visualization');
      return;
    }

    switch (this.chartType) {
      case 'histogram':
        this._renderHistogram(w, h);
        break;
      case 'bar':
        this._renderBarChart(w, h);
        break;
      case 'polygon':
        this._renderFrequencyPolygon(w, h, false);
        break;
      case 'curve':
        this._renderFrequencyPolygon(w, h, true);
        break;
      case 'pie':
        this._renderPieChart(w, h);
        break;
      case 'boxplot':
        this._renderBoxPlot(w, h);
        break;
      case 'scatter':
        this._renderScatterPlot(w, h);
        break;
      default:
        this._renderHistogram(w, h);
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

  _drawAxes(padLeft, padRight, padTop, padBottom, w, h, xLabel = '', yLabel = '') {
    const ctx = this.ctx;
    ctx.strokeStyle = this.colors.axis;
    ctx.lineWidth = 1.5;

    // Y Axis
    ctx.beginPath();
    ctx.moveTo(padLeft, padTop);
    ctx.lineTo(padLeft, h - padBottom);
    // X Axis
    ctx.lineTo(w - padRight, h - padBottom);
    ctx.stroke();

    // Labels
    ctx.fillStyle = this.colors.text;
    ctx.font = '12px Outfit, sans-serif';
    if (xLabel) {
      ctx.textAlign = 'center';
      ctx.fillText(xLabel, (padLeft + w - padRight) / 2, h - 8);
    }
    if (yLabel) {
      ctx.save();
      ctx.translate(14, (padTop + h - padBottom) / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.textAlign = 'center';
      ctx.fillText(yLabel, 0, 0);
      ctx.restore();
    }
  }

  // --------------------------------------------------------------------------
  // 1. HISTOGRAM
  // --------------------------------------------------------------------------
  _renderHistogram(w, h) {
    const ctx = this.ctx;
    const bins = this.chartData.bins || [];
    if (bins.length === 0) {
      this._renderEmpty(w, h, 'No bins available');
      return;
    }

    const padLeft = 55;
    const padRight = 30;
    const padTop = 30;
    const padBottom = 45;

    const plotW = w - padLeft - padRight;
    const plotH = h - padTop - padBottom;

    const maxFreq = Math.max(...bins.map(b => b.frequency), 1);
    const yTicks = 5;

    // Draw horizontal grid lines
    ctx.strokeStyle = this.colors.grid;
    ctx.lineWidth = 1;
    ctx.fillStyle = this.colors.textMuted;
    ctx.font = '11px JetBrains Mono, monospace';
    ctx.textAlign = 'right';

    for (let i = 0; i <= yTicks; i++) {
      const val = Math.round((maxFreq / yTicks) * i);
      const y = h - padBottom - (plotH / yTicks) * i;
      ctx.beginPath();
      ctx.moveTo(padLeft, y);
      ctx.lineTo(w - padRight, y);
      ctx.stroke();
      ctx.fillText(String(val), padLeft - 8, y + 4);
    }

    this._drawAxes(padLeft, padRight, padTop, padBottom, w, h, 'Class Intervals', 'Frequency');

    const binW = plotW / bins.length;
    let hoveredBin = null;

    bins.forEach((b, idx) => {
      const barH = (b.frequency / maxFreq) * plotH;
      const x = padLeft + idx * binW;
      const y = h - padBottom - barH;

      const isHovered = this.mousePos.x >= x && this.mousePos.x <= x + binW &&
                        this.mousePos.y >= padTop && this.mousePos.y <= h - padBottom;

      if (isHovered) hoveredBin = { b, x: x + binW / 2, y, idx };

      // Bar gradient fill
      const grad = ctx.createLinearGradient(0, y, 0, h - padBottom);
      if (isHovered) {
        grad.addColorStop(0, this.colors.gold);
        grad.addColorStop(1, 'rgba(184, 154, 90, 0.4)');
      } else {
        grad.addColorStop(0, this.colors.navy);
        grad.addColorStop(1, 'rgba(14, 29, 97, 0.45)');
      }

      ctx.fillStyle = grad;
      ctx.fillRect(x + 1, y, binW - 2, barH);

      // Bar border
      ctx.strokeStyle = isHovered ? this.colors.gold : this.colors.navy;
      ctx.lineWidth = 1.2;
      ctx.strokeRect(x + 1, y, binW - 2, barH);

      // Value label on top
      if (b.frequency > 0) {
        ctx.fillStyle = this.colors.text;
        ctx.font = 'bold 11px JetBrains Mono, monospace';
        ctx.textAlign = 'center';
        ctx.fillText(String(b.frequency), x + binW / 2, y - 6);
      }

      // Interval label below
      ctx.fillStyle = this.colors.textMuted;
      ctx.font = '10px JetBrains Mono, monospace';
      ctx.textAlign = 'center';
      const label = b.interval ? b.interval.split(' - ')[0] : String(b.lower);
      ctx.fillText(label, x + binW / 2, h - padBottom + 16);
    });

    // Tooltip
    if (hoveredBin) {
      this._drawTooltip(ctx, hoveredBin.x, hoveredBin.y, [
        `Interval: ${hoveredBin.b.interval}`,
        `Frequency: ${hoveredBin.b.frequency}`,
        `Rel Freq: ${hoveredBin.b.relFreq}`,
        `Pct: ${hoveredBin.b.pctFreq}`
      ]);
    }
  }

  // --------------------------------------------------------------------------
  // 2. BAR CHART
  // --------------------------------------------------------------------------
  _renderBarChart(w, h) {
    const ctx = this.ctx;
    const items = this.chartData.items || [];
    if (items.length === 0) {
      this._renderEmpty(w, h, 'No categories available');
      return;
    }

    const padLeft = 55;
    const padRight = 30;
    const padTop = 30;
    const padBottom = 45;

    const plotW = w - padLeft - padRight;
    const plotH = h - padTop - padBottom;
    const maxVal = Math.max(...items.map(it => it.value || it.frequency), 1);

    this._drawAxes(padLeft, padRight, padTop, padBottom, w, h, 'Observation', 'Frequency');

    const totalBars = items.length;
    const slotW = plotW / totalBars;
    const barW = Math.min(48, slotW * 0.65);

    items.forEach((it, idx) => {
      const val = it.value !== undefined ? it.value : it.frequency;
      const barH = (val / maxVal) * plotH;
      const x = padLeft + idx * slotW + (slotW - barW) / 2;
      const y = h - padBottom - barH;

      const grad = ctx.createLinearGradient(0, y, 0, h - padBottom);
      grad.addColorStop(0, this.colors.gold);
      grad.addColorStop(1, 'rgba(184, 154, 90, 0.3)');

      ctx.fillStyle = grad;
      ctx.fillRect(x, y, barW, barH);
      ctx.strokeStyle = this.colors.navy;
      ctx.lineWidth = 1.2;
      ctx.strokeRect(x, y, barW, barH);

      // Value label on top
      ctx.fillStyle = this.colors.text;
      ctx.font = 'bold 11px JetBrains Mono, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(String(val), x + barW / 2, y - 6);

      // Label below
      ctx.fillStyle = this.colors.textMuted;
      ctx.font = '11px Outfit, sans-serif';
      ctx.fillText(String(it.label || it.name || it.x || idx + 1), x + barW / 2, h - padBottom + 16);
    });
  }

  // --------------------------------------------------------------------------
  // 3 & 4. FREQUENCY POLYGON & FREQUENCY CURVE
  // --------------------------------------------------------------------------
  _renderFrequencyPolygon(w, h, isCurve = false) {
    const ctx = this.ctx;
    const bins = this.chartData.bins || [];
    if (bins.length === 0) {
      this._renderEmpty(w, h, 'No bins for polygon');
      return;
    }

    const padLeft = 55;
    const padRight = 30;
    const padTop = 30;
    const padBottom = 45;

    const plotW = w - padLeft - padRight;
    const plotH = h - padTop - padBottom;
    const maxFreq = Math.max(...bins.map(b => b.frequency), 1);

    this._drawAxes(padLeft, padRight, padTop, padBottom, w, h, 'Class Midpoint', 'Frequency');

    const stepX = plotW / (bins.length + 1);
    const points = [];

    // Left base point
    points.push({ x: padLeft, y: h - padBottom, label: '' });

    bins.forEach((b, idx) => {
      const px = padLeft + (idx + 1) * stepX;
      const py = h - padBottom - (b.frequency / maxFreq) * plotH;
      points.push({ x: px, y: py, label: String(b.midpoint), freq: b.frequency });
    });

    // Right base point
    points.push({ x: padLeft + (bins.length + 1) * stepX, y: h - padBottom, label: '' });

    // Draw shaded area
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    if (!isCurve) {
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }
    } else {
      for (let i = 1; i < points.length; i++) {
        const xc = (points[i - 1].x + points[i].x) / 2;
        const yc = (points[i - 1].y + points[i].y) / 2;
        ctx.quadraticCurveTo(points[i - 1].x, points[i - 1].y, xc, yc);
      }
      ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
    }
    ctx.closePath();
    ctx.fillStyle = 'rgba(184, 154, 90, 0.15)';
    ctx.fill();

    // Draw line
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    if (!isCurve) {
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }
    } else {
      for (let i = 1; i < points.length; i++) {
        const xc = (points[i - 1].x + points[i].x) / 2;
        const yc = (points[i - 1].y + points[i].y) / 2;
        ctx.quadraticCurveTo(points[i - 1].x, points[i - 1].y, xc, yc);
      }
      ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
    }
    ctx.strokeStyle = this.colors.navy;
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Draw vertex dots and values
    points.forEach((pt, i) => {
      if (i > 0 && i < points.length - 1) {
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 4.5, 0, Math.PI * 2);
        ctx.fillStyle = this.colors.gold;
        ctx.fill();
        ctx.strokeStyle = this.colors.navy;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = this.colors.text;
        ctx.font = 'bold 11px JetBrains Mono, monospace';
        ctx.textAlign = 'center';
        ctx.fillText(String(pt.freq), pt.x, pt.y - 8);

        ctx.fillStyle = this.colors.textMuted;
        ctx.font = '10px JetBrains Mono, monospace';
        ctx.fillText(pt.label, pt.x, h - padBottom + 16);
      }
    });
  }

  // --------------------------------------------------------------------------
  // 5. PIE CHART
  // --------------------------------------------------------------------------
  _renderPieChart(w, h) {
    const ctx = this.ctx;
    const slices = this.chartData.slices || this.chartData.bins || [];
    if (slices.length === 0) {
      this._renderEmpty(w, h, 'No data for pie chart');
      return;
    }

    const total = slices.reduce((acc, s) => acc + (s.frequency || s.value || 0), 0);
    if (total === 0) {
      this._renderEmpty(w, h, 'Total is zero');
      return;
    }

    const cx = w * 0.42;
    const cy = h / 2;
    const radius = Math.min(cx, cy) - 30;

    // Palette shades mixing Navy and Gold
    const palette = [
      '#0E1D61',
      '#B89A5A',
      '#1a2e8c',
      '#d4b26f',
      '#2b43b3',
      '#997838',
      '#475fd9',
      '#e5ca8a'
    ];

    let startAngle = -Math.PI / 2;

    slices.forEach((s, idx) => {
      const val = s.frequency || s.value || 0;
      const sliceAngle = (val / total) * Math.PI * 2;
      const endAngle = startAngle + sliceAngle;
      const color = palette[idx % palette.length];

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = '#E8E0D2';
      ctx.lineWidth = 2;
      ctx.stroke();

      startAngle = endAngle;
    });

    // Donut hole for luxury styling
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 0.45, 0, Math.PI * 2);
    ctx.fillStyle = '#E8E0D2';
    ctx.fill();
    ctx.strokeStyle = this.colors.navy;
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = this.colors.navy;
    ctx.font = 'bold 12px Outfit, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('N = ' + total, cx, cy);

    // Legend on the right
    const legendX = w * 0.72;
    let legendY = 40;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';

    slices.slice(0, 8).forEach((s, idx) => {
      const val = s.frequency || s.value || 0;
      const pct = ((val / total) * 100).toFixed(1) + '%';
      const label = s.interval || s.label || `Class ${idx + 1}`;
      const color = palette[idx % palette.length];

      ctx.fillStyle = color;
      ctx.fillRect(legendX, legendY - 6, 12, 12);
      ctx.strokeStyle = this.colors.navy;
      ctx.lineWidth = 1;
      ctx.strokeRect(legendX, legendY - 6, 12, 12);

      ctx.fillStyle = this.colors.text;
      ctx.font = '11px Outfit, sans-serif';
      ctx.fillText(`${label}: ${pct}`, legendX + 20, legendY);

      legendY += 24;
    });
  }

  // --------------------------------------------------------------------------
  // 6. BOX PLOT (Box & Whisker with Outliers)
  // --------------------------------------------------------------------------
  _renderBoxPlot(w, h) {
    const ctx = this.ctx;
    const q = this.chartData.quantiles || {};
    const sorted = this.chartData.sorted || [];
    if (sorted.length === 0 || q.q1 === undefined) {
      this._renderEmpty(w, h, 'No quantiles loaded for Box Plot');
      return;
    }

    const padLeft = 60;
    const padRight = 60;
    const padTop = 40;
    const padBottom = 60;

    const plotW = w - padLeft - padRight;
    const minVal = sorted[0];
    const maxVal = sorted[sorted.length - 1];
    const q1 = Number(q.q1);
    const q2 = Number(q.q2); // Median
    const q3 = Number(q.q3);
    const iqr = Number(q.iqr);
    const lf = Number(q.lowerFence);
    const uf = Number(q.upperFence);
    const outliers = q.outliers || [];

    // Scale function
    const valRange = Math.max(1, maxVal - minVal);
    const getX = (val) => padLeft + ((val - minVal) / valRange) * plotW;

    const centerY = padTop + (h - padTop - padBottom) / 2;
    const boxHeight = 70;

    // Whisker limits (points within fences)
    const validPoints = sorted.filter(v => v >= lf && v <= uf);
    const whiskerMin = validPoints.length > 0 ? validPoints[0] : minVal;
    const whiskerMax = validPoints.length > 0 ? validPoints[validPoints.length - 1] : maxVal;

    const xWhiskerMin = getX(whiskerMin);
    const xWhiskerMax = getX(whiskerMax);
    const xQ1 = getX(q1);
    const xQ2 = getX(q2);
    const xQ3 = getX(q3);

    // Whiskers (horizontal line)
    ctx.strokeStyle = this.colors.navy;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(xWhiskerMin, centerY);
    ctx.lineTo(xQ1, centerY);
    ctx.moveTo(xQ3, centerY);
    ctx.lineTo(xWhiskerMax, centerY);
    ctx.stroke();

    // Whisker vertical caps
    ctx.beginPath();
    ctx.moveTo(xWhiskerMin, centerY - boxHeight / 4);
    ctx.lineTo(xWhiskerMin, centerY + boxHeight / 4);
    ctx.moveTo(xWhiskerMax, centerY - boxHeight / 4);
    ctx.lineTo(xWhiskerMax, centerY + boxHeight / 4);
    ctx.stroke();

    // Box (Q1 to Q3)
    const boxW = Math.max(2, xQ3 - xQ1);
    const boxY = centerY - boxHeight / 2;

    const grad = ctx.createLinearGradient(xQ1, 0, xQ3, 0);
    grad.addColorStop(0, 'rgba(14, 29, 97, 0.15)');
    grad.addColorStop(0.5, 'rgba(184, 154, 90, 0.35)');
    grad.addColorStop(1, 'rgba(14, 29, 97, 0.15)');

    ctx.fillStyle = grad;
    ctx.fillRect(xQ1, boxY, boxW, boxHeight);
    ctx.strokeStyle = this.colors.navy;
    ctx.lineWidth = 2;
    ctx.strokeRect(xQ1, boxY, boxW, boxHeight);

    // Median line (Gold vertical bar)
    ctx.beginPath();
    ctx.moveTo(xQ2, boxY);
    ctx.lineTo(xQ2, boxY + boxHeight);
    ctx.strokeStyle = this.colors.gold;
    ctx.lineWidth = 3.5;
    ctx.stroke();

    // Outliers outside fences
    outliers.forEach(outVal => {
      const ox = getX(outVal);
      ctx.beginPath();
      ctx.arc(ox, centerY, 5.5, 0, Math.PI * 2);
      ctx.fillStyle = '#b91c1c'; // Red dot for outlier
      ctx.fill();
      ctx.strokeStyle = this.colors.navy;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Label outlier
      ctx.fillStyle = '#b91c1c';
      ctx.font = 'bold 10px JetBrains Mono, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`Outlier: ${outVal}`, ox, centerY - 14);
    });

    // Numeric Labels below
    ctx.fillStyle = this.colors.text;
    ctx.font = '11px JetBrains Mono, monospace';
    ctx.textAlign = 'center';

    ctx.fillText(`Min: ${whiskerMin}`, xWhiskerMin, centerY + boxHeight / 2 + 22);
    ctx.fillText(`Q₁: ${q1}`, xQ1, centerY + boxHeight / 2 + 36);
    ctx.fillText(`Median: ${q2}`, xQ2, centerY - boxHeight / 2 - 10);
    ctx.fillText(`Q₃: ${q3}`, xQ3, centerY + boxHeight / 2 + 36);
    ctx.fillText(`Max: ${whiskerMax}`, xWhiskerMax, centerY + boxHeight / 2 + 22);

    // Title / subtitle banner
    ctx.fillStyle = this.colors.textMuted;
    ctx.font = '11px Outfit, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`IQR = ${iqr} | Lower Fence = ${lf} | Upper Fence = ${uf} | Outliers: ${outliers.length}`, padLeft, 22);
  }

  // --------------------------------------------------------------------------
  // 7. SCATTER PLOT & REGRESSION LINE
  // --------------------------------------------------------------------------
  _renderScatterPlot(w, h) {
    const ctx = this.ctx;
    const xData = this.chartData.xData || [];
    const yData = this.chartData.yData || [];
    if (xData.length === 0 || yData.length === 0) {
      this._renderEmpty(w, h, 'No (X, Y) dataset loaded for scatter plot');
      return;
    }

    const padLeft = 60;
    const padRight = 40;
    const padTop = 35;
    const padBottom = 50;

    const plotW = w - padLeft - padRight;
    const plotH = h - padTop - padBottom;

    const minX = Math.min(...xData);
    const maxX = Math.max(...xData);
    const minY = Math.min(...yData);
    const maxY = Math.max(...yData);

    const spanX = Math.max(1, (maxX - minX) * 1.15);
    const spanY = Math.max(1, (maxY - minY) * 1.15);
    const baseMinX = minX - (spanX * 0.08);
    const baseMinY = minY - (spanY * 0.08);

    const getPixelX = (x) => padLeft + ((x - baseMinX) / spanX) * plotW;
    const getPixelY = (y) => h - padBottom - ((y - baseMinY) / spanY) * plotH;

    this._drawAxes(padLeft, padRight, padTop, padBottom, w, h, 'X Variable', 'Y Variable');

    // Scatter points
    xData.forEach((x, i) => {
      const y = yData[i];
      const px = getPixelX(x);
      const py = getPixelY(y);

      ctx.beginPath();
      ctx.arc(px, py, 5, 0, Math.PI * 2);
      ctx.fillStyle = this.colors.gold;
      ctx.fill();
      ctx.strokeStyle = this.colors.navy;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Coordinates text on hover
      const isHovered = Math.hypot(this.mousePos.x - px, this.mousePos.y - py) < 12;
      if (isHovered) {
        ctx.fillStyle = this.colors.text;
        ctx.font = 'bold 11px JetBrains Mono, monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`(${x}, ${y})`, px, py - 10);
      }
    });

    // Regression Line: ŷ = a + bx
    const slope = Number(this.chartData.slope);
    const intercept = Number(this.chartData.intercept);

    if (Number.isFinite(slope) && Number.isFinite(intercept)) {
      const lineX1 = baseMinX;
      const lineY1 = intercept + slope * lineX1;
      const lineX2 = baseMinX + spanX;
      const lineY2 = intercept + slope * lineX2;

      ctx.beginPath();
      ctx.moveTo(getPixelX(lineX1), getPixelY(lineY1));
      ctx.lineTo(getPixelX(lineX2), getPixelY(lineY2));
      ctx.strokeStyle = this.colors.navy;
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Legend in top-left
      ctx.fillStyle = this.colors.text;
      ctx.font = 'bold 12px JetBrains Mono, monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`${this.chartData.regressionEquation} (r = ${this.chartData.r})`, padLeft + 12, padTop + 14);
    }
  }

  _drawTooltip(ctx, x, y, lines) {
    const pad = 10;
    ctx.font = '11px JetBrains Mono, monospace';
    let maxW = 0;
    lines.forEach(l => {
      maxW = Math.max(maxW, ctx.measureText(l).width);
    });

    const boxW = maxW + pad * 2;
    const boxH = lines.length * 16 + pad * 2;
    const tipX = Math.min(this.canvas.width / (window.devicePixelRatio || 1) - boxW - 10, Math.max(10, x - boxW / 2));
    const tipY = Math.max(10, y - boxH - 12);

    ctx.fillStyle = 'rgba(14, 29, 97, 0.95)';
    ctx.beginPath();
    ctx.roundRect(tipX, tipY, boxW, boxH, 6);
    ctx.fill();
    ctx.strokeStyle = this.colors.gold;
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = '#E8E0D2';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    lines.forEach((l, i) => {
      ctx.fillText(l, tipX + pad, tipY + pad + i * 16);
    });
  }
}
