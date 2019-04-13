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
var topleftdoor;
var toprightdoorframe;
var toprightdooropen;
var toprightdoor;
var leftleftdoorframe;
var leftleftdooropen;
var leftleftdoor;
var leftrightdoorframe;
var leftrightdooropen;
var leftrightdoor;
var rightleftdoorframe;
var rightleftdooropen;
var rightleftdoor;
var rightrightdoorframe;
var rightrightdooropen;
var rightrightdoor;
var botleftdoorframe;
var botleftdooropen;
var botleftdoor;
var botrightdoorframe;
var botrightdooropen;
var botrightdoor;

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
var entrance;                   // From where the player enters.

// ITEMS
var keycard;

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
    const levelToGo = scenario[currentPosition.x][currentPosition.y + 1].isClear ? 'Level1' : 'Level1_1';
    this.scene.start(levelToGo, {
        score: score, configScoreText: configScoreText, playerStats: playerStats, scenario: scenario,
        currentPosition: scenario[currentPosition.x][currentPosition.y + 1], entrance: 'down'
    });
}
function goUp() {
    const levelToGo = scenario[currentPosition.x][currentPosition.y - 1].isClear ? 'Level1' : 'Level1_1';
    this.scene.start(levelToGo, {
        score: score, configScoreText: configScoreText, playerStats: playerStats, scenario: scenario,
        currentPosition: scenario[currentPosition.x][currentPosition.y - 1], entrance: 'up'
    });
}
function goLeft() {
    const levelToGo = scenario[currentPosition.x - 1][currentPosition.y].isClear ? 'Level1' : 'Level1_1';
    this.scene.start(levelToGo, {
        score: score, configScoreText: configScoreText, playerStats: playerStats, scenario: scenario,
        currentPosition: scenario[currentPosition.x - 1][currentPosition.y], entrance: 'left'
    });
}
function goRight() {
    const levelToGo = scenario[currentPosition.x + 1][currentPosition.y].isClear ? 'Level1' : 'Level1_1';
    this.scene.start(levelToGo, {
        score: score, configScoreText: configScoreText, playerStats: playerStats, scenario: scenario,
        currentPosition: scenario[currentPosition.x + 1][currentPosition.y], entrance: 'right'
    });
}

function createDoors(context) {
    if (currentPosition.top) {
        if (currentPosition.isClear) {
            topleftdooropen = context.physics.add.sprite(window.innerWidth / 2 - 32, 32, 'leftdooropen');
            toprightdooropen = context.physics.add.sprite(window.innerWidth / 2 + 32, 32, 'rightdooropen');
        } else {
            topleftdoor = context.physics.add.sprite(window.innerWidth / 2 - 32, 32, 'leftdoor');
            toprightdoor = context.physics.add.sprite(window.innerWidth / 2 + 32, 32, 'rightdoor');
        }
        topleftdoorframe = context.physics.add.sprite(window.innerWidth / 2 - 32, 32, 'leftdoorframe');
        toprightdoorframe = context.physics.add.sprite(window.innerWidth / 2 + 32, 32, 'rightdoorframe');
    }
    if (currentPosition.left) {
        if (currentPosition.isClear) {
            leftrightdooropen = context.physics.add.sprite(32, window.innerHeight / 2 - 32, 'rightdooropen');
            leftrightdooropen.angle = 270;
            leftleftdooropen = context.physics.add.sprite(32, window.innerHeight / 2 + 32, 'leftdooropen');
            leftleftdooropen.angle = 270;
        } else {
            leftrightdoor = context.physics.add.sprite(32, window.innerHeight / 2 - 32, 'rightdoor');
            leftrightdoor.angle = 270;
            leftleftdoor = context.physics.add.sprite(32, window.innerHeight / 2 + 32, 'leftdoor');
            leftleftdoor.angle = 270;
        }
        leftleftdoorframe = context.physics.add.sprite(32, window.innerHeight / 2 + 32, 'leftdoorframe');
        leftleftdoorframe.angle = 270;
        leftrightdoorframe = context.physics.add.sprite(32, window.innerHeight / 2 - 32, 'rightdoorframe');
        leftrightdoorframe.angle = 270;
    }
    if (currentPosition.right) {
        if (currentPosition.isClear) {
            rightleftdooropen = context.physics.add.sprite(window.innerWidth - 32, window.innerHeight / 2 - 32, 'leftdooropen');
            rightleftdooropen.angle = 90;
            rightrightdooropen = context.physics.add.sprite(window.innerWidth - 32, window.innerHeight / 2 + 32, 'rightdooropen');
            rightrightdooropen.angle = 90;
        } else {
            rightleftdoor = context.physics.add.sprite(window.innerWidth - 32, window.innerHeight / 2 - 32, 'leftdoor');
            rightleftdoor.angle = 90;
            rightrightdoor = context.physics.add.sprite(window.innerWidth - 32, window.innerHeight / 2 + 32, 'rightdoor');
            rightrightdoor.angle = 90;
        }
        rightleftdoorframe = context.physics.add.sprite(window.innerWidth - 32, window.innerHeight / 2 - 32, 'leftdoorframe');
        rightleftdoorframe.angle = 90;
        rightrightdoorframe = context.physics.add.sprite(window.innerWidth - 32, window.innerHeight / 2 + 32, 'rightdoorframe');
        rightrightdoorframe.angle = 90;
    }
    if (currentPosition.bottom) {
        if (currentPosition.isClear) {
            botleftdooropen = context.physics.add.sprite(window.innerWidth / 2 + 32, window.innerHeight - 38, 'leftdooropen');
            botleftdooropen.angle = 180;
            botrightdooropen = context.physics.add.sprite(window.innerWidth / 2 - 32, window.innerHeight - 38, 'rightdooropen');
            botrightdooropen.angle = 180;
        } else {
            botleftdoor = context.physics.add.sprite(window.innerWidth / 2 + 32, window.innerHeight - 38, 'leftdoor');
            botleftdoor.angle = 180;
            botrightdoor = context.physics.add.sprite(window.innerWidth / 2 - 32, window.innerHeight - 38, 'rightdoor');
            botrightdoor.angle = 180;
        }
        botleftdoorframe = context.physics.add.sprite(window.innerWidth / 2 + 32, window.innerHeight - 38, 'leftdoorframe');
        botleftdoorframe.angle = 180;
        botrightdoorframe = context.physics.add.sprite(window.innerWidth / 2 - 32, window.innerHeight - 38, 'rightdoorframe');
        botrightdoorframe.angle = 180;
    }
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
    drawKeys( this, playerStats.KEYCODES );
}

function drawKeys( context, nKeys ) {
    for( let i = 0; i < nKeys; i++ ) {
        let currentKey = context.physics.add.sprite(window.innerWidth / 4 + (i * 64), window.innerHeight - 32, 'keycard');
        currentKey.setScale(0.1);
    }
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
        entrance = data.entrance;
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
        createDoors(this);

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

        /* LASERS */
        lasers = this.physics.add.group({
            classType: Laser
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

        if ( currentPosition.isKey && currentPosition.isClear && !currentPosition.keyIsTaken ) {
            spawnKey(this);
        }

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

        drawKeys(this, playerStats.KEYCODES);
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
