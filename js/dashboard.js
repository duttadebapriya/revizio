// 🧠 Utilities
function formatDate(date) {
  return date.toISOString().split("T")[0];
}
function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

// 🧑‍🎓 Load current user
const currentUser = localStorage.getItem("revizio-current-user");
if (!currentUser) window.location.href = "login.html";

const storedUsers = JSON.parse(localStorage.getItem("revizio-users")) || {};
if (!storedUsers[currentUser]) window.location.href = "login.html";

// 👋 Personalized Greeting
const quotes = [
  "Revision is the heartbeat of retention.",
  "Small steps every day lead to giant leaps tomorrow.",
  "Success is built one review at a time.",
  "Be consistent, not perfect.",
];
document.getElementById("usernameDisplay").innerText = currentUser;
document.getElementById("motivationalQuote").innerText =
  quotes[Math.floor(Math.random() * quotes.length)];

// ✅ Handle Topic Add
function handleAddTopic() {
  const input = document.getElementById("topicInput");
  const topicName = input.value.trim();
  if (topicName === "") return alert("Please enter a topic name!");

  const users = JSON.parse(localStorage.getItem("revizio-users")) || {};
  const today = new Date();
  const revisionDates = [
    formatDate(addDays(today, 1)),
    formatDate(addDays(today, 7)),
    formatDate(addDays(today, 21)),
  ];

  const topic = {
    name: topicName,
    addedOn: formatDate(today),
    revisionDates,
    completed: [],
  };

  if (!users[currentUser]) users[currentUser] = { topics: [] };
  if (!users[currentUser].topics) users[currentUser].topics = [];

  users[currentUser].topics.push(topic);
  localStorage.setItem("revizio-users", JSON.stringify(users));
  input.value = "";
  renderTopics();
  renderTodayRevisions();
  updateStreak();
  renderCalendar();
  renderProgressChart();
}

// 🧹 Clear All Topics
function clearMyTopics() {
  const users = JSON.parse(localStorage.getItem("revizio-users")) || {};
  if (users[currentUser]) {
    users[currentUser].topics = [];
    localStorage.setItem("revizio-users", JSON.stringify(users));
  }
  renderTopics();
  renderTodayRevisions();
  updateStreak();
  renderCalendar();
  renderProgressChart();
}

// ✅ Render Topics
function renderTopics() {
  const users = JSON.parse(localStorage.getItem("revizio-users")) || {};
  const topicList = document.getElementById("topicList");
  topicList.innerHTML = "";

  const topics = users[currentUser]?.topics || [];

  topics.forEach((topic, index) => {
    const nextRev = topic.revisionDates.find(
      (date) => !topic.completed.includes(date)
    );

    const revBadges = topic.revisionDates
      .map((date) => {
        const isDone = topic.completed.includes(date);
        return `<span class="rev-badge ${isDone ? "done" : ""}">${date}</span>`;
      })
      .join("");

    const card = document.createElement("div");
    card.className = "topic-card";
    card.innerHTML = `
      <div class="card-header">
        <h3 contenteditable="true" onblur="editTopicName(${index}, this.innerText)">${
      topic.name
    }</h3>
        <button onclick="deleteTopic(${index})" class="delete-btn">🗑️</button>
      </div>
      <p>🗓 Revisions: ${revBadges}</p>
      ${
        nextRev
          ? `<button onclick="markAsDone(${index}, '${nextRev}')">Mark as Done ✅</button>`
          : `<p>✅ All Revisions Done!</p>`
      }
    `;
    topicList.appendChild(card);
  });
}


// 🗑️ Delete Topic
function deleteTopic(index) {
  const users = JSON.parse(localStorage.getItem("revizio-users")) || {};
  users[currentUser].topics.splice(index, 1);
  localStorage.setItem("revizio-users", JSON.stringify(users));
  renderTopics();
  renderTodayRevisions();
  updateStreak();
  renderCalendar();
  renderProgressChart();
}

// ✏️ Edit Topic Name
function editTopicName(index, newName) {
  const users = JSON.parse(localStorage.getItem("revizio-users")) || {};
  users[currentUser].topics[index].name = newName.trim();
  localStorage.setItem("revizio-users", JSON.stringify(users));
}

// ✅ Mark Revision Complete
function markAsDone(index, date) {
  const users = JSON.parse(localStorage.getItem("revizio-users")) || {};
  const topic = users[currentUser].topics[index];
  if (!topic.completed.includes(date)) {
    topic.completed.push(date);
  }
  localStorage.setItem("revizio-users", JSON.stringify(users));
  renderTopics();
  renderTodayRevisions();
  updateStreak();
  renderProgressChart();
}

// 🗓️ Calendar
function renderCalendar() {
  const users = JSON.parse(localStorage.getItem("revizio-users")) || {};
  const topics = users[currentUser]?.topics || [];
  const calendar = {};

  topics.forEach((topic) => {
    topic.revisionDates.forEach((date) => {
      if (!topic.completed.includes(date)) {
        if (!calendar[date]) calendar[date] = [];
        calendar[date].push(topic.name);
      }
    });
  });

  const calList = document.getElementById("revisionCalendar");
  calList.innerHTML = "";

  Object.keys(calendar)
    .sort()
    .forEach((date) => {
      const li = document.createElement("li");
      li.innerText = `${date}: ${calendar[date].join(", ")}`;
      calList.appendChild(li);
    });
}

// 🔔 Today’s Revisions
function renderTodayRevisions() {
  const users = JSON.parse(localStorage.getItem("revizio-users")) || {};
  const today = formatDate(new Date());
  const topics = users[currentUser]?.topics || [];

  const todayTopics = topics.filter(
    (topic) =>
      topic.revisionDates.includes(today) && !topic.completed.includes(today)
  );

  const list = document.getElementById("todayList");
  const msg = document.getElementById("noRevisionsMsg");

  list.innerHTML = "";
  if (todayTopics.length === 0) {
    msg.style.display = "block";
  } else {
    msg.style.display = "none";
    todayTopics.forEach((topic) => {
      list.innerHTML += `<li>📘 ${topic.name}</li>`;
    });
  }
}

// 🔥 Streak Counter
function updateStreak() {
  const today = formatDate(new Date());
  const users = JSON.parse(localStorage.getItem("revizio-users")) || {};
  const streakKey = `${currentUser}-revizio-streak`;

  let streakData = JSON.parse(localStorage.getItem(streakKey)) || {
    lastDate: null,
    count: 0,
  };

  const yesterday = formatDate(addDays(new Date(), -1));
  const didReviseToday = (users[currentUser].topics || []).some((topic) =>
    topic.completed.includes(today)
  );

  if (didReviseToday) {
    streakData.count =
      streakData.lastDate === yesterday ? streakData.count + 1 : 1;
    streakData.lastDate = today;
  } else if (streakData.lastDate !== today) {
    // Missed today or no data yet → reset streak
    streakData.count = 0;
    streakData.lastDate = today;
  }

  localStorage.setItem(streakKey, JSON.stringify(streakData));
  document.getElementById("streakCount").innerText = streakData.count;
}

// 📊 Progress Chart
function renderProgressChart() {
  const users = JSON.parse(localStorage.getItem("revizio-users")) || {};
  const topics = users[currentUser]?.topics || [];
  const revisionCounts = {};

  topics.forEach((topic) => {
    topic.completed.forEach((date) => {
      revisionCounts[date] = (revisionCounts[date] || 0) + 1;
    });
  });

  const sortedDates = Object.keys(revisionCounts).sort();
  const counts = sortedDates.map((date) => revisionCounts[date]);

  const ctx = document.getElementById("progressChart").getContext("2d");
  new Chart(ctx, {
    type: "bar",
    data: {
      labels: sortedDates,
      datasets: [
        {
          label: "Revisions Done",
          data: counts,
          backgroundColor: "#5e81f4",
          borderRadius: 8,
        },
      ],
    },
    options: {
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true } },
    },
  });
}

// 🚀 Initial Load
renderTopics();
renderTodayRevisions();
renderCalendar();
updateStreak();
renderProgressChart();
