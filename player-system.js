// ============================================
// SOLO-LEVELING PRODUCTIVITY SYSTEM
// Transform into an Elite Player through Discipline
// ============================================

class PlayerSystem {
    constructor(dataManager) {
        this.dm = dataManager;
        this.initializePlayer();
    }

    // ============================================
    // PLAYER INITIALIZATION
    // ============================================

    initializePlayer() {
        if (!this.dm.data.player) {
            this.dm.data.player = {
                level: 1,
                xp: 0,
                rank: 'E',
                rankProgress: 0,
                stats: {
                    focus: 10,
                    discipline: 10,
                    consistency: 10,
                    energy: 100
                },
                dailyQuests: [],
                completedQuests: [],
                achievements: [],
                title: 'Novice Player',
                warnings: 0,
                consecutiveFailures: 0
            };
            this.dm.save();
        }
    }

    // ============================================
    // XP & LEVELING SYSTEM
    // ============================================

    getXPRequired(level) {
        // Exponential scaling: Level 1 = 100 XP, Level 10 = 1000 XP
        return Math.floor(100 * Math.pow(1.2, level - 1));
    }

    addXP(amount, reason = '') {
        const player = this.dm.data.player;
        const streakMultiplier = 1 + (this.dm.data.streak * 0.1); // +10% per streak day
        const rankMultiplier = this.getRankMultiplier();

        const totalXP = Math.floor(amount * streakMultiplier * rankMultiplier);
        player.xp += totalXP;

        // Check for level up
        const xpRequired = this.getXPRequired(player.level);
        if (player.xp >= xpRequired) {
            this.levelUp();
        }

        this.dm.save();
        return {
            gained: totalXP,
            multiplier: streakMultiplier * rankMultiplier,
            reason,
            leveledUp: player.xp >= xpRequired
        };
    }

    levelUp() {
        const player = this.dm.data.player;
        player.level++;
        player.xp = 0;

        // Stat increases on level up
        player.stats.focus += 5;
        player.stats.discipline += 5;
        player.stats.consistency += 3;
        player.stats.energy = 100; // Restore energy

        // Check for rank promotion
        this.checkRankPromotion();

        this.dm.save();
        return player.level;
    }

    // ============================================
    // RANK SYSTEM
    // ============================================

    getRankRequirements() {
        return {
            E: { level: 1, discipline: 0 },
            D: { level: 5, discipline: 30 },
            C: { level: 10, discipline: 50 },
            B: { level: 20, discipline: 70 },
            A: { level: 35, discipline: 85 },
            S: { level: 50, discipline: 95 }
        };
    }

    getRankMultiplier() {
        const multipliers = {
            E: 1.0,
            D: 1.2,
            C: 1.5,
            B: 1.8,
            A: 2.2,
            S: 3.0
        };
        return multipliers[this.dm.data.player.rank] || 1.0;
    }

    checkRankPromotion() {
        const player = this.dm.data.player;
        const requirements = this.getRankRequirements();
        const ranks = ['E', 'D', 'C', 'B', 'A', 'S'];

        for (let i = ranks.length - 1; i >= 0; i--) {
            const rank = ranks[i];
            const req = requirements[rank];

            if (player.level >= req.level && player.stats.discipline >= req.discipline) {
                if (player.rank !== rank) {
                    player.rank = rank;
                    player.title = this.getRankTitle(rank);
                    this.dm.save();
                    return { promoted: true, newRank: rank };
                }
                break;
            }
        }

        return { promoted: false };
    }

    getRankTitle(rank) {
        const titles = {
            E: 'Novice Player',
            D: 'Awakened Hunter',
            C: 'Consistent Warrior',
            B: 'Disciplined Master',
            A: 'Elite Commander',
            S: 'Shadow Monarch'
        };
        return titles[rank] || 'Unknown';
    }

    // ============================================
    // QUEST SYSTEM
    // ============================================

    generateDailyQuests() {
        const player = this.dm.data.player;
        const tasks = this.dm.data.tasks.filter(t => !t.done);

        // Clear old quests
        player.dailyQuests = [];

        // Main Quest (highest priority task)
        const highPriorityTasks = tasks.filter(t => t.priority === 'high');
        if (highPriorityTasks.length > 0) {
            player.dailyQuests.push({
                type: 'main',
                title: '⚔️ MAIN QUEST',
                task: highPriorityTasks[0].text,
                taskIndex: this.dm.data.tasks.indexOf(highPriorityTasks[0]),
                xpReward: 100,
                statReward: { discipline: 5, focus: 3 }
            });
        }

        // Side Quests (2-4 medium/low priority tasks)
        const otherTasks = tasks.filter(t => t.priority !== 'high').slice(0, 4);
        otherTasks.forEach((task, i) => {
            player.dailyQuests.push({
                type: 'side',
                title: `🎯 SIDE QUEST ${i + 1}`,
                task: task.text,
                taskIndex: this.dm.data.tasks.indexOf(task),
                xpReward: 50,
                statReward: { consistency: 2 }
            });
        });

        // Emergency Quest (if falling behind)
        if (this.dm.data.completedToday === 0 && new Date().getHours() > 14) {
            player.dailyQuests.unshift({
                type: 'emergency',
                title: '🚨 EMERGENCY QUEST',
                task: 'Complete ANY task within 1 hour',
                xpReward: 150,
                statReward: { discipline: 10, energy: -20 }
            });
        }

        this.dm.save();
        return player.dailyQuests;
    }

    completeQuest(questIndex) {
        const player = this.dm.data.player;
        const quest = player.dailyQuests[questIndex];

        if (!quest) return null;

        // Award XP
        const xpResult = this.addXP(quest.xpReward, quest.title);

        // Award stat increases
        if (quest.statReward) {
            Object.keys(quest.statReward).forEach(stat => {
                player.stats[stat] = Math.min(100, player.stats[stat] + quest.statReward[stat]);
            });
        }

        // Move to completed
        player.completedQuests.push({
            ...quest,
            completedAt: Date.now()
        });

        // Remove from daily quests
        player.dailyQuests.splice(questIndex, 1);

        // Reset failure counter
        player.consecutiveFailures = 0;
        player.warnings = 0;

        this.dm.save();

        return {
            quest,
            xpGained: xpResult.gained,
            leveledUp: xpResult.leveledUp,
            statsGained: quest.statReward
        };
    }

    // ============================================
    // FAILURE SYSTEM
    // ============================================

    handleTaskSkip() {
        const player = this.dm.data.player;
        player.consecutiveFailures++;
        player.warnings++;

        // XP penalty
        const penalty = Math.floor(player.xp * 0.1);
        player.xp = Math.max(0, player.xp - penalty);

        // Stat reduction
        player.stats.discipline = Math.max(0, player.stats.discipline - 5);
        player.stats.consistency = Math.max(0, player.stats.consistency - 3);
        player.stats.energy = Math.max(0, player.stats.energy - 10);

        this.dm.save();

        return {
            penalty,
            warnings: player.warnings,
            failures: player.consecutiveFailures,
            statsLost: { discipline: -5, consistency: -3, energy: -10 }
        };
    }

    handleStreakBreak() {
        const player = this.dm.data.player;

        // Massive XP penalty
        const penalty = Math.floor(player.xp * 0.3);
        player.xp = Math.max(0, player.xp - penalty);

        // Stat reduction
        player.stats.discipline = Math.max(0, player.stats.discipline - 15);
        player.stats.consistency = Math.max(0, player.stats.consistency - 20);

        this.dm.save();

        return {
            penalty,
            statsLost: { discipline: -15, consistency: -20 }
        };
    }

    // ============================================
    // SYSTEM MESSAGES
    // ============================================

    getSystemMessage(type, data = {}) {
        const player = this.dm.data.player;

        switch (type) {
            case 'levelUp':
                return {
                    title: '⚡ LEVEL UP ACHIEVED',
                    message: `Congratulations! You've reached Level ${player.level}!`,
                    details: [
                        `Focus +5 → ${player.stats.focus}`,
                        `Discipline +5 → ${player.stats.discipline}`,
                        `Consistency +3 → ${player.stats.consistency}`,
                        `Energy Restored → 100`
                    ],
                    action: `→ Your power grows. Continue your ascent to S-Rank.`
                };

            case 'rankPromotion':
                return {
                    title: `🏆 RANK PROMOTION: ${data.newRank} RANK UNLOCKED`,
                    message: `You are now a ${this.getRankTitle(data.newRank)}!`,
                    details: [
                        `XP Multiplier: ${this.getRankMultiplier()}x`,
                        `New challenges await`,
                        `Elite status achieved`
                    ],
                    action: `→ The path to S-Rank continues. Stay disciplined.`
                };

            case 'warning':
                return {
                    title: '⚠️ SYSTEM WARNING: DISCIPLINE DROPPING',
                    message: `${player.warnings} consecutive failures detected.`,
                    details: [
                        `XP Lost: -${data.penalty}`,
                        `Discipline: ${player.stats.discipline} (-5)`,
                        `Consistency: ${player.stats.consistency} (-3)`,
                        `Energy: ${player.stats.energy} (-10)`
                    ],
                    action: `→ RECOVER NOW OR FACE RANK DEMOTION.`
                };

            case 'streakBreak':
                return {
                    title: '🚨 CRITICAL FAILURE: STREAK BROKEN',
                    message: 'Your consistency has been shattered.',
                    details: [
                        `XP Lost: -${data.penalty} (30%)`,
                        `Discipline: ${player.stats.discipline} (-15)`,
                        `Consistency: ${player.stats.consistency} (-20)`,
                        `Rebuilding required`
                    ],
                    action: `→ START OVER. REBUILD YOUR DISCIPLINE FROM ZERO.`
                };

            case 'questComplete':
                return {
                    title: `✅ ${data.quest.title} COMPLETE`,
                    message: `Quest cleared successfully!`,
                    details: [
                        `XP Gained: +${data.xpGained}`,
                        ...Object.keys(data.statsGained || {}).map(stat =>
                            `${stat.charAt(0).toUpperCase() + stat.slice(1)}: +${data.statsGained[stat]}`
                        ),
                        data.leveledUp ? '⚡ LEVEL UP!' : ''
                    ].filter(Boolean),
                    action: `→ Next quest awaits. Keep pushing forward.`
                };

            case 'dailyComplete':
                return {
                    title: '🎊 ALL DAILY QUESTS COMPLETE',
                    message: 'Perfect execution. Bonus XP awarded.',
                    details: [
                        `Bonus XP: +${data.bonusXP}`,
                        `Streak Protected: ${this.dm.data.streak} days`,
                        `Rank: ${player.rank} (${player.title})`,
                        `Next Level: ${this.getXPRequired(player.level) - player.xp} XP`
                    ],
                    action: `→ Tomorrow's challenges will be greater. Rest well, warrior.`
                };

            case 'emergency':
                return {
                    title: '🚨 EMERGENCY QUEST ACTIVATED',
                    message: 'You are falling behind. Immediate action required.',
                    details: [
                        `Time Remaining: ${24 - new Date().getHours()} hours`,
                        `Tasks Completed Today: ${this.dm.data.completedToday}`,
                        `Streak at Risk: ${this.dm.data.streak} days`,
                        `Discipline: ${player.stats.discipline}`
                    ],
                    action: `→ COMPLETE ONE TASK NOW. YOUR STREAK DEPENDS ON IT.`
                };

            default:
                return {
                    title: '📊 PLAYER STATUS',
                    message: `Level ${player.level} ${player.rank}-Rank ${player.title}`,
                    details: [
                        `XP: ${player.xp}/${this.getXPRequired(player.level)}`,
                        `Focus: ${player.stats.focus}`,
                        `Discipline: ${player.stats.discipline}`,
                        `Consistency: ${player.stats.consistency}`,
                        `Energy: ${player.stats.energy}`
                    ],
                    action: `→ Complete your quests to grow stronger.`
                };
        }
    }

    // ============================================
    // PLAYER STATUS
    // ============================================

    getPlayerStatus() {
        const player = this.dm.data.player;
        const xpRequired = this.getXPRequired(player.level);
        const xpProgress = (player.xp / xpRequired) * 100;

        return {
            level: player.level,
            xp: player.xp,
            xpRequired,
            xpProgress,
            rank: player.rank,
            title: player.title,
            stats: player.stats,
            quests: player.dailyQuests,
            completed: player.completedQuests.length,
            warnings: player.warnings,
            failures: player.consecutiveFailures,
            multiplier: this.getRankMultiplier()
        };
    }

    // ============================================
    // ACHIEVEMENTS
    // ============================================

    checkAchievements() {
        const player = this.dm.data.player;
        const newAchievements = [];

        const achievements = [
            { id: 'first_quest', name: 'First Steps', condition: () => player.completedQuests.length >= 1 },
            { id: 'level_5', name: 'Rising Power', condition: () => player.level >= 5 },
            { id: 'level_10', name: 'Double Digits', condition: () => player.level >= 10 },
            { id: 'd_rank', name: 'Awakened', condition: () => player.rank === 'D' || player.rank === 'C' || player.rank === 'B' || player.rank === 'A' || player.rank === 'S' },
            { id: 'c_rank', name: 'Consistent Warrior', condition: () => player.rank === 'C' || player.rank === 'B' || player.rank === 'A' || player.rank === 'S' },
            { id: 'b_rank', name: 'Master of Discipline', condition: () => player.rank === 'B' || player.rank === 'A' || player.rank === 'S' },
            { id: 'a_rank', name: 'Elite Status', condition: () => player.rank === 'A' || player.rank === 'S' },
            { id: 's_rank', name: 'Shadow Monarch', condition: () => player.rank === 'S' },
            { id: 'streak_7', name: 'Week Warrior', condition: () => this.dm.data.streak >= 7 },
            { id: 'streak_30', name: 'Month Master', condition: () => this.dm.data.streak >= 30 },
            { id: 'discipline_50', name: 'Iron Will', condition: () => player.stats.discipline >= 50 },
            { id: 'discipline_100', name: 'Unbreakable', condition: () => player.stats.discipline >= 100 }
        ];

        achievements.forEach(achievement => {
            if (!player.achievements.includes(achievement.id) && achievement.condition()) {
                player.achievements.push(achievement.id);
                newAchievements.push(achievement);
            }
        });

        if (newAchievements.length > 0) {
            this.dm.save();
        }

        return newAchievements;
    }
}

// ============================================
// EXPORT
// ============================================

window.PlayerSystem = PlayerSystem;
