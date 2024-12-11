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

function hidePopup(temp) {
  d3.select("#popup").classed("hidden", temp);
}

function joinGame() {
  let code = d3.select("#code").property("value");
  console.log(code);
  // funny words magic man
  return null;
}
