import { getRenderer } from './renderer.js';
import { initInput } from './input.js';
import { applyLocomotion, applyForces, resolveCollisions } from './physics.js';
import Car from './car.js';

export default class Scene {
    constructor(x = 5000, y = 5000, dir = 0, track = []) {
        this.renderer = getRenderer(x, y);
        this.startingDir = dir;

        const keys = {};
        initInput(keys);
        this.actor = new Car(x, y, dir);
        this.actor.bindControls(keys);
        this.track = track;
        this.walls = [];

        this.path = this.renderer.createPath(this.track);
    }

    addWall(x, y, size, dir) {
        this.walls.push({
            x, y, width: 2, length: size, dir,
            close: false,
            collision: false
        });
    }

    step() {
        this.actor.update();
        applyLocomotion(this.actor);
        applyForces(this.actor);
        resolveCollisions(this.actor, this.walls);
    }

    render() {
        this.renderer.track(this.actor);

        this.renderer.begin();
        this.renderer.renderGraph();

        this.renderer.renderPath(this.path, this.actor);
        for (let wall of this.walls) {
            this.renderer.renderBarrier(wall);
        }
        this.renderer.renderFinish(this.track[0].x, this.track[0].y, this.startingDir);

        this.renderer.renderCar(this.actor);

        this.renderer.end();
    }
}