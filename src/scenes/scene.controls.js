import Laser from '../GameObjects/laser.js';
import LaserTrap from '../GameObjects/lasertrap.js';
var currentLanguage;
var i18n;
const STANDARD_WIDTH = 1536;

const STANDARD_HEIGHT = 720;

var scaleFactor;

var currentText;

var SettingsText = {
    style: {
        fontStyle: 'bold',
        align: 'center'
    }
}

const ACTIVE_COLOR = "#FFDA2F";

var cursors;

var ctrlA, ctrlS, ctrlW, ctrlD;
var ctrlAIns, ctrlSIns, ctrlWIns, ctrlDIns;
var mouseForm, clickL, clickR;
var wFill;
var sFill;
var aFill;
var dFill;
var lcFill;

var attkup;
var rthmup;
var heal;
var maxLife;
var keyCard;

var canvasRect;
var canvasFill;
var lastFired = 0;

var player;

var lasers;

var shootFX;
var playerStats;
var score;
var configScoreText;

class Controls extends Phaser.Scene {

    constructor() {
        super({ key: "Controls" });
    }
    init(data) {
        configScoreText = data.configScoreText;
        playerStats = data.playerStats;
        score = data.score;
        currentLanguage = playerStats.LANGUAGE;
        let scaleHeight = window.innerHeight / STANDARD_HEIGHT;
        let scaleWidth = window.innerWidth / STANDARD_WIDTH;
        scaleFactor = Math.min(scaleHeight, scaleWidth);
    }
    create() {
        window.onresize = () => this.scene.restart();
        shootFX = this.sound.add('laser');
        let currentIndex = 0;

        /* Getting JSON i18n data */
        i18n = this.cache.json.get(currentLanguage);
        this.cameras.main.setBackgroundColor('#880070');

        cursors = this.input.keyboard.addKeys(
            {
                up: Phaser.Input.Keyboard.KeyCodes.W,
                down: Phaser.Input.Keyboard.KeyCodes.S,
                left: Phaser.Input.Keyboard.KeyCodes.A,
                right: Phaser.Input.Keyboard.KeyCodes.D
            });

        var graphics = this.add.graphics({ lineStyle: { width: 2, color: 0x000000 } });
        wFill = this.add.graphics({ fillStyle: { color: 0xffca59 } });
        sFill = this.add.graphics({ fillStyle: { color: 0xffca59 } });
        aFill = this.add.graphics({ fillStyle: { color: 0xffca59 } });
        dFill = this.add.graphics({ fillStyle: { color: 0xffca59 } });
        lcFill = this.add.graphics({ fillStyle: { color: 0xffca59 } });
        canvasFill = this.add.graphics({ fillStyle: { color: 0xffca59 } });
        ctrlW = new Phaser.Geom.Rectangle(window.innerWidth / 8, window.innerHeight / 5, 64 * scaleFactor, 64 * scaleFactor);
        ctrlS = new Phaser.Geom.Rectangle(window.innerWidth / 8, window.innerHeight / 5 + 64 * scaleFactor, 64 * scaleFactor, 64 * scaleFactor);
        ctrlA = new Phaser.Geom.Rectangle(window.innerWidth / 8 - 64 * scaleFactor, window.innerHeight / 5 + 64 * scaleFactor, 64 * scaleFactor, 64 * scaleFactor);
        ctrlD = new Phaser.Geom.Rectangle(window.innerWidth / 8 + 64 * scaleFactor, window.innerHeight / 5 + 64 * scaleFactor, 64 * scaleFactor, 64 * scaleFactor);

        ctrlWIns = new Phaser.Geom.Rectangle(window.innerWidth / 8 + 6 * scaleFactor, window.innerHeight / 5 + 6 * scaleFactor, 50 * scaleFactor, 50 * scaleFactor);
        ctrlSIns = new Phaser.Geom.Rectangle(window.innerWidth / 8 + 6 * scaleFactor, window.innerHeight / 5 + 70 * scaleFactor, 50 * scaleFactor, 50 * scaleFactor);
        ctrlAIns = new Phaser.Geom.Rectangle(window.innerWidth / 8 - 58 * scaleFactor, window.innerHeight / 5 + 70 * scaleFactor, 50 * scaleFactor, 50 * scaleFactor);
        ctrlDIns = new Phaser.Geom.Rectangle(window.innerWidth / 8 + 70 * scaleFactor, window.innerHeight / 5 + 70 * scaleFactor, 50 * scaleFactor, 50 * scaleFactor);

        mouseForm = new Phaser.Geom.Rectangle(window.innerWidth / 8 - 20 * scaleFactor, window.innerHeight * 3 / 4 - 150 * scaleFactor, 100 * scaleFactor, 200 * scaleFactor);
        clickL = new Phaser.Geom.Rectangle(window.innerWidth / 8 - 20 * scaleFactor, window.innerHeight * 3 / 4 - 150 * scaleFactor, 45 * scaleFactor, 75 * scaleFactor);
        clickR = new Phaser.Geom.Rectangle(window.innerWidth / 8 + 35 * scaleFactor, window.innerHeight * 3 / 4 - 150 * scaleFactor, 45 * scaleFactor, 75 * scaleFactor);

        canvasRect = new Phaser.Geom.Rectangle(window.innerWidth * 2 / 3, 25 * scaleFactor, window.innerWidth / 3 - 50 * scaleFactor, window.innerHeight - 50 * scaleFactor);
        canvasFill.fillRectShape(canvasRect);

        graphics.strokeRectShape(ctrlW);
        graphics.strokeRectShape(ctrlS);
        graphics.strokeRectShape(ctrlA);
        graphics.strokeRectShape(ctrlD);

        graphics.strokeRectShape(ctrlWIns);
        graphics.strokeRectShape(ctrlSIns);
        graphics.strokeRectShape(ctrlAIns);
        graphics.strokeRectShape(ctrlDIns);

        graphics.strokeRectShape(mouseForm);
        graphics.strokeRectShape(clickL);
        graphics.strokeRectShape(clickR);

        graphics.strokeRectShape(canvasRect);

        lasers = this.physics.add.group({
            classType: Laser
        });

        this.make.text(SettingsText).setText('W').setX(window.innerWidth / 8 + 32 * scaleFactor).setY(window.innerHeight / 5 + 32 * scaleFactor).setOrigin(0.5);
        this.make.text(SettingsText).setText('S').setX(window.innerWidth / 8 + 32 * scaleFactor).setY(window.innerHeight / 5 + 96 * scaleFactor).setOrigin(0.5);
        this.make.text(SettingsText).setText('A').setX(window.innerWidth / 8 - 32 * scaleFactor).setY(window.innerHeight / 5 + 96 * scaleFactor).setOrigin(0.5);
        this.make.text(SettingsText).setText('D').setX(window.innerWidth / 8 + 96 * scaleFactor).setY(window.innerHeight / 5 + 96 * scaleFactor).setOrigin(0.5);

        this.make.text(SettingsText).setText(i18n.CONTROLS.MOVEMENT)
            .setFontSize(30 * scaleFactor)
            .setX(window.innerWidth / 8 + 32 * scaleFactor)
            .setY(window.innerHeight / 6 - 20 * scaleFactor)
            .setOrigin(0.5);

        this.make.text(SettingsText).setText(i18n.CONTROLS.SHOOT)
            .setFontSize(30 * scaleFactor)
            .setX(window.innerWidth / 8 + 32 * scaleFactor)
            .setY(window.innerHeight / 2 - 32 * scaleFactor)
            .setOrigin(0.5);

        this.make.text(SettingsText).setText(i18n.CONTROLS.POWERUPS)
            .setFontSize(30 * scaleFactor)
            .setX(window.innerWidth / 2 - 32 * scaleFactor)
            .setY(window.innerHeight / 6 - 20 * scaleFactor)
            .setOrigin(0.5);

        player = this.physics.add.sprite(window.innerWidth * 3 / 4, window.innerHeight / 2, 'player');
        player.setScale(0.25 * scaleFactor);

        attkup = this.physics.add.sprite(window.innerWidth / 3, window.innerHeight / 4, 'powup-attk');
        attkup.setScale(scaleFactor);
        this.make.text(SettingsText).setText(i18n.CONTROLS.ATTKUP)
            .setFontSize(30 * scaleFactor)
            .setX(window.innerWidth / 3 + 64 * scaleFactor)
            .setY(window.innerHeight / 4);
        rthmup = this.physics.add.sprite(window.innerWidth / 3, window.innerHeight / 4 + 96 * scaleFactor, 'powup-rthm');
        rthmup.setScale( scaleFactor );
        this.make.text(SettingsText).setText(i18n.CONTROLS.RTHMUP)
            .setFontSize(30 * scaleFactor)
            .setX(window.innerWidth / 3 + 64 * scaleFactor)
            .setY(window.innerHeight / 4 + 96 * scaleFactor);
        heal = this.physics.add.sprite(window.innerWidth / 3, window.innerHeight / 2, 'medikit');
        heal.setScale( scaleFactor );
        this.make.text(SettingsText).setText(i18n.CONTROLS.HEAL)
            .setFontSize(30 * scaleFactor)
            .setX(window.innerWidth / 3 + 64 * scaleFactor)
            .setY(window.innerHeight / 2);
        maxLife = this.physics.add.sprite(window.innerWidth / 3, window.innerHeight / 2 + 96 * scaleFactor, 'lifeup');
        maxLife.setScale( scaleFactor );
        this.make.text(SettingsText).setText(i18n.CONTROLS.MAXLIFEUP)
            .setFontSize(30 * scaleFactor)
            .setX(window.innerWidth / 3 + 64 * scaleFactor)
            .setY(window.innerHeight / 2 + 64 * scaleFactor);

        keyCard = this.physics.add.sprite(window.innerWidth / 3, window.innerHeight * 3 / 4 + 64 * scaleFactor, 'keycard');
        keyCard.setScale(0.15 * scaleFactor);
        this.make.text(SettingsText).setText(i18n.CONTROLS.KEYS)
            .setFontSize(30 * scaleFactor)
            .setX(window.innerWidth / 3 + 64 * scaleFactor)
            .setY(window.innerHeight * 3 / 4 + 24 * scaleFactor);
        this.make.text(SettingsText).setText(i18n.CONTROLS.BACK)
            .setInteractive()
            .on('pointerdown', () => { this.scene.start("Main_Menu", { score: score, configScoreText: configScoreText, playerStats: playerStats }) })
            .setFontSize(30 * scaleFactor)
            .setX(64 * scaleFactor)
            .setY(window.innerHeight - 75 * scaleFactor)

    }

    update(time, delta) {

        let cursor = this.input.mousePointer;
        let angle = Phaser.Math.Angle.Between(player.x, player.y, cursor.x + this.cameras.main.scrollX, cursor.y + this.cameras.main.scrollY);
        player.rotation = angle;

        if (cursors.left.isUp) {
            if (player.body.velocity.x < 0) { player.setVelocityX(0); }
            aFill.clear();
        }
        if (cursors.right.isUp) {
            if (player.body.velocity.x > 0) { player.setVelocityX(0); }
            dFill.clear();
        }
        if (cursors.up.isUp) {
            if (player.body.velocity.y < 0) { player.setVelocityY(0); }
            wFill.clear();
        }
        if (cursors.down.isUp) {
            if (player.body.velocity.y > 0) { player.setVelocityY(0); }
            sFill.clear();
        }
        if (cursors.left.isDown) {
            if (player.x > window.innerWidth * 2 / 3 + 30 * scaleFactor) { player.setVelocityX(-400 * scaleFactor); } else { player.setVelocityX(0); }
            aFill.fillRectShape(ctrlA);
        }
        if (cursors.right.isDown) {
            dFill.fillRectShape(ctrlD);
            if (player.x < window.innerWidth - 75 * scaleFactor) { player.setVelocityX(400 * scaleFactor); } else { player.setVelocityX(0); }
        }
        if (cursors.up.isDown) {
            wFill.fillRectShape(ctrlW);
            if (player.y > 50 * scaleFactor) { player.setVelocityY(-400 * scaleFactor); } else { player.setVelocityY(0); }
        }
        if (cursors.down.isDown) {
            sFill.fillRectShape(ctrlS);
            if (player.y < window.innerHeight - 50 * scaleFactor) { player.setVelocityY(400 * scaleFactor ); } else { player.setVelocityY(0); }
        }

        if (this.input.activePointer.isDown) {
            if (time > lastFired) {
                shootFX.play();
                var velocity = this.physics.velocityFromRotation(angle, playerStats.LASER_SPEED);
                var currentLaser = new Laser(this, player.x, player.y, 'laser', 0.5 * scaleFactor, angle, velocity, '0xff38c0', playerStats.DAMAGE);
                lasers.add(currentLaser);
                lastFired = time + playerStats.FIRE_RATE;
            }
            lcFill.fillRectShape(clickL);
        }
        this.input.on('pointerup', function (pointer) {
            lcFill.clear();
        });

        lasers.children.iterate((laser) => {
            if (laser) {
                laser.move(delta);
                if (laser.x < window.innerWidth * 2 / 3 + 30 * scaleFactor ||
                    laser.x > window.innerWidth - 75 * scaleFactor ||
                    laser.y < 50 * scaleFactor || laser.y > window.innerHeight - 75 * scaleFactor) { laser.destroy(); }
            } else {
                lasers.remove(laser);
            }
        });

    }

}

export default Controls;