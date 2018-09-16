import QuickVR from 'three-quickvr';

import THREE from '../Three';
import { Generator } from '../utils/simplexGenerator';

import xpos from '../../resources/images/space/posx.jpg';
import xneg from '../../resources/images/space/negx.jpg';
import ypos from '../../resources/images/space/posy.jpg';
import yneg from '../../resources/images/space/negy.jpg';
import zpos from '../../resources/images/space/posz.jpg';
import zneg from '../../resources/images/space/negz.jpg';

// Render Class Object //
export default class Render {
  constructor() {
    this.amount = 12;
    this.size = 3.10;
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
    this.controller = this.quickvr.renderer.vr.getController(0);
    console.log(this.controller);
    const urls = [xpos, xneg, ypos, yneg, zpos, zneg];
    this.skybox = new THREE.CubeTextureLoader().load(urls);
    this.skybox.format = THREE.RGBFormat;
    // CubeReflectionMapping || CubeRefractionMapping//
    this.skybox.mapping = THREE.CubeReflectionMapping;
    this.quickvr.scene.background = this.skybox;

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
    this.rtime += 0.005;
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
        const test = 5 * Math.sin(this.rtime * 225 * Math.PI / 180);
        object.position.set(px, py, pz - movePosition);
        object.material.color.setHSL(py * 0.05, .75, .49 );
        if(x === 5 && y === 7) {
          this.quickvr.camera.position.set(px, 1.5 + py, pz);
          if (this.frame % 5 == 0) {
            console.log(py);
            console.log(this.quickvr.camera.position);
          }
        }
      }
    }
  };

  renderLoop = () => {
    this.checkObjects();
    window.requestAnimationFrame(this.renderLoop);
  };
}
