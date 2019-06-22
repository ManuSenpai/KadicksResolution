import Enemy from "./enemy.js"

const TRAIL_TIME = 350;
const FIRE_TIME = 5000;
const FIRE_INTERVAL_TIME = 10000;
const TRAIL_DELETE_TIME = 6000;
class Trashbot extends Enemy {
    trashFace;
    currentVelocity;
    trailgroup;
    trailAnimation;
    trailInterval;
    trailFireTimeout;
    trailFireInterval;
    trailColliders;
    scene;
    alive = true;
    emitters = [];
    flares;
    constructor(scene, x, y, type, scale, rotation, health, damage, speed, score, scaleFactor) {
        super(scene, x, y, type, scale, rotation, health, damage);
        this.scene = scene;
        this.speed = speed;
        this.score = score;
        this.scaleFactor = scaleFactor;
        scene.add.existing(this);
        this.setRandomAngle();
        this.currentVelocity = scene.physics.velocityFromRotation(this.rotation, this.speed);
        this.body.setVelocity(this.currentVelocity.x, this.currentVelocity.y);
        this.trashFace = scene.add.sprite(this.x, this.y, 'trashbotniceface');
        this.trashFace.setScale(scaleFactor);
        this.scene.physics.world.enable(this.trashFace);
        this.trailgroup = scene.physics.add.group();
        this.trailInterval = setInterval(() => this.generateTrail(), TRAIL_TIME);
        this.flares = this.scene.add.particles('flares');
        this.trailFireInterval = setInterval(() => this.setFire(), FIRE_INTERVAL_TIME);
        this.setDepth(1);
        this.trashFace.setDepth(2);
        this.trailColliders = scene.physics.add.group();
        this.fireFX = scene.sound.add('fire');
        this.tingFX = scene.sound.add('ting');
    }

    getTrailColliders() {
        return this.trailColliders;
    }

    generateTrail() {
        if (this.alive) {
            let newTrail = this.scene.add.sprite(this.x, this.y, 'trashtrail');
            newTrail.setScale(this.scaleFactor);
            this.trailgroup.add(newTrail);
            newTrail.z = 2;
            this.trailAnimation = this.scene.tweens.add({
                targets: newTrail,
                ease: 'Power1',
                duration: TRAIL_DELETE_TIME,
                scaleX: 0.2 * this.scaleFactor,
                scaleY: 0.2 * this.scaleFactor,
                onComplete: function () {
                    if (this.trailgroup) this.trailgroup.remove(newTrail);
                    newTrail.destroy();
                },
            });
        } else {
            clearInterval(this.trailInterval);
        }
    }

    /**
     * Sets on fire the trail of oil left by the trashbot
     */
    setFire() {
        this.fireFX.play();
        if (this.trailInterval) clearInterval(this.trailInterval);
        if (this.trailFireInterval) clearInterval(this.trailFireInterval);
        
        this.trailgroup.children.iterate((stain) => {
            let newCollider = this.scene.add.sprite(stain.x, stain.y, 'trashtrail');
            this.scene.physics.world.enable(newCollider);
            newCollider.visible = false;
            this.trailColliders.add(newCollider);
            this.emitters.push(this.flares.createEmitter({
                x: stain.x,
                y: stain.y,
                angle: -90,
                speed: { min: 100, max: -500 },
                gravityY: 400,
                scale: { start: 0.6, end: 0.1 },
                lifespan: 200,
                blendMode: 'ADD',
                tint: [0xf200ff, 0xfcd8ff]
                // tint: [ 0xff0000, 0xffbc6b, 0xffe16b ]
            }));
        });
        let currentTweens = this.scene.tweens.getTweensOf(this.trailgroup.children.entries);
        currentTweens.forEach((t) => {
            t.complete();
        });

        this.trailFireTimeout = setTimeout(() => {
            this.emitters.forEach((emitter) => {
                emitter.killAll();
                emitter.stop();
            })
            this.emitters = [];
            this.trailColliders.clear(true, true);
            this.trailInterval = setInterval(() => this.generateTrail(), TRAIL_TIME);
            this.trailFireInterval = setInterval(() => this.setFire(), FIRE_INTERVAL_TIME);

        }, FIRE_TIME);
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
        this.tingFX.play();
        if (this.body.touching.left || this.body.touching.right) {
            this.currentVelocity.x *= -1;
        }
        if (this.body.touching.up || this.body.touching.down) {
            this.currentVelocity.y *= -1;
        }
    }

    onDestroy() {
        if (this.trailInterval) { clearInterval(this.trailInterval); }
        if (this.trailFireInterval) { clearInterval(this.trailFireInterval); }
        if (this.trailFireTimeout) { clearTimeout(this.trailFireTimeout); }
        this.emitters.forEach((emitter) => {
            emitter.killAll();
            emitter.stop();
        })
        this.trashFace.destroy();
        // this.scene.tweens.killTweensOf(this.trailgroup.children.entries);
        let currentTweens = this.scene.tweens.getTweensOf(this.trailgroup.children.entries);
        currentTweens.forEach((t) => { t.complete(); });
        this.trailgroup.clear(true, true);
        this.trailgroup.destroy();
        this.trailAnimation.data.forEach(element => {
            element.target.destroy();
        });
        this.trailAnimation = null;
        this.alive = false;
    }
}

export default Trashbot;