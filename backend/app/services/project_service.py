from fastapi import HTTPException
from sqlalchemy import select,func
from sqlalchemy.ext.asyncio import AsyncSession
from app.model import Project



async def get_projects_by_owner(db: AsyncSession, owner_id: str):
    try:
        stmt = select(Project.id,Project.title).where(Project.owner_id == owner_id)
        results = await db.execute(stmt)
        return results.mappings().all()
    except Exception as e:
        raise HTTPException(status_code=500,detail=f"数据库查询失败")

async def get_project_by_id(db:AsyncSession,project_id:str):
    try:
        return await db.get(Project, project_id)
    except Exception as e:
        raise HTTPException(status_code=500,detail=f"数据库查询失败")

async def create_project(db:AsyncSession,presentation_data:dict,owner_id:str):
    try:
        new_project = Project(
            id=presentation_data["id"],
            title=presentation_data["title"],
            presentation_data=presentation_data,
            owner_id=owner_id
        )
        db.add(new_project)
        await db.commit()
        await db.refresh(new_project)
        return new_project
    except Exception as e:
        raise HTTPException(status_code=500,detail=f"数据库查询失败")

async def update_project(db:AsyncSession,presentation_data:dict):
    try:
        project = await db.get(Project,presentation_data["id"])
        if project:
            project.presentation_data = presentation_data
            project.title = presentation_data["title"]
            await db.commit()
            await db.refresh(project)
            return project
        else:
            raise HTTPException(status_code=404,detail=f"项目不存在")
    except Exception as e:
        raise HTTPException(status_code=500,detail=f"数据库更新失败")

async def delete_project(db:AsyncSession,project_id:str):
    try:
        project =await db.get(Project,project_id)
        if project:
            await db.delete(project)
            await db.commit()
            return {"message": "删除成功"}
        else:
            raise HTTPException(status_code=404,detail=f"项目不存在")
    except Exception as e:
        raise HTTPException(status_code=500,detail=f"数据库删除失败")