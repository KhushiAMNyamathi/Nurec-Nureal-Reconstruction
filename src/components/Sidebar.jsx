const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: "⊞" },
  { id: "capture", label: "Capture", icon: "⊙" },
  { id: "colmap", label: "COLMAP", icon: "◈" },
  { id: "3dgut", label: "3DGUT", icon: "◉" },
  {
    id: "segmentation",
    label: "3D Semantic Segmentation",
    icon: "◇",
  },
  { id: "isaac", label: "Isaac Sim", icon: "⊕" },
  { id: "logs", label: "Logs", icon: "≡" },
];

const SYS = [
  { label: "GPU", val: "RTX 5090", ok: true },
  { label: "VRAM", val: "24.2 / 24 GB", ok: true },
  { label: "RAM", val: "32.1 / 64 GB", ok: true },
];

export default function Sidebar({ activePage, onNavigate }) {
  return (
    <aside style={styles.sidebar}>
    

      {/* Nav */}
      <nav style={{ flex: 1, padding: "10px 0" }}>
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            style={{
              ...styles.navItem,
              ...(activePage === item.id ? styles.navItemActive : {}),
            }}
          >
            <span style={{ fontSize: 15 }}>{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      {/* System */}
      <div style={styles.sysPanel}>
        <div style={{ fontSize: 14, fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 6 }}>
          System
        </div>
        {SYS.map((s) => (
          <div key={s.label} style={styles.sysRow}>
            <span style={{ color: "var(--text-secondary)" }}>{s.label}</span>
            <span style={{ fontWeight: 700 }}>
              {s.val}
              {s.ok && <span style={styles.dot} />}
            </span>
          </div>
        ))}
        {/* <button style={styles.feedbackBtn}>Feedback</button> */}
      </div>
    </aside>
  );
}

const styles = {
  sidebar: {
    width: 192,
    background: "var(--bg-primary)",
    borderRight: "1px solid var(--border-color)",
    display: "flex",
    flexDirection: "column",
    flexShrink: 0,
  },
  logo: {
    padding: "14px 16px",
    borderBottom: "1px solid var(--border-color)",
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  logoBox: {
    width: 32,
    height: 32,
    background: "var(--nvidia-green)",
    borderRadius: 6,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  navItem: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    width: "100%",
    padding: "9px 16px",
    background: "transparent",
    border: "none",
    fontSize: 12,
    color: "var(--text-secondary)",
    textAlign: "left",
    cursor: "pointer",
    transition: "background 0.15s",
    borderRight: "2px solid transparent",
  },
  navItemActive: {
    background: "var(--nvidia-green-dim)",
    color: "var(--nvidia-green)",
    fontWeight: 500,
    borderRight: "2px solid var(--nvidia-green)",
  },
  sysPanel: {
    padding: "12px 16px",
    borderTop: "1px solid var(--border-color)",
    fontSize: 11,
  },
  sysRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  dot: {
    display: "inline-block",
    width: 6,
    height: 6,
    borderRadius: "50%",
    background: "var(--nvidia-green)",
    marginLeft: 4,
    verticalAlign: "middle",
  },
};
