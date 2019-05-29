import Enemy from "./enemy.js";
const BULLET_SPEED = 500;

class Boss3 extends Enemy {
    lastFired;

    emitters = [];

    target;

    timeLine;

    shootInterval;
    bullets;

    constructor(scene, x, y, type, scale, rotation, health, damage, speed, score) {
        super(scene, x, y, type, scale, rotation, health, damage);
        this.scene = scene;
        scene.physics.world.enable(this);
        this.setScale(scale);
        this.setOrigin(0.5, 0.5);
        this.rotation = rotation;
        this.speed = speed;
        this.score = score;
        scene.add.existing(this);

        this.bullets = this.scene.physics.add.group();
        this.timeLine = this.scene.tweens.createTimeline();
        this.timeLine.loop = -1;
        this.timeLine.loopDelay = 2000;
        this.generateBossMovementTimeline();
        this.startAttack();

    }

    startAttack() {
        this.timeLine.play();
    }

    setTarget(target) {
        this.target = target;
    }

    getBullets() {
        return this.bullets;
    }

    /**
     * Allows the Boss' movement
     * @param {GameObject} player Player's Game Object 
     */
    move(player) {

    }

    generateBossMovementTimeline() {
        this.timeLine.add({
            targets: this,
            x: window.innerWidth / 6,
            y: window.innerHeight / 6,
            ease: 'Power1',
            duration: 1000,
            onComplete: () => this.shoot(3)
        });

        this.timeLine.add({
            targets: this,
            x: window.innerWidth * 5 / 6,
            y: window.innerHeight / 6,
            ease: 'Power1',
            duration: 1000,
            onComplete: () => this.shoot(3)
        });

        this.timeLine.add({
            targets: this,
            x: window.innerWidth * 5 / 6,
            y: window.innerHeight * 5 / 6,
            ease: 'Power1',
            duration: 1000,
            onComplete: () => this.shoot(3)
        });

        this.timeLine.add({
            targets: this,
            x: window.innerWidth / 6,
            y: window.innerHeight * 5 / 6,
            ease: 'Power1',
            duration: 1000,
            onComplete: () => this.shoot(3)
        });

        this.timeLine.add({
            targets: this,
            x: window.innerWidth / 2,
            y: window.innerHeight / 2,
            ease: 'Power1',
            duration: 1000,
            onComplete: () => {
                this.shoot(8, true);
            }
        });
    }

    onDestroy() {
        clearInterval(this.shootInterval);
        this.timeLine.destroy();
        this.bullets.clear(true, true);
    }

    shoot(times = 1, timed = false) {
        let offset = 0;
        const that = this;
        function shootBullets() {
            if ( that.scene ) {
                for (let i = 0; i < 8; i++) {
                    let newBullet = that.scene.add.sprite(that.x, that.y, 'bossbullet');
                    that.bullets.add(newBullet);
                    newBullet.body.setCollideWorldBounds(true);
                    newBullet.body.onWorldBounds = true;
                    that.scene.physics.world.enable(newBullet);
                    let angle = i * 45 + offset;
                    let bulletVel = that.scene.physics.velocityFromRotation(Phaser.Math.DegToRad(angle > 360 ? angle - 360 : angle), BULLET_SPEED);
                    newBullet.body.setVelocity(bulletVel.x, bulletVel.y);
                    offset += 5;
                }
            } else {
                clearInterval(that.shootInterval);
            }
        }
        if (timed) {
            let nRepeated = 0;
            this.shootInterval = setInterval(() => {
                shootBullets();
                if (++nRepeated === times) {
                    clearInterval(this.shootInterval);
                }
            }, 200);
        } else {
            for (let t = 0; t < times; t++) {
                shootBullets();
            }
        }

    }

    shootBeam(targetPoint) {

    }
}

export default Boss3;