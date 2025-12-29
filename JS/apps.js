/*
  File: apps.js
  Purpose: Logic for the applications hub (games selection screen).
  Description:
  - Handles navigation between game pages.
  - Loads and displays current user data from LocalStorage.
  - Manages logout behavior.
*/

/* =========================
   Helpers (from storage.js)
========================= */
/*
  Assumes storage.js is loaded before apps.js.
  Available helper functions:
  - getUsers(): returns all registered users
  - getCurrentUser(): returns the username of the logged-in user
*/

/* =========================
   Navigation
========================= */
/*
  Redirects the user to the selected page.
*/
function goTo(page) {
  window.location.href = page;
}

/* =========================
   Load User Data
========================= */
/*
  On page load:
  - Fetches the current user from LocalStorage.
  - Retrieves user data (score, games played).
  - Updates the player info panel in the UI.
*/
document.addEventListener("DOMContentLoaded", () => {
  const usernameSpan = document.getElementById("username");
  const scoreSpan = document.getElementById("totalScore");
  const gamesSpan = document.getElementById("gamesPlayed");

  // Safety checks: ensure required DOM elements exist
  if (!usernameSpan || !scoreSpan || !gamesSpan) return;

  const currentUser = getCurrentUser();
  if (!currentUser) return;

  const users = getUsers();
  const user = users.find(u => u.username === currentUser);

  if (!user) return;

  // Display user data
  usernameSpan.textContent = user.username;
  scoreSpan.textContent = user.score ?? 0;
  gamesSpan.textContent = user.gamesPlayed ?? 0;
});

/* =========================
   Logout
========================= */
/*
  Clears the current user session and redirects to login page.
*/
function logout() {
  localStorage.removeItem("currentUser");
  window.location.href = "index.html"; // Redirect to login page
}
