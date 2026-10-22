
#!/usr/bin/env bash
set -e

ISAAC_ROOT="/datadrive/Shashank/isaacsim"
PROJECT_ROOT="$HOME/Desktop/khushi/NuRec-Neural-Reconstruction"
EXPERIENCE="$ISAAC_ROOT/apps/isaacsim.exp.full.streaming.kit"
EXTENSION_FOLDER="$PROJECT_ROOT/integrations/isaac"

if [[ ! -f "$EXPERIENCE" ]]; then
    echo "ERROR: Isaac Sim streaming experience not found:"
    echo "$EXPERIENCE"
    exit 1
fi

if [[ ! -f "$EXTENSION_FOLDER/nurec.scene_loader/extension.toml" ]]; then
    echo "ERROR: NuRec scene-loader extension not found:"
    echo "$EXTENSION_FOLDER/nurec.scene_loader/extension.toml"
    exit 1
fi

cd "$ISAAC_ROOT"

exec ./kit/kit "$EXPERIENCE" \
    --ext-folder "$EXTENSION_FOLDER" \
    --enable nurec.scene_loader
