const STEPS = [
  { id: "capture", label: "Capture", sub: "CaptureScene", num: 1 },
  { id: "colmap", label: "COLMAP", sub: "Reconstruction", num: 2 },
  { id: "3dgut", label: "3DGUT", sub: "NeuralTraining", num: 3 },
  { id: "isaac", label: "IsaacSim", sub: "Deployment", num: 4 },
];

export default function PipelineBar({ pipeline, activePage, onNavigate }) {
  return (
    <div style={styles.wrapper}>
      <div style={styles.inner}>
        {STEPS.map((step, i) => {
          const status = pipeline[step.id];
          const isDone = status === "completed";
          const isActive = status === "in-progress" || activePage === step.id;

          return (
            <div
              key={step.id}
              style={{ display: "flex", alignItems: "center" }}
            >
              <div
                style={styles.step}
                onClick={() => onNavigate(step.id)}
                title={`Go to ${step.label}`}
              >
                <div
                  style={{
                    ...styles.num,
                    ...(isDone
                      ? styles.numDone
                      : isActive
                        ? styles.numActive
                        : styles.numPending),
                  }}
                >
                  {step.num}
                </div>

                <div style={styles.stepText}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>
                    {step.label}
                  </div>
                  <div style={{ fontSize: 10, color: "var(--text-muted)" }}>
                    {step.sub}
                  </div>
                </div>
              </div>

              {i < STEPS.length - 1 && (
                <div
                  style={{
                    ...styles.line,
                    background:
                      pipeline[STEPS[i + 1].id] !== "pending" || isDone
                        ? "var(--nvidia-green)"
                        : "var(--border-color)",
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const styles = {
  inner: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center", // ⭐ THIS CENTERS EVERYTHING
    width: "100%",
    maxWidth: 900, // controls NVIDIA-like compact look
    margin: "0 auto", // extra safety centering
  },
  wrapper: {
    marginBottom: 12,
    padding: "16px 24px",
    background: "var(--bg-primary)",
    border: "1px solid var(--border-color)",
    borderRadius: 12,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  step: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    cursor: "pointer",
    padding: "10px 14px",
    borderRadius: 10, // ✅ rounded box
    transition: "all 0.2s",
  },

  num: {
    width: 30, // 🔥 bigger
    height: 30,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 12,
    fontWeight: 700,
    flexShrink: 0,
  },

  stepText: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    lineHeight: 1.2,
  },
  numDone: {
    background: "var(--nvidia-green)",
    color: "white",
  },

  numActive: {
    background: "rgba(118, 185, 0, 0.15)",
    border: "2px solid var(--nvidia-green)",
    color: "var(--nvidia-green)",
  },

  numPending: {
    background: "#f3f3f3",
    border: "1px solid var(--border-color)",
    color: "var(--text-muted)",
  },
  line: {
    height: 2,
    width: 140,
    margin: "0 16px",
    borderRadius: 2,
    transition: "background 0.3s",
  },
};
