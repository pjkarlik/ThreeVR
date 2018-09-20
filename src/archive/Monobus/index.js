import QuickVR from 'three-quickvr';
import THREE from '../../Three';
import Particle from './Particle';

// Render Class Object //
export default class Render {
  constructor() {
    this.frames = 360;
    this.size = 5;
    this.start = Date.now();
    this.particles = [];
    this.box = {
      top: 3000,
      left: -3000,
      bottom: -200,
      right: 3000,
    };
    this.settings = {
      gravity: 0.9,
      bounce: 0.35,
    };

    this.quickvr = new QuickVR();
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.devicePixelRatio = window.devicePixelRatio;

    this.amount = 2 + Math.abs(Math.random() * 26);
    this.adef = 360 / this.amount + 1;
    this.splineObject = [];
    this.datGui();

    window.addEventListener( 'vr controller connected', (e) => {
      this.vrController(e);
    }, false);
    this.init();
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
      size: this.size,
      gravity: this.settings.gravity,
      bounce: this.settings.bounce
    };
    window.dat.GUIVR.enableMouse(this.quickvr.camera);
    this.gui = window.dat.GUIVR.create('Settings');
    this.gui.add(options, 'size', 0, 25).step(0.1).onChange((val) => {
      this.size = val;
    });
    this.gui.add(options, 'gravity', 0, 1).step(0.01).onChange((val) => {
      this.settings.gravity = val;
    });
    this.gui.add(options, 'bounce', 0, 1).step(0.01).onChange((val) => {
      this.settings.bounce = val;
    });
    this.gui.position.set(-0.5,.75,-1.75);
    this.gui.rotation.x = -Math.PI/9;
    this.quickvr.scene.add(this.gui);
  };

  init = () => {
    // Set Render and Scene //
    this.quickvr.render.antialias = true;
    // Set AmbientLight //
    this.ambient = new THREE.AmbientLight(0xFFFFFF);
    this.ambient.position.set(0, 0, 0);
    this.quickvr.scene.add(this.ambient);
  };

  rgbToHex = (r, g, b) => {
    const hex = ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    return `0x${hex}`;
  };

  hitRnd = () => {
    const amount = 2 + Math.abs(Math.random() * 5);
    for (let i = 0; i < amount; i++) {
      this.makeParticle(0, 250, -600);
    }
  }

  makeParticle = (mx, my, mz) => {
    const geometry = new THREE.BoxGeometry(this.size, this.size, this.size);
    const sphere = new THREE.Mesh(
      geometry,
      new THREE.MeshPhongMaterial({
        color: 0xFFFFFF,
        specular: 0x999999
      })
    );
    sphere.castShadow = true;
    sphere.receiveShadow = true;
    const point = new Particle({
      size: this.size - Math.random() * 1.75,
      x: mx,
      y: my,
      z: mz,
      box: this.box,
      settings: this.settings,
      ref: sphere
    });
    const particleColor = Math.sin(this.frames * 0.25 * Math.PI / 180);
    sphere.material.color.setHSL(particleColor,1,0.5);
    sphere.position.set(mx, my, mz);
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
      part.ref.scale.x = 1.0 * part.size;
      part.ref.scale.y = 1.0 * part.size;
      part.ref.scale.z = 1.0 * part.size;
      if (part.life > 800 || part.size < 0.0) {
        part.ref.geometry.dispose();
        part.ref.material.dispose();
        this.quickvr.scene.remove(part.ref);
        part.ref = undefined;
        this.particles.splice(i, 1);
      }
    }
  };

  renderLoop = () => {
    if (this.frames % 1 === 0) {
      this.checkParticles();
    }
    if(Math.random() * 200 > 160 && this.particles.length < 100) {
      this.hitRnd();
    }

    this.frames++;
    THREE.VRController.update();
    window.requestAnimationFrame(this.renderLoop);
  };
}
