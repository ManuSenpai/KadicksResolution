class Enemy extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, type, scale, rotation, health, damage) {
        super(scene, x, y, type);
        scene.physics.world.enable(this);
        this.setScale(scale);
        this.setOrigin(0.5, 0.5);
        this.rotation = rotation;
        this.health = health;
        this.damage = damage;
        scene.add.existing(this);
    }
}

export default Enemy;