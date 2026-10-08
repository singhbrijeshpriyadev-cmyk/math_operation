/**
 * OG - Vectors & 3D Geometry Mathematical Engine
 * Comprehensive 3D vector and coordinate geometry calculations:
 * - 3D Distance formula
 * - Section formula (internal & external)
 * - Vector Magnitude & Unit Vector
 * - Direction Cosines & Ratios
 * - Dot Product, Angle & Orthogonality
 * - Cross Product & Area of Parallelogram
 * - Scalar Triple Product & Volume of Parallelepiped
 * - Shortest Distance between Skew Lines in 3D
 * ES6 Module
 */

import { ResultFormatter } from './formatter.js';

export class Vector3DMathEngine {
  /**
   * Distance between P1(x1, y1, z1) and P2(x2, y2, z2)
   */
  static distance3D(p1, p2) {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const dz = p2.z - p1.z;
    const distSq = dx * dx + dy * dy + dz * dz;
    const dist = Math.sqrt(distSq);

    const cDist = ResultFormatter.cleanNumber(dist);
    const formulaStr = 'd = √[(x₂ - x₁)² + (y₂ - y₁)² + (z₂ - z₁)²]';

    const steps = [
      `1. Point P₁: (${p1.x}, ${p1.y}, ${p1.z})`,
      `2. Point P₂: (${p2.x}, ${p2.y}, ${p2.z})`,
      `3. Coordinate Differences: Δx = ${dx}, Δy = ${dy}, Δz = ${dz}`,
      `4. Sum of Squares: (${dx})² + (${dy})² + (${dz})² = ${dx * dx} + ${dy * dy} + ${dz * dz} = ${distSq}`,
      `5. Euclidean Distance: d = √${distSq} = ${cDist} units`
    ];

    return ResultFormatter.success(
      {
        p1,
        p2,
        distance: cDist,
        distSquared: distSq
      },
      steps,
      formulaStr
    );
  }

  /**
   * Section formula dividing segment P1-P2 in ratio m:n
   */
  static sectionFormula(p1, p2, m, n, isInternal = true) {
    if (m + (isInternal ? n : -n) === 0) {
      return ResultFormatter.error('Division by zero in section ratio.');
    }

    const divisor = isInternal ? (m + n) : (m - n);
    const factorN = isInternal ? n : -n;

    const x = (m * p2.x + factorN * p1.x) / divisor;
    const y = (m * p2.y + factorN * p1.y) / divisor;
    const z = (m * p2.z + factorN * p1.z) / divisor;

    const pt = {
      x: ResultFormatter.cleanNumber(x),
      y: ResultFormatter.cleanNumber(y),
      z: ResultFormatter.cleanNumber(z)
    };

    const typeStr = isInternal ? 'Internal Division' : 'External Division';
    const formulaStr = isInternal
      ? 'P = ((m·x₂ + n·x₁) / (m + n), (m·y₂ + n·y₁) / (m + n), (m·z₂ + n·z₁) / (m + n))'
      : 'P = ((m·x₂ - n·x₁) / (m - n), (m·y₂ - n·y₁) / (m - n), (m·z₂ - n·z₁) / (m - n))';

    const steps = [
      `1. Given Ratio: m : n = ${m} : ${n} (${typeStr})`,
      `2. Point P₁: (${p1.x}, ${p1.y}, ${p1.z}), Point P₂: (${p2.x}, ${p2.y}, ${p2.z})`,
      `3. X-coordinate: (${m}×${p2.x} ${isInternal ? '+' : '-'} ${n}×${p1.x}) / (${divisor}) = ${pt.x}`,
      `4. Y-coordinate: (${m}×${p2.y} ${isInternal ? '+' : '-'} ${n}×${p1.y}) / (${divisor}) = ${pt.y}`,
      `5. Z-coordinate: (${m}×${p2.z} ${isInternal ? '+' : '-'} ${n}×${p1.z}) / (${divisor}) = ${pt.z}`,
      `6. Division Point P: (${pt.x}, ${pt.y}, ${pt.z})`
    ];

    return ResultFormatter.success(
      {
        point: pt,
        ratioM: m,
        ratioN: n,
        isInternal
      },
      steps,
      formulaStr
    );
  }

  /**
   * Vector Operations: Dot Product, Cross Product, Magnitude
   */
  static vectorAlgebra(u, v) {
    const magU = Math.sqrt(u.x * u.x + u.y * u.y + u.z * u.z);
    const magV = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);

    // Dot Product: u · v = ux*vx + uy*vy + uz*vz
    const dot = u.x * v.x + u.y * v.y + u.z * v.z;

    // Angle θ: cos(θ) = (u · v) / (|u| * |v|)
    let angleRad = 0;
    let angleDeg = 0;
    if (magU > 0 && magV > 0) {
      const cosTheta = Math.max(-1, Math.min(1, dot / (magU * magV)));
      angleRad = Math.acos(cosTheta);
      angleDeg = (angleRad * 180) / Math.PI;
    }

    // Cross Product: u × v
    // i*(uy*vz - uz*vy) - j*(ux*vz - uz*vx) + k*(ux*vy - uy*vx)
    const cross = {
      x: u.y * v.z - u.z * v.y,
      y: u.z * v.x - u.x * v.z,
      z: u.x * v.y - u.y * v.x
    };
    const magCross = Math.sqrt(cross.x * cross.x + cross.y * cross.y + cross.z * cross.z);

    // Direction cosines of u: (ux/|u|, uy/|u|, uz/|u|)
    const dcU = magU > 0 ? {
      l: ResultFormatter.cleanNumber(u.x / magU),
      m: ResultFormatter.cleanNumber(u.y / magU),
      n: ResultFormatter.cleanNumber(u.z / magU)
    } : { l: 0, m: 0, n: 0 };

    const cMagU = ResultFormatter.cleanNumber(magU);
    const cMagV = ResultFormatter.cleanNumber(magV);
    const cDot = ResultFormatter.cleanNumber(dot);
    const cAngleDeg = ResultFormatter.cleanNumber(angleDeg);
    const cMagCross = ResultFormatter.cleanNumber(magCross);

    const isOrthogonal = Math.abs(dot) < 1e-6;
    const isParallel = Math.abs(magCross) < 1e-6;

    const formulaStr = "u⃗ · v⃗ = |u⃗||v⃗| cos(θ)   |   u⃗ × v⃗ = det | i  j  k ; ux uy uz ; vx vy vz |";

    const steps = [
      `1. Vector u⃗: ⟨${u.x}, ${u.y}, ${u.z}⟩ ⟹ Magnitude |u⃗| = √(${u.x}² + ${u.y}² + ${u.z}²) = ${cMagU}`,
      `2. Vector v⃗: ⟨${v.x}, ${v.y}, ${v.z}⟩ ⟹ Magnitude |v⃗| = √(${v.x}² + ${v.y}² + ${v.z}²) = ${cMagV}`,
      `3. Direction Cosines of u⃗: (l, m, n) = (${dcU.l}, ${dcU.m}, ${dcU.n})`,
      `4. Dot Product u⃗ · v⃗: (${u.x}×${v.x}) + (${u.y}×${v.y}) + (${u.z}×${v.z}) = ${cDot}`,
      `5. Angle between vectors: cos(θ) = (${cDot}) / (${cMagU} × ${cMagV}) ⟹ θ = ${cAngleDeg}°`,
      `6. Cross Product u⃗ × v⃗: ⟨${cross.x}, ${cross.y}, ${cross.z}⟩`,
      `7. Magnitude of Cross Product (Parallelogram Area): |u⃗ × v⃗| = ${cMagCross} sq units`,
      `8. Geometric Relationship: ${isOrthogonal ? 'Vectors are ORTHOGONAL (Perpendicular)' : isParallel ? 'Vectors are PARALLEL' : 'Vectors are oblique'}`
    ];

    return ResultFormatter.success(
      {
        magU: cMagU,
        magV: cMagV,
        dotProduct: cDot,
        crossProduct: {
          x: ResultFormatter.cleanNumber(cross.x),
          y: ResultFormatter.cleanNumber(cross.y),
          z: ResultFormatter.cleanNumber(cross.z)
        },
        magCross: cMagCross,
        angleDeg: cAngleDeg,
        directionCosinesU: dcU,
        isOrthogonal,
        isParallel
      },
      steps,
      formulaStr
    );
  }
}
