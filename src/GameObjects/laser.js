class Laser extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, type, scale, rotation, velocity, color = null) {
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
    move(delta) {
        this.x += this.velocity.x * delta;
        this.y += this.velocity.y * delta;
        if( this.x < 0 || this.y < 0 || this.x > window.innerWidth || this.y > window.innerHeight ) {
            this.setVisible(false);
            this.setActive(false);
        }
    }
}

export default Laser;