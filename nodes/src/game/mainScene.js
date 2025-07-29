export default class MainScene extends Phaser.Scene {
  #jumpVelocity;
  #isJumping;
  #jumpCount;
  #maxJump; 
  #gameSpeed;
  #isGameOver;
  #score;
  #lastScoreTime;
  #obstacleKeys;

  constructor() {
    super({ key: 'MainScene' });
  }

  preload = () => {
    this.load.image('platform', './image/background/tile.png');
    this.load.spritesheet('playerRun', './image/run.png', { frameWidth: 112, frameHeight: 128 });
    this.load.spritesheet('playerJump', './image/jump.png', { frameWidth: 91, frameHeight: 128 });
    this.load.spritesheet('playerDie', './image/dead.png', { frameWidth: 149, frameHeight: 129 });
    this.load.spritesheet('playerSliding', './image/sliding.png', { frameWidth: 114, frameHeight: 71 });

    this.load.image('obstacle1', './image/obstacle/moss_obstacle_1.png');
    this.load.image('obstacle2', './image/obstacle/moss_obstacle_2.png');
    this.load.image('obstacle3', './image/obstacle/moss_obstacle_3.png');

    this.load.audio('jumpSound', './media/jump.mp3')
  }

  create = () => {
    this.#initStatus();
    this.#initFlatForms();
    this.#initPlayer();
    this.#initObstacles();
    this.#addKeyObject();
    this.#setScore();
    this.jumpSound = this.sound.add('jumpSound');
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
      this.player.setSize(82, 128, true);
    }

    if (this.#isJumping && onGround && !this.wasOnFloor) {
      this.player.play('player-run', true);
      this.#isJumping = false;
    }

    if (this.cursors.down.isDown && onGround) {
      this.player.play('player-sliding', true);
      this.player.setSize(114, 71, true);
    }

    if (Phaser.Input.Keyboard.JustUp(this.cursors.down)) {
      this.player.play('player-run', true);
      this.player.setSize(82, 128, true);
    }
    
    if (Phaser.Input.Keyboard.JustDown(this.cursors.down) && !onGround) {
      this.player.setVelocityY(1000); // 강제로 아래로 떨어지게 함
    }

    this.wasOnFloor = onGround;
    
    this.#onMoveObstacles();
    this.#onMovePlatForm();
    this.#updateScore(time);

    if (this.#score >= 200 && !this.#obstacleKeys.includes('obstacle3')) {
      this.#obstacleKeys.push('obstacle3');
    }
    
  };

  #initStatus = () =>{
    this.#jumpVelocity = -700;
    this.#isJumping = false;
    this.#jumpCount = 0;
    this.#maxJump = 2; 
    this.#gameSpeed = 5;
    this.#isGameOver = false;
    this.#score = 0;
    this.#lastScoreTime = 0;
    this.#obstacleKeys = ['obstacle1', 'obstacle2'];
  }

  #initFlatForms = () => {
    this.platforms = this.physics.add.group({allowGravity: false, immovable: true});
    const platformTexture = this.textures.get('platform').getSourceImage();
    const platformWidth = platformTexture.width;
    const platformHeight = platformTexture.height;
    const desiredPlatformHeight = 100;
    const scale = desiredPlatformHeight / platformHeight;
    const scaledPlatformWidth = platformWidth * scale;
    const platformCount = Math.ceil(this.scale.width / scaledPlatformWidth) + 1;

    for (let i = 0; i < platformCount; i++) {
      const platform = this.platforms.create(i * scaledPlatformWidth, this.scale.height - desiredPlatformHeight, 'platform').setOrigin(0, 0);
      platform.setScale(scale);
      platform.refreshBody();
    }
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

  #initPlayer = () => {
    !this.anims.exists('player-run') && this.anims.create({
      key: 'player-run',
      frames: this.anims.generateFrameNumbers('playerRun', {
        start: 0,
        end: 9,
      }),
      frameRate: 30,
      repeat: -1,
    });
    !this.anims.exists('player-jump') && this.anims.create({
      key: 'player-jump',
      frames: this.anims.generateFrameNumbers('playerJump', {
        start: 0,
        end: 9,
      }),
      frameRate: 20,
    });
    !this.anims.exists('player-die') && this.anims.create({
      key: 'player-die',
      frames: this.anims.generateFrameNumbers('playerDie', {
        start: 0,
        end: 9,
      }),
      frameRate: 10,
    });
    !this.anims.exists('player-die') && this.anims.create({
      key: 'player-sliding',
      frames: this.anims.generateFrameNumbers('playerSliding', {
        start: 0,
        end: 9,
      }),
      frameRate: 10,
    });

    this.player = this.physics.add.sprite(200, this.scale.height - 100, 'playerJump').setOrigin(0, 1);
    this.player.play('player-run');
    this.player.setSize(82, 128, true);
    this.player.setScale(0.75);
    this.physics.add.collider(this.player, this.platforms);
  }

  #addKeyObject = () => {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceBar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
  }

  #initObstacles = () => {
    this.obstacles = this.physics.add.staticGroup();
    let lastX = 300;
    for (let i = 0; i < 3; i++) {
      const randomX = Phaser.Math.Between(400, 700) + lastX;
      this.#spawnObstacle(randomX, this.scale.height - 100);
      lastX = randomX;  
    }
    this.physics.add.collider(this.player, this.obstacles, this.#onHitObstacle, null, this);
  }

  #spawnObstacle = (x, y) => {
    const obstacle = this.obstacles.create(x, y, this.#getRandomKey()).setOrigin(0, 1);
    obstacle.setScale(0.1); // 필요 시 조정
    obstacle.refreshBody();
  }

  #onMoveObstacles = () => {
    let lastObstacleX = 0;

    // 위치 정렬용: 오른쪽 끝에 가장 가까운 장애물 위치 찾기
    this.obstacles.children.each((obstacle) => {
      if (obstacle.x > lastObstacleX) lastObstacleX = obstacle.x;
    });
    
    this.obstacles.children.iterate((obstacle) => {
      obstacle.x -= this.#gameSpeed;
      obstacle.refreshBody();
      const randomKey = this.#getRandomKey();
      if (obstacle.x + obstacle.displayWidth < 0) {
        const newX = lastObstacleX + Phaser.Math.Between(400, 700);
        obstacle.x = newX;
        if (randomKey === 'obstacle3') obstacle.y = 260;
        else obstacle.y = this.scale.height - 100;
        obstacle.setTexture(randomKey);
        obstacle.refreshBody();
        lastObstacleX = newX;
      }
    });
  }

  #onHitObstacle = (player, obstacle) => {
    this.#isGameOver = true;
    this.player.play('player-die');
    this.player.setSize(587, 707, true);
    this.player.setOffset(0, 0);
    this.physics.pause();
    this.player.once('animationcomplete-player-die', () => {
      this.scene.start('GameoverScene');
    });
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

  #getRandomKey = () => {
    const randomKey = Phaser.Utils.Array.GetRandom(this.#obstacleKeys);
    return randomKey;
  }
}