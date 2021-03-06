import Laser from '../GameObjects/laser.js';
import LaserTrap from '../GameObjects/lasertrap.js';
import Enemy from '../GameObjects/Enemies/enemy.js';
import Scancatcher from '../GameObjects/Enemies/scancatcher.js';
import Hostile from './scene.hostile.js';
import Jolt from '../GameObjects/Enemies/jolt.js';

var ENEMY_VALUES = [];

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
var levelloaded = false;        // Represents that the level has finished loading
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
var bumps;

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
var pickKeyFX;
var shootFX;
var sparkFX;

let scaleFactor;

/** Scancatcher hits player */
function scanMeleeHitPlayer(player, enemy) {
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

/** Player hits enemy */
/** Player hits enemy with its laser */
function hitEnemy(enemy, laser) {
    enemy.health -= laser.damage;
    laser.setVisible(false);
    laser.setActive(false);
    lasers.remove(laser);
    laser.destroy();
    score += 20;
    if (enemy.health <= 0) {
        sparkFX.play();
        enemy.die();
        enemies.remove(enemy);
        this.dropItems(player, enemy.x, enemy.y);
        // Life value has changed as the medikit has been taken

        if (enemies.children.entries.length === 0) {
            clearArea.apply(this);
        }
        score += enemy.score;
        this.setScore(score);
    }
    scoreText.setText('SCORE: ' + score);
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

/**
 * Avoids an overlap between a bump element and a gameobject.
 * @param {GameObject} agent Agent that overlaps with a game bump 
 * @param {*} bump Bump Element
 */
function untangleFromBumps(bump, agent) {
    if (levelloaded) this.untangleFromBumps(agent, bump);
}

/** Generates enemies on current room */
function generateEnemies(context) {
    // The amount of enemies depends on the difficulty setting.
    var minAmountOfEnemies = playerStats.DIFFICULTY === "EASY" ? 2 : playerStats.DIFFICULTY === "NORMAL" ? 3 : 4;
    var maxAmountOfEnemies = playerStats.DIFFICULTY === "EASY" ? 4 : playerStats.DIFFICULTY === "NORMAL" ? 5 : 8;

    var nEnemies = Phaser.Math.Between(minAmountOfEnemies, maxAmountOfEnemies);

    ENEMY_VALUES = [];

    for (let i = 0; i < nEnemies; i++) {
        ENEMY_VALUES.push({
            x: entrance === "right" ? Phaser.Math.Between(player.x + 64 * scaleFactor, window.innerWidth - 256 * scaleFactor)
                : entrance === "left" ? Phaser.Math.Between(256 * scaleFactor, player.x - 64 * scaleFactor) : Phaser.Math.Between(256 * scaleFactor, window.innerWidth - 256 * scaleFactor),
            y: entrance === "down" ? Phaser.Math.Between(player.y + 64 * scaleFactor, window.innerHeight - 256 * scaleFactor)
                : entrance === "up" ? Phaser.Math.Between(256 * scaleFactor, player.y - 64 * scaleFactor) : Phaser.Math.Between(256 * scaleFactor, window.innerHeight - 256 * scaleFactor),
            type: 'scancatcher1', scale: 2 * scaleFactor, rotation: 0, health: 60, damage: 20, speed: 80, score: 350
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

class Level1_1 extends Hostile {
    topleftdooropen;
    toprightdddooropen;
    leftleftdooropen;
    leftrightdooropen;
    rightleftdooropen;
    rightrightdooropen;
    botleftdooropen;
    botrightdooropen;

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
        window.onresize = () => this.scene.restart();
        this.load.on('complete', () => { levelloaded = true; });
        shootFX = this.sound.add('laser');
        keyFX = this.sound.add('dropkey');
        pickKeyFX = this.sound.add('pickkey');
        sparkFX = this.sound.add('spark');
        this.setPlayerStats(playerStats);
        scaleFactor = this.setScaleFactor();
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
        this.physics.add.collider(player, enemies, scanMeleeHitPlayer, null, this);
        this.physics.add.collider(enemies, lasers);
        this.physics.add.overlap(enemies, lasers, hitEnemy, null, this);

        this.physics.add.collider(bumps, player);
        bumps.children.iterate((bump) => {
            bump.body.immovable = true;
            bump.moves = false;
        });
        this.physics.add.overlap(bumps, enemies, untangleFromBumps, null, this);
        this.physics.add.collider(bumps, enemies);
        this.physics.add.overlap(bumps, lasers, (bump, laser) => {
            lasers.remove(laser);
            laser.destroy();
        }, null, this);
        this.drawMap(this);

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
            let enemAngle = Phaser.Math.Angle.Between(enem.x, enem.y, player.x, player.y);
            enem.rotation = enemAngle;
            enem.move(player);
        });

        lasers.children.iterate((laser) => {
            if (laser) { laser.move(delta) } else { lasers.remove(laser); }
        });
        enemyLasers.children.iterate((laser) => {
            if (laser) { laser.move(delta) } else { lasers.remove(laser); }
        });


    }
}

export default Level1_1;