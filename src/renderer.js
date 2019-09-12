const worldScale = 10;

export function getRenderer() {
    const ctx = getContext();
    const camera = {
        x: 0,
        y: 0,
        zoom: 0.75
    };

    function begin() {
        ctx.save();
        ctx.fillStyle = '#999999';
        ctx.fillRect(0, 0, 800, 600);
        ctx.scale(camera.zoom, camera.zoom);
        ctx.translate(-camera.x, -camera.y);
        ctx.translate(400 / camera.zoom, 300 / camera.zoom);
    }

    function end() {
        ctx.restore();
    }

    function track(actor) {
        const { x, y } = worldToCanvas({ x: actor.x, y: actor.y });
        camera.x = x;
        camera.y = y;
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

    function renderCar(actor, inside) {
        const { x, y } = worldToCanvas({ x: actor.x, y: actor.y });
        ctx.save();

        ctx.translate(x, y);

        // Vector debug
        renderVector(actor.velocity.x, actor.velocity.y, '#ff00ff');
        // End vector debug

        ctx.rotate(actor.dir);

        ctx.fillStyle = 'blue';
        if (!inside) {
            ctx.fillStyle = 'red';
        }
        ctx.fillRect(-20, -10, 40, 20);

        ctx.fillStyle = '#333333';
        renderWheel(-13, -10, 0);
        renderWheel(-13, 10, 0);
        renderWheel(13, -10, actor.turnRate);
        renderWheel(13, 10, actor.turnRate);

        ctx.strokeStyle = 'black';
        ctx.beginPath();
        ctx.moveTo(-20, 0);
        ctx.lineTo(20, 0);
        ctx.moveTo(0, -10);
        ctx.lineTo(0, 10);
        ctx.moveTo(10, 10);
        ctx.lineTo(20, 0);
        ctx.lineTo(10, -10);
        ctx.stroke();
        ctx.closePath();

        if (actor.braking) {
            ctx.fillStyle = 'red';
            ctx.fillRect(-19, -10, 2, 4);
            ctx.fillRect(-19, 6, 2, 4);
        } else if (actor.reversing) {
            ctx.fillStyle = 'white';
            ctx.fillRect(-19, -10, 2, 4);
            ctx.fillRect(-19, 6, 2, 4);
        }

        renderVector(actor.debug.lateral.x, actor.debug.lateral.y, '#ff0000');

        ctx.restore();
    }

    function renderWheel(x, y, dir) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(dir);
        ctx.fillRect(-4, -2, 8, 4);
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
        ctx.restore();
    }

    function renderTrack(track) {
        ctx.save();

        const start = worldToCanvas(track[0]);
        ctx.beginPath();
        ctx.setLineDash([40, 40]);

        ctx.moveTo(start.x, start.y);

        for (let node of track.slice(1)) {
            const sc = worldToCanvas(node);
            ctx.lineTo(sc.x, sc.y);
        }
        ctx.closePath();

        ctx.lineJoin = 'round';
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 250;
        ctx.stroke();
        ctx.strokeStyle = 'white';
        ctx.lineDashOffset = 40;
        ctx.stroke();
        ctx.strokeStyle = '#999999';
        ctx.setLineDash([]);
        ctx.lineWidth = 240;
        ctx.stroke();

        ctx.restore();
    }

    function renderDebug() {
        ctx.save();

        ctx.beginPath();
        ctx.strokeStyle = 'red';
        ctx.fillStyle = '#ffffff';
        ctx.lineWidth = 500;
        ctx.moveTo(49000, 49000);
        ctx.lineTo(50000, 50000);
        ctx.stroke();
        ctx.closePath();

        ctx.restore();
    }

    function createPath(track) {
        const path = new Path2D();
        const start = worldToCanvas(track[0]);

        path.moveTo(start.x, start.y);

        for (let node of track.slice(1)) {
            const sc = worldToCanvas(node);
            path.lineTo(sc.x, sc.y);
        }
        path.closePath();

        return path;
    }

    function renderPath(path, actor) {
        ctx.save();

        ctx.setLineDash([40, 40]);

        ctx.lineJoin = 'round';
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 250;
        ctx.stroke(path);
        ctx.strokeStyle = 'white';
        ctx.lineDashOffset = 40;
        ctx.stroke(path);
        ctx.strokeStyle = '#999999';
        ctx.setLineDash([]);
        ctx.lineWidth = 240;
        ctx.stroke(path);

        const inside = ctx.isPointInStroke(path, 50000, 50000);

        ctx.restore();

        const {x, y} = worldToCanvas(actor);
        return inside;
    }

    return {
        begin,
        end,
        track,
        renderGraph,
        renderCar,
        renderTrack,
        renderDebug,
        createPath,
        renderPath
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