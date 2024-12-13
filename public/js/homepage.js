let username = null;
const chat = {
  messages: [],
  maxMessages: 50,
};

function load() {
  username = getLoginStatus();
  if (username) {
    d3.select("#dashboard").classed("hidden", false);
    d3.select("#logout").classed("hidden", false);
    d3.select("#login").classed("hidden", true);
  }
  wipeGameStatus();
  loadMessages();
}

function login() {
  window.location.href = "/login";
}

function logout() {
  d3.select("#dashboard").classed("hidden", true);
  d3.select("#logout").classed("hidden", true);
  d3.select("#login").classed("hidden", false);
  allowChat(false);
  clearLoginStatus();
}

function dashboard() {
  window.location.href = "/account/" + username;
}

function hidePopup(temp) {
  d3.select("#popup").classed("hidden", temp);
  d3.selectAll(".button").classed("disable", !temp);
  d3.selectAll(".button2").classed("disable", !temp);
  d3.selectAll(".mode-card").classed("disable", !temp);
  d3.selectAll(".nav-container").classed("disable", !temp);
  d3.select("#code").property("value", "");
  d3.select("#error").classed("hidden", true);
}

function startGame() {
  console.log("Starting game creation process");

  createGame()
    .then((gameID) => {
      if (!gameID) {
        console.error("Invalid gameID");
      }

      console.log("Game created and joined with ID:", gameID);
      window.globalSocket.on("playerAssigned", (data) => {
        writePlayerID(parseInt(data.playerNumber));
        writeGameID(gameID);
        window.location.href = `/place-ships/${gameID}?difficulty=0`;
      });
    })
    .catch((error) => {
      console.error("Game creation process failed:", {
        name: error.name,
        message: error.message,
        stack: error.stack,
      });

      alert(`Game creation failed: ${error.message} Critical Error`);
    });
}

function createGame() {
  return fetch("/api/createLobby", {
    method: "POST",
  })
    .then((response) => {
      console.log("Full response:", response);
      console.log("Response status:", response.status);
      console.log("Response ok:", response.ok);

      if (!response.ok) {
        console.error(`http error oh no: ${response.status}`);
      }

      return response.json();
    })
    .then((data) => {
      console.log("Received data:", data);
      if (!data || !data.gameID) {
        console.error("Didnt get a gameID back");
      }
      console.log("The newGameID", data.gameID);
      return joinGameAPI(data.gameID).then((success) => {
        if (success) {
          return data.gameID;
        } else {
          console.error("fail to join game");
        }
      });
    })
    .catch((error) => {
      console.error("Complete error details:", {
        name: error.name,
        message: error.message,
        stack: error.stack,
      });
      throw error;
    });
}

function joinGame() {
  let code = d3.select("#code").property("value");
  let output = joinGameAPI(code);
  hideError(output);
  window.globalSocket.on("playerAssigned", (data) => {
    writePlayerID(parseInt(data.playerNumber));
    writeGameID(code);
    window.location.href = `/place-ships/${code}?difficulty=0`;
  });
}

function hideError(temp) {
  d3.select("#error").classed("hidden", temp);
}

function joinGameAPI(gameID) {
  return fetch(`/api/gameStatus/${gameID}`, {
    method: "POST",
  })
    .then((response) => {
      if (response.ok) {
        window.globalSocket.emit("joinGame", String(gameID));
        return true;
      } else {
        console.error("Game not found or some other error.");
        return false;
      }
    })
    .catch((error) => {
      console.error("Error making the request:", error);
      return false;
    });
}
