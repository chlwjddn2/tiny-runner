import Phaser from 'phaser';
import MainScene from './game/mainScene';
import StartScene from './game/startScene';
import BackgroundScene from './game/backgroundScene';
import GameOverScene from './game/gameOverScene';

class Game {
  #config = {
    type: Phaser.CANVAS,
    width: 1280,
    height: 420,
    scene: [
      BackgroundScene,
      StartScene,
      MainScene,
      GameOverScene,
    ],
    parent: 'container',
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { y: 2000 },
        debug: false,
        // debug: true,
      },
    },
    scale: {
      zoom: 1,
    },
    pixelArt: false,
  }
  constructor() {
    this.game = new Phaser.Game(this.#config);
  }
}

const game = new Game();