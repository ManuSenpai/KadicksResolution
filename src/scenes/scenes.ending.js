var currentLanguage;
var i18n;

var currentText;

const ACTIVE_COLOR = "#FFDA2F";
const SCREEN_FONT_FACTOR = 52;

class Ending extends Phaser.Scene {

    constructor() {
        super({ key: "Ending" });
    }
    init(data) {
        this.configScoreText = data.configScoreText;
        this.playerStats = data.playerStats;
        this.score = data.score;
        currentLanguage = this.playerStats.LANGUAGE;
    }
    create() {

        window.onresize = () => this.scene.restart();

        let currentIndex = 0;

        /* Getting JSON i18n data */
        i18n = this.cache.json.get(currentLanguage);
        this.cameras.main.setBackgroundColor('#000000');

        this.showTexts(currentIndex);

    }

    showTexts(index) {
        if (index < i18n.END.length) {
            this.currentText = this.add.text(window.innerWidth / 2, window.innerHeight / 2, i18n.END[index], { fontSize: window.innerWidth / SCREEN_FONT_FACTOR, align: 'center', color: ACTIVE_COLOR, lineSpacing: 10 });
            this.currentText.x -= this.currentText.width/2;
            this.currentText.y -= this.currentText.height/2;
            this.currentText.opacity = 0;
            this.show( index, currentText );
        } else {
            this.scene.start("Credits", { score: this.score, configScoreText: this.configScoreText, playerStats: this.playerStats});
        }
    }

    show(index, text) {
        this.tweens.add({
            targets: text,
            opacity: 1,
            duration: 3000,
            ease: function (t) {
                return Math.pow(t, 1 / 2);
            },
            onComplete: () => {
                setTimeout( () => {
                    this.hide( index, text );
                }, i18n.END[index].length * 3000 )
            }
        });
    }

    hide (index, text) {
        this.tweens.add({
            targets: text,
            opacity: 0,
            duration: 3000,
            ease: function (t) {
                return Math.pow(t, 1 / 2);
            },
            onComplete: () => {
                setTimeout( () => {
                    this.currentText.destroy();
                    this.showTexts( index + 1 );
                }, 1000 );
            }
        });
    }

}

export default Ending;