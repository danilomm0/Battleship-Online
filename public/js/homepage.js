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
}

function createGame() {
    fetch('/api/createLobby', {
        method: 'POST',
    }).then((response) => {
        if (response.ok) {
            return response.json(); 
        } else {
            console.log("Failed to create lobby :(")
        }
    }).then((data) => {
        console.log('The newGameID', data.gameID);
        joinGameAPI(String(data.gameID))
    }).catch((error) => {
        console.error('Error:', error.message);
    });
}

function joinGame() {
    let code = d3.select("#code").property("value");
    joinGameAPI(code);
}

function joinGameAPI(gameID) {
    fetch(`/api/gameStatus/${gameID}`, {
        method: 'POST', // Use POST as specified in your route
    }).then((response) => {
        if (response.ok) {
            socket.emit("joinRoom", String(code));
        } else {
            console.log('Game not found or some other error.');
        }
    }).catch((error) => {
        console.error('Error making the request:', error);
    });
}
