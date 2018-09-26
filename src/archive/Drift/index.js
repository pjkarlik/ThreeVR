import QuickVR from 'three-quickvr';

import Particle from './Particle';

import THREE from '../../Three';
import { Generator } from '../../utils/simplexGenerator';

import xpos from '../../../resources/images/space/posx.jpg';
import xneg from '../../../resources/images/space/negx.jpg';
import ypos from '../../../resources/images/space/posy.jpg';
import yneg from '../../../resources/images/space/negy.jpg';
import zpos from '../../../resources/images/space/posz.jpg';
import zneg from '../../../resources/images/space/negz.jpg';

// Render Class Object //
export default class Render {
  constructor() {
    this.frames = 360;
    this.size = 3;
    this.speed = 1.0;

    this.background = 0x000000;

    this.generator = new Generator(10);
    this.clock = new THREE.Clock();
    this.raycaster = new THREE.Raycaster();
    this.quickvr = new QuickVR();
    this.controller = null;

    this.particles = [];
    this.particleColor = 360;
    this.emitter = {
      x: 0,
      y: 0,
      z: -1000
    };
    this.box = {
      top: 4000,
      left: -4000,
      bottom: -4000,
      right: 4000,
    };
    this.settings = {
      gravity: 0.0,
      bounce: 0.0,
    };
    window.addEventListener( 'vr controller connected', (e) => {
      // this.vrController(e);
    }, false);
  
    this.bootstrap();
    this.createStage();
    this.renderLoop();
  }

  vrController = (event) => {
    const { camera, scene }  = this.quickvr;
    this.controller = event.detail;
    this.controller.standingMatrix = this.quickvr.renderer.vr.getStandingMatrix();
    this.controller.head = camera;
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

    scene.add(this.controller);
    this.guiInputHelper = window.dat.GUIVR.addInputObject(this.controller);
    scene.add(this.guiInputHelper);

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
    this.quickvr.scene.background = this.skybox;
  };

  createStage = () => {
    const { scene } = this.quickvr;
    let pointLight = new THREE.PointLight(0xDDDDDD);
    pointLight.position.set(50, 450, -800);
    scene.add(pointLight);
    pointLight = new THREE.PointLight(0xEEEEEE);
    pointLight.position.set(-50, -450, 800);
    scene.add(pointLight);
    let ambient = new THREE.AmbientLight(0x9f9f9f);
    ambient.position.set(1, 450, -400);
    scene.add(ambient);
  };

  hitRnd = () => {
    const { x, y, z } = this.emitter;
    const type = Math.random() * 100 > 74;
    const size = Math.random() * 100 > 54 ? 1 : 2;
    const amps = type ? 80 : 30 + Math.abs(10 * Math.cos((this.frames * 0.25 ) * Math.PI / 180));

    const sVar = amps * Math.sin(this.frames * 2.0 * Math.PI / 180);
    const cVar = amps * Math.cos(this.frames * 2.0 * Math.PI / 180);

    this.makeParticle(x + sVar, y + cVar, z, type, size);
    this.makeParticle(x - sVar, y + cVar, z, type, size);

    this.makeParticle(x + sVar, y - cVar, z, type, size);
    this.makeParticle(x - sVar, y - cVar, z, type, size);
  };

  makeParticle = (mx, my, mz, type, size) => {
    const { scene } = this.quickvr;

    const particleColor = Math.abs((type ? 0.75 : 1.25) * Math.sin(this.frames * 0.25 * Math.PI / 180) * 0.75);

    const geometry = type  ? 
      new THREE.SphereGeometry(this.size * 2, 6, 6, 0, Math.PI * 2, 0, Math.PI * 2) :
      new THREE.BoxGeometry(this.size, this.size, this.size * 12);
    const sphere = new THREE.Mesh(
      geometry,
      new THREE.MeshPhongMaterial(
        { color:0xFFFFFF, wireframe: type }
      )
    );
    sphere.castShadow = true;
    sphere.receiveShadow = true;

    const point = new Particle({
      size: this.size - Math.random() * 1,
      x: mx,
      y: my,
      z: mz,
      vx: -(0.0 - mx) * 0.001,
      vy: -(0.0 - my) * 0.001,
      vz: this.speed * 0.5,
      box: this.box,
      settings: this.settings,
      ref: sphere
    });
  
    sphere.position.set(mx, my, mz);
    // sphere.material.color.setRGB(particleColor, particleColor ,particleColor);
    sphere.material.color.setHSL(particleColor,1,0.5);

    this.particles.push(point);
    scene.add(sphere);
  };

  checkParticles = () => {
    const { scene } = this.quickvr;
    for (let i = 0; i < this.particles.length; i++) {
      const part = this.particles[i];
      part.update();
      part.ref.position.set(
        part.x, 
        part.y, 
        part.z
      );
      part.ref.scale.x = part.size;
      part.ref.scale.y = part.size;
      part.ref.scale.z = part.size;
      if (part.life > 800 || part.size < 0.0) {
        part.ref.geometry.dispose();
        part.ref.material.dispose();
        scene.remove(part.ref);
        part.ref = undefined;
        this.particles.splice(i, 1);
      }
    }
  };

  renderLoop = () => {
    this.checkParticles();
    // THREE.VRController.update();

    if(Math.random() * 255 > 230){
      this.speed = 4.0 + Math.random() * 25;
    }
    
    if(this.frames % 4 === 0 && this.particles.length < 900) {
      this.hitRnd();
    }
    this.frames ++;

    window.requestAnimationFrame(this.renderLoop);
  };
}
