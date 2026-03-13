#!/bin/bash
# Setup Claude Code memory on Coder
# Run this AFTER starting Claude once in /workspaces/tob-twenty (so it creates the project dir)

# Find the Claude project directory
PROJECT_DIR=$(find ~/.claude/projects -maxdepth 1 -name "*tob-twenty*" -type d 2>/dev/null | head -1)

if [ -z "$PROJECT_DIR" ]; then
  echo "ERROR: Claude project directory not found."
  echo "Start Claude once in /workspaces/tob-twenty first, then run this script again."
  exit 1
fi

echo "Found project dir: $PROJECT_DIR"

# Create memory directory
mkdir -p "$PROJECT_DIR/memory/docs"

# Copy files
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cp "$SCRIPT_DIR/MEMORY.md" "$PROJECT_DIR/memory/"
cp "$SCRIPT_DIR/docs/"* "$PROJECT_DIR/memory/docs/"

echo "Memory files copied successfully!"
ls -la "$PROJECT_DIR/memory/"
ls -la "$PROJECT_DIR/memory/docs/"
