export default class Game extends Phaser.Scene {
  constructor() {
    super("game");
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
     
this.enemy = this.add.image(960, 540, "dude", 4).setScale(4);

//declarar flechas
this.cursors = this.input.keyboard.createCursorKeys();
//declarar teclas WASD
this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
this.keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

//delay entre ataques del enemigo
this.delay = 3000; 

// variable para decidir de quien es el turno de atacar
this.attackTurn = "enemy";

//crear un temporizador para el ataque del enemigo
this.attackTimer = this.time.addEvent({
      delay: this.delay,
       callback: this.turnDecider,
       callbackScope: this,
      loop: true,
    });
// estado del ataque del jugador
    this.playerAction = 0;
// representacion del ataque del enemigo
this.up = this.add.image(960, 240, "star").setScale(4).setAlpha(0.5).setTint(0xFFC300).setVisible(false);
this.left = this.add.image(660, 540, "star").setScale(4).setAlpha(0.5).setTint(0x0046ff).setVisible(false);
this.right = this.add.image(1260, 540, "star").setScale(4).setAlpha(0.5).setTint(0xff2a00).setVisible(false);
this.down = this.add.image(960, 840, "star").setScale(4).setAlpha(0.5).setTint(0x51ff00).setVisible(false);

// vida del jugador
this.healthPlayer = 100;

// mostrar la vida del jugador
this.healthPlayerText = this.add.text(32, 1000, `Health: ${this.healthPlayer}`, {
      fontSize: "32px",
      fill: "#fff",
    }).setOrigin(0, 0.5); // Align to the top-left corner

//vida del enemigo
this.healthEnemy = 100;

// mostrar la vida del enemigo
this.healthEnemyText = this.add.text(1888, 32, `Enemy: ${this.healthEnemy}`, {
      fontSize: "32px",
      fill: "#fff",
    }).setOrigin(1, 0.5); // Align to the top-left corner


// variable para cuando detener el ataque del enemigo
this.stun = 0; 

this.stunText = this.add.text(960, 32, `Stun: ${this.stun}`, {
      fontSize: "32px",
      fill: "#fff",
    }).setOrigin(0.5, 0.5); // Center the text

  }
  update() {
//Detectar teclas
     if (Phaser.Input.Keyboard.JustDown(this.keyW) || (Phaser.Input.Keyboard.JustDown(this.cursors.up))) {
console.log("W or Up Arrow pressed");
        this.playerAction = 1; // Set player action to 1 for upward attack
     }
     if (Phaser.Input.Keyboard.JustDown(this.keyA) || (Phaser.Input.Keyboard.JustDown(this.cursors.left))) {
console.log("A or Left Arrow pressed");
        this.playerAction = 2; // Set player action to 2 for leftward attack
     }
     if (Phaser.Input.Keyboard.JustDown(this.keyS) || (Phaser.Input.Keyboard.JustDown(this.cursors.down))) {
console.log("S or Down Arrow pressed");
        this.playerAction = 3; // Set player action to 3 for downward attack
     }
     if (Phaser.Input.Keyboard.JustDown(this.keyD) || (Phaser.Input.Keyboard.JustDown(this.cursors.right))) {
console.log("D or Right Arrow pressed");
        this.playerAction = 4; // Set player action to 4 for rightward attack
     }

     //condicion de derrota al llegar la vida del jugador a 0
     if (this.healthPlayer <= 0) {
       console.log("Game Over! Player has no health left.");
        this.attackTimer.paused = true; // Stop the enemy attack timer
        this.add.text(960, 440, "Game Over", {
         fontSize: "64px",
         fill: "#ff0000",
       }).setOrigin(0.5, 0.5); // Center the text
       this.time.delayedCall(3000, () => {
         this.scene.restart(); // Restart the scene if player health is zero
       });

     }

     //stun del enemigo
     if (this.stun === 100) {
         console.log("Enemy is stunned!");
         this.attackTurn = "player"; // Change turn to player
         this.stun = 0; // Reset stun after it reaches 100

        //  this.time.delayedCall(5000, () => {
        //     
        //     this.stunText.setText(`Stun: ${this.stun}`); // Update stun display
        //     this.attackTurn = "enemy"; // Change turn back to enemy
        //  });
     }
  }
//empiezan las funciones
turnDecider() {
    if (this.attackTurn === "enemy") {
      this.enemyAttack(); // Call enemy attack function
    
    } 
    if (this.attackTurn === "player") {
      this.playerAttack(); // Call player attack function
    }
  }
  enemyAttack() {
    let attackType = Phaser.Math.Between(1, 4);

    this.colorDecider(attackType); // Set the attack color based on the attack type
    this.attackColor.setVisible(true); // Show the attack direction
    this.time.addEvent({
        delay: this.delay - 1000, // Delay before checking the player's defense
      callback: () => {
        if (this.playerAction === attackType) {
          console.log("Player successfully defends against the enemy attack!");
          this.enemy.setTint(0xff2a00); // Change enemy color to red on successful defense
          this.time.addEvent({
            delay: 500, // Reset enemy color after a short delay
            callback: () => {
              this.enemy.clearTint();
            },
          });
            this.stun += 20; // Increase stun by 20 on successful defense
            this.stunText.setText(`Stun: ${this.stun}`); // Update stun display
        } else {
          console.log("Player fails to defend against the enemy attack!");
          this.healthPlayer -= 20; // Reduce player health by 20 on failed defense
          this.healthPlayerText.setText(`Health: ${this.healthPlayer}`); // Update health display
        }
        this.playerAction = 0; // Reset player action after checking
        this.attackColor.setVisible(false); // Hide the attack direction
      },

    });

  }
  playerAttack() {
    let attackType = this.playerAction; // Get the player's attack type
    this.colorDecider(attackType); // Set the attack color based on the attack type
     if (this.attackColor === null) {
        console.log("No valid attack color, aborting playerAttack.");
        return; // Sale de la función si no hay color válido
    }
    this.attackColor.setVisible(true); // Show the attack direction
    this.time.addEvent({
        delay: this.delay - 1000, // Delay before checking the player's defense
      callback: () => {
        this.enemy.setTint(0xff2a00); // Change enemy color to red on successful defense
        this.time.addEvent({
            delay: 500, // Reset enemy color after a short delay
            callback: () => {
              this.enemy.clearTint();
            },
          });
          this.playerAction = 0; // Reset player action after checking
        this.attackColor.setVisible(false); // Hide the attack direction
        this.healthEnemy -= 20; // Reduce enemy health by 20 on successful attack
      }
      
    });
  }
  colorDecider(attackType) {
   switch (attackType) {
      case 1:
        this.attackColor = this.up
        break;
      case 2:
        this.attackColor = this.left;
        break;
      case 3:
        this.attackColor = this.down;
        break;
      case 4:
        this.attackColor = this.right;
        break;
      default:
        this.attackColor = null; // No attack color for unknown attack types
        console.log("Unknown attack type");
    } 
  }
}