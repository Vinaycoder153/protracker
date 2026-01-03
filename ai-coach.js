// ============================================
// ADVANCED PRODUCTIVITY INTELLIGENCE SYSTEM
// Strict AI Coach for Discipline & Focus
// ============================================

class ProductivityCoach {
    constructor(dataManager) {
        this.dm = dataManager;
        this.mode = 'accountability'; // gentle, accountability, strict, recovery
        this.lastAnalysis = null;
        this.warnings = 0;
        this.consecutiveSkips = 0;
    }

    // ============================================
    // CORE ANALYSIS ENGINE
    // ============================================

    analyzeProductivity() {
        const data = this.dm.data;
        const today = new Date().toDateString();

        // Calculate metrics
        const metrics = {
            timeSpent: data.totalFocusTime / 60, // minutes
            completionRate: this.calculateCompletionRate(),
            streak: data.streak,
            todayCompleted: data.completedToday,
            totalTasks: data.tasks.length,
            pendingTasks: data.tasks.filter(t => !t.done).length,
            highPriorityPending: data.tasks.filter(t => !t.done && t.priority === 'high').length,
            focusScore: data.focusScore,
            productivity: data.productivity,
            pointsToday: data.pointsToday
        };

        // Calculate hybrid productivity score
        const score = this.calculateHybridScore(metrics);

        // Detect behavior patterns
        const patterns = this.detectPatterns(metrics);

        // Determine appropriate mode
        this.updateMode(patterns);

        // Generate feedback
        const feedback = this.generateFeedback(metrics, patterns, score);

        this.lastAnalysis = {
            timestamp: Date.now(),
            metrics,
            patterns,
            score,
            mode: this.mode,
            feedback
        };

        return this.lastAnalysis;
    }

    // ============================================
    // METRICS CALCULATION
    // ============================================

    calculateCompletionRate() {
        const total = this.dm.data.tasks.length;
        if (total === 0) return 0;
        const completed = this.dm.data.tasks.filter(t => t.done).length;
        return Math.round((completed / total) * 100);
    }

    calculateHybridScore(metrics) {
        // Weighted scoring system
        const weights = {
            completionRate: 0.35,
            streak: 0.25,
            timeSpent: 0.20,
            todayCompleted: 0.20
        };

        // Normalize values to 0-100 scale
        const normalized = {
            completionRate: metrics.completionRate,
            streak: Math.min((metrics.streak / 7) * 100, 100),
            timeSpent: Math.min((metrics.timeSpent / 120) * 100, 100), // 120 min = 100%
            todayCompleted: Math.min((metrics.todayCompleted / 5) * 100, 100) // 5 tasks = 100%
        };

        // Calculate weighted score
        const score = Math.round(
            normalized.completionRate * weights.completionRate +
            normalized.streak * weights.streak +
            normalized.timeSpent * weights.timeSpent +
            normalized.todayCompleted * weights.todayCompleted
        );

        return {
            total: score,
            breakdown: {
                completion: Math.round(normalized.completionRate * weights.completionRate),
                consistency: Math.round(normalized.streak * weights.streak),
                focus: Math.round(normalized.timeSpent * weights.timeSpent),
                output: Math.round(normalized.todayCompleted * weights.todayCompleted)
            }
        };
    }

    detectPatterns(metrics) {
        const patterns = {
            isProcrastinating: false,
            isOverloaded: false,
            isConsistent: false,
            needsBreak: false,
            excuseDetected: false,
            streakAtRisk: false,
            peakPerformance: false
        };

        // Procrastination detection
        if (metrics.highPriorityPending > 2 && metrics.todayCompleted === 0) {
            patterns.isProcrastinating = true;
            this.consecutiveSkips++;
        } else {
            this.consecutiveSkips = 0;
        }

        // Overload detection
        if (metrics.pendingTasks > 10 && metrics.completionRate < 30) {
            patterns.isOverloaded = true;
        }

        // Consistency check
        if (metrics.streak >= 3) {
            patterns.isConsistent = true;
        }

        // Burnout detection
        if (metrics.timeSpent > 300 && metrics.todayCompleted < 3) {
            patterns.needsBreak = true;
        }

        // Streak risk
        if (metrics.streak > 0 && metrics.todayCompleted === 0 && new Date().getHours() > 20) {
            patterns.streakAtRisk = true;
        }

        // Peak performance
        if (metrics.completionRate > 70 && metrics.streak >= 5 && metrics.focusScore > 70) {
            patterns.peakPerformance = true;
        }

        return patterns;
    }

    // ============================================
    // MODE MANAGEMENT
    // ============================================

    updateMode(patterns) {
        // Strict Warning Mode
        if (this.consecutiveSkips >= 3 || (patterns.isProcrastinating && patterns.streakAtRisk)) {
            this.mode = 'strict';
            this.warnings++;
            return;
        }

        // Recovery Mode
        if (patterns.isOverloaded || patterns.needsBreak) {
            this.mode = 'recovery';
            return;
        }

        // Gentle Reminder Mode
        if (patterns.isConsistent && !patterns.isProcrastinating) {
            this.mode = 'gentle';
            this.warnings = 0;
            return;
        }

        // Default: Accountability Mode
        this.mode = 'accountability';
    }

    // ============================================
    // FEEDBACK GENERATION
    // ============================================

    generateFeedback(metrics, patterns, score) {
        const feedback = {
            mode: this.mode,
            score: score.total,
            message: '',
            insights: [],
            action: '',
            tone: ''
        };

        switch (this.mode) {
            case 'strict':
                feedback.tone = 'firm';
                feedback.message = this.getStrictMessage(metrics, patterns);
                feedback.insights = this.getStrictInsights(metrics, patterns);
                feedback.action = this.getStrictAction(metrics, patterns);
                break;

            case 'recovery':
                feedback.tone = 'supportive';
                feedback.message = this.getRecoveryMessage(metrics, patterns);
                feedback.insights = this.getRecoveryInsights(metrics, patterns);
                feedback.action = this.getRecoveryAction(metrics, patterns);
                break;

            case 'gentle':
                feedback.tone = 'encouraging';
                feedback.message = this.getGentleMessage(metrics, patterns);
                feedback.insights = this.getGentleInsights(metrics, patterns);
                feedback.action = this.getGentleAction(metrics, patterns);
                break;

            default: // accountability
                feedback.tone = 'direct';
                feedback.message = this.getAccountabilityMessage(metrics, patterns);
                feedback.insights = this.getAccountabilityInsights(metrics, patterns);
                feedback.action = this.getAccountabilityAction(metrics, patterns);
        }

        return feedback;
    }

    // ============================================
    // STRICT MODE MESSAGES
    // ============================================

    getStrictMessage(metrics, patterns) {
        const messages = [
            `⚠️ WARNING: ${this.consecutiveSkips} days of task avoidance detected.`,
            `🚨 Your ${metrics.streak}-day streak is about to DIE. Act NOW.`,
            `❌ ${metrics.highPriorityPending} high-priority tasks ignored. This is unacceptable.`,
            `⏰ You're running out of time. ${metrics.pendingTasks} tasks pending, ${metrics.todayCompleted} completed today.`
        ];

        if (patterns.streakAtRisk) {
            return `🔥 STREAK ALERT: Your ${metrics.streak}-day streak ends in ${24 - new Date().getHours()} hours. Complete ONE task to save it.`;
        }

        return messages[Math.floor(Math.random() * messages.length)];
    }

    getStrictInsights(metrics, patterns) {
        return [
            `❌ Completion rate: ${metrics.completionRate}% - BELOW ACCEPTABLE`,
            `⚠️ Consecutive skips: ${this.consecutiveSkips} - DISCIPLINE FAILING`,
            `🎯 High-priority tasks ignored: ${metrics.highPriorityPending}`,
            `📉 Productivity score: ${metrics.focusScore}/100 - NEEDS IMMEDIATE IMPROVEMENT`
        ];
    }

    getStrictAction(metrics, patterns) {
        if (patterns.streakAtRisk) {
            return '→ COMPLETE ONE TASK IN THE NEXT HOUR OR LOSE YOUR STREAK. NO EXCUSES.';
        }
        return `→ STOP PLANNING. START DOING. Pick your #1 priority and work for 25 minutes. NOW.`;
    }

    // ============================================
    // RECOVERY MODE MESSAGES
    // ============================================

    getRecoveryMessage(metrics, patterns) {
        if (patterns.isOverloaded) {
            return `🛑 OVERLOAD DETECTED: ${metrics.pendingTasks} tasks is too many. Let's reduce and refocus.`;
        }
        if (patterns.needsBreak) {
            return `😮‍💨 You've worked ${Math.round(metrics.timeSpent)} minutes but completed only ${metrics.todayCompleted} tasks. Quality over quantity.`;
        }
        return `🔄 Recovery mode activated. Let's rebuild your momentum step by step.`;
    }

    getRecoveryInsights(metrics, patterns) {
        return [
            `✂️ Reducing workload: Focus on 3 tasks maximum today`,
            `🎯 Prioritizing: ${metrics.highPriorityPending} high-priority items need attention`,
            `💪 Rebuilding: Consistency matters more than volume right now`,
            `📊 Current score: ${metrics.focusScore}/100 - We'll improve this together`
        ];
    }

    getRecoveryAction(metrics, patterns) {
        return `→ Pick ONE task. Complete it. That's your only goal for the next hour.`;
    }

    // ============================================
    // GENTLE MODE MESSAGES
    // ============================================

    getGentleMessage(metrics, patterns) {
        const messages = [
            `✨ ${metrics.streak}-day streak! You're building real discipline.`,
            `🎯 ${metrics.completionRate}% completion rate. Solid work.`,
            `💪 ${metrics.todayCompleted} tasks done today. Keep the momentum.`,
            `🔥 Focus score: ${metrics.focusScore}/100. You're in the zone.`
        ];
        return messages[Math.floor(Math.random() * messages.length)];
    }

    getGentleInsights(metrics, patterns) {
        return [
            `✅ Completion rate: ${metrics.completionRate}% - Strong performance`,
            `🔥 Streak: ${metrics.streak} days - Consistency is your superpower`,
            `⏱️ Focus time: ${Math.round(metrics.timeSpent)} minutes today`,
            `📈 Productivity score: ${metrics.focusScore}/100 - Excellent`
        ];
    }

    getGentleAction(metrics, patterns) {
        if (metrics.highPriorityPending > 0) {
            return `→ You're doing great. Now tackle one of those ${metrics.highPriorityPending} high-priority tasks.`;
        }
        return `→ Maintain this energy. What's the next important thing?`;
    }

    // ============================================
    // ACCOUNTABILITY MODE MESSAGES
    // ============================================

    getAccountabilityMessage(metrics, patterns) {
        if (patterns.isProcrastinating) {
            return `⏰ ${metrics.highPriorityPending} urgent tasks waiting. Stop delaying.`;
        }
        if (metrics.todayCompleted === 0 && new Date().getHours() > 12) {
            return `📍 It's ${new Date().getHours()}:00. You haven't completed a single task yet.`;
        }
        return `📊 Productivity score: ${metrics.focusScore}/100. You can do better.`;
    }

    getAccountabilityInsights(metrics, patterns) {
        return [
            `📊 Completion rate: ${metrics.completionRate}% - ${metrics.completionRate > 50 ? 'Acceptable' : 'Needs improvement'}`,
            `🎯 Tasks today: ${metrics.todayCompleted}/${metrics.totalTasks}`,
            `⚡ High-priority pending: ${metrics.highPriorityPending}`,
            `🔥 Streak: ${metrics.streak} days - ${metrics.streak > 0 ? 'Protect it' : 'Start building one'}`
        ];
    }

    getAccountabilityAction(metrics, patterns) {
        if (metrics.highPriorityPending > 0) {
            return `→ Stop reading this. Start your highest priority task. 25-minute timer. Go.`;
        }
        if (metrics.todayCompleted === 0) {
            return `→ Complete ONE task in the next 30 minutes. Prove you're serious.`;
        }
        return `→ Good start. Now finish ${Math.min(3, metrics.pendingTasks)} more tasks before the day ends.`;
    }

    // ============================================
    // PLANNING INTELLIGENCE
    // ============================================

    validateTaskLoad(newTask) {
        const pendingTasks = this.dm.data.tasks.filter(t => !t.done).length;
        const todayCompleted = this.dm.data.completedToday;
        const completionRate = this.calculateCompletionRate();

        // Prevent over-planning
        if (pendingTasks >= 15) {
            return {
                allowed: false,
                reason: `❌ STOP. You have ${pendingTasks} pending tasks. Finish what you started before adding more.`,
                suggestion: 'Complete at least 5 tasks before adding new ones.'
            };
        }

        if (pendingTasks >= 10 && completionRate < 40) {
            return {
                allowed: false,
                reason: `⚠️ You're only completing ${completionRate}% of tasks. Adding more will make it worse.`,
                suggestion: 'Focus on completing existing tasks first.'
            };
        }

        if (pendingTasks >= 8 && todayCompleted === 0 && new Date().getHours() > 14) {
            return {
                allowed: false,
                reason: `🚨 It's ${new Date().getHours()}:00 and you haven't completed anything. No new tasks until you finish one.`,
                suggestion: 'Complete your first task, then you can add more.'
            };
        }

        return {
            allowed: true,
            reason: 'Task load is manageable.',
            suggestion: null
        };
    }

    // ============================================
    // DAILY SUMMARY
    // ============================================

    generateDailySummary() {
        const analysis = this.analyzeProductivity();
        const metrics = analysis.metrics;

        return {
            date: new Date().toDateString(),
            score: analysis.score.total,
            mode: this.mode,

            whatWorked: this.getWhatWorked(metrics),
            whatFailed: this.getWhatFailed(metrics),
            whatToStop: this.getWhatToStop(metrics),
            whatToOptimize: this.getWhatToOptimize(metrics),

            tomorrowPlan: this.getTomorrowPlan(metrics),
            finalPush: this.getFinalPush(metrics)
        };
    }

    getWhatWorked(metrics) {
        const worked = [];
        if (metrics.todayCompleted >= 3) worked.push(`✅ Completed ${metrics.todayCompleted} tasks`);
        if (metrics.timeSpent >= 60) worked.push(`⏱️ ${Math.round(metrics.timeSpent)} minutes of focused work`);
        if (metrics.streak > 0) worked.push(`🔥 Maintained ${metrics.streak}-day streak`);
        if (metrics.completionRate > 60) worked.push(`📈 ${metrics.completionRate}% completion rate`);
        return worked.length > 0 ? worked : ['Nothing significant. That\'s the problem.'];
    }

    getWhatFailed(metrics) {
        const failed = [];
        if (metrics.todayCompleted === 0) failed.push(`❌ Zero tasks completed`);
        if (metrics.highPriorityPending > 2) failed.push(`⚠️ ${metrics.highPriorityPending} urgent tasks ignored`);
        if (metrics.completionRate < 30) failed.push(`📉 Only ${metrics.completionRate}% completion rate`);
        if (metrics.timeSpent < 30) failed.push(`⏰ Only ${Math.round(metrics.timeSpent)} minutes of focus`);
        return failed.length > 0 ? failed : ['Nothing major failed today.'];
    }

    getWhatToStop(metrics) {
        const stop = [];
        if (metrics.pendingTasks > 10) stop.push(`🛑 Stop adding tasks. You have ${metrics.pendingTasks} pending.`);
        if (metrics.todayCompleted === 0 && new Date().getHours() > 18) stop.push(`🚫 Stop procrastinating. Day is almost over.`);
        if (this.consecutiveSkips > 1) stop.push(`❌ Stop making excuses. ${this.consecutiveSkips} days of avoidance.`);
        return stop.length > 0 ? stop : ['Keep doing what you\'re doing.'];
    }

    getWhatToOptimize(metrics) {
        const optimize = [];
        if (metrics.timeSpent > 0 && metrics.todayCompleted < 3) optimize.push(`⚡ Optimize: More output per hour`);
        if (metrics.highPriorityPending > 0) optimize.push(`🎯 Optimize: Tackle high-priority tasks first`);
        if (metrics.completionRate < 50) optimize.push(`📊 Optimize: Reduce task list, increase completion`);
        return optimize.length > 0 ? optimize : ['Focus on maintaining consistency.'];
    }

    getTomorrowPlan(metrics) {
        if (metrics.completionRate < 30) {
            return `Tomorrow: Complete 3 tasks minimum. Nothing else matters.`;
        }
        if (metrics.streak === 0) {
            return `Tomorrow: Start a new streak. Complete at least 1 task.`;
        }
        return `Tomorrow: Maintain momentum. Target ${Math.min(metrics.todayCompleted + 1, 5)} tasks.`;
    }

    getFinalPush(metrics) {
        const hour = new Date().getHours();
        if (hour < 12) {
            return `→ Morning energy is peak. Use it. Start your hardest task NOW.`;
        }
        if (hour < 18) {
            return `→ Afternoon slump is real. 25-minute focus session. One task. Go.`;
        }
        if (metrics.todayCompleted === 0) {
            return `→ Day is ending. Complete ONE task before bed. Save your streak.`;
        }
        return `→ Finish strong. One more task before you rest.`;
    }
}

// ============================================
// EXPORT
// ============================================

window.ProductivityCoach = ProductivityCoach;
