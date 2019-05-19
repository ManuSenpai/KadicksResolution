var score;
var scoreText;
var configScoreText = {
    x: 64,
    y: 16,
    text: 'SCORE: ' + 0,
    style: {
        fontFamily: 'kadick',
        fontSize: 30,
        fontStyle: 'bold'
    }
};


const PLAYER_STATS = {
    LEVEL: 1,
    // LEVEL: 0,
    HEALTH: 100,                        // Current health value
    MAX_HEALTH: 100,                    // Maximum health value 
    ARMOR: 100,                         // Current armor value
    MAX_ARMOR: 100,                     // Maximum armor value
    // DAMAGE: 15,                         // Damage caused by the player
    DAMAGE: 150,                         // Damage caused by the player
    // KEYCODES : 0,                       // Collected Key Codes
    KEYCODES : 3,                       // Collected Key Codes
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
            this.scene.start("Main_Menu", { score: score, configScoreText: configScoreText, playerStats: PLAYER_STATS });
            // this.scene.start("map_test");
        })
        /* Image loading */
        this.load.image('player', "./assets/player.png");
        this.load.image('laser', "./assets/laser.png");

        /* Enemies L1 */
        this.load.image('turret', "./assets/turret.png");
        // this.load.image('scancatcher1', "./assets/scancatcher1.png");
        this.load.spritesheet('scancatcher1', "./assets/scancatcherss.png", { frameWidth: 48, frameHeight: 48 });
        this.load.image('jolt', "./assets/jolt.png");
        this.load.image('joltshield', "./assets/jolt-shield.png");
        this.load.image('joltweapon', "./assets/jolt-weapon.png");
        this.load.image('joltforcefield', "./assets/jolt-forcefield.png");

        /* Enemies L2 */
        this.load.image('coulomb', "./assets/coulomb.png");
        this.load.image('trashbot', './assets/trashbot.png');
        this.load.image('trashbotniceface', './assets/trash-nice.png');
        this.load.image('trashtrail', './assets/trashtrail.png');

        /* Bosses */
        this.load.image('boss1', "./assets/bossdemo1.png");

        /* Doors */
        this.load.image('leftdoorframe', "./assets/leftdoorframe.png");
        this.load.image('leftdoor', "./assets/leftdoor.png");
        this.load.image('leftdooropen', "./assets/leftdooropen.png");
        this.load.image('rightdoorframe', "./assets/rightdoorframe.png");
        this.load.image('rightdoor', "./assets/rightdoor.png");
        this.load.image('rightdooropen', "./assets/rightdooropen.png");
        this.load.image('bossrightdoor', "./assets/bossrightdoor.png");
        this.load.image('bossleftdoor', "./assets/bossleftdoor.png");
        this.load.image('stairnextlevel', "./assets/stairnextlevel.png");

        /* PROPS */
        this.load.image('box', "./assets/box.png")
        this.load.image('bigbox', "./assets/bigbox.png")
        this.load.image('column', "./assets/column.png")

        /* Scenario 1 */
        this.load.image('topleft1', "./assets/topleft1.png");
        this.load.image('topright1', "./assets/topright1.png");
        this.load.image('botleft1', "./assets/botleft1.png");
        this.load.image('botright1', "./assets/botright1.png");
        this.load.image('topbot1', "./assets/topbot1.png");
        this.load.image('leftright1', "./assets/leftright1.png");
        this.load.image('floor1', "./assets/floor1.png");

        /* Scenario 2 */
        this.load.image('topleft2', "./assets/topleft2.png");
        this.load.image('topright2', "./assets/topright2.png");
        this.load.image('botleft2', "./assets/botleft2.png");
        this.load.image('botright2', "./assets/botright2.png");
        this.load.image('topbot2', "./assets/topbot2.png");
        this.load.image('leftright2', "./assets/leftright2.png");
        this.load.image('floor2', "./assets/floor2.png");

        /* UI */
        this.load.image('healthIcon', "./assets/healthIcon.png");
        this.load.image('armorIcon', "./assets/shieldIcon.png");
        this.load.image('flares', "./assets/flares.png");

        /* POWER UPS */
        this.load.image('lifeup', "./assets/lifeup.png");
        this.load.image('medikit', "./assets/medikit.png");
        this.load.image('powup-attk', "./assets/powup-attk.png");
        this.load.image('powup-rthm', "./assets/powup-rthm.png");

        /* ITEMS */
        this.load.image('keycard', './assets/keycard.png');

        /* SCENARIO DISTRIBUTION */
        this.load.json('distribution', './src/scenes/scenario/scenarioDistribution.json');
    }
    create() {
        scoreText = this.make.text(configScoreText);
    }
}

export default Bootloader;