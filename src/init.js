const config = {
    width: window.innerWidth,
    height: window.innerHeight - 5,
    parent: "container",
    type: Phaser.AUTO,
    physics: {
        default: 'arcade',
        arcade: {
            debug: false
        }
    },      // El navegador sabrá si debe tirar de OpenGL o CANVAS
    scene: {
        preload: preload,
        create: create,
        update: update
    }
}

var game = new Phaser.Game(config);
var cursors;
var player;

// Preparamos las instancias para todas las escenas
function preload() {
    // Metemos los elementos en la caché de phaser para usarlos luego.
    this.load.image("player", "./assets/player.png");
}

function create() {
    cursors = this.input.keyboard.createCursorKeys();
    // player = this.add.image(window.innerWidth / 2, window.innerHeight / 2, "player");
    player = this.physics.add.sprite(window.innerWidth / 2, window.innerHeight / 2, 'player');
    player.setScale(0.5);
    player.setOrigin(0.5, 0.5); // Ponemos el eje de rotación en el centro.
    player.setCollideWorldBounds(true);
    // this.input.on('pointermove', (pointer) => {
    //     let cursor = pointer;
    //     let angle = Phaser.Math.Angle.Between(player.x, player.y, cursor.x + this.cameras.main.scrollX, cursor.y + this.cameras.main.scrollY);
    //     player.rotation = angle;
    // }, this);
}

/**
 * 
 * @param {*} time 
 * @param {*} delta permite la independencia entre rendimiento de equipos
 */
function update(time, delta) {
    let cursor = game.input.mousePointer;
    let angle = Phaser.Math.Angle.Between(player.x, player.y, cursor.x + this.cameras.main.scrollX, cursor.y + this.cameras.main.scrollY);
    player.rotation = angle;
    if (cursors.left.isDown) {
        player.setVelocityX(-300);
        // player.anims.play('left', true);
    }
    if (cursors.right.isDown) {
        player.setVelocityX(300);
        // player.anims.play('right', true);
    }
    if (cursors.up.isDown) {
        player.setVelocityY(-300);
        // player.anims.play('turn');
    }
    if (cursors.down.isDown) {
        player.setVelocityY(300);
        // player.anims.play('turn');
    }
    if (cursors.left.isUp) {
        if( player.body.velocity.x < 0 ) { player.setVelocityX(0); }
    }
    if (cursors.right.isUp) {
        if( player.body.velocity.x > 0 ) { player.setVelocityX(0); }
    }
    if (cursors.up.isUp) {
        if( player.body.velocity.y < 0 ) { player.setVelocityY(0); }
    }
    if (cursors.down.isUp) {
        if( player.body.velocity.y > 0 ) { player.setVelocityY(0); }
    }

    // if (cursors.up.isDown && player.body.touching.down) {
    //     player.setVelocityY(-330);
    // }
}
