import { STEP_SIZE_IN_MS } from './constants.js';
import { toDeg, vMagnitude, mPerSecToKmPerHour, vAngle } from './utility.js';
import Scene from './scene.js';
import getLogger from './debug.js';

const right = { x: 1, y: 0 };

main();

function main() {
    let going = true;
    document.getElementById('pause').addEventListener('click', () => going = false);
    document.getElementById('resume').addEventListener('click', () => going = true);
    const logger = getLogger();

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

            logger.log('Time', (time * 0.001).toFixed(1));
            logger.log('Local', `${scene.actor.local.x.toFixed(1)} ${scene.actor.local.y.toFixed(1)} Slip: ${toDeg(scene.actor.slip.angle)} (${scene.actor.slip.x.toFixed(1)} ${scene.actor.slip.y.toFixed(1)})`);
            logger.log('Car', `Engine ${scene.actor.engine.toFixed(0)} Direction ${toDeg(scene.actor.dir)} (${scene.actor.vector.x.toFixed(2)} ${scene.actor.vector.y.toFixed(2)})`);
            logger.log('Position', `${scene.actor.x.toFixed(0)} ${scene.actor.y.toFixed(0)}`);
            logger.log('Speed', `${mPerSecToKmPerHour(vMagnitude(scene.actor.velocity)).toFixed(1)} km/h (${scene.actor.velocity.x.toFixed(2)} ${scene.actor.velocity.y.toFixed(2)})`);
            logger.log('Angle', `${toDeg(vAngle(scene.actor.vector, right))}`);
            const AoA = vAngle(scene.actor.vector, scene.actor.velocity);
            logger.log('AoA', toDeg(AoA));
            logger.print();
        }

        requestAnimationFrame(update);
    }
}

/*
console.log(vAngle(
    {
        x: 0.6845471059286918,
        y: -0.7289686274214086
    },
    {
        x: 26.15891094554939,
        y: - 27.856410817698194
    }
));
*/