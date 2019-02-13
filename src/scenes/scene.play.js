import Turret from '../GameObjects/turret.js';
import Laser from '../GameObjects/laser.js';

const TURRET_VALUES = [{ x: 64, y: 64, health: 50, damage: 5 }, { x: (window.innerWidth - 64), y: 64, health: 50, damage: 5 }];

var cursors;                    // Set keys to be pressed
var player;                     // Player game object
var lasers;                     // Pool of bullets shot by the player
var enemyLasers;                // Pool of bullets shot by enemiess
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

// UI
var healthIcon;
var healthBar;
var healthBarBg;
var armorIcon;
var armorBar;
var armorBarBg;
var playerStats;
var playerIsHit = false;
var recoverArmor;               // Event that will recover armor if armor < max armor.
var timerUntilRecovery;

const TURRET_LASER_SPEED = 1;   // Laser speed coming from turret
const TURRET_FIRE_RATE = 1000;  // Turret fire rate

var score;
var scoreText;
var configScoreText;


function hitPlayer(player, laser){
    recoverArmor.paused = true;
    if( timerUntilRecovery ) { timerUntilRecovery.remove(false); }
    timerUntilRecovery = this.time.addEvent({ delay: playerStats.ARMOR_RECOVERY_TIMER, callback: startRecovery, callbackScope: this, loop: false });
    if( playerStats.ARMOR > 0 ){ 
        playerStats.ARMOR = (playerStats.ARMOR - laser.damage < 0) ? 0 : playerStats.ARMOR - laser.damage;
        armorBar.width -= laser.damage * 2;
    } else {
        playerStats.HEALTH = (playerStats.HEALTH - laser.damage < 0) ? 0 : playerStats.ARMOR - laser.damage;;
        healthBar.width -= laser.damage * 2;
        if ( playerStats.HEALTH < 0 ) {
            // TODO: GAME OVER
        }
    }
    laser.setVisible(false);
    laser.setActive(false);
    laser.destroy();
    lasers.remove(laser);
}

function hitTurret(enemy, laser) {
    enemy.health -= laser.damage;
    laser.setVisible(false);
    laser.setActive(false);
    lasers.remove(laser);
    laser.destroy();
    score += 20;
    if (enemy.health <= 0) {
        enemy.setActive(false);
        enemy.setVisible(false);
        let index = turrets.findIndex( (turret) => { return turret.health <= 0; } );
        enemy.destroy();
        turrets.splice(index, 1);
        score += 200;
    }
    scoreText.setText('SCORE: ' + score);
}

function initializeText() {
    scoreText.setText('SCORE: ' + score);
}

function onRecover() {
    if ( playerStats.ARMOR < playerStats.MAX_ARMOR ) {
        playerStats.ARMOR += playerStats.ARMOR_RECOVERY;
        if( playerStats.ARMOR > playerStats.MAX_ARMOR ) { 
            playerStats.ARMOR = playerStats.MAX_ARMOR;
        }
        armorBar.width = playerStats.ARMOR * 2;
    }
}

function startRecovery( ) {
    recoverArmor.paused = false;
}

class Scene_play extends Phaser.Scene {
    constructor() {
        super({ key: "Scene_play" });
    }
    init(data){
        score = data.score;
        configScoreText = data.configScoreText;
        playerStats = data.playerStats;
    }
    create() {

        recoverArmor = this.time.addEvent({ delay: 250, callback: onRecover, callbackScope: this, loop: true });

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
            let newTurret = new Turret(this, turret.x, turret.y, 'turret', 1, 0, turret.health, turret.damage);
            this.physics.world.enable(newTurret);
            newTurret.displayHeight *= 0.5;
            newTurret.displayWidth *= 0.5;
            turrets.push(newTurret);
        })

        /* ### PLAYER ### */
        player = this.physics.add.sprite(window.innerWidth / 2, window.innerHeight / 2, 'player');
        player.setScale(0.3);
        player.setOrigin(0.5, 0.5);
        player.setCollideWorldBounds(true);
        this.physics.world.enable(player);

        /* LASERS */
        lasers = this.physics.add.group({
            classType: Laser
        });
        enemyLasers = this.physics.add.group({
            classType: Laser
        });

        /* UI */
        scoreText = this.make.text(configScoreText);
        initializeText();
        armorIcon = this.physics.add.sprite(64, (window.innerHeight - 30), 'armorIcon');
        armorIcon.displayWidth = 12;
        armorIcon.displayHeight = 12;
        armorBarBg = this.add.rectangle( 80, (window.innerHeight - 30), playerStats.ARMOR * 2, 12, '0x000000');
        armorBarBg.setOrigin(0, 0.5);
        armorBarBg.alpha = 0.4;
        armorBar = this.add.rectangle( 80, (window.innerHeight - 30), playerStats.MAX_ARMOR * 2, 12, '0xffffff');
        armorBar.setOrigin(0, 0.5);
        healthIcon = this.physics.add.sprite(64, (window.innerHeight - 14), 'healthIcon');
        healthIcon.displayWidth = 12;
        healthIcon.displayHeight = 12;
        healthBarBg = this.add.rectangle( 80, (window.innerHeight - 14), playerStats.MAX_HEALTH * 2, 12, '0x000000');
        healthBarBg.setOrigin(0, 0.5);
        healthBarBg.alpha = 0.4;
        healthBar = this.add.rectangle( 80, (window.innerHeight - 14), playerStats.HEALTH * 2, 12, '0xffffff');
        healthBar.setOrigin(0, 0.5);

        /*COLLIDERS */
        this.physics.add.collider(player, enemyLasers);
        this.physics.add.overlap(player, enemyLasers, hitPlayer, null, this);
        this.physics.add.collider(turrets, lasers);
        this.physics.add.overlap(turrets, lasers, hitTurret, null, this);
    }

    update(time, delta) {
        if (playerIsHit) {
            timeLastHit = time;
            playerIsHit = false;
        }
        let cursor = this.input.mousePointer;
        let angle = Phaser.Math.Angle.Between(player.x, player.y, cursor.x + this.cameras.main.scrollX, cursor.y + this.cameras.main.scrollY);

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
        if (this.input.activePointer.isDown && time > lastFired) {
            var velocity = this.physics.velocityFromRotation(angle, playerStats.LASER_SPEED);
            var currentLaser = new Laser(this, player.x, player.y, 'laser', 0.5, angle, velocity, '0xff38c0', playerStats.DAMAGE);
            lasers.add(currentLaser);
            lastFired = time + playerStats.FIRE_RATE;
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

        turrets.forEach((turret) => {
            let turretAngle = Phaser.Math.Angle.Between(turret.x, turret.y, player.x, player.y);
            turret.rotation = turretAngle;
            if (time > turret.lastFired) {
                var velocity = this.physics.velocityFromRotation(turretAngle, TURRET_LASER_SPEED);
                var currentLaser = new Laser(this, turret.x, turret.y, 'laser', 0.5, turretAngle, velocity, '0x77abff', turret.damage);
                enemyLasers.add(currentLaser);
                turret.lastFired = time + TURRET_FIRE_RATE;
            }
        })

        lasers.children.iterate((laser) => { 
            if (laser){ laser.move(delta) } else { lasers.remove(laser); }
        })
        enemyLasers.children.iterate((laser) => {
            if (laser){ laser.move(delta) } else { lasers.remove(laser); }
        })
    }
}

export default Scene_play;