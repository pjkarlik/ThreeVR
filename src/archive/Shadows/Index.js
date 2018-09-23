import QuickVR from 'three-quickvr';

import THREE from '../../Three';
import { Generator } from '../../utils/simplexGenerator';

import xpos from '../../../resources/images/sky/posx.jpg';
import xneg from '../../../resources/images/sky/negx.jpg';
import ypos from '../../../resources/images/sky/posy.jpg';
import yneg from '../../../resources/images/sky/negy.jpg';
import zpos from '../../../resources/images/sky/posz.jpg';
import zneg from '../../../resources/images/sky/negz.jpg';

// Render Class Object //
export default class Render {
  constructor() {
    this.amount = 8;

    this.size = 0.14;
    this.strength = 0.18;
    this.iteration = 0.14;
    this.spacing = 0.05;

    this.time = 0;
    this.rtime = 0;
    this.frame = 0;
    this.speed = 0.01;
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
  
    this.bootstrap();
    this.createRoom();
    this.renderLoop();
  }

  datGui = () => {
    const options = {
      size: this.size,
      spacing: this.spacing,
      detail: this.iteration,
      strength: this.strength
    };
 
    const guiVR = window.dat.GUIVR;
    const noiseOptions = guiVR.create('Noise Options');

    console.log(noiseOptions);

    guiVR.enableMouse(this.quickvr.camera);

    noiseOptions.add(options, 'size', 0.001, 1).step(0.001).onChange((val) => {
      this.size = val;
    });
    noiseOptions.add(options, 'spacing', 0.05, 2).step(0.001).onChange((val) => {
      this.spacing = val;
    });
    noiseOptions.add(options, 'detail', 0.001, 0.5).step(0.001).onChange((val) => {
      this.iteration = val;
    });
    noiseOptions.add(options, 'strength', 0, 0.5).step(0.001).onChange((val) => {
      this.strength = val;
    });
 
    noiseOptions.position.set(-0.5,1.85,-2.75);
    noiseOptions.children[0].castShadow = true;
    noiseOptions.children[1].castShadow = true;
    noiseOptions.children[2].castShadow = true;
    this.quickvr.scene.add(noiseOptions);
  };

  vrController = (event) => {
    this.controller = event.detail;
    this.controller.standingMatrix = this.quickvr.renderer.vr.getStandingMatrix();
    this.controller.head = this.quickvr.camera;
    const material = new THREE.MeshPhongMaterial({
      flatShading: true,
      color: 0xDB3236,
      dithering: true 
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
    
    handle.castShadow = true;
    mesh.add(handle);
    
    mesh.castShadow = true;
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

  bootstrap = () => {
    // this.quickvr.renderer.shadowMap.enabled = true;
    // this.quickvr.renderer.shadowMap.type = THREE.PCFSoftShadowMap; 
    const urls = [xpos, xneg, ypos, yneg, zpos, zneg];
    this.skybox = new THREE.CubeTextureLoader().load(urls);
    this.skybox.format = THREE.RGBFormat;
    this.quickvr.scene.background = this.skybox;
  };

  createRoom = () => {
    const ambient = new THREE.AmbientLight( 0xffffff, 0.1 );
    this.quickvr.scene.add( ambient );

    const spotLight = new THREE.SpotLight( 0xffffff, 1 );
    spotLight.position.set( 2, 20, 2 );
    spotLight.angle = Math.PI / 4;
    spotLight.penumbra = 0.01;
    spotLight.decay = 2;
    spotLight.distance = 100;

    spotLight.castShadow = true;
    spotLight.shadow.mapSize.width = 1024;
    spotLight.shadow.mapSize.height = 1024;
    spotLight.shadow.camera.near = 0.1;
    spotLight.shadow.camera.far = 100;
    this.quickvr.scene.add( spotLight );

    const lightHelper = new THREE.SpotLightHelper( spotLight );
    this.quickvr.scene.add( lightHelper );

    const mesh = new THREE.Mesh( 
      new THREE.PlaneBufferGeometry(50, 50),
      new THREE.MeshPhongMaterial({ 
        color: 0x808080,
        dithering: true 
      })
    );

    mesh.position.set( 0, - 1, 0 );
    mesh.rotation.x = - Math.PI * 0.5;
    mesh.receiveShadow = true;
    this.quickvr.scene.add( mesh );

    const floatBox = new THREE.Mesh( 
      new THREE.BoxBufferGeometry(5, 0.5, 5), 
      new THREE.MeshPhongMaterial({ 
        color: 0x4080ff,
        dithering: true 
      })
    );

    floatBox.position.set( 10, 6, 0 );
    floatBox.castShadow = true;
    this.quickvr.scene.add(floatBox);

    const tble = new THREE.Mesh( 
      new THREE.BoxBufferGeometry(1, 0.1, .5), 
      new THREE.MeshPhongMaterial({ 
        color: 0xFFFFFF,
        dithering: true 
      })
    );
    tble.position.set(0, 1, -3);
    tble.castShadow = true;
    tble.receiveShadow = true;
    this.quickvr.scene.add(tble);

    const roomSize = 55;
    const roombox = new THREE.Mesh(
      new THREE.BoxBufferGeometry(roomSize, roomSize, roomSize),
      new THREE.MeshPhongMaterial({
        color: 0xaeaeae,
        dithering: true,
        side: THREE.DoubleSide
      })
    );
    
    roombox.position.set(0, 0, 0);
    roombox.castShadows = false;
    roombox.receiveShadows = true;
    this.quickvr.scene.add(roombox);

  };

  renderLoop = () => {
    THREE.VRController.update();
    window.requestAnimationFrame(this.renderLoop);
  };
}
