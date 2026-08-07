import { useEffect, useRef } from "react";
import {
  Card,
  SectionTitle,
  Label,
  Select,
  CheckRow,
  MetricRow,
  BtnPrimary,
  BtnSecondary,
  Grid,
  ProgressBar,
} from "../components/ui";
import GaussianSplatCanvas from "../components/GaussianSplatCanvas";
import warehouse from "../images/warehouse.png";

export default function ThreeDGUTPage({ onNavigate }) {
  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 16,
        }}
      >
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 500, marginBottom: 4 }}>
            3DGUT Neural Training
          </h1>
          <p style={{ fontSize: 12, color: "var(--text-secondary)" }}>
            Train a 3D Gaussian Splatting model using COLMAP reconstruction to
            produce a high-fidelity, photo-realistic scene.
          </p>
        </div>
        <BtnSecondary>↗ 3DGUT Documentation</BtnSecondary>
      </div>

      <Grid cols={4} gap={14}>
        {/* Config */}
        <Card>
          <SectionTitle num={1}>Training Configuration</SectionTitle>
          <Label>COLMAP Project</Label>
          <div style={styles.pathRow}>
            <span style={styles.path}>D:/recon/colmap_project</span>
            <span>📁</span>
          </div>
          <Label>Experiment Name</Label>
          <input defaultValue="warehouse_scan" style={styles.textInput} />
          <Label>Training Preset</Label>
          <Select
            value="MCMC Quality (Higher Quality)"
            options={["MCMC Quality (Higher Quality)", "Standard (Faster)"]}
          />
          <div
            style={{
              fontSize: 10,
              color: "var(--text-muted)",
              marginBottom: 8,
            }}
          >
            Best quality, longer training time.
          </div>

          <Label>Training Parameters</Label>

          <div style={styles.paramRow}>
            <span style={styles.paramLabel}>Iterations</span>
            <input defaultValue="50,000" style={styles.paramInput} />
          </div>

          <div style={styles.paramRow}>
            <span style={styles.paramLabel}>Initial LR</span>
            <input defaultValue="0.00016" style={styles.paramInput} />
          </div>

          <div style={styles.paramRow}>
            <span style={styles.paramLabel}>Densification Until</span>
            <input defaultValue="15,000" style={styles.paramInput} />
          </div>

          <div style={styles.paramRow}>
            <span style={styles.paramLabel}>Splat Size</span>
            <input defaultValue="1.6" style={styles.paramInput} />
          </div>

          <Label style={{ marginTop: 8 }}>Export Options</Label>
          <CheckRow label="Export USDZ" checked />
          <CheckRow label="Normalize Scene" checked />
          <CheckRow label="Generate Point Cloud (.ply)" />

          <Label style={{ marginTop: 8 }}>Output Directory</Label>
          <div style={styles.pathRow}>
            <span style={styles.path}>D:/recon/3dgut_output</span>
            <span>📁</span>
          </div>
          <BtnSecondary style={{ width: "100%", justifyContent: "center" }}>
            💾 Save Configuration
          </BtnSecondary>
        </Card>

        {/* Progress */}
        <Card>
          <SectionTitle num={2}>Training Progress</SectionTitle>
          <div style={styles.statusBadge}>In Progress</div>
          <Grid cols={2} gap={8} style={{ marginBottom: 10 }}>
            <div>
              <Label>Iteration</Label>
              <strong style={{ fontSize: 11 }}>35,400 / 50,000</strong>
            </div>
            <div>
              <Label>Elapsed</Label>
              <strong style={{ fontSize: 11 }}>01:23:45</strong>
            </div>
            <div>
              <Label>ETA</Label>
              <strong style={{ fontSize: 11 }}>00:42:18</strong>
            </div>
          </Grid>
          <Label>Overall Progress</Label>
          <ProgressBar value={70} height={8} style={{ marginBottom: 2 }} />
          <div
            style={{
              textAlign: "right",
              fontSize: 10,
              color: "var(--text-muted)",
              marginBottom: 10,
            }}
          >
            70%
          </div>

          <Label>Loss</Label>
          <LossChart />

          <Label style={{ marginTop: 10 }}>Training Metrics</Label>
          <MetricRow label="Total Loss" value="0.0041" />
          <MetricRow label="PSNR" value="29.67 dB" />
          <MetricRow label="SSIM" value="0.912" />
          <MetricRow label="Gaussian Count" value="10.2M" />
          <MetricRow
            label="VRAM Usage"
            value="21.3 / 24 GB"
            valueStyle={{ color: "var(--nvidia-green)" }}
          />

          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <BtnSecondary style={{ flex: 1, justifyContent: "center" }}>
              ⏸ Pause
            </BtnSecondary>
            <button style={styles.stopBtn}>⏹ Stop</button>
          </div>
        </Card>

        {/* Live Preview */}
        <Card>
          <SectionTitle num={3}>Live Preview</SectionTitle>
          <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
            {["Gaussian Splat", "Rendered Image", "Camera View"].map((v, i) => (
              <button
                key={v}
                style={{
                  ...styles.viewTab,
                  ...(i === 0 ? styles.viewTabActive : {}),
                }}
              >
                {v}
              </button>
            ))}
          </div>
          <div style={styles.previewImageBox}>
            <img src={warehouse} alt="Warehouse" style={styles.previewImage} />
          </div>
          <div style={{ display: "flex", gap: 12, marginTop: 8, fontSize: 11 }}>
            <div>
              <Label>Render Quality</Label>
              <Select
                value="High"
                options={["High", "Medium", "Low"]}
                style={{ marginBottom: 0 }}
              />
            </div>
            <div>
              <Label>Point Size</Label>
              <input
                type="range"
                min="0.5"
                max="3"
                step="0.1"
                defaultValue="1.0"
                style={{
                  width: "100%",
                  marginTop: 4,
                  accentColor: "var(--nvidia-green)",
                }}
              />
            </div>
          </div>

          <Label style={{ marginTop: 12 }}>
            Export (After Training Completes)
          </Label>
          <div style={styles.exportRow}>
            <div>
              <div style={{ fontWeight: 500, fontSize: 11 }}>
                export_last.usdz
              </div>
              <div style={{ fontSize: 10, color: "var(--text-muted)" }}>
                2.18 GB · May 20, 2024
              </div>
            </div>
            <BtnSecondary style={{ fontSize: 10, padding: "4px 8px" }}>
              📁
            </BtnSecondary>
          </div>
          <div
            style={{
              marginTop: 12,
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            <BtnPrimary onClick={() => onNavigate("isaac")}>
              Proceed to Isaac Sim →
            </BtnPrimary>
          </div>
        </Card>

        {/* export */}
        <Card>
          <SectionTitle num={4}>Export (After Training Completes)</SectionTitle>

          <Label>USDZ File</Label>

          <div style={styles.exportInfo}>
            <div style={styles.exportField}>
              <span style={styles.exportLabel}>USDZ File</span>
              <div style={styles.exportValue}>
                export_last.usdz <span>📁</span>
              </div>
            </div>

            <div style={styles.exportField}>
              <span style={styles.exportLabel}>File Size</span>
              <strong>2.18 GB</strong>
            </div>

            <div style={styles.exportField}>
              <span style={styles.exportLabel}>Last Modified</span>
              <strong>May 20, 2024 10:31 AM</strong>
            </div>
          </div>

          <button
            style={{ ...styles.secondaryBtn, width: "100%", marginTop: 14 }}
          >
            📂 Open Output Folder
          </button>

          <button
            style={{
              ...styles.secondaryBtn,
              width: "100%",
              marginTop: 8,
              opacity: 0.5,
            }}
          >
            ▶ Open in Isaac Sim
          </button>

          <button
            style={{
              ...styles.primaryBtn,
              width: "100%",
              marginTop: 18,
            }}
            onClick={() => onNavigate("isaac")}
          >
            Proceed to Isaac Sim Deployment →
          </button>
        </Card>
      </Grid>

      {/* Info panel */}
      <Card
        style={{
          marginTop: 14,
          background: "#EAF5FF",
          border: "1px solid #B8DFFF",
          width: "90%", // reduce width
          maxWidth: 420, // optional fixed maximum
        }}
      >
        <div style={{ display: "flex", gap: 10, fontSize: 11 }}>
          <span style={{ fontSize: 16 }}>ℹ️</span>

          <div>
            <strong style={{ color: "#185FA5" }}>About 3DGUT</strong>

            <p
              style={{
                color: "#185FA5",
                marginTop: 4,
                marginBottom: 0,
                lineHeight: 1.5,
                fontSize: 11,
              }}
            >
              3DGUT converts COLMAP sparse reconstruction into a dense 3D
              Gaussian Splat representation. MCMC Quality provides the best
              visual quality. Training time depends on scene complexity and
              selected preset. The final model is exported as USDZ for use in
              Isaac Sim.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

function LossChart() {
  const ref = useRef();
  const data = [
    1, 0.72, 0.45, 0.28, 0.18, 0.12, 0.085, 0.065, 0.053, 0.046, 0.042, 0.041,
    0.0408, 0.0405, 0.0403, 0.0401,
  ];

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width,
      H = canvas.height;
    ctx.fillStyle = "#f8f8f8";
    ctx.fillRect(0, 0, W, H);

    const max = Math.max(...data),
      min = Math.min(...data);
    const px = (i) => (i / (data.length - 1)) * (W - 20) + 10;
    const py = (v) =>
      H -
      12 -
      ((Math.log(v) - Math.log(min)) / (Math.log(max) - Math.log(min))) *
        (H - 20);

    ctx.strokeStyle = "#2563EB";
    ctx.lineWidth = 2;
    ctx.beginPath();
    data.forEach((v, i) =>
      i === 0 ? ctx.moveTo(px(i), py(v)) : ctx.lineTo(px(i), py(v)),
    );
    ctx.stroke();

    ctx.fillStyle = "rgba(118,185,0,0.08)";
    ctx.beginPath();
    data.forEach((v, i) =>
      i === 0 ? ctx.moveTo(px(i), py(v)) : ctx.lineTo(px(i), py(v)),
    );
    ctx.lineTo(px(data.length - 1), H);
    ctx.lineTo(px(0), H);
    ctx.closePath();
    ctx.fill();
  }, []);

  return (
    <canvas
      ref={ref}
      width={260}
      height={80}
      style={{
        width: "100%",
        borderRadius: "var(--radius-md)",
        display: "block",
      }}
    />
  );
}

const styles = {
  paramRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  paramLabel: {
    fontSize: 11,
    color: "#000",
    fontWeight: 500,
  },

  paramInput: {
    width: 150,
    height: 28,
    border: "1px solid var(--border-color)",
    borderRadius: 6,
    padding: "0 8px",
    fontSize: 11,
    outline: "none",
    background: "#fff",
  },
  exportInfo: {
    display: "flex",
    gap: 18,
    marginTop: 8,
    marginBottom: 10,
  },

  exportField: {
    flex: 1,
  },

  exportLabel: {
    display: "block",
    fontSize: 10,
    color: "var(--text-muted)",
    marginBottom: 4,
  },

  exportValue: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    border: "1px solid var(--border-color)",
    borderRadius: 6,
    padding: "7px 8px",
    fontSize: 11,
  },

  secondaryBtn: {
    height: 38,
    background: "#fff",
    border: "1px solid var(--border-color)",
    borderRadius: 6,
    fontSize: 12,
    fontWeight: 500,
    cursor: "pointer",
  },

  primaryBtn: {
    height: 40,
    background: "var(--nvidia-green)",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
  },
  previewImageBox: {
    width: "100%",
    height: 260,
    border: "1px solid var(--border-color)",
    borderRadius: "var(--radius-md)",
    overflow: "hidden",
    background: "#000",
  },

  previewImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover", // use "contain" if you don't want any cropping
    display: "block",
  },
  infoCard: {
    marginTop: 14,
    background: "#EEF6FF",
    border: "1px solid #B9D9FF",
    borderLeft: "4px solid #2D8CFF",
    borderRadius: 8,
    padding: "14px 16px",
    boxShadow: "none",
  },

  infoHeader: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    color: "#185FA5",
    fontSize: 13,
    fontWeight: 600,
    marginBottom: 8,
  },

  infoIcon: {
    fontSize: 16,
  },

  infoText: {
    margin: 0,
    fontSize: 11,
    color: "#4B5B6A",
    lineHeight: 1.6,
  },
  pathRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    border: "1px solid var(--border-color)",
    borderRadius: "var(--radius-md)",
    padding: "6px 10px",
    marginBottom: 8,
    cursor: "pointer",
  },
  path: { fontSize: 10, color: "var(--text-muted)", fontFamily: "monospace" },
  textInput: {
    width: "100%",
    padding: "6px 10px",
    fontSize: 11,
    border: "1px solid var(--border-color)",
    borderRadius: "var(--radius-md)",
    marginBottom: 8,
    background: "var(--bg-primary)",
    color: "var(--text-primary)",
  },
  statusBadge: {
    display: "inline-flex",
    alignItems: "center",
    padding: "2px 10px",
    background: "#e6f1fb",
    color: "#185fa5",
    borderRadius: 12,
    fontSize: 10,
    fontWeight: 500,
    marginBottom: 10,
  },
  stopBtn: {
    flex: 1,
    background: "#333",
    color: "white",
    border: "none",
    borderRadius: "var(--radius-md)",
    padding: "7px 0",
    fontSize: 12,
    cursor: "pointer",
  },
  viewTab: {
    fontSize: 10,
    padding: "3px 8px",
    border: "1px solid var(--border-color)",
    borderRadius: "var(--radius-sm)",
    background: "transparent",
    color: "var(--text-secondary)",
    cursor: "pointer",
  },
  viewTabActive: {
    background: "var(--nvidia-green-dim)",
    color: "var(--nvidia-green)",
    borderColor: "var(--nvidia-green)",
  },
  exportRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "8px 10px",
    border: "1px solid var(--border-color)",
    borderRadius: "var(--radius-md)",
    marginTop: 4,
  },
};
