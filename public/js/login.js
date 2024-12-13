// the code for context switching since both create and login on same html
document
  .getElementById("switch-to-register")
  .addEventListener("click", function () {
    document.getElementById("form-title").textContent = "Register";
    document.getElementById("login-form").style.display = "none";
    document.getElementById("register-form").style.display = "block";
  });

document
  .getElementById("switch-to-login")
  .addEventListener("click", function () {
    document.getElementById("form-title").textContent = "Login";
    document.getElementById("login-form").style.display = "block";
    document.getElementById("register-form").style.display = "none";
  });

// thandle login
document
  .getElementById("loginForm")
  .addEventListener("submit", async function (event) {
    event.preventDefault(); // dont want empty forms

    const formData = new FormData(this);
    const response = await fetch("/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(formData)),
    });

    const result = await response.json();
    const errorContainer = document.getElementById("login-error");

    if (response.ok) {
      // get username from result
      const username = result.user.username;
      // redirect to accnt and store in cache
      writeLoginStatus(username)
      window.location.href = `/account/${encodeURIComponent(username)}`;
      
    } else {
      // Show error message
      errorContainer.textContent = result.error;
    }
  });

// register new account
document
  .getElementById("registerForm")
  .addEventListener("submit", async function (event) {
    event.preventDefault(); // no default (empty) submissions

    const formData = new FormData(this);
    const response = await fetch("/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(formData)),
    });

    const result = await response.json();
    const errorContainer = document.getElementById("register-error");

    if (response.ok) {
      // on sucess prompt to login then
      window.location.href = "/login";
    } else {
      // Show error message
      errorContainer.textContent = result.error;
    }
  });
