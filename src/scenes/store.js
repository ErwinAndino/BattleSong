import { t } from '../lang.js';
import audioManager from '../audio/AudioManager.js';

export default class store extends Phaser.Scene {
  constructor() {
    super("store");
  }

  init(data) {
    this.score = data.score || 0;
    this.hiScore = data.hiScore || 0; // Valor inicial del puntaje más alto
    this.money = data.money || 0;
    this.soundValue = data.soundValue || 100; // Valor inicial del volumen
    this.tutorialComplete = data.tutorialComplete || false; // Valor inicial del tutorial
    this.healthPlayer = data.healthPlayer || 100; // Valor inicial de la salud del jugador
    this.difficultyLevel = data.difficultyLevel || 0; // Dificultad del juego
  }

  preload() {
    this.load.image("background", "assets/background_shop.png");
    this.load.image("potion", "assets/item_potion.png");
    this.load.image("block", "assets/block.png");

    this.load.spritesheet("buttons", "assets/buttons.png", {
      frameWidth: 32,
      frameHeight: 32,
    });

  }

  create() {
    //crear fondo
    this.add.image(960, 540, "background").setScale(8);


    this.add.text(960, 50, t("store"), {
      fontFamily: 'MelodicaRegular',
      fontSize: "64px",
      fill: "#fff"
    }).setOrigin(0.5, 0.5);

    this.controls = this.add.image(1820, 100, "buttons", 0).setScale(4).setOrigin(0.5, 0.5);


    this.add.text(1820, 20, t("buy"), {
      fontFamily: 'MelodicaRegular',
      fontSize: "32px",
      fill: "#fff"
    }).setOrigin(0.5, 0.5);

    this.add.text(1820, 180, t("exit"), {
      fontFamily: 'MelodicaRegular',
      fontSize: "32px",
      fill: "#fff"
    }).setOrigin(0.5, 0.5);

    this.exitActive = false;

    let locationTR = 1850
    let locationTL = 70

    this.hpbarLeft = this.add.sprite(locationTL, 75, "hpbar_left", 0).setOrigin(0, 0.5).setScale(6);
    this.hpbarMiddle = this.add.sprite(locationTL + 192, 75, "hpbar_middle", 0).setOrigin(0, 0.5).setScale(6);
    this.hpbarRight = this.add.sprite(locationTL + 384, 75, "hpbar_right", 0).setOrigin(0, 0.5).setScale(6);

    this.healthPlayerText = this.add.text(340, 74, t("health", { value: this.healthPlayer }), {
      fontFamily: 'MelodicaRegular',
      fontSize: "40px",
      fill: "#fff",
    }).setOrigin(0.5, 0.5);

    this.moneyText = this.add.text(180, 138, this.money, {
      fontFamily: 'MelodicaRegular',
      fontSize: "40px",
      fill: "#fff",
    }).setOrigin(0, 0.5); // Align to the top-left corner x 50 y -2

    this.moneyImage = this.physics.add.sprite(140, 140, "gold", 0).setScale(2).setOrigin(0.5, 0.5);
    this.moneyImage.anims.play("gold_anim", true);

    this.scoreText = this.add.text(120, 190, t("score", { value: this.score }), {
      fontFamily: 'MelodicaRegular',
      fontSize: "40px",
      fill: "#fff",
    }).setOrigin(0, 0.5); // Align to the top-left corner



    this.buyText = this.add.text(960, 200, t("bought"), {
      fontSize: "40px",
      color: "#0f0"
    }).setOrigin(0.5, 0.5).setVisible(false);

    this.cantBuyText = this.add.text(960, 200, t("cantBuy"), {
      fontSize: "40px",
      color: "#0f0"
    }).setOrigin(0.5, 0.5).setVisible(false);


    //declarar flechas
    this.cursors = this.input.keyboard.createCursorKeys();
    //declarar teclas WASD
    this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    this.keyEnter = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);

    // Ejemplo de datos (puedes reemplazarlo por tus propios datos)
    const items = [
      { key: "potion", label: t("potion"), price: 50 },
      { key: "potion", label: t("potion"), price: 25 },
      { key: "potion", label: t("potion"), price: 50 },
      { key: "potion", label: t("potion"), price: 10 },
      { key: "potion", label: t("potion"), price: 10 },

      // Agrega más objetos aquí según lo necesites
    ];

    // Mezcla el array y toma los primeros 3
    const shuffled = Phaser.Utils.Array.Shuffle(items);
    const seleccionados = shuffled.slice(0, 3);
    this.seleccionados = seleccionados;

    this.itemImages = [];
    const gap = 500;
    const totalWidth = gap * (this.seleccionados.length - 1);
    const startX = 960 - totalWidth / 2; // 960 es el centro de la pantalla

    for (let i = 0; i < this.seleccionados.length; i++) {
      const item = this.seleccionados[i];
      const x = startX + i * gap;
      const img = this.add.image(x, 640, item.key).setScale(8);
      const m = this.add.sprite(x - 20, 900, "gold", 0).setScale(2).setOrigin(0.5, 0.5);
      m.anims.play("gold_anim", true);
      const label = this.add.text(x, 800, `${item.label}`, {
        fontFamily: 'MelodicaRegular',
        fontSize: "64px",
        fill: "#fff"
      }).setOrigin(0.5, 0.5);
      const price = this.add.text(x + 20, 898, `${item.price}`, {
        fontFamily: 'MelodicaRegular',
        fontSize: "40px",
        fill: "#fff"
      }).setOrigin(0, 0.5);
      this.itemImages.push({ img, label, price, m });
    }
    this.selectedIndex = 0;
    this.item = this.seleccionados[this.selectedIndex];
    this.highlightSelection();


    // Crea un gráfico en la escena
    this.overlay = this.add.graphics();

    // Dibuja un rectángulo negro semi-transparente (alpha 0.5)
    this.overlay.fillStyle(0x000000, 0.5);
    this.overlay.fillRect(0, 0, this.cameras.main.width, this.cameras.main.height);
    this.overlay.setVisible(false);

    this.exitImage = this.add.image(960, 540, "block").setScale(32).setOrigin(0.5, 0.5).setVisible(false);
    this.exitText = this.add.text(960, 340, t("exitShop"), {
      fontFamily: 'MelodicaRegular',
      fontSize: "64px",
      fill: "#fff"
    }).setOrigin(0.5, 0.5).setVisible(false);

    this.controlsExit = this.add.image(960, 640, "buttons", 0).setScale(8).setOrigin(0.5, 0.5).setVisible(false);

    this.exitNo = this.add.text(960, 480, t("no"), {
      fontFamily: 'MelodicaRegular',
      fontSize: "64px",
      fill: "#fff"
    }).setOrigin(0.5, 0.5).setVisible(false);

    this.exitYes = this.add.text(960, 800, t("yes"), {
      fontFamily: 'MelodicaRegular',
      fontSize: "64px",
      fill: "#fff"
    }).setOrigin(0.5, 0.5).setVisible(false);

  }
  update() {

    if (Phaser.Input.Keyboard.JustDown(this.keyW) || Phaser.Input.Keyboard.JustDown(this.cursors.up) || Phaser.Input.Keyboard.JustDown(this.keyEnter)) {
      if (this.exitActive) {
        this.exitActive = false;
        this.exitText.setVisible(false);
        this.exitImage.setVisible(false);
        this.controlsExit.setVisible(false);
        this.exitNo.setVisible(false);
        this.exitYes.setVisible(false);
        this.overlay.setVisible(false);
        return
      }
      if (this.money >= this.item.price) {
        audioManager.playSound(0, 0.2, 0);
        this.buySelectedItem();
        this.money -= this.item.price;
        this.moneyText.setText(this.money)
        this.tweens.add({
          targets: this.moneyImage,
          scale: 3,
          duration: 300,
          yoyo: true,
          ease: 'Power2',
        });
      } else {
        audioManager.playSound(0, 0.2, -1);
        this.buyText.setVisible(false);
        this.cantBuyText.setVisible(true);

        this.time.delayedCall(3000, () => {
          this.cantBuyText.setVisible(false);
        });
      }
    }
    if (Phaser.Input.Keyboard.JustDown(this.keyA) || Phaser.Input.Keyboard.JustDown(this.cursors.left)) {
      this.selectedIndex = (this.selectedIndex - 1 + this.itemImages.length) % this.itemImages.length;
      this.item = this.seleccionados[this.selectedIndex];
      this.highlightSelection();
    }
    if (Phaser.Input.Keyboard.JustDown(this.keyS) || Phaser.Input.Keyboard.JustDown(this.cursors.down)) {
      if (this.exitActive) {
        this.exit();
      } else {
        this.exitActive = true;
        this.exitText.setVisible(true);
        this.exitImage.setVisible(true);
        this.controlsExit.setVisible(true);
        this.exitNo.setVisible(true);
        this.exitYes.setVisible(true);
        this.overlay.setVisible(true);
      }

    }
    if (Phaser.Input.Keyboard.JustDown(this.keyD) || Phaser.Input.Keyboard.JustDown(this.cursors.right)) {
      this.selectedIndex = (this.selectedIndex + 1) % this.itemImages.length;
      this.item = this.seleccionados[this.selectedIndex];
      this.highlightSelection();
    }

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
    } else if (this.healthPlayer <= 0) {
      this.hpbarLeft.setFrame(4);
      this.hpbarMiddle.setFrame(5);
      this.hpbarRight.setFrame(3);
      this.gameOver()
    }

  }
  highlightSelection() {
    this.itemImages.forEach((obj, i) => {
      obj.label.setStyle({ fontStyle: i === this.selectedIndex ? 'bold' : 'normal' });
      obj.label.setColor(i === this.selectedIndex ? "#ffd700" : "#fff"); // Amarillo si seleccionado, blanco si no



      // Calcula la posición Y objetivo
      const targetY = i === this.selectedIndex ? 540 : 640; // Arriba si seleccionado, abajo si no

      // Tween para la imagen
      this.tweens.add({
        targets: obj.img,
        y: targetY,
        duration: 200,
        ease: 'Power2'
      });

      // Tween para el label (ajusta si quieres que suba también)
      this.tweens.add({
        targets: obj.label,
        y: i === this.selectedIndex ? 700 : 800,
        duration: 200,
        ease: 'Power2'
      });

      this.tweens.add({
        targets: obj.m,
        y: i === this.selectedIndex ? 800 : 900,
        duration: 200,
        ease: 'Power2'
      });

      this.tweens.add({
        targets: obj.price,
        y: i === this.selectedIndex ? 798 : 898,
        duration: 200,
        ease: 'Power2'
      });


    });
  }

  // Acción de compra
  buySelectedItem() {

    if (this.item.key === "potion") {
      this.healthPlayer += 30;
      if (this.healthPlayer > 100) {
        this.healthPlayer = 100; // Limitar la salud máxima a 100
      }
      this.healthPlayerText.setText(t("health", { value: this.healthPlayer }));
    }
    // Aquí va tu lógica de compra, por ejemplo:
    this.buyText.setText(t("bought", { value: this.item.label }));

    this.cantBuyText.setVisible(false);
    this.buyText.setVisible(true);

    this.time.delayedCall(3000, () => {
      this.buyText.setVisible(false)
    });

    // Eliminar visualmente el ítem comprado
    this.itemImages[this.selectedIndex].img.destroy();
    this.itemImages[this.selectedIndex].label.destroy();
    this.itemImages[this.selectedIndex].m.destroy();
    this.itemImages[this.selectedIndex].price.destroy();

    // Eliminar el ítem de los arrays
    this.seleccionados.splice(this.selectedIndex, 1);
    this.itemImages.splice(this.selectedIndex, 1);

    // Ajustar el índice seleccionado
    if (this.selectedIndex >= this.itemImages.length) {
      this.selectedIndex = Math.max(0, this.itemImages.length - 1);
    }

    // Actualizar la selección visual si quedan ítems
    if (this.itemImages.length > 0) {
      this.highlightSelection();
    }
  }

  exit() {
    this.scene.start("game", {
      score: this.score,
      money: this.money,
      soundValue: this.soundValue,
      tutorialComplete: this.tutorialComplete,
      healthPlayer: this.healthPlayer,
      hiScore: this.hiScore,
      difficultyLevel: this.difficultyLevel
    });
  }
}