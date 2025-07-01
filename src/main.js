import Phaser from 'phaser';
import game from "./scenes/game.js";
import store from "./scenes/store.js";
import menu from "./scenes/menu.js";
import tutorial from "./scenes/tutorial.js";


// Create a new Phaser config object
const config = {
  type: Phaser.AUTO,
  width: 1920,
  height: 1080,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0 },
      debug: false,
    },
  },
  render: {
pixelArt: true,
antialias: false,
roundPixels: true,
  },
  // List of scenes to load
  // Only the first scene will be shown
  // Remember to import the scene before adding it to the list
  scene: [menu, tutorial, game, store],
};

// Create a new Phaser game instance
window.game = new Phaser.Game(config);
