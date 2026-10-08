/**
 * OG - Statistics Math Engine
 * Comprehensive statistical engine supporting:
 * 01. Data parsing & interactive data table (raw, frequency, grouped)
 * 02. Descriptive statistics (Count, Sum, Mean, Median, Mode, Min, Max, Range, Midrange)
 * 03. Measures of Central Tendency (Arithmetic, Weighted, Frequency, Grouped)
 * 04. Measures of Dispersion (Range, Mean Dev, Population & Sample Variance, Std Dev, CV)
 * 05. Frequency Distribution Generator (Bins, Width, Relative/Cumulative/Percentage Frequencies)
 * 06. Grouped Data Analysis (Mean, Median, Mode via interpolation, Variance, Quartiles)
 * 07. Quartiles, Deciles & Percentiles (Q1-Q3, IQR, QD, D1-D9, P1-P99, Outliers via IQR fences)
 * 08. Correlation (Pearson r, Covariance, Strength & Direction interpretation, Non-causation disclaimer)
 * 09. Simple Linear Regression (y = a + bx, Slope, Intercept, R², Point predictor)
 * 10. 7-Stage Step-by-Step Derivation System
 *
 * ES6 Module
 */

import { ResultFormatter } from './formatter.js';

export class StatisticsMathEngine {
  /**
   * Parse raw data from comma/space/newline separated string
   */
  static parseRawData(input) {
    if (Array.isArray(input)) {
      return input.map(Number).filter(n => Number.isFinite(n));
    }
    if (typeof input !== 'string') return [];
    return input
      .trim()
      .split(/[\s,;]+/)
      .map(s => s.trim())
      .filter(s => s.length > 0)
      .map(Number)
      .filter(n => Number.isFinite(n));
  }

  /**
   * Parse frequency table from array of { value, frequency } or text lines
   */
  static parseFrequencyData(rows) {
    if (typeof rows === 'string') {
      const lines = rows.trim().split('\n');
      rows = lines.map(line => {
        const parts = line.split(/[,|\t:]+/).map(s => s.trim());
        return {
          value: parseFloat(parts[0]),
          frequency: parts[1] !== undefined ? parseFloat(parts[1]) : 1
        };
      });
    }

    if (!Array.isArray(rows)) return { valid: false, error: 'Frequency table must be a list of rows.' };

    const cleanRows = [];
    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      const val = Number(r.value);
      const freq = Number(r.frequency !== undefined ? r.frequency : 1);

      if (!Number.isFinite(val)) {
        return { valid: false, error: `Row ${i + 1}: Value "${r.value}" is not a valid number.` };
      }
      if (!Number.isFinite(freq) || freq < 0) {
        return { valid: false, error: `Row ${i + 1}: Frequency must be a non-negative number, got "${r.frequency}".` };
      }
      if (freq > 0) {
        cleanRows.push({ value: val, frequency: freq });
      }
    }

    if (cleanRows.length === 0) {
      return { valid: false, error: 'Frequency table contains no valid non-zero rows.' };
    }

    // Expand to raw data representation if needed
    const expanded = [];
    cleanRows.forEach(r => {
      const count = Math.round(r.frequency);
      for (let k = 0; k < count; k++) expanded.push(r.value);
    });

    return { valid: true, rows: cleanRows, expanded };
  }

  /**
   * Parse grouped frequency data: e.g. "0-10: 5", "10-20: 8", "20-30: 12", "30-40: 7"
   */
  static parseGroupedData(input) {
    let rawRows = [];
    if (typeof input === 'string') {
      const lines = input.trim().split('\n');
      rawRows = lines.map(line => {
        const parts = line.split(/[:|\t,]+/).map(s => s.trim());
        return { classStr: parts[0], frequency: parts[1] };
      });
    } else if (Array.isArray(input)) {
      rawRows = input;
    } else {
      return { valid: false, error: 'Grouped data must be an array or string.' };
    }

    const parsedGroups = [];
    let cumFreq = 0;

    for (let i = 0; i < rawRows.length; i++) {
      const row = rawRows[i];
      const classStr = String(row.classStr || row.classInterval || '').trim();
      const freq = Number(row.frequency || row.f || 0);

      if (!classStr) continue;
      if (!Number.isFinite(freq) || freq < 0) {
        return { valid: false, error: `Row ${i + 1}: Frequency must be a non-negative number.` };
      }

      // Match intervals like "0-10", "0 - 10", "0 to 10"
      const match = classStr.match(/^(-?\d+(?:\.\d+)?)\s*(?:-|to|\.\.)\s*(-?\d+(?:\.\d+)?)$/i);
      if (!match) {
        return { valid: false, error: `Row ${i + 1}: Invalid class interval format "${classStr}". Use format like "10-20".` };
      }

      const lower = parseFloat(match[1]);
      const upper = parseFloat(match[2]);
      if (lower >= upper) {
        return { valid: false, error: `Row ${i + 1}: Lower limit (${lower}) must be strictly less than upper limit (${upper}).` };
      }

      const width = upper - lower;
      const midpoint = (lower + upper) / 2;
      cumFreq += freq;

      parsedGroups.push({
        index: i + 1,
        classStr: `${lower}-${upper}`,
        lower,
        upper,
        width,
        midpoint,
        frequency: freq,
        cumFreq
      });
    }

    if (parsedGroups.length === 0) {
      return { valid: false, error: 'No valid grouped data rows provided.' };
    }

    return { valid: true, groups: parsedGroups, totalFreq: cumFreq };
  }

  /**
   * Complete descriptive statistics for raw data
   * @param {number[]} dataArray
   * @param {boolean} isSample - Whether to compute sample variance/std dev (N-1) or population (N)
   */
  static analyze(dataInput, isSample = false) {
    const data = this.parseRawData(dataInput);
    if (!data || data.length === 0) {
      return ResultFormatter.error('Dataset is empty. Please enter numeric observations.');
    }
    if (data.length === 1) {
      return ResultFormatter.error('At least 2 data points are required to compute measures of dispersion.');
    }

    const n = data.length;
    const sorted = [...data].sort((a, b) => a - b);
    const sum = data.reduce((acc, v) => acc + v, 0);
    const mean = sum / n;

    // Median
    let median;
    let medianExplanation = '';
    if (n % 2 === 1) {
      const idx = Math.floor(n / 2);
      median = sorted[idx];
      medianExplanation = `Since N = ${n} is odd, median is the middle observation at position (N + 1)/2 = ${(n + 1) / 2}, which is ${median}.`;
    } else {
      const idx1 = n / 2 - 1;
      const idx2 = n / 2;
      median = (sorted[idx1] + sorted[idx2]) / 2;
      medianExplanation = `Since N = ${n} is even, median is the arithmetic mean of observations at rank ${n / 2} (${sorted[idx1]}) and ${n / 2 + 1} (${sorted[idx2]}): (${sorted[idx1]} + ${sorted[idx2]}) / 2 = ${median}.`;
    }

    // Mode
    const freqMap = {};
    let maxFreq = 0;
    data.forEach(v => {
      freqMap[v] = (freqMap[v] || 0) + 1;
      if (freqMap[v] > maxFreq) maxFreq = freqMap[v];
    });

    let modes = [];
    let modeText = '';
    if (maxFreq === 1) {
      modeText = 'No Mode (All values occur with frequency 1)';
    } else {
      modes = Object.keys(freqMap)
        .filter(k => freqMap[k] === maxFreq)
        .map(Number)
        .sort((a, b) => a - b);
      modeText = modes.join(', ') + ` (Frequency = ${maxFreq})`;
    }

    // Minimum, Maximum, Range, Midrange
    const minVal = sorted[0];
    const maxVal = sorted[n - 1];
    const range = maxVal - minVal;
    const midrange = (minVal + maxVal) / 2;

    // Mean Deviation about Mean: MD(x̄) = (1/N) * ∑ |xi - mean|
    let sumAbsDevMean = 0;
    data.forEach(x => {
      sumAbsDevMean += Math.abs(x - mean);
    });
    const mdMean = sumAbsDevMean / n;

    // Mean Deviation about Median: MD(M) = (1/N) * ∑ |xi - median|
    let sumAbsDevMedian = 0;
    data.forEach(x => {
      sumAbsDevMedian += Math.abs(x - median);
    });
    const mdMedian = sumAbsDevMedian / n;

    // Sum of squared deviations
    let sumSqDev = 0;
    data.forEach(x => {
      sumSqDev += Math.pow(x - mean, 2);
    });

    // Population & Sample Variance
    const popVariance = sumSqDev / n;
    const sampleVariance = n > 1 ? sumSqDev / (n - 1) : 0;

    // Population & Sample Standard Deviation
    const popStdDev = Math.sqrt(popVariance);
    const sampleStdDev = Math.sqrt(sampleVariance);

    // Primary variance & std dev based on flag
    const primaryVariance = isSample ? sampleVariance : popVariance;
    const primaryStdDev = isSample ? sampleStdDev : popStdDev;

    // Coefficient of Variation: CV = (σ / |mean|) * 100%
    const cvPop = mean !== 0 ? (popStdDev / Math.abs(mean)) * 100 : 0;
    const cvSample = mean !== 0 ? (sampleStdDev / Math.abs(mean)) * 100 : 0;
    const primaryCv = isSample ? cvSample : cvPop;

    // Quantiles & IQR Outliers
    const qData = this.calculateQuantiles(sorted);

    // Cleaned outputs
    const cSum = ResultFormatter.cleanNumber(sum);
    const cMean = ResultFormatter.cleanNumber(mean);
    const cMedian = ResultFormatter.cleanNumber(median);
    const cMin = ResultFormatter.cleanNumber(minVal);
    const cMax = ResultFormatter.cleanNumber(maxVal);
    const cRange = ResultFormatter.cleanNumber(range);
    const cMidrange = ResultFormatter.cleanNumber(midrange);
    const cMdMean = ResultFormatter.cleanNumber(mdMean);
    const cMdMedian = ResultFormatter.cleanNumber(mdMedian);
    const cPopVar = ResultFormatter.cleanNumber(popVariance);
    const cSampleVar = ResultFormatter.cleanNumber(sampleVariance);
    const cPopStd = ResultFormatter.cleanNumber(popStdDev);
    const cSampleStd = ResultFormatter.cleanNumber(sampleStdDev);
    const cPopCv = ResultFormatter.cleanNumber(cvPop);
    const cSampleCv = ResultFormatter.cleanNumber(cvSample);

    const steps = [
      `1. Problem & Dataset: Observations N = ${n}: [${data.join(', ')}]`,
      `2. Ordered Dataset (Ascending): [${sorted.join(', ')}]`,
      `3. Sum of Observations: ∑xᵢ = ${cSum}`,
      `4. Arithmetic Mean (x̄): x̄ = (∑xᵢ) / N = ${cSum} / ${n} = ${cMean}`,
      `5. Median (M): ${medianExplanation}`,
      `6. Mode: ${modeText}`,
      `7. Range & Midrange: Range = Max - Min = ${cMax} - ${cMin} = ${cRange} | Midrange = (${cMin} + ${cMax}) / 2 = ${cMidrange}`,
      `8. Mean Deviation: MD(x̄) = ∑|xᵢ - x̄| / N = ${ResultFormatter.cleanNumber(sumAbsDevMean)} / ${n} = ${cMdMean} | MD(M) = ${cMdMedian}`,
      `9. Sum of Squared Deviations: SS = ∑(xᵢ - x̄)² = ${ResultFormatter.cleanNumber(sumSqDev)}`,
      `10. Population Variance (σ²): σ² = SS / N = ${ResultFormatter.cleanNumber(sumSqDev)} / ${n} = ${cPopVar}`,
      `11. Population Standard Deviation (σ): σ = √(${cPopVar}) = ${cPopStd}`,
      `12. Sample Variance (s²): s² = SS / (N - 1) = ${ResultFormatter.cleanNumber(sumSqDev)} / ${n - 1} = ${cSampleVar}`,
      `13. Sample Standard Deviation (s): s = √(${cSampleVar}) = ${cSampleStd}`,
      `14. Coefficient of Variation (CV): Population CV = (${cPopStd} / |${cMean}|) × 100% = ${cPopCv}% | Sample CV = ${cSampleCv}%`,
      `15. Quartiles & Outlier Analysis: Q₁ = ${qData.q1}, Q₂ = ${qData.q2}, Q₃ = ${qData.q3}, IQR = ${qData.iqr}, Outliers = [${qData.outliers.join(', ') || 'None'}]`
    ];

    const derivation7Stage = {
      problem: `Analyze descriptive statistics and dispersion for dataset with N = ${n} observations.`,
      data: `Observations: [${sorted.join(', ')}]`,
      formula: isSample
        ? `Mean: x̄ = ∑x/N | Sample Variance: s² = ∑(x - x̄)²/(N - 1) | Sample Std Dev: s = √s²`
        : `Mean: μ = ∑x/N | Population Variance: σ² = ∑(x - μ)²/N | Population Std Dev: σ = √σ²`,
      substitution: isSample
        ? `x̄ = ${cSum}/${n} = ${cMean} | s² = ${ResultFormatter.cleanNumber(sumSqDev)}/(${n} - 1)`
        : `μ = ${cSum}/${n} = ${cMean} | σ² = ${ResultFormatter.cleanNumber(sumSqDev)}/${n}`,
      calculation: `Mean = ${cMean}, Variance = ${isSample ? cSampleVar : cPopVar}, Std Dev = ${isSample ? cSampleStd : cPopStd}, Median = ${cMedian}, Mode = ${modeText}`,
      result: `Mean: ${cMean} | Median: ${cMedian} | Std Dev: ${isSample ? cSampleStd : cPopStd} | IQR: ${qData.iqr}`,
      interpretation: `The center of the distribution is ${cMean} (mean) and ${cMedian} (median). Dispersion is measured by ${isSample ? 'sample' : 'population'} standard deviation of ${isSample ? cSampleStd : cPopStd}. Relative variability is ${isSample ? cSampleCv : cPopCv}%.`
    };

    return ResultFormatter.success(
      {
        n,
        data,
        sorted,
        sum: cSum,
        mean: cMean,
        median: cMedian,
        modes,
        modeText,
        min: cMin,
        max: cMax,
        range: cRange,
        midrange: cMidrange,
        mdMean: cMdMean,
        mdMedian: cMdMedian,
        sumSqDev: ResultFormatter.cleanNumber(sumSqDev),
        popVariance: cPopVar,
        sampleVariance: cSampleVar,
        popStdDev: cPopStd,
        sampleStdDev: cSampleStd,
        primaryVariance: ResultFormatter.cleanNumber(primaryVariance),
        primaryStdDev: ResultFormatter.cleanNumber(primaryStdDev),
        variance: ResultFormatter.cleanNumber(primaryVariance),
        stdDev: ResultFormatter.cleanNumber(primaryStdDev),
        popCv: cPopCv,
        sampleCv: cSampleCv,
        primaryCv: ResultFormatter.cleanNumber(primaryCv),
        cv: ResultFormatter.cleanNumber(primaryCv),
        isSample,
        quantiles: qData,
        derivation7Stage
      },
      steps,
      'Descriptive Statistics & Dispersion'
    );
  }

  /**
   * Quantiles, Deciles, Percentiles & IQR Outliers
   * Computes Q1, Q2, Q3, IQR, Quartile Deviation, Deciles (D1-D9), Percentiles (P1-P99)
   */
  static calculateQuantiles(sortedData, customPercentile = 90) {
    const arr = [...sortedData].sort((a, b) => a - b);
    const n = arr.length;

    // Percentile via linear interpolation: R = (n - 1) * p
    const getPercentile = (p) => {
      if (n === 0) return 0;
      if (n === 1) return arr[0];
      const rank = (n - 1) * p;
      const lower = Math.floor(rank);
      const upper = Math.ceil(rank);
      const weight = rank - lower;
      return arr[lower] + weight * (arr[upper] - arr[lower]);
    };

    const q1 = getPercentile(0.25);
    const q2 = getPercentile(0.50);
    const q3 = getPercentile(0.75);
    const iqr = q3 - q1;
    const quartileDev = iqr / 2; // Semi-interquartile range

    // Outlier fences
    const lowerFence = q1 - 1.5 * iqr;
    const upperFence = q3 + 1.5 * iqr;
    const outliers = arr.filter(x => x < lowerFence || x > upperFence);

    // Deciles D1 - D9
    const deciles = {};
    for (let d = 1; d <= 9; d++) {
      deciles[`D${d}`] = ResultFormatter.cleanNumber(getPercentile(d / 10));
    }

    // Custom requested percentile
    const pK = Math.max(1, Math.min(99, customPercentile));
    const pVal = getPercentile(pK / 100);

    return {
      q1: ResultFormatter.cleanNumber(q1),
      q2: ResultFormatter.cleanNumber(q2),
      q3: ResultFormatter.cleanNumber(q3),
      iqr: ResultFormatter.cleanNumber(iqr),
      quartileDev: ResultFormatter.cleanNumber(quartileDev),
      lowerFence: ResultFormatter.cleanNumber(lowerFence),
      upperFence: ResultFormatter.cleanNumber(upperFence),
      outliers,
      deciles,
      customPercentile: {
        k: pK,
        value: ResultFormatter.cleanNumber(pVal)
      }
    };
  }

  /**
   * Frequency Distribution Generator from raw dataset
   */
  static generateFrequencyDistribution(dataInput, options = {}) {
    const data = this.parseRawData(dataInput);
    if (!data || data.length === 0) {
      return ResultFormatter.error('Dataset is empty. Cannot generate frequency distribution.');
    }

    const n = data.length;
    const sorted = [...data].sort((a, b) => a - b);
    const minVal = sorted[0];
    const maxVal = sorted[n - 1];
    const range = maxVal - minVal;

    // Number of classes: options.numBins or Sturges' Rule: k = 1 + 3.322 * log10(n)
    let numClasses = options.numClasses || Math.max(3, Math.min(15, Math.round(1 + 3.322 * Math.log10(n))));
    if (range === 0) numClasses = 1;

    // Class width: options.classWidth or range / numClasses
    let rawWidth = range > 0 ? range / numClasses : 1;
    let width = options.classWidth ? Number(options.classWidth) : Math.ceil(rawWidth);
    if (width <= 0) width = 1;

    // Starting boundary
    let start = options.startBound !== undefined ? Number(options.startBound) : Math.floor(minVal);

    // Generate intervals
    const bins = [];
    let currentLower = start;
    let runningCum = 0;

    while (currentLower <= maxVal || bins.length < numClasses) {
      const currentUpper = currentLower + width;
      // Filter values in [lower, upper) except for last bin which includes maxVal
      const isLast = (currentUpper > maxVal);
      const binValues = sorted.filter(v => isLast ? (v >= currentLower && v <= currentUpper) : (v >= currentLower && v < currentUpper));
      const freq = binValues.length;
      runningCum += freq;
      const relFreq = freq / n;
      const pctFreq = relFreq * 100;
      const midpoint = (currentLower + currentUpper) / 2;

      bins.push({
        interval: `${currentLower} - ${currentUpper}`,
        lower: currentLower,
        upper: currentUpper,
        midpoint,
        frequency: freq,
        cumFreq: runningCum,
        relFreq: ResultFormatter.cleanNumber(relFreq),
        pctFreq: ResultFormatter.cleanNumber(pctFreq) + '%'
      });

      currentLower = currentUpper;
      if (bins.length > 30) break; // Safety cutoff
    }

    return ResultFormatter.success({
      n,
      min: minVal,
      max: maxVal,
      range,
      numClasses: bins.length,
      classWidth: width,
      startBound: start,
      bins
    }, [
      `1. Total Observations: N = ${n}`,
      `2. Minimum = ${minVal}, Maximum = ${maxVal}, Range = ${range}`,
      `3. Chosen Number of Classes: ${bins.length}, Class Width: ${width}, Start Boundary: ${start}`,
      `4. Class Intervals generated with frequency, cumulative frequency and percentages.`
    ]);
  }

  /**
   * Grouped Frequency Distribution Statistical Analysis
   * Calculates Mean, Median, Mode, Variance, Std Dev, and Quartiles for grouped classes
   */
  static analyzeGroupedData(groupedInput, isSample = false) {
    const parsed = this.parseGroupedData(groupedInput);
    if (!parsed.valid) {
      return ResultFormatter.error(parsed.error);
    }

    const groups = parsed.groups;
    const N = parsed.totalFreq;
    if (N === 0) {
      return ResultFormatter.error('Total frequency must be greater than zero.');
    }

    // 1. Grouped Mean: x̄ = ∑(f * m) / N
    let sumFM = 0;
    let sumFM2 = 0;
    groups.forEach(g => {
      sumFM += g.frequency * g.midpoint;
      sumFM2 += g.frequency * Math.pow(g.midpoint, 2);
    });
    const mean = sumFM / N;

    // 2. Grouped Median: M = L + ((N/2 - cf_prev) / f_m) * h
    const halfN = N / 2;
    let medianClass = null;
    let cfPrevMedian = 0;

    for (let i = 0; i < groups.length; i++) {
      if (groups[i].cumFreq >= halfN) {
        medianClass = groups[i];
        cfPrevMedian = i > 0 ? groups[i - 1].cumFreq : 0;
        break;
      }
    }

    if (!medianClass) medianClass = groups[groups.length - 1];
    const L_med = medianClass.lower;
    const f_med = medianClass.frequency;
    const h_med = medianClass.width;
    const median = f_med > 0 ? L_med + ((halfN - cfPrevMedian) / f_med) * h_med : L_med;

    // 3. Grouped Mode: Mode = L + ((f1 - f0) / (2f1 - f0 - f2)) * h
    let modalClassIndex = 0;
    let maxGroupFreq = -1;
    groups.forEach((g, idx) => {
      if (g.frequency > maxGroupFreq) {
        maxGroupFreq = g.frequency;
        modalClassIndex = idx;
      }
    });

    const modalClass = groups[modalClassIndex];
    const L_mod = modalClass.lower;
    const f1 = modalClass.frequency;
    const f0 = modalClassIndex > 0 ? groups[modalClassIndex - 1].frequency : 0;
    const f2 = modalClassIndex < groups.length - 1 ? groups[modalClassIndex + 1].frequency : 0;
    const h_mod = modalClass.width;

    const denomMode = (2 * f1 - f0 - f2);
    let mode;
    let modeExplanation = '';
    if (denomMode === 0) {
      mode = modalClass.midpoint;
      modeExplanation = `Denominator (2f₁ - f₀ - f₂) = 0; using class midpoint ${mode}.`;
    } else {
      mode = L_mod + ((f1 - f0) / denomMode) * h_mod;
      modeExplanation = `Mode = ${L_mod} + [(${f1} - ${f0}) / (2·${f1} - ${f0} - ${f2})] × ${h_mod} = ${ResultFormatter.cleanNumber(mode)}`;
    }

    // 4. Grouped Variance & Standard Deviation
    let sumSqDevGrouped = 0;
    groups.forEach(g => {
      sumSqDevGrouped += g.frequency * Math.pow(g.midpoint - mean, 2);
    });

    const popVariance = sumSqDevGrouped / N;
    const sampleVariance = N > 1 ? sumSqDevGrouped / (N - 1) : 0;
    const popStdDev = Math.sqrt(popVariance);
    const sampleStdDev = Math.sqrt(sampleVariance);

    const primaryVariance = isSample ? sampleVariance : popVariance;
    const primaryStdDev = isSample ? sampleStdDev : popStdDev;

    // 5. Grouped Quartiles Q1, Q2, Q3
    const getGroupedQuantile = (kRatio) => {
      const targetRank = N * kRatio;
      let targetClass = null;
      let cfPrev = 0;
      for (let i = 0; i < groups.length; i++) {
        if (groups[i].cumFreq >= targetRank) {
          targetClass = groups[i];
          cfPrev = i > 0 ? groups[i - 1].cumFreq : 0;
          break;
        }
      }
      if (!targetClass) return groups[groups.length - 1].midpoint;
      const L = targetClass.lower;
      const f = targetClass.frequency;
      const h = targetClass.width;
      return f > 0 ? L + ((targetRank - cfPrev) / f) * h : L;
    };

    const q1 = getGroupedQuantile(0.25);
    const q3 = getGroupedQuantile(0.75);
    const iqr = q3 - q1;

    const cMean = ResultFormatter.cleanNumber(mean);
    const cMed = ResultFormatter.cleanNumber(median);
    const cMod = ResultFormatter.cleanNumber(mode);
    const cPopVar = ResultFormatter.cleanNumber(popVariance);
    const cPopStd = ResultFormatter.cleanNumber(popStdDev);
    const cSampleVar = ResultFormatter.cleanNumber(sampleVariance);
    const cSampleStd = ResultFormatter.cleanNumber(sampleStdDev);

    const steps = [
      `1. Grouped Data Table: Total Frequency N = ${N}`,
      `2. Mean: x̄ = ∑(f · m) / N = ${ResultFormatter.cleanNumber(sumFM)} / ${N} = ${cMean}`,
      `3. Median Class: Class interval where cf ≥ N/2 = ${halfN} ⟹ [${medianClass.classStr}]`,
      `   Formula: M = L + [(N/2 - cf_prev) / f_m] × h = ${L_med} + [(${halfN} - ${cfPrevMedian}) / ${f_med}] × ${h_med} = ${cMed}`,
      `4. Modal Class: Class with highest frequency (${f1}) ⟹ [${modalClass.classStr}]`,
      `   ${modeExplanation}`,
      `5. Grouped Variance: ∑f(m - x̄)² / ${isSample ? '(N - 1)' : 'N'} = ${isSample ? cSampleVar : cPopVar}`,
      `6. Grouped Standard Deviation: √Variance = ${isSample ? cSampleStd : cPopStd}`,
      `7. Quartiles: Q₁ = ${ResultFormatter.cleanNumber(q1)}, Q₂ (Median) = ${cMed}, Q₃ = ${ResultFormatter.cleanNumber(q3)}, IQR = ${ResultFormatter.cleanNumber(iqr)}`
    ];

    const derivation7Stage = {
      problem: `Compute grouped central tendency, dispersion, and quartiles for ${groups.length} intervals.`,
      data: `Total Frequency N = ${N}. Intervals: ${groups.map(g => `${g.classStr} (f=${g.frequency})`).join(', ')}`,
      formula: `Mean: x̄ = ∑(f·m)/N | Median: L + [(N/2 - cf_prev)/f_m]·h | Mode: L + [(f₁ - f₀)/(2f₁ - f₀ - f₂)]·h`,
      substitution: `Mean: ${ResultFormatter.cleanNumber(sumFM)}/${N} | Median: ${L_med} + [(${halfN} - ${cfPrevMedian})/${f_med}]·${h_med}`,
      calculation: `Mean = ${cMean}, Median = ${cMed}, Mode = ${cMod}, Std Dev = ${isSample ? cSampleStd : cPopStd}`,
      result: `Mean: ${cMean} | Median: ${cMed} | Mode: ${cMod} | IQR: ${ResultFormatter.cleanNumber(iqr)}`,
      interpretation: `Grouped analysis estimates the distribution center at ${cMed} (median) with grouped standard deviation ${isSample ? cSampleStd : cPopStd}.`
    };

    return ResultFormatter.success({
      groups,
      totalFreq: N,
      sumFM: ResultFormatter.cleanNumber(sumFM),
      mean: cMean,
      median: cMed,
      medianClass: medianClass.classStr,
      mode: cMod,
      modalClass: modalClass.classStr,
      popVariance: cPopVar,
      sampleVariance: cSampleVar,
      popStdDev: cPopStd,
      sampleStdDev: cSampleStd,
      primaryVariance: ResultFormatter.cleanNumber(primaryVariance),
      primaryStdDev: ResultFormatter.cleanNumber(primaryStdDev),
      q1: ResultFormatter.cleanNumber(q1),
      q3: ResultFormatter.cleanNumber(q3),
      iqr: ResultFormatter.cleanNumber(iqr),
      derivation7Stage
    }, steps, 'Grouped Data Analysis');
  }

  /**
   * Pearson Correlation Coefficient & Simple Linear Regression
   * @param {number[]|string} xInput
   * @param {number[]|string} yInput
   */
  static correlationAndRegression(xInput, yInput, predictX = null) {
    const xData = this.parseRawData(xInput);
    const yData = this.parseRawData(yInput);

    if (xData.length === 0 || yData.length === 0) {
      return ResultFormatter.error('Both X and Y datasets must contain numeric values.');
    }
    if (xData.length !== yData.length) {
      return ResultFormatter.error(`Datasets must have matching length. X has ${xData.length} items, while Y has ${yData.length} items.`);
    }
    if (xData.length < 2) {
      return ResultFormatter.error('At least 2 coordinate pairs are required for correlation and regression analysis.');
    }

    const n = xData.length;
    const sumX = xData.reduce((a, b) => a + b, 0);
    const sumY = yData.reduce((a, b) => a + b, 0);
    const meanX = sumX / n;
    const meanY = sumY / n;

    let ssXX = 0;
    let ssYY = 0;
    let ssXY = 0;

    for (let i = 0; i < n; i++) {
      const dx = xData[i] - meanX;
      const dy = yData[i] - meanY;
      ssXX += dx * dx;
      ssYY += dy * dy;
      ssXY += dx * dy;
    }

    // Covariance: Cov(X, Y) = ssXY / n
    const covariance = ssXY / n;
    const sampleCovariance = ssXY / (n - 1);

    // Pearson r
    let r = 0;
    if (ssXX > 0 && ssYY > 0) {
      r = ssXY / Math.sqrt(ssXX * ssYY);
    } else {
      r = 0;
    }

    // Correlation Interpretation
    let interpretation = '';
    const absR = Math.abs(r);
    const direction = r > 0 ? 'positive' : r < 0 ? 'negative' : 'neutral';

    if (absR >= 0.999) {
      interpretation = `Perfect ${direction} linear relationship.`;
    } else if (absR >= 0.8) {
      interpretation = `Strong ${direction} linear correlation.`;
    } else if (absR >= 0.5) {
      interpretation = `Moderate ${direction} linear correlation.`;
    } else if (absR >= 0.3) {
      interpretation = `Weak ${direction} linear correlation.`;
    } else {
      interpretation = `Very weak or no linear correlation.`;
    }

    // Critical non-causation disclaimer
    const disclaimer = 'Note: Correlation measures linear statistical association only and does not imply causation.';

    // Simple Linear Regression: y = a + bx
    // Slope b = ssXY / ssXX
    let slope = 0;
    let intercept = 0;
    let regressionEquation = '';
    let rSquared = r * r;

    if (ssXX > 0) {
      slope = ssXY / ssXX;
      intercept = meanY - slope * meanX;
      const cSlope = ResultFormatter.cleanNumber(slope);
      const cIntercept = ResultFormatter.cleanNumber(intercept);
      const sign = intercept >= 0 ? '+' : '-';
      regressionEquation = `ŷ = ${cSlope}x ${sign} ${Math.abs(cIntercept)}`;
    } else {
      regressionEquation = `Vertical Line x = ${meanX}`;
    }

    // Prediction if requested
    let prediction = null;
    if (predictX !== null && predictX !== undefined && Number.isFinite(Number(predictX))) {
      const pX = Number(predictX);
      const pY = intercept + slope * pX;
      prediction = {
        x: pX,
        predictedY: ResultFormatter.cleanNumber(pY),
        note: `Estimated prediction at x = ${pX} using line ŷ = ${ResultFormatter.cleanNumber(slope)}x + ${ResultFormatter.cleanNumber(intercept)}.`
      };
    }

    const cR = ResultFormatter.cleanNumber(r);
    const cRSq = ResultFormatter.cleanNumber(rSquared);
    const cCov = ResultFormatter.cleanNumber(covariance);
    const cSlope = ResultFormatter.cleanNumber(slope);
    const cInt = ResultFormatter.cleanNumber(intercept);

    const steps = [
      `1. Paired Observations (n = ${n}):`,
      `   X: [${xData.join(', ')}]`,
      `   Y: [${yData.join(', ')}]`,
      `2. Means: x̄ = ${ResultFormatter.cleanNumber(meanX)}, ȳ = ${ResultFormatter.cleanNumber(meanY)}`,
      `3. Sum of Products: ∑(x - x̄)(y - ȳ) = ${ResultFormatter.cleanNumber(ssXY)}`,
      `4. Sum of Squares: SS_xx = ${ResultFormatter.cleanNumber(ssXX)}, SS_yy = ${ResultFormatter.cleanNumber(ssYY)}`,
      `5. Covariance: Cov(X, Y) = SS_xy / n = ${cCov}`,
      `6. Pearson Correlation Coefficient (r):`,
      `   r = SS_xy / √(SS_xx · SS_yy) = ${ResultFormatter.cleanNumber(ssXY)} / √(${ResultFormatter.cleanNumber(ssXX)} × ${ResultFormatter.cleanNumber(ssYY)}) = ${cR}`,
      `7. Interpretation: ${interpretation} ${disclaimer}`,
      `8. Linear Regression: Slope (b) = SS_xy / SS_xx = ${cSlope} | Intercept (a) = ȳ - b·x̄ = ${cInt}`,
      `   Equation: ${regressionEquation} | Coefficient of Determination R² = ${cRSq}`
    ];

    if (prediction) {
      steps.push(`9. Model Prediction: At x = ${prediction.x}, estimated ŷ = ${prediction.predictedY}`);
    }

    const derivation7Stage = {
      problem: `Evaluate correlation and linear regression between variables X and Y (n = ${n}).`,
      data: `Pairs: ${xData.map((x, i) => `(${x}, ${yData[i]})`).join(', ')}`,
      formula: `r = ∑(x - x̄)(y - ȳ) / √[∑(x - x̄)² ∑(y - ȳ)²] | ŷ = a + bx (b = SS_xy/SS_xx, a = ȳ - bx̄)`,
      substitution: `r = ${ResultFormatter.cleanNumber(ssXY)} / √(${ResultFormatter.cleanNumber(ssXX)} × ${ResultFormatter.cleanNumber(ssYY)}) | b = ${ResultFormatter.cleanNumber(ssXY)} / ${ResultFormatter.cleanNumber(ssXX)}`,
      calculation: `r = ${cR}, Slope b = ${cSlope}, Intercept a = ${cInt}, R² = ${cRSq}`,
      result: `Pearson r = ${cR} | Regression: ${regressionEquation} | R² = ${cRSq}`,
      interpretation: `${interpretation} ${disclaimer}`
    };

    return ResultFormatter.success({
      n,
      xData,
      yData,
      meanX: ResultFormatter.cleanNumber(meanX),
      meanY: ResultFormatter.cleanNumber(meanY),
      covariance: cCov,
      sampleCovariance: ResultFormatter.cleanNumber(sampleCovariance),
      r: cR,
      rSquared: cRSq,
      interpretation,
      disclaimer,
      slope: cSlope,
      intercept: cInt,
      regressionEquation,
      prediction,
      derivation7Stage
    }, steps, 'Correlation & Regression Analysis');
  }
}
