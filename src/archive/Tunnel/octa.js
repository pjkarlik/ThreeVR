import QuickVR from 'three-quickvr';
import THREE from '../../Three';
import { Generator } from '../../utils/simplexGenerator';

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
    this.tubeCongif = {
      segments: 500,
      detail: 7,
      radius: 1.5
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
    this.createScene();
  };

  getRandomVector = () => {
    const x = 0.0 + Math.random() * 255;
    const y = 0.0 + Math.random() * 255;
    const z = 0.0 + Math.random() * 255;
    return new THREE.Vector3(x, y, z);
  };

  createScene = () => {
    const initialPoints = [
      [0.0, 0.0, 300.0],
      [0.0, 0.0, 0.0],
      [600.0, 0.0, 0.0],
      [600.0, 600.0, 0.0],
      [600.0, 600.0, 300.0],
      [600.0, 300.0, 600.0],
      [600.0, 0.0, 600.0],
      [0.0, 0.0, 600.0],
      [0.0, 0.0, 300.0],
    ];

    //Convert the array of points into vertices
    const points = initialPoints.map((point) => {
      const x = point[0];
      const y = point[1];
      const z = point[2];
      return new THREE.Vector3(x, y, z);
    });

    this.path = new THREE.CatmullRomCurve3(points);
    this.path.closed = true;

    const frames = this.path.computeFrenetFrames(this.tubeCongif.segments, true);

    this.geometry = new THREE.Geometry();
    this.color = new THREE.Color(0x000000);

    for (let i = 0; i < this.tubeCongif.segments; i++) {
      const normal = frames.normals[i];
      const binormal = frames.binormals[i];

      const index = i / this.tubeCongif.segments;
      const p = this.path.getPointAt(index);

      let circle = new THREE.Geometry();
      for (let j = 0; j < this.tubeCongif.detail; j++) {
        const position = p.clone();

        let angle = (j / this.tubeCongif.detail) * Math.PI * 2;
        angle += this.generator.simplex2(index * 10, 0);

        const sin = Math.sin(angle);
        const cos = -Math.cos(angle);

        const normalPoint = new THREE.Vector3(0,0,0);
        normalPoint.x = (cos * normal.x + sin * binormal.x);
        normalPoint.y = (cos * normal.y + sin * binormal.y);
        normalPoint.z = (cos * normal.z + sin * binormal.z);
        normalPoint.multiplyScalar(this.tubeCongif.radius);

        position.add(normalPoint);
        circle.vertices.push(position);
      }

      circle.vertices.push(circle.vertices[0]);
      const material = new THREE.LineBasicMaterial({
        color: new THREE.Color(
          `hsl(${this.generator.simplex2(index * 20, 0) * 175 + 300},50%,50%)`
        )
      });
      const line = new THREE.Line(circle, material);
      this.quickvr.scene.add(line);
    }

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
    this.stopFrame += 0.0001;
    // Get the point at the specific percentage
    const p1 = this.path.getPointAt(Math.abs((this.stopFrame) % 1));

    // Camera
    this.quickvr.camera.position.set(p1.x, p1.y, p1.z);

  };

  renderLoop = () => {
    window.requestAnimationFrame(this.renderLoop);
    this.frames ++;
    this.renderScene();
  };
}
