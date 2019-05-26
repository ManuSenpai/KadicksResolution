import Enemy from "./enemy.js"

const TRAIL_TIME = 350;
const FIRE_INTERVAL_TIME = 10000;
const WAVE_RADIUS = 200;
class Wavebender extends Enemy {
    scene;
    circle;
    graphics;
    opacityTween;
    circleTween;
    target;
    resetWaveTimeout;
    constructor(scene, x, y, type, scale, rotation, health, damage, speed, score) {
        super(scene, x, y, type, scale, rotation, health, damage);
        this.scene = scene;
        this.speed = speed;
        this.score = score;
        scene.add.existing(this);
        this.fireWave();
        this.setDepth(2);

    }

    getCircles() {
        return this.circle;
    }

    setTarget(target) {
        this.target = target;
    }

    fireWave() {
        this.circle = new Phaser.Geom.Circle(this.x, this.y, this.width / 4, 0x00f2ff);
        this.graphics = this.scene.add.graphics({ lineStyle: { color: 0x00f2ff } });
        let opacity = 1.0;
        this.graphics.fillStyle(0x00f2ff, opacity);

        this.opacityTween = this.scene.tweens.add({
            targets: this.graphics,
            alpha: 0,
            duration: 1500,
            repeat: -1
        })

        this.circleTween = this.scene.tweens.add({
            targets: this.circle,
            radius: WAVE_RADIUS,
            ease: 'Quintic.easeInOut',
            duration: 1500,
            opacity: 0,
            repeat: -1,
            onUpdate: () => {
                this.circle.x = this.x;
                this.circle.y = this.y;
                this.graphics.clear();
                this.graphics.fillStyle(0x00f2ff, opacity);
                this.graphics.fillCircleShape(this.circle);
            }
        });
    }

    move() {
        let angle = Phaser.Math.Angle.Between(this.x, this.y, this.target.x + this.scene.cameras.main.scrollX, this.target.y + this.scene.cameras.main.scrollY);
        let velocity = this.scene.physics.velocityFromRotation(angle, this.speed);
        this.body.setVelocity(velocity.x, velocity.y, 0);
    }

    resetWave() {
        if (this.circleTween && this.opacityTween){
            this.circleTween.restart();
            this.opacityTween.restart();
        }
    }

    onDestroy() {
        if (this.circleTween) this.circleTween.complete();
        if (this.opacityTween) this.opacityTween.complete();
        if (this.graphics) this.graphics.clear();
        if ( this.resetWaveTimeout ) clearTimeout( this.resetWaveTimeout );
    }
}

export default Wavebender;