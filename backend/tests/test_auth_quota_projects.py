import asyncio
from fastapi import HTTPException
from fastapi.testclient import TestClient

from main import app
from app.api.deps.auth import AuthUser, get_current_user
from app.database import get_db
from app.api.routes import generation as generation_routes
from app.api.routes import project as project_routes
from app.services.auth_service import ensure_local_user, is_unlimited_quota_email


def _client():
    app.dependency_overrides.clear()
    return TestClient(app)


async def _auth_user():
    return AuthUser(id="user-a", email="a@example.com")


async def _fake_db():
    yield object()


def test_generate_routes_require_auth():
    client = _client()

    outline_response = client.post("/generateOutline", json={"prompt": "test"})
    ppt_response = client.post(
        "/generatePpt",
        json={
            "prompt": "test",
            "title": "Test",
            "layout": "16x9",
            "theme": "minimalist",
            "sections": [{"id": "s1", "title": "Section", "content": "Content"}],
            "pageCount": 3,
        },
    )

    assert outline_response.status_code == 401
    assert ppt_response.status_code == 401


def test_generate_ppt_refunds_reserved_quota_on_failure(monkeypatch):
    client = _client()
    app.dependency_overrides[get_current_user] = _auth_user
    app.dependency_overrides[get_db] = _fake_db
    calls = []

    async def reserve_quota(db, user_id):
        calls.append(("reserve", user_id))

    async def refund_quota(db, user_id):
        calls.append(("refund", user_id))

    async def fail_generation(request):
        calls.append(("generate", request.title))
        raise HTTPException(status_code=502, detail="generation failed")

    monkeypatch.setattr(generation_routes, "reserve_generation_quota", reserve_quota)
    monkeypatch.setattr(generation_routes, "refund_generation_quota", refund_quota)
    monkeypatch.setattr(generation_routes, "generate_ppt_service", fail_generation)

    response = client.post(
        "/generatePpt",
        json={
            "prompt": "test",
            "title": "Test",
            "layout": "16x9",
            "theme": "minimalist",
            "sections": [{"id": "s1", "title": "Section", "content": "Content"}],
            "pageCount": 3,
        },
    )

    assert response.status_code == 502
    assert calls == [("reserve", "user-a"), ("generate", "Test"), ("refund", "user-a")]


def test_generate_ppt_keeps_reserved_quota_on_success(monkeypatch):
    client = _client()
    app.dependency_overrides[get_current_user] = _auth_user
    app.dependency_overrides[get_db] = _fake_db
    calls = []

    async def reserve_quota(db, user_id):
        calls.append(("reserve", user_id))

    async def refund_quota(db, user_id):
        calls.append(("refund", user_id))

    async def succeed_generation(request):
        calls.append(("generate", request.title))
        return {"id": "deck-1", "title": request.title, "slides": []}

    monkeypatch.setattr(generation_routes, "reserve_generation_quota", reserve_quota)
    monkeypatch.setattr(generation_routes, "refund_generation_quota", refund_quota)
    monkeypatch.setattr(generation_routes, "generate_ppt_service", succeed_generation)

    response = client.post(
        "/generatePpt",
        json={
            "prompt": "test",
            "title": "Test",
            "layout": "16x9",
            "theme": "minimalist",
            "sections": [{"id": "s1", "title": "Section", "content": "Content"}],
            "pageCount": 3,
        },
    )

    assert response.status_code == 200
    assert calls == [("reserve", "user-a"), ("generate", "Test")]


def test_generate_ppt_quota_error_does_not_call_generation(monkeypatch):
    client = _client()
    app.dependency_overrides[get_current_user] = _auth_user
    app.dependency_overrides[get_db] = _fake_db
    calls = []

    async def reserve_quota(db, user_id):
        calls.append(("reserve", user_id))
        raise HTTPException(status_code=402, detail="生成额度不足")

    async def fail_if_called(request):
        calls.append(("generate", request.title))
        return {"id": "deck-1", "title": request.title, "slides": []}

    monkeypatch.setattr(generation_routes, "reserve_generation_quota", reserve_quota)
    monkeypatch.setattr(generation_routes, "generate_ppt_service", fail_if_called)

    response = client.post(
        "/generatePpt",
        json={
            "prompt": "test",
            "title": "Test",
            "layout": "16x9",
            "theme": "minimalist",
            "sections": [{"id": "s1", "title": "Section", "content": "Content"}],
            "pageCount": 3,
        },
    )

    assert response.status_code == 402
    assert calls == [("reserve", "user-a")]


def test_project_routes_use_current_user(monkeypatch):
    client = _client()
    app.dependency_overrides[get_current_user] = _auth_user
    app.dependency_overrides[get_db] = _fake_db
    seen = []

    async def list_projects(db, owner_id):
        seen.append(owner_id)
        return [{"id": "p1", "title": "Mine"}]

    monkeypatch.setattr(project_routes, "get_projects_by_owner_id", list_projects)

    own_response = client.get("/projects")

    assert own_response.status_code == 200
    assert own_response.json() == [{"id": "p1", "title": "Mine"}]
    assert seen == ["user-a"]


def test_project_detail_route_returns_presentation_json(monkeypatch):
    client = _client()
    app.dependency_overrides[get_current_user] = _auth_user
    app.dependency_overrides[get_db] = _fake_db
    presentation = {
        "id": "p1",
        "title": "Mine",
        "layout": "16x9",
        "theme": "minimalist",
        "slides": [],
    }

    class StoredProject:
        presentation_data = presentation

    async def get_project(db, project_id, owner_id):
        assert project_id == "p1"
        assert owner_id == "user-a"
        return StoredProject()

    monkeypatch.setattr(project_routes, "get_project_by_id_for_owner", get_project)

    response = client.get("/projects/p1")

    assert response.status_code == 200
    assert response.json() == presentation


def test_ensure_local_user_creates_new_user_with_default_quota():
    class FakeDb:
        def __init__(self):
            self.created = None
            self.commits = 0

        async def get(self, model, user_id):
            return None

        def add(self, user):
            self.created = user

        async def commit(self):
            self.commits += 1

        async def refresh(self, user):
            pass

    db = FakeDb()
    user = asyncio.run(ensure_local_user(db, AuthUser(id="new-user", email="new@example.com")))

    assert user.id == "new-user"
    assert user.email == "new@example.com"
    assert user.generation_quota == 3
    assert db.created.generation_quota == 3
    assert db.commits == 1


def test_james_account_has_unlimited_quota_flag():
    assert is_unlimited_quota_email("jamesel398@gmail.com")
    assert is_unlimited_quota_email("JAMESEL398@GMAIL.COM")
    assert not is_unlimited_quota_email("other@example.com")
