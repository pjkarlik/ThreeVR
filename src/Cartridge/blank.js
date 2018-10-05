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
    this.amount = 8;

    this.objects = [];
    this.saber = null;
    this.generator = new Generator(10);
    this.clock = new THREE.Clock();
    this.raycaster = new THREE.Raycaster();
    this.quickvr = new QuickVR();
    this.controller = null;

    this.emitter = {
      x: 0,
      y: 1,
      z: -1.95
    };

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
    const { camera, scene }  = this.quickvr;
    this.controller = event.detail;
    this.controller.standingMatrix = this.quickvr.renderer.vr.getStandingMatrix();
    this.controller.head = camera;
    const material = new THREE.MeshPhongMaterial({
      flatShading: true,
      color: 0xDB3236,
      dithering: true 
    });
    const mesh = this.userController = new THREE.Mesh(
      new THREE.CylinderGeometry( 0.005, 0.05, 0.1, 6 ),
      material
    );

    const handle = new THREE.Mesh(
      new THREE.BoxGeometry( 0.03, 0.1, 0.03 ),
      material,
    );

    this.saber = new THREE.Mesh(
      new THREE.CylinderGeometry( 0.001, 0.5, 2, 12 ),
      material,
    );
    
    scene.add(this.saber);

    mesh.rotation.x = -Math.PI / 2;
    handle.position.y = -0.05;
    
    handle.castShadow = true;
    mesh.add(handle);
    
    mesh.castShadow = true;
    this.controller.userData.mesh = mesh;
    this.controller.add(mesh);

    scene.add(this.controller);
    this.guiInputHelper = window.dat.GUIVR.addInputObject(this.controller);
    scene.add(this.guiInputHelper);

    this.controller.addEventListener( 'primary press began', (event) => {
      const mesh = event.target.userData.mesh;
      mesh.material.color.setHex(0x3642DB);
      this.guiInputHelper.pressed(true);
      this.toggleSaber(true);
    });
    this.controller.addEventListener( 'primary press ended', (event) => {
      const mesh = event.target.userData.mesh;
      mesh.material.color.setHex(0xDB3236);
      this.guiInputHelper.pressed(false);
      this.toggleSaber(false);
    });
  };

  bootstrap = () => {
    const urls = [xpos, xneg, ypos, yneg, zpos, zneg];
    this.skybox = new THREE.CubeTextureLoader().load(urls);
    this.skybox.format = THREE.RGBFormat;
    this.quickvr.scene.background = this.skybox;
  };

  createRoom = () => {
    const { scene }  = this.quickvr;
    const ambient = new THREE.AmbientLight( 0xffffff, 0.1 );
    scene.add(ambient);

    const spotLight = new THREE.SpotLight( 0xffffff, 1 );
    spotLight.position.set( 2, 30, 2 );
    scene.add(spotLight);

    const mesh = new THREE.Mesh( 
      new THREE.PlaneBufferGeometry(50, 50),
      new THREE.MeshPhongMaterial({ 
        color: 0x808080,
        dithering: true 
      })
    );

    mesh.position.set( 0, - 1, 0 );
    mesh.rotation.x = - Math.PI * 0.5;
    scene.add( mesh );

    const floatBox = new THREE.Mesh( 
      new THREE.BoxBufferGeometry(5, 0.5, 5), 
      new THREE.MeshPhongMaterial({ 
        color: 0x4080ff,
        dithering: true 
      })
    );

    floatBox.position.set( 10, 6, 0 );
    scene.add(floatBox);

    const tble = new THREE.Mesh( 
      new THREE.BoxBufferGeometry(1, 0.1, .5), 
      new THREE.MeshPhongMaterial({ 
        color: 0xFFFFFF,
        dithering: true 
      })
    );
    
    tble.position.set(0, 1, -3);
    scene.add(tble);


    // this.arrow = new THREE.ArrowHelper(
    //   this.raycaster.ray.direction,
    //   this.raycaster.ray.origin,
    //   100,
    //   Math.random() * 0xffffff );
    // scene.add(this.arrow);

  };

  toggleSaber = (state) => {
    alert(JSON.stringify(this.controller.userData));
    const { position, rotation } = this.controller.userData.mesh;
    if(state) {
      this.saber.position.set(position.x, position.y, position.z);
      // this.saber.rotation.set(rotation.x, rotation.y, rotation.z);
    } else {
      this.saber.position.set(1000,1000,1000);
    }

  };

  renderLoop = () => {
    // this.rayCasting();
    THREE.VRController.update();
    window.requestAnimationFrame(this.renderLoop);
  };
}
