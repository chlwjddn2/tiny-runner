export default class backgroundScene extends Phaser.Scene {
  constructor() {
    super({ key: 'backgroundScene' });
  }

  preload = () => {
    this.load.image('background', './image/background/bg.png');
  }

  create = () => {
    this.#initBackGround();
    this.input.enabled = false;
     this.scene.launch('StartScene');
  }

  update = () => {
    this.#onMoveBackGround();
  }

  #initBackGround = () => {
    this.background = this.add.tileSprite(0, 0, 3072, 1536, 'background').setOrigin(0, 0);
    this.background.setDisplaySize(this.scale.width, this.scale.height);
  }

  #onMoveBackGround = () => {
    this.background.tilePositionX += 2;
  }
}