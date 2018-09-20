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
    this.amount = 11;
    this.size = 0.10;
    this.strength = 0.2;
    this.time = 0;
    this.rtime = 0;
    this.isMove = true;
    this.frame = 0;
    this.speed = 0.01;
    this.iteration = 0.07;
    this.spacing = 0.02;
    this.objects = [];
    this.generator = new Generator(10);
    this.clock = new THREE.Clock();
    this.quickvr = new QuickVR();
    this.controller = null;
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
    const material = new THREE.MeshStandardMaterial({
      color: 0xDB3236
    });
    const mesh = new THREE.Mesh(
      new THREE.CylinderGeometry( 0.005, 0.05, 0.1, 6 ),
      material
    );
    const handle = new THREE.Mesh(
      new THREE.BoxGeometry( 0.03, 0.1, 0.03 ),
      material
    );
  
    material.flatShading = true;
    mesh.rotation.x = -Math.PI / 2;
    handle.position.y = -0.05;
    mesh.add(handle);
    mesh.castShadows = true;
    mesh.receiveShadows = true;
    this.controller.userData.mesh = this.mesh;//  So we can change the color later.
    this.controller.add(mesh);
    this.quickvr.scene.add(this.controller);
    this.guiInputHelper = window.dat.GUIVR.addInputObject(this.controller);
    this.quickvr.scene.add(this.guiInputHelper);
    this.controller.addEventListener( 'primary press began', (event) => {
      this.guiInputHelper.pressed(true);
    });
    this.controller.addEventListener( 'primary press ended', (event) => {
      this.guiInputHelper.pressed(false);
    });
  };

  datGui = () => {
    const options = {
      spacing: this.spacing,
      strength: this.strength,
      moving: this.isMove,
      speed: this.speed
    };
    window.dat.GUIVR.enableMouse(this.quickvr.camera);
    this.gui = window.dat.GUIVR.create('Settings');
    this.gui.add(options, 'spacing', 0, 2).step(0.001).onChange((val) => {
      this.spacing = val;
    });
    this.gui.add(options, 'strength', 0, 0.5).step(0.001).onChange((val) => {
      this.strength = val;
    });
    this.gui.add(options, 'moving').onChange((val) => {
      this.isMove = val;
    });
    this.gui.add(options, 'speed', 0, 0.15).step(0.001).onChange((val) => {
      this.speed = val;
    });
    this.gui.position.set(-0.5,1.95,-1.85);
    this.gui.rotation.x = Math.PI/15;
    this.quickvr.scene.add(this.gui);
  };

  init = () => {
    this.quickvr.render.antialias = true;
    this.quickvr.scene.fog = new THREE.FogExp2(0x000000, 0.475);
    this.controller = this.quickvr.renderer.vr.getController(0);
    const urls = [xpos, xneg, ypos, yneg, zpos, zneg];
    this.skybox = new THREE.CubeTextureLoader().load(urls);
    this.skybox.format = THREE.RGBFormat;
    // CubeReflectionMapping || CubeRefractionMapping//
    this.skybox.mapping = THREE.CubeReflectionMapping;
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
    const cube = new THREE.PlaneGeometry(this.size, this.size);
    for (let y = 0; y < this.amount; y++) {
      for (let x = 0; x < this.amount; x++) {
        const object = new THREE.Mesh(
          cube,
          new THREE.MeshPhongMaterial({
            color: 0xaeaeae,
            specular: 0x999999,
            side: THREE.DoubleSide
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
        const noiseX = this.generator.simplex3(x * this.iteration + moveTime, y * this.iteration, 0);

        const px = (-offset) + (x * size);
        const py = (1) + (noiseX * (this.strength + this.spacing));
        const pz = (-2.5) + (-offset) + (y * size);
        
        object.position.set(px - movePosition, py, pz);
        object.material.color.setHSL(py * 0.5, .75, .49 );

      }
    }
  };

  renderLoop = () => {
    this.checkObjects();
    THREE.VRController.update();
    window.requestAnimationFrame(this.renderLoop);
  };
}
