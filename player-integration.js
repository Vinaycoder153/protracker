// ============================================
// SOLO-LEVELING PLAYER SYSTEM UI INTEGRATION
// RPG-Style Interface for Productivity
// ============================================

let playerSystem;

// ============================================
// INITIALIZATION
// ============================================

function initializePlayerSystem() {
    if (typeof PlayerSystem === 'undefined') {
        console.warn('⚠️ PlayerSystem not loaded');
        return;
    }

    playerSystem = new PlayerSystem(dm);
    updatePlayerUI();
    generateDailyQuests();
    console.log('🎮 Player System initialized');
}

// ============================================
// UI UPDATE FUNCTIONS
// ============================================

function updatePlayerUI() {
    if (!playerSystem) return;

    const status = playerSystem.getPlayerStatus();

    // Update player info in header
    updatePlayerHeader(status);

    // Update stats display
    updatePlayerStats(status);

    // Update quests
    updateQuestsUI(status);

    // Check for achievements
    checkAndShowAchievements();
}

function updatePlayerHeader(status) {
    const aiStatus = document.getElementById('aiStatus');
    if (aiStatus) {
        aiStatus.innerHTML = `
      <span style="font-weight: 700; color: var(--primary);">Lv.${status.level}</span>
      <span style="color: var(--accent);">${status.rank}-Rank</span>
    `;
    }

    // Update AI badge with title
    const aiBadge = document.querySelector('.ai-badge');
    if (aiBadge) {
        aiBadge.textContent = status.title;
        aiBadge.style.background = getRankGradient(status.rank);
    }
}

function updatePlayerStats(status) {
    // Update XP progress in existing progress bar
    const progressFill = document.getElementById('progressFill');
    if (progressFill) {
        progressFill.style.width = status.xpProgress + '%';
    }

    const expText = document.getElementById('expText');
    if (expText) {
        expText.textContent = `${status.xp}/${status.xpRequired} XP`;
    }

    // Update level display
    const levelEl = document.getElementById('level');
    if (levelEl) {
        levelEl.textContent = status.level;
    }
}

function updateQuestsUI(status) {
    // This will be shown in the coach insights area
    const insightsEl = document.getElementById('coachInsights');
    if (!insightsEl || !status.quests || status.quests.length === 0) return;

    insightsEl.innerHTML = '';

    status.quests.forEach((quest, index) => {
        const questDiv = document.createElement('div');
        questDiv.className = 'insight-item quest-item fade-in';
        questDiv.style.borderLeftColor = getQuestColor(quest.type);

        questDiv.innerHTML = `
      <span class="insight-icon">${getQuestIcon(quest.type)}</span>
      <div style="flex: 1;">
        <div style="font-weight: 700; color: ${getQuestColor(quest.type)}; margin-bottom: 0.25rem;">
          ${quest.title}
        </div>
        <p style="margin: 0;">${quest.task}</p>
        <div style="font-size: 0.75rem; color: rgba(255,255,255,0.6); margin-top: 0.25rem;">
          Reward: +${quest.xpReward} XP
        </div>
      </div>
    `;

        insightsEl.appendChild(questDiv);
    });
}

function getRankGradient(rank) {
    const gradients = {
        E: 'linear-gradient(135deg, #666, #999)',
        D: 'linear-gradient(135deg, #4a9eff, #7ec8ff)',
        C: 'linear-gradient(135deg, #00ff87, #00f5ff)',
        B: 'linear-gradient(135deg, #ff00f5, #ff0087)',
        A: 'linear-gradient(135deg, #ffaa00, #ff0057)',
        S: 'linear-gradient(135deg, #ffd700, #ff00f5)'
    };
    return gradients[rank] || gradients.E;
}

function getQuestColor(type) {
    const colors = {
        main: '#ff0057',
        side: '#00f5ff',
        emergency: '#ffaa00'
    };
    return colors[type] || '#00f5ff';
}

function getQuestIcon(type) {
    const icons = {
        main: '⚔️',
        side: '🎯',
        emergency: '🚨'
    };
    return icons[type] || '📋';
}

// ============================================
// QUEST MANAGEMENT
// ============================================

function generateDailyQuests() {
    if (!playerSystem) return;

    playerSystem.generateDailyQuests();
    updatePlayerUI();

    showSystemMessage('info', {
        title: '📜 DAILY QUESTS GENERATED',
        message: 'Your missions for today are ready.',
        action: '→ Complete all quests to maximize XP gain.'
    });
}

function completeQuestByTask(taskIndex) {
    if (!playerSystem) return;

    const player = playerSystem.dm.data.player;
    const questIndex = player.dailyQuests.findIndex(q => q.taskIndex === taskIndex);

    if (questIndex === -1) return;

    const result = playerSystem.completeQuest(questIndex);

    if (result) {
        showQuestComplete(result);
        updatePlayerUI();

        // Check if all quests complete
        if (player.dailyQuests.length === 0) {
            handleAllQuestsComplete();
        }
    }
}

function handleAllQuestsComplete() {
    const bonusXP = 200;
    playerSystem.addXP(bonusXP, 'ALL QUESTS COMPLETE BONUS');

    const message = playerSystem.getSystemMessage('dailyComplete', { bonusXP });
    showSystemMessage('success', message);
}

// ============================================
// FAILURE HANDLING
// ============================================

function handleTaskFailure() {
    if (!playerSystem) return;

    const result = playerSystem.handleTaskSkip();
    const message = playerSystem.getSystemMessage('warning', result);

    showSystemMessage('warning', message);
    updatePlayerUI();
}

function handleStreakLoss() {
    if (!playerSystem) return;

    const result = playerSystem.handleStreakBreak();
    const message = playerSystem.getSystemMessage('streakBreak', result);

    showSystemMessage('error', message);
    updatePlayerUI();
}

// ============================================
// SYSTEM MESSAGES
// ============================================

function showSystemMessage(type, data) {
    const messageDiv = document.createElement('div');
    messageDiv.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    max-width: 500px;
    background: rgba(0, 0, 0, 0.95);
    backdrop-filter: blur(20px);
    border: 2px solid ${type === 'success' ? '#00ff87' : type === 'warning' ? '#ffaa00' : type === 'error' ? '#ff0057' : '#00f5ff'};
    border-radius: 16px;
    padding: 2rem;
    color: white;
    box-shadow: 0 0 40px ${type === 'success' ? 'rgba(0,255,135,0.5)' : type === 'warning' ? 'rgba(255,170,0,0.5)' : type === 'error' ? 'rgba(255,0,87,0.5)' : 'rgba(0,245,255,0.5)'};
    z-index: 10002;
    animation: systemMessageAppear 0.3s ease-out;
    text-align: center;
  `;

    messageDiv.innerHTML = `
    <div style="font-size: 1.5rem; font-weight: 800; margin-bottom: 1rem; color: ${type === 'success' ? '#00ff87' : type === 'warning' ? '#ffaa00' : type === 'error' ? '#ff0057' : '#00f5ff'};">
      ${data.title}
    </div>
    <div style="font-size: 1.1rem; margin-bottom: 1.5rem; line-height: 1.6;">
      ${data.message}
    </div>
    ${data.details ? `
      <div style="text-align: left; margin-bottom: 1.5rem; padding: 1rem; background: rgba(255,255,255,0.05); border-radius: 8px;">
        ${data.details.map(detail => `<div style="margin: 0.5rem 0;">• ${detail}</div>`).join('')}
      </div>
    ` : ''}
    <div style="padding: 1rem; background: var(--gradient-primary); border-radius: 8px; font-weight: 700; color: #000; margin-bottom: 1rem;">
      ${data.action}
    </div>
    <button onclick="this.parentElement.remove()" style="background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.3); color: white; padding: 0.75rem 2rem; border-radius: 8px; cursor: pointer; font-weight: 600;">
      ACKNOWLEDGE
    </button>
  `;

    document.body.appendChild(messageDiv);

    // Auto-remove after 10 seconds
    setTimeout(() => {
        if (messageDiv.parentElement) {
            messageDiv.remove();
        }
    }, 10000);
}

function showQuestComplete(result) {
    const message = playerSystem.getSystemMessage('questComplete', result);
    showSystemMessage('success', message);

    // Play level up sound if leveled up
    if (result.leveledUp) {
        playSound('levelup');
        setTimeout(() => {
            const levelUpMsg = playerSystem.getSystemMessage('levelUp');
            showSystemMessage('success', levelUpMsg);

            // Check for rank promotion
            const rankCheck = playerSystem.checkRankPromotion();
            if (rankCheck.promoted) {
                setTimeout(() => {
                    const rankMsg = playerSystem.getSystemMessage('rankPromotion', rankCheck);
                    showSystemMessage('success', rankMsg);
                }, 2000);
            }
        }, 1500);
    }
}

// ============================================
// ACHIEVEMENTS
// ============================================

function checkAndShowAchievements() {
    if (!playerSystem) return;

    const newAchievements = playerSystem.checkAchievements();

    newAchievements.forEach((achievement, index) => {
        setTimeout(() => {
            showAchievement(achievement);
        }, index * 2000);
    });
}

function showAchievement(achievement) {
    showNotification(
        '🏆 ACHIEVEMENT UNLOCKED',
        achievement.name,
        'success'
    );
}

// ============================================
// PLAYER STATUS PANEL
// ============================================

function showPlayerStatus() {
    if (!playerSystem) return;

    const status = playerSystem.getPlayerStatus();
    const message = playerSystem.getSystemMessage('status');

    showSystemMessage('info', {
        ...message,
        details: [
            ...message.details,
            `Quests Today: ${status.completed}`,
            `Warnings: ${status.warnings}`,
            `XP Multiplier: ${status.multiplier}x`
        ]
    });
}

// ============================================
// OVERRIDE TASK FUNCTIONS
// ============================================

// Enhance task completion with quest system
const originalToggleTaskPlayer = window.toggleTask;
window.toggleTask = function (index) {
    const task = dm.data.tasks[index];
    const wasDone = task.done;

    // Call original function
    if (originalToggleTaskPlayer) {
        originalToggleTaskPlayer(index);
    }

    // If task was just completed
    if (!wasDone && task.done) {
        completeQuestByTask(index);
    }

    // If task was uncompleted (undone)
    if (wasDone && !task.done) {
        handleTaskFailure();
    }
};

// ============================================
// PERIODIC UPDATES
// ============================================

// Check for emergency quest every hour
setInterval(() => {
    if (playerSystem && dm.data.completedToday === 0 && new Date().getHours() > 14) {
        generateDailyQuests(); // Will add emergency quest if needed
    }
}, 60 * 60 * 1000);

// Daily quest reset at midnight
setInterval(() => {
    const now = new Date();
    if (now.getHours() === 0 && now.getMinutes() === 0) {
        if (playerSystem) {
            generateDailyQuests();
        }
    }
}, 60 * 1000);

// ============================================
// KEYBOARD SHORTCUTS
// ============================================

document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + Shift + P = Player Status
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'P') {
        e.preventDefault();
        showPlayerStatus();
    }

    // Ctrl/Cmd + Shift + Q = Generate Quests
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'Q') {
        e.preventDefault();
        generateDailyQuests();
    }
});

// ============================================
// CSS ANIMATIONS
// ============================================

const playerStyle = document.createElement('style');
playerStyle.textContent = `
  @keyframes systemMessageAppear {
    from {
      opacity: 0;
      transform: translate(-50%, -50%) scale(0.8);
    }
    to {
      opacity: 1;
      transform: translate(-50%, -50%) scale(1);
    }
  }
  
  .quest-item {
    cursor: pointer;
    transition: all 0.3s ease;
  }
  
  .quest-item:hover {
    transform: translateX(8px) scale(1.02);
    box-shadow: 0 4px 20px rgba(0, 245, 255, 0.3);
  }
`;
document.head.appendChild(playerStyle);

console.log('🎮 Player System UI integration loaded');
