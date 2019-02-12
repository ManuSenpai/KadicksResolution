class Turret extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, type, scale, angle, health, damage) {
        super(scene, x, y, type);
        this.setScale(scale);
        this.setOrigin(0.5, 0.5);
        this.health = health;
        this.damage = damage;
        this.lastFired = 0;
        this.angle = 0;
        scene.add.existing(this);
    }
}

export default Turret;