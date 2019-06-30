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
    constructor(scene, x, y, type, scale, rotation, health, damage, speed, score, scalefactor) {
        super(scene, x, y, type, scale, rotation, health, damage);
        this.scene = scene;
        this.speed = speed;
        this.scalefactor = scalefactor;
        this.setDepth(3);
        this.body.setVelocity(speed * scalefactor, speed * scalefactor, 0);
        this.score = score;
        scene.add.existing(this);
        this.shield = scene.add.sprite(this.x + this.width / 2, 0, 'joltshield');
        this.shield.setOrigin(0.5, 0.5);
        this.shield.setScale(scalefactor);
        this.shield.setDepth(3);
        this.weapon = scene.add.sprite(this.x, 0, 'joltweapon');
        this.weapon.setOrigin(0.5, 0.5);
        this.weapon.setScale(scalefactor);
        this.weapon.setDepth(3);
        this.forcefield = this.scene.add.sprite(this.x, this.y, 'joltforcefield');
        this.forcefield.setOrigin(0.5, 0.5);
        this.forcefield.setScale(1.5 * this.scalefactor);
        this.scene.physics.world.enable(this.forcefield);
        this.forcefield.body.setBounce(0, 0);
        this.forcefield.setDepth(4);
        this.disableForcefield();
        this.scene = scene;
        this.lastFired = 0;

        this.forceFX = scene.sound.add('forcefield');

        this.scene.anims.create({
            key: 'movejolt',
            frames: this.scene.anims.generateFrameNumbers('jolt', { start: 0, end: 5 }),
            frameRate: 10,
            repeat: -1
        });

        this.scene.anims.create({
            key: 'diejolt',
            frames: this.scene.anims.generateFrameNumbers('jolt', { start: 6, end: 11 }),
            frameRate: 10,
            repeat: 0
        });
    }

    /** Actives the shield */
    activeForcefield() {
        this.isForceFieldOn = true;
        if (this.forcefield) {
            this.forcefield.setVisible(true);
            this.forcefield.setActive(true);
            this.forcefield.setScale(1.5 * this.scalefactor);
            if ( this.forcefield.body ) { this.forcefield.body.setCircle(85, -21, -21); }
        }
    }

    /** Deactivates the shield */
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
        this.anims.play('movejolt', true);
        this.shield.x = this.x + this.width * this.scalefactor / 3;
        this.shield.y = this.y;
        this.weapon.x = this.x;
        this.weapon.y = this.y - this.height * this.scalefactor / 3;
        if (this.isForceFieldOn && this.forcefield) {
            this.forcefield.x = this.x;
            this.forcefield.y = this.y;
        }
        let angle = Phaser.Math.Angle.Between(this.x, this.y, target.x + this.scene.cameras.main.scrollX, target.y + this.scene.cameras.main.scrollY);
        let velocity = this.scene.physics.velocityFromRotation(angle, this.speed * this.scalefactor);
        this.body.setVelocity(velocity.x, velocity.y, 0);
    }

    /**
     * Aims at target
     * @param {GameObject} target GameObject the enemy is aiming at 
     */
    aim(target) {
        let turretAngle = Phaser.Math.Angle.Between(this.weapon.x, this.weapon.y, target.x, target.y);
        this.weapon.rotation = turretAngle;
    }

    /** Checks if the shield is to be displayed */
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

    /** Clear enemy elements when destroyed */
    onDestroy() {
        this.body.setVelocity(0,0);
        if (this.isForceFieldOn && this.forcefield) { this.forcefield.destroy(); }
        this.anims.remove('movejolt');
        this.anims.play('diejolt', true);
        setTimeout(() => {
            this.shield.destroy();
            this.weapon.destroy();
            if ( this.activatedTimeOut ) { clearTimeout( this.activatedTimeOut ); }
            this.destroy();
        }, 1000);
    }
}

export default Jolt;