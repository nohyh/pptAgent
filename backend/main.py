from fastapi import FastAPI
from app.schemas import Presentation  # 导入我们写好的 PPT 模型
from app.ai import router as ai_router

app = FastAPI()

app.include_router(ai_router)