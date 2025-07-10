import audioManager from '../audio/AudioManager.js';
import { t } from '../lang.js';
export default class tutorial extends Phaser.Scene {
    constructor() {
        super("tutorial");
    }

    init(data) {
        this.hiScore = data.hiScore || 0; // Valor inicial del puntaje más alto
        this.soundValue = data.soundValue || 100; // Valor inicial del volumen
        this.difficultyLevel = data.difficultyLevel || 0; // Dificultad del juego
    }

    preload() {

        this.load.image("background_tutorial", "assets/background_tutorial.png");
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
        this.load.spritesheet("buttons", "assets/buttons.png", {
            frameWidth: 32,
            frameHeight: 32,
        });
        this.load.spritesheet("gold", "assets/gold.png", {
            frameWidth: 32,
            frameHeight: 32,
        });
    }

    async create() {
        //crear fondo
        this.add.image(960, 540, "background_tutorial").setScale(8).setOrigin(0.5, 0.5);


        this.anims.create({
            key: "buttons_up",
            frames: this.anims.generateFrameNumbers("buttons", { start: 0, end: 1 }),
            frameRate: 2,
            repeat: -1,
        });

        this.anims.create({
            key: "buttons_left",
            frames: [
                { key: "buttons", frame: 0 },
                { key: "buttons", frame: 2 }
            ],
            frameRate: 2,
            repeat: -1,
        });

        this.anims.create({
            key: "buttons_down",
            frames: [
                { key: "buttons", frame: 0, duration: 500 },
                { key: "buttons", frame: 3, duration: 3000 } // 500 ms de pausa en el último frame
            ],
            frameRate: 10,
            repeat: -1,
        });

        this.anims.create({
            key: "buttons_right",
            frames: [
                { key: "buttons", frame: 0 },
                { key: "buttons", frame: 4 }
            ],
            frameRate: 2,
            repeat: -1,
        });

        this.anims.create({
            key: "gold_anim",
            frames: [
                ...this.anims.generateFrameNumbers("gold", { start: 0, end: 11 }),
                { key: "gold", frame: 0, duration: 2000 } // 500 ms de pausa en el último frame
            ],
            frameRate: 10,
            repeat: -1,
        });


        let locationTR = 1850
        let locationTL = 70
        this.delay = 1000; // Tiempo en milisegundos para el tween
        this.attack = this.physics.add.group(); //grupo de los indicadores de ataque

        this.attackSequenceExecuted = false;
        this.healthbarSequenceExecuted = false;
        this.timeBarSequenceExecuted = false;
        this.moneySequenceExecuted = false;
        this.scoreSequenceExecuted = false;


        this.indicatorUp = this.add.image(960, 160, "indicator").setOrigin(0.5, 0.5).setScale(12).setAngle(270).setVisible(false).setAlpha(0); // W 380  W160 A580 S920 D1340
        this.indicatorLeft = this.add.image(580, 540, "indicator").setOrigin(0.5, 0.5).setScale(12).setAngle(180).setVisible(false).setAlpha(0); // A
        this.indicatorDown = this.add.image(960, 920, "indicator").setOrigin(0.5, 0.5).setScale(12).setAngle(90).setVisible(false).setAlpha(0); // S
        this.indicatorRight = this.add.image(1340, 540, "indicator").setOrigin(0.5, 0.5).setScale(12).setAngle(0).setVisible(false).setAlpha(0); // D

        this.hpbarLeft = this.add.sprite(locationTL, 75, "hpbar_left", 0).setOrigin(0, 0.5).setScale(6).setVisible(false).setAlpha(0);
        this.hpbarMiddle = this.add.sprite(locationTL + 192, 75, "hpbar_middle", 0).setOrigin(0, 0.5).setScale(6).setVisible(false).setAlpha(0);
        this.hpbarRight = this.add.sprite(locationTL + 384, 75, "hpbar_right", 0).setOrigin(0, 0.5).setScale(6).setVisible(false).setAlpha(0);

        this.battlebarLeft = this.add.sprite(locationTR - 384, 80, "battlebar_left", 0).setOrigin(1, 0.5).setScale(6).setVisible(false).setAlpha(0);
        this.battlebarMiddle = this.add.sprite(locationTR - 192, 80, "battlebar_middle", 0).setOrigin(1, 0.5).setScale(6).setVisible(false).setAlpha(0);
        this.battlebarRight = this.add.sprite(locationTR, 80, "battlebar_right", 0).setOrigin(1, 0.5).setScale(6).setVisible(false).setAlpha(0); //192 en scale 6

        this.money = 0;
        this.score = 0

        this.healthPlayerText = this.add.text(340, 74, t("health", { value: 100 }), {
            fontFamily: 'MelodicaRegular',
            fontSize: "40px",
            fill: "#fff",
        }).setOrigin(0.5, 0.5).setVisible(false).setAlpha(0); // Align to the top-left corner

        this.moneyText = this.add.text(180, 138, this.money, {
            fontFamily: 'MelodicaRegular',
            fontSize: "40px",
            fill: "#fff",
        }).setOrigin(0, 0.5).setVisible(false).setAlpha(0); // Align to the top-left corner

        this.moneyImage = this.add.sprite(140, 140, "gold", 0).setScale(2).setOrigin(0.5, 0.5).setVisible(false).setAlpha(0);
        this.moneyImage.anims.play("gold_anim", true);

        this.scoreText = this.add.text(120, 190, t("score", { value: this.score }), {
            fontFamily: 'MelodicaRegular',
            fontSize: "40px",
            fill: "#fff",
        }).setOrigin(0, 0.5).setVisible(false).setAlpha(0); // Align to the top-left corner


        this.controls = this.add.sprite(1720, 930, "buttons", 0).setScale(4).setOrigin(0.5, 0.5).setAlpha(0);

        this.skipText = this.add.text(1720, 1010, t("skip"), {
            fontFamily: 'MelodicaRegular',
            fontSize: "32px",
            fill: "#fff",
            align: "center"
        }).setOrigin(0.5, 0.5).setAlpha(0);

        this.continueText = this.add.text(1780, 930, t("continue"), {
            fontFamily: 'MelodicaRegular',
            fontSize: "32px",
            fill: "#fff"
        }).setOrigin(0, 0.5).setAlpha(0);

        this.beforeText = this.add.text(1660, 930, t("before"), {
            fontFamily: 'MelodicaRegular',
            fontSize: "32px",
            fill: "#fff"
        }).setOrigin(1, 0.5).setAlpha(0);

        this.tweens.add({
            targets: [this.controls, this.skipText, this.continueText, this.beforeText],
            alpha: 1,
            duration: 1000,
            ease: 'Power2',
        });

        this.buttons = this.add.sprite(1850, 1000, "buttons", 0).setScale(4).setOrigin(0.5, 0.5).setVisible(false).setAlpha(0);
        this.buttons2 = this.add.sprite(960, 540, "buttons", 0).setScale(4).setOrigin(0.5, 0.5).setVisible(false).setAlpha(0);
        this.buttons.anims.play("buttons_right", true);
        //declarar flechas
        this.cursors = this.input.keyboard.createCursorKeys();
        //declarar teclas WASD
        this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

        this.tutorialComplete = true;

        this.tutorialStage = 0



        this.textContent = [
            t("tutorial2"),
            t("tutorial3"),
            t("tutorial4"),
            t("tutorial5"),
            t("tutorial6"),
            t("tutorial7"),
            t("tutorial8"),
            t("tutorial9"),
            t("tutorial10"),
            t("tutorial11"),
        ]

        this.textBox = this.add.text(960, 940, t("tutorial1"), {
            fontSize: "64px",
            fontFamily: 'MelodicaRegular',
            color: "#ffd700",
            wordWrap: { width: 1200, useAdvancedWrap: true }, // <-- Aquí defines el ancho del "contenedor"
            align: 'justify',
            stroke: "#000000",         // Color del borde 
            strokeThickness: 8         // Grosor del borde
        }
        ).setOrigin(0.5, 0.5).setAlpha(0).setDepth(10);

        this.tweens.add({
            targets: this.textBox,
            alpha: 1,
            duration: 1000,
            ease: 'Power2',
        });

        // Después de crear this.textBox
        const textBounds = this.textBox.getBounds();
        this.padding = 120;

        // Coloca el botón justo a la derecha del texto, centrado verticalmente
        this.buttons.x = textBounds.right + this.padding;
        this.buttons.y = textBounds.centerY;

        this.sHoldStart = null; // Variable para guardar el tiempo de inicio
        this.sHoldThreshold = 3000; // Tiempo requerido en ms (ejemplo: 1 segundo)

        this.textHistory = [t("tutorial1"), ...this.textContent];
        this.textIndex = 0;

    }
    update(time, delta) {

        if (this.keyS.isDown || this.cursors.down.isDown) {
            if (this.sHoldStart === null) {
                this.sHoldStart = time; // Guarda el tiempo de inicio
            } else if (time - this.sHoldStart >= this.sHoldThreshold) {
                // Acción cuando se mantiene presionada S por el tiempo requerido
                this.startGame();
                // Tu lógica aquí (solo una vez)
                this.sHoldStart = -Infinity; // Para que no se repita hasta soltar y volver a presionar
            }
        } else {
            // Si se suelta la tecla, reinicia el tiempo de inicio
            this.sHoldStart = null;
        }

        if (Phaser.Input.Keyboard.JustDown(this.keyA) || Phaser.Input.Keyboard.JustDown(this.cursors.left)) {
            this.previousText();
        }

        if (Phaser.Input.Keyboard.JustDown(this.keyD) || Phaser.Input.Keyboard.JustDown(this.cursors.right)) {
            this.nextText();
        }

        if (this.textIndex === 4) {
            this.attackSequence();
        }

        if (this.textIndex === 5) {
            this.healthbarSequence();
        }

        if (this.textIndex === 6) {
            this.timebarSequence();

        }
        if (this.textIndex === 7) {
            this.moneySequence();
        }
        if (this.textIndex === 9) {
            this.scoreSequence();
        }
    }
    nextText() {
        if (this.textIndex < this.textHistory.length - 1) {
            this.textIndex++;
            const next = this.textHistory[this.textIndex];
            audioManager.playSound(0, 0.2, -1);

            this.textBox.setText(next);
            this.textBox.setAlpha(0);
            this.tweens.add({
                targets: this.textBox,
                alpha: 1,
                duration: 1000,
                ease: 'Power2',
            });
            const textBounds = this.textBox.getBounds();
            this.buttons.x = textBounds.right + this.padding;
            this.buttons.y = textBounds.centerY;

        } else {
            this.startGame();
        }
    }

    // Nueva función previousText
    previousText() {
        if (this.textIndex > 0) {
            this.textIndex--;
            const prev = this.textHistory[this.textIndex];
            audioManager.playSound(0, 0.2, -2);

            this.textBox.setText(prev);
            this.textBox.setAlpha(0);
            this.tweens.add({
                targets: this.textBox,
                alpha: 1,
                duration: 1000,
                ease: 'Power2',
            });
            const textBounds = this.textBox.getBounds();
            this.buttons.x = textBounds.right + this.padding;
            this.buttons.y = textBounds.centerY;
        }
    }
    attackSequence() {
        if (this.attackSequenceExecuted) {
            return;
        }
        this.attackSequenceExecuted = true;

        this.indicatorUp.setVisible(true);
        this.indicatorLeft.setVisible(true);
        this.indicatorDown.setVisible(true);
        this.indicatorRight.setVisible(true);
        this.buttons2.setVisible(true);

        this.tweens.add({
            targets: [this.indicatorUp, this.indicatorLeft, this.indicatorDown, this.indicatorRight, this.buttons2], // varios objetos 
            alpha: 1,
            duration: 1000,
            ease: 'Power2',
        });

        this.enemyAttack(3)

        this.time.delayedCall(2000, () => {
            this.enemyAttack(1)
        });
        this.time.delayedCall(4000, () => {
            this.enemyAttack(0)
        });
        this.time.delayedCall(6000, () => {
            this.enemyAttack(2)
        });
        this.time.delayedCall(8000, () => {
            this.buttons2.setVisible(false);
        });
    }
    healthbarSequence() {
        if (this.healthbarSequenceExecuted) {
            return;
        }
        this.healthbarSequenceExecuted = true;

        this.hpbarLeft.setVisible(true);
        this.hpbarMiddle.setVisible(true);
        this.hpbarRight.setVisible(true);
        this.healthPlayerText.setVisible(true);


        this.tweens.add({
            targets: [this.hpbarLeft, this.hpbarMiddle, this.hpbarRight, this.healthPlayerText], // varios objetos 
            alpha: 1,
            duration: 1000,
            ease: 'Power2',
        });
    }
    timebarSequence() {
        if (this.timeBarSequenceExecuted) {
            return;
        }
        this.timeBarSequenceExecuted = true;

        this.battlebarLeft.setVisible(true);
        this.battlebarMiddle.setVisible(true);
        this.battlebarRight.setVisible(true);

        this.tweens.add({
            targets: [this.battlebarLeft, this.battlebarMiddle, this.battlebarRight], // varios objetos 
            alpha: 1,
            duration: 1000,
            ease: 'Power2',
        });
    }

    enemyAttack(midiIndex, note) {
        let attackType = midiIndex
        let indicator;
        if (attackType === 0) { // W 160 A 580 S 920 D 1340
            indicator = this.attack.create(960, 384, "indicator_attack").setScale(10).setAlpha(0.1).setTint(0xFFC300).setVisible(true).setAngle(270).setDepth(1); //W up
            this.buttons2.anims.play("buttons_up", true);
        }
        if (attackType === 1) {
            indicator = this.attack.create(804, 540, "indicator_attack").setScale(10).setAlpha(0.1).setTint(0x0046ff).setVisible(true).setAngle(180).setDepth(1); //A left
            this.buttons2.anims.play("buttons_left", true);
        }
        if (attackType === 2) {
            indicator = this.attack.create(960, 696, "indicator_attack").setScale(10).setAlpha(0.1).setTint(0x51ff00).setVisible(true).setAngle(90).setDepth(1); //S down
            this.buttons2.anims.play("buttons_down", true);
        }
        if (attackType === 3) {
            indicator = this.attack.create(1116, 540, "indicator_attack").setScale(10).setAlpha(0.1).setTint(0xff2a00).setVisible(true).setAngle(0).setDepth(1); //D right
            this.buttons2.anims.play("buttons_right", true);
        }
        if (attackType > 3) {
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

        this.time.delayedCall(this.delay - ((this.delay * 0.2) + 100), () => {
            this.tweens.add({
                targets: indicator,
                scale: 12,
                duration: 100,
                ease: 'Power2',
            });

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

                        }
                    }
                });
            }
        });
    }

    moneySequence() {
        if (this.moneySequenceExecuted) {
            return
        }
        this.moneySequenceExecuted = true;
        this.moneyText.setVisible(true);
        this.moneyImage.setVisible(true);
        this.tweens.add({
            targets: [this.moneyText, this.moneyImage], // varios objetos 
            alpha: 1,
            duration: 1000,
            ease: 'Power2',
        });
        this.time.delayedCall(2000, () => {
            this.money = 10; // Incrementa el dinero del jugador
            this.moneyText.setText(this.money)
            this.tweens.add({
                targets: this.moneyImage,
                scale: 3,
                duration: 300,
                yoyo: true,
                ease: 'Power2',
            });
        });

    }

    scoreSequence() {
        if (this.scoreSequenceExecuted) {
            return
        }
        this.scoreSequenceExecuted = true;
        this.scoreText.setVisible(true);
        this.tweens.add({
            targets: this.scoreText, // varios objetos 
            alpha: 1,
            duration: 1000,
            ease: 'Power2',
        });
    }

    startGame() {
        this.scene.start("game", {
            soundValue: this.soundValue,
            tutorialComplete: this.tutorialComplete,
            hiScore: this.hiScore,
            difficultyLevel: this.difficultyLevel
        });
    }
}