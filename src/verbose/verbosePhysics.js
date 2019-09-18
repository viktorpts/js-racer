import { STEP_SIZE } from '../constants.js';
import { wrap, vRotate, vToLocal, vToParent, vAdd, vNegate, vMagnitude, vProject } from '../utility.js';


const dragCoef = 1.2;
const rrCoef = 20;
const brakeCoef = 20000;
const inertia = 500;
// Cornering and friction account for wheel load of 6000N (~600kg)
const corneringCoef = 40000;
const frictionCircle = 7000;
const g = 10;


export function applyLocomotion(actor) {
    const localVelocity = getLocalVelocity(actor);

    const wheelReaction = {
        front: vToParent(getWheelForces(localVelocity, actor.turnRate, actor.angularVelocity, actor.length / 2, actor.mass / 2 * g), actor.turnRate),
        rear: getWheelForces(localVelocity, 0, actor.angularVelocity, -actor.length / 2, actor.mass / 2 * g)
    };
    applyTorque(actor, wheelReaction.front.y, wheelReaction.rear.y);


    return wheelReaction;
}

function applyTorque(actor, frontForce, rearForce) {
    let torque = frontForce * actor.length / 2 - rearForce * actor.length / 2;
    console.log('torque:', torque);
    const newAV = actor.angularVelocity + (torque / inertia) * STEP_SIZE;
    // Put damper here
    actor.angularVelocity = newAV;
    actor.dir = wrap(actor.dir + actor.angularVelocity * STEP_SIZE, 0, Math.PI * 2);
    actor.vector = { x: Math.cos(actor.dir), y: Math.sin(actor.dir) };
}

function applyAcceleration() {

}

export function getWheelForces(parentLocalVelocity, wheelDir, angularVelocity, suspensionOffset, load) {
    const wheelDisplacementRate = getWheelDisplacementRate(parentLocalVelocity, wheelDir, angularVelocity, suspensionOffset);
    const wheelReaction = vNegate(wheelDisplacementRate);
    const slipAngle = getSlipAngle(wheelReaction);
    const slipRatio = getSlipRatio(slipAngle);
    const slipForce = slipRatio * load;
    const rr = wheelReaction.x * rrCoef / 2;

    console.log('wheel local disp:', wheelDisplacementRate);
    console.log('angle:', slipAngle / Math.PI * 180);
    console.log('ratio:', slipRatio);
    console.log('force:', slipForce);
    console.log('resistance:', rr);

    return { x: rr, y: slipForce };
}

function getWheelDisplacementRate(parentLocalVelocity, wheelDir, angularVelocity, suspensionOffset) {
    const wheelRotDisplacementRate = getWheelRotDisplacement(angularVelocity, suspensionOffset);
    const wheelDisplacementRate = vAdd(wheelRotDisplacementRate, parentLocalVelocity);

    console.log('wheel rot disp:', wheelRotDisplacementRate);
    console.log('wheel total disp:', wheelDisplacementRate);

    const wheelLocalDisplacementRate = getWheelLocalVelocity(wheelDisplacementRate, wheelDir);
    return wheelLocalDisplacementRate;
}

export function getSlipAngle(localVelocity) {
    return Math.atan(localVelocity.y / Math.abs(localVelocity.x));
}

function getSlipRatio(angle) {
    let multiplier = angle < 0 ? -1 : 1;
    let slip = Math.abs(angle * 2 / Math.PI);
    const peak = 0.2; // Percentage of 0.5*PI
    const skid = 1; // Percentage of 0.5*PI
    const minRatio = 0.75;
    if (slip > 1) {
        slip = 2 - slip;
    }
    if (slip <= peak) {
        return slip / peak * multiplier;
    } else if (slip > skid) {
        return 0;
    } else {
        return Math.max(1 - ((slip - peak) * (1 - minRatio)) / (skid - peak), 0) * multiplier;
    }
}

function getWheelRotDisplacement(angularVelocity, suspensionOffset) {
    return getRotDisplacement(angularVelocity, { x: suspensionOffset, y: 0 });
}

export function getLocalVelocity(body) {
    return vToLocal(body.velocity, body.dir);
}

function getWheelLocalVelocity(parentVelocity, wheelDir) {
    return vToLocal(parentVelocity, wheelDir);
}

function getRotDisplacement(angle, positionFromCenter) {
    const newPosition = vRotate(positionFromCenter, angle);
    return vAdd(vNegate(positionFromCenter), newPosition);
}