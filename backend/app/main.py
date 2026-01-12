from fastapi import FastAPI
from app.api import sync, auth
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Ghana Restaurant OS Backend")

# Allow CORS for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(sync.router)
app.include_router(auth.router)

# Create tables on startup
from app.database import engine
from app import models
models.Base.metadata.create_all(bind=engine)

@app.get("/")
def read_root():
    return {"message": "Welcome to Ghana Restaurant OS API"}
