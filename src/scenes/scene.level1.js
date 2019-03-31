import Laser from '../GameObjects/laser.js';

var cursors;                    // Set keys to be pressed
var player;                     // Player game object
var lastFired = 0;              // Time instant when last shot was fired
var lasers;                     // Pool of bullets shot by the player

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

// DOORS
var topleftdoorframe;
var topleftdooropen;
var toprightdoorframe;
var toprightdooropen;
var leftleftdoorframe;
var leftleftdooropen;
var leftrightdoorframe;
var leftrightdooropen;
var rightleftdoorframe;
var rightleftdooropen;
var rightrightdoorframe;
var rightrightdooropen;
var botleftdoorframe;
var botleftdooropen;
var botrightdoorframe;
var botrightdooropen;

// UI
var healthIcon;
var healthBar;
var healthBarBg;
var armorIcon;
var armorBar;
var armorBarBg;

var playerStats;

var recoverArmor;               // Event that will recover armor if armor < max armor.
var timerUntilRecovery;

var score;
var scoreText;
var configScoreText;
var scenario;
var currentPosition;

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

function goDown() {
    this.scene.start("Level1", {
        score: score, configScoreText: configScoreText, playerStats: playerStats, scenario: scenario,
        currentPosition: scenario[currentPosition.x][currentPosition.y + 1]
    });
}
function goUp() {
    this.scene.start("Level1", {
        score: score, configScoreText: configScoreText, playerStats: playerStats, scenario: scenario,
        currentPosition: scenario[currentPosition.x][currentPosition.y - 1]
    });
}
function goLeft() {
    this.scene.start("Level1", {
        score: score, configScoreText: configScoreText, playerStats: playerStats, scenario: scenario,
        currentPosition: scenario[currentPosition.x - 1][currentPosition.y]
    });
}
function goRight() {
    this.scene.start("Level1", {
        score: score, configScoreText: configScoreText, playerStats: playerStats, scenario: scenario,
        currentPosition: scenario[currentPosition.x + 1][currentPosition.y]
    });
}

class Level1 extends Phaser.Scene {
    constructor() {
        super({ key: "Level1" });
    }
    init(data) {
        score = data.score;
        configScoreText = data.configScoreText;
        playerStats = data.playerStats;
        scenario = data.scenario;
        currentPosition = data.currentPosition;
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

        // DOORS
        if (currentPosition.top) {
            topleftdooropen = this.physics.add.sprite(window.innerWidth / 2 - 32, 32, 'leftdooropen');
            topleftdoorframe = this.physics.add.sprite(window.innerWidth / 2 - 32, 32, 'leftdoorframe');
            toprightdooropen = this.physics.add.sprite(window.innerWidth / 2 + 32, 32, 'rightdooropen');
            toprightdoorframe = this.physics.add.sprite(window.innerWidth / 2 + 32, 32, 'rightdoorframe');
        }
        if (currentPosition.left) {
            leftleftdooropen = this.physics.add.sprite(32, window.innerHeight / 2 + 32, 'leftdooropen');
            leftleftdooropen.angle = 270;
            leftleftdoorframe = this.physics.add.sprite(32, window.innerHeight / 2 + 32, 'leftdoorframe');
            leftleftdoorframe.angle = 270;
            leftrightdooropen = this.physics.add.sprite(32, window.innerHeight / 2 - 32, 'rightdooropen');
            leftrightdooropen.angle = 270;
            leftrightdoorframe = this.physics.add.sprite(32, window.innerHeight / 2 - 32, 'rightdoorframe');
            leftrightdoorframe.angle = 270;
        }
        if (currentPosition.right) {
            rightleftdooropen = this.physics.add.sprite(window.innerWidth - 32, window.innerHeight / 2 - 32, 'leftdooropen');
            rightleftdooropen.angle = 90;
            rightleftdoorframe = this.physics.add.sprite(window.innerWidth - 32, window.innerHeight / 2 - 32, 'leftdoorframe');
            rightleftdoorframe.angle = 90;
            rightrightdooropen = this.physics.add.sprite(window.innerWidth - 32, window.innerHeight / 2 + 32, 'rightdooropen');
            rightrightdooropen.angle = 90;
            rightrightdoorframe = this.physics.add.sprite(window.innerWidth - 32, window.innerHeight / 2 + 32, 'rightdoorframe');
            rightrightdoorframe.angle = 90;
        }
        if (currentPosition.bottom) {
            botleftdooropen = this.physics.add.sprite(window.innerWidth / 2 + 32, window.innerHeight - 38, 'leftdooropen');
            botleftdooropen.angle = 180;
            botleftdoorframe = this.physics.add.sprite(window.innerWidth / 2 + 32, window.innerHeight - 38, 'leftdoorframe');
            botleftdoorframe.angle = 180;
            botrightdooropen = this.physics.add.sprite(window.innerWidth / 2 - 32, window.innerHeight - 38, 'rightdooropen');
            botrightdooropen.angle = 180;
            botrightdoorframe = this.physics.add.sprite(window.innerWidth / 2 - 32, window.innerHeight - 38, 'rightdoorframe');
            botrightdoorframe.angle = 180;
        }

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

        /* UI */
        scoreText = this.make.text(configScoreText);
        initializeText();
        armorIcon = this.physics.add.sprite(64, (window.innerHeight - 30), 'armorIcon');
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

        // this.physics.add.collider(player, topleftdooropen);
        this.physics.add.overlap(player, topleftdooropen, goUp, null, this);
        // this.physics.add.collider(player, toprightdooropen);
        this.physics.add.overlap(player, toprightdooropen, goUp, null, this);
        // this.physics.add.collider(player, leftleftdooropen);
        this.physics.add.overlap(player, leftleftdooropen, goLeft, null, this);
        // this.physics.add.collider(player, leftrightdooropen);
        this.physics.add.overlap(player, leftrightdooropen, goLeft, null, this);
        // this.physics.add.collider(player, rightleftdooropen);
        this.physics.add.overlap(player, rightleftdooropen, goRight, null, this);
        // this.physics.add.collider(player, rightrightdooropen);
        this.physics.add.overlap(player, rightrightdooropen, goRight, null, this);
        // this.physics.add.collider(player, botleftdooropen);
        this.physics.add.overlap(player, botleftdooropen, goDown, null, this);
        // this.physics.add.collider(player, botrightdooropen);
        this.physics.add.overlap(player, botrightdooropen, goDown, null, this);
    }

    update(time, delta) {
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

        lasers.children.iterate((laser) => {
            if (laser) { laser.move(delta) } else { lasers.remove(laser); }
        })
    }
}

export default Level1;
