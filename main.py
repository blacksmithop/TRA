from fastapi import FastAPI
from app.routers import user_stats

# Initialize FastAPI application
app = FastAPI(
    title="Torn Tracker",
    description="User stat tracker",
    version="1.0.0"
)

app.include_router(user_stats.router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)