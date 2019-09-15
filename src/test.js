import { getSlipRatio, applyLocomotion, getSlipAngle } from './physics.js';
import { vProject, vAngle, vMagnitude } from './utility.js';
import Car from './car.js';
import { getRenderer } from './renderer.js';

const renderer = getRenderer();
renderer.camera.zoom = 1;

plotSpin();
//plotFrontForce();

function plotSpin() {
    const lat = [];
    const lon = [];
    const torque = [];

    for (let i = 0; i < 100; i++) {
        const angle = Math.PI * i * 0.005;
        const car = new Car(0, 0, 0);
        car.velocity = { x: 27, y: 0 };
        car.turnRate = Math.PI * 0.2;

        const before = angle * 35;
        car.angularVelocity = before;

        applyLocomotion(car);

        lat.push(-car.debug.slip.front.latForce);
        lon.push(car.debug.slip.rear.latForce);
        torque.push(car.angularVelocity - before);
    }

    renderer.plotGrid(100);
    renderer.plot(lat, 0.01, 'red');
    renderer.plot(lon, 0.01, 'green');
    renderer.plot(torque, 10, 'blue');
}


function plotFrontForce() {
    const lat = [];
    const lon = [];
    const rr = [];

    for (let i = 0; i < 100; i++) {
        const angle = Math.PI * 0.5 - Math.PI * i * 0.01;
        const car = new Car(0, 0, 0);
        car.velocity = { x: 27, y: 0 };
        car.turnRate = angle;
        applyLocomotion(car);

        lat.push(car.debug.slip.front.latForce);
        lon.push(car.debug.slip.front.lonForce);
        rr.push(car.debug.lateral.x);
    }

    renderer.plot(lat, 0.01, 'red');
    renderer.plot(lon, 0.01, 'green');
    renderer.plot(rr, 0.01, 'blue');
}