var score;
class Bootloader extends Phaser.Scene {
    constructor() {
        super({ key: 'Bootloader' });
    }
    preload() {
        score = 0;
        this.load.on("complete", () => {
            this.scene.start("Scene_play", { score: score });
        })
        /* Image loading */
        this.load.image('player', "./assets/player.png");
        this.load.image('laser', "./assets/laser.png");

        /* Enemies */
        this.load.image('turret', "./assets/turret.png");

        /* Scenario 1 */
        this.load.image('topleft1', "./assets/topleft1.png");
        this.load.image('topright1', "./assets/topright1.png");
        this.load.image('botleft1', "./assets/botleft1.png");
        this.load.image('botright1', "./assets/botright1.png");
        this.load.image('topbot1', "./assets/topbot1.png");
        this.load.image('leftright1', "./assets/leftright1.png");
        this.load.image('floor1', "./assets/floor1.png");
    }
}

export default Bootloader;