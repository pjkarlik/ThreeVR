import QuickVR from 'three-quickvr';
import THREE from '../../Three';
import { Generator } from '../../utils/simplexGenerator';
import metal from '../../../resources/images/matallo.jpg';
import bump from '../../../resources/images/matallo_bmp.jpg';
// Render Class Object //
export default class Render {
  constructor() {
    this.frames = 0;
    this.stopFrame = 0;
    this.allowChange = false;
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
    this.tubeCongif = {
      segments: 300,
      detail: 20,
      radius: 5
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

    // Set Light //
    this.lightA = new THREE.PointLight(0xAA0000, 1, 450);
    this.lightB = new THREE.AmbientLight(0xFFAA00, 1, 450);
    this.lightC = new THREE.PointLight(0x00FF00, 1, 450);
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
  }


  createScene = () => {
    const texloader = new THREE.TextureLoader();
    const texture = texloader.load(metal);
    const bumptexture = texloader.load(bump);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.offset.set(0, 0);
    texture.repeat.set(35, 5);

    this.tunnelMaterial = new THREE.MeshPhongMaterial({
      map: texture,
      side: THREE.DoubleSide,
      bumpMap: bumptexture
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
      [0.0, 0.0, 600.0]
    ];

    const points = initialPoints.map((point) => {
      const v3Point = new THREE.Vector3(...point);
      return v3Point;
    });

    this.path1 = new THREE.CatmullRomCurve3(points);

    const tube1 = new THREE.Mesh(
      new THREE.TubeGeometry(
        this.path1,
        150,
        40,
        18,
        true
      ),
      this.tunnelMaterial,
    );

    this.quickvr.scene.add(tube1);

    setTimeout(() => {
      this.allowChange = true;
    }, this.timeout);
    this.renderLoop();
  };
  
  makeRandomPath = (pointList) => {
    this.pointsIndex = [];
    // const totalItems = pointList.length;
    const randomPoints = pointList.map((point, index) => {
      const check = index < 1 && index > 3;
      const rx = 25 - Math.random() * 50;
      const ry = 25 - Math.random() * 50;

      const tx = point[0] + rx;
      const ty = check ? point[1] + ry : point[1];
      const tz = check ? point[2] : point[2] + ry;
      const v3Point = new THREE.Vector3(tx, ty, tz);
      this.pointsIndex.push(v3Point);
      return v3Point;
    });
    return randomPoints;
  };

  renderScene = () => {
    this.stopFrame += 0.0001;
    // Get the point at the specific percentage
    const p1 = this.path1.getPointAt(Math.abs((this.stopFrame) % 1));
    const p2 = this.path1.getPointAt(Math.abs((this.stopFrame) % 1));
    const p3 = this.path1.getPointAt(Math.abs((this.stopFrame + 0.03) % 1));
    const p4 = this.path1.getPointAt(Math.abs((this.stopFrame - 0.03) % 1));

    const amps = 2; // + Math.sin(realTime * Math.PI / 180) * 45;
    const tempX = amps * Math.sin(this.frames * Math.PI / 180) * 0.45;
    const tempY = amps * Math.cos(this.frames * Math.PI / 180) * 0.45;
    this.lightA.position.set(p2.x, p2.y, p2.z);
    this.lightB.position.set(p3.x, p3.y, p3.z);
    this.lightC.position.set(p4.x, p4.y, p4.z);
    // Camera
    this.quickvr.camera.position.set(p1.x + tempX, p1.y + tempY, p1.z + tempY);

  };

  renderLoop = () => {
    window.requestAnimationFrame(this.renderLoop);
    this.frames ++;
    this.renderScene();
  };
}
