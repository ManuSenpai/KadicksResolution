import Enemy from "./enemy.js";
import Turret from "../turret.js";

const CROSS_SPEED = 500;
// const MAX_ANGLE_SPREAD = 45;

class Boss2 extends Enemy {
    lastFired;

    rotatable1;
    rotatable2;
    rotGroup;

    emitters = [];
    followers = [];
    paths = [];
    flares;
    beamGraphics;
    beamLine;

    toprg;
    botrg;
    deployTopRGAnimation;
    deployBotRGAnimation1;
    rotAnimations = new Array(2);
    shootAnimations = new Array(2);
    railgunsActive = false;
    shootingRg = false;

    reverseCross = false;
    timeouts = new Array(2);

    fireRate = 300;

    deltaRot = 0;

    target;

    constructor(scene, x, y, type, scale, rotation, health, damage, speed, score) {
        super(scene, x, y, type, scale, rotation, health, damage);
        this.scene = scene;
        scene.physics.world.enable(this);
        this.setScale(scale);
        this.setOrigin(0.5, 0.5);
        this.rotation = rotation;
        this.speed = speed;
        this.body.bounce.setTo(10, 10);
        this.score = score;
        scene.add.existing(this);
        this.flares = this.scene.add.particles('flares');
        this.beamGraphics = scene.add.graphics({ lineStyle: { width: 15, color: 0xd1fcff } });
        this.rotGroup = this.scene.physics.add.group();
        

        this.lastFired = 0;
        setTimeout(() => {
            this.rotatable1 = this.scene.physics.add.sprite(this.x, this.y, 'boss2rotatable');
            this.rotatable2 = this.scene.physics.add.sprite(this.x, this.y, 'boss2rotatable');
            this.rotGroup.add(this.rotatable1);
            this.rotGroup.add(this.rotatable2);
            this.botrg = this.scene.physics.add.sprite(this.x, this.y, 'boss2botrg');
            this.toprg = this.scene.physics.add.sprite(this.x, this.y, 'boss2toprg');
            this.deployRailguns();
            this.crossRotatables(this.rotatable1, 0, 32, window.innerHeight / 2);
            this.crossRotatables(this.rotatable2, 1, window.innerWidth - 32, window.innerHeight / 2);
        }, 3000);
    }

    setTarget(target) {
        this.target = target;
    }

    getRotatables() {
        return this.rotGroup;
    }
    deployRailguns() {
        this.deployTopRGAnimation = this.scene.tweens.add({
            targets: this.toprg,
            ease: 'Power1',
            duration: CROSS_SPEED,
            x: window.innerWidth / 2,
            y: 64
        });
        this.deployBotRGAnimation1 = this.scene.tweens.add({
            targets: this.botrg,
            ease: 'Power1',
            duration: CROSS_SPEED,
            x: window.innerWidth / 2,
            y: window.innerHeight - 64
        });

    }

    /**
     * Allows the Boss' movement
     * @param {GameObject} player Player's Game Object 
     */
    move(player) {
        if (this.botrg && this.toprg) {
            if (this.botrg.x < (player.x - 10)) {
                this.botrg.body.setVelocityX(this.speed * 3);
            } else if (this.botrg.x > (player.x + 10)) {
                this.botrg.body.setVelocityX(-this.speed * 3);
            } else {
                if (!this.shootingRg) {
                    this.shootingRg = true;
                    setTimeout(() => this.loadAndShoot(), 500);
                    
                }
            }
            this.toprg.x = this.botrg.x;
            if ( this.emitters[0] && this.emitters[1]) {
                this.emitters[0].setPosition( this.toprg.x, this.botrg.y);
                this.emitters[1].setPosition( this.toprg.x, this.toprg.y);
            }

        }

        if (this.x <= player.x) {
            this.body.setVelocityX(this.speed);
        } else {
            this.body.setVelocityX(-this.speed);
        }
    }

    /** Load railguns and shoot */
    loadAndShoot() {
        this.emitters.push(this.flares.createEmitter({
            x: this.botrg.x,
            y: this.botrg.y,
            angle: -90,
            speed: { min: 100, max: -500 },
            gravityY: 400,
            scale: { start: 0.2, end: 0.2 },
            lifespan: 200,
            blendMode: 'ADD',
            tint: [0xf200ff, 0xfcd8ff]
        }));

        this.emitters.push(this.flares.createEmitter({
            x: this.toprg.x,
            y: this.toprg.y,
            angle: 90,
            speed: { min: 100, max: -500 },
            gravityY: 400,
            scale: { start: 0.2, end: 0.2 },
            lifespan: 200,
            blendMode: 'ADD',
            tint: [0xf200ff, 0xfcd8ff]
        }));

        setTimeout(() => this.shootBeam(), 1000);
    }

    /**
     * Makes the rotatables cross the scene.
     * @param {number} object objeto afectado 
     * @param {number} id id de animación 
     * @param {number} _x x coordinate 
     * @param {number} _y y coordinate
     */
    crossRotatables(object, id, _x, _y) {
        this.rotAnimations[id] = this.scene.tweens.add({
            targets: object,
            ease: 'Power1',
            duration: CROSS_SPEED,
            x: _x,
            y: _y,
            onComplete: () => this.goToNextLocation(object, id)
        });
    }

    /**
     * Moves object vertically to a random location
     * @param {Object} object target object that will move vertically 
     */
    goToNextLocation(object, id) {
        let newLocation = this.target.y + Phaser.Math.Between(-64, 64);
        if (this.scene) {
            this.rotAnimations[id] = this.scene.tweens.add({
                targets: object,
                ease: 'Power1',
                duration: CROSS_SPEED,
                y: newLocation,
                onComplete: () => {
                    this.timeouts[id] = setTimeout(() => this.crossRotatables(object, id, this.getOppositeX(object.x), object.y), 500);
                }
            });
        }
    }

    /**
     * Returns the x corresponding to the opposite side of the screen
     * @param {number} xCoord current X coordinate 
     */
    getOppositeX(xCoord) {
        if (xCoord < 64) return window.innerWidth - 32;
        else return 32;
    }

    onDestroy() {
        this.rotAnimations.forEach((anim) => {
            anim.complete();
        });
        if (this.timeouts[0]) clearTimeout(this.timeouts[0]);
        if (this.timeouts[1]) clearTimeout(this.timeouts[1]);
        this.rotatable1.destroy();
        this.rotatable2.destroy();
        this.followers[0].forEach((f) => f.destroy());
        this.followers[1].forEach((f) => f.destroy());
        this.followers = [];
        this.paths[0].destroy();
        this.paths[1].destroy();
        this.paths = [];

    }

    shootBeam(targetPoint) {
        this.emitters.forEach((emitter) => {
            emitter.killAll();
            emitter.stop();
        });
        this.emitters = [];
        let newBeam = new Phaser.Curves.Path(this.toprg.x, this.toprg.y);
        let distanceBetweenRG = this.botrg.y - this.toprg.y;
        let interval = distanceBetweenRG / 16;
        for (var i = 0; i < 8; i++) {
            if (i % 2 === 0) {
                newBeam.ellipseTo(20, interval, 270, 90, true, 0);
            }
            else {
                newBeam.ellipseTo(20, interval, 270, 90, false, 0);
            }
        }

        let newGroupOfFollowers = [];

        for (var i = 0; i < 20; i++) {
            var follower = this.scene.add.follower(newBeam, 100, 100 + (30 * i), 'flares');
            follower.setBlendMode(Phaser.BlendModes.ADD);
            follower.setScale(0.5);

            follower.startFollow({
                duration: 1000,
                positionOnPath: true,
                repeat: -1,
                ease: 'Linear',
                delay: i * 70
            });
            newGroupOfFollowers.push(follower);
        }


        if (this.paths && this.paths.length < 2) {
            this.paths.push(newBeam);
            this.followers.push(newGroupOfFollowers);
        } else {
            this.followers[0].forEach((f) => f.destroy());
            this.followers.shift();
            this.paths[0].destroy();
            this.paths.shift();
            this.paths.push(newBeam);
            this.followers.push(newGroupOfFollowers);
        }

        setTimeout(() => {
            this.shootingRg = false;
        }, 3000);

        // this.beamLine = new Phaser.Geom.Line(this.toprg.x, this.toprg.y, this.botrg.x, this.botrg.y);
        // this.beamLine.active = true;
    }
}

export default Boss2;