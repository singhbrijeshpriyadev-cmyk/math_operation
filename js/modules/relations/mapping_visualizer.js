/**
 * OG - Relations & Functions Interactive Mapping Visualizer
 * Canvas-based bipartite mapping diagram and directed relation graph:
 * - Function Mapping Diagram (Domain A -> Codomain B)
 * - Cubic Bezier arrows with glowing trajectories
 * - Highlight collisions (many-to-one) and unmapped elements
 * - Relation Directed Graph (vertices on circle with self-loops)
 * ES6 Module
 */

export class MappingVisualizer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.displayWidth = 0;
    this.displayHeight = 0;
    this.mode = 'function'; // 'function' | 'relation'
    this.data = null;
    this.initCanvas();
  }

  initCanvas() {
    if (!this.canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.getBoundingClientRect();
    const width = rect.width || 460;
    const height = rect.height || 380;

    this.canvas.width = width * dpr;
    this.canvas.height = height * dpr;
    this.ctx.resetTransform?.();
    this.ctx.scale(dpr, dpr);
    this.displayWidth = width;
    this.displayHeight = height;
  }

  setData(data, mode = 'function') {
    this.data = data;
    this.mode = mode;
    this.render();
  }

  resize() {
    this.initCanvas();
    this.render();
  }

  render() {
    const ctx = this.ctx;
    const w = this.displayWidth;
    const h = this.displayHeight;
    if (!ctx || !w || !h || !this.data) return;

    ctx.clearRect(0, 0, w, h);

    // Light Liquid Glass Ivory background
    const bg = ctx.createLinearGradient(0, 0, w, h);
    bg.addColorStop(0, '#EFE8DC');
    bg.addColorStop(1, '#E8E0D2');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    if (this.mode === 'function') {
      this.drawBipartiteMapping(ctx, w, h);
    } else {
      this.drawRelationDigraph(ctx, w, h);
    }
  }

  /**
   * Draw Domain A -> Codomain B Bipartite Mapping Diagram
   */
  drawBipartiteMapping(ctx, w, h) {
    const { setA, setB, pairs, isFunction, isInjective, isSurjective, isBijective, collisionItems, unmappedElements, oneToManyElements } = this.data;
    if (!setA || !setB) return;

    const padX = Math.min(80, w * 0.18);
    const colLeftX = padX;
    const colRightX = w - padX;
    const padY = 50;
    const availH = h - padY * 2;

    // Draw Set Boundary Ovals
    this.drawSetContainer(ctx, colLeftX, h / 2, 55, availH / 2 + 25, 'Domain A', '#0E1D61');
    this.drawSetContainer(ctx, colRightX, h / 2, 55, availH / 2 + 25, 'Codomain B', '#B89A5A');

    // Calculate node Y positions
    const aPositions = new Map();
    const bPositions = new Map();

    const getSpacing = (len) => len <= 1 ? [h / 2] : Array.from({ length: len }, (_, i) => padY + 25 + (i / (len - 1)) * (availH - 50));

    const yA = getSpacing(setA.length);
    setA.forEach((elem, i) => {
      aPositions.set(`${typeof elem}:${elem}`, { x: colLeftX, y: yA[i], elem });
    });

    const yB = getSpacing(setB.length);
    setB.forEach((elem, i) => {
      bPositions.set(`${typeof elem}:${elem}`, { x: colRightX, y: yB[i], elem });
    });

    // Draw connecting arrows
    const collisionKeys = new Set((collisionItems || []).map(c => `${typeof c.image}:${c.image}`));
    const unmappedKeySet = new Set((unmappedElements || []).map(u => `${typeof u}:${u}`));

    if (pairs && pairs.length > 0) {
      pairs.forEach(p => {
        const from = aPositions.get(`${typeof p.a}:${p.a}`);
        const to = bPositions.get(`${typeof p.b}:${p.b}`);
        if (!from || !to) return;

        const isCollisionTarget = collisionKeys.has(`${typeof p.b}:${p.b}`);
        const strokeColor = isCollisionTarget ? '#B89A5A' : '#0E1D61';
        this.drawCurvedArrow(ctx, from.x + 22, from.y, to.x - 22, to.y, strokeColor);
      });
    }

    // Draw Domain A Nodes
    setA.forEach(elem => {
      const pos = aPositions.get(`${typeof elem}:${elem}`);
      const isUnmapped = unmappedKeySet.has(`${typeof elem}:${elem}`);
      const isOneToMany = (oneToManyElements || []).some(o => o.element === elem);

      let nodeColor = '#0E1D61';
      let haloColor = 'rgba(14, 29, 97, 0.15)';
      if (isUnmapped || isOneToMany) {
        nodeColor = '#B89A5A';
        haloColor = 'rgba(184, 154, 90, 0.25)';
      }

      this.drawNode(ctx, pos.x, pos.y, elem, nodeColor, haloColor);
    });

    // Draw Codomain B Nodes
    const targetMap = new Set((pairs || []).map(p => `${typeof p.b}:${p.b}`));
    setB.forEach(elem => {
      const pos = bPositions.get(`${typeof elem}:${elem}`);
      const isTargeted = targetMap.has(`${typeof elem}:${elem}`);
      const isCollision = collisionKeys.has(`${typeof elem}:${elem}`);

      let nodeColor = '#B89A5A';
      let haloColor = 'rgba(184, 154, 90, 0.15)';
      if (isCollision) {
        nodeColor = '#0E1D61';
        haloColor = 'rgba(14, 29, 97, 0.2)';
      } else if (!isTargeted) {
        nodeColor = 'rgba(14, 29, 97, 0.4)';
        haloColor = 'rgba(14, 29, 97, 0.05)';
      }

      this.drawNode(ctx, pos.x, pos.y, elem, nodeColor, haloColor);
    });

    // Classification Badge Watermark in center
    this.drawClassificationWatermark(ctx, w / 2, 28, isFunction, isInjective, isSurjective, isBijective);
  }

  /**
   * Draw Set Capsule / Oval
   */
  drawSetContainer(ctx, cx, cy, rx, ry, label, color) {
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(232, 224, 210, 0.4)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(184, 154, 90, 0.35)';
    ctx.lineWidth = 1.2;
    ctx.setLineDash([4, 4]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Label
    ctx.fillStyle = color;
    ctx.font = 'bold 12px "Inter", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(label, cx, cy - ry - 8);
    ctx.restore();
  }

  /**
   * Draw element node with text
   */
  drawNode(ctx, x, y, elem, color, haloColor) {
    ctx.save();
    // Glowing halo
    ctx.beginPath();
    ctx.arc(x, y, 19, 0, Math.PI * 2);
    ctx.fillStyle = haloColor;
    ctx.fill();

    // Node body
    ctx.beginPath();
    ctx.arc(x, y, 14, 0, Math.PI * 2);
    ctx.fillStyle = '#E8E0D2';
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Text in Deep Atlas Navy
    ctx.fillStyle = '#0E1D61';
    ctx.font = 'bold 12px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(elem).slice(0, 4), x, y);
    ctx.restore();
  }

  /**
   * Draw cubic bezier arrow connecting domain to codomain
   */
  drawCurvedArrow(ctx, x1, y1, x2, y2, color) {
    ctx.save();
    const dx = x2 - x1;
    const cp1x = x1 + dx * 0.45;
    const cp1y = y1;
    const cp2x = x1 + dx * 0.55;
    const cp2y = y2;

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x2, y2);
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.8;
    ctx.stroke();

    // Arrowhead at (x2, y2)
    const angle = Math.atan2(y2 - cp2y, x2 - cp2x);
    const headLen = 8;
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - headLen * Math.cos(angle - Math.PI / 6), y2 - headLen * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(x2 - headLen * Math.cos(angle + Math.PI / 6), y2 - headLen * Math.sin(angle + Math.PI / 6));
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    ctx.restore();
  }

  /**
   * Draw Digraph for Relation on Set A
   */
  drawRelationDigraph(ctx, w, h) {
    const { setA, pairs, isReflexive, isSymmetric, isTransitive, isEquivalence } = this.data;
    if (!setA || setA.length === 0) return;

    const cx = w / 2;
    const cy = h / 2 + 10;
    const radius = Math.min(w, h) * 0.35;
    const n = setA.length;

    // Node positions on circle
    const nodePositions = new Map();
    setA.forEach((elem, i) => {
      const angle = (2 * Math.PI * i) / n - Math.PI / 2;
      const x = cx + radius * Math.cos(angle);
      const y = cy + radius * Math.sin(angle);
      nodePositions.set(`${typeof elem}:${elem}`, { x, y, angle, elem });
    });

    // Draw pairs
    if (pairs) {
      pairs.forEach(p => {
        const from = nodePositions.get(`${typeof p.a}:${p.a}`);
        const to = nodePositions.get(`${typeof p.b}:${p.b}`);
        if (!from || !to) return;

        if (from === to) {
          // Self-loop (Reflexive) in Gold
          this.drawSelfLoop(ctx, from.x, from.y, from.angle, '#B89A5A');
        } else {
          // Directed arc between nodes in Deep Atlas Navy
          this.drawDirectedArc(ctx, from, to, '#0E1D61');
        }
      });
    }

    // Draw nodes
    nodePositions.forEach(pos => {
      this.drawNode(ctx, pos.x, pos.y, pos.elem, '#0E1D61', 'rgba(14, 29, 97, 0.15)');
    });

    // Equivalence badge
    ctx.save();
    ctx.fillStyle = isEquivalence ? '#B89A5A' : '#0E1D61';
    ctx.font = 'bold 12px "Inter", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(
      isEquivalence ? '★ Equivalence Relation (R, S, T)' : 'Binary Relation Graph on Set A',
      w / 2,
      24
    );
    ctx.restore();
  }

  drawSelfLoop(ctx, x, y, baseAngle, color) {
    ctx.save();
    const loopRadius = 14;
    const loopCenterX = x + (loopRadius + 10) * Math.cos(baseAngle);
    const loopCenterY = y + (loopRadius + 10) * Math.sin(baseAngle);

    ctx.beginPath();
    ctx.arc(loopCenterX, loopCenterY, loopRadius, 0, Math.PI * 2);
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.6;
    ctx.stroke();

    // Tiny arrow on loop
    const arrowAngle = baseAngle + Math.PI / 2;
    const ax = loopCenterX + loopRadius * Math.cos(arrowAngle);
    const ay = loopCenterY + loopRadius * Math.sin(arrowAngle);
    ctx.beginPath();
    ctx.arc(ax, ay, 2.5, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.restore();
  }

  drawDirectedArc(ctx, from, to, color) {
    ctx.save();
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 1) return;

    // Normal vector for curve
    const nx = -dy / dist;
    const ny = dx / dist;
    const offset = Math.min(30, dist * 0.2);

    const midX = (from.x + to.x) / 2 + nx * offset;
    const midY = (from.y + to.y) / 2 + ny * offset;

    // Adjust endpoints to node circle border
    const nodeR = 15;
    const startX = from.x + (dx / dist) * nodeR;
    const startY = from.y + (dy / dist) * nodeR;
    const endX = to.x - (dx / dist) * nodeR;
    const endY = to.y - (dy / dist) * nodeR;

    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.quadraticCurveTo(midX, midY, endX, endY);
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.6;
    ctx.stroke();

    // Arrowhead at (endX, endY)
    const angle = Math.atan2(endY - midY, endX - midX);
    const headLen = 7;
    ctx.beginPath();
    ctx.moveTo(endX, endY);
    ctx.lineTo(endX - headLen * Math.cos(angle - Math.PI / 6), endY - headLen * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(endX - headLen * Math.cos(angle + Math.PI / 6), endY - headLen * Math.sin(angle + Math.PI / 6));
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    ctx.restore();
  }

  drawClassificationWatermark(ctx, cx, cy, isFunc, isInjective, isSurjective, isBijective) {
    ctx.save();
    ctx.textAlign = 'center';
    ctx.font = 'bold 11px "Inter", sans-serif';

    if (!isFunc) {
      ctx.fillStyle = '#0E1D61';
      ctx.fillText('❌ NOT A FUNCTION', cx, cy);
    } else if (isBijective) {
      ctx.fillStyle = '#B89A5A';
      ctx.fillText('★ BIJECTIVE (1-to-1 & Onto)', cx, cy);
    } else if (isInjective) {
      ctx.fillStyle = '#B89A5A';
      ctx.fillText('✔ INJECTIVE (1-to-1)', cx, cy);
    } else if (isSurjective) {
      ctx.fillStyle = '#0E1D61';
      ctx.fillText('✔ SURJECTIVE (Onto)', cx, cy);
    } else {
      ctx.fillStyle = '#0E1D61';
      ctx.fillText('✔ FUNCTION (Many-to-One)', cx, cy);
    }
    ctx.restore();
  }
}
