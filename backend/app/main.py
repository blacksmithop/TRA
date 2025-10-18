from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import revive_stats, static_files, user_stats

# Initialize FastAPI application
app = FastAPI(
    title="Torn Tracker",
    description="User stat tracker for the Torn API, providing endpoints to fetch user data such as attacks, bars, battle stats, bounties, and cooldowns.",
    version="1.0.0",
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://blacksmithop.github.io", "https://tornrevive.page"],
    allow_credentials=True,
    allow_methods=["GET", "OPTIONS"],
    allow_headers=[
        "Authorization",
        "Accept",
        "Content-Type",
    ],
)

app.include_router(revive_stats.router)
app.include_router(static_files.router)
app.include_router(user_stats.router)

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
