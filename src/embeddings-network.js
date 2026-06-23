import * as THREE from 'three';

export function initEmbeddingsNetwork() {
  const container = document.getElementById('embeddings-canvas-container');
  if (!container) return;

  // Scene setup
  const scene = new THREE.Scene();
  
  // Camera
  let width = container.clientWidth;
  let height = container.clientHeight;
  const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
  camera.position.z = 250;

  // Renderer - using alpha: true for a transparent background
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  // Particles Setup
  const particleCount = 75;
  const areaSize = 350; // Bounds in which nodes drift
  const maxDistance = 75; // Distance threshold for connections

  const particlesGeometry = new THREE.BufferGeometry();
  const particlePositions = new Float32Array(particleCount * 3);
  const particleVelocities = [];

  for (let i = 0; i < particleCount; i++) {
    // Distribute randomly in a cube space
    const x = (Math.random() - 0.5) * areaSize;
    const y = (Math.random() - 0.5) * areaSize;
    const z = (Math.random() - 0.5) * areaSize;
    
    particlePositions[i * 3] = x;
    particlePositions[i * 3 + 1] = y;
    particlePositions[i * 3 + 2] = z;

    // Soft velocity vectors for smooth organic floating
    particleVelocities.push({
      x: (Math.random() - 0.5) * 0.35,
      y: (Math.random() - 0.5) * 0.35,
      z: (Math.random() - 0.5) * 0.35
    });
  }

  particlesGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

  // Custom round texture for circular particles
  const canvas = document.createElement('canvas');
  canvas.width = 16;
  canvas.height = 16;
  const ctx = canvas.getContext('2d');
  ctx.beginPath();
  ctx.arc(8, 8, 4, 0, Math.PI * 2);
  ctx.fillStyle = '#2563eb'; // Cobalt blue matching design theme
  ctx.fill();
  const texture = new THREE.CanvasTexture(canvas);

  // Points material
  const particlesMaterial = new THREE.PointsMaterial({
    size: 7,
    map: texture,
    transparent: true,
    opacity: 0.6,
    depthWrite: false,
    blending: THREE.NormalBlending
  });

  const particleSystem = new THREE.Points(particlesGeometry, particlesMaterial);
  scene.add(particleSystem);

  // Lines setup for linkages between close nodes
  const linesGeometry = new THREE.BufferGeometry();
  const linesMaterial = new THREE.LineBasicMaterial({
    color: 0x2563eb,
    transparent: true,
    opacity: 0.12,
    blending: THREE.NormalBlending
  });
  
  const lineMesh = new THREE.LineSegments(linesGeometry, linesMaterial);
  scene.add(lineMesh);

  // Interaction vectors
  const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
  const windowHalfX = window.innerWidth / 2;
  const windowHalfY = window.innerHeight / 2;

  // Track mouse coordinates for camera parallax
  window.addEventListener('mousemove', (event) => {
    mouse.targetX = (event.clientX - windowHalfX) * 0.18;
    mouse.targetY = (event.clientY - windowHalfY) * 0.18;
  });

  // Track scroll position
  let scrollY = 0;
  window.addEventListener('scroll', () => {
    scrollY = window.scrollY;
  });

  // Resize Handler
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
  let animationFrameId;
  const animate = () => {
    animationFrameId = requestAnimationFrame(animate);

    // Smooth camera inertia
    mouse.x += (mouse.targetX - mouse.x) * 0.05;
    mouse.y += (mouse.targetY - mouse.y) * 0.05;

    camera.position.x += (mouse.x - camera.position.x) * 0.05;
    camera.position.y += (-mouse.y - camera.position.y) * 0.05;
    
    // Rotate scene slightly based on scroll position
    camera.rotation.y = scrollY * 0.0006;
    camera.lookAt(scene.position);

    const positions = particlesGeometry.attributes.position.array;
    const linePositions = [];

    // Update node positions and compute connections
    for (let i = 0; i < particleCount; i++) {
      const idx = i * 3;
      
      // Update drift position
      positions[idx] += particleVelocities[i].x;
      positions[idx + 1] += particleVelocities[i].y;
      positions[idx + 2] += particleVelocities[i].z;

      // Bounce boundaries
      if (Math.abs(positions[idx]) > areaSize / 2) particleVelocities[i].x *= -1;
      if (Math.abs(positions[idx + 1]) > areaSize / 2) particleVelocities[i].y *= -1;
      if (Math.abs(positions[idx + 2]) > areaSize / 2) particleVelocities[i].z *= -1;

      // Draw connection lines to close particles
      for (let j = i + 1; j < particleCount; j++) {
        const jdx = j * 3;
        
        const dx = positions[idx] - positions[jdx];
        const dy = positions[idx + 1] - positions[jdx + 1];
        const dz = positions[idx + 2] - positions[jdx + 2];
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

        if (dist < maxDistance) {
          linePositions.push(
            positions[idx], positions[idx + 1], positions[idx + 2],
            positions[jdx], positions[jdx + 1], positions[jdx + 2]
          );
        }
      }
    }

    particlesGeometry.attributes.position.needsUpdate = true;

    // Update lines segments
    if (linePositions.length > 0) {
      linesGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
      lineMesh.visible = true;
    } else {
      lineMesh.visible = false;
    }

    renderer.render(scene, camera);
  };

  animate();

  // Return teardown function if needed for SPA lifecycles
  return () => {
    cancelAnimationFrame(animationFrameId);
    window.removeEventListener('resize', onWindowResize);
    renderer.dispose();
  };
}
