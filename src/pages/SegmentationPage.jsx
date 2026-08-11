import { useState } from "react";

import warehouse from "../images/warehouse.png";

import {
    Card,
    SectionTitle,
    Badge,
    Label,
    ProgressBar,
    Select,
    CheckRow,
    MetricRow,
    BtnPrimary,
    BtnSecondary,
    Grid,
    TipBox,
} from "../components/ui";

export default function SegmentationPage({
    onNavigate,
    pipelineState,
    setPipelineState,
}) {
    const [model, setModel] = useState("SAM3");
    const [confidence, setConfidence] = useState("0.50");
    const [running, setRunning] = useState(false);
    const [progress, setProgress] = useState(0);

    const startSegmentation = () => {
        setRunning(true);
        setProgress(0);

        let value = 0;

        const interval = setInterval(() => {
            value += 10;
            setProgress(value);

            if (value >= 100) {
                clearInterval(interval);
                setRunning(false);

                if (setPipelineState) {
                    setPipelineState((prev) => ({
                        ...prev,
                        segmentation: "completed",
                    }));
                }
            }
        }, 300);
    };

    return (
        <div
            style={{
                padding: "4px 2px 20px",
                width: "100%",
                boxSizing: "border-box",
            }}
        >
            {/* HEADER */}
            <div style={styles.header}>
                <div>
                    <h1 style={styles.title}>3D Semantic Segmentation</h1>

                    <p style={styles.subtitle}>
                        Segment reconstructed 3D scenes into meaningful semantic classes
                    </p>
                </div>

                <Badge
                    label={running ? "RUNNING" : "READY"}
                    variant={running ? "blue" : "green"}
                />
            </div>

            {/* TOP SECTION */}
            <Grid cols={3} gap={14}>

                {/* INPUT SCENE */}

                <Card>
                    <SectionTitle num="1">
                        Input Source
                    </SectionTitle>

                    <div style={styles.description}>
                        Select the reconstructed scene to segment.
                    </div>

                    {/* Source Type */}
                    <Label>Source Type</Label>

                    <label style={styles.radioRow}>
                        <input
                            type="radio"
                            name="sourceType"
                            defaultChecked
                            style={styles.radio}
                        />
                        <span>3DGUT USDZ Output</span>
                    </label>

                    <label style={styles.radioRow}>
                        <input
                            type="radio"
                            name="sourceType"
                            style={styles.radio}
                        />
                        <span>Custom Point Cloud / Mesh</span>
                    </label>

                    {/* USDZ FILE */}
                    <Label style={{ marginTop: 10 }}>
                        Select USDZ File
                    </Label>

                    <div style={styles.fileInput}>
                        <span style={styles.fileName}>
                            export_last.usdz
                        </span>

                        <span style={styles.folderIcon}>
                            📁
                        </span>
                    </div>

                    {/* SCENE LOADED */}
                    <div style={styles.loadedBox}>
                        <div style={styles.loadedIcon}>
                            ◇
                        </div>

                        <div>
                            <div style={styles.loadedTitle}>
                                Scene Loaded Successfully
                            </div>

                            <div style={styles.loadedDetails}>
                                Size: 1.82 GB&nbsp; • &nbsp;Points: 58.3M
                            </div>
                        </div>
                    </div>

                    {/* PREVIEW */}
                    <div style={styles.previewLabel}>
                        Preview
                    </div>

                    <div style={styles.preview}>
                        <img
                            src={warehouse}
                            alt="Warehouse scene preview"
                            style={styles.previewImage}
                        />
                    </div>
                </Card>

                {/* SEGMENTATION CONFIG */}

                <Card>
                    <SectionTitle num="2">
                        Segmentation Settings
                    </SectionTitle>

                    <div style={styles.description}>
                        Configure segmentation model and classes.
                    </div>

                    {/* MODEL */}
                    <Label>Model</Label>

                    <div style={styles.modelRow}>
                        <select
                            value={model}
                            onChange={(e) => setModel(e.target.value)}
                            style={styles.modelSelect}
                        >
                            <option>NVIDIA LSeg (Large)</option>
                            <option>SAM3</option>
                            <option>Point Transformer</option>
                            <option>Mask3D</option>
                        </select>

                        <button style={styles.modelInfo}>
                            Model Info ⓘ
                        </button>
                    </div>

                    {/* CLASSES */}
                    <div style={styles.classesHeader}>
                        <div>
                            <Label>Classes</Label>

                            <div style={styles.classesSelected}>
                                20 Classes Selected
                            </div>
                        </div>

                        <BtnSecondary
                            style={{
                                padding: "6px 10px",
                                fontSize: 10,
                                fontWeight: 500,
                            }}
                        >
                            Manage Classes
                        </BtnSecondary>
                    </div>

                    {/* CLASS CHIPS */}
                    <div style={styles.classChips}>
                        {[
                            ["floor", "green"],
                            ["wall", "blue"],
                            ["ceiling", "red"],
                            ["column", "teal"],
                            ["beam", "yellow"],
                            ["shelf", "purple"],
                            ["box", "pink"],
                            ["pallet", "orange"],
                            ["table", "yellow"],
                            ["conveyor", "red"],
                            ["machine", "blue"],
                            ["pipe", "purple"],
                            ["door", "blue"],
                            ["window", "teal"],
                            ["stair", "purple"],
                            ["railing", "orange"],
                            ["robot", "pink"],
                            ["barrier", "blue"],
                            ["cable", "yellow"],
                            ["other", "blue"],
                        ].map(([name, color]) => (
                            <span
                                key={name}
                                style={{
                                    ...styles.classChip,
                                    ...styles[`chip_${color}`],
                                }}
                            >
                                {name}
                            </span>
                        ))}
                    </div>

                    {/* ADVANCED OPTIONS */}
                    <div style={styles.advancedTitle}>
                        Advanced Options
                    </div>

                    <div style={styles.advancedGrid}>

                        {/* LEFT */}
                        <div>
                            <CheckRow
                                label="Remove Small Segments ⓘ"
                                checked={true}
                            />

                            <CheckRow
                                label="Smooth Boundaries"
                                checked={true}
                            />
                        </div>

                        {/* RIGHT */}
                        <div>

                            <div style={styles.settingRow}>
                                <Label style={styles.settingLabel}>
                                    Min Size (points)
                                </Label>

                                <input
                                    type="number"
                                    defaultValue={1000}
                                    style={styles.numberInput}
                                />
                            </div>

                            <div style={styles.settingRow}>
                                <Label style={styles.settingLabel}>
                                    Smoothing Iterations
                                </Label>

                                <input
                                    type="number"
                                    defaultValue={2}
                                    style={styles.numberInput}
                                />
                            </div>

                        </div>
                    </div>

                    {/* ADVANCED SETTINGS */}
                    <div style={styles.advancedSettings}>
                        <span style={styles.chevron}>⌄</span>
                        <span>Advanced Settings</span>
                    </div>

                </Card>

                {/* PREVIEW */}
                {/* RUN SEGMENTATION */}
                <Card>
                    <SectionTitle num="3">
                        Run Segmentation
                    </SectionTitle>

                    <div style={styles.description}>
                        Start the semantic segmentation process.
                    </div>

                    {/* STATUS BOX */}
                    <div style={styles.segmentStatus}>
                        <div style={styles.statusIcon}>
                            ◇
                        </div>

                        <div>
                            <div style={styles.statusTitle}>
                                {running ? "Segmenting..." : "Ready to Segment"}
                            </div>

                            <div style={styles.statusText}>
                                Estimated time: 00:18:45
                            </div>

                            <div style={styles.statusText}>
                                GPU: RTX 4090 (24 GB)
                            </div>
                        </div>
                    </div>

                    {/* BUTTONS */}
                    <div style={styles.segmentButtons}>

                        <BtnPrimary
                            onClick={startSegmentation}
                            style={{
                                flex: 1,
                                justifyContent: "center",
                                opacity: running ? 0.6 : 1,
                            }}
                        >
                            ▷ {running ? "Running..." : "Start Segmentation"}
                        </BtnPrimary>

                        <BtnSecondary
                            style={{
                                flex: 1,
                                justifyContent: "center",
                                color: running ? "#000" : "#aaa",
                            }}
                        >
                            ▷ Stop
                        </BtnSecondary>

                    </div>

                    {/* PROGRESS */}
                    <div style={styles.progressSection}>

                        <div style={styles.progressHeader}>
                            <span>Progress</span>
                            <span>{progress}%</span>
                        </div>

                        <ProgressBar
                            value={progress}
                            height={6}
                        />

                    </div>

                    {/* LOGS */}
                    <div style={styles.logsTitle}>
                        Logs
                    </div>

                    <div style={styles.logsBox}>

                        <div style={styles.logRow}>
                            <span style={styles.logDot}>●</span>
                            <span>11:20:31&nbsp;&nbsp; Loading scene...</span>
                            <span style={styles.logCheck}>✓</span>
                        </div>

                        <div style={styles.logRow}>
                            <span style={styles.logDot}>●</span>
                            <span>11:20:35&nbsp;&nbsp; Preprocessing...</span>
                            <span style={styles.logCheck}>✓</span>
                        </div>

                        <div style={styles.logRow}>
                            <span style={styles.logDot}>●</span>
                            <span>11:20:40&nbsp;&nbsp; Initializing model...</span>
                            <span style={styles.logCheck}>✓</span>
                        </div>

                        <div style={styles.logRow}>
                            <span style={styles.logDot}>●</span>
                            <span>11:20:42&nbsp;&nbsp; Ready to segment.</span>
                            <span style={styles.logCheck}>✓</span>
                        </div>

                    </div>

                </Card>

            </Grid>



            {/* RESULTS */}
            {/* SEGMENTATION PREVIEW + LEGEND + STATISTICS */}
            <div style={styles.resultsSection}>

                <div style={styles.resultsGrid}>

                    {/* SEGMENTATION PREVIEW */}
                    <Card style={styles.previewCard}>

                        <div style={styles.resultTitle}>
                            Segmentation Preview
                            <span style={styles.resultSubtitle}>
                                (Result will appear here)
                            </span>
                        </div>

                        <div style={styles.segmentationPreview}>

                            {progress === 100 ? (
                                <div style={styles.resultReady}>
                                    <div style={styles.resultCube}>
                                        ◇
                                    </div>

                                    <div style={styles.resultReadyText}>
                                        Segmentation result ready
                                    </div>
                                </div>
                            ) : (
                                <div style={styles.emptyPreview}>

                                    <div style={styles.cubeIcon}>
                                        ◇
                                    </div>

                                    <div style={styles.emptyText}>
                                        Run segmentation to preview results
                                    </div>

                                </div>
                            )}

                        </div>

                    </Card>


                    {/* CLASS LEGEND */}
                    <Card style={styles.legendCard}>

                        <div style={styles.resultTitle}>
                            Class Legend (20)
                        </div>

                        <div style={styles.legendGrid}>

                            {[
                                ["floor", "green"],
                                ["wall", "blue"],
                                ["ceiling", "yellow"],
                                ["column", "lightgreen"],
                                ["beam", "purple"],

                                ["shelf", "green"],
                                ["box", "pink"],
                                ["pallet", "blue"],
                                ["table", "pink"],
                                ["conveyor", "yellow"],

                                ["conveyor", "yellow"],
                                ["machine", "purple"],
                                ["pipe", "blue"],
                                ["door", "orange"],
                                ["window", "red"],

                                ["railing", "gray"],
                                ["robot", "red"],
                                ["barrier", "orange"],
                                ["cable", "teal"],
                                ["other", "purple"],
                            ].map(([name, color], index) => (
                                <div
                                    key={`${name}-${index}`}
                                    style={styles.legendItem}
                                >
                                    <span
                                        style={{
                                            ...styles.legendDot,
                                            ...styles[`dot_${color}`],
                                        }}
                                    />

                                    <span>{name}</span>
                                </div>
                            ))}

                        </div>

                    </Card>


                    {/* STATISTICS */}
                    <Card style={styles.statsCard}>

                        <div style={styles.resultTitle}>
                            Statistics
                        </div>

                        <MetricRow
                            label="Total Points"
                            value={progress === 100 ? "58.3M" : "-"}
                        />

                        <MetricRow
                            label="Segmented Points"
                            value={progress === 100 ? "56.8M" : "-"}
                        />

                        <MetricRow
                            label="Unlabeled Points"
                            value={progress === 100 ? "1.5M" : "-"}
                        />

                        <MetricRow
                            label="Classes"
                            value={progress === 100 ? "20" : "-"}
                        />

                    </Card>

                </div>


                {/* BOTTOM ACTIONS */}
                <div style={styles.bottomActions}>

                    <BtnSecondary
                        onClick={() =>
                            onNavigate && onNavigate("3dgut")
                        }
                    >
                        ← &nbsp; Back to 3DGUT
                    </BtnSecondary>


                    <BtnPrimary
                        onClick={() =>
                            onNavigate && onNavigate("isaac")
                        }
                        style={{
                            padding: "9px 22px",
                        }}
                    >
                        Proceed to Isaac Sim &nbsp; →
                    </BtnPrimary>

                </div>

            </div>
        </div>
    );
}

const styles = {
    resultsSection: {
        marginTop: 14,
    },

    resultsGrid: {
        display: "grid",
        gridTemplateColumns: "1.6fr 1.15fr 0.9fr",
        gap: 14,
        alignItems: "stretch",
    },

    previewCard: {
        minHeight: 125,
    },

    legendCard: {
        minHeight: 125,
    },

    statsCard: {
        minHeight: 125,
    },

    resultTitle: {
        fontSize: 10,
        fontWeight: 600,
        color: "#000",
        marginBottom: 8,
    },

    resultSubtitle: {
        fontWeight: 400,
        color: "var(--text-secondary)",
        marginLeft: 3,
    },

    segmentationPreview: {
        height: 92,
        border: "1px solid var(--border-color)",
        borderRadius: "var(--radius-md)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#fff",
    },

    emptyPreview: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
    },

    cubeIcon: {
        width: 32,
        height: 32,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 30,
        color: "#aeb4bc",
    },

    emptyText: {
        fontSize: 9,
        color: "var(--text-secondary)",
    },

    resultReady: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 5,
    },

    resultCube: {
        fontSize: 30,
        color: "var(--nvidia-green)",
    },

    resultReadyText: {
        fontSize: 9,
        color: "var(--nvidia-green)",
    },

    legendGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        columnGap: 12,
        rowGap: 7,
    },

    legendItem: {
        display: "flex",
        alignItems: "center",
        gap: 5,
        fontSize: 9,
        color: "var(--text-secondary)",
        whiteSpace: "nowrap",
    },

    legendDot: {
        width: 6,
        height: 6,
        borderRadius: "50%",
        flexShrink: 0,
    },

    dot_green: {
        background: "#76b900",
    },

    dot_blue: {
        background: "#5b8fc9",
    },

    dot_yellow: {
        background: "#d9b84a",
    },

    dot_lightgreen: {
        background: "#9bcf72",
    },

    dot_purple: {
        background: "#9a6db7",
    },

    dot_pink: {
        background: "#d982ae",
    },

    dot_orange: {
        background: "#d99a52",
    },

    dot_red: {
        background: "#d47c7c",
    },

    dot_gray: {
        background: "#8c8f94",
    },

    dot_teal: {
        background: "#62a9a5",
    },

    bottomActions: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 14,
        padding: "0 2px",
    },
    segmentStatus: {
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "14px 16px",
        border: "1px solid var(--border-color)",
        borderRadius: "var(--radius-md)",
        marginBottom: 12,
        background: "var(--bg-primary)",
    },

    statusIcon: {
        width: 28,
        height: 28,
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "var(--nvidia-green)",
        border: "1px solid #d8ebc5",
        fontSize: 16,
        flexShrink: 0,
    },

    statusTitle: {
        fontSize: 11,
        fontWeight: 600,
        color: "var(--nvidia-green)",
        marginBottom: 4,
    },

    statusText: {
        fontSize: 10,
        color: "var(--text-secondary)",
        marginBottom: 2,
    },

    segmentButtons: {
        display: "flex",
        gap: 10,
        marginBottom: 18,
    },

    progressSection: {
        marginBottom: 14,
    },

    progressHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        fontSize: 10,
        fontWeight: 500,
        color: "#000",
        marginBottom: 7,
    },

    logsTitle: {
        fontSize: 10,
        fontWeight: 600,
        color: "#000",
        marginBottom: 6,
    },

    logsBox: {
        border: "1px solid var(--border-color)",
        borderRadius: "var(--radius-md)",
        padding: "7px 9px",
        height: 92,
        overflowY: "auto",
        background: "#fff",
    },

    logRow: {
        display: "grid",
        gridTemplateColumns: "10px 1fr 15px",
        alignItems: "center",
        gap: 4,
        fontSize: 9,
        color: "var(--text-secondary)",
        marginBottom: 8,
    },

    logDot: {
        color: "var(--nvidia-green)",
        fontSize: 7,
    },

    logCheck: {
        color: "var(--nvidia-green)",
        fontWeight: 700,
        textAlign: "right",
    },
    description: {
        fontSize: 11,
        color: "var(--text-secondary)",
        marginTop: -6,
        marginBottom: 14,
    },

    modelRow: {
        display: "flex",
        alignItems: "center",
        gap: 8,
        marginBottom: 10,
    },

    modelSelect: {
        flex: 1,
        padding: "7px 10px",
        fontSize: 11,
        border: "1px solid var(--border-color)",
        borderRadius: "var(--radius-md)",
        background: "var(--bg-primary)",
        color: "var(--text-primary)",
    },

    modelInfo: {
        background: "transparent",
        border: "none",
        color: "#185fa5",
        fontSize: 10,
        cursor: "pointer",
        whiteSpace: "nowrap",
    },

    classesHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-end",
        marginTop: 4,
        marginBottom: 8,
    },

    classesSelected: {
        fontSize: 9,
        color: "var(--text-muted)",
        marginTop: -2,
    },

    classChips: {
        display: "flex",
        flexWrap: "wrap",
        gap: 5,
        marginBottom: 14,
    },

    classChip: {
        padding: "4px 8px",
        borderRadius: 5,
        fontSize: 9,
        fontWeight: 500,
        whiteSpace: "nowrap",
    },

    chip_green: {
        background: "#e8f5dc",
        color: "#4f7d20",
    },

    chip_blue: {
        background: "#e6f0fa",
        color: "#3d6385",
    },

    chip_red: {
        background: "#f9e6e6",
        color: "#a15a5a",
    },

    chip_teal: {
        background: "#e3f3f1",
        color: "#397d77",
    },

    chip_yellow: {
        background: "#f8f0d9",
        color: "#8a7028",
    },

    chip_purple: {
        background: "#eee7f6",
        color: "#76538e",
    },

    chip_pink: {
        background: "#f8e6ef",
        color: "#9a5773",
    },

    chip_orange: {
        background: "#faedda",
        color: "#94672d",
    },

    advancedTitle: {
        fontSize: 11,
        fontWeight: 600,
        color: "#000",
        marginBottom: 8,
    },

    advancedGrid: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 14,
    },

    settingRow: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 8,
        marginBottom: 8,
    },

    settingLabel: {
        margin: 0,
        fontSize: 10,
        whiteSpace: "nowrap",
    },

    numberInput: {
        width: 80,
        boxSizing: "border-box",
        padding: "6px 8px",
        fontSize: 10,
        border: "1px solid var(--border-color)",
        borderRadius: "var(--radius-md)",
        outline: "none",
        color: "var(--text-primary)",
        background: "var(--bg-primary)",
    },

    advancedSettings: {
        display: "flex",
        alignItems: "center",
        gap: 6,
        borderTop: "1px solid var(--border-color)",
        marginTop: 4,
        paddingTop: 9,
        fontSize: 10,
        fontWeight: 500,
        color: "var(--text-secondary)",
        cursor: "pointer",
    },

    chevron: {
        fontSize: 13,
        color: "#000",
    },
    description: {
        fontSize: 11,
        color: "var(--text-secondary)",
        marginTop: -6,
        marginBottom: 14,
    },

    radioRow: {
        display: "flex",
        alignItems: "center",
        gap: 7,
        fontSize: 11,
        color: "var(--text-secondary)",
        marginBottom: 8,
        cursor: "pointer",
    },

    radio: {
        margin: 0,
        accentColor: "var(--nvidia-green)",
        width: 13,
        height: 13,
    },

    fileInput: {
        width: "100%",
        height: 32,
        boxSizing: "border-box",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        border: "1px solid var(--border-color)",
        borderRadius: "var(--radius-md)",
        marginBottom: 10,
        overflow: "hidden",
        background: "var(--bg-primary)",
    },

    fileName: {
        padding: "0 10px",
        fontSize: 11,
        color: "var(--text-secondary)",
    },

    folderIcon: {
        width: 34,
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderLeft: "1px solid var(--border-color)",
        fontSize: 13,
        color: "var(--text-muted)",
    },

    loadedBox: {
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "9px 11px",
        marginBottom: 12,
        background: "#f0fae8",
        border: "1px solid #d9efc5",
        borderRadius: "var(--radius-md)",
    },

    loadedIcon: {
        width: 24,
        height: 24,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "var(--nvidia-green)",
        fontSize: 20,
    },

    loadedTitle: {
        fontSize: 11,
        fontWeight: 600,
        color: "var(--nvidia-green)",
        marginBottom: 2,
    },

    loadedDetails: {
        fontSize: 9,
        color: "var(--text-secondary)",
    },

    previewLabel: {
        fontSize: 11,
        color: "#000",
        fontWeight: 500,
        marginBottom: 5,
    },

    preview: {
        width: "100%",
        height: 145,
        borderRadius: "var(--radius-md)",
        overflow: "hidden",
        border: "1px solid var(--border-color)",
        background: "#eee",
    },

    previewImage: {
        width: "100%",
        height: "100%",
        objectFit: "cover",
        display: "block",
    },
    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 14,
    },

    title: {
        margin: 0,
        fontSize: 18,
        fontWeight: 700,
        color: "#000",
    },

    subtitle: {
        margin: "5px 0 0",
        fontSize: 12,
        color: "var(--text-muted)",
    },

    inputBox: {
        display: "flex",
        alignItems: "center",
        gap: 8,
        border: "1px solid var(--border-color)",
        borderRadius: "var(--radius-md)",
        padding: "7px 10px",
        marginBottom: 10,
    },

    fileIcon: {
        color: "var(--nvidia-green)",
        fontSize: 14,
    },

    fileName: {
        fontSize: 11,
        color: "var(--text-secondary)",
    },

    select: {
        width: "100%",
        padding: "6px 10px",
        fontSize: 11,
        border: "1px solid var(--border-color)",
        borderRadius: "var(--radius-md)",
        background: "var(--bg-primary)",
        color: "var(--text-primary)",
        marginBottom: 8,
    },

    preview: {
        width: "100%",
        height: 175,
        borderRadius: "var(--radius-md)",
        overflow: "hidden",
        background: "#eee",
        border: "1px solid var(--border-color)",
    },

    previewImage: {
        width: "100%",
        height: "100%",
        objectFit: "cover",
        display: "block",
    },

    previewFooter: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 8,
        fontSize: 11,
        color: "var(--text-secondary)",
    },

    progressHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        fontSize: 11,
        color: "var(--text-secondary)",
        marginBottom: 7,
    },

    actionRow: {
        display: "flex",
        gap: 8,
        marginTop: 12,
    },

    classes: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 7,
        fontSize: 11,
        color: "var(--text-secondary)",
    },
};