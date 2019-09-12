import { getRenderer } from './renderer.js';
import { initInput } from './input.js';
import { applyLocomotion, applyForces } from './physics.js';
import Car from './car.js';

export default class Scene {
    constructor() {
        this.renderer = getRenderer();

        const keys = {};
        initInput(keys);
        this.actor = new Car(5000, 5000);
        this.actor.bindControls(keys);
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
        this.renderer.renderCar(this.actor);
        this.renderer.end();
    }
}