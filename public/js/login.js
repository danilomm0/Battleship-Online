// Switch forms between login and register
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

// Handle login form submission
document
  .getElementById("loginForm")
  .addEventListener("submit", async function (event) {
    event.preventDefault(); // Prevent the default form submission

    const formData = new FormData(this);
    const response = await fetch("/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(formData)),
    });

    const result = await response.json();
    const errorContainer = document.getElementById("login-error");

    if (response.ok) {
      // Extract the username from the server response
      const username = result.user.username;
      // Redirect to the dashboard with the username in the URL
      writeLoginStatus(username)
      window.location.href = `/account/${encodeURIComponent(username)}`;
      
    } else {
      // Show error message
      errorContainer.textContent = result.error;
    }
  });

// Handle register form submission
document
  .getElementById("registerForm")
  .addEventListener("submit", async function (event) {
    event.preventDefault(); // Prevent the default form submission

    const formData = new FormData(this);
    const response = await fetch("/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(formData)),
    });

    const result = await response.json();
    const errorContainer = document.getElementById("register-error");

    if (response.ok) {
      // Redirect on success
      window.location.href = "/login";
    } else {
      // Show error message
      errorContainer.textContent = result.error;
    }
  });
