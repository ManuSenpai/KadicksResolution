const POWER_UP_RATE = 0.3; //0.1;

const MEDIKIT_RATE = 0.7;
const PU_ATTK_RATE = 0.8;
const PU_RTHM_RATE = 0.9;
const LIFEUP_RATE = 0.99;

const MEDIKIT_VALUE = 50;
const PUATTK_VALUE = 5;
const PURTHM_VALUE = -15; // -15;
const LIFE_UP_VALUE = 10;

const STANDARD_WIDTH = 1536;

const STANDARD_HEIGHT = 720;
let scaleFactor;
let scaleHeight;
let scaleWidth;

class Hostile extends Phaser.Scene {

    /* MAIN STATS */
    scenario;
    score;
    configScoreText;
    playerStats;
    currentPosition;
    entrance;
    player;
    mapGraphics;
    doorGraphics;

    /* PLAYER UI */
    armorIcon;
    armorBarBg;
    armorBar;
    healthIcon;
    healthBarBg;
    healthBar;

    /* SCENARIO */
    floor;
    topwall;
    botwall;
    leftwall;
    rightwall;
    topleft;
    topright;
    botleft;
    botright;
    bumps;                  // Group of neutral objects that serve as obstacles: Walls, columns, etc.

    scenarioDistribution;   // Represents Scenario Distribution for obstacles.

    powerups;
    powerUpFX;

    constructor(key) {
        super({ key: key });
    }

    setScaleFactor() {
        scaleHeight = window.innerHeight / STANDARD_HEIGHT;
        scaleWidth = window.innerWidth / STANDARD_WIDTH;
        scaleFactor = (scaleHeight + scaleWidth)/2;
        return scaleFactor;
    }

    setData(scenario, score, configScoreText, playerStats, currentPosition, entrance, player) {
        this.scenario = scenario;
        this.score = score;
        this.configScoreText = configScoreText;
        this.playerStats = playerStats;
        this.currentPosition = currentPosition;
        this.entrance = entrance;
        this.player = player;
        this.powerUpFX = player.scene.sound.add('powerup');

    }

    setPlayerStats(_playerStats) {
        this.playerStats = _playerStats;
    }

    setCurrentPosition(_currentPosition) {
        this.currentPosition = _currentPosition;
    }

    setScore(score) {
        this.score = score;
    }

    createCursors(context) {
        var cursorItem = context.input.keyboard.addKeys(
            {
                up: Phaser.Input.Keyboard.KeyCodes.W,
                down: Phaser.Input.Keyboard.KeyCodes.S,
                left: Phaser.Input.Keyboard.KeyCodes.A,
                right: Phaser.Input.Keyboard.KeyCodes.D,
                map: Phaser.Input.Keyboard.KeyCodes.TAB
            });
        return cursorItem;
    }

    drawKeys(nKeys) {
        for (let i = 0; i < nKeys; i++) {
            let currentKey = this.physics.add.sprite(32 * scaleFactor,  (96 + (i * 48)) * scaleFactor, 'keycard');
            currentKey.setScale(0.1 * scaleFactor);
        }
    }

    drawScenario(context) {
        // FLOOR
        this.floor = context.add.tileSprite(0, 0, window.innerWidth * 2, window.innerWidth * 2, 'floor' + this.playerStats.LEVEL);

        // WALLS
        this.topwall = context.add.tileSprite(0, 0, window.innerWidth * 2, 128 * scaleFactor, 'topbot' + this.playerStats.LEVEL);
        this.physics.world.enable(this.topwall);
        // this.topwall.body.immovable = true;
        this.topwall.body.moves = false;
        this.botwall = context.add.tileSprite(0, window.innerHeight - 5, window.innerWidth * 2, 128 * scaleFactor, 'topbot' + this.playerStats.LEVEL);
        this.physics.world.enable(this.botwall);
        // this.botwall.body.immovable = true;
        this.botwall.body.moves = false;
        this.leftwall = context.add.tileSprite(0, 0, 128 * scaleFactor, window.innerHeight * 2, 'leftright' + this.playerStats.LEVEL);
        this.physics.world.enable(this.leftwall);
        // this.leftwall.body.immovable = true;
        this.leftwall.body.moves = false;
        this.rightwall = context.add.tileSprite(window.innerWidth, 0, 128 * scaleFactor, window.innerHeight * 2, 'leftright' + this.playerStats.LEVEL);
        this.physics.world.enable(this.rightwall);
        // this.rightwall.body.immovable = true;
        this.rightwall.body.moves = false;

        // CORNERS
        this.topleft = context.physics.add.sprite(0, 0, 'topleft' + this.playerStats.LEVEL);
        this.topleft.setScale(2 * scaleFactor);
        this.topright = context.physics.add.sprite(window.innerWidth, 0, 'topright' + this.playerStats.LEVEL);
        this.topright.setScale(2 * scaleFactor);
        this.botleft = context.physics.add.sprite(0, window.innerHeight - 5, 'botleft' + this.playerStats.LEVEL);
        this.botleft.setScale(2 * scaleFactor);
        this.botright = context.physics.add.sprite(window.innerWidth, window.innerHeight - 5, 'botright' + this.playerStats.LEVEL);
        this.botright.setScale(2 * scaleFactor);

        if (this.bumps && this.bumps.children && this.bumps.children.length > 0) { this.bumps.clear(); }
        this.bumps = context.physics.add.group();

        this.bumps.add(this.topwall);
        this.bumps.add(this.botwall);
        this.bumps.add(this.leftwall);
        this.bumps.add(this.rightwall);

        /** Scenario Obstacles */
        this.scenarioDistribution = this.cache.json.get('distribution');
        let currentDistribution = Phaser.Math.Between(1, Object.keys(this.scenarioDistribution).length);
        this.currentPosition.distribution = currentDistribution;
        this.scenarioDistribution[currentDistribution].forEach(element => {
            let newProp = context.physics.add.sprite(element.x * window.innerWidth, element.y * window.innerHeight, element.type);
            this.physics.world.enable(newProp);
            newProp.setOrigin(0.5, 1);
            newProp.setScale(1.5 * scaleFactor);
            this.bumps.add(newProp);
        });
    }

    createDoors(context, currentPosition) {
        if (currentPosition.top) {
            if (currentPosition.isClear) {
                if (currentPosition.whereIsBoss === "top") {
                    if (this.playerStats.KEYCODES >= 3) {
                        context.topleftdooropen = context.physics.add.sprite(window.innerWidth / 2 - 32 * scaleFactor, 32 * scaleFactor, 'leftdooropen');
                        context.topleftdooropen.setScale(scaleFactor);
                        context.toprightdooropen = context.physics.add.sprite(window.innerWidth / 2 + 32 * scaleFactor, 32 * scaleFactor, 'rightdooropen');
                        context.toprightdooropen.setScale(scaleFactor);
                    }
                } else {
                    context.topleftdooropen = context.physics.add.sprite(window.innerWidth / 2 - 32 * scaleFactor, 32 * scaleFactor, 'leftdooropen');
                    context.topleftdooropen.setScale(scaleFactor);
                    context.toprightdooropen = context.physics.add.sprite(window.innerWidth / 2 + 32 * scaleFactor, 32 * scaleFactor, 'rightdooropen');
                    context.toprightdooropen.setScale(scaleFactor);
                }
            } else {
                if (currentPosition.whereIsBoss === "top") {
                    context.topleftdoor = context.physics.add.sprite(window.innerWidth / 2 - 32 * scaleFactor, 32 * scaleFactor, 'bossleftdoor');
                    context.topleftdoor.setScale(scaleFactor);
                    context.toprightdoor = context.physics.add.sprite(window.innerWidth / 2 + 32 * scaleFactor, 32 * scaleFactor, 'bossrightdoor');
                    context.toprightdoor.setScale(scaleFactor);
                } else {
                    context.topleftdoor = context.physics.add.sprite(window.innerWidth / 2 - 32 * scaleFactor, 32 * scaleFactor, 'leftdoor');
                    context.topleftdoor.setScale(scaleFactor);
                    context.toprightdoor = context.physics.add.sprite(window.innerWidth / 2 + 32 * scaleFactor, 32 * scaleFactor, 'rightdoor');
                    context.toprightdoor.setScale(scaleFactor);
                }
            }
            context.topleftdoorframe = context.physics.add.sprite(window.innerWidth / 2 - 32 * scaleFactor, 32 * scaleFactor, 'leftdoorframe');
            context.topleftdoorframe.setScale(scaleFactor);
            context.toprightdoorframe = context.physics.add.sprite(window.innerWidth / 2 + 32 * scaleFactor, 32 * scaleFactor, 'rightdoorframe');
            context.toprightdoorframe.setScale(scaleFactor);
        }
        if (currentPosition.left) {
            if (currentPosition.isClear) {
                if (currentPosition.whereIsBoss === "left") {
                    if (this.playerStats.KEYCODES >= 3) {
                        context.leftrightdooropen = context.physics.add.sprite(32 * scaleFactor, window.innerHeight / 2 - 32 * scaleFactor, 'rightdooropen');
                        context.leftrightdooropen.setScale(scaleFactor);
                        context.leftrightdooropen.angle = 270;
                        context.leftleftdooropen = context.physics.add.sprite(32 * scaleFactor, window.innerHeight / 2 + 32 * scaleFactor, 'leftdooropen');
                        context.leftleftdooropen.setScale(scaleFactor);
                        context.leftleftdooropen.angle = 270;
                    }
                } else {
                    context.leftrightdooropen = context.physics.add.sprite(32 * scaleFactor, window.innerHeight / 2 - 32 * scaleFactor, 'rightdooropen');
                    context.leftrightdooropen.setScale(scaleFactor);
                    context.leftrightdooropen.angle = 270;
                    context.leftleftdooropen = context.physics.add.sprite(32 * scaleFactor, window.innerHeight / 2 + 32 * scaleFactor, 'leftdooropen');
                    context.leftleftdooropen.setScale(scaleFactor);
                    context.leftleftdooropen.angle = 270;
                }
            } else {
                if (currentPosition.whereIsBoss === "left") {
                    context.leftrightdoor = context.physics.add.sprite(32 * scaleFactor, window.innerHeight / 2 - 32 * scaleFactor, 'bossrightdoor');
                    context.leftrightdoor.setScale(scaleFactor);
                    context.leftrightdoor.angle = 270;
                    context.leftleftdoor = context.physics.add.sprite(32 * scaleFactor, window.innerHeight / 2 + 32 * scaleFactor, 'bossleftdoor');
                    context.leftleftdoor.setScale(scaleFactor);
                    context.leftleftdoor.angle = 270;
                } else {
                    context.leftrightdoor = context.physics.add.sprite(32 * scaleFactor, window.innerHeight / 2 - 32 * scaleFactor, 'rightdoor');
                    context.leftrightdoor.setScale(scaleFactor);
                    context.leftrightdoor.angle = 270;
                    context.leftleftdoor = context.physics.add.sprite(32 * scaleFactor, window.innerHeight / 2 + 32 * scaleFactor, 'leftdoor');
                    context.leftleftdoor.setScale(scaleFactor);
                    context.leftleftdoor.angle = 270;
                }
            }
            context.leftleftdoorframe = context.physics.add.sprite(32 * scaleFactor, window.innerHeight / 2 + 32 * scaleFactor, 'leftdoorframe');
            context.leftleftdoorframe.setScale(scaleFactor);
            context.leftleftdoorframe.angle = 270;
            context.leftrightdoorframe = context.physics.add.sprite(32 * scaleFactor, window.innerHeight / 2 - 32 * scaleFactor, 'rightdoorframe');
            context.leftrightdoorframe.setScale(scaleFactor);
            context.leftrightdoorframe.angle = 270;
        }
        if (currentPosition.right) {
            if (currentPosition.isClear) {
                if (currentPosition.whereIsBoss === "right") {
                    if (this.playerStats.KEYCODES >= 3) {
                        context.rightleftdooropen = context.physics.add.sprite(window.innerWidth - 32 * scaleFactor, window.innerHeight / 2 - 32 * scaleFactor, 'leftdooropen');
                        context.rightleftdooropen.setScale(scaleFactor);
                        context.rightleftdooropen.angle = 90;
                        context.rightrightdooropen = context.physics.add.sprite(window.innerWidth - 32 * scaleFactor, window.innerHeight / 2 + 32 * scaleFactor, 'rightdooropen');
                        context.rightrightdooropen.setScale(scaleFactor);
                        context.rightrightdooropen.angle = 90;
                    }
                } else {
                    context.rightleftdooropen = context.physics.add.sprite(window.innerWidth - 32 * scaleFactor, window.innerHeight / 2 - 32 * scaleFactor, 'leftdooropen');
                    context.rightleftdooropen.setScale(scaleFactor);
                    context.rightleftdooropen.angle = 90;
                    context.rightrightdooropen = context.physics.add.sprite(window.innerWidth - 32 * scaleFactor, window.innerHeight / 2 + 32 * scaleFactor, 'rightdooropen');
                    context.rightrightdooropen.setScale(scaleFactor);
                    context.rightrightdooropen.angle = 90;
                }
            } else {
                if (currentPosition.whereIsBoss === "right") {
                    context.rightleftdoor = context.physics.add.sprite(window.innerWidth - 32 * scaleFactor, window.innerHeight / 2 - 32 * scaleFactor, 'bossleftdoor');
                    context.rightleftdoor.setScale(scaleFactor);
                    context.rightleftdoor.angle = 90;
                    context.rightrightdoor = context.physics.add.sprite(window.innerWidth - 32 * scaleFactor, window.innerHeight / 2 + 32 * scaleFactor, 'bossrightdoor');
                    context.rightrightdoor.setScale(scaleFactor);
                    context.rightrightdoor.angle = 90;
                } else {
                    context.rightleftdoor = context.physics.add.sprite(window.innerWidth - 32 * scaleFactor, window.innerHeight / 2 - 32 * scaleFactor, 'leftdoor');
                    context.rightleftdoor.setScale(scaleFactor);
                    context.rightleftdoor.angle = 90;
                    context.rightrightdoor = context.physics.add.sprite(window.innerWidth - 32 * scaleFactor, window.innerHeight / 2 + 32 * scaleFactor, 'rightdoor');
                    context.rightrightdoor.setScale(scaleFactor);
                    context.rightrightdoor.angle = 90;
                }
            }
            context.rightleftdoorframe = context.physics.add.sprite(window.innerWidth - 32 * scaleFactor, window.innerHeight / 2 - 32 * scaleFactor, 'leftdoorframe');
            context.rightleftdoorframe.setScale(scaleFactor);
            context.rightleftdoorframe.angle = 90;
            context.rightrightdoorframe = context.physics.add.sprite(window.innerWidth - 32 * scaleFactor, window.innerHeight / 2 + 32 * scaleFactor, 'rightdoorframe');
            context.rightrightdoorframe.setScale(scaleFactor);
            context.rightrightdoorframe.angle = 90;
        }
        if (currentPosition.bottom) {
            if (currentPosition.isClear) {
                if (currentPosition.whereIsBoss === "bot") {
                    if (this.playerStats.KEYCODES >= 3) {
                        context.botleftdooropen = context.physics.add.sprite(window.innerWidth / 2 + 32 * scaleFactor, window.innerHeight - 38 * scaleFactor, 'leftdooropen');
                        context.botleftdooropen.setScale(scaleFactor);
                        context.botleftdooropen.angle = 180;
                        context.botrightdooropen = context.physics.add.sprite(window.innerWidth / 2 - 32 * scaleFactor, window.innerHeight - 38 * scaleFactor, 'rightdooropen');
                        context.botrightdooropen.setScale(scaleFactor);
                        context.botrightdooropen.angle = 180;
                    }
                } else {
                    context.botleftdooropen = context.physics.add.sprite(window.innerWidth / 2 + 32 * scaleFactor, window.innerHeight - 38 * scaleFactor, 'leftdooropen');
                    context.botleftdooropen.setScale(scaleFactor);
                    context.botleftdooropen.angle = 180;
                    context.botrightdooropen = context.physics.add.sprite(window.innerWidth / 2 - 32 * scaleFactor, window.innerHeight - 38 * scaleFactor, 'rightdooropen');
                    context.botrightdooropen.setScale(scaleFactor);
                    context.botrightdooropen.angle = 180;
                }
            } else {
                if (currentPosition.whereIsBoss === "bot") {
                    context.botleftdoor = context.physics.add.sprite(window.innerWidth / 2 + 32 * scaleFactor, window.innerHeight - 38 * scaleFactor, 'bossleftdoor');
                    context.botleftdoor.setScale(scaleFactor);
                    context.botleftdoor.angle = 180;
                    context.botrightdoor = context.physics.add.sprite(window.innerWidth / 2 - 32 * scaleFactor, window.innerHeight - 38 * scaleFactor, 'bossrightdoor');
                    context.botrightdoor.setScale(scaleFactor);
                    context.botrightdoor.angle = 180;

                } else {
                    context.botleftdoor = context.physics.add.sprite(window.innerWidth / 2 + 32 * scaleFactor, window.innerHeight - 38 * scaleFactor, 'leftdoor');
                    context.botleftdoor.setScale(scaleFactor);
                    context.botleftdoor.angle = 180;
                    context.botrightdoor = context.physics.add.sprite(window.innerWidth / 2 - 32 * scaleFactor, window.innerHeight - 38 * scaleFactor, 'rightdoor');
                    context.botrightdoor.setScale(scaleFactor);
                    context.botrightdoor.angle = 180;
                }
            }
            context.botleftdoorframe = context.physics.add.sprite(window.innerWidth / 2 + 32 * scaleFactor, window.innerHeight - 38 * scaleFactor, 'leftdoorframe');
            context.botleftdoorframe.setScale(scaleFactor);
            context.botleftdoorframe.angle = 180;
            context.botrightdoorframe = context.physics.add.sprite(window.innerWidth / 2 - 32 * scaleFactor, window.innerHeight - 38 * scaleFactor, 'rightdoorframe');
            context.botrightdoorframe.setScale(scaleFactor);
            context.botrightdoorframe.angle = 180;
        }

    }

    addDoorColliders(context) {
        if ( this.currentPosition.top && context.topleftdooropen) 
        {
            if ( !context.topleftdooropen.body ) { context.physics.world.enable(context.topleftdooropen); }
            context.topleftdooropen.body.setSize(context.topleftdooropen.width * 1.5, context.topleftdooropen.height * 1.5)
        }
        if ( this.currentPosition.top && context.toprightdooropen) 
        {
            if ( !context.toprightdooropen.body ) { context.physics.world.enable(context.toprightdooropen); }
            context.toprightdooropen.body.setSize(context.toprightdooropen.width* 1.5, context.toprightdooropen.height * 1.5)
        }
        if ( this.currentPosition.left && context.leftleftdooropen) 
        {
            if ( !context.leftleftdooropen.body ) { context.physics.world.enable(context.leftleftdooropen); }
            context.leftleftdooropen.body.setSize(context.leftleftdooropen.width* 1.5, context.leftleftdooropen.height * 1.5)
        }
        if ( this.currentPosition.left && context.leftrightdooropen) 
        {
            if ( !context.leftrightdooropen.body ) { context.physics.world.enable(context.leftrightdooropen); }
            context.leftrightdooropen.body.setSize(context.leftrightdooropen.width* 1.5, context.leftrightdooropen.height * 1.5)
        }
        if ( this.currentPosition.right && context.rightleftdooropen) 
        {
            if ( !context.rightleftdooropen.body ) { context.physics.world.enable(context.rightleftdooropen); }
            context.rightleftdooropen.body.setSize(context.rightleftdooropen.width* 1.5, context.rightleftdooropen.height * 1.5)
        }
        if ( this.currentPosition.right &&  context.rightrightdooropen) 
        {
            if ( !context.rightrightdooropen.body ) { context.physics.world.enable(context.rightrightdooropen); }
            context.rightrightdooropen.body.setSize(context.rightrightdooropen.width* 1.5, context.rightrightdooropen.height * 1.5)
        }
        if ( this.currentPosition.bottom && context.botleftdooropen) 
        {
            if ( !context.botleftdooropen.body ) { context.physics.world.enable(context.botleftdooropen); }
            context.botleftdooropen.body.setSize(context.botleftdooropen.width* 1.5, context.botleftdooropen.height * 1.5)
        }
        if ( this.currentPosition.bottom && context.botrightdooropen) 
        {
            if ( !context.botrightdooropen.body ) { context.physics.world.enable(context.botrightdooropen); }
            context.botrightdooropen.body.setSize(context.botrightdooropen.width* 1.5, context.botrightdooropen.height * 1.5)
        }
        context.physics.add.collider(this.player, context.topleftdooropen, this.goUp, null, context);
        context.physics.add.collider(this.player, context.toprightdooropen, this.goUp, null, context);
        context.physics.add.collider(this.player, context.leftleftdooropen, this.goLeft, null, context);
        context.physics.add.collider(this.player, context.leftrightdooropen, this.goLeft, null, context);
        context.physics.add.collider(this.player, context.rightleftdooropen, this.goRight, null, context);
        context.physics.add.collider(this.player, context.rightrightdooropen, this.goRight, null, context);
        context.physics.add.collider(this.player, context.botleftdooropen, this.goDown, null, context);
        context.physics.add.collider(this.player, context.botrightdooropen, this.goDown, null, context);
    }

    goDown() {
        this.botleftdooropen.destroy();
        this.botrightdooropen.destroy();
        var levelToGo;
        if (this.currentPosition.whereIsBoss === 'bot') {
            levelToGo = 'level' + this.playerStats.LEVEL + '_B';
        } else {
            if (this.scenario[this.currentPosition.x][this.currentPosition.y + 1].isClear) {
                levelToGo = 'Level' + this.playerStats.LEVEL;
            } else {
                levelToGo = Math.random() > 0.5 ? 'Level' + this.playerStats.LEVEL + '_1' : 'Level' + this.playerStats.LEVEL + '_2';
            }
        }
        this.scene.start(levelToGo, {
            score: this.score, configScoreText: this.configScoreText, playerStats: this.playerStats, scenario: this.scenario,
            currentPosition: this.scenario[this.currentPosition.x][this.currentPosition.y + 1], entrance: 'down'
        });
    }

    goToNextLevel() {
        this.scene.start('map_test', {
            score: this.score, configScoreText: this.configScoreText, playerStats: this.playerStats, scenario: this.scenario,
            currentPosition: this.scenario[this.currentPosition.x][this.currentPosition.y], entrance: 'none'
        });
    }
    goUp() {
        this.topleftdooropen.destroy();
        this.toprightdooropen.destroy();
        var levelToGo;
        if (this.currentPosition.whereIsBoss === 'top') {
            levelToGo = 'level' + this.playerStats.LEVEL + '_B';
        } else {
            if (this.scenario[this.currentPosition.x][this.currentPosition.y - 1].isClear) {
                levelToGo = 'Level' + this.playerStats.LEVEL;
            } else {
                levelToGo = Math.random() > 0.5 ? 'Level' + this.playerStats.LEVEL + '_1' : 'Level' + this.playerStats.LEVEL + '_2';
            }
        }
        this.scene.start(levelToGo, {
            score: this.score, configScoreText: this.configScoreText, playerStats: this.playerStats, scenario: this.scenario,
            currentPosition: this.scenario[this.currentPosition.x][this.currentPosition.y - 1], entrance: 'up'
        });
    }
    goLeft() {
        this.leftleftdooropen.destroy();
        this.leftrightdooropen.destroy();
        var levelToGo;
        if (this.currentPosition.whereIsBoss === 'left') {
            levelToGo = 'level' + this.playerStats.LEVEL + '_B';
        } else {
            if (this.scenario[this.currentPosition.x - 1][this.currentPosition.y].isClear) {
                levelToGo = 'Level' + this.playerStats.LEVEL;
            } else {
                levelToGo = Math.random() > 0.5 ? 'Level' + this.playerStats.LEVEL + '_1' : 'Level' + this.playerStats.LEVEL + '_2';
            }
        }
        this.scene.start(levelToGo, {
            score: this.score, configScoreText: this.configScoreText, playerStats: this.playerStats, scenario: this.scenario,
            currentPosition: this.scenario[this.currentPosition.x - 1][this.currentPosition.y], entrance: 'left'
        });
    }
    goRight() {
        this.rightleftdooropen.destroy();
        this.rightrightdooropen.destroy();
        var levelToGo;
        if (this.currentPosition.whereIsBoss === 'right') {
            levelToGo = 'level' + this.playerStats.LEVEL + '_B';
        } else {
            if (this.scenario[this.currentPosition.x + 1][this.currentPosition.y].isClear) {
                levelToGo = 'Level' + this.playerStats.LEVEL;
            } else {
                levelToGo = Math.random() > 0.5 ? 'Level' + this.playerStats.LEVEL + '_1' : 'Level' + this.playerStats.LEVEL + '_2';
            }
        }
        this.scene.start(levelToGo, {
            score: this.score, configScoreText: this.configScoreText, playerStats: this.playerStats, scenario: this.scenario,
            currentPosition: this.scenario[this.currentPosition.x + 1][this.currentPosition.y], entrance: 'right'
        });
    }

    drawMap(context) {
        this.mapGraphics = context.add.graphics({ lineStyle: { width: 2, color: 0x0000aa } });
        this.doorGraphics = context.add.graphics({ lineStyle: { width: 8, color: 0xffc260 } });
        var rect = new Phaser.Geom.Rectangle(25, 25, 50, 50);
        for (var i = 0; i < this.scenario.length; i++) {
            for (var j = 0; j < this.scenario[0].length; j++) {
                if (this.scenario[i][j].isClear) { this.mapGraphics.lineStyle(5, 0xCCFCFF, 1.0); } else {
                    this.mapGraphics.lineStyle(5, 0x0000aa, 1.0);
                }
                if (this.scenario[i][j].isKey && !this.scenario[i][j].keyIsTaken) {
                    this.mapGraphics.lineStyle(5, 0x00ff00, 1.0);
                }
                if (this.scenario[i][j].isBoss) {
                    this.mapGraphics.lineStyle(5, 0xffff00, 1.0);
                }
                if (i === this.currentPosition.x && j === this.currentPosition.y) {
                    this.mapGraphics.lineStyle(5, 0xff0000, 1.0);
                }
                // TODO: MODO FINAL if (this.scenario[i][j].visited && ( i === this.currentPosition.x && j === this.currentPosition.y || this.scenario[i][j].isClear ) ) {
                if (this.scenario[i][j].visited) {
                    rect.setTo((i + 1) * 60, (j + 1) * 60, 50, 50);
                    this.mapGraphics.strokeRectShape(rect);
                    this.drawDoors(context, this.scenario[i][j]);
                }
            }
        }
        this.doorGraphics.setVisible(false);
        this.mapGraphics.setVisible(false);
    }

    drawDoors(context, node) {
        if (node.top) {
            const topDoor = new Phaser.Geom.Line((node.x * 60) + 80, (node.y * 60) + 60, (node.x * 60) + 90, (node.y * 60) + 60);
            this.doorGraphics.strokeLineShape(topDoor);
        }
        if (node.bottom) {
            const botDoor = new Phaser.Geom.Line((node.x * 60) + 80, (node.y * 60) + 110, (node.x * 60) + 90, (node.y * 60) + 110);
            this.doorGraphics.strokeLineShape(botDoor);
        }
        if (node.left) {
            const leftDoor = new Phaser.Geom.Line((node.x * 60) + 60, (node.y * 60) + 80, (node.x * 60) + 60, (node.y * 60) + 90);
            this.doorGraphics.strokeLineShape(leftDoor);
        }
        if (node.right) {
            const rightDoor = new Phaser.Geom.Line((node.x * 60) + 110, (node.y * 60) + 80, (node.x * 60) + 110, (node.y * 60) + 90);
            this.doorGraphics.strokeLineShape(rightDoor);
        }
    }

    showMap() {
        this.doorGraphics.setVisible(true);
        this.mapGraphics.setVisible(true);
    }

    hideMap() {
        if (this.doorGraphics.visible && this.mapGraphics.visible) {
            this.doorGraphics.setVisible(false);
            this.mapGraphics.setVisible(false);
        }
    }

    dropItems(player, x, y) {
        if (!this.powerups || (this.powerups && !this.powerups.children)) {
            this.powerups = this.physics.add.group();
        } 
        if (Math.random() < POWER_UP_RATE) {
            // The enemy drops a powerUp
            let rand = Math.random();
            if (rand < MEDIKIT_RATE) {
                this.dropMediKit(player, x, y);
            } else if (rand > MEDIKIT_RATE && rand <= PU_ATTK_RATE) {
                this.dropPUAttk(player, x, y);
            } else if (rand > PU_ATTK_RATE && rand <= PU_RTHM_RATE) {
                this.dropPURthm(player, x, y);
            } else {
                this.dropLifeUp(player, x, y);
            }
        }
    }

    dropMediKit(player, x, y) {
        if (!this.powerups) this.powerups = this.physics.add.group();
        let currentMK = this.physics.add.sprite(x, y, 'medikit');
        currentMK.setScale(scaleFactor);
        this.physics.add.overlap(player, currentMK, this.getMedikit, null, this);
        if (this.powerups && currentMK) { this.powerups.add(currentMK); }
    }

    dropPUAttk(player, x, y) {
        if (!this.powerups) this.powerups = this.physics.add.group();
        let currentAttk = this.physics.add.sprite(x, y, 'powup-attk');
        currentAttk.setScale(scaleFactor);
        this.physics.add.overlap(player, currentAttk, this.getPUAttk, null, this);
        if (this.powerups && currentAttk) { this.powerups.add(currentAttk); }
    }

    dropPURthm(player, x, y) {
        if (!this.powerups) this.powerups = this.physics.add.group();
        let currentRthm = this.physics.add.sprite(x, y, 'powup-rthm');
        currentRthm.setScale(scaleFactor);
        this.physics.add.overlap(player, currentRthm, this.getPURthm, null, this);
        if (this.powerups && currentRthm) { this.powerups.add(currentRthm); }
    }

    dropLifeUp(player, x, y) {
        if (!this.powerups) this.powerups = this.physics.add.group();
        let currentLifeUp = this.physics.add.sprite(x, y, 'lifeup');
        currentLifeUp.setScale(scaleFactor);
        this.physics.add.overlap(player, currentLifeUp, this.getLifeUp, null, this);
        if (this.powerups && currentLifeUp) { this.powerups.add(currentLifeUp); }
    }

    getLifeUp(player, lifeup) {
        this.powerUpFX.play();
        this.playerStats.MAX_HEALTH += LIFE_UP_VALUE;
        this.playerStats.MAX_ARMOR += LIFE_UP_VALUE;
        this.playerStats.HEALTH = this.playerStats.MAX_HEALTH;
        this.playerStats.ARMOR = this.playerStats.MAX_ARMOR;
        // this.armorBar.width = this.playerStats.MAX_ARMOR * 2;
        // this.healthBar.width = this.playerStats.MAX_HEALTH * 2;
        this.drawPlayerUI();
        this.powerups.remove(lifeup);
        lifeup.destroy();
    }

    getMedikit(player, medikit) {
        this.powerUpFX.play();
        this.playerStats.HEALTH += MEDIKIT_VALUE;
        if (this.playerStats.HEALTH > this.playerStats.MAX_HEALTH) { this.playerStats.HEALTH = this.playerStats.MAX_HEALTH; }
        this.powerups.remove(medikit);
        medikit.destroy();
        this.healthBar.width = this.playerStats.HEALTH * 2 * scaleFactor;
    }

    getPUAttk(player, Attk) {
        this.powerUpFX.play();
        this.playerStats.DAMAGE += PUATTK_VALUE;
        this.powerups.remove(Attk);
        Attk.destroy();
    }

    getPURthm(player, Rthm) {
        this.powerUpFX.play();
        this.playerStats.FIRE_RATE += PURTHM_VALUE;
        this.powerups.remove(Rthm);
        Rthm.destroy();
    }

    drawPlayerUI() {
        if (this.armorIcon) this.armorIcon.destroy();
        this.armorIcon = this.physics.add.sprite(96 * scaleFactor, (window.innerHeight - 36 * scaleFactor), 'armorIcon');
        this.armorIcon.displayWidth = 36 * scaleFactor;
        this.armorIcon.displayHeight = 36 * scaleFactor;
        if (this.armorBarBg) this.armorBarBg.destroy();
        this.armorBarBg = this.add.rectangle(120 * scaleFactor, (window.innerHeight - 36 * scaleFactor), this.playerStats.MAX_ARMOR * 2 * scaleFactor, 36 * scaleFactor, '0x000000');
        this.armorBarBg.setOrigin(0, 0.5);
        this.armorBarBg.alpha = 0.4;
        if (this.armorBar) this.armorBar.destroy();
        this.armorBar = this.add.rectangle(120 * scaleFactor, (window.innerHeight - 36 * scaleFactor), this.playerStats.ARMOR * 2 * scaleFactor, 36 * scaleFactor, '0xffffff');
        this.armorBar.setOrigin(0, 0.5);
        if (this.healthIcon) this.healthIcon.destroy();
        this.healthIcon = this.physics.add.sprite( window.innerWidth - 96 * scaleFactor, (window.innerHeight - 36 * scaleFactor), 'healthIcon');
        this.healthIcon.displayWidth = 36 * scaleFactor;
        this.healthIcon.displayHeight = 36 * scaleFactor;
        if (this.healthBarBg) this.healthBarBg.destroy();
        this.healthBarBg = this.add.rectangle(window.innerWidth - 120 * scaleFactor, (window.innerHeight - 36 * scaleFactor), this.playerStats.MAX_HEALTH * 2 * scaleFactor, 36 * scaleFactor, '0x000000');
        this.healthBarBg.setOrigin(1, 0.5);
        this.healthBarBg.alpha = 0.4;
        if (this.healthBar) this.healthBar.destroy();
        this.healthBar = this.add.rectangle( (window.innerWidth - 120 * scaleFactor) - this.playerStats.MAX_HEALTH * 2 * scaleFactor, (window.innerHeight - 36 * scaleFactor), this.playerStats.HEALTH * 2 * scaleFactor, 36 * scaleFactor, '0xffffff');
        this.healthBar.setOrigin(0, 0.5);
    }

    hitArmor(damage) {
        this.playerStats.ARMOR = (this.playerStats.ARMOR - damage < 0) ? 0 : this.playerStats.ARMOR - damage;
        this.armorBar.width -= damage * 2 * scaleFactor;
        if (this.armorBar.width < 0) { this.armorBar.width = 0; }
    }

    hitHealth(damage) {
        this.playerStats.HEALTH = (this.playerStats.HEALTH - damage < 0) ? 0 : this.playerStats.HEALTH - damage;
        this.healthBar.width -= damage * 2 * scaleFactor;
        if (this.healthBar.width < 0) { this.healthBar.width = 0; }
    }

    recoverArmor() {
        if (this.playerStats.ARMOR < this.playerStats.MAX_ARMOR) {
            this.playerStats.ARMOR += this.playerStats.ARMOR_RECOVERY;
            if (this.playerStats.ARMOR > this.playerStats.MAX_ARMOR) {
                this.playerStats.ARMOR = this.playerStats.MAX_ARMOR;
            }
            if (this.armorBar) { this.armorBar.width = this.playerStats.ARMOR * 2 * scaleFactor; }
        }
    }

    getBumps() {
        return this.bumps;
    }

    /**
    * Avoids an overlap between a bump element and a gameobject.
    * @param {GameObject} agent Agent that is currently overlaping with a game bump 
    * @param {*} bump Bump Element
    */
    untangleFromBumps(agent, bump) {
        agent.body.setVelocityX(0);
        agent.body.setVelocityY(0);
        let b1 = agent.body;
        let b2 = bump.body;

        if ( b2.touching.left ) {
            agent.x -= (Math.abs(b1.right - b2.left) + 20) * scaleFactor;
            b1.stop();
        }

        if ( b2.touching.right ) {
            agent.x += (Math.abs(b1.left - b2.right) + 20) * scaleFactor;
            b1.stop();
        }

        if ( b2.touching.up ) {
            agent.y -= (Math.abs(b1.bottom - b2.top) + 20) * scaleFactor;
            b1.stop();
        }

        if ( b2.touching.down ) {
            agent.y += (Math.abs(b1.top - b2.bottom) + 20) * scaleFactor;
            b1.stop();
        }

        // The level starts with one of the enemies overlapping an object so the touching property has not
        // been updated.
        if ( b2.touching.none ) {
            let deltaXb1 = Math.abs(b1.x - window.innerWidth/2) * scaleFactor;
            let deltaXb2 = Math.abs(b2.x - window.innerWidth/2) * scaleFactor;
            let deltaYb1 = Math.abs(b1.y - window.innerHeight/2) * scaleFactor;
            let deltaYb2 = Math.abs(b2.y - window.innerHeight/2) * scaleFactor;
            if ( deltaXb1 < deltaXb2 ) { 
                if ( agent.x < window.innerWidth / 2 ) agent.x += (Math.abs(b1.right - b2.left) + 20) * scaleFactor;
                else agent.x -= (Math.abs(b1.left - b2.right) + 20) * scaleFactor;
            } else {
                if ( agent.x < window.innerWidth / 2 ) agent.x -= (Math.abs(b1.left - b2.right) + 20) * scaleFactor;
                else agent.x += (Math.abs(b1.right - b2.left) + 20) * scaleFactor;
            }
            if ( deltaYb1 < deltaYb2 ) { 
                if ( agent.y < window.innerHeight/ 2 ) agent.y += (Math.abs(b1.top - b2.bottom) + 20) * scaleFactor;
                else agent.y -= (Math.abs(b1.bottom - b2.top) + 20) * scaleFactor;
            } else {
                if ( agent.y < window.innerHeight/ 2 ) agent.y -= (Math.abs(b1.bottom - b2.top) + 20) * scaleFactor;
                else agent.y += (Math.abs(b1.top - b2.bottom) + 20) * scaleFactor;
            }

            b1.stop();
        }
    }

    collideWithBump(bump, agent){
        agent.body.setVelocity(0, 0);
        bump.body.setVelocity(0,0);
    }
}

export default Hostile;