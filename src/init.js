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
import LanguageSelect from './scenes/scene.language.js';
import Continue from './scenes/scene.continue.js';
import mapUT from './scenes/scenario/mapUT.js';
import Ending from './scenes/scenes.ending.js';
import Credits from './scenes/scene.credits.js';
import Opening from './scenes/scene.opening.js';
import Controls from './scenes/scene.controls.js';

const config = {
    width: window.innerWidth,
    height: window.innerHeight - 5,
    parent: "container",
    type: Phaser.AUTO,
    scale: {
        mode: Phaser.Scale.RESIZE
    },
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
        mapUT,
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
        Level3_B,
        LanguageSelect,
        Continue,
        Ending,
        Opening,
        Credits,
        Controls
    ]
}

var game = new Phaser.Game(config);

