import { STEP_SIZE_IN_MS } from './constants.js';
import { toDeg, vMagnitude, mPerSecToKmPerHour, vAngle } from './utility.js';
import Scene from './scene.js';
import getLogger from './debug.js';

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
    scene.addWall(4974, 5016, 173, 0);
    scene.addWall(4872, 4967, 104, 1.25);
    scene.addWall(4872, 4819, 202, 1.74);
    scene.addWall(4939, 4760, 130, 0.67);
    scene.addWall(4998, 4841, 80, 1.39);
    scene.addWall(5051, 4913, 112, 0.61);
    scene.addWall(5078, 4981, 80, 2.03);

    scene.addWall(4976, 4984, 128, 0);
    scene.addWall(4905, 4963, 44, 1.25);
    scene.addWall(4956, 4942, 117, 0);
    scene.addWall(4986, 4913, 82, 0.79);
    scene.addWall(4926, 4884, 62, 0);
    scene.addWall(4903, 4832, 104, 1.74);
    scene.addWall(4936, 4800, 62, 0.67);
    scene.addWall(4967, 4859, 82, 1.39);
    scene.addWall(5014, 4927, 97, 0.61);
    scene.addWall(5047, 4969, 32, 2.03);
    scene.addWall(4901, 4913, 89, 0);

    scene.addWall(4895, 4737, 22, 2.78);
    scene.addWall(4987, 4930, 24, 1.96);


    let lastUpdate = performance.now();
    let delta = 0;
    requestAnimationFrame(update);

    function update(time) {
        if (going) {
            delta = Math.min(delta + (time - lastUpdate), 10 * STEP_SIZE_IN_MS);
            lastUpdate = time;

            while (delta >= STEP_SIZE_IN_MS) {
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
    const AoA = vAngle(actor.vector, actor.velocity);
    logger.log('AoA', toDeg(AoA));

    if (actor.debug.local !== undefined) {
        logger.log('Local', `${actor.debug.local.x.toFixed(0)} ${actor.debug.local.y.toFixed(0)}`);
    }

    if (actor.debug.slip !== undefined) {
        logger.log('Slip', `<ul><li>Front: ${toDeg(actor.debug.slip.frontSlipRatio)}</li><li>Rear: ${toDeg(actor.debug.slip.rearSlipRatio)}</li></ul>`);
    }

    logger.print();
}