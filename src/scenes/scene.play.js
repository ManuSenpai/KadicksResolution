import Turret from '../GameObjects/turret.js';
import Laser from '../GameObjects/laser.js';
import LaserTrap from '../GameObjects/lasertrap.js';
import Enemy from '../GameObjects/Enemies/enemy.js';
import Scancatcher from '../GameObjects/Enemies/scancatcher.js';
import Boss1 from '../GameObjects/Enemies/boss1.js';

const ENEMY_VALUES = [{ x: 80, y: 80, type: 'scancatcher1', scale: 2, rotation: 0, health: 60, damage: 20, speed: 50, score: 350 },
{ x: 400, y: 450, type: 'scancatcher1', scale: 2, rotation: 0, health: 60, damage: 20, speed: 50, score: 350 }];

const TURRET_VALUES = [{ x: 64, y: 64, health: 50, damage: 5 }, { x: (window.innerWidth - 64), y: 64, health: 50, damage: 5 }];
const LASER_VALUES = [
    { x1: 80, y1: 80, x2: (window.innerWidth - 80), y2: 80, color: '0x77abff', damage: 10, thickness: 10, timeOfBlink: 3000, timeOfLaser: 1500 },
    { x1: 80, y1: 600, x2: (window.innerWidth - 80), y2: 600, color: '0x77abff', damage: 10, thickness: 10, timeOfBlink: 3000, timeOfLaser: 1500 }
];

const BOSS_VALUES = { x: window.innerWidth / 2, y: 200, type: 'boss1', scale: 1, rotation: 0, health: 1000, damage: 35, speed: 0, score: 5000 }

var cursors;                    // Set keys to be pressed
var player;                     // Player game object
var boss;                       // Boss
var lasers;                     // Pool of bullets shot by the player
var enemyLasers;                // Pool of bullets shot by enemiess
var laserTraps = [];            // Laser traps at stage
var turrets = [];               // Turrets at stage
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
var bossLifeBarBg;
var bossLifeBar;
var bossLifeBarGr;
var bossShieldGr;
var playerStats;
var playerIsHit = false;
var recoverArmor;               // Event that will recover armor if armor < max armor.
var timerUntilRecovery;

const TURRET_LASER_SPEED = 1;   // Laser speed coming from turret
const TURRET_FIRE_RATE = 1000;  // Turret fire rate

var score;
var scoreText;
var configScoreText;


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

function hitShield() {
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
        let index = turrets.findIndex((turret) => { return turret.health <= 0; });
        enemy.destroy();
        turrets.splice(index, 1);
        score += 200;
    }
    scoreText.setText('SCORE: ' + score);
}

function hitEnemy(enemy, laser) {
    enemy.health -= laser.damage;
    laser.setVisible(false);
    laser.setActive(false);
    lasers.remove(laser);
    laser.destroy();
    score += 20;
    if (enemy.name === 'BOSS') {
        // bossLifeBar.width -= laser.damage * (496 / 1000);
        // if ( bossLifeBar.width <= 0 ) { bossLifeBar.width = 0; }
        bossLifeBarGr.clear();
        bossLifeBarGr.fillGradientStyle(0xff0000, 0xff0000, 0xffff00, 0xffff00, 1);
        bossLifeBarGr.fillRect((window.innerWidth / 2 - 246), (window.innerHeight - 28), boss.health * (492 / BOSS_VALUES.health), 16);
    }
    if (enemy.health <= 0) {
        enemy.setActive(false);
        enemy.setVisible(false);
        enemy.destroy();
        score += enemy.score;
    }
    scoreText.setText('SCORE: ' + score);
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

class Scene_play extends Phaser.Scene {
    constructor() {
        super({ key: "Scene_play" });
    }
    init(data) {
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

        // LASER_VALUES.forEach((trap) => {
        //     let newTrap = new LaserTrap(this, trap.x1, trap.y1, trap.x2, trap.y2, trap.color, trap.damage, trap.thickness, trap.timeOfBlink, trap.timeOfLaser);
        //     laserTraps.push(newTrap);
        // });

        /* ### PLAYER ### */
        player = this.physics.add.sprite(window.innerWidth / 2, window.innerHeight / 2, 'player');
        player.setScale(0.3);
        player.setOrigin(0.5, 0.5);
        player.setDepth(10);
        player.setCollideWorldBounds(true);
        this.physics.world.enable(player);

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

        /* BOSS */
        boss = new Boss1(this, BOSS_VALUES.x, BOSS_VALUES.y, BOSS_VALUES.type, BOSS_VALUES.scale, BOSS_VALUES.rotation, BOSS_VALUES.health, BOSS_VALUES.damage, BOSS_VALUES.speed, BOSS_VALUES.score)
        boss.name = "BOSS";


        ENEMY_VALUES.forEach((enem) => {
            enemies.add(new Scancatcher(this, enem.x, enem.y, enem.type, enem.scale, enem.rotation, enem.health, enem.damage, enem.speed, enem.score));
        });

        /* UI */
        scoreText = this.make.text(configScoreText);
        initializeText();
        armorIcon = this.physics.add.sprite(96, (window.innerHeight - 30), 'armorIcon');
        armorIcon.displayWidth = 12;
        armorIcon.displayHeight = 12;
        armorBarBg = this.add.rectangle(80, (window.innerHeight - 30), playerStats.ARMOR * 2, 12, '0x000000');
        armorBarBg.setOrigin(0, 0.5);
        armorBarBg.alpha = 0.4;
        armorBar = this.add.rectangle(80, (window.innerHeight - 30), playerStats.MAX_ARMOR * 2, 12, '0xffffff');
        armorBar.setOrigin(0, 0.5);
        healthIcon = this.physics.add.sprite(64, (window.innerHeight - 14), 'healthIcon');
        healthIcon.displayWidth = 12;
        healthIcon.displayHeight = 12;
        healthBarBg = this.add.rectangle(80, (window.innerHeight - 14), playerStats.MAX_HEALTH * 2, 12, '0x000000');
        healthBarBg.setOrigin(0, 0.5);
        healthBarBg.alpha = 0.4;
        healthBar = this.add.rectangle(80, (window.innerHeight - 14), playerStats.HEALTH * 2, 12, '0xffffff');
        healthBar.setOrigin(0, 0.5);

        bossLifeBarBg = this.add.rectangle((window.innerWidth / 2 - 250), (window.innerHeight - 20), 500, 24, '0x000000');
        bossLifeBarGr = this.add.graphics();
        bossLifeBarGr.fillGradientStyle(0xff0000, 0xff0000, 0xffff00, 0xffff00, 1);
        bossLifeBarGr.fillRect((window.innerWidth / 2 - 246), (window.innerHeight - 28), 492, 16);
        bossLifeBar = this.add.rectangle((window.innerWidth / 2 + 246), (window.innerHeight - 18), 0, 16, '0x000000');
        bossLifeBarBg.setOrigin(0, 0.5);
        bossLifeBar.setOrigin(1, 0.5);
        bossLifeBarBg.alpha = 0.4;
        bossLifeBar.alpha = 0.4;

        /* ESCUDO DE BOSS */
        bossShieldGr = this.add.graphics();
        this.drawShield(90, 270);

        /*COLLIDERS */
        this.physics.add.collider(player, enemyLasers);
        this.physics.add.overlap(player, enemyLasers, hitPlayer, null, this);
        this.physics.add.collider(turrets, lasers);
        this.physics.add.overlap(turrets, lasers, hitTurret, null, this);
        this.physics.add.collider(player, enemies, meleeHit, null, this);
        this.physics.add.collider(enemies, lasers);
        this.physics.add.overlap(enemies, lasers, hitEnemy, null, this);
        this.physics.add.collider(boss, lasers);
        this.physics.add.overlap(boss, lasers, hitEnemy, null, this);
        this.physics.add.collider(bossShieldGr, lasers);
        this.physics.add.overlap(bossShieldGr, lasers, hitShield, null, this);


    }

    drawShield(shieldStart1, shieldStart2) {
        bossShieldGr.clear();
        bossShieldGr.lineStyle(10, 0xff00ff, 1);
        bossShieldGr.beginPath();

        // arc (x, y, radius, startAngle, endAngle, anticlockwise)
        bossShieldGr.arc(window.innerWidth / 2, 200, 200, Phaser.Math.DegToRad(shieldStart1), Phaser.Math.DegToRad(shieldStart1 - 90), true);
        bossShieldGr.strokePath();
        bossShieldGr.closePath();
        bossShieldGr.beginPath();
        bossShieldGr.arc(window.innerWidth / 2, 200, 200, Phaser.Math.DegToRad(shieldStart2), Phaser.Math.DegToRad(shieldStart2 - 90), true);
        bossShieldGr.strokePath();
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

export default Scene_play;