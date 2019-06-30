import * as difficulty from '../settings/difficulty.js'

const STANDARD_WIDTH = 1536;

const STANDARD_HEIGHT = 720;

var scaleFactor;

const ACTIVE_COLOR = "#FFDA2F";
const UNACTIVE_COLOR = "#FFF"

var SettingsText = {
    x: window.innerWidth / 2,
    y: window.innerHeight * 1 / 4,
    text: 'SETTINGS',
    style: {
        fontFamily: 'kadick',
        fontSize: 60,
        fontStyle: 'bold',
        align: 'center'
    }
}

var optionsText = {
    x: window.innerWidth / 2,
    style: {
        fontSize: 60,
        fontStyle: 'bold',
        align: 'center'
    }
}

var i18n;

class Settings extends Phaser.Scene {

    constructor() {
        super({ key: "Settings" });
    }
    init(data) {
        this.configScoreText = data.configScoreText;
        this.playerStats = data.playerStats;
        i18n = this.cache.json.get(this.playerStats.LANGUAGE);
        this.currentLanguage = this.playerStats.LANGUAGE;
        let scaleHeight = window.innerHeight / STANDARD_HEIGHT;
        let scaleWidth = window.innerWidth / STANDARD_WIDTH;
        scaleFactor = Math.min(scaleHeight, scaleWidth);
    }
    create() {
        window.onresize = () => this.scene.restart();
        // this.background = this.add.tileSprite(0, 0, window.innerWidth * 2, window.innerWidth * 2, 'floor1');
        this.cameras.main.setBackgroundColor('#880070');

        this.settingsTitle = this.make.text(SettingsText).setText(i18n.SETTINGS.TITLE);
        this.settingsTitle.setOrigin(0.5).setX(window.innerWidth/2).setY(window.innerHeight/4).setFontSize(60 * scaleFactor);

        this.difficultyTitle = this.make.text(SettingsText).setText(i18n.SETTINGS.DIFFICULTY.SELECT);
        this.difficultyTitle.setOrigin(0.5).setX(window.innerWidth/2).setY(window.innerHeight * 1 / 3).setFontSize(50 * scaleFactor);

        this.easyBtn = this.make.text(optionsText).setText(i18n.SETTINGS.DIFFICULTY.EASY).setX(window.innerWidth/2).setY(innerHeight * 1 / 2).setFontSize(40 * scaleFactor)
            .setInteractive()
            .on('pointerdown', () => this.setDifficulty('EASY'))
            .on('pointerover', () => this.onButtonOver(this.easyBtn))
            .on('pointerout', () => this.onButtonOut(this.easyBtn));
        this.easyBtn.setOrigin(0.5);
        if( this.playerStats.DIFFICULTY === 'EASY') { this.easyBtn.setColor(ACTIVE_COLOR); }

        this.normalBtn = this.make.text(optionsText).setText(i18n.SETTINGS.DIFFICULTY.NORMAL).setX(window.innerWidth/2).setY((innerHeight * 1 / 2) + 80 * scaleFactor).setFontSize(40 * scaleFactor)
            .setInteractive()
            .on('pointerdown', () => this.setDifficulty('NORMAL'))
            .on('pointerover', () => this.onButtonOver(this.normalBtn))
            .on('pointerout', () => this.onButtonOut(this.normalBtn));
        this.normalBtn.setOrigin(0.5);
        if( this.playerStats.DIFFICULTY === 'NORMAL') { this.normalBtn.setColor(ACTIVE_COLOR); }

        this.hardBtn = this.make.text(optionsText).setText(i18n.SETTINGS.DIFFICULTY.HARD).setX(window.innerWidth/2).setY((innerHeight * 1 / 2) + 160 * scaleFactor).setFontSize(40 * scaleFactor)
            .setInteractive()
            .on('pointerdown', () => this.setDifficulty('HARD'))
            .on('pointerover', () => this.onButtonOver(this.hardBtn))
            .on('pointerout', () => this.onButtonOut(this.hardBtn));
        this.hardBtn.setOrigin(0.5);
        if( this.playerStats.DIFFICULTY === 'HARD') { this.hardBtn.setColor(ACTIVE_COLOR); }

        this.goBackBtn = this.make.text(optionsText).setText(i18n.SETTINGS.DIFFICULTY.SAVE).setX(window.innerWidth/2).setY((innerHeight * 1 / 2) + 300 * scaleFactor).setFontSize(50 * scaleFactor)
            .setInteractive()
            .on('pointerdown', () => this.goBackToMenu())
            .on('pointerover', () => this.onButtonOver(this.goBackBtn))
            .on('pointerout', () => this.onButtonOut(this.goBackBtn));
        this.goBackBtn.setOrigin(0.5);
    }
    /**
     * Sets size of button element whenever the mouse is over it
     * @param {Button} button Button element
     */
    onButtonOver(button) {
        button.setFontSize(50 * scaleFactor);
    }

    /**
     * Sets size of button element whenever the mouse is no longer over it
     * @param {Button} button Button element
     */
    onButtonOut(button) {
        button.setFontSize(40 * scaleFactor);
    }

    /** Sets difficulty */
    setDifficulty(diffValue) {
        switch (diffValue) {
            case 'EASY':
                this.playerStats = difficulty.default.EASY.PLAYER_STATS;
                this.playerStats.LANGUAGE = this.currentLanguage;
                this.easyBtn.setColor(ACTIVE_COLOR);
                this.normalBtn.setColor(UNACTIVE_COLOR);
                this.hardBtn.setColor(UNACTIVE_COLOR);
                break;
            case 'NORMAL':
                this.playerStats = difficulty.default.NORMAL.PLAYER_STATS;
                this.playerStats.LANGUAGE = this.currentLanguage;
                this.easyBtn.setColor(UNACTIVE_COLOR);
                this.normalBtn.setColor(ACTIVE_COLOR);
                this.hardBtn.setColor(UNACTIVE_COLOR);
                break;
            case 'HARD':
                this.playerStats = difficulty.default.HARD.PLAYER_STATS;
                this.playerStats.LANGUAGE = this.currentLanguage;
                this.easyBtn.setColor(UNACTIVE_COLOR);
                this.normalBtn.setColor(UNACTIVE_COLOR);
                this.hardBtn.setColor(ACTIVE_COLOR);
                break;
        }
    }

    /** Takes the player back to menu */
    goBackToMenu(){
        this.scene.start("Main_Menu", { configScoreText: this.configScoreText, playerStats: this.playerStats });
    }

}

export default Settings;