class Hostile extends Phaser.Scene {

    scenario;
    score;
    configScoreText;
    playerStats;
    currentPosition;
    entrance;
    player;
    mapGraphics;
    doorGraphics;
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

    drawKeys(nKeys) {
        for (let i = 0; i < nKeys; i++) {
            let currentKey = this.physics.add.sprite(window.innerWidth / 4 + (i * 64), window.innerHeight - 32, 'keycard');
            currentKey.setScale(0.1);
        }
    }

    createDoors(context, currentPosition) {
        if (currentPosition.top) {
            if (currentPosition.isClear) {
                context.topleftdooropen = context.physics.add.sprite(window.innerWidth / 2 - 32, 32, 'leftdooropen');
                context.toprightdooropen = context.physics.add.sprite(window.innerWidth / 2 + 32, 32, 'rightdooropen');
            } else {
                context.topleftdoor = context.physics.add.sprite(window.innerWidth / 2 - 32, 32, 'leftdoor');
                context.toprightdoor = context.physics.add.sprite(window.innerWidth / 2 + 32, 32, 'rightdoor');
            }
            context.topleftdoorframe = context.physics.add.sprite(window.innerWidth / 2 - 32, 32, 'leftdoorframe');
            context.toprightdoorframe = context.physics.add.sprite(window.innerWidth / 2 + 32, 32, 'rightdoorframe');
        }
        if (currentPosition.left) {
            if (currentPosition.isClear) {
                context.leftrightdooropen = context.physics.add.sprite(32, window.innerHeight / 2 - 32, 'rightdooropen');
                context.leftrightdooropen.angle = 270;
                context.leftleftdooropen = context.physics.add.sprite(32, window.innerHeight / 2 + 32, 'leftdooropen');
                context.leftleftdooropen.angle = 270;
            } else {
                context.leftrightdoor = context.physics.add.sprite(32, window.innerHeight / 2 - 32, 'rightdoor');
                context.leftrightdoor.angle = 270;
                context.leftleftdoor = context.physics.add.sprite(32, window.innerHeight / 2 + 32, 'leftdoor');
                context.leftleftdoor.angle = 270;
            }
            context.leftleftdoorframe = context.physics.add.sprite(32, window.innerHeight / 2 + 32, 'leftdoorframe');
            context.leftleftdoorframe.angle = 270;
            context.leftrightdoorframe = context.physics.add.sprite(32, window.innerHeight / 2 - 32, 'rightdoorframe');
            context.leftrightdoorframe.angle = 270;
        }
        if (currentPosition.right) {
            if (currentPosition.isClear) {
                context.rightleftdooropen = context.physics.add.sprite(window.innerWidth - 32, window.innerHeight / 2 - 32, 'leftdooropen');
                context.rightleftdooropen.angle = 90;
                context.rightrightdooropen = context.physics.add.sprite(window.innerWidth - 32, window.innerHeight / 2 + 32, 'rightdooropen');
                context.rightrightdooropen.angle = 90;
            } else {
                context.rightleftdoor = context.physics.add.sprite(window.innerWidth - 32, window.innerHeight / 2 - 32, 'leftdoor');
                context.rightleftdoor.angle = 90;
                context.rightrightdoor = context.physics.add.sprite(window.innerWidth - 32, window.innerHeight / 2 + 32, 'rightdoor');
                context.rightrightdoor.angle = 90;
            }
            context.rightleftdoorframe = context.physics.add.sprite(window.innerWidth - 32, window.innerHeight / 2 - 32, 'leftdoorframe');
            context.rightleftdoorframe.angle = 90;
            context.rightrightdoorframe = context.physics.add.sprite(window.innerWidth - 32, window.innerHeight / 2 + 32, 'rightdoorframe');
            context.rightrightdoorframe.angle = 90;
        }
        if (currentPosition.bottom) {
            if (currentPosition.isClear) {
                context.botleftdooropen = context.physics.add.sprite(window.innerWidth / 2 + 32, window.innerHeight - 38, 'leftdooropen');
                context.botleftdooropen.angle = 180;
                context.botrightdooropen = context.physics.add.sprite(window.innerWidth / 2 - 32, window.innerHeight - 38, 'rightdooropen');
                context.botrightdooropen.angle = 180;
            } else {
                context.botleftdoor = context.physics.add.sprite(window.innerWidth / 2 + 32, window.innerHeight - 38, 'leftdoor');
                context.botleftdoor.angle = 180;
                context.botrightdoor = context.physics.add.sprite(window.innerWidth / 2 - 32, window.innerHeight - 38, 'rightdoor');
                context.botrightdoor.angle = 180;
            }
            context.botleftdoorframe = context.physics.add.sprite(window.innerWidth / 2 + 32, window.innerHeight - 38, 'leftdoorframe');
            context.botleftdoorframe.angle = 180;
            context.botrightdoorframe = context.physics.add.sprite(window.innerWidth / 2 - 32, window.innerHeight - 38, 'rightdoorframe');
            context.botrightdoorframe.angle = 180;
        }

        context.physics.add.overlap(this.player, context.topleftdooropen, this.goUp, null, context);
        context.physics.add.overlap(this.player, context.toprightdddooropen, this.goUp, null, context);
        context.physics.add.overlap(this.player, context.leftleftdooropen, this.goLeft, null, context);
        context.physics.add.overlap(this.player, context.leftrightdooropen, this.goLeft, null, context);
        context.physics.add.overlap(this.player, context.rightleftdooropen, this.goRight, null, context);
        context.physics.add.overlap(this.player, context.rightrightdooropen, this.goRight, null, context);
        context.physics.add.overlap(this.player, context.botleftdooropen, this.goDown, null, context);
        context.physics.add.overlap(this.player, context.botrightdooropen, this.goDown, null, context);
    }

    goDown(context) {
        const levelToGo = this.scenario[this.currentPosition.x][this.currentPosition.y + 1].isClear ? 'Level1' : 'Level1_1';
        this.scene.start(levelToGo, {
            score: this.score, configScoreText: this.configScoreText, playerStats: this.playerStats, scenario: this.scenario,
            currentPosition: this.scenario[this.currentPosition.x][this.currentPosition.y + 1], entrance: 'down'
        });
    }
    goUp(context) {
        const levelToGo = this.scenario[this.currentPosition.x][this.currentPosition.y - 1].isClear ? 'Level1' : 'Level1_1';
        this.scene.start(levelToGo, {
            score: this.score, configScoreText: this.configScoreText, playerStats: this.playerStats, scenario: this.scenario,
            currentPosition: this.scenario[this.currentPosition.x][this.currentPosition.y - 1], entrance: 'up'
        });
    }
    goLeft(context) {
        const levelToGo = this.scenario[this.currentPosition.x - 1][this.currentPosition.y].isClear ? 'Level1' : 'Level1_1';
        this.scene.start(levelToGo, {
            score: this.score, configScoreText: this.configScoreText, playerStats: this.playerStats, scenario: this.scenario,
            currentPosition: this.scenario[this.currentPosition.x - 1][this.currentPosition.y], entrance: 'left'
        });
    }
    goRight(context) {
        const levelToGo = this.scenario[this.currentPosition.x + 1][this.currentPosition.y].isClear ? 'Level1' : 'Level1_1';
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
                if (this.scenario[i][j].visited ) {
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