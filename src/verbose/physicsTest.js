import { vRotate, vToLocal, vToParent, vAdd, vNegate } from '../utility.js';
import { applyLocomotion } from './verbosePhysics.js';
import { getRenderer } from '../renderer.js';

const car = {
    x: 0,
    y: 0,
    length: 4,
    width: 2,
    dir: 0,
    mass: 1200,
    velocity: {
        x: 0,
        y: 0,
    },
    angularVelocity: Math.PI * 0.1,
    turnRate: 0
};


console.log(applyLocomotion(car));
console.log(car);

/*
const slip = [];

for (let i = 0; i < 100; i++) {
    const ratio = getSlipRatio(Math.PI * 0.005 * i);
    slip.push(ratio);
    console.log(ratio);
}

const renderer = getRenderer();
renderer.plotGrid(100, 20);
renderer.plot(slip, 400);
*/