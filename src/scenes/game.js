import audioManager from '../audio/AudioManager.js';
import { t } from '../lang.js';

export default class game extends Phaser.Scene {
  constructor() {
    super("game");
  }

  init(data) {
    this.score = data.score || 0;
    this.hiScore = data.hiScore || 0; // Valor inicial del puntaje más alto
    this.money = data.money || 100;
    this.soundValue = data.soundValue || 100; // Valor inicial del volumen
    this.tutorialComplete = data.tutorialComplete || false; // Valor para saber si el tutorial se completó
    this.healthPlayer = data.healthPlayer || 100; // Valor inicial de la salud del jugador
    this.difficultyLevel = data.difficultyLevel || 0; // Dificultad del juego
  }

  preload() {
    this.load.image("background_01", "assets/background_01.png");
    this.load.image("star", "assets/star.png");
    this.load.image("indicator", "assets/indicator.png");
    this.load.image("indicator_attack", "assets/indicator_attack.png");

    this.load.spritesheet("hpbar_left", "assets/hpbar_left.png", {
      frameWidth: 32,
      frameHeight: 32,
    });
    this.load.spritesheet("hpbar_middle", "assets/hpbar_middle.png", {
      frameWidth: 32,
      frameHeight: 32,
    });
    this.load.spritesheet("hpbar_right", "assets/hpbar_right.png", {
      frameWidth: 32,
      frameHeight: 32,
    });
    this.load.spritesheet("battlebar_left", "assets/battlebar_left.png", {
      frameWidth: 32,
      frameHeight: 32,
    });
    this.load.spritesheet("battlebar_middle", "assets/battlebar_middle.png", {
      frameWidth: 32,
      frameHeight: 32,
    });
    this.load.spritesheet("battlebar_right", "assets/battlebar_right.png", {
      frameWidth: 32,
      frameHeight: 32,
    });

    this.load.spritesheet("enemy01", "assets/enemy_01_idle.png", {
      frameWidth: 32,
      frameHeight: 32,
    });
    this.load.spritesheet("enemy01_right", "assets/enemy_01_attack_right.png", {
      frameWidth: 32,
      frameHeight: 32,
    });
    this.load.spritesheet("enemy01_left", "assets/enemy_01_attack_left.png", {
      frameWidth: 32,
      frameHeight: 32,
    });
    this.load.spritesheet("enemy01_down", "assets/enemy_01_attack_down.png", {
      frameWidth: 32,
      frameHeight: 32,
    });
    this.load.spritesheet("enemy01_up", "assets/enemy_01_attack_up.png", {
      frameWidth: 32,
      frameHeight: 32,
    });
    this.load.spritesheet("enemy01_defeated", "assets/enemy_01_defeated.png", {
      frameWidth: 32,
      frameHeight: 32,
    });
    this.load.spritesheet("gold", "assets/gold.png", {
      frameWidth: 32,
      frameHeight: 32,
    });
  }

  async create() {

    audioManager.currentSetIndex = 0;
    audioManager.setDurations = [];
    audioManager.transport.position = 0; // Reinicia el transporte de Tone.js

    this.delayBase = Phaser.Math.Between(1500, 2000) / (1 + (this.difficultyLevel * 0.1)); // Base delay between enemy attacks, adjusted by difficulty
    this.delayMult = 1;
    this.delay = this.delayBase / this.delayMult;
    console.log(`dificultad: ${this.difficultyLevel}, delay: ${this.delay}`);

    this.enemyDefeatedTriggered = false;
    this.gameOverTriggered = false;

    this.moneyQuantity = Math.round(Phaser.Math.Between(4, 12) * (1 + (this.difficultyLevel * 0.2))); // Cantidad de dinero que se obtiene al derrotar al enemigo, ajustado por dificultad

    this.scoreMult = 1;
    //crear fondo
    this.add.image(960, 540, "background_01").setScale(8);

    let locationTR = 1850
    let locationTL = 70

    this.indicatorUp = this.add.image(960, 160, "indicator").setOrigin(0.5, 0.5).setScale(12).setAngle(270).setInteractive(); // W 380  W160 A580 S920 D1340
    this.indicatorLeft = this.add.image(580, 540, "indicator").setOrigin(0.5, 0.5).setScale(12).setAngle(180).setInteractive(); // A
    this.indicatorDown = this.add.image(960, 920, "indicator").setOrigin(0.5, 0.5).setScale(12).setAngle(90).setInteractive(); // S
    this.indicatorRight = this.add.image(1340, 540, "indicator").setOrigin(0.5, 0.5).setScale(12).setAngle(0).setInteractive(); // D

    this.hpbarLeft = this.add.sprite(locationTL, 75, "hpbar_left", 0).setOrigin(0, 0.5).setScale(6);
    this.hpbarMiddle = this.add.sprite(locationTL + 192, 75, "hpbar_middle", 0).setOrigin(0, 0.5).setScale(6);
    this.hpbarRight = this.add.sprite(locationTL + 384, 75, "hpbar_right", 0).setOrigin(0, 0.5).setScale(6);

    this.battlebarLeft = this.add.sprite(locationTR - 384, 80, "battlebar_left", 0).setOrigin(1, 0.5).setScale(6);
    this.battlebarMiddle = this.add.sprite(locationTR - 192, 80, "battlebar_middle", 0).setOrigin(1, 0.5).setScale(6);
    this.battlebarRight = this.add.sprite(locationTR, 80, "battlebar_right", 0).setOrigin(1, 0.5).setScale(6); //192 en scale 6

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

    this.anims.create({
      key: "enemy_defeated",
      frames: this.anims.generateFrameNumbers("enemy01_defeated", { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1,
    });





    this.enemy = this.physics.add.sprite(960, 440, "enemy01", 0).setScale(8).setAlpha(0);

    this.tweens.add({
      targets: this.enemy,
      x: 960, // Posición final
      y: 540,
      alpha: 1,
      scale: 12,
      duration: 2000,
      ease: 'Power2',
      onComplete: () => {
        this.enemy.anims.play("enemy_idle", true);
      }
    });



    this.enemy.on('animationcomplete', (anim, frame) => {
      if (anim.key !== "enemy_idle" && anim.key !== "enemy_defeated") {
        // Guarda el nombre de la animación que terminó
        const finishedAnim = anim.key;
        this.time.delayedCall(400, () => {
          // Solo vuelve a idle si no se ha cambiado la animación desde que terminó
          if (this.enemy.anims.currentAnim && this.enemy.anims.currentAnim.key === finishedAnim) {
            this.enemy.anims.play("enemy_idle", true);
          }
        });
      }
    });

    //declarar flechas
    this.cursors = this.input.keyboard.createCursorKeys();
    //declarar teclas WASD
    this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    this.keyZ = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z);

    this.indicatorUp.on('pointerdown', () => {
      this.playerAction = 0; // Set player action to 1 for upward attack
      this.timingDetector()
    });
    this.indicatorLeft.on('pointerdown', () => {
      this.playerAction = 1; // Set player action to 1 for upward attack
      this.timingDetector()
    });
    this.indicatorDown.on('pointerdown', () => {
      this.playerAction = 2; // Set player action to 1 for upward attack
      this.timingDetector()
    });
    this.indicatorRight.on('pointerdown', () => {
      this.playerAction = 3; // Set player action to 1 for upward attack
      this.timingDetector()
    });

    this.cooldown = 0

    this.attackSequence = [] //1, 1, 1, 1, 1, 2, 3, 4
    this.attackSequenceIndex = 0

    this.attackCooldown = true;
    this.attackCooldownBase = true;

    // estado del ataque del jugador, que boton presiona
    this.playerAction = 4;

    this.attack = this.physics.add.group(); //grupo de los indicadores de ataque

    //delay entre ataques del enemigo

    //crear un temporizador para el ataque del enemigo
    this.attackTimer = this.time.addEvent({
      delay: this.delay,
      callback: () => { this.attackCooldown = true; },
      callbackScope: this,
      loop: true,
    });
    // mostrar la vida del jugador
    this.healthPlayerText = this.add.text(340, 74, t("health", { value: this.healthPlayer }), {
      fontFamily: 'MelodicaRegular',
      fontSize: "40px",
      fill: "#fff",
    }).setOrigin(0.5, 0.5); // Align to the top-left corner

    this.moneyText = this.add.text(180, 138, this.money, {
      fontFamily: 'MelodicaRegular',
      fontSize: "40px",
      fill: "#fff",
    }).setOrigin(0, 0.5); // Align to the top-left corner

    this.moneyImage = this.physics.add.sprite(140, 140, "gold", 0).setScale(2).setOrigin(0.5, 0.5);
    this.moneyImage.anims.play("gold_anim", true);

    this.scoreImage = this.add.sprite(140, 190, "score", 0).setScale(2).setOrigin(0.5, 0.5);
    this.scoreImage.anims.play("score_anim", true);

    this.scoreText = this.add.text(180, 188, this.score, {
      fontFamily: 'MelodicaRegular',
      fontSize: "40px",
      fill: "#fff",
    }).setOrigin(0, 0.5); // Align to the top-left corner


    this.gameOverText = this.add.text(960, 340, t("gameOver"), {
      fontFamily: 'MelodicaRegular',
      fontSize: "128px",
      fill: "#ff0000",
      wordWrap: { width: 1200, useAdvancedWrap: true }, // <-- Aquí defines el ancho del "contenedor"
      align: 'center'
    }).setOrigin(0.5, 0.5).setVisible(false).setAlpha(0); // Center the text

    this.enemyDefeatedText = this.add.text(960, 340, t("victory"), {
      fontFamily: 'MelodicaRegular',
      fontSize: "128px",
      fill: "#ffd700",
      wordWrap: { width: 1200, useAdvancedWrap: true }, // <-- Aquí defines el ancho del "contenedor"
      align: 'center'
    }).setOrigin(0.5, 0.5).setVisible(false).setAlpha(0); // Center the text

    this.enemyDefeatedSubText = this.add.text(960, 640, t("tips", { value: this.moneyQuantity }), {
      fontFamily: 'MelodicaRegular',
      fontSize: "32px",
      fill: "#ffd700",
      wordWrap: { width: 600, useAdvancedWrap: true }, // <-- Aquí defines el ancho del "contenedor"
      align: 'center'
    }).setOrigin(0.5, 0.5).setVisible(false).setAlpha(0); // Center the text

    this.stopTimer = false;

    this.musicOptionsIntro = [
      [null, 'midi/chords.mid', 'midi/base_intro.mid', null]
    ];
    this.musicOptionsPrincipio = [
      [null, 'midi/chords.mid', 'midi/base_principio.mid', 'midi/lead_principio.mid'],
      ['midi/bass_principio.mid', 'midi/chords.mid', 'midi/base_principio.mid', 'midi/lead_principio.mid'],
    ];
    this.musicOptionsIntermedio = [
      ['midi/bass_intermedio.mid', 'midi/chords.mid', 'midi/base_intermedio.mid', 'midi/lead_intermedio.mid'],
      ['midi/bass_intermedio.mid', 'midi/chords.mid', 'midi/base_intermedio.mid', 'midi/lead_principio.mid'],
      [null, 'midi/chords.mid', 'midi/base_intermedio.mid', 'midi/lead_principio.mid'],
      ['midi/bass_intermedio.mid', 'midi/chords.mid', 'midi/base_intermedio.mid', null],
    ];
    this.musicOptionsFinal = [
      ['midi/bass_final_01.mid', 'midi/chords.mid', 'midi/base_final.mid', 'midi/lead_final_01.mid'],
      ['midi/bass_final_01.mid', 'midi/chords.mid', 'midi/base_final.mid', 'midi/lead_final_02.mid'],
      ['midi/bass_final_02.mid', 'midi/chords.mid', 'midi/base_final.mid', 'midi/lead_final_02.mid'],
      ['midi/bass_final_02.mid', 'midi/chords.mid', 'midi/base_final.mid', 'midi/lead_final_01.mid'],
    ];
    this.musicOptionsOutro = [
      [null, 'midi/chords.mid', 'midi/base_intro.mid', null],
      ['midi/bass_principio.mid', null, 'midi/base_intro.mid', null],
    ];

    // Elige aleatorio de cada grupo
    const pickRandom = arr => arr[Math.floor(Math.random() * arr.length)];

    const randomIntro = pickRandom(this.musicOptionsIntro);
    const randomPrincipio = pickRandom(this.musicOptionsPrincipio);

    // Determinar cuántos intermedios incluir según la dificultad
    let numIntermedios;
    if (this.difficultyLevel < 2) {
      numIntermedios = 1;
    } else {
      // Proporcional: por ejemplo, dificultad 4 => 2 intermedios, dificultad 6 => 3 intermedios, etc.
      numIntermedios = Math.min(Math.floor(this.difficultyLevel / 2), this.musicOptionsIntermedio.length);
      if (numIntermedios < 1) numIntermedios = 1; // Siempre al menos 1
    }

    const intermedios = [];
    for (let i = 0; i < numIntermedios; i++) {
      intermedios.push(pickRandom(this.musicOptionsIntermedio));
    }

    let numFinales;
    if (this.difficultyLevel < 6) {
      numFinales = 1;
    } else {
      // Proporcional: por ejemplo, dificultad 4 => 2 finales, dificultad 6 => 3 finales, etc.
      numFinales = Math.min(Math.floor(this.difficultyLevel / 3), this.musicOptionsFinal.length);
      if (numFinales < 1) numFinales = 1; // Siempre al menos 1
    }

    const finales = [];
    for (let i = 0; i < numFinales; i++) {
      finales.push(pickRandom(this.musicOptionsFinal));
    }

    const randomOutro = pickRandom(this.musicOptionsOutro);


    // Lista de sets de MIDIs a reproducir en cola
    const midiQueue = [
      randomIntro,
      randomPrincipio,
      ...intermedios
    ];

    // Solo agrega el final si la dificultad es mayor a 4
    if (this.difficultyLevel > 4) {
      midiQueue.push(...finales);
    }

    midiQueue.push(randomOutro);

    this.attackCounter = 0;
    this.attackBefore = Number;
    this.baseCounter = 0;

    // Callback para cada nota que se ejecuta sin importar qué set esté sonando
    const noteCallback = (midiIndex, note, bpm) => {
      this.createNoteImageForMidi(midiIndex, note);

      if (this.attackCooldown) {
        if (midiIndex === 2) {
          if (this.baseCounter > 6) {
            this.attackCooldownBase = true;
            this.baseCounter = 0;
          }
          if (!this.attackCooldownBase) {
            this.baseCounter += 1;
            return
          }
          this.attackCooldownBase = false;
        }
        if (midiIndex === this.attackBefore) {
          this.attackCounter += 1;
          if (this.attackCounter > 5) {
            this.attackCounter = 0;
          } else if (this.attackCounter > 3) {
            return
          }
        } else if (midiIndex != 2) {
          this.attackCounter = 0;
        }
        console.log(this.attackCounter);
        this.enemyAttack(midiIndex, note);
        if (midiIndex != 2) {
          this.attackBefore = midiIndex;
        }

      }
    }
    // Genera callbacks para cada set
    const callbacksQueue = midiQueue.map(set => set.map(() => noteCallback));

    // Inicia reproducción en cola
    this.time.delayedCall(2000, async () => {
      await audioManager.playMultipleMIDIsWithQueue(midiQueue, callbacksQueue);
    });
    const allDurations = await Promise.all(
      midiQueue.map(set => audioManager.getMIDIDuration(set.filter(path => path)))
    );
    const total = allDurations.reduce((a, b) => a + b, 0);
    this.totalTime = total;
    this.elapsedTime = 0;
    console.log(`Duración total de todos los sets: ${this.totalTime} segundos`);

  }
  update() {

    if (Phaser.Input.Keyboard.JustDown(this.keyZ)) {
      this.enemyDefeated()
    }
    //Detectar teclas
    // W
    if (Phaser.Input.Keyboard.JustDown(this.keyW) || (Phaser.Input.Keyboard.JustDown(this.cursors.up))) {

      this.playerAction = 0; // Set player action to 1 for upward attack
      this.timingDetector()
    }

    // A
    if (Phaser.Input.Keyboard.JustDown(this.keyA) || (Phaser.Input.Keyboard.JustDown(this.cursors.left))) {

      this.playerAction = 1; // Set player action to 2 for leftward attack
      this.timingDetector()

    }

    // S
    if (Phaser.Input.Keyboard.JustDown(this.keyS) || (Phaser.Input.Keyboard.JustDown(this.cursors.down))) {

      this.playerAction = 2; // Set player action to 3 for downward attack
      this.timingDetector()

      // audioManager.setInstrument('fm'); // Cambia a FM Synth
    }

    // D
    if (Phaser.Input.Keyboard.JustDown(this.keyD) || (Phaser.Input.Keyboard.JustDown(this.cursors.right))) {

      this.playerAction = 3; // Set player action to 4 for rightward attack
      this.timingDetector()

      // audioManager.setInstrument('synth'); // Cambia a Synth
    }


    this.delay = this.delayBase / this.delayMult; // Actualiza el delay del ataque del enemigo


    if (this.healthPlayer === 100) {
      this.hpbarLeft.setFrame(0);
      this.hpbarMiddle.setFrame(0);
      this.hpbarRight.setFrame(0);
    } else if (this.healthPlayer === 90) {
      this.hpbarLeft.setFrame(0);
      this.hpbarMiddle.setFrame(0);
      this.hpbarRight.setFrame(1);
    } else if (this.healthPlayer === 80) {
      this.hpbarLeft.setFrame(0);
      this.hpbarMiddle.setFrame(0);
      this.hpbarRight.setFrame(2);
    } else if (this.healthPlayer === 70) {
      this.hpbarLeft.setFrame(0);
      this.hpbarMiddle.setFrame(1);
      this.hpbarRight.setFrame(3);
    } else if (this.healthPlayer === 60) {
      this.hpbarLeft.setFrame(0);
      this.hpbarMiddle.setFrame(2);
      this.hpbarRight.setFrame(3);
    } else if (this.healthPlayer === 50) {
      this.hpbarLeft.setFrame(0);
      this.hpbarMiddle.setFrame(3);
      this.hpbarRight.setFrame(3);
    } else if (this.healthPlayer === 40) {
      this.hpbarLeft.setFrame(0);
      this.hpbarMiddle.setFrame(4);
      this.hpbarRight.setFrame(3);
    } else if (this.healthPlayer === 30) {
      this.hpbarLeft.setFrame(1);
      this.hpbarMiddle.setFrame(5);
      this.hpbarRight.setFrame(3);
    } else if (this.healthPlayer === 20) {
      this.hpbarLeft.setFrame(2);
      this.hpbarMiddle.setFrame(5);
      this.hpbarRight.setFrame(3);
    } else if (this.healthPlayer === 10) {
      this.hpbarLeft.setFrame(3);
      this.hpbarMiddle.setFrame(5);
      this.hpbarRight.setFrame(3);
    } else if (this.healthPlayer <= 0 && !this.gameOverTriggered) {
      this.hpbarLeft.setFrame(4);
      this.hpbarMiddle.setFrame(5);
      this.hpbarRight.setFrame(3);
      this.gameOverTriggered = true;
      this.gameOver()
    }
    if (!this.stopTimer) {
      this.elapsedTime = audioManager.currentTime();
    }
    if (this.elapsedTime >= this.totalTime) {
      this.battlebarLeft.setFrame(2);
      this.battlebarMiddle.setFrame(3);
      this.battlebarRight.setFrame(2);
      if (!this.enemyDefeatedTriggered) {
        this.enemyDefeatedTriggered = true;
        this.enemyDefeated();
      }
    } else if (this.elapsedTime >= this.totalTime * 0.8) {
      this.battlebarLeft.setFrame(2);
      this.battlebarMiddle.setFrame(3);
      this.battlebarRight.setFrame(1);
      this.delayMult = 1.5; // Aumenta la velocidad de ataque del enemigo
    } else if (this.elapsedTime >= this.totalTime * 0.6) {
      this.battlebarLeft.setFrame(2);
      this.battlebarMiddle.setFrame(2);
      this.battlebarRight.setFrame(0);
      this.delayMult = 1.7; // Aumenta la velocidad de ataque del enemigo
    } else if (this.elapsedTime >= this.totalTime * 0.4) {
      this.battlebarLeft.setFrame(2);
      this.battlebarMiddle.setFrame(1);
      this.battlebarRight.setFrame(0);
      this.delayMult = 1.5; // Aumenta la velocidad de ataque del enemigo
    } else if (this.elapsedTime >= this.totalTime * 0.2) {
      this.battlebarLeft.setFrame(1);
      this.battlebarMiddle.setFrame(0);
      this.battlebarRight.setFrame(0);
      this.delayMult = 1.2; // Aumenta la velocidad de ataque del enemigo
    } else {
      this.battlebarLeft.setFrame(0);
      this.battlebarMiddle.setFrame(0);
      this.battlebarRight.setFrame(0);
    }

  }
  //empiezan las funciones

  enemyAttack(midiIndex, note) {
    this.attackCooldown = false
    let attackType = midiIndex
    let indicator;
    if (attackType === 0) { // W 160 A 580 S 920 D 1340
      indicator = this.attack.create(960, 384, "indicator_attack").setScale(10).setAlpha(0.1).setTint(0xFFC300).setVisible(true).setAngle(270); //W up
      this.enemy.anims.play("enemy_up", true);
    }
    if (attackType === 1) {
      indicator = this.attack.create(804, 540, "indicator_attack").setScale(10).setAlpha(0.1).setTint(0x0046ff).setVisible(true).setAngle(180); //A left
      this.enemy.anims.play("enemy_left", true);
    }
    if (attackType === 2) {
      indicator = this.attack.create(960, 696, "indicator_attack").setScale(10).setAlpha(0.1).setTint(0x51ff00).setVisible(true).setAngle(90); //S down
      this.enemy.anims.play("enemy_down", true);
    }
    if (attackType === 3) {
      indicator = this.attack.create(1116, 540, "indicator_attack").setScale(10).setAlpha(0.1).setTint(0xff2a00).setVisible(true).setAngle(0); //D right
      this.enemy.anims.play("enemy_right", true);
    }
    if (attackType > 3) {
      return; // No attack if the random number is greater than 4
    }
    indicator.type = attackType;
    //determinar posicion final
    let Xfinal = 0;
    let Yfinal = 0;
    let Xmedium = 0;
    let Ymedium = 0;
    if (indicator.x === 960) {
      Xfinal = 960;
      Xmedium = Xfinal;
      if (indicator.y >= 540) {
        Yfinal = 1070;
        Ymedium = Yfinal - 150; //920
      } else {
        Yfinal = 10;
        Ymedium = Yfinal + 150; //160
      }
    } else {
      Yfinal = 540;
      Ymedium = Yfinal;
      if (indicator.x >= 960) {
        Xfinal = 1490;
        Xmedium = Xfinal - 150; //1340
      } else {
        Xfinal = 430;
        Xmedium = Xfinal + 150; // 580
      }
    }
    //guarda que tipo de ataque es 
    indicator.attackType = attackType
    //guarda si se deberia fallar o no
    indicator.fail = true;
    this.time.delayedCall(this.delay - ((this.delay * 0.2) + 100), () => {
      this.tweens.add({
        targets: indicator,
        scale: 12,
        duration: 100,
        ease: 'Power2',
      });

    });
    this.time.delayedCall(this.delay - (this.delay * 0.2), () => {
      indicator.fail = false;
    });

    //animar
    this.tweens.add({
      targets: indicator,
      x: Xmedium, // Posición final
      y: Ymedium, // Posición final
      alpha: 1, // Opacidad final
      duration: this.delay, // Tiempo en ms
      ease: 'Linear',
      onComplete: () => {
        this.time.delayedCall((this.delay * 0.2) - 100, () => {
          this.tweens.add({
            targets: indicator,
            scale: 10,
            duration: 100,
            ease: 'Power2',
          });
        });
        this.time.delayedCall(this.delay * 0.2, () => {
          indicator.fail = true;
        });
        // Segundo tween: desvanecer (último 50% del tiempo)
        this.tweens.add({
          targets: indicator,
          x: Xfinal, // Posición final
          y: Yfinal, // Posición final
          alpha: 0,   // Se desvanece
          duration: this.delay * 0.5,
          ease: 'Linear',
          onComplete: () => {

            if (indicator.active === true) {

              indicator.destroy();
              this.scoreMult = 1
              this.healthPlayer -= 10
              this.healthPlayerText.setText(t("health", { value: this.healthPlayer }))
              this.hpbarLeft.setTint(0xff2a00); // Change enemy color to red on successful defense
              this.hpbarMiddle.setTint(0xff2a00); // Change enemy color to red on successful defense
              this.hpbarRight.setTint(0xff2a00); // Change enemy color to red on successful defense
              this.time.addEvent({
                delay: 300, // Reset enemy color after a short delay
                callback: () => {
                  this.hpbarLeft.clearTint();
                  this.hpbarMiddle.clearTint();
                  this.hpbarRight.clearTint();

                },
              });
            }
          }
        });
      }
    });
  }

  timingDetector() {
    // Busca el primer indicador activo y válido
    const indicators = this.attack.getChildren();
    let oldestIndicator = null;
    for (let i = 0; i < indicators.length; i++) {
      if (indicators[i] && indicators[i].active) {
        oldestIndicator = indicators[i];
        break;
      }
    }
    if (!oldestIndicator) return; // No hay indicador activo

    if (oldestIndicator && oldestIndicator.active) {
      if (oldestIndicator.fail === false && oldestIndicator.type === this.playerAction) { // si no esta fallando y es el type correcto
        oldestIndicator.destroy();
        this.score += 10 * this.scoreMult; // Incrementa el score
        this.scoreText.setText(this.score); // Actualiza el texto del score
        if (this.scoreMult < 2) {
          this.scoreMult += 0.1
        }

        if (this.playerAction === 0) {
          this.indicatorUp.setTint(0xFFC300);
          this.time.addEvent({
            delay: 300, // Reset enemy color after a short delay
            callback: () => {
              this.indicatorUp.clearTint();
            },
          });
        } else if (this.playerAction === 1) {
          this.indicatorLeft.setTint(0x0046ff);
          this.time.addEvent({
            delay: 300, // Reset enemy color after a short delay
            callback: () => {
              this.indicatorLeft.clearTint();
            },
          });
        } else if (this.playerAction === 2) {
          this.indicatorDown.setTint(0x51ff00);
          this.time.addEvent({
            delay: 300, // Reset enemy color after a short delay
            callback: () => {
              this.indicatorDown.clearTint();
            },
          });
        } else if (this.playerAction === 3) {
          this.indicatorRight.setTint(0xff2a00);
          this.time.addEvent({
            delay: 300, // Reset enemy color after a short delay
            callback: () => {
              this.indicatorRight.clearTint();
            },
          });
        }
      } else {

        oldestIndicator.destroy();
        this.healthPlayer -= 10
        this.hpbarLeft.setTint(0xff2a00); // Change enemy color to red on successful defense
        this.hpbarMiddle.setTint(0xff2a00); // Change enemy color to red on successful defense
        this.hpbarRight.setTint(0xff2a00); // Change enemy color to red on successful defense
        this.time.addEvent({
          delay: 300, // Reset enemy color after a short delay
          callback: () => {
            this.hpbarLeft.clearTint();
            this.hpbarMiddle.clearTint();
            this.hpbarRight.clearTint();
          },
        });

        this.scoreMult = 1;
        this.healthPlayerText.setText(t("health", { value: this.healthPlayer }))


      }
      if (oldestIndicator.fail === true || oldestIndicator.type != this.playerAction) {
        if (this.playerAction === 0) {
          this.indicatorUp.setTint(0x000000);
          this.time.addEvent({
            delay: 300, // Reset enemy color after a short delay
            callback: () => {
              this.indicatorUp.clearTint();
            },
          });
        } else if (this.playerAction === 1) {
          this.indicatorLeft.setTint(0x000000);
          this.time.addEvent({
            delay: 300, // Reset enemy color after a short delay
            callback: () => {
              this.indicatorLeft.clearTint();
            },
          });
        } else if (this.playerAction === 2) {
          this.indicatorDown.setTint(0x000000);
          this.time.addEvent({
            delay: 300, // Reset enemy color after a short delay
            callback: () => {
              this.indicatorDown.clearTint();
            },
          });
        } else if (this.playerAction === 3) {
          this.indicatorRight.setTint(0x000000);
          this.time.addEvent({
            delay: 300, // Reset enemy color after a short delay
            callback: () => {
              this.indicatorRight.clearTint();
            },
          });
        }
      }

    }
  }

  createNoteImageForMidi(midiIndex, note) {
    let key;
    let x;
    let y;
    switch (midiIndex) {
      case 0: key = 0xFFC300; x = 960; y = 160; break;
      case 1: key = 0x0046ff; x = 580; y = 540; break;
      case 2: key = 0x51ff00; x = 960; y = 920; break;
      case 3: key = 0xff2a00; x = 1340; y = 540; break;
      default: return;
    }



    const img = this.add.image(x, y, "star").setTint(key);

    // Usa la duración de la nota (en ms)
    const tweenDuration = (note && note.duration ? note.duration : 0.1) * 1000;

    // Hacemos que la imagen se desvanezca y destruya después de 1 segundo
    this.tweens.add({
      targets: img,
      alpha: 0,
      duration: tweenDuration,
      onComplete: () => img.destroy()
    });
  }
  gameOver() {
    if (this.enemyDefeatedTriggered) {
      this.healthPlayer = 10
      this.healthPlayerText.setText(t("health", { value: this.healthPlayer }))
      return
    }
    this.attackTimer.paused = true; // Stop the enemy attack timer
    this.stopTimer = true;
    audioManager.stopAll(); // <--- Detiene la música y los MIDIs
    this.gameOverText.setVisible(true);

    this.tweens.add({
      targets: this.gameOverText,
      alpha: 1,
      duration: 1000,
      ease: 'Power2',
    });
    if (this.score > this.hiScore) {
      this.hiScore = this.score; // Update hiScore if current score is higher
    }
    this.time.delayedCall(6000, () => {
      this.scene.start("menu", {
        soundValue: this.soundValue,
        tutorialComplete: this.tutorialComplete,
        hiScore: this.hiScore // Pass hiScore to the menu scene
      }); // Restart the scene if player health is zero
    });
  }
  enemyDefeated() {
    if (this.gameOverTriggered) {
      return
    }
    this.attackTimer.paused = true; // Stop the enemy attack timer
    this.stopTimer = true;
    audioManager.stopAll(); // <--- Detiene la música y los MIDIs

    this.enemy.anims.play("enemy_defeated", true);
    this.time.delayedCall(2000, () => {
      this.tweens.add({
        targets: this.enemy,
        alpha: 0,
        scale: 12,
        duration: 4000,
        ease: 'Power2',
      });
    })
    this.money += this.moneyQuantity; // Incrementa el dinero del jugador
    this.moneyText.setText(this.money)
    this.tweens.add({
      targets: this.moneyImage,
      scale: 3,
      duration: 300,
      yoyo: true,
      ease: 'Power2',
    });
    this.difficultyLevel += 1; // Incrementa la dificultad del juego

    this.enemyDefeatedText.setVisible(true);
    this.enemyDefeatedSubText.setVisible(true);

    this.tweens.add({
      targets: [this.enemyDefeatedText, this.enemyDefeatedSubText], // varios objetos 
      alpha: 1,
      duration: 1000,
      ease: 'Power2',
    });

    this.time.delayedCall(6000, () => {
      this.scene.start("store", {
        score: this.score,
        money: this.money,
        soundValue: this.soundValue,
        tutorialComplete: this.tutorialComplete,
        healthPlayer: this.healthPlayer,
        hiScore: this.hiScore,
        difficultyLevel: this.difficultyLevel
      })
    });
  }
}