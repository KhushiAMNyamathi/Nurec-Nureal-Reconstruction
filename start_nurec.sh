
#!/usr/bin/env bash
set -Eeuo pipefail

ROOT="$HOME/Desktop/khushi/NuRec-Neural-Reconstruction"
# ISAAC_ROOT="/datadrive/Shashank/isaacsim"
# EXPERIENCE="$ISAAC_ROOT/apps/isaacsim.exp.full.streaming.kit"
# EXTENSION_FOLDER="$ROOT/integrations/isaac"
LOG_DIR="$ROOT/logs"

mkdir -p "$LOG_DIR"
touch "$LOG_DIR/isaac.log" "$LOG_DIR/backend.log" "$LOG_DIR/frontend.log"

# ISAAC_PID=""
BACKEND_PID=""
FRONTEND_PID=""

cleanup() {
    trap - EXIT INT TERM
    echo
    echo "Stopping services started by start_nurec.sh..."

    for pid in "$FRONTEND_PID" "$BACKEND_PID" "$ISAAC_PID"; do
        if [[ -n "$pid" ]] && kill -0 "$pid" 2>/dev/null; then
            kill "$pid" 2>/dev/null || true
        fi
    done

    echo "Launcher cleanup complete."
}

trap cleanup EXIT
trap 'exit 130' INT
trap 'exit 143' TERM

cd "$ROOT"

# Validate required files
# if [[ ! -f "$ROOT/package.json" ]]; then
#     echo "ERROR: React package.json not found: $ROOT"
#     exit 1
# fi

# if [[ ! -x "$ISAAC_ROOT/kit/kit" ]]; then
#     echo "ERROR: Isaac Kit executable not found."
#     echo "Expected: $ISAAC_ROOT/kit/kit"
#     exit 1
# fi

# if [[ ! -f "$EXPERIENCE" ]]; then
#     echo "ERROR: Isaac experience not found: $EXPERIENCE"
#     exit 1
# fi

# if [[ ! -f "$EXTENSION_FOLDER/nurec.scene_loader/extension.toml" ]]; then
#     echo "ERROR: NuRec scene-loader extension not found."
#     exit 1
# fi

if ! command -v npm >/dev/null 2>&1; then
    echo "ERROR: npm is not installed or not on PATH."
    exit 1
fi

# Find Python with FastAPI and Uvicorn installed
PYTHON=""
for candidate in \
    "$ROOT/backend/venv/bin/python" \
    "$ROOT/backend/.venv/bin/python" \
    "$ROOT/venv/bin/python" \
    "$ROOT/.venv/bin/python" \
    "$(command -v python3 2>/dev/null || true)"
do
    if [[ -n "$candidate" && -x "$candidate" ]] &&
       "$candidate" -c 'import fastapi, uvicorn' >/dev/null 2>&1; then
        PYTHON="$candidate"
        break
    fi
done

if [[ -z "$PYTHON" ]]; then
    echo "ERROR: No Python environment with FastAPI and Uvicorn found."
    echo "Check your backend virtual environment."
    exit 1
fi

echo "Using Python: $PYTHON"

# # Start Isaac Sim
# if pgrep -af '[i]saacsim.exp.full.streaming.kit' >/dev/null; then
#     echo "Isaac Sim is already running; leaving it alone."
# else
#     echo "Starting Isaac Sim with NuRec extension..."
#     (
#         cd "$ISAAC_ROOT"
#         exec ./kit/kit "$EXPERIENCE" \
#             --ext-folder "$EXTENSION_FOLDER" \
#             --enable nurec.scene_loader
#     ) > "$LOG_DIR/isaac.log" 2>&1 &
#     ISAAC_PID=$!
# fi

# Start FastAPI backend
if pgrep -af '[u]vicorn app:app' >/dev/null; then
    echo "FastAPI backend is already running; leaving it alone."
else
    echo "Starting FastAPI backend..."
    (
        cd "$ROOT/backend"
        exec "$PYTHON" -m uvicorn app:app \
            --host 0.0.0.0 --port 8000
    ) > "$LOG_DIR/backend.log" 2>&1 &
    BACKEND_PID=$!
fi

# Start React frontend
if pgrep -af '[n]pm start' >/dev/null; then
    echo "React npm start process already exists; leaving it alone."
else
    echo "Starting React frontend..."
    (
        cd "$ROOT"
        export HOST=0.0.0.0
        exec npm start
    ) > "$LOG_DIR/frontend.log" 2>&1 &
    FRONTEND_PID=$!
fi

echo
echo "======================================"
echo " NuRec startup commands launched"
echo "======================================"
echo "Frontend: http://localhost:3000"
echo "Backend:  http://localhost:8000"
echo "Isaac logs:    $LOG_DIR/isaac.log"
echo "Backend logs:  $LOG_DIR/backend.log"
echo "Frontend logs: $LOG_DIR/frontend.log"
echo
echo "Press Ctrl+C to stop services started by this script."
echo "Startup logs will appear below."
echo

tail -n 0 -F \
    "$LOG_DIR/isaac.log" \
    "$LOG_DIR/backend.log" \
    "$LOG_DIR/frontend.log"