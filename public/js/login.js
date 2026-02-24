// public/js/login.js
const form = document.getElementById("loginForm");
const errorBox = document.getElementById("errorBox"); // ถ้ามี

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = form.username.value.trim();
  const password = form.password.value;

  console.log("sending", { username, passwordLen: password.length });

  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(data.message || "Invalid credentials");
    }

    if (!data.token) throw new Error("Login success but token missing");

    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user || {}));

    location.href = "/dashboard.html";
  } catch (err) {
    if (errorBox) errorBox.textContent = err.message;
    else alert(err.message);
  }
});
