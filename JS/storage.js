function getUsers() {
  return JSON.parse(localStorage.getItem("users")) || [];
}

function saveUsers(users) {
  localStorage.setItem("users", JSON.stringify(users));
}

function getCurrentUser() {
  return localStorage.getItem("currentUser");
}

function setCurrentUser(username) {
  localStorage.setItem("currentUser", username);
}

/* 🔑 עדכון תוצאה של Catch Game */
function updateCatchGameResult(points) {
  const users = getUsers();
  const username = getCurrentUser();

  const user = users.find(u => u.username === username);
  if (!user) return;

  // ניקוד כולל
  user.score = (user.score || 0) + points;

  // משחקים ששוחקו
  user.gamesPlayed = (user.gamesPlayed || 0) + 1;

  saveUsers(users);
}
