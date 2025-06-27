import audioManager from '../audio/AudioManager.js';
export default class tutorial extends Phaser.Scene {
    constructor() {
        super("tutorial");
    }

    init(data) {
        this.hiScore = data.hiScore || 0; // Valor inicial del puntaje más alto
        this.soundValue = data.soundValue || 100; // Valor inicial del volumen
    }

    preload() {

        this.load.image("background_01", "assets/background_01.png");
        this.load.image("star", "assets/star.png");
        this.load.image("square", "assets/square.png");
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
        this.add.image(960, 540, "background_01").setScale(8).setOrigin(0.5, 0.5);

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

        this.buttons = this.add.sprite(1850, 1000, "buttons", 0).setScale(2).setOrigin(0.5, 0.5);
        this.buttons.anims.play("buttons_right", true);
        //declarar flechas
        this.cursors = this.input.keyboard.createCursorKeys();
        //declarar teclas WASD
        this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

        this.tutorialComplete = true;

        this.textContent = [
            "1",
            "2",
            "3",
        ]

        this.textBox = this.add.text(960, 740, "bienvenido a mi sala del trono, músico de la corte, ha llegado el dia en que pagues tu deuda con este reino", {
            fontSize: "40px",
            fontFamily: 'MelodicaRegular',
            color: "#ffffff",
            wordWrap: { width: 600, useAdvancedWrap: true }, // <-- Aquí defines el ancho del "contenedor"
            align: 'left'
        }
        ).setOrigin(0.5, 0.5).setAlpha(0);

        this.tweens.add({
            targets: this.textBox,
            alpha: 1,
            duration: 1000,
            ease: 'Power2',
        });

        // Después de crear this.textBox
        const textBounds = this.textBox.getBounds();
        this.padding = 60;

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
}