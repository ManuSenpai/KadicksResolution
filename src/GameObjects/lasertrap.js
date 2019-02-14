function blink() {
    if ( !this.isActive ) {
        this.isActive = true;
        this.timer = this.scene.time.addEvent({ delay: this.timeOfLaser, callback: blink, callbackScope: this, loop: false });
        this.graphics.visible = true;
        this.emitterPan1.visible = true;
        this.emitterPan2.visible = true;
        this.emitterHor1.visible = true;
        this.emitterHor2.visible = true;
    } else {
        this.isActive = false;
        this.timer = this.scene.time.addEvent({ delay: this.timeOfBlink, callback: blink, callbackScope: this, loop: false });
        this.graphics.visible = false;
        this.emitterPan1.visible = false;
        this.emitterPan2.visible = false;
        this.emitterHor1.visible = false;
        this.emitterHor2.visible = false;
    }
}

class LaserTrap {
    /**
     * Generates a laser between two points
     * @param {*} scene Main scene in which the game is being displayed
     * @param {*} x1 X point for origin
     * @param {*} y1 Y point for origin
     * @param {*} x2 X point for destiny
     * @param {*} y2 Y point for destiny
     * @param {*} color Laser color
     * @param {*} damage Damage caused to player
     * @param {*} thickness Laser thickness
     * @param {*} timeOfBlink Period of time in which the laser will be deactivated
     * @param {*} timeOfLaser Period of time in which the laser will be activated
     */
    constructor(scene, x1, y1, x2, y2, color, damage, thickness, timeOfBlink = 0, timeOfLaser = null) {
        this.scene = scene;
        this.x1 = x1;
        this.x2 = x2;
        this.y1 = y1;
        this.y2 = y2;
        this.color = color;
        this.damage = damage;
        this.thickness = thickness;
        this.timeOfBlink = timeOfBlink;
        this.timeOfLaser = timeOfLaser;
        this.isActive = true;
        this.line = new Phaser.Geom.Line(x1, y1, x2, y2);
        this.graphics = this.scene.add.graphics( {
            lineStyle: {
                width: thickness,
                color: color
            }
        });
        if( timeOfLaser !== null && timeOfBlink !== 0 ) {
            this.graphics.strokeLineShape(this.line);
            this.timer = this.scene.time.addEvent({ delay: timeOfLaser, callback: blink, callbackScope: this, loop: false });
        } else {
            this.graphics.strokeLineShape( this.line );
        }
        this.particles = this.scene.add.particles('flares');
        this.emitterPan1 = this.particles.createEmitter({
            x: this.x1,
            y: this.y1,
            scale: 0.2,
            speed: 100,
            lifespan: 75,
            blendMode: 'ADD'
        })
        this.emitterPan2 = this.particles.createEmitter({
            x: this.x2,
            y: this.y2,
            scale: 0.2,
            speed: 100,
            lifespan: 75,
            blendMode: 'ADD'
        })
        this.emitterHor1 = this.particles.createEmitter({
            x: this.x1,
            y: this.y1,
            lifespan: 200,
            speed: { min: 200, max: 300 },
            angle: Phaser.Math.RadToDeg(Phaser.Math.Angle.Between(this.x1, this.y1, this.x2, this.y2)),
            scale: { start: 0.2, end: 0 },
            quantity: 2,
            blendMode: 'ADD'
        });
        this.emitterHor2 = this.particles.createEmitter({
            x: this.x2,
            y: this.y2,
            lifespan: 200,
            speed: { min: 200, max: 300 },
            angle: Phaser.Math.RadToDeg(Phaser.Math.Angle.Between(this.x2, this.y2, this.x1, this.y1 )),
            scale: { start: 0.2, end: 0 },
            quantity: 2,
            blendMode: 'ADD'
        });
    }
}

export default LaserTrap;