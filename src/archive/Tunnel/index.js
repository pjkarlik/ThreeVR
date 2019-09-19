import QuickVR from 'three-quickvr';
import THREE from '../../Three';
import { Generator } from '../../utils/simplexGenerator';

import stone from '../../../resources/images/6920.jpg';
import bmp from '../../../resources/images/6920-bmp.jpg';
// Render Class Object //
export default class Render {
  constructor() {
    this.frames = 100;
    this.stopFrame = 0;
    this.allowChange = false;
    this.background = '#000000';
    this.timeout = 6000;
    this.isRnd = true;
    this.quickvr = new QuickVR();
    this.generator = new Generator(10);

    // Configurations //
    this.cameraConfig = {
      position: [0, 0, 0],
      lookAt: [0, 0, 0],
      aspect: this.width / this.height,
      viewAngle: 45,
      near: 0.1,
      far: 10000
    };
    this.controlConfig = {
      max: 1500,
      min: 0
    };
  
    this.geometry = null;
    this.setRender();
  }

  resize = () => {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.width, this.height);
  };

  setRender = () => {
    // Set Render and Scene //
    this.quickvr.scene.background = new THREE.Color(this.background);
    this.quickvr.scene.fog = new THREE.FogExp2(new THREE.Color(0x000000), 0.0145);
    // Set Light //
    this.lightA = new THREE.PointLight(0xaa0000, 0.95, 15);
    this.lightB = new THREE.AmbientLight(0xaaaaaa, 1, 150);
    // this.lightC = new THREE.PointLight(0x0000FF, 0.65, 15);

    // this.lightA = new THREE.PointLight(0x888888, 1, 550);
    // this.lightB = new THREE.PointLight(0x999999, 1, 350);
    this.lightC = new THREE.PointLight(0xFF0000, 1, 350);

    this.quickvr.scene.add(this.lightA);
    this.quickvr.scene.add(this.lightB);
    this.quickvr.scene.add(this.lightC);
    this.createScene();
  };

  getRandomVector = () => {
    const x = 0.0 + Math.random() * 255;
    const y = 0.0 + Math.random() * 255;
    const z = 0.0 + Math.random() * 255;
    return new THREE.Vector3(x, y, z);
  };

  createScene = () => {
    const texloader = new THREE.TextureLoader();
    /* eslint no-multi-assign: 0 */
    const rpt = 400;
    const texture = texloader.load(stone, () => {
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      texture.offset.set(0, 0);
      texture.repeat.set(rpt, 6);
    });
    const bmpMap = texloader.load(bmp, () => {
      bmpMap.wrapS = bmpMap.wrapT = THREE.RepeatWrapping;
      bmpMap.offset.set(0, 0);
      bmpMap.repeat.set(rpt, 6);
    });

    this.tunnelMaterial = new THREE.MeshPhongMaterial({
      map: texture,
      bumpMap: bmpMap,
      bumpScale: 1,
      specularMap: bmpMap,
      specular: new THREE.Color(0x33ff44),
      side: THREE.DoubleSide,
    });
    const initialPoints = [
      [0.0, 0.0, 600.0],
      [0.0, 0.0, 0.0],
      [1200.0, 0.0, 0.0],
      [1200.0, 1200.0, 0.0],
      [1200.0, 1200.0, 600.0],
      [1200.0, 600.0, 1200.0],
      [1200.0, 0.0, 1200.0],
      [0.0, 0.0, 1200.0],
      [0.0, 0.0, 600.0],
    ];

    const points = initialPoints.map((point) => {
      const v3Point = new THREE.Vector3(...point);
      return v3Point;
    });

    this.path1 = new THREE.CatmullRomCurve3(points);

    const tube1 = new THREE.Mesh(
      new THREE.TubeGeometry(this.path1, 20, 8, 8, true),
      this.tunnelMaterial,
    );

    this.quickvr.scene.add(tube1);

    setTimeout(() => {
      this.allowChange = true;
    }, this.timeout);
    this.renderLoop();
  };
  
  makeTube = (points) => {
    const size = (0.2 + Math.random()) * 0.085;
    return new THREE.Mesh(
      new THREE.TubeGeometry(
        new THREE.CatmullRomCurve3(this.makeRandomPath(points)),
        100,
        size,
        8,
        false
      ),
      this.tubeMaterial,
    );
  };

  makeRandomPath = (pointList) => {
    this.pointsIndex = [];
    // const totalItems = pointList.length;
    const randomPoints = pointList.map((point, index) => {
      // const check = index < 1 && index > 3;
      const rx = (1.0 - (Math.random() * 2) ) * 0.95;
      const ry = (1.0 - (Math.random() * 2) ) * 0.95;
      const rz = (1.0 - (Math.random() * 2) ) * 0.95;
      const tx = point[0] + rx;
      const ty = point[1] + ry;
      const tz = point[2] + rz;
      const v3Point = new THREE.Vector3(tx, ty, tz);
      this.pointsIndex.push(v3Point);
      return v3Point;
    });
    return randomPoints;
  };

  renderScene = () => {
    this.stopFrame += 0.000003;
    // Get the point at the specific percentage
    const p1 = this.path1.getPointAt(Math.abs((this.stopFrame) % 1));
    // const p2 = this.path1.getPointAt(Math.abs((this.stopFrame) % 1));
    const p3 = this.path1.getPointAt(Math.abs((this.stopFrame + 0.05) % 1));
    const p4 = this.path1.getPointAt(Math.abs((this.stopFrame - 0.05) % 1));

    const amps = 0.75;
    const tempX = amps * Math.sin(this.stopFrame * Math.PI / 180) * 0.45;
    const tempY = amps * Math.cos(this.stopFrame * Math.PI / 180) * 0.45;
    this.lightA.position.set(p3.x + tempX, p3.y, p3.z);
    this.lightB.position.set(p1.x + tempX, p1.y + tempY, p1.z + tempY);
    this.lightC.position.set(p4.x, p4.y + tempY, p4.z);
    // Camera
    this.quickvr.camera.position.set(p1.x + tempX, p1.y + tempY, p1.z + tempY);

  };

  renderLoop = () => {
    window.requestAnimationFrame(this.renderLoop);
    this.frames ++;
    this.renderScene();
  };
}
