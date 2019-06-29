import Laser from '../GameObjects/laser.js';
import LaserTrap from '../GameObjects/lasertrap.js';
import Enemy from '../GameObjects/Enemies/enemy.js';
import Scancatcher from '../GameObjects/Enemies/scancatcher.js';
import Hostile from './scene.hostile.js';
import Jolt from '../GameObjects/Enemies/jolt.js';
import Coulomb from '../GameObjects/Enemies/coulomb.js';

var ENEMY_VALUES = [];
var TOUGHER_ENEMY_VALUES = [];

var cursors;                    // Set keys to be pressed
var player;                     // Player game object
var lasers;                     // Pool of bullets shot by the player
var enemyLasers;                // Pool of bullets shot by enemiess
var laserTraps = [];            // Laser traps at stage
var mouseTouchDown = false;     // Mouse is being left clicked
var lastFired = 0;              // Time instant when last shot was fired
var levelloaded = false;        // Represents that the level has finished loading

var enemies;                    // Enemies on scene
var tougherEnemies;             // Tougher enemies on scene
var bumps;                      // Neutral objects that serve as obstacles.

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

var hittable = true;
var timeoutHittable;

// ITEMS
var keycard;

var keyFX;
var hitFX;
var pickKeyFX;
var shootFX;
var sparkFX;

let scaleFactor;

function tacklePlayer(player, enemy) {
    hitFX.play();
    if (enemy.isCharging) { enemy.tackle(player); }
    meleeHitPlayer.call(this, player, enemy);
}

function meleeHitPlayer(player, enemy) {
    hitFX.play();

    if (hittable) {
        recoverArmor.paused = true;
        if (timerUntilRecovery) { timerUntilRecovery.remove(false); }
        timerUntilRecovery = this.time.addEvent({ delay: playerStats.ARMOR_RECOVERY_TIMER, callback: startRecovery, callbackScope: this, loop: false });
        if (playerStats.ARMOR > 0) {
            // armorBar.width -= enemy.damage * 2;
            this.hitArmor(enemy.damage);
        } else {
            this.hitHealth(enemy.damage);
            if (this.playerStats.HEALTH <= 0) {
                this.scene.start("Continue", {
                    score: score, configScoreText: configScoreText, playerStats: playerStats, scenario: scenario,
                    currentPosition: currentPosition, entrance: 'center'
                });
            }
        }
    }

    hittable = false;
    timeoutHittable = setTimeout(() => { hittable = true }, 2500);
    let hitAngle = Phaser.Math.Angle.Between(player.x, player.y, enemy.x, enemy.y);
    var velocity = this.physics.velocityFromRotation(hitAngle, -100);
    player.x += velocity.x;
    player.y += velocity.y;
}

function hitEnemy(enemy, laser) {
    enemy.health -= laser.damage;
    laser.setVisible(false);
    laser.setActive(false);
    lasers.remove(laser);
    laser.destroy();
    score += 20;
    if (enemy.health <= 0) {

        enemy.die();
        sparkFX.play();
        enemies.remove(enemy);
        // enemy.destroy();
        this.dropItems(player, enemy.x, enemy.y);
        // Life value has changed as the medikit has been taken

        if (enemies.children.entries.length === 0 && tougherEnemies.children.entries.length === 0) {
            clearArea.apply(this);
            if (timeoutHittable) { clearTimeout(timeoutHittable); }
        }
        score += enemy.score;
        this.setScore(score);
    }
    scoreText.setText('SCORE: ' + score);
}

function clearArea() {
    currentPosition.isClear = true;
    if (currentPosition.isKey) {
        spawnKey(this);
        keyFX.play()
    }
    this.createDoors(this, currentPosition);
    this.addDoorColliders(this);

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

function spawnKey(context) {
    keycard = context.physics.add.sprite(window.innerWidth / 2, window.innerHeight / 2, 'keycard');
    keycard.setOrigin(0.5, 0.5);
    keycard.setScale(0.125 * scaleFactor);
    context.physics.add.overlap(player, keycard, pickKey, null, context);
}

function pickKey() {
    pickKeyFX.play();
    currentPosition.keyIsTaken = true;
    keycard.destroy();
    playerStats.KEYCODES++;
    this.setData(scenario, score, configScoreText, playerStats, currentPosition, entrance, player);
    this.drawKeys(playerStats.KEYCODES);
    if (playerStats.KEYCODES === 3 && currentPosition.whereIsBoss !== "") { this.createDoors(this, currentPosition); }
}

function generateEnemies(context) {
    // The amount of enemies depends on the difficulty setting.
    generateMinions(context);
    generateTougher(context);

}

function collisionBetweenTougher(tough1, tough2) {
    this.cameras.main.shake(50);
    const collisionAngle = Phaser.Math.Angle.Between(tough1.x, tough1.y, tough2.x, tough2.y);
    const velocity = this.physics.velocityFromRotation(collisionAngle, 500);
    if (tough1.x < tough2.x) {
        tough1.body.setVelocityX(-Math.abs(velocity.x) * scaleFactor);
        tough2.body.setVelocityX(Math.abs(velocity.x) * scaleFactor);
    } else {
        tough1.body.setVelocityX(Math.abs(velocity.x) * scaleFactor);
        tough2.body.setVelocityX(-Math.abs(velocity.x) * scaleFactor);
    }
    if (tough1.y < tough2.y) {
        tough1.body.setVelocityY(-Math.abs(velocity.y) * scaleFactor);
        tough2.body.setVelocityY(Math.abs(velocity.y) * scaleFactor);
    } else {
        tough1.body.setVelocityY(Math.abs(velocity.y) * scaleFactor);
        tough2.body.setVelocityY(-Math.abs(velocity.y) * scaleFactor);
    }
    setTimeout(() => {
        tough1.crashIntoWall();
        tough2.crashIntoWall();
    }, 100);
}

function untangleEnemies(enemy1, enemy2) {
    let b1 = enemy1.body;
    let b2 = enemy2.body;

    if (b1.y > b2.y) {
        b1.y -= Math.abs(b1.top - b2.bottom) * scaleFactor;
        b1.stop();
    }
    else {
        b1.y += Math.abs(b2.top - b1.bottom) * scaleFactor;
        b1.stop();
    }

    if (b1.x < b2.x) {
        b1.x -= Math.abs(b1.left - b2.right) * scaleFactor;
        b1.stop();
    } else {
        b1.x += Math.abs(b1.right - b2.left) * scaleFactor;
        b1.stop();
    }
}

/**
 * Avoids an overlap between a bump element and a gameobject.
 * @param {GameObject} agent Agent that overlaps with a game bump 
 * @param {*} bump Bump Element
 */
function untangleFromBumps(bump, agent) {
    if (levelloaded) this.untangleFromBumps(agent, bump);
}

function onWorldBounds(bump, enemy) {
    this.cameras.main.shake(150);
    bump.body.setVelocity(0, 0);
    enemy.crashIntoWall();
    this.untangleFromBumps(enemy, bump);
}

function generateMinions(context) {
    var minAmountOfEnemies = playerStats.DIFFICULTY === "EASY" ? 1 : playerStats.DIFFICULTY === "NORMAL" ? 2 : 3;
    var maxAmountOfEnemies = playerStats.DIFFICULTY === "EASY" ? 2 : playerStats.DIFFICULTY === "NORMAL" ? 4 : 6;

    var nEnemies = Phaser.Math.Between(minAmountOfEnemies, maxAmountOfEnemies);

    ENEMY_VALUES = [];

    for (let i = 0; i < nEnemies; i++) {
        ENEMY_VALUES.push({
            x: entrance === "right" ? Phaser.Math.Between(player.x + 64, window.innerWidth - 256)
                : entrance === "left" ? Phaser.Math.Between(256, player.x - 64) : Phaser.Math.Between(256, window.innerWidth - 256),
            y: entrance === "down" ? Phaser.Math.Between(player.y + 64, window.innerHeight - 256)
                : entrance === "up" ? Phaser.Math.Between(256, player.y - 64) : Phaser.Math.Between(256, window.innerHeight - 256),
            type: 'scancatcher1', scale: 2 * scaleFactor, rotation: 0, health: 60, damage: 20, speed: 80 * scaleFactor, score: 350
        })
    }

    enemies = context.physics.add.group({
        classType: Enemy
    });

    ENEMY_VALUES.forEach((enem) => {
        let newEnemy = new Scancatcher(context, enem.x, enem.y, enem.type, enem.scale, enem.rotation, enem.health, enem.damage, enem.speed, enem.score);
        newEnemy.name = "scancatcher";
        newEnemy.body.immovable = true;
        enemies.add(newEnemy);
    });
}

function generateTougher(context) {
    var minAmountOfEnemies = playerStats.DIFFICULTY === "EASY" ? 1 : playerStats.DIFFICULTY === "NORMAL" ? 1 : 1;
    var maxAmountOfEnemies = playerStats.DIFFICULTY === "EASY" ? 1 : playerStats.DIFFICULTY === "NORMAL" ? 2 : 2;

    var nEnemies = Phaser.Math.Between(minAmountOfEnemies, maxAmountOfEnemies);

    TOUGHER_ENEMY_VALUES = [];

    for (let i = 0; i < nEnemies; i++) {
        TOUGHER_ENEMY_VALUES.push({
            x: entrance === "right" ? Phaser.Math.Between(player.x + 64, window.innerWidth - 256)
                : entrance === "left" ? Phaser.Math.Between(256, player.x - 64) : Phaser.Math.Between(256, window.innerWidth - 256),
            y: entrance === "down" ? Phaser.Math.Between(player.y + 64, window.innerHeight - 256)
                : entrance === "up" ? Phaser.Math.Between(256, player.y - 64) : Phaser.Math.Between(256, window.innerHeight - 256),
            type: 'coulomb', scale: 1 * scaleFactor, rotation: 0, health: 200, damage: 35, speed: 1750 * scaleFactor, score: 1000
        })
    }

    tougherEnemies = context.physics.add.group({
        classType: Enemy
    });

    TOUGHER_ENEMY_VALUES.forEach((enem) => {
        let newCoulomb = new Coulomb(context, enem.x, enem.y, enem.type, enem.scale, enem.rotation, enem.health, enem.damage, enem.speed, enem.score, scaleFactor);
        newCoulomb.setTarget(player);
        newCoulomb.name = "coulomb";
        tougherEnemies.add(newCoulomb);
    });
}

class Level2_1 extends Hostile {
    topleftdooropen;
    toprightdddooropen;
    leftleftdooropen;
    leftrightdooropen;
    rightleftdooropen;
    rightrightdooropen;
    botleftdooropen;
    botrightdooropen;

    constructor() {
        super('Level2_1');
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
        this.load.on('complete', () => { levelloaded = true; });
        shootFX = this.sound.add('laser');
        keyFX = this.sound.add('dropkey');
        hitFX = this.sound.add('hit1');
        pickKeyFX = this.sound.add('pickkey');
        sparkFX = this.sound.add('spark');
        scaleFactor = this.setScaleFactor();
        this.setPlayerStats(playerStats);
        this.setCurrentPosition(currentPosition);
        if (currentPosition.isKey && currentPosition.isClear && !currentPosition.keyIsTaken) {
            spawnKey(this);
            keyFX.play()
        }
        recoverArmor = this.time.addEvent({ delay: 250, callback: onRecover, callbackScope: this, loop: true });

        /* CURSORS */
        cursors = this.createCursors(this);

        /* ### SCENARIO: BASIC ### */
        this.drawScenario(this);
        bumps = this.getBumps();
        this.physics.world.enable(bumps);

        /* DOORS */
        this.createDoors(this, currentPosition);

        /* ### PLAYER ### */
        if (entrance === 'center') { player = this.physics.add.sprite(window.innerWidth / 2, window.innerHeight / 2, 'player'); }
        if (entrance === 'down') { player = this.physics.add.sprite(window.innerWidth / 2, 192 * scaleFactor, 'player'); }
        if (entrance === 'up') { player = this.physics.add.sprite(window.innerWidth / 2, window.innerHeight - 192 * scaleFactor, 'player'); }
        if (entrance === 'left') { player = this.physics.add.sprite(window.innerWidth - 192 * scaleFactor, window.innerHeight / 2, 'player'); }
        if (entrance === 'right') { player = this.physics.add.sprite(192 * scaleFactor, window.innerHeight / 2, 'player'); }

        player.setScale(0.3 * scaleFactor);
        player.setOrigin(0.5, 0.5);
        player.setDepth(10);
        player.setCollideWorldBounds(true);
        player.body.setSize(player.width / 2, player.height / 2);
        player.body.setOffset(player.width / 4, player.height / 4);

        this.physics.world.enable(player);
        this.setData(scenario, score, configScoreText, playerStats, currentPosition, entrance, player);

        this.drawKeys(playerStats.KEYCODES);
        /* LASERS */
        lasers = this.physics.add.group({
            classType: Laser
        });
        enemyLasers = this.physics.add.group({
            classType: Laser
        });

        /* ENEMIES */
        generateEnemies(this);

        /* UI */
        scoreText = this.make.text(configScoreText);
        initializeText();
        this.drawPlayerUI();

        /*COLLIDERS */
        this.physics.add.collider(enemies, enemies);
        this.physics.add.collider(player, enemies, meleeHitPlayer, null, this);
        this.physics.add.collider(enemies, lasers);
        this.physics.add.overlap(enemies, lasers, hitEnemy, null, this);
        this.drawMap(this);

        this.physics.add.collider(bumps, tougherEnemies, onWorldBounds, null, this);
        this.physics.add.collider(bumps, player);
        bumps.children.iterate((bump) => {
            bump.body.immovable = true;
            bump.moves = false;
        });
        this.physics.add.overlap(bumps, enemies, untangleFromBumps, null, this);
        this.physics.add.collider(bumps, enemies);
        this.physics.add.overlap(bumps, tougherEnemies, untangleFromBumps, null, this);
        this.physics.add.collider(tougherEnemies, tougherEnemies, collisionBetweenTougher, null, this);
        this.physics.add.overlap(tougherEnemies, lasers, hitEnemy, null, this);
        this.physics.add.collider(player, tougherEnemies, tacklePlayer, null, this);
        this.physics.add.overlap(tougherEnemies, tougherEnemies, untangleEnemies, null, this);
        this.physics.add.overlap(bumps, lasers, (bump, laser) => {
            lasers.remove(laser);
            laser.destroy();
        }, null, this);

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
            var currentLaser = new Laser(this, player.x, player.y, 'laser', 0.5 * scaleFactor, angle, velocity, '0xff38c0', this.playerStats.DAMAGE);
            lasers.add(currentLaser);
            lastFired = time + this.playerStats.FIRE_RATE;
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

        enemies.children.iterate((enem) => {
            let enemAngle = Phaser.Math.Angle.Between(enem.x, enem.y, player.x, player.y);
            enem.rotation = enemAngle;
            enem.move(player);
        });

        tougherEnemies.children.iterate((enem) => {
            if (!enem.isCharging && !enem.isStunned) { enem.aim(); }
            else if (enem.isCharging && !enem.isStunned) { enem.move(); }
        });

        lasers.children.iterate((laser) => {
            if (laser) { laser.move(delta) } else { lasers.remove(laser); }
        });
        enemyLasers.children.iterate((laser) => {
            if (laser) { laser.move(delta) } else { lasers.remove(laser); }
        });


    }
}

export default Level2_1;