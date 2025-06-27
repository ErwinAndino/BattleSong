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
     this.difficulty = data.difficulty || 0; // Dificultad del juego
  }

  preload() {
    this.load.image("background", "public/assets/background_shop.png");
    this.load.image("platform", "public/assets/platform.png");
    this.load.image("star", "public/assets/star.png");
    this.load.image("bomb", "public/assets/bomb.png");
    this.load.image("square", "public/assets/square.png");
    this.load.spritesheet("dude", "./public/assets/dude.png", {
      frameWidth: 32,
      frameHeight: 48,
    });
  }

  create() {
    //crear fondo
    this.add.image(960, 540, "background").setScale(8);

    let locationTR = 1850
    let locationTL = 70

    this.hpbarLeft = this.add.sprite(locationTL, 75, "hpbar_left", 0).setOrigin(0, 0.5).setScale(6);
    this.hpbarMiddle = this.add.sprite(locationTL + 192, 75, "hpbar_middle", 0).setOrigin(0, 0.5).setScale(6);
    this.hpbarRight = this.add.sprite(locationTL + 384, 75, "hpbar_right", 0).setOrigin(0, 0.5).setScale(6);

    this.healthPlayerText = this.add.text(340, 74, `HP / ${this.healthPlayer}`, {
      fontFamily: 'MelodicaRegular',
      fontSize: "40px",
      fill: "#fff",
    }).setOrigin(0.5, 0.5);



     this.moneyText = this.add.text(150, 130, `Gold: ${this.money}`, {
      fontFamily: 'MelodicaRegular',
      fontSize: "40px",
      fill: "#fff",
    }).setOrigin(0.5, 0.5); // Align to the top-left corner

    
    this.scoreText = this.add.text(150, 170, `Score: ${this.score}`, {
      fontFamily: 'MelodicaRegular',
      fontSize: "40px",
      fill: "#fff",
    }).setOrigin(0.5, 0.5); // Align to the top-left corner

    this.buyText = this.add.text(960, 200, `¡Compraste!`, {
      fontSize: "40px",
      color: "#0f0"
    }).setOrigin(0.5, 0.5).setVisible(false);

    this.cantBuyText = this.add.text(960, 200, `you dont have enough gold`, {
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

    // Ejemplo de datos (puedes reemplazarlo por tus propios datos)
    const items = [
      { key: "star", label: "Estrella" },
      { key: "bomb", label: "Bomba" },
      { key: "square", label: "Cuadro" },
      { key: "square", label: "Cuadro" },
      { key: "square", label: "Cuadro" },

      // Agrega más objetos aquí según lo necesites
    ];

    // 1. Genera un número aleatorio entre 1 y el total de items
    const cantidad = Phaser.Math.Between(2, 4);


    // 2. Mezcla el array de items (Fisher-Yates shuffle)
    const shuffled = items.slice();
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    // 3. Selecciona los primeros 'cantidad' items
    const seleccionados = shuffled.slice(0, cantidad);


    const total = seleccionados.length;
    const spacing = 220; // Espacio base entre imágenes
    const baseScale = 1.2; // Escala base
    const minScale = 0.5; // Escala mínima permitida

    // Calcula la escala para que quepan todas en pantalla
    let scale = Math.min(baseScale, (1800 / (total * spacing)));
    scale = Math.max(scale, minScale);

    // Centra el grupo en pantalla
    const startX = 960 - ((total - 1) * spacing * scale) / 2;
    const y = 700;

    // Guardar referencias visuales y el índice seleccionado
    this.itemImages = [];
    this.selectedIndex = 0;

    seleccionados.forEach((item, i) => {
      const img = this.add.image(startX + i * spacing * scale, y, item.key).setScale(scale);
      const label = this.add.text(img.x, img.y + 70 * scale, item.label, {
        fontSize: `${32 * scale}px`,
        color: "#fff"
      }).setOrigin(0.5, 0);
      this.itemImages.push({ img, label });
    });

    // Resalta el primer item
    this.highlightSelection();



  

    // Guarda los items seleccionados para referencia en compra
    this.seleccionados = seleccionados;
  }
  update() {

    if (Phaser.Input.Keyboard.JustDown(this.keyW) || Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
      if (this.money >= 10) {
        this.buySelectedItem();
        this.money -= 10
        this.moneyText.setText(`Gold: ${this.money}`)
      } else {
        this.cantBuyText.setVisible(true)

        this.time.delayedCall(3000, () => {
          this.cantBuyText.setVisible(false)
        });
      }
    }
     if (Phaser.Input.Keyboard.JustDown(this.keyA) || Phaser.Input.Keyboard.JustDown(this.cursors.left)) {
      this.selectedIndex = (this.selectedIndex - 1 + this.itemImages.length) % this.itemImages.length;
      this.highlightSelection();
    }
     if (Phaser.Input.Keyboard.JustDown(this.keyS) || Phaser.Input.Keyboard.JustDown(this.cursors.down)) {
      this.scene.start("game", {
        score: this.score,
        money: this.money,
        soundValue: this.soundValue,
        tutorialComplete: this.tutorialComplete,
        healthPlayer: this.healthPlayer,
        hiScore: this.hiScore,
        difficulty: this.difficulty
      });
    }
     if (Phaser.Input.Keyboard.JustDown(this.keyD) || Phaser.Input.Keyboard.JustDown(this.cursors.right)) {
      this.selectedIndex = (this.selectedIndex + 1) % this.itemImages.length;
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
      obj.img.setTint(i === this.selectedIndex ? 0xffff00 : 0xffffff); // Amarillo si seleccionado
      obj.label.setStyle({ fontStyle: i === this.selectedIndex ? 'bold' : 'normal' });

    });
  }

  // Acción de compra
  buySelectedItem() {
    const item = this.seleccionados[this.selectedIndex];
    // Aquí va tu lógica de compra, por ejemplo:
    this.buyText.setText(`¡Compraste: ${item.label}!`)
    this.buyText.setVisible(true)

    this.time.delayedCall(3000, () => {
      this.buyText.setVisible(false)
    });

    // Puedes agregar lógica para quitar el item, actualizar inventario, etc.
  }
}