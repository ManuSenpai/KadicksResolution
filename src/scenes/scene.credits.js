var currentLanguage;
var i18n;

var currentText;

const ACTIVE_COLOR = "#00FF20";

class Credits extends Phaser.Scene {

    constructor() {
        super({ key: "Credits" });
    }
    init(data) {
        this.configScoreText = data.configScoreText;
        this.playerStats = data.playerStats;
        this.score = data.score;
        currentLanguage = this.playerStats.LANGUAGE;
    }
    create() {

        let currentIndex = 0;

        /* Getting JSON i18n data */
        i18n = this.cache.json.get(currentLanguage);
        this.cameras.main.setBackgroundColor('#000000');

        this.showTexts(currentIndex);

    }

    showTexts(index) {
        if (index < i18n.CREDITS.length) {
            this.currentText = this.add.text(window.innerWidth / 2, window.innerHeight / 2, i18n.CREDITS[index], { fontSize: 40, align: 'center', color: ACTIVE_COLOR, lineSpacing: 10 });
            this.currentText.x -= this.currentText.width / 2;
            this.currentText.y -= this.currentText.height / 2;
            this.currentText.opacity = 0;
            this.show(index, currentText);
        } else {
            this.currentText = this.add.text(window.innerWidth / 2, window.innerHeight / 2, i18n.THANKS, { fontSize: 50, align: 'center', color: ACTIVE_COLOR, lineSpacing: 10 });
            this.currentText.x -= this.currentText.width / 2;
            this.currentText.y -= this.currentText.height / 2;
            setTimeout(() => {
                this.scene.start("Main_Menu", { score: this.score, configScoreText: this.configScoreText, playerStats: this.playerStats });
            }, 5000);
        }
    }

    show(index, text) {
        this.tweens.add({
            targets: text,
            opacity: 1,
            duration: 1000,
            ease: function (t) {
                return Math.pow(t, 1 / 2);
            },
            onComplete: () => {
                setTimeout(() => {
                    this.hide(index, text);
                }, 2000)
            }
        });
    }

    hide(index, text) {
        this.tweens.add({
            targets: text,
            opacity: 0,
            duration: 1000,
            ease: function (t) {
                return Math.pow(t, 1 / 2);
            },
            onComplete: () => {
                setTimeout(() => {
                    this.currentText.destroy();
                    this.showTexts(index + 1);
                }, 1000);
            }
        });
    }

}

export default Credits;