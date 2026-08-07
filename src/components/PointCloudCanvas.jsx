import { useEffect, useRef } from "react";

export default function PointCloudCanvas({ width = 300, height = 150 }) {
  const ref = useRef();

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#0a0a14";
    ctx.fillRect(0, 0, width, height);

    // Draw point cloud
    for (let i = 0; i < 900; i++) {
      const x = width / 2 + (Math.random() - 0.5) * width * 0.9 + Math.sin(i * 0.1) * 8;
      const y = height / 2 + (Math.random() - 0.5) * height * 0.8 + Math.cos(i * 0.08) * 6;
      const size = Math.random() * 1.5 + 0.3;
      const bright = Math.random();
      ctx.fillStyle = bright > 0.7 ? "#76b900" : bright > 0.4 ? "#4a7a00" : "#1a2a00";
      ctx.globalAlpha = 0.5 + Math.random() * 0.5;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }

    // Camera frustums
    ctx.globalAlpha = 1;
    const cameras = [0.1, 0.25, 0.4, 0.6, 0.75, 0.9].map((t) => [t * width, 30 + Math.sin(t * 10) * 15]);
    cameras.forEach(([cx, cy]) => {
      ctx.strokeStyle = "rgba(80,120,255,0.5)";
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx - 8, cy + 12);
      ctx.lineTo(cx + 8, cy + 12);
      ctx.closePath();
      ctx.stroke();
      ctx.fillStyle = "rgba(80,120,255,0.2)";
      ctx.fill();
    });

    // Axis labels
    ctx.globalAlpha = 0.8;
    ctx.font = "10px monospace";
    ctx.fillStyle = "#ff4444"; ctx.fillText("X", width - 14, height - 4);
    ctx.fillStyle = "#44ff44"; ctx.fillText("Y", width - 26, height - 4);
    ctx.fillStyle = "#4444ff"; ctx.fillText("Z", width - 38, height - 4);
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
