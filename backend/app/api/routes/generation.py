from copy import deepcopy

from fastapi import APIRouter, Body, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.mocks import mockOutline, mock_presentation
from app.api.deps.auth import AuthUser, get_current_user
from app.database import get_db
from app.schemas import PptRequest
from app.services.auth_service import reserve_generation_quota, refund_generation_quota
from app.services.outline_generation import generateOutline as generate_outline_service
from app.services.presentation_generation import generatePpt as generate_ppt_service


router = APIRouter()


@router.post("/generateOutline")
async def generateOutline(
    prompt: str = Body(..., embed=True),
    current_user: AuthUser = Depends(get_current_user),
):
    return await generate_outline_service(prompt)


@router.get("/mockOutline")
async def getMockOutline():
    return deepcopy(mockOutline)


@router.post("/generatePpt")
async def generatePpt(
    request: PptRequest,
    current_user: AuthUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await reserve_generation_quota(db, current_user.id)
    try:
        return await generate_ppt_service(request)
    except Exception:
        await refund_generation_quota(db, current_user.id)
        raise


@router.get("/mockPresentation")
async def getMockPresentation():
    return deepcopy(mock_presentation)
