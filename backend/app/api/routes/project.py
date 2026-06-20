from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps.auth import AuthUser, get_current_user
from app.database import get_db
from app.schemas import ProjectCreateRequest, UserProfileResponse
from app.services.auth_service import get_user_profile
from app.services.project_service import (
    create_project as create_project_for_owner,
    delete_project as delete_project_for_owner,
    get_project_by_id as get_project_by_id_for_owner,
    get_projects_by_owner as get_projects_by_owner_id,
    update_project as update_project_for_owner,
)

router = APIRouter()


@router.get("/me", response_model=UserProfileResponse)
async def get_me(
    current_user: AuthUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await get_user_profile(db, current_user.id)


@router.get("/projects")
async def get_current_user_projects(
    current_user: AuthUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await get_projects_by_owner_id(db, current_user.id)



@router.get("/projects/{project_id}")
async def get_project_by_id(
    project_id: str,
    current_user: AuthUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    project = await get_project_by_id_for_owner(db,project_id,current_user.id)
    return project.presentation_data

@router.post("/project")
async def create_project(
    request: ProjectCreateRequest,
    current_user: AuthUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    project = await create_project_for_owner(db,request.presentation_data,current_user.id)
    return project.presentation_data

@router.put("/project")
async def update_project(
    presentation_data: dict,
    current_user: AuthUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    project = await update_project_for_owner(db,presentation_data,current_user.id)
    return project.presentation_data

@router.delete("/project/{project_id}")
async def delete_project(
    project_id: str,
    current_user: AuthUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await delete_project_for_owner(db,project_id,current_user.id)
