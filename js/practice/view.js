/**
 * OG - Practice Arena View Component
 * Premium Liquid Glass interactive practice system:
 * - Modes: Quick Practice, Topic Practice, Mixed Practice, Exam Mode
 * - Difficulties: Easy, Medium, Hard
 * - Question Types: MCQ, Numerical, Expression, True/False
 * - Interactive feedback: Correct/Incorrect, Explanation, Step-by-step solution
 * - Live local activity stats: Attempted, Correct, Accuracy, Topics Practiced
 * ES6 Module
 */

import { QUESTION_BANK, PRACTICE_TOPICS } from './questions.js';
import { PracticeStatsManager } from './stats.js';
import { showToast, SVG_ICONS } from '../utils.js';

export class PracticeView {
  constructor(container) {
    this.container = container;

    // Configuration state
    this.selectedMode = 'quick'; // 'quick' | 'topic' | 'mixed' | 'exam'
    this.selectedDifficulty = 'all'; // 'all' | 'easy' | 'medium' | 'hard'
    this.selectedTopic = 'All Topics';

    // Active session state
    this.sessionActive = false;
    this.sessionFinished = false;
    this.sessionQuestions = [];
    this.currentIndex = 0;
    this.userAnswers = []; // Array of { question, userAnswer, isCorrect }
    this.submittedCurrent = false;

    // Exam timer state
    this.timerInterval = null;
    this.timeRemainingSeconds = 0;
  }

  mount() {
    this.render();
    this.attachEventListeners();
  }

  destroy() {
    this.stopTimer();
  }

  render() {
    const stats = PracticeStatsManager.getSummary();

    if (this.sessionActive) {
      this.renderActiveSession();
      return;
    }

    if (this.sessionFinished) {
      this.renderSessionResults();
      return;
    }

    // Default: Setup & Statistics Dashboard
    this.container.innerHTML = `
      <div class="view-animate-in practice-container">
        <!-- Header Hero -->
        <div class="glass-surface" style="padding: 28px 32px; border-radius: var(--radius-xl); margin-bottom: 24px; position: relative; overflow: hidden;">
          <div style="display: flex; gap: 8px; margin-bottom: 10px;">
            <span class="badge" style="background: rgba(16, 185, 129, 0.15); color: #10b981; border-color: rgba(16, 185, 129, 0.3);">
              Interactive Training
            </span>
            <span class="badge" style="background: rgba(255, 255, 255, 0.05); color: var(--text-secondary);">
              Local Analytics Active
            </span>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 16px;">
            <div style="max-width: 760px;">
              <h1 style="font-size: clamp(2rem, 3.2vw, 2.8rem); font-weight: 800; color: var(--text-white); margin: 0 0 8px 0; letter-spacing: -0.02em;">
                Practice Arena
              </h1>
              <p style="font-size: 1.05rem; color: var(--text-secondary); line-height: 1.6; margin: 0;">
                Test your mathematical comprehension with dynamic problem sets, instantaneous feedback, and rigorous step-by-step solutions.
              </p>
            </div>
            <div class="module-icon-badge" style="width: 68px; height: 68px; font-size: 2rem;">
              🎯
            </div>
          </div>
        </div>

        <!-- Real Local Statistics Grid -->
        <div class="practice-stats-grid">
          <div class="practice-stat-card">
            <div class="stat-card-label">Questions Attempted</div>
            <div class="stat-card-value" style="color: #38bdf8;">${stats.totalAttempted}</div>
            <div class="stat-card-desc">${stats.totalAttempted > 0 ? 'Logged from your device' : 'Start practicing to log activity'}</div>
          </div>

          <div class="practice-stat-card">
            <div class="stat-card-label">Correct Answers</div>
            <div class="stat-card-value" style="color: #10b981;">${stats.totalCorrect}</div>
            <div class="stat-card-desc">Accurately resolved problems</div>
          </div>

          <div class="practice-stat-card">
            <div class="stat-card-label">Accuracy Rate</div>
            <div class="stat-card-value" style="color: #fbbf24;">${stats.accuracy}%</div>
            <div class="stat-card-desc">${stats.totalAttempted > 0 ? 'Overall performance ratio' : 'No attempts recorded yet'}</div>
          </div>

          <div class="practice-stat-card">
            <div class="stat-card-label">Topics Practiced</div>
            <div class="stat-card-value" style="color: #c084fc;">${stats.topicsPracticedCount}</div>
            <div class="stat-card-desc">Curriculum areas explored</div>
          </div>
        </div>

        <!-- Session Setup Glass Panel -->
        <div class="glass-card" style="padding: 28px; margin-bottom: 24px;">
          <h2 style="font-size: 1.25rem; font-weight: 700; color: var(--text-white); margin: 0 0 16px 0;">
            1. Select Practice Mode
          </h2>

          <div class="practice-mode-tabs" role="tablist">
            <button class="practice-mode-tab ${this.selectedMode === 'quick' ? 'active' : ''}" data-mode="quick">
              <span>⚡</span> Quick Practice (5 Questions)
            </button>
            <button class="practice-mode-tab ${this.selectedMode === 'topic' ? 'active' : ''}" data-mode="topic">
              <span>📚</span> Topic Practice
            </button>
            <button class="practice-mode-tab ${this.selectedMode === 'mixed' ? 'active' : ''}" data-mode="mixed">
              <span>🔀</span> Mixed Practice (10 Questions)
            </button>
            <button class="practice-mode-tab ${this.selectedMode === 'exam' ? 'active' : ''}" data-mode="exam">
              <span>⏱</span> Exam Mode (Timed 15m)
            </button>
          </div>

          <!-- Controls Row -->
          <div class="practice-controls-row">
            <!-- Difficulty Selector -->
            <div class="filter-group">
              <span class="filter-group-label">Difficulty:</span>
              <button class="difficulty-pill ${this.selectedDifficulty === 'all' ? 'active' : ''}" data-diff="all">All</button>
              <button class="difficulty-pill diff-easy ${this.selectedDifficulty === 'easy' ? 'active' : ''}" data-diff="easy">Easy</button>
              <button class="difficulty-pill diff-medium ${this.selectedDifficulty === 'medium' ? 'active' : ''}" data-diff="medium">Medium</button>
              <button class="difficulty-pill diff-hard ${this.selectedDifficulty === 'hard' ? 'active' : ''}" data-diff="hard">Hard</button>
            </div>

            <!-- Topic Selector (Visible if Topic Practice) -->
            ${this.selectedMode === 'topic' ? `
              <div class="filter-group">
                <span class="filter-group-label">Topic:</span>
                <select id="topic-select-dropdown" class="calculus-input" style="padding: 6px 14px; font-size: 0.88rem; width: auto; cursor: pointer;">
                  ${PRACTICE_TOPICS.filter(t => t !== 'All Topics').map(t => `
                    <option value="${t}" ${this.selectedTopic === t ? 'selected' : ''}>${t}</option>
                  `).join('')}
                </select>
              </div>
            ` : ''}

            <!-- Start Button -->
            <div>
              <button id="btn-start-practice" class="glass-button glass-button-primary" style="padding: 10px 24px; font-size: 0.95rem;">
                <span>Start Practice Session ➔</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Real Topic Performance Breakdown & Activity -->
        ${stats.topicsPracticedCount > 0 ? `
          <div class="glass-card" style="padding: 24px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
              <h3 style="font-size: 1.1rem; color: var(--text-white); margin: 0;">Actual Performance by Topic</h3>
              <button id="btn-reset-stats" class="glass-button" style="padding: 4px 10px; font-size: 0.78rem; color: #f43f5e;" title="Reset local statistics">
                Reset Progress
              </button>
            </div>
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 14px;">
              ${Object.entries(stats.topicStats).filter(([_, d]) => d.attempted > 0).map(([t, data]) => {
                const acc = Math.round((data.correct / data.attempted) * 100);
                return `
                  <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.06); padding: 14px 18px; border-radius: var(--radius-md);">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                      <span style="font-weight: 600; color: var(--text-white); font-size: 0.9rem;">${t}</span>
                      <span style="font-weight: 700; color: ${acc >= 70 ? '#10b981' : acc >= 40 ? '#f59e0b' : '#f43f5e'}; font-family: var(--font-math);">${acc}%</span>
                    </div>
                    <div style="font-size: 0.8rem; color: var(--text-muted);">
                      ${data.correct} correct out of ${data.attempted} attempted
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        ` : ''}
      </div>
    `;
  }

  startSession() {
    let pool = [...QUESTION_BANK];

    // Filter by topic if topic practice mode
    if (this.selectedMode === 'topic' && this.selectedTopic !== 'All Topics') {
      pool = pool.filter(q => q.topic === this.selectedTopic);
    }

    // Filter by difficulty
    if (this.selectedDifficulty !== 'all') {
      pool = pool.filter(q => q.difficulty === this.selectedDifficulty);
    }

    if (pool.length === 0) {
      showToast('No questions found matching your filter criteria.', 'warning');
      return;
    }

    // Shuffle pool
    pool.sort(() => Math.random() - 0.5);

    // Limit count based on mode
    let count = 5;
    if (this.selectedMode === 'quick') count = 5;
    else if (this.selectedMode === 'topic') count = Math.min(8, pool.length);
    else if (this.selectedMode === 'mixed') count = Math.min(10, pool.length);
    else if (this.selectedMode === 'exam') count = Math.min(15, pool.length);

    this.sessionQuestions = pool.slice(0, count);
    this.currentIndex = 0;
    this.userAnswers = [];
    this.submittedCurrent = false;
    this.sessionActive = true;
    this.sessionFinished = false;

    // Start timer if Exam Mode (15 minutes)
    if (this.selectedMode === 'exam') {
      this.timeRemainingSeconds = 15 * 60;
      this.startTimer();
    } else {
      this.stopTimer();
    }

    this.render();
    this.attachEventListeners();
  }

  startTimer() {
    this.stopTimer();
    this.timerInterval = setInterval(() => {
      this.timeRemainingSeconds -= 1;
      const timerEl = document.getElementById('exam-countdown-timer');
      if (timerEl) {
        const mins = Math.floor(this.timeRemainingSeconds / 60);
        const secs = this.timeRemainingSeconds % 60;
        timerEl.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
      }
      if (this.timeRemainingSeconds <= 0) {
        this.stopTimer();
        showToast('Time expired! Auto-submitting session.', 'warning');
        this.finishSession();
      }
    }, 1000);
  }

  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  renderActiveSession() {
    const q = this.sessionQuestions[this.currentIndex];
    const total = this.sessionQuestions.length;
    const progressPct = Math.round(((this.currentIndex) / total) * 100);
    const mins = Math.floor(this.timeRemainingSeconds / 60);
    const secs = this.timeRemainingSeconds % 60;
    const timeFormatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

    this.container.innerHTML = `
      <div class="view-animate-in practice-container" style="max-width: 900px;">
        <!-- Quiz Session Container -->
        <div class="practice-quiz-card">
          <!-- Header Bar -->
          <div class="quiz-header-bar">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span class="badge" style="background: rgba(0, 242, 254, 0.15); color: var(--cyan-primary);">
                Question ${this.currentIndex + 1} of ${total}
              </span>
              <span class="badge badge-algebra">${q.topic}</span>
              <span class="badge" style="background: rgba(255, 255, 255, 0.05); color: var(--text-secondary); text-transform: capitalize;">
                ${q.difficulty}
              </span>
            </div>

            <div style="display: flex; align-items: center; gap: 12px;">
              ${this.selectedMode === 'exam' ? `
                <div class="quiz-timer-box">
                  <span>⏱</span>
                  <span id="exam-countdown-timer">${timeFormatted}</span>
                </div>
              ` : ''}
              <button id="btn-quit-session" class="glass-button" style="padding: 6px 12px; font-size: 0.8rem; color: #f43f5e;" title="Exit session">
                Quit
              </button>
            </div>
          </div>

          <!-- Progress Bar -->
          <div class="quiz-progress-wrap">
            <div class="quiz-progress-bar" style="width: ${progressPct}%;"></div>
          </div>

          <!-- Question Prompt -->
          <div class="quiz-prompt">${q.prompt}</div>

          <!-- Question Input / Choices -->
          <div id="quiz-options-container">
            ${this.renderQuestionInput(q)}
          </div>

          <!-- Action Buttons -->
          <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 20px;">
            ${!this.submittedCurrent ? `
              <button id="btn-submit-answer" class="glass-button glass-button-primary" style="padding: 12px 28px; font-size: 0.95rem;">
                Submit Answer
              </button>
            ` : `
              <button id="btn-next-question" class="glass-button glass-button-primary" style="padding: 12px 28px; font-size: 0.95rem;">
                ${this.currentIndex + 1 < total ? 'Next Question ➔' : 'Finish & View Results ➔'}
              </button>
            `}
          </div>

          <!-- Submission Feedback Target -->
          <div id="submission-feedback-target"></div>
        </div>
      </div>
    `;

    if (this.submittedCurrent) {
      this.renderFeedbackPanel(this.userAnswers[this.currentIndex]);
    }
  }

  renderQuestionInput(q) {
    if (q.type === 'mcq') {
      const letters = ['A', 'B', 'C', 'D'];
      return `
        <div class="mcq-options-grid">
          ${q.options.map((opt, i) => `
            <button
              class="mcq-option-btn ${this.submittedCurrent && i === q.correctAnswer ? 'correct-choice' : ''}"
              data-option-idx="${i}"
              ${this.submittedCurrent ? 'disabled' : ''}
            >
              <div class="mcq-letter-badge">${letters[i]}</div>
              <div style="font-family: var(--font-math); font-size: 1.05rem;">${opt}</div>
            </button>
          `).join('')}
        </div>
      `;
    }

    if (q.type === 'boolean') {
      return `
        <div class="boolean-toggle-grid">
          <button
            class="boolean-choice-btn ${this.submittedCurrent && q.correctAnswer === true ? 'correct-choice' : ''}"
            data-bool-val="true"
            ${this.submittedCurrent ? 'disabled' : ''}
          >
            <span>✔</span> True
          </button>
          <button
            class="boolean-choice-btn ${this.submittedCurrent && q.correctAnswer === false ? 'correct-choice' : ''}"
            data-bool-val="false"
            ${this.submittedCurrent ? 'disabled' : ''}
          >
            <span>✖</span> False
          </button>
        </div>
      `;
    }

    // Numerical or Expression
    return `
      <div class="quiz-input-form">
        <input
          type="text"
          id="quiz-text-answer"
          class="quiz-answer-input"
          placeholder="${q.type === 'numerical' ? 'Enter numerical answer (e.g. 42 or 3.14)' : 'Enter algebraic expression (e.g. 2x + 1)'}"
          ${this.submittedCurrent ? 'disabled' : ''}
          autocomplete="off"
        />
      </div>
    `;
  }

  submitCurrentAnswer() {
    if (this.submittedCurrent) return;

    const q = this.sessionQuestions[this.currentIndex];
    let userAnswer = null;
    let isCorrect = false;

    if (q.type === 'mcq') {
      const selectedBtn = this.container.querySelector('.mcq-option-btn.selected');
      if (!selectedBtn) {
        showToast('Please select an option before submitting.', 'warning');
        return;
      }
      userAnswer = parseInt(selectedBtn.getAttribute('data-option-idx'), 10);
      isCorrect = (userAnswer === q.correctAnswer);
    } else if (q.type === 'boolean') {
      const selectedBtn = this.container.querySelector('.boolean-choice-btn.selected');
      if (!selectedBtn) {
        showToast('Please select True or False before submitting.', 'warning');
        return;
      }
      userAnswer = selectedBtn.getAttribute('data-bool-val') === 'true';
      isCorrect = (userAnswer === q.correctAnswer);
    } else {
      const input = document.getElementById('quiz-text-answer');
      const val = (input?.value || '').trim();
      if (!val) {
        showToast('Please enter an answer before submitting.', 'warning');
        return;
      }
      userAnswer = val;

      if (q.type === 'numerical') {
        const numVal = parseFloat(val);
        const correctNum = parseFloat(q.correctAnswer);
        const acceptable = (q.acceptableAnswers || []).map(a => parseFloat(a));
        isCorrect = Math.abs(numVal - correctNum) < 1e-4 || acceptable.some(a => Math.abs(numVal - a) < 1e-4);
      } else {
        // Expression matching normalized
        const cleanUser = val.toLowerCase().replace(/\s+/g, '');
        const cleanTarget = String(q.correctAnswer).toLowerCase().replace(/\s+/g, '');
        const acceptableClean = (q.acceptableAnswers || []).map(a => a.toLowerCase().replace(/\s+/g, ''));
        isCorrect = (cleanUser === cleanTarget) || acceptableClean.includes(cleanUser);
      }
    }

    this.submittedCurrent = true;
    const answerRecord = { question: q, userAnswer, isCorrect };
    this.userAnswers.push(answerRecord);

    // Record in local storage actual statistics
    PracticeStatsManager.recordAttempt(q, isCorrect);

    this.render();
    this.attachEventListeners();
  }

  renderFeedbackPanel(record) {
    const target = document.getElementById('submission-feedback-target');
    if (!target) return;

    const q = record.question;
    const isCorrect = record.isCorrect;
    const correctDisplay = q.type === 'mcq'
      ? `${['A', 'B', 'C', 'D'][q.correctAnswer]}: ${q.options[q.correctAnswer]}`
      : String(q.correctAnswer);

    target.innerHTML = `
      <div class="submission-feedback-panel ${isCorrect ? 'correct' : 'incorrect'}">
        <div class="feedback-status-header">
          <div class="feedback-status-badge">
            <span>${isCorrect ? '✔' : '✖'}</span>
            <span>${isCorrect ? 'Correct!' : 'Incorrect'}</span>
          </div>
          <div style="font-size: 0.9rem; font-weight: 700; color: ${isCorrect ? '#10b981' : '#f43f5e'};">
            Correct Answer: <span style="font-family: var(--font-math);">${correctDisplay}</span>
          </div>
        </div>

        <div class="feedback-explanation">
          <strong>Explanation:</strong> ${q.explanation}
        </div>

        <div class="solution-steps-list">
          <div style="font-size: 0.82rem; font-weight: 700; color: var(--cyan-primary); text-transform: uppercase; margin-bottom: 6px;">
            Step-by-Step Derivation:
          </div>
          ${q.solutionSteps.map(step => `
            <div class="solution-step-item">${step}</div>
          `).join('')}
        </div>
      </div>
    `;
  }

  nextQuestion() {
    if (this.currentIndex + 1 < this.sessionQuestions.length) {
      this.currentIndex += 1;
      this.submittedCurrent = false;
      this.render();
      this.attachEventListeners();
    } else {
      this.finishSession();
    }
  }

  finishSession() {
    this.stopTimer();
    this.sessionActive = false;
    this.sessionFinished = true;
    this.render();
    this.attachEventListeners();
  }

  renderSessionResults() {
    const total = this.userAnswers.length;
    const correctCount = this.userAnswers.filter(a => a.isCorrect).length;
    const accuracy = total > 0 ? Math.round((correctCount / total) * 100) : 0;

    this.container.innerHTML = `
      <div class="view-animate-in practice-container" style="max-width: 900px;">
        <!-- Results Hero Card -->
        <div class="quiz-summary-card">
          <div class="quiz-score-circle">
            <span style="font-size: 2.2rem; font-weight: 800; color: var(--text-white); font-family: var(--font-math);">
              ${correctCount}/${total}
            </span>
            <span style="font-size: 0.8rem; color: var(--cyan-primary); font-weight: 700;">Score</span>
          </div>

          <h2 style="font-size: 1.8rem; font-weight: 800; color: var(--text-white); margin: 0 0 8px 0;">
            ${accuracy >= 80 ? 'Outstanding Performance! 🌟' : accuracy >= 50 ? 'Solid Effort! 👍' : 'Practice Makes Perfect! 📚'}
          </h2>
          <p style="color: var(--text-secondary); max-width: 500px; margin: 0 auto 24px auto;">
            You completed ${total} problems with an accuracy of <b style="color: ${accuracy >= 70 ? '#10b981' : '#fbbf24'};">${accuracy}%</b>.
            Your progress has been automatically updated in your local device statistics.
          </p>

          <div style="display: flex; justify-content: center; gap: 14px; flex-wrap: wrap;">
            <button id="btn-restart-session" class="glass-button glass-button-primary" style="padding: 12px 28px;">
              Start New Practice Session ➔
            </button>
            <button id="btn-back-dashboard" class="glass-button" style="padding: 12px 24px;">
              Return to Practice Dashboard
            </button>
          </div>
        </div>

        <!-- Question Review List -->
        <div class="glass-card" style="padding: 24px;">
          <h3 style="font-size: 1.2rem; font-weight: 700; color: var(--text-white); margin: 0 0 18px 0;">
            Question Review Breakdown
          </h3>
          <div style="display: flex; flex-direction: column; gap: 16px;">
            ${this.userAnswers.map((ans, idx) => {
              const q = ans.question;
              return `
                <div style="padding: 16px 20px; border-radius: var(--radius-md); background: rgba(255, 255, 255, 0.02); border-left: 4px solid ${ans.isCorrect ? '#10b981' : '#f43f5e'};">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                    <span style="font-size: 0.82rem; font-weight: 700; color: var(--text-muted);">
                      Question ${idx + 1} • ${q.topic}
                    </span>
                    <span class="badge" style="background: ${ans.isCorrect ? 'rgba(16, 185, 129, 0.2)' : 'rgba(244, 63, 94, 0.2)'}; color: ${ans.isCorrect ? '#34d399' : '#fda4af'};">
                      ${ans.isCorrect ? 'Correct' : 'Incorrect'}
                    </span>
                  </div>
                  <div style="font-family: var(--font-math); font-size: 1rem; color: var(--text-white); margin-bottom: 8px;">
                    ${q.prompt}
                  </div>
                  <div style="font-size: 0.85rem; color: var(--text-secondary);">
                    <strong>Solution:</strong> ${q.explanation}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>
    `;
  }

  attachEventListeners() {
    this.container.addEventListener('click', (e) => {
      // Mode switch
      const modeBtn = e.target.closest('[data-mode]');
      if (modeBtn) {
        this.selectedMode = modeBtn.getAttribute('data-mode');
        this.render();
        this.attachEventListeners();
        return;
      }

      // Difficulty switch
      const diffBtn = e.target.closest('[data-diff]');
      if (diffBtn) {
        this.selectedDifficulty = diffBtn.getAttribute('data-diff');
        this.render();
        this.attachEventListeners();
        return;
      }

      // Start Practice
      if (e.target.closest('#btn-start-practice')) {
        this.startSession();
        return;
      }

      // Quit session
      if (e.target.closest('#btn-quit-session')) {
        if (confirm('Are you sure you want to exit this practice session?')) {
          this.stopTimer();
          this.sessionActive = false;
          this.render();
          this.attachEventListeners();
        }
        return;
      }

      // MCQ option selection
      const mcqBtn = e.target.closest('.mcq-option-btn:not([disabled])');
      if (mcqBtn) {
        this.container.querySelectorAll('.mcq-option-btn').forEach(btn => btn.classList.remove('selected'));
        mcqBtn.classList.add('selected');
        return;
      }

      // Boolean option selection
      const boolBtn = e.target.closest('.boolean-choice-btn:not([disabled])');
      if (boolBtn) {
        this.container.querySelectorAll('.boolean-choice-btn').forEach(btn => btn.classList.remove('selected'));
        boolBtn.classList.add('selected');
        return;
      }

      // Submit Answer
      if (e.target.closest('#btn-submit-answer')) {
        this.submitCurrentAnswer();
        return;
      }

      // Next Question
      if (e.target.closest('#btn-next-question')) {
        this.nextQuestion();
        return;
      }

      // Reset Stats
      if (e.target.closest('#btn-reset-stats')) {
        if (confirm('Reset your genuine local practice statistics?')) {
          PracticeStatsManager.resetStats();
          showToast('Practice stats reset to zero.', 'info');
          this.render();
          this.attachEventListeners();
        }
        return;
      }

      // Restart Session from summary
      if (e.target.closest('#btn-restart-session')) {
        this.startSession();
        return;
      }

      // Back to dashboard
      if (e.target.closest('#btn-back-dashboard')) {
        this.sessionFinished = false;
        this.sessionActive = false;
        this.render();
        this.attachEventListeners();
        return;
      }
    });

    // Topic dropdown
    this.container.addEventListener('change', (e) => {
      if (e.target.id === 'topic-select-dropdown') {
        this.selectedTopic = e.target.value;
      }
    });

    // Enter key in numerical/expression answer
    this.container.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && e.target.id === 'quiz-text-answer') {
        this.submitCurrentAnswer();
      }
    });
  }
}
