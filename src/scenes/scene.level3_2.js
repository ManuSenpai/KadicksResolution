import Laser from '../GameObjects/laser.js';
import Enemy from '../GameObjects/Enemies/enemy.js';
import Hostile from './scene.hostile.js';
import Trashbot from '../GameObjects/Enemies/trashbot.js';
import Wavebender from '../GameObjects/Enemies/wavebender.js';

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

var trashbots;                  // Trashbots on scene
var wavebenders;                // Wavebenders on scene
var circles;                    // 
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

function hitPlayer(player, enemy, context) {
    recoverArmor.paused = true;
    enemy.resetWave();
    if (timerUntilRecovery) { timerUntilRecovery.remove(false); }
    timerUntilRecovery = context.time.addEvent({ delay: playerStats.ARMOR_RECOVERY_TIMER, callback: startRecovery, callbackScope: context, loop: false });
    if (context.playerStats.ARMOR > 0) {
        context.hitArmor(enemy.damage);
    } else {
        context.hitHealth(enemy.damage);
        if (context.playerStats.HEALTH < 0) {
            // TODO: GAME OVER
        }
    }
}

function burnPlayer(context) {
    recoverArmor.paused = true;
    if (timerUntilRecovery) { timerUntilRecovery.remove(false); }
    timerUntilRecovery = context.time.addEvent({ delay: playerStats.ARMOR_RECOVERY_TIMER, callback: startRecovery, callbackScope: context, loop: false });
    if (context.playerStats.ARMOR > 0) {
        context.hitArmor(FIRE_DAMAGE);
    } else {
        context.hitHealth(FIRE_DAMAGE);
        if (context.playerStats.HEALTH < 0) {
            // TODO: GAME OVER
        }
    }
}

function meleeHit(player, enemy) {
    recoverArmor.paused = true;
    if (timerUntilRecovery) { timerUntilRecovery.remove(false); }
    timerUntilRecovery = this.time.addEvent({ delay: playerStats.ARMOR_RECOVERY_TIMER, callback: startRecovery, callbackScope: this, loop: false });
    if (playerStats.ARMOR > 0) {
        // armorBar.width -= enemy.damage * 2;
        this.hitArmor(enemy.damage);
    } else {
        this.hitHealth(enemy.damage);
        if (this.playerStats.HEALTH < 0) {
            // TODO: GAME OVER
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

function hitEnemy(enemy, laser) {
    enemy.health -= laser.damage;
    laser.setVisible(false);
    laser.setActive(false);
    lasers.remove(laser);
    laser.destroy();
    if (enemy.hasOwnProperty('hit')) { enemy.hit(); }
    score += 20;
    if (enemy.health <= 0) {
        enemy.setActive(false);
        enemy.setVisible(false);
        enemy.onDestroy();
        enemy.destroy();
        this.dropItems(player, enemy.x, enemy.y);
        // Life value has changed as the medikit has been taken
        if (wavebenders.children.entries.length === 0 && trashbots.children.entries.length === 0) {
            clearArea.apply(this);
        }
        score += enemy.score;
        this.setScore(score);
    }
    scoreText.setText('SCORE: ' + score);
}

function hitShield(shield, laser) {
    lasers.remove(laser);
    laser.destroy();
}

function clearArea() {
    currentPosition.isClear = true;
    if (currentPosition.isKey) {
        spawnKey(this);
    }
    this.createDoors(this, currentPosition);
    this.addDoorColliders(this);

}

function initializeText() {
    scoreText.setText('SCORE: ' + score);
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
    keycard.setScale(0.125);
    context.physics.add.overlap(player, keycard, pickKey, null, context);
}

function pickKey() {
    currentPosition.keyIsTaken = true;
    keycard.destroy();
    playerStats.KEYCODES++;
    this.setData(scenario, score, configScoreText, playerStats, currentPosition, entrance, player);
    this.drawKeys(playerStats.KEYCODES);
    if (playerStats.KEYCODES === 3 && currentPosition.whereIsBoss !== "") { this.createDoors(this, currentPosition); }
}

function generateWaveBenders(context) {
    // The amount of enemies depends on the difficulty setting.
    var minAmountOfEnemies = playerStats.DIFFICULTY === "EASY" ? 1 : playerStats.DIFFICULTY === "NORMAL" ? 2 : 3;
    var maxAmountOfEnemies = playerStats.DIFFICULTY === "EASY" ? 2 : playerStats.DIFFICULTY === "NORMAL" ? 4 : 5;

    var nEnemies = Phaser.Math.Between(minAmountOfEnemies, maxAmountOfEnemies);

    ENEMY_VALUES = [];

    for (let i = 0; i < nEnemies; i++) {
        ENEMY_VALUES.push({
            x: entrance === "right" ? Phaser.Math.Between(player.x + 64, window.innerWidth - 256)
                : entrance === "left" ? Phaser.Math.Between(256, player.x - 64) : Phaser.Math.Between(256, window.innerWidth - 256),
            y: entrance === "down" ? Phaser.Math.Between(player.y + 64, window.innerHeight - 256)
                : entrance === "up" ? Phaser.Math.Between(256, player.y - 64) : Phaser.Math.Between(256, window.innerHeight - 256),
            type: 'wavebender', scale: 0.35, rotation: 0, health: 300, damage: 40, speed: 100, score: 1200
        })
    }

    wavebenders = context.physics.add.group({
        classType: Enemy
    });

    ENEMY_VALUES.forEach((enem) => {
        let newWaveBender = new Wavebender(context, enem.x, enem.y, enem.type, enem.scale, enem.rotation, enem.health, enem.damage, enem.speed, enem.score);
        context.physics.add.collider(newWaveBender, bumps);
        context.physics.add.collider(newWaveBender, trashbots);
        newWaveBender.setTarget(player);
        wavebenders.add(newWaveBender);
    });

    context.physics.add.collider( wavebenders, wavebenders );
}

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
            type: 'trashbot', scale: 1, rotation: 0, health: 200, damage: 40, speed: 200, score: 900
        })
    }

    trashbots = context.physics.add.group({
        classType: Enemy
    });

    ENEMY_VALUES.forEach((enem) => {
        let newTrashbot = new Trashbot(context, enem.x, enem.y, enem.type, enem.scale, enem.rotation, enem.health, enem.damage, enem.speed, enem.score);
        context.physics.add.collider(newTrashbot, bumps, bounceOnWalls, null, context);
        context.physics.add.collider(newTrashbot, trashbots, bounceOnWalls, null, context);
        trashbots.add(newTrashbot);
        context.physics.add.overlap(player, newTrashbot.trailColliders, () => {
            playerTouchedFire = true;
        }, null, context);
    });


}

function bounceOnWalls(trashbot, bump) {
    trashbot.bounceOnWall();
}

class Level3_2 extends Hostile {
    topleftdooropen;
    toprightdddooropen;
    leftleftdooropen;
    leftrightdooropen;
    rightleftdooropen;
    rightrightdooropen;
    botleftdooropen;
    botrightdooropen;

    constructor() {
        super('Level3_2');
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
        this.load.on('complete', () => { levelloaded = true; });
        this.setPlayerStats(playerStats);
        this.setCurrentPosition(currentPosition);
        if (currentPosition.isKey && currentPosition.isClear && !currentPosition.keyIsTaken) {
            spawnKey(this);
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
        if (entrance === 'down') { player = this.physics.add.sprite(window.innerWidth / 2, 128, 'player'); }
        if (entrance === 'up') { player = this.physics.add.sprite(window.innerWidth / 2, window.innerHeight - 128, 'player'); }
        if (entrance === 'left') { player = this.physics.add.sprite(window.innerWidth - 128, window.innerHeight / 2, 'player'); }
        if (entrance === 'right') { player = this.physics.add.sprite(128, window.innerHeight / 2, 'player'); }

        player.setScale(0.3);
        player.setOrigin(0.5, 0.5);
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

        /* ENEMIES */
        generateTrashbots(this);
        generateWaveBenders(this);

        /* UI */
        scoreText = this.make.text(configScoreText);
        initializeText();
        this.drawPlayerUI();

        /*COLLIDERS */
        this.physics.add.overlap(trashbots, lasers, hitEnemy, null, this);
        this.physics.add.overlap(wavebenders, lasers, hitEnemy, null, this);
        this.drawMap(this);

        this.physics.add.collider(bumps, player);
        bumps.children.iterate((bump) => {
            bump.body.immovable = true;
            bump.moves = false;
        });
        this.physics.add.overlap(bumps, lasers, (bump, laser) => {
            lasers.remove(laser);
            laser.destroy();
        }, null, this);
        this.physics.add.collider(player, trashbots, (player, trashbot) => {
            trashbot.bounceOnWall();
        }, null, this);

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
            var velocity = this.physics.velocityFromRotation(angle, playerStats.LASER_SPEED);
            var currentLaser = new Laser(this, player.x, player.y, 'laser', 0.5, angle, velocity, '0xff38c0', this.playerStats.DAMAGE);
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

        if (player.x < 64) { player.x = 64; }
        if (player.y < 64) { player.y = 64; }
        if (player.x > window.innerWidth - 64) { player.x = window.innerWidth - 70; }
        if (player.y > window.innerHeight - 64) { player.y = window.innerHeight - 70; }

        trashbots.children.iterate((bot) => {
            bot.move();
        })
        wavebenders.children.iterate((wb) => {
            wb.move();
            if ( Phaser.Geom.Intersects.CircleToRectangle(wb.getCircles(), player.body) ) {
                hitPlayer(player, wb, this);
            }
        })

        lasers.children.iterate((laser) => {
            if (laser) { laser.move(delta) } else { lasers.remove(laser); }
        });
    }
}

export default Level3_2;