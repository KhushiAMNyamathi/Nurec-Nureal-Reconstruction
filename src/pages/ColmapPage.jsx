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

import colmap from "../images/colmap.png";
import { useState } from "react";
import PointCloudViewer from "../components/PointCloudViewer";


const INITIAL_STEPS = [
  {
    id: "feature",
    label: "Feature Extraction",
    status: "pending",
    time: null,
  },
  {
    id: "matching",
    label: "Image Matching",
    status: "pending",
    time: null,
  },
  {
    id: "mapping",
    label: "Sparse Reconstruction",
    status: "pending",
    time: null,
  },
  {
    id: "bundle",
    label: "Bundle Adjustment",
    status: "pending",
    time: null,
  },
  {
    id: "output",
    label: "COLMAP Output",
    status: "pending",
    time: null,
  },
];

export default function ColmapPage({
  onNavigate,
  imagePath
}) {


  // ==========================
  // STATES
  // ==========================


  const [projectPath, setProjectPath] =
    useState("");
  const [showViewer, setShowViewer] = useState(false);
  const [cameraModel, setCameraModel] =
    useState("PINHOLE");
  // const [imagePath, setImagePath] = useState(
  //   "D:/Projects/WarehouseScan/images"
  // );
  const [singleCamera, setsingleCamera] = useState(true);
  const [affineShape, setAffineShape] = useState(true);
  const [domainPooling, setDomainPooling] = useState(true);

  const [maxMatches, setMaxMatches] = useState(32768);

  const [maxImageSize, setMaxImageSize] = useState(2000);

  const [gpuMatching, setGpuMatching] =
    useState(false);


  const [running, setRunning] =
    useState(false);
  const [colmapCompleted, setColmapCompleted] =
    useState(false);

  const [progress, setProgress] =
    useState(0);


  const [steps, setSteps] =
    useState(INITIAL_STEPS);

  const [results, setResults] =
    useState({

      images: 0,
      cameras: 0,
      points: 0,
      error: 0

    });


  // functions
  const openColmapViewer = async () => {

    try {

      const response = await fetch(
        "http://localhost:8000/open-colmap",
        {
          method: "POST"
        }
      );


      const data = await response.json();

      console.log(data);


    }

    catch (error) {

      console.error(
        "Failed to open COLMAP",
        error
      );

    }

  };
  const openColmap = async () => {

    await fetch(
      "http://localhost:8000/open-colmap",
      {
        method: "POST"
      }
    );

  };
  const updateStep = (id) => {

    setSteps(prev =>
      prev.map(step => {

        if (step.id === id) {
          return {
            ...step,
            status: "done",
            time: "Completed"
          };
        }

        return step;

      })
    );

  };

  const browseProjectFolder = async () => {
    console.log("Browse button clicked");

    try {

      const response = await fetch(
        "http://127.0.0.1:8000/select-project-folder"
      );

      console.log("Response:", response);

      const data = await response.json();

      console.log("Data:", data);

      if (data.folder) {
        setProjectPath(data.folder);
      }
    } catch (err) {
      console.error("ERROR:", err);
    }
  };

  const handleFolderSelect = (e) => {
    const files = Array.from(e.target.files);

    setSelectedFiles(files);

    console.log(files);

    console.log(files[0].webkitRelativePath);
  };

  // ==========================
  // RUN COLMAP
  // ==========================

  const canRunColmap =
    projectPath &&
    imagePath &&
    !running;
  const processColmapLog = (log) => {

    console.log("PROCESSING LOG:", log);


    // Feature Extraction
    if (log.includes("feature_extraction.cc")) {

      setSteps(prev =>
        prev.map(step =>
          step.id === "feature"
            ? {
              ...step,
              status: "active"
            }
            :
            step
        )
      );

    }


    if (log.includes("Features:")) {

      setSteps(prev =>
        prev.map(step =>
          step.id === "feature"
            ? {
              ...step,
              status: "done",
              time: "Completed"
            }
            :
            step
        )
      );


      setProgress(25);

    }



    // Matching

    if (log.includes("Loading matches")) {

      setSteps(prev =>
        prev.map(step =>
          step.id === "matching"
            ?
            {
              ...step,
              status: "active"
            }
            :
            step
        )
      );

    }



    if (log.includes("Building correspondence graph")) {


      setSteps(prev =>
        prev.map(step =>
          step.id === "matching"
            ?
            {
              ...step,
              status: "done",
              time: "Completed"
            }
            :
            step
        )
      );


      setProgress(45);

    }



    // Sparse Reconstruction

    if (log.includes("Registering image")) {


      setSteps(prev =>
        prev.map(step =>
          step.id === "mapping"
            ?
            {
              ...step,
              status: "active"
            }
            :
            step
        )
      );


      setProgress(65);

    }



    if (log.includes("Keeping successful reconstruction")) {


      setSteps(prev =>
        prev.map(step =>
          step.id === "mapping"
            ?
            {
              ...step,
              status: "done",
              time: "Completed"
            }
            :
            step
        )
      );


      setProgress(90);

    }
    // Complete

    if (log.includes("COLMAP DONE")) {
      setProgress(100);
    }

  };
  const socket = new WebSocket(
    "ws://localhost:8000/colmap-progress"
  );


  socket.onopen = () => {

    socket.send(
      JSON.stringify({

        project_path:
          "D:/recon/colmap_project",

        image_path:
          "D:/datasets/warehouse_scan/images"

      })
    );

  };



  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    console.log(data);

    if (data.stage) {
      setColmapStatus(
        data.stage
      );
    }
    if (data.log) {
      setLogs(prev => [
        ...prev,
        data.log
      ]);
    }

  }

  const runColmap = async () => {

    try {

      setRunning(true);
      setProgress(0);


      updateStep("feature");
      setProgress(20);


      const response = await fetch(
        "http://127.0.0.1:8000/run-colmap",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({

            project_path: projectPath,
            image_path: imagePath,
            camera_model: cameraModel,
            single_camera: singleCamera,
            max_image_size: maxImageSize,
            affine_shape: affineShape,
            domain_pooling: domainPooling,
            gpu_matching: gpuMatching

          })
        }
      );


      updateStep("matching");
      setProgress(40);


      updateStep("mapping");
      setProgress(70);


      updateStep("bundle");
      setProgress(90);



      const data = await response.json();
      console.log(
        "COLMAP DATA:",
        data
      );


      if (data.status === "success") {

        const url =
          `http://127.0.0.1:8000/point-cloud?project_path=${encodeURIComponent(projectPath)}`;


        console.log(
          "PLY URL:",
          url
        );


        // setPointCloudUrl(url);

      }


      if (data.status === "success") {

        setColmapCompleted(true);
        setProgress(100);
        updateStep("output");
        setSteps(prev =>
          prev.map(step => ({
            ...step,
            status: "done",
            time: "Completed"
          }))
        );


        setResults({

          images: data.images || 0,
          cameras: data.cameras || 0,
          points: data.points || 0,
          error: data.error || 0

        });

      }


    }


    catch (error) {

      console.error(
        "COLMAP ERROR",
        error
      );

    }


    finally {

      setRunning(false);

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

          <h1
            style={{
              fontSize: 18,
              fontWeight: 500,
              marginBottom: 4
            }}
          >
            COLMAP Reconstruction
          </h1>


          <p
            style={{
              fontSize: 12,
              color: "var(--text-secondary)"
            }}
          >

            Run COLMAP to estimate camera poses and
            generate sparse point cloud from images.

          </p>


        </div>


        <BtnSecondary>
          ↗ COLMAP Documentation
        </BtnSecondary>


      </div>
      <Grid cols={3} gap={14}>


        {/* card 1 */}

        <Card>
          <div style={styles.cardContent}>
            <SectionTitle num={1}>
              Configuration
            </SectionTitle>

            {/* Project Folder */}
            <Label>Project Folder</Label>

            <div style={styles.pathRow}>

              <input
                style={styles.pathInput}
                value={projectPath}
                readOnly
                placeholder="Select Project Folder"
              />

              <button
                type="button"
                style={styles.folderButton}
                onClick={browseProjectFolder}
              >
                📁
              </button>
            </div>

            {/* Images Folder */}
            <Label>
              Images Folder
            </Label>
            <div style={styles.pathRow}>
              <span style={styles.path}>
                {
                  imagePath || "No images selected"
                }
              </span>
            </div>

            {/* Camera Model */}

            <div style={styles.section}>
              <Label>Camera Model</Label>
              <Select
                value={cameraModel}
                onChange={(e) => setCameraModel(e.target.value)}
                options={[
                  "PINHOLE",
                  "SIMPLE_RADIAL",
                  "RADIAL",
                  "OPENCV",
                ]}
              />

            </div>

            {/* Feature Extraction */}
            <div style={styles.section}>
              <Label>Feature Extraction</Label>
              <Label style={{ marginTop: 6 }}>
                Max Image Size
              </Label>
              <input
                type="number"
                value={maxImageSize}
                onChange={(e) =>
                  setMaxImageSize(Number(e.target.value))
                }
                style={styles.input}
              />
              <CheckRow
                label="Single Camera"
                checked={singleCamera}
                onChange={() =>
                  setsingleCamera(!singleCamera)
                }
              />

              <CheckRow
                label="Affine Shape"
                checked={affineShape}
                onChange={() =>
                  setAffineShape(!affineShape)
                }
              />

              <CheckRow
                label="Domain Pooling"
                checked={domainPooling}
                onChange={() =>
                  setDomainPooling(!domainPooling)
                }
              />

            </div>

            {/* Matching */}
            <div style={styles.section}>
              <Label>Matching</Label>

              <CheckRow
                label="GPU Matching"
                checked={gpuMatching}
                onChange={() =>
                  setGpuMatching(!gpuMatching)
                }
              />

              {/* <Label style={{ marginTop: 8 }}>
                Max Matches
              </Label> */}

              {/* <input
                type="number"
                value={maxMatches}
                onChange={(e) =>
                  setMaxMatches(Number(e.target.value))
                }
                style={styles.input}
              /> */}

            </div>

            {/* Output */}
            <Label>Output Folder</Label>

            <div style={styles.pathRow}>

              <span style={styles.path}>

                {projectPath
                  ? `${projectPath}\\colmap`
                  : "Select Project Folder"}

              </span>

            </div>

            <BtnSecondary
              style={{
                width: "100%",
                justifyContent: "center",
                marginBottom: 8,
              }}
            >
              💾 Save Configuration
            </BtnSecondary>

            <BtnPrimary
              disabled={!canRunColmap}
              onClick={runColmap}
              style={{
                width: "100%",
                justifyContent: "center",
              }}
            >
              {running
                ? "Running COLMAP..."
                : "▶ Run COLMAP"}
            </BtnPrimary>

          </div>

        </Card>

        {/*  card  2 */}
        <Card>
          <div style={styles.cardContent}>
            <SectionTitle num={2}>
              Run COLMAP
            </SectionTitle>
            <Label>
              Progress
            </Label>
            <ProgressBar
              value={progress}
              height={8}
            />
            <div
              style={{
                textAlign: "right",
                fontSize: 10,
                color: "var(--text-muted)",
                marginBottom: 10
              }}

            >
              {progress}%
            </div>
            <Grid cols={2} gap={8}>
              <div>
                <Label>
                  Current Step
                </Label>

                <strong style={{ fontSize: 11 }}>

                  {

                    steps.find(
                      s => s.status === "active"
                    )?.label
                    ||
                    "Waiting..."

                  }


                </strong>


              </div>





              <div>

                <Label>
                  Status
                </Label>


                <strong style={{ fontSize: 11 }}>

                  {
                    running
                      ?
                      "Running"
                      :
                      progress === 100
                        ?
                        "Completed"
                        :
                        "Idle"
                  }

                </strong>


              </div>


            </Grid>





            <div style={{ marginTop: 10 }}>


              {
                steps.map((s) => (


                  <div

                    key={s.id}

                    style={styles.stepRow}

                  >


                    <span>


                      <span
                        style={{
                          marginRight: 6,
                          color:
                            s.status === "done"
                              ?
                              "var(--nvidia-green)"
                              :
                              "#999"

                        }}

                      >

                        {
                          s.status === "done"
                            ?
                            "✓"
                            :
                            "○"
                        }

                      </span>



                      {s.label}


                    </span>





                    <span

                      style={{
                        fontSize: 10,
                        color: "var(--text-muted)"
                      }}
                    >
                      {
                        s.status === "done"
                          ?
                          "Completed"
                          :
                          s.status === "active"
                            ?
                            "Running..."
                            :
                            "Pending"
                      }
                    </span>
                  </div>
                ))
              }
            </div>
            <div
              style={{
                display: "flex",
                gap: 8,
                marginTop: 12
              }}
            >
              <BtnSecondary
                style={{
                  flex: 1,
                  justifyContent: "center"
                }}
              >
                ⏸ Pause
              </BtnSecondary>
              <button style={styles.stopBtn}>
                ⏹ Stop
              </button>
            </div>

            <div style={styles.infoBox}>
              <div style={styles.infoTitle}>
                ℹ️ About COLMAP

              </div>



              <div style={styles.infoText}>


                COLMAP performs Structure from Motion
                and Multi View Stereo reconstruction.
                It estimates camera poses and sparse
                point clouds.


              </div>


            </div>



          </div>


        </Card>

        {/* ================= card 3 PREVIEW ================= */}

        <Card>
          <div style={styles.cardContent}>
            <SectionTitle num={3}>
              Reconstruction Preview
            </SectionTitle>

            {
              colmapCompleted ? (
                <PointCloudViewer />
              ) : (

                <div
                  style={{
                    width: "100%",
                    height: "350px",
                    background: "#111",
                    borderRadius: 10,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#888",
                    fontSize: 12
                  }}
                >
                  Run COLMAP to generate reconstruction
                </div>

              )
            }

            <Label>
              Results
            </Label>

            <div style={styles.statGrid}>
              {
                [
                  ["Images", results.images],
                  ["Cameras", results.cameras],
                  ["Sparse Points", results.points],
                  ["Reproj Error", results.error]
                ]

                  .map(([l, v]) => (

                    <div
                      key={l}
                      style={styles.statCard}
                    >

                      <div style={{
                        fontSize: 13,
                        fontWeight: 600
                      }}>
                        {v}
                      </div>


                      <div style={{
                        fontSize: 10,
                        color: "var(--text-muted)"
                      }}>
                        {l}
                      </div>

                    </div>

                  ))
              }

            </div>
            <BtnPrimary
              onClick={() => setShowViewer(true)}
            >
              Open COLMAP Viewer →
            </BtnPrimary>
            <BtnPrimary
              onClick={() =>
                onNavigate("3dgut")
              }
            >
              Proceed to 3DGUT →

            </BtnPrimary>


          </div>


        </Card>
      </Grid>

      {
        showViewer && (

          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.75)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 9999
            }}
          >

            <div
              style={{
                width: "92%",
                height: "92%",
                background: "#ffffff",
                borderRadius: 12,
                position: "relative",
                overflow: "hidden"
              }}
            >

              <button
                onClick={() => setShowViewer(false)}
                style={{
                  position: "absolute",
                  top: 15,
                  right: 15,
                  width: 40,
                  height: 40,
                  border: "none",
                  borderRadius: "50%",
                  cursor: "pointer",
                  fontSize: 22,
                  background: "#222",
                  color: "#fff",
                  zIndex: 100
                }}
              >
                ✕
              </button>

              <PointCloudViewer height="100%" />

            </div>

          </div>

        )
      }
    </div>

  );

}
const styles = {
  input: {
    width: "100%",
    padding: "8px 10px",
    border: "1px solid var(--border-color)",
    borderRadius: "6px",
    fontSize: "12px",
    marginTop: 4,
    marginBottom: 10,
    outline: "none",
    background: "var(--bg-primary)",
    color: "var(--text-primary)",
  },
  cardContent: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },


  section: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
    marginBottom: 15,
  },


  pathRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    border: "1px solid var(--border-color)",
    borderRadius: "var(--radius-md)",
    padding: "6px 10px",
    marginBottom: 8,
  },


  pathInput: {
    width: "100%",
    border: "none",
    outline: "none",
    background: "transparent",
    fontSize: 10,
    fontFamily: "monospace",
    color: "var(--text-secondary)"
  },


  path: {
    fontSize: 10,
    color: "var(--text-muted)",
    fontFamily: "monospace"
  },


  stepRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "8px 0",
    borderBottom: "1px solid #f2f2f2",
    fontSize: 11,
  },


  stopBtn: {
    flex: 1,
    background: "#333",
    color: "white",
    border: "none",
    borderRadius: "var(--radius-md)",
    padding: "7px 14px",
    cursor: "pointer",
    fontSize: 12,
  },


  infoBox: {
    marginTop: 14,
    padding: "12px 14px",
    background: "#EAF5FF",
    border: "1px solid #B8DFFF",
    borderLeft: "4px solid #2B7CD3",
    borderRadius: 8,
  },


  infoTitle: {
    fontSize: 12,
    fontWeight: 600,
    color: "#185FA5",
    marginBottom: 6,
  },


  infoText: {
    fontSize: 11,
    lineHeight: 1.6,
    color: "#35546D",
  },


  previewImageBox: {
    width: "100%",
    height: 350,
    borderRadius: 10,
    overflow: "hidden",
    border: "1px solid var(--border-color)",
    background: "#000000",
  },


  previewImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },


  statGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2,1fr)",
    gap: 6,
    marginTop: 8,
  },


  statCard: {
    background: "var(--bg-secondary)",
    borderRadius: "var(--radius-md)",
    padding: "8px",
    textAlign: "center",
  },


};