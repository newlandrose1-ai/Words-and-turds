import React, { useEffect, useRef } from 'react';
import { PoopExpression, PoopQualityTier } from '../types/game';
import { sounds } from '../utils/audio';

interface PoopLogCanvasProps {
  lengthCm: number;
  weightGrams: number;
  maxWaterDepthCm: number;
  tension: number; // 0 - 100
  qualityScore?: number; // 0 - 100
  qualityTier?: PoopQualityTier;
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
  qualityScore = 50,
  qualityTier = 'smooth',
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
      const startY = 82; // Sphincter exit point with headroom for sculpted hips & cheeks
      const waterY = height - 66; // Water level in bowl

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
          isSeveredRef.current,
          qualityScore,
          qualityTier
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
    qualityScore,
    qualityTier,
    onDropImpact,
    onFlushClick
  ]);

  const isSeveredAwaitingFlush = (isSnipping || isSnapped) && !isFlushing;

  return (
    <div className="relative w-full h-full rounded-3xl overflow-hidden bg-gradient-to-b from-sky-50 via-cyan-50 to-blue-100 shadow-inner border-2 border-amber-300/80 group">
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
  isSevered: boolean,
  qualityScore: number = 50,
  qualityTier: PoopQualityTier = 'smooth'
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

  // Quality-Based Radiant Aura Glow
  if (qualityScore >= 75) {
    ctx.shadowColor = qualityScore >= 90 ? 'rgba(251, 191, 36, 0.75)' : 'rgba(56, 189, 248, 0.45)';
    ctx.shadowBlur = qualityScore >= 90 ? 18 : 10;
  }

  // Rich organic poop gradient modulated by Quality Score
  const tip = nodes[nodes.length - 1];
  const head = nodes[0];
  const poopGrad = ctx.createLinearGradient(head.x, head.y, tip.x, tip.y);

  if (qualityScore >= 90) {
    // Transcendent Golden Glaze
    poopGrad.addColorStop(0, '#78350f');
    poopGrad.addColorStop(0.25, '#d97706');
    poopGrad.addColorStop(0.5, '#fbbf24');
    poopGrad.addColorStop(0.75, '#b45309');
    poopGrad.addColorStop(1, '#78350f');
  } else if (qualityScore >= 75) {
    // Sentient Rich Chestnut Sheen
    poopGrad.addColorStop(0, '#582b0f');
    poopGrad.addColorStop(0.3, '#92400e');
    poopGrad.addColorStop(0.65, '#b45309');
    poopGrad.addColorStop(1, '#582b0f');
  } else if (qualityScore >= 55) {
    // Artisanal Warm Mahogany
    poopGrad.addColorStop(0, '#582b0f');
    poopGrad.addColorStop(0.35, '#78350f');
    poopGrad.addColorStop(0.7, '#854d0e');
    poopGrad.addColorStop(1, '#582b0f');
  } else {
    // Standard / Coarse
    poopGrad.addColorStop(0, '#451a03');
    poopGrad.addColorStop(0.4, '#582b0f');
    poopGrad.addColorStop(1, '#451a03');
  }

  ctx.fillStyle = poopGrad;
  ctx.strokeStyle = qualityScore >= 90 ? '#b45309' : '#381a07';
  ctx.lineWidth = qualityScore >= 90 ? 4 : 3.5;
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

  // Reset shadow for inner accents
  ctx.shadowBlur = 0;

  // Glossy highlight ribbon along the body (widens and glistens with quality)
  const highlightAlpha = qualityScore >= 90 ? 0.75 : qualityScore >= 75 ? 0.55 : 0.32;
  const highlightColor = qualityScore >= 90 ? `rgba(254, 240, 138, ${highlightAlpha})` : `rgba(255, 255, 255, ${highlightAlpha})`;
  ctx.strokeStyle = highlightColor;
  ctx.lineWidth = qualityScore >= 75 ? 5.5 : 4;
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

  // Quality Sparkles for Sentient & Transcendent tiers (Floating soul motes)
  if (qualityScore >= 75 && !isSnapped) {
    const t = Date.now() * 0.004;
    const sparkleCount = qualityScore >= 90 ? 4 : 2;
    for (let s = 0; s < sparkleCount; s++) {
      const nodeIdx = Math.floor(((s * 3 + Math.floor(t)) % Math.max(1, nodes.length - 1)));
      const baseNode = nodes[nodeIdx];
      if (baseNode) {
        const sx = baseNode.x + Math.sin(t + s * 1.8) * (baseNode.radius + 12);
        const sy = baseNode.y + Math.cos(t * 1.3 + s) * 10;
        ctx.fillStyle = qualityScore >= 90 ? '#fde047' : '#e0f2fe';
        ctx.font = '10px serif';
        ctx.fillText('✨', sx, sy);
      }
    }
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
    isSnapped,
    qualityScore,
    qualityTier
  );

  ctx.restore();
}

// Emotive cartoon face: eyes, eyebrows, teeth, mouth, crown, quality glints
function drawEmotiveFace(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  expression: PoopExpression,
  tension: number,
  isPushing: boolean,
  cleanCut: boolean,
  isSnapped: boolean,
  qualityScore: number = 50,
  qualityTier: PoopQualityTier = 'smooth'
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
    // Curious / Happy Sentient eyes (● ●)
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

    // Extra anime sparkle glint if Sentient tier
    if (qualityScore >= 75) {
      ctx.beginPath();
      ctx.arc(-eyeSpacing + 1.5, 0.5, 1.0, 0, Math.PI * 2);
      ctx.arc(eyeSpacing + 1.5, 0.5, 1.0, 0, Math.PI * 2);
      ctx.fill();
    }

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

  // Sentient Blushing Cheeks when quality >= 75
  if (qualityScore >= 75 && !isSnapped) {
    ctx.fillStyle = 'rgba(244, 63, 94, 0.45)';
    ctx.beginPath();
    ctx.ellipse(-eyeSpacing - 2, 4.5, 3.5, 2, 0, 0, Math.PI * 2);
    ctx.ellipse(eyeSpacing + 2, 4.5, 3.5, 2, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Transcendent Floating Crown during active production
  if (qualityTier === 'transcendent' && !cleanCut && !isSnapped) {
    ctx.fillStyle = '#fbbf24';
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-10, -13);
    ctx.lineTo(-7, -21);
    ctx.lineTo(-3, -15);
    ctx.lineTo(0, -23);
    ctx.lineTo(3, -15);
    ctx.lineTo(7, -21);
    ctx.lineTo(10, -13);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  ctx.restore();
}

// Expressive Cartoon Butt, Sculpted Cheeks, Spreading Hands & Porcelain Seat
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
  const now = Date.now();

  // Dynamic motion offsets (clench, high-tension tremble, fart flutter)
  const clenchIn = isPushing ? 5.5 : 0;
  const trembleIntensity = isPushing && tension > 45 ? ((tension - 45) / 55) * 2.8 : 0;
  const trembleX = trembleIntensity > 0 ? Math.sin(now * 0.07) * trembleIntensity : 0;
  const trembleY = trembleIntensity > 0 ? Math.cos(now * 0.085) * (trembleIntensity * 0.7) : 0;
  const fartFlutter = isFarting ? Math.sin(now * 0.095) * 4.5 : 0;

  const totalSpread = Math.max(0, spreadOffset - clenchIn * 0.5) + Math.abs(fartFlutter) * 0.45;
  const buttCX = centerX + trembleX;
  const buttCY = startY + trembleY;

  // 1. Porcelain Toilet Tank Lip & Ergonomic Seat Rim
  // Rear porcelain tank shelf
  const tankGrad = ctx.createLinearGradient(centerX - 115, startY - 85, centerX + 115, startY - 40);
  tankGrad.addColorStop(0, '#e2e8f0');
  tankGrad.addColorStop(0.25, '#ffffff');
  tankGrad.addColorStop(0.75, '#f8fafc');
  tankGrad.addColorStop(1, '#cbd5e1');
  ctx.fillStyle = tankGrad;
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.roundRect(centerX - 118, startY - 78, 236, 44, [18, 18, 6, 6]);
  ctx.fill();
  ctx.stroke();

  // Contoured Toilet Seat Ring (3D beveled porcelain)
  const seatGrad = ctx.createLinearGradient(centerX - 115, startY - 46, centerX + 115, startY + 8);
  seatGrad.addColorStop(0, '#e2e8f0');
  seatGrad.addColorStop(0.18, '#ffffff');
  seatGrad.addColorStop(0.5, '#f8fafc');
  seatGrad.addColorStop(0.82, '#ffffff');
  seatGrad.addColorStop(1, '#cbd5e1');

  ctx.fillStyle = seatGrad;
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.ellipse(centerX, startY - 14, 122, 34, 0, Math.PI * 0.92, Math.PI * 2.08);
  ctx.quadraticCurveTo(centerX + 115, startY + 12, centerX + 76, startY + 14);
  ctx.quadraticCurveTo(centerX, startY + 4, centerX - 76, startY + 14);
  ctx.quadraticCurveTo(centerX - 115, startY + 12, centerX - 122, startY - 14);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Seat Rim Inner Highlight
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(centerX, startY - 18, 108, 24, 0, Math.PI * 1.05, Math.PI * 1.95);
  ctx.stroke();

  // Chrome Flush Handle on Left Tank Corner (Clickable!)
  const isLeverDepressed = isFlushing || flushAnimRef.current > 0;
  const leverAngle = isLeverDepressed ? 0.52 : 0;

  ctx.save();
  ctx.translate(centerX - 122, startY - 52);
  ctx.rotate(leverAngle);

  // Escutcheon plate
  ctx.fillStyle = '#f8fafc';
  ctx.strokeStyle = '#64748b';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(-9, -7, 18, 12, 4);
  ctx.fill();
  ctx.stroke();

  // Chrome lever arm
  ctx.strokeStyle = isLeverDepressed ? '#38bdf8' : '#cbd5e1';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, 17);
  ctx.stroke();

  // Chrome knob
  const knobGrad = ctx.createRadialGradient(-1.5, 16, 1, 0, 18, 6);
  knobGrad.addColorStop(0, '#ffffff');
  knobGrad.addColorStop(0.5, isLeverDepressed ? '#38bdf8' : '#cbd5e1');
  knobGrad.addColorStop(1, isLeverDepressed ? '#0284c7' : '#64748b');
  ctx.fillStyle = knobGrad;
  ctx.beginPath();
  ctx.arc(0, 18, 5.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.restore();

  // Interactive Flush Prompt Badge next to lever when severed
  if (isSevered && !isFlushing) {
    const pulse = 0.7 + Math.sin(now * 0.009) * 0.3;
    ctx.fillStyle = `rgba(14, 165, 233, ${pulse * 0.95})`;
    ctx.strokeStyle = `rgba(2, 132, 199, ${pulse})`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(centerX - 192, startY - 68, 60, 22, 8);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = '800 10px Outfit, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('💧 FLUSH', centerX - 162, startY - 53);
  }

  // 2. Sphincter Tension Heat Aura
  if (tension > 30) {
    const tensionRatio = (tension - 30) / 70;
    const glowGrad = ctx.createRadialGradient(buttCX, buttCY, 12, buttCX, buttCY, 75);
    glowGrad.addColorStop(0, `rgba(239, 68, 68, ${tensionRatio * 0.5})`);
    glowGrad.addColorStop(1, 'rgba(239, 68, 68, 0)');
    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.arc(buttCX, buttCY, 75, 0, Math.PI * 2);
    ctx.fill();
  }

  // 3. Soft Cast Shadow from Butt onto Porcelain Seat
  ctx.fillStyle = 'rgba(15, 23, 42, 0.14)';
  ctx.beginPath();
  ctx.ellipse(buttCX - 34 - totalSpread * 0.55, buttCY + 10, 44, 12, -0.06, 0, Math.PI * 2);
  ctx.ellipse(buttCX + 34 + totalSpread * 0.55, buttCY + 10, 44, 12, 0.06, 0, Math.PI * 2);
  ctx.fill();

  // 4. Sculpted Cartoon Butt Anatomy (Color shifts smoothly with strain!)
  // Interpolate skin palette based on tension (peach -> coral flush -> beet red)
  const skinTop = tension > 78 ? '#ffe4e6' : tension > 48 ? '#ffedd5' : '#fff3e6';
  const skinMid = tension > 78 ? '#fda4af' : tension > 48 ? '#fecdd3' : '#fed7aa';
  const skinShadow = tension > 78 ? '#e11d48' : tension > 48 ? '#fb7185' : '#fb923c';
  const skinOutline = tension > 78 ? '#9f1239' : tension > 48 ? '#c2410c' : '#c2410c';

  const cleftGap = 3 + totalSpread * 0.58;
  const cheekSpreadShift = totalSpread * 0.65;

  // Helper to build a lush sculpted half-butt path (side = -1 left, +1 right)
  const drawSculptedCheek = (side: -1 | 1) => {
    const cx = buttCX + side * (31 + cheekSpreadShift);
    const innerTopX = buttCX + side * (3 + totalSpread * 0.12);
    const hipTopX = buttCX + side * (56 + cheekSpreadShift * 0.45);
    const outerMidX = buttCX + side * (86 + cheekSpreadShift * 0.9 + (isFarting ? fartFlutter * 0.6 : 0));
    const lowerApexX = cx + side * 6;
    const innerCleftX = buttCX + side * cleftGap;

    const topY = buttCY - 74;
    const hipY = buttCY - 58;
    const midY = buttCY - 16;
    const bottomY = buttCY + 16;
    const cleftMidY = buttCY - 16;

    const grad = ctx.createRadialGradient(
      cx - side * 4,
      buttCY - 30,
      8,
      cx,
      buttCY - 12,
      62
    );
    grad.addColorStop(0, skinTop);
    grad.addColorStop(0.55, skinMid);
    grad.addColorStop(1, skinShadow);

    ctx.fillStyle = grad;
    ctx.strokeStyle = skinOutline;
    ctx.lineWidth = 3;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    ctx.beginPath();
    // Waist / Lower-back top bridge
    ctx.moveTo(buttCX, topY + 2);
    ctx.quadraticCurveTo(innerTopX + side * 24, topY - 4, hipTopX, hipY);
    // Outer hip flowing into plump upper-outer glute
    ctx.bezierCurveTo(
      hipTopX + side * 26, hipY + 12,
      outerMidX + side * 6, midY - 12,
      outerMidX, midY
    );
    // Lush round lower butt curve resting on seat
    ctx.bezierCurveTo(
      outerMidX - side * 2, bottomY + 4,
      lowerApexX + side * 22, bottomY + 8,
      innerCleftX + side * 8, bottomY - 4
    );
    // Inward gluteal fold rising back into the cleft
    ctx.bezierCurveTo(
      innerCleftX + side * 2, bottomY - 10,
      innerCleftX, cleftMidY + 8,
      innerCleftX, cleftMidY
    );
    ctx.closePath();
    ctx.fill();

    // Draw outer silhouette stroke cleanly (keep top center seamless)
    ctx.beginPath();
    ctx.moveTo(buttCX, topY + 2);
    ctx.quadraticCurveTo(innerTopX + side * 24, topY - 4, hipTopX, hipY);
    ctx.bezierCurveTo(
      hipTopX + side * 26, hipY + 12,
      outerMidX + side * 6, midY - 12,
      outerMidX, midY
    );
    ctx.bezierCurveTo(
      outerMidX - side * 2, bottomY + 4,
      lowerApexX + side * 22, bottomY + 8,
      innerCleftX + side * 8, bottomY - 4
    );
    ctx.bezierCurveTo(
      innerCleftX + side * 2, bottomY - 10,
      innerCleftX, cleftMidY + 8,
      innerCleftX, cleftMidY - 8
    );
    ctx.stroke();

    // Inner Cleft Y-Crease Shadow
    ctx.strokeStyle = tension > 78 ? 'rgba(159, 18, 57, 0.55)' : 'rgba(154, 52, 18, 0.45)';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(buttCX, buttCY - 46);
    ctx.quadraticCurveTo(
      buttCX + side * (2 + totalSpread * 0.2),
      buttCY - 30,
      innerCleftX,
      cleftMidY - 4
    );
    ctx.stroke();

    // Glossy Specular Highlight Crescent on Cheek Crest
    ctx.fillStyle = 'rgba(255, 255, 255, 0.42)';
    ctx.beginPath();
    ctx.ellipse(
      cx - side * 2,
      buttCY - 28,
      19,
      11,
      side * 0.25,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Soft Secondary Rim Sheen on Lower Curve
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx + side * 12, buttCY - 8, 22, side === -1 ? Math.PI * 0.55 : Math.PI * 0.1, side === -1 ? Math.PI * 0.9 : Math.PI * 0.45);
    ctx.stroke();

    // Cute Lower-Back Dimple of Venus
    ctx.strokeStyle = tension > 78 ? 'rgba(190, 18, 60, 0.4)' : 'rgba(194, 65, 12, 0.32)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(buttCX + side * 22, buttCY - 55, 4.5, 0.2 * Math.PI, 0.8 * Math.PI);
    ctx.stroke();

    // Muscle Flex Arcs when Straining!
    if (isPushing) {
      ctx.strokeStyle = tension > 70 ? 'rgba(159, 18, 57, 0.45)' : 'rgba(194, 65, 12, 0.35)';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(cx + side * 10, buttCY - 22, 16, side === -1 ? 1.8 : 0.7, side === -1 ? 2.5 : 1.4);
      ctx.stroke();
    }
  };

  // Seamless upper lower-back bridge fill before stroking individual cheeks
  ctx.fillStyle = skinTop;
  ctx.beginPath();
  ctx.roundRect(buttCX - 54 - cheekSpreadShift * 0.4, buttCY - 75, 108 + cheekSpreadShift * 0.8, 38, 16);
  ctx.fill();

  // Draw Left & Right Sculpted Cheeks
  drawSculptedCheek(-1);
  drawSculptedCheek(1);

  // Subtle Lower-Back Vertical Spine Groove
  ctx.strokeStyle = tension > 78 ? 'rgba(190, 18, 60, 0.25)' : 'rgba(194, 65, 12, 0.2)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(buttCX, buttCY - 70);
  ctx.lineTo(buttCX, buttCY - 46);
  ctx.stroke();

  // 5. Pulsing Comic Effort Vein Marks (💢) when Tension > 65%
  if (tension > 65 && !isSevered) {
    const pulseScale = 0.85 + Math.sin(now * 0.02) * 0.2;
    const drawStrainVein = (vx: number, vy: number) => {
      ctx.save();
      ctx.translate(vx, vy);
      ctx.scale(pulseScale, pulseScale);
      ctx.strokeStyle = '#be123c';
      ctx.lineWidth = 2.2;
      ctx.lineCap = 'round';
      for (let q = 0; q < 4; q++) {
        ctx.rotate(Math.PI / 2);
        ctx.beginPath();
        ctx.moveTo(2, 2);
        ctx.quadraticCurveTo(4, 5, 7, 3);
        ctx.stroke();
      }
      ctx.restore();
    };
    drawStrainVein(buttCX - 56 - cheekSpreadShift * 0.5, buttCY - 46);
    if (tension > 82) {
      drawStrainVein(buttCX + 56 + cheekSpreadShift * 0.5, buttCY - 46);
    }
  }

  // 6. Central Pleated Sphincter Aperture
  const ringWidth = isSevered ? 22 : (isPushing ? 33 : 27) + totalSpread * 0.35;
  const ringHeight = isSevered ? 9 : isPushing ? 16 : 12;

  // Outer muscular sphincter halo
  const rimGrad = ctx.createRadialGradient(buttCX, buttCY, 3, buttCX, buttCY, ringWidth);
  if (tension > 75) {
    rimGrad.addColorStop(0, '#fca5a5');
    rimGrad.addColorStop(0.55, '#ef4444');
    rimGrad.addColorStop(1, '#991b1b');
  } else {
    rimGrad.addColorStop(0, '#fecaca');
    rimGrad.addColorStop(0.55, '#f87171');
    rimGrad.addColorStop(1, '#b91c1c');
  }

  ctx.fillStyle = rimGrad;
  ctx.beginPath();
  ctx.ellipse(buttCX, buttCY, ringWidth, ringHeight, 0, 0, Math.PI * 2);
  ctx.fill();

  // Radial sphincter pucker folds
  ctx.strokeStyle = 'rgba(127, 29, 29, 0.45)';
  ctx.lineWidth = 1.4;
  const foldCount = 10;
  for (let f = 0; f < foldCount; f++) {
    const a = (f * Math.PI * 2) / foldCount;
    ctx.beginPath();
    ctx.moveTo(buttCX + Math.cos(a) * (ringWidth * 0.38), buttCY + Math.sin(a) * (ringHeight * 0.38));
    ctx.lineTo(buttCX + Math.cos(a) * (ringWidth * 0.92), buttCY + Math.sin(a) * (ringHeight * 0.92));
    ctx.stroke();
  }

  // Deep Inner Cavity
  ctx.fillStyle = '#3b1206';
  ctx.beginPath();
  ctx.ellipse(buttCX, buttCY, ringWidth * 0.62, ringHeight * 0.54, 0, 0, Math.PI * 2);
  ctx.fill();

  // 7. Expressive Cartoon Hands Pulling Cheeks Wide When Spread!
  if (spreadOffset > 3) {
    const handAlpha = Math.min(1, spreadOffset / 12);
    ctx.save();
    ctx.globalAlpha = handAlpha;

    const drawSpreadingHand = (side: -1 | 1) => {
      const gripX = buttCX + side * (78 + cheekSpreadShift * 0.9);
      const gripY = buttCY - 22;

      ctx.save();
      ctx.translate(gripX, gripY);
      ctx.scale(side, 1); // Mirror cleanly for left (-1) and right (+1)

      // Palm / wrist entering from side
      ctx.fillStyle = '#fde68a'; // Expressive comic glove/skin tone contrast or warm peach
      const handGrad = ctx.createLinearGradient(0, -14, 34, 18);
      handGrad.addColorStop(0, '#fff7ed');
      handGrad.addColorStop(0.6, '#fed7aa');
      handGrad.addColorStop(1, '#fdba74');

      ctx.fillStyle = handGrad;
      ctx.strokeStyle = '#9a3412';
      ctx.lineWidth = 2.4;
      ctx.lineJoin = 'round';

      // Wrist + Palm
      ctx.beginPath();
      ctx.moveTo(34, -10);
      ctx.quadraticCurveTo(18, -18, 6, -14);
      ctx.quadraticCurveTo(-2, -6, 2, 10);
      ctx.quadraticCurveTo(14, 18, 34, 10);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Gripping Thumb above
      ctx.beginPath();
      ctx.ellipse(6, -16, 10, 5.5, -0.35, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // 4 Curled Fingers pressing inward onto cheek flank
      const fingerOffsets = [-7, -1, 5, 11];
      for (let fi = 0; fi < fingerOffsets.length; fi++) {
        const fy = fingerOffsets[fi];
        ctx.beginPath();
        ctx.roundRect(-8, fy - 3, 14, 6.2, 3);
        ctx.fill();
        ctx.stroke();
      }
      ctx.restore();

      // Crisp outward cartoon speed lines
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2.8;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(gripX + side * 32, gripY - 8);
      ctx.lineTo(gripX + side * 48, gripY - 11);
      ctx.moveTo(gripX + side * 36, gripY + 2);
      ctx.lineTo(gripX + side * 54, gripY + 2);
      ctx.moveTo(gripX + side * 32, gripY + 12);
      ctx.lineTo(gripX + side * 46, gripY + 15);
      ctx.stroke();
    };

    drawSpreadingHand(-1);
    drawSpreadingHand(1);
    ctx.restore();
  }

  // 8. Fart Shockwave Crescents when Farting
  if (isFarting) {
    const waveOffset = ((now % 240) / 240) * 20;
    ctx.strokeStyle = `rgba(132, 204, 22, ${1 - waveOffset / 22})`;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(buttCX, buttCY + 8 + waveOffset, 28 + waveOffset, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.stroke();
  }

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
