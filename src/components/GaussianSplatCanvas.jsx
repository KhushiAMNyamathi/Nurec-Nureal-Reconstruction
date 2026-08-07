import { useEffect, useRef } from "react";

export default function GaussianSplatCanvas({ width = 300, height = 160 }) {
  const ref = useRef();

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    draw(ctx, width, height);
  }, [width, height]);

  return (
    <canvas
      ref={ref}
      width={width}
      height={height}
      style={{ width: "100%", borderRadius: "var(--radius-md)", display: "block" }}
    />
  );
}

function draw(ctx, W, H) {
  ctx.fillStyle = "#111";
  ctx.fillRect(0, 0, W, H);

  // Sky / ambient
  ctx.fillStyle = "#1a1a2e";
  ctx.fillRect(0, 0, W, H * 0.5);

  const layers = [
    { color: "#0d1a08", count: 80, scaleX: 3, scaleY: 1.5 },
    { color: "#1a3010", count: 100, scaleX: 2, scaleY: 1 },
    { color: "#2a4a18", count: 120, scaleX: 1.4, scaleY: 0.7 },
    { color: "#3a6020", count: 80, scaleX: 1, scaleY: 0.5 },
    { color: "#76b900", count: 30, scaleX: 0.5, scaleY: 0.3 },
    { color: "#bbbbbb", count: 40, scaleX: 0.3, scaleY: 0.2 },
  ];

  layers.forEach(({ color, count, scaleX, scaleY }) => {
    for (let i = 0; i < count; i++) {
      const x = Math.random() * W;
      const y = H * 0.3 + Math.random() * H * 0.7;
      const rx = (Math.random() * 20 + 6) * scaleX;
      const ry = (Math.random() * 8 + 3) * scaleY;
      const angle = (Math.random() - 0.5) * 0.4;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.globalAlpha = Math.random() * 0.3 + 0.08;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  });

  // Floor reflection
  ctx.globalAlpha = 0.5;
  const grad = ctx.createLinearGradient(0, H * 0.7, 0, H);
  grad.addColorStop(0, "rgba(200,170,90,0.4)");
  grad.addColorStop(1, "rgba(50,40,20,0.1)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, H * 0.7, W, H * 0.3);

  // Shelf uprights
  ctx.globalAlpha = 0.6;
  ctx.fillStyle = "#c0a060";
  for (let x = 0.15; x < 1; x += 0.18) {
    ctx.fillRect(x * W - 2, H * 0.15, 4, H * 0.6);
  }

  // Shelf horizontals
  ctx.fillStyle = "#8a7040";
  for (let y = 0.2; y < 0.75; y += 0.18) {
    ctx.fillRect(W * 0.1, y * H, W * 0.8, 3);
  }

  ctx.globalAlpha = 1;

  // Overlay: axes indicator
  const ax = W - 22, ay = H - 22;
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = "#ff5555"; ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(ax + 14, ay); ctx.stroke();
  ctx.strokeStyle = "#55ff55"; ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(ax, ay - 14); ctx.stroke();
  ctx.strokeStyle = "#5555ff"; ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(ax - 9, ay + 9); ctx.stroke();
}
