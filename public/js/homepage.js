let username = null;

function load() {
  username = getLoginStatus();
  if (username) {
    d3.select("#dashboard").classed("hidden", false);
    d3.select("#logout").classed("hidden", false);
    d3.select("#login").classed("hidden", true);
  }
}

function login() {
  window.location.href = "/login";
}

function logout() {
  d3.select("#dashboard").classed("hidden", true);
  d3.select("#logout").classed("hidden", true);
  d3.select("#login").classed("hidden", false);
  clearLoginStatus();
}

function dashboard() {
  window.location.href = "/account/" + username;
}

function generateLobbyCode() {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return code;
}
