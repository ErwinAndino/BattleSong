export default class store extends Phaser.Scene {
  constructor() {
    super("store");
  }

  init(data) {

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
  }

  create() {
    //crear fondo
    this.add.image(960, 540, "sky").setScale(2.5, 2);


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

  // Input para selección y compra
  this.input.keyboard.on('keydown-A', () => {
    this.selectedIndex = (this.selectedIndex - 1 + this.itemImages.length) % this.itemImages.length;
    this.highlightSelection();
  });
  this.input.keyboard.on('keydown-D', () => {
    this.selectedIndex = (this.selectedIndex + 1) % this.itemImages.length;
    this.highlightSelection();
  });
  this.input.keyboard.on('keydown-W', () => {
    this.buySelectedItem();
  });
  this.input.keyboard.on('keydown-S', () => {
    
    this.scene.start("game");
  });

  // Guarda los items seleccionados para referencia en compra
  this.seleccionados = seleccionados;
  }
  update() {

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
  this.add.text(960, 200, `¡Compraste: ${item.label}!`, {
    fontSize: "40px",
    color: "#0f0"
  }).setOrigin(0.5, 0.5);
  // Puedes agregar lógica para quitar el item, actualizar inventario, etc.
}
}