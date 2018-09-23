import QuickVR from 'three-quickvr';

import THREE from '../../Three';
import { Generator } from '../../utils/simplexGenerator';

import xpos from '../../../resources/images/sky/posx.jpg';
import xneg from '../../../resources/images/sky/negx.jpg';
import ypos from '../../../resources/images/sky/posy.jpg';
import yneg from '../../../resources/images/sky/negy.jpg';
import zpos from '../../../resources/images/sky/posz.jpg';
import zneg from '../../../resources/images/sky/negz.jpg';

// Render Class Object //
export default class Render {
  constructor() {
    this.amount = 8;

    this.amount = 150;
    this.size = 1000;
    this.strength = 10;
    this.iteration = 0.11;

    this.spacing = this.size / this.amount;
    this.timer = 0;
    this.time = 0;
    this.frame = 0;
    this.fog = this.background = 0x8300b9;

    this.generator = new Generator(10);
    this.clock = new THREE.Clock();
    this.quickvr = new QuickVR();
    this.controller = null;

    this.geometry = [];
    this.planeMesh = [];

    this.emitter = {
      x: 0,
      y: 1,
      z: -1.95
    };

    this.datGui();

    window.addEventListener( 'vr controller connected', (e) => {
      this.vrController(e);
    }, false);
  
    this.bootstrap();
    this.createRoom();
    this.renderLoop();
  }

  datGui = () => {
    const options = {
      size: this.size,
      strength: this.strength,
      detail: this.iteration
    };
 
    const guiVR = window.dat.GUIVR;
    const noiseOptions = guiVR.create('Noise Options');

    console.log(noiseOptions);

    guiVR.enableMouse(this.quickvr.camera);

    noiseOptions.add(options, 'size', 100, 2000).step(0.1).onChange((val) => {
      this.size = val;
      this.spacing = this.size / this.amount;
    });
    noiseOptions.add(options, 'detail', 0.001, 0.25).step(0.001).onChange((val) => {
      this.iteration = val;
    });
    noiseOptions.add(options, 'strength', 0, 75).step(0.01).onChange((val) => {
      this.strength = val;
    });
 
    noiseOptions.position.set(-0.5,1.85,-2.75);
    this.quickvr.scene.add(noiseOptions);
  };

  vrController = (event) => {
    this.controller = event.detail;
    this.controller.standingMatrix = this.quickvr.renderer.vr.getStandingMatrix();
    this.controller.head = this.quickvr.camera;
    const material = new THREE.MeshPhongMaterial({
      flatShading: true,
      color: 0xDB3236,
      dithering: true 
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
    
    handle.castShadow = true;
    mesh.add(handle);
    
    mesh.castShadow = true;
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

  bootstrap = () => { 
    const urls = [xpos, xneg, ypos, yneg, zpos, zneg];
    this.skybox = new THREE.CubeTextureLoader().load(urls);
    this.skybox.format = THREE.RGBFormat;

    this.quickvr.scene.fog = new THREE.FogExp2(0x000000, 0.0035);

    this.quickvr.scene.background = 0x000000;
  };

  createRoom = () => {
    this.ambient = new THREE.AmbientLight(0x0066ee);
    this.ambient.position.set(0, 0, 0);
    this.quickvr.scene.add(this.ambient);

    this.spotLight = new THREE.DirectionalLight(0x0990f9);
    this.spotLight.position.set(0, 10, 0);
    this.spotLight.castShadow = true;
    this.quickvr.scene.add(this.spotLight);

    this.geometry = new THREE.PlaneBufferGeometry(this.size, this.size, this.amount, this.amount);
    const tble = new THREE.Mesh( 
      this.geometry, 
      new THREE.MeshPhongMaterial({ 
        color: 0x000033,
        specular: 0x0033ff
      })
    );
    tble.position.set(0, -16, 0);
    tble.rotation.set(90 * Math.PI / 180, 0, 0);
    this.quickvr.scene.add(tble);
  };

  checkObjects = () => {
    this.timer += 0.015;
    this.time += 0.1;
    this.timeStop = this.time * this.iteration;

    const offset = this.size / 2;
    const vertices = this.geometry.attributes.position.array;
    for (let y = 0; y < this.amount + 1; y++) {
      for (let x = 0; x < this.amount + 1; x++) {
        const vx = x * 3;
        const vy = y * ((this.amount + 1) * 3);
        const noiseX = this.generator.simplex3(
          x * this.iteration,
          y * this.iteration,
          this.timer,
        );
        vertices[vy + vx + 0] = (-offset) + x * this.spacing;
        vertices[vy + vx + 1] = ((-offset) + y * this.spacing);
        vertices[vy + vx + 2] = noiseX * this.strength;
      }
    }
    this.geometry.attributes.position.needsUpdate = true;
    this.geometry.computeVertexNormals();
  };

  renderLoop = () => {
    this.checkObjects();
    THREE.VRController.update();
    window.requestAnimationFrame(this.renderLoop);
  };
}
