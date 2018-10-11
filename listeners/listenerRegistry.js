const discord = require('discord.js');

class ListenerRegistry {
  constructor() {
    this.listeners = new discord.Collection();
  }

  registerListener(listener) {
    this.listeners.set(listener.name, listener);
  }
}

module.exports = ListenerRegistry;
