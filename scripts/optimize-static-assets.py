# /// script
# dependencies = ["pillow>=11,<13"]
# ///
"""Reduce published output without changing source images or public URLs."""

import argparse
from io import BytesIO
import json
from pathlib import Path

from PIL import Image, ImageOps

MAX_SIZE = (1920, 3840)
BUILD_CACHE_FILES = {"tfidf_cache.pkl", "ogp_cache.json"}
PRIVATE_DIRS = {".git", ".venv", "__pycache__", "node_modules"}


def optimize_image(path: Path):
    original_size = path.stat().st_size
    with Image.open(path) as source:
        # Preserve animation and multi-picture files exactly.
        if getattr(source, "n_frames", 1) != 1:
            return None
        image = ImageOps.exif_transpose(source)
        before = image.size
        image.thumbnail(MAX_SIZE, Image.Resampling.LANCZOS)
        options = {"icc_profile": source.info["icc_profile"]} if source.info.get("icc_profile") else {}
        if source.format == "PNG":
            options.update(optimize=True, compress_level=9)
        elif source.format == "JPEG":
            # Avoid another lossy encode when no resize is necessary.
            if image.size == before:
                return None
            options.update(quality=85, optimize=True, progressive=True)
        elif source.format == "WEBP":
            if image.size == before:
                return None
            options.update(quality=90, method=6)
        else:
            return None
        output = BytesIO()
        image.save(output, format=source.format, **options)
        data = output.getvalue()
        if len(data) >= original_size:
            return None
        # Only replace after the candidate is fully encoded and readable.
        with Image.open(BytesIO(data)) as check:
            check.verify()
        path.write_bytes(data)
        return {"path": str(path), "before_bytes": original_size, "after_bytes": len(data),
                "before_dimensions": before, "after_dimensions": image.size}


def optimize_output(root: Path):
    root = root.resolve()
    if not (root / "index.html").is_file():
        raise ValueError("Expected a built website containing index.html")
    changes, removed = [], []
    files = [p for p in root.rglob("*") if p.is_file() or p.is_symlink()]
    for path in files:
        if path.is_symlink():
            raise ValueError(f"Unexpected symlink in output: {path.relative_to(root)}")
    before_bytes = sum(p.stat().st_size for p in files if not p.is_symlink())
    # Remove build caches and development environments, including locally copied ones.
    for path in files:
        relative = path.relative_to(root)
        if (any(part in PRIVATE_DIRS for part in relative.parts)
                or path.name in {".DS_Store", ".gitkeep"}
                or (len(relative.parts) == 1 and path.name in BUILD_CACHE_FILES)
                or path.suffix == ".map"):
            removed.append({"path": str(relative), "bytes": path.stat().st_size})
            path.unlink()
    for path in files:
        if path.exists() and path.suffix.lower() in {".png", ".jpg", ".jpeg", ".webp"}:
            change = optimize_image(path)
            if change:
                change["path"] = str(path.relative_to(root))
                changes.append(change)
    # Clean empty development directories after their contents have been removed.
    for path in sorted(root.rglob("*"), key=lambda p: len(p.parts), reverse=True):
        if path.is_dir() and not any(path.iterdir()):
            path.rmdir()
    after_bytes = sum(p.stat().st_size for p in root.rglob("*") if p.is_file())
    return {"before_bytes": before_bytes, "after_bytes": after_bytes,
            "saved_bytes": before_bytes - after_bytes, "images": changes, "removed": removed}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("root", type=Path, nargs="?", default=Path("build"))
    parser.add_argument("--report", type=Path)
    args = parser.parse_args()
    report = optimize_output(args.root)
    if args.report:
        args.report.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n")
    print(f"Static output: {report['before_bytes']:,} → {report['after_bytes']:,} bytes "
          f"({report['saved_bytes']:,} bytes saved; {len(report['images'])} images optimized; "
          f"{len(report['removed'])} build-only files removed)")


if __name__ == "__main__":
    main()
