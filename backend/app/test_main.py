import pytest
import uuid
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


@pytest.fixture
def created_ticket():
    random_text = str(uuid.uid4())[:8]
    name = f"pytest-{random_text}"
    payload = {
        "name": name,
        "release_date": "2026-10-15",
        "notes": "Automated test",
    }
    response = client.post("/tkt/create", json=payload)
    assert response.status_code in (200, 201), response.text

    body = response.json()
    tkt_id = body.get("tkt_id") or body.get("id")
    assert tkt_id is not None, f"No id in response: {body}"

    yield {"id": tkt_id, "name": name}

    # Cleanup
    client.delete(f"/tkt/delete/{tkt_id}")


def test_app_imports():
    assert app is not None


def test_create_ticket(created_ticket):
    assert created_ticket["name"].startswith("pytest-")


def test_update_ticket(created_ticket):
    payload = {
        "name": "Updated Name",
        "release_date": "2026-10-20",
        "notes": "Updated notes",
    }
    response = client.patch(
        f"/tkt/update/{created_ticket['id']}",
        json=payload,
    )
    assert response.status_code == 200


def test_list_returns_list():
    response = client.get("/tkt/list")
    assert response.status_code == 200
    assert isinstance(response.json(), list)