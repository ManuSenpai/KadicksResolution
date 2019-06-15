import Enemy from "./enemy.js"

class Jolt extends Enemy {
    shield;
    weapon;
    forcefield;
    isForceFieldOn = false;
    hitCounter = 0;
    activatedTimeOut;
    shieldTime = 3000;
    scene;
    lastFired;
    constructor(scene, x, y, type, scale, rotation, health, damage, speed, score) {
        super(scene, x, y, type, scale, rotation, health, damage);
        this.scene = scene;
        this.speed = speed;
        this.body.setVelocity(speed, speed, 0);
        this.score = score;
        scene.add.existing(this);
        this.shield = scene.add.sprite(this.x + this.width / 2, 0, 'joltshield');
        this.weapon = scene.add.sprite(this.x, 0, 'joltweapon');
        this.forcefield = this.scene.add.sprite(this.x, this.y, 'joltforcefield');
        this.forcefield.setOrigin(0.5, 0.5);
        this.forcefield.setScale(1.5);
        this.scene.physics.world.enable(this.forcefield);
        this.forcefield.body.setBounce(0, 0);
        this.disableForcefield();
        this.scene = scene;
        this.lastFired = 0;

        this.forceFX = scene.sound.add('forcefield');
    }

    activeForcefield() {
        this.isForceFieldOn = true;
        if (this.forcefield) {
            this.forcefield.setVisible(true);
            this.forcefield.setActive(true);
            this.forcefield.setScale(1.5);
            if ( this.forcefield.body ) { this.forcefield.body.setCircle(85, -21, -21); }
        }
    }

    disableForcefield() {
        this.isForceFieldOn = false;
        if (this.forcefield) {
            this.forcefield.setVisible(false);
            this.forcefield.setActive(false);
            this.forcefield.setScale(0);
            if ( this.forcefield.body ) { this.forcefield.body.setCircle(0); }
        }
    }

    /**
     * Moves the Scancatcher to the defined target
     * @param target Gameobject: Target that the enemy will chase
     */
    move(target) {
        this.shield.x = this.x + this.width / 3;
        this.shield.y = this.y;
        this.weapon.x = this.x;
        this.weapon.y = this.y - this.height / 3;
        if (this.isForceFieldOn && this.forcefield) {
            this.forcefield.x = this.x;
            this.forcefield.y = this.y;
        }
        let angle = Phaser.Math.Angle.Between(this.x, this.y, target.x + this.scene.cameras.main.scrollX, target.y + this.scene.cameras.main.scrollY);
        let velocity = this.scene.physics.velocityFromRotation(angle, this.speed);
        this.body.setVelocity(velocity.x, velocity.y, 0);
    }

    aim(target) {
        let turretAngle = Phaser.Math.Angle.Between(this.weapon.x, this.weapon.y, target.x, target.y);
        this.weapon.rotation = turretAngle;
    }

    hit() {
        if (!this.isForceFieldOn) {
            this.hitCounter++;
            if (this.hitCounter >= 3) {
                this.hitCounter = 0;
                this.activeForcefield();
                this.forceFX.play();
                this.activatedTimeOut = setTimeout(this.disableForcefield.bind(this), this.shieldTime);
            }
        }
    }

    onDestroy() {
        this.shield.destroy();
        this.weapon.destroy();
        if (this.isForceFieldOn && this.forcefield) { this.forcefield.destroy(); }
    }
}

export default Jolt;