import { STEP_SIZE } from './constants.js';
import { vScale, vMagnitude, vAdd, wrap, vToParent, vProject, vAngle, clamp } from './utility.js';
import { isIntersectingBroad, getResolutionVector } from './sat.js';

const dragCoef = 1.2;
const rrCoef = 20;
const brakeCoef = 20000;
const inertia = 500;
// Cornering and friction account for wheel load of 6000N (~600kg)
const corneringCoef = 25000;
const frictionCircle = 7000;

export function applyLocomotion(actor) {
    const speed = vMagnitude(actor.velocity);
    const localVelocity = vProject(actor.velocity, actor.vector);
    actor.debug.local = localVelocity;

    const slipForce = {
        rear: getSlipForce(localVelocity.x, localVelocity.y, -actor.angularVelocity, actor.length / 2),
        front: getSlipForce(localVelocity.x, localVelocity.y, actor.angularVelocity, actor.length / 2, actor.turnRate)
    };

    actor.debug.slip = slipForce;

    applyTorque(actor, localVelocity.x, slipForce.rear.y, slipForce.front.y);

    const traction = getTraction(actor);
    const drag = vScale(actor.velocity, -(dragCoef * speed));
    const rresLocal = { x: localVelocity.x * -rrCoef - slipForce.front.x, y: slipForce.rear.y + slipForce.front.y };
    const rres = vToParent(rresLocal, actor.dir);
    const force = vAdd(traction, drag, rres);
    const acceleration = vScale(force, 1 / actor.mass);

    actor.debug.lateral = rresLocal;

    actor.velocity.x += acceleration.x * STEP_SIZE;
    actor.velocity.y += acceleration.y * STEP_SIZE;
}

export function getSlipForce(lonForce, latForce, angularVelocity, dist, turnRate = 0) {
    const slipAngle = getSlipAngle(lonForce, latForce, angularVelocity, dist, turnRate);
    const slipRatio = getSlipRatio(slipAngle);

    let slipForce = slipRatio * Math.cos(turnRate) * -corneringCoef * Math.abs(slipAngle);
    //slipForce = Math.min(slipForce, frictionCircle);
    return {
        angle: slipAngle,
        ratio: slipRatio,
        x: turnRate === 0 ? 0 : Math.sin(turnRate) * slipForce,
        y: slipForce
    };
}


export function getSlipAngle(lonForce, latForce, angularVelocity, dist, turnRate = 0) {
    const rotForce = angularVelocity * dist;
    if (lonForce === 0) {
        return Math.PI * 0.5 * Math.sign(latForce + rotForce);
    }
    return Math.atan((latForce + rotForce) / Math.abs(lonForce)) - turnRate * Math.sign(lonForce);
}

export function getSlipRatio(angle) {
    let multiplier = angle < 0 ? -1 : 1;
    let slip = Math.abs(angle * 2 / Math.PI);
    const peak = 0.2; // Percentage of 0.5*PI
    const minRatio = 0.75;
    if (slip > 1) {
        slip = 2 - slip;
    }
    if (slip <= peak) {
        return slip / peak * multiplier;
    } else {
        return Math.max(1 - ((slip - peak) * (1 - minRatio)) / (1 - peak), 0) * multiplier;
    }
}

function applyTorque(actor, speed, rearLat, frontLat) {
    if (actor.handBrake) {
        rearLat *= 0.95;
    }
    let torque = -rearLat * 2 + frontLat * 2;
    if (Math.abs(torque) < 0.001) {
        torque = 0;
    }
    const newAV = actor.angularVelocity + (torque / inertia) * STEP_SIZE;
    /*
    if (Math.sign(actor.angularVelocity) * Math.sign(newAV) < 0) {
        return actor.angularVelocity = 0;
    }
    //*/
    actor.angularVelocity = newAV;
    if (Math.abs(speed) <= 0.5) {
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

export function applyForces(body) {
    body.x += body.velocity.x * STEP_SIZE;
    body.y += body.velocity.y * STEP_SIZE;

    /*
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