import Enemy from "./enemy.js"

class Scancatcher extends Enemy {
    constructor(scene, x, y, type, scale, rotation, health, damage, speed, score) {
        super(scene, x, y, type, scale, rotation, health, damage);
        this.scene = scene;
        this.speed = speed;
        this.body.setVelocity( speed, speed, 0);
        this.score = score;
        scene.add.existing(this);

        this.scene.anims.create({
            key: 'move',
            frames: this.scene.anims.generateFrameNumbers('scancatcher1', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });
    }

    /**
     * Moves the Scancatcher to the defined target
     * @param target Gameobject: Target that the enemy will chase
     */
    move(target) {
        this.anims.play('move', true);
        let angle = Phaser.Math.Angle.Between(this.x, this.y, target.x + this.scene.cameras.main.scrollX, target.y + this.scene.cameras.main.scrollY);
        let velocity = this.scene.physics.velocityFromRotation(angle, this.speed);
        this.body.setVelocity( velocity.x, velocity.y, 0);
    }
}

export default Scancatcher;