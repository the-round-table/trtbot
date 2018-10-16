const discord = require('discord.js');

class ListenerRegistry {
  constructor() {
    this.listeners = new discord.Collection();
  }

  registerListener(listener) {
    this.listeners.set(listener.name, listener);
    console.log(`Registered listener ${listener.name}.`);
  }

  registerListeners(...listeners) {
    listeners.forEach(listener => this.registerListener(listener));
  }

  getListeners() {
    return this.listeners.array();
  }
}

module.exports = ListenerRegistry;
