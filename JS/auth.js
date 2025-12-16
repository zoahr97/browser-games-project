/* =========================
   CONFIG
========================= */
const MAX_ATTEMPTS = 3;
const LOCK_TIME = 60; // seconds

/* =========================
   Feedback helper
========================= */
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
const registerForm = document.getElementById("registerForm");

if (registerForm) {
  registerForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const username = regUsername.value.trim();
    const password = regPassword.value.trim();

    if (!username || !password) {
      showFeedback("יש למלא את כל השדות", "warning");
      return;
    }

    const users = getUsers();
    if (users.find(u => u.username === username)) {
      showFeedback("שם המשתמש כבר קיים", "error");
      return;
    }

    users.push({ username, password });
    saveUsers(users);

    showFeedback("נרשמת בהצלחה! מעבירה להתחברות…", "success");

    setTimeout(() => {
      window.location.href = "index.html";
    }, 1200);
  });
}

/* =========================
   LOGIN
========================= */
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

    /* 🔓 if lock expired – reset attempts */
    if (lockUntil && now >= lockUntil) {
      localStorage.removeItem(lockKey);
      localStorage.removeItem(attemptsKey);
    }

    /* 🔒 still locked */
    if (lockUntil && now < lockUntil) {
      startCountdown(Math.ceil((lockUntil - now) / 1000));
      return;
    }

    const users = getUsers();
    const user = users.find(
      u => u.username === username && u.password === password
    );

    /* ❌ wrong login */
    if (!user) {
      let attempts = Number(localStorage.getItem(attemptsKey)) || 0;
      attempts++;
      localStorage.setItem(attemptsKey, attempts);

      if (attempts >= MAX_ATTEMPTS) {
        const lockTime = now + LOCK_TIME * 1000;
        localStorage.setItem(lockKey, lockTime);
        showFeedback("נחסמת ל־60 שניות 🔒", "error");
        startCountdown(LOCK_TIME);
      } else {
        showFeedback(`שגיאה (${attempts}/${MAX_ATTEMPTS})`, "error");
      }
      return;
    }

    /* ✅ success */
    localStorage.removeItem(attemptsKey);
    localStorage.removeItem(lockKey);

    setCurrentUser(username);
    showFeedback("התחברת בהצלחה! 🎉", "success");

    setTimeout(() => {
      window.location.href = "apps.html";
    }, 1200);
  });
}

/* =========================
   Countdown Timer
========================= */
function startCountdown(seconds) {
  let remaining = seconds;
  const msg = document.getElementById("message");

  msg.className = "feedback warning";
  msg.style.display = "block";

  const interval = setInterval(() => {
    msg.textContent = `נסי שוב בעוד ${remaining} שניות ⏳`;
    remaining--;

    if (remaining < 0) {
      clearInterval(interval);
      msg.style.display = "none";
    }
  }, 1000);
}
