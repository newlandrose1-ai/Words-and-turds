import React, { useEffect, useRef } from 'react';
import { PoopExpression } from '../types/game';
import { sounds } from '../utils/audio';

interface PoopLogCanvasProps {
  lengthCm: number;
  weightGrams: number;
  maxWaterDepthCm: number;
  tension: number; // 0 - 100
  isPushing: boolean;
  isFarting?: boolean;
  isSnipping: boolean;
  isQuickSnipping?: boolean;
  isCheekSpread: boolean;
  isSnapped: boolean;
  isFlushing?: boolean;
  expression: PoopExpression;
  cleanCut: boolean;
  onDropImpact?: () => void;
  onFlushClick?: () => void;
  onFlushComplete?: () => void;
}

interface VerletNode {
  x: number;
  y: number;
  oldX: number;
  oldY: number;
  radius: number;
}

interface FartParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  rotation: number;
}

interface SplashDrop {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
}

interface Ripple {
  x: number;
  y: number;
  r: number;
  maxR: number;
  alpha: number;
  lineWidth: number;
}

export const PoopLogCanvas: React.FC<PoopLogCanvasProps> = ({
  lengthCm,
  weightGrams,
  maxWaterDepthCm,
  tension,
  isPushing,
  isFarting = false,
  isSnipping,
  isQuickSnipping = false,
  isCheekSpread,
  isSnapped,
  isFlushing = false,
  expression,
  cleanCut,
  onDropImpact,
  onFlushClick,
  onFlushComplete
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Physics Verlet chain
  const nodesRef = useRef<VerletNode[]>([]);
  const isSeveredRef = useRef<boolean>(false);
  const hasImpactedRef = useRef<boolean>(false);
  const impactVelocityRef = useRef<number>(0);

  // Visual particles
  const fartParticlesRef = useRef<FartParticle[]>([]);
  const splashDropsRef = useRef<SplashDrop[]>([]);
  const ripplesRef = useRef<Ripple[]>([]);
  const sweatDropsRef = useRef<Array<{ x: number; y: number; vx: number; vy: number; life: number }>>([]);

  // Animation states
  const screenShakeRef = useRef<number>(0);
  const cheekSpreadAnimRef = useRef<number>(0);
  const fartPulseRef = useRef<number>(0);
  const impactTextRef = useRef<{ text: string; alpha: number; y: number } | null>(null);
  const flushAnimRef = useRef<number>(0);

  // Reset physics chain when round resets
  useEffect(() => {
    if (lengthCm <= 0.1 && !isSnipping && !isSnapped) {
      nodesRef.current = [];
      isSeveredRef.current = false;
      hasImpactedRef.current = false;
      impactVelocityRef.current = 0;
      flushAnimRef.current = 0;
    }
  }, [lengthCm, isSnipping, isSnapped]);

  // Handle cut release
  useEffect(() => {
    if ((isSnipping || isSnapped) && !isSeveredRef.current && nodesRef.current.length > 0) {
      isSeveredRef.current = true;
    }
  }, [isSnipping, isSnapped]);

  // Handle flush trigger
  useEffect(() => {
    if (isFlushing) {
      flushAnimRef.current = 0.01;
    }
  }, [isFlushing]);

  // Fart particles generator
  useEffect(() => {
    if (isFarting) {
      sounds.playFartBoost();
      const canvas = canvasRef.current;
      const cx = canvas ? canvas.clientWidth / 2 : 200;
      for (let i = 0; i < 14; i++) {
        fartParticlesRef.current.push({
          x: cx + (Math.random() - 0.5) * 28,
          y: 72 + Math.random() * 8,
          vx: (Math.random() - 0.5) * 5,
          vy: 2 + Math.random() * 7,
          radius: 8 + Math.random() * 12,
          alpha: 0.9,
          rotation: Math.random() * Math.PI * 2
        });
      }
      fartPulseRef.current = 1.0;
    }
  }, [isFarting]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let running = true;

    const render = () => {
      if (!running) return;

      const dpr = window.devicePixelRatio || 1;
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;

      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      const centerX = width / 2;
      const startY = 70; // Sphincter exit point
      const waterY = height - 68; // Water level in bowl

      // Smooth cheek spread interpolation
      const targetSpread = isCheekSpread ? 34 : 0;
      cheekSpreadAnimRef.current += (targetSpread - cheekSpreadAnimRef.current) * 0.22;

      // Screen shake translation
      if (screenShakeRef.current > 0.05) {
        const sx = (Math.random() - 0.5) * screenShakeRef.current * 1.4;
        const sy = (Math.random() - 0.5) * screenShakeRef.current * 1.4;
        ctx.translate(sx, sy);
        screenShakeRef.current *= 0.86;
      }

      // 1. Draw Porcelain Toilet Bowl & Water (with vortex if flushing)
      drawPorcelainBowl(ctx, width, height, waterY, ripplesRef.current, flushAnimRef);

      // 2. Multi-Segment Soft-Body Physics Simulation (with vortex suction)
      updatePoopPhysics(
        nodesRef.current,
        lengthCm,
        maxWaterDepthCm,
        centerX,
        startY,
        waterY,
        isSeveredRef.current,
        isPushing,
        isFarting,
        tension,
        weightGrams,
        hasImpactedRef,
        screenShakeRef,
        splashDropsRef,
        ripplesRef,
        impactTextRef,
        isQuickSnipping,
        isFlushing,
        flushAnimRef,
        onDropImpact,
        onFlushComplete
      );

      // 3. Draw Poop Soft-Body Mesh with Organic Shading & Emotive Face
      if (nodesRef.current.length >= 2) {
        drawPoopSoftBody(
          ctx,
          nodesRef.current,
          expression,
          tension,
          isPushing,
          cleanCut,
          isSnapped,
          isSeveredRef.current
        );
      }

      // 4. Draw Fart Smoke Puffs
      drawFartPuffs(ctx, fartParticlesRef.current);

      // 5. Draw Water Splashes & Droplets
      drawSplashDrops(ctx, splashDropsRef.current);

      // 6. Draw Sweat Drops when straining
      if (tension > 45 && isPushing && Math.random() < 0.35) {
        sweatDropsRef.current.push({
          x: centerX + (Math.random() - 0.5) * 44,
          y: startY + 5,
          vx: (Math.random() - 0.5) * 3.5,
          vy: -Math.random() * 2 - 1,
          life: 1.0
        });
      }
      drawSweatDrops(ctx, sweatDropsRef.current);

      // 7. Impact / Score Text Overlay
      if (impactTextRef.current && impactTextRef.current.alpha > 0.02) {
        ctx.save();
        ctx.font = '900 20px Fredoka, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = `rgba(245, 158, 11, ${impactTextRef.current.alpha})`;
        ctx.strokeStyle = `rgba(69, 26, 3, ${impactTextRef.current.alpha})`;
        ctx.lineWidth = 4;
        ctx.strokeText(impactTextRef.current.text, centerX, impactTextRef.current.y);
        ctx.fillText(impactTextRef.current.text, centerX, impactTextRef.current.y);
        impactTextRef.current.y -= 0.7;
        impactTextRef.current.alpha -= 0.022;
        ctx.restore();
      }

      // 8. Draw Gorgeous Cartoon Asscheeks & Porcelain Rim at Top
      drawAsscheeksAndPorcelainSeat(
        ctx,
        centerX,
        startY,
        isPushing,
        isFarting,
        tension,
        cheekSpreadAnimRef.current,
        isCheekSpread,
        isSeveredRef.current,
        isFlushing,
        flushAnimRef
      );

      // 9. Snip Scissor Blades Flash
      if (isSnipping) {
        drawScissorSnipFlash(ctx, centerX, startY + 6, isQuickSnipping);
      }

      ctx.restore();
      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      running = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [
    lengthCm,
    weightGrams,
    maxWaterDepthCm,
    tension,
    isPushing,
    isFarting,
    isSnipping,
    isQuickSnipping,
    isCheekSpread,
    isSnapped,
    expression,
    cleanCut,
    onDropImpact,
    onFlushClick
  ]);

  const isSeveredAwaitingFlush = (isSnipping || isSnapped) && !isFlushing;

  return (
    <div className="relative w-full h-full min-h-[360px] sm:min-h-[440px] rounded-3xl overflow-hidden bg-gradient-to-b from-sky-50 via-cyan-50 to-blue-100 shadow-inner border-2 border-amber-300/80 group">
      <canvas
        ref={canvasRef}
        onClick={() => {
          if (isSeveredAwaitingFlush && onFlushClick) {
            onFlushClick();
          }
        }}
        className={`w-full h-full block ${isSeveredAwaitingFlush ? 'cursor-pointer' : ''}`}
        style={{ touchAction: 'none' }}
      />

      {/* Floating Interactive Flush Button when specimen is in bowl */}
      {isSeveredAwaitingFlush && (
        <button
          type="button"
          onClick={() => {
            if (onFlushClick) onFlushClick();
          }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 px-5 py-2.5 bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white rounded-full font-display font-black text-sm tracking-wide shadow-xl shadow-sky-500/40 flex items-center gap-2.5 animate-bounce cursor-pointer border-2 border-sky-300/80 transition-transform active:scale-95"
        >
          <span className="text-base">💧</span>
          <span>FLUSH & REVEAL RATING</span>
          <span className="text-[10px] bg-white/25 px-2 py-0.5 rounded-full font-mono uppercase tracking-wider">
            [ENTER]
          </span>
        </button>
      )}
    </div>
  );
};

// ==========================================
// VERLET PHYSICS ENGINE FOR ORGANIC POOP LOG
// ==========================================

function updatePoopPhysics(
  nodes: VerletNode[],
  lengthCm: number,
  maxWaterDepthCm: number,
  centerX: number,
  startY: number,
  waterY: number,
  isSevered: boolean,
  isPushing: boolean,
  isFarting: boolean,
  tension: number,
  weightGrams: number,
  hasImpactedRef: React.MutableRefObject<boolean>,
  screenShakeRef: React.MutableRefObject<number>,
  splashDropsRef: React.MutableRefObject<SplashDrop[]>,
  ripplesRef: React.MutableRefObject<Ripple[]>,
  impactTextRef: React.MutableRefObject<{ text: string; alpha: number; y: number } | null>,
  isQuickSnipping: boolean,
  isFlushing: boolean,
  flushAnimRef: React.MutableRefObject<number>,
  onDropImpact?: () => void,
  onFlushComplete?: () => void
) {
  // If actively flushing down the toilet, apply swirling whirlpool vortex suction!
  if (isFlushing && flushAnimRef.current > 0) {
    flushAnimRef.current += 0.016;
    const progress = Math.min(1.0, flushAnimRef.current);
    const drainX = centerX;
    const drainY = waterY + 6;

    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i];
      const dx = n.x - drainX;
      const dy = n.y - drainY;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;

      // Tangential angular spin
      const currentAngle = Math.atan2(dy, dx);
      const spinSpeed = (4.0 + (1 - Math.min(1, dist / 120)) * 6.0) * (1 + progress * 2.2);
      const newAngle = currentAngle + spinSpeed * 0.04;

      // Radial inward suction force
      const pullSpeed = 3.2 + progress * 10.0;
      const newDist = Math.max(0, dist - pullSpeed);

      n.x = drainX + Math.cos(newAngle) * newDist;
      n.y = drainY + Math.sin(newAngle) * (newDist * 0.42) + pullSpeed * 0.35;

      // Shrink node as it corkscrews down the siphon
      n.radius = Math.max(0.2, n.radius * 0.965);
      n.oldX = n.x;
      n.oldY = n.y;
    }

    // Vibrating flush rumble
    screenShakeRef.current = Math.max(screenShakeRef.current, Math.sin(progress * Math.PI) * 4.5);

    if (progress >= 1.0) {
      nodes.length = 0;
      if (onFlushComplete) {
        onFlushComplete();
      }
    }
    return;
  }

  const availableHeight = waterY - startY;
  const targetTotalPx = Math.max(12, (lengthCm / maxWaterDepthCm) * availableHeight);

  // Dynamic node spacing: ~14px per node
  const segmentDist = 14;
  const targetNodeCount = Math.max(2, Math.floor(targetTotalPx / segmentDist) + 1);

  // Add nodes smoothly as log emerges from sphincter
  while (nodes.length < targetNodeCount && !isSevered) {
    const i = nodes.length;
    const progress = i / targetNodeCount;
    const r = Math.max(12, 20 - progress * 8);
    const prevY = nodes.length > 0 ? nodes[nodes.length - 1].y : startY;
    nodes.push({
      x: centerX,
      y: prevY + segmentDist,
      oldX: centerX,
      oldY: prevY + segmentDist,
      radius: r
    });
  }

  if (nodes.length === 0) return;

  // Physics gravity & damping
  const gravity = isSevered ? 0.95 : 0.35;
  const damping = 0.96;

  // If farting, apply strong downward thrust!
  const fartPush = isFarting ? 2.5 : 0;

  // Verlet integration
  for (let i = 0; i < nodes.length; i++) {
    const n = nodes[i];

    // If attached at sphincter and not severed, anchor node 0
    if (i === 0 && !isSevered) {
      n.x = centerX;
      n.y = startY;
      n.oldX = centerX;
      n.oldY = startY;
      continue;
    }

    const vx = (n.x - n.oldX) * damping;
    let vy = (n.y - n.oldY) * damping + gravity + fartPush;

    // Water buoyancy & drag if below water surface
    if (n.y > waterY) {
      vy *= 0.55;
      vy -= 0.12; // slight buoyancy
    }

    // Straining wobble when pushing
    if (isPushing && !isSevered) {
      const wobble = Math.sin(Date.now() * 0.02 + i * 0.6) * (tension * 0.02);
      n.x += wobble;
    }

    n.oldX = n.x;
    n.oldY = n.y;
    n.x += vx;
    n.y += vy;
  }

  // Relaxation distance constraints & angular spring
  const iterations = 5;
  for (let iter = 0; iter < iterations; iter++) {
    // Anchor first node if not severed
    if (!isSevered) {
      nodes[0].x = centerX;
      nodes[0].y = startY;
    }

    for (let i = 0; i < nodes.length - 1; i++) {
      const a = nodes[i];
      const b = nodes[i + 1];

      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const diff = (dist - segmentDist) / dist;

      const pA = i === 0 && !isSevered ? 0 : 0.5;
      const pB = 1 - pA;

      a.x += dx * diff * pA;
      a.y += dy * diff * pA;
      b.x -= dx * diff * pB;
      b.y -= dy * diff * pB;
    }

    // Gentle vertical spine stiffness to keep it log-shaped rather than floppy rope
    for (let i = 1; i < nodes.length - 1; i++) {
      const prev = nodes[i - 1];
      const curr = nodes[i];
      const next = nodes[i + 1];

      const midX = (prev.x + next.x) * 0.5;
      const midY = (prev.y + next.y) * 0.5;

      curr.x += (midX - curr.x) * 0.08;
      curr.y += (midY - curr.y) * 0.08;
    }
  }

  // Check Heavy Thunk Impact when tip hits water
  const tip = nodes[nodes.length - 1];
  if (tip.y >= waterY && !hasImpactedRef.current) {
    hasImpactedRef.current = true;

    // Heavy Thunk Vibration
    const thunkIntensity = Math.min(24, 7 + weightGrams / 32);
    screenShakeRef.current = thunkIntensity;

    // Play synthesized heavy thunk audio
    sounds.playHeavyThunk(Math.max(0.8, weightGrams / 240));

    if (onDropImpact) onDropImpact();

    // Spawn explosive splash drops
    const splashCount = Math.min(50, 20 + Math.floor(weightGrams / 20));
    for (let i = 0; i < splashCount; i++) {
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.6;
      const speed = 4 + Math.random() * 9 + weightGrams / 70;
      splashDropsRef.current.push({
        x: tip.x + (Math.random() - 0.5) * 35,
        y: waterY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 2 + Math.random() * 4,
        alpha: 1.0
      });
    }

    // Ripples
    ripplesRef.current.push({
      x: tip.x,
      y: waterY,
      r: 8,
      maxR: 150,
      alpha: 1.0,
      lineWidth: 4.5
    });
    ripplesRef.current.push({
      x: tip.x,
      y: waterY,
      r: 4,
      maxR: 90,
      alpha: 0.8,
      lineWidth: 2.5
    });

    // Impact popup banner
    impactTextRef.current = {
      text: isQuickSnipping ? '⚡ QUICK-SNIP THUNK!' : '💥 HEAVY THUNK!',
      alpha: 1.0,
      y: waterY - 32
    };
  }
}

// ==========================================
// RENDERING ROUTINES
// ==========================================

// Toilet Bowl, Swirling Water, and Chrome Flush Lever
function drawPorcelainBowl(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  waterY: number,
  ripples: Ripple[],
  flushAnimRef: React.MutableRefObject<number>
) {
  const centerX = width / 2;

  // Porcelain glossy curved interior walls
  const bowlGrad = ctx.createLinearGradient(centerX - 150, 0, centerX + 150, 0);
  bowlGrad.addColorStop(0, '#cbd5e1');
  bowlGrad.addColorStop(0.12, '#f8fafc');
  bowlGrad.addColorStop(0.5, '#ffffff');
  bowlGrad.addColorStop(0.88, '#f8fafc');
  bowlGrad.addColorStop(1, '#cbd5e1');

  ctx.fillStyle = bowlGrad;
  ctx.beginPath();
  ctx.ellipse(centerX, height - 60, 160, 80, 0, 0, Math.PI * 2);
  ctx.fill();

  // Porcelain inner rim drop shadow
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 3;
  ctx.stroke();

  // Water Surface Pool
  const isFlushingNow = flushAnimRef.current > 0;
  const flushProgress = Math.min(1.0, flushAnimRef.current);

  const waterGrad = ctx.createRadialGradient(
    centerX,
    waterY + 6,
    isFlushingNow ? 4 + flushProgress * 25 : 8,
    centerX,
    waterY + 6,
    125
  );

  if (isFlushingNow) {
    waterGrad.addColorStop(0, '#021827');
    waterGrad.addColorStop(0.25, '#0369a1');
    waterGrad.addColorStop(0.65, '#0284c7');
    waterGrad.addColorStop(1, '#075985');
  } else {
    waterGrad.addColorStop(0, '#38bdf8');
    waterGrad.addColorStop(0.55, '#0284c7');
    waterGrad.addColorStop(1, '#0369a1');
  }

  ctx.fillStyle = waterGrad;
  ctx.beginPath();
  ctx.ellipse(centerX, waterY, 125, 48, 0, 0, Math.PI * 2);
  ctx.fill();

  // If flushing, render swirling whirlpool vortex arms and siphon funnel
  if (isFlushingNow) {
    ctx.save();
    const spinAngle = Date.now() * 0.015;
    const spiralArms = 6;

    // Spiraling water vortex currents
    for (let s = 0; s < spiralArms; s++) {
      const baseA = (s * Math.PI * 2) / spiralArms + spinAngle;
      ctx.strokeStyle = `rgba(255, 255, 255, ${0.45 + Math.sin(spinAngle + s) * 0.25})`;
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      for (let step = 0; step < 24; step++) {
        const radius = 115 * (1 - step / 24);
        const theta = baseA + (step / 24) * 4.2;
        const sx = centerX + Math.cos(theta) * radius;
        const sy = waterY + Math.sin(theta) * (radius * 0.38);
        if (step === 0) ctx.moveTo(sx, sy);
        else ctx.lineTo(sx, sy);
      }
      ctx.stroke();
    }

    // Deep vortex siphon hole
    const holeRadius = 16 + Math.sin(Date.now() * 0.03) * 3;
    const holeGrad = ctx.createRadialGradient(centerX, waterY + 4, 1, centerX, waterY + 4, holeRadius);
    holeGrad.addColorStop(0, '#000000');
    holeGrad.addColorStop(0.75, '#082f49');
    holeGrad.addColorStop(1, 'rgba(2, 132, 199, 0)');
    ctx.fillStyle = holeGrad;
    ctx.beginPath();
    ctx.ellipse(centerX, waterY + 4, holeRadius * 1.6, holeRadius * 0.7, 0, 0, Math.PI * 2);
    ctx.fill();

    // Whirling water suds and foam bubbles
    for (let f = 0; f < 10; f++) {
      const foamA = spinAngle * 1.8 + (f * Math.PI) / 5;
      const foamR = (25 + ((f * 19 + Date.now() * 0.05) % 80));
      const fx = centerX + Math.cos(foamA) * foamR;
      const fy = waterY + Math.sin(foamA) * (foamR * 0.38);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.88)';
      ctx.beginPath();
      ctx.arc(fx, fy, 2.5 + (f % 3), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // Highlight Rim
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.ellipse(centerX, waterY, 125, 48, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Caustic Glints (only when not vigorously flushing)
  if (!isFlushingNow) {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.lineWidth = 2;
    const t = Date.now() * 0.002;
    const caust1 = 36 + Math.sin(t) * 12;
    ctx.beginPath();
    ctx.ellipse(centerX - 24, waterY + 2, caust1, caust1 * 0.32, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Water Ripples
  for (let i = ripples.length - 1; i >= 0; i--) {
    const rip = ripples[i];
    rip.r += 2.2;
    rip.alpha -= 0.02;
    if (rip.alpha <= 0 || rip.r >= rip.maxR) {
      ripples.splice(i, 1);
    } else {
      ctx.strokeStyle = `rgba(255, 255, 255, ${rip.alpha})`;
      ctx.lineWidth = rip.lineWidth;
      ctx.beginPath();
      ctx.ellipse(rip.x, rip.y, rip.r, rip.r * 0.35, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  // Water Hazard Depth Line
  ctx.strokeStyle = 'rgba(239, 68, 68, 0.45)';
  ctx.setLineDash([5, 5]);
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(centerX - 110, waterY);
  ctx.lineTo(centerX + 110, waterY);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = 'rgba(239, 68, 68, 0.75)';
  ctx.font = '700 11px Outfit, sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText('WATER SURFACE · THUNK SPLASH ZONE', centerX + 110, waterY - 8);
}

// Draw the animated Soft-body Poop Mesh with Catmull-Rom or Bezier Curves
function drawPoopSoftBody(
  ctx: CanvasRenderingContext2D,
  nodes: VerletNode[],
  expression: PoopExpression,
  tension: number,
  isPushing: boolean,
  cleanCut: boolean,
  isSnapped: boolean,
  isSevered: boolean
) {
  ctx.save();

  // Generate left and right border vertices from node radii and normals
  const leftPts: Array<{ x: number; y: number }> = [];
  const rightPts: Array<{ x: number; y: number }> = [];

  for (let i = 0; i < nodes.length; i++) {
    const curr = nodes[i];
    let nx = 0;
    let ny = 1;

    if (i < nodes.length - 1) {
      const next = nodes[i + 1];
      const dx = next.x - curr.x;
      const dy = next.y - curr.y;
      const len = Math.sqrt(dx * dx + dy * dy) || 1;
      nx = -dy / len;
      ny = dx / len;
    } else if (i > 0) {
      const prev = nodes[i - 1];
      const dx = curr.x - prev.x;
      const dy = curr.y - prev.y;
      const len = Math.sqrt(dx * dx + dy * dy) || 1;
      nx = -dy / len;
      ny = dx / len;
    }

    const r = curr.radius;
    leftPts.push({ x: curr.x + nx * r, y: curr.y + ny * r });
    rightPts.push({ x: curr.x - nx * r, y: curr.y - ny * r });
  }

  // Rich organic poop gradient
  const tip = nodes[nodes.length - 1];
  const head = nodes[0];
  const poopGrad = ctx.createLinearGradient(head.x, head.y, tip.x, tip.y);
  poopGrad.addColorStop(0, '#582b0f');
  poopGrad.addColorStop(0.35, '#78350f');
  poopGrad.addColorStop(0.7, '#854d0e');
  poopGrad.addColorStop(1, '#582b0f');

  ctx.fillStyle = poopGrad;
  ctx.strokeStyle = '#381a07';
  ctx.lineWidth = 3.5;
  ctx.lineJoin = 'round';

  ctx.beginPath();
  // Draw top cap
  if (isSevered) {
    ctx.arc(head.x, head.y, head.radius, Math.PI, 0);
  } else {
    ctx.moveTo(leftPts[0].x, leftPts[0].y);
  }

  // Down right side
  for (let i = 0; i < rightPts.length; i++) {
    ctx.lineTo(rightPts[i].x, rightPts[i].y);
  }

  // Rounded bottom cap
  const rTip = tip.radius;
  ctx.arc(tip.x, tip.y, rTip, 0, Math.PI);

  // Up left side
  for (let i = leftPts.length - 1; i >= 0; i--) {
    ctx.lineTo(leftPts[i].x, leftPts[i].y);
  }

  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Glossy highlight ribbon along the body
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.32)';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.beginPath();
  for (let i = 0; i < nodes.length; i++) {
    const pt = nodes[i];
    const hx = pt.x - pt.radius * 0.45;
    const hy = pt.y;
    if (i === 0) ctx.moveTo(hx, hy);
    else ctx.lineTo(hx, hy);
  }
  ctx.stroke();

  // Subtle organic segmentation rings
  ctx.strokeStyle = 'rgba(46, 20, 6, 0.35)';
  ctx.lineWidth = 2.5;
  for (let i = 2; i < nodes.length - 1; i += 2) {
    const pt = nodes[i];
    ctx.beginPath();
    ctx.ellipse(pt.x, pt.y, pt.radius * 0.85, 3.5, 0, 0, Math.PI);
    ctx.stroke();
  }

  // Emotive Cartoon Face positioned on leading segment
  const faceIdx = Math.max(1, nodes.length - 2);
  const faceNode = nodes[faceIdx];
  drawEmotiveFace(
    ctx,
    faceNode.x,
    faceNode.y,
    expression,
    tension,
    isPushing,
    cleanCut,
    isSnapped
  );

  ctx.restore();
}

// Emotive cartoon face: eyes, eyebrows, teeth, mouth, crown
function drawEmotiveFace(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  expression: PoopExpression,
  tension: number,
  isPushing: boolean,
  cleanCut: boolean,
  isSnapped: boolean
) {
  ctx.save();
  ctx.translate(x, y);

  const eyeSpacing = 10;
  const eyeRadius = expression === 'panicked' || expression === 'screaming' ? 6 : 4.5;

  if (isSnapped) {
    // Dazed X_X eyes
    ctx.strokeStyle = '#1c1917';
    ctx.lineWidth = 2.5;
    // Left X
    ctx.beginPath();
    ctx.moveTo(-eyeSpacing - 4, -4);
    ctx.lineTo(-eyeSpacing + 4, 4);
    ctx.moveTo(-eyeSpacing + 4, -4);
    ctx.lineTo(-eyeSpacing - 4, 4);
    ctx.stroke();
    // Right X
    ctx.beginPath();
    ctx.moveTo(eyeSpacing - 4, -4);
    ctx.lineTo(eyeSpacing + 4, 4);
    ctx.moveTo(eyeSpacing + 4, -4);
    ctx.lineTo(eyeSpacing - 4, 4);
    ctx.stroke();
    // Wavy mouth
    ctx.beginPath();
    ctx.moveTo(-6, 8);
    ctx.lineTo(-2, 6);
    ctx.lineTo(2, 9);
    ctx.lineTo(6, 7);
    ctx.stroke();
  } else if (expression === 'panicked' || tension > 82) {
    // Wide panicked eyes
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(-eyeSpacing, -2, eyeRadius + 1.5, 0, Math.PI * 2);
    ctx.arc(eyeSpacing, -2, eyeRadius + 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#1e1b18';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(-eyeSpacing, -2, 2.2, 0, Math.PI * 2);
    ctx.arc(eyeSpacing, -2, 2.2, 0, Math.PI * 2);
    ctx.fill();

    // Screaming open mouth
    ctx.fillStyle = '#450a0a';
    ctx.beginPath();
    ctx.ellipse(0, 7, 6, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  } else if (expression === 'sweating' || isPushing) {
    // Straining squint (> <)
    ctx.strokeStyle = '#1c1917';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';

    ctx.beginPath();
    ctx.moveTo(-eyeSpacing - 4, -4);
    ctx.lineTo(-eyeSpacing + 1, -1);
    ctx.lineTo(-eyeSpacing - 4, 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(eyeSpacing + 4, -4);
    ctx.lineTo(eyeSpacing - 1, -1);
    ctx.lineTo(eyeSpacing + 4, 2);
    ctx.stroke();

    // Gritted teeth
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#1c1917';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(-7, 4, 14, 5.5, 2);
    ctx.fill();
    ctx.stroke();
  } else if (expression === 'triumphant' || cleanCut) {
    // Joyful arc eyes (^ ^)
    ctx.strokeStyle = '#1c1917';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';

    ctx.beginPath();
    ctx.arc(-eyeSpacing, 0, 5, Math.PI * 1.1, Math.PI * 1.9);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(eyeSpacing, 0, 5, Math.PI * 1.1, Math.PI * 1.9);
    ctx.stroke();

    // Big happy smile
    ctx.fillStyle = '#78350f';
    ctx.beginPath();
    ctx.arc(0, 4, 7.5, 0, Math.PI);
    ctx.fill();

    // Golden Crown
    ctx.fillStyle = '#f59e0b';
    ctx.strokeStyle = '#b45309';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-11, -14);
    ctx.lineTo(-8, -23);
    ctx.lineTo(-3, -16);
    ctx.lineTo(0, -25);
    ctx.lineTo(3, -16);
    ctx.lineTo(8, -23);
    ctx.lineTo(11, -14);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else {
    // Curious cute eyes (● ●)
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(-eyeSpacing, -1, eyeRadius, 0, Math.PI * 2);
    ctx.arc(eyeSpacing, -1, eyeRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#1e1b18';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(-eyeSpacing + 0.5, -0.5, eyeRadius * 0.65, 0, Math.PI * 2);
    ctx.arc(eyeSpacing + 0.5, -0.5, eyeRadius * 0.65, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(-eyeSpacing - 1, -2, 1.5, 0, Math.PI * 2);
    ctx.arc(eyeSpacing - 1, -2, 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Cute smile
    ctx.strokeStyle = '#1c1917';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(-2.5, 4, 3, 0.1, Math.PI);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(2.5, 4, 3, 0, Math.PI * 0.9);
    ctx.stroke();
  }

  ctx.restore();
}

// Gorgeous Asscheeks, Porcelain Seat & Interactive Flush Handle
function drawAsscheeksAndPorcelainSeat(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  startY: number,
  isPushing: boolean,
  isFarting: boolean,
  tension: number,
  spreadOffset: number,
  isCheekSpread: boolean,
  isSevered: boolean,
  isFlushing: boolean,
  flushAnimRef: React.MutableRefObject<number>
) {
  ctx.save();

  // 1. Porcelain White Toilet Seat Rim
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.roundRect(centerX - 105, startY - 48, 210, 52, 24);
  ctx.fill();
  ctx.stroke();

  // Chrome Flush Handle on Left (Clickable!)
  const isLeverDepressed = isFlushing || flushAnimRef.current > 0;
  const leverAngle = isLeverDepressed ? 0.48 : 0; // pivot downwards 28 degrees when flushed

  ctx.save();
  ctx.translate(centerX - 120, startY - 24);
  ctx.rotate(leverAngle);

  // Escutcheon wall mounting plate
  ctx.fillStyle = '#f1f5f9';
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.roundRect(-10, -8, 20, 10, 3);
  ctx.fill();
  ctx.stroke();

  // Chrome Lever Arm
  ctx.strokeStyle = isLeverDepressed ? '#38bdf8' : '#cbd5e1';
  ctx.lineWidth = 3.5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, 15);
  ctx.stroke();

  // Chrome Ball Knob
  ctx.fillStyle = isLeverDepressed ? '#0284c7' : '#94a3b8';
  ctx.beginPath();
  ctx.arc(0, 16, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#64748b';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.restore();

  // Pulsing hint badge next to handle when severed and awaiting flush
  if (isSevered && !isFlushing) {
    const pulse = 0.65 + Math.sin(Date.now() * 0.009) * 0.35;
    ctx.fillStyle = `rgba(14, 165, 233, ${pulse * 0.95})`;
    ctx.strokeStyle = `rgba(2, 132, 199, ${pulse})`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(centerX - 188, startY - 42, 58, 20, 8);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = '800 10px Outfit, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('💧 FLUSH', centerX - 159, startY - 28);
  }

  // 2. Sphincter Tension Red/Amber Aura
  if (tension > 30) {
    const tensionRatio = (tension - 30) / 70;
    const glowGrad = ctx.createRadialGradient(centerX, startY, 15, centerX, startY, 60);
    glowGrad.addColorStop(0, `rgba(239, 68, 68, ${tensionRatio * 0.5})`);
    glowGrad.addColorStop(1, 'rgba(239, 68, 68, 0)');
    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.arc(centerX, startY, 60, 0, Math.PI * 2);
    ctx.fill();
  }

  // 3. Realistic Cartoon Asscheeks
  const defaultSpacing = 30;
  const cheekRadiusX = 46;
  const cheekRadiusY = 36;
  const clenchOffset = isPushing ? -4 : 0;
  const leftCheekX = centerX - defaultSpacing - spreadOffset + clenchOffset;
  const rightCheekX = centerX + defaultSpacing + spreadOffset - clenchOffset;
  const cheekY = startY - 14;

  // Asscheek gradient
  const cheekGrad = ctx.createRadialGradient(
    leftCheekX,
    cheekY - 8,
    6,
    leftCheekX,
    cheekY,
    cheekRadiusX
  );
  if (tension > 75) {
    cheekGrad.addColorStop(0, '#fecdd3');
    cheekGrad.addColorStop(0.65, '#fda4af');
    cheekGrad.addColorStop(1, '#fb7185');
  } else {
    cheekGrad.addColorStop(0, '#ffedd5');
    cheekGrad.addColorStop(0.6, '#fed7aa');
    cheekGrad.addColorStop(1, '#fdba74');
  }

  // Draw Left Butt Cheek
  ctx.fillStyle = cheekGrad;
  ctx.strokeStyle = '#ea580c';
  ctx.lineWidth = 2.8;
  ctx.beginPath();
  ctx.ellipse(leftCheekX, cheekY, cheekRadiusX, cheekRadiusY, -0.09, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Left Cheek Sheen
  ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
  ctx.beginPath();
  ctx.ellipse(leftCheekX - 12, cheekY - 10, 16, 9, -0.22, 0, Math.PI * 2);
  ctx.fill();

  // Draw Right Butt Cheek
  ctx.fillStyle = cheekGrad;
  ctx.beginPath();
  ctx.ellipse(rightCheekX, cheekY, cheekRadiusX, cheekRadiusY, 0.09, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Right Cheek Sheen
  ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
  ctx.beginPath();
  ctx.ellipse(rightCheekX + 12, cheekY - 10, 16, 9, 0.22, 0, Math.PI * 2);
  ctx.fill();

  // Motion arrows when Cheeks are SPREAD
  if (spreadOffset > 6) {
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';

    // Left arrows
    ctx.beginPath();
    ctx.moveTo(leftCheekX - 38, cheekY);
    ctx.lineTo(leftCheekX - 54, cheekY);
    ctx.moveTo(leftCheekX - 36, cheekY - 10);
    ctx.lineTo(leftCheekX - 48, cheekY - 12);
    ctx.stroke();

    // Right arrows
    ctx.beginPath();
    ctx.moveTo(rightCheekX + 38, cheekY);
    ctx.lineTo(rightCheekX + 54, cheekY);
    ctx.moveTo(rightCheekX + 36, cheekY - 10);
    ctx.lineTo(rightCheekX + 48, cheekY - 12);
    ctx.stroke();
  }

  // 4. Central Aperture Sphincter Rim
  const ringWidth = (isPushing ? 38 : 32) + spreadOffset * 0.45;
  const ringHeight = isPushing ? 19 : 15;

  const rimGrad = ctx.createRadialGradient(centerX, startY, 4, centerX, startY, ringWidth);
  if (tension > 75) {
    rimGrad.addColorStop(0, '#f87171');
    rimGrad.addColorStop(1, '#b91c1c');
  } else {
    rimGrad.addColorStop(0, '#fca5a5');
    rimGrad.addColorStop(1, '#dc2626');
  }

  ctx.fillStyle = rimGrad;
  ctx.beginPath();
  ctx.ellipse(centerX, startY, ringWidth, ringHeight, 0, 0, Math.PI * 2);
  ctx.fill();

  // Inner aperture
  ctx.fillStyle = '#451a03';
  ctx.beginPath();
  ctx.ellipse(centerX, startY, ringWidth * 0.65, ringHeight * 0.55, 0, 0, Math.PI * 2);
  ctx.fill();

  // Header Title on Seat
  ctx.fillStyle = isCheekSpread ? '#dc2626' : '#64748b';
  ctx.font = '700 10.5px Space Mono, monospace';
  ctx.textAlign = 'center';
  ctx.fillText(
    isCheekSpread
      ? 'CHEEKS SPREAD · QUICK PINCH ARMED'
      : isFarting
      ? '💨 TURBO FART BURST ENGAGED'
      : 'SEAT POSITION LOCKED · READY TO STRAIN',
    centerX,
    startY - 34
  );

  ctx.restore();
}

// Draw Fart Smoke Puffs
function drawFartPuffs(ctx: CanvasRenderingContext2D, puffs: FartParticle[]) {
  for (let i = puffs.length - 1; i >= 0; i--) {
    const p = puffs[i];
    p.x += p.vx;
    p.y += p.vy;
    p.radius += 0.8;
    p.alpha -= 0.035;

    if (p.alpha <= 0) {
      puffs.splice(i, 1);
    } else {
      ctx.fillStyle = `rgba(163, 230, 53, ${p.alpha * 0.7})`;
      ctx.strokeStyle = `rgba(101, 163, 13, ${p.alpha * 0.9})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
  }
}

// Draw Splash Droplets
function drawSplashDrops(ctx: CanvasRenderingContext2D, drops: SplashDrop[]) {
  for (let i = drops.length - 1; i >= 0; i--) {
    const d = drops[i];
    d.x += d.vx;
    d.y += d.vy;
    d.vy += 0.36; // Gravity
    d.alpha -= 0.02;

    if (d.alpha <= 0 || d.y > 600) {
      drops.splice(i, 1);
    } else {
      ctx.fillStyle = `rgba(186, 230, 253, ${d.alpha})`;
      ctx.strokeStyle = `rgba(14, 165, 233, ${d.alpha * 0.85})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
  }
}

// Draw Sweat Drops
function drawSweatDrops(
  ctx: CanvasRenderingContext2D,
  drops: Array<{ x: number; y: number; vx: number; vy: number; life: number }>
) {
  for (let i = drops.length - 1; i >= 0; i--) {
    const d = drops[i];
    d.x += d.vx;
    d.y += d.vy;
    d.vy += 0.22;
    d.life -= 0.04;
    if (d.life <= 0) {
      drops.splice(i, 1);
    } else {
      ctx.fillStyle = `rgba(56, 189, 248, ${d.life * 0.9})`;
      ctx.beginPath();
      ctx.ellipse(d.x, d.y, 3, 4.5, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

// Scissor Snip Cut Flash
function drawScissorSnipFlash(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  cutY: number,
  isQuick: boolean
) {
  ctx.save();
  ctx.strokeStyle = isQuick ? '#f59e0b' : '#cbd5e1';
  ctx.lineWidth = isQuick ? 5.5 : 4;
  ctx.lineCap = 'round';

  ctx.beginPath();
  ctx.moveTo(centerX - 50, cutY - 12);
  ctx.lineTo(centerX + 6, cutY);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(centerX + 50, cutY - 12);
  ctx.lineTo(centerX - 6, cutY);
  ctx.stroke();

  ctx.strokeStyle = isQuick ? '#e11d48' : '#dc2626';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(centerX - 54, cutY - 14, 8, 0, Math.PI * 2);
  ctx.arc(centerX + 54, cutY - 14, 8, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(centerX, cutY, isQuick ? 12 : 8, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}
