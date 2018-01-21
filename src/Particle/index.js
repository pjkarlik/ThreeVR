import QuickVR from 'three-quickvr';
import THREE from '../Three';
import Particle from './Particle';

// Render Class Object //
export default class Render {
  constructor() {
    this.frames = 0;
    this.size = 4;
    this.speed = 3.0;
    this.canSpeed = false;
    this.quickvr = new QuickVR();
    // Camera Stuff and Viewport //
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.aspect = this.width / this.height;
    this.devicePixelRatio = window.devicePixelRatio;
    this.viewAngle = 85;
    this.aspect = this.width / this.height;
    this.near = 0.1;
    this.far = 30000;
    // Particles Stuff //

    this.particles = [];
    this.particleColor = 360;
    this.background = 0x232323;
    this.emitter = {
      x: 0,
      y: 0,
      z: -800
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
    window.addEventListener('resize', this.resize, true);
    this.setRender();
    this.renderLoop();

    setTimeout(() => {
      this.canSpeed = true;
    }, 100 + Math.random() * 1000);
  }

  resize = () => {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.width, this.height);
  };

  setRender = () => {
    // Set Render and Scene //
    // this.quickvr.scene.fog = new THREE.FogExp2(this.background, 0.00055);
    this.quickvr.scene.background = new THREE.Color(this.background);

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

  distance = (x1, y1, x2, y2) => {
    const distance = Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
    return distance;
  };

  hitRnd = () => {
    const { x, y, z } = this.emitter;
    const type = Math.random() * 100 > 74;
    const size = 5 + Math.random() * 25;
    const amps = (type ? 500 : 200) + 200 * Math.cos((this.frames * 0.25 ) * Math.PI / 180);
    this.frames++;

    const dVar = 200 * Math.sin(amps * 0.5 * Math.PI / 180);
    const sVar = amps * Math.sin(this.frames * 3.0 * Math.PI / 180);
    const cVar = amps * Math.cos(this.frames * 2.0 * Math.PI / 180);

    this.makeParticle(x + sVar, y + cVar * 2, z, type, size);
    this.makeParticle(x - sVar, y - cVar * 2, z, type, size);
    this.makeParticle(x + sVar + dVar, y + cVar - dVar, z, type, size);
    this.makeParticle(x - sVar - dVar, y - cVar + dVar, z, type, size);


    // this.makeParticle(x - sVar, y + cVar, z, type, size);
    // this.makeParticle(x + sVar, y - cVar, z, type, size);
    // this.makeParticle(x - sVar, y - cVar, z, type, size);
  }

  makeParticle = (mx, my, mz, type, size) => {
    const particleColor = Math.abs(0.75 * Math.sin(this.frames * 0.25 * Math.PI / 180) * 0.75);

    const geometry = !type ?
      new THREE.BoxGeometry(this.size * 4, this.size * 4, this.size * size) :
      // new THREE.SphereGeometry(this.size * 2, 12, 12, 0, Math.PI * 2, 0, Math.PI * 2) :
      new THREE.BoxGeometry(this.size * size, this.size * size, this.size * size);
    const sphere = new THREE.Mesh(
      geometry,
      new THREE.MeshPhongMaterial(
        { color:0xFFFFFF, wireframe: false }
      )
    );
    sphere.castShadow = true;
    sphere.receiveShadow = true;

    const point = new Particle({
      size: this.size - Math.random() * 1,
      x: mx,
      y: my,
      z: mz,
      vx: 0.01, // -(0.0 - mx) * 0.0001,
      vy: 1.0, //  -(0.0 - my) * 0.0001,
      vz: this.speed * 4,
      box: this.box,
      settings: this.settings,
      ref: sphere
    });
    if(type){
      sphere.rotateX(mx * Math.PI / 180);
      sphere.rotateY(my * Math.PI / 180);
    } else {
      sphere.rotateX(-mx * Math.PI / 180);
      sphere.rotateY(-my * Math.PI / 180);
    }
    sphere.position.set(mx, my, mz);
    sphere.material.color.setRGB(particleColor, particleColor ,particleColor);
    // sphere.material.color.setHSL(particleColor,1,0.5);

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

      part.ref.scale.x = part.size * 0.2;
      part.ref.scale.y = part.size * 0.2;
      part.ref.scale.z = part.size * 0.2;
      if (part.life > 800 || part.size < 0.0) {
        this.quickvr.scene.remove(part.ref);
        this.particles.splice(i, 1);
      }
    }
  };

  renderLoop = () => {
    this.checkParticles();

    if(Math.random() * 255 > 230 && this.canSpeed){
      this.canSpeed = false;
      this.speed = 3.0 + Math.random() * 15;
      setTimeout(() => {
        this.canSpeed = true;
      }, 100 + Math.random() * 1000);
    }

    if(this.particles.length < 1200 && this.frames % 3 == 0) {
      this.hitRnd();
    }

    this.frames ++;
    window.requestAnimationFrame(this.renderLoop);
  };
}
