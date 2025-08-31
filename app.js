// ---------------- LocalStorage Data ----------------
let data = JSON.parse(localStorage.getItem("boostlyData")) || {
  points: 0,
  streak: 0,
  level: 1,
  exp: 0,
  tasks: [],
  productivity: [0, 0, 0, 0, 0, 0, 0],
};
const expToLevelUp = 100;

// ---------------- Gamification ----------------
function updateStats() {
  document.getElementById("points").innerText = data.points;
  document.getElementById("streak").innerText = data.streak;
  document.getElementById("level").innerText = data.level;
  document.getElementById("progressFill").style.width =
    (data.exp / expToLevelUp) * 100 + "%";

  let badgesDiv = document.getElementById("badges");
  badgesDiv.innerHTML = "";
  if (data.streak >= 3)
    badgesDiv.innerHTML += `<span class="badge">🔥 3-Day Streak</span>`;
  if (data.streak >= 7)
    badgesDiv.innerHTML += `<span class="badge">🔥 7-Day Streak</span>`;
  if (data.streak >= 30)
    badgesDiv.innerHTML += `<span class="badge">🔥 30-Day Streak</span>`;
  if (data.points >= 200)
    badgesDiv.innerHTML += `<span class="badge">💎 200 Points</span>`;
  if (data.points >= 500)
    badgesDiv.innerHTML += `<span class="badge">💎 500 Points</span>`;
  if (data.points >= 1000)
    badgesDiv.innerHTML += `<span class="badge">💎 1000 Points</span>`;
  if (data.level >= 2)
    badgesDiv.innerHTML += `<span class="badge">⭐ Level 2+</span>`;
  if (data.level >= 5)
    badgesDiv.innerHTML += `<span class="badge">🌟 Level 5+</span>`;
  if (data.level >= 10)
    badgesDiv.innerHTML += `<span class="badge">🏆 Level 10+</span>`;
  if (data.level >= 20)
    badgesDiv.innerHTML += `<span class="badge">🏆 Level 20+</span>`;
  if (data.level >= 30)
    badgesDiv.innerHTML += `<span class="badge">👑 Level 30+</span>`;
  if (data.level >= 50)
    badgesDiv.innerHTML += `<span class="badge">👑 Level 50+</span>`;
  if (data.level >= 100)
    badgesDiv.innerHTML += `<span class="badge">💖 Level 100+</span>`;
  if (data.level >= 200)
    badgesDiv.innerHTML += `<span class="badge">🚀 Level 200+</span>`;
  if (data.level >= 500)
    badgesDiv.innerHTML += `<span class="badge">🎯 Level 500+</span>`;
  saveData();
}

function addPoints(amount) {
  data.points += amount;
  data.exp += amount;
  if (data.exp >= expToLevelUp) {
    data.exp = 0;
    data.level++;
    document.getElementById("sound-levelup").play();
    alert("🎉 Level Up! You reached Level " + data.level);
  }
  document.getElementById("sound-complete").play();
  updateStats();
  updateChart();
}

function updateStreak() {
  const today = new Date().toDateString();
  if (data.lastDate === today) return; // already counted today

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  if (data.lastDate === yesterday.toDateString()) {
    data.streak++;
  } else {
    data.streak = 1;
  }

  data.lastDate = today;
}

// ---------------- Task Manager ----------------
const quotes = [
  "🚀 Keep going, success is near!",
  "💡 Focus today, shine tomorrow.",
  "🔥 Small steps build big results.",
  "🌟 Your effort creates your future.",
  "💪 Stay strong, you are doing great!",
  "🎯 Every task completed is a win!",
  "💪 Keep pushing, you are unstoppable",
  "🌈 Your hard work will pay off!",
  "🌟 Keep your eyes on the prize!",
  "💪 Your dreams are within reach!",
  "🎯 Every day is a new opportunity!",
  "💪 Keep your focus, you are unstoppable!",
  "🚀 Your dedication is inspiring!",
  "🌟 Believe in yourself and all that you are!",
  "🔥 Success is the sum of small efforts repeated!",
  "💡 Stay positive, work hard, make it happen!",
];

function renderTasks() {
  const taskList = document.getElementById("taskList");
  taskList.innerHTML = "";
  data.tasks.forEach((task, i) => {
    let taskDiv = document.createElement("div");
    taskDiv.className = "task";
    taskDiv.innerHTML = task.editing
      ? `<div><input type="text" value="${task.text}" aria-label="Edit task" onblur="saveEdit(${i}, this.value)" /></div>`
      : `<div>
                  <span style="${
                    task.done ? "text-decoration: line-through;" : ""
                  }">${task.text}</span>
                  <div>
                    <button onclick="toggleTask(${i})" aria-label="${
          task.done ? "Undo task" : "Mark task as done"
        }">${task.done ? "Undo" : "Done"}</button>
                    <button onclick="editTask(${i})" aria-label="Edit task" class="editor">Edit</button>
                    <button onclick="deleteTask(${i})" aria-label="Delete task" class="delete">Delete</button>
                  </div>
               </div>`;
    taskList.appendChild(taskDiv);
  });
  saveData();
}

function addTask() {
  const taskInput = document.getElementById("taskInput");
  const text = taskInput.value.trim();
  if (!text) return;
  data.tasks.push({ text, done: false, editing: false });
  taskInput.value = "";
  renderTasks();
}

function toggleTask(i) {
  let task = data.tasks[i];
  task.done = !task.done;
  if (task.done) {
    addPoints(20);
    confettiBurst();
    alert(quotes[Math.floor(Math.random() * quotes.length)]);
  } else data.points -= 20;
  renderTasks();
  updateStats();
  updateStreak();
}

function editTask(i) {
  data.tasks[i].editing = true;
  renderTasks();
}
function saveEdit(i, newText) {
  data.tasks[i].text = newText;
  data.tasks[i].editing = false;
  renderTasks();
}
function deleteTask(i) {
  data.tasks.splice(i, 1);
  document.getElementById("sound-delete").play();
  renderTasks();
}

// ---------------- Focus Timer ----------------
let timerunner = false;
let timerInterval,
  timeLeft = 25 * 60;
function updateTimerDisplay() {
  const minutes = Math.floor(timeLeft / 60),
    seconds = timeLeft % 60;
  document.getElementById("timer").innerText = `${minutes}:${
    seconds < 10 ? "0" : ""
  }${seconds}`;
}
function startTimer() {
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    if (timeLeft > 0) {
      timeLeft--;
      updateTimerDisplay();
    } else {
      clearInterval(timerInterval);
      alert("⏰ Time's up! +50 points!");
      addPoints(50);
      timeLeft = 25 * 60;
      updateTimerDisplay();
    }
  }, 1000);
}

function pauseTimer() {
  clearInterval(timerInterval);
  timerunner = false;
  document.getElementById("sound-pause").play();
}

function resetTimer() {
  clearInterval(timerInterval);
  timeLeft = 25 * 60;
  updateTimerDisplay();
}

// ---------------- Productivity Chart ----------------
const ctx = document.getElementById("productivityChart").getContext("2d");
const gradient = ctx.createLinearGradient(0, 0, 0, 400);
gradient.addColorStop(0, "#00ff87");
gradient.addColorStop(1, "#ff0057");

const chart = new Chart(ctx, {
  type: "line",
  data: {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        label: "Productivity Score",
        data: data.productivity,
        borderColor: "#fff",
        backgroundColor: gradient,
        fill: true,
        tension: 0.4,
      },
    ],
  },
  options: {
    responsive: true,
    plugins: { legend: { labels: { color: "white" } } },
    scales: {
      x: { ticks: { color: "white" } },
      y: { ticks: { color: "white" } },
    },
  },
});

function updateChart() {
  let today = new Date().getDay();
  let idx = today === 0 ? 6 : today - 1;
  data.productivity[idx] += 1;
  chart.data.datasets[0].data = data.productivity;
  chart.update();
  saveData();
}

// ---------------- Save & Init ----------------
function saveData() {
  localStorage.setItem("boostlyData", JSON.stringify(data));
}
updateTimerDisplay();
renderTasks();
updateStats();
