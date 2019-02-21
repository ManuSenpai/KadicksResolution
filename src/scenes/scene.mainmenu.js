var floor;
// Text configuration object
var NewGameButton = {
    x: window.innerWidth / 2,
    y: window.innerHeight * 2 / 3,
    text: 'NEW GAME',
    style: {
        fontFamily: 'kadick',
        fontSize: 40,
        fontStyle: 'bold',
        align: 'center'
    }
}

var ProvisionalTitle = {
    x: window.innerWidth / 2,
    y: window.innerHeight * 1 / 4,
    text: "KADICK'S RESOLUTION",
    style: {
        fontFamily: 'kadick',
        fontSize: 100,
        fontStyle: 'bold',
        align: 'center'
    }
}

class Main_menu extends Phaser.Scene {
    constructor() {
        super({ key: "Main_Menu" });
    }
    init(data){
        this.configScoreText = data.configScoreText;
        this.playerStats = data.playerStats;
    }

    create() {
        console.log("He llegado a Main Menu");
        floor = this.add.tileSprite(0, 0, window.innerWidth * 2, window.innerWidth * 2, 'floor1');
        // this.playbutton = this.add.text( window.innerWidth/2, window.innerHeight/2, "NEW GAME", { fill: '#0f0' } )
        this.provisionalTitleText = this.make.text(ProvisionalTitle);
        this.provisionalTitleText.setOrigin(0.5);

        this.playbutton = this.make.text(NewGameButton).setInteractive()
            .on('pointerdown', () => this.newGamePointerDown())
            .on('pointerover', () => this.onButtonOver(this.playbutton))
            .on('pointerout', () => this.onButtonOut(this.playbutton));
        this.playbutton.setOrigin(0.5);

        this.settingsbutton = this.make.text(NewGameButton).setInteractive()
            .on('pointerdown', () => this.settingsPointerDown(++clickCount))
            .on('pointerover', () => this.onButtonOver(this.settingsbutton))
            .on('pointerout', () => this.onButtonOut(this.settingsbutton));
        this.settingsbutton.setText('SETTINGS').setY((window.innerHeight * 2 / 3) + 80);
        this.settingsbutton.setOrigin(0.5);
    }
    onButtonOver(button){
        button.setFontSize(50);
    }
    onButtonOut(button){
        button.setFontSize(40);
    }
    newGamePointerDown(){
        this.scene.start("Scene_play", { score: 0, configScoreText: this.configScoreText, playerStats: this.playerStats });
    }
}

export default Main_menu;