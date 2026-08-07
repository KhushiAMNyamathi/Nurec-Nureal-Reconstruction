import { useState, useRef, useCallback } from "react";
import { Badge } from "../components/ui";
import PointCloudCanvas from "../components/PointCloudCanvas";
import GaussianSplatCanvas from "../components/GaussianSplatCanvas";
import colmap from "../images/colmap.png";
import warehouse from "../images/warehouse.png";

export default function DashboardPage({ onNavigate }) {
  const [dataSource, setDataSource] = useState("images"); // "images" | "video"
  const [images, setImages] = useState([]);
  const [videoFile, setVideoFile] = useState(null);
  const [videoURL, setVideoURL] = useState(null);
  const [targetFrameCount, setTargetFrameCount] = useState(500);
  const [extractedFrames, setExtractedFrames] = useState([]);
  const [extracting, setExtracting] = useState(false);
  const [extractProgress, setExtractProgress] = useState(0);

  const [viewerSelected, setViewerSelected] = useState(false);
  const [launchSelected, setLaunchSelected] = useState(false);
  const scrubVideoRef = useRef(null);
  const canvasRef = useRef(null);
  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);

  const handleImageUpload = useCallback((e) => {
    const files = Array.from(e.target.files).filter((f) =>
      f.type.startsWith("image/"),
    );
    if (files.length === 0) return;
    setImages(
      files.map((f) => ({ name: f.name, url: URL.createObjectURL(f) })),
    );
  }, []);

  const handleVideoUpload = useCallback((e) => {
    const file = e.target.files[0];
    if (!file) return;
    setVideoFile(file);
    setVideoURL(URL.createObjectURL(file));
    setExtractedFrames([]);
    setExtractProgress(0);
  }, []);

  const extractFrames = useCallback(() => {
    const video = scrubVideoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !videoURL) return;
    setExtracting(true);
    setExtractedFrames([]);
    setExtractProgress(0);
    const count = Math.min(targetFrameCount, 60);
    video.src = videoURL;
    video.load();
    video.onloadedmetadata = () => {
      const interval = video.duration / count;
      const frames = [];
      let idx = 0;
      video.onseeked = () => {
        canvas.width = 160;
        canvas.height = 90;
        canvas.getContext("2d").drawImage(video, 0, 0, 160, 90);
        frames.push(canvas.toDataURL("image/jpeg", 0.7));
        setExtractProgress(Math.round(((idx + 1) / count) * 100));
        idx++;
        if (idx < count) {
          video.currentTime = idx * interval;
        } else {
          setExtractedFrames(frames);
          setExtracting(false);
          setExtractProgress(100);
        }
      };
      video.currentTime = 0;
    };
  }, [videoURL, targetFrameCount]);

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: 14,
        alignItems: "stretch",
        height: "calc(100vh - 160px)", // ← ADD THIS
      }}
    >
      {/* ══ COLUMN 1 — Capture Scene ══ */}
      <Panel>
        <PanelHeader
          num={1}
          done
          title="Capture Scene"
          badge="Completed"
          badgeVariant="green"
        />

        <Section>Data Source</Section>
        <div style={s.toggleRow}>
          <button
            style={{
              ...s.toggleBtn,
              ...(dataSource === "images" ? s.toggleActive : {}),
            }}
            onClick={() => setDataSource("images")}
          >
            🖼 Images
          </button>
          <button
            style={{
              ...s.toggleBtn,
              ...(dataSource === "video" ? s.toggleActive : {}),
            }}
            onClick={() => setDataSource("video")}
          >
            📹 Video
          </button>
        </div>

        {/* Hidden file inputs */}
        <input
          ref={imageInputRef}
          type="file"
          multiple
          accept="image/*"
          webkitdirectory=""
          style={{ display: "none" }}
          onChange={handleImageUpload}
        />
        <input
          ref={videoInputRef}
          type="file"
          accept="video/*"
          style={{ display: "none" }}
          onChange={handleVideoUpload}
        />
        <video ref={scrubVideoRef} style={{ display: "none" }} />
        <canvas ref={canvasRef} style={{ display: "none" }} />

        {/* ── IMAGES MODE ── */}
        {dataSource === "images" && (
          <>
            <Section>Dataset</Section>
            <FieldLabel>Image Folder</FieldLabel>
            <div
              style={s.uploadBox}
              onClick={() => imageInputRef.current?.click()}
            >
              {images.length === 0 ? (
                <div style={s.uploadPlaceholder}>
                  <span style={{ fontSize: 28 }}>📁</span>
                  <span
                    style={{
                      fontSize: 11,
                      color: "var(--text-secondary)",
                      marginTop: 6,
                    }}
                  >
                    Click to select image folder
                  </span>
                  <span
                    style={{
                      fontSize: 10,
                      color: "var(--text-muted)",
                      marginTop: 2,
                    }}
                  >
                    Supports JPG, PNG, WEBP
                  </span>
                </div>
              ) : (
                <div style={s.pathDisplay}>
                  <span style={s.pathText}>
                    📁 {images.length} images loaded
                  </span>
                  <span
                    style={{
                      color: "var(--nvidia-green)",
                      fontSize: 10,
                      flexShrink: 0,
                    }}
                  >
                    Change
                  </span>
                </div>
              )}
            </div>

            {images.length > 0 && (
              <>
                <div style={{ marginTop: 6, marginBottom: 4 }}>
                  <span
                    style={{ fontSize: 11, color: "var(--text-secondary)" }}
                  >
                    Images Loaded{" "}
                  </span>
                  <span
                    style={{
                      color: "var(--nvidia-green)",
                      fontWeight: 700,
                      fontSize: 15,
                    }}
                  >
                    {images.length}
                  </span>
                </div>
                <div style={s.thumbGrid}>
                  {images.slice(0, 5).map((img, i) => (
                    <div key={i} style={s.thumbWrap}>
                      <img src={img.url} alt={img.name} style={s.thumbImg} />
                    </div>
                  ))}
                  {images.length > 5 && (
                    <div
                      style={{
                        ...s.thumbWrap,
                        background: "#1c1c1c",
                        flexDirection: "column",
                        justifyContent: "center",
                      }}
                    >
                      <span
                        style={{
                          color: "white",
                          fontSize: 12,
                          fontWeight: 700,
                        }}
                      >
                        +{images.length - 5}
                      </span>
                      <span style={{ color: "#777", fontSize: 9 }}>more</span>
                    </div>
                  )}
                </div>
              </>
            )}

            <Section>Capture Checklist</Section>
            {[
              "Lock Focus",
              "Lock Exposure",
              "Consistent Lighting",
              "60% Overlap Between Images",
              "No Motion Blur",
            ].map((l) => (
              <div key={l} style={s.checkLine}>
                <span style={{ color: "var(--nvidia-green)", fontSize: 13 }}>
                  ✓
                </span>
                <span style={{ fontSize: 11 }}>{l}</span>
              </div>
            ))}
          </>
        )}

        {/* ── VIDEO MODE ── */}
        {dataSource === "video" && (
          <>
            <div style={s.infoBanner}>
              <span>ℹ️</span>
              <div>
                <div style={{ fontWeight: 600, fontSize: 11 }}>
                  Using video?
                </div>
                <div style={{ fontSize: 10, color: "#185fa5" }}>
                  We will extract frames automatically.
                </div>
              </div>
            </div>

            <Section>Video File</Section>
            <div
              style={s.uploadBox}
              onClick={() => videoInputRef.current?.click()}
            >
              {!videoFile ? (
                <div style={s.uploadPlaceholder}>
                  <span style={{ fontSize: 28 }}>🎬</span>
                  <span
                    style={{
                      fontSize: 11,
                      color: "var(--text-secondary)",
                      marginTop: 6,
                    }}
                  >
                    Click to select video file
                  </span>
                  <span
                    style={{
                      fontSize: 10,
                      color: "var(--text-muted)",
                      marginTop: 2,
                    }}
                  >
                    MP4, MOV, AVI supported
                  </span>
                </div>
              ) : (
                <div style={s.pathDisplay}>
                  <span style={s.pathText}>📹 {videoFile.name}</span>
                  <span
                    style={{
                      color: "var(--nvidia-green)",
                      fontSize: 10,
                      flexShrink: 0,
                    }}
                  >
                    Change
                  </span>
                </div>
              )}
            </div>

            {videoURL && (
              <video
                src={videoURL}
                controls
                style={{
                  width: "100%",
                  borderRadius: "var(--radius-md)",
                  background: "#000",
                  marginTop: 6,
                  marginBottom: 8,
                  maxHeight: 130,
                  display: "block",
                }}
              />
            )}

            <Section>Frame Extraction</Section>
            <FieldLabel>Target Frame Count</FieldLabel>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 6,
              }}
            >
              <input
                type="number"
                value={targetFrameCount}
                min={10}
                max={1000}
                onChange={(e) => {
                  setTargetFrameCount(Number(e.target.value));
                  setExtractedFrames([]);
                }}
                style={{
                  width: 80,
                  padding: "5px 8px",
                  border: "1px solid var(--border-color)",
                  borderRadius: "var(--radius-md)",
                  fontSize: 11,
                  background: "var(--bg-primary)",
                  color: "var(--text-primary)",
                }}
              />
              <span style={{ fontSize: 10, color: "var(--text-muted)" }}>
                frames
              </span>
            </div>

            {videoFile && (
              <div
                style={{
                  fontSize: 11,
                  color: "var(--nvidia-green)",
                  marginBottom: 8,
                }}
              >
                Estimated frames to extract: ~{Math.min(targetFrameCount, 60)}
              </div>
            )}

            <button
              style={{
                ...s.greenBtn,
                opacity: !videoFile || extracting ? 0.55 : 1,
              }}
              onClick={extractFrames}
              disabled={!videoFile || extracting}
            >
              {extracting
                ? `⏳ Extracting… ${extractProgress}%`
                : "⚡ Extract Frames"}
            </button>

            {extracting && (
              <div
                style={{
                  height: 7,
                  background: "#e8e8e8",
                  borderRadius: 4,
                  overflow: "hidden",
                  marginTop: 6,
                }}
              >
                <div
                  style={{
                    height: "100%",
                    background: "var(--nvidia-green)",
                    borderRadius: 4,
                    width: `${extractProgress}%`,
                    transition: "width 0.15s",
                  }}
                />
              </div>
            )}

            {extractedFrames.length > 0 && (
              <>
                <div style={{ marginTop: 8, marginBottom: 4 }}>
                  <span
                    style={{ fontSize: 11, color: "var(--text-secondary)" }}
                  >
                    Extracted Frames{" "}
                  </span>
                  <span
                    style={{
                      color: "var(--nvidia-green)",
                      fontWeight: 700,
                      fontSize: 15,
                    }}
                  >
                    {extractedFrames.length}
                  </span>
                </div>
                <div style={s.thumbGrid}>
                  {extractedFrames.slice(0, 5).map((src, i) => (
                    <div key={i} style={s.thumbWrap}>
                      <img src={src} alt={`frame-${i}`} style={s.thumbImg} />
                    </div>
                  ))}
                  {extractedFrames.length > 5 && (
                    <div
                      style={{
                        ...s.thumbWrap,
                        background: "#1c1c1c",
                        flexDirection: "column",
                        justifyContent: "center",
                      }}
                    >
                      <span
                        style={{
                          color: "white",
                          fontSize: 12,
                          fontWeight: 700,
                        }}
                      >
                        +{extractedFrames.length - 5}
                      </span>
                      <span style={{ color: "#777", fontSize: 9 }}>more</span>
                    </div>
                  )}
                </div>
              </>
            )}

            <Section>Capture Checklist</Section>
            {[
              "Stable Motion",
              "Good Lighting",
              "Minimal Motion Blur",
              "Sufficient Overlap",
            ].map((l) => (
              <div key={l} style={s.checkLine}>
                <span style={{ color: "var(--nvidia-green)", fontSize: 13 }}>
                  ✓
                </span>
                <span style={{ fontSize: 11 }}>{l}</span>
                <span
                  style={{
                    fontSize: 10,
                    color: "var(--text-muted)",
                    marginLeft: "auto",
                  }}
                >
                  ⓘ
                </span>
              </div>
            ))}
          </>
        )}

        <div style={{ height: 14 }} />
        <button style={s.outlineBtn}>✓ Validate Dataset</button>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginTop: 14,
          }}
        >
          <QualityRing value={92} />
          <div>
            <div style={{ fontSize: 11, fontWeight: 600 }}>
              Dataset Quality Score
            </div>
            <div
              style={{
                fontSize: 11,
                color: "var(--nvidia-green)",
                fontWeight: 600,
              }}
            >
              Excellent
            </div>
          </div>
        </div>
      </Panel>
      {/* ══ COLUMN 2 — COLMAP ══ */}
      <Panel>
        <PanelHeader
          num={2}
          done
          title="COLMAP Reconstruction"
          badge="Completed"
          badgeVariant="green"
        />

        <Section>Configuration</Section>
        <FieldLabel>Camera Model</FieldLabel>
        <SelectField value="PINHOLE" />

        <Section>Feature Extraction</Section>
        <Row label="Max Image Size" value="2000" />
        <CBItem label="Affine Shape" checked />
        <CBItem label="Domain Pooling" checked />

        <Section>Matching</Section>
        <CBItem label="GPU Matching" checked />

        <Section>Output Folder</Section>
        <PathField value="D:/recon/colmap_project" />

        <button style={{ ...s.greenBtn, marginTop: 10 }}>▶ Run COLMAP</button>

        <Section>Results</Section>

        <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
          <div style={{ flex: 1 }}>
            <Row label="Cameras" value="428" />
            <Row label="Sparse Points" value="1.2M" />
            <Row label="Reprojection Error" value="0.71 px" />
          </div>

          <div
            style={{
              width: 150,
              height: 130,
              flexShrink: 0,
              borderRadius: 6,
              overflow: "hidden",
              border: "1px solid var(--border-color)",
            }}
          >
            <img
              src={colmap}
              alt="Point Cloud"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }}
            />
          </div>
        </div>

        <button
          onClick={() => setViewerSelected(!viewerSelected)}
          style={{
            ...s.outlineBtn,
            ...(viewerSelected ? s.outlineBtnActive : {}),
          }}
        >
          ↗ Open in Viewer
        </button>
      </Panel>

      {/* ══ COLUMN 3 — 3DGUT ══ */}
      <Panel>
        <PanelHeader
          num={3}
          active
          title="3DGUT Training"
          badge="In Progress"
          badgeVariant="blue"
        />

        <Section>Inputs</Section>
        <FieldLabel>COLMAP Project</FieldLabel>
        <PathField value="D:/recon/colmap_project" />

        <Section>Training Configuration</Section>
        <RBItem label="Standard (Faster)" />
        <RBItem label="MCMC Quality (Higher Quality)" checked />

        <FieldLabel style={{ marginTop: 8 }}>Experiment Name</FieldLabel>
        <div style={s.inputBox}>warehouse_scan</div>

        <Section>Export</Section>
        <CBItem label="USDZ" checked />
        <CBItem label="Normalize Scene" checked />

        <Section>Hardware</Section>
        <Row label="GPU" value="RTX 5090" vertical={false} />
        <Row
          label="VRAM Available"
          value="24 GB"
          vertical={false}
          valueStyle={{ color: "var(--nvidia-green)", fontWeight: 700 }}
        />

        <button style={s.darkBtn}>⏹ Stop Training</button>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 4,
            marginTop: 12,
            marginBottom: 4,
          }}
        >
          {[
            ["Iteration", "35,400"],
            ["Loss", "0.0041"],
            ["ETA", "00:42:18"],
          ].map(([l, v]) => (
            <div key={l}>
              <div style={{ fontSize: 10, color: "var(--text-secondary)" }}>
                {l}
              </div>
              <div style={{ fontSize: 12, fontWeight: 700 }}>{v}</div>
            </div>
          ))}
        </div>
        <div style={s.progressTrack}>
          <div style={{ ...s.progressFill, width: "68%" }} />
        </div>
        <div
          style={{
            textAlign: "right",
            fontSize: 10,
            color: "var(--text-muted)",
            marginBottom: 8,
          }}
        >
          68%
        </div>

        {/* <div style={{ flex: 1 }} /> */}

        <Section>Live Preview (Gaussian Splat)</Section>

        <div style={s.previewBox}>
          <img
            src={warehouse}
            alt="Gaussian Splat Preview"
            style={{
              width: "100%",
              height: "90%",
              objectFit: "cover",
              display: "block",
            }}
          />

          <div style={s.previewControls}>
            {["⊙", "↺", "⤢"].map((ic) => (
              <span key={ic} style={s.previewBtn}>
                {ic}
              </span>
            ))}
          </div>
        </div>
      </Panel>

      {/* ══ COLUMN 4 — Isaac Sim ══ */}
      <Panel>
        <PanelHeader
          num={4}
          title="Isaac Sim Deployment"
          badge="Pending"
          badgeVariant="gray"
        />

        <Section>USDZ File</Section>
        <PathField value="export_last.usdz" />
        <button style={s.outlineBtn}>↗ Open in Isaac Sim</button>

        <Section>Scene Alignment</Section>

        <div style={s.sceneAlignment}>
          <div style={{ flex: 1 }}>
            {[
              ["X", "0.00"],
              ["Y", "0.00"],
              ["Z", "0.00"],
              ["Scale", "1.00"],
            ].map(([axis, val]) => (
              <div key={axis} style={s.alignRow}>
                <span style={s.alignLabel}>{axis}</span>
                <input defaultValue={val} style={s.alignInput} />
              </div>
            ))}
          </div>

          <div style={s.linkIcon}>🔗</div>
        </div>

        <Section>Physics</Section>
        <CBItem label="Create Ground Plane" checked />
        <CBItem label="Enable Collision" checked />
        <CBItem label="Add Proxy Mesh" checked />

        <Section>Robots</Section>
        {["Add Franka", "Add UR10", "Add TurtleBot"].map((r) => (
          <div key={r} style={s.robotRow}>
            <span style={{ fontSize: 11 }}>{r}</span>
            <span style={{ fontSize: 16, color: "var(--text-secondary)" }}>
              ＋
            </span>
          </div>
        ))}

        <button
          onClick={() => {
            setLaunchSelected(!launchSelected);
            onNavigate("isaac");
          }}
          style={{
            ...s.greenBtn,
            ...(launchSelected ? s.greenBtnActive : {}),
          }}
        >
          ▶ Launch Simulation
        </button>
      </Panel>
    </div>
  );
}

/* ── Shared sub-components ── */

function Panel({ children }) {
  return (
    <div
      style={{
        background: "var(--bg-primary)",
        border: "1px solid var(--border-color)",
        borderRadius: "var(--radius-lg)",
        padding: "14px 14px 16px",
        boxShadow: "var(--shadow-sm)",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflowY: "auto",
        boxSizing: "border-box",
        gap: 2,
      }}
    >
      {children}
    </div>
  );
}

function PanelHeader({ num, done, active, title, badge, badgeVariant }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
        paddingBottom: 10,
        borderBottom: "1px solid var(--border-color)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 7,
          fontWeight: 600,
          fontSize: 14,
        }}
      >
        <span
          style={{
            width: 22,
            height: 22,
            borderRadius: "50%",
            flexShrink: 0,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 13,
            fontWeight: 700,
            background: done
              ? "var(--nvidia-green)"
              : active
                ? "white"
                : "#ebebeb",
            color: done ? "white" : active ? "var(--nvidia-green)" : "#aaa",
            border: active ? "2px solid var(--nvidia-green)" : "none",
          }}
        >
          {num}
        </span>
        {title}
      </div>
      <Badge label={badge} variant={badgeVariant} />
    </div>
  );
}

function Section({ children }) {
  return (
    <div
      style={{
        fontSize: 13,
        fontWeight: 700,
        color: "var(--text-primary)",
        marginTop: 10,
        marginBottom: 10,
      }}
    >
      {children}
    </div>
  );
}

function FieldLabel({ children, style }) {
  return (
    <div
      style={{
        fontSize: 12,
        color: "var(--text-secondary)",
        marginBottom: 8,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function PathField({ value, accept }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        border: "1px solid var(--border-color)",
        borderRadius: "var(--radius-md)",
        padding: "5px 8px",
        background: "var(--bg-secondary)",
        marginBottom: 4,
      }}
    >
      <span
        style={{
          fontSize: 10,
          color: "var(--text-muted)",
          fontFamily: "monospace",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {value}
      </span>
      <label
        style={{
          flexShrink: 0,
          marginLeft: 4,
          cursor: "pointer",
          fontSize: 14,
        }}
      >
        📁
        <input
          type="file"
          style={{ display: "none" }}
          accept={
            accept === "video"
              ? "video/*"
              : accept === "folder"
                ? undefined
                : undefined
          }
          {...(accept === "folder"
            ? { webkitdirectory: "true", directory: "true" }
            : {})}
        />
      </label>
    </div>
  );
}

function SelectField({ value }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        border: "1px solid var(--border-color)",
        borderRadius: "var(--radius-md)",
        padding: "6px 10px",
        fontSize: 11,
        marginBottom: 4,
        background: "var(--bg-primary)",
        cursor: "pointer",
      }}
    >
      <span>{value}</span>
      <span style={{ color: "var(--text-muted)" }}>▾</span>
    </div>
  );
}

function Row({ label, value, valueStyle = {}, vertical = true }) {
  if (vertical) {
    return (
      <div style={{ marginBottom: 12 }}>
        <div
          style={{
            fontSize: 12,
            color: "var(--text-muted)",
            marginBottom: 4,
          }}
        >
          {label}
        </div>

        <div
          style={{
            fontWeight: 700,
            fontSize: 14,
            ...valueStyle,
          }}
        >
          {value}
        </div>
      </div>
    );
  }

  // Horizontal layout
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
      }}
    >
      <span
        style={{
          fontSize: 12,
          color: "var(--text-muted)",
        }}
      >
        {label}
      </span>

      <span
        style={{
          fontWeight: 700,
          fontSize: 13,
          ...valueStyle,
        }}
      >
        {value}
      </span>
    </div>
  );
}

function CBItem({ label, checked }) {
  return (
    <label
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        fontSize: 11,
        marginBottom: 10,
        cursor: "pointer",
      }}
    >
      <input
        type="checkbox"
        defaultChecked={checked}
        style={{ accentColor: "var(--nvidia-green)", width: 13, height: 13 }}
      />
      {label}
    </label>
  );
}

function RBItem({ label, checked }) {
  return (
    <label
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        fontSize: 11,
        marginBottom: 3,
        cursor: "pointer",
      }}
    >
      <input
        type="radio"
        name="preset"
        defaultChecked={checked}
        style={{ accentColor: "var(--nvidia-green)", width: 13, height: 13 }}
      />
      {label}
    </label>
  );
}

function QualityRing({ value }) {
  const r = 26,
    circ = 2 * Math.PI * r;
  return (
    <svg width="68" height="68" viewBox="0 0 68 68" style={{ flexShrink: 0 }}>
      <circle
        cx="34"
        cy="34"
        r={r}
        fill="none"
        stroke="#e8e8e8"
        strokeWidth="5"
      />
      <circle
        cx="34"
        cy="34"
        r={r}
        fill="none"
        stroke="var(--nvidia-green)"
        strokeWidth="5"
        strokeDasharray={`${(value / 100) * circ} ${circ}`}
        strokeLinecap="round"
        transform="rotate(-90 34 34)"
      />
      <text
        x="34"
        y="39"
        textAnchor="middle"
        fontSize="13"
        fontWeight="700"
        fill="var(--nvidia-green)"
      >
        {value}%
      </text>
    </svg>
  );
}

/* ── Styles ── */
const s = {
  toggleRow: {
    display: "flex",
    marginBottom: 8,
    border: "1px solid var(--border-color)",
    borderRadius: "var(--radius-md)",
    overflow: "hidden",
    width: "100%", // ← change from "fit-content" to "100%"
    flexShrink: 0, // ← ADD THIS — prevents collapse
  },
  toggleBtn: {
    flex: 1, // ← ADD flex:1 so buttons share width equally
    padding: "5px 0",
    fontSize: 12,
    background: "transparent",
    border: "none",
    cursor: "pointer",
    color: "var(--text-secondary)",
    whiteSpace: "nowrap",
    textAlign: "center",
  },
  toggleActive: {
    background: "white", // Keep white background
    color: "var(--nvidia-green)", // Green text
    border: "1px solid var(--nvidia-green)", // Green border
    fontWeight: 600,
    zIndex: 1,
  },
  infoBanner: {
    display: "flex",
    alignItems: "flex-start",
    gap: 8,
    background: "#e8f4fd",
    border: "1px solid #b8d8f0",
    borderRadius: "var(--radius-md)",
    padding: "8px 10px",
    marginBottom: 4,
    fontSize: 11,
    color: "#185fa5",
  },
  thumbGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3,1fr)",
    gap: 3,
    marginBottom: 8,
  },
  thumb: {
    height: 54,
    borderRadius: 5,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 20,
  },
  checkLine: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "2px 0",
  },
  outlineBtn: {
    width: "100%",
    padding: "8px 0",
    background: "#fff",
    border: "1px solid #cfcfcf",
    borderRadius: "var(--radius-md)",
    fontSize: 12,
    fontWeight: 700,
    color: "#000",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },

  outlineBtnActive: {
    background: "var(--nvidia-green)",
    border: "1px solid var(--nvidia-green)",
    color: "#fff",
  },
  greenBtn: {
    width: "100%",
    padding: "10px 0",
    background: "#fff",
    color: "#111",
    border: "1px solid #cfcfcf",
    borderRadius: 8,
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  greenBtnActive: {
    background: "rgba(118,185,0,0.10)", // very light green
    color: "var(--nvidia-green)",
    border: "1px solid var(--nvidia-green)",
  },
  darkBtn: {
    width: "100%",
    marginTop: 8,
    padding: "8px 0",
    background: "#1a1a1a",
    color: "white",
    border: "none",
    borderRadius: "var(--radius-md)",
    fontSize: 11,
    fontWeight: 500,
    cursor: "pointer",
  },
  inputBox: {
    border: "1px solid var(--border-color)",
    borderRadius: "var(--radius-md)",
    padding: "5px 8px",
    fontSize: 11,
    color: "var(--text-primary)",
    background: "var(--bg-primary)",
    marginBottom: 4,
  },
  progressTrack: {
    height: 7,
    background: "#e8e8e8",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    background: "var(--nvidia-green)",
    borderRadius: 4,
  },
  previewBox: {
    position: "relative",
    width: "100%",
    height: 150,
    borderRadius: 8,
    overflow: "hidden",
    border: "1px solid var(--border-color)",
  },
  previewControls: {
    position: "absolute",
    bottom: 8,
    left: 8,
    display: "flex",
    gap: 6,
  },

  previewBtn: {
    width: 24,
    height: 24,
    borderRadius: "50%",
    background: "rgba(0,0,0,0.65)",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    fontSize: 12,
  },
  alignRow: { display: "flex", alignItems: "center", gap: 8, marginBottom: 6 },
  alignLabel: {
    width: 36,
    fontSize: 11,
    color: "var(--text-secondary)",
    fontWeight: 600,
  },
  alignInput: {
    flex: 1,
    padding: "5px 8px",
    border: "1px solid var(--border-color)",
    borderRadius: "var(--radius-sm)",
    fontSize: 11,
    background: "var(--bg-primary)",
    color: "var(--text-primary)",
  },
  robotRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "7px 10px",
    border: "1px solid var(--border-color)",
    borderRadius: "var(--radius-md)",
    marginBottom: 5,
    cursor: "pointer",
  },
  selectRow: {
    display: "flex",
    justifyContent: "space-between",
    border: "1px solid var(--border-color)",
    borderRadius: "var(--radius-md)",
    padding: "6px 10px",
    fontSize: 11,
    marginBottom: 6,
    background: "var(--bg-primary)",
    cursor: "pointer",
  },
  videoPlayer: {
    background: "#111",
    borderRadius: "var(--radius-md)",
    overflow: "hidden",
    marginBottom: 8,
  },
  videoScreen: {
    height: 100,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    background: "#0a0a0a",
  },
  videoControls: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "6px 8px",
    background: "#1a1a1a",
  },
  playBtn: { color: "white", fontSize: 12, cursor: "pointer", flexShrink: 0 },
  timeCode: { color: "#aaa", fontSize: 10, flexShrink: 0 },
  volBtn: { color: "#aaa", fontSize: 11, flexShrink: 0 },
  seekBar: {
    flex: 1,
    height: 3,
    background: "#444",
    borderRadius: 2,
    overflow: "hidden",
  },
  uploadBox: {
    border: "1.5px dashed var(--border-color)",
    borderRadius: "var(--radius-md)",
    marginBottom: 6,
    cursor: "pointer",
    overflow: "hidden",
    background: "var(--bg-secondary)",
    minHeight: 64,
  },
  uploadPlaceholder: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "14px 8px",
  },
  pathDisplay: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "8px 10px",
    minHeight: 64,
    gap: 8,
  },
  pathText: {
    fontSize: 10,
    color: "var(--text-muted)",
    fontFamily: "monospace",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    flex: 1,
  },
  thumbWrap: {
    height: 54,
    borderRadius: 5,
    overflow: "hidden",
    background: "#111",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  thumbImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },
  infoBanner: {
    display: "flex",
    alignItems: "flex-start",
    gap: 8,
    background: "#e8f4fd",
    border: "1px solid #b8d8f0",
    borderRadius: "var(--radius-md)",
    padding: "8px 10px",
    marginBottom: 4,
    fontSize: 11,
    color: "#185fa5",
  },
  sceneAlignment: {
    display: "flex",
    alignItems: "center",
    gap: 16,
  },

  alignRow: {
    display: "flex",
    alignItems: "center",
    marginBottom: 8,
  },

  alignLabel: {
    width: 90,
    fontSize: 12,
    color: "var(--text-secondary)",
    fontWeight: 500,
  },

  alignInput: {
    width: 110, // or 120 for a wider box
    height: 30,
    padding: "0 8px",
    border: "1px solid var(--border-color)",
    borderRadius: 4,
    fontSize: 12,
    outline: "none",
    background: "#fff",
  },

  linkIcon: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 24,
    height: 24,
    transform: "translateX(-6px)", // adjust -4, -6, -8 as needed
    color: "var(--text-muted)",
    fontSize: 15,
    cursor: "pointer",
  },

  seekFill: { width: "0%", height: "100%", background: "var(--nvidia-green)" },
  fullBtn: { color: "#aaa", fontSize: 12, cursor: "pointer", flexShrink: 0 },
};
