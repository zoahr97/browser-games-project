const usernameSpan = document.getElementById("username");
const scoreSpan = document.getElementById("totalScore");
const gamesSpan = document.getElementById("gamesPlayed");

const currentUser = getCurrentUser();
if (!currentUser) {
  window.location.href = "index.html";
}

const users = getUsers();
const user = users.find(u => u.username === currentUser);

if (user) {
  usernameSpan.textContent = user.username;
  scoreSpan.textContent = user.score || 0;
  gamesSpan.textContent = user.gamesPlayed || 0;
}
