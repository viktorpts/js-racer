import { STEP_SIZE_IN_MS } from './constants.js';
import { toDeg, vMagnitude, mPerSecToKmPerHour, vAngle } from './utility.js';
import Scene from './scene.js';
import getLogger from './debug.js';

const walls = [
    { x: 4974, y: 5016, size: 173, dir: 0 },
    { x: 4872, y: 4967, size: 104, dir: 1.25 },
    { x: 4872, y: 4819, size: 202, dir: 1.74 },
    { x: 4939, y: 4760, size: 130, dir: 0.67 },
    { x: 4998, y: 4841, size: 80, dir: 1.39 },
    { x: 5051, y: 4913, size: 112, dir: 0.61 },
    { x: 5078, y: 4981, size: 80, dir: 2.03 },

    { x: 4976, y: 4984, size: 128, dir: 0 },
    { x: 4905, y: 4963, size: 44, dir: 1.25 },
    { x: 4956, y: 4942, size: 117, dir: 0 },
    { x: 4986, y: 4913, size: 82, dir: 0.79 },
    { x: 4926, y: 4884, size: 62, dir: 0 },
    { x: 4903, y: 4832, size: 104, dir: 1.74 },
    { x: 4936, y: 4800, size: 62, dir: 0.67 },
    { x: 4967, y: 4859, size: 82, dir: 1.39 },
    { x: 5014, y: 4927, size: 97, dir: 0.61 },
    { x: 5047, y: 4969, size: 32, dir: 2.03 },
    { x: 4901, y: 4913, size: 89, dir: 0 },

    { x: 4895, y: 4737, size: 22, dir: 2.78 },
    { x: 4987, y: 4930, size: 24, dir: 1.96 },
];

const right = { x: 1, y: 0 };
const logger = getLogger();

main();

function main() {
    let going = true;
    document.getElementById('pause').addEventListener('click', () => going = false);
    document.getElementById('resume').addEventListener('click', () => going = true);

    const track = [
        { x: 5000, y: 5000 }, // 0
        { x: 4900, y: 5000 }, // 1
        { x: 4875, y: 4925 }, // 2
        { x: 4975, y: 4925 }, // 3
        { x: 4950, y: 4900 }, // 4
        { x: 4875, y: 4900 }, // 5
        { x: 4900, y: 4750 }, // 6
        { x: 4975, y: 4810 }, // 7
        { x: 4990, y: 4890 }, // 8
        { x: 5075, y: 4950 }, // 9
        { x: 5050, y: 5000 }, // 10
    ];
    const scene = new Scene(5000, 5000, Math.PI, track);
    for (let wall of walls) {
        scene.addWall(wall.x, wall.y, wall.size, wall.dir);
    }

    let frame = 0;
    let lastUpdate = performance.now();
    let delta = 0;
    requestAnimationFrame(update);

    function update(time) {
        if (going) {
            delta = Math.min(delta + (time - lastUpdate), 10 * STEP_SIZE_IN_MS);
            lastUpdate = time;

            while (delta >= STEP_SIZE_IN_MS) {
                frame++;
                /*
                if (frame > 200) {
                    frame = 0;
                    going = false;
                    console.log(scene.actor);
                }
                */
                delta -= STEP_SIZE_IN_MS;
                scene.step();
                scene.render();
            }

            logDebug(time, scene.actor);
        }

        requestAnimationFrame(update);
    }
}

function logDebug(time, actor) {
    logger.log('Time', (time * 0.001).toFixed(1));
    logger.log('Car', `Engine ${actor.engine.toFixed(0)} Direction ${toDeg(actor.dir)} (${actor.vector.x.toFixed(2)} ${actor.vector.y.toFixed(2)})`);
    logger.log('Position', `${actor.x.toFixed(0)} ${actor.y.toFixed(0)}`);
    logger.log('Speed', `${mPerSecToKmPerHour(vMagnitude(actor.velocity)).toFixed(1)} km/h (${actor.velocity.x.toFixed(2)} ${actor.velocity.y.toFixed(2)})`);
    logger.log('Angle', `${toDeg(vAngle(actor.vector, right))}`);
    logger.log('AV', toDeg(actor.angularVelocity));

    if (actor.debug.local !== undefined) {
        logger.log('Local', `${actor.debug.local.x.toFixed(0)} ${actor.debug.local.y.toFixed(0)}`);
    }

    if (actor.debug.slip !== undefined) {
        logger.log('Slip', `<ul><li>Front: ${toDeg(actor.debug.slip.frontSlipRatio)}</li><li>Rear: ${toDeg(actor.debug.slip.rearSlipRatio)}</li></ul>`);
    }

    if (actor.wheelForces !== undefined) {
        logger.log('Slip', `
        <ul><li>Front: ${toDeg(actor.wheelForces.front.angle)} ${actor.wheelForces.front.ratio.toFixed(2)} (${actor.wheelForces.front.disp.x.toFixed(2)} ${actor.wheelForces.front.disp.y.toFixed(2)})</li>
        <li>Rear: ${toDeg(actor.wheelForces.rear.angle)} ${actor.wheelForces.rear.ratio.toFixed(2)} (${actor.wheelForces.rear.disp.x.toFixed(2)} ${actor.wheelForces.rear.disp.y.toFixed(2)})</li></ul>
        `);
    }

    logger.print();
}