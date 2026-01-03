// ============================================
// PRODUCTIVITY COACH UI INTEGRATION
// Connects ProductivityCoach to the app UI
// ============================================

let coach;

// ============================================
// INITIALIZATION
// ============================================

function initializeCoach() {
    if (typeof ProductivityCoach === 'undefined') {
        console.warn('⚠️ ProductivityCoach not loaded');
        return;
    }

    coach = new ProductivityCoach(dm);
    refreshCoachFeedback();
    console.log('🎯 Productivity Coach initialized');
}

// ============================================
// COACH FEEDBACK REFRESH
// ============================================

function refreshCoachFeedback() {
    if (!coach) return;

    const analysis = coach.analyzeProductivity();
    updateCoachUI(analysis);
}

// ============================================
// UI UPDATE FUNCTIONS
// ============================================

function updateCoachUI(analysis) {
    if (!analysis) return;

    const { feedback, score, mode } = analysis;

    // Update mode indicator
    const modeEl = document.getElementById('coachMode');
    if (modeEl) {
        modeEl.textContent = mode.charAt(0).toUpperCase() + mode.slice(1) + ' Mode';
        modeEl.className = 'coach-mode ' + mode;
    }

    // Update productivity score
    updateProductivityScore(score);

    // Update coach message
    const messageEl = document.getElementById('coachMessage');
    if (messageEl) {
        messageEl.innerHTML = `<p>${feedback.message}</p>`;
        messageEl.className = 'coach-message ' + mode;
    }

    // Update insights
    const insightsEl = document.getElementById('coachInsights');
    if (insightsEl && feedback.insights) {
        insightsEl.innerHTML = '';
        feedback.insights.forEach(insight => {
            const insightDiv = document.createElement('div');
            insightDiv.className = 'insight-item fade-in';
            insightDiv.innerHTML = `
        <span class="insight-icon">${getInsightIcon(insight)}</span>
        <p>${insight}</p>
      `;
            insightsEl.appendChild(insightDiv);
        });
    }

    // Update action
    const actionEl = document.getElementById('coachAction');
    if (actionEl) {
        actionEl.textContent = feedback.action;
        actionEl.className = 'coach-action ' + mode;
    }

    // Update AI status
    const statusEl = document.getElementById('aiStatus');
    if (statusEl) {
        const statusText = {
            gentle: 'AI Encouraging',
            accountability: 'AI Monitoring',
            strict: 'AI Warning',
            recovery: 'AI Supporting'
        };
        statusEl.textContent = statusText[mode] || 'AI Active';
    }
}

function updateProductivityScore(score) {
    if (!score) return;

    // Update main score
    const scoreEl = document.getElementById('productivityScore');
    if (scoreEl) {
        scoreEl.textContent = score.total;
    }

    // Update score ring
    const ring = document.getElementById('scoreRing');
    if (ring) {
        const circumference = 2 * Math.PI * 50;
        const progress = score.total / 100;
        const offset = circumference * (1 - progress);
        ring.style.strokeDashoffset = offset;
    }

    // Update breakdown
    if (score.breakdown) {
        const completionEl = document.getElementById('scoreCompletion');
        const consistencyEl = document.getElementById('scoreConsistency');
        const focusEl = document.getElementById('scoreFocus');
        const outputEl = document.getElementById('scoreOutput');

        if (completionEl) completionEl.textContent = score.breakdown.completion;
        if (consistencyEl) consistencyEl.textContent = score.breakdown.consistency;
        if (focusEl) focusEl.textContent = score.breakdown.focus;
        if (outputEl) outputEl.textContent = score.breakdown.output;
    }
}

function getInsightIcon(insight) {
    if (insight.includes('✅') || insight.includes('completion')) return '✅';
    if (insight.includes('❌') || insight.includes('BELOW')) return '❌';
    if (insight.includes('⚠️') || insight.includes('WARNING')) return '⚠️';
    if (insight.includes('🔥') || insight.includes('Streak')) return '🔥';
    if (insight.includes('🎯') || insight.includes('priority')) return '🎯';
    if (insight.includes('📊') || insight.includes('score')) return '📊';
    if (insight.includes('⏱️') || insight.includes('Focus time')) return '⏱️';
    if (insight.includes('✂️') || insight.includes('Reducing')) return '✂️';
    if (insight.includes('💪') || insight.includes('Rebuilding')) return '💪';
    return '📌';
}

// ============================================
// TASK VALIDATION
// ============================================

function validateNewTask(taskText) {
    if (!coach) return { allowed: true };

    const validation = coach.validateTaskLoad(taskText);

    if (!validation.allowed) {
        showNotification('🚫 Task Limit', validation.reason, 'warning');
        if (validation.suggestion) {
            setTimeout(() => {
                showNotification('💡 Suggestion', validation.suggestion, 'info');
            }, 3500);
        }
    }

    return validation;
}

// ============================================
// DAILY SUMMARY
// ============================================

function showDailySummary() {
    if (!coach) {
        showNotification('⚠️ Coach Not Ready', 'Productivity coach is not initialized', 'warning');
        return;
    }

    const summary = coach.generateDailySummary();

    // Create summary notification
    const summaryDiv = document.createElement('div');
    summaryDiv.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    max-width: 600px;
    max-height: 80vh;
    overflow-y: auto;
    background: rgba(0, 0, 0, 0.95);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(0, 245, 255, 0.3);
    border-radius: 24px;
    padding: 2rem;
    color: white;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
    z-index: 10001;
    animation: slideIn 0.3s ease-out;
  `;

    summaryDiv.innerHTML = `
    <div style="text-align: left;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
        <h3 style="margin: 0; color: var(--primary); font-size: 1.5rem;">📊 Daily Summary</h3>
        <button onclick="this.parentElement.parentElement.parentElement.remove()" style="background: rgba(255,255,255,0.1); border: none; color: white; padding: 0.5rem 1rem; border-radius: 8px; cursor: pointer;">Close</button>
      </div>
      
      <div style="margin-bottom: 1.5rem; padding: 1rem; background: rgba(0, 245, 255, 0.1); border-radius: 12px; border-left: 4px solid var(--primary);">
        <div style="font-size: 2rem; font-weight: 800; color: var(--primary);">${summary.score}/100</div>
        <div style="font-size: 0.875rem; color: rgba(255,255,255,0.7); text-transform: uppercase;">Productivity Score • ${summary.mode} Mode</div>
      </div>
      
      <div style="margin-bottom: 1.5rem;">
        <strong style="color: var(--accent); font-size: 1.1rem;">✅ What Worked</strong>
        <ul style="margin: 0.75rem 0; padding-left: 1.5rem; line-height: 1.8;">
          ${summary.whatWorked.map(item => `<li>${item}</li>`).join('')}
        </ul>
      </div>
      
      <div style="margin-bottom: 1.5rem;">
        <strong style="color: var(--danger); font-size: 1.1rem;">❌ What Failed</strong>
        <ul style="margin: 0.75rem 0; padding-left: 1.5rem; line-height: 1.8;">
          ${summary.whatFailed.map(item => `<li>${item}</li>`).join('')}
        </ul>
      </div>
      
      <div style="margin-bottom: 1.5rem;">
        <strong style="color: var(--warning); font-size: 1.1rem;">🛑 What to Stop</strong>
        <ul style="margin: 0.75rem 0; padding-left: 1.5rem; line-height: 1.8;">
          ${summary.whatToStop.map(item => `<li>${item}</li>`).join('')}
        </ul>
      </div>
      
      <div style="margin-bottom: 1.5rem;">
        <strong style="color: var(--primary); font-size: 1.1rem;">⚡ What to Optimize</strong>
        <ul style="margin: 0.75rem 0; padding-left: 1.5rem; line-height: 1.8;">
          ${summary.whatToOptimize.map(item => `<li>${item}</li>`).join('')}
        </ul>
      </div>
      
      <div style="margin-bottom: 1.5rem; padding: 1rem; background: rgba(0, 255, 135, 0.1); border-radius: 12px; border-left: 4px solid var(--accent);">
        <strong style="color: var(--accent);">🔮 Tomorrow's Plan</strong>
        <p style="margin: 0.5rem 0 0 0;">${summary.tomorrowPlan}</p>
      </div>
      
      <div style="padding: 1.25rem; background: var(--gradient-primary); border-radius: 12px; color: #000; font-weight: 700; text-align: center; font-size: 1.1rem;">
        ${summary.finalPush}
      </div>
    </div>
  `;

    document.body.appendChild(summaryDiv);
}

// ============================================
// AUTO-REFRESH ON USER ACTIONS
// ============================================

// Override addTask to include validation and refresh
const originalAddTask = window.addTask;
window.addTask = function () {
    const taskInput = document.getElementById('taskInput');
    const text = taskInput.value.trim();

    if (!text) {
        showNotification('⚠️ Empty Task', 'Please enter a task description', 'warning');
        return;
    }

    // Validate task load
    const validation = validateNewTask(text);
    if (!validation.allowed) {
        return;
    }

    // Call original function
    if (originalAddTask) {
        originalAddTask();
    }

    // Refresh coach feedback
    setTimeout(() => refreshCoachFeedback(), 500);
};

// Override toggleTask to refresh coach
const originalToggleTask = window.toggleTask;
window.toggleTask = function (index) {
    if (originalToggleTask) {
        originalToggleTask(index);
    }
    setTimeout(() => refreshCoachFeedback(), 500);
};

// Override deleteTask to refresh coach
const originalDeleteTask = window.deleteTask;
window.deleteTask = function (index) {
    if (originalDeleteTask) {
        originalDeleteTask(index);
    }
    setTimeout(() => refreshCoachFeedback(), 500);
};

// ============================================
// KEYBOARD SHORTCUTS
// ============================================

document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + Shift + S = Show Daily Summary
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'S') {
        e.preventDefault();
        showDailySummary();
    }

    // Ctrl/Cmd + Shift + R = Refresh Coach Feedback
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'R') {
        e.preventDefault();
        refreshCoachFeedback();
        showNotification('🔄 Refreshed', 'Coach feedback updated', 'info');
    }
});

// ============================================
// PERIODIC REFRESH
// ============================================

// Refresh coach feedback every 5 minutes
setInterval(() => {
    if (coach) {
        refreshCoachFeedback();
    }
}, 5 * 60 * 1000);

// Refresh on visibility change (when user returns to tab)
document.addEventListener('visibilitychange', () => {
    if (!document.hidden && coach) {
        refreshCoachFeedback();
    }
});

console.log('🎯 Productivity Coach UI integration loaded');
