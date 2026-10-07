import * as THREE from './assets/vendor/three/three.module.js';

const visual = document.querySelector('[data-peptide-molecule]');

if (visual) {
  const fallback = visual.querySelector('.tools-molecule-fallback');
  let renderer;

  try {
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
  } catch (_) {
    // The SVG remains visible when WebGL is unavailable.
  }

  if (renderer) {
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.45;

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-7, 7, 4, -4, 0.1, 50);
    camera.position.z = 24;
    scene.add(new THREE.AmbientLight(0xffffff, 1.6));

    const keyLight = new THREE.DirectionalLight(0xffffff, 3);
    keyLight.position.set(-5, 7, 9);
    scene.add(keyLight);

    const cyanLight = new THREE.DirectionalLight(0x5bdff5, 1.8);
    cyanLight.position.set(-5, -4, 3);
    scene.add(cyanLight);

    const pinkLight = new THREE.DirectionalLight(0xff70bb, 1.5);
    pinkLight.position.set(6, 2, -4);
    scene.add(pinkLight);

    const materials = {
      1: new THREE.MeshPhysicalMaterial({ color: 0xf2f8fc, metalness: 0.08, roughness: 0.3, clearcoat: 0.5 }),
      6: new THREE.MeshPhysicalMaterial({ color: 0x9ebbc7, metalness: 0.2, roughness: 0.26, clearcoat: 0.65 }),
      7: new THREE.MeshPhysicalMaterial({ color: 0x37c9e4, metalness: 0.16, roughness: 0.24, clearcoat: 0.7 }),
      8: new THREE.MeshPhysicalMaterial({ color: 0xf358a9, metalness: 0.12, roughness: 0.24, clearcoat: 0.7 })
    };
    const atomSizes = { 1: 0.15, 6: 0.28, 7: 0.29, 8: 0.3 };
    const bondMaterial = new THREE.MeshStandardMaterial({ color: 0x9fb8c2, metalness: 0.55, roughness: 0.28 });
    const sphere = new THREE.SphereGeometry(1, 20, 14);
    const cylinder = new THREE.CylinderGeometry(1, 1, 1, 10);

    // Gly-Ala-Ser 3D conformer: https://pubchem.ncbi.nlm.nih.gov/compound/24944862
    const atoms = [
      [8, 0.249, -0.544, 1.718], [8, -2.122, 2.286, -0.767],
      [8, -4.545, -0.322, 0.735], [8, -3.627, -0.336, -1.34],
      [8, 2.592, 1.028, -1.116], [7, -1.133, -0.299, -0.13],
      [7, 2.361, -0.988, 0.015], [7, 4.783, 1.636, 0.432],
      [6, 1.036, -1.316, -0.44], [6, -2.25, 0.294, 0.566],
      [6, 0.038, -0.673, 0.514], [6, 0.831, -2.821, -0.508],
      [6, -2.165, 1.814, 0.574], [6, -3.513, -0.164, -0.134],
      [6, 3.039, 0.167, -0.362], [6, 4.426, 0.238, 0.243],
      [1, 0.907, -0.889, -1.442], [1, -2.257, -0.087, 1.594],
      [1, -1.211, -0.435, -1.134], [1, 0.946, -3.283, 0.48],
      [1, -0.173, -3.064, -0.871], [1, 1.561, -3.285, -1.18],
      [1, 2.797, -1.613, 0.687], [1, -1.258, 2.152, 1.085],
      [1, -3.038, 2.254, 1.067], [1, 5.13, -0.254, -0.436],
      [1, 4.451, -0.275, 1.209], [1, -2.067, 3.256, -0.726],
      [1, -5.369, -0.598, 0.278], [1, 4.833, 2.103, -0.473],
      [1, 5.72, 1.694, 0.829]
    ];
    const bonds = [
      [0, 10, 2], [1, 12, 1], [1, 27, 1], [2, 13, 1], [2, 28, 1],
      [3, 13, 2], [4, 14, 2], [5, 9, 1], [5, 10, 1], [5, 18, 1],
      [6, 8, 1], [6, 14, 1], [6, 22, 1], [7, 15, 1], [7, 29, 1],
      [7, 30, 1], [8, 10, 1], [8, 11, 1], [8, 16, 1], [9, 12, 1],
      [9, 13, 1], [9, 17, 1], [11, 19, 1], [11, 20, 1], [11, 21, 1],
      [12, 23, 1], [12, 24, 1], [14, 15, 1], [15, 25, 1], [15, 26, 1]
    ];

    const points = atoms.map(([, x, y, z]) => new THREE.Vector3(x, y, z));
    const center = new THREE.Box3().setFromPoints(points).getCenter(new THREE.Vector3());
    const floating = new THREE.Group();
    const structure = new THREE.Group();
    structure.position.copy(center).multiplyScalar(-1);
    floating.add(structure);
    scene.add(floating);

    atoms.forEach(([element], index) => {
      const atom = new THREE.Mesh(sphere, materials[element]);
      atom.position.copy(points[index]);
      atom.scale.setScalar(atomSizes[element]);
      structure.add(atom);
    });

    function addBond(start, end, radius) {
      const direction = new THREE.Vector3().subVectors(end, start);
      const bond = new THREE.Mesh(cylinder, bondMaterial);
      bond.position.copy(start).add(end).multiplyScalar(0.5);
      bond.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.clone().normalize());
      bond.scale.set(radius, direction.length(), radius);
      structure.add(bond);
    }

    bonds.forEach(([from, to, order]) => {
      const start = points[from];
      const end = points[to];
      if (order === 2) {
        const offset = new THREE.Vector3().subVectors(end, start).cross(new THREE.Vector3(0, 0, 1)).normalize().multiplyScalar(0.075);
        addBond(start.clone().add(offset), end.clone().add(offset), 0.045);
        addBond(start.clone().sub(offset), end.clone().sub(offset), 0.045);
      } else {
        addBond(start, end, 0.075);
      }
    });

    visual.appendChild(renderer.domElement);
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let visible = true;
    let frame = 0;

    function draw(time) {
      frame = 0;
      if (!reducedMotion.matches) {
        floating.rotation.set(0.12 + Math.sin(time * 0.00027) * 0.09, -0.18 + Math.sin(time * 0.00032) * 0.28, -0.04);
        floating.position.y = Math.sin(time * 0.0014) * 0.18;
      }
      renderer.render(scene, camera);
      if (visible && !document.hidden && !reducedMotion.matches) frame = requestAnimationFrame(draw);
    }

    function updateAnimation() {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      if (visible && !document.hidden) frame = requestAnimationFrame(draw);
    }

    function resize() {
      const { width, height } = visual.getBoundingClientRect();
      if (!width || !height) return;
      const halfHeight = 5.4;
      const halfWidth = halfHeight * width / height;
      camera.left = -halfWidth;
      camera.right = halfWidth;
      camera.top = halfHeight;
      camera.bottom = -halfHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
      renderer.render(scene, camera);
    }

    resize();
    fallback.setAttribute('hidden', '');
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(visual);
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      updateAnimation();
    });
    intersectionObserver.observe(visual);
    reducedMotion.addEventListener('change', updateAnimation);
    document.addEventListener('visibilitychange', updateAnimation);
    renderer.domElement.addEventListener('webglcontextlost', event => {
      event.preventDefault();
      if (frame) cancelAnimationFrame(frame);
      visible = false;
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      renderer.domElement.remove();
      fallback.removeAttribute('hidden');
    });
  }
}
