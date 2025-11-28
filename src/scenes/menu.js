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
        this.difficultyLevel = data.difficultyLevel || 3; // Dificultad del juego
    }

    preload() {
        this.load.image("background_menu", "assets/background_menu.png");
        this.load.image("star", "assets/star.png");
        this.load.image("block", "assets/block.png");
        this.load.image("indicator", "assets/indicator.png");
        this.load.image("indicator_attack", "assets/indicator_attack.png");
        this.load.json('translations', 'assets/lang.json');
        this.load.image("arrows", "assets/arrows.png");

    }

    async create() {
        await document.fonts.ready;
        await loadTranslations(this); // ya no es async

        let started = false;
        let audioUnlocked = false;

        const unlockAudio = async () => {
            if (audioUnlocked) return true;
            try {
                await audioManager.unlock(); // Necesita gesto del usuario
                console.log("Audio desbloqueado");
                audioUnlocked = true;
                return true;
            } catch (e) {
                console.warn("No se pudo desbloquear el audio aún.");
                return false;
            }
        };

        const startMenu = async () => {
            if (started) return;
            started = true;

            await audioManager.start(); // Ya no intenta desbloquear audio acá
            this.setVolumen(this.soundValue);

            this.selector = 2;
            this.highlightSelection(this.selector);
            this.start.setVisible(true).setInteractive();
            this.difficulty.setVisible(true).setInteractive();
            this.settings.setVisible(true).setInteractive();
            this.hiScoreText.setVisible(true);
            this.pressButton.setVisible(false);
        };
        const onFirstInteraction = async () => {
            const unlocked = await unlockAudio();
            if (unlocked) {
                startMenu();
                if (this.sys.canvas) {
                    this.sys.canvas.addEventListener('touchstart', startMenu, { once: true });
                }
            } else {
                // Si falla, permite intentar de nuevo
                console.warn("Primer click no desbloqueó el audio, esperando otro intento...");
            }
        };

        // Esperá múltiples intentos hasta que logre desbloquear el audio
        this.input.on('pointerdown', onFirstInteraction);
        this.input.keyboard.on('keydown', onFirstInteraction);
        //crear fondo
        this.add.image(960, 540, "background_menu").setScale(8).setOrigin(0.5, 0.5);

        this.difficultyActive = false;
        this.settingActive = false;
        this.soundActive = false;
        this.idiomaActive = false;

        this.pressButton = this.add.text(960, 600, "...", {
            fontFamily: 'MelodicaRegular',
            fontSize: "64px",
        }).setOrigin(0.5, 0.5).setColor("#ffffff").setVisible(true);

        this.start = this.add.text(960, 500, "...", {
            fontFamily: 'MelodicaRegular',
            fontSize: "128px",
        }).setOrigin(0.5, 0.5).setColor("#ffffff").setVisible(false).disableInteractive();

        this.difficulty = this.add.text(960, 700, "...", {
            fontFamily: 'MelodicaRegular',
            fontSize: "128px",
        }).setOrigin(0.5, 0.5).setColor("#ffffff").setVisible(false).disableInteractive();

        this.difficultyControl = this.add.text(960, 700, "facil", {
            fontFamily: 'MelodicaRegular',
            fontSize: "128px",
        }).setOrigin(0.5, 0.5).setColor("#ffd700").setVisible(false).setAlpha(0).disableInteractive();

        this.settings = this.add.text(960, 900, "...", {
            fontFamily: 'MelodicaRegular',
            fontSize: "128px",
        }).setOrigin(0.5, 0.5).setColor("#ffffff").setVisible(false).disableInteractive();

        this.hiScoreText = this.add.text(20, 1000, "...", {
            fontFamily: 'MelodicaRegular',
            fontSize: "60px",
        }).setOrigin(0, 0.5).setColor("#ffffff").setVisible(false);

        this.copyrightText = this.add.text(1900, 1000, "...", {
            fontFamily: 'MelodicaRegular',
            fontSize: "60px",
        }).setOrigin(1, 0.5).setColor("#ffffff").setVisible(true);

        // Crea un gráfico en la escena
        this.overlay = this.add.graphics();

        // Dibuja un rectángulo negro semi-transparente (alpha 0.5)
        this.overlay.fillStyle(0x000000, 0.5);
        this.overlay.fillRect(0, 0, this.cameras.main.width, this.cameras.main.height);
        this.overlay.setVisible(false);

        this.settingsimage = this.add.image(960, 540, "block").setScale(32).setOrigin(0.5, 0.5).setVisible(false);

        this.sound = this.add.text(960, 300, "...", {
            fontFamily: 'MelodicaRegular',
            fontSize: "128px",
        }).setOrigin(0.5, 0.5).setColor("#ffffff").setVisible(false).disableInteractive();

        this.soundControl = this.add.text(960, 300, this.soundValue, {
            fontFamily: 'MelodicaRegular',
            fontSize: "128px",
        }).setOrigin(0.5, 0.5).setColor("#ffd700").setVisible(false).setAlpha(0).disableInteractive();

        this.language = this.add.text(960, 500, "...", {
            fontFamily: 'MelodicaRegular',
            fontSize: "128px",
        }).setOrigin(0.5, 0.5).setColor("#ffffff").setVisible(false).disableInteractive();

        this.languageControl = this.add.text(960, 500, "...", {
            fontFamily: 'MelodicaRegular',
            fontSize: "128px",
        }).setOrigin(0.5, 0.5).setColor("#ffd700").setVisible(false).setAlpha(0).disableInteractive();

        this.back = this.add.text(960, 700, "...", {
            fontFamily: 'MelodicaRegular',
            fontSize: "128px",
        }).setOrigin(0.5, 0.5).setColor("#ffffff").setVisible(false).disableInteractive();

        this.ready = true;

        this.time.delayedCall(100, () => {
            this.updateText();
        });

        //declarar flechas
        this.cursors = this.input.keyboard.createCursorKeys();
        //declarar teclas WASD
        this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        this.keyEnter = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);


        //menu
        this.start.on('pointerover', () => {
            this.highlightSelection(3);
        });
        this.difficulty.on('pointerover', () => {
            this.highlightSelection(2);
        });
        this.settings.on('pointerover', () => {
            this.highlightSelection(1);
        });

        //settings
        this.sound.on('pointerover', () => {
            this.highlightSelection(3);
        });
        this.language.on('pointerover', () => {
            this.highlightSelection(2);
        });
        this.back.on('pointerover', () => {
            this.highlightSelection(1);
        });

        //menu
        this.start.on('pointerdown', this.startGame, this);
        this.difficulty.on('pointerdown', function () {
            if (this.difficultyActive) {
                this.exitDificultad();
            } else {
                this.dificultad();
            }
        }, this);

        this.difficultyControl.on('pointerdown', function () {
            audioManager.playSound(0, 0.2, 1);
            if (this.difficultyLevel === 0) {
                this.difficultyLevel = 3;
                this.difficultyControl.setText(t("medium"))
            } else if (this.difficultyLevel === 3) {
                this.difficultyLevel = 5
                this.difficultyControl.setText(t("hard"))
            } else if (this.difficultyLevel === 5) {
                this.difficultyLevel = 0
                this.difficultyControl.setText(t("easy"))
            }
        }, this);

        this.settings.on('pointerdown', function () {
            this.opciones();
            if (this.difficultyActive) {
                this.exitDificultad();
            }
        }, this);
        //settings
        this.sound.on('pointerdown', function () {
            if (this.soundActive) {
                this.exitVolumen();
            } else {
                this.volumen();
                if (this.idiomaActive) {
                    this.exitIdioma();
                }
            }
        }, this);

        this.soundControl.on('pointerdown', function () {
            this.soundValue -= 10;
            if (this.soundValue < 0) {
                this.soundValue = 100;
            }
            this.soundControl.setText(this.soundValue);
            this.setVolumen(this.soundValue);
            audioManager.playSound(0, 0.2, 1);
        }, this);

        this.language.on('pointerdown', function () {
            if (this.idiomaActive) {
                this.exitIdioma();
            } else {
                this.idioma();
                if (this.soundActive) {
                    this.exitVolumen();
                }
            }
        }, this);

        this.languageControl.on('pointerdown', function () {
            if (getLang() === 'es') {
                setLang('en');
            } else {
                setLang('es');
            }
            this.updateText();
            audioManager.playSound(0, 0.2, 1);
        }, this);
        this.back.on('pointerdown', function () {
            this.exitOpciones();
            if (this.idiomaActive) {
                this.exitIdioma();
            }
            if (this.soundActive) {
                this.exitVolumen();
            }
        }, this);
    }
    update() {
        if (!this.ready) return;
        if (this.idiomaActive === true) {
            this.languageControl.setVisible(true);
            this.languageControl.setAlpha(1);
            if (Phaser.Input.Keyboard.JustDown(this.keyW) || Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
                if (getLang() === 'es') {
                    setLang('en');
                } else {
                    setLang('es');
                }
                this.updateText();
                audioManager.playSound(0, 0.2, 1);
            }
            if (Phaser.Input.Keyboard.JustDown(this.keyA) || Phaser.Input.Keyboard.JustDown(this.cursors.left) || Phaser.Input.Keyboard.JustDown(this.keyEnter)) {
                this.exitIdioma();
            }
            if (Phaser.Input.Keyboard.JustDown(this.keyS) || Phaser.Input.Keyboard.JustDown(this.cursors.down)) {
                if (getLang() === 'es') {
                    setLang('en');
                } else {
                    setLang('es');
                }
                this.updateText();
                audioManager.playSound(0, 0.2, 1);
            }
            if (Phaser.Input.Keyboard.JustDown(this.keyD) || Phaser.Input.Keyboard.JustDown(this.cursors.right) || Phaser.Input.Keyboard.JustDown(this.keyEnter)) {
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
                audioManager.playSound(0, 0.2, 1);
            }
            if (Phaser.Input.Keyboard.JustDown(this.keyA) || Phaser.Input.Keyboard.JustDown(this.cursors.left) || Phaser.Input.Keyboard.JustDown(this.keyEnter)) {
                this.exitVolumen();
            }
            if (Phaser.Input.Keyboard.JustDown(this.keyS) || Phaser.Input.Keyboard.JustDown(this.cursors.down)) {
                this.soundValue -= 10;
                if (this.soundValue < 0) {
                    this.soundValue = 0; // Cambia a 1 si solo hay dos opciones
                }
                this.soundControl.setText(this.soundValue);
                this.setVolumen(this.soundValue);
                audioManager.playSound(0, 0.2, 1);
            }
            if (Phaser.Input.Keyboard.JustDown(this.keyD) || Phaser.Input.Keyboard.JustDown(this.cursors.right) || Phaser.Input.Keyboard.JustDown(this.keyEnter)) {
                this.exitVolumen();
            }
        } else if (this.difficultyActive) {
            this.difficultyControl.setVisible(true);
            this.difficultyControl.setAlpha(1);
            if (Phaser.Input.Keyboard.JustDown(this.keyW) || Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
                audioManager.playSound(0, 0.2, 1);
                if (this.difficultyLevel === 0) {
                    this.difficultyLevel = 3;
                    this.difficultyControl.setText(t("medium"))
                } else if (this.difficultyLevel === 3) {
                    this.difficultyLevel = 5
                    this.difficultyControl.setText(t("hard"))
                } else if (this.difficultyLevel === 5) {
                    this.difficultyLevel = 0
                    this.difficultyControl.setText(t("easy"))
                }
            }
            if (Phaser.Input.Keyboard.JustDown(this.keyA) || Phaser.Input.Keyboard.JustDown(this.cursors.left) || Phaser.Input.Keyboard.JustDown(this.keyEnter)) {
                this.exitDificultad();
            }
            if (Phaser.Input.Keyboard.JustDown(this.keyS) || Phaser.Input.Keyboard.JustDown(this.cursors.down)) {
                audioManager.playSound(0, 0.2, 1);
                if (this.difficultyLevel === 0) {
                    this.difficultyLevel = 5;
                    this.difficultyControl.setText(t("hard"))
                } else if (this.difficultyLevel === 5) {
                    this.difficultyLevel = 3
                    this.difficultyControl.setText(t("medium"))
                } else if (this.difficultyLevel === 3) {
                    this.difficultyLevel = 0
                    this.difficultyControl.setText(t("easy"))
                }
            }
            if (Phaser.Input.Keyboard.JustDown(this.keyD) || Phaser.Input.Keyboard.JustDown(this.cursors.right) || Phaser.Input.Keyboard.JustDown(this.keyEnter)) {
                this.exitDificultad();
            }
        } else if (this.settingActive) {
            if (Phaser.Input.Keyboard.JustDown(this.keyW) || Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
                this.selector++;
                if (this.selector > 3) {
                    this.selector = 3; // Cambia a 1 si solo hay dos opciones
                }
                this.highlightSelection(this.selector)
            }
            if (Phaser.Input.Keyboard.JustDown(this.keyA) || Phaser.Input.Keyboard.JustDown(this.cursors.left) || Phaser.Input.Keyboard.JustDown(this.keyEnter)) {
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
                this.highlightSelection(this.selector)
            }
            if (Phaser.Input.Keyboard.JustDown(this.keyD) || Phaser.Input.Keyboard.JustDown(this.cursors.right) || Phaser.Input.Keyboard.JustDown(this.keyEnter)) {
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
                if (this.selector > 3) {
                    this.selector = 3; // Cambia a 1 si solo hay dos opciones
                }
                this.highlightSelection(this.selector)
            }
            if (Phaser.Input.Keyboard.JustDown(this.keyA) || Phaser.Input.Keyboard.JustDown(this.cursors.left) || Phaser.Input.Keyboard.JustDown(this.keyEnter)) {
                if (this.selector === 3) {
                    this.startGame(); // Cambia a la escena de juego
                } else if (this.selector === 2) {
                    this.dificultad();
                } else if (this.selector === 1) {
                    this.opciones(); // Cambia a la escena de configuración
                }
            }
            if (Phaser.Input.Keyboard.JustDown(this.keyS) || Phaser.Input.Keyboard.JustDown(this.cursors.down)) {
                this.selector--;
                if (this.selector < 1) {
                    this.selector = 1; // Cambia a 1 si solo hay dos opciones
                }
                this.highlightSelection(this.selector)
            }
            if (Phaser.Input.Keyboard.JustDown(this.keyD) || Phaser.Input.Keyboard.JustDown(this.cursors.right) || Phaser.Input.Keyboard.JustDown(this.keyEnter)) {
                if (this.selector === 3) {
                    this.startGame(); // Cambia a la escena de juego
                } else if (this.selector === 2) {
                    this.dificultad();
                } else if (this.selector === 1) {
                    this.opciones(); // Cambia a la escena de configuración
                }
            }
        }

    }
    highlightSelection(selector) {
        if (this.sound && this.language && this.back) {
            if (this.settingActive) {
                switch (selector) {
                    case 3:
                        this.sound.setColor("#ffd700");
                        this.language.setColor("#ffffff");
                        this.back.setColor("#ffffff");
                        break;

                    case 2:
                        this.sound.setColor("#ffffff");
                        this.language.setColor("#ffd700");
                        this.back.setColor("#ffffff");
                        break;

                    case 1:
                        this.sound.setColor("#ffffff");
                        this.language.setColor("#ffffff");
                        this.back.setColor("#ffd700");
                        break;
                }
                return
            }
        }
        if (this.start && this.settings && this.difficulty) {
            switch (selector) {
                case 3:
                    this.start.setColor("#ffd700");
                    this.difficulty.setColor("#ffffff");
                    this.settings.setColor("#ffffff");
                    break;

                case 2:
                    this.start.setColor("#ffffff");
                    this.difficulty.setColor("#ffd700");
                    this.settings.setColor("#ffffff");

                    break;

                case 1:
                    this.start.setColor("#ffffff");
                    this.difficulty.setColor("#ffffff");
                    this.settings.setColor("#ffd700");
                    break;
            }

        }
    }
    dificultad() {
        audioManager.playSound(0, 0.2, 1);
        this.difficultyActive = true;
        this.difficultyControl.setVisible(true);
        this.difficultyControl.setInteractive();
        this.tweens.add({
            targets: this.difficulty,
            x: 650,
            y: 700,
            duration: 500,
            ease: 'Power2',
        })
        this.soundControl.setVisible(true);

        this.tweens.add({
            targets: this.difficultyControl,
            x: 1270,
            y: 700,
            duration: 500,
            ease: 'Power2'
        });
    }

    exitDificultad() {
        audioManager.playSound(0, 0.2, 1);
        this.difficultyActive = false;
        this.difficultyControl.disableInteractive();
        this.tweens.add({
            targets: this.difficulty,
            x: 960,
            y: 700,
            duration: 500,
            ease: 'Power2',
        })


        this.tweens.add({
            targets: this.difficultyControl,
            x: 960,
            y: 700,
            alpha: 0,
            duration: 500,
            ease: 'Power2',
            onComplete: () => {
                this.difficultyControl.setVisible(false);
            }
        });
    }

    opciones() {
        audioManager.playSound(0, 0.2, 1);
        //menu
        this.start.disableInteractive();
        this.difficulty.disableInteractive();
        this.settings.disableInteractive();
        //settings
        this.sound.setInteractive();
        this.language.setInteractive();
        this.back.setInteractive();

        this.settingActive = true;
        this.selector = 3;
        this.highlightSelection(this.selector)
        this.settingsimage.setVisible(true);
        this.overlay.setVisible(true);
        this.sound.setVisible(true);
        this.language.setVisible(true);
        this.back.setVisible(true);
    }
    exitOpciones() {
        audioManager.playSound(0, 0.2, 1);
        //menu
        this.start.setInteractive();
        this.difficulty.setInteractive();
        this.settings.setInteractive();
        //settings
        this.sound.disableInteractive();
        this.language.disableInteractive();
        this.back.disableInteractive();

        this.settingActive = false;
        this.selector = 1;
        this.highlightSelection(this.selector)
        this.settingsimage.setVisible(false);
        this.overlay.setVisible(false);
        this.sound.setVisible(false);
        this.language.setVisible(false);
        this.back.setVisible(false);
    }
    volumen() {
        audioManager.playSound(0, 0.2, 1);
        this.soundActive = true;
        this.soundControl.setInteractive();
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
        audioManager.playSound(0, 0.2, 1);
        this.soundActive = false;
        this.soundControl.disableInteractive();
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
        audioManager.playSound(0, 0.2, 1);
        this.idiomaActive = true;
        this.languageControl.setInteractive();

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
        audioManager.playSound(0, 0.2, 1);
        this.idiomaActive = false;
        this.languageControl.disableInteractive();

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
        audioManager.playSound(0, 0.2, 1);
        this.selector = 0;
        if (!this.tutorialComplete) {
            this.scene.start("tutorial", { hiScore: this.hiScore, soundValue: this.soundValue, difficultyLevel: this.difficultyLevel });
        } else {
            this.scene.start("game", { hiScore: this.hiScore, soundValue: this.soundValue, tutorialComplete: this.tutorialComplete, difficultyLevel: this.difficultyLevel });
        }
    }

    updateText() {
        this.start.setText(t("start"));
        this.difficulty.setText(t("difficulty"));
        this.settings.setText(t("settings"));
        this.hiScoreText.setText(t("highScore", { score: this.hiScore }));
        this.copyrightText.setText("© 2025 Erwin Andino");
        this.sound.setText(t("sound"));
        this.language.setText(t("language"));
        this.back.setText(t("back"));
        this.pressButton.setText(t("pressButton"));
        this.languageControl.setText(t("lang"));


        if (this.difficultyLevel === 0) {
            this.difficultyControl.setText(t("easy"))
        } else if (this.difficultyLevel === 3) {
            this.difficultyControl.setText(t("medium"))
        } else if (this.difficultyLevel === 5) {
            this.difficultyControl.setText(t("hard"))
        }
    }
}