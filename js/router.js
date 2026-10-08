/**
 * OG - Lightweight Client-Side Router
 * ES6 Module
 */

import { store } from './state.js';
import { MATHEMATICS_MODULES, MODULE_CATEGORIES, renderModuleCard } from './modules.js';
import { FormulaLibraryView, FORMULA_DATABASE } from './formulas.js';
import { CalculatorController } from './calculator.js';
import { HistoryView } from './history.js';
import { copyToClipboard, showToast, SVG_ICONS } from './utils.js';
import { SetsView } from './modules/sets/index.js';
import { RelationsView } from './modules/relations/index.js';
import { TrigView } from './modules/trigonometry/index.js';
import { CombinatoricsView } from './modules/combinatorics/index.js';
import { BinomialView } from './modules/binomial/index.js';
import { MatricesView } from './modules/matrices/index.js';
import { DeterminantsView } from './modules/determinants/index.js';
import {
  CalculusView,
  CalculusToolsView,
  LimitsView,
  ContinuityView,
  ApplicationsDerivativesView,
  IntegralsView,
  ApplicationsIntegralsView,
  DifferentialEquationsView
} from './modules/calculus/index.js';
import { GraphCalculatorView } from './modules/graphing/index.js';
import {
  StraightLinesView,
  ConicSectionsView,
  Intro3DView,
  CoordinateGeometryView,
  CoordinateGeometryToolsView
} from './modules/geometry/index.js';
import { StatisticsView, StatisticsToolsView } from './modules/statistics/index.js';
import { ProbabilityView, ProbabilityToolsView } from './modules/probability/index.js';
import { InverseTrigView } from './modules/trigonometry/inverse_view.js';
import { VectorsView } from './modules/vectors/index.js';
import { LinearProgrammingView } from './modules/optimization/index.js';
import { PracticeView } from './practice/index.js';
import {
  ComplexNumbersView,
  LinearInequalitiesView,
  SequenceSeriesView,
  AlgebraView,
  AlgebraToolsView
} from './modules/algebra/index.js';
import { LinearAlgebraView, MatrixLabView } from './modules/linearAlgebra/index.js';
import { VectorsOptimizationDashboardView, VectorLabView } from './modules/vectorsOptimization/index.js';

export class Router {
  constructor(routes = {}) {
    this.routes = routes;
    this.appContainer = document.getElementById('main-content');
    this.currentPath = '';

    window.addEventListener('hashchange', () => this.handleRoute());
    window.addEventListener('load', () => this.handleRoute());

    // Immediate initial route resolution
    this.handleRoute();
  }

  handleRoute() {
    let hash = window.location.hash.slice(1);
    if (!hash || hash === '' || hash === '/') {
      hash = '/';
    }

    this.currentPath = hash;
    this.updateActiveNavLinks(hash);

    // --- Smooth Exit Transition ---
    // If there is existing content, animate it out before unmounting
    const existingContent = this.appContainer.firstElementChild;
    if (existingContent && existingContent.classList.contains('view-animate-in')) {
      existingContent.classList.remove('view-animate-in');
      existingContent.classList.add('view-animate-out');
    }

    // Teardown previous active view after exit animation
    const doRender = () => {
      if (this.currentView && typeof this.currentView.destroy === 'function') {
        try {
          this.currentView.destroy();
        } catch (err) {
          // silent cleanup
        }
        this.currentView = null;
      }

      // Route matching
      if (hash === '/') {
        this.renderDashboard();
      } else if (hash === '/calculator') {
        this.renderCalculatorView();
      } else if (hash === '/graph' || hash === '/graphing' || hash === '/graph-calculator') {
        this.renderGraphCalculatorView();
      } else if (hash === '/algebra') {
        this.renderAlgebraWorkspaceView();
      } else if (hash.startsWith('/algebra/')) {
        const tool = hash.replace('/algebra/', '');
        this.renderAlgebraToolsView(tool);
      } else if (hash === '/algebra-tools') {
        this.renderAlgebraToolsView('equation-solver');
      } else if (hash.startsWith('/algebra-tools/')) {
        const tool = hash.replace('/algebra-tools/', '');
        this.renderAlgebraToolsView(tool);
      } else if (hash === '/linear-algebra' || hash === '/linear-algebra-lab') {
        this.renderLinearAlgebraWorkspaceView();
      } else if (hash === '/linear-algebra/matrix-calculator' || hash === '/matrix-calculator') {
        this.renderMatrixLabView();
      } else if (hash === '/vectors-optimization' || hash === '/vectors-optimization-lab') {
        this.renderVectorsOptimizationDashboardView();
      } else if (hash === '/vector-lab' || hash === '/vectors-optimization/vector-calculator' || hash === '/vector-calculator') {
        this.renderVectorLabView();
      } else if (hash === '/geometry' || hash === '/coordinate-geometry') {
        this.renderCoordinateGeometryWorkspaceView();
      } else if (hash.startsWith('/geometry/')) {
        const tool = hash.replace('/geometry/', '');
        this.renderCoordinateGeometryToolsView(tool);
      } else if (hash === '/geometry-tools') {
        this.renderCoordinateGeometryToolsView('point-calculator');
      } else if (hash.startsWith('/geometry-tools/')) {
        const tool = hash.replace('/geometry-tools/', '');
        this.renderCoordinateGeometryToolsView(tool);
      } else if (hash === '/calculus') {
        this.renderCalculusWorkspaceView();
      } else if (hash.startsWith('/calculus/')) {
        const tool = hash.replace('/calculus/', '');
        this.renderCalculusToolsView(tool);
      } else if (hash === '/calculus-tools') {
        this.renderCalculusToolsView('limits');
      } else if (hash.startsWith('/calculus-tools/')) {
        const tool = hash.replace('/calculus-tools/', '');
        this.renderCalculusToolsView(tool);
      } else if (hash === '/statistics' || hash === '/stats') {
        this.renderStatisticsWorkspaceView();
      } else if (hash.startsWith('/statistics/')) {
        const tool = hash.replace('/statistics/', '');
        this.renderStatisticsToolsView(tool);
      } else if (hash === '/statistics-tools') {
        this.renderStatisticsToolsView('data-input');
      } else if (hash.startsWith('/statistics-tools/')) {
        const tool = hash.replace('/statistics-tools/', '');
        this.renderStatisticsToolsView(tool);
      } else if (hash === '/probability' || hash === '/prob') {
        this.renderProbabilityWorkspaceView();
      } else if (hash.startsWith('/probability/')) {
        const tool = hash.replace('/probability/', '');
        this.renderProbabilityToolsView(tool);
      } else if (hash === '/probability-tools') {
        this.renderProbabilityToolsView('calculator');
      } else if (hash.startsWith('/probability-tools/')) {
        const tool = hash.replace('/probability-tools/', '');
        this.renderProbabilityToolsView(tool);
      } else if (hash === '/modules') {
        this.renderModulesView();
      } else if (hash.startsWith('/modules/')) {
        const moduleId = hash.replace('/modules/', '');
        if (moduleId === 'calculus' || moduleId === 'calculus-workspace') {
          this.renderCalculusWorkspaceView();
        } else if (moduleId === 'algebra' || moduleId === 'algebra-workspace') {
          this.renderAlgebraWorkspaceView();
        } else if (moduleId === 'linear-algebra' || moduleId === 'linear-algebra-lab') {
          this.renderLinearAlgebraWorkspaceView();
        } else if (moduleId === 'vectors-optimization' || moduleId === 'vectors-optimization-lab') {
          this.renderVectorsOptimizationDashboardView();
        } else if (moduleId === 'sets' || moduleId === '1') {
          this.renderSetsModuleView();
        } else if (moduleId === 'relations-functions' || moduleId === '2' || moduleId === 'relations') {
          this.renderRelationsModuleView();
        } else if (moduleId === 'trigonometric-functions' || moduleId === '3' || moduleId === 'trig') {
          this.renderTrigModuleView();
        } else if (moduleId === 'complex-numbers' || moduleId === '4' || moduleId === 'complex') {
          this.renderComplexNumbersModuleView();
        } else if (moduleId === 'linear-inequalities' || moduleId === '5' || moduleId === 'inequalities') {
          this.renderLinearInequalitiesModuleView();
        } else if (moduleId === 'permutations-combinations' || moduleId === '6' || moduleId === 'permutations') {
          this.renderCombinatoricsModuleView();
        } else if (moduleId === 'binomial-theorem' || moduleId === '7' || moduleId === 'binomial') {
          this.renderBinomialModuleView();
        } else if (moduleId === 'sequence-series' || moduleId === '8' || moduleId === 'sequences') {
          this.renderSequenceSeriesModuleView();
        } else if (moduleId === 'straight-lines' || moduleId === '9' || moduleId === 'lines') {
          this.renderStraightLinesModuleView();
        } else if (moduleId === 'conic-sections' || moduleId === '10' || moduleId === 'conics') {
          this.renderConicSectionsModuleView();
        } else if (moduleId === 'matrices' || moduleId === '16' || moduleId === 'matrix') {
          this.renderMatricesModuleView();
        } else if (moduleId === 'determinants' || moduleId === '17' || moduleId === 'determinant') {
          this.renderDeterminantsModuleView();
        } else if (moduleId === 'limits-derivatives' || moduleId === '12' || moduleId === 'limits') {
          this.renderLimitsModuleView();
        } else if (moduleId === 'continuity-differentiability' || moduleId === '18' || moduleId === 'continuity') {
          this.renderContinuityModuleView();
        } else if (moduleId === 'applications-of-derivatives' || moduleId === '19' || moduleId === 'applications-derivatives') {
          this.renderApplicationsDerivativesModuleView();
        } else if (moduleId === 'integrals' || moduleId === '20' || moduleId === 'integral') {
          this.renderIntegralsModuleView();
        } else if (moduleId === 'applications-of-integrals' || moduleId === '21' || moduleId === 'applications-integrals') {
          this.renderApplicationsIntegralsModuleView();
        } else if (moduleId === 'differential-equations' || moduleId === '22' || moduleId === 'differential') {
          this.renderDifferentialEquationsModuleView();
        } else if (moduleId === 'intro-3d-geometry' || moduleId === '11' || moduleId === '3d-geometry') {
          this.renderIntro3DModuleView();
        } else if (moduleId === 'statistics' || moduleId === '13' || moduleId === 'stats') {
          this.renderStatisticsModuleView();
        } else if (moduleId === 'probability' || moduleId === '14' || moduleId === 'prob') {
          this.renderProbabilityModuleView();
        } else if (moduleId === 'inverse-trigonometric-functions' || moduleId === '15' || moduleId === 'inverse-trig') {
          this.renderInverseTrigModuleView();
        } else if (moduleId === 'vectors-3d-geometry' || moduleId === '23' || moduleId === 'vectors') {
          this.renderVectorsModuleView();
        } else if (moduleId === 'linear-programming' || moduleId === '24' || moduleId === 'lpp') {
          this.renderLinearProgrammingModuleView();
        } else {
          this.renderModuleDetailView(moduleId);
        }
      } else if (hash === '/formulas') {
        this.renderFormulasView();
      } else if (hash === '/practice') {
        this.renderPracticeView();
      } else if (hash === '/history') {
        this.renderHistoryScreen();
      } else if (hash === '/settings') {
        this.renderSettingsView();
      } else {
        this.render404View();
      }

      // Smooth scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // If there was an outgoing view, wait for its exit animation (220ms) before rendering
    if (existingContent && existingContent.classList.contains('view-animate-out')) {
      setTimeout(doRender, 210);
    } else {
      doRender();
    }
  }

  updateActiveNavLinks(hash) {
    const desktopLinks = document.querySelectorAll('.nav-link-item a');
    const mobileLinks = document.querySelectorAll('.mobile-nav-link');

    const cleanHash = '#' + (hash === '/' ? '/' : hash);

    desktopLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href === cleanHash ||
          (href === '#/modules' && hash.startsWith('/modules') && !hash.startsWith('/modules/algebra') && !hash.startsWith('/modules/geometry') && !hash.startsWith('/modules/calculus') && !hash.startsWith('/modules/statistics') && !hash.startsWith('/modules/probability') && !hash.startsWith('/modules/linear-algebra') && !hash.startsWith('/modules/vectors-optimization')) ||
          (href === '#/algebra' && (hash === '/algebra' || hash.startsWith('/algebra') || hash.startsWith('/algebra-tools'))) ||
          (href === '#/linear-algebra' && (hash === '/linear-algebra' || hash.startsWith('/linear-algebra') || hash === '/matrix-calculator')) ||
          (href === '#/vectors-optimization' && (hash === '/vectors-optimization' || hash.startsWith('/vectors-optimization') || hash === '/vector-lab' || hash === '/vector-calculator')) ||
          (href === '#/geometry' && (hash === '/geometry' || hash.startsWith('/geometry') || hash.startsWith('/geometry-tools') || hash.startsWith('/coordinate-geometry'))) ||
          (href === '#/calculus' && (hash === '/calculus' || hash.startsWith('/calculus') || hash.startsWith('/calculus-tools'))) ||
          (href === '#/statistics' && (hash === '/statistics' || hash.startsWith('/statistics') || hash.startsWith('/statistics-tools') || hash === '/modules/13' || hash === '/modules/statistics')) ||
          (href === '#/probability' && (hash === '/probability' || hash.startsWith('/probability') || hash.startsWith('/probability-tools') || hash === '/modules/14' || hash === '/modules/probability'))) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    mobileLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href === cleanHash ||
          (href === '#/modules' && hash.startsWith('/modules') && !hash.startsWith('/modules/algebra') && !hash.startsWith('/modules/geometry') && !hash.startsWith('/modules/calculus') && !hash.startsWith('/modules/statistics') && !hash.startsWith('/modules/probability') && !hash.startsWith('/modules/linear-algebra') && !hash.startsWith('/modules/vectors-optimization')) ||
          (href === '#/algebra' && (hash === '/algebra' || hash.startsWith('/algebra') || hash.startsWith('/algebra-tools'))) ||
          (href === '#/linear-algebra' && (hash === '/linear-algebra' || hash.startsWith('/linear-algebra') || hash === '/matrix-calculator')) ||
          (href === '#/vectors-optimization' && (hash === '/vectors-optimization' || hash.startsWith('/vectors-optimization') || hash === '/vector-lab' || hash === '/vector-calculator')) ||
          (href === '#/geometry' && (hash === '/geometry' || hash.startsWith('/geometry') || hash.startsWith('/geometry-tools') || hash.startsWith('/coordinate-geometry'))) ||
          (href === '#/calculus' && (hash === '/calculus' || hash.startsWith('/calculus') || hash.startsWith('/calculus-tools'))) ||
          (href === '#/statistics' && (hash === '/statistics' || hash.startsWith('/statistics') || hash.startsWith('/statistics-tools') || hash === '/modules/13' || hash === '/modules/statistics')) ||
          (href === '#/probability' && (hash === '/probability' || hash.startsWith('/probability') || hash.startsWith('/probability-tools') || hash === '/modules/14' || hash === '/modules/probability'))) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }

  // ------------------------------------------------------------------------
  // 1. PRODUCTION DASHBOARD VIEW
  // ------------------------------------------------------------------------
  renderDashboard() {
    document.title = 'OG • Mathematics • Calculate • Understand';
    const history = store.getState().history;
    const practice = store.getState().practiceProgress;
    const hasPracticeData = practice && practice.solvedCount > 0;

    // 6 Featured Modules: Sets, Trigonometric Functions, Matrices, Probability, Derivatives, Integrals
    const featuredIds = ['sets', 'trigonometric-functions', 'matrices', 'probability', 'limits-derivatives', 'integrals'];
    const featuredModules = featuredIds
      .map(id => MATHEMATICS_MODULES.find(m => m.id === id))
      .filter(Boolean);
    const featuredModulesHtml = featuredModules.map(renderModuleCard).join('');

    // Recent Activity Panel Content (Empty State vs Real Data)
    let activityContentHtml = '';
    if (!history || history.length === 0) {
      activityContentHtml = `
        <div class="empty-state-wrap">
          <div class="empty-state-icon">∿</div>
          <div class="empty-state-title">No Recent Activity Yet</div>
          <p class="empty-state-desc">
            Calculations and mathematical evaluations performed in the Scientific Calculator or modules will appear here in real-time.
          </p>
          <a href="#/calculator" class="glass-btn glass-btn-primary" style="margin-top: 4px; min-height: 38px; padding: 6px 18px; font-size: 0.86rem;">
            <span>Start a Calculation</span>
            ${SVG_ICONS.arrowRight}
          </a>
        </div>
      `;
    } else {
      activityContentHtml = `
        <div class="activity-list">
          ${history.slice(0, 4).map(item => `
            <div class="activity-item">
              <div class="activity-meta">
                <div class="activity-tags">
                  <span class="activity-module-tag">${item.module || 'Scientific Calculator'}</span>
                  <span class="activity-time-tag">${item.timestamp || 'Recent'}</span>
                </div>
                <div class="activity-expr">${item.expression}</div>
              </div>
              <div class="activity-result-badge">= ${item.result}</div>
            </div>
          `).join('')}
        </div>
      `;
    }

    // Practice Progress Content (Empty State vs Real Data)
    let practiceContentHtml = '';
    if (!hasPracticeData) {
      practiceContentHtml = `
        <div class="glass-panel practice-progress-card">
          <div class="practice-progress-header">
            <h3 style="font-size: 1.15rem;">Practice Progress</h3>
            <span class="badge" style="color: var(--text-tertiary); background: rgba(255,255,255,0.04);">0% Complete</span>
          </div>
          <div class="progress-track-large">
            <div class="progress-fill-real" style="width: 0%;"></div>
          </div>
          <div class="empty-state-wrap" style="padding: 20px; border-style: solid; border-color: rgba(255,255,255,0.06);">
            <div style="font-size: 0.95rem; font-weight: 700; color: var(--text-white);">No Practice Sessions Recorded</div>
            <p style="font-size: 0.84rem; color: var(--text-secondary); margin: 0;">Solve exercises across the 24 modules to build your verified mastery track.</p>
            <a href="#/practice" class="glass-btn glass-btn-primary" style="min-height: 38px; padding: 6px 18px; font-size: 0.84rem; margin-top: 6px;">
              <span>Start Practice</span>
              ${SVG_ICONS.arrowRight}
            </a>
          </div>
        </div>
      `;
    } else {
      const pct = Math.min(100, Math.round((practice.completedModules.length / 24) * 100));
      practiceContentHtml = `
        <div class="glass-panel practice-progress-card">
          <div class="practice-progress-header">
            <h3 style="font-size: 1.15rem;">Practice Progress</h3>
            <span class="badge badge-algebra">${pct}% Complete</span>
          </div>
          <div class="progress-track-large">
            <div class="progress-fill-real" style="width: ${pct}%;"></div>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.06);">
            <div style="font-size: 0.88rem; color: var(--text-secondary);">
              Solved: <strong style="color: var(--text-white); font-family: var(--font-math);">${practice.solvedCount} Questions</strong>
            </div>
            <div style="font-size: 0.88rem; color: var(--text-secondary);">
              Coverage: <strong style="color: var(--accent-cyan); font-family: var(--font-math);">${practice.completedModules.length} / 24 Modules</strong>
            </div>
          </div>
        </div>
      `;
    }

    this.appContainer.innerHTML = `
      <div class="view-animate-in">
        <!-- Center Hero Section -->
        <section class="hero-section">
          <!-- Ambient Orbit Mathematical Symbols around Hero -->
          <div class="hero-orbit-container" aria-hidden="true">
            <span class="hero-orbit-glyph hero-orbit-glyph-1">π ≈ 3.14159</span>
            <span class="hero-orbit-glyph hero-orbit-glyph-2">∫ f(x) dx</span>
            <span class="hero-orbit-glyph hero-orbit-glyph-3">e^(iπ) + 1 = 0</span>
            <span class="hero-orbit-glyph hero-orbit-glyph-4">∑ 1/n² = π²/6</span>
          </div>

          <div class="hero-pill-badge">
            <span class="sparkle">✦</span>
            <span>Spatial Mathematics Platform</span>
          </div>

          <div class="hero-title-group">
            <h1 class="hero-brand">OG</h1>
            <h2 class="hero-subtitle">Mathematics, simplified.</h2>
            <p class="hero-description">
              Calculate, visualize and understand mathematics in one powerful workspace.
            </p>
          </div>

          <div class="hero-actions">
            <a href="#/calculator" class="glass-btn glass-btn-primary" id="btn-hero-calc">
              <span>START CALCULATING</span>
              ${SVG_ICONS.arrowRight}
            </a>
            <a href="#/modules" class="glass-btn glass-btn-outline" id="btn-hero-modules">
              <span>EXPLORE MODULES</span>
              ${SVG_ICONS.modules}
            </a>
          </div>
        </section>

        <!-- Quick Tools: Four Elevated Glass Cards -->
        <section>
          <div class="section-header">
            <div class="section-title-wrap">
              <h2>Quick Tools</h2>
              <p>Specialized mathematical workspaces designed for fast evaluation</p>
            </div>
          </div>

          <div class="quick-tools-grid">
            <a href="#/calculator" class="quick-tool-card glass-elevated" id="card-scientific-calc">
              <div>
                <div class="quick-tool-icon-wrap">${SVG_ICONS.calculator}</div>
                <div class="quick-tool-info">
                  <h3>Scientific Calculator</h3>
                  <p>Trigonometric, logarithmic, algebraic and exponential expressions with memory management.</p>
                </div>
              </div>
              <div class="quick-tool-footer">
                <span class="quick-tool-action">Launch Calculator</span>
                <div class="quick-tool-arrow">${SVG_ICONS.arrowRight}</div>
              </div>
            </a>

            <a href="#/graph" class="quick-tool-card glass-elevated" id="card-graph-calc">
              <div>
                <div class="quick-tool-icon-wrap">${SVG_ICONS.graph}</div>
                <div class="quick-tool-info">
                  <h3>Graph Calculator</h3>
                  <p>Coordinate geometry, curves, conic sections, and function plotting workspace.</p>
                </div>
              </div>
              <div class="quick-tool-footer">
                <span class="quick-tool-action">Plot Functions</span>
                <div class="quick-tool-arrow">${SVG_ICONS.arrowRight}</div>
              </div>
            </a>

            <a href="#/algebra" class="quick-tool-card glass-elevated" id="card-algebra-workspace">
              <div>
                <div class="quick-tool-icon-wrap"><span style="font-family:var(--font-math);font-size:1.4rem;font-weight:700;color:var(--color-navy,#0E1D61);">x²</span></div>
                <div class="quick-tool-info">
                  <h3>Algebra Workspace</h3>
                  <p>Solve equations, factorize, simplify, analyze polynomials, and explore 8 curriculum modules.</p>
                </div>
              </div>
              <div class="quick-tool-footer">
                <span class="quick-tool-action">Explore Algebra</span>
                <div class="quick-tool-arrow">${SVG_ICONS.arrowRight}</div>
              </div>
            </a>

            <a href="#/geometry" class="quick-tool-card glass-elevated" id="card-geometry-workspace">
              <div>
                <div class="quick-tool-icon-wrap"><span style="font-family:var(--font-math);font-size:1.4rem;font-weight:700;color:var(--color-navy,#0E1D61);">📐</span></div>
                <div class="quick-tool-info">
                  <h3>Coordinate Geometry</h3>
                  <p>Plot, analyze, and visualize points, straight lines, circles, conics, and 3D space.</p>
                </div>
              </div>
              <div class="quick-tool-footer">
                <span class="quick-tool-action">Launch Geometry</span>
                <div class="quick-tool-arrow">${SVG_ICONS.arrowRight}</div>
              </div>
            </a>

            <a href="#/calculus" class="quick-tool-card glass-elevated" id="card-calculus-workspace">
              <div>
                <div class="quick-tool-icon-wrap"><span style="font-family:var(--font-math);font-size:1.4rem;font-weight:700;color:var(--color-navy,#0E1D61);">∫dx</span></div>
                <div class="quick-tool-info">
                  <h3>Calculus Workspace</h3>
                  <p>Understand change, motion, area and accumulation: limits, derivatives, integrals & ODEs.</p>
                </div>
              </div>
              <div class="quick-tool-footer">
                <span class="quick-tool-action">Launch Calculus</span>
                <div class="quick-tool-arrow">${SVG_ICONS.arrowRight}</div>
              </div>
            </a>

            <a href="#/linear-algebra" class="quick-tool-card glass-elevated" id="card-linear-algebra-workspace">
              <div>
                <div class="quick-tool-icon-wrap"><span style="font-family:var(--font-math);font-size:1.4rem;font-weight:700;color:var(--color-navy,#0E1D61);">[A]</span></div>
                <div class="quick-tool-info">
                  <h3>Linear Algebra Lab</h3>
                  <p>Dynamic matrices, determinants, inverse [A|I], RREF, rank, eigenvalues and 20 lab modules.</p>
                </div>
              </div>
              <div class="quick-tool-footer">
                <span class="quick-tool-action">Launch Linear Algebra</span>
                <div class="quick-tool-arrow">${SVG_ICONS.arrowRight}</div>
              </div>
            </a>

            <a href="#/vectors-optimization" class="quick-tool-card glass-elevated" id="card-vectors-optimization-workspace">
              <div>
                <div class="quick-tool-icon-wrap"><span style="font-family:var(--font-math);font-size:1.4rem;font-weight:700;color:var(--color-navy,#0E1D61);">⟨v⟩</span></div>
                <div class="quick-tool-info">
                  <h3>Vectors & Optimization</h3>
                  <p>Euclidean vectors, 3D geometry lines/planes, critical points, and linear programming.</p>
                </div>
              </div>
              <div class="quick-tool-footer">
                <span class="quick-tool-action">Launch Vectors & Opt</span>
                <div class="quick-tool-arrow">${SVG_ICONS.arrowRight}</div>
              </div>
            </a>

            <a href="#/formulas" class="quick-tool-card glass-elevated" id="card-formula-library">
              <div>
                <div class="quick-tool-icon-wrap">${SVG_ICONS.formulas}</div>
                <div class="quick-tool-info">
                  <h3>Formula Library</h3>
                  <p>Comprehensive verified mathematical reference library across 6 primary branches.</p>
                </div>
              </div>
              <div class="quick-tool-footer">
                <span class="quick-tool-action">Browse Formulas</span>
                <div class="quick-tool-arrow">${SVG_ICONS.arrowRight}</div>
              </div>
            </a>

            <a href="#/practice" class="quick-tool-card glass-elevated" id="card-practice-system">
              <div>
                <div class="quick-tool-icon-wrap">${SVG_ICONS.practice}</div>
                <div class="quick-tool-info">
                  <h3>Practice</h3>
                  <p>Curated problem-solving challenges, step checkpoints, and concept mastery track.</p>
                </div>
              </div>
              <div class="quick-tool-footer">
                <span class="quick-tool-action">Start Practice</span>
                <div class="quick-tool-arrow">${SVG_ICONS.arrowRight}</div>
              </div>
            </a>
          </div>
        </section>

        <!-- Featured Modules: 6 Core Modules initially + Explore all 24 modules -->
        <section class="featured-modules-container">
          <div class="section-header">
            <div class="section-title-wrap">
              <h2>Featured Modules</h2>
              <p>Foundational mathematical disciplines curated for focused study and theorem mastery</p>
            </div>
            <a href="#/modules" class="glass-btn glass-btn-primary" style="min-height: 42px; padding: 8px 22px; font-size: 0.9rem;">
              <span>Explore all 24 modules</span>
              ${SVG_ICONS.arrowRight}
            </a>
          </div>

          <div class="modules-grid">
            ${featuredModulesHtml}
          </div>
        </section>

        <!-- Production Split Grid: Recent Activity & Formula of Day / Practice Progress -->
        <section class="dashboard-grid-split">
          <!-- Left: Recent Activity Panel -->
          <div class="glass-panel activity-panel">
            <div class="activity-header">
              <div>
                <h3 style="font-size: 1.25rem;">Recent Activity</h3>
                <p style="font-size: 0.88rem; color: var(--text-secondary); margin-top: 2px;">Calculations and evaluations across OG modules</p>
              </div>
              <a href="#/history" style="font-size: 0.84rem; font-weight: 600; color: var(--accent-cyan); display: inline-flex; align-items: center; gap: 4px;">
                <span>View Full History</span>
                ${SVG_ICONS.arrowRight}
              </a>
            </div>

            ${activityContentHtml}
          </div>

          <!-- Right: Formula of the Day + Practice Progress -->
          <div style="display: flex; flex-direction: column; gap: 20px;">
            <!-- Formula of the Day Card -->
            <div class="glass-panel formula-of-day-card">
              <div class="formula-of-day-header">
                <span class="badge badge-calculus">Formula of the Day</span>
                <button class="glass-btn glass-btn-icon" data-copy-formula="e^(iπ) + 1 = 0" title="Copy Euler's Identity" aria-label="Copy formula">
                  ${SVG_ICONS.copy}
                </button>
              </div>
              <div>
                <h4 style="font-size: 1.15rem; color: var(--text-white); margin-bottom: 4px;">Euler’s Identity</h4>
                <p class="formula-meaning-text">Profoundly unifies the five fundamental mathematical constants ($e, i, \pi, 1, 0$) in a single identity.</p>
              </div>
              <div class="formula-display-box">
                <span class="formula-math-text">e^(iπ) + 1 = 0</span>
                <a href="#/formulas" class="glass-btn glass-btn-outline" style="min-height: 36px; padding: 4px 14px; font-size: 0.82rem;">
                  <span>Explore</span>
                  ${SVG_ICONS.arrowRight}
                </a>
              </div>
            </div>

            <!-- Practice Progress Card -->
            ${practiceContentHtml}
          </div>
        </section>
      </div>
    `;

    // Attach copy formula handler
    document.querySelectorAll('[data-copy-formula]').forEach(btn => {
      btn.addEventListener('click', () => {
        const val = btn.getAttribute('data-copy-formula');
        copyToClipboard(val, 'Formula copied to clipboard!');
      });
    });
  }

  // ------------------------------------------------------------------------
  // 2. DEDICATED SCIENTIFIC CALCULATOR VIEW
  // ------------------------------------------------------------------------
  renderCalculatorView() {
    document.title = 'OG • Scientific Calculator';
    const prefs = store.getState().userPreferences;
    const calcState = store.getState().calculator;

    this.appContainer.innerHTML = `
      <div class="view-animate-in">
        <div class="calc-wrapper">
          <!-- Screen Header & Mode Toolbar -->
          <div class="calc-top-toolbar">
            <div style="display: flex; align-items: center; gap: 14px; flex-wrap: wrap;">
              <h2>Calculator</h2>
              <!-- Mode Tabs: Basic vs Scientific -->
              <div class="calc-mode-switch">
                <button class="mode-tab-btn ${calcState.mode === 'scientific' ? 'active' : ''}" data-calc-mode="scientific">Scientific</button>
                <button class="mode-tab-btn ${calcState.mode === 'basic' ? 'active' : ''}" data-calc-mode="basic">Basic</button>
              </div>
            </div>

            <!-- Precision & History Shortcut -->
            <div class="calc-toolbar-actions">
              <label for="calc-precision-select" style="font-size: 0.8rem; color: var(--text-tertiary);">Precision:</label>
              <select id="calc-precision-select" class="calc-precision-select" aria-label="Decimal Precision">
                <option value="2" ${prefs.precision === 2 ? 'selected' : ''}>2 Decimals</option>
                <option value="4" ${prefs.precision === 4 ? 'selected' : ''}>4 Decimals</option>
                <option value="6" ${prefs.precision === 6 ? 'selected' : ''}>6 Decimals</option>
                <option value="8" ${prefs.precision === 8 ? 'selected' : ''}>8 Decimals</option>
                <option value="10" ${prefs.precision === 10 ? 'selected' : ''}>10 Decimals</option>
                <option value="12" ${prefs.precision === 12 ? 'selected' : ''}>12 Decimals</option>
              </select>
            </div>
          </div>

          <!-- Main Calculator Frame -->
          <div class="calc-frame glass-elevated" id="full-calc-container">
            <!-- Liquid Glass Display Screen -->
            <div class="calc-screen">
              <div class="calc-screen-header">
                <!-- Angle Mode DEG / RAD -->
                <div class="calc-angle-toggles">
                  <button class="calc-badge ${prefs.angleMode === 'DEG' ? 'active' : ''}" id="calc-badge-deg" data-calc-action="angle-deg" title="Degree Mode">DEG</button>
                  <button class="calc-badge ${prefs.angleMode === 'RAD' ? 'active' : ''}" id="calc-badge-rad" data-calc-action="angle-rad" title="Radian Mode">RAD</button>
                </div>

                <!-- Screen Actions: Copy Result -->
                <div class="calc-screen-actions">
                  <button class="screen-action-btn" data-calc-action="copy" title="Copy result to clipboard">
                    ${SVG_ICONS.copy}
                    <span>Copy Result</span>
                  </button>
                </div>
              </div>

              <!-- Expression and Result Displays -->
              <div class="calc-expression-line" id="calc-expr-display" aria-label="Mathematical Expression"> </div>
              <div class="calc-result-line" id="calc-result-display" aria-label="Calculation Result">0</div>
            </div>

            <!-- SCIENTIFIC KEYPAD (6 columns) -->
            <div class="calc-keypad-scientific" id="calc-keypad-sci" style="display: ${calcState.mode === 'basic' ? 'none' : 'grid'};">
              <!-- Row 1: Trigonometric Functions -->
              <button class="calc-btn calc-btn-fn" data-calc-action="fn" data-calc-val="sin" title="Sine">sin</button>
              <button class="calc-btn calc-btn-fn" data-calc-action="fn" data-calc-val="cos" title="Cosine">cos</button>
              <button class="calc-btn calc-btn-fn" data-calc-action="fn" data-calc-val="tan" title="Tangent">tan</button>
              <button class="calc-btn calc-btn-fn" data-calc-action="fn" data-calc-val="cot" title="Cotangent">cot</button>
              <button class="calc-btn calc-btn-fn" data-calc-action="fn" data-calc-val="sec" title="Secant">sec</button>
              <button class="calc-btn calc-btn-fn" data-calc-action="fn" data-calc-val="csc" title="Cosecant">csc</button>

              <!-- Row 2: Inverse Trig, Logarithms, Abs -->
              <button class="calc-btn calc-btn-fn" data-calc-action="fn" data-calc-val="asin" title="Inverse Sine">sin⁻¹</button>
              <button class="calc-btn calc-btn-fn" data-calc-action="fn" data-calc-val="acos" title="Inverse Cosine">cos⁻¹</button>
              <button class="calc-btn calc-btn-fn" data-calc-action="fn" data-calc-val="atan" title="Inverse Tangent">tan⁻¹</button>
              <button class="calc-btn calc-btn-fn" data-calc-action="fn" data-calc-val="log" title="Base-10 Logarithm">log</button>
              <button class="calc-btn calc-btn-fn" data-calc-action="fn" data-calc-val="ln" title="Natural Logarithm">ln</button>
              <button class="calc-btn calc-btn-fn" data-calc-action="fn" data-calc-val="abs" title="Absolute Value">|x|</button>

              <!-- Row 3: Roots, Powers, Factorial -->
              <button class="calc-btn calc-btn-fn" data-calc-action="fn" data-calc-val="sqrt" title="Square Root">√</button>
              <button class="calc-btn calc-btn-fn" data-calc-action="fn" data-calc-val="cbrt" title="Cube Root">∛</button>
              <button class="calc-btn calc-btn-fn" data-calc-action="append" data-calc-val="^2" title="Square">x²</button>
              <button class="calc-btn calc-btn-fn" data-calc-action="append" data-calc-val="^3" title="Cube">x³</button>
              <button class="calc-btn calc-btn-fn" data-calc-action="append" data-calc-val="^" title="Power (xʸ)">xʸ</button>
              <button class="calc-btn calc-btn-fn" data-calc-action="append" data-calc-val="!" title="Factorial">n!</button>

              <!-- Row 4: Exp, 10^x, Parentheses, Clear, Backspace -->
              <button class="calc-btn calc-btn-fn" data-calc-action="fn" data-calc-val="exp" title="Exponential eˣ">eˣ</button>
              <button class="calc-btn calc-btn-fn" data-calc-action="fn" data-calc-val="tenpow" title="Power of 10">10ˣ</button>
              <button class="calc-btn calc-btn-fn" data-calc-action="append" data-calc-val="(">(</button>
              <button class="calc-btn calc-btn-fn" data-calc-action="append" data-calc-val=")">)</button>
              <button class="calc-btn calc-btn-danger" data-calc-action="clear" title="Clear All">AC</button>
              <button class="calc-btn calc-btn-fn" data-calc-action="backspace" title="Delete Last Character">DEL</button>

              <!-- Row 5: π, 7, 8, 9, ÷, % -->
              <button class="calc-btn calc-btn-fn" data-calc-action="append" data-calc-val="π">π</button>
              <button class="calc-btn calc-btn-num" data-calc-action="append" data-calc-val="7">7</button>
              <button class="calc-btn calc-btn-num" data-calc-action="append" data-calc-val="8">8</button>
              <button class="calc-btn calc-btn-num" data-calc-action="append" data-calc-val="9">9</button>
              <button class="calc-btn calc-btn-op" data-calc-action="append" data-calc-val="÷">÷</button>
              <button class="calc-btn calc-btn-fn" data-calc-action="append" data-calc-val="%">%</button>

              <!-- Row 6: e, 4, 5, 6, ×, ± -->
              <button class="calc-btn calc-btn-fn" data-calc-action="append" data-calc-val="e">e</button>
              <button class="calc-btn calc-btn-num" data-calc-action="append" data-calc-val="4">4</button>
              <button class="calc-btn calc-btn-num" data-calc-action="append" data-calc-val="5">5</button>
              <button class="calc-btn calc-btn-num" data-calc-action="append" data-calc-val="6">6</button>
              <button class="calc-btn calc-btn-op" data-calc-action="append" data-calc-val="×">×</button>
              <button class="calc-btn calc-btn-fn" data-calc-action="sign">±</button>

              <!-- Row 7: ., 1, 2, 3, −, + -->
              <button class="calc-btn calc-btn-fn" data-calc-action="append" data-calc-val=".">.</button>
              <button class="calc-btn calc-btn-num" data-calc-action="append" data-calc-val="1">1</button>
              <button class="calc-btn calc-btn-num" data-calc-action="append" data-calc-val="2">2</button>
              <button class="calc-btn calc-btn-num" data-calc-action="append" data-calc-val="3">3</button>
              <button class="calc-btn calc-btn-op" data-calc-action="append" data-calc-val="-">−</button>
              <button class="calc-btn calc-btn-op" data-calc-action="append" data-calc-val="+">+</button>

              <!-- Row 8: 0 (span 4), = (span 2) -->
              <button class="calc-btn calc-btn-num" style="grid-column: span 4;" data-calc-action="append" data-calc-val="0">0</button>
              <button class="calc-btn calc-btn-equals" style="grid-column: span 2;" data-calc-action="evaluate">=</button>
            </div>

            <!-- BASIC KEYPAD (4 columns) -->
            <div class="calc-keypad-basic" id="calc-keypad-basic" style="display: ${calcState.mode === 'basic' ? 'grid' : 'none'};">
              <button class="calc-btn calc-btn-danger" data-calc-action="clear">AC</button>
              <button class="calc-btn calc-btn-fn" data-calc-action="backspace">DEL</button>
              <button class="calc-btn calc-btn-fn" data-calc-action="append" data-calc-val="%">%</button>
              <button class="calc-btn calc-btn-op" data-calc-action="append" data-calc-val="÷">÷</button>

              <button class="calc-btn calc-btn-num" data-calc-action="append" data-calc-val="7">7</button>
              <button class="calc-btn calc-btn-num" data-calc-action="append" data-calc-val="8">8</button>
              <button class="calc-btn calc-btn-num" data-calc-action="append" data-calc-val="9">9</button>
              <button class="calc-btn calc-btn-op" data-calc-action="append" data-calc-val="×">×</button>

              <button class="calc-btn calc-btn-num" data-calc-action="append" data-calc-val="4">4</button>
              <button class="calc-btn calc-btn-num" data-calc-action="append" data-calc-val="5">5</button>
              <button class="calc-btn calc-btn-num" data-calc-action="append" data-calc-val="6">6</button>
              <button class="calc-btn calc-btn-op" data-calc-action="append" data-calc-val="-">−</button>

              <button class="calc-btn calc-btn-num" data-calc-action="append" data-calc-val="1">1</button>
              <button class="calc-btn calc-btn-num" data-calc-action="append" data-calc-val="2">2</button>
              <button class="calc-btn calc-btn-num" data-calc-action="append" data-calc-val="3">3</button>
              <button class="calc-btn calc-btn-op" data-calc-action="append" data-calc-val="+">+</button>

              <button class="calc-btn calc-btn-fn" data-calc-action="sign">±</button>
              <button class="calc-btn calc-btn-num" data-calc-action="append" data-calc-val="0">0</button>
              <button class="calc-btn calc-btn-fn" data-calc-action="append" data-calc-val=".">.</button>
              <button class="calc-btn calc-btn-equals" data-calc-action="evaluate">=</button>
            </div>

            <!-- Calculation History Drawer with Click-to-Replay -->
            <div class="calc-history-drawer">
              <div class="calc-history-drawer-header">
                <span style="font-size: 0.88rem; font-weight: 700; color: var(--text-white);">Session Calculations (Click to Replay)</span>
                <a href="#/history" style="font-size: 0.82rem; color: var(--accent-cyan); font-weight: 600;">View All</a>
              </div>
              <div class="calc-history-items-grid" id="calc-history-list"></div>
            </div>

            <!-- Keyboard Shortcuts Helper -->
            <div class="calc-keyboard-hint">
              <span>Keyboard:</span>
              <span class="kbd-badge">0-9</span>
              <span class="kbd-badge">+ - * / ^ ! %</span>
              <span class="kbd-badge">Enter / =</span>
              <span class="kbd-badge">Backspace</span>
              <span class="kbd-badge">Esc</span>
              <span class="kbd-badge">s, c, t, l, p, e</span>
            </div>
          </div>
        </div>
      </div>
    `;

    // Instantiate and initialize the dedicated Calculator Controller
    if (this.activeCalc) {
      this.activeCalc.destroy();
    }
    this.activeCalc = new CalculatorController('#full-calc-container');
    this.activeCalc.init();
    this.activeCalc.refreshHistoryDrawer();
  }

  // ------------------------------------------------------------------------
  // 3. ALL 24 MODULES EXPLORER VIEW
  // ------------------------------------------------------------------------
  renderModulesView() {
    document.title = 'OG • Mathematics Modules (24)';
    const filterState = store.getState().modulesFilter || 'all';

    const filterPillsHtml = MODULE_CATEGORIES.map(cat => `
      <button class="filter-pill ${filterState === cat.id ? 'active' : ''}" data-cat-filter="${cat.id}">
        ${cat.label}
      </button>
    `).join('');

    // Group modules by the 6 categories or show filtered
    let displayedCategories = MODULE_CATEGORIES.filter(c => c.id !== 'all');
    if (filterState !== 'all') {
      displayedCategories = displayedCategories.filter(c => c.id === filterState);
    }

    const categoryGroupsHtml = displayedCategories.map(cat => {
      const catModules = MATHEMATICS_MODULES.filter(m => m.category === cat.id);
      if (catModules.length === 0) return '';
      return `
        <div class="module-category-group" id="cat-group-${cat.id}">
          <div class="category-heading-wrap">
            <h3 class="category-heading-title">${cat.label.toUpperCase()}</h3>
            <span class="category-count-badge">${catModules.length} Modules</span>
          </div>
          <div class="modules-grid">
            ${catModules.map(renderModuleCard).join('')}
          </div>
        </div>
      `;
    }).join('');

    this.appContainer.innerHTML = `
      <div class="view-animate-in">
        <div class="modules-toolbar">
          <div>
            <h2>Mathematics Modules</h2>
            <p>24 core curriculum modules spanning foundational algebra to advanced vector calculus</p>
          </div>

          <div style="display: flex; gap: 16px; flex-wrap: wrap; align-items: center; justify-content: space-between;">
            <div class="modules-search-bar-wrap">
              <span class="modules-search-icon">${SVG_ICONS.search}</span>
              <input type="text" id="modules-search-input" class="glass-input modules-search-input" placeholder="Search modules, concepts, formulas...">
            </div>

            <div class="category-filter-pills" id="category-filter-bar">
              ${filterPillsHtml}
            </div>
          </div>
        </div>

        <div id="module-groups-container">
          ${categoryGroupsHtml}
        </div>
      </div>
    `;

    // Filter pill click listener
    const filterBar = document.getElementById('category-filter-bar');
    if (filterBar) {
      filterBar.addEventListener('click', (e) => {
        const btn = e.target.closest('button[data-cat-filter]');
        if (!btn) return;
        const catId = btn.dataset.catFilter;
        store.setModulesFilter(catId);
        this.renderModulesView();
      });
    }

    // Search input listener
    const searchInput = document.getElementById('modules-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        const cards = document.querySelectorAll('.module-card');
        cards.forEach(card => {
          const title = card.querySelector('.module-card-title').textContent.toLowerCase();
          const desc = card.querySelector('.module-card-description').textContent.toLowerCase();
          if (title.includes(query) || desc.includes(query)) {
            card.style.display = 'flex';
          } else {
            card.style.display = 'none';
          }
        });
      });
    }
  }

  // ------------------------------------------------------------------------
  // 4. MODULE 01: SETS (Full Liquid Glass Solver & Visualizer)
  // ------------------------------------------------------------------------
  renderSetsModuleView() {
    document.title = 'OG • Module #01: Sets & Set Theory';
    if (this.currentView && typeof this.currentView.destroy === 'function') {
      this.currentView.destroy();
    }
    this.currentView = new SetsView(this.appContainer);
    this.currentView.mount();
  }

  // ------------------------------------------------------------------------
  // MODULE 02: RELATIONS & FUNCTIONS
  // ------------------------------------------------------------------------
  renderRelationsModuleView() {
    document.title = 'OG • Module #02: Relations & Functions';
    if (this.currentView && typeof this.currentView.destroy === 'function') {
      this.currentView.destroy();
    }
    this.currentView = new RelationsView(this.appContainer);
    this.currentView.mount();
  }

  // ------------------------------------------------------------------------
  // MODULE 03: TRIGONOMETRIC FUNCTIONS (Full Liquid Glass Solver & 2D Graph)
  // ------------------------------------------------------------------------
  renderTrigModuleView() {
    document.title = 'OG • Module #03: Trigonometric Functions';
    if (this.currentView && typeof this.currentView.destroy === 'function') {
      this.currentView.destroy();
    }
    this.currentView = new TrigView(this.appContainer);
    this.currentView.mount();
  }

  // ------------------------------------------------------------------------
  // MODULE 06: PERMUTATIONS & COMBINATIONS
  // ------------------------------------------------------------------------
  renderCombinatoricsModuleView() {
    document.title = 'OG • Module #06: Permutations and Combinations';
    if (this.currentView && typeof this.currentView.destroy === 'function') {
      this.currentView.destroy();
    }
    this.currentView = new CombinatoricsView(this.appContainer);
    this.currentView.mount();
  }

  // ------------------------------------------------------------------------
  // MODULE 07: BINOMIAL THEOREM (Expansions & Animated Pascal Triangle)
  // ------------------------------------------------------------------------
  renderBinomialModuleView() {
    document.title = 'OG • Module #07: Binomial Theorem';
    if (this.currentView && typeof this.currentView.destroy === 'function') {
      this.currentView.destroy();
    }
    this.currentView = new BinomialView(this.appContainer);
    this.currentView.mount();
  }

  // ------------------------------------------------------------------------
  // MODULE 16: MATRICES (Interactive Matrix Calculator & Visualizer)
  // ------------------------------------------------------------------------
  renderMatricesModuleView() {
    document.title = 'OG • Module #16: Matrices';
    if (this.currentView && typeof this.currentView.destroy === 'function') {
      this.currentView.destroy();
    }
    this.currentView = new MatricesView(this.appContainer);
    this.currentView.mount();
  }

  // ------------------------------------------------------------------------
  // MODULE 17: DETERMINANTS (Expansion, Minors, Cofactors & Inverses)
  // ------------------------------------------------------------------------
  renderDeterminantsModuleView() {
    document.title = 'OG • Module #17: Determinants';
    if (this.currentView && typeof this.currentView.destroy === 'function') {
      this.currentView.destroy();
    }
    this.currentView = new DeterminantsView(this.appContainer);
    this.currentView.mount();
  }

  // ------------------------------------------------------------------------
  // MODULE 12: LIMITS AND DERIVATIVES
  // ------------------------------------------------------------------------
  renderLimitsModuleView() {
    document.title = 'OG • Module #12: Limits and Derivatives';
    if (this.currentView && typeof this.currentView.destroy === 'function') {
      this.currentView.destroy();
    }
    this.currentView = new LimitsView(this.appContainer);
    this.currentView.mount();
  }

  // ------------------------------------------------------------------------
  // MODULE 18: CONTINUITY AND DIFFERENTIABILITY
  // ------------------------------------------------------------------------
  renderContinuityModuleView() {
    document.title = 'OG • Module #18: Continuity and Differentiability';
    if (this.currentView && typeof this.currentView.destroy === 'function') {
      this.currentView.destroy();
    }
    this.currentView = new ContinuityView(this.appContainer);
    this.currentView.mount();
  }

  // ------------------------------------------------------------------------
  // MODULE 19: APPLICATIONS OF DERIVATIVES
  // ------------------------------------------------------------------------
  renderApplicationsDerivativesModuleView() {
    document.title = 'OG • Module #19: Applications of Derivatives';
    if (this.currentView && typeof this.currentView.destroy === 'function') {
      this.currentView.destroy();
    }
    this.currentView = new ApplicationsDerivativesView(this.appContainer);
    this.currentView.mount();
  }

  // ------------------------------------------------------------------------
  // MODULE 20: INTEGRALS
  // ------------------------------------------------------------------------
  renderIntegralsModuleView() {
    document.title = 'OG • Module #20: Integrals';
    if (this.currentView && typeof this.currentView.destroy === 'function') {
      this.currentView.destroy();
    }
    this.currentView = new IntegralsView(this.appContainer);
    this.currentView.mount();
  }

  // ------------------------------------------------------------------------
  // MODULE 21: APPLICATIONS OF INTEGRALS
  // ------------------------------------------------------------------------
  renderApplicationsIntegralsModuleView() {
    document.title = 'OG • Module #21: Applications of Integrals';
    if (this.currentView && typeof this.currentView.destroy === 'function') {
      this.currentView.destroy();
    }
    this.currentView = new ApplicationsIntegralsView(this.appContainer);
    this.currentView.mount();
  }

  // ------------------------------------------------------------------------
  // MODULE 22: DIFFERENTIAL EQUATIONS
  // ------------------------------------------------------------------------
  renderDifferentialEquationsModuleView() {
    document.title = 'OG • Module #22: Differential Equations';
    if (this.currentView && typeof this.currentView.destroy === 'function') {
      this.currentView.destroy();
    }
    this.currentView = new DifferentialEquationsView(this.appContainer);
    this.currentView.mount();
  }

  // ------------------------------------------------------------------------
  // DEDICATED GRAPH CALCULATOR (Multi-Function Liquid Glass Plotter)
  // ------------------------------------------------------------------------
  renderGraphCalculatorView() {
    document.title = 'OG • Graph Calculator';
    if (this.currentView && typeof this.currentView.destroy === 'function') {
      this.currentView.destroy();
    }
    this.currentView = new GraphCalculatorView(this.appContainer);
    this.currentView.mount();
  }

  // ------------------------------------------------------------------------
  // MODULE 09: STRAIGHT LINES
  // ------------------------------------------------------------------------
  renderStraightLinesModuleView() {
    document.title = 'OG • Module #09: Straight Lines';
    if (this.currentView && typeof this.currentView.destroy === 'function') {
      this.currentView.destroy();
    }
    this.currentView = new StraightLinesView(this.appContainer);
    this.currentView.mount();
  }

  // ------------------------------------------------------------------------
  // MODULE 10: CONIC SECTIONS
  // ------------------------------------------------------------------------
  renderConicSectionsModuleView() {
    document.title = 'OG • Module #10: Conic Sections';
    if (this.currentView && typeof this.currentView.destroy === 'function') {
      this.currentView.destroy();
    }
    this.currentView = new ConicSectionsView(this.appContainer);
    this.currentView.mount();
  }

  // ------------------------------------------------------------------------
  // MODULE 11: INTRODUCTION TO 3D GEOMETRY
  // ------------------------------------------------------------------------
  renderIntro3DModuleView() {
    document.title = 'OG • Module #11: 3D Coordinate Geometry';
    if (this.currentView && typeof this.currentView.destroy === 'function') {
      this.currentView.destroy();
    }
    this.currentView = new Intro3DView(this.appContainer);
    this.currentView.mount();
  }

  // ------------------------------------------------------------------------
  // STATISTICS WORKSPACE & TOOLS
  // ------------------------------------------------------------------------
  renderStatisticsWorkspaceView() {
    document.title = 'OG • Statistics Workspace';
    if (this.currentView && typeof this.currentView.destroy === 'function') {
      this.currentView.destroy();
    }
    this.currentView = new StatisticsView(this.appContainer);
    this.currentView.mount();
  }

  renderStatisticsToolsView(tool = 'data-input') {
    document.title = `OG • Statistics: ${tool}`;
    if (this.currentView && typeof this.currentView.destroy === 'function') {
      this.currentView.destroy();
    }
    this.currentView = new StatisticsToolsView(this.appContainer, tool);
    this.currentView.mount();
  }

  // MODULE 13: STATISTICS
  renderStatisticsModuleView() {
    this.renderStatisticsWorkspaceView();
  }

  // ------------------------------------------------------------------------
  // PROBABILITY WORKSPACE & TOOLS
  // ------------------------------------------------------------------------
  renderProbabilityWorkspaceView() {
    document.title = 'OG • Probability Workspace';
    if (this.currentView && typeof this.currentView.destroy === 'function') {
      this.currentView.destroy();
    }
    this.currentView = new ProbabilityView(this.appContainer);
    this.currentView.mount();
  }

  renderProbabilityToolsView(tool = 'calculator') {
    document.title = `OG • Probability: ${tool}`;
    if (this.currentView && typeof this.currentView.destroy === 'function') {
      this.currentView.destroy();
    }
    this.currentView = new ProbabilityToolsView(this.appContainer, tool);
    this.currentView.mount();
  }

  // MODULE 14: PROBABILITY
  renderProbabilityModuleView() {
    this.renderProbabilityWorkspaceView();
  }

  // ------------------------------------------------------------------------
  // MODULE 15: INVERSE TRIGONOMETRIC FUNCTIONS
  // ------------------------------------------------------------------------
  renderInverseTrigModuleView() {
    document.title = 'OG • Module #15: Inverse Trigonometric Functions';
    if (this.currentView && typeof this.currentView.destroy === 'function') {
      this.currentView.destroy();
    }
    this.currentView = new InverseTrigView(this.appContainer);
    this.currentView.mount();
  }

  // ------------------------------------------------------------------------
  // MODULE 23: VECTORS & 3D GEOMETRY
  // ------------------------------------------------------------------------
  renderVectorsModuleView() {
    document.title = 'OG • Module #23: Vectors & 3D Geometry';
    if (this.currentView && typeof this.currentView.destroy === 'function') {
      this.currentView.destroy();
    }
    this.currentView = new VectorsView(this.appContainer);
    this.currentView.mount();
  }

  // ------------------------------------------------------------------------
  // MODULE 24: LINEAR PROGRAMMING
  // ------------------------------------------------------------------------
  renderLinearProgrammingModuleView() {
    document.title = 'OG • Module #24: Linear Programming';
    if (this.currentView && typeof this.currentView.destroy === 'function') {
      this.currentView.destroy();
    }
    this.currentView = new LinearProgrammingView(this.appContainer);
    this.currentView.mount();
  }

  // ------------------------------------------------------------------------
  // MODULE 04: COMPLEX NUMBERS & QUADRATIC EQUATIONS
  // ------------------------------------------------------------------------
  renderComplexNumbersModuleView() {
    document.title = 'OG • Module #04: Complex Numbers & Quadratic Equations';
    if (this.currentView && typeof this.currentView.destroy === 'function') {
      this.currentView.destroy();
    }
    this.currentView = new ComplexNumbersView(this.appContainer);
    this.currentView.mount();
  }

  // ------------------------------------------------------------------------
  // MODULE 05: LINEAR INEQUALITIES
  // ------------------------------------------------------------------------
  renderLinearInequalitiesModuleView() {
    document.title = 'OG • Module #05: Linear Inequalities';
    if (this.currentView && typeof this.currentView.destroy === 'function') {
      this.currentView.destroy();
    }
    this.currentView = new LinearInequalitiesView(this.appContainer);
    this.currentView.mount();
  }

  // ------------------------------------------------------------------------
  // MODULE 08: SEQUENCE AND SERIES
  // ------------------------------------------------------------------------
  renderSequenceSeriesModuleView() {
    document.title = 'OG • Module #08: Sequence and Series';
    if (this.currentView && typeof this.currentView.destroy === 'function') {
      this.currentView.destroy();
    }
    this.currentView = new SequenceSeriesView(this.appContainer);
    this.currentView.mount();
  }

  // ------------------------------------------------------------------------
  // ALGEBRA WORKSPACE (Unified Interactive Workspace)
  // ------------------------------------------------------------------------
  renderAlgebraWorkspaceView() {
    document.title = 'OG • Algebra Workspace';
    if (this.currentView && typeof this.currentView.destroy === 'function') {
      this.currentView.destroy();
    }
    this.currentView = new AlgebraView(this.appContainer);
    this.currentView.mount();
  }

  // ------------------------------------------------------------------------
  // ALGEBRA TOOLS WORKSPACE (Dedicated Tool Views)
  // ------------------------------------------------------------------------
  renderAlgebraToolsView(tool = 'equation-solver') {
    const formattedTitle = tool.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    document.title = `OG • Algebra Tool: ${formattedTitle}`;
    if (this.currentView && typeof this.currentView.destroy === 'function') {
      this.currentView.destroy();
    }
    this.currentView = new AlgebraToolsView(this.appContainer, tool);
    this.currentView.mount();
  }

  // ------------------------------------------------------------------------
  // LINEAR ALGEBRA LAB WORKSPACES
  // ------------------------------------------------------------------------
  renderLinearAlgebraWorkspaceView() {
    document.title = 'OG • Linear Algebra Lab';
    if (this.currentView && typeof this.currentView.destroy === 'function') {
      this.currentView.destroy();
    }
    this.currentView = new LinearAlgebraView(this.appContainer);
    this.currentView.mount();
  }

  renderMatrixLabView() {
    document.title = 'OG • Matrix Laboratory';
    if (this.currentView && typeof this.currentView.destroy === 'function') {
      this.currentView.destroy();
    }
    this.currentView = new MatrixLabView(this.appContainer);
    this.currentView.mount();
  }

  // ------------------------------------------------------------------------
  // VECTORS & OPTIMIZATION LAB WORKSPACES
  // ------------------------------------------------------------------------
  renderVectorsOptimizationDashboardView() {
    document.title = 'OG • Vectors & Optimization Lab';
    if (this.currentView && typeof this.currentView.destroy === 'function') {
      this.currentView.destroy();
    }
    this.currentView = new VectorsOptimizationDashboardView(this.appContainer);
    this.currentView.mount();
  }

  renderVectorLabView() {
    document.title = 'OG • Vector Laboratory';
    if (this.currentView && typeof this.currentView.destroy === 'function') {
      this.currentView.destroy();
    }
    this.currentView = new VectorLabView(this.appContainer);
    this.currentView.mount();
  }

  // ------------------------------------------------------------------------
  // COORDINATE GEOMETRY WORKSPACE (Unified Interactive Workspace)
  // ------------------------------------------------------------------------
  renderCoordinateGeometryWorkspaceView() {
    document.title = 'OG • Coordinate Geometry Workspace';
    if (this.currentView && typeof this.currentView.destroy === 'function') {
      this.currentView.destroy();
    }
    this.currentView = new CoordinateGeometryView(this.appContainer);
    this.currentView.mount();
  }

  // ------------------------------------------------------------------------
  // COORDINATE GEOMETRY TOOLS WORKSPACE (Dedicated Tool Views)
  // ------------------------------------------------------------------------
  renderCoordinateGeometryToolsView(tool = 'point-calculator') {
    const formattedTitle = tool.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    document.title = `OG • Geometry Tool: ${formattedTitle}`;
    if (this.currentView && typeof this.currentView.destroy === 'function') {
      this.currentView.destroy();
    }
    this.currentView = new CoordinateGeometryToolsView(this.appContainer, tool);
    this.currentView.mount();
  }

  // ------------------------------------------------------------------------
  // CALCULUS WORKSPACE (Unified Interactive Workspace)
  // ------------------------------------------------------------------------
  renderCalculusWorkspaceView() {
    document.title = 'OG • Calculus Workspace';
    if (this.currentView && typeof this.currentView.destroy === 'function') {
      this.currentView.destroy();
    }
    this.currentView = new CalculusView(this.appContainer);
    this.currentView.mount();
  }

  // ------------------------------------------------------------------------
  // CALCULUS TOOLS WORKSPACE (Dedicated Tool Views)
  // ------------------------------------------------------------------------
  renderCalculusToolsView(tool = 'limits') {
    const formattedTitle = tool.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    document.title = `OG • Calculus Tool: ${formattedTitle}`;
    if (this.currentView && typeof this.currentView.destroy === 'function') {
      this.currentView.destroy();
    }
    this.currentView = new CalculusToolsView(this.appContainer, tool);
    this.currentView.mount();
  }

  // ------------------------------------------------------------------------
  // 5. MODULE DETAIL VIEW (Reusable Template for remaining modules)
  // ------------------------------------------------------------------------
  renderModuleDetailView(moduleId) {
    if (moduleId === 'sets' || moduleId === '1') {
      this.renderSetsModuleView();
      return;
    }
    if (moduleId === 'relations-functions' || moduleId === '2' || moduleId === 'relations') {
      this.renderRelationsModuleView();
      return;
    }
    if (moduleId === 'trigonometric-functions' || moduleId === '3' || moduleId === 'trig') {
      this.renderTrigModuleView();
      return;
    }
    if (moduleId === 'complex-numbers' || moduleId === '4' || moduleId === 'complex') {
      this.renderComplexNumbersModuleView();
      return;
    }
    if (moduleId === 'linear-inequalities' || moduleId === '5' || moduleId === 'inequalities') {
      this.renderLinearInequalitiesModuleView();
      return;
    }
    if (moduleId === 'permutations-combinations' || moduleId === '6' || moduleId === 'permutations') {
      this.renderCombinatoricsModuleView();
      return;
    }
    if (moduleId === 'binomial-theorem' || moduleId === '7' || moduleId === 'binomial') {
      this.renderBinomialModuleView();
      return;
    }
    if (moduleId === 'sequence-series' || moduleId === '8' || moduleId === 'sequences') {
      this.renderSequenceSeriesModuleView();
      return;
    }
    if (moduleId === 'straight-lines' || moduleId === '9' || moduleId === 'lines') {
      this.renderStraightLinesModuleView();
      return;
    }
    if (moduleId === 'conic-sections' || moduleId === '10' || moduleId === 'conics') {
      this.renderConicSectionsModuleView();
      return;
    }
    if (moduleId === 'matrices' || moduleId === '16' || moduleId === 'matrix') {
      this.renderMatricesModuleView();
      return;
    }
    if (moduleId === 'determinants' || moduleId === '17' || moduleId === 'determinant') {
      this.renderDeterminantsModuleView();
      return;
    }
    if (moduleId === 'limits-derivatives' || moduleId === '12' || moduleId === 'limits') {
      this.renderLimitsModuleView();
      return;
    }
    if (moduleId === 'continuity-differentiability' || moduleId === '18' || moduleId === 'continuity') {
      this.renderContinuityModuleView();
      return;
    }
    if (moduleId === 'applications-of-derivatives' || moduleId === '19' || moduleId === 'applications-derivatives') {
      this.renderApplicationsDerivativesModuleView();
      return;
    }
    if (moduleId === 'integrals' || moduleId === '20' || moduleId === 'integral') {
      this.renderIntegralsModuleView();
      return;
    }
    if (moduleId === 'applications-of-integrals' || moduleId === '21' || moduleId === 'applications-integrals') {
      this.renderApplicationsIntegralsModuleView();
      return;
    }
    if (moduleId === 'differential-equations' || moduleId === '22' || moduleId === 'differential') {
      this.renderDifferentialEquationsModuleView();
      return;
    }
    if (moduleId === 'intro-3d-geometry' || moduleId === '11' || moduleId === '3d-geometry') {
      this.renderIntro3DModuleView();
      return;
    }
    if (moduleId === 'statistics' || moduleId === '13' || moduleId === 'stats') {
      this.renderStatisticsModuleView();
      return;
    }
    if (moduleId === 'probability' || moduleId === '14' || moduleId === 'prob') {
      this.renderProbabilityModuleView();
      return;
    }
    if (moduleId === 'inverse-trigonometric-functions' || moduleId === '15' || moduleId === 'inverse-trig') {
      this.renderInverseTrigModuleView();
      return;
    }
    if (moduleId === 'vectors-3d-geometry' || moduleId === '23' || moduleId === 'vectors') {
      this.renderVectorsModuleView();
      return;
    }
    if (moduleId === 'linear-programming' || moduleId === '24' || moduleId === 'lpp') {
      this.renderLinearProgrammingModuleView();
      return;
    }
    const mod = MATHEMATICS_MODULES.find(m => m.id === moduleId) || MATHEMATICS_MODULES[0];
    document.title = `OG • Module #${mod.num}: ${mod.name}`;

    const formattedNum = String(mod.num).padStart(2, '0');
    const topicsHtml = mod.topics.map(t => `
      <div class="concept-item">
        <div class="concept-bullet"></div>
        <div style="font-size: 0.95rem; color: var(--text-white); font-weight: 500;">${t}</div>
      </div>
    `).join('');

    const formulasHtml = mod.keyFormulas.map(f => `
      <div class="formula-shortcut-card" style="margin-bottom: 12px; display: flex; align-items: center; justify-content: space-between;">
        <div>
          <div class="formula-shortcut-title">${f.name}</div>
          <div class="formula-shortcut-latex">${f.formula}</div>
        </div>
        <button class="glass-btn glass-btn-icon" data-copy-text="${f.formula}" title="Copy formula" aria-label="Copy formula">
          ${SVG_ICONS.copy}
        </button>
      </div>
    `).join('');

    this.appContainer.innerHTML = `
      <div class="view-animate-in module-detail-container">
        <!-- Breadcrumbs -->
        <nav class="module-breadcrumb" aria-label="Breadcrumb">
          <a href="#/">Home</a>
          <span>/</span>
          <a href="#/modules">Modules</a>
          <span>/</span>
          <span style="color: var(--text-white); font-weight: 600;">Module #${formattedNum}</span>
        </nav>

        <!-- Module Header Hero -->
        <div class="glass-surface module-detail-hero">
          <div class="badge-row">
            <span class="module-number-pill">Module #${formattedNum}</span>
            <span class="badge ${mod.badgeClass}">${mod.categoryLabel}</span>
          </div>

          <div style="display: flex; align-items: flex-start; justify-content: space-between; flex-wrap: wrap; gap: 20px;">
            <div style="max-width: 780px;">
              <h1 style="font-size: clamp(2rem, 4vw, 3rem); margin-bottom: 12px;">${mod.name}</h1>
              <p style="font-size: 1.15rem; color: var(--text-secondary); line-height: 1.6;">${mod.description}</p>
            </div>
            <div class="module-icon-badge" style="width: 72px; height: 72px; font-size: 2rem;">
              ${mod.icon}
            </div>
          </div>
        </div>

        <!-- Detail Grid: Concepts, Formulas & Solver Foundation -->
        <div class="module-detail-grid">
          <div>
            <!-- Core Topics -->
            <div class="glass-surface module-concept-card">
              <h3 style="font-size: 1.25rem; margin-bottom: 16px;">Core Conceptual Curriculum</h3>
              <div>${topicsHtml}</div>
            </div>

            <!-- Interactive Module Toolkit -->
            <div class="glass-surface module-concept-card">
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
                <h3 style="font-size: 1.25rem;">Interactive Toolkit & Practice</h3>
                <span class="badge ${mod.badgeClass}">Active</span>
              </div>
              <div class="glass-card" style="padding: 28px; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 14px;">
                <div style="font-size: 2.5rem; color: var(--cyan-primary);">${mod.icon}</div>
                <h4 style="font-size: 1.15rem; color: var(--text-white);">${mod.name} Workspace</h4>
                <p style="max-width: 480px; font-size: 0.95rem; color: var(--text-secondary); line-height: 1.6;">
                  Explore step-by-step solutions, verify formulas, practice curated problems, and execute calculations for ${mod.name}.
                </p>
                <div style="display: flex; gap: 12px; margin-top: 8px; flex-wrap: wrap; justify-content: center;">
                  <a href="#/calculator" class="glass-btn glass-btn-primary">
                    <span>Scientific Calculator</span>
                    ${SVG_ICONS.arrowRight}
                  </a>
                  <a href="#/formulas" class="glass-btn glass-btn-secondary">
                    <span>Formula Library</span>
                    ${SVG_ICONS.formula}
                  </a>
                  <a href="#/practice" class="glass-btn glass-btn-outline">
                    <span>Practice Questions</span>
                    ${SVG_ICONS.practice}
                  </a>
                </div>
              </div>
            </div>
          </div>

          <!-- Sidebar: Key Formulas & Quick Stats -->
          <div>
            <div class="glass-surface module-formula-card">
              <h3 style="font-size: 1.15rem; margin-bottom: 16px;">Essential Formulas</h3>
              <div>${formulasHtml}</div>
            </div>

            <div class="glass-surface module-formula-card">
              <h3 style="font-size: 1.15rem; margin-bottom: 14px;">Module Info</h3>
              <div style="display: flex; flex-direction: column; gap: 10px; font-size: 0.9rem;">
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: var(--text-tertiary);">Discipline:</span>
                  <strong style="color: var(--text-white);">${mod.categoryLabel}</strong>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: var(--text-tertiary);">Concepts:</span>
                  <strong style="color: var(--text-white);">${mod.topics.length} Units</strong>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: var(--text-tertiary);">Status:</span>
                  <strong style="color: var(--emerald-secondary);">UI Foundation Ready</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Formula copy listener
    document.querySelectorAll('[data-copy-text]').forEach(btn => {
      btn.addEventListener('click', () => {
        const text = btn.getAttribute('data-copy-text');
        copyToClipboard(text, 'Formula copied');
      });
    });
  }

  // ------------------------------------------------------------------------
  // 5. FORMULAS LIBRARY VIEW
  // ------------------------------------------------------------------------
  renderFormulasView() {
    document.title = 'OG • Formula & Theorem Library';
    if (this.currentView && typeof this.currentView.destroy === 'function') {
      this.currentView.destroy();
    }
    this.currentView = new FormulaLibraryView(this.appContainer);
    this.currentView.mount();
  }

  // ------------------------------------------------------------------------
  // 6. PRACTICE ARENA VIEW
  // ------------------------------------------------------------------------
  renderPracticeView() {
    document.title = 'OG • Practice System';
    if (this.currentView && typeof this.currentView.destroy === 'function') {
      this.currentView.destroy();
    }
    this.currentView = new PracticeView(this.appContainer);
    this.currentView.mount();
  }

  // ------------------------------------------------------------------------
  // 7. CALCULATION HISTORY VIEW
  // ------------------------------------------------------------------------
  renderHistoryScreen() {
    document.title = 'OG • Calculation History';
    if (this.currentView && typeof this.currentView.destroy === 'function') {
      this.currentView.destroy();
    }
    this.currentView = new HistoryView(this.appContainer);
    this.currentView.mount();
  }

  // ------------------------------------------------------------------------
  // 8. SETTINGS VIEW
  // ------------------------------------------------------------------------
  renderSettingsView() {
    document.title = 'OG • Settings & Preferences';
    const prefs = store.getState().userPreferences;

    this.appContainer.innerHTML = `
      <div class="view-animate-in" style="max-width: 720px; margin: 0 auto;">
        <div style="margin-bottom: 32px;">
          <h2>Application Settings</h2>
          <p>Customize precision parameters, angle conventions, and liquid glass visuals</p>
        </div>

        <div class="glass-panel" style="padding: 28px; border-radius: var(--radius-xl); display: flex; flex-direction: column; gap: 24px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div style="font-weight: 700; color: var(--text-white); margin-bottom: 4px;">Angle Measurement Mode</div>
              <div style="font-size: 0.88rem; color: var(--text-secondary);">Default trigonometric evaluation basis</div>
            </div>
            <div class="calc-mode-badges">
              <button class="calc-badge ${prefs.angleMode === 'DEG' ? 'active' : ''}" id="pref-deg">DEG</button>
              <button class="calc-badge ${prefs.angleMode === 'RAD' ? 'active' : ''}" id="pref-rad">RAD</button>
            </div>
          </div>

          <div style="border-top: 1px solid rgba(255,255,255,0.06); padding-top: 20px; display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div style="font-weight: 700; color: var(--text-white); margin-bottom: 4px;">Calculation Precision</div>
              <div style="font-size: 0.88rem; color: var(--text-secondary);">Number of decimal places preserved</div>
            </div>
            <span style="font-family: var(--font-math); font-size: 1rem; color: var(--cyan-primary); font-weight: 700;">6 Decimals</span>
          </div>

          <div style="border-top: 1px solid rgba(255,255,255,0.06); padding-top: 20px; display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div style="font-weight: 700; color: var(--text-white); margin-bottom: 4px;">Visual Theme</div>
              <div style="font-size: 0.88rem; color: var(--text-secondary);">Futuristic Liquid Glass Dark UI</div>
            </div>
            <span class="badge badge-algebra">Active (Liquid Dark)</span>
          </div>
        </div>
      </div>
    `;

    const btnDeg = document.getElementById('pref-deg');
    const btnRad = document.getElementById('pref-rad');
    if (btnDeg && btnRad) {
      btnDeg.addEventListener('click', () => {
        store.setAngleMode('DEG');
        btnDeg.classList.add('active');
        btnRad.classList.remove('active');
        showToast('Angle mode set to Degrees');
      });
      btnRad.addEventListener('click', () => {
        store.setAngleMode('RAD');
        btnRad.classList.add('active');
        btnDeg.classList.remove('active');
        showToast('Angle mode set to Radians');
      });
    }
  }

  // ------------------------------------------------------------------------
  // 404 NOT FOUND VIEW
  // ------------------------------------------------------------------------
  render404View() {
    this.appContainer.innerHTML = `
      <div class="view-animate-in" style="text-align: center; padding: 80px 24px;">
        <h1 style="font-size: 5rem; font-family: var(--font-math); color: var(--cyan-primary);">404</h1>
        <h2 style="margin-bottom: 12px;">Route Not Defined</h2>
        <p style="margin-bottom: 24px;">The mathematical coordinate you navigated to does not exist in this dimension.</p>
        <a href="#/" class="glass-btn glass-btn-primary">Return to Dashboard</a>
      </div>
    `;
  }
}
