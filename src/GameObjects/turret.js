class Turret extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, type, scale, health, damage) {
        super(scene, x, y, type);
        this.setScale(scale);
        this.setOrigin(0.25, 0.5);
        this.health = health;
        this.damage = damage;
        this.lastFired = 0;
        scene.add.existing(this);
        scene.physics.world.enable(this);
    }
    setLastFired( newTime ){
        this.lastFired = newTime;
    }
    getLastFired( newTime ){
        return this.lastFired;
    }
}

export default Turret;