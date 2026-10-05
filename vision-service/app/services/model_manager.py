"""Model Management, Registry & Integrity Verification Service for Computer Vision models."""

import hashlib
import json
import logging
from pathlib import Path
from typing import Any, Dict, Optional, Tuple

logger = logging.getLogger(__name__)


class ModelIntegrityError(Exception):
    """Raised when model files are missing or checksum validation fails."""
    pass


class ModelManager:
    """Manages model metadata, verification, and lifecycle operations."""

    def __init__(self, models_dir: Optional[Path] = None, registry_file: str = "model_registry.json"):
        if models_dir is None:
            self.models_dir = Path(__file__).resolve().parent.parent.parent / "models"
        else:
            self.models_dir = Path(models_dir)

        self.registry_path = self.models_dir / registry_file
        self.registry_data = self._load_registry()

    def _load_registry(self) -> Dict[str, Any]:
        """Loads model registry metadata JSON if it exists."""
        if not self.registry_path.exists():
            logger.warning("Model registry not found at %s", self.registry_path)
            return {"version": "0.0.0", "models": {}}

        try:
            with open(self.registry_path, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as exc:
            logger.error("Failed to parse model registry at %s: %s", self.registry_path, exc)
            return {"version": "0.0.0", "models": {}}

    @staticmethod
    def calculate_sha256(file_path: Path, chunk_size: int = 1024 * 1024) -> str:
        """Calculates SHA256 checksum of a file in streaming chunks."""
        hasher = hashlib.sha256()
        with open(file_path, "rb") as f:
            while chunk := f.read(chunk_size):
                hasher.update(chunk)
        return hasher.hexdigest().lower()

    def get_model_entry(self, model_key: str) -> Optional[Dict[str, Any]]:
        """Retrieves metadata entry for a model key."""
        return self.registry_data.get("models", {}).get(model_key)

    def verify_model(self, model_key: str, check_hash: bool = True) -> Tuple[bool, str]:
        """Verifies an individual model's existence and optional checksum integrity."""
        entry = self.get_model_entry(model_key)
        if not entry:
            return False, f"Model key '{model_key}' not found in registry"

        model_path = self.models_dir / entry["relative_path"]
        if not model_path.exists():
            return False, f"Model file not found at {model_path}"

        actual_size = model_path.stat().st_size
        expected_size = entry.get("size_bytes")
        if expected_size and actual_size != expected_size:
            return False, f"Size mismatch for '{model_key}': expected {expected_size} bytes, got {actual_size} bytes"

        if check_hash and "sha256" in entry:
            actual_hash = self.calculate_sha256(model_path)
            expected_hash = entry["sha256"].lower()
            if actual_hash != expected_hash:
                return False, f"Checksum mismatch for '{model_key}': expected {expected_hash}, got {actual_hash}"

        return True, "OK"

    def verify_all(self, only_active: bool = True, check_hashes: bool = True) -> Dict[str, Dict[str, Any]]:
        """Audits all models in the registry."""
        results: Dict[str, Dict[str, Any]] = {}
        models = self.registry_data.get("models", {})

        for key, entry in models.items():
            if only_active and not entry.get("active_runtime", False):
                continue

            valid, message = self.verify_model(key, check_hash=check_hashes)
            model_path = self.models_dir / entry["relative_path"]
            results[key] = {
                "name": entry.get("name"),
                "version": entry.get("version"),
                "format": entry.get("format"),
                "valid": valid,
                "message": message,
                "path": str(model_path),
                "exists": model_path.exists(),
                "size_bytes": model_path.stat().st_size if model_path.exists() else 0,
                "active_runtime": entry.get("active_runtime", False),
            }

        return results

    def warmup_inference(self, inference_service: Any) -> Dict[str, float]:
        """Runs dummy warm-up inferences through detection and classification models.

        Eliminates JIT/allocator cold-start latency for the first real user request.
        """
        import time
        import numpy as np

        latencies: Dict[str, float] = {}

        # 1. Warm-up YOLO detection model
        if hasattr(inference_service, "detection_model") and inference_service.detection_model is not None:
            try:
                t0 = time.perf_counter()
                dummy_img = np.zeros((640, 640, 3), dtype=np.uint8)
                _ = inference_service.detection_model(dummy_img, verbose=False)
                latencies["detection_warmup_ms"] = round((time.perf_counter() - t0) * 1000, 2)
                logger.info("Detection model warmed up in %.2f ms", latencies["detection_warmup_ms"])
            except Exception as exc:
                logger.warning("Failed to warm up detection model: %s", exc)

        # 2. Warm-up TFLite / LiteRT classifier
        if hasattr(inference_service, "interpreter") and inference_service.interpreter is not None:
            try:
                t0 = time.perf_counter()
                input_details = inference_service.input_details
                shape = input_details[0]["shape"]
                dummy_input = np.zeros(shape, dtype=np.float32)
                with inference_service._interpreter_lock:
                    inference_service.interpreter.set_tensor(inference_service._input_index, dummy_input)
                    inference_service.interpreter.invoke()
                    _ = inference_service.interpreter.get_tensor(inference_service._output_index)
                latencies["classifier_warmup_ms"] = round((time.perf_counter() - t0) * 1000, 2)
                logger.info("Classifier model warmed up in %.2f ms", latencies["classifier_warmup_ms"])
            except Exception as exc:
                logger.warning("Failed to warm up classifier model: %s", exc)

        return latencies
