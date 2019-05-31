import Turret from './GameObjects/turret.js';
import Laser from './GameObjects/laser.js';
import Bootloader from './bootloader.js';
import Scene_play from './scenes/scene.play.js';
import Main_menu from './scenes/scene.mainmenu.js';
import Settings from './scenes/scene.settings.js';
import map_test from './scenes/scenario/maptest.js';
import Level1_1 from './scenes/scene.level1_1.js';
import Level1 from './scenes/scene.level1.js';
import Level1_B from './scenes/scene.level1_B.js';
import Level1_2 from './scenes/scene.level1_2.js';
import Level2 from './scenes/scene.level2.js';
import Level2_1 from './scenes/scene.level2_1.js';
import Level2_2 from './scenes/scene.level2_2.js';
import Level2_B from './scenes/scene.level2_B.js';
import Level3 from './scenes/scene.level3.js';
import Level3_1 from './scenes/scene.level3_1.js';
import Level3_2 from './scenes/scene.level3_2.js';
import Level3_B from './scenes/scene.level3_B.js';

const config = {
    width: window.innerWidth,
    height: window.innerHeight - 5,
    parent: "container",
    type: Phaser.AUTO,
    physics: {
        default: 'arcade',
        arcade: {
            debug: false
        }
    },
    scene: [
        Bootloader,
        Scene_play,
        Main_menu,
        Settings,
        map_test,
        Level1_1,
        Level1_2,
        Level1_B,
        Level1,
        Level2,
        Level2_1,
        Level2_2,
        Level2_B,
        Level3,
        Level3_1,
        Level3_2,
        Level3_B
    ]
}

var game = new Phaser.Game(config);

