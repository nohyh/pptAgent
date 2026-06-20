from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.model import Project



async def get_projects_by_owner(db: AsyncSession, owner_id: str):
    try:
        stmt = (
            select(Project.id,Project.title)
            .where(Project.owner_id == owner_id)
            .order_by(Project.updated_at.desc(), Project.created_at.desc())
        )
        results = await db.execute(stmt)
        return results.mappings().all()
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500,detail=f"数据库查询失败")

async def get_project_by_id(db:AsyncSession,project_id:str,owner_id:str):
    try:
        stmt = select(Project).where(Project.id == project_id, Project.owner_id == owner_id)
        result = await db.execute(stmt)
        project = result.scalar_one_or_none()
        if project is None:
            raise HTTPException(status_code=404,detail=f"项目不存在")
        return project
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500,detail=f"数据库查询失败")

async def create_project(db:AsyncSession,presentation_data:dict,owner_id:str):
    try:
        project_id = presentation_data.get("id")
        title = presentation_data.get("title")
        if not project_id or not title:
            raise HTTPException(status_code=422,detail="项目缺少 id 或 title")
        result = await db.execute(select(Project).where(Project.id == project_id))
        existing_project = result.scalar_one_or_none()
        if existing_project is not None:
            if existing_project.owner_id != owner_id:
                raise HTTPException(status_code=409,detail="项目ID已存在")
            existing_project.title = title
            existing_project.presentation_data = presentation_data
            await db.commit()
            await db.refresh(existing_project)
            return existing_project
        new_project = Project(
            id=project_id,
            title=title,
            presentation_data=presentation_data,
            owner_id=owner_id
        )
        db.add(new_project)
        await db.commit()
        await db.refresh(new_project)
        return new_project
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500,detail=f"数据库查询失败")

async def update_project(db:AsyncSession,presentation_data:dict,owner_id:str):
    try:
        project_id = presentation_data.get("id")
        title = presentation_data.get("title")
        if not project_id or not title:
            raise HTTPException(status_code=422,detail="项目缺少 id 或 title")
        stmt = select(Project).where(Project.id == project_id, Project.owner_id == owner_id)
        result = await db.execute(stmt)
        project = result.scalar_one_or_none()
        if project is None:
            raise HTTPException(status_code=404,detail=f"项目不存在")
        project.presentation_data = presentation_data
        project.title = title
        await db.commit()
        await db.refresh(project)
        return project
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500,detail=f"数据库更新失败")

async def delete_project(db:AsyncSession,project_id:str,owner_id:str):
    try:
        stmt = select(Project).where(Project.id == project_id, Project.owner_id == owner_id)
        result = await db.execute(stmt)
        project = result.scalar_one_or_none()
        if project is None:
            raise HTTPException(status_code=404,detail=f"项目不存在")
        await db.delete(project)
        await db.commit()
        return {"message": "删除成功"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500,detail=f"数据库删除失败")
