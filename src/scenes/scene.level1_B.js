import Laser from '../GameObjects/laser.js';
import Hostile from './scene.hostile.js';
import Boss1 from '../GameObjects/Enemies/boss1.js';

const BOSS_VALUES = { x: window.innerWidth / 2, y: 200, type: 'boss1', scale: 1, rotation: 0, health: 1500, damage: 20, speed: 20, score: 5000 }

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

var shootFX;
var hitFX;
var hit2FX;
var enemShootFX;

var scaleFactor;

function hitPlayer(player, laser) {
    hit2FX.play();
    recoverArmor.paused = true;
    if (timerUntilRecovery) { timerUntilRecovery.remove(false); }
    timerUntilRecovery = this.time.addEvent({ delay: playerStats.ARMOR_RECOVERY_TIMER, callback: startRecovery, callbackScope: this, loop: false });
    if (playerStats.ARMOR > 0) {
        this.hitArmor( laser.damage );
    } else {
        this.hitHealth( laser.damage );
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

function beamPlayer(damage, context) {
    hitFX.play();
    if (boss.active && hittable) {
        hittable = false;
        recoverArmor.paused = true;
        if (timerUntilRecovery) { timerUntilRecovery.remove(false); }
        timerUntilRecovery = context.time.addEvent({ delay: playerStats.ARMOR_RECOVERY_TIMER, callback: startRecovery, callbackScope: context, loop: false });
        if (playerStats.ARMOR > 0) {
            context.hitArmor( damage );
        } else {
            context.hitHealth( damage );
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
    bossLifeBarGr.fillRect((window.innerWidth / 2 - 246 * scaleFactor), (window.innerHeight - 48 * scaleFactor), boss.health * (492 * scaleFactor / BOSS_VALUES.health), 16 * scaleFactor);
    if (enemy.health <= 0) {
        enemy.setActive(false);
        enemy.setVisible(false);
        enemy.destroy();
        enemy.onDestroy();
        stairNextLevel = this.physics.add.sprite(window.innerWidth / 2, 200 * scaleFactor, 'stairnextlevel');
        stairNextLevel.setScale(0.5 * scaleFactor, 0.5 * scaleFactor);
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
    scoreText.setText('SCORE: ' + score).setX(64 * scaleFactor).setY(16 * scaleFactor).setFontSize(30 * scaleFactor);
}

function onRecover() {
    this.recoverArmor();
}

function startRecovery() {
    recoverArmor.paused = false;
}

class Level1_B extends Hostile {
    topleftdooropen;
    toprightdddooropen;
    leftleftdooropen;
    leftrightdooropen;
    rightleftdooropen;
    rightrightdooropen;
    botleftdooropen;
    botrightdooropen;

    constructor() {
        super('level1_B');
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
        this.setPlayerStats(playerStats);
        scaleFactor = this.setScaleFactor();
        shootFX = this.sound.add('laser');
        enemShootFX = this.sound.add('enemlaser');
        hitFX = this.sound.add('hit1');
        hit2FX = this.sound.add('hit2');
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
        floor = this.add.tileSprite(0, 0, window.innerWidth * 2, window.innerWidth * 2, 'floor1');

        // WALLS
        topwall = this.add.tileSprite(0, 0, window.innerWidth * 2, 128 * scaleFactor, 'topbot1');
        botwall = this.add.tileSprite(0, window.innerHeight - 5, window.innerWidth * 2, 128 * scaleFactor, 'topbot1');
        leftwall = this.add.tileSprite(0, 0, 128 * scaleFactor, window.innerHeight * 2, 'leftright1');
        rightwall = this.add.tileSprite(window.innerWidth, 0, 128 * scaleFactor, window.innerHeight * 2, 'leftright1');

        // CORNERS
        topleft = this.physics.add.sprite(0, 0, 'topleft1');
        topleft.setScale(2 * scaleFactor);
        topright = this.physics.add.sprite(window.innerWidth, 0, 'topright1');
        topright.setScale(2 * scaleFactor);
        botleft = this.physics.add.sprite(0, window.innerHeight - 5, 'botleft1');
        botleft.setScale(2 * scaleFactor);
        botright = this.physics.add.sprite(window.innerWidth, window.innerHeight - 5, 'botright1');
        botright.setScale(2 * scaleFactor);

        /* DOORS */
        this.createDoors(this, currentPosition);

        /* ### PLAYER ### */
        player = this.physics.add.sprite(window.innerWidth / 2, window.innerHeight - 128 * scaleFactor, 'player');

        player.setScale(0.3 * scaleFactor);
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
        boss = new Boss1(this, window.innerWidth/2, BOSS_VALUES.y * scaleFactor, BOSS_VALUES.type, BOSS_VALUES.scale * scaleFactor, BOSS_VALUES.rotation, BOSS_VALUES.health, BOSS_VALUES.damage, BOSS_VALUES.speed * scaleFactor, BOSS_VALUES.score, scaleFactor);

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
        this.physics.add.overlap(player, enemyLasers, hitPlayer, null, this);
        this.physics.add.collider(boss, lasers);
        this.physics.add.overlap(boss, lasers, hitEnemy, null, this);
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
                player.setVelocityX(-400 * scaleFactor);
                // player.anims.play('left', true);
            }
            if (cursors.right.isDown) {
                player.setVelocityX(400 * scaleFactor);
                // player.anims.play('right', true);
            }
            if (cursors.up.isDown) {
                player.setVelocityY(-400 * scaleFactor);
                // player.anims.play('turn');
            }
            if (cursors.down.isDown) {
                player.setVelocityY(400 * scaleFactor);
                // player.anims.play('turn');
            }
            if (this.input.activePointer.isDown && time > lastFired) {
                shootFX.play();
                var velocity = this.physics.velocityFromRotation(angle, playerStats.LASER_SPEED * scaleFactor);
                var currentLaser = new Laser(this, player.x, player.y, 'laser', 0.5 * scaleFactor, angle, velocity, '0xff38c0', playerStats.DAMAGE);
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

            if (player.x < 64 * scaleFactor) { player.x = 64 * scaleFactor; }
            if (player.y < 64 * scaleFactor) { player.y = 64 * scaleFactor; }
            if (player.x > window.innerWidth - 64 * scaleFactor) { player.x = window.innerWidth - 70 * scaleFactor; }
            if (player.y > window.innerHeight - 64 * scaleFactor) { player.y = window.innerHeight - 70 * scaleFactor; }

            lasers.children.iterate((laser) => {
                if (laser) { laser.move(delta) } else { lasers.remove(laser); }
            });

            if (boss && boss.body) {
                boss.move(player);
                if (boss.attackMode === 0) { boss.aim(player); }
                else if (boss.attackMode === 1) {
                    boss.aimSpread(player);
                    boss.spread();
                } else {
                    boss.aim(player);
                    boss.drawAimLines(player);
                }

                if (time > boss.lastFired && boss.attackMode !== 2 && boss) {
                    if (turret_to_shoot === 0) {
                        // var laserAngle = Phaser.Math.Angle.Between(boss.leftTurret.x, boss.leftTurret.y, player.x, player.y);
                        var laserAngle = boss.leftTurret.rotation;
                        enemShootFX.play();
                        var velocity = this.physics.velocityFromRotation(laserAngle, TURRETS_LASER_SPEED * scaleFactor);
                        var currentLaser = new Laser(this, boss.leftTurret.x, boss.leftTurret.y, 'laser', 0.6 * scaleFactor, laserAngle, velocity, '0x77abff', boss.damage);
                        turret_to_shoot = 1;
                    } else {
                        var laserAngle = boss.rightTurret.rotation;
                        enemShootFX.play();
                        var velocity = this.physics.velocityFromRotation(laserAngle, TURRETS_LASER_SPEED * scaleFactor);
                        var currentLaser = new Laser(this, boss.rightTurret.x, boss.rightTurret.y, 'laser', 0.6 * scaleFactor, laserAngle, velocity, '0x77abff', boss.damage);
                        turret_to_shoot = 0;
                    }
                    enemyLasers.add(currentLaser);
                    boss.lastFired = time + boss.fireRate;
                }
            }

            if (boss && boss.leftBeamLine && boss.leftBeamLine.active && boss.rightBeamLine && boss.rightBeamLine.active) {
                if (Phaser.Geom.Intersects.LineToRectangle(boss.leftBeamLine, player.body) ||
                    Phaser.Geom.Intersects.LineToRectangle(boss.rightBeamLine, player.body)) {
                    beamPlayer(boss.damage * 1.5, this);
                }
            }

            enemyLasers.children.iterate((laser) => {
                if (laser) { laser.move(delta) } else { lasers.remove(laser); }
            });
        }
    }
}

export default Level1_B;