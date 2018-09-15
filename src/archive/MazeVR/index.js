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

import stone from '../../../resources/images/matallo.jpg';
import bmp from '../../../resources/images/matallo_bmp.jpg';
import grate from '../../../resources/images/grate_t.png';
import bmpg from '../../../resources/images/grate_bmp.jpg';

// Render Class Object //
export default class Render {
  constructor() {
    this.frames = 0;
    this.mirror = 4;
    this.scale = 1.0;
    this.ratio = 1024;
    this.size = 0.2;
    this.maze = new BinaryMaze();
    this.quickvr = new QuickVR();
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.devicePixelRatio = window.devicePixelRatio;

    this.amount = 3;
    this.adef = 360 / this.amount + 1;
    this.splineObject = [];

    this.init();
    this.createScene();
    this.renderLoop();
  }

  init = () => {
    // Set Render and Scene //
    this.quickvr.render.antialias = true;

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
    const mazeReturn = this.maze.generateMaze(11, 11);
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

    // texture = texloader.load(grate, () => {
    //   texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    // });
  
    // bmpMap = texloader.load(bmpg, () => {
    //   bmpMap.wrapS = bmpMap.wrapT = THREE.RepeatWrapping;
    // });

    // this.grateMaterial = new THREE.MeshPhongMaterial({
    //   map: texture,
    //   bumpMap: bmpMap,
    //   transparent: true,
    //   bumpScale: 0.95,
    // });

    let mve = 0;
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
      mve += this.size * 2;
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
      // size * 0.45, 16, 16
    ); 
    geometry.rotateX(90 * Math.PI / 180);

    geometry.computeVertexNormals();
    const object = new THREE.Mesh(
      geometry,
      this.boxMaterial,
    );
    object.position.set(
      xOffset + point.x * size,
      1.15 + point.z,
      yOffset + point.y * size
    );
    this.quickvr.scene.add(object);
  };

  renderLoop = () => {
    window.requestAnimationFrame(this.renderLoop.bind(this));
  };
}
