export function wrap(value, min, max) {
    if (value < min) {
        return value + (max - min);
    } else if (value >= max) {
        return value - (max - min);
    } else {
        return value;
    }
}

export function clamp(value, min, max) {
    return Math.max(Math.min(value, max), min);
}

export function toDeg(rad) {
    return (rad / Math.PI * 180).toFixed(0);
}

export function vScale(vector, scalar) {
    return { x: vector.x * scalar, y: vector.y * scalar };
}

export function vAdd(...vectors) {
    return vectors.reduce((p, c) => ({ x: p.x + c.x, y: p.y + c.y }), { x: 0, y: 0 });
}

export function vMagnitude(vector) {
    return Math.sqrt(vector.x ** 2 + vector.y ** 2);
}

export function mPerSecToKmPerHour(speed) {
    return speed * 3.6;
}

export function KmPerHourTomPerSec(speed) {
    return speed / 3.6;
}

export function vDot(a, b) {
    return (a.x * b.x) + (a.y * b.y);
}

export function vCross(a, b) {
    return (a.x * b.y) - (a.y * b.x);
}

export function vAngle(a, b) {
    const magA = vMagnitude(a);
    const magB = vMagnitude(b);
    if (magA === 0 || magB === 0) {
        return 0;
    } else {
        const cosTheta = Math.max(Math.min(vDot(a, b) / (vMagnitude(a) * vMagnitude(b)), 1), -1);
        const hand = Math.sign(vCross(a, b)) < 0 ? -1 : 1;
        return Math.acos(cosTheta) * hand;
    }
}

export function vToLocal(vector, bodyDir) {
    return vRotate(vector, -bodyDir);
}

export function vToParent(vector, bodyDir) {
    return vRotate(vector, bodyDir);
}

export function vRotate(vector, angle) {
    return {
        x: Math.cos(angle) * vector.x - Math.sin(angle) * vector.y,
        y: Math.sin(angle) * vector.x + Math.cos(angle) * vector.y
    };
}

export function vNegate(vector) {
    return {
        x: -vector.x,
        y: -vector.y
    };
}

export function pToWorld(point, body) {
    return {
        x:  point.x + body.x,
        y:  point.y + body.y
    };
}

export function vProject(vector, xAxis) {
    return {x: vDot(vector, xAxis), y: vDot(vector, {x: -xAxis.y, y: xAxis.x})};
}