"""Run with: uv run --with pillow python scripts/test_optimize_static_assets.py"""

import importlib.util
from pathlib import Path
import tempfile
import unittest

from PIL import Image

spec = importlib.util.spec_from_file_location("optimizer", Path(__file__).with_name("optimize-static-assets.py"))
optimizer = importlib.util.module_from_spec(spec)
spec.loader.exec_module(optimizer)


class OutputTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.root = Path(self.temp.name)
        (self.root / "index.html").write_text("<html></html>")

    def tearDown(self):
        self.temp.cleanup()

    def test_resize_keeps_alpha_format_and_aspect_ratio(self):
        path = self.root / "large.png"
        Image.new("RGBA", (2560, 1440), (30, 60, 90, 100)).save(path)
        result = optimizer.optimize_output(self.root)
        with Image.open(path) as image:
            self.assertEqual(image.format, "PNG")
            self.assertEqual(image.size, (1920, 1080))
            self.assertEqual(image.getpixel((100, 100))[3], 100)
        self.assertGreater(result["saved_bytes"], 0)

    def test_portrait_and_exif_orientation(self):
        path = self.root / "portrait.jpg"
        exif = Image.Exif()
        exif[274] = 6
        Image.new("RGB", (5000, 2500), "red").save(path, quality=98, exif=exif)
        optimizer.optimize_output(self.root)
        with Image.open(path) as image:
            self.assertEqual(image.size, (1920, 3840))
            self.assertNotIn(image.getexif().get(274), [3, 6, 8])

    def test_preserves_animation_small_images_and_downloads(self):
        gif = self.root / "animation.gif"
        Image.new("RGB", (20, 20), "red").save(gif, save_all=True,
            append_images=[Image.new("RGB", (20, 20), "blue")], duration=[100, 250], loop=0)
        png = self.root / "small.png"
        Image.new("RGBA", (16, 16), (0, 0, 0, 0)).save(png, optimize=True)
        for name in ["data.csv", "example.ipynb"]:
            (self.root / name).write_text("download content")
        originals = {p.name: p.read_bytes() for p in self.root.iterdir()}
        optimizer.optimize_output(self.root)
        for name, data in originals.items():
            self.assertEqual((self.root / name).read_bytes(), data)

    def test_removes_only_build_and_development_files(self):
        for name in ["tfidf_cache.pkl", "ogp_cache.json", "main.js.map", "posts/a/.venv/library.py", "posts/a/__pycache__/a.pyc"]:
            p = self.root / name
            p.parent.mkdir(parents=True, exist_ok=True)
            p.write_bytes(b"build-only")
        (self.root / "posts/a/source.py").write_text("print('example')")
        result = optimizer.optimize_output(self.root)
        self.assertEqual(len(result["removed"]), 5)
        self.assertTrue((self.root / "posts/a/source.py").exists())

    def test_rejects_source_directory_and_symlinks(self):
        with self.assertRaises(ValueError):
            optimizer.optimize_output(self.root / "missing")
        (self.root / "link").symlink_to(self.root / "index.html")
        with self.assertRaises(ValueError):
            optimizer.optimize_output(self.root)


if __name__ == "__main__":
    unittest.main()
