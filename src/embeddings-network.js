import * as THREE from 'three';

export function initEmbeddingsNetwork() {
  const container = document.getElementById('embeddings-canvas-container');
  if (!container) return;

  const scene = new THREE.Scene();
  
  let width = container.clientWidth;
  let height = container.clientHeight;
  const camera = new THREE.PerspectiveCamera(45, width / height, 1, 1000);
  camera.position.set(0, -220, 240); // Tilted perspective camera looking down

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  // Silk mesh geometry with fine segments
  const gridSegments = 44;
  const gridWidth = 800;
  const gridHeight = 800;
  const geometry = new THREE.PlaneGeometry(gridWidth, gridHeight, gridSegments, gridSegments);

  const positionAttr = geometry.attributes.position;
  const initialPositions = new Float32Array(positionAttr.count * 3);
  for (let i = 0; i < positionAttr.count; i++) {
    initialPositions[i * 3] = positionAttr.getX(i);
    initialPositions[i * 3 + 1] = positionAttr.getY(i);
    initialPositions[i * 3 + 2] = positionAttr.getZ(i);
  }

  // Elegant dark olive organic wireframe mesh
  const material = new THREE.MeshBasicMaterial({
    color: 0x3c4e3b, // Dark Olive Green
    wireframe: true,
    transparent: true,
    opacity: 0.07, // Ultra subtle for a premium clean paper look
    blending: THREE.NormalBlending
  });

  const gridMesh = new THREE.Mesh(geometry, material);
  gridMesh.rotation.x = -Math.PI * 0.2; // Tilted angle
  scene.add(gridMesh);

  // Mouse interaction setup
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2(-9999, -9999);
  const mouseTarget = new THREE.Vector2(-9999, -9999);
  const localIntersectPoint = new THREE.Vector3();
  let hasIntersected = false;

  window.addEventListener('mousemove', (event) => {
    mouseTarget.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouseTarget.y = -(event.clientY / window.innerHeight) * 2 + 1;
  });

  let scrollY = 0;
  let isVisible = true;
  window.addEventListener('scroll', () => {
    scrollY = window.scrollY;
    isVisible = scrollY < window.innerHeight;
  });

  function onWindowResize() {
    if (!container) return;
    width = container.clientWidth;
    height = container.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  }
  window.addEventListener('resize', onWindowResize);

  let clock = new THREE.Clock();
  let animationFrameId;

  const animate = () => {
    animationFrameId = requestAnimationFrame(animate);

    if (!isVisible) return;

    const time = clock.getElapsedTime() * 0.45; // Gentle wind speed

    mouse.x += (mouseTarget.x - mouse.x) * 0.06;
    mouse.y += (mouseTarget.y - mouse.y) * 0.06;

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

    for (let i = 0; i < count; i++) {
      const idx = i * 3;
      const initX = initialPositions[idx];
      const initY = initialPositions[idx + 1];

      // 1. Organic wind ripple equations
      let waveZ = Math.sin(initX * 0.012 + time) * Math.cos(initY * 0.01 + time * 0.6) * 18;
      waveZ += Math.sin(initY * 0.004 - time * 0.3) * 10;

      // 2. Localized cursor fabric swell
      if (hasIntersected) {
        const dx = posArray[idx] - localIntersectPoint.x;
        const dy = posArray[idx + 1] - localIntersectPoint.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        const swellRadius = 160;
        if (dist < swellRadius) {
          // Smooth bell curve swell (fabric bulge)
          const force = Math.pow(1 - dist / swellRadius, 2);
          waveZ += force * 35; 
        }
      }

      posArray[idx + 2] = waveZ;
    }

    positionAttr.needsUpdate = true;

    // Smooth camera lag
    camera.position.x += (mouse.x * 20 - camera.position.x) * 0.03;
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
