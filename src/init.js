import Turret from './GameObjects/turret.js';
import Laser from './GameObjects/laser.js';
import Bootloader from './bootloader.js';
import Scene_play from './scenes/scene.play.js';

const config = {
    width: window.innerWidth,
    height: window.innerHeight - 5,
    parent: "container",
    type: Phaser.AUTO,
    physics: {
        default: 'arcade',
        arcade: {
            debug: true
        }
    },
    scene: [
        Bootloader,
        Scene_play
    ]
}

var game = new Phaser.Game(config);

