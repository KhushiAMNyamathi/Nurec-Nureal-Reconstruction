import logo from "../images/logo.jpg";

export default function TopBar() {
  return (
    <header style={styles.topbar}>
      {/* LEFT */}
      <div style={styles.left}>
        <img src={logo} style={styles.logo} />
        <span style={styles.divider}>|</span>

        <div style={styles.title}>
          <span style={styles.appName}>NuRec</span>
          <span style={styles.divider}>|</span>
          <span style={styles.subtitle}>Mono Camera Neural Reconstruction</span>
        </div>
      </div>

      {/* RIGHT */}
      <div style={styles.right}>
        <button style={styles.btn}>📄 Docs</button>

        <button style={styles.btn}>📊 Open Logs</button>

        <button style={styles.btn}>⚙ Settings</button>
      </div>
    </header>
  );
}

const styles = {
  topbar: {
    height: "7%",
    width: "100%",
    padding: "0 14px",
    background: "var(--bg-primary)",
    borderBottom: "1px solid var(--border-color)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },

  left: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },

  logo: {
    width: "13%",
    height: "8%",
    objectFit: "contain",
  },

  title: {
    display: "flex",
    alignItems: "center",
    gap: 6,
  },

  appName: {
    fontWeight: 900,
    fontSize: 14,
  },

  divider: {
    color: "var(--border-color)",
    margin: "0 4px",
  },

  subtitle: {
    fontSize: 13,
    fontWeight: 900,
  },

  right: {
    display: "flex",
    gap: 10,
  },

  btn: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "5px 10px",
    fontSize: 14,
    background: "transparent",
    border: "1px solid var(--border-color)",
    borderRadius: 6,
    color: "var(--text-secondary)",
    cursor: "pointer",
  },
};
