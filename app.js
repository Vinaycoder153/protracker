/* -------------------- Utilities -------------------- */
const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);

/* -------------------- State -------------------- */
let state = {
  tasks: [], // {id,title,notes,due,repeat,priority,completed,createdAt,completedAt}
  points: 0,
  badges: [],
  lastCompletedDate: null,
};

/* -------------------- Persistence -------------------- */
function save() {
  localStorage.setItem("boostly_v1", JSON.stringify(state));
}
function load() {
  const raw = localStorage.getItem("boostly_v1");
  if (raw) {
    try {
      state = JSON.parse(raw);
    } catch (e) {
      console.error(e);
    }
  }
}

/* -------------------- Helpers -------------------- */
function uid() {
  return Math.random().toString(36).slice(2, 9);
}
function fmtDate(d) {
  if (!d) return "—";
  const dt = new Date(d);
  return dt.toLocaleString();
}

function isToday(dateStr) {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}
function inComingWeek(dateStr) {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const now = new Date();
  const oneWeek = 7 * 24 * 60 * 60 * 1000;
  return d - now <= oneWeek && d - now >= -24 * 60 * 60 * 1000;
}

/* -------------------- Badges & Points -------------------- */
const BADGE_DEFS = [
  {
    id: "first",
    name: "First Win",
    desc: "Complete your first task",
    points: 20,
  },
  { id: "5tasks", name: "Getting Hot", desc: "Complete 5 tasks", points: 50 },
  {
    id: "streak3",
    name: "3-Day Streak",
    desc: "Maintain a 3-day completion streak",
    points: 80,
  },
  {
    id: "pomodoro",
    name: "Focus Master",
    desc: "Complete a Pomodoro session",
    points: 30,
  },
  { id: "100points", name: "Centurion", desc: "Reach 100 points", points: 120 },
];

function awardPoints(n, reason) {
  state.points += n;
  notify(`+${n} pts — ${reason}`);
  checkBadges();
  save();
  renderSidebar();
}
function checkBadges() {
  // first task
  const completedCount = state.tasks.filter((t) => t.completed).length;
  unlockIf("first", completedCount >= 1);
  unlockIf("5tasks", completedCount >= 5);
  unlockIf("100points", state.points >= 100);
  // streak badge
  if (calculateStreak() >= 3) unlockIf("streak3", true);
}
function unlockIf(id, condition) {
  if (!condition) return;
  if (!state.badges.includes(id)) {
    state.badges.push(id);
    const def = BADGE_DEFS.find((b) => b.id === id);
    if (def) {
      awardPoints(def.points, `Badge: ${def.name}`);
      state.points -= def.points;
    } // avoid double-awarding points. We'll separately award in awardPoints when unlocking directly
    toast(`Badge unlocked: ${id}`);
  }
}

/* -------------------- Notification / Toast -------------------- */
function notify(msg) {
  // small toast
  const t = document.createElement("div");
  t.textContent = msg;
  t.style.position = "fixed";
  t.style.right = "16px";
  t.style.bottom = "16px";
  t.style.padding = "10px 14px";
  t.style.background = "rgba(0,0,0,0.6)";
  t.style.border = "1px solid rgba(255,255,255,0.04)";
  t.style.borderRadius = "10px";
  t.style.zIndex = 9999;
  document.body.appendChild(t);
  setTimeout(() => (t.style.opacity = "0.0"), 2400);
  setTimeout(() => t.remove(), 3000);
  // browser notification
  if ("Notification" in window && Notification.permission === "granted")
    new Notification("Boostly", { body: msg });
}
function toast(msg) {
  notify(msg);
}

/* -------------------- CRUD tasks -------------------- */
function addTask(ev) {
  if (ev) ev.preventDefault();
  const title = $("#title").value.trim();
  if (!title) return;
  const notes = $("#notes").value.trim();
  const due = $("#due").value || null;
  const repeat = $("#repeat").value;
  const priority = $("#priority").value;
  const t = {
    id: uid(),
    title,
    notes,
    due,
    repeat,
    priority,
    completed: false,
    createdAt: new Date().toISOString(),
    completedAt: null,
  };
  state.tasks.push(t);
  save();
  render();
  $("#taskForm").reset();
  notify("Task added — " + title);
}

function toggleComplete(id) {
  const t = state.tasks.find((x) => x.id === id);
  if (!t) return;
  t.completed = !t.completed;
  if (t.completed) {
    t.completedAt = new Date().toISOString();
    awardPoints(10, "Task Completed");
    state.lastCompletedDate = new Date().toISOString();
  } else {
    t.completedAt = null;
  }
  save();
  render();
}

function removeTask(id) {
  if (!confirm("Delete task?")) return;
  state.tasks = state.tasks.filter((t) => t.id !== id);
  save();
  render();
}

function editTask(id) {
  const t = state.tasks.find((x) => x.id === id);
  if (!t) return;
  $("#title").value = t.title;
  $("#notes").value = t.notes || "";
  $("#due").value = t.due ? new Date(t.due).toISOString().slice(0, 16) : "";
  $("#repeat").value = t.repeat || "none";
  $("#priority").value = t.priority || "medium";
  removeTask(id);
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// ================== PURE JS TIMER ================== //
let timerInterval;
let remaining = 0;
let isPaused = false;

function startTimer() {
  const input = document.getElementById("timerInput").value;
  if (!input || input <= 0) {
    alert("Enter valid minutes!");
    return;
  }

  if (!isPaused) {
    remaining = input * 60; // convert to seconds
  }
  isPaused = false;

  clearInterval(timerInterval);
  timerInterval = setInterval(updateTimer, 1000);
}

function pauseTimer() {
  isPaused = true;
  clearInterval(timerInterval);
}

function resetTimer() {
  clearInterval(timerInterval);
  remaining = 0;
  isPaused = false;
  document.getElementById("timerDisplay").textContent = "00:00";
}

function updateTimer() {
  if (remaining > 0) {
    remaining--;
    const mins = String(Math.floor(remaining / 60)).padStart(2, "0");
    const secs = String(remaining % 60).padStart(2, "0");
    document.getElementById("timerDisplay").textContent = `${mins}:${secs}`;
  } else {
    clearInterval(timerInterval);
    document.getElementById("timerDisplay").textContent = "00:00";
    // 🎉 Add points when session completes
    const pointsEl = document.getElementById("points");
    pointsEl.textContent = parseInt(pointsEl.textContent) + 10;
    alert("🎉 Focus session complete! You earned 10 points!");
  }
}

/* -------------------- Views & Render -------------------- */
function renderSidebar() {
  $("#points").textContent = state.points;
  $("#streak").textContent = calculateStreak();
  const bl = $("#badgeList");
  bl.innerHTML = "";
  state.badges.forEach((id) => {
    const def = BADGE_DEFS.find((b) => b.id === id);
    const el = document.createElement("div");
    el.className = "badge";
    el.textContent = def ? def.name : id;
    bl.appendChild(el);
  });
}

function renderTasks() {
  const q = $("#search").value.trim().toLowerCase();
  const filter = $("#filter").value;
  let tasks = state.tasks
    .slice()
    .sort(
      (a, b) =>
        a.completed - b.completed || new Date(a.due || 0) - new Date(b.due || 0)
    );
  if (filter === "incomplete") tasks = tasks.filter((t) => !t.completed);
  if (filter === "completed") tasks = tasks.filter((t) => t.completed);
  if (q)
    tasks = tasks.filter((t) => (t.title + t.notes).toLowerCase().includes(q));
  const list = $("#taskList");
  list.innerHTML = "";
  tasks.forEach((t) => {
    const item = document.createElement("div");
    item.className = "task";
    const left = document.createElement("div");
    left.className = "task-left";
    const dot = document.createElement("div");
    dot.className = "dot";
    dot.style.background = t.completed
      ? "linear-gradient(90deg, #10b981,#06b6d4)"
      : t.priority === "high"
      ? "linear-gradient(90deg,#ef4444,#f97316)"
      : t.priority === "medium"
      ? "linear-gradient(90deg,#f59e0b,#f97316)"
      : "#94a3b8";
    const txt = document.createElement("div");
    const title = document.createElement("div");
    title.className = "title";
    title.textContent =
      t.title + (t.repeat && t.repeat !== "none" ? ` • ${t.repeat}` : "");
    const meta = document.createElement("div");
    meta.className = "meta";
    meta.textContent = `${fmtDate(t.due)} • ${t.priority}`;
    txt.appendChild(title);
    txt.appendChild(meta);
    left.appendChild(dot);
    left.appendChild(txt);

    const actions = document.createElement("div");
    actions.className = "actions";
    const cBtn = document.createElement("button");
    cBtn.className = "complete";
    cBtn.textContent = t.completed ? "Undo" : "Done";
    cBtn.onclick = () => toggleComplete(t.id);
    const eBtn = document.createElement("button");
    eBtn.className = "complete";
    eBtn.textContent = "Edit";
    eBtn.onclick = () => editTask(t.id);
    const del = document.createElement("button");
    del.className = "complete";
    del.textContent = "✕";
    del.onclick = () => removeTask(t.id);
    actions.appendChild(cBtn);
    actions.appendChild(eBtn);
    actions.appendChild(del);

    item.appendChild(left);
    item.appendChild(actions);
    list.appendChild(item);
  });
}

function renderSchedule() {
  $("#todayCount").textContent =
    state.tasks.filter((t) => isToday(t.due) && !t.completed).length + " tasks";
  $("#weekCount").textContent =
    state.tasks.filter((t) => inComingWeek(t.due) && !t.completed).length +
    " tasks";
  $("#completedCount").textContent = state.tasks.filter(
    (t) => t.completed
  ).length;
  const total = state.tasks.length || 1;
  const completed = state.tasks.filter((t) => t.completed).length;
  $("#progressBar").style.width = Math.round((completed / total) * 100) + "%";
}

function render() {
  renderSidebar();
  renderTasks();
  renderSchedule();
}

/* -------------------- Simple Streak logic -------------------- */
function calculateStreak() {
  // streak = consecutive days with at least 1 completed task
  const doneDates = [
    ...new Set(
      state.tasks
        .filter((t) => t.completed && t.completedAt)
        .map((t) => new Date(t.completedAt).toDateString())
    ),
  ].sort((a, b) => new Date(b) - new Date(a));
  if (doneDates.length === 0) return 0;
  let streak = 0;
  let cur = new Date();
  for (let i = 0; i < 100; i++) {
    const ds = new Date(cur - i * 24 * 60 * 60 * 1000).toDateString();
    if (doneDates.includes(ds)) streak++;
    else break;
  }
  return streak;
}

/* -------------------- Pomodoro (light) -------------------- */
function startPomodoro() {
  const duration = 25 * 60; // 25 minutes
  let remaining = duration;
  notify("Pomodoro started: 25m");
  const id = setInterval(() => {
    remaining--;
    if (remaining % 60 === 0)
      console.log("pomodoro", remaining / 60 + "m left");
    if (remaining <= 0) {
      clearInterval(id);
      notify("Pomodoro finished — take a 5m break");
      awardPoints(15, "Pomodoro complete");
      unlockIf("pomodoro", true);
      save();
      renderSidebar();
    }
  }, 1000);
}

/* -------------------- Schedule runner (handles recurring tasks & daily refresh) -------------------- */
function processRecurring() {
  // For tasks marked repeat, if original due has passed and not completed, create next occurrence
  const now = new Date();
  state.tasks.forEach((t) => {
    if (t.repeat && t.repeat !== "none" && t.due) {
      const due = new Date(t.due);
      if (due < now && !t._generatedNext) {
        let next = new Date(due);
        if (t.repeat === "daily") next.setDate(next.getDate() + 1);
        if (t.repeat === "weekly") next.setDate(next.getDate() + 7);
        if (t.repeat === "monthly") next.setMonth(next.getMonth() + 1);
        const copy = {
          ...t,
          id: uid(),
          due: next.toISOString(),
          completed: false,
          createdAt: new Date().toISOString(),
          completedAt: null,
          _generatedNext: true,
        };
        state.tasks.push(copy);
        t._generatedNext = true; // prevent infinite loop for single run
      }
    }
  });
}
// ================= FUTURISTIC PRODUCTIVITY GRAPH =================
const ctx = document.getElementById("productivityChart").getContext("2d");

// Create a gradient glow
const gradient = ctx.createLinearGradient(0, 0, 0, 400);
gradient.addColorStop(0, "rgba(0, 255, 255, 0.8)");
gradient.addColorStop(1, "rgba(0, 128, 255, 0.2)");

const productivityChart = new Chart(ctx, {
  type: "line",
  data: {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        label: "🔥 Productivity Score",
        data: [3, 6, 5, 7, 9, 4, 10], // Example productivity data
        borderColor: "#00ffff",
        backgroundColor: gradient,
        borderWidth: 3,
        fill: true,
        tension: 0.5, // smooth flowing curves
        pointBackgroundColor: "#111",
        pointBorderColor: "#00ffff",
        pointRadius: 7,
        pointHoverRadius: 10,
        pointHoverBackgroundColor: "#00ffff",
        pointHoverBorderColor: "#fff",
      },
    ],
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: "#00ffff", font: { size: 14 } } },
      tooltip: {
        backgroundColor: "#111",
        borderColor: "#00ffff",
        borderWidth: 1,
        titleColor: "#00ffff",
        bodyColor: "#fff",
        bodyFont: { size: 14 },
      },
    },
    scales: {
      x: {
        ticks: { color: "#00ffff", font: { weight: "bold" } },
        grid: { color: "rgba(0,255,255,0.2)" },
      },
      y: {
        ticks: { color: "#00ffff", font: { weight: "bold" } },
        grid: { color: "rgba(0,255,255,0.2)" },
      },
    },
    animation: {
      duration: 2000,
      easing: "easeInOutQuart",
    },
  },
});

/* -------------------- Init -------------------- */
function init() {
  load();
  processRecurring();
  render();
  // events
  $("#taskForm").addEventListener("submit", addTask);
  $("#search").addEventListener("input", renderTasks);
  $("#filter").addEventListener("change", renderTasks);
  $$(".nav button").forEach((b) =>
    b.addEventListener("click", (e) => {
      $$(".nav button").forEach((x) => x.classList.remove("active"));
      e.currentTarget.classList.add("active");
      $("#viewTitle").textContent =
        {
          today: "Today's Tasks",
          all: "All Tasks",
          calendar: "Calendar",
          pomodoro: "Pomodoro",
          rewards: "Rewards",
        }[e.currentTarget.dataset.view] || "Tasks";
    })
  );
  $("#themeToggle").addEventListener("click", () => {
    document.body.classList.toggle("light");
    if (document.body.classList.contains("light")) {
      document.documentElement.style.setProperty("--bg", "#f7f9fc");
      document.documentElement.style.setProperty("--card", "#ffffff");
      document.documentElement.style.setProperty("--muted", "#4b5563");
      document.documentElement.style.setProperty("--accent1", "#7c3aed");
      document.documentElement.style.setProperty("--accent2", "#06b6d4");
      document.body.style.color = "#031226";
    } else {
      document.documentElement.removeAttribute("style");
      document.body.style.color = "#e6eef6";
    }
  });

  // permission for notifications
  if ("Notification" in window && Notification.permission !== "granted")
    Notification.requestPermission();

  // sample starter tasks if empty
  if (state.tasks.length === 0) {
    state.tasks.push({
      id: uid(),
      title: "Plan your day",
      notes: "Assign 1 main priority and 2 small wins",
      due: new Date().toISOString(),
      repeat: "daily",
      priority: "high",
      completed: false,
      createdAt: new Date().toISOString(),
      completedAt: null,
    });
    state.tasks.push({
      id: uid(),
      title: "Study / Code session",
      notes: "Use Pomodoro — 25/5",
      due: new Date().toISOString(),
      repeat: "none",
      priority: "medium",
      completed: false,
      createdAt: new Date().toISOString(),
      completedAt: null,
    });
    save();
  }

  // small interval to auto-save & handle recurring every minute
  setInterval(() => {
    processRecurring();
    save();
    render();
  }, 60 * 1000);
}

// run
init();
