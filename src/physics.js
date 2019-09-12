import { STEP_SIZE } from './constants.js';
import { vScale, vMagnitude, vAdd, wrap, vToWorld, vProject, vAngle } from './utility.js';

const dragCoef = 1.2;
const rrCoef = 30;
const brakeCoef = 20000;
const corneringCoef = 6000;
const inertia = 500;

export function applyLocomotion(actor) {
    const speed = vMagnitude(actor.velocity);
    const localVelocity = vProject(actor.velocity, actor.vector);
    actor.debug.local = localVelocity;

    let rearSlipRatio = getSlipRatio(getRearSlipAngle(actor, localVelocity.x, localVelocity.y));
    if (actor.handBrake) {
        rearSlipRatio *= 0.25;
    }
    const frontSlipRatio = getSlipRatio(getFrontSlipAngle(actor, localVelocity.x, localVelocity.y));
    const rearLat = rearSlipRatio * -corneringCoef;
    const frontLat = frontSlipRatio * Math.cos(actor.turnRate) * -corneringCoef;
    const frontLon = frontSlipRatio * Math.sin(actor.turnRate) * -corneringCoef;

    actor.debug.slip = {
        rearSlipRatio: rearLat,
        frontSlipRatio: frontLat
    };

    applyTurning(actor, localVelocity.x, rearLat, frontLat);

    const traction = getTraction(actor);
    const drag = vScale(actor.velocity, -(dragCoef * speed));
    const rresLocal = { x: localVelocity.x * -rrCoef - frontLon, y: rearLat + frontLat };
    const rres = vToWorld(rresLocal, actor);
    const force = vAdd(traction, drag, rres);
    const acceleration = vScale(force, 1 / actor.mass);

    actor.debug.lateral = rresLocal;

    actor.velocity.x += acceleration.x * STEP_SIZE;
    actor.velocity.y += acceleration.y * STEP_SIZE;
}

export function getFrontSlipAngle(actor, lonForce, latForce) {
    if (lonForce === 0) {
        return 0;
    }
    return Math.atan((latForce + actor.angularVelocity * 2) / Math.abs(lonForce)) - actor.turnRate * Math.sign(lonForce);
}

export function getRearSlipAngle(actor, lonForce, latForce) {
    if (lonForce === 0) {
        return 0;
    }
    return Math.atan((latForce - actor.angularVelocity * 2) / Math.abs(lonForce));
}

export function getSlipRatio(angle) {
    let multiplier = angle < 0 ? -1 : 1;
    const peak = Math.PI * 0.1;
    let slip = Math.abs(angle);
    if (slip * 2 > Math.PI) {
        slip = Math.PI - slip;
    }
    if (slip <= peak) {
        return slip * 3.2 * multiplier;
    } else {
        return Math.max(1 - (slip - peak) * Math.PI * 0.25, 0) * multiplier;
    }
}

function applyTurning(actor, speed, rearLat, frontLat) {
    const torque = -rearLat * 2 + frontLat * 2;
    actor.angularVelocity += (torque / inertia) * STEP_SIZE;
    if (speed === 0) {
        actor.angularVelocity = 0;
    } else {
        actor.dir = wrap(actor.dir + actor.angularVelocity * STEP_SIZE, 0, Math.PI * 2);
        actor.vector = { x: Math.cos(actor.dir), y: Math.sin(actor.dir) };
    }
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

    // Damper
    if (body.angularVelocity > 0) {
        body.angularVelocity = Math.max(body.angularVelocity - 0.05, 0);
    } else if (body.angularVelocity < 0) {
        body.angularVelocity = Math.min(body.angularVelocity + 0.05, 0);
    }
    let speed = vMagnitude(body.velocity);
    const angle = -vAngle(body.velocity, {x: 1, y: 0});
    if (speed > 0) {
        speed = Math.max(speed - 0.01, 0);
        body.velocity.x = Math.cos(angle) * speed;
        body.velocity.y = Math.sin(angle) * speed;
    }
}