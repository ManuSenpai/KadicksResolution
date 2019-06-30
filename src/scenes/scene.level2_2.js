import Laser from '../GameObjects/laser.js';
import Enemy from '../GameObjects/Enemies/enemy.js';
import Hostile from './scene.hostile.js';
import Jolt from '../GameObjects/Enemies/jolt.js';
import Trashbot from '../GameObjects/Enemies/trashbot.js';

var ENEMY_VALUES = [];

const TURRET_LASER_SPEED = 1;   // Laser speed coming from turret
const TURRET_FIRE_RATE = 1000;  // Turret fire rate
const BURN_RATE = 300;          // Time passed until burn affects;

const TIME_SHOOT_PLAYER = 1500; // Time to pass for the foes to start shooting at the player;
const FIRE_DAMAGE = 10;         // Damage caused by fire

var cursors;                    // Set keys to be pressed
var player;                     // Player game object
var lasers;                     // Pool of bullets shot by the player
var lastFired = 0;              // Time instant when last shot was fired

var enemies;                    // Enemies on scene
var trashbots;                  // Trashbots on scene
var enemyLasers;                // lasers shot by foes
var readyToShoot = false;       // Enemies are ready to shoot;
var trailColliders;             // Trail colliders;
var isBurning;                  // Checks if player is burning
var lastBurntTime = 0;          // Time instant when player got burnt
var playerTouchedFire = false;  // The player has touched the fire

var bumps;
var levelloaded = false;


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

// AUDIO
var keyFX;
var hitFX;
var hit2FX;
var pickKeyFX;
var shootFX;
var enemShootFX;
var sparkFX;

let scaleFactor;

/** Enemy laser hits player */
function hitPlayer(player, laser) {
    hit2FX.play();
    recoverArmor.paused = true;
    if (timerUntilRecovery) { timerUntilRecovery.remove(false); }
    timerUntilRecovery = this.time.addEvent({ delay: playerStats.ARMOR_RECOVERY_TIMER, callback: startRecovery, callbackScope: this, loop: false });
    if (this.playerStats.ARMOR > 0) {
        this.hitArmor(laser.damage);
    } else {
        this.hitHealth(laser.damage);
        if (this.playerStats.HEALTH <= 0) {
            this.scene.start("Continue", {
                score: score, configScoreText: configScoreText, playerStats: playerStats, scenario: scenario,
                currentPosition: currentPosition, entrance: 'center'
            });
        }
    }
    laser.destroy();
    lasers.remove(laser);
}

/** Manages player's collision with the fire */
function burnPlayer(context) {
    hit2FX.play();
    recoverArmor.paused = true;
    if (timerUntilRecovery) { timerUntilRecovery.remove(false); }
    timerUntilRecovery = context.time.addEvent({ delay: playerStats.ARMOR_RECOVERY_TIMER, callback: startRecovery, callbackScope: context, loop: false });
    if (context.playerStats.ARMOR > 0) {
        context.hitArmor(FIRE_DAMAGE);
    } else {
        context.hitHealth(FIRE_DAMAGE);
        if (context.playerStats.HEALTH <= 0) {
            this.scene.start("Continue", {
                score: score, configScoreText: configScoreText, playerStats: playerStats, scenario: scenario,
                currentPosition: currentPosition, entrance: 'center'
            });
        }
    }
}

/** Hits player on melee */
function meleeHit(player, enemy) {
    hitFX.play();
    recoverArmor.paused = true;
    if (timerUntilRecovery) { timerUntilRecovery.remove(false); }
    timerUntilRecovery = this.time.addEvent({ delay: playerStats.ARMOR_RECOVERY_TIMER, callback: startRecovery, callbackScope: this, loop: false });
    if (playerStats.ARMOR > 0) {
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

    let hitAngle = Phaser.Math.Angle.Between(player.x, player.y, enemy.x, enemy.y);
    var velocity = this.physics.velocityFromRotation(hitAngle, -100);
    player.x += velocity.x;
    player.y += velocity.y;
}

/**
 * Avoids an overlap between a bump element and a gameobject.
 * @param {GameObject} agent Agent that overlaps with a game bump 
 * @param {*} bump Bump Element
 */
function untangleFromBumps(bump, agent) {
    if (levelloaded) this.untangleFromBumps(agent, bump);
}

/** Player hits trashbot */
function hitTrashbot(enemy, laser) {
    enemy.health -= laser.damage;
    laser.setVisible(false);
    laser.setActive(false);
    lasers.remove(laser);
    laser.destroy();
    if (enemy.hasOwnProperty('hit')) { enemy.hit(); }
    score += 20;
    if (enemy.health <= 0) {
        enemy.active = false;
        sparkFX.play();
        enemy.onDestroy();
        trashbots.remove(enemy);
        this.dropItems(player, enemy.x, enemy.y);
        // Life value has changed as the medikit has been taken
        if (enemies.children.entries.length === 0 && trashbots.children.entries.length === 0) {
            clearArea.apply(this);
        }
        score += enemy.score;
        this.setScore(score);
    }
    scoreText.setText('SCORE: ' + score);
}

/** Player hits jolt*/
function hitJolt(enemy, laser) {
    enemy.health -= laser.damage;
    laser.setVisible(false);
    laser.setActive(false);
    lasers.remove(laser);
    laser.destroy();
    enemy.hit();
    score += 20;
    if (enemy.health <= 0) {
        sparkFX.play();
        enemy.onDestroy();
        enemies.remove(enemy);
        this.dropItems(player, enemy.x, enemy.y);
        // Life value has changed as the medikit has been taken
        if (enemies.children.entries.length === 0 && trashbots.children.entries.length === 0) {
            clearArea.apply(this);
        }
        score += enemy.score;
        this.setScore(score);
    }
    scoreText.setText('SCORE: ' + score);
}

/** Player hits enemy's shield with its laser */
function hitShield(shield, laser) {
    lasers.remove(laser);
    laser.destroy();
}

/** Drops a keycode if all enemies at the scene have been beaten */
function clearArea() {
    currentPosition.isClear = true;
    if (currentPosition.isKey) {
        spawnKey(this);
        keyFX.play()
    }
    this.createDoors(this, currentPosition);
    this.addDoorColliders(this);

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

/** Displays a key whene enemies are beaten */
function spawnKey(context) {
    keycard = context.physics.add.sprite(window.innerWidth / 2, window.innerHeight / 2, 'keycard');
    keycard.setOrigin(0.5, 0.5);
    keycard.setScale(0.125 * scaleFactor);
    context.physics.add.overlap(player, keycard, pickKey, null, context);
}

/** Player picks key */
function pickKey() {
    pickKeyFX.play();
    currentPosition.keyIsTaken = true;
    keycard.destroy();
    playerStats.KEYCODES++;
    this.setData(scenario, score, configScoreText, playerStats, currentPosition, entrance, player);
    this.drawKeys(playerStats.KEYCODES);
    if (playerStats.KEYCODES === 3 && currentPosition.whereIsBoss !== "") { this.createDoors(this, currentPosition); }
}

/** Generates jolts */
function generateJolts(context) {
    // The amount of enemies depends on the difficulty setting.
    var minAmountOfEnemies = playerStats.DIFFICULTY === "EASY" ? 1 : playerStats.DIFFICULTY === "NORMAL" ? 2 : 3;
    var maxAmountOfEnemies = playerStats.DIFFICULTY === "EASY" ? 2 : playerStats.DIFFICULTY === "NORMAL" ? 3 : 5;

    var nEnemies = Phaser.Math.Between(minAmountOfEnemies, maxAmountOfEnemies);

    ENEMY_VALUES = [];

    for (let i = 0; i < nEnemies; i++) {
        ENEMY_VALUES.push({
            x: entrance === "right" ? Phaser.Math.Between(player.x + 64, window.innerWidth - 256)
                : entrance === "left" ? Phaser.Math.Between(256, player.x - 64) : Phaser.Math.Between(256, window.innerWidth - 256),
            y: entrance === "down" ? Phaser.Math.Between(player.y + 64, window.innerHeight - 256)
                : entrance === "up" ? Phaser.Math.Between(256, player.y - 64) : Phaser.Math.Between(256, window.innerHeight - 256),
            type: 'jolt', scale: 1 * scaleFactor, rotation: 0, health: 80, damage: 30, speed: 50, score: 600
        })
    }

    enemies = context.physics.add.group({
        classType: Enemy
    });

    ENEMY_VALUES.forEach((enem) => {
        enemies.add(new Jolt(context, enem.x, enem.y, enem.type, enem.scale, enem.rotation, enem.health, enem.damage, enem.speed, enem.score, scaleFactor));
    });
}

/** Generates trashbots */
function generateTrashbots(context) {
    // The amount of enemies depends on the difficulty setting.
    var minAmountOfEnemies = playerStats.DIFFICULTY === "EASY" ? 1 : playerStats.DIFFICULTY === "NORMAL" ? 2 : 3;
    var maxAmountOfEnemies = playerStats.DIFFICULTY === "EASY" ? 2 : playerStats.DIFFICULTY === "NORMAL" ? 3 : 5;

    var nEnemies = Phaser.Math.Between(minAmountOfEnemies, maxAmountOfEnemies);

    ENEMY_VALUES = [];

    for (let i = 0; i < nEnemies; i++) {
        ENEMY_VALUES.push({
            x: entrance === "right" ? Phaser.Math.Between(player.x + 64, window.innerWidth - 256)
                : entrance === "left" ? Phaser.Math.Between(256, player.x - 64) : Phaser.Math.Between(256, window.innerWidth - 256),
            y: entrance === "down" ? Phaser.Math.Between(player.y + 64, window.innerHeight - 256)
                : entrance === "up" ? Phaser.Math.Between(256, player.y - 64) : Phaser.Math.Between(256, window.innerHeight - 256),
            type: 'trashbot', scale: 1 * scaleFactor, rotation: 0, health: 200, damage: 40, speed: 200 * scaleFactor, score: 900
        })
    }

    trashbots = context.physics.add.group({
        classType: Enemy
    });

    ENEMY_VALUES.forEach((enem) => {
        let newTrashbot = new Trashbot(context, enem.x, enem.y, enem.type, enem.scale, enem.rotation, enem.health, enem.damage, enem.speed, enem.score, scaleFactor);
        context.physics.add.collider(newTrashbot, bumps, bounceOnWalls, null, context);
        context.physics.add.collider(newTrashbot, trashbots, bounceOnWalls, null, context);
        trashbots.add(newTrashbot);
        context.physics.add.overlap(player, newTrashbot.trailColliders, () => {
            playerTouchedFire = true;
        }, null, context);
    });


}

/** Trashbot bounces on wall */
function bounceOnWalls(trashbot, bump) {
    trashbot.bounceOnWall();
}

class Level2_2 extends Hostile {
    topleftdooropen;
    toprightdddooropen;
    leftleftdooropen;
    leftrightdooropen;
    rightleftdooropen;
    rightrightdooropen;
    botleftdooropen;
    botrightdooropen;

    constructor() {
        super('Level2_2');
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
        readyToShoot = false;
        shootFX = this.sound.add('laser');
        keyFX = this.sound.add('dropkey');
        hitFX = this.sound.add('hit1');
        hit2FX = this.sound.add('hit2');
        pickKeyFX = this.sound.add('pickkey');
        sparkFX = this.sound.add('spark');
        enemShootFX = this.sound.add('enemlaser');
        this.load.on('complete', () => { levelloaded = true; });
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
        generateJolts(this);
        generateTrashbots(this);

        /* UI */
        scoreText = this.make.text(configScoreText);
        initializeText();
        this.drawPlayerUI();

        /*COLLIDERS */
        this.physics.add.overlap(player, enemyLasers, hitPlayer, null, this);
        this.physics.add.collider(enemies, enemies);
        this.physics.add.collider(trashbots, enemies, bounceOnWalls, null, this);
        this.physics.add.collider(player, enemies, meleeHit, null, this);
        this.physics.add.collider(enemies, lasers);
        this.physics.add.overlap(enemies, lasers, hitJolt, null, this);
        this.physics.add.overlap(trashbots, lasers, hitTrashbot, null, this);
        enemies.children.iterate((enem) => {
            this.physics.add.overlap(enem.forcefield, lasers, hitShield, null, this);
        })
        this.drawMap(this);

        this.physics.add.collider(bumps, player);
        bumps.children.iterate((bump) => {
            bump.body.immovable = true;
            bump.moves = false;
        });
        this.physics.add.collider(bumps, enemies);
        this.physics.add.overlap(bumps, enemies, untangleFromBumps, null, this);
        this.physics.add.overlap(bumps, lasers, (bump, laser) => {
            lasers.remove(laser);
            laser.destroy();
        }, null, this);
        this.physics.add.overlap(bumps, enemyLasers, (bump, laser) => {
            enemyLasers.remove(laser);
            laser.destroy();
        }, null, this);
        this.physics.add.collider(player, trashbots, (player, trashbot) => {
            trashbot.bounceOnWall();
        }, null, this);
        setTimeout(() => { readyToShoot = true; }, TIME_SHOOT_PLAYER);

    }

    checkIfBurning() {
        let result = false;
        trashbots.children.iterate((tbot) => {
            this.physics.overlap(player, tbot.trailColliders, () => {
                result = true;
            }, null, this);
        })
        return result;
    }

    update(time, delta) {
        if (playerIsHit) {
            timeLastHit = time;
            playerIsHit = false;
        }

        if (playerTouchedFire) {
            isBurning = this.checkIfBurning();
        }

        if (isBurning) {
            if (time > lastBurntTime) {
                burnPlayer(this);
                lastBurntTime = time + BURN_RATE;
            }
        } else {
            playerTouchedFire = false;
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
            enem.move(player);
            enem.aim(player);
            if (readyToShoot) {
                let weaponAngle = Phaser.Math.Angle.Between(enem.weapon.x, enem.weapon.y, player.x, player.y);
                if (time > enem.lastFired) {
                    enemShootFX.play();
                    var velocity = this.physics.velocityFromRotation(weaponAngle, TURRET_LASER_SPEED * scaleFactor);
                    var currentLaser = new Laser(this, enem.weapon.x, enem.weapon.y, 'laser', 0.5 * scaleFactor, weaponAngle, velocity, '0x77abff', enem.damage);
                    currentLaser.setDepth(5);
                    enemyLasers.add(currentLaser);
                    enem.lastFired = time + TURRET_FIRE_RATE;
                }
            }
        });

        trashbots.children.iterate((bot) => {
            bot.move();
        })

        lasers.children.iterate((laser) => {
            if (laser) { laser.move(delta) } else { lasers.remove(laser); }
        });

        enemyLasers.children.iterate((laser) => {
            if (laser) { laser.move(delta) } else { lasers.remove(laser); }
        });
    }
}

export default Level2_2;