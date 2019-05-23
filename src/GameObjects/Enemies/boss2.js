import Enemy from "./enemy.js";
import Turret from "../turret.js";

const CROSS_SPEED = 500;
// const MAX_ANGLE_SPREAD = 45;

class Boss2 extends Enemy {
    lastFired;

    rotatable1;
    rotatable2;
    rotAnimations = new Array(2);
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

        this.lastFired = 0;
        setTimeout(() => {
            this.rotatable1 = this.scene.physics.add.sprite(this.x, this.y, 'boss2rotatable');
            this.rotatable2 = this.scene.physics.add.sprite(this.x, this.y, 'boss2rotatable');
            this.crossRotatables(this.rotatable1, 0, 32, window.innerHeight / 2);
            this.crossRotatables(this.rotatable2, 1, window.innerWidth - 32, window.innerHeight / 2);
        }, 3000);
    }

    setTarget(target) {
        this.target = target;
    }

    /**
     * Allows the Boss' movement
     * @param {GameObject} player Player's Game Object 
     */
    move(player) {
        if (this.x <= player.x) {
            this.body.setVelocityX(this.speed);
        } else {
            this.body.setVelocityX(-this.speed);
        }
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
        if (this.timeouts[0]) clearTimeout( this.timeouts[0] );
        if (this.timeouts[1]) clearTimeout( this.timeouts[1] );
        this.rotatable1.destroy();
        this.rotatable2.destroy();

    }

    shootBeam(targetPoint) {

    }
}

export default Boss2;