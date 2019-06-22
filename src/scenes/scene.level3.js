import Laser from '../GameObjects/laser.js';

var cursors;                    // Set keys to be pressed
var player;                     // Player game object
var lastFired = 0;              // Time instant when last shot was fired
var lasers;                     // Pool of bullets shot by the player

const STANDARD_WIDTH = 1536;

const STANDARD_HEIGHT = 720;
var scaleFactor;

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
var mapGraphics;
var doorGraphics;

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

// AUDIO
var keyFX;
var pickKeyFX;
var shootFX;

function initializeText() {
    scoreText.setText('SCORE: ' + score).setX(64 * scaleFactor).setY(16 * scaleFactor).setFontSize(30 * scaleFactor);
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
    botleftdooropen.destroy();
    botrightdooropen.destroy();
    var levelToGo;
    if (currentPosition.whereIsBoss === 'bot') {
        levelToGo = 'level3_B';
    } else {
        if (scenario[currentPosition.x][currentPosition.y + 1].isClear) {
            levelToGo = 'Level3';
        } else {
            levelToGo = Math.random() > 0.5 ? 'Level3_1' : 'Level3_2';
        }
    }
    this.scene.start(levelToGo, {
        score: score, configScoreText: configScoreText, playerStats: playerStats, scenario: scenario,
        currentPosition: scenario[currentPosition.x][currentPosition.y + 1], entrance: 'down'
    });
}
function goUp() {
    topleftdooropen.destroy();
    toprightdooropen.destroy();
    var levelToGo;
    if (currentPosition.whereIsBoss === 'top') {
        levelToGo = 'level3_B';
    } else {
        if (scenario[currentPosition.x][currentPosition.y - 1].isClear) {
            levelToGo = 'Level3';
        } else {
            levelToGo = Math.random() > 0.5 ? 'Level3_1' : 'Level3_2';
        }
    }
    this.scene.start(levelToGo, {
        score: score, configScoreText: configScoreText, playerStats: playerStats, scenario: scenario,
        currentPosition: scenario[currentPosition.x][currentPosition.y - 1], entrance: 'up'
    });
}
function goLeft() {
    leftleftdooropen.destroy();
    leftrightdooropen.destroy();
    var levelToGo;
    if (currentPosition.whereIsBoss === 'left') {
        levelToGo = 'level3_B';
    } else {
        if (scenario[currentPosition.x - 1][currentPosition.y].isClear) {
            levelToGo = 'Level3';
        } else {
            levelToGo = Math.random() > 0.5 ? 'Level3_1' : 'Level3_2';
            // levelToGo = 'Level3_2';
        }
    }
    this.scene.start(levelToGo, {
        score: score, configScoreText: configScoreText, playerStats: playerStats, scenario: scenario,
        currentPosition: scenario[currentPosition.x - 1][currentPosition.y], entrance: 'left'
    });
}
function goRight() {
    rightleftdooropen.destroy();
    rightrightdooropen.destroy();
    var levelToGo;
    if (currentPosition.whereIsBoss === 'left') {
        levelToGo = 'level3_B';
    } else {
        if (scenario[currentPosition.x + 1][currentPosition.y].isClear) {
            levelToGo = 'Level3';
        } else {
            levelToGo = Math.random() > 0.5 ? 'Level3_1' : 'Level3_2';
        }
    }
    this.scene.start(levelToGo, {
        score: score, configScoreText: configScoreText, playerStats: playerStats, scenario: scenario,
        currentPosition: scenario[currentPosition.x + 1][currentPosition.y], entrance: 'right'
    });
}

function drawMap(context) {
    mapGraphics = context.add.graphics({ lineStyle: { width: 2, color: 0x0000aa } });
    doorGraphics = context.add.graphics({ lineStyle: { width: 8, color: 0xffc260 } });
    var rect = new Phaser.Geom.Rectangle(25, 25, 50, 50);
    for (var i = 0; i < scenario.length; i++) {
        for (var j = 0; j < scenario[0].length; j++) {
            if (scenario[i][j].isClear) { mapGraphics.lineStyle(5, 0xCCFCFF, 1.0); } else {
                mapGraphics.lineStyle(5, 0x0000aa, 1.0);
            }
            if (scenario[i][j].isKey && !scenario[i][j].keyIsTaken) {
                mapGraphics.lineStyle(5, 0x00ff00, 1.0);
            }
            if (scenario[i][j].isBoss) {
                mapGraphics.lineStyle(5, 0xffff00, 1.0);
            }
            if (i === currentPosition.x && j === currentPosition.y) {
                mapGraphics.lineStyle(5, 0xff0000, 1.0);
            }
            if (scenario[i][j].visited) {
                rect.setTo((i + 1) * 60, (j + 1) * 60, 50, 50);
                mapGraphics.strokeRectShape(rect);
                drawDoors(context, scenario[i][j]);
            }
        }
    }
}

function drawDoors(context, node) {
    if (node.top) {
        const topDoor = new Phaser.Geom.Line((node.x * 60) + 80, (node.y * 60) + 60, (node.x * 60) + 90, (node.y * 60) + 60);
        doorGraphics.strokeLineShape(topDoor);
    }
    if (node.bottom) {
        const botDoor = new Phaser.Geom.Line((node.x * 60) + 80, (node.y * 60) + 110, (node.x * 60) + 90, (node.y * 60) + 110);
        doorGraphics.strokeLineShape(botDoor);
    }
    if (node.left) {
        const leftDoor = new Phaser.Geom.Line((node.x * 60) + 60, (node.y * 60) + 80, (node.x * 60) + 60, (node.y * 60) + 90);
        doorGraphics.strokeLineShape(leftDoor);
    }
    if (node.right) {
        const rightDoor = new Phaser.Geom.Line((node.x * 60) + 110, (node.y * 60) + 80, (node.x * 60) + 110, (node.y * 60) + 90);
        doorGraphics.strokeLineShape(rightDoor);
    }

}

function createDoors(context) {
    console.log("whereIsBoss: " + currentPosition.whereIsBoss);
    if (currentPosition.top) {
        if (currentPosition.isClear) {
            if (currentPosition.whereIsBoss === "top") {
                if (playerStats.KEYCODES === 3) {
                    topleftdooropen = context.physics.add.sprite(window.innerWidth / 2 - 32 * scaleFactor, 32 * scaleFactor, 'leftdooropen');
                    topleftdooropen.setScale(scaleFactor);
                    toprightdooropen = context.physics.add.sprite(window.innerWidth / 2 + 32 * scaleFactor, 32 * scaleFactor, 'rightdooropen');
                    toprightdooropen.setScale(scaleFactor);
                }
            } else {
                topleftdooropen = context.physics.add.sprite(window.innerWidth / 2 - 32 * scaleFactor, 32 * scaleFactor, 'leftdooropen');
                topleftdooropen.setScale(scaleFactor);
                toprightdooropen = context.physics.add.sprite(window.innerWidth / 2 + 32 * scaleFactor, 32 * scaleFactor, 'rightdooropen');
                toprightdooropen.setScale(scaleFactor);
            }
        } else {
            topleftdoor = context.physics.add.sprite(window.innerWidth / 2 - 32 * scaleFactor, 32 * scaleFactor, 'leftdoor');
            topleftdoor.setScale(scaleFactor);
            toprightdoor = context.physics.add.sprite(window.innerWidth / 2 + 32 * scaleFactor, 32 * scaleFactor, 'rightdoor');
            toprightdoor.setScale(scaleFactor);
        }
        topleftdoorframe = context.physics.add.sprite(window.innerWidth / 2 - 32 * scaleFactor, 32 * scaleFactor, 'leftdoorframe');
        topleftdoorframe.setScale(scaleFactor);
        toprightdoorframe = context.physics.add.sprite(window.innerWidth / 2 + 32 * scaleFactor, 32 * scaleFactor, 'rightdoorframe');
        toprightdoorframe.setScale(scaleFactor);
    }
    if (currentPosition.left) {
        if (currentPosition.isClear) {
            if (currentPosition.whereIsBoss === "left") {
                if (playerStats.KEYCODES === 3) {
                    leftrightdooropen = context.physics.add.sprite(32 * scaleFactor, window.innerHeight / 2 - 32 * scaleFactor, 'rightdooropen');
                    leftrightdooropen.angle = 270;
                    leftrightdooropen.setScale(scaleFactor);
                    leftleftdooropen = context.physics.add.sprite(32 * scaleFactor, window.innerHeight / 2 + 32 * scaleFactor, 'leftdooropen');
                    leftleftdooropen.angle = 270;
                    leftleftdooropen.setScale(scaleFactor);

                }
            } else {
                leftrightdooropen = context.physics.add.sprite(32 * scaleFactor, window.innerHeight / 2 - 32 * scaleFactor, 'rightdooropen');
                leftrightdooropen.angle = 270;
                leftrightdooropen.setScale(scaleFactor);
                leftleftdooropen = context.physics.add.sprite(32 * scaleFactor, window.innerHeight / 2 + 32 * scaleFactor, 'leftdooropen');
                leftleftdooropen.angle = 270;
                leftleftdooropen.setScale(scaleFactor);
            }
        } else {
            leftrightdoor = context.physics.add.sprite(32 * scaleFactor, window.innerHeight / 2 - 32 * scaleFactor, 'rightdoor');
            leftrightdoor.angle = 270;
            leftrightdoor.setScale(scaleFactor);
            leftleftdoor = context.physics.add.sprite(32 * scaleFactor, window.innerHeight / 2 + 32 * scaleFactor, 'leftdoor');
            leftleftdoor.angle = 270;
            leftleftdoor.setScale(scaleFactor);
        }
        leftleftdoorframe = context.physics.add.sprite(32 * scaleFactor, window.innerHeight / 2 + 32 * scaleFactor, 'leftdoorframe');
        leftleftdoorframe.angle = 270;
        leftleftdoorframe.setScale(scaleFactor);
        leftrightdoorframe = context.physics.add.sprite(32 * scaleFactor, window.innerHeight / 2 - 32 * scaleFactor, 'rightdoorframe');
        leftrightdoorframe.angle = 270;
        leftrightdoorframe.setScale(scaleFactor);
    }
    if (currentPosition.right) {
        if (currentPosition.isClear) {
            if (currentPosition.whereIsBoss === "right") {
                if (playerStats.KEYCODES === 3) {
                    rightleftdooropen = context.physics.add.sprite(window.innerWidth - 32 * scaleFactor, window.innerHeight / 2 - 32 * scaleFactor, 'leftdooropen');
                    rightleftdooropen.angle = 90;
                    rightleftdooropen.setScale(scaleFactor);
                    rightrightdooropen = context.physics.add.sprite(window.innerWidth - 32 * scaleFactor, window.innerHeight / 2 + 32 * scaleFactor, 'rightdooropen');
                    rightrightdooropen.angle = 90;
                    rightrightdooropen.setScale(scaleFactor);
                }
            } else {
                rightleftdooropen = context.physics.add.sprite(window.innerWidth - 32 * scaleFactor, window.innerHeight / 2 - 32 * scaleFactor, 'leftdooropen');
                rightleftdooropen.angle = 90;
                rightleftdooropen.setScale(scaleFactor);
                rightrightdooropen = context.physics.add.sprite(window.innerWidth - 32 * scaleFactor, window.innerHeight / 2 + 32 * scaleFactor, 'rightdooropen');
                rightrightdooropen.angle = 90;
                rightrightdooropen.setScale(scaleFactor);
            }
        } else {
            rightleftdoor = context.physics.add.sprite(window.innerWidth - 32 * scaleFactor, window.innerHeight / 2 - 32 * scaleFactor, 'leftdoor');
            rightleftdoor.angle = 90;
            rightleftdoor.setScale(scaleFactor);
            rightrightdoor = context.physics.add.sprite(window.innerWidth - 32 * scaleFactor, window.innerHeight / 2 + 32 * scaleFactor, 'rightdoor');
            rightrightdoor.angle = 90;
            rightrightdoor.setScale(scaleFactor);
        }
        rightleftdoorframe = context.physics.add.sprite(window.innerWidth - 32 * scaleFactor, window.innerHeight / 2 - 32 * scaleFactor, 'leftdoorframe');
        rightleftdoorframe.angle = 90;
        rightleftdoorframe.setScale(scaleFactor);
        rightrightdoorframe = context.physics.add.sprite(window.innerWidth - 32 * scaleFactor, window.innerHeight / 2 + 32 * scaleFactor, 'rightdoorframe');
        rightrightdoorframe.angle = 90;
        rightrightdoorframe.setScale(scaleFactor);
    }
    if (currentPosition.bottom) {
        if (currentPosition.isClear) {
            if (currentPosition.whereIsBoss === "bot") {
                if (playerStats.KEYCODES === 3) {
                    botleftdooropen = context.physics.add.sprite(window.innerWidth / 2 + 32 * scaleFactor, window.innerHeight - 38 * scaleFactor, 'leftdooropen');
                    botleftdooropen.angle = 180;
                    botleftdooropen.setScale(scaleFactor);
                    botrightdooropen = context.physics.add.sprite(window.innerWidth / 2 - 32 * scaleFactor, window.innerHeight - 38 * scaleFactor, 'rightdooropen');
                    botrightdooropen.angle = 180;
                    botrightdooropen.setScale(scaleFactor);
                }
            } else {
                botleftdooropen = context.physics.add.sprite(window.innerWidth / 2 + 32 * scaleFactor, window.innerHeight - 38 * scaleFactor, 'leftdooropen');
                botleftdooropen.angle = 180;
                botleftdooropen.setScale(scaleFactor);
                botrightdooropen = context.physics.add.sprite(window.innerWidth / 2 - 32 * scaleFactor, window.innerHeight - 38 * scaleFactor, 'rightdooropen');
                botrightdooropen.angle = 180;
                botrightdooropen.setScale(scaleFactor);
            }
        } else {
            botleftdoor = context.physics.add.sprite(window.innerWidth / 2 + 32 * scaleFactor, window.innerHeight - 38 * scaleFactor, 'leftdoor');
            botleftdoor.angle = 180;
            botleftdoor.setScale(scaleFactor);
            botrightdoor = context.physics.add.sprite(window.innerWidth / 2 - 32 * scaleFactor, window.innerHeight - 38 * scaleFactor, 'rightdoor');
            botrightdoor.angle = 180;
            botrightdoor.setScale(scaleFactor);
        }
        botleftdoorframe = context.physics.add.sprite(window.innerWidth / 2 + 32 * scaleFactor, window.innerHeight - 38 * scaleFactor, 'leftdoorframe');
        botleftdoorframe.angle = 180;
        botleftdoorframe.setScale(scaleFactor);
        botrightdoorframe = context.physics.add.sprite(window.innerWidth / 2 - 32 * scaleFactor, window.innerHeight - 38 * scaleFactor, 'rightdoorframe');
        botrightdoorframe.angle = 180;
        botrightdoorframe.setScale(scaleFactor);
    }
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
    drawKeys(this, playerStats.KEYCODES);
    if (playerStats.KEYCODES === 3 && currentPosition.whereIsBoss !== "") { createDoors(this); }
}

function drawKeys(context, nKeys) {
    for (let i = 0; i < nKeys; i++) {
        let currentKey = context.physics.add.sprite(32 * scaleFactor, (96 + (i * 48)) * scaleFactor, 'keycard');
        currentKey.setScale(0.1 * scaleFactor);
    }
}

class Level3 extends Phaser.Scene {
    constructor() {
        super({ key: "Level3" });
    }
    init(data) {
        score = data.score;
        configScoreText = data.configScoreText;
        playerStats = data.playerStats;
        scenario = data.scenario;
        currentPosition = data.currentPosition;
        entrance = data.entrance;

        let scaleHeight = window.innerHeight / STANDARD_HEIGHT;
        let scaleWidth = window.innerWidth / STANDARD_WIDTH;
        // scaleFactor = Math.min(scaleHeight, scaleWidth);
        scaleFactor = (scaleHeight + scaleWidth)/2;
    }
    create() {
        window.onresize = () => this.scene.restart();
        shootFX = this.sound.add('laser');
        keyFX = this.sound.add('dropkey');
        pickKeyFX = this.sound.add('pickkey');
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
        floor = this.add.tileSprite(0, 0, window.innerWidth * 2, window.innerWidth * 2, 'floor' + playerStats.LEVEL);

        // WALLS
        topwall = this.add.tileSprite(0, 0, window.innerWidth * 2, 128 * scaleFactor, 'topbot' + playerStats.LEVEL);
        botwall = this.add.tileSprite(0, window.innerHeight - 5, window.innerWidth * 2, 128 * scaleFactor, 'topbot' + playerStats.LEVEL);
        leftwall = this.add.tileSprite(0, 0, 128 * scaleFactor, window.innerHeight * 2, 'leftright' + playerStats.LEVEL);
        rightwall = this.add.tileSprite(window.innerWidth, 0, 128 * scaleFactor, window.innerHeight * 2, 'leftright' + playerStats.LEVEL);

        // CORNERS
        topleft = this.physics.add.sprite(0, 0, 'topleft' + playerStats.LEVEL);
        topleft.setScale(2 * scaleFactor);
        topright = this.physics.add.sprite(window.innerWidth, 0, 'topright' + playerStats.LEVEL);
        topright.setScale(2 * scaleFactor);
        botleft = this.physics.add.sprite(0, window.innerHeight - 5, 'botleft' + playerStats.LEVEL);
        botleft.setScale(2 * scaleFactor);
        botright = this.physics.add.sprite(window.innerWidth, window.innerHeight - 5, 'botright' + playerStats.LEVEL);
        botright.setScale(2 * scaleFactor);

        bumps = this.physics.add.group();
        this.scenarioDistribution = this.cache.json.get('distribution');
        if (currentPosition.distribution != 0) {
            this.scenarioDistribution[currentPosition.distribution].forEach(element => {
                let newProp = this.physics.add.sprite(element.x * window.innerWidth, element.y * window.innerHeight, element.type);
                this.physics.world.enable(newProp);
                newProp.setOrigin(0.5, 1);
                newProp.setScale(1.5 * scaleFactor);
                bumps.add(newProp);
            });
        }

        // DOORS
        createDoors(this);

        /* ### PLAYER ### */
        if (entrance === 'center') { player = this.physics.add.sprite(window.innerWidth / 2, window.innerHeight / 2, 'player'); }
        if (entrance === 'down') { player = this.physics.add.sprite(window.innerWidth / 2, 192 * scaleFactor, 'player'); }
        if (entrance === 'up') { player = this.physics.add.sprite(window.innerWidth / 2, window.innerHeight - 192 * scaleFactor, 'player'); }
        if (entrance === 'left') { player = this.physics.add.sprite(window.innerWidth - 192 * scaleFactor, window.innerHeight / 2, 'player'); }
        if (entrance === 'right') { player = this.physics.add.sprite(192 * scaleFactor, window.innerHeight / 2, 'player'); }
        
        player.setScale(0.3 * scaleFactor);
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
        armorIcon = this.physics.add.sprite(96 * scaleFactor, (window.innerHeight - 36 * scaleFactor), 'armorIcon');
        armorIcon.displayWidth = 36 * scaleFactor;
        armorIcon.displayHeight = 36 * scaleFactor;
        armorBarBg = this.add.rectangle(120 * scaleFactor, (window.innerHeight - 36 * scaleFactor), playerStats.MAX_ARMOR * 2 * scaleFactor, 36 * scaleFactor, '0x000000');
        armorBarBg.setOrigin(0, 0.5);
        armorBarBg.alpha = 0.4;
        armorBar = this.add.rectangle(120 * scaleFactor, (window.innerHeight - 36 * scaleFactor), playerStats.ARMOR * 2 * scaleFactor, 36 * scaleFactor, '0xffffff');
        armorBar.setOrigin(0, 0.5);

        healthIcon = this.physics.add.sprite(window.innerWidth - 96 * scaleFactor, (window.innerHeight - 36 * scaleFactor), 'healthIcon');
        healthIcon.displayWidth = 36 * scaleFactor;
        healthIcon.displayHeight = 36 * scaleFactor;
        healthBarBg = this.add.rectangle(window.innerWidth - 120 * scaleFactor, (window.innerHeight - 36 * scaleFactor), playerStats.MAX_HEALTH * 2 * scaleFactor, 36 * scaleFactor, '0x000000');
        healthBarBg.setOrigin(1, 0.5);
        healthBarBg.alpha = 0.4;
        healthBar = this.add.rectangle(window.innerWidth - 120 * scaleFactor, (window.innerHeight - 36 * scaleFactor), playerStats.HEALTH * 2 * scaleFactor, 36 * scaleFactor, '0xffffff');
        healthBar.setOrigin(1, 0.5);

        if (currentPosition.isKey && currentPosition.isClear && !currentPosition.keyIsTaken) {
            spawnKey(this);
            keyFX.play()
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
        this.physics.add.overlap(bumps, lasers, (bump, laser) => {
            lasers.remove(laser);
            laser.destroy();
        }, null, this);
        this.physics.add.collider(bumps, player);
        bumps.children.iterate((bump) => {
            bump.body.immovable = true;
            bump.moves = false;
        });

        drawKeys(this, playerStats.KEYCODES);

        drawMap(this);
        doorGraphics.setVisible(false);
        mapGraphics.setVisible(false);
    }

    update(time, delta) {
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
        if (cursors.map.isDown) {
            doorGraphics.setVisible(true);
            mapGraphics.setVisible(true);
        }
        if (cursors.map.isUp) {
            if (doorGraphics.visible && mapGraphics.visible) {
                doorGraphics.setVisible(false);
                mapGraphics.setVisible(false);
            }
        }

        if (player.x < 64  * scaleFactor) { player.x = 64 * scaleFactor; }
        if (player.y < 64 * scaleFactor) { player.y = 64 * scaleFactor; }
        if (player.x > window.innerWidth - 64 * scaleFactor) { player.x = window.innerWidth - 70 * scaleFactor; }
        if (player.y > window.innerHeight - 64 * scaleFactor) { player.y = window.innerHeight - 70 * scaleFactor; }

        lasers.children.iterate((laser) => {
            if (laser) { laser.move(delta) } else { lasers.remove(laser); }
        })
    }
}

export default Level3;
