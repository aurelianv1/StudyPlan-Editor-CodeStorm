import pytest
from fastapi.testclient import TestClient

from app.config import get_settings
from app.main import create_app


@pytest.fixture
def make_client(monkeypatch):
    """Build a test client for an app configured through environment variables."""

    def factory(**env: str) -> TestClient:
        defaults = {"GROQ_API_KEY": "", "DEMO_MODE": "false", "MAX_UPLOAD_MB": "5"}
        for name, value in {**defaults, **env}.items():
            monkeypatch.setenv(name, value)
        get_settings.cache_clear()
        app = create_app()
        return TestClient(app)

    yield factory
    get_settings.cache_clear()


@pytest.fixture
def client(make_client):
    return make_client()
