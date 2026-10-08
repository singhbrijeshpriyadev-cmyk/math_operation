/**
 * OG - Central State Management
 * ES6 Module
 */

class StateStore {
  constructor() {
    this.listeners = new Set();

    // Default application state
    this.state = {
      userPreferences: {
        angleMode: 'DEG', // 'DEG' | 'RAD'
        precision: 6,
        theme: 'liquid-dark',
        hapticFeedback: true
      },
      calculator: {
        mode: 'scientific', // 'scientific' | 'basic'
        expression: '',
        result: '0',
        memory: 0,
        isSecondFunction: false
      },
      history: this.loadHistory(),
      practiceProgress: this.loadPracticeProgress(),
      modulesFilter: 'all',
      modulesSearch: ''
    };
  }

  loadHistory() {
    try {
      if (typeof localStorage !== 'undefined') {
        const saved = localStorage.getItem('og_calc_history');
        if (saved) {
          const list = JSON.parse(saved);
          if (Array.isArray(list)) {
            return list.map((item, idx) => ({
              id: item.id || `calc_migrated_${idx}_${Date.now()}`,
              module: item.module || 'Scientific Calculator',
              moduleId: item.moduleId || this.resolveModuleSlug(item.module || 'Scientific Calculator'),
              expression: item.expression || '',
              result: item.result || '',
              timestamp: item.timestamp || 'Recent',
              createdAt: item.createdAt || (Date.now() - idx * 1000)
            }));
          }
        }
      }
    } catch (e) {
      console.warn('Failed to load history from storage:', e);
    }
    return [];
  }

  saveHistory() {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('og_calc_history', JSON.stringify(this.state.history));
      }
    } catch (e) {
      console.warn('Failed to save history to storage:', e);
    }
  }

  loadPracticeProgress() {
    try {
      if (typeof localStorage !== 'undefined') {
        const saved = localStorage.getItem('og_practice_progress');
        if (saved) return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to load practice progress:', e);
    }
    return {
      solvedCount: 0,
      streakDays: 0,
      completedModules: []
    };
  }

  savePracticeProgress() {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('og_practice_progress', JSON.stringify(this.state.practiceProgress));
      }
    } catch (e) {
      console.warn('Failed to save practice progress:', e);
    }
  }

  getState() {
    return this.state;
  }

  setState(partialState) {
    this.state = { ...this.state, ...partialState };
    this.notify();
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    this.listeners.forEach((listener) => {
      try {
        listener(this.state);
      } catch (err) {
        console.error('State subscriber error:', err);
      }
    });
  }

  // Calculator State Actions
  setCalculatorMode(mode) {
    this.state.calculator.mode = mode === 'basic' ? 'basic' : 'scientific';
    this.notify();
  }

  setAngleMode(mode) {
    this.state.userPreferences.angleMode = mode === 'RAD' ? 'RAD' : 'DEG';
    this.notify();
  }

  setPrecision(precision) {
    this.state.userPreferences.precision = Number(precision);
    this.notify();
  }

  setExpression(expr) {
    this.state.calculator.expression = expr;
    this.notify();
  }

  setResult(result) {
    this.state.calculator.result = result;
    this.notify();
  }

  // Helper actions
  addHistoryItem(expression, result, moduleName = 'Scientific Calculator', moduleId = null) {
    if (!expression || expression === '0' || result === undefined || result === null) return null;

    const exprStr = String(expression).trim();
    const resultStr = String(result).trim();
    if (!exprStr || !resultStr) return null;

    // Prevent duplicate consecutive entries with identical expression and result in same module
    if (this.state.history.length > 0) {
      const top = this.state.history[0];
      if (top.expression === exprStr && top.result === resultStr && top.module === moduleName) {
        return top;
      }
    }

    const now = new Date();
    const formattedTimestamp = now.toLocaleDateString([], {
      month: 'short',
      day: 'numeric'
    }) + ', ' + now.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });

    const resolvedModuleId = moduleId || this.resolveModuleSlug(moduleName);

    const item = {
      id: 'calc_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      module: moduleName,
      moduleId: resolvedModuleId,
      expression: exprStr,
      result: resultStr,
      timestamp: formattedTimestamp,
      createdAt: Date.now()
    };

    this.state.history.unshift(item);
    if (this.state.history.length > 100) {
      this.state.history.pop();
    }
    this.saveHistory();
    this.notify();
    return item;
  }

  deleteHistoryItem(id) {
    if (!id) return false;
    const initialLength = this.state.history.length;
    this.state.history = this.state.history.filter(item => String(item.id) !== String(id));
    if (this.state.history.length !== initialLength) {
      this.saveHistory();
      this.notify();
      return true;
    }
    return false;
  }

  clearHistory() {
    this.state.history = [];
    this.saveHistory();
    this.notify();
  }

  resolveModuleSlug(moduleName) {
    if (!moduleName) return 'calculator';
    const norm = String(moduleName).toLowerCase().trim();
    if (norm.includes('scientific') || norm.includes('calculator') || norm === 'calc') return 'calculator';
    if (norm.includes('set')) return 'sets';
    if (norm.includes('relation')) return 'relations-functions';
    if (norm.includes('inverse trig') || norm.includes('inverse-trig')) return 'inverse-trigonometric-functions';
    if (norm.includes('trig')) return 'trigonometric-functions';
    if (norm.includes('permutation') || norm.includes('combinator')) return 'permutations-combinations';
    if (norm.includes('binomial')) return 'binomial-theorem';
    if (norm.includes('straight') || norm.includes('line')) return 'straight-lines';
    if (norm.includes('conic')) return 'conic-sections';
    if (norm.includes('3d') || norm.includes('three dim')) return 'intro-3d-geometry';
    if (norm.includes('limit')) return 'limits-derivatives';
    if (norm.includes('continuity') || norm.includes('differentiab')) return 'continuity-differentiability';
    if (norm.includes('application') && norm.includes('derivative')) return 'applications-of-derivatives';
    if (norm.includes('application') && norm.includes('integral')) return 'applications-of-integrals';
    if (norm.includes('integral')) return 'integrals';
    if (norm.includes('differential')) return 'differential-equations';
    if (norm.includes('matrix') || norm.includes('matrices')) return 'matrices';
    if (norm.includes('determinant')) return 'determinants';
    if (norm.includes('vector')) return 'vectors-3d-geometry';
    if (norm.includes('linear program') || norm.includes('lpp')) return 'linear-programming';
    if (norm.includes('stat')) return 'statistics';
    if (norm.includes('prob')) return 'probability';
    if (norm.includes('graph')) return 'graph';
    return 'calculator';
  }

  recordPracticeSolve(moduleId) {
    this.state.practiceProgress.solvedCount += 1;
    if (moduleId && !this.state.practiceProgress.completedModules.includes(moduleId)) {
      this.state.practiceProgress.completedModules.push(moduleId);
    }
    this.savePracticeProgress();
    this.notify();
  }

  setModulesFilter(filter) {
    this.state.modulesFilter = filter;
    this.notify();
  }

  setModulesSearch(query) {
    this.state.modulesSearch = query;
    this.notify();
  }
}

export const store = new StateStore();
