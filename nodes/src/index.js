import Phaser from 'phaser';
import MainScene from './game/mainScene';
import StartScene from './game/startScene';
import backgroundScene from './game/backgroundScene';

class Game {
  #config = {
    type: Phaser.CANVAS,
    width: 1280,
    height: 720,
    // 게임에 사용되는 하위 씬 등록
    scene: [
      backgroundScene,
      StartScene,
      MainScene,
    ],
    // 게임이 등록될 캔버스 id 값
    parent: 'container',
    // 게임에 사용될 물리엔진 타입 등록
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { y: 2000 },
        debug: true,
      },
    },
    // 게임 기본 스케일값 설정
    scale: {
      zoom: 1,
    },
    // 게임 픽섹화 처리여부 체크
    pixelArt: false,
    // 배경색 설정
    // backgroundColor: 0xffffff,
  }
  constructor() {
    this.game = new Phaser.Game(this.#config);
  }
}

const game = new Game();