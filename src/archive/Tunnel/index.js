import QuickVR from 'three-quickvr';
import THREE from '../../Three';
import { Generator } from '../../utils/simplexGenerator';
import metal from '../../../resources/images/matallo.jpg';
import tbs from '../../../resources/images/int1.jpg';

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
    this.lightA = new THREE.PointLight(0xaa0000, 0.65, 15);
    this.lightB = new THREE.AmbientLight(0xaaaaaa, 0.75, 15);
    this.lightC = new THREE.PointLight(0x0000FF, 0.65, 15);
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
    const texture = texloader.load(metal);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.offset.set(0, 0);
    texture.repeat.set(900, 5);

    this.tunnelMaterial = new THREE.MeshLambertMaterial({
      map: texture,
      side: THREE.DoubleSide,
    });

    const tubetexture = texloader.load(tbs);
    tubetexture.wrapS = tubetexture.wrapT = THREE.RepeatWrapping;
    tubetexture.offset.set(0, 0.5);
    tubetexture.repeat.set(2200, 0.5);

    this.tubeMaterial = new THREE.MeshPhongMaterial({
      map: tubetexture
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
      new THREE.TubeGeometry(
        this.path1,
        120,
        2.15,
        12,
        true
      ),
      this.tunnelMaterial,
    );

    this.quickvr.scene.add(tube1);

    // for (let i = 0; i < 12; i++) {
    //   const tube = this.makeTube(initialPoints);
    //   this.quickvr.scene.add(tube);
    // }

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
        120,
        size,
        12,
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
    this.stopFrame += 0.000001;
    // Get the point at the specific percentage
    const p1 = this.path1.getPointAt(Math.abs((this.stopFrame) % 1));
    const p2 = this.path1.getPointAt(Math.abs((this.stopFrame) % 1));
    const p3 = this.path1.getPointAt(Math.abs((this.stopFrame + 0.03) % 1));
    const p4 = this.path1.getPointAt(Math.abs((this.stopFrame - 0.03) % 1));

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
