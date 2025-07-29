export default class StartScene extends Phaser.Scene {
  constructor() {
    super({ key: 'StartScene' });
  }

  preload = () => {
    this.load.image('startButton', './image/playButton.png');
    this.load.audio('click', './media/click.mp3');
  }

  create = () => {
    this.startButton = this.add.image(this.scale.width / 2, this.scale.height / 2, 'startButton').setOrigin(0.5).setInteractive({ useHandCursor: true });
    this.startButton.on('pointerdown', () => {
      this.scene.switch('MainScene');
      this.sound.play('click');
    });
    this.startButton.on('pointerover', () => this.startButton.setScale(1.1));
    this.startButton.on('pointerout', () => this.startButton.setScale(1));
  }
}