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
    this.amount = 8;

    this.size = 0.14;
    this.strength = 0.18;
    this.iteration = 0.14;
    this.spacing = 0.05;

    this.time = 0;
    this.rtime = 0;
    this.frame = 0;
    this.speed = 0.01;
    this.isMove = false;

    this.objects = [];

    this.generator = new Generator(10);
    this.clock = new THREE.Clock();
    this.quickvr = new QuickVR();
    this.controller = null;

    this.emitter = {
      x: 0,
      y: 1,
      z: -1.95
    };

    this.datGui();

    window.addEventListener( 'vr controller connected', (e) => {
      this.vrController(e);
    }, false);
  
    this.init();
    this.randomObjects();
    this.renderLoop();
  }

  vrController = (event) => {
    this.controller = event.detail;
    this.controller.standingMatrix = this.quickvr.renderer.vr.getStandingMatrix();
    this.controller.head = this.quickvr.camera;
    const material = new THREE.MeshPhongMaterial({
      flatShading: true,
      color: 0xDB3236
    });
    const mesh = new THREE.Mesh(
      new THREE.CylinderGeometry( 0.005, 0.05, 0.1, 6 ),
      material
    );
    const handle = new THREE.Mesh(
      new THREE.BoxGeometry( 0.03, 0.1, 0.03 ),
      material,
    );
  
    mesh.rotation.x = -Math.PI / 2;
    handle.position.y = -0.05;
    mesh.add(handle);
    mesh.castShadows = true;
    mesh.receiveShadows = true;

    this.controller.userData.mesh = mesh;
    this.controller.add(mesh);

    this.quickvr.scene.add(this.controller);
    this.guiInputHelper = window.dat.GUIVR.addInputObject(this.controller);
    this.quickvr.scene.add(this.guiInputHelper);

    this.controller.addEventListener( 'primary press began', (event) => {
      event.target.userData.mesh.material.color.setHex(0x3642DB );
      this.guiInputHelper.pressed(true);
    });
    this.controller.addEventListener( 'primary press ended', (event) => {
      event.target.userData.mesh.material.color.setHex(0xDB3236);
      this.guiInputHelper.pressed(false);
    });
  };

  datGui = () => {
    const options = {
      size: this.size,
      spacing: this.spacing,
      detail: this.iteration,
      strength: this.strength,
      moving: this.isMove,
      speed: this.speed,
      x: this.emitter.x,
      y: this.emitter.z,
      z: this.emitter.y
    };

    const guiVR = window.dat.GUIVR;
    guiVR.enableMouse(this.quickvr.camera);

    // this.gui = guiVR.create('Settings');
    const noiseOptions = guiVR.create('Noise Options');
    const displayOptions = guiVR.create('Display Options');
    displayOptions.close();
    noiseOptions.add(options, 'size', 0.001, 1).step(0.001).onChange((val) => {
      this.size = val;
    });
    noiseOptions.add(options, 'spacing', 0.05, 2).step(0.001).onChange((val) => {
      this.spacing = val;
    });
    noiseOptions.add(options, 'detail', 0.001, 0.5).step(0.001).onChange((val) => {
      this.iteration = val;
    });
    noiseOptions.add(options, 'strength', 0, 0.5).step(0.001).onChange((val) => {
      this.strength = val;
    });
    displayOptions.add(options, 'x', -2, 2).step(0.001).onChange((val) => {
      this.emitter.x = val;
    });
    displayOptions.add(options, 'y', -6, 2).step(0.001).onChange((val) => {
      this.emitter.z = val;
    });
    displayOptions.add(options, 'z', -6, 6).step(0.001).onChange((val) => {
      this.emitter.y = val;
    });
    displayOptions.add(options, 'moving').onChange((val) => {
      this.isMove = val;
    });
    displayOptions.add(options, 'speed', 0, 0.15).step(0.001).onChange((val) => {
      this.speed = val;
    });

    noiseOptions.position.set(-0.5,1.85,-2.20);
    // noiseOptions.rotation.x = Math.PI/22;
    this.quickvr.scene.add(noiseOptions);

    displayOptions.position.set(-0.5,2.35,-2.15);
    displayOptions.rotation.x = Math.PI/16;
    this.quickvr.scene.add(displayOptions);
  };

  init = () => {
    this.quickvr.render.antialias = true;
    this.quickvr.scene.fog = new THREE.FogExp2(0x000000, 0.375);

    this.controller = this.quickvr.renderer.vr.getController(0);
    const urls = [xpos, xneg, ypos, yneg, zpos, zneg];
    this.skybox = new THREE.CubeTextureLoader().load(urls);
    this.skybox.format = THREE.RGBFormat;
    this.quickvr.scene.background = this.skybox;

    // Set Lights //
    let pointLight = new THREE.PointLight(0xAAAAAA);
    pointLight.position.set(50, 450, -800);
    this.quickvr.scene.add(pointLight);

    let ambient = new THREE.AmbientLight(0x9f9f9f);
    ambient.position.set(1, 350, -200);
    this.quickvr.scene.add(ambient);
  };

  randomObjects = () => {
    const cube = new THREE.CubeGeometry(this.size, this.size, this.size / 2); // 
    for (let y = 0; y < this.amount; y++) {
      for (let x = 0; x < this.amount; x++) {
        const object = new THREE.Mesh(
          cube,
          new THREE.MeshPhongMaterial({
            color: 0xaeaeae,
            specular: 0x999999,
            flatShading: true,
          })
        );
        object.rotateX(-90 * Math.PI/180);
        this.objects.push(object);
        this.quickvr.scene.add(object);
      }
    }
  };

  checkObjects = () => {
    const size = this.size + this.spacing;
    const offset = this.amount * (size / 2) - (size / 2);
    // advance time and tick draw loop for time segment
    this.frame += this.speed; 
    this.rtime += this.speed;
    if (this.frame > size) {
      // the time phase of the noise wave moves
      // once the cubes moved one space
      this.time += 1;
      this.frame = 0;
    }

    const timeStop = this.time * this.iteration;
    
    for (let y = 0; y < this.amount; y++) {
      for (let x = 0; x < this.amount; x++) {
        // its all interconnected between iteration and moveTime
        const moveTime = this.isMove ? timeStop : this.rtime;
        const movePosition = this.isMove ? this.frame : 0;
        const object = this.objects[x + (y * this.amount)];
        const noiseX = this.generator.simplex3(x * this.iteration + moveTime, y * this.iteration, 0);

        const px = (this.emitter.x) + (-offset) + (x * size);
        const py = (this.emitter.y) + (noiseX * (this.strength + this.spacing));
        const pz = (this.emitter.z) + (-offset) + (y * size);
        object.scale.x = this.size * 10;
        object.scale.y = this.size * 10;
        object.scale.z = this.size * 10;
        object.position.set(px - movePosition, py, pz);
        object.material.color.setHSL(py * 0.65, .75, .49 );

      }
    }
  };

  renderLoop = () => {
    this.checkObjects();
    THREE.VRController.update();
    window.requestAnimationFrame(this.renderLoop);
  };
}
