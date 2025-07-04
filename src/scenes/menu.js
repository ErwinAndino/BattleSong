import audioManager from '../audio/AudioManager.js';
import { t, setLang, getLang, loadTranslations } from '../lang.js';
export default class menu extends Phaser.Scene {
    constructor() {
        super("menu");
        this.ready = false;
    }

    init(data) {
        this.hiScore = data.hiScore || 0; // Valor inicial del puntaje más alto
        this.money = data.money || 0;
        this.soundValue = data.soundValue || 100; // Valor inicial del volumen
        this.tutorialComplete = data.tutorialComplete || false; // Valor inicial de la finalización del tutorial
    }

    preload() {
        this.load.image("background_menu", "assets/background_menu.png");
        this.load.image("star", "assets/star.png");
        this.load.image("block", "assets/block.png");
        this.load.image("indicator", "assets/indicator.png");
        this.load.image("indicator_attack", "assets/indicator_attack.png");
        this.load.json('translations', 'assets/lang.json');
    }

    async create() {
        await document.fonts.ready;
        await loadTranslations(this); // ya no es async
        this.input.keyboard.once('keydown', async () => {
            await audioManager.start();
            this.setVolumen(this.soundValue); // <-- Aplica el volumen aquí, después de cargar instrumentos
            this.selector = 2;
            this.start.setVisible(true);
            this.settings.setVisible(true);
            this.hiScoreText.setVisible(true);
            this.pressButton.setVisible(false);
        });



        //declarar flechas
        this.cursors = this.input.keyboard.createCursorKeys();
        //declarar teclas WASD
        this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);




        //crear fondo
        this.add.image(960, 540, "background_menu").setScale(8).setOrigin(0.5, 0.5);

        this.settingActive = false;
        this.soundActive = false;
        this.idiomaActive = false;

        this.pressButton = this.add.text(960, 600, t("pressButton"), {
            fontFamily: 'MelodicaRegular',
            fontSize: "64px",
        }).setOrigin(0.5, 0.5).setColor("#ffffff").setVisible(true);

        this.start = this.add.text(960, 600, t("start"), {
            fontFamily: 'MelodicaRegular',
            fontSize: "128px",
        }).setOrigin(0.5, 0.5).setColor("#ffffff").setVisible(false);

        this.settings = this.add.text(960, 800, t("settings"), {
            fontFamily: 'MelodicaRegular',
            fontSize: "128px",
        }).setOrigin(0.5, 0.5).setColor("#ffffff").setVisible(false);

        this.hiScoreText = this.add.text(20, 1000, t("highScore", { score: this.hiScore }), {
            fontFamily: 'MelodicaRegular',
            fontSize: "60px",
        }).setOrigin(0, 0.5).setColor("#ffffff").setVisible(false);

        // Crea un gráfico en la escena
        this.overlay = this.add.graphics();

        // Dibuja un rectángulo negro semi-transparente (alpha 0.5)
        this.overlay.fillStyle(0x000000, 0.5);
        this.overlay.fillRect(0, 0, this.cameras.main.width, this.cameras.main.height);
        this.overlay.setVisible(false);

        this.settingsimage = this.add.image(960, 540, "block").setScale(32).setOrigin(0.5, 0.5).setVisible(false);

        this.sound = this.add.text(960, 300, t("sound"), {
            fontFamily: 'MelodicaRegular',
            fontSize: "128px",
        }).setOrigin(0.5, 0.5).setColor("#ffffff").setVisible(false);

        this.soundControl = this.add.text(960, 300, this.soundValue, {
            fontFamily: 'MelodicaRegular',
            fontSize: "128px",
        }).setOrigin(0.5, 0.5).setColor("#ffd700").setVisible(false).setAlpha(0);

        this.language = this.add.text(960, 500, t("language"), {
            fontFamily: 'MelodicaRegular',
            fontSize: "128px",
        }).setOrigin(0.5, 0.5).setColor("#ffffff").setVisible(false);

        this.languageControl = this.add.text(960, 500, "Undefined", {
            fontFamily: 'MelodicaRegular',
            fontSize: "128px",
        }).setOrigin(0.5, 0.5).setColor("#ffd700").setVisible(false).setAlpha(0);

        this.back = this.add.text(960, 700, t("back"), {
            fontFamily: 'MelodicaRegular',
            fontSize: "128px",
        }).setOrigin(0.5, 0.5).setColor("#ffffff").setVisible(false);


        if (getLang() === 'es') {
            this.languageControl.setText('Español');
        } else {
            this.languageControl.setText('English');
        }
        this.ready = true;
        this.selector = 0;
    }
    update() {
        if (!this.ready) return;
        if (this.idiomaActive === true) {
            this.languageControl.setVisible(true);
            this.languageControl.setAlpha(1);
            if (Phaser.Input.Keyboard.JustDown(this.keyW) || Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
                if (getLang() === 'es') {
                    setLang('en');
                    this.languageControl.setText('English');
                    this.updateText();
                } else {
                    setLang('es');
                    this.languageControl.setText('Español');
                    this.updateText();
                }
            }
            if (Phaser.Input.Keyboard.JustDown(this.keyA) || Phaser.Input.Keyboard.JustDown(this.cursors.left)) {
                this.exitIdioma();
            }
            if (Phaser.Input.Keyboard.JustDown(this.keyS) || Phaser.Input.Keyboard.JustDown(this.cursors.down)) {
                if (getLang() === 'es') {
                    setLang('en');
                    this.languageControl.setText('English');
                    this.updateText();
                } else {
                    setLang('es');
                    this.languageControl.setText('Español');
                    this.updateText();
                }
            }
            if (Phaser.Input.Keyboard.JustDown(this.keyD) || Phaser.Input.Keyboard.JustDown(this.cursors.right)) {
                this.exitIdioma();
            }
        } else if (this.soundActive) {
            this.soundControl.setVisible(true);
            this.soundControl.setAlpha(1);
            if (Phaser.Input.Keyboard.JustDown(this.keyW) || Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
                this.soundValue += 10;
                if (this.soundValue > 100) {
                    this.soundValue = 100; // Cambia a 1 si solo hay dos opciones
                }
                this.soundControl.setText(this.soundValue);
                this.setVolumen(this.soundValue);
            }
            if (Phaser.Input.Keyboard.JustDown(this.keyA) || Phaser.Input.Keyboard.JustDown(this.cursors.left)) {
                this.exitVolumen();
            }
            if (Phaser.Input.Keyboard.JustDown(this.keyS) || Phaser.Input.Keyboard.JustDown(this.cursors.down)) {
                this.soundValue -= 10;
                if (this.soundValue < 0) {
                    this.soundValue = 0; // Cambia a 1 si solo hay dos opciones
                }
                this.soundControl.setText(this.soundValue);
                this.setVolumen(this.soundValue);
            }
            if (Phaser.Input.Keyboard.JustDown(this.keyD) || Phaser.Input.Keyboard.JustDown(this.cursors.right)) {
                this.exitVolumen();
            }
        } else if (this.settingActive) {
            if (Phaser.Input.Keyboard.JustDown(this.keyW) || Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
                this.selector++;
                if (this.selector > 3) {
                    this.selector = 3; // Cambia a 1 si solo hay dos opciones
                }
            }
            if (Phaser.Input.Keyboard.JustDown(this.keyA) || Phaser.Input.Keyboard.JustDown(this.cursors.left)) {
                if (this.selector === 3) {
                    this.volumen(); // Cambia a la escena de configuración
                } else if (this.selector === 2) {
                    this.idioma();
                } else if (this.selector === 1) {
                    this.exitOpciones(); // Cambia a la escena de configuración
                }
            }
            if (Phaser.Input.Keyboard.JustDown(this.keyS) || Phaser.Input.Keyboard.JustDown(this.cursors.down)) {
                this.selector--;
                if (this.selector < 1) {
                    this.selector = 1; // Cambia a 1 si solo hay dos opciones
                }
            }
            if (Phaser.Input.Keyboard.JustDown(this.keyD) || Phaser.Input.Keyboard.JustDown(this.cursors.right)) {
                if (this.selector === 3) {
                    this.volumen();
                } else if (this.selector === 2) {
                    this.idioma();
                } else if (this.selector === 1) {
                    this.exitOpciones(); // Cambia a la escena de configuración
                }
            }
        } else {
            if (Phaser.Input.Keyboard.JustDown(this.keyW) || Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
                this.selector++;
                if (this.selector > 2) {
                    this.selector = 2; // Cambia a 1 si solo hay dos opciones
                }
            }
            if (Phaser.Input.Keyboard.JustDown(this.keyA) || Phaser.Input.Keyboard.JustDown(this.cursors.left)) {
                if (this.selector === 2) {
                    this.startGame(); // Cambia a la escena de juego
                } else if (this.selector === 1) {
                    this.opciones(); // Cambia a la escena de configuración
                }
            }
            if (Phaser.Input.Keyboard.JustDown(this.keyS) || Phaser.Input.Keyboard.JustDown(this.cursors.down)) {
                this.selector--;
                if (this.selector < 0) {
                    this.selector = 1; // Cambia a 1 si solo hay dos opciones
                }
            }
            if (Phaser.Input.Keyboard.JustDown(this.keyD) || Phaser.Input.Keyboard.JustDown(this.cursors.right)) {
                if (this.selector === 2) {
                    this.startGame(); // Cambia a la escena de juego
                } else if (this.selector === 1) {
                    this.opciones()
                }
            }
        }
        if (this.start != null && this.settings != null) {
            if (this.selector === 2) {
                this.start.setColor("#ffd700");
                this.settings.setColor("#ffffff");
            } else if (this.selector === 1) {
                this.start.setColor("#ffffff");
                this.settings.setColor("#ffd700");
            }
        }

        if (this.settingActive) {
            if (this.selector === 3) {
                this.sound.setColor("#ffd700");
                this.language.setColor("#ffffff");
                this.back.setColor("#ffffff");
            } else if (this.selector === 2) {
                this.sound.setColor("#ffffff");
                this.language.setColor("#ffd700");
                this.back.setColor("#ffffff");
            } else if (this.selector === 1) {
                this.sound.setColor("#ffffff");
                this.language.setColor("#ffffff");
                this.back.setColor("#ffd700");
            }
        }


    }

    opciones() {
        this.settingActive = true;
        this.selector = 3;
        this.settingsimage.setVisible(true);
        this.overlay.setVisible(true);
        this.sound.setVisible(true);
        this.language.setVisible(true);
        this.back.setVisible(true);
    }
    exitOpciones() {
        this.settingActive = false;
        this.selector = 1;
        this.settingsimage.setVisible(false);
        this.overlay.setVisible(false);
        this.sound.setVisible(false);
        this.language.setVisible(false);
        this.back.setVisible(false);
    }
    volumen() {
        this.soundActive = true;
        this.soundControl.setText(this.soundValue);
        this.tweens.add({
            targets: this.sound,
            x: 750,
            y: 300,
            duration: 500,
            ease: 'Power2',
        })
        this.soundControl.setVisible(true);

        this.tweens.add({
            targets: this.soundControl,
            x: 1170,
            y: 300,
            duration: 500,
            ease: 'Power2'
        });
    }
    exitVolumen() {
        this.soundActive = false;
        this.tweens.add({
            targets: this.sound,
            x: 960,
            y: 300,
            duration: 500,
            ease: 'Power2',
        })


        this.tweens.add({
            targets: this.soundControl,
            x: 960,
            y: 300,
            alpha: 0,
            duration: 500,
            ease: 'Power2',
            onComplete: () => {
                this.soundControl.setVisible(false);
            }
        });
    }
    setVolumen(soundValue) {
        console.log("Setting volume to:", soundValue);
        soundValue = soundValue / 166; // Normaliza el valor a un rango de 0 a 1
        audioManager.setVolume(0, soundValue * 0.5);
        audioManager.setVolume(1, soundValue * 0.66);
        audioManager.setVolume(2, soundValue * 0.33);
        audioManager.setVolume(3, soundValue * 1);
    }

    idioma() {
        this.idiomaActive = true;

        this.tweens.add({
            targets: this.language,
            x: 750,
            y: 500,
            duration: 500,
            ease: 'Power2',
        })
        this.languageControl.setVisible(true);

        this.tweens.add({
            targets: this.languageControl,
            x: 1200,
            y: 500,
            alpha: 1,
            duration: 500,
            ease: 'Power2'
        });
    }

    exitIdioma() {
        this.idiomaActive = false;

        this.tweens.add({
            targets: this.language,
            x: 960,
            y: 500,
            duration: 500,
            ease: 'Power2',
        })

        this.tweens.add({
            targets: this.languageControl,
            x: 960,
            y: 500,
            alpha: 0,
            duration: 500,
            ease: 'Power2',
            onComplete: () => {
                this.languageControl.setVisible(false);
            }
        });
    }

    startGame() {
        this.selector = 0;
        if (!this.tutorialComplete) {
            this.scene.start("tutorial", { hiScore: this.hiScore, soundValue: this.soundValue });
        } else {
            this.scene.start("game", { hiScore: this.hiScore, soundValue: this.soundValue, tutorialComplete: this.tutorialComplete });
        }
    }

    updateText() {
        this.start.setText(t("start"));
        this.settings.setText(t("settings"));
        this.hiScoreText.setText(t("highScore", { score: this.hiScore }));
        this.sound.setText(t("sound"));
        this.language.setText(t("language"));
        this.back.setText(t("back"));
        this.pressButton.setText(t("pressButton"));
    }
}