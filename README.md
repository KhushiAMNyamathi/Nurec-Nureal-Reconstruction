# NuRec — Mono Camera Neural Reconstruction UI

A React frontend for NVIDIA Isaac Sim / Omniverse neural reconstruction pipeline.
Inspired by NVIDIA NuRec, built for the TCS AMD Hackathon.

## Project Structure

```
src/
├── App.jsx                    # Root: routing state + layout
├── index.css                  # Global design tokens (CSS variables)
├── index.js                   # React entry point
├── components/
│   ├── Sidebar.jsx            # Left nav + system status
│   ├── TopBar.jsx             # Header bar
│   ├── PipelineBar.jsx        # 4-step pipeline progress bar
│   ├── PointCloudCanvas.jsx   # WebGL-style COLMAP point cloud
│   ├── GaussianSplatCanvas.jsx# 3DGUT live preview renderer
│   └── ui.jsx                 # Shared primitives (Card, Badge, Button...)
└── pages/
    ├── DashboardPage.jsx      # Overview of all 4 pipeline stages
    ├── CapturePage.jsx        # Camera setup + dataset validation
    ├── ColmapPage.jsx         # COLMAP config + reconstruction progress
    ├── ThreeDGUTPage.jsx      # Neural training + loss chart + live preview
    ├── IsaacPage.jsx          # USDZ deployment + robot selection
    └── LogsPage.jsx           # Real-time system log terminal
```

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm start

# 3. Open http://localhost:3000
```

## Tech Stack
- React 18 (Create React App)
- Pure CSS with CSS variables (no Tailwind needed)
- HTML5 Canvas for point cloud + Gaussian splat previews
- SVG for quality ring charts

## Next Steps
- Connect to real backend API (FastAPI / vLLM)
- Add WebSocket for live training metrics
- Integrate Three.js for interactive 3D point cloud viewer
- Add file upload drag-and-drop for image folders
- Hook up actual COLMAP/3DGUT process via subprocess API
