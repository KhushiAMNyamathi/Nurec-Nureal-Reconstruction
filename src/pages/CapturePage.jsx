import { useRef, useState } from "react";
import { BtnPrimary, BtnSecondary } from "../components/ui";


export default function CapturePage({
  onNavigate,
  captureData,
  setCaptureData,
  imagePath,
  setImagePath,
}) {
  console.log("setImagePath:", setImagePath);
  // ── refs ──
  const fileInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // helper
  const completeUpload = () => {
    setCaptureData((prev) => ({
      ...prev,
      captureStatus: {
        ...prev.captureStatus,
        upload: true,
      },
    }));
  };

  const completePrepare = () => {
    setCaptureData((prev) => ({
      ...prev,
      captureStatus: {
        ...prev.captureStatus,
        prepare: true,
      },
    }));
  };

  const completeValidation = () => {
    setCaptureData((prev) => ({
      ...prev,
      captureStatus: {
        ...prev.captureStatus,
        validate: true,
      },
    }));
  };

  //states
  const [validationMsg, setValidationMsg] = useState("");
  const [imageFolderPath, setImageFolderPath] = useState("");
  // const [captureData.captureStatus, setCaptureStatus] = useState({
  //   upload: false,
  //   prepare: false,
  //   validate: false,
  // });

  const [validationResult, setValidationResult] = useState({
    passed: false,
    message: "",
    imageCount: 0,
  });

  // ── images state ──
  const [images, setImages] = useState([]);

  // ── video state ──
  const [inputType, setInputType] = useState("image"); // "image" | "video"
  const [videoFile, setVideoFile] = useState(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [videoReady, setVideoReady] = useState(false);
  const [videoMeta, setVideoMeta] = useState({ width: 0, height: 0, duration: 0 });
  const [extracting, setExtracting] = useState(false);
  const [outputFormat, setOutputFormat] = useState("jpeg");
  const [quality, setQuality] = useState(85);
  const [interval, setInterval] = useState(1); // seconds
  const [extractionMode, setExtractionMode] = useState("interval");


  // ── validation state ──
  const [validation, setValidation] = useState({
    score: 0,
    overlap: "-",
    sharpness: "-",
    exposure: "-",
    focus: "-",
    motionBlur: "-",
    unsupported: 0,
    lowResolution: 0,
  });

  // ── handlers ──
  // uploading to backend
  const uploadImagesToBackend = async (uploadedImages) => {

    try {

      const formData = new FormData();


      uploadedImages.forEach((img) => {
        formData.append("files", img);
      });


      const response = await fetch(
        "http://127.0.0.1:8000/upload-images",
        {
          method: "POST",
          body: formData,
        }
      );


      if (!response.ok) {
        throw new Error("Upload failed");
      }


      const data = await response.json();

      console.log("Backend response:", data);



      setCaptureData(prev => ({
        ...prev,

        captureStatus: {
          ...prev.captureStatus,

          upload: true,

          prepare: true,

        }

      }));


    }
    catch (error) {

      console.error(error);

    }

  };

  const handleFolderSelect = async (e) => {

    const files = Array.from(e.target.files)
      .filter((f) => f.type.startsWith("image/"));

    if (files.length === 0) return;


    console.log("Selected images:", files.length);


    // Get folder name
    const folderName =
      files[0].webkitRelativePath.split("/")[0];


    const folderPath =
      `uploads/${folderName}`;


    console.log("Selected folder path:", folderPath);


    // Update App.jsx imagePath state
    setImagePath(folderPath);

    // Local state
    setImages(files);

    // Parent capture state
    setCaptureData(prev => ({
      ...prev,

      images: files,

      imagePath: folderPath,

      captureStatus: {
        ...prev.captureStatus,

        upload: true,

        prepare: true,

      }

    }));


    console.log("Capture state updated");


    // Backend upload
    await uploadImagesToBackend(files);

  };


  const handleDrop = (e) => {
    e.preventDefault();

    const files = Array.from(e.dataTransfer.files).filter((f) =>
      f.type.startsWith("image/")
    );
    if (files.length === 0) return;
    setImages(files);
    setCaptureData(prev => ({
      ...prev,
      images: files,
      captureStatus: {
        ...prev.captureStatus,
        upload: true,
        prepare: true,
      }
    }));
  };

  const handleVideoSelect = (e) => {

    const file = e.target.files[0];

    if (!file) return;


    setVideoFile(file);

    setVideoReady(false);

    setVideoUrl(URL.createObjectURL(file));


    setCaptureData(prev => ({
      ...prev,

      videoFile: file,

      captureStatus: {
        ...prev.captureStatus,

        upload: true,

      }

    }));

  };

  const handleVideoDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file || !file.type.startsWith("video/")) return;
    setVideoFile(file);
    setVideoReady(false);
    setVideoUrl(URL.createObjectURL(file));
  };

  const handleRemoveVideo = (e) => {
    e.stopPropagation();
    setVideoFile(null);
    setVideoUrl("");
    setVideoReady(false);
    setImages([]);
  };

  const onVideoMeta = () => {
    const v = videoRef.current;
    if (!v) return;

    setVideoMeta({
      width: v.videoWidth,
      height: v.videoHeight,
      duration: v.duration,
    });

    setVideoReady(true);
  };

  // Estimated frame count based on sampling mode
  const estimatedFrames = videoReady
    ? extractionMode === "all"
      ? Math.floor(videoMeta.duration * 30) // assuming 30 FPS
      : Math.floor(videoMeta.duration / interval)
    : 0;

  const extractFrames = async () => {
    if (!videoReady) { alert("Video is still loading."); return; }
    const video = videoRef.current;
    if (!video || !video.duration || isNaN(video.duration)) {
      alert("Video metadata not loaded yet. Please try again.");
      return;
    }

    let frameCount;
    let captureInterval;

    if (extractionMode === "all") {
      const fps = 30; // Replace with actual FPS if available
      frameCount = Math.floor(video.duration * fps);
      captureInterval = 1 / fps;
    } else {
      frameCount = estimatedFrames;
      captureInterval = interval;
    }
    if (!frameCount || frameCount <= 0) { alert("Invalid frame count."); return; }

    setExtracting(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const frames = [];


    for (let i = 0; i < frameCount; i++) {
      const captureTime = i * captureInterval;
      await new Promise((resolve) => {
        video.currentTime = captureTime;
        video.onseeked = () => {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          canvas.toBlob((blob) => {

            const ext = outputFormat === "png" ? "png" : "jpg";

            frames.push(
              new File(
                [blob],
                `frame_${i}.${ext}`,
                {
                  type: outputFormat === "png"
                    ? "image/png"
                    : "image/jpeg"
                }
              )
            );

            resolve();

          },
            outputFormat === "png"
              ? "image/png"
              : "image/jpeg",

            quality / 100
          );
        };
      });
    }

    setImages(frames);

    await uploadImagesToBackend(frames);

    setExtracting(false);

    completePrepare();
  };

  const validateDataset = async () => {

    if (images.length === 0) {
      alert("Please upload or extract images first.");
      return;
    }

    const unsupported = images.filter(
      (img) => !["image/jpeg", "image/png"].includes(img.type)
    ).length;

    let lowResolution = 0;

    await Promise.all(
      images.map(
        (img) =>
          new Promise((resolve) => {

            const image = new Image();

            image.onload = () => {

              if (
                image.width < 1280 ||
                image.height < 720
              ) {
                lowResolution++;
              }

              resolve();

            };

            image.src = URL.createObjectURL(img);

          })
      )
    );

    let overlap = "Poor";

    if (images.length >= 100)
      overlap = "Excellent";
    else if (images.length >= 50)
      overlap = "Good";
    else if (images.length >= 20)
      overlap = "Average";

    let score = 100;

    if (images.length < 20)
      score -= 30;

    if (unsupported > 0)
      score -= unsupported * 5;

    if (lowResolution > 0)
      score -= lowResolution * 2;

    score = Math.max(score, 0);

    setValidation({

      score,

      overlap,

      sharpness: "Pending",

      exposure: "Pending",

      focus: "Pending",

      motionBlur: "Pending",

      unsupported,

      lowResolution,

    });

    if (
      images.length >= 20 &&
      unsupported === 0 &&
      lowResolution === 0
    ) {

      completeValidation();

      alert("Dataset validation completed successfully.");

    } else {

      alert("Dataset validation failed. Please fix the highlighted issues.");

    }

  };

  const totalSizeMB = images.length
    ? (images.reduce((sum, f) => sum + f.size, 0) / (1024 * 1024)).toFixed(2)
    : "0";

  const fmtTime = (sec) => {
    if (!sec || isNaN(sec)) return "00:00:00";
    const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = Math.floor(sec % 60);
    return [h, m, s].map((n) => String(n).padStart(2, "0")).join(":");
  };

  const estimatedSizeGB = (estimatedFrames * 0.005).toFixed(1); // rough estimate
  const canProceed =
    captureData.captureStatus.upload &&
    captureData.captureStatus.prepare &&
    captureData.captureStatus.validate;
  console.log(
    "Upload:", captureData.captureStatus.upload,
    "Prepare:", captureData.captureStatus.prepare,
    "Validate:", captureData.captureStatus.validate
  );
  console.log(
    "CURRENT STATE",
    captureData.captureStatus
  );
  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}>Capture Scene</h1>

          <p style={{ fontSize: 12, color: "var(--text-secondary)" }}>
            Capture images of your scene using a single camera. You can upload images directly or upload a video and extract frames.
          </p>
        </div>
        <BtnSecondary>❓ Capture Guidelines</BtnSecondary>
      </div>

      {/* Tab toggle */}
      <div style={s.tabRow}>
        <button style={{ ...s.tabBtn, ...(inputType === "image" ? s.tabActive : {}) }} onClick={() => setInputType("image")}>
          🖼 Image Upload
        </button>
        <button style={{ ...s.tabBtn, ...(inputType === "video" ? s.tabActive : {}) }} onClick={() => setInputType("video")}>
          📹 Video <span style={s.newBadge}>New</span>
        </button>
      </div>

      {/* 3 cards row */}
      <div style={s.grid3}>

        {/* ══ CARD 1 — Upload ══ */}
        <Card>
          {inputType === "image" ? (
            <>
              <CardTitle num={1}>Upload Images</CardTitle>
              <CardSub>Upload your captured images.</CardSub>

              <div style={s.dropZone} onClick={() => fileInputRef.current.click()} onDragOver={(e) => e.preventDefault()} onDrop={handleDrop}>
                <div style={{ fontSize: 30 }}>🖼️</div>
                <div style={{ fontSize: 12, color: "var(--text-secondary)", margin: "10px 0 4px" }}>Drag and drop images here</div>
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 10 }}>or</div>
                <button style={s.browseBtn} onClick={(e) => { e.stopPropagation(); fileInputRef.current.click(); }}>Browse Images</button>
              </div>
              <input ref={fileInputRef} type="file" multiple accept="image/*" style={{ display: "none" }} onChange={handleFolderSelect} {...{ webkitdirectory: "" }} />

              {images.length > 0 && (
                <div style={s.successRow}>
                  <span style={{ color: "var(--nvidia-green)" }}>✓</span>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 500 }}>{images.length} images uploaded</div>
                    <div style={{ fontSize: 10, color: "var(--text-muted)" }}>JPG, PNG · {totalSizeMB} MB</div>
                  </div>
                </div>
              )}
              <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 8 }}>Supported formats: JPG, PNG · Max image size: 50 MB</div>
              <div style={{ fontSize: 10, color: "#185fa5", marginTop: 2, cursor: "pointer" }}>Image Requirements ⓘ</div>
            </>
          ) : (
            <>
              <CardTitle num={1}>Upload Video</CardTitle>
              <CardSub>Upload a video of your scene to extract images.</CardSub>

              {!videoFile ? (
                <div style={s.dropZone} onClick={() => videoInputRef.current.click()} onDragOver={(e) => e.preventDefault()} onDrop={handleVideoDrop}>
                  <div style={{ fontSize: 30 }}>📹</div>
                  <div style={{ fontSize: 12, color: "var(--text-secondary)", margin: "10px 0 4px" }}>Drag and drop a video file here</div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 10 }}>or</div>
                  <button style={s.browseBtn} onClick={(e) => { e.stopPropagation(); videoInputRef.current.click(); }}>Browse Video</button>
                </div>
              ) : (
                <div style={s.videoInfoBox}>
                  <video ref={videoRef} src={videoUrl} onLoadedMetadata={onVideoMeta} style={{ width: 120, height: 90, objectFit: "cover", borderRadius: 4, background: "#000" }} muted />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{videoFile.name}</div>
                    <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 2 }}>
                      {videoMeta.width}×{videoMeta.height} · {fmtTime(videoMeta.duration)} · {(videoFile.size / (1024 * 1024)).toFixed(0)} MB
                    </div>
                  </div>
                  <span style={s.deleteBtn} onClick={handleRemoveVideo}>🗑</span>
                </div>
              )}
              <input ref={videoInputRef} type="file" accept="video/*" style={{ display: "none" }} onChange={handleVideoSelect} />

              <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 8 }}>Supported formats: MP4, MOV, AVI, MKV · Max file size: 10 GB</div>
              <div style={{ fontSize: 10, color: "#185fa5", marginTop: 2, cursor: "pointer" }}>Video Requirements ⓘ</div>

              {/* hidden canvas for extraction */}
              <canvas ref={canvasRef} style={{ display: "none" }} />
            </>
          )}
        </Card>

        {/* ══ CARD 2 — Dataset Summary (image) / Extract Frames (video) ══ */}
        {inputType === "image" ? (
          <Card>
            <CardTitle num={2}>Dataset Summary</CardTitle>
            <CardSub>Overview of your image dataset.</CardSub>
            <SummaryRow label="Image Count" value={images.length} />
            <SummaryRow label="Estimated Dataset Size" value={`${totalSizeMB} MB`} />
            <SummaryRow label="Camera Model" value="Unknown" />
            <SummaryRow label="Source Type" value="Images" />
            <button style={s.refreshBtn} onClick={() => window.location.reload()}>🔄 Refresh</button>
          </Card>
        ) : (
          <Card>
            <CardTitle num={2}>Extraction Settings</CardTitle>
            <CardSub>Configure how frames should be extracted.</CardSub>

            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 600 }}>Output Format</div>

              <select
                value={outputFormat}
                onChange={(e) => setOutputFormat(e.target.value)}
                style={s.numberInput}
              >
                <option value="jpeg">JPEG</option>
                <option value="png">PNG</option>
              </select>
            </div>

            {outputFormat === "jpeg" && (
              <div style={{ marginBottom: 16 }}>
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 6
                }}>
                  <span>Quality</span>
                  <span>{quality}%</span>
                </div>

                <input
                  type="range"
                  min="10"
                  max="100"
                  value={quality}
                  onChange={(e) => setQuality(Number(e.target.value))}
                  style={{ width: "100%" }}
                />
              </div>
            )}

            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 600 }}>
                Extraction Mode
              </div>

              <select
                value={extractionMode}
                onChange={(e) => {
                  if (!videoFile) {
                    alert("Please upload a video first.");
                    return;
                  }

                  setExtractionMode(e.target.value);
                }}
                style={s.numberInput}
              >
                <option value="interval">Extract by Interval</option>
                <option value="all">Extract All Frames</option>
              </select>
            </div>

            {extractionMode === "interval" && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 600 }}>
                  Frame Interval
                </div>

                <input
                  type="number"
                  min={1}
                  value={interval}
                  onChange={(e) => setInterval(Number(e.target.value))}
                  style={s.numberInput}
                />

                <div style={{ fontSize: 11, color: "#888" }}>
                  ({interval}s)
                </div>
              </div>
            )}

            <div style={{ marginBottom: 20 }}>
              Estimated: ~{estimatedFrames} frames
            </div>

            <BtnPrimary
              style={{ width: "100%", justifyContent: "center" }}
              onClick={extractFrames}
              disabled={!videoReady || extracting}
            >
              {extracting ? "Extracting..." : "Extract Frames"}
            </BtnPrimary>

          </Card>
        )}

        {/* ══ CARD 3 — Dataset Validation (same for both modes) ══ */}
        <Card>
          <CardTitle num={3}>Dataset Validation</CardTitle>
          <CardSub>
            {inputType === "video" ? "Validate your extracted images to check quality and coverage." : "Validate your dataset to check image quality and capture coverage."}
          </CardSub>

          <div style={{ display: "flex", alignItems: "flex-start", gap: 16, marginTop: 8 }}>
            <div style={{ flexShrink: 0 }}>
              <QualityRing value={validation.score} />
              <div style={{ textAlign: "center", marginTop: 4, fontSize: 11, fontWeight: 600, color: "var(--nvidia-green)" }}>
                {validation.score >= 90 ? "Excellent" : validation.score >= 70 ? "Good" : validation.score > 0 ? "Needs Work" : "—"}
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <ValRow label="Sufficient Overlap" value={validation.overlap} />
              <ValRow label="Image Sharpness" value={validation.sharpness} />
              <ValRow label="Exposure Consistency" value={validation.exposure} />
              <ValRow label="Focus Consistency" value={validation.focus} />
              <ValRow label="Motion Blur" value={validation.motionBlur} />
              <ValRow label="Unsupported Images" value={validation.unsupported} warn={validation.unsupported > 0} />
              <ValRow
                label="Low Resolution Images"
                value={validation.lowResolution}
                warn={validation.lowResolution > 0}
              />
            </div>
          </div>

          <BtnPrimary style={{ width: "100%", justifyContent: "center", marginTop: 14 }} onClick={validateDataset}>✓ Validate Dataset</BtnPrimary>
          <div style={{ textAlign: "center", fontSize: 10, color: "#185fa5", marginTop: 6, cursor: "pointer" }}>View Validation Details ▾</div>
        </Card>
      </div>

      {/* Image / Extracted Preview */}
      {images.length > 0 && (
        <Card style={{ marginTop: 14, height: "auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{inputType === "video" ? "Extracted Images Preview" : "Image Preview"}</div>
              <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>Showing {Math.min(12, images.length)} of {images.length} images</div>
            </div>
          </div>
          <div style={s.previewGrid}>
            {images.slice(0, 11).map((img, i) => (
              <img key={i} src={URL.createObjectURL(img)} alt={img.name} style={s.previewThumb} />
            ))}
            {images.length > 11 && <div style={s.previewMore}>+{images.length - 11}<br />more</div>}
          </div>
        </Card>
      )}

      {/* Tips */}
      <Card style={{ marginTop: 14, background: "#eaf4ff", border: "1px solid #b8d9ff", boxShadow: "none", height: "auto" }}>
        <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#d6ebff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>💡</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#0b5cad", marginBottom: 8 }}>Tips for Best Results</div>
            <ul style={{ fontSize: 12, color: "#35658d", paddingLeft: 18, margin: 0, lineHeight: 1.8 }}>
              {inputType === "video" ? (
                <>
                  <li>Capture smooth, stable video while walking around the scene.</li>
                  <li>Keep objects well-lit and avoid rapid camera movements.</li>
                  <li>Maintain ~60% overlap between frames for better reconstruction.</li>
                  <li>Higher resolution videos yield better results.</li>
                </>
              ) : (
                <>
                  <li>Capture from all around the scene: sides, corners, and above if possible.</li>
                  <li>Maintain approximately 60% overlap between consecutive images.</li>
                  <li>Avoid moving objects and people in the scene.</li>
                  <li>Keep lighting conditions consistent.</li>
                </>
              )}
            </ul>
          </div>
        </div>
      </Card>

      {!canProceed && (
        <div
          style={{
            marginBottom: 10,
            color: "#f59e0b",
            fontSize: "13px",
            textAlign: "right",
          }}
        >
          Please upload an image folder or video, complete dataset preparation, and validate the dataset before proceeding to COLMAP.
        </div>
      )}

      <div style={{ marginTop: 14, display: "flex", justifyContent: "flex-end" }}>
        <BtnPrimary
          disabled={!canProceed}
          onClick={() => {
            if (canProceed) {
              onNavigate("colmap");
            }
          }}
        >
          Proceed to COLMAP →
        </BtnPrimary>
      </div>
    </div>
  );
}

/* ── Small components ── */

function Card({ children, style }) {
  return (
    <div style={{
      background: "var(--bg-primary)", border: "1px solid var(--border-color)",
      borderRadius: "var(--radius-lg)", padding: "16px", boxShadow: "var(--shadow-sm)",
      display: "flex", flexDirection: "column", height: "100%", boxSizing: "border-box",
      ...style,
    }}>{children}</div>
  );
}

function CardTitle({ num, children }) {
  return <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{num}. {children}</div>;
}

function CardSub({ children }) {
  return <div style={{ fontSize: 11, color: "var(--text-secondary)", marginBottom: 12 }}>{children}</div>;
}

function SummaryRow({ label, value }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, padding: "6px 0", borderBottom: "1px solid #f4f4f4" }}>
      <span style={{ color: "var(--text-secondary)" }}>{label}</span>
      <span style={{ fontWeight: 500 }}>{value}</span>
    </div>
  );
}

function ValRow({ label, value, warn }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 11, padding: "4px 0" }}>
      <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
        <span style={{ color: warn ? "#e67e00" : "var(--nvidia-green)" }}>{warn ? "⚠" : "✓"}</span>
        {label}
      </span>
      <span style={{ color: warn ? "#e67e00" : "var(--nvidia-green)", fontWeight: 500 }}>{value}</span>
    </div>
  );
}

function QualityRing({ value }) {
  const r = 38, circ = 2 * Math.PI * r;
  const dash = (value / 100) * circ;
  return (
    <svg width="96" height="96" viewBox="0 0 96 96">
      <circle cx="48" cy="48" r={r} fill="none" stroke="#eee" strokeWidth="7" />
      <circle cx="48" cy="48" r={r} fill="none" stroke="var(--nvidia-green)" strokeWidth="7"
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" transform="rotate(-90 48 48)" />
      <text x="48" y="53" textAnchor="middle" fontSize="18" fontWeight="700" fill="var(--text-primary)">{value}%</text>
    </svg>
  );
}

/* ── Styles ── */
const s = {
  tabRow: {
    display: "flex", gap: 0, marginBottom: 16, width: "fit-content",
    border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", overflow: "hidden",
  },
  tabBtn: {
    padding: "7px 18px", fontSize: 12, background: "var(--bg-primary)",
    border: "none", cursor: "pointer", color: "var(--text-secondary)",
    display: "flex", alignItems: "center", gap: 6,
  },
  tabActive: { background: "var(--nvidia-green-dim)", color: "var(--nvidia-green)", fontWeight: 600 },
  newBadge: { fontSize: 9, background: "var(--nvidia-green)", color: "white", padding: "1px 6px", borderRadius: 8, fontWeight: 600 },
  grid3: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, alignItems: "stretch" },
  dropZone: {
    border: "1.5px dashed var(--border-color)", borderRadius: "var(--radius-md)",
    padding: "28px 16px", textAlign: "center", cursor: "pointer", background: "var(--bg-secondary)",
  },
  browseBtn: {
    background: "var(--nvidia-green)", color: "white", border: "none",
    borderRadius: "var(--radius-md)", padding: "7px 18px", fontSize: 12, fontWeight: 600, cursor: "pointer",
  },
  successRow: { display: "flex", alignItems: "center", gap: 8, marginTop: 10, padding: "8px 0" },
  videoInfoBox: {
    display: "flex", alignItems: "center", gap: 10, border: "1px solid var(--border-color)",
    borderRadius: "var(--radius-md)", padding: "8px 10px", background: "var(--bg-secondary)",
  },
  deleteBtn: { fontSize: 14, cursor: "pointer", color: "var(--text-muted)", flexShrink: 0 },
  radioLabel: { display: "flex", alignItems: "center", gap: 5, fontSize: 11, cursor: "pointer" },
  numberInput: {
    width: "100%", padding: "6px 10px", fontSize: 12, border: "1px solid var(--border-color)",
    borderRadius: "var(--radius-md)", background: "var(--bg-primary)", color: "var(--text-primary)",
  },
  refreshBtn: {
    width: "100%", marginTop: 12, padding: "7px 0", background: "transparent",
    border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)",
    fontSize: 11, color: "var(--text-secondary)", cursor: "pointer",
  },
  previewGrid: { display: "grid", gridTemplateColumns: "repeat(8, 1fr)", gap: 6 },
  previewThumb: { width: "100%", height: 64, objectFit: "cover", borderRadius: 5, border: "1px solid var(--border-color)", display: "block" },
  previewMore: {
    height: 64, borderRadius: 5, background: "#1a1a1a", color: "white", fontSize: 11, fontWeight: 600,
    display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", lineHeight: 1.3,
  },
};