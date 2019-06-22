const STANDARD_WIDTH = 1536;

const STANDARD_HEIGHT = 720;

var scaleFactor;
var floor;
import * as difficulty from '../settings/difficulty.js'
// Text configuration object
var NewGameButton = {
    x: window.innerWidth / 2,
    y: window.innerHeight * 2 / 3,
    style: {
        fontFamily: 'kadick',
        fontSize: 40,
        fontStyle: 'bold',
        align: 'center'
    }
}

var modalText = {
    style: {
        fontSize: 40,
        fontStyle: 'bold',
        align: 'center'
    }
}

var ProvisionalTitle = {
    text: "KADICK'S RESOLUTION",
    style: {
        fontFamily: 'kadick',
        fontStyle: 'bold',
        align: 'center'
    }
}

var i18n;

var modal;
var modalGraphics;
const OKCOLOR = "#0cff00";
const NOTOKCOLOR = "#F00";
var currentLanguage;

class Main_menu extends Phaser.Scene {
    constructor() {
        super({ key: "Main_Menu" });
    }
    init(data) {
        this.configScoreText = data.configScoreText;
        this.playerStats = data.playerStats;
        i18n = this.cache.json.get(this.playerStats.LANGUAGE);
        currentLanguage = this.playerStats.LANGUAGE;
        // Doing this we reset the player stats if we come from the credits
        this.playerStats = difficulty.default[this.playerStats.DIFFICULTY].PLAYER_STATS;
        this.playerStats.LANGUAGE = currentLanguage;
        let scaleHeight = window.innerHeight / STANDARD_HEIGHT;
        let scaleWidth = window.innerWidth / STANDARD_WIDTH;
        scaleFactor = Math.min(scaleHeight, scaleWidth);

    }

    create() {
        window.onresize = () => this.scene.restart();

        // floor = this.add.tileSprite(0, 0, window.innerWidth * 2, window.innerWidth * 2, 'floor1');
        this.cameras.main.setBackgroundColor('#880070');
        // this.playbutton = this.add.text( window.innerWidth/2, window.innerHeight/2, "NEW GAME", { fill: '#0f0' } )
        this.provisionalTitleText = this.make.text(ProvisionalTitle)
        .setY( window.innerHeight / 4)
        .setX( window.innerWidth / 2)
        .setFontSize( 100 * scaleFactor );
        this.provisionalTitleText.setOrigin(0.5);

        /** MODAL */
        this.createModal();

        this.playbutton = this.make.text(NewGameButton).setText(i18n.MAIN.NEW)
            .setInteractive()
            .on('pointerdown', () => this.showModal())
            .on('pointerover', () => this.onButtonOver(this.playbutton))
            .on('pointerout', () => this.onButtonOut(this.playbutton));
        this.playbutton.setOrigin(0.5).setY(window.innerHeight * 2 / 3).setX(window.innerWidth/2).setFontSize(40 * scaleFactor);

        this.settingsbutton = this.make.text(NewGameButton).setText(i18n.MAIN.SETTINGS)
            .setInteractive()
            .on('pointerdown', () => this.settingsPointerDown())
            .on('pointerover', () => this.onButtonOver(this.settingsbutton))
            .on('pointerout', () => this.onButtonOut(this.settingsbutton));
        this.settingsbutton.setY((window.innerHeight * 2 / 3) + 80 * scaleFactor).setX(window.innerWidth/2).setFontSize(40 * scaleFactor);
        this.settingsbutton.setOrigin(0.5);

        this.controlsButton = this.make.text(NewGameButton).setText(i18n.MAIN.CONTROLS)
            .setInteractive()
            .on('pointerdown', () => this.scene.start("Controls", { score: this.score, configScoreText: this.configScoreText, playerStats: this.playerStats }) )
            .on('pointerover', () => this.onButtonOver(this.controlsButton))
            .on('pointerout', () => this.onButtonOut(this.controlsButton));
        this.controlsButton.setY((window.innerHeight * 2 / 3) + 160 * scaleFactor).setX(window.innerWidth/2).setFontSize(40 * scaleFactor);
        this.controlsButton.setOrigin(0.5);
    }
    onButtonOver(button) {
        button.setFontSize(50 * scaleFactor);
    }
    onButtonOut(button) {
        button.setFontSize(40 * scaleFactor);
    }
    newGamePointerDown(seeIntro = true) {
        // this.scene.start("Scene_play", { score: 0, configScoreText: this.configScoreText, playerStats: this.playerStats });
        // this.scene.start("Level1", { score: 0, configScoreText: this.configScoreText, playerStats: this.playerStats });
        // this.scene.start("map_test", { score: 0, configScoreText: this.configScoreText, playerStats: this.playerStats });
        if (seeIntro) { this.scene.start("Opening", { score: 0, configScoreText: this.configScoreText, playerStats: this.playerStats }); } else {
            this.scene.start("map_test", { score: 0, configScoreText: this.configScoreText, playerStats: this.playerStats });
        }
    }
    settingsPointerDown() {
        this.scene.start("Settings", { score: 0, configScoreText: this.configScoreText, playerStats: this.playerStats });
    }

    createModal() {
        // modal = this.add.tileSprite(window.innerWidth/2, window.innerHeight/2, 500, 300, 'topbot1');
        modal = this.add.rectangle(window.innerWidth/2, window.innerHeight/2, 500 * scaleFactor, 300* scaleFactor, 0x660053);
        modal.setOrigin(0.5);
        modal.setActive(false);
        modal.setVisible(false);
        modal.setAlpha(0.8);
        modal.setDepth(4);

        this.modalShadow = this.add.rectangle(window.innerWidth/2 + 10 * scaleFactor, window.innerHeight/2 + 10 * scaleFactor, 500 * scaleFactor, 300 * scaleFactor, 0x000);
        this.modalShadow.setOrigin(0.5);
        this.modalShadow.setActive(false);
        this.modalShadow.setVisible(false);
        this.modalShadow.setAlpha(0.5);
        this.modalShadow.setDepth(3);

        this.header = this.add.rectangle(window.innerWidth/2, window.innerHeight/2 - 125 * scaleFactor, 500 * scaleFactor, 50 * scaleFactor, 0xffbb28);
        this.header.setOrigin(0.5);
        this.header.setActive(false);
        this.header.setVisible(false);
        this.header.setDepth(5);

        this.questionText = this.make.text(modalText).setText(i18n.MAIN.SEE_INTRODUCTION);
        this.questionText.setX(window.innerWidth / 2 - this.questionText.width  * scaleFactor / 2 )
            .setY(window.innerHeight / 2 - 64 * scaleFactor)
            .setFontSize( 40 * scaleFactor);
        this.questionText.setActive(false);
        this.questionText.setVisible(false);
        this.questionText.setDepth(5);

        this.hideButton = this.make.text(modalText).setText('X')
            .setInteractive()
            .setX(window.innerWidth / 2 + 225 * scaleFactor)
            .setY(window.innerHeight / 2 - 125 * scaleFactor)
            .on('pointerdown', () => this.hideModal())
            .on('pointerover', () => this.onButtonOver(this.hideButton))
            .on('pointerout', () => this.onButtonOut(this.hideButton));
        this.hideButton.setOrigin(0.5).setFontSize( 40 * scaleFactor );
        this.hideButton.setActive(false);
        this.hideButton.setVisible(false);
        this.hideButton.setDepth(6);

        this.yesButton = this.make.text(modalText).setText(i18n.MAIN.YES)
            .setInteractive()
            .setX(window.innerWidth / 2)
            .setY(window.innerHeight / 2 + 32 * scaleFactor)
            .on('pointerdown', () => this.newGamePointerDown(true))
            .on('pointerover', () => this.onButtonOver(this.yesButton))
            .on('pointerout', () => this.onButtonOut(this.yesButton));
        this.yesButton.setOrigin(0.5).setFontSize( 40 * scaleFactor );
        this.yesButton.setActive(false);
        this.yesButton.setVisible(false);
        this.yesButton.setDepth(5);

        this.noButton = this.make.text(modalText).setText(i18n.MAIN.NO)
            .setInteractive()
            .setX(window.innerWidth / 2)
            .setY(window.innerHeight / 2 + 96 * scaleFactor)
            .on('pointerdown', () => this.newGamePointerDown(false))
            .on('pointerover', () => this.onButtonOver(this.noButton))
            .on('pointerout', () => this.onButtonOut(this.noButton));
        this.noButton.setOrigin(0.5).setFontSize( 40 * scaleFactor );
        this.noButton.setActive(false);
        this.noButton.setVisible(false);
        this.noButton.setDepth(5);
    }

    showModal() {
        this.modalShadow.setActive(true);
        modal.setActive(true);
        this.modalShadow.setVisible(true);
        modal.setVisible(true);
        this.header.setActive(true);
        this.header.setVisible(true);
        this.hideButton.setActive(true);
        this.hideButton.setVisible(true);
        this.questionText.setActive(true);
        this.questionText.setVisible(true);
        this.yesButton.setActive(true);
        this.yesButton.setVisible(true);
        this.noButton.setActive(true);
        this.noButton.setVisible(true);
    }

    hideModal() {
        this.modalShadow.setActive(false);
        modal.setActive(false);
        this.modalShadow.setVisible(false);
        modal.setVisible(false);
        this.header.setActive(false);
        this.header.setVisible(false);
        this.hideButton.setActive(false);
        this.hideButton.setVisible(false);
        this.questionText.setActive(false);
        this.questionText.setVisible(false);
        this.yesButton.setActive(false);
        this.yesButton.setVisible(false);
        this.noButton.setActive(false);
        this.noButton.setVisible(false);
    }
}

export default Main_menu;