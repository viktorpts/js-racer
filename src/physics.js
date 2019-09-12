import { STEP_SIZE } from './constants.js';
import { vScale, vMagnitude, vAdd, wrap, vDot, vAngle } from './utility.js';

const dragCoef = 0.8;
const rrCoef = 30;
const brakeCoef = 20000;

export function applyLocomotion(actor) {
    const speed = vMagnitude(actor.velocity);
    const localVelocity = {x: vDot(actor.velocity, actor.vector), y: vDot(actor.velocity, {x: -actor.vector.y, y: actor.vector.x})};

    applyTurning(actor, localVelocity.x);

    actor.local = localVelocity;

    const traction = getTraction(actor);
    const drag = vScale(actor.velocity, -(dragCoef * speed));
    const rresLocal = {x: localVelocity.x * -rrCoef, y: localVelocity.y * -brakeCoef};
    const rres = {
        x: Math.cos(actor.dir) * rresLocal.x - Math.sin(actor.dir) * rresLocal.y,
        y: Math.sin(actor.dir) * rresLocal.x + Math.cos(actor.dir) * rresLocal.y,
        angle: 0
    };
    actor.slip = rres;

    const force = vAdd(traction, drag, rres);
    const acceleration = vScale(force, 1 / actor.mass);

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

function applyTurning(actor, speed) {
    if (speed === 0 || actor.turnRate === 0) {
        return;
    } else {
        const R = 4 / Math.sin(actor.turnRate);
        actor.dir = wrap(actor.dir + (speed / R) * STEP_SIZE, 0, Math.PI * 2);

        actor.vector = { x: Math.cos(actor.dir), y: Math.sin(actor.dir) };
    }
}

export function applyForces(body) {
    body.x += body.velocity.x * STEP_SIZE;
    body.y += body.velocity.y * STEP_SIZE;
}