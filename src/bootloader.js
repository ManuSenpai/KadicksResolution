var score;
var scoreText;
var configScoreText = {
    x: 64,
    y: 2,
    text: 'SCORE: ' + 0,
    style: {
        fontFamily: 'kadick',
        fontSize: 30,
        fontStyle: 'bold'
    }
};


const PLAYER_STATS = {
    HEALTH: 100,                        // Current health value
    MAX_HEALTH: 100,                    // Maximum health value 
    ARMOR: 100,                         // Current armor value
    MAX_ARMOR: 100,                     // Maximum armor value
    DAMAGE: 15,                         // Damage caused by the player
    KEYCODES : [false, false, false],   // Collected Key Codes: true = collected; false = not collected yet
    FIRE_RATE: 250,                     // Fire rate
    LASER_SPEED: 2,                     // Laser speed
    ARMOR_RECOVERY_TIMER: 3000,         // Time untile armor recovery begins when player is unharmed
    TIME_RECOVER_ARMOR: 250,            // Time until armor recovers the armor recovery value
    ARMOR_RECOVERY: 5,                  // Armor recovery value per time unit
    DIFFICULTY: "NORMAL"                // Difficulty level
}

class Bootloader extends Phaser.Scene {
    constructor() {
        super({ key: 'Bootloader' });
    }
    preload() {
        score = 0;
        this.load.on("complete", () => {
            // this.scene.start("Scene_play", { score: score, configScoreText: configScoreText, playerStats: PLAYER_STATS });
            // this.scene.start("Main_Menu", { score: score, configScoreText: configScoreText, playerStats: PLAYER_STATS });
            this.scene.start("map_test");
        })
        /* Image loading */
        this.load.image('player', "./assets/player.png");
        this.load.image('laser', "./assets/laser.png");

        /* Enemies */
        this.load.image('turret', "./assets/turret.png");
        this.load.image('scancatcher1', "./assets/scancatcher1.png");

        /* Bosses */
        this.load.image('boss1', "./assets/bossdemo1.png");

        /* Scenario 1 */
        this.load.image('topleft1', "./assets/topleft1.png");
        this.load.image('topright1', "./assets/topright1.png");
        this.load.image('botleft1', "./assets/botleft1.png");
        this.load.image('botright1', "./assets/botright1.png");
        this.load.image('topbot1', "./assets/topbot1.png");
        this.load.image('leftright1', "./assets/leftright1.png");
        this.load.image('floor1', "./assets/floor1.png");

        /* UI */
        this.load.image('healthIcon', "./assets/healthIcon.png");
        this.load.image('armorIcon', "./assets/shieldIcon.png");
        this.load.image('flares', "./assets/flares.png");
    }
    create() {
        scoreText = this.make.text(configScoreText);
    }
}

export default Bootloader;