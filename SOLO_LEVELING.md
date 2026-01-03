# 🎮 SOLO-LEVELING PRODUCTIVITY SYSTEM

## ⚡ SYSTEM OVERVIEW

You are now a **PLAYER** in the ultimate productivity RPG. Every task you complete makes you stronger. Every task you skip weakens you. Your goal: Reach **S-RANK** and become an elite, disciplined warrior.

---

## 👤 PLAYER STATS

### **Core Attributes**

| Stat | Description | Max | How to Increase |
|------|-------------|-----|-----------------|
| **Focus** | Concentration power | 100 | Complete tasks, level up |
| **Discipline** | Self-control strength | 100 | Maintain streaks, complete quests |
| **Consistency** | Reliability score | 100 | Daily task completion |
| **Energy** | Current stamina | 100 | Restored on level up, depleted by failures |

### **Progression Metrics**

- **Level**: Your overall power (starts at 1, no cap)
- **XP**: Experience points toward next level
- **Rank**: E → D → C → B → A → S
- **Title**: Your current rank designation
- **Streak**: Consecutive days of quest completion

---

## 📊 LEVELING SYSTEM

### **XP Requirements**
```
Level 1:  100 XP
Level 2:  120 XP
Level 3:  144 XP
Level 5:  207 XP
Level 10: 516 XP
Level 20: 2,653 XP
Level 50: 91,004 XP
```

**Formula**: `XP Required = 100 × (1.2 ^ (Level - 1))`

### **XP Multipliers**

**Streak Bonus:**
- Each streak day: +10% XP
- 7-day streak: +70% XP
- 30-day streak: +300% XP

**Rank Bonus:**
- E-Rank: 1.0x (base)
- D-Rank: 1.2x
- C-Rank: 1.5x
- B-Rank: 1.8x
- A-Rank: 2.2x
- S-Rank: 3.0x

**Combined Example:**
```
Base XP: 50
Streak: 7 days (1.7x)
Rank: C (1.5x)
Total: 50 × 1.7 × 1.5 = 127.5 XP
```

### **Level Up Rewards**
```
✅ Focus +5
✅ Discipline +5
✅ Consistency +3
✅ Energy restored to 100
✅ Rank promotion check
```

---

## 🏆 RANK SYSTEM

### **Rank Requirements**

| Rank | Level | Discipline | Title | Multiplier |
|------|-------|------------|-------|------------|
| **E** | 1 | 0 | Novice Player | 1.0x |
| **D** | 5 | 30 | Awakened Hunter | 1.2x |
| **C** | 10 | 50 | Consistent Warrior | 1.5x |
| **B** | 20 | 70 | Disciplined Master | 1.8x |
| **A** | 35 | 85 | Elite Commander | 2.2x |
| **S** | 50 | 95 | Shadow Monarch | 3.0x |

### **Rank Benefits**

**Higher ranks unlock:**
- Increased XP gain
- More challenging quests
- Stricter AI accountability
- Elite status recognition
- Special achievements

### **Rank Promotion**
```
Automatic when BOTH conditions met:
1. Reach required level
2. Achieve required discipline stat

Example: D-Rank
✅ Level 5+
✅ Discipline 30+
→ RANK PROMOTION UNLOCKED
```

---

## 📜 QUEST SYSTEM

### **Quest Types**

#### ⚔️ **MAIN QUEST**
- **Trigger**: Highest priority task available
- **XP Reward**: 100
- **Stat Reward**: Discipline +5, Focus +3
- **Importance**: Critical for progression

#### 🎯 **SIDE QUESTS**
- **Trigger**: 2-4 medium/low priority tasks
- **XP Reward**: 50 each
- **Stat Reward**: Consistency +2
- **Importance**: Steady XP gain

#### 🚨 **EMERGENCY QUEST**
- **Trigger**: 0 tasks completed after 2 PM
- **XP Reward**: 150
- **Stat Reward**: Discipline +10, Energy -20
- **Importance**: Streak protection

### **Quest Generation**

**Daily Reset:**
- Midnight: New quests generated
- Based on current task list
- Scaled to player rank
- Never overwhelming

**Manual Trigger:**
- Keyboard: `Ctrl/Cmd + Shift + Q`
- Regenerates quests immediately

### **Quest Completion**

**When you complete a task:**
1. Quest automatically detected
2. XP awarded with multipliers
3. Stats increased
4. System message displayed
5. Level up check
6. Rank promotion check

**All Quests Complete Bonus:**
```
✅ +200 Bonus XP
✅ Streak protected
✅ Perfect execution recognized
```

---

## ⚠️ FAILURE SYSTEM

### **Task Skip Consequences**

**Immediate Penalties:**
```
❌ XP Lost: -10% of current XP
❌ Discipline: -5
❌ Consistency: -3
❌ Energy: -10
❌ Warning counter +1
```

**System Response:**
```
⚠️ SYSTEM WARNING: DISCIPLINE DROPPING
Warnings: 1
Consecutive Failures: 1
→ RECOVER NOW OR FACE RANK DEMOTION
```

### **Streak Break Consequences**

**Massive Penalties:**
```
🚨 XP Lost: -30% of current XP
🚨 Discipline: -15
🚨 Consistency: -20
🚨 Streak reset to 0
```

**System Response:**
```
🚨 CRITICAL FAILURE: STREAK BROKEN
Your consistency has been shattered.
→ START OVER. REBUILD YOUR DISCIPLINE FROM ZERO.
```

### **Consecutive Failures**

**3+ Failures:**
- Emergency quest activated
- Daily quest limit reduced
- Recovery mode triggered
- Strict warnings issued

---

## 🎯 SYSTEM MESSAGES

### **Message Types**

#### ⚡ **LEVEL UP ACHIEVED**
```
Congratulations! You've reached Level 5!
• Focus +5 → 35
• Discipline +5 → 35
• Consistency +3 → 23
• Energy Restored → 100
→ Your power grows. Continue your ascent to S-Rank.
```

#### 🏆 **RANK PROMOTION**
```
RANK PROMOTION: D RANK UNLOCKED
You are now an Awakened Hunter!
• XP Multiplier: 1.2x
• New challenges await
• Elite status achieved
→ The path to S-Rank continues. Stay disciplined.
```

#### ✅ **QUEST COMPLETE**
```
⚔️ MAIN QUEST COMPLETE
Quest cleared successfully!
• XP Gained: +127 (50 × 1.7 × 1.5)
• Discipline: +5
• Focus: +3
→ Next quest awaits. Keep pushing forward.
```

#### 🎊 **ALL QUESTS COMPLETE**
```
ALL DAILY QUESTS COMPLETE
Perfect execution. Bonus XP awarded.
• Bonus XP: +200
• Streak Protected: 7 days
• Rank: C (Consistent Warrior)
• Next Level: 89 XP
→ Tomorrow's challenges will be greater. Rest well, warrior.
```

#### 🚨 **EMERGENCY QUEST**
```
EMERGENCY QUEST ACTIVATED
You are falling behind. Immediate action required.
• Time Remaining: 10 hours
• Tasks Completed Today: 0
• Streak at Risk: 7 days
• Discipline: 45
→ COMPLETE ONE TASK NOW. YOUR STREAK DEPENDS ON IT.
```

---

## 🏅 ACHIEVEMENTS

### **Available Achievements**

| Achievement | Requirement | Reward |
|-------------|-------------|--------|
| **First Steps** | Complete 1 quest | Recognition |
| **Rising Power** | Reach Level 5 | Milestone |
| **Double Digits** | Reach Level 10 | Progress marker |
| **Awakened** | Reach D-Rank | Rank achievement |
| **Consistent Warrior** | Reach C-Rank | Elite status |
| **Master of Discipline** | Reach B-Rank | Mastery |
| **Elite Status** | Reach A-Rank | Top tier |
| **Shadow Monarch** | Reach S-Rank | Ultimate achievement |
| **Week Warrior** | 7-day streak | Consistency |
| **Month Master** | 30-day streak | Dedication |
| **Iron Will** | Discipline 50+ | Mental strength |
| **Unbreakable** | Discipline 100 | Maximum discipline |

### **Achievement Notifications**
```
🏆 ACHIEVEMENT UNLOCKED
Week Warrior
→ 7-day streak achieved. Your consistency is legendary.
```

---

## ⌨️ KEYBOARD SHORTCUTS

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + Shift + P` | Show Player Status |
| `Ctrl/Cmd + Shift + Q` | Generate Daily Quests |
| `Ctrl/Cmd + Shift + S` | Daily Summary (Coach) |
| `Ctrl/Cmd + Shift + R` | Refresh Coach Feedback |

---

## 🎮 GAMEPLAY LOOP

### **Daily Routine**

```
1. MORNING
   - Open app
   - View daily quests
   - Identify main quest
   - Plan execution

2. EXECUTION
   - Complete main quest first
   - Work through side quests
   - Track XP gains
   - Monitor stats

3. EVENING
   - Complete remaining quests
   - Protect streak
   - Review progress
   - Prepare for tomorrow

4. MIDNIGHT
   - Quests reset
   - New challenges generated
   - Cycle repeats
```

### **Progression Path**

```
E-Rank (Lv 1-4)
↓ Learn the basics
↓ Build initial discipline
↓ Complete first quests

D-Rank (Lv 5-9)
↓ Establish consistency
↓ Maintain streaks
↓ Increase XP multiplier

C-Rank (Lv 10-19)
↓ Master daily execution
↓ High completion rates
↓ Strong discipline

B-Rank (Lv 20-34)
↓ Elite performance
↓ Advanced challenges
↓ Exceptional consistency

A-Rank (Lv 35-49)
↓ Near-perfect execution
↓ Maximum discipline
↓ Legendary status

S-Rank (Lv 50+)
↓ Shadow Monarch
↓ Ultimate productivity
↓ Elite of the elite
```

---

## 💡 STRATEGY GUIDE

### **Maximize XP Gain**

1. **Protect Your Streak**
   - Complete at least 1 task daily
   - +10% XP per streak day
   - Compounds over time

2. **Prioritize Main Quests**
   - Highest XP reward (100)
   - Best stat bonuses
   - Critical for progression

3. **Complete All Quests**
   - +200 bonus XP
   - Perfect execution
   - Massive daily gains

4. **Rank Up Fast**
   - Focus on discipline stat
   - Maintain consistency
   - Level up regularly

### **Avoid Failures**

1. **Never Skip Tasks**
   - -10% XP penalty
   - Stat reductions
   - Warning accumulation

2. **Protect Streaks**
   - -30% XP on break
   - Massive stat loss
   - Hard to recover

3. **Complete Emergency Quests**
   - Triggered when falling behind
   - Saves your streak
   - High XP reward

### **Stat Management**

**Focus:**
- Increases with levels
- Boosts productivity
- Unlocks harder quests

**Discipline:**
- Required for rank ups
- Shows commitment
- Hardest to maintain

**Consistency:**
- Builds over time
- Streak dependent
- Long-term metric

**Energy:**
- Restored on level up
- Depleted by failures
- Manage carefully

---

## 🎯 EXAMPLE SCENARIOS

### **Scenario 1: Perfect Day**
```
Morning:
- 3 quests generated
- Main quest: "Complete urgent report"
- 2 side quests

Execution:
- Main quest complete: +127 XP
- Side quest 1 complete: +63 XP
- Side quest 2 complete: +63 XP
- All quests bonus: +200 XP

Result:
- Total XP: +453
- Level up: 5 → 6
- Stats increased
- Streak: 8 days
- Perfect execution
```

### **Scenario 2: Streak at Risk**
```
Evening (8 PM):
- 0 tasks completed today
- 7-day streak active
- Emergency quest triggered

System Message:
🚨 EMERGENCY QUEST ACTIVATED
Complete ANY task within 1 hour
Reward: +150 XP
→ YOUR STREAK DEPENDS ON IT

Action:
- Complete 1 task
- Streak saved
- Emergency XP gained
- Discipline +10
```

### **Scenario 3: Rank Promotion**
```
Current:
- Level: 10
- Discipline: 52
- Rank: D

Quest Complete:
- XP gained: +100
- Level up: 10 → 11
- Discipline: 52 → 57

System Check:
✅ Level 10+ (required for C-Rank)
✅ Discipline 50+ (required for C-Rank)

Result:
🏆 RANK PROMOTION: C RANK UNLOCKED
You are now a Consistent Warrior!
XP Multiplier: 1.2x → 1.5x
```

---

## 🚀 GETTING STARTED

### **1. Your First Day**
```
✅ Open app
✅ See your E-Rank status
✅ View generated quests
✅ Complete first task
✅ Earn first XP
✅ Start your journey
```

### **2. Build Your Streak**
```
Day 1: Complete 1 task
Day 2: Complete 1 task (+10% XP)
Day 3: Complete 1 task (+20% XP)
Day 7: Complete 1 task (+70% XP)
→ Unlock "Week Warrior" achievement
```

### **3. Reach D-Rank**
```
Target: Level 5, Discipline 30
Strategy:
- Complete main quests daily
- Maintain 7-day streak
- Focus on discipline gains
- Estimated time: 1-2 weeks
```

### **4. Master the System**
```
- Learn quest patterns
- Optimize XP gains
- Protect your streaks
- Climb to S-Rank
```

---

## 🎊 FINAL OBJECTIVE

**BECOME AN S-RANK SHADOW MONARCH**

Requirements:
- Level 50+
- Discipline 95+
- Unbreakable consistency
- Elite execution
- Legendary status

**The path is long. The journey is hard. But the reward is worth it.**

**→ NOW BEGIN YOUR ASCENT. YOUR FIRST QUEST AWAITS. 🎮**
