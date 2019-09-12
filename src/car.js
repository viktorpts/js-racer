import { STEP_SIZE } from './constants.js';
import { wrap, vAngle } from './utility.js';

const enginePower = 6300;
const powerStep = 10000;
const mass = 1200;

const turnRateDelta = Math.PI * 2;
const maxTurnRate = Math.PI * 0.25;

export default class Car {
    constructor(x = 0, y = 0, dir = 0) {
        this.x = x;
        this.y = y;
        this.dir = dir;

        this.goingForward = true;
        this.braking = false;
        this.reversing = false;
        
        this.turnRate = 0;
        this.engine = 0;

        this.mass = mass;
        this.vector = { x: Math.cos(dir), y: Math.sin(dir) };
        this.velocity = { x: 0, y: 0 };

        this.controls = {};


        this.local = {x: 0, y: 0};
        this.slip = {x: 0, y: 0, angle: 0};
    }

    bindControls(keys) {
        this.controls = keys;
    }

    update() {
        const AoA = vAngle(this.vector, this.velocity);
        this.goingForward = Math.abs(AoA) * 2 < Math.PI;
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

        if (this.controls.ArrowLeft) {
            this.turnRate = Math.max(this.turnRate - turnRateDelta * STEP_SIZE, -maxTurnRate);
        } else if (this.controls.ArrowRight) {
            this.turnRate = Math.min(this.turnRate + turnRateDelta * STEP_SIZE, maxTurnRate);
        } else {
            if (this.turnRate > 0) {
                this.turnRate = Math.max(this.turnRate - turnRateDelta * STEP_SIZE, 0);
            } else if (this.turnRate < 0) {
                this.turnRate = Math.min(this.turnRate + turnRateDelta * STEP_SIZE, 0);
            }
        }
    }
}