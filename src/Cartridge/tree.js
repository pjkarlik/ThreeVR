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
    this.quickvr.scene.fog = new THREE.FogExp2(this.background, 0.1);

    // this.controller = this.quickvr.renderer.vr.getController(0);
    // const urls = [xpos, xneg, ypos, yneg, zpos, zneg];
    // this.skybox = new THREE.CubeTextureLoader().load(urls);
    // this.skybox.format = THREE.RGBFormat;
    // this.quickvr.scene.background = this.skybox;

    this.spotLight = new THREE.SpotLight( 0xffffff, 0.15 );
    this.spotLight.position.set( 0, 60, 0 );
    this.spotLight.angle = Math.PI / 3;
    this.spotLight.penumbra = 0.05;
    this.spotLight.decay = 2;
    this.spotLight.distance = 100;

    this.spotLight.castShadow = true;
    this.spotLight.shadow.mapSize.width = 1024;
    this.spotLight.shadow.mapSize.height = 1024;
    this.spotLight.shadow.camera.near = 10;
    this.spotLight.shadow.camera.far = 100;
    this.quickvr.scene.add( this.spotLight );
  };

  createRoom = () => {
    const texloader = new THREE.TextureLoader();
    this.ambient = new THREE.AmbientLight( 0xaaaaaa, 1);
    this.ambient.position.set( 0, 20, 0 );
    this.quickvr.scene.add( this.ambient );

    this.spotLight = new THREE.SpotLight( 0xffffff, 1 );
    this.spotLight.position.set( 0, 40, 0 );
    this.spotLight.angle = Math.PI / 3;
    this.spotLight.penumbra = 0.05;
    this.spotLight.decay = 2;
    this.spotLight.distance = 100;

    this.spotLight.castShadow = true;
    this.spotLight.shadow.mapSize.width = 1024;
    this.spotLight.shadow.mapSize.height = 1024;
    this.spotLight.shadow.camera.near = 10;
    this.spotLight.shadow.camera.far = 100;
    this.quickvr.scene.add( this.spotLight );

    this.sun = new THREE.Mesh( 
      new THREE.SphereBufferGeometry(2, 6, 6),
      new THREE.MeshPhongMaterial({ 
        color: 0xFFFF00,
        dithering: true,
        flatShading: true,
      })
    );
    this.quickvr.scene.add(this.sun);

    this.makeGround();
    this.makeTrees(35);
  };

  makeGround = () => {
    this.geometry = new THREE.PlaneBufferGeometry(this.size, this.size, this.amount, this.amount);

    const mesh = new THREE.Mesh( 
      this.geometry, 
      new THREE.MeshPhongMaterial({ 
        color: 0xFFFFFF,
        dithering: true,
        flatShading: true,
        side: THREE.DoubleSide
      } ) 
    );

    mesh.rotation.set(90 * Math.PI / 180, 0, 0);
    mesh.position.set(0, -1, 0);
    mesh.receiveShadow = true;
    this.quickvr.scene.add( mesh );
    this.groundNoise();
  };

  groundNoise = () => {
    const offset = this.size / 2;
    const vertices = this.geometry.attributes.position.array;
    for (let y = 0; y < this.amount + 1; y++) {
      for (let x = 0; x < this.amount + 1; x++) {
        const vx = x * 3;
        const vy = y * ((this.amount + 1) * 3);
        const noiseX = this.generator.simplex3(
          x * this.iteration,
          y * this.iteration,
          this.frames,
        );
        // vertices[vy + vx + 0] = (-offset) + x * this.spacing;
        // vertices[vy + vx + 1] = ((-offset) + y * this.spacing);
        vertices[vy + vx + 2] = (noiseX * this.strength);
      }
    }
    this.geometry.attributes.position.needsUpdate = true;
    this.geometry.computeVertexNormals();
  };

  getRandomPostion = () => {
    const spatial = this.size * 0.85;
    return {
      x: (spatial / 2) - (Math.random() * spatial),
      y: (spatial / 2) - (Math.random() * spatial),
      z: 0
    };
    
  };

  checkPosition = (position, radius) => {
    if (this.treeSet.length < 0 ) return true;

    for (let i = 0; i < this.treeSet.length; i++) {
      let tree = this.treeSet[i].pos;
      let rds = (this.treeSet[i].radius * 2);

      let xf = position.x < (tree.x + rds) && position.x > (tree.x - rds);

      let yf = position.y < (tree.y + rds) && position.y > (tree.y - rds);

      // console.log(position.x, tree.x, xf);
      // console.log(position.y, tree.y, yf);
      // console.log('-----------------');
      if(xf && yf) { 
        console.log('false');
        return false;
      } 
    }
    return true;
  };

  makeTrees = (amount) => {
    for(let i = 0; i < amount; i ++) {
      let position;
      let check = false;
      const height = 2.5 + Math.random() * 4.5;
      const radius = 0.5 + Math.random() * 1.0;

      while(!check) {
        position = this.getRandomPostion();
        check = this.checkPosition(position, radius);
      }

      const tree_material = new THREE.MeshPhongMaterial({ 
        color: 0x00aa33,
        dithering: true,
        flatShading: true
      });
      const base_material = new THREE.MeshPhongMaterial({ 
        color: 0x5d2700,
        dithering: true,
        flatShading: true
      });

      const treeObject = new THREE.Object3D();
      const tree_geometry = new THREE.ConeBufferGeometry(radius, height, 5);
      const base_geometry = new THREE.CylinderGeometry( radius / 4, radius / 4, 3, 6 );

      const tree = new THREE.Mesh( tree_geometry, tree_material );
      const base = new THREE.Mesh( base_geometry, base_material );

      tree.position.set(0, (height/2.15) + 1, 0);
      tree.receiveShadow = true;
      tree.castShadow = true;
  
      base.position.set(0, 0, 0);
      base.receiveShadow = true;
      base.castShadow = true;

      treeObject.add(tree);
      treeObject.add(base);

      const noiseX = this.generator.simplex3(
        Math.abs(position.x / this.size) * this.iteration,
        Math.abs(position.y / this.size) * this.iteration,
        this.frames,
      );

      treeObject.position.set( position.x, (noiseX * this.strength), position.y );

      this.quickvr.scene.add(treeObject);
      this.treeSet.push({
        pos: {
          x: position.x,
          y: position.y,
          z: (noiseX * this.strength) 
        },
        radius: radius,
        tree: base
      });
    }
  };

  moveLight = () => {
    const x = 9 * Math.sin(this.frames * Math.PI / 180);
    const y = 11 * Math.cos(this.frames * Math.PI / 180);
    this.sun.position.set( 2 + x, 20, 2 + y);
    this.spotLight.position.set( 2 + x, 20, 2 + y);
    this.spotLight.lookAt(0, 0, 0);
  };

  renderLoop = () => {
    THREE.VRController.update();
    this.frames += 0.1;
    this.moveLight();
    // this.groundNoise();
    window.requestAnimationFrame(this.renderLoop);
  };
}
