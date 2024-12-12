function loadMessages() {
    window.globalSocket.emit("getChatHistory");
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
  
  window.globalSocket.on("receiveGlobalMsg", (message) => {
    console.log(`MESSAGE RECIEVED: ${message}`);
    const chat = d3.select(".messages-container");
    chat.append("div").attr("class", "message").html(`
        <div class="message-header">
          <span class="message-user">${message.sender}</span>
          <span class="message-timestamp">${new Date(msg.timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
      }</span>
        </div>
        <p class="message-text">${message.message}</p>`);
    const chatContainer = document.querySelector(".messages-container");
    chatContainer.scrollTop = chatContainer.scrollHeight;
  });
  
  window.globalSocket.on("chatHistory", (messages) => {
    console.log(messages);
    const chat = d3.select(".messages-container");
    messages.forEach((msg) => {
      chat.append("div").attr("class", "message").html(`
        <div class="message-header">
          <span class="message-user">${msg.sender}</span>
          <span class="message-timestamp">${new Date(msg.timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
        }</span>
        </div>
        <p class="message-text">${msg.message}</p>`);
    });
    const chatContainer = document.querySelector(".messages-container");
    chatContainer.scrollTop = chatContainer.scrollHeight;
  });