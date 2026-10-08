/**
 * OG - Interactive Pascal's Triangle Visualizer with Step-by-Step Animation
 * Liquid Glass animated visualizer with cell inspection, addition ray highlights,
 * and combinatorial identity readouts.
 * ES6 Module
 */

export class PascalTriangleVisualizer {
  constructor(container, options = {}) {
    this.container = container;
    this.maxRows = options.maxRows || 8;
    this.currentRow = options.currentRow || 0;
    this.animationTimer = null;
    this.isPlaying = false;
    this.speed = options.speed || 800; // ms per row
    this.inspectedCell = null; // { n, r, val }
    this.triangleData = [];

    this.generateData();
    this.render();
  }

  generateData() {
    this.triangleData = [];
    for (let n = 0; n < this.maxRows; n++) {
      const row = [];
      for (let r = 0; r <= n; r++) {
        if (r === 0 || r === n) {
          row.push(1);
        } else {
          row.push(this.triangleData[n - 1][r - 1] + this.triangleData[n - 1][r]);
        }
      }
      this.triangleData.push(row);
    }
  }

  setMaxRows(rows) {
    this.pause();
    this.maxRows = Math.min(Math.max(rows, 3), 12);
    this.currentRow = Math.min(this.currentRow, this.maxRows - 1);
    this.generateData();
    this.render();
  }

  play() {
    if (this.isPlaying) return;
    this.isPlaying = true;
    if (this.currentRow >= this.maxRows - 1) {
      this.currentRow = 0;
    }

    const step = () => {
      if (!this.isPlaying) return;
      if (this.currentRow < this.maxRows - 1) {
        this.currentRow++;
        this.render();
        this.animationTimer = setTimeout(step, this.speed);
      } else {
        this.pause();
      }
    };

    this.render();
    this.animationTimer = setTimeout(step, this.speed);
  }

  pause() {
    this.isPlaying = false;
    if (this.animationTimer) {
      clearTimeout(this.animationTimer);
      this.animationTimer = null;
    }
    this.updateControls();
  }

  nextStep() {
    this.pause();
    if (this.currentRow < this.maxRows - 1) {
      this.currentRow++;
      this.render();
    }
  }

  reset() {
    this.pause();
    this.currentRow = 0;
    this.inspectedCell = null;
    this.render();
  }

  inspect(n, r) {
    if (n < 0 || n >= this.maxRows || r < 0 || r > n) return;
    const val = this.triangleData[n][r];
    this.inspectedCell = { n, r, val };
    this.render();
  }

  render() {
    if (!this.container) return;

    const visibleRows = this.triangleData.slice(0, this.currentRow + 1);

    this.container.innerHTML = `
      <div class="pascal-visualizer-container">
        <!-- Animation Control Bar -->
        <div class="pascal-controls-bar">
          <div style="display: flex; gap: 8px; align-items: center;">
            <button class="glass-btn glass-btn-primary" id="btn-pascal-play">
              <span>${this.isPlaying ? '❚❚ Pause' : '▶ Play Animation'}</span>
            </button>
            <button class="glass-btn glass-btn-outline" id="btn-pascal-step" ${this.currentRow >= this.maxRows - 1 ? 'disabled' : ''}>
              <span>Step Next Row →</span>
            </button>
            <button class="glass-btn glass-btn-outline" id="btn-pascal-reset">
              <span>Reset</span>
            </button>
          </div>

          <!-- Rows Selector -->
          <div style="display: flex; gap: 8px; align-items: center; font-size: 0.86rem; color: var(--text-secondary);">
            <span>Rows:</span>
            <div style="display: flex; gap: 4px;">
              ${[5, 7, 9, 11].map(cnt => `
                <button class="glass-btn glass-btn-icon pascal-row-cnt-btn ${this.maxRows === cnt ? 'active' : ''}" data-cnt="${cnt}" style="width: 32px; height: 32px; font-size: 0.8rem;">
                  ${cnt}
                </button>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- The Liquid Glass Pascal Triangle Matrix -->
        <div class="pascal-pyramid-viewport">
          <div class="pascal-pyramid">
            ${visibleRows.map((row, n) => {
              const rowSum = Math.pow(2, n);
              return `
                <div class="pascal-row view-animate-in" data-row="${n}">
                  <span class="pascal-row-tag">n=${n}</span>
                  <div class="pascal-cells-wrapper">
                    ${row.map((val, r) => {
                      const isInspected = this.inspectedCell && this.inspectedCell.n === n && this.inspectedCell.r === r;
                      const isParent1 = this.inspectedCell && this.inspectedCell.n === n + 1 && this.inspectedCell.r === r + 1;
                      const isParent2 = this.inspectedCell && this.inspectedCell.n === n + 1 && this.inspectedCell.r === r;

                      let cellClass = 'pascal-cell';
                      if (isInspected) cellClass += ' cell-inspected';
                      else if (isParent1 || isParent2) cellClass += ' cell-parent';

                      return `
                        <div class="${cellClass}" data-n="${n}" data-r="${r}" data-val="${val}" title="C(${n}, ${r}) = ${val}">
                          <span class="cell-val">${val}</span>
                          <span class="cell-sub">C(${n},${r})</span>
                        </div>
                      `;
                    }).join('')}
                  </div>
                  <span class="pascal-sum-tag" title="Row Sum = 2^${n}">∑ = ${rowSum}</span>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Cell Details Inspection Card -->
        <div class="pascal-inspection-panel glass-panel">
          ${this.renderInspectionCard()}
        </div>
      </div>
    `;

    this.attachEventListeners();
  }

  renderInspectionCard() {
    if (!this.inspectedCell) {
      return `
        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px;">
          <div>
            <h4 style="font-size: 0.95rem; color: var(--text-primary); margin-bottom: 4px;">Cell Inspector</h4>
            <span style="font-size: 0.82rem; color: var(--text-tertiary);">Click any cell above to trace its parents and combinatorial identities</span>
          </div>
          <span class="badge badge-algebra">Pascal Identity: ⁿCᵣ = ⁿ⁻¹Cᵣ₋₁ + ⁿ⁻¹Cᵣ</span>
        </div>
      `;
    }

    const { n, r, val } = this.inspectedCell;
    const hasParents = n > 0 && r > 0 && r < n;
    const p1 = hasParents ? this.triangleData[n - 1][r - 1] : null;
    const p2 = hasParents ? this.triangleData[n - 1][r] : null;

    return `
      <div>
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; flex-wrap: wrap; gap: 10px;">
          <h4 style="font-size: 1.1rem; color: var(--text-primary);">
            Inspected Cell: <span style="color: #B89A5A; font-family: var(--font-math);">C(${n}, ${r}) = ${val}</span>
          </h4>
          <span class="badge badge-algebra">Row ${n}, Column ${r}</span>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 14px;">
          <div class="glass-card" style="padding: 12px 16px;">
            <div style="font-size: 0.78rem; color: var(--text-tertiary); text-transform: uppercase;">Parent Addition</div>
            <div style="font-family: var(--font-math); font-size: 1rem; color: var(--text-primary); margin-top: 4px;">
              ${hasParents ? `${p1} + ${p2} = ${val}` : 'Boundary Cell (= 1)'}
            </div>
          </div>

          <div class="glass-card" style="padding: 12px 16px;">
            <div style="font-size: 0.78rem; color: var(--text-tertiary); text-transform: uppercase;">Symmetry Property</div>
            <div style="font-family: var(--font-math); font-size: 1rem; color: var(--cyan-primary); margin-top: 4px;">
              C(${n}, ${r}) = C(${n}, ${n - r}) = ${val}
            </div>
          </div>

          <div class="glass-card" style="padding: 12px 16px;">
            <div style="font-size: 0.78rem; color: var(--text-tertiary); text-transform: uppercase;">Row Sum Value</div>
            <div style="font-family: var(--font-math); font-size: 1rem; color: #a5b4fc; margin-top: 4px;">
              ∑ ⁿCₖ = 2^${n} = ${Math.pow(2, n)}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  attachEventListeners() {
    const btnPlay = this.container.querySelector('#btn-pascal-play');
    const btnStep = this.container.querySelector('#btn-pascal-step');
    const btnReset = this.container.querySelector('#btn-pascal-reset');

    if (btnPlay) {
      btnPlay.addEventListener('click', () => {
        if (this.isPlaying) this.pause();
        else this.play();
      });
    }

    if (btnStep) {
      btnStep.addEventListener('click', () => this.nextStep());
    }

    if (btnReset) {
      btnReset.addEventListener('click', () => this.reset());
    }

    // Row count buttons
    this.container.querySelectorAll('.pascal-row-cnt-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const cnt = Number(btn.getAttribute('data-cnt'));
        this.setMaxRows(cnt);
      });
    });

    // Cell clicks
    this.container.querySelectorAll('.pascal-cell').forEach(cell => {
      cell.addEventListener('click', () => {
        const n = Number(cell.getAttribute('data-n'));
        const r = Number(cell.getAttribute('data-r'));
        this.inspect(n, r);
      });
    });
  }

  updateControls() {
    const btnPlay = this.container.querySelector('#btn-pascal-play');
    if (btnPlay) {
      btnPlay.querySelector('span').textContent = this.isPlaying ? '❚❚ Pause' : '▶ Play Animation';
    }
  }

  destroy() {
    this.pause();
  }
}
