// ============================================
// ENHANCED AI PRODUCTIVITY APP
// Features: Smart Automation, Predictive AI, Performance Optimized
// ============================================

// ============================================
// DATA MANAGEMENT & PERSISTENCE
// ============================================

class DataManager {
  constructor() {
    this.storageKey = 'boostlyAIData';
    this.data = this.loadData();
    this.supabase = null;
    this.cloudSyncEnabled = false;
    this.lastCloudSync = null;
  }

  loadData() {
    const stored = localStorage.getItem(this.storageKey);
    return stored ? JSON.parse(stored) : this.getDefaultData();
  }

  getDefaultData() {
    return {
      points: 0,
      pointsToday: 0,
      streak: 0,
      level: 1,
      exp: 0,
      tasks: [],
      productivity: [0, 0, 0, 0, 0, 0, 0],
      focusScore: 0,
      completedToday: 0,
      totalFocusTime: 0,
      lastActive: new Date().toDateString(),
      preferences: {
        defaultTimer: 25,
        soundEnabled: true,
        aiInsightsEnabled: true,
        cloudSyncEnabled: false
      },
      history: {
        tasks: [],
        sessions: []
      }
    };
  }

  save() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.data));

    // Auto-sync to cloud if enabled
    if (this.cloudSyncEnabled && this.supabase) {
      this.syncToCloud();
    }
  }

  updateDailyStats() {
    const today = new Date().toDateString();
    if (this.data.lastActive !== today) {
      this.data.pointsToday = 0;
      this.data.completedToday = 0;
      this.data.lastActive = today;
      this.save();
    }
  }

  // ============================================
  // CLOUD SYNC METHODS
  // ============================================

  async initCloudSync(supabaseManager) {
    try {
      this.supabase = supabaseManager;

      // Try to load data from cloud
      const cloudResult = await this.supabase.syncFromCloud();

      if (cloudResult.success && cloudResult.data) {
        // Merge cloud data with local data
        const mergedData = await this.supabase.mergeData(this.data, cloudResult.data);
        this.data = mergedData;
        this.save();
        console.log('✅ Cloud sync initialized - data merged');
      } else if (cloudResult.firstSync) {
        // First sync - upload local data to cloud
        await this.supabase.syncToCloud(this.data);
        console.log('✅ First cloud sync - local data uploaded');
      }

      this.cloudSyncEnabled = true;
      this.data.preferences.cloudSyncEnabled = true;
      this.lastCloudSync = new Date();

      return true;
    } catch (error) {
      console.error('❌ Cloud sync initialization failed:', error);
      this.cloudSyncEnabled = false;
      return false;
    }
  }

  async syncToCloud() {
    if (!this.cloudSyncEnabled || !this.supabase) return;

    try {
      const result = await this.supabase.syncToCloud(this.data);
      if (result.success) {
        this.lastCloudSync = new Date();
      }
      return result;
    } catch (error) {
      console.error('❌ Cloud sync failed:', error);
      return { success: false, error: error.message };
    }
  }

  async syncFromCloud() {
    if (!this.cloudSyncEnabled || !this.supabase) return;

    try {
      const result = await this.supabase.syncFromCloud();
      if (result.success && result.data) {
        this.data = result.data;
        this.save();
        this.lastCloudSync = new Date();
      }
      return result;
    } catch (error) {
      console.error('❌ Cloud sync failed:', error);
      return { success: false, error: error.message };
    }
  }

  toggleCloudSync(enable) {
    this.cloudSyncEnabled = enable;
    this.data.preferences.cloudSyncEnabled = enable;
    this.save();
  }
}

// ============================================
// AI ENGINE - PREDICTIVE & SMART FEATURES
// ============================================

class AIEngine {
  constructor(dataManager) {
    this.dm = dataManager;
  }

  // Categorize tasks using keyword matching
  categorizeTask(taskText) {
    const categories = {
      work: ['meeting', 'email', 'report', 'presentation', 'call', 'project', 'deadline'],
      personal: ['gym', 'exercise', 'shopping', 'family', 'friend', 'health', 'appointment'],
      learning: ['study', 'learn', 'read', 'course', 'tutorial', 'practice', 'research'],
      creative: ['design', 'write', 'create', 'draw', 'video', 'content', 'blog']
    };

    const lowerText = taskText.toLowerCase();
    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => lowerText.includes(keyword))) {
        return category;
      }
    }
    return 'general';
  }

  // Predict task priority based on keywords and patterns
  predictPriority(taskText) {
    const highPriorityKeywords = ['urgent', 'asap', 'important', 'critical', 'deadline', 'today'];
    const mediumPriorityKeywords = ['soon', 'this week', 'tomorrow', 'follow up'];

    const lowerText = taskText.toLowerCase();

    if (highPriorityKeywords.some(keyword => lowerText.includes(keyword))) {
      return 'high';
    }
    if (mediumPriorityKeywords.some(keyword => lowerText.includes(keyword))) {
      return 'medium';
    }
    return 'low';
  }

  // Generate productivity insights
  generateInsights() {
    const data = this.dm.data;
    const insights = [];

    // Productivity trend
    const avgProductivity = data.productivity.reduce((a, b) => a + b, 0) / 7;
    const todayIndex = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;
    const todayScore = data.productivity[todayIndex];

    if (todayScore > avgProductivity) {
      insights.push({
        icon: '📊',
        text: `You're ${Math.round((todayScore / avgProductivity - 1) * 100)}% more productive than your weekly average!`
      });
    } else if (avgProductivity > 0) {
      insights.push({
        icon: '📊',
        text: `Your average productivity score is ${avgProductivity.toFixed(1)}. Keep building momentum!`
      });
    } else {
      insights.push({
        icon: '📊',
        text: 'Start completing tasks to build your productivity score!'
      });
    }

    // Focus time recommendation
    const completionRate = data.tasks.length > 0
      ? (data.tasks.filter(t => t.done).length / data.tasks.length * 100).toFixed(0)
      : 0;

    if (completionRate > 70) {
      insights.push({
        icon: '🎯',
        text: `Excellent ${completionRate}% completion rate! Consider tackling more challenging tasks.`
      });
    } else if (completionRate > 40) {
      insights.push({
        icon: '🎯',
        text: `${completionRate}% completion rate. Try breaking larger tasks into smaller ones.`
      });
    } else {
      insights.push({
        icon: '🎯',
        text: 'Focus on completing your highest priority tasks first for better momentum.'
      });
    }

    // Streak motivation
    if (data.streak >= 7) {
      insights.push({
        icon: '⚡',
        text: `Amazing ${data.streak}-day streak! You're in the top 5% of users.`
      });
    } else if (data.streak >= 3) {
      insights.push({
        icon: '⚡',
        text: `${data.streak}-day streak! Keep going to reach the 7-day milestone.`
      });
    } else {
      insights.push({
        icon: '⚡',
        text: 'Complete tasks daily to build a powerful productivity streak!'
      });
    }

    return insights;
  }

  // Predict tomorrow's productivity
  predictTomorrow() {
    const data = this.dm.data;
    const recentScores = data.productivity.slice(-3);
    const trend = recentScores.reduce((a, b) => a + b, 0) / recentScores.length;

    if (trend > 5) return `High (${(trend * 1.1).toFixed(0)})`;
    if (trend > 2) return `Medium (${(trend * 1.05).toFixed(0)})`;
    return 'Building...';
  }

  // Get peak performance day
  getPeakDay() {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const maxScore = Math.max(...this.dm.data.productivity);
    const peakIndex = this.dm.data.productivity.indexOf(maxScore);
    return maxScore > 0 ? days[peakIndex] : 'Not enough data';
  }

  // Calculate focus score
  calculateFocusScore() {
    const data = this.dm.data;
    const completionRate = data.tasks.length > 0
      ? data.tasks.filter(t => t.done).length / data.tasks.length
      : 0;
    const streakBonus = Math.min(data.streak * 5, 30);
    const levelBonus = data.level * 10;

    return Math.round((completionRate * 50) + streakBonus + levelBonus);
  }

  // Smart timer suggestion
  suggestTimerDuration() {
    const data = this.dm.data;
    const pendingTasks = data.tasks.filter(t => !t.done).length;

    if (pendingTasks === 0) {
      return { duration: 25, reason: 'Perfect time for learning or planning' };
    }
    if (pendingTasks > 5) {
      return { duration: 45, reason: 'You have many tasks - longer session recommended' };
    }
    if (data.focusScore > 70) {
      return { duration: 60, reason: 'Your focus is strong - maximize it!' };
    }
    return { duration: 25, reason: 'Classic Pomodoro for optimal focus' };
  }
}

// ============================================
// PARTICLE BACKGROUND ANIMATION
// ============================================

class ParticleBackground {
  constructor() {
    this.canvas = document.getElementById('particles');
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.particleCount = 50;

    this.resize();
    this.init();
    this.animate();

    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  init() {
    this.particles = [];
    for (let i = 0; i < this.particleCount; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: Math.random() * 2 + 1,
        opacity: Math.random() * 0.5 + 0.2
      });
    }
  }

  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.particles.forEach(particle => {
      particle.x += particle.vx;
      particle.y += particle.vy;

      if (particle.x < 0 || particle.x > this.canvas.width) particle.vx *= -1;
      if (particle.y < 0 || particle.y > this.canvas.height) particle.vy *= -1;

      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(0, 245, 255, ${particle.opacity})`;
      this.ctx.fill();
    });

    // Draw connections
    this.particles.forEach((p1, i) => {
      this.particles.slice(i + 1).forEach(p2 => {
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 150) {
          this.ctx.beginPath();
          this.ctx.moveTo(p1.x, p1.y);
          this.ctx.lineTo(p2.x, p2.y);
          this.ctx.strokeStyle = `rgba(0, 245, 255, ${0.1 * (1 - distance / 150)})`;
          this.ctx.lineWidth = 1;
          this.ctx.stroke();
        }
      });
    });

    requestAnimationFrame(() => this.animate());
  }
}

// ============================================
// GAMIFICATION SYSTEM
// ============================================

const expToLevelUp = 100;
const motivationalQuotes = [
  "🚀 Excellent work! You're unstoppable!",
  "💡 Brilliant! Your productivity is inspiring!",
  "🔥 On fire! Keep this momentum going!",
  "🌟 Outstanding! You're crushing your goals!",
  "💪 Fantastic! Your dedication is paying off!",
  "⚡ Incredible! You're in the zone!",
  "🎯 Perfect! You're hitting all your targets!",
  "✨ Amazing! Your focus is unmatched!"
];

function updateStats() {
  const data = dm.data;

  document.getElementById('points').textContent = data.points;
  document.getElementById('pointsTrend').textContent = `+${data.pointsToday} today`;
  document.getElementById('streak').textContent = data.streak;
  document.getElementById('level').textContent = data.level;

  const expPercentage = (data.exp / expToLevelUp) * 100;
  document.getElementById('progressFill').style.width = expPercentage + '%';
  document.getElementById('expText').textContent = `${data.exp}/${expToLevelUp} XP`;

  // Update focus score
  const focusScore = ai.calculateFocusScore();
  data.focusScore = focusScore;
  document.getElementById('focusScore').textContent = focusScore;

  updateBadges();
  dm.save();
}

function updateBadges() {
  const data = dm.data;
  const badgesDiv = document.getElementById('badges');
  badgesDiv.innerHTML = '';

  const badges = [];

  if (data.streak >= 3) badges.push({ icon: '🔥', text: `${data.streak}-Day Streak` });
  if (data.points >= 500) badges.push({ icon: '💎', text: 'Diamond Achiever' });
  if (data.points >= 200) badges.push({ icon: '⭐', text: 'Rising Star' });
  if (data.level >= 5) badges.push({ icon: '👑', text: 'Elite Level' });
  if (data.level >= 2) badges.push({ icon: '🏆', text: 'Level Master' });
  if (data.completedToday >= 5) badges.push({ icon: '⚡', text: 'Productivity Beast' });
  if (data.focusScore >= 80) badges.push({ icon: '🎯', text: 'Focus Champion' });

  badges.forEach(badge => {
    const badgeEl = document.createElement('span');
    badgeEl.className = 'badge';
    badgeEl.innerHTML = `${badge.icon} ${badge.text}`;
    badgesDiv.appendChild(badgeEl);
  });
}

function addPoints(amount) {
  dm.data.points += amount;
  dm.data.pointsToday += amount;
  dm.data.exp += amount;

  if (dm.data.exp >= expToLevelUp) {
    dm.data.exp -= expToLevelUp;
    dm.data.level++;
    playSound('levelup');
    showNotification('🎉 Level Up!', `You reached Level ${dm.data.level}!`, 'success');
  }

  updateStats();
  updateChart();
}

// ============================================
// SMART TASK MANAGER
// ============================================

function renderTasks(filter = 'all') {
  const taskList = document.getElementById('taskList');
  taskList.innerHTML = '';

  let tasks = dm.data.tasks;

  // Apply filters
  if (filter === 'high') {
    tasks = tasks.filter(t => t.priority === 'high');
  } else if (filter === 'pending') {
    tasks = tasks.filter(t => !t.done);
  } else if (filter === 'done') {
    tasks = tasks.filter(t => t.done);
  }

  if (tasks.length === 0) {
    taskList.innerHTML = '<div style="text-align: center; padding: 2rem; color: rgba(255,255,255,0.5);">No tasks found. Add one to get started!</div>';
    updateTaskStats();
    return;
  }

  tasks.forEach((task, originalIndex) => {
    const taskIndex = dm.data.tasks.indexOf(task);
    const taskDiv = document.createElement('div');
    taskDiv.className = `task ${task.done ? 'done' : ''}`;

    taskDiv.innerHTML = `
      <div class="task-content">
        <div class="task-priority ${task.priority}"></div>
        <div class="task-text">${escapeHtml(task.text)}</div>
        <span class="task-category">${task.category}</span>
      </div>
      <div class="task-actions">
        <button class="task-btn done-btn" onclick="toggleTask(${taskIndex})" aria-label="${task.done ? 'Undo task' : 'Complete task'}">
          ${task.done ? 'Undo' : 'Done'}
        </button>
        <button class="task-btn delete-btn" onclick="deleteTask(${taskIndex})" aria-label="Delete task">
          Delete
        </button>
      </div>
    `;

    taskList.appendChild(taskDiv);
  });

  updateTaskStats();
  dm.save();
}

function addTask() {
  const taskInput = document.getElementById('taskInput');
  const text = taskInput.value.trim();

  if (!text) {
    showNotification('⚠️ Empty Task', 'Please enter a task description', 'warning');
    return;
  }

  const category = ai.categorizeTask(text);
  const priority = ai.predictPriority(text);

  dm.data.tasks.push({
    text,
    done: false,
    category,
    priority,
    createdAt: Date.now()
  });

  taskInput.value = '';
  renderTasks();

  showNotification('✅ Task Added', `Categorized as "${category}" with ${priority} priority`, 'success');
  playSound('complete');
}

function toggleTask(index) {
  const task = dm.data.tasks[index];
  task.done = !task.done;

  if (task.done) {
    const points = task.priority === 'high' ? 30 : task.priority === 'medium' ? 20 : 15;
    addPoints(points);
    dm.data.completedToday++;

    const quote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
    showNotification('🎉 Task Completed!', quote, 'success');
    playSound('complete');

    // Add to history
    dm.data.history.tasks.push({
      ...task,
      completedAt: Date.now()
    });
  } else {
    const points = task.priority === 'high' ? 30 : task.priority === 'medium' ? 20 : 15;
    dm.data.points = Math.max(0, dm.data.points - points);
    dm.data.completedToday = Math.max(0, dm.data.completedToday - 1);
  }

  renderTasks();
  updateStats();
}

function deleteTask(index) {
  dm.data.tasks.splice(index, 1);
  playSound('delete');
  renderTasks();
  showNotification('🗑️ Task Deleted', 'Task removed from your list', 'info');
}

function updateTaskStats() {
  const total = dm.data.tasks.length;
  const completed = dm.data.tasks.filter(t => t.done).length;
  const completedToday = dm.data.completedToday;

  document.getElementById('taskStats').textContent =
    `${total} tasks • ${completedToday} completed today`;
}

// Task filter buttons
document.addEventListener('DOMContentLoaded', () => {
  const filterBtns = document.querySelectorAll('.filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderTasks(btn.dataset.filter);
    });
  });
});

// ============================================
// ADAPTIVE FOCUS TIMER
// ============================================

let timerInterval = null;
let timeLeft = 25 * 60;
let totalTime = 25 * 60;
let isRunning = false;

function updateTimerDisplay() {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  document.getElementById('timer').textContent =
    `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  // Update ring progress
  const progress = 1 - (timeLeft / totalTime);
  const circumference = 2 * Math.PI * 90;
  const offset = circumference * progress;

  const ring = document.getElementById('timerRing');
  if (ring) {
    ring.style.strokeDashoffset = offset;
  }

  // Update phase text
  const phase = document.getElementById('timerPhase');
  if (isRunning) {
    if (timeLeft > totalTime * 0.75) {
      phase.textContent = 'Getting into flow...';
    } else if (timeLeft > totalTime * 0.25) {
      phase.textContent = 'Deep focus mode';
    } else {
      phase.textContent = 'Final push!';
    }
  } else {
    phase.textContent = 'Ready to focus';
  }
}

function startTimer() {
  if (isRunning) return;

  isRunning = true;
  clearInterval(timerInterval);

  timerInterval = setInterval(() => {
    if (timeLeft > 0) {
      timeLeft--;
      updateTimerDisplay();

      // Tick sound every minute
      if (timeLeft % 60 === 0 && timeLeft > 0) {
        playSound('tick');
      }
    } else {
      clearInterval(timerInterval);
      isRunning = false;

      // Session complete
      const sessionPoints = Math.floor(totalTime / 60) * 2;
      addPoints(sessionPoints);
      dm.data.totalFocusTime += totalTime;

      // Record session
      dm.data.history.sessions.push({
        duration: totalTime,
        completedAt: Date.now()
      });

      showNotification('⏰ Session Complete!', `+${sessionPoints} points! Great focus!`, 'success');
      playSound('levelup');

      timeLeft = totalTime;
      updateTimerDisplay();
      updateTimerSuggestion();
    }
  }, 1000);

  showNotification('⏳ Timer Started', 'Focus mode activated!', 'info');
}

function pauseTimer() {
  clearInterval(timerInterval);
  isRunning = false;
  updateTimerDisplay();
  showNotification('⏸️ Timer Paused', 'Take a breath, resume when ready', 'info');
}

function resetTimer() {
  clearInterval(timerInterval);
  isRunning = false;
  timeLeft = totalTime;
  updateTimerDisplay();
  showNotification('🔄 Timer Reset', 'Ready for a fresh start', 'info');
}

function setTimerPreset(minutes) {
  if (isRunning) {
    showNotification('⚠️ Timer Running', 'Pause the timer before changing duration', 'warning');
    return;
  }

  totalTime = minutes * 60;
  timeLeft = totalTime;
  updateTimerDisplay();

  // Update active preset button
  document.querySelectorAll('.preset-btn').forEach(btn => {
    btn.classList.remove('active');
    if (parseInt(btn.textContent) === minutes) {
      btn.classList.add('active');
    }
  });

  showNotification('⏱️ Timer Set', `${minutes} minute session ready`, 'info');
}

function updateTimerSuggestion() {
  const suggestion = ai.suggestTimerDuration();
  document.getElementById('timerSuggestion').textContent =
    `💡 AI suggests: ${suggestion.duration}min - ${suggestion.reason}`;
}

// Add SVG gradient for timer ring
document.addEventListener('DOMContentLoaded', () => {
  const svg = document.querySelector('.timer-ring');
  if (svg) {
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
    gradient.setAttribute('id', 'timerGradient');
    gradient.innerHTML = `
      <stop offset="0%" stop-color="#00f5ff" />
      <stop offset="50%" stop-color="#00ff87" />
      <stop offset="100%" stop-color="#ff00f5" />
    `;
    defs.appendChild(gradient);
    svg.appendChild(defs);
  }
});

// ============================================
// PRODUCTIVITY ANALYTICS
// ============================================

let productivityChart = null;

function initChart() {
  const ctx = document.getElementById('productivityChart').getContext('2d');

  const gradient = ctx.createLinearGradient(0, 0, 0, 300);
  gradient.addColorStop(0, 'rgba(0, 245, 255, 0.5)');
  gradient.addColorStop(0.5, 'rgba(0, 255, 135, 0.3)');
  gradient.addColorStop(1, 'rgba(255, 0, 245, 0.1)');

  productivityChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [{
        label: 'Productivity Score',
        data: dm.data.productivity,
        borderColor: '#00f5ff',
        backgroundColor: gradient,
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointRadius: 6,
        pointBackgroundColor: '#00f5ff',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointHoverRadius: 8
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          titleColor: '#00f5ff',
          bodyColor: '#fff',
          borderColor: '#00f5ff',
          borderWidth: 1,
          padding: 12,
          displayColors: false
        }
      },
      scales: {
        x: {
          grid: {
            color: 'rgba(255, 255, 255, 0.1)',
            drawBorder: false
          },
          ticks: {
            color: 'rgba(255, 255, 255, 0.7)',
            font: {
              size: 12,
              weight: '500'
            }
          }
        },
        y: {
          beginAtZero: true,
          grid: {
            color: 'rgba(255, 255, 255, 0.1)',
            drawBorder: false
          },
          ticks: {
            color: 'rgba(255, 255, 255, 0.7)',
            font: {
              size: 12,
              weight: '500'
            }
          }
        }
      }
    }
  });

  updateChartInsights();
}

function updateChart() {
  const today = new Date().getDay();
  const index = today === 0 ? 6 : today - 1;
  dm.data.productivity[index] += 1;

  if (productivityChart) {
    productivityChart.data.datasets[0].data = dm.data.productivity;
    productivityChart.update('none'); // Performance: no animation on update
  }

  updateChartInsights();
  dm.save();
}

// function updateChartInsights() {
//   // Legacy function replaced by Coach System
// }

// ============================================
// AI INSIGHTS
// ============================================

// function refreshInsights() {
//   // Legacy function replaced by Coach System
// }
// insights.forEach((insight, index) => {
//   setTimeout(() => {
//     const insightDiv = document.createElement('div');
//     insightDiv.className = 'insight-item fade-in';
//     // ...
//     insightsContent.appendChild(insightDiv);
//   }, index * 150);
// });
// showNotification('🧠 Insights Updated', 'AI analysis complete', 'info');


// ============================================
// NOTIFICATIONS & FEEDBACK
// ============================================

function showNotification(title, message, type = 'info') {
  // Create notification element
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: rgba(0, 0, 0, 0.9);
    backdrop-filter: blur(20px);
    border: 1px solid ${type === 'success' ? '#00ff87' : type === 'warning' ? '#ffaa00' : '#00f5ff'};
    border-radius: 16px;
    padding: 16px 24px;
    color: white;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
    z-index: 10000;
    animation: slideIn 0.3s ease-out;
    max-width: 350px;
  `;

  notification.innerHTML = `
    <div style="font-weight: 700; margin-bottom: 4px; color: ${type === 'success' ? '#00ff87' : type === 'warning' ? '#ffaa00' : '#00f5ff'}">
      ${title}
    </div>
    <div style="font-size: 0.875rem; color: rgba(255, 255, 255, 0.8)">
      ${message}
    </div>
  `;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease-out';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

function playSound(type) {
  if (!dm.data.preferences.soundEnabled) return;

  const soundMap = {
    complete: 'sound-complete',
    levelup: 'sound-levelup',
    delete: 'sound-delete',
    tick: 'sound-tick'
  };

  const audio = document.getElementById(soundMap[type]);
  if (audio) {
    audio.currentTime = 0;
    audio.play().catch(() => { }); // Ignore autoplay restrictions
  }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ============================================
// INITIALIZATION
// ============================================

let dm, ai, particles, supabaseManager;

document.addEventListener('DOMContentLoaded', async () => {
  // Initialize systems
  dm = new DataManager();
  ai = new AIEngine(dm);
  particles = new ParticleBackground();

  // Update daily stats
  dm.updateDailyStats();

  // Initialize UI
  updateStats();
  renderTasks();
  updateTimerDisplay();
  initChart();
  refreshInsights();
  updateTimerSuggestion();

  // Initialize cloud sync (optional)
  await initializeCloudSync();

  // Initialize Productivity Coach
  if (typeof initializeCoach === 'function') {
    initializeCoach();
  }

  // Initialize Solo-Leveling Player System
  if (typeof initializePlayerSystem === 'function') {
    initializePlayerSystem();
  }

  // Add keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.target.id === 'taskInput') {
      addTask();
    }
  });

  // Auto-save every 30 seconds
  setInterval(() => dm.save(), 30000);

  console.log('🚀 Boostly AI initialized successfully!');
});

// ============================================
// CLOUD SYNC INITIALIZATION
// ============================================

async function initializeCloudSync() {
  try {
    // Check if Supabase config is available
    if (typeof SupabaseManager === 'undefined' || typeof SUPABASE_CONFIG === 'undefined') {
      console.log('📱 Cloud sync not configured - using localStorage only');
      return;
    }

    // Check if user wants cloud sync (can be toggled in settings)
    const cloudSyncPreference = dm.data.preferences.cloudSyncEnabled;

    if (!cloudSyncPreference && dm.data.preferences.cloudSyncEnabled !== undefined) {
      console.log('📱 Cloud sync disabled by user preference');
      return;
    }

    // Initialize Supabase
    supabaseManager = new SupabaseManager();
    const initialized = await supabaseManager.init(
      SUPABASE_CONFIG.url,
      SUPABASE_CONFIG.anonKey
    );

    if (initialized) {
      // Connect to DataManager
      const syncSuccess = await dm.initCloudSync(supabaseManager);

      if (syncSuccess) {
        showNotification(
          '☁️ Cloud Sync Active',
          'Your data is now synced across devices!',
          'success'
        );

        // Refresh UI with synced data
        updateStats();
        renderTasks();
        updateChart();
        // refreshInsights(); // LEGACY
      }
    }
  } catch (error) {
    console.warn('⚠️ Cloud sync initialization failed:', error.message);
    console.log('📱 Continuing with localStorage only');
  }
}

// Manual sync functions (can be called from UI)
async function manualSyncToCloud() {
  if (!dm.cloudSyncEnabled) {
    showNotification('⚠️ Cloud Sync Disabled', 'Enable cloud sync in settings first', 'warning');
    return;
  }

  const result = await dm.syncToCloud();
  if (result && result.success) {
    showNotification('☁️ Synced', 'Data uploaded to cloud', 'success');
  } else {
    showNotification('❌ Sync Failed', 'Could not upload to cloud', 'warning');
  }
}

async function manualSyncFromCloud() {
  if (!dm.cloudSyncEnabled) {
    showNotification('⚠️ Cloud Sync Disabled', 'Enable cloud sync in settings first', 'warning');
    return;
  }

  const result = await dm.syncFromCloud();
  if (result && result.success) {
    showNotification('☁️ Synced', 'Data downloaded from cloud', 'success');
    // Refresh UI
    updateStats();
    renderTasks();
    updateChart();
    // refreshInsights(); // Legacy
  } else {
    showNotification('❌ Sync Failed', 'Could not download from cloud', 'warning');
  }
}


// Add slideOut animation
const style = document.createElement('style');
style.textContent = `
  @keyframes slideOut {
    from {
      opacity: 1;
      transform: translateX(0);
    }
    to {
      opacity: 0;
      transform: translateX(100px);
    }
  }
`;
document.head.appendChild(style);
