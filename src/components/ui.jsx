// Card wrapper
export function Card({ children, style }) {
  return (
    <div
      style={{
        background: "var(--bg-primary)",
        border: "1px solid var(--border-color)",
        borderRadius: "var(--radius-lg)",
        padding: "14px 16px",
        boxShadow: "var(--shadow-sm)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// Section header with numbered circle
export function SectionTitle({ num, children, badge }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          color: "#000", // <-- Black title
          fontWeight: 600,
          fontSize: 14,
        }}
      >
        {num && (
          <span
            style={{
              width: 22,
              height: 22,
              borderRadius: "50%",
              background: "var(--nvidia-green)",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 11,
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            {num}
          </span>
        )}

        <span style={{ color: "#000" }}>{children}</span>
      </div>

      {badge && <Badge {...badge} />}
    </div>
  );
}

// Status badges
export function Badge({ label, variant = "gray" }) {
  const colors = {
    green: { bg: "#76b90018", color: "#76b900" },
    blue: { bg: "#e6f1fb", color: "#185fa5" },
    orange: { bg: "#faeeda", color: "#854f0b" },
    gray: { bg: "#f0f0f0", color: "#666" },
  };
  const c = colors[variant] || colors.gray;
  return (
    <span
      style={{
        background: c.bg,
        color: c.color,
        padding: "2px 10px",
        borderRadius: 12,
        fontSize: 10,
        fontWeight: 500,
      }}
    >
      {label}
    </span>
  );
}

// Field label
export function Label({ children, style }) {
  return (
    <div
      style={{
        fontSize: 11,
        color: "#000", // Black
        fontWeight: 500, // Optional: makes it a little bolder
        marginBottom: 4,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// Progress bar
export function ProgressBar({ value, height = 6, style }) {
  return (
    <div
      style={{
        height,
        background: "#eee",
        borderRadius: height / 2,
        overflow: "hidden",
        ...style,
      }}
    >
      <div
        style={{
          height: "100%",
          width: `${value}%`,
          background: "#2563EB",
          borderRadius: height / 2,
          transition: "width 0.3s",
        }}
      />
    </div>
  );
}

// Input field row
export function InputField({ value, placeholder, style }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        border: "1px solid var(--border-color)",
        borderRadius: "var(--radius-md)",
        marginBottom: 8,
        overflow: "hidden",
        ...style,
      }}
    >
      <input
        defaultValue={value}
        placeholder={placeholder}
        style={{
          flex: 1,
          padding: "6px 10px",
          fontSize: 11,
          border: "none",
          outline: "none",
          background: "transparent",
          color: "var(--text-secondary)",
        }}
      />
      <span
        style={{
          padding: "6px 10px",
          color: "var(--text-muted)",
          fontSize: 14,
        }}
      >
        📁
      </span>
    </div>
  );
}

// Select dropdown
export function Select({ value, options, style }) {
  return (
    <select
      defaultValue={value}
      style={{
        width: "100%",
        padding: "6px 10px",
        fontSize: 11,
        border: "1px solid var(--border-color)",
        borderRadius: "var(--radius-md)",
        background: "var(--bg-primary)",
        color: "var(--text-primary)",
        marginBottom: 8,
        ...style,
      }}
    >
      {options.map((o) => (
        <option key={o}>{o}</option>
      ))}
    </select>
  );
}

// Checkbox row
export function CheckRow({ label, checked = false }) {
  return (
    <label
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        fontSize: 12,
        marginBottom: 4,
        cursor: "pointer",
      }}
    >
      <input
        type="checkbox"
        defaultChecked={checked}
        style={{ accentColor: "var(--nvidia-green)" }}
      />
      {label}
    </label>
  );
}

// Metric row
export function MetricRow({ label, value, valueStyle }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        fontSize: 12,
        padding: "3px 0",
        borderBottom: "1px solid #f0f0f0",
      }}
    >
      <span style={{ color: "var(--text-secondary)" }}>{label}</span>
      <span style={{ fontWeight: 500, ...valueStyle }}>{value}</span>
    </div>
  );
}

// Primary button
export function BtnPrimary({ children, onClick, style }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: "var(--nvidia-green)",
        color: "white",
        border: "none",
        borderRadius: "var(--radius-md)",
        padding: "8px 16px",
        fontSize: 12,
        fontWeight: 500,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: 6,
        ...style,
      }}
    >
      {children}
    </button>
  );
}

// Secondary button
export function BtnSecondary({ children, onClick, style }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: "transparent",
        color: "#000", // Black text
        border: "1px solid var(--border-color)",
        borderRadius: "var(--radius-md)",
        padding: "7px 14px",
        fontSize: 12,
        fontWeight: 600, // optional, makes it look like NVIDIA UI
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: 6,
        ...style,
      }}
    >
      {children}
    </button>
  );
}

// 2/3 column grid
export function Grid({ cols = 3, gap = 14, children, style }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gap,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// Tip / info box
export function TipBox({ children }) {
  return (
    <div
      style={{
        background: "#e6f1fb",
        color: "#185fa5",
        borderRadius: "var(--radius-md)",
        padding: "10px 12px",
        fontSize: 11,
        display: "flex",
        gap: 8,
        alignItems: "flex-start",
        marginTop: 10,
      }}
    >
      <span>💡</span>
      <div>{children}</div>
    </div>
  );
}
