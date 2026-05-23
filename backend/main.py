from fastapi import FastAPI
from app.schemas import Presentation  # 导入我们写好的 PPT 模型
from app.ai import router as ai_router
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI()

app.include_router(ai_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)