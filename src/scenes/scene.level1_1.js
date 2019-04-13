import Laser from '../GameObjects/laser.js';
import LaserTrap from '../GameObjects/lasertrap.js';
import Enemy from '../GameObjects/Enemies/enemy.js';
import Scancatcher from '../GameObjects/Enemies/scancatcher.js';
import Hostile from './scene.hostile.js';

const ENEMY_VALUES = [{ x: 80, y: 80, type: 'scancatcher1', scale: 2, rotation: 0, health: 100, damage: 20, speed: 50, score: 350 },
{ x: 400, y: 450, type: 'scancatcher1', scale: 2, rotation: 0, health: 100, damage: 20, speed: 50, score: 350 }];

const LASER_VALUES = [
    { x1: 80, y1: 80, x2: (window.innerWidth - 80), y2: 80, color: '0x77abff', damage: 10, thickness: 10, timeOfBlink: 3000, timeOfLaser: 1500 },
    { x1: 80, y1: 600, x2: (window.innerWidth - 80), y2: 600, color: '0x77abff', damage: 10, thickness: 10, timeOfBlink: 3000, timeOfLaser: 1500 }
];

var cursors;                    // Set keys to be pressed
var player;                     // Player game object
var lasers;                     // Pool of bullets shot by the player
var enemyLasers;                // Pool of bullets shot by enemiess
var laserTraps = [];            // Laser traps at stage
var mouseTouchDown = false;     // Mouse is being left clicked
var lastFired = 0;              // Time instant when last shot was fired

var enemies;                    // Enemies on scene

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

var score;
var scoreText;
var configScoreText;
var scenario;
var currentPosition;
var entrance;

// ITEMS
var keycard;

function hitPlayer(player, laser) {
    recoverArmor.paused = true;
    if (timerUntilRecovery) { timerUntilRecovery.remove(false); }
    timerUntilRecovery = this.time.addEvent({ delay: playerStats.ARMOR_RECOVERY_TIMER, callback: startRecovery, callbackScope: this, loop: false });
    if (playerStats.ARMOR > 0) {
        playerStats.ARMOR = (playerStats.ARMOR - laser.damage < 0) ? 0 : playerStats.ARMOR - laser.damage;
        armorBar.width -= laser.damage * 2;
    } else {
        playerStats.HEALTH = (playerStats.HEALTH - laser.damage < 0) ? 0 : playerStats.ARMOR - laser.damage;;
        healthBar.width -= laser.damage * 2;
        if (playerStats.HEALTH < 0) {
            // TODO: GAME OVER
        }
    }
    laser.setVisible(false);
    laser.setActive(false);
    laser.destroy();
    lasers.remove(laser);
}

function meleeHit(player, enemy) {
    recoverArmor.paused = true;
    if (timerUntilRecovery) { timerUntilRecovery.remove(false); }
    timerUntilRecovery = this.time.addEvent({ delay: playerStats.ARMOR_RECOVERY_TIMER, callback: startRecovery, callbackScope: this, loop: false });
    if (playerStats.ARMOR > 0) {
        playerStats.ARMOR = (playerStats.ARMOR - enemy.damage < 0) ? 0 : playerStats.ARMOR - enemy.damage;
        armorBar.width -= enemy.damage * 2;
        if (armorBar.width < 0) { armorBar.width = 0; }
    } else {
        playerStats.HEALTH = (playerStats.HEALTH - enemy.damage < 0) ? 0 : playerStats.ARMOR - enemy.damage;;
        healthBar.width -= enemy.damage * 2;
        if (healthBar.width < 0) { healthBar.width = 0; }
        if (playerStats.HEALTH < 0) {
            // TODO: GAME OVER
        }
    }

    player.setX(player.x += enemy.body.velocity.x * 2);
    player.setY(player.y += enemy.body.velocity.y * 2);
}

function hitEnemy(enemy, laser) {
    enemy.health -= laser.damage;
    laser.setVisible(false);
    laser.setActive(false);
    lasers.remove(laser);
    laser.destroy();
    score += 20;
    if (enemy.health <= 0) {
        enemy.setActive(false);
        enemy.setVisible(false);
        enemy.destroy();
        if (enemies.children.entries.length === 0) {
            clearArea.apply(this);
        }
        score += enemy.score;
        this.setScore(score);
    }
    scoreText.setText('SCORE: ' + score);
}

function clearArea() {
    currentPosition.isClear = true;
    if ( currentPosition.isKey ) {
        spawnKey(this);
    }
    this.createDoors(this, currentPosition);

}

function initializeText() {
    scoreText.setText('SCORE: ' + score);
}

function onRecover() {
    if (playerStats.ARMOR < playerStats.MAX_ARMOR) {
        playerStats.ARMOR += playerStats.ARMOR_RECOVERY;
        if (playerStats.ARMOR > playerStats.MAX_ARMOR) {
            playerStats.ARMOR = playerStats.MAX_ARMOR;
        }
        armorBar.width = playerStats.ARMOR * 2;
    }
}

function startRecovery() {
    recoverArmor.paused = false;
}

function spawnKey(context) {
    keycard = context.physics.add.sprite(window.innerWidth/2, window.innerHeight/2, 'keycard');
    keycard.setOrigin(0.5, 0.5);
    keycard.setScale(0.125);
    context.physics.add.overlap(player, keycard, pickKey, null, context);
}

function pickKey() { 
    currentPosition.keyIsTaken = true;
    keycard.destroy();
    playerStats.KEYCODES ++;
    this.setData(scenario, score, configScoreText, playerStats, currentPosition, entrance, player);
    this.drawKeys( playerStats.KEYCODES );
}

class Level1_1 extends Hostile {
    constructor() {
        super('Level1_1');
    }
    init(data) {
        score = data.score;
        configScoreText = data.configScoreText;
        playerStats = data.playerStats;
        scenario = data.scenario;
        currentPosition = data.currentPosition;
        entrance = data.entrance;
    }
    create() {
        if ( currentPosition.isKey && currentPosition.isClear && !currentPosition.keyIsTaken ) {
            spawnKey(this);
        }
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
        topwall = this.add.tileSprite(0, 0, window.innerWidth * 2, 128, 'topbot1');
        botwall = this.add.tileSprite(0, window.innerHeight - 5, window.innerWidth * 2, 128, 'topbot1');
        leftwall = this.add.tileSprite(0, 0, 128, window.innerHeight * 2, 'leftright1');
        rightwall = this.add.tileSprite(window.innerWidth, 0, 128, window.innerHeight * 2, 'leftright1');

        // CORNERS
        topleft = this.physics.add.sprite(0, 0, 'topleft1');
        topleft.setScale(2);
        topright = this.physics.add.sprite(window.innerWidth, 0, 'topright1');
        topright.setScale(2);
        botleft = this.physics.add.sprite(0, window.innerHeight - 5, 'botleft1');
        botleft.setScale(2);
        botright = this.physics.add.sprite(window.innerWidth, window.innerHeight - 5, 'botright1');
        botright.setScale(2);

        /* DOORS */
        this.createDoors(this, currentPosition);

        /* ### PLAYER ### */
        if (entrance === 'center') { player = this.physics.add.sprite(window.innerWidth / 2, window.innerHeight / 2, 'player'); }
        if (entrance === 'down') { player = this.physics.add.sprite(window.innerWidth / 2, 128, 'player'); }
        if (entrance === 'up') { player = this.physics.add.sprite(window.innerWidth / 2, window.innerHeight - 128, 'player'); }
        if (entrance === 'left') { player = this.physics.add.sprite(window.innerWidth - 128, window.innerHeight / 2, 'player'); }
        if (entrance === 'right') { player = this.physics.add.sprite(128, window.innerHeight / 2, 'player'); }

        player.setScale(0.3);
        player.setOrigin(0.5, 0.5);
        player.setCollideWorldBounds(true);
        this.physics.world.enable(player);
        this.setData(scenario, score, configScoreText, playerStats, currentPosition, entrance, player);
        this.drawKeys( playerStats.KEYCODES );
        /* LASERS */
        lasers = this.physics.add.group({
            classType: Laser
        });
        enemyLasers = this.physics.add.group({
            classType: Laser
        });

        /* ENEMIES */
        enemies = this.physics.add.group({
            classType: Enemy
        });

        ENEMY_VALUES.forEach((enem) => {
            enemies.add(new Scancatcher(this, enem.x, enem.y, enem.type, enem.scale, enem.rotation, enem.health, enem.damage, enem.speed, enem.score));
        });

        /* UI */
        scoreText = this.make.text(configScoreText);
        initializeText();
        armorIcon = this.physics.add.sprite(64, (window.innerHeight - 50), 'armorIcon');
        armorIcon.displayWidth = 12;
        armorIcon.displayHeight = 12;
        armorBarBg = this.add.rectangle(80, (window.innerHeight - 50), playerStats.ARMOR * 2, 12, '0x000000');
        armorBarBg.setOrigin(0, 0.5);
        armorBarBg.alpha = 0.4;
        armorBar = this.add.rectangle(80, (window.innerHeight - 50), playerStats.MAX_ARMOR * 2, 12, '0xffffff');
        armorBar.setOrigin(0, 0.5);
        healthIcon = this.physics.add.sprite(64, (window.innerHeight - 28), 'healthIcon');
        healthIcon.displayWidth = 12;
        healthIcon.displayHeight = 12;
        healthBarBg = this.add.rectangle(80, (window.innerHeight - 28), playerStats.MAX_HEALTH * 2, 12, '0x000000');
        healthBarBg.setOrigin(0, 0.5);
        healthBarBg.alpha = 0.4;
        healthBar = this.add.rectangle(80, (window.innerHeight - 28), playerStats.HEALTH * 2, 12, '0xffffff');
        healthBar.setOrigin(0, 0.5);

        /*COLLIDERS */
        this.physics.add.collider(player, enemyLasers);
        this.physics.add.overlap(player, enemyLasers, hitPlayer, null, this);
        this.physics.add.collider(player, enemies, meleeHit, null, this);
        this.physics.add.collider(enemies, lasers);
        this.physics.add.overlap(enemies, lasers, hitEnemy, null, this);

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

        if (player.x < 64) { player.x = 64; }
        if (player.y < 64) { player.y = 64; }
        if (player.x > window.innerWidth - 64) { player.x = window.innerWidth - 70; }
        if (player.y > window.innerHeight - 64) { player.y = window.innerHeight - 70; }

        enemies.children.iterate((enem) => {
            let enemAngle = Phaser.Math.Angle.Between(enem.x, enem.y, player.x, player.y);
            enem.rotation = enemAngle;
            enem.move(player)
        })

        lasers.children.iterate((laser) => {
            if (laser) { laser.move(delta) } else { lasers.remove(laser); }
        })
        enemyLasers.children.iterate((laser) => {
            if (laser) { laser.move(delta) } else { lasers.remove(laser); }
        })
    }
}

export default Level1_1;