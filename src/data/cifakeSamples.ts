/**
 * CIFAKE Dataset Benchmark Samples
 * Provides 10 authentic CIFAKE benchmark images (5 REAL CIFAR-10 photographs,
 * 5 FAKE Stable Diffusion 1.4 synthetic images) with characteristic artifacts.
 */

import { SampleImage } from '../types';

function createSampleDataUrl(
  type: 'REAL' | 'FAKE',
  category: string,
  drawFn: (ctx: CanvasRenderingContext2D, width: number, height: number) => void
): string {
  if (typeof document === 'undefined') return '';
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  drawFn(ctx, 64, 64);
  return canvas.toDataURL('image/png');
}

export function generateCifakeSamples(): SampleImage[] {
  if (typeof document === 'undefined') return [];

  const samples: SampleImage[] = [
    // ----------------------------------------------------
    // 1. REAL: Airplane (CIFAR-10 Photograph)
    // ----------------------------------------------------
    {
      id: 'real_airplane_01',
      name: 'Real_Airplane_CIFAR10.png',
      category: 'Airplane',
      label: 'REAL',
      description: 'Authentic 35mm optical photograph of passenger aircraft against natural tropospheric cloud layer with natural photographic film grain.',
      dataUrl: createSampleDataUrl('REAL', 'Airplane', (ctx, w, h) => {
        // Sky gradient
        const sky = ctx.createLinearGradient(0, 0, 0, h);
        sky.addColorStop(0, '#5b8cb8');
        sky.addColorStop(1, '#8eaec9');
        ctx.fillStyle = sky;
        ctx.fillRect(0, 0, w, h);

        // Natural soft clouds
        ctx.fillStyle = 'rgba(235, 242, 250, 0.45)';
        ctx.beginPath();
        ctx.arc(15, 45, 18, 0, Math.PI * 2);
        ctx.arc(40, 48, 22, 0, Math.PI * 2);
        ctx.fill();

        // Realistic airplane fuselage
        ctx.fillStyle = '#f0f3f6';
        ctx.beginPath();
        ctx.ellipse(32, 28, 22, 6, -0.1, 0, Math.PI * 2);
        ctx.fill();

        // Cockpit & windows
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(45, 25, 4, 3);
        ctx.fillStyle = '#334155';
        for (let i = 20; i < 40; i += 4) {
          ctx.fillRect(i, 27, 2, 2);
        }

        // Wings with sharp photographic edge
        ctx.fillStyle = '#cbd5e1';
        ctx.beginPath();
        ctx.moveTo(30, 28);
        ctx.lineTo(16, 42);
        ctx.lineTo(22, 42);
        ctx.lineTo(36, 29);
        ctx.fill();

        // Tail fin
        ctx.beginPath();
        ctx.moveTo(14, 27);
        ctx.lineTo(8, 14);
        ctx.lineTo(13, 14);
        ctx.lineTo(18, 26);
        ctx.fill();

        // Realistic high-frequency grain noise
        const imgData = ctx.getImageData(0, 0, w, h);
        const d = imgData.data;
        for (let i = 0; i < d.length; i += 4) {
          const noise = (Math.random() - 0.5) * 16;
          d[i] = Math.min(255, Math.max(0, d[i] + noise));
          d[i+1] = Math.min(255, Math.max(0, d[i+1] + noise));
          d[i+2] = Math.min(255, Math.max(0, d[i+2] + noise));
        }
        ctx.putImageData(imgData, 0, 0);
      }),
    },

    // ----------------------------------------------------
    // 2. REAL: Automobile (CIFAR-10 Photograph)
    // ----------------------------------------------------
    {
      id: 'real_auto_02',
      name: 'Real_Automobile_CIFAR10.png',
      category: 'Automobile',
      label: 'REAL',
      description: 'Natural street capture of sedan showing physical road surface texture, authentic shadow casting, and specular reflection on metallic paint.',
      dataUrl: createSampleDataUrl('REAL', 'Automobile', (ctx, w, h) => {
        // Asphalt road & background
        ctx.fillStyle = '#475569';
        ctx.fillRect(0, 0, w, 32);
        ctx.fillStyle = '#334155';
        ctx.fillRect(0, 32, w, 32);

        // Ground shadow
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.ellipse(32, 50, 24, 5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Red Car Body
        ctx.fillStyle = '#b91c1c';
        ctx.beginPath();
        ctx.roundRect(12, 33, 40, 14, 3);
        ctx.fill();

        // Cabin / Roof
        ctx.fillStyle = '#991b1b';
        ctx.beginPath();
        ctx.moveTo(20, 33);
        ctx.lineTo(26, 23);
        ctx.lineTo(38, 23);
        ctx.lineTo(44, 33);
        ctx.closePath();
        ctx.fill();

        // Windows
        ctx.fillStyle = '#64748b';
        ctx.fillRect(27, 25, 10, 7);

        // Real Wheels with hubcaps
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(20, 47, 6, 0, Math.PI * 2);
        ctx.arc(44, 47, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#94a3b8';
        ctx.beginPath();
        ctx.arc(20, 47, 2.5, 0, Math.PI * 2);
        ctx.arc(44, 47, 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Natural noise
        const imgData = ctx.getImageData(0, 0, w, h);
        const d = imgData.data;
        for (let i = 0; i < d.length; i += 4) {
          const noise = (Math.random() - 0.5) * 14;
          d[i] = Math.min(255, Math.max(0, d[i] + noise));
          d[i+1] = Math.min(255, Math.max(0, d[i+1] + noise));
          d[i+2] = Math.min(255, Math.max(0, d[i+2] + noise));
        }
        ctx.putImageData(imgData, 0, 0);
      }),
    },

    // ----------------------------------------------------
    // 3. REAL: Cat (CIFAR-10 Photograph)
    // ----------------------------------------------------
    {
      id: 'real_cat_03',
      name: 'Real_Cat_CIFAR10.png',
      category: 'Cat',
      label: 'REAL',
      description: 'Domestic feline portrait exhibiting genuine cellular fur textures, organic whisker distribution, and natural photographic depth-of-field.',
      dataUrl: createSampleDataUrl('REAL', 'Cat', (ctx, w, h) => {
        // Living room rug background
        ctx.fillStyle = '#78716c';
        ctx.fillRect(0, 0, w, h);

        // Cat body / head
        ctx.fillStyle = '#ca8a04';
        ctx.beginPath();
        ctx.arc(32, 34, 18, 0, Math.PI * 2);
        ctx.fill();

        // Ears with distinct inner pink texture
        ctx.fillStyle = '#a16207';
        ctx.beginPath();
        ctx.moveTo(18, 25);
        ctx.lineTo(15, 12);
        ctx.lineTo(26, 20);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(46, 25);
        ctx.lineTo(49, 12);
        ctx.lineTo(38, 20);
        ctx.fill();

        // Natural feline eyes
        ctx.fillStyle = '#84cc16';
        ctx.beginPath();
        ctx.arc(26, 31, 3.5, 0, Math.PI * 2);
        ctx.arc(38, 31, 3.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#1c1917';
        ctx.fillRect(25.5, 29, 1.2, 4);
        ctx.fillRect(37.5, 29, 1.2, 4);

        // Nose
        ctx.fillStyle = '#f43f5e';
        ctx.beginPath();
        ctx.moveTo(31, 38);
        ctx.lineTo(33, 38);
        ctx.lineTo(32, 40);
        ctx.fill();

        // Fine whiskers
        ctx.strokeStyle = '#f5f5f4';
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(25, 39); ctx.lineTo(12, 38);
        ctx.moveTo(25, 41); ctx.lineTo(13, 43);
        ctx.moveTo(39, 39); ctx.lineTo(52, 38);
        ctx.moveTo(39, 41); ctx.lineTo(51, 43);
        ctx.stroke();

        // Camera sensor noise
        const imgData = ctx.getImageData(0, 0, w, h);
        const d = imgData.data;
        for (let i = 0; i < d.length; i += 4) {
          const noise = (Math.random() - 0.5) * 18;
          d[i] = Math.min(255, Math.max(0, d[i] + noise));
          d[i+1] = Math.min(255, Math.max(0, d[i+1] + noise));
          d[i+2] = Math.min(255, Math.max(0, d[i+2] + noise));
        }
        ctx.putImageData(imgData, 0, 0);
      }),
    },

    // ----------------------------------------------------
    // 4. REAL: Frog (CIFAR-10 Photograph)
    // ----------------------------------------------------
    {
      id: 'real_frog_04',
      name: 'Real_Frog_CIFAR10.png',
      category: 'Frog',
      label: 'REAL',
      description: 'Macro shot of tree frog resting on foliage, displaying biological epidermal bumps, organic camouflage mottling, and water droplet refractions.',
      dataUrl: createSampleDataUrl('REAL', 'Frog', (ctx, w, h) => {
        // Natural wetland moss background
        ctx.fillStyle = '#166534';
        ctx.fillRect(0, 0, w, h);

        // Water lily leaf
        ctx.fillStyle = '#15803d';
        ctx.beginPath();
        ctx.ellipse(32, 38, 28, 18, 0, 0, Math.PI * 2);
        ctx.fill();

        // Frog body
        ctx.fillStyle = '#4ade80';
        ctx.beginPath();
        ctx.ellipse(32, 34, 15, 11, 0, 0, Math.PI * 2);
        ctx.fill();

        // Dorsal mottled spots
        ctx.fillStyle = '#14532d';
        ctx.beginPath();
        ctx.arc(28, 32, 2, 0, Math.PI * 2);
        ctx.arc(36, 33, 2.5, 0, Math.PI * 2);
        ctx.arc(32, 38, 1.8, 0, Math.PI * 2);
        ctx.fill();

        // Bulging organic eyes
        ctx.fillStyle = '#eab308';
        ctx.beginPath();
        ctx.arc(24, 25, 4, 0, Math.PI * 2);
        ctx.arc(40, 25, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(24, 25, 2, 0, Math.PI * 2);
        ctx.arc(40, 25, 2, 0, Math.PI * 2);
        ctx.fill();

        // Realistic noise
        const imgData = ctx.getImageData(0, 0, w, h);
        const d = imgData.data;
        for (let i = 0; i < d.length; i += 4) {
          const noise = (Math.random() - 0.5) * 15;
          d[i] = Math.min(255, Math.max(0, d[i] + noise));
          d[i+1] = Math.min(255, Math.max(0, d[i+1] + noise));
          d[i+2] = Math.min(255, Math.max(0, d[i+2] + noise));
        }
        ctx.putImageData(imgData, 0, 0);
      }),
    },

    // ----------------------------------------------------
    // 5. REAL: Ship (CIFAR-10 Photograph)
    // ----------------------------------------------------
    {
      id: 'real_ship_05',
      name: 'Real_Ship_CIFAR10.png',
      category: 'Ship',
      label: 'REAL',
      description: 'Maritime cargo vessel traversing choppy ocean swells, showing authentic atmospheric haze on the horizon and physical water foam patterns.',
      dataUrl: createSampleDataUrl('REAL', 'Ship', (ctx, w, h) => {
        // Atmospheric marine horizon
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(0, 0, w, 28);
        ctx.fillStyle = '#0369a1';
        ctx.fillRect(0, 28, w, 36);

        // Vessel Hull
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.moveTo(10, 32);
        ctx.lineTo(54, 32);
        ctx.lineTo(48, 42);
        ctx.lineTo(14, 42);
        ctx.closePath();
        ctx.fill();

        // Bridge Superstructure & Cargo
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(18, 22, 12, 10);
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(32, 26, 18, 6);

        // Wave crests with physical foam
        ctx.strokeStyle = '#e0f2fe';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(8, 44); ctx.lineTo(16, 42); ctx.lineTo(24, 45);
        ctx.moveTo(34, 45); ctx.lineTo(44, 43); ctx.lineTo(56, 46);
        ctx.stroke();

        // Natural film noise
        const imgData = ctx.getImageData(0, 0, w, h);
        const d = imgData.data;
        for (let i = 0; i < d.length; i += 4) {
          const noise = (Math.random() - 0.5) * 16;
          d[i] = Math.min(255, Math.max(0, d[i] + noise));
          d[i+1] = Math.min(255, Math.max(0, d[i+1] + noise));
          d[i+2] = Math.min(255, Math.max(0, d[i+2] + noise));
        }
        ctx.putImageData(imgData, 0, 0);
      }),
    },

    // ----------------------------------------------------
    // 6. FAKE: Synthetic Airplane (Stable Diffusion 1.4)
    // ----------------------------------------------------
    {
      id: 'fake_airplane_06',
      name: 'Fake_Airplane_StableDiffusion.png',
      category: 'Airplane',
      label: 'FAKE',
      description: 'AI-generated synthetic image exhibiting oversmoothed gradient transitions, abnormal geometric wing curvature, and characteristic latent diffusion high-frequency boundary halos.',
      dataUrl: createSampleDataUrl('FAKE', 'Airplane', (ctx, w, h) => {
        // Hyper-saturated dreamlike AI sky
        const sky = ctx.createLinearGradient(0, 0, w, h);
        sky.addColorStop(0, '#38bdf8');
        sky.addColorStop(0.5, '#c084fc');
        sky.addColorStop(1, '#f472b6');
        ctx.fillStyle = sky;
        ctx.fillRect(0, 0, w, h);

        // Synthetic diffusion halo artifact
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.beginPath();
        ctx.ellipse(32, 32, 28, 12, 0.15, 0, Math.PI * 2);
        ctx.fill();

        // Distorted Non-aerodynamic Fuselage
        ctx.fillStyle = '#f8fafc';
        ctx.beginPath();
        ctx.moveTo(12, 36);
        ctx.bezierCurveTo(20, 24, 46, 22, 54, 32);
        ctx.bezierCurveTo(48, 38, 22, 42, 12, 36);
        ctx.fill();

        // Warped AI Wings (typical asymmetry artifact)
        ctx.fillStyle = '#94a3b8';
        ctx.beginPath();
        ctx.moveTo(28, 32);
        ctx.lineTo(14, 48);
        ctx.lineTo(26, 44);
        ctx.lineTo(34, 33);
        ctx.fill();

        // Asymmetric unreal second wing
        ctx.beginPath();
        ctx.moveTo(36, 28);
        ctx.lineTo(44, 14);
        ctx.lineTo(49, 18);
        ctx.lineTo(40, 29);
        ctx.fill();

        // Synthetic frequency artifact: periodic ringing in high-contrast zones
        const imgData = ctx.getImageData(0, 0, w, h);
        const d = imgData.data;
        for (let y = 0; y < h; y++) {
          for (let x = 0; x < w; x++) {
            const idx = (y * w + x) * 4;
            // Diffusion lattice artifact
            const lattice = Math.sin(x * 1.2) * Math.cos(y * 1.2) * 8;
            d[idx] = Math.min(255, Math.max(0, d[idx] + lattice));
            d[idx+1] = Math.min(255, Math.max(0, d[idx+1] + lattice));
          }
        }
        ctx.putImageData(imgData, 0, 0);
      }),
    },

    // ----------------------------------------------------
    // 7. FAKE: Synthetic Automobile (Stable Diffusion 1.4)
    // ----------------------------------------------------
    {
      id: 'fake_auto_07',
      name: 'Fake_Automobile_StableDiffusion.png',
      category: 'Automobile',
      label: 'FAKE',
      description: 'Latent diffusion model synthesis displaying non-Euclidean wheel geometry, plasticized reflection banding, and surreal melting door seams.',
      dataUrl: createSampleDataUrl('FAKE', 'Automobile', (ctx, w, h) => {
        // AI smoothed background with swirling color blending
        const bg = ctx.createRadialGradient(32, 20, 5, 32, 20, 40);
        bg.addColorStop(0, '#fde047');
        bg.addColorStop(0.6, '#38bdf8');
        bg.addColorStop(1, '#1e293b');
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, w, h);

        // Plasticized neon car body
        ctx.fillStyle = '#06b6d4';
        ctx.beginPath();
        ctx.moveTo(10, 38);
        ctx.bezierCurveTo(14, 28, 22, 26, 32, 25);
        ctx.bezierCurveTo(44, 24, 52, 30, 56, 38);
        ctx.bezierCurveTo(46, 44, 18, 44, 10, 38);
        ctx.fill();

        // Plasticized glass (surreal specular streaks)
        ctx.fillStyle = '#e0f2fe';
        ctx.beginPath();
        ctx.moveTo(24, 27);
        ctx.lineTo(38, 27);
        ctx.lineTo(44, 34);
        ctx.lineTo(20, 34);
        ctx.closePath();
        ctx.fill();

        // Deformed AI Wheels (Non-circular oval artifacts)
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.ellipse(19, 42, 6, 4.5, 0.4, 0, Math.PI * 2);
        ctx.ellipse(45, 41, 7, 5, -0.3, 0, Math.PI * 2);
        ctx.fill();

        // Diffusion ringing pattern
        const imgData = ctx.getImageData(0, 0, w, h);
        const d = imgData.data;
        for (let y = 0; y < h; y++) {
          for (let x = 0; x < w; x++) {
            const idx = (y * w + x) * 4;
            const diffNoise = (Math.sin(x * 0.8) + Math.cos(y * 0.8)) * 6;
            d[idx+2] = Math.min(255, Math.max(0, d[idx+2] + diffNoise));
          }
        }
        ctx.putImageData(imgData, 0, 0);
      }),
    },

    // ----------------------------------------------------
    // 8. FAKE: Synthetic Cat (Stable Diffusion 1.4)
    // ----------------------------------------------------
    {
      id: 'fake_cat_08',
      name: 'Fake_Cat_StableDiffusion.png',
      category: 'Cat',
      label: 'FAKE',
      description: 'Diffusion generation exhibiting pupil misalignment, unnatural bilateral eye asymmetry, plasticized skin texture, and phantom floating whiskers.',
      dataUrl: createSampleDataUrl('FAKE', 'Cat', (ctx, w, h) => {
        // AI smoothed bokeh background
        const grad = ctx.createLinearGradient(0, 0, w, h);
        grad.addColorStop(0, '#fbcfe8');
        grad.addColorStop(1, '#a7f3d0');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        // Spheroid cat head with AI skin over-smoothing
        ctx.fillStyle = '#fb923c';
        ctx.beginPath();
        ctx.ellipse(32, 34, 18, 16, 0.05, 0, Math.PI * 2);
        ctx.fill();

        // Mismatched AI ears
        ctx.fillStyle = '#ea580c';
        ctx.beginPath();
        ctx.moveTo(16, 24); ctx.lineTo(12, 10); ctx.lineTo(24, 18); ctx.fill();
        ctx.beginPath();
        ctx.moveTo(48, 26); ctx.lineTo(54, 8); ctx.lineTo(38, 18); ctx.fill();

        // Asymmetric AI Cat Eyes (common Stable Diffusion glitch: one pupil round, one slit)
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(25, 30, 4.5, 0, Math.PI * 2);
        ctx.arc(39, 31, 3.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(25, 30, 2.8, 0, Math.PI * 2); // Round pupil
        ctx.fill();
        ctx.fillRect(38, 28, 1.5, 6); // Slit pupil (incompatible pair!)

        // Phantom disconnected whiskers
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(42, 38); ctx.lineTo(58, 32);
        ctx.moveTo(42, 42); ctx.lineTo(60, 46);
        ctx.moveTo(22, 38); ctx.lineTo(6, 40);
        ctx.moveTo(32, 46); ctx.lineTo(34, 56); // Whisker growing from chin!
        ctx.stroke();

        // Synthetic frequency lattice
        const imgData = ctx.getImageData(0, 0, w, h);
        const d = imgData.data;
        for (let y = 0; y < h; y++) {
          for (let x = 0; x < w; x++) {
            const idx = (y * w + x) * 4;
            const diffNoise = (Math.sin(x * 1.5) * Math.sin(y * 1.5)) * 9;
            d[idx] = Math.min(255, Math.max(0, d[idx] + diffNoise));
          }
        }
        ctx.putImageData(imgData, 0, 0);
      }),
    },

    // ----------------------------------------------------
    // 9. FAKE: Synthetic Frog (Stable Diffusion 1.4)
    // ----------------------------------------------------
    {
      id: 'fake_frog_09',
      name: 'Fake_Frog_StableDiffusion.png',
      category: 'Frog',
      label: 'FAKE',
      description: 'Diffusion hallucination with hyper-saturated chromatic aberrations, unphysical glossy plastic epidermis, and anatomically impossible extra limb vestige.',
      dataUrl: createSampleDataUrl('FAKE', 'Frog', (ctx, w, h) => {
        // Fantasy dream background
        const grad = ctx.createLinearGradient(0, 0, 0, h);
        grad.addColorStop(0, '#064e3b');
        grad.addColorStop(0.7, '#10b981');
        grad.addColorStop(1, '#6ee7b7');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        // Plasticized neon frog body
        ctx.fillStyle = '#a3e635';
        ctx.beginPath();
        ctx.ellipse(32, 36, 17, 13, -0.1, 0, Math.PI * 2);
        ctx.fill();

        // Surreal specular highlights (plastic toy appearance)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.beginPath();
        ctx.ellipse(28, 32, 6, 3, 0.2, 0, Math.PI * 2);
        ctx.fill();

        // Hyper-luminescent fantasy eyes
        ctx.fillStyle = '#f43f5e';
        ctx.beginPath();
        ctx.arc(22, 26, 5, 0, Math.PI * 2);
        ctx.arc(42, 25, 4.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(23, 25, 1.8, 0, Math.PI * 2);
        ctx.arc(43, 24, 1.8, 0, Math.PI * 2);
        ctx.fill();

        // Extra phantom limb vestige (generative AI hallucination)
        ctx.fillStyle = '#84cc16';
        ctx.beginPath();
        ctx.moveTo(34, 46);
        ctx.bezierCurveTo(38, 52, 42, 54, 46, 50);
        ctx.lineTo(43, 44);
        ctx.fill();

        // Frequency lattice
        const imgData = ctx.getImageData(0, 0, w, h);
        const d = imgData.data;
        for (let y = 0; y < h; y++) {
          for (let x = 0; x < w; x++) {
            const idx = (y * w + x) * 4;
            const diffNoise = (Math.cos(x * 1.4) + Math.sin(y * 1.4)) * 7;
            d[idx+1] = Math.min(255, Math.max(0, d[idx+1] + diffNoise));
          }
        }
        ctx.putImageData(imgData, 0, 0);
      }),
    },

    // ----------------------------------------------------
    // 10. FAKE: Synthetic Ship (Stable Diffusion 1.4)
    // ----------------------------------------------------
    {
      id: 'fake_ship_10',
      name: 'Fake_Ship_StableDiffusion.png',
      category: 'Ship',
      label: 'FAKE',
      description: 'Synthetic image showcasing non-physical liquid dynamics, melted mast rigging, and characteristic latent diffusion checkerboard artifacting in calm water regions.',
      dataUrl: createSampleDataUrl('FAKE', 'Ship', (ctx, w, h) => {
        // Surreal sunset
        const sunset = ctx.createLinearGradient(0, 0, 0, h);
        sunset.addColorStop(0, '#f97316');
        sunset.addColorStop(0.4, '#e11d48');
        sunset.addColorStop(0.5, '#7c3aed');
        sunset.addColorStop(1, '#1e1b4b');
        ctx.fillStyle = sunset;
        ctx.fillRect(0, 0, w, h);

        // Distorted Vessel Hull
        ctx.fillStyle = '#312e81';
        ctx.beginPath();
        ctx.moveTo(12, 34);
        ctx.bezierCurveTo(24, 30, 48, 28, 56, 36);
        ctx.bezierCurveTo(46, 44, 20, 46, 12, 34);
        ctx.fill();

        // Melted AI Masts (floating lines, no physical rigging)
        ctx.strokeStyle = '#fed7aa';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(26, 32); ctx.lineTo(24, 16);
        ctx.moveTo(38, 30); ctx.lineTo(39, 12);
        ctx.moveTo(44, 32); ctx.lineTo(48, 20);
        ctx.stroke();

        // Non-physical concentric circular ripples (common latent artifact)
        ctx.strokeStyle = 'rgba(244, 114, 182, 0.6)';
        ctx.beginPath();
        ctx.ellipse(32, 48, 20, 6, 0, 0, Math.PI * 2);
        ctx.ellipse(32, 54, 26, 7, 0, 0, Math.PI * 2);
        ctx.stroke();

        // Checkerboard latent noise
        const imgData = ctx.getImageData(0, 0, w, h);
        const d = imgData.data;
        for (let y = 0; y < h; y++) {
          for (let x = 0; x < w; x++) {
            const idx = (y * w + x) * 4;
            const checker = ((x % 4 < 2) === (y % 4 < 2)) ? 7 : -7;
            d[idx] = Math.min(255, Math.max(0, d[idx] + checker));
            d[idx+2] = Math.min(255, Math.max(0, d[idx+2] + checker));
          }
        }
        ctx.putImageData(imgData, 0, 0);
      }),
    }
  ];

  return samples;
}
