import * as difficulty from '../settings/difficulty.js'

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

class Settings extends Phaser.Scene {

    constructor() {
        super({ key: "Settings" });
    }
    init(data) {
        this.configScoreText = data.configScoreText;
        this.playerStats = data.playerStats;
    }
    create() {

        this.background = this.add.tileSprite(0, 0, window.innerWidth * 2, window.innerWidth * 2, 'floor1');
        

        this.settingsTitle = this.make.text(SettingsText);
        this.settingsTitle.setOrigin(0.5);

        this.difficultyTitle = this.make.text(SettingsText).setText('DIFFICULTY').setY(innerHeight * 1 / 3).setFontSize(50);
        this.difficultyTitle.setOrigin(0.5);

        this.easyBtn = this.make.text(SettingsText).setText('EASY').setY(innerHeight * 1 / 2).setFontSize(40)
            .setInteractive()
            .on('pointerdown', () => this.setDifficulty('EASY'))
            .on('pointerover', () => this.onButtonOver(this.easyBtn))
            .on('pointerout', () => this.onButtonOut(this.easyBtn));
        this.easyBtn.setOrigin(0.5);
        if( this.playerStats.DIFFICULTY === 'EASY') { this.easyBtn.setColor(ACTIVE_COLOR); }

        this.normalBtn = this.make.text(SettingsText).setText('NORMAL').setY((innerHeight * 1 / 2) + 80).setFontSize(40)
            .setInteractive()
            .on('pointerdown', () => this.setDifficulty('NORMAL'))
            .on('pointerover', () => this.onButtonOver(this.normalBtn))
            .on('pointerout', () => this.onButtonOut(this.normalBtn));
        this.normalBtn.setOrigin(0.5);
        if( this.playerStats.DIFFICULTY === 'NORMAL') { this.normalBtn.setColor(ACTIVE_COLOR); }

        this.hardBtn = this.make.text(SettingsText).setText('HARD').setY((innerHeight * 1 / 2) + 160).setFontSize(40)
            .setInteractive()
            .on('pointerdown', () => this.setDifficulty('HARD'))
            .on('pointerover', () => this.onButtonOver(this.hardBtn))
            .on('pointerout', () => this.onButtonOut(this.hardBtn));
        this.hardBtn.setOrigin(0.5);
        if( this.playerStats.DIFFICULTY === 'HARD') { this.hardBtn.setColor(ACTIVE_COLOR); }

        this.goBackBtn = this.make.text(SettingsText).setText('SAVE AND RETURN TO MENU').setY((innerHeight * 1 / 2) + 300).setFontSize(50)
            .setInteractive()
            .on('pointerdown', () => this.goBackToMenu())
            .on('pointerover', () => this.onButtonOver(this.goBackBtn))
            .on('pointerout', () => this.onButtonOut(this.goBackBtn));
        this.goBackBtn.setOrigin(0.5);
    }
    onButtonOver(button) {
        button.setFontSize(50);
    }
    onButtonOut(button) {
        button.setFontSize(40);
    }
    setDifficulty(diffValue) {
        switch (diffValue) {
            case 'EASY':
                this.playerStats = difficulty.default.EASY.PLAYER_STATS;
                this.easyBtn.setColor(ACTIVE_COLOR);
                this.normalBtn.setColor(UNACTIVE_COLOR);
                this.hardBtn.setColor(UNACTIVE_COLOR);
                break;
            case 'NORMAL':
                this.playerStats = difficulty.default.NORMAL.PLAYER_STATS;
                this.easyBtn.setColor(UNACTIVE_COLOR);
                this.normalBtn.setColor(ACTIVE_COLOR);
                this.hardBtn.setColor(UNACTIVE_COLOR);
                break;
            case 'HARD':
                this.playerStats = difficulty.default.HARD.PLAYER_STATS;
                this.easyBtn.setColor(UNACTIVE_COLOR);
                this.normalBtn.setColor(UNACTIVE_COLOR);
                this.hardBtn.setColor(ACTIVE_COLOR);
                break;
        }
    }
    goBackToMenu(){
        this.scene.start("Main_Menu", { configScoreText: this.configScoreText, playerStats: this.playerStats });
    }

}

export default Settings;