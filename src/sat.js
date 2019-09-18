import { vToParent, vDot, vScale, pToWorld, vMagnitude } from './utility.js';

export function isIntersectingBroad(actor, wall) {
    const ray = {
        x: actor.x - wall.x,
        y: actor.y - wall.y
    };
    const dist = vMagnitude(ray);
    if (dist < wall.length * 0.5 + 2) {
        return true;
    } else {
        return false;
    }
}

export function getResolutionVector(body1, body2) {
    const body1pts = getPointPosition(body1).map(p => pToWorld(p, body1));
    const body2pts = getPointPosition(body2).map(p => pToWorld(p, body2));

    let smallest = Number.POSITIVE_INFINITY;
    let smallestAxis = { x: 0, y: 0 };

    const axes = [];
    axes.push({ x: Math.cos(body1.dir), y: Math.sin(body1.dir) });
    axes.push({ x: -axes[0].y, y: axes[0].x });
    axes.push({ x: Math.cos(body2.dir), y: Math.sin(body2.dir) });
    axes.push({ x: -axes[2].y, y: axes[2].x });

    for (let axis of axes) {
        const intersection = getIntersectionAmount(body1pts, body2pts, axis);
        if (Math.abs(intersection) < Math.abs(smallest)) {
            smallest = intersection;
            smallestAxis = axis;
        }
    }

    const vector = vScale(smallestAxis, smallest);
    vector.magnitude = smallest;
    return vector;
}

function getIntersectionAmount(body1pts, body2pts, axis) {
    const p1limits = getMinMax(body1pts, axis);
    const p2limits = getMinMax(body2pts, axis);

    const separation = (p2limits.max < p1limits.min) || (p1limits.max < p2limits.min);
    if (separation) {
        return 0;
    } else {
        if (p1limits.max > p2limits.max) {
            return p1limits.min - p2limits.max;
        } else {
            return p1limits.max - p2limits.min;
        }
    }
}

function getMinMax(points, axis) {
    const projected = points.map(p => vDot(p, axis));
    const min = Math.min.apply(null, projected);
    const max = Math.max.apply(null, projected);

    return { min, max };
}

function getPointPosition(body) {
    const halfW = body.width * 0.5;
    const halfL = body.length * 0.5;

    const p1 = vToParent({ x: halfL, y: halfW }, body.dir);
    const p2 = vToParent({ x: -halfL, y: halfW }, body.dir);
    const p3 = vToParent({ x: -halfL, y: -halfW }, body.dir);
    const p4 = vToParent({ x: halfL, y: -halfW }, body.dir);

    return [p1, p2, p3, p4];
}