import Enemy from "./enemy.js";

const TIME_BETWEEN_CHARGES = 2500;
const STUN_TIME = 2000;

class Coulomb extends Enemy {
    target;
    chargeTarget;
    speed;

    isCharging;
    isStunned;

    deltaX;
    deltaY;

    chargeTimeOut;
    stunTimeOut;

    constructor(scene, x, y, type, scale, rotation, health, damage, speed, score) {
        super(scene, x, y, type, scale, rotation, health, damage, true);
        this.scene = scene;
        this.score = score;
        this.speed = speed;
        scene.add.existing(this);
        // this.setMaxVelocity(this.speed, this.speed);
        this.body.maxVelocity.x = this.speed;
        this.body.maxVelocity.y = this.speed;
        this.body.bounce.x = 1;
        this.body.bounce.y = 1;
        this.body.setSize(this.body.width / 2, this.body.height / 2);
        this.body.setOffset(this.body.width / 2, this.body.height / 2);
        this.chargeTimeOut = setTimeout(this.startCharge.bind(this), TIME_BETWEEN_CHARGES);
        this.isCharging = false;
        this.isStunned = false;
    }

    /**
     * Defines the target for the enemy
     * @param {GameObject} target The gameobject that will be the target
     */
    setTarget(target) {
        this.target = target;
    }

    /**
     * Aims for an specific target changing the rotation of the element.
     * @param {GameObject} target The element that the enemy will be aiming for
     */
    aim() {
        let currentAngle = Phaser.Math.Angle.Between(this.x, this.y, this.target.x, this.target.y);
        this.rotation = currentAngle;
    }

    /**
     * The enemy charges against defined target
     * @param {GameObject} target The element that the enemy will be charging against
     */
    startCharge() {
        this.isCharging = true;
        this.chargeTarget = this.target;
        // this.scene.physics.moveToObject(this, this.chargeTarget, this.speed);
        // moveTo.on('complete', function(gameObject, moveTo){});
    }

    move() {
        this.body.setAcceleration(this.speed * Math.cos(this.rotation), this.speed * Math.sin(this.rotation));
    }

    crashIntoWall() {
        this.body.setVelocity(0, 0);
        this.body.setAcceleration(0, 0);
        this.isCharging = false;
        this.isStunned = true;
        this.goBackToField();
        clearTimeout(this.chargeTimeOut);

        setTimeout(() => {
            this.isStunned = false;
            this.chargeTimeOut = setTimeout(this.startCharge.bind(this), TIME_BETWEEN_CHARGES);
        }, STUN_TIME);
    }

    goBackToField() {
        if ((this.x - this.width / 2) < 128) { this.x = 129; }
        if ((this.x + this.width / 2) > window.innerWidth - 128) { this.x = window.innerWidth - 129; }
        if ((this.y - this.height / 2) < 128) { this.y = 129; }
        if ((this.y + this.height / 2) > window.innerHeight - 135) { this.y = window.innerHeight - 135; }
    }
}

export default Coulomb;