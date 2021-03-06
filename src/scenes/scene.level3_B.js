import Laser from '../GameObjects/laser.js';
import Hostile from './scene.hostile.js';
import Boss3 from '../GameObjects/Enemies/boss3.js';

const BOSS_VALUES = { x: window.innerWidth / 2, y: 200, type: 'boss3', scale: 0.5, rotation: 0, health: 3000, damage: 30, speed: 80, score: 50000 }

var cursors;                    // Set keys to be pressed
var player;                     // Player game object
var boss;
var lasers;                     // Pool of bullets shot by the player
var lastFired = 0;              // Time instant when last shot was fired
var enemyLasers;                // lasers shot by foes

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

var bossLifeBarBg;
var bossLifeBar;
var bossLifeBarGr;
var rotGroup;
var bossBullets;

var score;
var scoreText;
var configScoreText;
var scenario;
var currentPosition;
var entrance;
var stairNextLevel;

var startGame = false;

// ITEMS
var hittable = true;

// AUDIO
var shootFX;
var hit2FX;
var explosionFX;

let scaleFactor;

/** Player is hit by bullets */
function bulletPlayer(player, bullet) {
    hit2FX.play();
    recoverArmor.paused = true;
    if (timerUntilRecovery) { timerUntilRecovery.remove(false); }
    timerUntilRecovery = this.time.addEvent({ delay: playerStats.ARMOR_RECOVERY_TIMER, callback: startRecovery, callbackScope: this, loop: false });
    if (playerStats.ARMOR > 0) {
        this.hitArmor(boss.damage);
    } else {
        this.hitHealth(boss.damage);
        if (playerStats.HEALTH <= 0) {
            this.scene.start("Continue", {
                score: score, configScoreText: configScoreText, playerStats: playerStats, scenario: scenario,
                currentPosition: currentPosition, entrance: 'center'
            });
        }
    }
    bullet.setVisible(false);
    bullet.setActive(false);
    bullet.destroy();
    bossBullets.remove(bullet);
}

/** Player hits enemy with its laser */
function hitEnemy(enemy, laser) {
    laser.setVisible(false);
    laser.setActive(false);
    lasers.remove(laser);
    laser.destroy();
    if (enemy.hittable) {
        enemy.health -= laser.damage;
        if (enemy.health < 0) { enemy.health = 0; }
        score += 20;
        bossLifeBarGr.clear();
        bossLifeBarGr.fillGradientStyle(0xff0000, 0xff0000, 0xffff00, 0xffff00, 1);
        bossLifeBarGr.fillRect((window.innerWidth / 2 - 246 * scaleFactor), (window.innerHeight - 48 * scaleFactor), boss.health * (492 * scaleFactor / BOSS_VALUES.health), 16 * scaleFactor);
        if (enemy.health < 1500 && enemy.attackMode === 1) {
            enemy.attackMode = 2;
            enemy.changeAttackMode();
        }
        if (enemy.health <= 0) {
            enemy.setActive(false);
            enemy.setVisible(false);
            displayExplosion(enemy, this);
            enemy.onDestroy();
            enemy.destroy();
            this.scene.start("Ending", { score: this.score, configScoreText: this.configScoreText, playerStats: this.playerStats });
        }
    } else {
        bossLifeBarGr.clear();
        bossLifeBarGr.fillGradientStyle(0x0000ff, 0x00ff, 0x00ffff, 0x00ffff, 1);
        bossLifeBarGr.fillRect((window.innerWidth / 2 - 246 * scaleFactor), (window.innerHeight - 48 * scaleFactor), boss.health * (492 * scaleFactor / BOSS_VALUES.health), 16 * scaleFactor);
    }

    scoreText.setText('SCORE: ' + score);
}

/** Displays explosion when boss is beaten */
function displayExplosion(enemy, context) {
    explosionFX.play();
    let explosion = context.physics.add.sprite( enemy.x, enemy.y, 'explosion1');
    explosion.setScale(scaleFactor);
    explosion.setDepth(10);
    context.anims.create({
        key: 'explosion',
        frames: context.anims.generateFrameNumbers('explosion1', { start: 0, end: 5 }),
        frameRate: 10,
        repeat: 0
    });
    explosion.play('explosion');
    setTimeout( () => {
        explosion.destroy();
    }, 600);
}

/** Removes access to next level elements */
function nextLevel() {
    stairNextLevel.destroy();
    stairNextLevel.setActive(false);
    this.goToNextLevel();
}

/** Drops a keycode if all enemies at the scene have been beaten */
function clearArea() {
    currentPosition.isClear = true;
}

/** Initializes score text */
function initializeText() {
    scoreText.setText('SCORE: ' + score).setX(64 * scaleFactor).setY(16 * scaleFactor).setFontSize(30 * scaleFactor);
}

/** Manages armor recovery */
function onRecover() {
    this.recoverArmor();
}

/** Starts armor recovery */
function startRecovery() {
    recoverArmor.paused = false;
}

class Level3_B extends Hostile {
    topleftdooropen;
    toprightdddooropen;
    leftleftdooropen;
    leftrightdooropen;
    rightleftdooropen;
    rightrightdooropen;
    botleftdooropen;
    botrightdooropen;

    constructor() {
        super('level3_B');
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
        window.onresize = () => this.scene.restart();
        scaleFactor = this.setScaleFactor();
        this.setPlayerStats(playerStats);
        shootFX = this.sound.add('laser');
        hit2FX = this.sound.add('hit2');
        explosionFX = this.sound.add('explosion');
        recoverArmor = this.time.addEvent({ delay: 250, callback: onRecover, callbackScope: this, loop: true });

        cursors = this.input.keyboard.addKeys(
            {
                up: Phaser.Input.Keyboard.KeyCodes.W,
                down: Phaser.Input.Keyboard.KeyCodes.S,
                left: Phaser.Input.Keyboard.KeyCodes.A,
                right: Phaser.Input.Keyboard.KeyCodes.D,
                map: Phaser.Input.Keyboard.KeyCodes.TAB
            });

        /* ### SCENARIO: BASIC ### */
        // FLOOR
        floor = this.add.tileSprite(0, 0, window.innerWidth * 2, window.innerWidth * 2, 'floor3');

        // WALLS
        topwall = this.add.tileSprite(0, 0, window.innerWidth * 2, 128 * scaleFactor, 'topbot3');
        botwall = this.add.tileSprite(0, window.innerHeight - 5, window.innerWidth * 2, 128 * scaleFactor, 'topbot3');
        leftwall = this.add.tileSprite(0, 0, 128 * scaleFactor, window.innerHeight * 2, 'leftright3');
        rightwall = this.add.tileSprite(window.innerWidth, 0, 128 * scaleFactor, window.innerHeight * 2, 'leftright3');

        // CORNERS
        topleft = this.physics.add.sprite(0, 0, 'topleft3');
        topleft.setScale(2 * scaleFactor);
        topright = this.physics.add.sprite(window.innerWidth, 0, 'topright3');
        topright.setScale(2 * scaleFactor);
        botleft = this.physics.add.sprite(0, window.innerHeight - 5, 'botleft3');
        botleft.setScale(2 * scaleFactor);
        botright = this.physics.add.sprite(window.innerWidth, window.innerHeight - 5, 'botright3');
        botright.setScale(2 * scaleFactor);


        /* DOORS */
        this.createDoors(this, currentPosition);

        /* ### PLAYER ### */
        player = this.physics.add.sprite(window.innerWidth / 2, window.innerHeight - 128 * scaleFactor, 'player');

        player.setScale(0.3 * scaleFactor);
        player.setOrigin(0.5, 0.5);
        player.setDepth(10);
        player.setCollideWorldBounds(true);
        player.body.setSize(player.width / 2, player.height / 2);
        player.body.setOffset(player.width / 4, player.height / 4);
        this.physics.world.enable(player);
        this.setData(scenario, score, configScoreText, playerStats, currentPosition, entrance, player);
        this.addDoorColliders(this);

        /* LASERS */
        lasers = this.physics.add.group({
            classType: Laser
        });
        enemyLasers = this.physics.add.group({
            classType: Laser
        });

        /* NOSS */
        boss = new Boss3(this, window.innerWidth / 2, BOSS_VALUES.y * scaleFactor, BOSS_VALUES.type, BOSS_VALUES.scale * scaleFactor, BOSS_VALUES.rotation, BOSS_VALUES.health, BOSS_VALUES.damage, BOSS_VALUES.speed, BOSS_VALUES.score, scaleFactor);
        boss.setTarget(player);
        bossBullets = boss.getBullets();

        /* UI */
        scoreText = this.make.text(configScoreText);
        initializeText();
        this.drawPlayerUI();

        bossLifeBarBg = this.add.rectangle((window.innerWidth / 2 - 250 * scaleFactor), (window.innerHeight - 40 * scaleFactor), 500 * scaleFactor, 24 * scaleFactor, '0x000000');
        bossLifeBarGr = this.add.graphics();
        bossLifeBarGr.fillGradientStyle(0xff0000, 0xff0000, 0xffff00, 0xffff00, 1);
        bossLifeBarGr.fillRect((window.innerWidth / 2 - 246 * scaleFactor), (window.innerHeight - 48 * scaleFactor), 492 * scaleFactor, 16 * scaleFactor);
        bossLifeBar = this.add.rectangle((window.innerWidth / 2 + 246 * scaleFactor), (window.innerHeight - 38 * scaleFactor), 0, 16 * scaleFactor, '0x000000');
        bossLifeBarBg.setOrigin(0, 0.5);
        bossLifeBar.setOrigin(1, 0.5);
        bossLifeBarBg.alpha = 0.4;
        bossLifeBar.alpha = 0.4;

        /*COLLIDERS */
        this.physics.add.collider(boss, lasers);
        this.physics.add.overlap(boss, lasers, hitEnemy, null, this);
        this.physics.add.overlap(player, bossBullets, bulletPlayer, null, this);
        this.drawMap(this);

        startGame = true;
        this.physics.world.on('worldbounds', (body) => {
            body.gameObject.destroy();
        });

    }

    update(time, delta) {
        if (startGame) {
            if (playerIsHit) {
                timeLastHit = time;
                playerIsHit = false;
            }
            let cursor = this.input.mousePointer;
            let angle = Phaser.Math.Angle.Between(player.x, player.y, cursor.x + this.cameras.main.scrollX, cursor.y + this.cameras.main.scrollY);

            this.lastFired += delta;
            player.rotation = angle;
            if (cursors.left.isDown) {
                player.setVelocityX(-400 * scaleFactor);
            }
            if (cursors.right.isDown) {
                player.setVelocityX(400 * scaleFactor);
            }
            if (cursors.up.isDown) {
                player.setVelocityY(-400 * scaleFactor);
            }
            if (cursors.down.isDown) {
                player.setVelocityY(400 * scaleFactor);
            }
            if (this.input.activePointer.isDown && time > lastFired) {
                shootFX.play();
                var velocity = this.physics.velocityFromRotation(angle, playerStats.LASER_SPEED * scaleFactor);
                var currentLaser = new Laser(this, player.x, player.y, 'laser', 0.5 * scaleFactor, angle, velocity, '0xff38c0', playerStats.DAMAGE);
                lasers.add(currentLaser);
                currentLaser.body.setCollideWorldBounds(true);
                currentLaser.body.onWorldBounds = true;
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
            if (cursors.map.isUp) {
                this.hideMap();
            }
            if (cursors.map.isDown) {
                this.showMap();
            }

            if (player.x < 64 * scaleFactor) { player.x = 64 * scaleFactor; }
            if (player.y < 64 * scaleFactor) { player.y = 64 * scaleFactor; }
            if (player.x > window.innerWidth - 64 * scaleFactor) { player.x = window.innerWidth - 70 * scaleFactor; }
            if (player.y > window.innerHeight - 64 * scaleFactor) { player.y = window.innerHeight - 70 * scaleFactor; }

            lasers.children.iterate((laser) => {
                if (laser) { laser.move(delta) } else { lasers.remove(laser); }
            });
        }
    }
}

export default Level3_B;