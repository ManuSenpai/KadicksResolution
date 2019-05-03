const POWER_UP_RATE = 0.3; //0.1;

const MEDIKIT_RATE = 0.7;
const PU_ATTK_RATE = 0.8;
const PU_RTHM_RATE = 0.9;
const LIFEUP_RATE = 0.99;

const MEDIKIT_VALUE = 50;
const PUATTK_VALUE = 5;
const PURTHM_VALUE = -15; // -15;
const LIFE_UP_VALUE = 10;

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

    powerups;

    constructor(key) {
        super({ key: key });
    }

    setData(scenario, score, configScoreText, playerStats, currentPosition, entrance, player) {
        this.scenario = scenario;
        this.score = score;
        this.configScoreText = configScoreText;
        this.playerStats = playerStats;
        this.currentPosition = currentPosition;
        this.entrance = entrance;
        this.player = player;
    }

    setPlayerStats( _playerStats) {
        this.playerStats = _playerStats;
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
            let currentKey = this.physics.add.sprite(window.innerWidth / 4 + (i * 64), window.innerHeight - 32, 'keycard');
            currentKey.setScale(0.1);
        }
    }

    drawScenario(context) {
        // FLOOR
        this.floor = context.add.tileSprite(0, 0, window.innerWidth * 2, window.innerWidth * 2, 'floor' + this.playerStats.LEVEL);

        // WALLS
        this.topwall = context.add.tileSprite(0, 0, window.innerWidth * 2, 128, 'topbot' + this.playerStats.LEVEL);
        this.botwall = context.add.tileSprite(0, window.innerHeight - 5, window.innerWidth * 2, 128, 'topbot' + this.playerStats.LEVEL);
        this.leftwall = context.add.tileSprite(0, 0, 128, window.innerHeight * 2, 'leftright' + this.playerStats.LEVEL);
        this.rightwall = context.add.tileSprite(window.innerWidth, 0, 128, window.innerHeight * 2, 'leftright' + this.playerStats.LEVEL);

        // CORNERS
        this.topleft = context.physics.add.sprite(0, 0, 'topleft' + this.playerStats.LEVEL);
        this.topleft.setScale(2);
        this.topright = context.physics.add.sprite(window.innerWidth, 0, 'topright' + this.playerStats.LEVEL);
        this.topright.setScale(2);
        this.botleft = context.physics.add.sprite(0, window.innerHeight - 5, 'botleft' + this.playerStats.LEVEL);
        this.botleft.setScale(2);
        this.botright = context.physics.add.sprite(window.innerWidth, window.innerHeight - 5, 'botright' + this.playerStats.LEVEL);
        this.botright.setScale(2);
    }

    createDoors(context, currentPosition) {
        if (currentPosition.top) {
            if (currentPosition.isClear) {
                if (currentPosition.whereIsBoss === "top") {
                    if (this.playerStats.KEYCODES === 3) {
                        context.topleftdooropen = context.physics.add.sprite(window.innerWidth / 2 - 32, 32, 'leftdooropen');
                        context.toprightdooropen = context.physics.add.sprite(window.innerWidth / 2 + 32, 32, 'rightdooropen');
                    }
                } else {
                    context.topleftdooropen = context.physics.add.sprite(window.innerWidth / 2 - 32, 32, 'leftdooropen');
                    context.toprightdooropen = context.physics.add.sprite(window.innerWidth / 2 + 32, 32, 'rightdooropen');
                }
            } else {
                if (currentPosition.whereIsBoss === "top") {
                    context.topleftdoor = context.physics.add.sprite(window.innerWidth / 2 - 32, 32, 'bossleftdoor');
                    context.toprightdoor = context.physics.add.sprite(window.innerWidth / 2 + 32, 32, 'bossrightdoor');
                } else {
                    context.topleftdoor = context.physics.add.sprite(window.innerWidth / 2 - 32, 32, 'leftdoor');
                    context.toprightdoor = context.physics.add.sprite(window.innerWidth / 2 + 32, 32, 'rightdoor');
                }
            }
            context.topleftdoorframe = context.physics.add.sprite(window.innerWidth / 2 - 32, 32, 'leftdoorframe');
            context.toprightdoorframe = context.physics.add.sprite(window.innerWidth / 2 + 32, 32, 'rightdoorframe');
        }
        if (currentPosition.left) {
            if (currentPosition.isClear) {
                if (currentPosition.whereIsBoss === "left") {
                    if (this.playerStats.KEYCODES === 3) {
                        context.leftrightdooropen = context.physics.add.sprite(32, window.innerHeight / 2 - 32, 'rightdooropen');
                        context.leftrightdooropen.angle = 270;
                        context.leftleftdooropen = context.physics.add.sprite(32, window.innerHeight / 2 + 32, 'leftdooropen');
                        context.leftleftdooropen.angle = 270;
                    }
                } else {
                    context.leftrightdooropen = context.physics.add.sprite(32, window.innerHeight / 2 - 32, 'rightdooropen');
                    context.leftrightdooropen.angle = 270;
                    context.leftleftdooropen = context.physics.add.sprite(32, window.innerHeight / 2 + 32, 'leftdooropen');
                    context.leftleftdooropen.angle = 270;
                }
            } else {
                if (currentPosition.whereIsBoss === "left") {
                    context.leftrightdoor = context.physics.add.sprite(32, window.innerHeight / 2 - 32, 'bossrightdoor');
                    context.leftrightdoor.angle = 270;
                    context.leftleftdoor = context.physics.add.sprite(32, window.innerHeight / 2 + 32, 'bossleftdoor');
                    context.leftleftdoor.angle = 270;
                } else {
                    context.leftrightdoor = context.physics.add.sprite(32, window.innerHeight / 2 - 32, 'rightdoor');
                    context.leftrightdoor.angle = 270;
                    context.leftleftdoor = context.physics.add.sprite(32, window.innerHeight / 2 + 32, 'leftdoor');
                    context.leftleftdoor.angle = 270;
                }
            }
            context.leftleftdoorframe = context.physics.add.sprite(32, window.innerHeight / 2 + 32, 'leftdoorframe');
            context.leftleftdoorframe.angle = 270;
            context.leftrightdoorframe = context.physics.add.sprite(32, window.innerHeight / 2 - 32, 'rightdoorframe');
            context.leftrightdoorframe.angle = 270;
        }
        if (currentPosition.right) {
            if (currentPosition.isClear) {
                if (currentPosition.whereIsBoss === "right") {
                    if (this.playerStats.KEYCODES === 3) {
                        context.rightleftdooropen = context.physics.add.sprite(window.innerWidth - 32, window.innerHeight / 2 - 32, 'leftdooropen');
                        context.rightleftdooropen.angle = 90;
                        context.rightrightdooropen = context.physics.add.sprite(window.innerWidth - 32, window.innerHeight / 2 + 32, 'rightdooropen');
                        context.rightrightdooropen.angle = 90;
                    }
                } else {
                    context.rightleftdooropen = context.physics.add.sprite(window.innerWidth - 32, window.innerHeight / 2 - 32, 'leftdooropen');
                    context.rightleftdooropen.angle = 90;
                    context.rightrightdooropen = context.physics.add.sprite(window.innerWidth - 32, window.innerHeight / 2 + 32, 'rightdooropen');
                    context.rightrightdooropen.angle = 90;
                }
            } else {
                if (currentPosition.whereIsBoss === "right") {
                    context.rightleftdoor = context.physics.add.sprite(window.innerWidth - 32, window.innerHeight / 2 - 32, 'bossleftdoor');
                    context.rightleftdoor.angle = 90;
                    context.rightrightdoor = context.physics.add.sprite(window.innerWidth - 32, window.innerHeight / 2 + 32, 'bossrightdoor');
                    context.rightrightdoor.angle = 90;
                } else {
                    context.rightleftdoor = context.physics.add.sprite(window.innerWidth - 32, window.innerHeight / 2 - 32, 'leftdoor');
                    context.rightleftdoor.angle = 90;
                    context.rightrightdoor = context.physics.add.sprite(window.innerWidth - 32, window.innerHeight / 2 + 32, 'rightdoor');
                    context.rightrightdoor.angle = 90;
                }
            }
            context.rightleftdoorframe = context.physics.add.sprite(window.innerWidth - 32, window.innerHeight / 2 - 32, 'leftdoorframe');
            context.rightleftdoorframe.angle = 90;
            context.rightrightdoorframe = context.physics.add.sprite(window.innerWidth - 32, window.innerHeight / 2 + 32, 'rightdoorframe');
            context.rightrightdoorframe.angle = 90;
        }
        if (currentPosition.bottom) {
            if (currentPosition.isClear) {
                if (currentPosition.whereIsBoss === "bot") {
                    if (this.playerStats.KEYCODES === 3) {
                        context.botleftdooropen = context.physics.add.sprite(window.innerWidth / 2 + 32, window.innerHeight - 38, 'leftdooropen');
                        context.botleftdooropen.angle = 180;
                        context.botrightdooropen = context.physics.add.sprite(window.innerWidth / 2 - 32, window.innerHeight - 38, 'rightdooropen');
                        context.botrightdooropen.angle = 180;
                    }
                } else {
                    context.botleftdooropen = context.physics.add.sprite(window.innerWidth / 2 + 32, window.innerHeight - 38, 'leftdooropen');
                    context.botleftdooropen.angle = 180;
                    context.botrightdooropen = context.physics.add.sprite(window.innerWidth / 2 - 32, window.innerHeight - 38, 'rightdooropen');
                    context.botrightdooropen.angle = 180;
                }
            } else {
                if (currentPosition.whereIsBoss === "bot") {
                    context.botleftdoor = context.physics.add.sprite(window.innerWidth / 2 + 32, window.innerHeight - 38, 'bossleftdoor');
                    context.botleftdoor.angle = 180;
                    context.botrightdoor = context.physics.add.sprite(window.innerWidth / 2 - 32, window.innerHeight - 38, 'bossrightdoor');
                    context.botrightdoor.angle = 180;

                } else {
                    context.botleftdoor = context.physics.add.sprite(window.innerWidth / 2 + 32, window.innerHeight - 38, 'leftdoor');
                    context.botleftdoor.angle = 180;
                    context.botrightdoor = context.physics.add.sprite(window.innerWidth / 2 - 32, window.innerHeight - 38, 'rightdoor');
                    context.botrightdoor.angle = 180;
                }
            }
            context.botleftdoorframe = context.physics.add.sprite(window.innerWidth / 2 + 32, window.innerHeight - 38, 'leftdoorframe');
            context.botleftdoorframe.angle = 180;
            context.botrightdoorframe = context.physics.add.sprite(window.innerWidth / 2 - 32, window.innerHeight - 38, 'rightdoorframe');
            context.botrightdoorframe.angle = 180;
        }

    }

    addDoorColliders(context) {
        context.physics.add.overlap(this.player, context.topleftdooropen, this.goUp, null, context);
        context.physics.add.overlap(this.player, context.toprightdddooropen, this.goUp, null, context);
        context.physics.add.overlap(this.player, context.leftleftdooropen, this.goLeft, null, context);
        context.physics.add.overlap(this.player, context.leftrightdooropen, this.goLeft, null, context);
        context.physics.add.overlap(this.player, context.rightleftdooropen, this.goRight, null, context);
        context.physics.add.overlap(this.player, context.rightrightdooropen, this.goRight, null, context);
        context.physics.add.overlap(this.player, context.botleftdooropen, this.goDown, null, context);
        context.physics.add.overlap(this.player, context.botrightdooropen, this.goDown, null, context);
    }

    goDown() {
        this.botleftdooropen.destroy();
        this.botrightdooropen.destroy();
        var levelToGo;
        if (this.currentPosition.whereIsBoss === 'bot') {
            levelToGo = 'level1_B';
        } else {
            if (this.scenario[this.currentPosition.x][this.currentPosition.y + 1].isClear) {
                levelToGo = 'Level1';
            } else {
                levelToGo = Math.random() > 0.5 ? 'Level1_1' : 'Level1_2';
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
            levelToGo = 'level1_B';
        } else {
            if (this.scenario[this.currentPosition.x][this.currentPosition.y - 1].isClear) {
                levelToGo = 'Level1';
            } else {
                levelToGo = Math.random() > 0.5 ? 'Level1_1' : 'Level1_2';
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
            levelToGo = 'level1_B';
        } else {
            if (this.scenario[this.currentPosition.x - 1][this.currentPosition.y].isClear) {
                levelToGo = 'Level1';
            } else {
                levelToGo = Math.random() > 0.5 ? 'Level1_1' : 'Level1_2';
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
            levelToGo = 'level1_B';
        } else {
            if (this.scenario[this.currentPosition.x + 1][this.currentPosition.y].isClear) {
                levelToGo = 'Level1';
            } else {
                levelToGo = Math.random() > 0.5 ? 'Level1_1' : 'Level1_2';
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
        } else {

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
        this.physics.add.overlap(player, currentMK, this.getMedikit, null, this);
        if (this.powerups && currentMK) { this.powerups.add(currentMK); }
    }

    dropPUAttk(player, x, y) {
        if (!this.powerups) this.powerups = this.physics.add.group();
        let currentAttk = this.physics.add.sprite(x, y, 'powup-attk');
        this.physics.add.overlap(player, currentAttk, this.getPUAttk, null, this);
        if (this.powerups && currentAttk) { this.powerups.add(currentAttk); }
    }

    dropPURthm(player, x, y) {
        if (!this.powerups) this.powerups = this.physics.add.group();
        let currentRthm = this.physics.add.sprite(x, y, 'powup-rthm');
        this.physics.add.overlap(player, currentRthm, this.getPURthm, null, this);
        if (this.powerups && currentRthm) { this.powerups.add(currentRthm); }
    }

    dropLifeUp(player, x, y) {
        if (!this.powerups) this.powerups = this.physics.add.group();
        let currentLifeUp = this.physics.add.sprite(x, y, 'lifeup');
        this.physics.add.overlap(player, currentLifeUp, this.getLifeUp, null, this);
        if (this.powerups && currentLifeUp) { this.powerups.add(currentLifeUp); }
    }

    getLifeUp(player, lifeup) {
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
        this.playerStats.HEALTH += MEDIKIT_VALUE;
        if (this.playerStats.HEALTH > this.playerStats.MAX_HEALTH) { this.playerStats.HEALTH = this.playerStats.MAX_HEALTH; }
        this.powerups.remove(medikit);
        medikit.destroy();
        this.healthBar.width = this.playerStats.HEALTH * 2;
    }

    getPUAttk(player, Attk) {
        this.playerStats.DAMAGE += PUATTK_VALUE;
        this.powerups.remove(Attk);
        Attk.destroy();
    }

    getPURthm(player, Rthm) {
        this.playerStats.FIRE_RATE += PURTHM_VALUE;
        this.powerups.remove(Rthm);
        Rthm.destroy();
    }

    drawPlayerUI() {
        if ( this.armorIcon ) this.armorIcon.destroy();
        this.armorIcon = this.physics.add.sprite(64, (window.innerHeight - 50), 'armorIcon');
        this.armorIcon.displayWidth = 12;
        this.armorIcon.displayHeight = 12;
        if ( this.armorBarBg ) this.armorBarBg.destroy();
        this.armorBarBg = this.add.rectangle(80, (window.innerHeight - 50), this.playerStats.ARMOR * 2, 12, '0x000000');
        this.armorBarBg.setOrigin(0, 0.5);
        this.armorBarBg.alpha = 0.4;
        if ( this.armorBar ) this.armorBar.destroy();
        this.armorBar = this.add.rectangle(80, (window.innerHeight - 50), this.playerStats.MAX_ARMOR * 2, 12, '0xffffff');
        this.armorBar.setOrigin(0, 0.5);
        if ( this.healthIcon ) this.healthIcon.destroy();
        this.healthIcon = this.physics.add.sprite(64, (window.innerHeight - 28), 'healthIcon');
        this.healthIcon.displayWidth = 12;
        this.healthIcon.displayHeight = 12;
        if ( this.healthBarBg ) this.healthBarBg.destroy();
        this.healthBarBg = this.add.rectangle(80, (window.innerHeight - 28), this.playerStats.MAX_HEALTH * 2, 12, '0x000000');
        this.healthBarBg.setOrigin(0, 0.5);
        this.healthBarBg.alpha = 0.4;
        if ( this.healthBar ) this.healthBar.destroy(); 
        this.healthBar = this.add.rectangle(80, (window.innerHeight - 28), this.playerStats.HEALTH * 2, 12, '0xffffff');
        this.healthBar.setOrigin(0, 0.5);
    }

    hitArmor(damage) {
        this.playerStats.ARMOR = (this.playerStats.ARMOR - damage < 0) ? 0 : this.playerStats.ARMOR - damage;
        this.armorBar.width -= damage * 2;
        if (this.armorBar.width < 0) { this.armorBar.width = 0; }
    }

    hitHealth(damage) {
        this.playerStats.HEALTH = (this.playerStats.HEALTH - damage < 0) ? 0 : this.playerStats.HEALTH - damage;
        this.healthBar.width -= damage * 2;
        if (this.healthBar.width < 0) { this.healthBar.width = 0; }
    }

    recoverArmor() {
        if (this.playerStats.ARMOR < this.playerStats.MAX_ARMOR) {
            this.playerStats.ARMOR += this.playerStats.ARMOR_RECOVERY;
            if (this.playerStats.ARMOR > this.playerStats.MAX_ARMOR) {
                this.playerStats.ARMOR = this.playerStats.MAX_ARMOR;
            }
            if (this.armorBar) { this.armorBar.width = this.playerStats.ARMOR * 2; }
        }
    }
}

export default Hostile;