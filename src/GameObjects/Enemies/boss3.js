import Enemy from "./enemy.js";
const BULLET_SPEED = 500;

class Boss3 extends Enemy {
    lastFired;
    hittable = true;

    emitters = [];

    target;

    animation1;
    animation2;
    shootCircleTween;

    shootInterval;
    bullets;
    attackMode = 1;

    constructor(scene, x, y, type, scale, rotation, health, damage, speed, score, scaleFactor) {
        super(scene, x, y, type, scale, rotation, health, damage);
        this.scene = scene;
        scene.physics.world.enable(this);
        this.setScale(scale);
        this.scaleFactor = scaleFactor;
        this.setOrigin(0.5, 0.5);
        this.rotation = rotation;
        this.speed = speed;
        this.score = score;
        scene.add.existing(this);

        this.bullets = this.scene.physics.add.group();
        this.animation1 = this.scene.tweens.createTimeline();
        this.animation2 = this.scene.tweens.createTimeline();
        this.animation1.loop = -1;
        this.animation1.loopDelay = 2000;
        this.generateBoss1stMovement();
        this.startAttack();

        this.bulletFX = this.scene.sound.add('enemlaser');

    }

    startAttack() {
        this.animation1.play();
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

    generateBoss1stMovement() {
        this.animation1.add({
            targets: this,
            x: window.innerWidth / 6,
            y: window.innerHeight / 6,
            ease: 'Power1',
            duration: 1000,
            onComplete: () => this.shoot(3)
        });

        this.animation1.add({
            targets: this,
            x: window.innerWidth * 5 / 6,
            y: window.innerHeight / 6,
            ease: 'Power1',
            duration: 1000,
            onComplete: () => this.shoot(3)
        });

        this.animation1.add({
            targets: this,
            x: window.innerWidth * 5 / 6,
            y: window.innerHeight * 5 / 6,
            ease: 'Power1',
            duration: 1000,
            onComplete: () => this.shoot(3)
        });

        this.animation1.add({
            targets: this,
            x: window.innerWidth / 6,
            y: window.innerHeight * 5 / 6,
            ease: 'Power1',
            duration: 1000,
            onComplete: () => this.shoot(3)
        });

        this.animation1.add({
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

    generateBoss2ndMovement() {

        this.animation2.add({
            targets: this,
            x: window.innerWidth * 4 / 5,
            y: window.innerHeight / 2,
            ease: 'Power1',
            duration: 2000,
            onComplete: () => {
                this.shoot(3, false);
                this.shoot(1, true, true);
                this.shoot(1, true, true, false);
            }
        });

        this.animation2.add({
            targets: this,
            x: window.innerWidth - 128 * this.scaleFactor,
            y: window.innerHeight / 2,
            ease: 'Power1',
            duration: 2000,
            onComplete: () => {
                this.shoot(3, false);
                this.shoot(1, true, true);
                this.shoot(1, true, true, false);
            }
        });

        this.animation2.add({
            targets: this,
            x: window.innerWidth * 4 / 5,
            y: window.innerHeight / 2,
            ease: 'Power1',
            duration: 2000,
            onComplete: () => {
                this.shoot(3, false);
                this.shoot(1, true, true);
                this.shoot(1, true, true, false);
            }
        });

        this.animation2.add({
            targets: this,
            x: window.innerWidth * 3 / 5,
            y: window.innerHeight / 2,
            ease: 'Power1',
            duration: 2000,
            onComplete: () => {
                this.shoot(3, false);
                this.shoot(1, true, true);
                this.shoot(1, true, true, false);
            }
        });

        this.animation2.add({
            targets: this,
            x: window.innerWidth * 2 / 5,
            y: window.innerHeight / 2,
            ease: 'Power1',
            duration: 2000,
            onComplete: () => {
                this.shoot(3, false);
                this.shoot(1, true, true);
                this.shoot(1, true, true, false);
            }
        });

        this.animation2.add({
            targets: this,
            x: 128 * this.scaleFactor,
            y: window.innerHeight / 2,
            ease: 'Power1',
            duration: 2000,
            onComplete: () => {
                this.shoot(3, false);
                this.shoot(1, true, true);
                this.shoot(1, true, true, false);
            }
        });

        this.animation2.add({
            targets: this,
            x: window.innerWidth * 2 / 5,
            y: window.innerHeight / 2,
            ease: 'Power1',
            duration: 2000,
            onComplete: () => {
                this.shoot(3, false);
                this.shoot(1, true, true);
                this.shoot(1, true, true, false);
            }
        });

        this.animation2.add({
            targets: this,
            x: window.innerWidth / 2,
            y: window.innerHeight / 2,
            ease: 'Power1',
            duration: 2000,
            onComplete: () => {
                this.shoot(3, false);
                this.shoot(1, true, true);
                this.shoot(1, true, true, false);
            }
        });
    }



    onDestroy() {
        clearInterval(this.shootInterval);
        this.animation1.stop();
        this.animation2.stop();
        this.bullets.clear(true, true);
    }

    loadBullets(nBullets) {

        for (let i = 0; i < nBullets; i++) {
            let newBullet = that.scene.add.sprite(that.x, that.y, 'bossbullet');
            newBullet.setScale(this.scaleFactor);
            that.bullets.add(newBullet);
            newBullet.body.setCollideWorldBounds(true);
            newBullet.body.onWorldBounds = true;
            that.scene.physics.world.enable(newBullet);
            let angle = i * 45 + offset;
            let bulletVel = that.scene.physics.velocityFromRotation(Phaser.Math.DegToRad(angle > 360 ? angle - 360 : angle), BULLET_SPEED * this.scaleFactor);
            newBullet.body.setVelocity(bulletVel.x, bulletVel.y);
            offset += 5;
        }
    }

    changeAttackMode() {
        // this.animation1.data = [];
        this.hittable = false;
        this.animation1.stop();
        clearInterval(this.shootInterval);
        this.scene.tweens.add({
            targets: this,
            x: window.innerWidth / 2,
            y: window.innerHeight / 2,
            duration: 2000,
            ease: function (t) {
                return Math.pow(t, 1 / 2);
            },
            onComplete: () => {
                this.shoot(2, true, true);
                this.shoot(2, true, true, false);
                this.shoot(24, true);
                this.hittable = true;
                setTimeout(() => {
                    this.generateBoss2ndMovement();
                    this.animation2.loop = -1;
                    this.animation2.loopDelay = 1000;
                    this.animation2.play();
                }, 5000);
            }
        });

    }

    shoot(times = 1, timed = false, arc = false, clockwise = true) {
        let offset = 0;
        let current = 0;
        const that = this;
        function shootBullets() {
            if (that.scene) {
                for (let i = 0; i < 8; i++) {
                    let newBullet = that.scene.add.sprite(that.x, that.y, 'bossbullet');
                    newBullet.setScale( that.scaleFactor );
                    that.bullets.add(newBullet);
                    newBullet.body.setCollideWorldBounds(true);
                    newBullet.body.onWorldBounds = true;
                    that.scene.physics.world.enable(newBullet);
                    let angle = i * 45 + offset;
                    let bulletVel = that.scene.physics.velocityFromRotation(Phaser.Math.DegToRad(angle > 360 ? angle - 360 : angle), BULLET_SPEED * that.scaleFactor);
                    newBullet.body.setVelocity(bulletVel.x, bulletVel.y);
                    offset += 5;
                }
                that.bulletFX.play();
            }
            if (++current < times) { setTimeout(() => shootBullets(), timed ? 200 : 0); }
        }

        function shootCircle() {
            if (that.scene) {
                let sourcepoint = JSON.parse(JSON.stringify({ x: that.x, y: that.y }));
                let group = [];
                var circle = new Phaser.Geom.Circle(sourcepoint.x, sourcepoint.y, 150 * that.scaleFactor);
                for (let i = 0; i < 8; i++) {
                    let newBullet = that.scene.add.sprite(that.x, that.y, 'bossbullet');
                    newBullet.setScale( that.scaleFactor );
                    group.push(newBullet);
                    that.bullets.add(newBullet);
                    newBullet.body.setCollideWorldBounds(true);
                    newBullet.body.onWorldBounds = true;
                    that.scene.physics.world.enable(newBullet);
                }
                that.bulletFX.play();
                Phaser.Actions.PlaceOnCircle(group, circle);
                // Phaser.Actions.PlaceOnCircle(that.bullets.getChildren(), circle);

                that.shootCircleTween = that.scene.tweens.addCounter({
                    from: 150 * that.scaleFactor,
                    to: 1500 * that.scaleFactor,
                    duration: 3000,
                    delay: 0,
                    ease: 'Sine.easeInOut',
                    onUpdate: () => {
                        Phaser.Actions.RotateAroundDistance(group, { x: sourcepoint.x, y: sourcepoint.y }, clockwise ? 0.02 : -0.02, that.shootCircleTween.getValue());
                        // Phaser.Actions.RotateAroundDistance(that.bullets.getChildren(), { x: sourcepoint.x, y: sourcepoint.y }, 0.03, that.shootCircleTween.getValue());
                    },
                    onComplete: () => {
                        current++;
                        setTimeout(() => {
                            group.forEach((b) => b.destroy());
                            group = null;
                        }, 5000)
                        if (current < times) { shootCircle() }
                    }
                });
            }
        }
        if (timed) {
            if (arc) {
                shootCircle()
            } else {
                shootBullets();
            }
        } else {
            shootBullets();
        }

    }

    shootBeam(targetPoint) {

    }
}

export default Boss3;