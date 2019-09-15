import { getSlipRatio, applyLocomotion, getSlipAngle, applyForces, getSlipForce } from './physics.js';
import { vProject, vAngle, vMagnitude, vScale } from './utility.js';
import Car from './car.js';
import { getRenderer } from './renderer.js';

const renderer = getRenderer();
renderer.camera.zoom = 1;

//plotSpin();
//plotFrontForce();
renderer.plotGrid(61);
//plotTurnRate(Math.PI * 0.05, -5, 'orange');
//plotTurnRate(Math.PI * 0.05, -15, 'orange');
//plotTurnRate(Math.PI * 0.05, -25, 'orange');
//plotTurnRate(Math.PI * 0.05, -35, 'orange');
const turn = Math.PI * 0.1;
/*
plotTurnRate(turn, -45, '#600');
plotTurnRate(turn, -45, '#c00');

plotTurnRate(turn, -35, '#060');
plotTurnRate(turn, -35, '#0c0');

plotTurnRate(turn, -25, '#006');
plotTurnRate(turn, -25, '#00c');

plotTurnRate(turn, -15, '#660');
plotTurnRate(turn, -15, '#cc0');
*/

plotTurnRate(turn, -25, '#606');

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

function plotTurnRate(turnRate, speed, color) {
    const rearLat = [];
    const frontLat = [];
    const torque = [];
    const dir = [];

    const car = new Car(0, 0, Math.PI);
    car.turnRate = turnRate;

    for (let i = 0; i < 60; i++) {
        const velocity = vScale(car.vector, speed);
        car.velocity.x = velocity.x;
        car.velocity.y = velocity.y;

        let before = car.dir;

        applyLocomotion(car);
        applyForces(car);

        rearLat.push(car.debug.slip.rear.y);
        frontLat.push(car.debug.slip.front.y);
        torque.push(car.angularVelocity);
        dir.push(car.dir - before);
    }

    renderer.plot(rearLat, 0.001, 'red');
    renderer.plot(frontLat, 0.001, 'green');
    renderer.plot(torque, 100, color);
    renderer.plot(dir, 5000);
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