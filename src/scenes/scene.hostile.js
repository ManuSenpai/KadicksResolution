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
        this.floor = context.add.tileSprite(0, 0, window.innerWidth * 2, window.innerWidth * 2, 'floor1');

        // WALLS
        this.topwall = context.add.tileSprite(0, 0, window.innerWidth * 2, 128, 'topbot1');
        this.botwall = context.add.tileSprite(0, window.innerHeight - 5, window.innerWidth * 2, 128, 'topbot1');
        this.leftwall = context.add.tileSprite(0, 0, 128, window.innerHeight * 2, 'leftright1');
        this.rightwall = context.add.tileSprite(window.innerWidth, 0, 128, window.innerHeight * 2, 'leftright1');

        // CORNERS
        this.topleft = context.physics.add.sprite(0, 0, 'topleft1');
        this.topleft.setScale(2);
        this.topright = context.physics.add.sprite(window.innerWidth, 0, 'topright1');
        this.topright.setScale(2);
        this.botleft = context.physics.add.sprite(0, window.innerHeight - 5, 'botleft1');
        this.botleft.setScale(2);
        this.botright = context.physics.add.sprite(window.innerWidth, window.innerHeight - 5, 'botright1');
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

}

export default Hostile;