import QuickVR from 'three-quickvr';

import THREE from '../Three';
import { Generator } from './SimplexGenerator';

// Render Class Object //
export default class Render {
  constructor() {
    this.amount = 10;
    this.size = 3.0;
    this.strength = 4.5;
    this.time = 0;
    this.rtime = 0;
    this.isMove = false;
    this.frame = 0;
    this.speed = 0.15;
    this.iteration = 0.15;
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

  };

  randomObjects = () => {
    const cube = new THREE.CubeGeometry(this.size, this.size / 2, this.size);
    for (let y = 0; y < this.amount; y++) {
      for (let x = 0; x < this.amount; x++) {
        const object = new THREE.Mesh(
          cube,
          new THREE.MeshPhongMaterial({
            color: 0xaeaeae,
            specular: 0x999999
          })
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
    this.rtime += 0.001;
    if (this.frame > size) {
      // the time phase of the noise wave moves
      // once the cubes moved one space
      this.time += 1;
      this.frame = 0;
    }

    const timeStop = this.time * this.iteration;
    
    for (let y = 0; y < this.amount; y++) {
      for (let x = 0; x < this.amount; x++) {
        const moveTime = this.isMove ? timeStop : this.rtime;
        const movePosition = this.isMove ? this.frame : 0;
        const object = this.objects[x + (y * this.amount)];
        const noiseX = this.generator.simplex3(x * this.iteration, y * this.iteration + moveTime, 0);

        const px = (-offset) + (x * size);
        const py = -(5.0 + (noiseX * this.strength));
        const pz = (-offset) + (y * size);

        object.rotation.set(py * Math.PI / 180, 0, 0);
        object.position.set(px, py, pz - movePosition);
        object.material.color.setHSL(py * 0.1, .64, .59 );
      }
    }
  };

  renderLoop = () => {
    this.checkObjects();
    window.requestAnimationFrame(this.renderLoop);
  };
}
