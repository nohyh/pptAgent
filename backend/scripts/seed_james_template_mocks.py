import asyncio
import json
from pathlib import Path
import sys

from sqlalchemy import func, select, text

sys.path.append(str(Path(__file__).resolve().parents[1]))

from app.database import async_session_maker, engine
from app.model import Project, User


TARGET_EMAIL = "jamesel398@gmail.com"

MOCK_PROJECTS = [
    {
        "project_id": "james-template-minimalist",
        "title": "Template Mock · Minimalist Pitch Deck",
        "file": "minimalist.json",
    },
    {
        "project_id": "james-template-claude",
        "title": "Template Mock · Warm Editorial",
        "file": "claude.json",
    },
]

LEGACY_PROJECT_IDS = ["james-template-elegant-bachelor-thesis"]


async def resolve_owner_id(session) -> str:
    result = await session.execute(
        select(User).where(func.lower(User.email) == TARGET_EMAIL.lower())
    )
    user = result.scalar_one_or_none()
    if user is not None:
        return user.id

    auth_result = await session.execute(
        text(
            "select id::text as id, email "
            "from auth.users "
            "where lower(email) = lower(:email) "
            "limit 1"
        ),
        {"email": TARGET_EMAIL},
    )
    auth_user = auth_result.mappings().one_or_none()
    if auth_user is None:
        raise RuntimeError(
            f"Supabase Auth 中没有找到 {TARGET_EMAIL}，请先用该邮箱注册/登录一次。"
        )

    user = User(
        id=auth_user["id"],
        email=auth_user["email"],
        username=auth_user["email"],
        generation_quota=3,
    )
    session.add(user)
    await session.flush()
    return user.id


def load_mock(project: dict) -> dict:
    mock_path = Path(__file__).resolve().parents[1] / "app" / "mocks" / project["file"]
    data = json.loads(mock_path.read_text(encoding="utf-8"))
    data["id"] = project["project_id"]
    data["title"] = project["title"]
    return data


async def upsert_project(session, owner_id: str, presentation_data: dict) -> None:
    project = await session.get(Project, presentation_data["id"])
    if project is not None and project.owner_id != owner_id:
        raise RuntimeError(f"项目 id 已被其他用户占用: {presentation_data['id']}")
    if project is None:
        project = Project(
            id=presentation_data["id"],
            title=presentation_data["title"],
            presentation_data=presentation_data,
            owner_id=owner_id,
        )
        session.add(project)
        return
    project.title = presentation_data["title"]
    project.presentation_data = presentation_data


async def main() -> None:
    async with async_session_maker() as session:
        owner_id = await resolve_owner_id(session)
        for project_id in LEGACY_PROJECT_IDS:
            project = await session.get(Project, project_id)
            if project is not None and project.owner_id == owner_id:
                await session.delete(project)
                print(f"deleted legacy {project_id}")
        for project in MOCK_PROJECTS:
            presentation_data = load_mock(project)
            await upsert_project(session, owner_id, presentation_data)
            print(f"seeded {presentation_data['id']} -> {presentation_data['title']}")
        await session.commit()
        print(f"done owner={TARGET_EMAIL}")
    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(main())
