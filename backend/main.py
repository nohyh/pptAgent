from fastapi import FastAPI
from app.api.routes.generation import router as generation_router
from fastapi.middleware.cors import CORSMiddleware
from app.config import CORS_ORIGINS
from app.api.routes.projects import router as projects_router  # pyright: ignore[reportMissingImports]

app = FastAPI()

app.include_router(generation_router)
app.include_router(projects_router)
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
