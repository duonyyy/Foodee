"""Unit tests for ModelManager and model registry verification in vision-service."""

from pathlib import Path
from app.services.model_manager import ModelManager


def test_model_registry_loaded():
    manager = ModelManager()
    assert manager.registry_data.get("version") == "1.0.0"
    models = manager.registry_data.get("models", {})
    assert "detection" in models
    assert "classifier_tflite" in models
    assert "classifier_pytorch" in models


def test_active_models_verification():
    manager = ModelManager()
    results = manager.verify_all(only_active=True, check_hashes=True)
    assert "detection" in results
    assert "classifier_tflite" in results
    assert results["detection"]["valid"] is True
    assert results["classifier_tflite"]["valid"] is True


def test_calculate_sha256(tmp_path):
    test_file = tmp_path / "test.bin"
    test_file.write_bytes(b"foodee vision ai model content")
    
    sha256 = ModelManager.calculate_sha256(test_file)
    assert isinstance(sha256, str)
    assert len(sha256) == 64
