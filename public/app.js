//

import * as THREE from './three.module.js';
import { OrbitControls } from './OrbitControls.js';
import { DragControls } from './DragControls.js';
import Stats from './stats.module.js';

let light;

let lastPlacement;

let scale = 1.0;

let fetchSolutions = await fetch('shared/rendering.json');
let rendering = await fetchSolutions.json();
let totalSolutions = rendering['solutions'].length;
console.log("foo", totalSolutions);

let containerBin = rendering['container'];

let binOffsetBump = (scale * containerBin["dimensions"][0]) + (scale * 2.0);
let solOffsetBump = (scale * containerBin["dimensions"][2]) + (scale * 33.0);

console.log("bar", containerBin, binOffsetBump, solOffsetBump);

let currentSolution = 0;
let currentBin = 0;

let objects = [];
let colors = {};

let container, stats;
let camera, scene, raycaster, renderer, justTheBins, justTheBoxes;
let controls;

let dashedLine = new THREE.LineDashedMaterial( { opacity: 0.33, transparent: true, color: 0xffaa00, dashSize: 3, gapSize: 1 } );

const mouse = new THREE.Vector2();

let dragControls, group;
let enableSelection = false;
let enableDrag = false;
let binOffset = 0.0;
let solOffset = 0.0;
let lag = 750000.0;

let INTERSECTED;
let start;
let theta = 0;
let decay = 0;
let currentPlacement = 0;

const pointer = new THREE.Vector2();
const radius = 100;

function box( width, height, depth ) {
  width = width * 0.5,
  height = height * 0.5,
  depth = depth * 0.5;

  const geometry = new THREE.BufferGeometry();
  const position = [];

  position.push(
    - width, - height, - depth,
    - width, height, - depth,

    - width, height, - depth,
    width, height, - depth,

    width, height, - depth,
    width, - height, - depth,

    width, - height, - depth,
    - width, - height, - depth,

    - width, - height, depth,
    - width, height, depth,

    - width, height, depth,
    width, height, depth,

    width, height, depth,
    width, - height, depth,

    width, - height, depth,
    - width, - height, depth,

    - width, - height, - depth,
    - width, - height, depth,

    - width, height, - depth,
    - width, height, depth,

    width, height, - depth,
    width, height, depth,

    width, - height, - depth,
    width, - height, depth
   );

  geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( position, 3 ) );

  return geometry;
}

const geometryBox = box(containerBin["dimensions"][0], containerBin["dimensions"][1], containerBin["dimensions"][2]);

function nextSolution() {
  if (currentSolution < totalSolutions) {
    solOffset += solOffsetBump;

    currentBin = 0;
    binOffset = 0.0;

    let thisSolution = rendering['solutions'][currentSolution];

    let totalBins = thisSolution['packings'].length;
    return totalBins;
  }
}

function resetScene() {
  let object;
  while (object = objects.pop()) {
    scene.remove(object);
  }
}

function placements(i) {
  let thisSolution = rendering['solutions'][currentSolution];
  if (typeof(thisSolution) === 'undefined') {
    debugger;
  }

  let thisBinPack = thisSolution['packings'][currentBin];
  if (typeof(thisBinPack) === 'undefined') {
    debugger;
  }

  let innerPlacements = thisBinPack['placements'];
  return innerPlacements[i];
}

function placeBin() {
  currentPlacement = 0;

  const lineSegments = new THREE.LineSegments(geometryBox, dashedLine);
  lineSegments.position.x = binOffset + (scale * containerBin['dimensions'][0] * 0.5);
  lineSegments.position.y = 0 + (scale * containerBin['dimensions'][1] * 0.5);
  lineSegments.position.z = solOffset + (scale * containerBin['dimensions'][2] * 0.5);

  lineSegments.computeLineDistances();
  justTheBins.add(lineSegments);
}

function nextBin(totalBins) {
  if (currentBin < totalBins) {
    binOffset += binOffsetBump;

    placeBin();

    let thisSolution = rendering['solutions'][currentSolution];
    if (typeof(thisSolution) === 'undefined') {
      debugger;
    }

    let thisBinPack = thisSolution['packings'][currentBin];
    if (typeof(thisBinPack) === 'undefined') {
      debugger;
    }

    let innerPlacements = thisBinPack['placements'];

    return innerPlacements.length;
  }
}

function nextPlacement(totalPlacements) {
  if (currentPlacement < totalPlacements) {
    let placement = placements(currentPlacement);
    let dimensions = placement['dimensions'];
    let position = placement['position'];
    let index = placement['index'];

    let a,b,c;
    if (
      containerBin['dimensions'][0] > containerBin['dimensions'][1] && containerBin['dimensions'][0] > containerBin['dimensions'][2]
      ) {
      //if xLarge
      //  [0, 1, 2]
      a = 0;
      b = 1;
      c = 2;
    } else if (
      containerBin['dimensions'][1] > containerBin['dimensions'][0] && containerBin['dimensions'][0] > containerBin['dimensions'][2]
    ) {
      //if yLarge
      //  [2, 0, 1]
      a = 2;
      b = 0;
      c = 1;
    } else {
      //if zLarge
      //  [2, 1, 0]
      a = 2;
      b = 1;
      c = 0;
    }

    let geometry = new THREE.BoxGeometry(scale * dimensions[a] * 1.0, scale * dimensions[b] * 1.0, scale * dimensions[c] * 1.0, 1, 1, 1);

    if (!colors[index]) {
      colors[index] = new THREE.MeshLambertMaterial( { opacity: 1.0, transparent: false, color: Math.random() * 0xffffff } );
    }

    const box = new THREE.Mesh(geometry, colors[index]);

    //object.castShadow = true;
    //object.receiveShadow = true;

    box.position.x = (scale * position[a] + (scale * dimensions[a] * 0.5)) + binOffset;
    box.position.y = (scale * position[b] + (scale * dimensions[b] * 0.5));
    box.position.z = (scale * position[c] + (scale * dimensions[c] * 0.5)) + solOffset;

    objects.push(box);
    lastPlacement = box;

    justTheBoxes.add(box);

    return true;
  }
}

function onKeyDown( event ) {
  enableDrag = (event.keyCode === 17) ? true : enableDrag;
  enableSelection = ( event.keyCode === 16 ) ? true : false;
}

function onKeyUp(event) {
  enableDrag = (event.keyCode === 17) ? false : enableDrag;
  enableSelection = ( event.keyCode === 16 ) ? false : enableSelection;
}

function init() {
  container = document.createElement( 'div' );
  document.body.appendChild( container );

  camera = new THREE.PerspectiveCamera(66, window.innerWidth / window.innerHeight, 1, 10000);

  scene = new THREE.Scene();
  scene.position.x = 0;
  scene.position.y = 0;
  scene.position.z = 0;

  justTheBins = new THREE.Object3D();
  scene.add(justTheBins);

  justTheBoxes = new THREE.Object3D();
  scene.add(justTheBoxes);

  camera.position.set(0 + (scale * 333), 0 + (scale * 444), ((scale * 555)));
  camera.lookAt( scene.position );
  lastPlacement = scene;

  camera.updateMatrixWorld();

  scene.background = new THREE.Color( 0xf0f0f0 );

  const ambient = new THREE.AmbientLight( 0xffffff , 0.5);
  scene.add( ambient );

  light = new THREE.DirectionalLight( 0xffffff, 1.0);

  scene.add(light);

  group = new THREE.Group();
  scene.add(group);

  raycaster = new THREE.Raycaster();

  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );

  //renderer.shadowMap.enabled = true
  //renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  container.appendChild( renderer.domElement );

  controls = new OrbitControls( camera, renderer.domElement );
  controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
  controls.autoRotate = false;
  controls.dampingFactor = 0.075;
  controls.screenSpacePanning = false;
  controls.minDistance = 1;
  controls.maxDistance = 10000;
  controls.enablePan = true;

  window.addEventListener('resize', onWindowResize );
}

function onClick( event ) {
  if (!enableDrag) {
    return true;
  }

  event.preventDefault();

  if ( enableSelection === true ) {

    const draggableObjects = dragControls.getObjects();
    draggableObjects.length = 0;

    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

    raycaster.setFromCamera( mouse, camera );

    const intersections = raycaster.intersectObjects( objects, true );

    if ( intersections.length > 0 ) {

      const object = intersections[ 0 ].object;

      if ( group.children.includes( object ) === true ) {

        object.material.emissive.set( 0x000000 );
        scene.attach( object );

      } else {

        object.material.emissive.set( 0xaaaaaa );
        group.attach( object );

      }

      dragControls.transformGroup = true;
      draggableObjects.push( group );
    }

    if ( group.children.length === 0 ) {
      dragControls.transformGroup = false;
      draggableObjects.push( ...objects );
    }
  }

  render();
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
}

function onPointerMove( event ) {
  pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
  pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
}

function animate(timestamp) {
  requestAnimationFrame( animate );

  controls.update(); // only required if controls.enableDamping = true, or if controls.autoRotate = true

  //let vector = camera.position.clone(); //Get camera position and put into variable
  //vector.applyMatrix4( camera.matrixWorld ); //Hold the camera location in matrix world
  //light.position.set( vector.x, vector.y, vector.z);

  render();
}

function render() {
  renderer.render( scene, camera );
}

function all() {
  let totalBins;
  let totalPlacements;
  let nextBox;

  while(totalBins = nextSolution()) {
    while(totalPlacements = nextBin(totalBins)) {
      while(nextPlacement(totalPlacements)) {
        currentPlacement++;
      }
      currentBin++;
    }
    currentSolution++;
  }
}

export default {
  App: function() {
    init();
    all();
    requestAnimationFrame( animate );
  }
}
