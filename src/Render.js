import THREE from './Three';

// Skybox image imports //
import xpos from '../resources/images/church/posx.jpg';
import xneg from '../resources/images/church/negx.jpg';
import ypos from '../resources/images/church/posy.jpg';
import yneg from '../resources/images/church/negy.jpg';
import zpos from '../resources/images/church/posz.jpg';
import zneg from '../resources/images/church/negz.jpg';

// Render Class Object //
export default class Render {
  constructor() {
    this.viewAngle = 55;
    this.near = 0.1;
    this.far = 20000;
    this.amount = 10;
    this.size = 0.1;
    this.strength = 0.5;
    this.time = 0;
    this.frame = 0;
    this.speed = 1;
    this.iteration = 0.05;
    this.objects = [];
    this.clock = new THREE.Clock();
    window.addEventListener('resize', this.resize, true);
    this.setViewport();
    this.setRender();
    this.renderLoop();
  }

  setRender = () => {
    // Set Render and Scene //
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(this.devicePixelRatio);
    this.renderer.shadowMapEnabled = true;
    document.body.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
        this.viewAngle,
        this.aspect,
        this.near,
        this.far
    );
    this.scene.add(this.camera);

    this.camera.position.set(0, 1, -3);
    this.camera.lookAt(new THREE.Vector3(0, 1, 2));
    this.camera.lookAt(this.scene.position);

    this.controls = new THREE.OrbitControls(this.camera);
    this.controls.maxDistance = 3000;
    this.controls.minDistance = 0.1;

    // Set AmbientLight //
    // this.ambient = new THREE.AmbientLight(0xFFFFFF);
    // this.ambient.position.set(0, 0, 0);
    // this.scene.add(this.ambient);
    this.spotLight = new THREE.DirectionalLight(0xFFFFFF);
    this.spotLight.position.set(-30, 60, 60);
    this.spotLight.castShadow = true;
    this.scene.add(this.spotLight);
    // Skybox //
    const urls = [xpos, xneg, ypos, yneg, zpos, zneg];
    this.skybox = new THREE.CubeTextureLoader().load(urls);
    this.skybox.format = THREE.RGBFormat;
    this.skybox.mapping = THREE.CubeReflectionMapping; // CubeReflectionMapping || CubeRefractionMapping
    this.scene.background = this.skybox;

    this.metalMaterial = new THREE.MeshBasicMaterial({
      envMap: this.skybox,
    });
    this.stockMaterial = new THREE.MeshLambertMaterial({
      color: 0xaeaeae,
    });

    this.effect = new THREE.AnaglyphEffect(this.renderer);
    this.effect.setSize(this.width, this.height);
  };

  setViewport = () => {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.aspect = this.width / this.height;
    this.devicePixelRatio = window.devicePixelRatio;
  };

  resize = () => {
    this.setViewport();
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.width, this.height);
    this.effect.setSize(this.width, this.height);
  };

  renderScene = () => {
    this.effect.render(this.scene, this.camera);
  };

  renderLoop = () => {
    this.renderScene();
    window.requestAnimationFrame(this.renderLoop.bind(this));
  };
}
