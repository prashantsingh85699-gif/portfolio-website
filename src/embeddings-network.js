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
  camera.position.set(0, -180, 220); // Sit tilted looking down at grid floor

  // Renderer with alpha/transparent background
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  // Plane Geometry representing our blueprint grid layout
  const gridSegments = 36;
  const gridWidth = 750;
  const gridHeight = 750;
  const geometry = new THREE.PlaneGeometry(gridWidth, gridHeight, gridSegments, gridSegments);

  // Store initial vertex coordinates to compute wave offsets
  const positionAttr = geometry.attributes.position;
  const initialPositions = new Float32Array(positionAttr.count * 3);
  for (let i = 0; i < positionAttr.count; i++) {
    initialPositions[i * 3] = positionAttr.getX(i);
    initialPositions[i * 3 + 1] = positionAttr.getY(i);
    initialPositions[i * 3 + 2] = positionAttr.getZ(i);
  }

  // Wireframe material - clean Cobalt Blue gridlines
  const material = new THREE.MeshBasicMaterial({
    color: 0x2563eb,
    wireframe: true,
    transparent: true,
    opacity: 0.12,
    blending: THREE.NormalBlending
  });

  const gridMesh = new THREE.Mesh(geometry, material);
  gridMesh.rotation.x = -Math.PI * 0.18; // Tilt plane slightly towards camera
  scene.add(gridMesh);

  // Interaction variables
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2(-9999, -9999); // Start far away
  const mouseTarget = new THREE.Vector2(-9999, -9999);
  const localIntersectPoint = new THREE.Vector3();
  let hasIntersected = false;

  // Track window size
  const windowHalfX = window.innerWidth / 2;
  const windowHalfY = window.innerHeight / 2;

  // Capture mouse positions normalized between -1 and 1
  window.addEventListener('mousemove', (event) => {
    mouseTarget.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouseTarget.y = -(event.clientY / window.innerHeight) * 2 + 1;
  });

  // Track scroll for pausing renderer when out of hero fold
  let scrollY = 0;
  let isVisible = true;
  window.addEventListener('scroll', () => {
    scrollY = window.scrollY;
    // Pause rendering if user scrolls past hero section height (approx 100vh)
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

    if (!isVisible) return; // Skip calculation and draw frames if out of viewport

    const time = clock.getElapsedTime() * 0.6;

    // Smoothly interpolate mouse coordinates for organic trailing ripple
    mouse.x += (mouseTarget.x - mouse.x) * 0.08;
    mouse.y += (mouseTarget.y - mouse.y) * 0.08;

    // Project raycaster on grid plane
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

    // Deformation & Wave math
    for (let i = 0; i < count; i++) {
      const idx = i * 3;
      const initX = initialPositions[idx];
      const initY = initialPositions[idx + 1];

      // 1. Organic rolling wave height calculations
      let waveZ = Math.sin(initX * 0.015 + time) * Math.cos(initY * 0.015 + time) * 15;
      waveZ += Math.sin(initX * 0.005 - time * 0.5) * 8; // Double wave layering

      // 2. Mouse grid deformation (pulls mesh nodes down/up near cursor)
      if (hasIntersected) {
        // Calculate distance from grid vertex to intersection point in 3D space
        const dx = posArray[idx] - localIntersectPoint.x;
        const dy = posArray[idx + 1] - localIntersectPoint.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        const rippleRadius = 140;
        if (dist < rippleRadius) {
          // Inverse bell curve for smooth indentation displacement
          const force = Math.pow(1 - dist / rippleRadius, 2);
          waveZ -= force * 40; // Push mesh down by max 40px under mouse
        }
      }

      posArray[idx + 2] = waveZ;
    }

    positionAttr.needsUpdate = true;

    // Gentle camera parallax movement
    camera.position.x += (mouse.x * 30 - camera.position.x) * 0.04;
    camera.lookAt(scene.position);

    renderer.render(scene, camera);
  };

  animate();

  // Teardown API for SPA lifecycle hygiene
  return () => {
    cancelAnimationFrame(animationFrameId);
    window.removeEventListener('resize', onWindowResize);
    renderer.dispose();
  };
}
