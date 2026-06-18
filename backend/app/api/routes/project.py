from fastapi import APIRouter, Body, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.services import project_service

router = APIRouter()

@router.get("/users/{owner_id}/projects")
async def get_projects_by_owner(owner_id: str, db: AsyncSession = Depends(get_db)):
    return await project_service.get_projects_by_owner(db,owner_id)

@router.get("/projects/{project_id}")
async def get_project_by_id(project_id: str, db: AsyncSession = Depends(get_db)):
    return await project_service.get_project_by_id(db,project_id)

@router.post("/project")
async def create_project(presentation_data: dict, owner_id: str =Body(...), db: AsyncSession = Depends(get_db)):
    return await project_service.create_project(db,presentation_data,owner_id)

@router.put("/project")
async def update_project(presentation_data: dict, db: AsyncSession = Depends(get_db)):
    return await project_service.update_project(db,presentation_data)

@router.delete("/project/{project_id}")
async def delete_project(project_id: str, db: AsyncSession = Depends(get_db)):
    return await project_service.delete_project(db,project_id)