# 🏗️ Technical Architecture - Boostly AI

## 📐 System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        User Interface                        │
│  (HTML5 + CSS3 Glassmorphism + Particle Canvas Animation)  │
└───────────────────────┬─────────────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────────────┐
│                   Application Layer                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ DataManager  │  │  AIEngine    │  │ Particle     │      │
│  │   Class      │  │   Class      │  │ Background   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└───────────────────────┬─────────────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────────────┐
│                   Data Persistence                           │
│              (Browser LocalStorage API)                      │
└─────────────────────────────────────────────────────────────┘
```

## 🧩 Core Components

### 1. DataManager Class
**Purpose**: Centralized state management and persistence

**Responsibilities:**
- Load/save data from localStorage
- Manage application state
- Handle daily stat resets
- Provide default data structure

**Key Methods:**
```javascript
constructor()           // Initialize and load data
loadData()             // Retrieve from localStorage
getDefaultData()       // Return initial state
save()                 // Persist to localStorage
updateDailyStats()     // Reset daily counters
```

**Data Schema:**
```javascript
{
  points: Number,           // Total points earned
  pointsToday: Number,      // Points earned today
  streak: Number,           // Consecutive active days
  level: Number,            // Current level
  exp: Number,              // Experience points (0-100)
  tasks: Array<Task>,       // Task objects
  productivity: Array[7],   // Weekly scores
  focusScore: Number,       // Calculated metric
  completedToday: Number,   // Tasks done today
  totalFocusTime: Number,   // Seconds in focus mode
  lastActive: String,       // Date string
  preferences: Object,      // User settings
  history: Object          // Completed tasks/sessions
}
```

**Task Schema:**
```javascript
{
  text: String,            // Task description
  done: Boolean,           // Completion status
  category: String,        // AI-assigned category
  priority: String,        // high/medium/low
  createdAt: Number       // Timestamp
}
```

### 2. AIEngine Class
**Purpose**: Intelligent task analysis and predictions

**Responsibilities:**
- Categorize tasks using keyword matching
- Predict task priority
- Generate productivity insights
- Calculate focus score
- Forecast future performance

**Key Methods:**
```javascript
categorizeTask(text)      // Returns: work/personal/learning/creative/general
predictPriority(text)     // Returns: high/medium/low
generateInsights()        // Returns: Array of insight objects
predictTomorrow()         // Returns: Forecasted score
getPeakDay()             // Returns: Best performing day
calculateFocusScore()    // Returns: 0-100 score
suggestTimerDuration()   // Returns: {duration, reason}
```

**Algorithm Details:**

**Categorization:**
```javascript
// Keyword-based classification
Categories = {
  work: ['meeting', 'email', 'report', 'presentation', ...],
  personal: ['gym', 'shopping', 'family', 'health', ...],
  learning: ['study', 'read', 'course', 'research', ...],
  creative: ['design', 'write', 'create', 'video', ...]
}

Process:
1. Convert task text to lowercase
2. Check each category's keywords
3. Return first match or 'general'
```

**Priority Prediction:**
```javascript
// Urgency detection
HighPriority = ['urgent', 'asap', 'critical', 'deadline', 'today']
MediumPriority = ['soon', 'this week', 'tomorrow', 'follow up']

Process:
1. Scan for high-priority keywords → return 'high'
2. Scan for medium-priority keywords → return 'medium'
3. Default → return 'low'
```

**Focus Score Calculation:**
```javascript
Formula:
focusScore = (completionRate * 50) + streakBonus + levelBonus

Where:
- completionRate = completedTasks / totalTasks
- streakBonus = min(streak * 5, 30)  // Max 30 points
- levelBonus = level * 10

Range: 0-100
```

### 3. ParticleBackground Class
**Purpose**: Animated canvas background

**Responsibilities:**
- Initialize particle system
- Animate particles
- Draw connection lines
- Handle window resize

**Key Methods:**
```javascript
constructor()    // Setup canvas and particles
resize()        // Adjust to window size
init()          // Create particle array
animate()       // Render loop (60fps)
```

**Particle Object:**
```javascript
{
  x: Number,        // X position
  y: Number,        // Y position
  vx: Number,       // X velocity
  vy: Number,       // Y velocity
  radius: Number,   // Size (1-3px)
  opacity: Number   // Alpha (0.2-0.7)
}
```

**Animation Logic:**
```javascript
1. Clear canvas
2. For each particle:
   - Update position (x += vx, y += vy)
   - Bounce off edges
   - Draw circle
3. For each particle pair:
   - Calculate distance
   - If distance < 150px:
     - Draw connection line
     - Opacity based on distance
4. Request next frame
```

## 🎨 UI Components

### Stats Grid
**Structure:**
```html
<div class="stats-grid">
  <div class="stat-card glass-card">
    <div class="stat-icon">⭐</div>
    <div class="stat-content">
      <div class="stat-label">Points</div>
      <div class="stat-value">0</div>
      <div class="stat-trend">+0 today</div>
    </div>
  </div>
  <!-- 3 more cards -->
</div>
```

**Styling:**
- Grid layout (auto-fit, minmax(250px, 1fr))
- Glassmorphism effect
- Hover animations
- Gradient text for values

### Task Manager
**Structure:**
```html
<div class="task-manager glass-card">
  <div class="section-header">
    <h2>📋 Smart Task Manager</h2>
    <div class="task-filters">
      <button class="filter-btn active">All</button>
      <!-- More filters -->
    </div>
  </div>
  <div class="task-input-container">
    <input class="smart-input" />
    <button class="add-task-btn">Add Task</button>
  </div>
  <div class="task-list">
    <!-- Tasks rendered here -->
  </div>
</div>
```

**Task Rendering:**
```javascript
1. Get tasks from data
2. Apply active filter
3. Clear task list
4. For each task:
   - Create task div
   - Add priority indicator
   - Add text and category
   - Add action buttons
   - Append to list
5. Update stats
```

### Focus Timer
**Structure:**
```html
<div class="focus-timer glass-card">
  <div class="timer-display">
    <svg class="timer-ring">
      <circle class="timer-ring-bg" />
      <circle class="timer-ring-progress" />
    </svg>
    <div class="timer-content">
      <div class="timer-text">25:00</div>
      <div class="timer-phase">Ready to focus</div>
    </div>
  </div>
  <div class="timer-controls">
    <!-- Buttons -->
  </div>
</div>
```

**Ring Animation:**
```javascript
Circumference = 2 * π * radius = 2 * π * 90 = 565.48
Progress = 1 - (timeLeft / totalTime)
Offset = circumference * progress

SVG strokeDasharray = circumference
SVG strokeDashoffset = offset (animated)
```

## 🔄 Data Flow

### Task Addition Flow
```
User Input → addTask()
    ↓
AI Categorization (AIEngine.categorizeTask)
    ↓
AI Priority Prediction (AIEngine.predictPriority)
    ↓
Create Task Object
    ↓
Add to dm.data.tasks
    ↓
renderTasks() → Update DOM
    ↓
dm.save() → LocalStorage
    ↓
Show Notification
```

### Task Completion Flow
```
User Click → toggleTask(index)
    ↓
Toggle task.done
    ↓
If done:
  - Calculate points (15-30)
  - addPoints() → Update stats
  - Increment completedToday
  - Add to history
  - Show notification + sound
    ↓
renderTasks() → Update DOM
    ↓
updateStats() → Update UI
    ↓
dm.save() → LocalStorage
```

### Timer Flow
```
startTimer()
    ↓
Set isRunning = true
    ↓
setInterval (1000ms)
    ↓
Every second:
  - Decrement timeLeft
  - updateTimerDisplay()
  - Update ring offset
  - Update phase text
    ↓
When timeLeft = 0:
  - Calculate points
  - Add to history
  - Show notification
  - Reset timer
  - updateTimerSuggestion()
```

## 🎯 Performance Optimizations

### 1. Efficient Rendering
```javascript
// Batch DOM updates
const fragment = document.createDocumentFragment();
tasks.forEach(task => {
  const taskEl = createTaskElement(task);
  fragment.appendChild(taskEl);
});
taskList.appendChild(fragment);
```

### 2. Debounced Saves
```javascript
// Auto-save every 30s instead of every change
setInterval(() => dm.save(), 30000);
```

### 3. Chart Update Optimization
```javascript
// Disable animation on data updates
chart.update('none');
```

### 4. Hardware Acceleration
```css
/* Use transform and opacity for animations */
.task:hover {
  transform: translateX(4px);  /* GPU-accelerated */
}
```

### 5. Particle Optimization
```javascript
// Limit particle count
particleCount = 50;  // Balance between visual appeal and performance

// Efficient distance calculation
const dx = p1.x - p2.x;
const dy = p1.y - p2.y;
const distance = Math.sqrt(dx * dx + dy * dy);

// Only draw connections within threshold
if (distance < 150) {
  // Draw line
}
```

## 🔐 Security Considerations

### LocalStorage Safety
- No sensitive data stored
- All data client-side only
- No authentication required
- User can clear anytime

### XSS Prevention
```javascript
// Escape HTML in user input
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Use in rendering
taskDiv.innerHTML = `<span>${escapeHtml(task.text)}</span>`;
```

### Input Validation
```javascript
// Trim and check for empty
const text = taskInput.value.trim();
if (!text) {
  showNotification('Empty task', 'warning');
  return;
}
```

## 📊 Analytics & Tracking

### Metrics Collected
- Total points earned
- Daily points
- Task completion rate
- Focus time (seconds)
- Productivity scores (weekly)
- Level progression
- Streak duration

### Calculations
```javascript
// Completion Rate
completionRate = completedTasks / totalTasks * 100

// Average Productivity
avgProductivity = sum(productivity) / 7

// Peak Day
peakDay = days[productivity.indexOf(max(productivity))]

// Tomorrow Prediction
prediction = average(last3Days) * trendMultiplier
```

## 🧪 Testing Considerations

### Unit Tests (Recommended)
```javascript
// DataManager
test('loadData returns default when no storage', ...)
test('save persists to localStorage', ...)
test('updateDailyStats resets on new day', ...)

// AIEngine
test('categorizeTask returns correct category', ...)
test('predictPriority detects urgency', ...)
test('calculateFocusScore formula correct', ...)

// UI Functions
test('addTask creates task with AI data', ...)
test('toggleTask updates points correctly', ...)
test('renderTasks filters properly', ...)
```

### Integration Tests
```javascript
test('Complete task flow: add → complete → level up', ...)
test('Timer flow: start → complete → earn points', ...)
test('Daily reset: midnight rollover works', ...)
```

## 🔧 Configuration

### Customizable Constants
```javascript
// app.js
const expToLevelUp = 100;           // XP needed per level
const particleCount = 50;           // Background particles
const motivationalQuotes = [...];   // Quote array

// Modify for different difficulty
const pointsPerTask = {
  high: 30,
  medium: 20,
  low: 15
};
```

### CSS Variables
```css
/* styles.css */
:root {
  --primary: #00f5ff;
  --secondary: #ff00f5;
  --accent: #00ff87;
  /* Change for different theme */
}
```

## 📦 Dependencies

### External Libraries
- **Chart.js 4.4.0**: Productivity visualization
  - CDN: `https://cdn.jsdelivr.net/npm/chart.js@4.4.0`
  - Size: ~200KB
  - License: MIT

- **n8n Chat**: AI assistant integration
  - CDN: `https://cdn.jsdelivr.net/npm/@n8n/chat`
  - Size: ~150KB
  - License: Fair-code

- **Google Fonts**: Typography
  - Inter (300-800 weights)
  - JetBrains Mono (400-600 weights)
  - Size: ~100KB total

### Browser APIs Used
- LocalStorage API
- Canvas API
- Audio API
- RequestAnimationFrame API
- Date API

### Browser Compatibility
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 🚀 Deployment

### Static Hosting
Simply upload these files:
- index.html
- styles.css
- app.js
- README.md (optional)

### Recommended Hosts
- GitHub Pages (free)
- Netlify (free)
- Vercel (free)
- Cloudflare Pages (free)

### Build Process
**Not required** - vanilla HTML/CSS/JS runs directly

### Performance Checklist
- ✅ Minify CSS/JS for production
- ✅ Enable gzip compression
- ✅ Add cache headers
- ✅ Preload critical fonts
- ✅ Lazy load chart library

## 📈 Scalability

### Current Limits
- Tasks: ~1000 (localStorage limit ~5MB)
- History: Auto-prune old entries if needed
- Particles: 50 (adjustable)

### Future Scaling
- Implement IndexedDB for larger datasets
- Add data export/import
- Cloud sync option
- Pagination for task list

---

**Architecture designed for: Performance, Maintainability, Extensibility**

*Clean code, clear separation of concerns, ready for future enhancements*
