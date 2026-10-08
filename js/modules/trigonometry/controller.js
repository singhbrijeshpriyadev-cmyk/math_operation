/**
 * OG - Trigonometric Functions Module Controller
 * Coordinates pipeline: UI -> TrigController -> TrigonometryMathEngine -> ResultFormatter -> UI
 * ES6 Module
 */

import { BaseModuleController } from '../../math/controller.js';
import { TrigonometryMathEngine } from '../../math/trigonometry.js';
import { store } from '../../state.js';

export const TRIG_PRESETS = {
  sin30: {
    name: 'sin(30°) = 1/2',
    desc: 'Fundamental 30-60-90 right triangle ratio',
    type: 'basic',
    func: 'sin',
    input: '30',
    mode: 'DEG'
  },
  cosPi3: {
    name: 'cos(π/3) = 1/2',
    desc: 'Exact cosine in standard radians',
    type: 'basic',
    func: 'cos',
    input: 'pi/3',
    mode: 'RAD'
  },
  tan45: {
    name: 'tan(45°) = 1',
    desc: 'Isosceles right triangle unit slope',
    type: 'basic',
    func: 'tan',
    input: '45',
    mode: 'DEG'
  },
  sin90: {
    name: 'sin(90°) = 1',
    desc: 'Top vertex of unit circle (0, 1)',
    type: 'basic',
    func: 'sin',
    input: '90',
    mode: 'DEG'
  },
  invSinHalf: {
    name: 'sin⁻¹(0.5) = 30°',
    desc: 'Inverse sine principal branch angle',
    type: 'inverse',
    func: 'sin⁻¹',
    input: '0.5',
    mode: 'DEG'
  },
  eqSinHalf: {
    name: 'Solve sin(x) = 0.5',
    desc: 'General & principal solution set',
    type: 'equation',
    func: 'sin',
    input: '0.5',
    mode: 'DEG'
  }
};

export class TrigController extends BaseModuleController {
  constructor() {
    super('trigonometric-functions');

    this.moduleState = {
      angleMode: 'DEG', // 'DEG' | 'RAD'
      activeToolTab: 'evaluator', // 'evaluator' | 'table' | 'equations' | 'identities' | 'conversion'
      activeFunction: 'sin', // 'sin' | 'cos' | 'tan' | 'cot' | 'sec' | 'csc'
      inputAngle: '30',
      activeInverseFunc: 'sin⁻¹',
      inputInverseVal: '0.5',
      // Graph state
      graphFunc: 'sin',
      graphAmplitude: 1,
      graphFrequency: 1,
      // Equation solver
      equationFunc: 'sin',
      equationK: '0.5',
      equationResult: null,
      // Conversion tool
      convertInput: '45',
      convertFromMode: 'DEG',
      convertToMode: 'RAD',
      convertResult: null,
      // Evaluation result
      latestResult: null,
      lastError: null
    };

    // Auto-evaluate initial state
    this.evaluateCurrent();
  }

  getModuleState() {
    return { ...this.moduleState };
  }

  setAngleMode(mode) {
    this.moduleState.angleMode = mode === 'RAD' ? 'RAD' : 'DEG';
    this.evaluateCurrent();
  }

  setActiveToolTab(tab) {
    this.moduleState.activeToolTab = tab;
    this.notify(this.getModuleState());
  }

  setActiveFunction(funcName) {
    this.moduleState.activeFunction = funcName;
    // Sync graph function if one of the primary 3
    if (['sin', 'cos', 'tan'].includes(funcName)) {
      this.moduleState.graphFunc = funcName;
    }
    this.evaluateCurrent();
  }

  setInputAngle(angleStr) {
    this.moduleState.inputAngle = angleStr;
  }

  setGraphFunction(funcName) {
    this.moduleState.graphFunc = funcName;
    this.notify(this.getModuleState());
  }

  setGraphParameters(amp, freq) {
    if (amp !== undefined) this.moduleState.graphAmplitude = amp;
    if (freq !== undefined) this.moduleState.graphFrequency = freq;
    this.notify(this.getModuleState());
  }

  evaluateCurrent() {
    try {
      this.moduleState.lastError = null;
      const res = TrigonometryMathEngine.evaluateTrig(
        this.moduleState.activeFunction,
        this.moduleState.inputAngle,
        this.moduleState.angleMode
      );

      if (!res.success) {
        this.moduleState.lastError = res.error;
        this.notify(this.getModuleState());
        return res;
      }

      this.moduleState.latestResult = res;

      // Add to platform calculation history
      store.addHistoryItem(
        `${this.moduleState.activeFunction}(${this.moduleState.inputAngle}${this.moduleState.angleMode === 'DEG' ? '°' : ' rad'})`,
        res.result.formatted,
        'Trigonometric Functions'
      );

      this.notify(this.getModuleState());
      return res;
    } catch (err) {
      console.error('TrigController evaluate error:', err);
      this.moduleState.lastError = err.message || 'Evaluation error';
      this.notify(this.getModuleState());
      return { success: false, error: this.moduleState.lastError };
    }
  }

  evaluateInverse(funcName, valInput) {
    if (funcName) this.moduleState.activeInverseFunc = funcName;
    if (valInput !== undefined) this.moduleState.inputInverseVal = valInput;

    const res = TrigonometryMathEngine.evaluateInverseTrig(
      this.moduleState.activeInverseFunc,
      this.moduleState.inputInverseVal,
      this.moduleState.angleMode
    );

    if (res.success) {
      this.moduleState.latestResult = res;
      store.addHistoryItem(
        `${this.moduleState.activeInverseFunc}(${this.moduleState.inputInverseVal})`,
        res.result.formatted,
        'Trigonometric Functions'
      );
    } else {
      this.moduleState.lastError = res.error;
    }

    this.notify(this.getModuleState());
    return res;
  }

  solveEquation(funcName, constantK) {
    if (funcName) this.moduleState.equationFunc = funcName;
    if (constantK !== undefined) this.moduleState.equationK = constantK;

    const res = TrigonometryMathEngine.solveEquation(
      this.moduleState.equationFunc,
      this.moduleState.equationK,
      this.moduleState.angleMode
    );

    if (res.success) {
      this.moduleState.equationResult = res;
      store.addHistoryItem(
        `Solve ${res.result.equation}`,
        res.result.principalSolutions.join(', '),
        'Trigonometric Functions'
      );
    } else {
      this.moduleState.lastError = res.error;
    }

    this.notify(this.getModuleState());
    return res;
  }

  convertAngle(inputVal, fromMode, toMode) {
    if (inputVal !== undefined) this.moduleState.convertInput = inputVal;
    if (fromMode) this.moduleState.convertFromMode = fromMode;
    if (toMode) this.moduleState.convertToMode = toMode;

    const res = TrigonometryMathEngine.convertAngle(
      this.moduleState.convertInput,
      this.moduleState.convertFromMode,
      this.moduleState.convertToMode
    );

    if (res.success) {
      this.moduleState.convertResult = res;
      store.addHistoryItem(
        `Convert ${res.result.original} (${fromMode} → ${toMode})`,
        res.result.formatted,
        'Trigonometric Functions'
      );
    } else {
      this.moduleState.lastError = res.error;
    }

    this.notify(this.getModuleState());
    return res;
  }

  loadPreset(presetKey) {
    const preset = TRIG_PRESETS[presetKey];
    if (!preset) return;

    this.moduleState.angleMode = preset.mode;

    if (preset.type === 'basic') {
      this.moduleState.activeToolTab = 'evaluator';
      this.moduleState.activeFunction = preset.func;
      this.moduleState.inputAngle = preset.input;
      return this.evaluateCurrent();
    } else if (preset.type === 'inverse') {
      this.moduleState.activeToolTab = 'evaluator';
      this.moduleState.activeInverseFunc = preset.func;
      this.moduleState.inputInverseVal = preset.input;
      return this.evaluateInverse(preset.func, preset.input);
    } else if (preset.type === 'equation') {
      this.moduleState.activeToolTab = 'equations';
      this.moduleState.equationFunc = preset.func;
      this.moduleState.equationK = preset.input;
      return this.solveEquation(preset.func, preset.input);
    }
  }

  clear() {
    this.moduleState.inputAngle = '0';
    this.moduleState.inputInverseVal = '0';
    this.moduleState.latestResult = null;
    this.moduleState.lastError = null;
    this.notify(this.getModuleState());
  }
}

export const trigController = new TrigController();
