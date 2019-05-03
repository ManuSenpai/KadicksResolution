class Laser extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, type, scale, rotation, velocity, color = null, damage) {
        super(scene, x, y, type);
        scene.physics.world.enable(this);
        this.setOrigin(0.5, 0.5);
        this.rotation = rotation;
        this.body.updateCenter();
        this.setScale(scale);
        this.body.setSize(this.body.width/2, this.body.height);
        this.body.setOffset( this.body.width/2, this.body.height/2);
        this.body.updateBounds()
        this.velocity = velocity;
        this.damage = damage;
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
            this.destroy();
        }
    }
}

export default Laser;