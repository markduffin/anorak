from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import your sports routers (e.g., baseball/MLB)
from sports.baseball.router import router as baseball_router

app = FastAPI(
    title="The Anorak API",
    description="Stateless gateway adapter for sports statistical exploration",
    version="0.1.0",
)

# Configure CORS to permit requests from the Vite React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount the sports routers to their API prefixes
app.include_router(baseball_router, prefix="/api/mlb", tags=["Baseball - MLB"])


@app.get("/health", tags=["System"])
async def health_check():
    """Basic health check probe."""
    return {"status": "healthy", "service": "The Anorak Backend"}