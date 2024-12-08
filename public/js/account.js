let wins = 0;
let losses = 0;
let winrate = 0;
let achievements = 0;

// Fetch data from URL and API
window.onload = async () => {
  // Extract username from the URL path
  const urlSegments = window.location.pathname.split("/");
  const username = urlSegments[urlSegments.length - 1];
  try {
    const response = await fetch(`/api/account/${username}`);
    if (response.ok) {
      const data = await response.json();
      document.getElementById(
        "username"
      ).textContent = `Welcome, ${data.username}`;
      wins = data.wins;
      losses = data.losses;
    } else {
      console.error("Failed to fetch user stats.");
    }
  } catch (err) {
    console.error("Error fetching data:", err);
  }
};

let total = wins + losses;
if (total !== 0) winrate = (100 * wins) / total;
d3.select("#wins").text(`${wins}`);
d3.select("#losses").text(`${losses}`);
d3.select("#winrate").text(`${winrate.toFixed(2)}%`);
d3.select("#total").text(`${total}`);
if (wins > 0) {
  d3.select("#firstblood").classed("hidden", false);
  achievements = achievements + 1;
}
if (wins >= 50) {
  d3.select("#tactician").classed("hidden", false);
  achievements = achievements + 1;
}
if (winrate >= 75) {
  d3.select("#admiral").classed("hidden", false);
  achievements = achievements + 1;
}
if (total >= 100) {
  d3.select("#veteran").classed("hidden", false);
  achievements = achievements + 1;
}
if (achievements === 0) d3.select("#none").classed("hidden", false);
