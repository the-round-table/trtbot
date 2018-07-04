const _ = require('lodash');

const OPTIONS = [
  '☁️ The Cloud',
  'Tensorflow',
  'Machine Learning™',
  'Surfing Github',
  '🐧 Patching the Linux Kernel',
  'Reticulating Splines',
  '👨‍💻 Grinding Leetcode',
  '😧 Contemplating Existential Philosophy',
  '🥑 Avocado Toast',
  '🆓 Building a Sentient AI',
  '☠ Releasing Neurotoxins',
  '🛴 Electric Scooters',
  '💰 Mining Crypto',
  '👽 SETI@Home',
  '🕵 Corporate Espionage',
  '🕹 Tetris',
  '🐛 Introducing Bugs',
  '₿ Trading Bitcoin',
  '🐦 Arguing on Twitter',
  'Half Life 3',
  '💡 Infecting IOT Devices',
  '🤷‍♂️🤷‍♂️🤷‍♂️',
  '🔭 Exoplanet Discovery',
  '🐛 Github Issues',
  '👨‍🌾 Corn Harvest Simulator',
  '🏦 Balancing the IL State Budget',
  'Tuning Hyperparameters',
  '♻️ Recycling Memes'
];

module.exports = () => {
  return _.sample(OPTIONS);
};
