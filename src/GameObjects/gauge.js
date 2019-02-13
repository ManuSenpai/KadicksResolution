class Gauge extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, width, height, color, maxValue) {
        super(scene, x, y, type);
        scene.physics.world.enable(this);
        this.setScale(scale);
        this.setOrigin(0.5, 0.5);
        this.rotation = rotation;
        this.velocity = velocity;
        if ( color ) { this.setTint(color); }
        scene.add.existing(this);
        this.body.setVelocityX( velocity.x );
        this.body.setVelocityY( velocity.y );
    }
}

export default Gauge;