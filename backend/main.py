from fastapi import FastAPI
from app.api.routes.generation import router as generation_router
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI()

app.include_router(generation_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
