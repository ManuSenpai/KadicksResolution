class Hostile extends Phaser.Scene {

    createDoors( ) {
        if (currentPosition.top) {
            if (currentPosition.isClear) {
                topleftdooropen = this.physics.add.sprite(window.innerWidth / 2 - 32, 32, 'leftdooropen');
                toprightdooropen = this.physics.add.sprite(window.innerWidth / 2 + 32, 32, 'rightdooropen');
            } else {
                topleftdoor = this.physics.add.sprite(window.innerWidth / 2 - 32, 32, 'leftdoor');
                toprightdoor = this.physics.add.sprite(window.innerWidth / 2 + 32, 32, 'rightdoor');
            }
            topleftdoorframe = this.physics.add.sprite(window.innerWidth / 2 - 32, 32, 'leftdoorframe');
            toprightdoorframe = this.physics.add.sprite(window.innerWidth / 2 + 32, 32, 'rightdoorframe');
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
    
    goDown() {
        this.scene.start("Level1", {
            score: score, configScoreText: configScoreText, playerStats: playerStats, scenario: scenario,
            currentPosition: scenario[currentPosition.x][currentPosition.y + 1]
        });
    }
    goUp() {
        this.scene.start("Level1", {
            score: score, configScoreText: configScoreText, playerStats: playerStats, scenario: scenario,
            currentPosition: scenario[currentPosition.x][currentPosition.y - 1]
        });
    }
    goLeft() {
        this.scene.start("Level1", {
            score: score, configScoreText: configScoreText, playerStats: playerStats, scenario: scenario,
            currentPosition: scenario[currentPosition.x - 1][currentPosition.y]
        });
    }
    goRight() {
        this.scene.start("Level1", {
            score: score, configScoreText: configScoreText, playerStats: playerStats, scenario: scenario,
            currentPosition: scenario[currentPosition.x + 1][currentPosition.y]
        });
    }

}

export default Hostile;