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

        this.load.image("background_tutorial", "assets/background_tutorial.png");
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
        this.add.image(960, 540, "background_tutorial").setScale(8).setOrigin(0.5, 0.5);

        let locationTR = 1850
        let locationTL = 70

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


        this.healthPlayerText = this.add.text(340, 74, `HP / 100`, {
            fontFamily: 'MelodicaRegular',
            fontSize: "40px",
            fill: "#fff",
        }).setOrigin(0.5, 0.5).setVisible(false).setAlpha(0); // Align to the top-left corner

        this.moneyText = this.add.text(150, 130, `Gold: 0`, {
            fontFamily: 'MelodicaRegular',
            fontSize: "40px",
            fill: "#fff",
        }).setOrigin(0.5, 0.5).setVisible(false).setAlpha(0); // Align to the top-left corner

        this.scoreText = this.add.text(150, 170, `Score: 0`, {
            fontFamily: 'MelodicaRegular',
            fontSize: "40px",
            fill: "#fff",
        }).setOrigin(0.5, 0.5).setVisible(false).setAlpha(0); // Align to the top-left corner


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
            "El reino esta siendo devastado por fuerzas malvadas las cuales poseen una debilidad muy particular.",
            "La musica! la cual confunde a los mounstruos y hace que dejen de atacar",
            "Tu mision es enfrentarte a estos enemigos y tocar una melodia para persuadirlos a dejar de atacar",
            "Para lograrlo deberas defenderte de sus ataques identificando su direccion y contratacar en el instante exacto.",
            "si recibes un ataque del enemigo te danara y al reducir la totalidad de tu vitalidad seras derrotado",
            "para derrotar el enemigo debes sobrevivir sus ataques por la duracion de tu cancion",
            "En tu aventura encontraras mercaderes con los cuales podras adquirir nuevo equipamiento",
            "Ten en cuenta que a medida que avances te encontraras con enemigos mas fuertes que atacaran mas ferozmente y resistiran mas fuerte a tu melodia",
            "tu desempeno sera medido de acuerdo a tus aciertos y seras recompensado acordemente",
            "Buena suerte, musico de la corte",
        ]

        this.textBox = this.add.text(960, 740, "Bienvenido musico de la corte, tus servicios son necesitados hoy mas que nunca.", {
            fontSize: "64px",
            fontFamily: 'MelodicaRegular',
            color: "#ffffff",
            wordWrap: { width: 1200, useAdvancedWrap: true }, // <-- Aquí defines el ancho del "contenedor"
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
        if (this.tutorialStage === 3) {
            this.attack();
        }

        if (this.tutorialStage === 5) {
            this.healthbar();
        }

        if (this.tutorialStage === 6) {
            this.timebar();

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
        console.log(this.tutorialStage)


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
    attack() {
        this.indicatorUp.setVisible(true);
        this.indicatorLeft.setVisible(true);
        this.indicatorDown.setVisible(true);
        this.indicatorRight.setVisible(true);

        this.tweens.add({
            targets: [this.indicatorUp, this.indicatorLeft, this.indicatorDown, this.indicatorRight], // varios objetos 
            alpha: 1,
            duration: 1000,
            ease: 'Power2',
        });
    }
    healthbar() {
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
    timebar() {
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
}