import QuickVR from 'three-quickvr';

import THREE from '../Three';
import { Generator } from '../utils/simplexGenerator';

import xpos from '../../resources/images/sky/posx.jpg';
import xneg from '../../resources/images/sky/negx.jpg';
import ypos from '../../resources/images/sky/posy.jpg';
import yneg from '../../resources/images/sky/negy.jpg';
import zpos from '../../resources/images/sky/posz.jpg';
import zneg from '../../resources/images/sky/negz.jpg';

// Render Class Object //
export default class Render {
  constructor() {
    this.generator = new Generator(10);
    this.amount = 25;
    this.size = 50;
    this.strength = 1.25;
    this.iteration = 0.25;
    this.spacing = this.size / this.amount;
    this.treeSet = [];
    this.frames = 0;
    this.background = 0xEEEEEE;
    this.clock = new THREE.Clock();
    this.quickvr = new QuickVR();
    this.controller = null;

    window.addEventListener( 'vr controller connected', (e) => {
      this.vrController(e);
    }, false);
  
    this.init();
    this.createRoom();
    this.renderLoop();
  }

  vrController = (event) => {
    this.controller = event.detail;
    this.controller.standingMatrix = this.quickvr.renderer.vr.getStandingMatrix();
    this.quickvr.renderer.vr.userHeight = 1.6;
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

  init = () => {
    this.quickvr.render.antialias = true;
    this.quickvr.scene.background = new THREE.Color(this.background);
    // this.quickvr.scene.fog = new THREE.FogExp2(this.background, 0.09);

    this.controller = this.quickvr.renderer.vr.getController(0);
    // Set Lights //
    let pointLight = new THREE.PointLight(0x999999);
    pointLight.position.set(50, 450, -800);
    this.quickvr.scene.add(pointLight);

    let ambient = new THREE.AmbientLight(0x777777);
    ambient.position.set(1, 350, -200);
    this.quickvr.scene.add(ambient);
  };

  createRoom = () => {
    const texloader = new THREE.TextureLoader();
    this.ambient = new THREE.AmbientLight( 0xaaaaaa, 1);
    this.ambient.position.set( 0, 20, 0 );
    this.quickvr.scene.add( this.ambient );

    this.makeGround();
    this.makeScene();
  };

  makeGround = () => {
    const geometry = new THREE.PlaneBufferGeometry(
      this.size, this.size, 12, 12
    );

    const mesh = new THREE.Mesh( 
      geometry, 
      new THREE.MeshPhongMaterial({ 
        color: 0x555555,
        dithering: true,
        flatShading: true,
        side: THREE.DoubleSide
      } ) 
    );

    mesh.rotation.set(90 * Math.PI / 180, 0, 0);
    mesh.position.set(0, -3.75, 0);
    mesh.receiveShadow = true;
    this.quickvr.scene.add( mesh );
  };

  makeScene = () => {
    const geometry = new THREE.PlaneBufferGeometry(
      .75, .5, 4, 4
    );

    const mesh = new THREE.Mesh( 
      geometry, 
      new THREE.MeshPhongMaterial({ 
        color: 0x777777,
        dithering: true,
        flatShading: true,
        side: THREE.DoubleSide
      } ) 
    );

    // mesh.rotation.set(90 * Math.PI / 180, 0, 0);
    mesh.position.set(0, 1.25, -0.15);
    mesh.receiveShadow = true;
    this.quickvr.scene.add( mesh );
  };

  getRandomPostion = () => {
    const spatial = this.size * 0.85;
    return {
      x: (spatial / 2) - (Math.random() * spatial),
      y: (spatial / 2) - (Math.random() * spatial),
      z: 0
    };
    
  };

  renderLoop = () => {
    THREE.VRController.update();

    window.requestAnimationFrame(this.renderLoop);
  };
}
