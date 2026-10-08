/**
 * OG - Sets Interactive Venn Diagram Visualizer
 * Liquid Glass SVG visualizer highlighting set relations, cardinality, and element distributions.
 * ES6 Module
 */

export class SetVennVisualizer {
  /**
   * Renders SVG markup for Venn Diagram based on Venn data and active operation
   */
  static renderSVG(vennData, activeOp = 'union') {
    if (!vennData) {
      return this._renderEmptyState();
    }

    const { onlyA = [], intersection = [], onlyB = [], outside = [], cardinalities = {} } = vennData;

    // Determine which regions are active for the current operation
    const activeRegions = this._getActiveRegions(activeOp);

    // Format elements for display inside regions
    const textOnlyA = this._formatRegionElements(onlyA);
    const textIntersection = this._formatRegionElements(intersection);
    const textOnlyB = this._formatRegionElements(onlyB);
    const textOutside = this._formatRegionElements(outside);

    return `
      <div class="venn-diagram-wrapper">
        <svg viewBox="0 0 520 370" class="venn-svg" aria-label="Interactive Sets Venn Diagram">
          <defs>
            <!-- Universal Set Background Gradient (Ivory Liquid Glass) -->
            <linearGradient id="grad-universal" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="rgba(247, 243, 236, 0.90)" />
              <stop offset="100%" stop-color="rgba(235, 227, 214, 0.95)" />
            </linearGradient>

            <!-- Set A Base Glass Gradient (Gold Ambient) -->
            <radialGradient id="grad-set-a" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stop-color="rgba(184, 154, 90, 0.22)" />
              <stop offset="70%" stop-color="rgba(184, 154, 90, 0.10)" />
              <stop offset="100%" stop-color="rgba(184, 154, 90, 0.03)" />
            </radialGradient>

            <!-- Set B Base Glass Gradient (Deep Atlas Navy Ambient) -->
            <radialGradient id="grad-set-b" cx="65%" cy="35%" r="65%">
              <stop offset="0%" stop-color="rgba(14, 29, 97, 0.18)" />
              <stop offset="70%" stop-color="rgba(14, 29, 97, 0.08)" />
              <stop offset="100%" stop-color="rgba(14, 29, 97, 0.02)" />
            </radialGradient>

            <!-- Active Glowing Highlights -->
            <radialGradient id="grad-active-a" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stop-color="rgba(184, 154, 90, 0.48)" />
              <stop offset="100%" stop-color="rgba(184, 154, 90, 0.22)" />
            </radialGradient>

            <radialGradient id="grad-active-b" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stop-color="rgba(14, 29, 97, 0.35)" />
              <stop offset="100%" stop-color="rgba(14, 29, 97, 0.15)" />
            </radialGradient>

            <radialGradient id="grad-active-inter" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stop-color="rgba(184, 154, 90, 0.55)" />
              <stop offset="100%" stop-color="rgba(14, 29, 97, 0.32)" />
            </radialGradient>

            <linearGradient id="grad-active-outside" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="rgba(184, 154, 90, 0.30)" />
              <stop offset="100%" stop-color="rgba(232, 224, 210, 0.70)" />
            </linearGradient>

            <!-- Glow Filter -->
            <filter id="venn-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          <!-- 1. Universal Domain Rectangle (U) -->
          <rect x="8" y="8" width="504" height="354" rx="16" ry="16"
            class="venn-region-universal ${activeRegions.outside ? 'region-active' : ''}"
            fill="${activeRegions.outside ? 'url(#grad-active-outside)' : 'url(#grad-universal)'}"
            stroke="${activeRegions.outside ? 'rgba(184, 154, 90, 0.75)' : 'rgba(184, 154, 90, 0.35)'}"
            stroke-width="1.5" />

          <!-- Universal Set Label & Elements Tag -->
          <text x="24" y="32" class="venn-label-u">𝒰 (Universal Set)</text>
          <text x="500" y="32" text-anchor="end" class="venn-cardinality-tag">n(𝒰) = ${cardinalities.universal ?? 0}</text>

          <!-- Elements outside (A ∪ B)′ in Universal Set -->
          <g class="venn-outside-elements" transform="translate(24, 52)">
            <text class="venn-elements-outside-text">${textOutside}</text>
          </g>

          <!-- 2. Set A Only Region (Moon Left) -->
          <!-- Arc centers: A=(200, 195, r=115), B=(320, 195, r=115). Top=(260, 97.4), Bot=(260, 292.6) -->
          <path d="M 260 97.4 A 115 115 0 0 0 260 292.6 A 115 115 0 1 1 260 97.4 Z"
            class="venn-region venn-region-a ${activeRegions.onlyA ? 'region-active' : ''}"
            fill="${activeRegions.onlyA ? 'url(#grad-active-a)' : 'url(#grad-set-a)'}"
            stroke="${activeRegions.onlyA ? '#B89A5A' : 'rgba(184, 154, 90, 0.45)'}"
            stroke-width="${activeRegions.onlyA ? '2.5' : '1.5'}"
            filter="${activeRegions.onlyA ? 'url(#venn-glow)' : 'none'}" />

          <!-- 3. Intersection Region A ∩ B (Central Lens) -->
          <path d="M 260 97.4 A 115 115 0 0 1 260 292.6 A 115 115 0 0 1 260 97.4 Z"
            class="venn-region venn-region-ab ${activeRegions.intersection ? 'region-active' : ''}"
            fill="${activeRegions.intersection ? 'url(#grad-active-inter)' : 'rgba(184, 154, 90, 0.16)'}"
            stroke="${activeRegions.intersection ? '#B89A5A' : 'rgba(14, 29, 97, 0.25)'}"
            stroke-width="${activeRegions.intersection ? '2.5' : '1.2'}"
            filter="${activeRegions.intersection ? 'url(#venn-glow)' : 'none'}" />

          <!-- 4. Set B Only Region (Moon Right) -->
          <path d="M 260 97.4 A 115 115 0 0 1 260 292.6 A 115 115 0 1 0 260 97.4 Z"
            class="venn-region venn-region-b ${activeRegions.onlyB ? 'region-active' : ''}"
            fill="${activeRegions.onlyB ? 'url(#grad-active-b)' : 'url(#grad-set-b)'}"
            stroke="${activeRegions.onlyB ? '#0E1D61' : 'rgba(14, 29, 97, 0.45)'}"
            stroke-width="${activeRegions.onlyB ? '2.5' : '1.5'}"
            filter="${activeRegions.onlyB ? 'url(#venn-glow)' : 'none'}" />

          <!-- Outer Circle Outlines for crisp definition -->
          <circle cx="200" cy="195" r="115" fill="none" stroke="rgba(184, 154, 90, 0.50)" stroke-width="1.2" stroke-dasharray="4 2" />
          <circle cx="320" cy="195" r="115" fill="none" stroke="rgba(14, 29, 97, 0.45)" stroke-width="1.2" stroke-dasharray="4 2" />

          <!-- Circle Labels -->
          <g class="venn-labels">
            <text x="145" y="110" class="venn-circle-title title-a">Set A</text>
            <text x="145" y="126" class="venn-circle-sub">n(A) = ${cardinalities.A ?? 0}</text>

            <text x="375" y="110" class="venn-circle-title title-b">Set B</text>
            <text x="375" y="126" class="venn-circle-sub">n(B) = ${cardinalities.B ?? 0}</text>

            <text x="260" y="80" text-anchor="middle" class="venn-intersection-title">A ∩ B</text>
          </g>

          <!-- Element Content Inside Regions -->
          <!-- Region A Only Elements -->
          <g class="venn-content-group" transform="translate(155, 195)">
            <text class="venn-elements-label" text-anchor="middle">
              ${textOnlyA}
            </text>
            <text y="24" class="venn-count-badge" text-anchor="middle">(${onlyA.length})</text>
          </g>

          <!-- Region Intersection Elements -->
          <g class="venn-content-group" transform="translate(260, 195)">
            <text class="venn-elements-label inter-text" text-anchor="middle">
              ${textIntersection}
            </text>
            <text y="24" class="venn-count-badge" text-anchor="middle">(${intersection.length})</text>
          </g>

          <!-- Region B Only Elements -->
          <g class="venn-content-group" transform="translate(365, 195)">
            <text class="venn-elements-label" text-anchor="middle">
              ${textOnlyB}
            </text>
            <text y="24" class="venn-count-badge" text-anchor="middle">(${onlyB.length})</text>
          </g>

          <!-- Region Active Indicator Legend -->
          <g transform="translate(24, 335)" class="venn-legend">
            <circle cx="6" cy="-4" r="5" fill="${this._getLegendColor(activeOp)}" />
            <text x="18" y="0" class="venn-legend-text">
              Active Focus: <tspan font-weight="700" fill="#0E1D61">${this._getLegendText(activeOp)}</tspan>
            </text>
          </g>
        </svg>

        <!-- Venn Quick Region Inspector Tooltips / Breakdown -->
        <div class="venn-region-stats-bar">
          <div class="region-stat ${activeRegions.onlyA ? 'active' : ''}">
            <span class="region-dot dot-a"></span>
            <span class="region-name">A - B:</span>
            <span class="region-val">{${onlyA.slice(0, 4).join(', ')}${onlyA.length > 4 ? '...' : ''}} (${onlyA.length})</span>
          </div>
          <div class="region-stat ${activeRegions.intersection ? 'active' : ''}">
            <span class="region-dot dot-ab"></span>
            <span class="region-name">A ∩ B:</span>
            <span class="region-val">{${intersection.slice(0, 4).join(', ')}${intersection.length > 4 ? '...' : ''}} (${intersection.length})</span>
          </div>
          <div class="region-stat ${activeRegions.onlyB ? 'active' : ''}">
            <span class="region-dot dot-b"></span>
            <span class="region-name">B - A:</span>
            <span class="region-val">{${onlyB.slice(0, 4).join(', ')}${onlyB.length > 4 ? '...' : ''}} (${onlyB.length})</span>
          </div>
          <div class="region-stat ${activeRegions.outside ? 'active' : ''}">
            <span class="region-dot dot-u"></span>
            <span class="region-name">Outside:</span>
            <span class="region-val">(${outside.length})</span>
          </div>
        </div>
      </div>
    `;
  }

  static _getActiveRegions(activeOp) {
    switch (activeOp) {
      case 'union':
        return { onlyA: true, intersection: true, onlyB: true, outside: false };
      case 'intersection':
        return { onlyA: false, intersection: true, onlyB: false, outside: false };
      case 'diffAB':
        return { onlyA: true, intersection: false, onlyB: false, outside: false };
      case 'diffBA':
        return { onlyA: false, intersection: false, onlyB: true, outside: false };
      case 'symDiff':
        return { onlyA: true, intersection: false, onlyB: true, outside: false };
      case 'complementA':
        return { onlyA: false, intersection: false, onlyB: true, outside: true };
      case 'complementB':
        return { onlyA: true, intersection: false, onlyB: false, outside: true };
      case 'subsetAB':
      case 'properSubsetAB':
        return { onlyA: true, intersection: true, onlyB: false, outside: false };
      case 'powerSetA':
        return { onlyA: true, intersection: true, onlyB: false, outside: false };
      case 'powerSetB':
        return { onlyA: false, intersection: true, onlyB: true, outside: false };
      case 'cartesianAB':
        return { onlyA: true, intersection: true, onlyB: true, outside: false };
      default:
        return { onlyA: true, intersection: true, onlyB: true, outside: false };
    }
  }

  static _formatRegionElements(arr, max = 5) {
    if (!arr || arr.length === 0) return '∅';
    if (arr.length <= max) return arr.join(', ');
    return `${arr.slice(0, max).join(', ')} +${arr.length - max}`;
  }

  static _getLegendColor(activeOp) {
    if (activeOp === 'intersection') return '#B89A5A';
    if (activeOp === 'diffAB') return '#B89A5A';
    if (activeOp === 'diffBA') return '#0E1D61';
    if (activeOp.startsWith('complement')) return '#B89A5A';
    return '#B89A5A';
  }

  static _getLegendText(activeOp) {
    const map = {
      union: 'A ∪ B (All combined regions)',
      intersection: 'A ∩ B (Shared middle region)',
      diffAB: 'A - B (Exclusively in Set A)',
      diffBA: 'B - A (Exclusively in Set B)',
      symDiff: 'A Δ B (Either A or B, but not both)',
      complementA: 'A′ (Everything outside Set A)',
      complementB: 'B′ (Everything outside Set B)',
      subsetAB: 'A ⊆ B (Is A completely inside B?)',
      subsetBA: 'B ⊆ A (Is B completely inside A?)',
      properSubsetAB: 'A ⊂ B (Proper containment test)',
      cartesianAB: 'A × B (Cross product combinations)',
      powerSetA: '𝒫(A) (All subsets of A)',
      powerSetB: '𝒫(B) (All subsets of B)'
    };
    return map[activeOp] || activeOp;
  }

  static _renderEmptyState() {
    return `
      <div class="venn-empty-state glass-panel">
        <div class="venn-empty-icon">∅</div>
        <p>Enter valid sets above to compute and visualize Venn relations.</p>
      </div>
    `;
  }
}
