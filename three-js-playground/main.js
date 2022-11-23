import "./style.css";
import * as THREE from "three";
import { createNoise3D } from "https://cdn.skypack.dev/simplex-noise@4.0.0";

const noise3d = createNoise3D();

//scene
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);


//render
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);


//camera
window.addEventListener("resize", function () {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  console.log('resize')
});

camera.position.z = 400;


const distance = Math.min(200, window.innerWidth / 4);


//geometry
const geometry = new THREE.BufferGeometry();

const particlesNumber = 6000;
const vertices = new Float32Array(particlesNumber * 3);

geometry.setAttribute(
  "position",
  new THREE.Float32BufferAttribute(vertices, 3)
);

//base position to updating position later
geometry.setAttribute(
  "basePosition",
  new THREE.BufferAttribute().copy(geometry.attributes.position)
);

const particles = new THREE.Points(
  geometry,
  new THREE.PointsMaterial({ color: 0xff44ff, size: 1 })
);

particles.boundingSphere = 50;

let p = particles.geometry.getAttribute("basePosition");
let index, x, y, z;
x = y = z = index = 0;

for (let i = 0; i < particlesNumber; i++) {
  const theta = THREE.MathUtils.randFloatSpread(360);
  const phi = THREE.MathUtils.randFloatSpread(360);

  x = distance * Math.sin(theta) * Math.cos(phi);
  y = distance * Math.sin(theta) * Math.sin(phi);
  z = distance * Math.cos(theta);

  p.setXYZ(i, x, y, z);
}
const blop = new THREE.Group();
blop.add(particles)
scene.add(blop);


//end geometry

//update particles positiones

const makeBlop = function () {
  const time = performance.now() * 0.5;
  const basePositionAttribute = particles.geometry.getAttribute("basePosition");
  const positionAttribute = particles.geometry.getAttribute("position");
  const vertex = new THREE.Vector3();

  for (var i = 0; i < particlesNumber; i++) {
    vertex.fromBufferAttribute(basePositionAttribute, i);

    let noise = noise3d(
      vertex.x * 0.003 + time * 0.0002,
      vertex.y * 0.003 + time * 0.0003,
      vertex.z * 0.003
    );

    let ratio = noise * 0.4 * (0.8 + 0.1) + 0.8;
    vertex.multiplyScalar(ratio);

    positionAttribute.setXYZ(i, vertex.x, vertex.y, vertex.z);
  }
  particles.geometry.attributes.position.needsUpdate = true;
  particles.geometry.computeBoundingSphere();
};

//raycaster

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

function onPointerMove( event ) {

	// calculate pointer position in normalized device coordinates
	// (-1 to +1) for both components

	pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

}

const findObject = () => {

  raycaster.setFromCamera( pointer, camera );

	// calculate objects intersecting the picking ray
	const intersects = raycaster.intersectObjects( scene.children );
  if(intersects.length === 0) {
    particles.material.color.setHex( 0xff44ff )
  } else {
	for ( let i = 0; i < intersects.length; i ++ ) {

		intersects[ i ].object.material.color.set( 0xff0000 );

	}}
}


const animate = function () {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
  makeBlop();
  findObject();
  particles.rotation.x += 0.003;
  particles.rotation.y += 0.003;
};
window.addEventListener( 'pointermove', onPointerMove );

animate();
