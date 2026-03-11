#!/bin/bash
set -euo pipefail

# Ensure uv is on PATH (installed by curl in installCommand)
export PATH="$HOME/.local/bin:$PATH"

# Build almo compiler
git submodule update --init --recursive --remote
cd almo
bash ./scripts/setup.sh
g++ -std=c++23 ./build/almo.cpp -o ./build/almo
cd ..

# Generate blog posts and RSS
REBUILD=true SKIP_WIP_ARTICLES=true uv run blog_builder/build.py
uv run blog_builder/rss.py

# Build React app
npm run build
