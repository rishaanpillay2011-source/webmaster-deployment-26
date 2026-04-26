/* ============================================================
   login.js — lightweight localStorage-based auth for the
   Pathfinders marketplace. No real backend required.
   ============================================================ */

const AUTH_KEY = "pathfinders-mkt-user";
const USERS_KEY = "pathfinders-mkt-users";

function $(id) { return document.getElementById(id); }

function getUsers() {
  try { return JSON.parse(localStorage.getItem(USERS_KEY) || "[]"); }
  catch (_) { return []; }
}

function saveUsers(users) {
  try { localStorage.setItem(USERS_KEY, JSON.stringify(users)); } catch (_) {}
}

function loginAs(user) {
  try { localStorage.setItem(AUTH_KEY, JSON.stringify(user)); } catch (_) {}
}

// ── Tab switching ──────────────────────────────────────────────
function showPanel(which) {
  const signIn = $("tab-signin");
  const register = $("tab-register");
  const panelSI = $("panel-signin");
  const panelReg = $("panel-register");

  const isSignIn = which === "signin";
  signIn.classList.toggle("is-active", isSignIn);
  register.classList.toggle("is-active", !isSignIn);
  panelSI.hidden = !isSignIn;
  panelReg.hidden = isSignIn;
}

// ── Sign-in logic ──────────────────────────────────────────────
function handleSignIn() {
  const emailEl = $("si-email");
  const passEl = $("si-password");
  const errorEl = $("si-error");
  errorEl.textContent = "";

  const email = (emailEl?.value || "").trim().toLowerCase();
  const password = (passEl?.value || "").trim();

  if (!email || !password) {
    errorEl.textContent = "Please enter your email and password.";
    return;
  }

  const users = getUsers();
  const user = users.find(u => u.email === email && u.password === password);

  if (!user) {
    errorEl.textContent = "Incorrect email or password.";
    return;
  }

  loginAs(user);
  // Redirect back to marketplace
  window.location.href = "directory.html";
}

// ── Register logic ─────────────────────────────────────────────
function handleRegister() {
  const nameEl = $("reg-name");
  const emailEl = $("reg-email");
  const passEl = $("reg-password");
  const errorEl = $("reg-error");
  errorEl.textContent = "";

  const name = (nameEl?.value || "").trim();
  const email = (emailEl?.value || "").trim().toLowerCase();
  const password = (passEl?.value || "").trim();

  if (!name) { errorEl.textContent = "Please enter a display name."; return; }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errorEl.textContent = "Please enter a valid email address."; return;
  }
  if (password.length < 6) {
    errorEl.textContent = "Password must be at least 6 characters."; return;
  }

  const users = getUsers();
  if (users.find(u => u.email === email)) {
    errorEl.textContent = "An account with that email already exists."; return;
  }

  const newUser = {
    id: "u-" + Date.now(),
    name,
    email,
    password,       // Note: plaintext is fine for this demo-only setup
    rating: 5.0,
    reviews: 0
  };

  users.push(newUser);
  saveUsers(users);
  loginAs(newUser);
  window.location.href = "directory.html";
}

// ── Boot ────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  // If already logged in, redirect
  try {
    if (localStorage.getItem(AUTH_KEY)) {
      window.location.href = "directory.html";
      return;
    }
  } catch (_) {}

  $("tab-signin")?.addEventListener("click", () => showPanel("signin"));
  $("tab-register")?.addEventListener("click", () => showPanel("register"));
  $("go-register")?.addEventListener("click", () => showPanel("register"));
  $("go-signin")?.addEventListener("click", () => showPanel("signin"));

  $("si-btn")?.addEventListener("click", handleSignIn);
  $("reg-btn")?.addEventListener("click", handleRegister);

  // Enter key support
  [$("si-email"), $("si-password")].forEach(el => {
    el?.addEventListener("keydown", e => { if (e.key === "Enter") handleSignIn(); });
  });
  [$("reg-name"), $("reg-email"), $("reg-password")].forEach(el => {
    el?.addEventListener("keydown", e => { if (e.key === "Enter") handleRegister(); });
  });
});
