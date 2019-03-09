import Enemy from "./enemy.js"

class Scancatcher extends Enemy {
    constructor(scene, x, y, type, scale, rotation, health, damage, speed, score) {
        super(scene, x, y, type, scale, rotation, health, damage);
        this.scene = scene;
        scene.physics.world.enable(this);
        this.setScale(scale);
        this.setOrigin(0.5, 0.5);
        this.rotation = rotation;
        this.speed = speed;
        this.body.bounce.setTo(10, 10);
        this.body.setVelocity( speed, speed, 0);
        this.score = score;
        scene.add.existing(this);
    }

    /**
     * Moves the Scancatcher to the defined target
     * @param target Gameobject: Target that the enemy will chase
     */
    move(target) {
        let angle = Phaser.Math.Angle.Between(this.x, this.y, target.x + this.scene.cameras.main.scrollX, target.y + this.scene.cameras.main.scrollY);
        let velocity = this.scene.physics.velocityFromRotation(angle, this.speed);
        this.body.setVelocity( velocity.x, velocity.y, 0);
    }
}

export default Scancatcher;