import { useState, useEffect } from "react";

import "./index.css";

import Sidebar from "./components/Sidebar";
import TopBar from "./components/TopBar";
import PipelineBar from "./components/PipelineBar";

import DashboardPage from "./pages/DashboardPage";
import CapturePage from "./pages/CapturePage";
import ColmapPage from "./pages/ColmapPage";
import SegmentationPage from "./pages/SegmentationPage";
import ThreeDGUTPage from "./pages/ThreeDGUTPage";
import IsaacPage from "./pages/IsaacPage";
import LogsPage from "./pages/LogsPage";


const PAGES = {
  dashboard: DashboardPage,
  capture: CapturePage,
  colmap: ColmapPage,
  segmentation: SegmentationPage,
  "3dgut": ThreeDGUTPage,
  isaac: IsaacPage,
  logs: LogsPage,
};
// Initial pipeline status
const INITIAL_PIPELINE = {
  capture: "pending",
  colmap: "pending",
   segmentation: "pending",
  "3dgut": "pending",
  isaac: "pending",
};


export default function App() {
  const [activePage, setActivePage] = useState("dashboard");
  const [pipelineState, setPipelineState] = useState(
    INITIAL_PIPELINE
  );
  const [imagePath, setImagePath] = useState(
    "D:/Projects/WarehouseScan/images"
  );
  const [captureData, setCaptureData] = useState({
    images: [],
    videoFile: null,
    inputType: "image",
    captureStatus: {
      upload: false,
      prepare: false,
      validate: false,
    },
    validation: {
      score: 0,
      overlap: "-",
      sharpness: "-",
      exposure: "-",
      focus: "-",
      motionBlur: "-",
      unsupported: 0,
      lowResolution: 0,
    },
  });
  // Automatically mark Capture complete
  useEffect(() => {
    const completed =
      captureData.captureStatus.upload &&
      captureData.captureStatus.prepare &&
      captureData.captureStatus.validate;
    if (completed) {
      setPipelineState(prev => ({
        ...prev,
        capture: "completed",
        colmap: "in-progress",
      }));
    }
  }, [captureData]);
  const PageComponent =
    PAGES[activePage] || DashboardPage;
  return (
    <div style={styles.app}>
      {/* TOP BAR */}
      <TopBar />
      {/* BODY */}
      <div style={styles.body}>
        {/* SIDEBAR */}
        <Sidebar
          activePage={activePage}
          onNavigate={setActivePage}
        />
        {/* MAIN CONTENT */}
        <div style={styles.main}>
          {/* PIPELINE */}
          <PipelineBar
            pipeline={pipelineState}
            activePage={activePage}
            onNavigate={setActivePage}
          />
          {/* PAGE */}
          <div style={styles.page}>
            <PageComponent
              onNavigate={setActivePage}
              imagePath={imagePath}
              setImagePath={setImagePath}
              captureData={captureData}
              setCaptureData={setCaptureData}
              pipelineState={pipelineState}
              setPipelineState={setPipelineState}
            />
          </div>
        </div>
      </div>
    </div>
  );
}



const styles = {
  app: {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  body: {
    flex: 1,
    display: "flex",
    minHeight: 0,
  },
  main: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    padding: "8px 24px 20px",
    background: "var(--bg-tertiary)",
  },
  page: {
    flex: 1,
    overflowY: "auto",
  },
};