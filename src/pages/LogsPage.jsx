import { Card } from "../components/ui";
import { useState } from "react";

// Mock data for the main top table
const PIPELINE_RUNS = [
  {
    id: "a1b2c3d4",
    name: "warehouse_scan_01",
    stepNum: 1,
    stepName: "Capture",
    status: "Completed",
    statusColor: "#def7ec",
    textColor: "#03543f",
    dotColor: "#0e9f6e",
    time: "May 20, 2024 10:12 AM",
    duration: "00:08:24",
    user: "user@demo.com",
  },
  {
    id: "a1b2c3d4",
    name: "warehouse_scan_01",
    stepNum: 2,
    stepName: "COLMAP",
    status: "Completed",
    statusColor: "#def7ec",
    textColor: "#03543f",
    dotColor: "#0e9f6e",
    time: "May 20, 2024 10:22 AM",
    duration: "00:18:36",
    user: "user@demo.com",
  },
  {
    id: "a1b2c3d4",
    name: "warehouse_scan_01",
    stepNum: 3,
    stepName: "3DGUT",
    status: "Completed",
    statusColor: "#def7ec",
    textColor: "#03543f",
    dotColor: "#0e9f6e",
    time: "May 20, 2024 10:41 AM",
    duration: "02:18:34",
    user: "user@demo.com",
  },
  {
    id: "a1b2c3d4",
    name: "warehouse_scan_01",
    stepNum: 4,
    stepName: "Isaac Sim",
    status: "Completed",
    statusColor: "#def7ec",
    textColor: "#03543f",
    dotColor: "#0e9f6e",
    time: "May 20, 2024 01:02 PM",
    duration: "00:06:52",
    user: "user@demo.com",
  },
  {
    id: "d4e5f6a7",
    name: "office_scan_02",
    stepNum: 2,
    stepName: "COLMAP",
    status: "Failed",
    statusColor: "#fde8e8",
    textColor: "#9b1c1c",
    dotColor: "#f05252",
    time: "May 19, 2024 03:15 PM",
    duration: "00:07:31",
    user: "user@demo.com",
  },
  {
    id: "f7a8b9c0",
    name: "lab_scan_03",
    stepNum: 3,
    stepName: "3DGUT",
    status: "In Progress",
    statusColor: "#e1effe",
    textColor: "#1e429f",
    dotColor: "#3f83f8",
    time: "May 19, 2024 11:09 AM",
    duration: "01:02:11",
    user: "user@demo.com",
  },
  {
    id: "0a1b2c3d",
    name: "room_scan_04",
    stepNum: 1,
    stepName: "Capture",
    status: "Completed",
    statusColor: "#def7ec",
    textColor: "#03543f",
    dotColor: "#0e9f6e",
    time: "May 18, 2024 09:41 AM",
    duration: "00:06:13",
    user: "user@demo.com",
  },
];

const TERMINAL_LOGS = [
  { text: "Starting dataset validation...", type: "info" },
  {
    text: "Scanning directory: D:/datasets/warehouse_scan/images",
    type: "info",
  },
  { text: "Found 428 images", type: "success" },
  { text: "Checking image formats...", type: "info" },
  { text: "All images are in supported formats.", type: "info" },
  { text: "Analyzing image quality...", type: "info" },
  { text: "Checking overlap between images...", type: "info" },
  { text: "Estimating focal length consistency...", type: "info" },
  { text: "Validation Summary:", type: "info" },
  { text: "   - Sufficient Overlap    : Good", type: "success" },
  { text: "   - Image Sharpness       : Good", type: "success" },
  { text: "   - Exposure Consistency  : Good", type: "success" },
  { text: "   - Focus Consistency     : Good", type: "success" },
  { text: "   - Motion Blur           : Good", type: "success" },
  { text: "", type: "info" },
  { text: "Dataset Quality Score: 92% (Excellent)", type: "success" },
  { text: "Validation completed successfully.", type: "success" },
];

export default function LogsPage() {
  const [activeTab, setActiveTab] = useState("log");

  return (
    <div
      style={{
        fontFamily: "Inter, system-ui, -apple-system, sans-serif",
        color: "#111827",
        padding: "24px",
        backgroundColor: "#f9fafb",
        minHeight: "100vh",
      }}
    >
      {/* 1. TOP HEADER BAR */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 20,
        }}
      >
        <div>
          <h1
            style={{ fontSize: 22, fontWeight: 700, margin: 0, color: "#111" }}
          >
            Logs
          </h1>
          <p style={{ fontSize: 13, color: "#6b7280", margin: "4px 0 0 0" }}>
            View and manage logs for all pipeline steps. Monitor run history,
            status, and detailed outputs.
          </p>
        </div>
        <button style={styles.secondaryBtn}>🗑 Clear Completed Logs</button>
      </div>

      {/* 2. FILTER & SEARCH TOOLBAR */}
      <div
        style={{
          display: "flex",
          gap: 12,
          marginBottom: 16,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <div style={{ position: "relative", flex: 1, minWidth: 260 }}>
          <input
            type="text"
            placeholder="Search by run name, step, or message..."
            style={styles.searchInput}
          />
          <span
            style={{
              position: "absolute",
              right: 12,
              top: "50%",
              transform: "translateY(-50%)",
              color: "#9ca3af",
            }}
          >
            🔍
          </span>
        </div>
        <select style={styles.selectInput} defaultValue="all-steps">
          <option value="all-steps">All Steps</option>
        </select>
        <select style={styles.selectInput} defaultValue="all-status">
          <option value="all-status">All Status</option>
        </select>
        <div style={styles.datePickerContainer}>
          <span style={{ marginRight: 6 }}>📅</span>
          <span>May 10, 2024</span>
          <span style={{ margin: "0 8px", color: "#9ca3af" }}>➔</span>
          <span>May 20, 2024</span>
        </div>
        <button style={styles.secondaryBtn}>🔄 Refresh</button>
      </div>

      {/* 3. MAIN RUNS TABLE (TOP TABLE) */}
      <Card
        style={{
          padding: 0,
          overflow: "hidden",
          border: "1px solid #e5e7eb",
          borderRadius: 8,
          marginBottom: 24,
          background: "#fff",
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: 13,
            textAlign: "left",
          }}
        >
          <thead>
            <tr
              style={{
                backgroundColor: "#f9fafb",
                borderBottom: "1px solid #e5e7eb",
                color: "#4b5563",
                fontWeight: 600,
              }}
            >
              <th style={{ padding: "12px 16px" }}>Run Name</th>
              <th style={{ padding: "12px 16px" }}>Step</th>
              <th style={{ padding: "12px 16px" }}>Status</th>
              <th style={{ padding: "12px 16px" }}>Start Time</th>
              <th style={{ padding: "12px 16px" }}>Duration</th>
              <th style={{ padding: "12px 16px" }}>User</th>
              <th style={{ padding: "12px 16px" }}>Details</th>
              <th style={{ padding: "12px 16px", width: 40 }}></th>
            </tr>
          </thead>
          <tbody>
            {PIPELINE_RUNS.map((run, index) => (
              <tr
                key={index}
                style={{
                  borderBottom: "1px solid #e5e7eb",
                  backgroundColor: index === 0 ? "#f3f4f6" : "#fff",
                }}
              >
                <td style={{ padding: "12px 16px" }}>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <span style={{ color: "#9ca3af", fontSize: 10 }}>
                      {index === 0 ? "▼" : "▶"}
                    </span>
                    <div>
                      <div style={{ fontWeight: 500, color: "#111827" }}>
                        {run.name}
                      </div>
                      <div style={{ fontSize: 11, color: "#9ca3af" }}>
                        ID: {run.id}
                      </div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: "12px 16px" }}>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: 20,
                        height: 20,
                        borderRadius: "50%",
                        border: "1px solid #d1d5db",
                        fontSize: 11,
                        color: "#6b7280",
                      }}
                    >
                      {run.stepNum}
                    </span>
                    <span style={{ fontWeight: 500 }}>{run.stepName}</span>
                  </div>
                </td>
                <td style={{ padding: "12px 16px" }}>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 5,
                      backgroundColor: run.statusColor,
                      color: run.textColor,
                      padding: "4px 10px",
                      borderRadius: 12,
                      fontSize: 12,
                      fontWeight: 500,
                    }}
                  >
                    <span
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        backgroundColor: run.dotColor,
                      }}
                    />
                    {run.status}
                  </span>
                </td>
                <td style={{ padding: "12px 16px", color: "#4b5563" }}>
                  {run.time}
                </td>
                <td
                  style={{
                    padding: "12px 16px",
                    color: "#4b5563",
                    fontFamily: "monospace",
                  }}
                >
                  {run.duration}
                </td>
                <td style={{ padding: "12px 16px", color: "#4b5563" }}>
                  {run.user}
                </td>
                <td style={{ padding: "12px 16px" }}>
                  <button
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontSize: 16,
                    }}
                  >
                    📋
                  </button>
                </td>
                <td
                  style={{
                    padding: "12px 16px",
                    color: "#9ca3af",
                    textAlign: "center",
                    cursor: "pointer",
                  }}
                >
                  •••
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* 4. BOTTOM SPLIT VIEW (RUN DETAILS + LOG OUTPUT) */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "320px 1fr",
          gap: 24,
          alignItems: "start",
        }}
      >
        {/* Left Side Panel: Run Details */}
        <div style={styles.detailsPanel}>
          <h2
            style={{
              fontSize: 14,
              fontWeight: 600,
              margin: "0 0 16px 0",
              color: "#111827",
            }}
          >
            Run Details
          </h2>
          <table
            style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}
          >
            <tbody>
              <tr>
                <td style={styles.labelCell}>Run Name</td>
                <td style={styles.valueCell}>warehouse_scan_01</td>
              </tr>
              <tr>
                <td style={styles.labelCell}>Step</td>
                <td style={styles.valueCell}>Capture (1 of 4)</td>
              </tr>
              <tr>
                <td style={styles.labelCell}>Status</td>
                <td style={styles.valueCell}>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      backgroundColor: "#def7ec",
                      color: "#03543f",
                      padding: "2px 8px",
                      borderRadius: 12,
                      fontSize: 11,
                      fontWeight: 600,
                    }}
                  >
                    <span
                      style={{
                        width: 5,
                        height: 5,
                        borderRadius: "50%",
                        backgroundColor: "#0e9f6e",
                      }}
                    />
                    Completed
                  </span>
                </td>
              </tr>
              <tr>
                <td style={styles.labelCell}>Start Time</td>
                <td style={styles.valueCell}>May 20, 2024 10:12 AM</td>
              </tr>
              <tr>
                <td style={styles.labelCell}>End Time</td>
                <td style={styles.valueCell}>May 20, 2024 10:20 AM</td>
              </tr>
              <tr>
                <td style={styles.labelCell}>Duration</td>
                <td style={styles.valueCell}>00:08:24</td>
              </tr>
              <tr>
                <td style={styles.labelCell}>User</td>
                <td style={styles.valueCell}>user@demo.com</td>
              </tr>
              <tr>
                <td style={styles.labelCell}>Input</td>
                <td
                  style={styles.valueCell}
                  title="D:/datasets/warehouse_scan/images"
                >
                  D:/datasets/warehouse_scan/images
                </td>
              </tr>
              <tr>
                <td style={styles.labelCell}>Output</td>
                <td
                  style={styles.valueCell}
                  title="D:/recon/capture_validation"
                >
                  D:/recon/capture_validation
                </td>
              </tr>
              <tr>
                <td style={styles.labelCell}>Images</td>
                <td style={styles.valueCell}>428</td>
              </tr>
            </tbody>
          </table>
          <button style={styles.folderBtn}>📁 Open Output Folder</button>
        </div>

        {/* Right Side Panel: Log Terminal Console */}
        <div>
          {/* Console Header / Navigation Tabs */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderBottom: "1px solid #e5e7eb",
              marginBottom: 12,
            }}
          >
            <div style={{ display: "flex", gap: 4 }}>
              <button
                onClick={() => setActiveTab("log")}
                style={{
                  ...styles.tab,
                  ...(activeTab === "log" ? styles.activeTab : {}),
                }}
              >
                Log Output
              </button>
              <button
                onClick={() => setActiveTab("warn")}
                style={{
                  ...styles.tab,
                  ...(activeTab === "warn" ? styles.activeTab : {}),
                }}
              >
                Warnings (0)
              </button>
              <button
                onClick={() => setActiveTab("err")}
                style={{
                  ...styles.tab,
                  ...(activeTab === "err" ? styles.activeTab : {}),
                }}
              >
                Errors (0)
              </button>
              <button
                onClick={() => setActiveTab("sys")}
                style={{
                  ...styles.tab,
                  ...(activeTab === "sys" ? styles.activeTab : {}),
                }}
              >
                System Info
              </button>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <button style={styles.secondaryBtn}>📥 Download Log</button>
              <button style={{ ...styles.secondaryBtn, padding: "6px 8px" }}>
                ⛶
              </button>
            </div>
          </div>

          {/* Code/Terminal Console Area */}
          <Card
            style={{
              padding: 0,
              overflow: "hidden",
              border: "1px solid #e5e7eb",
              borderRadius: 6,
              background: "#fff",
            }}
          >
            <div
              style={{
                fontFamily: "Courier New, Courier, monospace",
                fontSize: 12,
                lineHeight: 1.7,
                padding: "16px",
                height: 320,
                overflowY: "auto",
                backgroundColor: "#fff",
              }}
            >
              {TERMINAL_LOGS.map((log, i) => (
                <div
                  key={i}
                  style={{ display: "flex", gap: 16, whiteSpace: "pre-wrap" }}
                >
                  {/* Line Number */}
                  <span
                    style={{
                      color: "#9ca3af",
                      width: 20,
                      textAlign: "left",
                      userSelect: "none",
                    }}
                  >
                    {i + 1}
                  </span>
                  {/* Timestamp */}
                  <span style={{ color: "#9ca3af", userSelect: "none" }}>
                    [10:12:{12 + i < 10 ? `0${12 + i}` : 12 + i}]
                  </span>
                  {/* Log Message Content */}
                  <span
                    style={{
                      color: log.type === "success" ? "#0e9f6e" : "#1f2937",
                    }}
                  >
                    {log.text}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Styling layouts
const styles = {
  secondaryBtn: {
    padding: "6px 12px",
    background: "#fff",
    border: "1px solid #d1d5db",
    borderRadius: 6,
    fontSize: 12,
    fontWeight: 500,
    color: "#374151",
    cursor: "pointer",
  },
  searchInput: {
    width: "100%",
    padding: "8px 12px",
    border: "1px solid #d1d5db",
    borderRadius: 6,
    fontSize: 13,
    outline: "none",
  },
  selectInput: {
    padding: "8px 32px 8px 12px",
    border: "1px solid #d1d5db",
    borderRadius: 6,
    fontSize: 13,
    background: "#fff",
    color: "#374151",
  },
  datePickerContainer: {
    display: "flex",
    alignItems: "center",
    padding: "8px 12px",
    border: "1px solid #d1d5db",
    borderRadius: 6,
    fontSize: 13,
    background: "#fff",
    color: "#374151",
  },
  detailsPanel: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 6,
    padding: 16,
  },
  labelCell: {
    padding: "7px 0",
    color: "#6b7280",
    fontWeight: 500,
    width: "35%",
    verticalAlign: "top",
  },
  valueCell: {
    padding: "7px 0",
    color: "#111827",
    fontWeight: "500",
    width: "65%",
    wordBreak: "break-word",
  },
  folderBtn: {
    width: "100%",
    marginTop: 16,
    padding: "8px",
    background: "#fff",
    border: "1px solid #d1d5db",
    borderRadius: 6,
    fontSize: 12,
    fontWeight: 500,
    color: "#374151",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  tab: {
    padding: "8px 16px",
    background: "none",
    border: "none",
    fontSize: 13,
    color: "#6b7280",
    cursor: "pointer",
    borderBottom: "2px solid transparent",
    marginBottom: -1,
  },
  activeTab: {
    color: "#2563eb",
    borderBottom: "2px solid #2563eb",
    fontWeight: 600,
  },
};
