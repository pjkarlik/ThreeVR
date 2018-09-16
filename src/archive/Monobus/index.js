import QuickVR from 'three-quickvr';
import THREE from '../../Three';

// Shader Imports //
import fragmentShader from '../../shaders/fragmentShader_304';
import vertexShader from '../../shaders/vertexShader';


// Render Class Object //
export default class Render {
  constructor() {
    this.frames = 0;
    this.mirror = 4;
    this.scale = 1.0;
    this.ratio = 1024;
    this.size = 0.2;
    this.start = Date.now();
    this.vector = { x: 512, y: 512 };
    this.angle = 255.0;
    this.dec = 124.0;

    this.quickvr = new QuickVR();
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.devicePixelRatio = window.devicePixelRatio;

    this.amount = 2 + Math.abs(Math.random() * 26);
    this.adef = 360 / this.amount + 1;
    this.splineObject = [];

    this.init();
    this.createScene();
    this.renderLoop();
    window.addEventListener('onClick', this.camPos, true);
  }

  init = () => {
    // Set Render and Scene //
    this.quickvr.render.antialias = true;
    // Set AmbientLight //
    this.ambient = new THREE.AmbientLight(0xFFFFFF);
    this.ambient.position.set(0, 0, 0);
    this.quickvr.scene.add(this.ambient);
  };

  camPos = () => {
    console.log(this.quickvr.scene.position);
  };

  attachShaders = () => {
    // shader material
    const uniforms = THREE.UniformsUtils.merge([
      THREE.UniformsLib.lights,
      THREE.UniformsLib.shadowmap,
      {
        map: {
          type: 't',
          value: 1,
          texture: null,
        },
        time: {
          type: 'f',
          value: this.start,
        },
        angle: {
          type: 'f',
          value: this.angle,
        },
        dec: {
          type: 'f',
          value: this.dec,
        },
        resolution: {
          type: 'v2',
          value: new THREE.Vector3(),
        },
      },
    ]);

    return new THREE.ShaderMaterial({
      uniforms,
      vertexShader,
      fragmentShader,
    });
  };

  createScene = () => {
    // Create custom material for the shader
    this.colorMat = new THREE.MeshBasicMaterial({
      color: 0xFFFFFF,
      side: THREE.DoubleSide
    });

    this.shaderMaterial =  this.attachShaders();
    
    const initialPoints = [
      [0.0, 0.0, -50.0],
      [0.0, 0.0, 50.0]
    ];
    const points = initialPoints.map((point) => {
      const v3Point = new THREE.Vector3(...point);
      return v3Point;
    });
    const pathTube = new THREE.CatmullRomCurve3(points);
    // Create a mesh
    const object = new THREE.Mesh(
      new THREE.TubeGeometry(pathTube, 10, 2, 18, true),
      this.shaderMaterial
    );

    //object.position.set(this.quickvr.camera.position);
    this.quickvr.scene.add(object);
  };

  animateShader = () => {
    const timeNow = (Date.now() - this.start) / 10000;
    this.shaderMaterial.uniforms.time.value = timeNow;
    this.shaderMaterial.uniforms.dec.value = this.dec;
    this.shaderMaterial.uniforms.needsUpdate = true;
  }
  renderLoop = () => {
    this.animateShader();
    window.requestAnimationFrame(this.renderLoop.bind(this));
  };
}
