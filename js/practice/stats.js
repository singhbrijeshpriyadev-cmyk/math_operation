/**
 * OG - Practice Statistics Manager
 * Strictly tracks real local user activity:
 * - Questions attempted
 * - Correct answers
 * - Accuracy percentage
 * - Topics practiced & topic-specific performance breakdown
 * - Daily practice streaks
 *
 * Persisted in localStorage ('og_practice_stats'). No fake numbers.
 * ES6 Module
 */

const STORAGE_KEY = 'og_practice_stats';
let _memCache = null;

export class PracticeStatsManager {
  static getRawData() {
    try {
      if (typeof localStorage !== 'undefined') {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          return JSON.parse(raw);
        }
      }
    } catch (err) {
      console.warn('Could not read practice statistics from localStorage:', err);
    }

    if (_memCache) return _memCache;

    return {
      totalAttempted: 0,
      totalCorrect: 0,
      streakDays: 0,
      lastPracticedDate: null,
      topicStats: {},
      history: []
    };
  }

  static saveData(data) {
    _memCache = data;
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      }
    } catch (err) {
      console.warn('Could not write practice statistics to localStorage:', err);
    }
  }

  /**
   * Records a single question attempt
   */
  static recordAttempt(question, isCorrect) {
    const data = this.getRawData();
    const today = new Date().toISOString().split('T')[0];

    data.totalAttempted = (data.totalAttempted || 0) + 1;
    if (isCorrect) {
      data.totalCorrect = (data.totalCorrect || 0) + 1;
    }

    // Update Topic-specific stats
    const topic = question.topic || 'General';
    if (!data.topicStats[topic]) {
      data.topicStats[topic] = { attempted: 0, correct: 0 };
    }
    data.topicStats[topic].attempted += 1;
    if (isCorrect) {
      data.topicStats[topic].correct += 1;
    }

    // Update Streak calculation
    if (!data.lastPracticedDate) {
      data.streakDays = 1;
      data.lastPracticedDate = today;
    } else if (data.lastPracticedDate !== today) {
      const last = new Date(data.lastPracticedDate);
      const curr = new Date(today);
      const diffDays = Math.round((curr - last) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        data.streakDays = (data.streakDays || 1) + 1;
      } else if (diffDays > 1) {
        data.streakDays = 1;
      }
      data.lastPracticedDate = today;
    }

    // Keep log of last 50 attempts
    if (!Array.isArray(data.history)) data.history = [];
    data.history.unshift({
      id: question.id,
      topic: question.topic,
      difficulty: question.difficulty,
      isCorrect,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
    if (data.history.length > 50) {
      data.history.pop();
    }

    this.saveData(data);
    return this.getSummary();
  }

  /**
   * Retrieves clean summary of current genuine progress
   */
  static getSummary() {
    const data = this.getRawData();
    const totalAttempted = data.totalAttempted || 0;
    const totalCorrect = data.totalCorrect || 0;
    const accuracy = totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0;

    const practicedTopics = Object.keys(data.topicStats || {}).filter(
      t => (data.topicStats[t]?.attempted || 0) > 0
    );

    return {
      totalAttempted,
      totalCorrect,
      accuracy,
      streakDays: data.streakDays || 0,
      topicsPracticedCount: practicedTopics.length,
      practicedTopics,
      topicStats: data.topicStats || {},
      recentHistory: data.history || []
    };
  }

  /**
   * Clears genuine activity stats if the user requests a fresh start
   */
  static resetStats() {
    this.saveData({
      totalAttempted: 0,
      totalCorrect: 0,
      streakDays: 0,
      lastPracticedDate: null,
      topicStats: {},
      history: []
    });
  }
}
