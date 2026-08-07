import { useState } from "react";
import { BtnPrimary, BtnSecondary } from "../components/ui";
import GaussianSplatCanvas from "../components/GaussianSplatCanvas";
import warehouse from "../images/warehouse.png";
import franka from "../images/franka.png";

export default function IsaacPage({ onNavigate }) {
  // ── state ──
  const [scale, setScale] = useState("1.00");
  const [upAxis, setUpAxis] = useState("Z Up");
  const [metersPerUnit, setMetersPerUnit] = useState("1.00");
  const [convertUsd, setConvertUsd] = useState(true);
  const [createGround, setCreateGround] = useState(true);
  const [enablePhysics, setEnablePhysics] = useState(true);
  const [generateCollision, setGenerateCollision] = useState(true);
  const [groundType, setGroundType] = useState("Infinite Plane");
  const [groundHeight, setGroundHeight] = useState("0.00");
  const [gravX, setGravX] = useState("0.00");
  const [gravY, setGravY] = useState("0.00");
  const [gravZ, setGravZ] = useState("-9.81");
  const [timeStep, setTimeStep] = useState("0.0167");
  const [sceneQueries, setSceneQueries] = useState(true);
  const [ccd, setCcd] = useState(true);
  const [robotTab, setRobotTab] = useState("Robots"); // Robots | Assets | Lights
  const [simSpeed, setSimSpeed] = useState(1.0);
  const [fileLoaded] = useState(true);
  const [imported, setImported] = useState(false);

  const ROBOTS = [
    {
      name: "Franka Emika Panda",
      image: franka,
    },
    {
      name: "Universal Robots UR10e",
      image: franka,
    },
    {
      name: "TurtleBot 4",
      image: franka,
    },
  ];

  const HIERARCHY = [
    { name: "World (defaultPrim)", depth: 0, icon: "🌐", tag: "Xprim" },
    { name: "Ground Plane", depth: 1, icon: "📄", tag: "Xlorm" },
    { name: "warehouse_scan", depth: 1, icon: "📁", tag: "Xlorm" },
    { name: "_root", depth: 2, icon: "📄", tag: "Xlorm" },
    { name: "shelves", depth: 2, icon: "📄", tag: "Xlorm" },
    { name: "boxes", depth: 2, icon: "📄", tag: "Xlorm" },
    { name: "floor", depth: 2, icon: "📄", tag: "Xlorm" },
    { name: "ceiling", depth: 2, icon: "📄", tag: "Xlorm" },
    { name: "lights", depth: 2, icon: "📄", tag: "Xlorm" },
    { name: "Physics Scene", depth: 0, icon: "⚙️", tag: "Scope" },
  ];

  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 16,
        }}
      >
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}>
            Isaac Sim Deployment
          </h1>
          <p style={{ fontSize: 12, color: "var(--text-secondary)" }}>
            Import the reconstructed scene into Isaac Sim, configure the
            environment, and add robots for simulation.
          </p>
        </div>
        <BtnSecondary>↗ Isaac Sim Documentation</BtnSecondary>
      </div>

      {/* Main 4-column grid */}
      <div style={s.mainGrid}>
        {/* ══ COL 1 — Import + Scene Setup ══ */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Card>
            <SectionLabel num={1}>Import Scene</SectionLabel>

            <FieldLabel>USDZ File</FieldLabel>
            <div style={s.pathRow}>
              <span style={s.pathText}>export_last.usdz</span>
              <span style={{ fontSize: 14, cursor: "pointer" }}>📁</span>
            </div>

            {fileLoaded && (
              <div style={s.successBanner}>
                <span style={{ color: "var(--nvidia-green)", fontSize: 13 }}>
                  ✓
                </span>
                <div>
                  <div
                    style={{
                      fontSize: 11,
                      color: "var(--nvidia-green)",
                      fontWeight: 500,
                    }}
                  >
                    File loaded successfully
                  </div>
                  <div style={{ fontSize: 10, color: "var(--text-muted)" }}>
                    Size: 1.82 GB &nbsp;|&nbsp; Format: USDZ (Gaussian Splat)
                  </div>
                </div>
              </div>
            )}

            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                marginTop: 12,
                marginBottom: 8,
              }}
            >
              Import Settings
            </div>
            <SettingRow label="Scale">
              <input
                value={scale}
                onChange={(e) => setScale(e.target.value)}
                style={s.valueInput}
              />
            </SettingRow>
            <SettingRow label="Up Axis">
              <select
                value={upAxis}
                onChange={(e) => setUpAxis(e.target.value)}
                style={s.selectInput}
              >
                <option>Z Up</option>
                <option>Y Up</option>
              </select>
            </SettingRow>
            <SettingRow label="Meters Per Unit">
              <input
                value={metersPerUnit}
                onChange={(e) => setMetersPerUnit(e.target.value)}
                style={s.valueInput}
              />
            </SettingRow>
            <CBRow
              label="Convert to Usd (Optimized)"
              checked={convertUsd}
              onChange={setConvertUsd}
              info
            />

            <button
              style={{ ...s.outlineBtn, marginTop: 10 }}
              onClick={() => setImported(true)}
            >
              ↑ Import into Isaac Sim
            </button>
          </Card>

          <Card>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 14, // Increase to 12 or 16 for more spacing
              }}
            >
              <SectionLabel num={2}>Scene Setup</SectionLabel>

              <CBRow
                label="Create Ground Plane"
                checked={createGround}
                onChange={setCreateGround}
              />

              <CBRow
                label="Enable Physics"
                checked={enablePhysics}
                onChange={setEnablePhysics}
              />

              <CBRow
                label="Generate Collision"
                checked={generateCollision}
                onChange={setGenerateCollision}
              />

              <div
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  marginTop: 6,
                }}
              >
                Ground Plane
              </div>

              <SettingRow label="Type">
                <select
                  value={groundType}
                  onChange={(e) => setGroundType(e.target.value)}
                  style={s.selectInput}
                >
                  <option>Infinite Plane</option>
                  <option>Mesh</option>
                </select>
              </SettingRow>

              <SettingRow label="Height (Z)">
                <input
                  value={groundHeight}
                  onChange={(e) => setGroundHeight(e.target.value)}
                  style={s.valueInput}
                />
              </SettingRow>
            </div>
          </Card>
        </div>

        {/* ══ COL 2+3 — Viewport + Scene Hierarchy (wider) ══ */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
            gridColumn: "span 2",
          }}
        >
          <Card style={{ padding: 0, overflow: "hidden" }}>
            {/* Viewport toolbar */}

            <div style={s.viewportToolbar}>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <SectionLabel num={3}>Viewport</SectionLabel>
              </div>

              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                {["↖", "+", "↺", "⛶", "⚓"].map((ic) => (
                  <span key={ic} style={s.toolbarBtn}>
                    {ic}
                  </span>
                ))}
                <div style={s.viewportDropdown}>Perspective ▾</div>
                <div style={s.viewportDropdown}>RTX - Real-Time ▾</div>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <span style={s.toolbarBtn}>⚙</span>
                <span style={s.toolbarBtn}>⋯</span>
              </div>
            </div>

            {/* 3D Viewport */}

            <div style={s.viewportBox}>
              {/* Warehouse Image */}
              <img
                src={warehouse}
                alt="Warehouse"
                style={{
                  width: "100%",
                  height: 270,
                  objectFit: "cover",
                  borderRadius: 10,
                }}
              />

              {/* Axis indicator overlay */}
              <div style={s.axisIndicator}>
                <svg width="40" height="40" viewBox="0 0 40 40">
                  <line
                    x1="20"
                    y1="20"
                    x2="36"
                    y2="20"
                    stroke="#e55"
                    strokeWidth="2"
                  />
                  <line
                    x1="20"
                    y1="20"
                    x2="20"
                    y2="4"
                    stroke="#5a5"
                    strokeWidth="2"
                  />
                  <line
                    x1="20"
                    y1="20"
                    x2="8"
                    y2="32"
                    stroke="#55e"
                    strokeWidth="2"
                  />

                  <text x="37" y="23" fontSize="8" fill="#e55">
                    X
                  </text>
                  <text x="17" y="3" fontSize="8" fill="#5a5">
                    Y
                  </text>
                  <text x="2" y="36" fontSize="8" fill="#55e">
                    Z
                  </text>
                </svg>
              </div>
            </div>

            {/* Scene Statistics */}
            <div style={s.statsBar}>
              <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8 }}>
                Scene Statistics
              </div>
              <div style={s.statsGrid}>
                {[
                  ["Primitives", "5.42 M"],
                  ["Triangles (Proxy)", "12.38 M"],
                  ["Gaussian Points", "96.7 M"],
                  ["Lights", "3"],
                  ["Materials", "215"],
                  ["Physics Shapes", "1,824"],
                ].map(([l, v]) => (
                  <div key={l}>
                    <div
                      style={{ fontSize: 10, color: "var(--text-secondary)" }}
                    >
                      {l}
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 600 }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Scene Hierarchy */}
          <Card>
            <SectionLabel num={6}>Scene Hierarchy</SectionLabel>
            <div style={s.searchRow}>
              <input placeholder="Search..." style={s.searchInput} />
              <span
                style={{
                  fontSize: 11,
                  color: "var(--text-secondary)",
                  cursor: "pointer",
                }}
              >
                Tab
              </span>
              <span
                style={{
                  fontSize: 14,
                  color: "var(--text-muted)",
                  cursor: "pointer",
                }}
              >
                ⋮
              </span>
            </div>
            <div style={s.hierarchyList}>
              {HIERARCHY.map((item, i) => (
                <div
                  key={i}
                  style={{
                    ...s.hierarchyRow,
                    paddingLeft: 8 + item.depth * 14,
                  }}
                >
                  <span style={{ fontSize: 11, marginRight: 4 }}>
                    {item.icon}
                  </span>
                  <span style={{ fontSize: 11, flex: 1 }}>{item.name}</span>
                  <span style={{ fontSize: 9, color: "var(--text-muted)" }}>
                    👁
                  </span>
                  <span
                    style={{
                      fontSize: 9,
                      color: "var(--text-muted)",
                      marginLeft: 4,
                    }}
                  >
                    {item.tag}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* ══ COL 4 — Env, Robots, Sim Controls ══ */}
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <Card>
            <SectionLabel num={4}>Environment & Physics</SectionLabel>
            <SettingRow label="Physics Engine">
              <select style={s.selectInput}>
                <option>PhysX</option>
              </select>
            </SettingRow>

            <div style={{ fontSize: 11, fontWeight: 600, margin: "8px 0 4px" }}>
              Gravity (m/s²)
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "auto 1fr auto 1fr auto 1fr",
                gap: 4,
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              {[
                ["X", gravX, setGravX],
                ["Y", gravY, setGravY],
                ["Z", gravZ, setGravZ],
              ].map(([ax, val, set]) => (
                <>
                  <span
                    key={ax + "l"}
                    style={{
                      fontSize: 10,
                      color: "var(--text-secondary)",
                      fontWeight: 500,
                    }}
                  >
                    {ax}
                  </span>
                  <input
                    key={ax + "i"}
                    value={val}
                    onChange={(e) => set(e.target.value)}
                    style={s.xyzInput}
                  />
                </>
              ))}
            </div>

            <SettingRow label="Time Step (s)">
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <input
                  value={timeStep}
                  onChange={(e) => setTimeStep(e.target.value)}
                  style={s.valueInput}
                />
                <span
                  style={{
                    fontSize: 12,
                    cursor: "pointer",
                    color: "var(--text-muted)",
                  }}
                >
                  ↺
                </span>
              </div>
            </SettingRow>
            <CBRow
              label="Enable Scene Queries"
              checked={sceneQueries}
              onChange={setSceneQueries}
            />
            <CBRow
              label="Enable CCD (Continuous Collision Detection)"
              checked={ccd}
              onChange={setCcd}
            />
          </Card>

          <Card style={{ flex: 1 }}>
            <SectionLabel num={5}>Add Robots & Assets</SectionLabel>
            <div style={s.robotTabRow}>
              {["Robots", "Assets", "Lights"].map((t) => (
                <button
                  key={t}
                  style={{
                    ...s.robotTab,
                    ...(robotTab === t ? s.robotTabActive : {}),
                  }}
                  onClick={() => setRobotTab(t)}
                >
                  {t}
                </button>
              ))}
            </div>

            {ROBOTS.map((r) => (
              <div key={r.name} style={s.robotRow}>
                <img src={r.image} alt={r.name} style={s.robotImage} />
                <span style={{ fontSize: 11, flex: 1 }}>{r.name}</span>
                <button style={s.addBtn}>Add</button>
              </div>
            ))}

            <button style={{ ...s.outlineBtn, marginTop: 10 }}>
              ↑ Import Robot from USD
            </button>
          </Card>

          <Card>
            <SectionLabel num={7}>Simulation Controls</SectionLabel>
            <div
              style={{
                fontSize: 11,
                color: "var(--text-secondary)",
                marginBottom: 6,
              }}
            >
              Simulation
            </div>
            <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
              <button style={s.simBtn("green")}>▶ Play</button>
              <button style={s.simBtn("gray")}>⏸ Pause</button>
              <button style={s.simBtn("red")}>⏹ Stop</button>
              <button style={s.simBtn("gray")}>↺ Reset</button>
            </div>

            <div
              style={{
                fontSize: 11,
                color: "var(--text-secondary)",
                marginBottom: 4,
              }}
            >
              Simulation Speed
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input
                type="range"
                min={0.1}
                max={4}
                step={0.1}
                value={simSpeed}
                onChange={(e) => setSimSpeed(Number(e.target.value))}
                style={{ flex: 1, accentColor: "var(--nvidia-green)" }}
              />
              <span style={{ fontSize: 11, fontWeight: 600, width: 32 }}>
                {simSpeed.toFixed(1)}x
              </span>
            </div>

            <button style={{ ...s.outlineBtn, marginTop: 10 }}>
              ↗ Open in Isaac Sim
            </button>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginTop: 12,
              }}
            >
              <BtnPrimary
                style={{
                  width: "80%",
                  padding: "10px 0",
                  fontSize: 13,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                Launch Simulation ▶
              </BtnPrimary>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

/* ── Sub-components ── */

function Card({ children, style }) {
  return (
    <div
      style={{
        background: "var(--bg-primary)",
        border: "1px solid var(--border-color)",
        borderRadius: "var(--radius-lg)",
        padding: "10px 14px",
        boxShadow: "var(--shadow-sm)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function SectionLabel({ num, children }) {
  return (
    <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 10 }}>
      {num}. {children}
    </div>
  );
}

function FieldLabel({ children }) {
  return (
    <div
      style={{ fontSize: 11, color: "var(--text-secondary)", marginBottom: 4 }}
    >
      {children}
    </div>
  );
}

function SettingRow({ label, children }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "5px 0",
        borderBottom: "1px solid #f4f4f4",
      }}
    >
      <span style={{ fontSize: 11, color: "var(--text-secondary)" }}>
        {label}
      </span>
      {children}
    </div>
  );
}

function CBRow({ label, checked, onChange, info }) {
  return (
    <label
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        fontSize: 12,
        marginTop: 5,
        cursor: "pointer",
      }}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        style={{ accentColor: "var(--nvidia-green)", width: 13, height: 13 }}
      />
      {label}
      {info && (
        <span
          style={{ fontSize: 10, color: "var(--text-muted)", marginLeft: 2 }}
        >
          ⓘ
        </span>
      )}
    </label>
  );
}

/* ── Styles ── */
const s = {
  mainGrid: {
    display: "grid",
    gridTemplateColumns: "350px 1fr 1.6fr 450px",
    gap: 12,
    alignItems: "start",
    marginBottom: 12,
  },
  pathRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    border: "1px solid var(--border-color)",
    borderRadius: "var(--radius-md)",
    padding: "6px 10px",
    background: "var(--bg-secondary)",
    marginBottom: 6,
  },
  pathText: {
    fontSize: 11,
    color: "var(--text-muted)",
    fontFamily: "monospace",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  successBanner: {
    display: "flex",
    gap: 8,
    alignItems: "flex-start",
    background: "#f0faf0",
    border: "1px solid #b8e8b8",
    borderRadius: "var(--radius-md)",
    padding: "7px 10px",
    marginBottom: 4,
  },
  valueInput: {
    width: 180,
    padding: "4px 8px",
    fontSize: 11,
    border: "1px solid var(--border-color)",
    borderRadius: "var(--radius-sm)",
    background: "var(--bg-primary)",
    color: "var(--text-primary)",
    textAlign: "right",
  },
  selectInput: {
    padding: "4px 8px",
    fontSize: 11,
    border: "1px solid var(--border-color)",
    borderRadius: "var(--radius-sm)",
    background: "var(--bg-primary)",
    color: "var(--text-primary)",
    minWidth: 180,
  },
  xyzInput: {
    padding: "3px 6px",
    fontSize: 11,
    border: "1px solid var(--border-color)",
    borderRadius: "var(--radius-sm)",
    background: "var(--bg-primary)",
    color: "var(--text-primary)",
    width: "100%",
  },
  outlineBtn: {
    width: "100%",
    padding: "7px 0",
    background: "transparent",
    border: "1px solid var(--border-color)",
    borderRadius: "var(--radius-md)",
    fontSize: 11,
    color: "black",
    cursor: "pointer",
  },
  viewportToolbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "6px 10px",
    background: "var(--bg-secondary)",
    borderBottom: "1px solid var(--border-color)",
  },
  toolbarBtn: {
    width: 22,
    height: 22,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 12,
    cursor: "pointer",
    color: "var(--text-secondary)",
    borderRadius: 3,
    background: "var(--bg-primary)",
    border: "1px solid var(--border-color)",
  },
  viewportDropdown: {
    fontSize: 10,
    padding: "3px 8px",
    background: "var(--bg-primary)",
    border: "1px solid var(--border-color)",
    borderRadius: 3,
    cursor: "pointer",
    color: "var(--text-secondary)",
  },
  viewportBox: {
    position: "relative",
    overflow: "hidden",
  },
  axisIndicator: { position: "absolute", bottom: 8, right: 8 },
  statsBar: {
    padding: "10px 14px",
    borderTop: "1px solid var(--border-color)",
  },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 8 },
  searchRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
    border: "1px solid var(--border-color)",
    borderRadius: "var(--radius-md)",
    padding: "4px 8px",
  },
  searchInput: {
    flex: 1,
    border: "none",
    outline: "none",
    fontSize: 11,
    background: "transparent",
    color: "var(--text-primary)",
  },
  hierarchyList: { maxHeight: 180, overflowY: "auto" },
  hierarchyRow: {
    display: "flex",
    alignItems: "center",
    gap: 4,
    padding: "3px 8px",
    fontSize: 11,
    borderRadius: 3,
    cursor: "pointer",
  },
  robotTabRow: {
    display: "flex",
    marginBottom: 10,
    border: "1px solid var(--border-color)",
    borderRadius: "var(--radius-md)",
    overflow: "hidden",
  },
  robotTab: {
    flex: 1,
    padding: "5px 0",
    fontSize: 11,
    background: "transparent",
    border: "none",
    cursor: "pointer",
    color: "var(--text-secondary)",
  },
  robotTabActive: {
    background: "var(--nvidia-green-dim)",
    color: "var(--nvidia-green)",
    fontWeight: 600,
    borderBottom: "2px solid var(--nvidia-green)",
  },
  robotImage: {
    width: "clamp(32px, 4vw, 52px)",
    height: "clamp(32px, 4vw, 52px)",
    objectFit: "contain",
    flexShrink: 0,
  },
  robotRow: {
    display: "flex",
    alignItems: "center",
    gap: "clamp(8px, 1vw, 12px)",
    padding: "8px 0",
    borderBottom: "1px solid #f4f4f4",
  },
  addBtn: {
    padding: "4px 12px",
    fontSize: 11,
    background: "transparent",
    border: "1px solid var(--border-color)",
    borderRadius: "var(--radius-sm)",
    cursor: "pointer",
    color: "var(--text-secondary)",
  },
  simBtn: (color) => ({
    flex: 1,
    padding: "6px 0",
    fontSize: 11,
    border: "none",
    borderRadius: "var(--radius-sm)",
    cursor: "pointer",
    fontWeight: 500,
    background:
      color === "green"
        ? "var(--nvidia-green)"
        : color === "red"
          ? "#e74c3c"
          : "#f0f0f0",
    color: color === "gray" ? "var(--text-primary)" : "white",
  }),
  bottomBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
    padding: "10px 0",
  },
  statusBanner: {
    display: "flex",
    gap: 8,
    alignItems: "center",
    background: "#f0faf0",
    border: "1px solid #b8e8b8",
    borderRadius: "var(--radius-md)",
    padding: "8px 16px",
    flex: 1,
    marginRight: 16,
  },
};
