"""
core/automl/image_handler.py
Image feature extraction using scikit-image HOG descriptors.

PyTorch / ResNet was not available on this Python 3.14 environment
due to disk space constraints during installation (CUDA libraries ~3 GB).
HOG + classical classifiers provides a strong, CPU-only baseline
(typically 80-92% on binary classification tasks with clean data).
"""
from pathlib import Path
import numpy as np

try:
    from skimage.feature import hog
    from skimage.io import imread
    from skimage.transform import resize
    from skimage.color import rgb2gray
    SKIMAGE_AVAILABLE = True
except ImportError:
    SKIMAGE_AVAILABLE = False

from PIL import Image as PILImage

TARGET_SIZE = (128, 128)
HOG_PIXELS_PER_CELL = (16, 16)
HOG_CELLS_PER_BLOCK = (2, 2)
HOG_ORIENTATIONS = 9


def extract_features(image_path: Path) -> np.ndarray | None:
    """
    Load one image and return a 1-D HOG feature vector.
    Returns None if the image cannot be read.
    """
    try:
        img = PILImage.open(image_path).convert("RGB").resize(TARGET_SIZE)
        img_array = np.array(img, dtype=np.float32) / 255.0
        gray = 0.2989 * img_array[:, :, 0] + 0.5870 * img_array[:, :, 1] + 0.1140 * img_array[:, :, 2]

        if SKIMAGE_AVAILABLE:
            features = hog(
                gray,
                orientations=HOG_ORIENTATIONS,
                pixels_per_cell=HOG_PIXELS_PER_CELL,
                cells_per_block=HOG_CELLS_PER_BLOCK,
                block_norm="L2-Hys",
            )
        else:
            # Fallback: flatten + basic statistics per channel
            features = np.concatenate([
                img_array[:, :, i].flatten()[::16]    # downsample
                for i in range(3)
            ])

        return features

    except Exception:
        return None


def load_dataset(extract_dir: Path, classes: list[str], log_fn=None) -> tuple[np.ndarray, np.ndarray, list[str]]:
    """
    Walk class subdirectories, extract HOG features for all images.
    Returns: (X, y, class_names)
    """
    image_exts = {".png", ".jpg", ".jpeg", ".bmp", ".tiff"}
    X, y = [], []

    for label_idx, cls in enumerate(sorted(classes)):
        cls_dir = extract_dir / cls
        if not cls_dir.exists():
            continue
        images = [f for f in cls_dir.iterdir() if f.suffix.lower() in image_exts]
        if log_fn:
            log_fn(f"[IMAGE] Extracting features for class '{cls}' ({len(images)} images)...")

        for img_path in images:
            feat = extract_features(img_path)
            if feat is not None:
                X.append(feat)
                y.append(label_idx)

    return np.array(X), np.array(y), sorted(classes)
