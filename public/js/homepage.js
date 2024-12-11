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
    d3.selectAll(".button").classed("disable", !temp);
    d3.selectAll(".button2").classed("disable", !temp);
    d3.selectAll(".mode-card").classed("disable", !temp);
    d3.selectAll(".nav-container").classed("disable", !temp);
    d3.select("#code").property("value", "");
    d3.select("#error").classed("hidden", true);
}

function startGame() {
    console.log("Hello?");
    createGame().then((gameID) => {
        console.log("Game created and joined with ID:", gameID);
        window.location.href = `/place-ships/${gameID}?difficulty=0`;
    }).catch((error) => {
        console.error("Failed to start the game:", error.message);
        alert("Could not create or join the game. Please try again.");
    });
}

function createGame() {
    console.log("Called now")
    return fetch("/api/createLobby", {
        method: "POST",
    })
        .then((response) => {
            if (response.ok) {
                return response.json();
            } else {
                console.log("Failed to create lobby");
            }
        })
        .then((data) => {
            console.log("The newGameID", data.gameID);
            return joinGameAPI(data.gameID).then((success) => {
                if (success) {
                    return data.gameID;
                } else {
                    console.log("Failed to join the game after creation");
                }
            });
        }).catch((error) => {
            console.error("Error:", error.message);
            console.log("Another error -_-")
        });
}

function joinGame() {
    let code = d3.select("#code").property("value");
    let output = joinGameAPI(code);
    hideError(output);
}
function hideError(temp) {
    d3.select("#error").classed("hidden", temp);
}

function joinGameAPI(gameID) {
    fetch(`/api/gameStatus/${gameID}`, {
        method: "POST", // Use POST as specified in your route
    })
        .then((response) => {
            if (response.ok) {
                socket.emit("joinRoom", String(code));
                return true;
            } else {
                console.log("Game not found or some other error.");
                return false;
            }
        })
        .catch((error) => {
            console.error("Error making the request:", error);
            return false;
        });
}
