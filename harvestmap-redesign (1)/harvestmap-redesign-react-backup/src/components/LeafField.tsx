import { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * Drifting leaf / petal particle field rendered with three.js.
 * Sits behind hero content; gentle wind sway + mouse parallax.
 * Disabled for prefers-reduced-motion.
 */

const LEAF_COLORS = ["#c4632c", "#e3a63b", "#7d8b6f", "#2e4f3e", "#b7d69b", "#e08a4f"];

function makeLeafTexture(): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#ffffff";
  // simple hand-drawn-ish leaf: ellipse with a stem and vein
  ctx.save();
  ctx.translate(32, 32);
  ctx.rotate(-0.6);
  ctx.beginPath();
  ctx.ellipse(0, 0, 9, 16, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalCompositeOperation = "destination-out";
  ctx.beginPath();
  ctx.moveTo(0, -14);
  ctx.quadraticCurveTo(2, 0, 0, 15);
  ctx.quadraticCurveTo(-1.2, 0, 0, -14);
  ctx.fill();
  ctx.restore();
  const tex = new THREE.CanvasTexture(c);
  tex.needsUpdate = true;
  return tex;
}

interface Leaf {
  sprite: THREE.Sprite;
  baseX: number;
  speed: number;
  swayAmp: number;
  swayFreq: number;
  phase: number;
  spin: number;
}

export default function LeafField({ className = "" }: { className?: string }) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      50,
      mount.clientWidth / mount.clientHeight,
      0.1,
      100
    );
    camera.position.z = 14;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    mount.appendChild(renderer.domElement);

    const tex = makeLeafTexture();
    const leaves: Leaf[] = [];
    const COUNT = 46;

    for (let i = 0; i < COUNT; i++) {
      const mat = new THREE.SpriteMaterial({
        map: tex,
        color: new THREE.Color(LEAF_COLORS[i % LEAF_COLORS.length]),
        transparent: true,
        opacity: 0.35 + Math.random() * 0.4,
        depthWrite: false,
      });
      const sprite = new THREE.Sprite(mat);
      const scale = 0.35 + Math.random() * 0.75;
      sprite.scale.set(scale, scale, 1);
      sprite.position.set(
        (Math.random() - 0.5) * 22,
        (Math.random() - 0.5) * 14,
        (Math.random() - 0.5) * 6
      );
      scene.add(sprite);
      leaves.push({
        sprite,
        baseX: sprite.position.x,
        speed: 0.004 + Math.random() * 0.01,
        swayAmp: 0.4 + Math.random() * 0.9,
        swayFreq: 0.4 + Math.random() * 0.8,
        phase: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 0.02,
      });
    }

    // mouse parallax
    let targetX = 0;
    let targetY = 0;
    const onMove = (e: MouseEvent) => {
      targetX = (e.clientX / window.innerWidth - 0.5) * 1.6;
      targetY = (e.clientY / window.innerHeight - 0.5) * 1.0;
    };
    window.addEventListener("mousemove", onMove, { passive: true });

    const onResize = () => {
      if (!mount) return;
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };
    window.addEventListener("resize", onResize);

    let raf = 0;
    const t0 = performance.now();
    const tick = () => {
      const t = (performance.now() - t0) / 1000;
      for (const leaf of leaves) {
        const p = leaf.sprite.position;
        p.y -= leaf.speed;
        p.x = leaf.baseX + Math.sin(t * leaf.swayFreq + leaf.phase) * leaf.swayAmp;
        leaf.sprite.material.rotation += leaf.spin;
        if (p.y < -8) {
          p.y = 8;
          leaf.baseX = (Math.random() - 0.5) * 22;
        }
      }
      camera.position.x += (targetX - camera.position.x) * 0.03;
      camera.position.y += (-targetY - camera.position.y) * 0.03;
      renderer.render(scene, camera);
      raf = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("resize", onResize);
      tex.dispose();
      leaves.forEach((l) => l.sprite.material.dispose());
      renderer.dispose();
      mount.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div
      ref={mountRef}
      aria-hidden
      className={`pointer-events-none absolute inset-0 ${className}`}
    />
  );
}
