#!/bin/bash

# Bash wrapper script để chạy Python services với Docker
# Có thể chạy từ thư mục root của backend
# Usage: ./run-python-services.sh [command] [service]

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SCRIPT_PATH="$SCRIPT_DIR/python-service/run-docker.sh"

if [ ! -f "$SCRIPT_PATH" ]; then
    echo "[ERROR] Script not found at: $SCRIPT_PATH"
    echo "Please make sure you're running this from the backend root directory."
    exit 1
fi

# Execute the actual script
bash "$SCRIPT_PATH" "$@"

