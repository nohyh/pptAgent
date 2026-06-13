from fastapi import APIRouter, Body

from app.schemas import PptRequest
from app.services.outline_generation import generateOutline as generate_outline_service
from app.services.presentation_generation import generatePpt as generate_ppt_service


router = APIRouter()


@router.post("/generateOutline")
async def generateOutline(prompt: str = Body(..., embed=True)):
    return await generate_outline_service(prompt)


@router.post("/generatePpt")
async def generatePpt(request: PptRequest):
    return await generate_ppt_service(request)
