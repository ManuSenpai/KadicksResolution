import Enemy from "./enemy.js"

const TRAIL_TIME = 500;
const TRAIL_DELETE_TIME = 6000;
class Trashbot extends Enemy {
    trashFace;
    currentVelocity;
    trailgroup;
    trailAnimation;
    trailInterval;
    scene;
    alive = true;
    constructor(scene, x, y, type, scale, rotation, health, damage, speed, score) {
        super(scene, x, y, type, scale, rotation, health, damage);
        this.scene = scene;
        this.speed = speed;
        this.score = score;
        scene.add.existing(this);
        this.setRandomAngle();
        this.currentVelocity = scene.physics.velocityFromRotation(this.rotation, this.speed);
        this.body.setVelocity(this.currentVelocity.x, this.currentVelocity.y);
        this.trashFace = scene.add.sprite(this.x, this.y, 'trashbotniceface');
        this.scene.physics.world.enable(this.trashFace);
        this.trailgroup = scene.physics.add.group();
        this.trailInterval = setInterval( () => this.generateTrail(), TRAIL_TIME);

    }

    generateTrail() {
        if (this.alive) {
            let newTrail = this.scene.add.sprite(this.x, this.y, 'trashtrail');
            this.trailgroup.add(newTrail);
            this.trailAnimation = this.scene.tweens.add({
                targets: newTrail,
                ease: 'Power1',
                duration: TRAIL_DELETE_TIME,
                scaleX: 0,
                scaleY: 0,
                onComplete: function () {
                    if ( this.trailgroup ) this.trailgroup.remove(newTrail);
                    newTrail.destroy();
                },
            });
        } else {
            clearInterval( this.trailInterval );
        }
    }

    move() {
        this.body.setVelocity(this.currentVelocity.x, this.currentVelocity.y, 0);
        this.trashFace.x = this.x;
        this.trashFace.y = this.y;
    }

    setRandomAngle() {
        this.angle = Phaser.Math.Between(-60, 60);
    }

    bounceOnWall() {
        if (this.body.touching.left || this.body.touching.right) {
            this.currentVelocity.x *= -1;
        }
        if (this.body.touching.up || this.body.touching.down) {
            this.currentVelocity.y *= -1;
        }
    }

    onDestroy() {
        clearInterval(this.trailInterval);
        this.trashFace.destroy();
        // this.scene.tweens.killTweensOf(this.trailgroup.children.entries);
        let currentTweens = this.scene.tweens.getTweensOf(this.trailgroup.children.entries);
        currentTweens.forEach( (t) => t.complete() );
        this.trailgroup.clear();
        this.trailgroup.destroy();
        this.trailAnimation.data.forEach(element => {
            element.target.destroy();
        });
        this.trailAnimation = null;
        this.alive = false;
    }
}

export default Trashbot;