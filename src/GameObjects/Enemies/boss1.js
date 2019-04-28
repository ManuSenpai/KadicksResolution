import Enemy from "./enemy.js";
import Turret from "../turret.js";

var MAX_ANGLE_SPREAD = Math.PI / 4;
const TIME_BETWEEN_CHANGE = 5000;
// const MAX_ANGLE_SPREAD = 45;

class Boss1 extends Enemy {
    leftTurret;
    rightTurret;
    lastFired;
    attackMode = 0;         // Boss attack Mode: 0 = aim at player; 1 = Spread shooting; 2 = isotropic shooting
    fireRate = 300;

    deltaRot = 0;
    spreadAxisLeft;         // Represents the line that forms the center of the cone of spread shooting
    spreadAxisRight;        // Represents the line that forms the center of the cone of spread shooting
    spreadDirection = -1;   // Represents the direction that the spread is taking. -1 = Clockwise ; 1 = Counterclockwise

    aimGraphics;            // Graphics for drawing the aiming lasers to shoot the laser beams
    aimLineWidth;
    aimAnimationInterval;
    beamGraphics;           // Graphics for the laser beams themselves
    leftAimLine;
    rightAimLine;
    leftBeamLine;
    rightBeamLine;
    
    target;

    constructor(scene, x, y, type, scale, rotation, health, damage, speed, score) {
        super(scene, x, y, type, scale, rotation, health, damage);
        this.scene = scene;
        scene.physics.world.enable(this);
        this.setScale(scale);
        this.setOrigin(0.5, 0.5);
        this.rotation = rotation;
        this.speed = speed;
        this.body.bounce.setTo(10, 10);
        // this.body.setVelocity( speed, speed, 0);
        this.score = score;
        scene.add.existing(this);

        // Turrets
        this.leftTurret = scene.add.sprite(this.x - 92, this.y - 82, 'turret');
        this.leftTurret.setScale(0.5);
        this.rightTurret = scene.add.sprite(this.x + 92, this.y - 82, 'turret');
        this.rightTurret.setScale(0.5);

        this.lastFired = 0;

        // setInterval( this.changeAttackMode.bind(this), TIME_BETWEEN_CHANGE );

        this.aimGraphics = scene.add.graphics({ lineStyle: { width: 1, color: 0xaafff3 } });
        this.beamGraphics = scene.add.graphics({ lineStyle: { width: 30, color: 0xd1fcff } });

        this.startAimAnimation();
    }

    /**
     * Allows the Boss' movement
     * @param {GameObject} player Player's Game Object 
     */
    move(player) {
        if ( this.x <= player.x ) {
            this.body.setVelocityX( this.speed );
        } else {
            this.body.setVelocityX( -this.speed );
        }
        this.leftTurret.x = this.x - 92;
        this.leftTurret.y = this.y - 82;
        this.rightTurret.x = this.x + 92;
        this.rightTurret.y = this.y - 82;
    } 

    // Aiming at player
    aim(target) {
        let leftTurretAngle = Phaser.Math.Angle.Between(this.leftTurret.x, this.leftTurret.y, target.x, target.y);
        let rightTurretAngle = Phaser.Math.Angle.Between(this.rightTurret.x, this.rightTurret.y, target.x, target.y);
        this.leftTurret.rotation = leftTurretAngle;
        this.rightTurret.rotation = rightTurretAngle;
    }

    onDestroy() {
        this.rightTurret.destroy();
        this.leftTurret.destroy();
    }

    changeAttackMode() {
        var rand = Math.random();
        if ( rand < 0.50 ) {
            this.fireRate = 300;
            this.attackMode = 0; }
        else { 
            MAX_ANGLE_SPREAD = Math.PI / 8;
            this.spreadAxisLeft = this.leftTurret ? this.leftTurret.rotation : 0;
            this.spreadAxisRight = this.rightTurret ? this.rightTurret.rotation : 0;

            this.fireRate = 300;
            this.attackMode = 1; }
    }

    aimSpread(target) {
        let leftTurretAngle = Phaser.Math.Angle.Between(this.leftTurret.x, this.leftTurret.y, target.x, target.y);
        let rightTurretAngle = Phaser.Math.Angle.Between(this.rightTurret.x, this.rightTurret.y, target.x, target.y);
        this.spreadAxisLeft = leftTurretAngle;
        this.spreadAxisRight = rightTurretAngle;
    }

    spread() {
        if ( this.spreadDirection === -1 ) {
            this.deltaRot += Math.PI / 180;
            // this.deltaRot += 1;
        } else {
            this.deltaRot -= Math.PI / 180;
        }

        if ( this.deltaRot >=  MAX_ANGLE_SPREAD || this.deltaRot <=  -MAX_ANGLE_SPREAD ) { this.spreadDirection *= -1; }
        
        this.leftTurret.rotation = this.spreadAxisLeft + this.deltaRot;
        this.rightTurret.rotation = this.spreadAxisRight - this.deltaRot;
    }

    startAimAnimation() {
        this.aimLineWidth = 1;
        this.aimGraphics = this.scene.add.graphics({ lineStyle: { width: this.aimLineWidth, color: 0xaafff3 } });
        this.aimAnimationInterval = setInterval( () => {
            this.aimGraphics.clear();
            this.aimLineWidth++;
            if( this.aimLineWidth >= 5 ) { 
                this.aimLineWidth = 0;
                let targetPoint = { x: this.target.x, y: this.target.y };
                clearInterval(this.aimAnimationInterval);
                setTimeout(() => {
                    this.shootBeam(targetPoint);
                }, 150 );
            }
            this.aimGraphics = this.scene.add.graphics({ lineStyle: { width: this.aimLineWidth, color: 0xaafff3 } });
        }, 200);
    }

    shootBeam(targetPoint) {
        let leftTurretAngle = Phaser.Math.Angle.Between(this.leftTurret.x, this.leftTurret.y, targetPoint.x, targetPoint.y);
        let rightTurretAngle = Phaser.Math.Angle.Between(this.rightTurret.x, this.rightTurret.y, targetPoint.x, targetPoint.y);
        this.leftBeamLine = new Phaser.Geom.Line(this.leftTurret.x, this.leftTurret.y, targetPoint.x, targetPoint.y);
        Phaser.Geom.Line.SetToAngle(this.leftBeamLine, this.leftTurret.x, this.leftTurret.y, leftTurretAngle, 1000);
        Phaser.Geom.Line.Offset(this.leftBeamLine, 38 * Math.cos(leftTurretAngle), 38 * Math.sin(leftTurretAngle)); 
        this.rightBeamLine = new Phaser.Geom.Line(this.rightTurret.x, this.rightTurret.y, targetPoint.x, targetPoint.y);
        Phaser.Geom.Line.SetToAngle(this.rightBeamLine, this.rightTurret.x, this.rightTurret.y, rightTurretAngle, 1000);
        Phaser.Geom.Line.Offset(this.rightBeamLine, 38 * Math.cos(rightTurretAngle), 38 * Math.sin(rightTurretAngle)); 
        
        this.beamGraphics.strokeLineShape(this.leftBeamLine);
        this.beamGraphics.strokeLineShape(this.rightBeamLine);
        let vanishInterval = setInterval( () => {
            this.beamGraphics.alpha -= 0.1;
        }, 50);
        setTimeout( () => {
            clearInterval (vanishInterval);
            this.beamGraphics.clear();
            this.beamGraphics.alpha = 1;
        }, 500);
        this.startAimAnimation();
    }

    drawAimLines(target) {
        if ( !this.target ) { this.target = target; }
        let leftTurretAngle = Phaser.Math.Angle.Between(this.leftTurret.x, this.leftTurret.y, target.x, target.y);
        let rightTurretAngle = Phaser.Math.Angle.Between(this.rightTurret.x, this.rightTurret.y, target.x, target.y);
        this.aimGraphics.clear();
        this.leftAimLine = new Phaser.Geom.Line(this.leftTurret.x, this.leftTurret.y, this.target.x, this.target.y);
        this.rightAimLine = new Phaser.Geom.Line(this.rightTurret.x, this.rightTurret.y, this.target.x, this.target.y);
        Phaser.Geom.Line.Offset(this.leftAimLine, 38 * Math.cos(leftTurretAngle), 38 * Math.sin(leftTurretAngle)); 
        Phaser.Geom.Line.Offset(this.rightAimLine, 38 * Math.cos(rightTurretAngle), 38 * Math.sin(rightTurretAngle)); 
        this.aimGraphics.strokeLineShape(this.leftAimLine);
        this.aimGraphics.strokeLineShape(this.rightAimLine);
    } 
}

export default Boss1;