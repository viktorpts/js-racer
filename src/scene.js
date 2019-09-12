import { getRenderer } from './renderer.js';
import { initInput } from './input.js';
import { applyLocomotion, applyForces } from './physics.js';
import Car from './car.js';

export default class Scene {
    constructor() {
        this.renderer = getRenderer();

        const keys = {};
        initInput(keys);
        this.actor = new Car(5000, 5000, Math.PI);
        this.actor.bindControls(keys);
        this.track = [
            { x: 5000, y: 5000 },
            { x: 4900, y: 5000 },
            { x: 4875, y: 4925 },
            { x: 4975, y: 4925 },
            { x: 4950, y: 4900 },
            { x: 4875, y: 4900 },
            { x: 4900, y: 4750 },
            { x: 4950, y: 4825 },
            { x: 5000, y: 4900 },
            { x: 5075, y: 4985 },
        ];

        this.path = this.renderer.createPath(this.track);
    }

    step() {
        this.actor.update();
        applyLocomotion(this.actor);
        applyForces(this.actor);
    }

    render() {
        this.renderer.track(this.actor);

        this.renderer.begin();
        this.renderer.renderGraph();

        const inside = this.renderer.renderPath(this.path, this.actor);

        this.renderer.renderCar(this.actor, inside);

        this.renderer.end();
    }
}