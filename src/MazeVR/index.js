import QuickVR from 'three-quickvr';

import THREE from '../Three';
import BinaryMaze from '../utils/BinaryMaze';
// Skybox image imports //
import xpos from '../../resources/images/church/posx.jpg';
import xneg from '../../resources/images/church/negx.jpg';
import ypos from '../../resources/images/church/posy.jpg';
import yneg from '../../resources/images/church/negy.jpg';
import zpos from '../../resources/images/church/posz.jpg';
import zneg from '../../resources/images/church/negz.jpg';

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

    this.amount = 2 + Math.abs(Math.random() * 26);
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
    this.skybox.mapping = THREE.CubeReflectionMapping;
    // this.scene.background = this.skybox;
  };

  getRandomVector = (a, b, c) => {
    const x = (a || 0.0) + (10 - Math.random() * 20);
    const y = (b || 0.0) + (15 - Math.random() * 30);
    const z = (c || 0.0) + (10 - Math.random() * 20);
    return {x, y, z};
  };

  getMazeBlob = () => {
    const mazeReturn = this.maze.generateMaze(35, 35);
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
    this.metalMaterial = new THREE.MeshBasicMaterial({
      envMap: this.skybox,
      side: THREE.DoubleSide
    });

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

    const object = new THREE.Mesh(
      new THREE.CubeGeometry(
        size,
        size,
        size
      ),
      this.metalMaterial,
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
