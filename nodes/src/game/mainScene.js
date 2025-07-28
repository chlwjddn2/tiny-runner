export default class MainScene extends Phaser.Scene {
  #jumpVelocity = -700;
  #isJumping = false;
  #jumpCount = 0;
  #maxJump = 2; 
  #gameSpeed = 5;
  #isGameOver = false;
  #score = 0;
  #lastScoreTime = 0;


  constructor() {
    super({ key: 'MainScene' });
  }

  preload = () => {
    this.load.image('platform', './image/background/tile.png');
    this.load.spritesheet('playerRun', './image/run.png', { frameWidth: 587, frameHeight: 707 });
    this.load.spritesheet('playerJump', './image/jump.png', { frameWidth: 587, frameHeight: 707 });
    this.load.spritesheet('playerDie', './image/dead.png', { frameWidth: 944, frameHeight: 751 });

    this.load.image('obstacle1', './image/obstacle/obstacle1.png');
    this.load.image('obstacle2', './image/obstacle/obstacle2.png');
    this.load.image('obstacle3', './image/obstacle/obstacle3.png');
    this.load.image('obstacle4', './image/obstacle/obstacle4.png');

    this.load.audio('jumpSound', './media/jump.mp3')
  }

  create = () => {
    this.#initFlatForms();
    this.#initPlayer();
    this.#initObstacles();

    this.#addKeyObject();

    this.jumpSound = this.sound.add('jumpSound');
    this.#setScore();
  }

  update = (time) => {
    if (this.#isGameOver) return;

    this.player.setVelocityX(0);
    const onGround = this.player.body.blocked.down || this.player.body.touching.down;

    if (onGround) this.#jumpCount = 0;

    // justDown 사용: 키를 눌렀을 때 딱 한 번만 점프 실행
    if ((Phaser.Input.Keyboard.JustDown(this.cursors.up) || Phaser.Input.Keyboard.JustDown(this.spaceBar)) && this.#jumpCount < this.#maxJump) {
      this.player.setVelocityY(this.#jumpVelocity);
      this.player.play('player-jump', true);
      this.#isJumping = true;
      this.#jumpCount++;
      this.jumpSound.play(); 
    }

    if (this.#isJumping && onGround && !this.wasOnFloor) {
      this.player.play('player-run', true);
      this.#isJumping = false;
    }

    this.wasOnFloor = onGround;
    
    this.#onMoveObstacles();
    this.#onMovePlatForm();

    this.#updateScore(time);
  };

  #initFlatForms = () => {
    this.platforms = this.physics.add.group({allowGravity: false, immovable: true});
    const platformTexture = this.textures.get('platform').getSourceImage();
    const platformWidth = platformTexture.width;
    const platformHeight = platformTexture.height;
    const desiredPlatformHeight = 100;
    const scaleY = desiredPlatformHeight / platformHeight;
    const scaleX = scaleY;
    const scaledPlatformWidth = platformWidth * scaleX;
    const platformCount = Math.ceil(this.scale.width / scaledPlatformWidth) + 1;

    for (let i = 0; i < platformCount; i++) {
      const platform = this.platforms.create(i * scaledPlatformWidth, this.scale.height - desiredPlatformHeight, 'platform').setOrigin(0, 0);
      platform.setScale(scaleX);
      platform.refreshBody();
    }
  }

  #initPlayer = () => {
    this.anims.create({
      key: 'player-run',
      frames: this.anims.generateFrameNumbers('playerRun', {
        start: 0,
        end: 9,
      }),
      frameRate: 30,
      repeat: -1,
    });

    this.anims.create({
      key: 'player-jump',
      frames: this.anims.generateFrameNumbers('playerJump', {
        start: 0,
        end: 9,
      }),
      frameRate: 20,
    });

    this.anims.create({
      key: 'player-die',
      frames: this.anims.generateFrameNumbers('playerDie', {
        start: 0,
        end: 9,
      }),
      frameRate: 10,
    });

    this.player = this.physics.add.sprite(200, this.scale.height - 100, 'playerJump').setOrigin(0, 1);
    this.player.play('player-run');
    this.player.setSize(380, 660, true);
    this.player.setOffset(100, 0);
    this.player.setScale(0.13);
    this.physics.add.collider(this.player, this.platforms);
  }

  #addKeyObject = () => {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceBar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
  }

  #initObstacles = () => {
    this.obstacles = this.physics.add.staticGroup();
    for (let i = 0; i < 4; i++) {
      const randomX = Phaser.Math.Between(800 + i * 400, 1200 + i * 600);
      this.#spawnObstacle(randomX, this.scale.height - 100);
    }
    this.physics.add.collider(this.player, this.obstacles, this.#onHitObstacle, null, this);
  }

  #spawnObstacle = (x, y) => {
    const obstacleKeys = ['obstacle1', 'obstacle2', 'obstacle3', 'obstacle4'];
    const randomKey = Phaser.Utils.Array.GetRandom(obstacleKeys);

    const obstacle = this.obstacles.create(x, y, randomKey).setOrigin(0, 1);
    obstacle.setScale(0.2); // 필요 시 조정
    obstacle.refreshBody();
  }

  #onMoveObstacles = () => {  
    this.obstacles.children.iterate((obstacle) => {
      obstacle.x -= this.#gameSpeed;
      obstacle.refreshBody();
      if (obstacle.x + obstacle.displayWidth < 0) {
        const rightEdge = this.scale.width;
        const randomOffset = Phaser.Math.Between(100, 600);
        obstacle.x = rightEdge + randomOffset;
        obstacle.y = this.scale.height - 100;

        const obstacleKeys = ['obstacle1', 'obstacle2', 'obstacle3', 'obstacle4'];
        const randomKey = Phaser.Utils.Array.GetRandom(obstacleKeys);
        obstacle.setTexture(randomKey);

        obstacle.refreshBody();
      }
    });
  }

  #onMovePlatForm = () => {
    this.platforms.children.iterate((platform) => {
      platform.x -= this.#gameSpeed * 0.5;
      platform.refreshBody();

      if (platform.x + platform.displayWidth < 0) {
        platform.x += platform.displayWidth * this.platforms.getLength(); // 화면 오른쪽으로 이동
      }
    });
  }

  #onHitObstacle = (player, obstacle) => {
    this.#isGameOver = true;
    this.player.play('player-die');
    this.player.setSize(587, 707, true);
    this.player.setOffset(0, 0);
    this.physics.pause();
    // player.setTint(0xff0000);
    // player.anims.stop();
  }

  #setScore = () => {
    this.scoreText = this.add.text(20, 20, 'Score: 0', {
      fontSize: '32px',
      fill: '#fff',
      fontFamily: 'Arial',
    });
    this.scoreText.setDepth(10); // UI가 앞에 보이도록
  }

  #updateScore = (time) => {
    if (time - this.#lastScoreTime > 100) { // 100ms = 0.1초
      this.#score++;
      this.scoreText.setText('Score: ' + this.#score);
      this.#lastScoreTime = time;

      if (this.#score % 100 === 0) {
        this.#gameSpeed += 1;
      }
    }
  }
}