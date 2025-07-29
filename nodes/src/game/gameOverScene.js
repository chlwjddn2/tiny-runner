export default class GameoverScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameoverScene' });
  }

  preload = () => {
    this.load.image('replayButton', './image/replayButton.png');
    
  }

  create = () => {
    this.replayButton = this.add.image(this.scale.width / 2, this.scale.height / 2, 'replayButton').setOrigin(0.5).
    setInteractive({ useHandCursor: true });
    this.replayButton.setScale(0.5);
    
    this.replayButton.on('pointerdown', () => {
      this.sound.play('click');
      this.scene.start('MainScene');
    });
  }
}