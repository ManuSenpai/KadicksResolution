var currentLanguage;
var i18n;

var currentText;

const ACTIVE_COLOR = "#00FF20";
const STANDARD_WIDTH = 1536;

const STANDARD_HEIGHT = 720;

var scaleFactor;

var textTimeout;

class Opening extends Phaser.Scene {

    constructor() {
        super({ key: "Opening" });
    }
    init(data) {
        this.configScoreText = data.configScoreText;
        this.playerStats = data.playerStats;
        this.score = data.score;
        currentLanguage = this.playerStats.LANGUAGE;
        let scaleHeight = window.innerHeight / STANDARD_HEIGHT;
        let scaleWidth = window.innerWidth / STANDARD_WIDTH;
        scaleFactor = Math.min(scaleHeight, scaleWidth);
    }
    create() {

        window.onresize = () => this.scene.restart();
        if ( textTimeout ) { clearTimeout(textTimeout); }

        let currentIndex = 0;

        /* Getting JSON i18n data */
        i18n = this.cache.json.get(currentLanguage);
        this.cameras.main.setBackgroundColor('#000000');

        this.showTexts(currentIndex);

    }

    /**
     * Displays a text element on screen
     * @param {Number} index Index of the text that will be shown
     */
    showTexts(index) {
        if (index < i18n.OPENING.length) {
            this.currentText = this.add.text(window.innerWidth / 2, window.innerHeight / 2, i18n.OPENING[index], { fontSize: 40 * scaleFactor, align: 'center', color: ACTIVE_COLOR, lineSpacing: 10 });
            this.currentText.x -= this.currentText.width / 2;
            this.currentText.y -= this.currentText.height / 2;
            this.currentText.opacity = 0;
            this.show(index, currentText);
        } else {
            setTimeout(() => {
                this.scene.start("map_test", { score: 0, configScoreText: this.configScoreText, playerStats: this.playerStats });
            }, 5000);
        }
    }

    /**
     * Displays text on screen
     * @param {Number} index Index of the text element to be shown 
     * @param {Text} text Text element
     */
    show(index, text) {
        let showTween = this.tweens.add({
            targets: text,
            opacity: 1,
            duration: 1000,
            ease: function (t) {
                return Math.pow(t, 1 / 2);
            },
            onComplete: () => {
                textTimeout = setTimeout(() => {
                    this.hide(index, text);
                }, i18n.OPENING[index].length * 2000);
                /** We do this to avoid memory leaks */
                showTween.stop();
            }
        });
    }

    /**
     * Hides text element.
     * @param {Number} index Index of the text element to be shown 
     * @param {Text} text Text element
     */
    hide(index, text) {
        let hideTween = this.tweens.add({
            targets: text,
            opacity: 0,
            duration: 1000,
            ease: function (t) {
                return Math.pow(t, 1 / 2);
            },
            onComplete: () => {
                hideTween.stop();
                setTimeout(() => {
                    /** We do this to avoid memory leaks */
                    this.currentText.destroy();
                    this.showTexts(index + 1);
                }, 1000);
            }
        });
    }

}

export default Opening;