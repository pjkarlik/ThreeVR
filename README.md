![travis ci build](https://travis-ci.org/pjkarlik/DepthCycle.svg?branch=master)

![ThreeVR](./splash3d.png)

![babel](https://img.shields.io/badge/three--quickvr-1.2.0-green.svg?style=flat-square)
![webpack](https://img.shields.io/badge/webpack-3.6.0-51b1c5.svg?style=flat-square)
![threejs](https://img.shields.io/badge/threejs-0.96.0-c55197.svg?style=flat-square)

# ThreeVR

  Current experiments using [three-quickvr](https://github.com/halvves/three-quickvr) Boilerplate and Three.js. Testing some 3DoF interfaces and examples. Looking to play around with user interactions basically. Really good with iOS/Cardboard for some fun quick VR testing. Building some small apps and wanted a playground to get my feet wet.

 ## ALSO
  Amazing stuff from and help found digging into [THREE.VRController](https://github.com/stewdio/THREE.VRController) and [dat.guiVR](https://github.com/dataarts/dat.guiVR)

  The apps entry point is the index file which points to one of the other JS files containing ```Render``` classes. Example and default is ```index.js``` points to => ```Cartridge/index.js``` where all the Magic should happen..

## Run the example
  Requires Node v7.0.0 or greater


```bash
$ yarn install
$ yarn dev & open http://localhost:2020
```

## License

[MIT]
