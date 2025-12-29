/*
  File: auth.js
  Purpose: Handles user authentication (register & login).
  Description:
  - Manages user registration and login forms.
  - Implements login attempt limits and temporary lockout.
  - Stores authentication state using LocalStorage only.
*/

/* =========================
   CONFIG
========================= */
/*
  MAX_ATTEMPTS: Maximum allowed failed login attempts.
  LOCK_TIME: Lock duration in seconds after exceeding attempts.
*/
const MAX_ATTEMPTS = 3;
const LOCK_TIME = 60; // seconds

/* =========================
   Feedback helper
========================= */
/*
  Displays feedback messages to the user.
  type can be: "success", "error", or "warning".
*/
function showFeedback(text, type = "error") {
  const msg = document.getElementById("message");
  if (!msg) return;

  msg.className = `feedback ${type}`;
  msg.textContent = text;
  msg.style.display = "block";
}

/* =========================
   REGISTER
========================= */
/*
  Handles new user registration.
  - Validates input fields.
  - Prevents duplicate usernames.
  - Saves new user to LocalStorage.
*/
const registerForm = document.getElementById("registerForm");

if (registerForm) {
  registerForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const username = regUsername.value.trim();
    const password = regPassword.value.trim();

    // Validate required fields
    if (!username || !password) {
      showFeedback("Please fill in all fields", "warning");
      return;
    }

    const users = getUsers();

    // Prevent duplicate usernames
    if (users.find(u => u.username === username)) {
      showFeedback("Username already exists", "error");
      return;
    }

    // Save new user
    users.push({ username, password });
    saveUsers(users);

    showFeedback("Registration successful! Redirecting to login…", "success");

    // Redirect to login page
    setTimeout(() => {
      window.location.href = "index.html";
    }, 1200);
  });
}

/* =========================
   LOGIN
========================= */
/*
  Handles user login process.
  - Validates credentials.
  - Tracks failed login attempts.
  - Locks user temporarily after too many failures.
*/
const loginForm = document.getElementById("loginForm");

if (loginForm) {
  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");

  loginForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    const lockKey = `lock_${username}`;
    const attemptsKey = `attempts_${username}`;
    const now = Date.now();

    const lockUntil = Number(localStorage.getItem(lockKey));

    /* 🔓 If lock expired – reset attempts */
    if (lockUntil && now >= lockUntil) {
      localStorage.removeItem(lockKey);
      localStorage.removeItem(attemptsKey);
    }

    /* 🔒 User is still locked */
    if (lockUntil && now < lockUntil) {
      startCountdown(Math.ceil((lockUntil - now) / 1000));
      return;
    }

    const users = getUsers();
    const user = users.find(
      u => u.username === username && u.password === password
    );

    /* ❌ Wrong credentials */
    if (!user) {
      let attempts = Number(localStorage.getItem(attemptsKey)) || 0;
      attempts++;
      localStorage.setItem(attemptsKey, attempts);

      if (attempts >= MAX_ATTEMPTS) {
        const lockTime = now + LOCK_TIME * 1000;
        localStorage.setItem(lockKey, lockTime);
        showFeedback("Too many attempts. Locked for 60 seconds 🔒", "error");
        startCountdown(LOCK_TIME);
      } else {
        showFeedback(`Invalid credentials (${attempts}/${MAX_ATTEMPTS})`, "error");
      }
      return;
    }

    /* ✅ Successful login */
    localStorage.removeItem(attemptsKey);
    localStorage.removeItem(lockKey);

    setCurrentUser(username);
    showFeedback("Login successful! ", "success");

    // Redirect to applications hub
    setTimeout(() => {
      window.location.href = "apps.html";
    }, 1200);
  });
}

/* =========================
   Countdown Timer
========================= */
/*
  Displays a countdown message while the user is locked out.
*/
function startCountdown(seconds) {
  let remaining = seconds;
  const msg = document.getElementById("message");

  msg.className = "feedback warning";
  msg.style.display = "block";

  const interval = setInterval(() => {
    msg.textContent = `Try again in ${remaining} seconds ⏳`;
    remaining--;

    if (remaining < 0) {
      clearInterval(interval);
      msg.style.display = "none";
    }
  }, 1000);
}
