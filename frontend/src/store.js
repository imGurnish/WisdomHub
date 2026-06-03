import EventEmitter from "eventemitter3";

const store = {
  messages: [],
  eventEmitter: new EventEmitter(),

  addMessage(message) {
    const id = Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    const msgText = message.message !== undefined ? message.message : message.content;
    
    // Do not add empty message toasts
    if (msgText === undefined || msgText === null || String(msgText).trim() === "") {
      return;
    }

    const standardizedMessage = {
      id,
      type: message.type || "success",
      message: String(msgText),
    };

    this.messages.push(standardizedMessage);
    this.eventEmitter.emit("change");

    // Automatically remove after 3 seconds
    setTimeout(() => {
      this.removeMessageById(id);
    }, 3000);
  },

  removeMessageById(id) {
    const originalLength = this.messages.length;
    this.messages = this.messages.filter((msg) => msg.id !== id);
    if (this.messages.length !== originalLength) {
      this.eventEmitter.emit("change");
    }
  },

  clearMessages() {
    this.messages = [];
    this.eventEmitter.emit("change");
  },

  getMessages() {
    return this.messages;
  },

  removeMessage() {
    this.messages.shift();
    this.eventEmitter.emit("change");
  },

  subscribe(callback) {
    this.eventEmitter.on("change", callback);
    return () => this.eventEmitter.off("change", callback);
  },
};

export default store;
