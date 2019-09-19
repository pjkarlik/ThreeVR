import QuickVR from 'three-quickvr';

import Particle from './Particle';

import THREE from '../../Three';
// import xpos from '../../../resources/images/space/posx.jpg';
// import xneg from '../../../resources/images/space/negx.jpg';
// import ypos from '../../../resources/images/space/posy.jpg';
// import yneg from '../../../resources/images/space/negy.jpg';
// import zpos from '../../../resources/images/space/posz.jpg';
// import zneg from '../../../resources/images/space/negz.jpg';

// Render Class Object //
export default class Render {
  constructor() {
    this.frames = 360;
    this.size = 3.5;
    this.speed = 1.5;

    this.quickvr = new QuickVR();
    this.controller = null;

    // Particles Stuff //
    this.particles = [];
    this.particleColor = 360;
    this.background = 0xAAAAAA;
    this.camPosition = {
      x: -1000,
      y: -90,
      z: -300
    };
    this.trsPosition = {
      x: -1000,
      y: -90,
      z: -300
    };
    this.emitter = {
      x: 0,
      y: 0,
      z: -900
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
    this.camTimeoutx = true;
    this.camTimeouty = true;
    this.camTimeoutz = true;
    setTimeout(
      () => {
        this.canSpeed = true;
        this.camTimeoutx = false;
        this.camTimeouty = false;
        this.camTimeoutz = false;
      },
      3000 + Math.random() * 2000
    );
    // window.addEventListener( 'vr controller connected', (e) => {
    //   this.vrController(e);
    // }, false);
  
    this.bootstrap();
    this.createStage();
    this.renderLoop();
  }

  vrController = (event) => {
    this.controller = event.detail;

    this.controller.standingMatrix = this.quickvr.renderer.vr.getStandingMatrix();
    this.controller.head = this.quickvr.camera;
    this.quickvr.controls.standingMatrix = this.quickvr.renderer.vr.getStandingMatrix();

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

  bootstrap = () => {
    // const urls = [xpos, xneg, ypos, yneg, zpos, zneg];
    // this.skybox = new THREE.CubeTextureLoader().load(urls);
    // this.skybox.format = THREE.RGBFormat;
    // this.quickvr.scene.fog = new THREE.FogExp2(this.background, 0.00075);
    this.quickvr.scene.background = 0xFFFFFF;
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
    const type = Math.random() * 100 > 97;
    const size = Math.random() * 100 > 84 ? 6 : 1;
    const amps = type ? 80 : 40 + Math.abs(60 * Math.cos((this.frames * 0.25 ) * Math.PI / 180));
    this.frames++;
    const sVar = amps * Math.sin(this.frames * 2.0 * Math.PI / 180);
    const cVar = amps * Math.cos(this.frames * 2.0 * Math.PI / 180);

    this.makeParticle(x + sVar, y + cVar, z, type, size);
    this.makeParticle(x - sVar, y + cVar, z, type, size);

    this.makeParticle(x + sVar, y - cVar, z, type, size);
    this.makeParticle(x - sVar, y - cVar, z, type, size);
  }

  makeParticle = (mx, my, mz, type, size) => {

    const geometry = type  ? 
      new THREE.SphereGeometry(this.size * 2, 6, 6, 0, Math.PI * 2, 0, Math.PI * 2) :
      new THREE.BoxGeometry(this.size, this.size, this.size * size);
    const sphere = new THREE.Mesh(
      geometry,
      new THREE.MeshPhongMaterial(
        { color:0xFFFFFF, wireframe: false, flatShading: true }
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
      vz: this.speed,
      box: this.box,
      settings: this.settings,
      ref: sphere
    });
  
    sphere.position.set(mx, my, mz);

    const particleColor = Math.abs(0.75 * Math.sin(this.frames * 0.25 * Math.PI / 180) * 0.75);
    sphere.material.color.setRGB(particleColor, particleColor ,particleColor);

    this.particles.push(point);
    this.quickvr.scene.add(sphere);
  };

  checkParticles = () => {
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
        this.quickvr.scene.remove(part.ref);
        this.particles.splice(i, 1);
      }
    }
  };

  cameraLoop = () => {
    const damp = 0.01;
    this.camPosition.x = this.camPosition.x - (this.camPosition.x - this.trsPosition.x) * damp;
    this.camPosition.y = this.camPosition.y - (this.camPosition.y - this.trsPosition.y) * damp;
    this.camPosition.z = this.camPosition.z - (this.camPosition.z - this.trsPosition.z) * damp;

    this.quickvr.camera.position.set(
      this.camPosition.x,
      this.camPosition.y,
      this.camPosition.z
    );

    if(!this.camTimeoutx && Math.random() * 255 > 230) {
      const tempRand = 100 + Math.random() * 200;
      this.trsPosition.x = Math.random() * 255 > 200 ?
        Math.random() * 200 > 100 ? -(tempRand) : tempRand : 0;
      this.camTimeoutx = true;
      setTimeout(
        () => { this.camTimeoutx = false; },
        3000 + Math.random() * 6000
      );
    }
    if(!this.camTimeouty && Math.random() * 255 > 220) {
      const tempRand = 100 + Math.random() * 200;
      this.trsPosition.y = Math.random() * 255 > 230 ?
        Math.random() * 200 > 100 ? tempRand : -(tempRand) : 0;
      this.camTimeouty = true;
      setTimeout(
        () => { this.camTimeouty = false; },
        3000 + Math.random() * 4000
      );
    }
    // if(!this.camTimeoutz && Math.random() * 255 > 254) {
    //   this.trsPosition.z = Math.random() * 200 > 100 ? 50 : -1100 + Math.random() * 700;
    //   this.camTimeoutz = true;
    //   setTimeout(
    //     () => { this.camTimeoutz = false; },
    //     8000 + Math.random() * 8000
    //   );
    // }
  };

  renderLoop = () => {
    this.checkParticles();
    // THREE.VRController.update();
    // this.cameraLoop();
    
    if(this.frames % 16 === 0 && this.particles.length < 500) {
      this.hitRnd();
    }

    this.frames ++;

    window.requestAnimationFrame(this.renderLoop);
  };
}
