var SettingsText = {
    x: window.innerWidth / 2,
    y: window.innerHeight * 1 / 4,
    style: {
        fontFamily: 'kadick',
        fontSize: 60,
        fontStyle: 'bold',
        align: 'center'
    }
}

var languageText = {
    style: {
        fontSize: 40,
        fontStyle: 'bold',
        align: 'center'
    }
}

var floor;
var i18n;

const STANDARD_WIDTH = 1536;
const STANDARD_HEIGHT = 720;
var scaleFactor;
var scaleHeight;
var scaleWidth;
class Continue extends Phaser.Scene {

    gameOverText;
    continuteText;
    yesText;
    noText;
    scoreText;
    constructor() {
        super({ key: "Continue" });
    }
    init(data) {
        this.score = data.score;
        this.configScoreText = data.configScoreText;
        this.playerStats = data.playerStats;
        this.scenario = data.scenario;
        this.currentPosition = data.currentPosition;
        this.entrance = data.entrance;
        i18n = this.cache.json.get(this.playerStats.LANGUAGE);

        scaleHeight = window.innerHeight / STANDARD_HEIGHT;
        scaleWidth = window.innerWidth / STANDARD_WIDTH;
        // scaleFactor = Math.min(scaleHeight, scaleWidth);
        scaleFactor = (scaleHeight + scaleWidth)/2;
    }

    create() {

        window.onresize = () => this.scene.restart();

        /* Getting JSON i18n data */

        this.cameras.main.setBackgroundColor('#000000');
        this.physics.add.sprite( window.innerWidth/2, window.innerHeight/2, 'continueIcon').setScale(2 * scaleFactor);


        this.setTexts();

        this.yesText.setInteractive()
            .on('pointerdown', () => {
                this.playerStats.HEALTH = this.playerStats.MAX_HEALTH;
                this.playerStats.ARMOR = this.playerStats.MAX_ARMOR;
                this.score = Math.round(this.score / 2);
                let position;
                this.scenario.forEach(row => {
                    row.forEach( cell => {
                        if ( cell.isStart ) { position = cell; }
                    })
                });
                this.scene.start("Level" + this.playerStats.LEVEL, {
                    score: this.score, configScoreText: this.configScoreText, playerStats: this.playerStats, scenario: this.scenario,
                    currentPosition: position, entrance: 'center'
                });
            })
            .on('pointerover', () => this.onTextOver(this.yesText))
            .on('pointerout', () => this.onTextOut(this.yesText));
        this.yesText.setOrigin(0.5);

        this.noText.setInteractive()
            .on('pointerdown', () => {
                this.playerStats.HEALTH = this.playerStats.MAX_HEALTH;
                this.playerStats.ARMOR = this.playerStats.MAX_ARMOR;
                this.scene.start("Main_Menu", { score: this.score, configScoreText: this.configScoreText, playerStats: this.playerStats});
            })
            .on('pointerover', () => this.onTextOver(this.noText))
            .on('pointerout', () => this.onTextOut(this.noText));
        this.noText.setOrigin(0.5);
    }
    onTextOver(text) {
        text.setFontSize(50 * scaleFactor);
    }
    onTextOut(text) {
        text.setFontSize(40 * scaleFactor);
    }

    setTexts() {

        this.gameOverText = this.make.text(SettingsText)
            .setText(i18n.CONTINUE.GAMEOVER)
            .setX(window.innerWidth / 2)
            .setY(window.innerHeight * 1 / 5)
            .setFontSize(50 * scaleFactor);
        this.gameOverText.setOrigin(0.5);

        this.scoreText = this.make.text(languageText)
            .setText(i18n.CONTINUE.SCORE + ': ' + this.score)
            .setX(window.innerWidth / 2)
            .setY(window.innerHeight * 2 / 5 - 64 * scaleFactor)
            .setFontSize(40 * scaleFactor);
        this.scoreText.setOrigin(0.5);

        this.continuteText = this.make.text(languageText)
            .setText(i18n.CONTINUE.CONTINUE)
            .setX(window.innerWidth / 2)
            .setY(window.innerHeight * 2 / 5)
            .setFontSize(40 * scaleFactor);
        this.continuteText.setOrigin(0.5);

        this.yesText = this.make.text(languageText)
            .setText(i18n.CONTINUE.YES)
            .setX(window.innerWidth / 2)
            .setY(window.innerHeight * 4 / 5)
            .setFontSize(40 * scaleFactor);
        this.yesText.setOrigin(0.5);

        this.noText = this.make.text(languageText)
            .setText(i18n.CONTINUE.NO)
            .setX(window.innerWidth / 2)
            .setY(window.innerHeight * 4 / 5 + 64 * scaleFactor)
            .setFontSize(40 * scaleFactor);
        this.noText.setOrigin(0.5);
    }
}

export default Continue;