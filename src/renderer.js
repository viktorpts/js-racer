import { vMagnitude, wrap } from './utility.js';

const worldScale = 10;

export function getRenderer(wX = 0, wY = 0, zoom = 1) {
    const ctx = getContext();
    const { x, y } = worldToCanvas({ x: wX, y: wY });
    const camera = {
        x,
        y,
        zoom,
        dir: 0,
        deltaX: 0,
        deltaY: 0,
        deltaZoom: 0,
        deltaDir: 0,
        targetX: x,
        targetY: y,
        targetZoom: zoom,
        targetDir: 0
    };

    let car = null;
    loadImg('assets/cart.png').then(img => car = img);

    function begin() {
        ctx.save();
        ctx.fillStyle = '#999999';
        ctx.fillRect(0, 0, 800, 600);
        ctx.scale(camera.zoom, camera.zoom);
        ctx.translate(400 / camera.zoom, 300 / camera.zoom);
        /*
        // Rotation should go here
        ctx.rotate(camera.dir - Math.PI * 0.5);
        //*/
        ctx.translate(-camera.x, -camera.y);
    }

    function end() {
        ctx.restore();
    }

    function track(actor) {
        const { x, y } = worldToCanvas({ x: actor.x, y: actor.y });
        camera.targetX = x;
        camera.targetY = y;
        camera.targetDir = -actor.dir;
        const speed = vMagnitude(actor.velocity);
        camera.targetZoom = 3 - Math.min(2, speed / 100 * 2);

        camera.deltaX = transition(camera.x, camera.targetX, camera.deltaX);
        camera.x += camera.deltaX;
        camera.deltaY = transition(camera.y, camera.targetY, camera.deltaY);
        camera.y += camera.deltaY;
        camera.deltaZoom = transition(camera.zoom, camera.targetZoom, camera.deltaZoom, 10);
        camera.zoom += camera.deltaZoom;

        camera.deltaDir = transition(camera.dir, camera.targetDir, camera.deltaDir, 10, true);
        camera.dir = wrap(camera.dir + camera.deltaDir, 0, Math.PI * 2);
    }

    //console.log(transition(0.05, 0.15, 0.05, 1, true).toFixed(3));
    //console.log(transition(0.05, Math.PI * 2 - 0.05, -0.05, 1, true).toFixed(3));
    //console.log(transition(Math.PI * 2 - 0.05, 0.05, 0.05, 1, true).toFixed(3));

    function transition(current, target, delta, frames = 5, rotation = false) {
        let requriedDelta = target - current - delta;
        //console.log(requriedDelta.toFixed(2));
        if (rotation) {
            const left = (target - Math.PI * 2) - current - delta;
            //console.log(left.toFixed(2));
            if (Math.abs(left) < Math.abs(requriedDelta)) {
                requriedDelta = left;
            }
            const reverse = (Math.PI * 2 + target) - current - delta;
            //console.log(reverse.toFixed(2));
            if (Math.abs(reverse) < Math.abs(requriedDelta)) {
                requriedDelta = reverse;
            }
        }
        //console.log(requriedDelta);
        return requriedDelta / frames;
    }

    function renderGraph() {
        ctx.strokeStyle = '#cccccc';
        ctx.beginPath();
        for (let col = 0; col < 1000; col++) {
            ctx.moveTo(col * 100, 0);
            ctx.lineTo(col * 100, 100000);
        }
        for (let row = 0; row < 1000; row++) {
            ctx.moveTo(0, row * 100);
            ctx.lineTo(100000, row * 100);
        }
        ctx.stroke();
        ctx.closePath();
    }

    function renderCar(actor) {
        const { x, y } = worldToCanvas({ x: actor.x, y: actor.y });
        ctx.save();

        ctx.translate(x, y);

        // Vector debug
        //renderVector(actor.velocity.x, actor.velocity.y, '#ff00ff');
        // End vector debug

        ctx.rotate(actor.dir);

        ctx.fillStyle = '#333333';
        renderWheel(-7.5, -4, 0);
        renderWheel(-7.5, 4, 0);
        renderWheel(6.5, -4, actor.turnRate);
        renderWheel(6.5, 4, actor.turnRate);

        if (car === null) {
            ctx.fillStyle = 'blue';
            ctx.fillRect(-10, -5, 20, 10);

            ctx.strokeStyle = 'black';
            ctx.beginPath();
            ctx.moveTo(-10, 0);
            ctx.lineTo(10, 0);
            ctx.moveTo(0, -5);
            ctx.lineTo(0, 5);
            ctx.moveTo(5, 5);
            ctx.lineTo(10, 0);
            ctx.lineTo(5, -5);
            ctx.stroke();
            ctx.closePath();
        } else {
            ctx.drawImage(car, -10, -5, 20, 10);
        }

        if (actor.braking) {
            ctx.fillStyle = 'red';
            ctx.fillRect(-9, -5, 1, 2);
            ctx.fillRect(-9, 3, 1, 2);
        } else if (actor.reversing) {
            ctx.fillStyle = 'white';
            ctx.fillRect(-9, -5, 1, 2);
            ctx.fillRect(-9, 3, 1, 2);
        }

        // Vector debu
        /*
        if (actor.debug.lateral != undefined) {
            renderVector(actor.debug.lateral.x, actor.debug.lateral.y, '#ff0000');
        }
        */
        // End vector debug

        ctx.restore();
    }

    function renderWheel(x, y, dir) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(dir);
        ctx.fillRect(-2, -2, 4, 4);
        ctx.restore();
    }

    function renderVector(x, y, color = '#ff00ff') {
        ctx.save();
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.moveTo(0, 0);
        ctx.lineTo(x * worldScale, y * worldScale);
        ctx.stroke();
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fillRect(x * worldScale - 2, y * worldScale - 2, 4, 4);
        ctx.restore();
    }

    function createPath(track) {
        const path = new Path2D();
        if (track.length == 0) {
            return path;
        }
        const start = worldToCanvas(track[0]);

        path.moveTo(start.x, start.y);

        for (let node of track.slice(1)) {
            const sc = worldToCanvas(node);
            path.lineTo(sc.x, sc.y);
        }
        path.closePath();

        return path;
    }

    function renderPath(path) {
        ctx.save();


        ctx.lineJoin = 'round';
        ctx.strokeStyle = 'green';
        ctx.lineWidth = 350;
        ctx.stroke(path);

        ctx.setLineDash([40, 40]);
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 100;
        ctx.stroke(path);

        ctx.strokeStyle = 'white';
        ctx.lineDashOffset = 40;
        ctx.stroke(path);

        ctx.strokeStyle = '#999999';
        ctx.setLineDash([]);
        ctx.lineWidth = 90;
        ctx.stroke(path);

        ctx.restore();
    }

    function renderBarrier(barrier) {
        const { x, y } = worldToCanvas({ x: barrier.x, y: barrier.y });
        const l = barrier.length * worldScale;
        const w = barrier.width * worldScale;
        const halfL = l * 0.5;
        const halfW = w * 0.5;

        ctx.save();

        ctx.translate(x, y);
        ctx.rotate(barrier.dir);

        ctx.fillStyle = '#333';
        /*
        if (barrier.collision) {
            ctx.fillStyle = 'red';
        } else if (barrier.close) {
            ctx.fillStyle = 'yellow';
        }
        */
        ctx.fillRect(-halfL, -halfW, l, w);

        const path = new Path2D();
        path.moveTo(-halfL, -halfW);
        path.lineTo(halfL, -halfW);
        path.lineTo(halfL, halfW);
        path.lineTo(-halfL, halfW);
        path.closePath();

        ctx.setLineDash([20, 20]);
        ctx.lineJoin = 'round';
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 5;
        ctx.stroke(path);
        ctx.strokeStyle = 'white';
        ctx.lineDashOffset = 20;
        ctx.stroke(path);

        ctx.restore();
    }

    function renderFinish(wX, wY, dir) {
        const { x, y } = worldToCanvas({ x: wX, y: wY });
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(dir);

        ctx.beginPath();
        ctx.lineWidth = 5;
        ctx.setLineDash([5, 5]);
        ctx.moveTo(0, -40);
        ctx.lineTo(0, 40);
        ctx.moveTo(5, 40);
        ctx.lineTo(5, -40);
        ctx.moveTo(10, -40);
        ctx.lineTo(10, 40);

        ctx.strokeStyle = 'white';
        ctx.stroke();

        ctx.lineDashOffset = 5;
        ctx.strokeStyle = 'black';
        ctx.stroke();

        ctx.closePath();

        ctx.restore();
    }

    function plotGrid(hDiv = 10, vDiv = 10) {
        const hSpace = 1180 / (hDiv - 1);
        const vSpace = 400 / vDiv;
        ctx.strokeStyle = '#cccccc';
        ctx.beginPath();
        for (let col = 0; col < hDiv; col++) {
            ctx.moveTo(10 + col * hSpace, 0);
            ctx.lineTo(10 + col * hSpace, 800);
        }
        for (let row = 0; row < vDiv * 2 + 1; row++) {
            ctx.moveTo(10, row * vSpace);
            ctx.lineTo(1190, row * vSpace);
        }
        ctx.stroke();
        ctx.closePath();
    }

    function plot(data, vScale = 1, color = 'blue') {
        let min = Number.POSITIVE_INFINITY;
        let max = Number.NEGATIVE_INFINITY;

        const spacing = 1180 / (data.length - 1);
        ctx.save();

        ctx.strokeStyle = 'black';
        ctx.beginPath();
        ctx.moveTo(0, 400);
        ctx.lineTo(1200, 400);
        ctx.stroke();
        ctx.closePath();

        if (data.length > 0) {
            min = data[0];
            max = data[0];
            ctx.strokeStyle = color;
            ctx.beginPath();
            ctx.moveTo(10, 400 - data[0] * vScale);
            for (let i = 1; i < data.length; i++) {
                min = data[i] < min ? data[i] : min;
                max = data[i] > max ? data[i] : max;
                ctx.lineTo(10 + i * spacing, 400 - data[i] * vScale);
            }
            ctx.stroke();
            ctx.closePath();
        }
        ctx.restore();

        console.log('min:', min, 'max:', max);
    }

    return {
        ctx,
        camera,
        begin,
        end,
        track,
        renderGraph,
        renderCar,
        createPath,
        renderPath,
        renderBarrier,
        renderVector,
        renderFinish,
        plotGrid,
        plot
    };
}

function worldToCanvas(point) {
    return { x: point.x * worldScale, y: point.y * worldScale };
}


/**
 * @return {CanvasRenderingContext2D}
 */
function getContext() {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');

    return ctx;
}

async function loadImg(src) {
    return new Promise((resolve, reject) => {
        var img = new Image();
        img.addEventListener('load', (e) => {
            resolve(img);
        });
        img.src = src;
    });
}