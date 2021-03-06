import Enemy from "./enemy.js";

const CROSS_SPEED = 500;

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

    constructor(scene, x, y, type, scale, rotation, health, damage, speed, score, scaleFactor) {
        super(scene, x, y, type, scale, rotation, health, damage);
        this.scene = scene;
        scene.physics.world.enable(this);
        this.scaleFactor = scaleFactor;
        this.setScale(scale);
        this.setOrigin(0.5, 0.5);
        this.rotation = rotation;
        this.speed = speed;
        this.body.bounce.setTo(10, 10);
        this.score = score;
        scene.add.existing(this);
        this.flares = this.scene.add.particles('flares');
        this.beamGraphics = scene.add.graphics({ lineStyle: { width: 15 * this.scaleFactor, color: 0xd1fcff } });
        this.rotGroup = this.scene.physics.add.group();
        this.staticFX = this.scene.sound.add('elecestatica');
        this.railgun2FX = this.scene.sound.add('railgun2');
        this.whooshFX = this.scene.sound.add('whoosh');


        this.lastFired = 0;
        setTimeout(() => {
            this.rotatable1 = this.scene.physics.add.sprite(this.x, this.y, 'boss2rotatable');
            this.rotatable1.setScale(this.scaleFactor);
            this.rotatable2 = this.scene.physics.add.sprite(this.x, this.y, 'boss2rotatable');
            this.rotatable2.setScale(this.scaleFactor);
            this.rotGroup.add(this.rotatable1);
            this.rotGroup.add(this.rotatable2);
            this.botrg = this.scene.physics.add.sprite(this.x, this.y, 'boss2botrg');
            this.botrg.setScale(this.scaleFactor);
            this.toprg = this.scene.physics.add.sprite(this.x, this.y, 'boss2toprg');
            this.toprg.setScale(this.scaleFactor);
            this.deployRailguns();
            this.crossRotatables(this.rotatable1, 0, 32 * this.scaleFactor, window.innerHeight / 2);
            this.crossRotatables(this.rotatable2, 1, window.innerWidth - 32 * this.scaleFactor, window.innerHeight / 2);
        }, 3000);
    }

    /** Sets target */
    setTarget(target) {
        this.target = target;
    }

    /** Returns boomerangs */
    getRotatables() {
        return this.rotGroup;
    }

    /** Deploy railgun sprites and sets them in position */
    deployRailguns() {
        this.deployTopRGAnimation = this.scene.tweens.add({
            targets: this.toprg,
            ease: 'Power1',
            duration: CROSS_SPEED,
            x: window.innerWidth / 2,
            y: 64 * this.scaleFactor
        });
        this.deployBotRGAnimation1 = this.scene.tweens.add({
            targets: this.botrg,
            ease: 'Power1',
            duration: CROSS_SPEED,
            x: window.innerWidth / 2,
            y: window.innerHeight - 64 * this.scaleFactor
        });

    }

    /**
     * Allows the Boss' movement
     * @param {GameObject} player Player's Game Object 
     */
    move(player) {
        if (this.botrg && this.toprg) {
            if (this.botrg.x < (player.x - 10 * this.scaleFactor)) {
                this.botrg.body.setVelocityX(this.speed * 3);
            } else if (this.botrg.x > (player.x + 10 * this.scaleFactor)) {
                this.botrg.body.setVelocityX(-this.speed * 3);
            } else {
                if (!this.shootingRg) {
                    this.shootingRg = true;
                    setTimeout(() => this.loadAndShoot(), 500);

                }
            }
            this.toprg.x = this.botrg.x;
            if (this.emitters[0] && this.emitters[1]) {
                this.emitters[0].setPosition(this.toprg.x, this.botrg.y);
                this.emitters[1].setPosition(this.toprg.x, this.toprg.y);
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
        this.staticFX.play();
        this.emitters.push(this.flares.createEmitter({
            x: this.botrg.x,
            y: this.botrg.y,
            angle: -90,
            speed: { min: 100 * this.scaleFactor, max: -500 * this.scaleFactor },
            gravityY: 400 * this.scaleFactor,
            scale: { start: 0.2, end: 0.2 },
            lifespan: 200,
            blendMode: 'ADD',
            tint: [0xf200ff, 0xfcd8ff]
        }));

        this.emitters.push(this.flares.createEmitter({
            x: this.toprg.x,
            y: this.toprg.y,
            angle: 90,
            speed: { min: 100 * this.scaleFactor, max: -500 * this.scaleFactor },
            gravityY: 400 * this.scaleFactor,
            scale: { start: 0.2, end: 0.2 },
            lifespan: 200,
            blendMode: 'ADD',
            tint: [0xf200ff, 0xfcd8ff]
        }));

        setTimeout(() => this.shootBeam(), 1000);
    }

    /**
     * Makes the rotatables cross the scene.
     * @param {number} object affected object
     * @param {number} id animation id
     * @param {number} _x x coordinate 
     * @param {number} _y y coordinate
     */
    crossRotatables(object, id, _x, _y) {
        this.whooshFX.play();
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
        if (xCoord < 64 * this.scaleFactor) return window.innerWidth - 32 * this.scaleFactor;
        else return 32 * this.scaleFactor;
    }

    /** Clear boss elements when destroyed */
    onDestroy() {
        this.rotAnimations.forEach((anim) => {
            anim.complete();
        });
        if (this.timeouts[0]) clearTimeout(this.timeouts[0]);
        if (this.timeouts[1]) clearTimeout(this.timeouts[1]);
        this.rotatable1.destroy();
        this.rotatable2.destroy();
        if (this.followers[0]) this.followers[0].forEach((f) => f.destroy());
        if (this.followers[1]) this.followers[1].forEach((f) => f.destroy());
        this.followers = [];
        if ( this.paths[0]) this.paths[0].destroy();
        if ( this.paths[1]) this.paths[1].destroy();
        this.paths = [];
        this.toprg.destroy();
        this.botrg.destroy();
        if (this.emitters) {
            this.emitters.forEach((emitter) => {
                emitter.killAll();
                emitter.stop();
            });
        }

    }

    /** Shoots beam */
    shootBeam(targetPoint) {
        this.railgun2FX.play();
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
    }
}

export default Boss2;