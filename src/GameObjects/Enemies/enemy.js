class Enemy extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, type, scale, rotation, health, damage) {
        super(scene, x, y, type);
        scene.physics.world.enable(this);
        this.setOrigin(0.5, 0.5);
        this.rotation = rotation;
        this.body.updateCenter();
        this.setScale(scale);
        this.body.updateBounds();
        this.body.bounce.setTo(10, 10);
        this.health = health;
        this.damage = damage;
    }
}

export default Enemy;