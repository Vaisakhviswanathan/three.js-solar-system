import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { Pane } from "tweakpane";

// Pane for speed control
const pane = new Pane();
const params = {
  speed: 1.0,
};
pane.addBinding(params, 'speed', {
  min: 0,
  max: 5,
  step: 0.1,
  label: 'System Speed'
});

// Scene
const scene = new THREE.Scene();

// Textures
const textureLoader = new THREE.TextureLoader();
const cubeTextureLoader = new THREE.CubeTextureLoader();
cubeTextureLoader.setPath('/planets/cubeMap/');

const backgroundCubemap = cubeTextureLoader.load([
  'px.png', 'nx.png',
  'py.png', 'ny.png',
  'pz.png', 'nz.png'
]);
scene.background = backgroundCubemap;

const sunTexture = textureLoader.load("/planets/sun.jpg");
sunTexture.colorSpace = THREE.SRGBColorSpace;
const mercuryTexture = textureLoader.load("/planets/mercury.jpg");
mercuryTexture.colorSpace = THREE.SRGBColorSpace;
const venusTexture = textureLoader.load("/planets/venus_surface.jpg");
venusTexture.colorSpace = THREE.SRGBColorSpace;
const earthTexture = textureLoader.load("/planets/earth_daymap.jpg");
earthTexture.colorSpace = THREE.SRGBColorSpace;
const marsTexture = textureLoader.load("/planets/mars.jpg");
marsTexture.colorSpace = THREE.SRGBColorSpace;
const moonTexture = textureLoader.load("/planets/moon.jpg");
moonTexture.colorSpace = THREE.SRGBColorSpace;

// Materials
const mercuryMaterial = new THREE.MeshStandardMaterial({ map: mercuryTexture });
const venusMaterial = new THREE.MeshStandardMaterial({ map: venusTexture });
const earthMaterial = new THREE.MeshStandardMaterial({ map: earthTexture });
const marsMaterial = new THREE.MeshStandardMaterial({ map: marsTexture });
const moonMaterial = new THREE.MeshStandardMaterial({ map: moonTexture });

// Sun
const sphereGeometry = new THREE.SphereGeometry(1, 32, 32);
const sunMaterial = new THREE.MeshBasicMaterial({ map: sunTexture });
const sun = new THREE.Mesh(sphereGeometry, sunMaterial);
sun.scale.setScalar(5);
scene.add(sun);

// Planets and moons
const planets = [
  {
    name: "Mercury", radius: 0.5, distance: 10, speed: 0.01, material: mercuryMaterial, moons: []
  },
  {
    name: "Venus", radius: 0.8, distance: 15, speed: 0.007, material: venusMaterial, moons: []
  },
  {
    name: "Earth", radius: 1, distance: 20, speed: 0.005, material: earthMaterial,
    moons: [{ name: "Moon", radius: 0.3, distance: 3, speed: 0.015 }]
  },
  {
    name: "Mars", radius: 0.7, distance: 25, speed: 0.003, material: marsMaterial,
    moons: [
      { name: "Phobos", radius: 0.1, distance: 2, speed: 0.02 },
      { name: "Deimos", radius: 0.2, distance: 3, speed: 0.015 }
    ]
  }
];

const createPlanet = (planet) => {
  const mesh = new THREE.Mesh(sphereGeometry, planet.material);
  mesh.scale.setScalar(planet.radius);
  mesh.position.x = planet.distance;
  return mesh;
};

const createMoon = (moon) => {
  const mesh = new THREE.Mesh(sphereGeometry, moonMaterial);
  mesh.scale.setScalar(moon.radius);
  mesh.position.x = moon.distance;
  return mesh;
};

const planetMeshes = planets.map((planet) => {
  const mesh = createPlanet(planet);
  scene.add(mesh);

  planet.moons.forEach(moon => {
    const moonMesh = createMoon(moon);
    mesh.add(moonMesh);
  });

  return mesh;
});

// Lighting
scene.add(new THREE.AmbientLight(0xffffff, 0.3));
scene.add(new THREE.PointLight(0xffffff, 1000));

// Camera
const camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 400);
camera.position.set(0, 5, 100);

// Renderer
const canvas = document.querySelector("canvas.threejs");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.maxDistance = 200;
controls.minDistance = 20;

// Resize
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Animate
const renderloop = () => {
  planetMeshes.forEach((planetMesh, index) => {
    const planet = planets[index];
    planetMesh.rotation.y += planet.speed * params.speed;

    planetMesh.position.x = Math.sin(planetMesh.rotation.y) * planet.distance;
    planetMesh.position.z = Math.cos(planetMesh.rotation.y) * planet.distance;

    planetMesh.children.forEach((moonMesh, mIndex) => {
      const moon = planet.moons[mIndex];
      moonMesh.rotation.y += moon.speed * params.speed;
      moonMesh.position.x = Math.sin(moonMesh.rotation.y) * moon.distance;
      moonMesh.position.z = Math.cos(moonMesh.rotation.y) * moon.distance;
    });
  });

  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(renderloop);
};

renderloop();
