class Settings extends Phaser.Scene {

    constructor() {
        super({ key: "Settings" });
    }
    init(data){
        this.configScoreText = data.configScoreText;
        this.playerStats = data.playerStats;
    }
    
}

export default Settings;