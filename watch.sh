#!/usr/bin/env bash
set -euo pipefail

uv run blog_builder/watch.py "$@"
