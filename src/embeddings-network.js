import * as THREE from 'three';

export function initEmbeddingsNetwork() {
  const container = document.getElementById('embeddings-canvas-container');
  if (!container) return;

  // Scene setup
  const scene = new THREE.Scene();
  
  // Camera
  let width = container.clientWidth;
  let height = container.clientHeight;
  const camera = new THREE.PerspectiveCamera(50, width / height, 1, 1000);
  camera.position.set(0, -190, 210); // Look down at the grid floor

  // Renderer with transparent background
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  // Plane Geometry representing a high-density scanning matrix grid
  const gridSegments = 40; // Increased density for a cooler cyber look
  const gridWidth = 850;
  const gridHeight = 850;
  const geometry = new THREE.PlaneGeometry(gridWidth, gridHeight, gridSegments, gridSegments);

  // Store initial vertex coordinates to compute wave offsets
  const positionAttr = geometry.attributes.position;
  const initialPositions = new Float32Array(positionAttr.count * 3);
  for (let i = 0; i < positionAttr.count; i++) {
    initialPositions[i * 3] = positionAttr.getX(i);
    initialPositions[i * 3 + 1] = positionAttr.getY(i);
    initialPositions[i * 3 + 2] = positionAttr.getZ(i);
  }

  // Glowing Cyan wireframe material
  const material = new THREE.MeshBasicMaterial({
    color: 0x00f0ff, // Electric Cyan
    wireframe: true,
    transparent: true,
    opacity: 0.16,
    blending: THREE.AdditiveBlending // Glow composite additive blending
  });

  const gridMesh = new THREE.Mesh(geometry, material);
  gridMesh.rotation.x = -Math.PI * 0.18; // Tilted floor plane
  scene.add(gridMesh);

  // Interaction variables
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2(-9999, -9999);
  const mouseTarget = new THREE.Vector2(-9999, -9999);
  const localIntersectPoint = new THREE.Vector3();
  let hasIntersected = false;

  window.addEventListener('mousemove', (event) => {
    mouseTarget.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouseTarget.y = -(event.clientY / window.innerHeight) * 2 + 1;
  });

  // Track scroll for lifecycle performance
  let scrollY = 0;
  let isVisible = true;
  window.addEventListener('scroll', () => {
    scrollY = window.scrollY;
    isVisible = scrollY < window.innerHeight;
  });

  // Handle Resize
  function onWindowResize() {
    if (!container) return;
    width = container.clientWidth;
    height = container.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  }
  window.addEventListener('resize', onWindowResize);

  // Animation Loop
  let clock = new THREE.Clock();
  let animationFrameId;

  const animate = () => {
    animationFrameId = requestAnimationFrame(animate);

    if (!isVisible) return; // Skip logic when hero is out of view

    const time = clock.getElapsedTime() * 0.55;

    // Interpolate mouse coordinates smoothly for trailing lag
    mouse.x += (mouseTarget.x - mouse.x) * 0.08;
    mouse.y += (mouseTarget.y - mouse.y) * 0.08;

    // Raycast on the mesh grid
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(gridMesh);

    if (intersects.length > 0) {
      localIntersectPoint.copy(intersects[0].point);
      hasIntersected = true;
    } else {
      hasIntersected = false;
    }

    const posArray = positionAttr.array;
    const count = positionAttr.count;

    // Wave and displacement logic
    for (let i = 0; i < count; i++) {
      const idx = i * 3;
      const initX = initialPositions[idx];
      const initY = initialPositions[idx + 1];

      // 1. Double wave layering for digital cyber waves
      let waveZ = Math.sin(initX * 0.016 + time) * Math.cos(initY * 0.016 + time) * 16;
      waveZ += Math.sin(initX * 0.006 - time * 0.6) * 9;

      // 2. Mouse displacement (bulges grid points upward near cursor)
      if (hasIntersected) {
        const dx = posArray[idx] - localIntersectPoint.x;
        const dy = posArray[idx + 1] - localIntersectPoint.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        const rippleRadius = 150;
        if (dist < rippleRadius) {
          const force = Math.pow(1 - dist / rippleRadius, 2.5);
          waveZ += force * 50; // Push vertices UPWARD by 50px for a holographic scan hill
        }
      }

      posArray[idx + 2] = waveZ;
    }

    positionAttr.needsUpdate = true;

    // Camera movement matches the mouse slightly
    camera.position.x += (mouse.x * 25 - camera.position.x) * 0.04;
    camera.lookAt(scene.position);

    renderer.render(scene, camera);
  };

  animate();

  return () => {
    cancelAnimationFrame(animationFrameId);
    window.removeEventListener('resize', onWindowResize);
    renderer.dispose();
  };
}
