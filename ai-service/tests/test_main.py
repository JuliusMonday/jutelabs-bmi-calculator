import os
import pytest
from fastapi.testclient import TestClient

from main import app, model

client = TestClient(app)

class DummyResponse:
    def __init__(self, text):
        self.text = text

@pytest.fixture(autouse=True)
def patch_generate_content(monkeypatch):
    monkeypatch.setattr(model, 'generate_content', lambda prompt: DummyResponse("Hello. I'm Dr. JuTe. Your BMI is in the healthy range."))
    yield

def test_analyze_health_returns_success():
    response = client.post('/analyze-health', json={'weight_kg': 70.0, 'height_m': 1.7})
    assert response.status_code == 200
    body = response.json()
    assert body['bmi'] == 24.2
    assert 'advice' in body
    assert body['advice'].startswith("Hello. I'm Dr. JuTe.")

def test_analyze_health_invalid_input():
    response = client.post('/analyze-health', json={'weight_kg': -1, 'height_m': 1.7})
    assert response.status_code == 422

@pytest.mark.parametrize('payload', [
    {'feet': 9, 'inches': 0},
    {'feet': 5, 'inches': 12},
])
def test_convert_height_invalid(payload):
    response = client.post('/convert-height', json=payload)
    assert response.status_code == 422

def test_convert_height_success():
    response = client.post('/convert-height', json={'feet': 5, 'inches': 8})
    assert response.status_code == 200
    assert response.json()['meters'] == 1.73
