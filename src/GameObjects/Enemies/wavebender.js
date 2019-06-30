import Enemy from "./enemy.js"
const WAVE_RADIUS = 100;

class Wavebender extends Enemy {
    scene;
    circle;
    graphics;
    opacityTween;
    circleTween;
    target;
    resetWaveTimeout;
    constructor(scene, x, y, type, scale, rotation, health, damage, speed, score, scaleFactor) {
        super(scene, x, y, type, scale, rotation, health, damage);
        this.scene = scene;
        this.speed = speed;
        this.score = score;
        this.scaleFactor = scaleFactor;
        scene.add.existing(this);
        this.fireWave();
        this.setDepth(2);
        this.pulseFX = scene.sound.add('pulse');

        this.scene.anims.create({
            key: 'wavedie',
            frames: this.scene.anims.generateFrameNumbers('wavebender', { start: 0, end: 6 }),
            frameRate: 10,
            repeat: 0
        });

    }

    /** Returns enemy circles */
    getCircles() {
        return this.circle;
    }

    /** Sets enemy's target */
    setTarget(target) {
        this.target = target;
    }

    /** Creates circle and enlarges it */
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
            radius: WAVE_RADIUS * this.scaleFactor,
            ease: 'Quintic.easeInOut',
            duration: 1500,
            opacity: 0,
            repeat: -1,
            onRestart: () => this.pulseFX.play(),
            onUpdate: () => {
                this.circle.x = this.x;
                this.circle.y = this.y;
                this.graphics.clear();
                this.graphics.fillStyle(0x00f2ff, opacity);
                this.graphics.fillCircleShape(this.circle);
            }
        });
    }

    /** Allows enemy's movement */
    move() {
        let angle = Phaser.Math.Angle.Between(this.x, this.y, this.target.x + this.scene.cameras.main.scrollX, this.target.y + this.scene.cameras.main.scrollY);
        let velocity = this.scene.physics.velocityFromRotation(angle, this.speed);
        this.body.setVelocity(velocity.x, velocity.y, 0);
    }

    /** Restarts circle size */
    resetWave() {
        if (this.circleTween && this.opacityTween){
            this.circleTween.restart();
            this.opacityTween.restart();
        }
    }

    /** Clear enemy elements when destroyed */
    onDestroy() {
        this.anims.play('wavedie', true);
        this.body.setVelocity(0,0);
        this.body.immovable = true;
        if (this.circleTween) this.circleTween.complete();
        if (this.opacityTween) this.opacityTween.complete();
        if (this.graphics) this.graphics.clear();
        if ( this.resetWaveTimeout ) clearTimeout( this.resetWaveTimeout );
        setTimeout( () => {
            this.setActive(true);
            this.destroy();
        }, 1000);
    }
}

export default Wavebender;