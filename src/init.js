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
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
}



var game = new Phaser.Game(config);

const TURRET_VALUES = [{ x: 64, y: 64, health: 50, damage: 2 }, { x: (window.innerWidth - 64), y: 64, health: 50, damage: 2 }];

var cursors;                    // Set keys to be pressed
var player;                     // Player game object
var lasers;                     // Pool of bullets shot by the player
var turrets = [];               // Turrets at stage
var mouseTouchDown = false;     // Mouse is being left clicked
var lastFired = 0;              // Time instant when last shot was fired

// SCENARIO
var topleft;
var topright;
var botleft;
var botright;
var topwall;
var botwall;
var leftwall;
var rightwall;
var floor;

const LASER_SPEED = 2;          // Laser speed
const FIRE_RATE = 250;          // Fire rate for the speed
const TURRET_LASER_SPEED = 1;   // Laser speed coming from turret
const TURRET_FIRE_RATE = 1000;


function preload() {
    /* Image loading */
    this.load.image('player', "./assets/player.png");
    this.load.image('laser', "./assets/laser.png");

    /* Enemies */
    this.load.image('turret', "./assets/turret.png");

    /* Scenario 1 */
    this.load.image('topleft1', "./assets/topleft1.png");
    this.load.image('topright1', "./assets/topright1.png");
    this.load.image('botleft1', "./assets/botleft1.png");
    this.load.image('botright1', "./assets/botright1.png");
    this.load.image('topbot1', "./assets/topbot1.png");
    this.load.image('leftright1', "./assets/leftright1.png");
    this.load.image('floor1', "./assets/floor1.png");
}

function create() {
    cursors = this.input.keyboard.addKeys(
        {
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D
        });


    /* ### SCENARIO: BASIC ### */
    // FLOOR
    floor = this.add.tileSprite(0, 0, window.innerWidth * 2, window.innerWidth * 2, 'floor1');

    // WALLS
    topwall = this.add.tileSprite(0, 0, window.innerWidth * 2, 64, 'topbot1');
    botwall = this.add.tileSprite(0, window.innerHeight - 5, window.innerWidth * 2, 64, 'topbot1');
    leftwall = this.add.tileSprite(0, 0, 64, window.innerHeight * 2, 'leftright1');
    rightwall = this.add.tileSprite(window.innerWidth, 0, 64, window.innerHeight * 2, 'leftright1');

    // CORNERS
    topleft = this.physics.add.sprite(0, 0, 'topleft1');
    topright = this.physics.add.sprite(window.innerWidth, 0, 'topright1');
    botleft = this.physics.add.sprite(0, window.innerHeight - 5, 'botleft1');
    botright = this.physics.add.sprite(window.innerWidth, window.innerHeight - 5, 'botright1');

    /* ### TURRETS ### */

    TURRET_VALUES.forEach((turret) => {
        // let newTurret = new Turret( this.scene.scene, 1, turret.x, turret.y, turret.health, turret.damage);
        // newTurret.setActive(true);
        // newTurret.setVisible(true);
        // turrets.push( newTurret );
        let newTurret = this.physics.add.sprite(turret.x, turret.y, 'turret');
        newTurret.setOrigin(0.25, 0.5);
        newTurret.setScale(0.3);
        turrets.push({
            sprite: newTurret,
            health: turret.health,
            damage: turret.damage,
            lastFired: 0
        });
    })

    /* ### PLAYER ### */
    player = this.physics.add.sprite(window.innerWidth / 2, window.innerHeight / 2, 'player');
    player.setScale(0.3);
    player.setOrigin(0.5, 0.5);
    player.setCollideWorldBounds(true);



    /* ### LASERS ### */
    var Laser = new Phaser.Class({
        Extends: Phaser.GameObjects.Image,
        initialize:
            function Laser(scene) {
                Phaser.GameObjects.Image.call(this, scene, 0, 0, 'laser');
                this.setScale(0.5);
                this.speedX = 0;
                this.speedY = 0;
                this.born = 0;
            },
        fire: function (originBody, velocity, angle, offsetX, offsetY) {
            this.setPosition(
                originBody.x + velocity.x * offsetX,
                originBody.y + velocity.y * offsetY);
            this.rotation = angle;
            this.speedX = velocity.x;
            this.speedY = velocity.y;
        },
        update: function (time, delta) {
            this.x += this.speedX * delta;
            this.y += this.speedY * delta;
            if (this.x < 0 || this.x > window.innerWidth || this.y < 0 || this.y > window.innerHeight) {
                this.setActive(false);
                this.setVisible(false);
            }
        }
    })

    lasers = this.add.group({
        classType: Laser, runChildUpdate: true
    });
}

/**
 * Deletes the laser that has collided from the displayed pool of lasers
 * @param {*} laser laser object that got out of bounds or collided 
 */
function resetLaser(laser) {
    laser.kill();
}

function fireLaser() {
    var laser = lasers.getFirstExists(false);
    if (laser) {
        laser.reset(player.x, player.y - 20);
        game.physics.arcade.moveToPointer(laser, 500);
    }
}

/**
 * 
 * @param {*} time 
 * @param {*} delta permite la independencia entre rendimiento de equipos
 */
function update(time, delta) {
    let cursor = game.input.mousePointer;
    let angle = Phaser.Math.Angle.Between(player.x, player.y, cursor.x + this.cameras.main.scrollX, cursor.y + this.cameras.main.scrollY);

    turrets.forEach((turret) => {
        let turretSprite = turret.sprite;
        let turretAngle = Phaser.Math.Angle.Between(turretSprite.x, turretSprite.y, player.x, player.y);
        turretSprite.rotation = turretAngle;
        if (time > turret.lastFired) {
            var turretLaser = lasers.get();
            if (turretLaser) {
                turretLaser.setActive(true);
                turretLaser.setVisible(true);
                let turretVelocity = this.physics.velocityFromRotation(turretAngle, TURRET_LASER_SPEED);
                turretLaser.fire(turretSprite, turretVelocity, turretAngle, turretSprite.body.width / 2, turretSprite.body.width / 2);
            }
            turret.lastFired = time + TURRET_FIRE_RATE;
        }
    })
    this.lastFired += delta;
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
    if (game.input.activePointer.isDown && time > lastFired) {
        var currentLaser = lasers.get();
        if (currentLaser) {
            currentLaser.setActive(true);
            currentLaser.setVisible(true);
            var velocity = this.physics.velocityFromRotation(angle, LASER_SPEED);
            currentLaser.fire(player, velocity, angle, player.body.width / 2, player.body.height / 2);
            lastFired = time + FIRE_RATE;
        }
    }
    if (cursors.left.isUp) {
        if (player.body.velocity.x < 0) { player.setVelocityX(0); }
    }
    if (cursors.right.isUp) {
        if (player.body.velocity.x > 0) { player.setVelocityX(0); }
    }
    if (cursors.up.isUp) {
        if (player.body.velocity.y < 0) { player.setVelocityY(0); }
    }
    if (cursors.down.isUp) {
        if (player.body.velocity.y > 0) { player.setVelocityY(0); }
    }
}
