import audioManager from '../audio/AudioManager.js';
import { t } from '../lang.js';
export default class tutorial extends Phaser.Scene {
    constructor() {
        super("tutorial");
    }

    init(data) {
        this.hiScore = data.hiScore || 0; // Valor inicial del puntaje más alto
        this.soundValue = data.soundValue || 100; // Valor inicial del volumen
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
    }

    async create() {
        //crear fondo
        this.add.image(960, 540, "background_tutorial").setScale(8).setOrigin(0.5, 0.5);

        let locationTR = 1850
        let locationTL = 70
        this.delay = 1000; // Tiempo en milisegundos para el tween
        this.attack = this.physics.add.group(); //grupo de los indicadores de ataque

        this.attackSequenceExecuted = false;
        this.healthbarSequenceExecuted = false;
        this.timeBarSequenceExecuted = false;


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


        this.healthPlayerText = this.add.text(340, 74, t("health", { value: 100 }), {
            fontFamily: 'MelodicaRegular',
            fontSize: "40px",
            fill: "#fff",
        }).setOrigin(0.5, 0.5).setVisible(false).setAlpha(0); // Align to the top-left corner

        this.moneyText = this.add.text(120, 130, t("money", { value: 0 }), {
            fontFamily: 'MelodicaRegular',
            fontSize: "40px",
            fill: "#fff",
        }).setOrigin(0, 0.5).setVisible(false).setAlpha(0); // Align to the top-left corner

        this.scoreText = this.add.text(120, 170, t("score", { value: 0 }), {
            fontFamily: 'MelodicaRegular',
            fontSize: "40px",
            fill: "#fff",
        }).setOrigin(0, 0.5).setVisible(false).setAlpha(0); // Align to the top-left corner


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
                { key: "buttons", frame: 0 },
                { key: "buttons", frame: 3 }
            ],
            frameRate: 2,
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




        this.buttons = this.add.sprite(1850, 1000, "buttons", 0).setScale(4).setOrigin(0.5, 0.5);
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

    }
    update() {
        if (Phaser.Input.Keyboard.JustDown(this.keyW) || Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
        }
        if (Phaser.Input.Keyboard.JustDown(this.keyA) || Phaser.Input.Keyboard.JustDown(this.cursors.left)) {

        }
        if (Phaser.Input.Keyboard.JustDown(this.keyS) || Phaser.Input.Keyboard.JustDown(this.cursors.down)) {

        }
        if (Phaser.Input.Keyboard.JustDown(this.keyD) || Phaser.Input.Keyboard.JustDown(this.cursors.right)) {
            this.nextText();
        }
        if (this.tutorialStage === 4) {
            this.attackSequence();
        }

        if (this.tutorialStage === 5) {
            this.healthbarSequence();
        }

        if (this.tutorialStage === 6) {
            this.timebarSequence();

        }
        if (this.tutorialStage === 7) {
            this.moneyText.setVisible(true);
            this.tweens.add({
                targets: this.moneyText, // varios objetos 
                alpha: 1,
                duration: 1000,
                ease: 'Power2',
            });

        }
        if (this.tutorialStage === 9) {
            this.scoreText.setVisible(true);
            this.tweens.add({
                targets: this.scoreText, // varios objetos 
                alpha: 1,
                duration: 1000,
                ease: 'Power2',
            });
        }
    }
    nextText() {
        const next = this.textContent.shift();


        if (next !== undefined) {
            this.textBox.setText(next);
            this.textBox.setAlpha(0); // Reiniciar la opacidad antes de la animación
            this.tweens.add({
                targets: this.textBox,
                alpha: 1,
                duration: 1000,
                ease: 'Power2',
            });
            // Después de crear this.textBox
            const textBounds = this.textBox.getBounds();
            // Coloca el botón justo a la derecha del texto, centrado verticalmente
            this.buttons.x = textBounds.right + this.padding;
            this.buttons.y = textBounds.centerY;
            this.tutorialStage += 1
        } else {
            // Aquí se acabaron los textos, haz lo que quieras:
            // Por ejemplo, pasar a la siguiente escena:
            this.scene.start("game", {
                soundValue: this.soundValue,
                tutorialComplete: this.tutorialComplete,
                hiScore: this.hiScore
            });

            // O mostrar un mensaje, botón, etc.
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
}