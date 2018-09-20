import QuickVR from 'three-quickvr';

import THREE from '../../Three';
import BinaryMaze from '../../utils/BinaryMaze';
// Skybox image imports //
import xpos from '../../../resources/images/sky/posx.jpg';
import xneg from '../../../resources/images/sky/negx.jpg';
import ypos from '../../../resources/images/sky/posy.jpg';
import yneg from '../../../resources/images/sky/negy.jpg';
import zpos from '../../../resources/images/sky/posz.jpg';
import zneg from '../../../resources/images/sky/negz.jpg';

import stone from '../../../resources/images/grate_t.png';
import bmp from '../../../resources/images/matallo_bmp.jpg';

// Render Class Object //
export default class Render {
  constructor() {
    this.frames = 0;
    this.mirror = 4;
    this.scale = 1.0;
    this.ratio = 1024;
    this.size = 0.5;
    this.dsize = this.size * 2;
    this.grid = 8;
    this.maze = new BinaryMaze();
    this.quickvr = new QuickVR();
    this.camera = {
      x: 0,
      y: 0
    };

    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.devicePixelRatio = window.devicePixelRatio;

    this.amount = 3;
    this.adef = 360 / this.amount + 1;
    this.splineObject = [];
    this.controller = null;
    window.addEventListener( 'vr controller connected', (e) => {
      this.vrController(e);
    }, false);

    this.init();
    this.createScene();
    this.renderLoop();
  }

  vrController = (event) => {
    this.controller = event.detail;
    this.quickvr.scene.add(this.controller);
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
    this.controller.updateCallback = (e) => {
      if(this.controller.getButton('thumbpad').isPressed) {
        const axes = this.controller.gamepad.axes;
        this.camera.x = (axes[0]);
        this.camera.y = (axes[1]);
      }
    };
    // this.controller.addEventListener( 'thumbpad press ', (e) => {
    // const axes = this.controller.gamepad.axes;
    // this.camera.x = axes[0];
    // this.camera.y = axes[1];
    // this.checkCamera();
    // alert(`${JSON.stringify(this.controller.buttonNames)}`);
    // }, false);
  };

  init = () => {
    // Set Render and Scene //
    // this.quickvr.renderer.antialias = true;
    this.quickvr.renderer.shadowMapEnabled = true;
    // this.quickvr.renderer.shadowMapType = THREE.PCFSoftShadowMap;
    this.quickvr.scene.fog = new THREE.FogExp2(0x000000, 0.275);

    // Set AmbientLight //
    this.ambient = new THREE.AmbientLight(0xFFFFFF);
    this.ambient.position.set(0, 0, 0);
    this.quickvr.scene.add(this.ambient);

    // Skybox //
    const urls = [xpos, xneg, ypos, yneg, zpos, zneg];
    this.skybox = new THREE.CubeTextureLoader().load(urls);
    this.skybox.format = THREE.RGBFormat;
    // CubeReflectionMapping || CubeRefractionMapping//
    this.skybox.mapping = THREE.CubeRefractionMapping;
    this.quickvr.scene.background = this.skybox;
  };
 
  getRandomVector = (a, b, c) => {
    const x = (a || 0.0) + (10 - Math.random() * 20);
    const y = (b || 0.0) + (15 - Math.random() * 30);
    const z = (c || 0.0) + (10 - Math.random() * 20);
    return {x, y, z};
  };

  getMazeBlob = () => {
    const mazeReturn = this.maze.generateMaze(this.grid, this.grid);
    const mazeWidth = this.maze.cc * this.size;
    const mazeHeight = this.maze.cr * this.size;
    return {
      mazeReturn,
      mazeWidth,
      mazeHeight
    };
  };

  createScene = () => {
    // Create custom material for the shader
    const texloader = new THREE.TextureLoader();
  
    let texture = texloader.load(stone, () => {
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    });
  
    let bmpMap = texloader.load(bmp, () => {
      bmpMap.wrapS = bmpMap.wrapT = THREE.RepeatWrapping;
    });

    this.boxMaterial = new THREE.MeshPhongMaterial({
      map: texture,
      side: THREE.DoubleSide,
      bumpMap: bmpMap,
      transparent: true,
      bumpScale: 0.95,
    });

    let mve = -1;
    for (let v = 0; v < 1; v += 1) {

      const blob = this.getMazeBlob();
      this.mazeWidth = blob.mazeWidth;
      this.mazeHeight = blob.mazeHeight;

      for (let d = 0; d < blob.mazeReturn.length; d += 1) {
        const x = d % this.maze.cc;
        const y = ~~((d - x) / this.maze.cc);
        const z = mve;
        if (blob.mazeReturn[d] === 1) {
          this.drawCube({ x, y, z });
        }
      }
      mve += this.dsize;
    }
  };

  drawCube = (point) => {
    const size = this.size;
    const xOffset = ~~(0 - this.mazeWidth / 2);
    const yOffset = ~~(0 - this.mazeHeight / 2);

    const geometry = new THREE.BoxBufferGeometry(
      size,
      size,
      size
    ); 

    const object = new THREE.Mesh(
      geometry,
      this.boxMaterial,
    );
    object.position.set(
      xOffset + point.x * size,
      this.dsize + point.z,
      yOffset + point.y * size
    );
    this.quickvr.scene.add(object);
  };

  checkCamera = () => {
    this.quickvr.camera.position.set(
      this.camera.x + this.camera.x,
      2,
      this.camera.y + this.camera.y
    );
  };

  renderLoop = () => {
    this.checkCamera();
    THREE.VRController.update();
    window.requestAnimationFrame(this.renderLoop);
  };
}
