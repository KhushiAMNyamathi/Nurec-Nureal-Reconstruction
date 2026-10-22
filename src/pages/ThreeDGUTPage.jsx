import { useEffect, useRef, useState } from "react";
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
import IsaacStreamViewer from "../components/IsaacStreamViewer";

export default function ThreeDGUTPage({ onNavigate }) {

  //states 
  const terminalRef = useRef(null);
  const [outputDirectory, setOutputDirectory] = useState(
    "/home/adminusr/Shashank/3DGUT/3dgrut/data/results"
  );
  const [isTraining, setIsTraining] = useState(false);
  const [trainingError, setTrainingError] = useState("");

  const [trainingLogs, setTrainingLogs] = useState([]);
  const [trainingStatus, setTrainingStatus] = useState("not_running");
  const [exportFormat, setExportFormat] = useState("spz");
  const [exportFolder, setExportFolder] = useState("");
  const [isExporting, setIsExporting] = useState(false);


  const handleFormatExport = async () => {
    if (!exportFolder) {
      alert("Please select an output folder first.");
      return;
    }

    setIsExporting(true);

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/3dgut/export-format",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            format: exportFormat,
            output_dir: exportFolder,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof data.detail === "string"
            ? data.detail
            : JSON.stringify(data.detail ?? data)
        );
      }

      alert(
        `Export successful!\nFormat: ${data.format}\nSaved to: ${data.output_file}`
      );
    } catch (error) {
      console.error("Export failed:", error);
      alert(`Export failed: ${error.message}`);
    } finally {
      setIsExporting(false);
    }
  };


  useEffect(() => {
    if (!isTraining) return;

    const interval = setInterval(async () => {
      try {
        const response = await fetch(
          "http://localhost:8000/3dgut/status"
        );

        const data = await response.json();

        setTrainingLogs(data.logs || []);
        setTrainingStatus(data.status || "not_running");

        if (data.status === "running") {
          setIsTraining(true);
        }

        if (data.status === "completed") {
          setIsTraining(false);
        }

        if (data.status === "stopped") {
          setIsTraining(false);
        }

        if (data.status === "failed") {
          setIsTraining(false);

          const lastLog =
            data.logs && data.logs.length > 0
              ? data.logs[data.logs.length - 1]
              : "3DGUT training failed.";

          setTrainingError(lastLog);
        }
      } catch (error) {
        console.error("3DGUT status error:", error);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isTraining]);
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop =
        terminalRef.current.scrollHeight;
    }
  }, [trainingLogs]);
  const handleStartTraining = async () => {
    try {
      setTrainingError("");
      setIsTraining(true);
      const response = await fetch(
        "http://127.0.0.1:8000/3dgut/start",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            out_dir: outputDirectory,
            experiment_name: "3dgut_mcmc",
          }),
        }
      );

      const data = await response.json();

      console.log("3DGUT START:", data);

      if (!response.ok) {
        throw new Error(
          data.detail || "Failed to start 3DGUT"
        );
      }

      setIsTraining(true);

    } catch (error) {

      console.error(
        "3DGUT START ERROR:",
        error
      );

      alert(
        "Failed to start 3DGUT:\n" +
        error.message
      );
    }
  };

  const handleStopTraining = async () => {
    try {
      const response = await fetch(
        "http://127.0.0.1:8000/3dgut/stop",
        {
          method: "POST",
        }
      );

      const data = await response.json();

      console.log("3DGUT STOP:", data);

      if (!response.ok) {
        throw new Error(
          data.detail || "Failed to stop 3DGUT"
        );
      }

      setIsTraining(false);
      setTrainingStatus(data.status || "stopped");

    } catch (error) {
      console.error(
        "3DGUT STOP ERROR:",
        error
      );

      setTrainingError(
        "Failed to stop 3DGUT: " +
        error.message
      );
    }
  };

  const handleSelectOutputDirectory = async () => {
    try {
      const response = await fetch(
        "http://127.0.0.1:8000/select-3dgut-output-folder"
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Failed to select output directory"
        );
      }

      if (data.folder) {
        setOutputDirectory(data.folder);
      }

    } catch (error) {
      console.error("Output directory selection error:", error);

      alert(
        "Could not select output directory:\n" +
        error.message
      );
    }
  };

  const handleSelectExportFolder = async () => {
    try {
      const response = await fetch(
        "http://127.0.0.1:8000/select-3dgut-output-folder"
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Failed to select export folder"
        );
      }

      if (data.folder) {
        setExportFolder(data.folder);
      }
    } catch (error) {
      console.error("Export folder selection error:", error);

      alert(
        "Could not select export folder:\n" +
        error.message
      );
    }
  };


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
            <span style={styles.path}>data/playroom_test</span>

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

          <Label style={{ marginTop: 12 }}>
            Output Directory
          </Label>

          <div style={styles.pathRow}>
            <span style={styles.path}>
              {outputDirectory}
            </span>

            <button
              onClick={handleSelectOutputDirectory}
              style={{
                border: "none",
                background: "transparent",
                cursor: "pointer",
                fontSize: 16,
              }}
            >
              📁
            </button>
          </div>
          <BtnSecondary style={{ width: "100%", justifyContent: "center" }}>
            💾 Save Configuration
          </BtnSecondary>
          <BtnPrimary
            onClick={handleStartTraining}
            disabled={isTraining}
            style={{
              width: "100%",
              justifyContent: "center",
              marginTop: 10,
            }}
          >
            ▶ Start Training
          </BtnPrimary>
        </Card>

        {/* Progress */}
        <Card>
          <SectionTitle num={2}>Training Progress</SectionTitle>

          <div style={styles.statusBadge}>
            {trainingError
              ? "Training Failed"
              : isTraining
                ? "In Progress"
                : "Not Running"}
          </div>

          {trainingError && (
            <div
              style={{
                marginBottom: 12,
                padding: "12px 14px",
                borderRadius: 8,
                border: "1px solid #ef4444",
                background: "#fff1f1",
                color: "#b91c1c",
              }}
            >
              <div
                style={{
                  fontWeight: 600,
                  fontSize: 12,
                  marginBottom: 5,
                }}
              >
                ⚠️ 3DGUT Training Error
              </div>

              <div
                style={{
                  fontSize: 11,
                  lineHeight: 1.5,
                }}
              >
                {trainingError}
              </div>
            </div>
          )}
          <Grid cols={2} gap={8} style={{ marginBottom: 10 }}>
            <div>
              <Label>Status</Label>
              <strong style={{ fontSize: 11 }}>
                {trainingStatus === "running"
                  ? "Running"
                  : trainingStatus === "completed"
                    ? "Completed"
                    : trainingStatus === "failed"
                      ? "Failed"
                      : "Not Running"}
              </strong>
            </div>

            <div>
              <Label>PID</Label>
              <strong style={{ fontSize: 11 }}>
                {trainingStatus === "running" ? "Active" : "—"}
              </strong>
            </div>
          </Grid>


          <Label>Overall Progress</Label>

          <ProgressBar
            value={isTraining ? 50 : trainingStatus === "completed" ? 100 : 0}
            height={8}
            style={{ marginBottom: 2 }}
          />

          <div
            style={{
              textAlign: "right",
              fontSize: 10,
              color: "var(--text-muted)",
              marginBottom: 10,
            }}
          >
            {isTraining
              ? "Training..."
              : trainingStatus === "completed"
                ? "100%"
                : "0%"}
          </div>

          <Label>3DGUT Terminal Output</Label>

          <div
            ref={terminalRef}
            style={{
              height: 180,
              overflowY: "auto",
              overflowX: "hidden",
              background: "#0b0f0d",
              border: "1px solid #26332b",
              borderRadius: 8,
              padding: "10px 12px",
              marginBottom: 12,
              fontFamily: "monospace",
              fontSize: 10,
              lineHeight: 1.55,
              color: "#d1d5db",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            {trainingLogs.length === 0 ? (
              <div style={{ color: "#dbdbdb" }}>
                Waiting for 3DGUT training output...
              </div>
            ) : (
              trainingLogs.map((log, index) => (
                <div key={index}>{log}</div>
              ))
            )}
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
            <button
              onClick={handleStopTraining}
              disabled={!isTraining}
              style={{
                ...styles.stopBtn,
                opacity: isTraining ? 1 : 0.45,
                cursor: isTraining ? "pointer" : "not-allowed",
              }}
            >
              ⏹ Stop Training
            </button>
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
            <IsaacStreamViewer />
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


            <BtnPrimary
              onClick={async () => {
                try {
                  const response = await fetch(
                    "http://127.0.0.1:8000/isaac/load-scene",
                    {
                      method: "POST",
                    }
                  );

                  const result = await response.json();

                  if (!response.ok) {
                    throw new Error(
                      result.detail || "Failed to load Isaac Sim scene"
                    );
                  }

                  console.log("Isaac Sim scene loaded successfully:", result);
                } catch (error) {
                  console.error("Could not load the USDZ scene:", error);
                  alert(`Could not load Isaac Sim scene: ${error.message}`);
                }
              }}
            >
              Proceed to Isaac Sim →
            </BtnPrimary>


          </div>
        </Card>

        <Card>
          <SectionTitle num={4}>Export in Different Formats</SectionTitle>

          <Label>Select Export Format</Label>

          <select
            value={exportFormat}
            onChange={(e) => setExportFormat(e.target.value)}
            style={{
              width: "100%",
              padding: "12px",
              marginTop: 8,
              borderRadius: 8,
              border: "1px solid #444",
              background: "#1e1e1e",
              color: "#fff",
              fontSize: 14,
            }}
          >
            <option value="spz">SPZ (.spz)</option>
            <option value="splat">Splat (.splat)</option>
            <option value="sog">SOG (.sog)</option>
            <option value="compressed_ply">Compressed PLY (.compressed.ply)</option>
            <option value="glb">GLB (.glb)</option>
            <option value="html">HTML (.html)</option>
          </select>

          <div style={{ marginTop: 12 }}>
            <span style={styles.exportLabel}>Output Folder</span>
            <div
              style={{
                ...styles.exportValue,
                marginTop: 6,
                overflowWrap: "anywhere",
              }}
            >
              {exportFolder || "Please select an output folder"}
            </div>
          </div>

          <button
            style={{
              ...styles.secondaryBtn,
              width: "100%",
              marginTop: 10,
            }}
            onClick={handleSelectExportFolder}
          >
            📂 Select Output Folder
          </button>

          <button
            style={{
              ...styles.primaryBtn,
              width: "100%",
              marginTop: 8,
              opacity: isExporting ? 0.6 : 1,
            }}
            onClick={handleFormatExport}
            disabled={isExporting || !exportFolder}
          >
            {isExporting ? "⏳ Exporting..." : "⬇ Export Selected Format"}
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
