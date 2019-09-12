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

    const scene = new Scene();


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
        logger.log('Slip', `<ul><li>Front: ${actor.debug.slip.frontSlipRatio.toFixed(1)}</li><li>Rear: ${actor.debug.slip.rearSlipRatio.toFixed(1)}</li></ul>`);
    }

    logger.print();
}