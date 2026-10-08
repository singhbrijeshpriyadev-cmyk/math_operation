/**
 * OG - Liquid Glass Matrix Visualizer & Interactive Grid
 * Renders high-fidelity matrix brackets, editable glass grid cells,
 * and determinant vertical bars.
 * ES6 Module
 */

export class MatrixVisualizer {
  /**
   * Generates interactive HTML for matrix input grid
   */
  static renderInputGrid(matrixData, rows, cols, matrixId = 'matA', label = 'Matrix A', isDeterminant = false) {
    const gridRows = [];

    for (let r = 0; r < rows; r++) {
      const cells = [];
      for (let c = 0; c < cols; c++) {
        const val = matrixData && matrixData[r] && matrixData[r][c] !== undefined ? matrixData[r][c] : 0;
        cells.push(`
          <input
            type="number"
            step="any"
            class="matrix-cell-input"
            data-matrix="${matrixId}"
            data-row="${r}"
            data-col="${c}"
            value="${val}"
            aria-label="${label} element row ${r + 1} column ${c + 1}">
        `);
      }
      gridRows.push(`<div class="matrix-grid-row">${cells.join('')}</div>`);
    }

    const bracketClass = isDeterminant ? 'det-bar' : 'matrix-bracket';

    return `
      <div class="matrix-card-container" id="container-${matrixId}">
        <div class="matrix-header-info">
          <span class="matrix-title-label">${label}</span>
          <span class="matrix-dim-pill">${rows} × ${cols}</span>
        </div>

        <div class="matrix-visual-wrapper ${isDeterminant ? 'is-determinant' : ''}">
          <!-- Left Bracket / Bar -->
          <div class="${bracketClass} bracket-left"></div>

          <!-- Cells Grid -->
          <div class="matrix-cells-grid" style="grid-template-columns: repeat(${cols}, 1fr);">
            ${gridRows.join('')}
          </div>

          <!-- Right Bracket / Bar -->
          <div class="${bracketClass} bracket-right"></div>
        </div>
      </div>
    `;
  }

  /**
   * Generates static display HTML for result matrix
   */
  static renderDisplayMatrix(matrixData, isDeterminant = false) {
    if (!matrixData || matrixData.length === 0) return '—';

    const rows = matrixData.length;
    const cols = matrixData[0].length;
    const bracketClass = isDeterminant ? 'det-bar' : 'matrix-bracket';

    const rowHtml = matrixData.map(row => `
      <div class="matrix-grid-row">
        ${row.map(val => `
          <div class="matrix-cell-display" title="${val}">
            ${typeof val === 'number' ? (Math.abs(val) < 1e-12 ? 0 : val) : val}
          </div>
        `).join('')}
      </div>
    `).join('');

    return `
      <div class="matrix-visual-wrapper ${isDeterminant ? 'is-determinant' : ''}" style="margin: 12px 0;">
        <div class="${bracketClass} bracket-left"></div>
        <div class="matrix-cells-grid" style="grid-template-columns: repeat(${cols}, 1fr);">
          ${rowHtml}
        </div>
        <div class="${bracketClass} bracket-right"></div>
      </div>
    `;
  }
}
