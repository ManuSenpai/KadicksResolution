import Enemy from "./enemy.js"

class Boss1 extends Enemy {
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
}

export default Boss1;