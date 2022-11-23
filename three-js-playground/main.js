import "./style.css";
import * as THREE from "three";
import { createNoise3D } from "https://cdn.skypack.dev/simplex-noise@4.0.0";

const noise3d = createNoise3D();



const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

window.addEventListener("resize", function () {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innderWidth, window.innerHeight);
});



const particlesNumber = 6000;
const distance = Math.min(200, window.innerWidth / 4);
const geometry = new THREE.BufferGeometry();

const vertices = new Float32Array(particlesNumber * 3);

geometry.setAttribute(
  "position",
  new THREE.Float32BufferAttribute(vertices, 3)
);
geometry.setAttribute(
  "basePosition", 
  new THREE.BufferAttribute().copy(geometry.attributes.position));

const particles = new THREE.Points(
  geometry,
  new THREE.PointsMaterial({ color: 0xff44ff, size: 1 })
);

particles.boundingSphere = 50;

let p = particles.geometry.getAttribute('basePosition');
let index, x, y, z;
x = y = z = index = 0;


console.log(particles.geometry.getAttribute('basePosition'));


  for (let i = 0; i < particlesNumber; i++) {
    const theta = THREE.MathUtils.randFloatSpread(360);
    const phi = THREE.MathUtils.randFloatSpread(360);

    x = distance * Math.sin(theta) * Math.cos(phi);
    y = distance * Math.sin(theta) * Math.sin(phi);
    z = distance * Math.cos(theta);

    p.setXYZ(i, x, y, z)

    particles.geometry.attributes.position.needsUpdate = true;
  }


const renderingParent = new THREE.Group();
renderingParent.add(particles);

const resizeContainer = new THREE.Group();
resizeContainer.add(renderingParent);
scene.add(resizeContainer);

camera.position.z = 400;

const update = function () {
  const time = performance.now() *0.5;
  const basePositionAttribute = particles.geometry.getAttribute("basePosition");
  const positionAttribute = particles.geometry.getAttribute('position');
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
  // geometry.computeVertexNormals();
  particles.geometry.attributes.position.needsUpdate = true;
  particles.geometry.computeBoundingSphere();
  //console.log('myk')
};

const animate = function () {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
  update();
  resizeContainer.rotation.x += 0.001;
  resizeContainer.rotation.y += 0.001;

};

animate();
