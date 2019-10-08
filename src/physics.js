import { STEP_SIZE } from './constants.js';
import { wrap, vRotate, vToLocal, vToParent, vAdd, vNegate, vMagnitude, vProject, vScale, vAngle } from './utility.js';
import { isIntersectingBroad, getResolutionVector } from './sat.js';


const dragCoef = 3;
const rrCoef = 20;
const brakeCoef = 1000;
const inertia = 10;
// Normalized cornering force
const corneringCoef = 0.15;
const frictionCircle = 7000;
const g = 10;


export function applyLocomotion(actor) {
    const localVelocity = getLocalVelocity(actor);

    const wheelReaction = {
        front: vToParent(getWheelForces(localVelocity, actor.turnRate, actor.angularVelocity, actor.length / 2, actor.mass / 2 * g), actor.turnRate),
        rear: getWheelForces(localVelocity, 0, actor.angularVelocity, -actor.length / 2, actor.mass / 2 * g)
    };
    actor.wheelForces = wheelReaction;
    applyTorque(actor, wheelReaction.front.y, wheelReaction.rear.y);
    applyTraction(actor, localVelocity, wheelReaction);
}

function applyTorque(actor, frontForce, rearForce) {
    if (actor.handBrake) {
        rearForce *= 0.75;
    }
    let torque = frontForce * actor.length / 2 - rearForce * actor.length / 2;
    //console.log('torque:', torque);
    const newAV = actor.angularVelocity + (torque / inertia) * STEP_SIZE;
    // Put damper here
    if (Math.sign(actor.angularVelocity) * Math.sign(newAV) < 0) {
        actor.angularVelocity = 0;
    } else {
        actor.angularVelocity = newAV;
    }
    actor.dir = wrap(actor.dir + actor.angularVelocity * STEP_SIZE, 0, Math.PI * 2);
    actor.vector = { x: Math.cos(actor.dir), y: Math.sin(actor.dir) };
}

export function getWheelForces(parentLocalVelocity, wheelDir, angularVelocity, suspensionOffset, load) {
    const wheelDisplacementRate = getWheelDisplacementRate(parentLocalVelocity, wheelDir, angularVelocity, suspensionOffset);
    const wheelReaction = vNegate(wheelDisplacementRate);
    const slipAngle = getSlipAngle(wheelReaction);
    const slipRatio = getSlipRatio(slipAngle);
    const slipForce = slipRatio * load * corneringCoef * vMagnitude(wheelDisplacementRate);
    const rr = wheelReaction.x * rrCoef / 2;

    //console.log('wheel local disp:', wheelDisplacementRate);
    //console.log('angle:', slipAngle / Math.PI * 180);
    //console.log('ratio:', slipRatio);
    //console.log('force:', slipForce);
    //console.log('resistance:', rr);

    return { x: rr, y: slipForce, angle: slipAngle, ratio: slipRatio, disp: wheelDisplacementRate };
}

function getWheelDisplacementRate(parentLocalVelocity, wheelDir, angularVelocity, suspensionOffset) {
    const wheelRotDisplacementRate = getWheelRotDisplacement(angularVelocity, suspensionOffset);
    const wheelDisplacementRate = vAdd(wheelRotDisplacementRate, parentLocalVelocity);

    //console.log('wheel rot disp:', wheelRotDisplacementRate);
    //console.log('wheel total disp:', wheelDisplacementRate);

    const wheelLocalDisplacementRate = getWheelLocalVelocity(wheelDisplacementRate, wheelDir);
    return wheelLocalDisplacementRate;
}

export function getSlipAngle(localVelocity) {
    if (localVelocity.y === 0) {
        return 0;
    } else if (localVelocity.x === 0) {
        return Math.PI * 0.5;
    } else {
        return Math.atan(localVelocity.y / Math.abs(localVelocity.x));
    }
}

function getSlipRatio(angle) {
    let multiplier = angle < 0 ? -1 : 1;
    let slip = Math.abs(angle * 2 / Math.PI);
    const peak = 0.2; // Percentage of 0.5*PI
    const skid = 1; // Percentage of 0.5*PI
    const minRatio = 0.5;
    if (slip > 1) {
        slip = 2 - slip;
    }
    if (slip <= peak) {
        return slip / peak * multiplier;
    } else if (slip > skid) {
        return minRatio * 0.5;
    } else {
        return Math.max(1 - ((slip - peak) * (1 - minRatio)) / (skid - peak), 0) * multiplier;
    }
}

function getWheelRotDisplacement(angularVelocity, suspensionOffset) {
    //return getRotDisplacement(angularVelocity, { x: suspensionOffset, y: 0 });
    return {x: 0, y: suspensionOffset * angularVelocity};
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

function applyTraction(actor, localVelocity, wheelReaction) {
    const speed = vMagnitude(actor.velocity);
    const traction = getTraction(actor);
    const drag = vScale(actor.velocity, -(dragCoef * speed));
    const rres = vToParent(vAdd(wheelReaction.front, wheelReaction.rear), actor.dir);
    const force = vAdd(traction, drag, rres);
    const acceleration = vScale(force, 1 / actor.mass);

    actor.debug.lateral = rres;

    actor.velocity.x += acceleration.x * STEP_SIZE;
    actor.velocity.y += acceleration.y * STEP_SIZE;
}

function getTraction(actor) {
    if (actor.braking) {
        const brakeMultiplier = actor.goingForward ? -1 : 1;
        return vScale(actor.vector, brakeCoef * brakeMultiplier);
    } else {
        return vScale(actor.vector, actor.engine);
    }
}

export function applyForces(body) {
    body.x += body.velocity.x * STEP_SIZE;
    body.y += body.velocity.y * STEP_SIZE;

    //*
    // Damper
    if (body.angularVelocity > 0) {
        body.angularVelocity = Math.max(body.angularVelocity - 0.05 * STEP_SIZE, 0);
    } else if (body.angularVelocity < 0) {
        body.angularVelocity = Math.min(body.angularVelocity + 0.05 * STEP_SIZE, 0);
    }
    let speed = vMagnitude(body.velocity);
    const angle = -vAngle(body.velocity, { x: 1, y: 0 });
    if (speed > 0) {
        speed = Math.max(speed - 0.01 * STEP_SIZE, 0);
        body.velocity.x = Math.cos(angle) * speed;
        body.velocity.y = Math.sin(angle) * speed;
    }
    //*/
}

export function resolveCollisions(actor, walls) {
    for (let wall of walls) {
        actor.collision = false;
        if (isIntersectingBroad(actor, wall)) {
            wall.close = true;
            const resVector = getResolutionVector(actor, wall);
            if (resVector.magnitude !== 0) {
                actor.x -= resVector.x;
                actor.y -= resVector.y;
                const speed = vMagnitude(actor.velocity);
                actor.velocity.x -= resVector.x * 100;
                actor.velocity.y -= resVector.y * 100;
                wall.collision = true;
            } else {
                wall.collision = false;
            }
        } else {
            wall.close = false;
            wall.collision = false;
        }
    }
}