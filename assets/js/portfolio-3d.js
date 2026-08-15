import * as THREE from "three";

const canvas = document.getElementById("fx-canvas");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const isMobile = window.matchMedia("(max-width: 800px)").matches;
const coarse = window.matchMedia("(pointer: coarse)").matches;

if (canvas) {
  bootScene(canvas);
}

bootReveal();
bootTilt();
bootGlow();
bootNav();
bootSpotlights();

function bootScene(canvasEl) {
  const renderer = new THREE.WebGLRenderer({
    canvas: canvasEl,
    antialias: !isMobile,
    alpha: true,
    powerPreference: "high-performance",
  });
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x07070f, 0.038);

  const camera = new THREE.PerspectiveCamera(46, 1, 0.1, 120);
  camera.position.set(0, 1.1, 10.5);

  const root = new THREE.Group();
  scene.add(root);

  // Layered starfields
  root.add(makeStars(isMobile ? 700 : 1600, 36, 22, 26, 0.02, 0.55));
  root.add(makeStars(isMobile ? 280 : 700, 22, 14, 16, 0.035, 0.85));

  // Soft nebula glows
  const nebula = new THREE.Group();
  nebula.add(glowSphere(0x4f46e5, 4.8, -6.5, 1.2, -8, 0.07));
  nebula.add(glowSphere(0x0891b2, 5.6, 7.2, -0.4, -10, 0.08));
  nebula.add(glowSphere(0xf59e0b, 2.4, 2.4, 2.8, -6, 0.05));
  root.add(nebula);

  // Receding floor grid
  const grid = new THREE.GridHelper(70, 46, 0x67e8f9, 0x1b1b2c);
  grid.position.y = -3.35;
  if (Array.isArray(grid.material)) {
    grid.material.forEach((m) => {
      m.transparent = true;
      m.opacity = 0.22;
    });
  } else {
    grid.material.transparent = true;
    grid.material.opacity = 0.22;
  }
  scene.add(grid);

  // Horizon line
  const horizon = new THREE.Mesh(
    new THREE.PlaneGeometry(80, 8),
    new THREE.MeshBasicMaterial({
      color: 0x67e8f9,
      transparent: true,
      opacity: 0.035,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
  );
  horizon.position.set(0, -2.6, -12);
  scene.add(horizon);

  // Hero sculpture — only when motion is allowed
  const sculpture = new THREE.Group();
  sculpture.position.set(isMobile ? 0.15 : 2.7, 0.55, -0.4);
  root.add(sculpture);

  if (!reduceMotion) {
    const core = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.55, 1),
      new THREE.MeshBasicMaterial({
        color: 0x67e8f9,
        wireframe: true,
        transparent: true,
        opacity: 0.48,
      })
    );
    sculpture.add(core);

    const shell = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.95, 0),
      new THREE.MeshBasicMaterial({
        color: 0xa78bfa,
        wireframe: true,
        transparent: true,
        opacity: 0.16,
      })
    );
    sculpture.add(shell);

    const nucleus = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.48, 0),
      new THREE.MeshBasicMaterial({
        color: 0xf5c16c,
        wireframe: true,
        transparent: true,
        opacity: 0.85,
      })
    );
    sculpture.add(nucleus);

    const ringA = new THREE.Mesh(
      new THREE.TorusGeometry(2.25, 0.028, 12, 160),
      new THREE.MeshBasicMaterial({ color: 0xa78bfa, transparent: true, opacity: 0.4 })
    );
    ringA.rotation.x = Math.PI / 2.4;
    sculpture.add(ringA);

    const ringB = ringA.clone();
    ringB.rotation.x = Math.PI / 1.65;
    ringB.rotation.y = 0.7;
    ringB.material = ringA.material.clone();
    ringB.material.color = new THREE.Color(0x67e8f9);
    ringB.material.opacity = 0.2;
    sculpture.add(ringB);

    const sats = [];
    const satGeo = new THREE.TetrahedronGeometry(0.16, 0);
    const satMat = new THREE.MeshBasicMaterial({
      color: 0xf5c16c,
      wireframe: true,
      transparent: true,
      opacity: 0.85,
    });
    for (let i = 0; i < 6; i += 1) {
      const sat = new THREE.Mesh(satGeo, satMat);
      sat.userData = {
        angle: (i / 6) * Math.PI * 2,
        speed: 0.22 + i * 0.035,
        radius: 2.35 + (i % 2) * 0.4,
      };
      sats.push(sat);
      sculpture.add(sat);
    }
    sculpture.userData = { core, shell, nucleus, ringA, ringB, sats };
  }

  const pointer = { x: 0, y: 0 };
  window.addEventListener(
    "pointermove",
    (event) => {
      pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.y = (event.clientY / window.innerHeight) * 2 - 1;
    },
    { passive: true }
  );

  function resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  window.addEventListener("resize", resize);
  resize();

  let raf = 0;
  const clock = new THREE.Clock();
  canvasEl.classList.add("is-live");

  function frame() {
    const t = clock.getElapsedTime();
    const scroll = Math.min(window.scrollY / 900, 1);

    root.rotation.y = t * 0.012 + pointer.x * 0.08;
    root.children[0].rotation.y = t * 0.01;
    root.children[1].rotation.y = -t * 0.016;
    nebula.rotation.y = t * 0.02;
    grid.position.z = ((t * 0.35) % 1.5) - 0.75;

    const s = sculpture.userData;
    if (s) {
      s.core.rotation.y = t * 0.16;
      s.core.rotation.x = t * 0.07;
      s.shell.rotation.y = -t * 0.08;
      s.nucleus.rotation.y = -t * 0.45;
      s.nucleus.rotation.z = t * 0.25;
      s.ringA.rotation.z = t * 0.1;
      s.ringB.rotation.z = -t * 0.07;
      s.sats.forEach((sat) => {
        const a = sat.userData.angle + t * sat.userData.speed;
        sat.position.set(
          Math.cos(a) * sat.userData.radius,
          Math.sin(a * 1.35) * 0.55,
          Math.sin(a) * sat.userData.radius * 0.52
        );
        sat.rotation.x = t;
        sat.rotation.y = t * 0.7;
      });
    }

    const camX = pointer.x * 0.85;
    const camY = 1.05 - pointer.y * 0.35 - scroll * 0.35;
    const camZ = 10.5 + scroll * 1.4;
    camera.position.x += (camX - camera.position.x) * 0.045;
    camera.position.y += (camY - camera.position.y) * 0.045;
    camera.position.z += (camZ - camera.position.z) * 0.045;
    camera.lookAt(0.55, 0.15, 0);

    renderer.render(scene, camera);
    raf = window.requestAnimationFrame(frame);
  }

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) window.cancelAnimationFrame(raf);
    else {
      clock.getDelta();
      raf = window.requestAnimationFrame(frame);
    }
  });

  if (reduceMotion) {
    renderer.render(scene, camera);
    return;
  }

  raf = window.requestAnimationFrame(frame);
}

function makeStars(count, spreadX, spreadY, spreadZ, size, opacity) {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const cyan = new THREE.Color(0x7dd3fc);
  const violet = new THREE.Color(0xc4b5fd);
  const gold = new THREE.Color(0xfde68a);
  const white = new THREE.Color(0xf8fafc);

  for (let i = 0; i < count; i += 1) {
    const i3 = i * 3;
    positions[i3] = (Math.random() - 0.5) * spreadX;
    positions[i3 + 1] = (Math.random() - 0.5) * spreadY;
    positions[i3 + 2] = (Math.random() - 0.5) * spreadZ;
    const pick = Math.random();
    const c = pick > 0.88 ? gold : pick > 0.62 ? cyan : pick > 0.35 ? violet : white;
    colors[i3] = c.r;
    colors[i3 + 1] = c.g;
    colors[i3 + 2] = c.b;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  return new THREE.Points(
    geo,
    new THREE.PointsMaterial({
      size,
      vertexColors: true,
      transparent: true,
      opacity,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
  );
}

function glowSphere(color, radius, x, y, z, opacity) {
  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(radius, 32, 32),
    new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
  );
  mesh.position.set(x, y, z);
  return mesh;
}

function bootReveal() {
  const nodes = document.querySelectorAll(".reveal");
  if (!nodes.length) return;
  if (reduceMotion || !("IntersectionObserver" in window)) {
    nodes.forEach((el) => el.classList.add("is-in"));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.14, rootMargin: "0px 0px -8% 0px" }
  );
  nodes.forEach((el) => io.observe(el));
}

function bootTilt() {
  if (reduceMotion || coarse) return;
  document.querySelectorAll("[data-tilt]").forEach((el) => {
    const strength = Number(el.dataset.tilt) || 10;
    el.addEventListener("pointermove", (event) => {
      const rect = el.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      el.style.transform = `rotateY(${x * strength}deg) rotateX(${-y * strength}deg) translateZ(12px)`;
    });
    el.addEventListener("pointerleave", () => {
      el.style.transform = "";
    });
  });
}

function bootSpotlights() {
  if (coarse) return;
  document.querySelectorAll("[data-tilt], .glass").forEach((el) => {
    el.addEventListener("pointermove", (event) => {
      const rect = el.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 100;
      const y = ((event.clientY - rect.top) / rect.height) * 100;
      el.style.setProperty("--spot-x", `${x}%`);
      el.style.setProperty("--spot-y", `${y}%`);
    });
  });
}

function bootGlow() {
  const glow = document.querySelector(".cursor-glow");
  if (!glow || coarse) return;
  window.addEventListener(
    "pointermove",
    (event) => {
      glow.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0)`;
    },
    { passive: true }
  );
}

function bootNav() {
  const nav = document.querySelector(".pf-nav");
  if (nav) {
    const onScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  document.querySelectorAll('a[href*="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const href = link.getAttribute("href") || "";
      const id = href.slice(href.indexOf("#"));
      if (!id || id === "#") return;
      const target = document.querySelector(id);
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    });
  });

  const map = [
    ["#about", "about"],
    ["#education", "education"],
    ["#experience", "experience"],
    ["#work", "work"],
    ["#contact", "contact"],
  ];
  const links = [...document.querySelectorAll(".pf-nav a")];
  const onSpy = () => {
    let current = "";
    map.forEach(([sel]) => {
      const el = document.querySelector(sel);
      if (el && el.getBoundingClientRect().top < window.innerHeight * 0.38) current = sel;
    });
    links.forEach((a) => {
      const href = a.getAttribute("href") || "";
      a.classList.toggle("is-active", current && href.endsWith(current));
    });
  };
  window.addEventListener("scroll", onSpy, { passive: true });
  onSpy();
}
