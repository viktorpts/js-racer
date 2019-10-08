import { STEP_SIZE } from './constants.js';
import { vAngle, vMagnitude } from './utility.js';

const enginePower = 4000;
const powerStep = 10000;
const mass = 200;

const turnRateDelta = Math.PI * 1000;
const maxTurnRate = Math.PI * 0.08;

export default class Car {
    constructor(x = 0, y = 0, dir = 0) {
        this.x = x;
        this.y = y;
        this.dir = dir;
        this.width = 1;
        this.length = 2;

        this.goingForward = true;
        this.braking = false;
        this.handBrake = false;
        this.reversing = false;

        this.turnRate = 0;
        this.engine = 0;

        this.mass = mass;
        this.vector = { x: Math.cos(dir), y: Math.sin(dir) };
        this.velocity = { x: 0, y: 0 };
        this.angularVelocity = 0;
        this.slipAngle = 0;

        this.controls = {};


        this.collision = false;
        this.debug = {};
    }

    bindControls(keys) {
        this.controls = keys;
    }

    update() {
        this.slipAngle = vAngle(this.vector, this.velocity);
        if (Number.isNaN(this.slipAngle)) {
            console.log(this);
            throw new Error();
        }
        this.goingForward = Math.abs(this.slipAngle) * 2 < Math.PI;
        this.reversing = false;

        if (this.controls.ArrowUp) {
            if (this.goingForward) {
                // Accelerating
                this.engine = Math.min(this.engine + powerStep * STEP_SIZE, enginePower);
                this.braking = false;
            } else {
                // Braking forward
                this.engine = 0;
                this.braking = true;
            }
        } else if (this.controls.ArrowDown) {
            if (this.goingForward === false) {
                // Reversing
                this.engine = Math.max(this.engine - powerStep * STEP_SIZE, -enginePower);
                this.braking = false;
                this.reversing = true;
            } else {
                // Braking in reverse
                this.engine = 0;
                this.braking = true;
            }
        } else {
            this.engine = 0;
            this.braking = false;
        }

        if (this.controls.Space) {
            this.braking = true;
            this.handBrake = true;
        } else {
            this.handBrake = false;
        }

        //const speed = vMagnitude(this.velocity);
        //const speedMultiplier = Math.max(Math.min((40 - speed) / 35, 1), 0.25);
        const speedMultiplier = 1;
        if (this.controls.ArrowLeft) {
            this.turnRate = Math.max(this.turnRate - turnRateDelta * STEP_SIZE * speedMultiplier, -maxTurnRate * speedMultiplier);
            //this.angularVelocity -= turnRateDelta * STEP_SIZE * 0.025;
        } else if (this.controls.ArrowRight) {
            this.turnRate = Math.min(this.turnRate + turnRateDelta * STEP_SIZE * speedMultiplier, maxTurnRate * speedMultiplier);
            //this.angularVelocity += turnRateDelta * STEP_SIZE * 0.025;
        } else {
            if (this.turnRate > 0) {
                this.turnRate = Math.max(this.turnRate - turnRateDelta * STEP_SIZE, 0);
            } else if (this.turnRate < 0) {
                this.turnRate = Math.min(this.turnRate + turnRateDelta * STEP_SIZE, 0);
            }
        }
    }
}