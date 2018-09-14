import QuickVR from 'three-quickvr';

import THREE from '../Three';
import { Generator } from './SimplexGenerator';

// Render Class Object //
export default class Render {
  constructor() {
    this.amount = 12;
    this.size = 3.0;
    this.strength = 2.5;
    this.time = 0;
    this.frame = 0;
    this.speed = 0.25;
    this.iteration = 0.25;
    this.objects = [];
    this.generator = new Generator(10);
    this.clock = new THREE.Clock();
    this.quickvr = new QuickVR();
    this.init();
    this.randomObjects();
    this.renderLoop();
  }

  init = () => {
    this.quickvr.render.antialias = true;
    // this.quickvr.scene.fog = new THREE.FogExp2(0x000000, 0.275);

    // Set Lights //
    let pointLight = new THREE.PointLight(0xDDDDDD);
    pointLight.position.set(50, 450, -800);
    this.quickvr.scene.add(pointLight);
    pointLight = new THREE.PointLight(0xEEEEEE);
    pointLight.position.set(-50, -450, 800);
    this.quickvr.scene.add(pointLight);
    let ambient = new THREE.AmbientLight(0x9f9f9f);
    ambient.position.set(1, 450, -400);
    this.quickvr.scene.add(ambient);

    this.quickvr.scene.add(this.ambient);

    this.stockMaterial = new THREE.MeshLambertMaterial({
      color: 0xaeaeae,
    });
  };

  randomObjects = () => {
    for (let y = 0; y < this.amount * 2; y++) {
      for (let x = 0; x < this.amount; x++) {
        const object = new THREE.Mesh(
          new THREE.CubeGeometry(this.size, this.size / 2, this.size),
          this.stockMaterial,
        );
        this.objects.push(object);
        this.quickvr.scene.add(object);
      }
    }
  };

  checkObjects = () => {
    const size = this.size * 1.25;
    const offset = this.amount * (size / 2) - (size / 2);
    // advance time and tick draw loop for time segment
    this.frame += this.speed; 

    if (this.frame > size) {
      // the time phase of the noise wave moves
      // once the cubes moved one space
      this.time += 1;
      this.frame = 0;
    }

    const timeStop = this.time * this.iteration;
    
    for (let y = 0; y < this.amount * 2; y++) {
      for (let x = 0; x < this.amount; x++) {
        const object = this.objects[x + (y * this.amount)];
        const noiseX = this.generator.simplex3(x * this.iteration, y * this.iteration + timeStop, 0);

        const px = (-offset) + (x * size);
        const py = -(5.0 + (noiseX * this.strength));
        const pz = (-offset) + (y * size);

        object.rotation.set(py * Math.PI / 180, 0, 0);
        object.position.set(px, py, pz - this.frame);
      }
    }
  };

  renderLoop = () => {
    this.checkObjects();
    window.requestAnimationFrame(this.renderLoop);
  };
}
