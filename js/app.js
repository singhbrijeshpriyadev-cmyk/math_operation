/**
 * OG - Main Application Entrypoint & Spatial Ambient Controller
 * Production Liquid Glass Design System
 * ES6 Module
 */

import { Router } from './router.js';

// Floating mathematical symbols library for ambient background
const BACKGROUND_MATH_SYMBOLS = [
  'π', '∑', '∫', '√', '∂', '∞', 'f(x)', 'dx', 'a²+b²=c²', 'lim', '∇', 'θ', 'λ', '∈', '∅', '≈'
];

function initAmbientMathSymbols() {
  const container = document.getElementById('floating-symbols-container');
  if (!container) return;

  const count = 18;
  const frag = document.createDocumentFragment();

  for (let i = 0; i < count; i++) {
    const el = document.createElement('div');
    el.className = 'float-symbol';
    const symbol = BACKGROUND_MATH_SYMBOLS[i % BACKGROUND_MATH_SYMBOLS.length];
    el.textContent = symbol;

    // Distribute randomly across screen
    const x = Math.random() * 95;
    const y = Math.random() * 92;
    const size = 1.1 + Math.random() * 1.6;
    const opacity = 0.022 + Math.random() * 0.04;
    const animType = (i % 3) + 1;
    // Longer, more varied durations — prevents repeating/synchronized looks
    const duration = 16 + Math.random() * 18;
    // Negative delay = start mid-animation so all symbols are already floating on load
    const delay = -(Math.random() * duration);

    el.style.left = `${x}vw`;
    el.style.top = `${y}vh`;
    el.style.fontSize = `${size}rem`;
    el.style.opacity = opacity.toString();
    // Use cubic-bezier for a more organic, non-mechanical float
    el.style.animation = `floatDrift${animType} ${duration}s cubic-bezier(0.45, 0.05, 0.55, 0.95) ${delay}s infinite alternate`;

    frag.appendChild(el);
  }

  container.appendChild(frag);
}

/**
 * Initializes spatial computing cursor-following light & reflection tracking
 * for all interactive liquid glass cards and panels.
 */
function initSpatialCardReflection() {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;

  // Track global coordinates for ambient lights
  window.addEventListener('mousemove', (e) => {
    document.documentElement.style.setProperty('--mouse-x', `${e.clientX}px`);
    document.documentElement.style.setProperty('--mouse-y', `${e.clientY}px`);
  }, { passive: true });

  // Delegated pointer movement for high-performance localized card reflections
  document.addEventListener('pointermove', (e) => {
    const card = e.target.closest('.glass-card, .quick-tool-card, .module-card, .glass-panel');
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    card.style.setProperty('--card-mouse-x', `${x}px`);
    card.style.setProperty('--card-mouse-y', `${y}px`);
  }, { passive: true });
}

// Application Bootstrap
function bootstrapApp() {
  initAmbientMathSymbols();
  initSpatialCardReflection();

  // Initialize Router
  const router = new Router();
  window.ogRouter = router;
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrapApp);
} else {
  bootstrapApp();
}
