const STANDARD_WIDTH = 1536;

const STANDARD_HEIGHT = 720;

var SettingsText = {
    x: window.innerWidth / 2,
    y: window.innerHeight * 1 / 4,
    text: 'SETTINGS',
    style: {
        fontFamily: 'kadick',
        fontStyle: 'bold',
        align: 'center'
    }
}

var languageText = {
    style: {
        fontStyle: 'bold',
        align: 'center'
    }
}

var currentLanguage = "es";
var i18n;

var scaleFactor;

const ACTIVE_COLOR = "#FFDA2F";
const UNACTIVE_COLOR = "#FFF"

class LanguageSelect extends Phaser.Scene {

    languageTitle;
    spaBtn;
    spaText;
    valBtn;
    valText;
    engBtn;
    engText;
    confirmText;
    selectedLanguage = '';
    acceptEnabled = false;

    constructor() {
        super({ key: "LanguageSelect" });
    }
    init(data) {
        this.configScoreText = data.configScoreText;
        this.playerStats = data.playerStats;
        this.score = data.score;
        let scaleHeight = window.innerHeight / STANDARD_HEIGHT;
        let scaleWidth = window.innerWidth / STANDARD_WIDTH;
        scaleFactor = Math.min(scaleHeight, scaleWidth);
        this.acceptEnabled = false;
    }
    create() {
        window.onresize = () =>  { 
            this.scene.restart();
        }

        /* Getting JSON i18n data */

        this.cameras.main.setBackgroundColor('#000000');

        this.setTexts();

        this.spaBtn = this.physics.add.sprite(window.innerWidth / 4, window.innerHeight / 2, 'SPA');
        this.spaBtn.setScale( scaleFactor );
        this.engBtn = this.physics.add.sprite(window.innerWidth * 3 / 4, window.innerHeight / 2, 'GB');
        this.engBtn.setScale( scaleFactor );
        this.valBtn = this.physics.add.sprite(window.innerWidth / 2, window.innerHeight / 2, 'VAL');
        this.valBtn.setScale( scaleFactor );

        this.spaBtn.setInteractive()
            .on('pointerdown', () => {
                currentLanguage = 'es';
                this.selectedLanguage = 'es';
                this.valText.setColor(UNACTIVE_COLOR);
                this.spaText.setColor(ACTIVE_COLOR);
                this.engText.setColor(UNACTIVE_COLOR);
                this.editTexts();
            })
            .on('pointerover', () => this.onButtonOver(this.spaBtn, this.spaText))
            .on('pointerout', () => this.onButtonOut(this.spaBtn, this.spaText));
        this.spaBtn.setOrigin(0.5);

        this.valBtn.setInteractive()
            .on('pointerdown', () => {
                currentLanguage = 'va';
                this.selectedLanguage = 'va';
                this.valText.setColor(ACTIVE_COLOR);
                this.spaText.setColor(UNACTIVE_COLOR);
                this.engText.setColor(UNACTIVE_COLOR);
                this.editTexts();
            })
            .on('pointerover', () => this.onButtonOver(this.valBtn, this.valText))
            .on('pointerout', () => this.onButtonOut(this.valBtn, this.valText));
        this.valBtn.setOrigin(0.5);

        this.engBtn.setInteractive()
            .on('pointerdown', () => {
                currentLanguage = 'en';
                this.selectedLanguage = 'en';
                this.valText.setColor(UNACTIVE_COLOR);
                this.spaText.setColor(UNACTIVE_COLOR);
                this.engText.setColor(ACTIVE_COLOR);
                this.editTexts();
            })
            .on('pointerover', () => this.onButtonOver(this.engBtn, this.engText))
            .on('pointerout', () => this.onButtonOut(this.engBtn, this.engText));
        this.engBtn.setOrigin(0.5);
    }

    /**
     * Sets size of button element and its text whenever the mouse is over it
     * @param {Button} button Button element
     * @param {Text} text text element 
     */
    onButtonOver(button, text) {
        button.setScale(scaleFactor * 1.2);
        text.setFontSize(50 * scaleFactor);
    }

    /**
     * Sets size of button element and its text whenever the mouse is no longer over it
     * @param {Button} button Button element
     * @param {Text} text text element 
     */
    onButtonOut(button, text) {
        button.setScale(scaleFactor);
        text.setFontSize(40 * scaleFactor);
    }

    /**
     * Sets font of text element whenever the mouse is over it
     * @param {Button} button Button element
     * @param {Text} text text element 
     */
    onTextOver(text) {
        text.setFontSize(50 * scaleFactor);
    }

    /**
     * Sets font of text element whenever the mouse is over it
     * @param {Button} button Button element
     * @param {Text} text text element 
     */
    onTextOut(text) {
        text.setFontSize(40 * scaleFactor);
    }

    /** Creates text elements */
    setTexts() {
        i18n = this.cache.json.get(currentLanguage);

        this.languageTitle = this.make.text(SettingsText)
            .setText(i18n.LANGUAGE.TITLE)
            .setX(window.innerWidth / 2)
            .setY(window.innerHeight * 1 / 5)
            .setFontSize(50 * scaleFactor);
        this.languageTitle.setOrigin(0.5);

        this.spaText = this.make.text(languageText)
            .setText(i18n.LANGUAGE.ES)
            .setX(window.innerWidth / 4)
            .setY(window.innerHeight * 3 / 4)
            .setFontSize(40 * scaleFactor);
        this.spaText.setOrigin(0.5);

        this.valText = this.make.text(languageText)
            .setText(i18n.LANGUAGE.VA)
            .setX(window.innerWidth / 2)
            .setY(window.innerHeight * 3 / 4)
            .setFontSize(40 * scaleFactor);
        this.valText.setOrigin(0.5);

        this.engText = this.make.text(languageText)
            .setText(i18n.LANGUAGE.EN)
            .setX(window.innerWidth * 3 / 4)
            .setY(window.innerHeight * 3 / 4)
            .setFontSize(40 * scaleFactor);
        this.engText.setOrigin(0.5);
    }

    editTexts() {
        i18n = this.cache.json.get(currentLanguage);
        this.playerStats.LANGUAGE = currentLanguage;
        this.languageTitle.setText(i18n.LANGUAGE.TITLE);
        this.spaText.setText(i18n.LANGUAGE.ES);
        this.valText.setText(i18n.LANGUAGE.VA);
        this.engText.setText(i18n.LANGUAGE.EN);

        if (!this.acceptEnabled) {
            this.acceptEnabled = true;
            this.confirmText = this.make.text(languageText)
                .setText(i18n.LANGUAGE.ACCEPT)
                .setX(window.innerWidth / 2)
                .setY(window.innerHeight - 64 * scaleFactor )
                .setFontSize(40 * scaleFactor);
            this.confirmText.setOrigin(0.5);
            this.confirmText.setInteractive()
            .on('pointerdown', () => {
                this.scene.start("Main_Menu", { score: this.score, configScoreText: this.configScoreText, playerStats: this.playerStats});
            })
            .on('pointerover', () => this.onTextOver(this.confirmText))
            .on('pointerout', () => this.onTextOut(this.confirmText));
        } else {
            this.confirmText.setText(i18n.LANGUAGE.ACCEPT);
        }
    }

}

export default LanguageSelect;