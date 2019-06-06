import Laser from '../GameObjects/laser.js';
import Hostile from './scene.hostile.js';
import Boss2 from '../GameObjects/Enemies/boss2.js';

const BOSS_VALUES = { x: window.innerWidth / 2, y: 200, type: 'boss2', scale: 2, rotation: 0, health: 2250, damage: 35, speed: 80, score: 15000 }

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
var bossShieldGr;
var rotGroup;

var score;
var scoreText;
var configScoreText;
var scenario;
var currentPosition;
var entrance;
var stairNextLevel;

var startGame = false;

var TURRETS_LASER_SPEED = 1;
var TURRET_FIRE_RATE = 300;
var turret_to_shoot = 0;        // The turret that will shoot the player. 0 = left turret; 1 = right turret;

// ITEMS
var keycard;
var hittable = true;

// AUDIO
var shootFX;

function laserPlayer(player, laser) {
    recoverArmor.paused = true;
    if (timerUntilRecovery) { timerUntilRecovery.remove(false); }
    timerUntilRecovery = this.time.addEvent({ delay: playerStats.ARMOR_RECOVERY_TIMER, callback: startRecovery, callbackScope: this, loop: false });
    if (playerStats.ARMOR > 0) {
        playerStats.ARMOR = (playerStats.ARMOR - laser.damage < 0) ? 0 : playerStats.ARMOR - laser.damage;
        armorBar.width = playerStats.ARMOR * 2;
    } else {
        playerStats.HEALTH = (playerStats.HEALTH - laser.damage < 0) ? 0 : playerStats.HEALTH - laser.damage;;
        healthBar.width = playerStats.HEALTH * 2;
        if (playerStats.HEALTH <= 0) {
            this.scene.start("Continue", {
                score: score, configScoreText: configScoreText, playerStats: playerStats, scenario: scenario,
                currentPosition: currentPosition, entrance: 'center'
            });
        }
    }
    laser.setVisible(false);
    laser.setActive(false);
    laser.destroy();
    lasers.remove(laser);
}

function hitPlayer() {
    recoverArmor.paused = true;
    if (timerUntilRecovery) { timerUntilRecovery.remove(false); }
    timerUntilRecovery = this.time.addEvent({ delay: playerStats.ARMOR_RECOVERY_TIMER, callback: startRecovery, callbackScope: this, loop: false });
    if (playerStats.ARMOR > 0) {
        playerStats.ARMOR = (playerStats.ARMOR - boss.damage < 0) ? 0 : playerStats.ARMOR - boss.damage;
        armorBar.width = playerStats.ARMOR * 2;
    } else {
        playerStats.HEALTH = (playerStats.HEALTH - boss.damage < 0) ? 0 : playerStats.HEALTH - boss.damage;;
        healthBar.width = playerStats.HEALTH * 2;
        if (playerStats.HEALTH <= 0) {
            this.scene.start("Continue", {
                score: score, configScoreText: configScoreText, playerStats: playerStats, scenario: scenario,
                currentPosition: currentPosition, entrance: 'center'
            });
        }
    }
}

function beamPlayer(damage, context) {
    if (boss.active && hittable) {
        hittable = false;
        recoverArmor.paused = true;
        if (timerUntilRecovery) { timerUntilRecovery.remove(false); }
        timerUntilRecovery = context.time.addEvent({ delay: playerStats.ARMOR_RECOVERY_TIMER, callback: startRecovery, callbackScope: context, loop: false });
        if (playerStats.ARMOR > 0) {
            playerStats.ARMOR = (playerStats.ARMOR - damage < 0) ? 0 : playerStats.ARMOR - damage;
            armorBar.width = playerStats.ARMOR * 2;
        } else {
            playerStats.HEALTH = (playerStats.HEALTH - damage < 0) ? 0 : playerStats.HEALTH - damage;;
            healthBar.width = playerStats.HEALTH * 2;
            if (playerStats.HEALTH <= 0) {
                context.scene.start("Continue", {
                    score: score, configScoreText: configScoreText, playerStats: playerStats, scenario: scenario,
                    currentPosition: currentPosition, entrance: 'center'
                });
            }
        }
        setTimeout(() => {
            hittable = true;
        }, 500);
    }
}

function hitEnemy(enemy, laser) {
    enemy.health -= laser.damage;
    if (enemy.health < 0) { enemy.health = 0; }
    laser.setVisible(false);
    laser.setActive(false);
    lasers.remove(laser);
    laser.destroy();
    score += 20;
    bossLifeBarGr.clear();
    bossLifeBarGr.fillGradientStyle(0xff0000, 0xff0000, 0xffff00, 0xffff00, 1);
    bossLifeBarGr.fillRect((window.innerWidth / 2 - 246), (window.innerHeight - 48), boss.health * (492 / BOSS_VALUES.health), 16);
    if (enemy.health <= 0) {
        enemy.setActive(false);
        enemy.setVisible(false);
        enemy.destroy();
        enemy.onDestroy();
        stairNextLevel = this.physics.add.sprite(window.innerWidth / 2, 200, 'stairnextlevel');
        stairNextLevel.setScale(0.5, 0.5);
        this.physics.add.overlap(player, stairNextLevel, nextLevel, null, this);
        clearArea.apply(this);
        this.dropPURthm(player, window.innerWidth / 3, window.innerHeight / 2);
        this.dropPUAttk(player, window.innerWidth * 2 / 3, window.innerHeight / 2);
        this.dropLifeUp(player, window.innerWidth / 2, window.innerHeight / 2);
        score += enemy.score;
        this.setScore(score);
    }
    scoreText.setText('SCORE: ' + score);
}

function nextLevel() {
    stairNextLevel.destroy();
    stairNextLevel.setActive(false);
    this.goToNextLevel();
}

function clearArea() {
    currentPosition.isClear = true;
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

class Level2_B extends Hostile {
    topleftdooropen;
    toprightdddooropen;
    leftleftdooropen;
    leftrightdooropen;
    rightleftdooropen;
    rightrightdooropen;
    botleftdooropen;
    botrightdooropen;

    constructor() {
        super('level2_B');
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
        shootFX = this.sound.add('laser');
        this.setPlayerStats(playerStats);
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
        floor = this.add.tileSprite(0, 0, window.innerWidth * 2, window.innerWidth * 2, 'floor2');

        // WALLS
        topwall = this.add.tileSprite(0, 0, window.innerWidth * 2, 128, 'topbot2');
        botwall = this.add.tileSprite(0, window.innerHeight - 5, window.innerWidth * 2, 128, 'topbot2');
        leftwall = this.add.tileSprite(0, 0, 128, window.innerHeight * 2, 'leftright2');
        rightwall = this.add.tileSprite(window.innerWidth, 0, 128, window.innerHeight * 2, 'leftright2');

        // CORNERS
        topleft = this.physics.add.sprite(0, 0, 'topleft2');
        topleft.setScale(2);
        topright = this.physics.add.sprite(window.innerWidth, 0, 'topright2');
        topright.setScale(2);
        botleft = this.physics.add.sprite(0, window.innerHeight - 5, 'botleft2');
        botleft.setScale(2);
        botright = this.physics.add.sprite(window.innerWidth, window.innerHeight - 5, 'botright2');
        botright.setScale(2);

        /* DOORS */
        this.createDoors(this, currentPosition);

        /* ### PLAYER ### */
        player = this.physics.add.sprite(window.innerWidth / 2, window.innerHeight - 128, 'player');

        player.setScale(0.3);
        player.setOrigin(0.5, 0.5);
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
        boss = new Boss2(this, BOSS_VALUES.x, BOSS_VALUES.y, BOSS_VALUES.type, BOSS_VALUES.scale, BOSS_VALUES.rotation, BOSS_VALUES.health, BOSS_VALUES.damage, BOSS_VALUES.speed, BOSS_VALUES.score);
        boss.setTarget(player);

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

        bossLifeBarBg = this.add.rectangle((window.innerWidth / 2 - 250), (window.innerHeight - 40), 500, 24, '0x000000');
        bossLifeBarGr = this.add.graphics();
        bossLifeBarGr.fillGradientStyle(0xff0000, 0xff0000, 0xffff00, 0xffff00, 1);
        bossLifeBarGr.fillRect((window.innerWidth / 2 - 246), (window.innerHeight - 48), 492, 16);
        bossLifeBar = this.add.rectangle((window.innerWidth / 2 + 246), (window.innerHeight - 38), 0, 16, '0x000000');
        bossLifeBarBg.setOrigin(0, 0.5);
        bossLifeBar.setOrigin(1, 0.5);
        bossLifeBarBg.alpha = 0.4;
        bossLifeBar.alpha = 0.4;

        rotGroup = boss.getRotatables();

        /*COLLIDERS */
        this.physics.add.overlap(player, enemyLasers, laserPlayer, null, this);
        this.physics.add.collider(boss, lasers);
        this.physics.add.overlap(boss, lasers, hitEnemy, null, this);
        this.physics.add.overlap(player, rotGroup, hitPlayer, null, this);
        this.drawMap(this);

        startGame = true;

        boss.target = player;

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
                player.setVelocityX(-400);
                // player.anims.play('left', true);
            }
            if (cursors.right.isDown) {
                player.setVelocityX(400);
                // player.anims.play('right', true);
            }
            if (cursors.up.isDown) {
                player.setVelocityY(-400);
                // player.anims.play('turn');
            }
            if (cursors.down.isDown) {
                player.setVelocityY(400);
                // player.anims.play('turn');
            }
            if (this.input.activePointer.isDown && time > lastFired) {
                shootFX.play();
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
            if (cursors.map.isUp) {
                this.hideMap();
            }
            if (cursors.map.isDown) {
                this.showMap();
            }

            if (player.x < 64) { player.x = 64; }
            if (player.y < 64) { player.y = 64; }
            if (player.x > window.innerWidth - 64) { player.x = window.innerWidth - 70; }
            if (player.y > window.innerHeight - 64) { player.y = window.innerHeight - 70; }

            lasers.children.iterate((laser) => {
                if (laser) { laser.move(delta) } else { lasers.remove(laser); }
            });

            if (boss && boss.body) {
                boss.move(player);
            }

            if (boss.paths[0] && boss.paths[1]) {
                if (Phaser.Geom.Intersects.RectangleToRectangle(boss.paths[0].getBounds(), player.body) ||
                    Phaser.Geom.Intersects.RectangleToRectangle(boss.paths[1].getBounds(), player.body)) {
                    beamPlayer(boss.damage, this);
                }
            }

            enemyLasers.children.iterate((laser) => {
                if (laser) { laser.move(delta) } else { lasers.remove(laser); }
            });
        }
    }
}

export default Level2_B;