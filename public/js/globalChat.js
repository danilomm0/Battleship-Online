username = getLoginStatus();

function allowChat(temp) {
  d3.select("#chat-error").classed("hidden", temp);
  d3.select("#message").classed("hidden", !temp);
  d3.select("#send").classed("hidden", !temp);
}

function loadMessages() {
  window.globalSocket.emit("getChatHistory");
  const min = getChatBoxState();
  if (min) minimize();
  if (username) allowChat(true);
}

function sendMessage() {
  let message = d3.select("#message").property("value");
  const chat = d3.select(".messages-container");
  if (message) {
    d3.select("#message").property("value", "");
    const sender = username;
    window.globalSocket.emit("sendGlobalMsg", { sender, message });
  }
}

function minimize() {
  let text = d3.select("#minimize").text();
  let temp = text === "-" ? true : false;
  if (temp) d3.select("#minimize").text("+");
  if (!temp) d3.select("#minimize").text("-");
  d3.select(".messages-container").classed("hidden", temp);
  d3.select(".input-container").classed("hidden", temp);
  setChatBoxState(temp);
}

window.globalSocket.on("receiveGlobalMsg", (message) => {
  const chat = d3.select(".messages-container");
  chat.append("div").attr("class", "message").html(`
        <div class="message-header">
          <span class="message-user">${message.sender}</span>
          <span class="message-timestamp">${new Date(
            message.timestamp
          ).toLocaleTimeString([], {
            hour: "numeric",
            minute: "2-digit",
          })}</span>
        </div>
        <p class="message-text">${message.message}</p>`);
  const chatContainer = document.querySelector(".messages-container");
  const messages = chatContainer.querySelectorAll(".message");
  if (messages.length > 50) {
    messages[0].remove();
  }
  chatContainer.scrollTop = chatContainer.scrollHeight;
});

window.globalSocket.on("chatHistory", (messages) => {
  const chat = d3.select(".messages-container");
  messages.forEach((msg) => {
    chat.append("div").attr("class", "message").html(`
        <div class="message-header">
          <span class="message-user">${msg.sender}</span>
          <span class="message-timestamp">${new Date(
            msg.timestamp
          ).toLocaleTimeString([], {
            hour: "numeric",
            minute: "2-digit",
          })}</span>
        </div>
        <p class="message-text">${msg.message}</p>`);
  });
  const chatContainer = document.querySelector(".messages-container");
  chatContainer.scrollTop = chatContainer.scrollHeight;
});

document.addEventListener("DOMContentLoaded", function () {
  const messageInput = document.getElementById("message");
  const sendButton = document.getElementById("send");
  messageInput.addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
      event.preventDefault();
      sendButton.click();
    }
  });
});
