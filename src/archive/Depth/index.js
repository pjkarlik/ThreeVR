import QuickVR from 'three-quickvr';

import THREE from '../../Three';
import { Generator } from '../../utils/simplexGenerator';

import xpos from '../../../resources/images/hornstulls/posx.jpg';
import xneg from '../../../resources/images/hornstulls/negx.jpg';
import ypos from '../../../resources/images/hornstulls/posy.jpg';
import yneg from '../../../resources/images/hornstulls/negy.jpg';
import zpos from '../../../resources/images/hornstulls/posz.jpg';
import zneg from '../../../resources/images/hornstulls/negz.jpg';

// Render Class Object //
export default class Render {
  constructor() {
    this.amount = Math.round(5 + Math.abs(Math.random() * 26));
    this.adef = 360 / this.amount + 1;
    this.splineObject = [];

    this.frames = 0;
    this.speed = 0.2;
    this.isMove = false;

    this.objects = [];

    this.generator = new Generator(10);
    this.clock = new THREE.Clock();
    this.quickvr = new QuickVR();
    this.controller = null;

    this.emitter = {
      x: 0,
      y: 1,
      z: -1.95
    };

    this.datGui();

    window.addEventListener( 'vr controller connected', (e) => {
      this.vrController(e);
    }, false);
  
    this.init();
    this.createScene();
    this.renderLoop();
  }

  vrController = (event) => {
    this.controller = event.detail;
    this.controller.standingMatrix = this.quickvr.renderer.vr.getStandingMatrix();
    this.controller.head = this.quickvr.camera;
    const material = new THREE.MeshPhongMaterial({
      flatShading: true,
      color: 0xDB3236
    });
    const mesh = new THREE.Mesh(
      new THREE.CylinderGeometry( 0.005, 0.05, 0.1, 6 ),
      material
    );
    const handle = new THREE.Mesh(
      new THREE.BoxGeometry( 0.03, 0.1, 0.03 ),
      material,
    );
  
    mesh.rotation.x = -Math.PI / 2;
    handle.position.y = -0.05;
    mesh.add(handle);
    mesh.castShadows = true;
    mesh.receiveShadows = true;

    this.controller.userData.mesh = mesh;
    this.controller.add(mesh);

    this.quickvr.scene.add(this.controller);
    this.guiInputHelper = window.dat.GUIVR.addInputObject(this.controller);
    this.quickvr.scene.add(this.guiInputHelper);

    this.controller.addEventListener( 'primary press began', (event) => {
      event.target.userData.mesh.material.color.setHex(0x3642DB );
      this.guiInputHelper.pressed(true);
    });
    this.controller.addEventListener( 'primary press ended', (event) => {
      event.target.userData.mesh.material.color.setHex(0xDB3236);
      this.guiInputHelper.pressed(false);
    });
  };

  datGui = () => {
    const options = {
      speed: this.speed,
      x: this.emitter.x,
      y: this.emitter.z,
      z: this.emitter.y
    };

    const guiVR = window.dat.GUIVR;
    guiVR.enableMouse(this.quickvr.camera);

    // this.gui = guiVR.create('Settings');
    const displayOptions = guiVR.create('Display Options');
    displayOptions.close();

    displayOptions.add(options, 'x', -2, 2).step(0.001).onChange((val) => {
      this.emitter.x = val;
    });
    displayOptions.add(options, 'y', -6, 2).step(0.001).onChange((val) => {
      this.emitter.z = val;
    });
    displayOptions.add(options, 'z', -1.5, 3.5).step(0.001).onChange((val) => {
      this.emitter.y = val;
    });
    displayOptions.add(options, 'speed', 0, 5).step(0.001).onChange((val) => {
      this.speed = val;
    });

    displayOptions.position.set(-0.5,2.35,-2.15);
    displayOptions.rotation.x = Math.PI/16;
    this.quickvr.scene.add(displayOptions);
  };

  init = () => {
    this.quickvr.render.antialias = true;
    this.quickvr.scene.fog = new THREE.FogExp2(0x000000, 0.375);

    this.controller = this.quickvr.renderer.vr.getController(0);
    const urls = [xpos, xneg, ypos, yneg, zpos, zneg];
    this.skybox = new THREE.CubeTextureLoader().load(urls);
    this.skybox.format = THREE.RGBFormat;
    this.quickvr.scene.background = this.skybox;

    // Set Lights //
    let pointLight = new THREE.PointLight(0xAAAAAA);
    pointLight.position.set(50, 450, -800);
    this.quickvr.scene.add(pointLight);

    let ambient = new THREE.AmbientLight(0x9f9f9f);
    ambient.position.set(1, 350, -200);
    this.quickvr.scene.add(ambient);
  };

  getRandomVector = (a, b, c) => {
    const x = (a || 0.0) + (2 - Math.random() * 4);
    const y = (b || 0.0) + (2 - Math.random() * 6);
    const z = (c || 0.0) + (2 - Math.random() * 4);
    return {x, y, z};
  };

  createScene = () => {
    this.metalMaterial = new THREE.MeshBasicMaterial({
      envMap: this.skybox,
      side: THREE.DoubleSide
    });
    this.flatMaterial =  new THREE.MeshPhongMaterial({
      color: 0xFF0000,
      side: THREE.DoubleSide
    });
    // Spline Creation //
    const vcs = 14 + Math.abs(Math.random() * 24);
    let tempArray = [];
    let newChamber;
    let chamber = {x:0, y:0, z:0};
    tempArray.push(new THREE.Vector3(chamber.x, chamber.y, chamber.z));
    for(let i = 0; i < vcs; i++) {
      newChamber = this.getRandomVector(
        chamber.x, chamber.y, chamber.z
      );
      chamber = newChamber;
      tempArray.push(new THREE.Vector3(chamber.x, chamber.y, chamber.z));
    }
    // CatmullRomCurve3
    const curve = new THREE.CatmullRomCurve3([...tempArray]);

    const params = {
      scale: 0.05,
      extrusionSegments: 100,
      radiusSegments: 5,
      radius: 0.25 + Math.random() * 1,
      closed: false
    };

    const tubeGeometry = new THREE.TubeBufferGeometry(
      curve,
      params.extrusionSegments,
      params.radius,
      params.radiusSegments,
      params.closed
    );

    for(let i = 0; i < this.amount; i++) {
      const tempSpline = new THREE.Mesh(
        tubeGeometry,
        this.metalMaterial
      );
      tempSpline.position.set(0, 1.5, -2);
      tempSpline.scale.set(params.scale, params.scale, params.scale);
      tempSpline.rotation.set(0, (i * this.adef) * Math.PI / 180, 0);
      this.splineObject.push(tempSpline);
      this.quickvr.scene.add(tempSpline);
    }


  };

  checkObjects = () => {
    this.frames += this.speed;

    for(let i = 0; i < this.amount; i++) {
      const tempSpline = this.splineObject[i];
      const evenItem = (i % 2 === 0);
      const stepPlace = ((i * this.adef) - this.frames) * Math.PI / 180;
      tempSpline.rotation.set(
        -(this.frames) * Math.PI / 180,
        evenItem ? stepPlace : 0,
        // evenItem ? 0 : stepPlace,
        !evenItem ? 0 : ((i * this.adef) - this.frames) * Math.PI / 180
      );
      tempSpline.position.set(this.emitter.x, this.emitter.y, this.emitter.z);
    }
  };

  renderLoop = () => {
    this.checkObjects();
    THREE.VRController.update();
    window.requestAnimationFrame(this.renderLoop);
  };
}
