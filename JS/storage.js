/*
  File: storage.js
  Purpose: Provides utility functions for LocalStorage data management.
  Description:
  - Handles user persistence (users list and current user).
  - Centralizes read/write operations to LocalStorage.
  - Updates user score and game statistics.
*/

/*
  Returns the list of registered users from LocalStorage.
  If no users exist, returns an empty array.
*/
function getUsers() {
  return JSON.parse(localStorage.getItem("users")) || [];
}

/*
  Saves the full users array to LocalStorage.
*/
function saveUsers(users) {
  localStorage.setItem("users", JSON.stringify(users));
}

/*
  Returns the username of the currently logged-in user.
*/
function getCurrentUser() {
  return localStorage.getItem("currentUser");
}

/*
  Sets the currently logged-in user.
*/
function setCurrentUser(username) {
  localStorage.setItem("currentUser", username);
}

/*
  Updates the current user's game results.
  - Adds points to the total score.
  - Increments the number of games played.
*/
function updateCatchGameResult(points) {
  const users = getUsers();
  const username = getCurrentUser();

  const user = users.find(u => u.username === username);
  if (!user) return;

  // Update total score
  user.score = (user.score || 0) + points;

  // Update played games count
  user.gamesPlayed = (user.gamesPlayed || 0) + 1;

  saveUsers(users);
}
