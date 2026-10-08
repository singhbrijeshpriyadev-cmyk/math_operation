/**
 * OG - Interactive 3D Coordinate System Visualizer
 * High-DPI interactive Canvas 3D space visualizer with:
 * - 3D Pitch and Yaw camera rotation (mouse drag)
 * - Spatial Zoom & Pan
 * - X, Y, Z axes with grid ticks & ground plane
 * - Points P(x, y, z) with drop-lines to XY plane for depth perception
 * - 3D Segments, 3D Lines (vector form), and 3D Planes (semi-transparent mesh)
 * - Deep Atlas Navy & Gold Luxury Liquid Glass aesthetics
 * ES6 Module
 */

export class CoordinatePlane3DVisualizer {
  constructor(canvasElement, options = {}) {
    this.canvas = canvasElement;
    this.ctx = canvasElement.getContext('2d');

    // Camera angles in radians
    this.pitch = options.pitch !== undefined ? options.pitch : 0.45; // vertical tilt
    this.yaw = options.yaw !== undefined ? options.yaw : 0.65;     // horizontal rotation
    this.scale = options.scale !== undefined ? options.scale : 28; // pixels per unit
    this.panX = 0;
    this.panY = 0;

    this.defaultCamera = { pitch: this.pitch, yaw: this.yaw, scale: this.scale, panX: 0, panY: 0 };

    // 3D Objects
    this.points = options.points || []; // [{ id, name, x, y, z, color }]
    this.lines = options.lines || [];   // [{ p1, p2, color, label }]
    this.planes = options.planes || []; // [{ A, B, C, D, color }]

    // State
    this.isDragging = false;
    this.dragStart = { x: 0, y: 0 };
    this.hoverPoint = null;

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

  // 3D to 2D projection with isometric/perspective rotation
  project(x, y, z) {
    // 1. Rotate around Z axis (yaw)
    const cosY = Math.cos(this.yaw);
    const sinY = Math.sin(this.yaw);
    const x1 = x * cosY - y * sinY;
    const y1 = x * sinY + y * cosY;
    const z1 = z;

    // 2. Rotate around X axis (pitch)
    const cosP = Math.cos(this.pitch);
    const sinP = Math.sin(this.pitch);
    const x2 = x1;
    const y2 = y1 * cosP - z1 * sinP;
    const z2 = y1 * sinP + z1 * cosP;

    // 3. Screen projection (Origin centered + Pan)
    const cx = this.displayWidth / 2 + this.panX;
    const cy = this.displayHeight / 2 + this.panY;

    const sx = cx + x2 * this.scale;
    const sy = cy - z2 * this.scale; // Screen Y goes downwards, Math Z goes upwards

    return { sx, sy, depth: y2 };
  }

  setupInteractivity() {
    this.canvas.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      this.dragStart = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('mousemove', (e) => {
      if (!this.isDragging) return;
      const dx = e.clientX - this.dragStart.x;
      const dy = e.clientY - this.dragStart.y;
      this.dragStart = { x: e.clientX, y: e.clientY };

      if (e.shiftKey) {
        // Shift + Drag = Pan
        this.panX += dx;
        this.panY += dy;
      } else {
        // Drag = Rotate
        this.yaw += dx * 0.008;
        this.pitch += dy * 0.008;
        // Limit pitch to prevent complete flipping
        this.pitch = Math.max(-Math.PI / 2 + 0.05, Math.min(Math.PI / 2 - 0.05, this.pitch));
      }
      this.render();
    });

    window.addEventListener('mouseup', () => {
      this.isDragging = false;
    });

    // Wheel zoom
    this.canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
      this.scale = Math.max(8, Math.min(120, this.scale * zoomFactor));
      this.render();
    }, { passive: false });
  }

  resetCamera() {
    this.pitch = this.defaultCamera.pitch;
    this.yaw = this.defaultCamera.yaw;
    this.scale = this.defaultCamera.scale;
    this.panX = 0;
    this.panY = 0;
    this.render();
  }

  setPoints(pointsList) {
    this.points = pointsList.map((p, i) => ({
      name: p.name || String.fromCharCode(65 + i),
      x: p.x,
      y: p.y,
      z: p.z,
      color: p.color || '#B89A5A'
    }));
    this.render();
  }

  setPlane(A, B, C, D) {
    this.planes = [{ A, B, C, D }];
    this.render();
  }

  clearPlanes() {
    this.planes = [];
    this.render();
  }

  render() {
    const ctx = this.ctx;
    const w = this.displayWidth;
    const h = this.displayHeight;

    if (!w || !h) return;

    ctx.clearRect(0, 0, w, h);

    // Ambient Luxury Background
    ctx.fillStyle = '#FAF7F2';
    ctx.fillRect(0, 0, w, h);

    // 1. Draw XY Ground Grid
    this._drawGroundGrid();

    // 2. Draw 3D Axes
    this._draw3DAxes();

    // 3. Draw 3D Planes
    this._drawPlanes();

    // 4. Draw 3D Lines / Segments
    this._drawLines();

    // 5. Draw 3D Points with Drop-lines
    this._drawPoints();

    // 6. Draw Spatial Compass Indicator
    this._drawCompass();
  }

  _drawGroundGrid() {
    const ctx = this.ctx;
    ctx.strokeStyle = 'rgba(14, 29, 97, 0.05)';
    ctx.lineWidth = 1;

    const range = 6;
    for (let i = -range; i <= range; i++) {
      // Parallel to X axis
      const p1 = this.project(-range, i, 0);
      const p2 = this.project(range, i, 0);
      ctx.beginPath();
      ctx.moveTo(p1.sx, p1.sy);
      ctx.lineTo(p2.sx, p2.sy);
      ctx.stroke();

      // Parallel to Y axis
      const q1 = this.project(i, -range, 0);
      const q2 = this.project(i, range, 0);
      ctx.beginPath();
      ctx.moveTo(q1.sx, q1.sy);
      ctx.lineTo(q2.sx, q2.sy);
      ctx.stroke();
    }
  }

  _draw3DAxes() {
    const ctx = this.ctx;
    const axisLen = 7;
    const origin = this.project(0, 0, 0);

    const xEnd = this.project(axisLen, 0, 0);
    const yEnd = this.project(0, axisLen, 0);
    const zEnd = this.project(0, 0, axisLen);

    // Negative axes (dashed)
    ctx.setLineDash([3, 4]);
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(14, 29, 97, 0.2)';

    const xNeg = this.project(-axisLen, 0, 0);
    const yNeg = this.project(0, -axisLen, 0);
    const zNeg = this.project(0, 0, -axisLen);

    [xNeg, yNeg, zNeg].forEach(p => {
      ctx.beginPath();
      ctx.moveTo(origin.sx, origin.sy);
      ctx.lineTo(p.sx, p.sy);
      ctx.stroke();
    });
    ctx.setLineDash([]);

    // Positive X Axis (Deep Navy)
    ctx.lineWidth = 2.2;
    ctx.strokeStyle = '#0E1D61';
    ctx.beginPath();
    ctx.moveTo(origin.sx, origin.sy);
    ctx.lineTo(xEnd.sx, xEnd.sy);
    ctx.stroke();

    // Positive Y Axis (Gold)
    ctx.strokeStyle = '#B89A5A';
    ctx.beginPath();
    ctx.moveTo(origin.sx, origin.sy);
    ctx.lineTo(yEnd.sx, yEnd.sy);
    ctx.stroke();

    // Positive Z Axis (Royal Blue)
    ctx.strokeStyle = '#283C9E';
    ctx.beginPath();
    ctx.moveTo(origin.sx, origin.sy);
    ctx.lineTo(zEnd.sx, zEnd.sy);
    ctx.stroke();

    // Axis Labels
    ctx.font = 'bold 12px JetBrains Mono, monospace';
    ctx.fillStyle = '#0E1D61';
    ctx.fillText('X', xEnd.sx + 6, xEnd.sy);

    ctx.fillStyle = '#B89A5A';
    ctx.fillText('Y', yEnd.sx + 6, yEnd.sy);

    ctx.fillStyle = '#283C9E';
    ctx.fillText('Z', zEnd.sx, zEnd.sy - 8);

    // Origin "O(0,0,0)"
    ctx.font = '10px Outfit, sans-serif';
    ctx.fillStyle = 'rgba(14, 29, 97, 0.6)';
    ctx.fillText('O(0,0,0)', origin.sx - 8, origin.sy + 14);
  }

  _drawPoints() {
    const ctx = this.ctx;

    this.points.forEach(pt => {
      const proj = this.project(pt.x, pt.y, pt.z);
      const ground = this.project(pt.x, pt.y, 0);

      // 1. Drop line from Point to XY ground plane for spatial reference
      ctx.setLineDash([3, 3]);
      ctx.strokeStyle = 'rgba(184, 154, 90, 0.5)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(ground.sx, ground.sy);
      ctx.lineTo(proj.sx, proj.sy);
      ctx.stroke();
      ctx.setLineDash([]);

      // Ground shadow point
      ctx.fillStyle = 'rgba(14, 29, 97, 0.2)';
      ctx.beginPath();
      ctx.arc(ground.sx, ground.sy, 3, 0, Math.PI * 2);
      ctx.fill();

      // Glowing Point Halo
      ctx.fillStyle = 'rgba(184, 154, 90, 0.35)';
      ctx.beginPath();
      ctx.arc(proj.sx, proj.sy, 9, 0, Math.PI * 2);
      ctx.fill();

      // Point core
      ctx.fillStyle = pt.color || '#B89A5A';
      ctx.beginPath();
      ctx.arc(proj.sx, proj.sy, 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.lineWidth = 1.5;
      ctx.strokeStyle = '#FFFFFF';
      ctx.stroke();

      // Label
      ctx.font = 'bold 11px JetBrains Mono, monospace';
      ctx.fillStyle = '#0E1D61';
      ctx.fillText(`${pt.name}(${pt.x}, ${pt.y}, ${pt.z})`, proj.sx + 8, proj.sy - 6);
    });
  }

  _drawLines() {
    const ctx = this.ctx;

    // Connect points if at least 2 points
    if (this.points.length >= 2) {
      for (let i = 0; i < this.points.length - 1; i++) {
        const p1 = this.points[i];
        const p2 = this.points[i + 1];
        const proj1 = this.project(p1.x, p1.y, p1.z);
        const proj2 = this.project(p2.x, p2.y, p2.z);

        ctx.strokeStyle = '#B89A5A';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(proj1.sx, proj1.sy);
        ctx.lineTo(proj2.sx, proj2.sy);
        ctx.stroke();

        // 3D Distance annotation
        const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y, p2.z - p1.z);
        const midX = (proj1.sx + proj2.sx) / 2;
        const midY = (proj1.sy + proj2.sy) / 2;
        ctx.font = 'bold 10px JetBrains Mono, monospace';
        ctx.fillStyle = '#0E1D61';
        ctx.fillText(`d = ${dist.toFixed(2)}`, midX + 6, midY - 6);
      }
    }
  }

  _drawPlanes() {
    const ctx = this.ctx;

    this.planes.forEach(pl => {
      const { A, B, C, D } = pl;
      // Ax + By + Cz + D = 0 => z = (-Ax - By - D) / C
      if (Math.abs(C) < 1e-6) return; // Ignore purely vertical planes for simple mesh

      const range = 5;
      const corners = [
        this.project(-range, -range, (-A * -range - B * -range - D) / C),
        this.project(range, -range, (-A * range - B * -range - D) / C),
        this.project(range, range, (-A * range - B * range - D) / C),
        this.project(-range, range, (-A * -range - B * range - D) / C)
      ];

      ctx.fillStyle = 'rgba(184, 154, 90, 0.16)';
      ctx.beginPath();
      ctx.moveTo(corners[0].sx, corners[0].sy);
      ctx.lineTo(corners[1].sx, corners[1].sy);
      ctx.lineTo(corners[2].sx, corners[2].sy);
      ctx.lineTo(corners[3].sx, corners[3].sy);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = 'rgba(184, 154, 90, 0.6)';
      ctx.lineWidth = 1.8;
      ctx.stroke();

      // Normal vector from plane center
      const centerZ = (-A * 0 - B * 0 - D) / C;
      const pc = this.project(0, 0, centerZ);
      const pn = this.project(A * 0.8, B * 0.8, centerZ + C * 0.8);

      ctx.strokeStyle = '#0E1D61';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(pc.sx, pc.sy);
      ctx.lineTo(pn.sx, pn.sy);
      ctx.stroke();

      ctx.fillStyle = '#0E1D61';
      ctx.font = 'bold 11px Outfit, sans-serif';
      ctx.fillText('n⃗', pn.sx + 4, pn.sy - 4);
    });
  }

  _drawCompass() {
    const ctx = this.ctx;
    // Camera status in corner
    ctx.font = '10px JetBrains Mono, monospace';
    ctx.fillStyle = 'rgba(14, 29, 97, 0.6)';
    ctx.textAlign = 'left';
    ctx.fillText(`Orbit: Drag to Rotate · Shift+Drag to Pan · Wheel to Zoom`, 12, this.displayHeight - 12);
  }
}
