export default class game extends Phaser.Scene {
  constructor() {
    super("game");
  }

  init(data) {
    this.score = data.score || 0;
    this.money = data.money || 0;
  }

  preload() {
    this.load.image("sky", "public/assets/sky.png");
    this.load.image("platform", "public/assets/platform.png");
    this.load.image("star", "public/assets/star.png");
    this.load.image("bomb", "public/assets/bomb.png");
    this.load.image("square", "public/assets/square.png");
    this.load.spritesheet("dude", "./public/assets/dude.png", {
      frameWidth: 32,
      frameHeight: 48,
    });
        this.load.spritesheet("enemy01", "./public/assets/enemy_01_idle.png", {
      frameWidth: 32,
      frameHeight: 32,
    });
       this.load.spritesheet("enemy01_right", "./public/assets/enemy_01_attack_right.png", {
      frameWidth: 32,
      frameHeight: 32,
    });
           this.load.spritesheet("enemy01_left", "./public/assets/enemy_01_attack_left.png", {
      frameWidth: 32,
      frameHeight: 32,
    });
               this.load.spritesheet("enemy01_down", "./public/assets/enemy_01_attack_down.png", {
      frameWidth: 32,
      frameHeight: 32,
    });
                   this.load.spritesheet("enemy01_up", "./public/assets/enemy_01_attack_up.png", {
      frameWidth: 32,
      frameHeight: 32,
    });
  }

  create() {
    //crear fondo
    this.add.image(960, 540, "sky").setScale(2.5, 2);

    this.add.image(960, 790, "star").setOrigin(0.5, 0.5).setScale(4).setTint(0x000000); // 960 790 , 960 290 , 1210 540 , 710 540
    this.add.image(960, 290, "star").setOrigin(0.5, 0.5).setScale(4).setTint(0x000000);
    this.add.image(1210, 540, "star").setOrigin(0.5, 0.5).setScale(4).setTint(0x000000);
    this.add.image(710, 540, "star").setOrigin(0.5, 0.5).setScale(4).setTint(0x000000);

    this.anims.create({
      key: "enemy_idle",
      frames: this.anims.generateFrameNumbers("enemy01", { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: "enemy_right",
      frames: this.anims.generateFrameNumbers("enemy01_right", { start: 0, end: 3 }),
      frameRate: 10,
      repeat: 0,
      hideOnComplete: false,
    });

        this.anims.create({
      key: "enemy_left",
      frames: this.anims.generateFrameNumbers("enemy01_left", { start: 0, end: 3 }),
      frameRate: 10,
      repeat: 0,
      hideOnComplete: false,
    });

            this.anims.create({
      key: "enemy_down",
      frames: this.anims.generateFrameNumbers("enemy01_down", { start: 0, end: 3 }),
      frameRate: 10,
      repeat: 0,
      hideOnComplete: false,
    });

                this.anims.create({
      key: "enemy_up",
      frames: this.anims.generateFrameNumbers("enemy01_up", { start: 0, end: 3 }),
      frameRate: 10,
      repeat: 0,
      hideOnComplete: false,
    });

    this.gameOver = true
    this.stunWait = false
    this.scoreCombo = 0
    this.scoreMult = 1
    this.scoreText = this.add.text(1888, 1000, `Score: ${this.score}`, {
      fontSize: "32px",
      fill: "#fff",
    }).setOrigin(1, 0.5)


    this.enemy = this.physics.add.sprite(960, 540, "enemy01", 0).setScale(8);
    this.enemy.anims.play("enemy_idle",true);
    //declarar flechas
    this.cursors = this.input.keyboard.createCursorKeys();
    //declarar teclas WASD
    this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

    this.cooldown = 0

this.attackSequence = [] //1, 1, 1, 1, 1, 2, 3, 4
this.attackSequenceIndex = 0

    // variable para decidir de quien es el turno de atacar
    this.attackTurn = 1;


    // estado del ataque del jugador, que boton presiona
    this.playerAction = 0;

    this.attack = this.physics.add.group(); //grupo de los indicadores de ataque

    //delay entre ataques del enemigo
    this.delay = Phaser.Math.Between(1000, 1000);
    console.log(this.delay)
    //crear un temporizador para el ataque del enemigo
    this.attackTimer = this.time.addEvent({
      delay: this.delay,
      //  callback: this.turnDecider,
      callback: this.enemyAttack,
      callbackScope: this,
      loop: true,
    });

    // vida del jugador
    this.healthPlayer = 100;

    // mostrar la vida del jugador
    this.healthPlayerText = this.add.text(32, 1000, `Health: ${this.healthPlayer}`, {
      fontSize: "32px",
      fill: "#fff",
    }).setOrigin(0, 0.5); // Align to the top-left corner

    //vida del enemigo
    this.healthEnemy = 100;

    // mostrar la vida del enemigo
    this.healthEnemyText = this.add.text(1888, 32, `Enemy: ${this.healthEnemy}`, {
      fontSize: "32px",
      fill: "#fff",
    }).setOrigin(1, 0.5); // Align to the top-left corner

    this.stunnedText = this.add.text(960, 140, `Enemy stunned! \n attack now!`, {
      fontSize: "64px",
      fill: "#fff",
    }).setOrigin(0.5 , 0.5).setVisible(false);

    // variable para cuando detener el ataque del enemigo
    this.stun = 0;

    this.stunText = this.add.text(960, 32, `Stun: ${this.stun}`, {
      fontSize: "32px",
      fill: "#fff",
    }).setOrigin(0.5, 0.5); // Center the text

    //array de botones presionados durante el stun
    this.stunInputs = [];
    this.stunStartTime = 0;
  }
  update() {
    //Detectar teclas
    if (this.attackTurn === 2) {
      let now = this.time.now;
      if (Phaser.Input.Keyboard.JustDown(this.keyW) || Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
        this.stunInputs.push({ action: 1, time: now - this.stunStartTime });
      }
      if (Phaser.Input.Keyboard.JustDown(this.keyA) || Phaser.Input.Keyboard.JustDown(this.cursors.left)) {
        this.stunInputs.push({ action: 2, time: now - this.stunStartTime });
      }
      if (Phaser.Input.Keyboard.JustDown(this.keyS) || Phaser.Input.Keyboard.JustDown(this.cursors.down)) {
        this.stunInputs.push({ action: 3, time: now - this.stunStartTime });
      }
      if (Phaser.Input.Keyboard.JustDown(this.keyD) || Phaser.Input.Keyboard.JustDown(this.cursors.right)) {
        this.stunInputs.push({ action: 4, time: now - this.stunStartTime });
      }
    } else { //si no esta activo el turn 2 se detectan normalmente
      // W
      if (Phaser.Input.Keyboard.JustDown(this.keyW) || (Phaser.Input.Keyboard.JustDown(this.cursors.up))) {
        
        this.playerAction = 1; // Set player action to 1 for upward attack
        this.timingDetector()

      }

      // A
      if (Phaser.Input.Keyboard.JustDown(this.keyA) || (Phaser.Input.Keyboard.JustDown(this.cursors.left))) {
        
        this.playerAction = 2; // Set player action to 2 for leftward attack
        this.timingDetector()
      }

      // S
      if (Phaser.Input.Keyboard.JustDown(this.keyS) || (Phaser.Input.Keyboard.JustDown(this.cursors.down))) {
        
        this.playerAction = 3; // Set player action to 3 for downward attack
        this.timingDetector()
      }

      // D
      if (Phaser.Input.Keyboard.JustDown(this.keyD) || (Phaser.Input.Keyboard.JustDown(this.cursors.right))) {
        
        this.playerAction = 4; // Set player action to 4 for rightward attack
        this.timingDetector()
      }
    }


    //condicion de derrota al llegar la vida del jugador a 0
    if (this.healthPlayer <= 0) {
      this.attackTimer.paused = true; // Stop the enemy attack timer
      this.add.text(960, 440, "Game Over, you lose", {
        fontSize: "64px",
        fill: "#ff0000",
      }).setOrigin(0.5, 0.5); // Center the text
      this.time.delayedCall(3000, () => {
        this.scene.restart(); // Restart the scene if player health is zero
      });

    } else { //si el jugador no pierde puede ganar, se asegura que no pierda y gane al mismo tiempo

      //condicion de victoria al llegar la vida del enemigo a 0
      if (this.healthEnemy <= 0 && this.gameOver === true && this.stunWait === false) {
      
        this.attackTimer.paused = true; // Stop the enemy attack timer
        this.money += 10
        this.add.text(960, 440, `Enemy defeated! \nyou found 10 gold!`, {
          fontSize: "64px",
          fill: "#ff0000",
        }).setOrigin(0.5, 0.5); // Center the text
        this.gameOver = false
        this.time.delayedCall(3000, () => {
          this.scene.start("store", {
        score: this.score,
        money: this.money, 
      })
        });

      }
    }

    //stun del enemigo
    if (this.stun >= 100) {
      
      this.enemy.anims.play("enemy_idle",true);
      this.stunnedText.setVisible(true);
      this.attackTurn = 2; // Change turn to player
      this.stun = 0; // Reset stun after it reaches 100
      this.attackTimer.paused = true;

      // Destruir todos los indicators activos
      this.attack.getChildren().forEach(indicator => {
        this.attack.remove(indicator, true, true); // Elimina del grupo y destruye el objeto
      });
      // Cuando stun inicia
      this.stunInputs = [];
      this.stunStartTime = this.time.now;

      this.time.delayedCall(this.delay * 3, () => {

        this.stunText.setText(`Stun: ${this.stun}`); // Update stun display
        this.stunnedText.setVisible(false);
        this.attackTurn = 1; // Change turn back to enemy
        // Reproducir los inputs grabados en orden y con su tiempo relativo
        if (!undefined){
          this.stunWait = true;
        this.stunInputs.forEach(input => {
          this.time.delayedCall(input.time, () => {
            this.playerAttack(input.action); 
          });
        });
      }
        this.time.delayedCall(this.delay * 3, () => {
this.stunInputs = [];
this.scoreCombo = 10;
this.score += (this.scoreCombo * this.scoreMult);
this.scoreText.setText(`Score: ${this.score}`);
this.stunWait = false;
this.attackTimer.paused = false;
          });
      });
    }
  }
  //empiezan las funciones
  playerAttack(input) {
    let counterAttack;
    if (input === 1) {
      counterAttack = this.attack.create(960, 140, "star").setScale(1).setAlpha(0.1).setTint(0xFFC300).setVisible(true); //W up
    }
    if (input === 2) {
      counterAttack = this.attack.create(560, 540, "star").setScale(1).setAlpha(0.1).setTint(0x0046ff).setVisible(true); //A left
    }
    if (input === 3) {
      counterAttack = this.attack.create(960, 940, "star").setScale(1).setAlpha(0.1).setTint(0x51ff00).setVisible(true); //S down
    }
    if (input === 4) {
      counterAttack = this.attack.create(1360, 540, "star").setScale(1).setAlpha(0.1).setTint(0xff2a00).setVisible(true); //D right
    }

     this.tweens.add({
      targets: counterAttack,
      x: 960, // Posición final
      y: 540, // Posición final
      scale: 2, // Escala final
      alpha: 1, // Opacidad final
      duration: 200, // Tiempo en ms
      ease: 'Linear',
      onComplete: () => {
    this.enemy.setTint(0x000000); // Change enemy color to red on successful defense
    counterAttack.destroy();
    this.stunInputs.shift(); // Elimina el primer elemento
    this.time.addEvent({
      delay: 200, // Reset enemy color after a short delay
      callback: () => {
        this.enemy.clearTint();
      },
    });
    this.healthEnemy -= 5; // Reduce enemy health by 5 on successful attack
    this.healthEnemyText.setText(`Enemy: ${this.healthEnemy}`);
      }})

  }


  enemyAttack() {
    let attackType = 0
  if (this.attackSequence && this.attackSequence.length > 0 
    && this.attackSequenceIndex < this.attackSequence.length) {
    attackType = this.attackSequence[this.attackSequenceIndex];
    this.attackSequenceIndex = (this.attackSequenceIndex + 1);
  } else {
    attackType = Phaser.Math.Between(1, 6);
  }


    let indicator;
    if (attackType === 1) {
      indicator = this.attack.create(960, 440, "star").setScale(1).setAlpha(0.1).setTint(0xFFC300).setVisible(true); //W up
    this.enemy.anims.play("enemy_up",true);
    }
    if (attackType === 2) {
      indicator = this.attack.create(860, 540, "star").setScale(1).setAlpha(0.1).setTint(0x0046ff).setVisible(true); //A left
    this.enemy.anims.play("enemy_left",true);
    }
    if (attackType === 3) {
      indicator = this.attack.create(960, 640, "star").setScale(1).setAlpha(0.1).setTint(0x51ff00).setVisible(true); //S down
    this.enemy.anims.play("enemy_down",true);
    }
    if (attackType === 4) {
      indicator = this.attack.create(1060, 540, "star").setScale(1).setAlpha(0.1).setTint(0xff2a00).setVisible(true); //D right
      this.enemy.anims.play("enemy_right",true);
    }
    if (attackType > 4) {
      this.enemy.anims.play("enemy_idle",true);
      return; // No attack if the random number is greater than 4
    }
    //determinar posicion final
    let Xfinal = 0;
    let Yfinal = 0;
    let Xmedium = 0;
    let Ymedium = 0;
    if (indicator.x === 960) {
      Xfinal = 960;
      Xmedium = Xfinal;
      if (indicator.y >= 540) {
        Yfinal = 540 + 300;
        Ymedium = Yfinal - 50;
      } else {
        Yfinal = 540 - 300;
        Ymedium = Yfinal + 50;
      }
    } else {
      Yfinal = 540;
      Ymedium = Yfinal;
      if (indicator.x >= 960) {
        Xfinal = 960 + 300;
        Xmedium = Xfinal - 50;
      } else {
        Xfinal = 960 - 300;
        Xmedium = Xfinal + 50;
      }
    }
    //guarda que tipo de ataque es 
    indicator.attackType = attackType
    //guarda si se deberia fallar o no
    indicator.fail = true;
    this.time.delayedCall(this.delay - (this.delay * 0.2), () => {
      indicator.fail = false;
    });

    //animar
    this.tweens.add({
      targets: indicator,
      x: Xmedium, // Posición final
      y: Ymedium, // Posición final
      scale: 4, // Escala final
      alpha: 1, // Opacidad final
      duration: this.delay, // Tiempo en ms
      ease: 'Linear',
      onComplete: () => {
        this.time.delayedCall(this.delay * 0.2, () => {
          indicator.fail = true;
        });
        // Segundo tween: desvanecer (último 50% del tiempo)
        this.tweens.add({
          targets: indicator,
          x: Xfinal, // Posición final
          y: Yfinal, // Posición final
          alpha: 0,   // Se desvanece
          scale: 2,
          duration: this.delay * 0.5,
          ease: 'Linear',
          onComplete: () => {
            
            if (indicator.active === true) {
             
              indicator.destroy();
              if (this.scoreMult > 3) {
         this.scoreMult -= 2
         } else {
          this.scoreMult = 1
         }
         console.log(`el multiplicador de score es:${this.scoreMult}`)
              this.healthPlayer -=10
              this.healthPlayerText.setText(`Health: ${this.healthPlayer}`)
              this.enemy.setTint(0xff2a00); // Change enemy color to red on successful defense
              this.time.addEvent({
                delay: 300, // Reset enemy color after a short delay
                callback: () => {
                  this.enemy.clearTint();
                },
              });
            }
          }
        });
      }
    });
  }

  timingDetector() {
    let oldestIndicator = this.attack.getChildren()[0];
    if (oldestIndicator && oldestIndicator.active) {
      if (oldestIndicator.fail === false && oldestIndicator.attackType === this.playerAction) { // si no esta fallando y es el type correcto
        oldestIndicator.destroy();
        
        if (this.scoreMult < 6) {
        this.scoreMult +=1
        }
        console.log(`el multiplicador de score es:${this.scoreMult}`)
        this.enemy.setTint(0x00ff00); // Change enemy color to green on successful defense
        this.stun += 10
        this.stunText.setText(`Stun: ${this.stun}`)
        this.time.addEvent({
          delay: 300, // Reset enemy color after a short delay
          callback: () => {
            this.enemy.clearTint();
          },
        });
      } else {
        
        oldestIndicator.destroy();
         this.healthPlayer -=10
         if (this.scoreMult > 3) {
         this.scoreMult -= 2
         } else {
          this.scoreMult = 1
         }
         console.log(`el multiplicador de score es:${this.scoreMult}`)
              this.healthPlayerText.setText(`Health: ${this.healthPlayer}`)
        this.enemy.setTint(0xff2a00); // Change enemy color to red on successful defense
        this.time.addEvent({
          delay: 300, // Reset enemy color after a short delay
          callback: () => {
            this.enemy.clearTint();
          },
        });
      }
     
    }
  }
}