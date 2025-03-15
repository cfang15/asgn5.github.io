import * as THREE from 'https://unpkg.com/three@0.157.0/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three@0.157.0/examples/jsm/controls/OrbitControls.js';
import { OBJLoader } from 'https://unpkg.com/three@0.157.0/examples/jsm/loaders/OBJLoader.js';

// Scene Setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

// Orbit Controls
const controls = new OrbitControls(camera, renderer.domElement);

// Floor for Shadows
const floorGeometry = new THREE.PlaneGeometry(50, 50);
const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x808080, side: THREE.DoubleSide });
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);

// Lighting
const ambientLight = new THREE.AmbientLight(0x404040);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight.position.set(10, 15, 10);
directionalLight.castShadow = true;
scene.add(directionalLight);

const spotLight = new THREE.SpotLight(0xffffff, 1);
spotLight.position.set(5, 15, 5);
spotLight.castShadow = true;
scene.add(spotLight);

const hemisphereLight = new THREE.HemisphereLight(0x4040ff, 0x00ff00, 0.6);
scene.add(hemisphereLight);

// Skybox (Procedural)
const skyGeometry = new THREE.SphereGeometry(500, 60, 40);
const skyMaterial = new THREE.MeshBasicMaterial({ color: 0x87CEEB, side: THREE.BackSide });
const sky = new THREE.Mesh(skyGeometry, skyMaterial);
scene.add(sky);
// Textured Cube
const textureLoader = new THREE.TextureLoader();
const texture = textureLoader.load('resources/textures/wood.jpg');
const texturedCube = new THREE.Mesh(
    new THREE.BoxGeometry(),
    new THREE.MeshStandardMaterial({ map: texture })
);
texturedCube.position.set(2, 1, -3);
texturedCube.castShadow = true;
scene.add(texturedCube);
// Custom 3D Model (.OBJ)
const objLoader = new OBJLoader();
objLoader.load('/resources/model.obj', (object) => {
    object.traverse((child) => {
        if (child.isMesh) {
            child.material = new THREE.MeshStandardMaterial({ color: 0xff0000 });
            child.castShadow = true;
        }
    });
    object.position.set(0, 1, 0);
    scene.add(object);
});

// Adding 20 Shapes with Various Features
const geometryTypes = [
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.SphereGeometry(0.5, 32, 32),
    new THREE.CylinderGeometry(0.5, 0.5, 1, 32)
];

const objects = [];

for (let i = 0; i < 20; i++) {
    const geometry = geometryTypes[i % 3];
    const material = new THREE.MeshStandardMaterial({
        color: Math.random() * 0xffffff
    });

    const shape = new THREE.Mesh(geometry, material);
    shape.position.set(
        (Math.random() - 0.5) * 20,
        Math.random() * 5,
        (Math.random() - 0.5) * 20
    );

    shape.castShadow = true;

    // Animate one of the objects
    if (i === 0) {
        function animateCube() {
            shape.rotation.x += 0.01;
            shape.rotation.y += 0.01;
        }
        shape.animate = animateCube;
    }

    objects.push(shape); // Add to array for picking
    scene.add(shape);
}
// Billboards (Always Facing Camera)
const billboardTexture = textureLoader.load('resources/textures/billboard.png');
const billboardMaterial = new THREE.SpriteMaterial({ map: billboardTexture });

for (let i = 0; i < 5; i++) {
    const billboard = new THREE.Sprite(billboardMaterial);
    billboard.position.set(Math.random() * 10 - 5, 2, Math.random() * 10 - 5);
    billboard.scale.set(2, 2, 1);
    scene.add(billboard);
}
// Camera Position
camera.position.set(0, 5, 10);

// Raycaster for Picking
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let selectedObject = null;

// Picking Event Listener
window.addEventListener('click', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(objects);

    if (intersects.length > 0) {
        // Reset previous selection color
        if (selectedObject) {
            selectedObject.material.emissive.setHex(selectedObject.currentHex);
        }

        // Highlight the new selection
        selectedObject = intersects[0].object;
        selectedObject.currentHex = selectedObject.material.color.getHex(); // Save original color
        selectedObject.material.emissive = new THREE.Color(0xff0000); // Highlight color
    }
});

// Animation Loop
function animate() {
    requestAnimationFrame(animate);

    // Animate the spinning object
    scene.traverse((object) => {
        if (object.animate) object.animate();
    });

    controls.update();
    renderer.render(scene, camera);
}

animate();

// Resize Handling
window.addEventListener('resize', () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
});
