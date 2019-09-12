const worldScale = 10;

export function getRenderer() {
    const ctx = getContext();
    const camera = {
        x: 0,
        y: 0,
        zoom: 1.5
    };

    function begin() {
        ctx.clearRect(0, 0, 800, 600);
        ctx.save();
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
        ctx.strokeStyle = '#666666';
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
        renderVector(actor.velocity.x, actor.velocity.y, '#ff00ff');
        renderVector(actor.slip.x, actor.slip.y, '#00ffff');
        // End vector debug

        ctx.rotate(actor.dir);

        ctx.fillStyle = 'blue';
        ctx.fillRect(-10, -10, 40, 20);

        ctx.fillStyle = '#333333';
        renderWheel(-3, -10, 0);
        renderWheel(-3, 10, 0);
        renderWheel(23, -10, actor.turnRate);
        renderWheel(23, 10, actor.turnRate);

        ctx.strokeStyle = 'black';
        ctx.beginPath();
        ctx.moveTo(-10, 0);
        ctx.lineTo(30, 0);
        ctx.moveTo(0, -10);
        ctx.lineTo(0, 10);
        ctx.moveTo(20, 10);
        ctx.lineTo(30, 0);
        ctx.lineTo(20, -10);
        ctx.stroke();
        ctx.closePath();

        if (actor.braking) {
            ctx.fillStyle = 'red';
            ctx.fillRect(-9, -10, 2, 4);
            ctx.fillRect(-9, 6, 2, 4);
        } else if (actor.reversing) {
            ctx.fillStyle = 'white';
            ctx.fillRect(-9, -10, 2, 4);
            ctx.fillRect(-9, 6, 2, 4);
        }

        // Vector debug
        renderVector(actor.local.x, 0, '#00ff00');
        renderVector(0, actor.local.y, '#ff0000');
        // End vector debug

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

    return {
        begin,
        end,
        track,
        renderGraph,
        renderCar
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